from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.core.mail import send_mail
from django.conf import settings
from accounts.models import Company, CustomUser, PasswordResetToken, VerificationToken, CrmApiKey
from django.utils import timezone


# Registration serializer with verification token
class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        # Include role and is_superuser so the frontend can authorize securely
        fields = [
            "id",
            "email",
            "first_name",
            "profile_image",
            "role",
            "is_superuser",
        ]


# Login serializer with email and is_active check
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        request = self.context.get("request") if hasattr(self, "context") else None
        if not user.is_active:
            raise serializers.ValidationError(
                "Account not verified. Please check your email."
            )
        user.last_login = timezone.now()
        user.save()
        
        # ✅ FIXED: Changed user.image to user.profile_image
        if user.profile_image:  # ← Changed from user.image
            try:
                image_url = (
                    request.build_absolute_uri(user.profile_image.url)  # ← Changed
                    if request is not None
                    else user.profile_image.url  # ← Changed
                )
            except Exception:
                image_url = user.profile_image.url  # ← Changed
        else:
            image_url = None
            
        data["user"] = {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "is_subscribed": (
                user.company.is_subscribed if getattr(user, "company", None) else False
            ),
            "theme": user.theme,
            "image": image_url,
            "role": user.role,
            "is_superuser": getattr(user, "is_superuser", False),
        }
        return data


# Forgot password serializer
class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("No user found with this email.")
        return value

    def save(self):
        email = self.validated_data["email"]
        user = CustomUser.objects.get(email=email)

        # Create a new reset token
        reset_token = PasswordResetToken.objects.create(user=user)

        token_url = f"reset-password/{reset_token.token}/"

        # Send reset email
        reset_url = f"{settings.FRONTEND_URL}/{token_url}"

        # Send reset email
        send_mail(
            subject="Reset Your Password",
            message=f"Click the link to reset your password: {reset_url}\nThis link expires in 1 hour.",
            from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None),
            recipient_list=[user.email],
        )


# Reset password serializer
class ResetPasswordSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True)
    token = serializers.UUIDField()

    def validate_token(self, value):
        try:
            reset_token = PasswordResetToken.objects.get(token=value)
            if not reset_token.is_valid():
                raise serializers.ValidationError(
                    "Token is invalid, expired, or already used."
                )
            return value
        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError("Invalid token.")

    def save(self):
        token = self.validated_data["token"]
        reset_token = PasswordResetToken.objects.get(token=token)
        user = reset_token.user
        user.set_password(self.validated_data["password"])
        user.save()

        # Mark token as used
        reset_token.is_used = True
        reset_token.save()


# Public admin registration: create company and admin user
class PublicAdminRegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    image = serializers.ImageField(required=False, allow_null=True)
    company_name = serializers.CharField()
    company_description = serializers.CharField(required=False, allow_blank=True)

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        company = Company.objects.create(
            name=validated_data["company_name"],
            description=validated_data.get("company_description", ""),
        )
        user = CustomUser(
            username=validated_data["email"],
            email=validated_data["email"],
            image=validated_data.get("profile_image", None),
            first_name=validated_data.get("first_name", ""),
            is_active=False,
            role="admin",
            company=company,
        )
        user.set_password(validated_data["password"])
        user.save()

        verification_token = VerificationToken.objects.create(user=user)
        rest_url = f"verify-email/{verification_token.token}/"
        verification_url = f"{settings.FRONTEND_URL}/{rest_url}"
        send_mail(
            subject="Verify Your Email",
            message=(
                f"Click the link to verify your email: {verification_url}\nThis link expires in 24 hours."
            ),
            from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None),
            recipient_list=[user.email],
        )
        return user

    def to_representation(self, instance):
        # When returning the created user instance, avoid reading input-only fields
        if isinstance(instance, CustomUser):
            return {
                "id": instance.id,
                "email": instance.email,
                "role": instance.role,
                "is_active": instance.is_active,
                "company": {
                    "id": instance.company.id if instance.company else None,
                    "name": instance.company.name if instance.company else None,
                    "is_subscribed": (
                        instance.company.is_subscribed if instance.company else None
                    ),
                },
            }
        return super().to_representation(instance)


# Admin creates user within same company
class AdminCreateUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            "id",
            "email",
            "password",
            "profile_image",
            "first_name",
            "role",
        ]
        extra_kwargs = {"password": {"write_only": True}}

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_role(self, value):
        # Disallow creating users with superadmin role
        if value == "superadmin":
            raise serializers.ValidationError("Invalid role selection.")
        # Ensure role is one of allowed choices (excluding superadmin)
        allowed_roles = {"admin", "pm", "contibuter", "reviewer", "guest"}
        if value not in allowed_roles:
            raise serializers.ValidationError(
                "Role must be one of admin, pm, contibuter, reviewer or guest."
            )
        return value

    def create(self, validated_data):
        request = self.context.get("request")
        admin_user: CustomUser = request.user  # type: ignore
        user = CustomUser(
            username=validated_data["email"],
            email=validated_data["email"],
            image=validated_data.get("profile_image", None),
            first_name=validated_data.get("first_name", ""),
            is_active=False,
            role=validated_data.get("role", "pm"),
            company=admin_user.company,
        )
        user.set_password(validated_data["password"])
        user.save()

        verification_token = VerificationToken.objects.create(user=user)
        rest_url = f"verify-email/{verification_token.token}/"
        verification_url = f"{settings.FRONTEND_URL}/{rest_url}"
        send_mail(
            subject="Verify Your Email",
            message=(
                f"Click the link to verify your email: {verification_url}\nThis link expires in 24 hours."
            ),
            from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None),
            recipient_list=[user.email],
        )
        return user


# Admin updates a user within same company
class AdminUpdateUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            "id",
            "first_name",
            "profile_image",
            "role",
            "is_active",
        ]
        extra_kwargs = {
            "is_active": {"required": False},
            "image": {"required": False, "allow_null": True},
        }

    def validate_role(self, value):
        if value == "superadmin":
            raise serializers.ValidationError("Invalid role selection.")
        allowed_roles = {"admin", "pm", "contibuter", "reviewer", "guest"}
        if value not in allowed_roles:
            raise serializers.ValidationError(
                "Role must be one of admin, pm, contibuter, reviewer or guest."
            )
        return value

    def update(self, instance: CustomUser, validated_data):
        request = self.context.get("request")
        admin_user: CustomUser = request.user  # type: ignore
        # Ensure same company
        if (
            admin_user.company_id is None
            or instance.company_id != admin_user.company_id
        ):
            raise serializers.ValidationError(
                "You cannot modify users outside your company."
            )

        # Prevent admin from deactivating themselves
        if instance.id == admin_user.id and "is_active" in validated_data:
            incoming_active = validated_data.get("is_active")
            if incoming_active is False:
                raise serializers.ValidationError(
                    "You cannot deactivate your own account."
                )

        # Update allowed fields
        for field in ["first_name", "profile_image", "role", "is_active"]:
            if field in validated_data:
                setattr(instance, field, validated_data[field])

        instance.save()
        return instance


# Authenticated user updates own profile (name, image)
class UpdateOwnProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            "first_name",
            "profile_image",
        ]
        extra_kwargs = {
            "first_name": {"required": False, "allow_blank": True},
            "image": {"required": False, "allow_null": True},
        }

    def update(self, instance: CustomUser, validated_data):
        for field in ["first_name", "image"]:
            if field in validated_data:
                setattr(instance, field, validated_data[field])
        instance.save()
        return instance


# Authenticated user changes password
class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user: CustomUser = self.context["request"].user  # type: ignore
        current_password = attrs.get("current_password")
        new_password = attrs.get("new_password")
        if not user.check_password(current_password):
            raise serializers.ValidationError(
                {"current_password": "Incorrect password."}
            )
        if current_password == new_password:
            raise serializers.ValidationError(
                {"new_password": "New password must be different."}
            )
        return attrs

    def save(self, **kwargs):
        user: CustomUser = self.context["request"].user  # type: ignore
        new_password = self.validated_data["new_password"]
        user.set_password(new_password)
        user.save()
        return user


# CRM API Key serializers
class CrmApiKeySerializer(serializers.ModelSerializer):
    """Serializer for CRM API Key model - does not expose the actual API key in list views"""
    created_by_email = serializers.EmailField(source="created_by.email", read_only=True)
    
    class Meta:
        model = CrmApiKey
        fields = [
            "id",
            "name",
            "api_key",  # Only shown when creating/updating, masked in responses
            "api_base_url",
            "is_active",
            "last_fetched_at",
            "created_by_email",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at", "last_fetched_at", "created_by_email"]
    
    def to_representation(self, instance):
        """Mask API key when reading (not when creating/updating)"""
        data = super().to_representation(instance)
        # Only show masked API key if it exists
        if data.get("api_key"):
            # Show only last 4 characters
            api_key = data["api_key"]
            if len(api_key) > 4:
                data["api_key"] = f"***{api_key[-4:]}"
            else:
                data["api_key"] = "****"
        return data


class CrmApiKeyCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating CRM API Key - shows full API key"""
    
    class Meta:
        model = CrmApiKey
        fields = [
            "name",
            "api_key",
            "api_base_url",
            "is_active",
        ]
        extra_kwargs = {
            "api_base_url": {"required": False},
            "is_active": {"required": False},
        }
    
    def create(self, validated_data):
        request = self.context.get("request")
        user = request.user if request else None
        
        # Set company from user
        if user and user.company:
            validated_data["company"] = user.company
        else:
            raise serializers.ValidationError("User must be associated with a company.")
        
        validated_data["created_by"] = user
        return super().create(validated_data)


class CrmUserSerializer(serializers.Serializer):
    """Serializer for CRM users fetched from external API"""
    id = serializers.IntegerField()
    email = serializers.EmailField()
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    # Add other fields as needed from the CRM API response
