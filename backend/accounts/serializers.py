from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.core.mail import send_mail
from django.conf import settings
from accounts.models import Company, CustomUser, PasswordResetToken, VerificationToken, CrmApiKey
from django.utils import timezone


# Registration serializer with verification token
class CustomUserSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True, default=None)

    class Meta:
        model = CustomUser
        # Include role and is_superuser so the frontend can authorize securely
        fields = [
            "id",
            "email",
            "first_name",
            "image",
            "role",
            "is_superuser",
            "company",
            "company_name",
        ]


# Login serializer with email and is_active check
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        from accounts.models import Registration
        from django.utils import timezone
        
        data = super().validate(attrs)
        user = self.user
        request = self.context.get("request") if hasattr(self, "context") else None
        if not user.is_active:
            raise serializers.ValidationError(
                "Account not verified. Please check your email."
            )
        
        # Check if trial user is approved
        try:
            from accounts.models import Registration
            registration = Registration.objects.get(user=user)
            if registration.trial_days > 0 and registration.status not in ["approved", "active"]:
                raise serializers.ValidationError(
                    "Your trial application is pending approval. You will receive an email once approved."
                )
        except Registration.DoesNotExist:
            pass
        user.last_login = timezone.now()
        user.save()
        
        # Update registration record
        try:
            registration = Registration.objects.get(user=user)
            registration.last_login_at = timezone.now()
            if registration.status == 'verified':
                registration.status = 'active'
            registration.save()
        except Registration.DoesNotExist:
            pass
        
        # ✅ FIXED: Changed user.image to user.image
        if user.image:  # ← Changed from user.image
            try:
                image_url = (
                    request.build_absolute_uri(user.image.url)  # ← Changed
                    if request is not None
                    else user.image.url  # ← Changed
                )
            except Exception:
                image_url = user.image.url  # ← Changed
        else:
            image_url = None
            
        data["user"] = {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "company": user.company_id,
            "company_name": user.company.name if getattr(user, "company", None) else None,
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
    last_name = serializers.CharField(required=False, allow_blank=True)
    image = serializers.ImageField(required=False, allow_null=True)
    company_name = serializers.CharField()
    company_description = serializers.CharField(required=False, allow_blank=True)
    
    # NEW FIELDS
    trial_days = serializers.IntegerField(default=0, required=False)
    accept_terms = serializers.BooleanField(default=False)
    subscribe_newsletter = serializers.BooleanField(default=False)

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        from accounts.models import Registration
        from django.utils import timezone
        
        # Extract registration-specific data
        trial_days = validated_data.pop('trial_days', 0)
        accept_terms = validated_data.pop('accept_terms', False)
        subscribe_newsletter = validated_data.pop('subscribe_newsletter', False)
        
        # Create company
        company = Company.objects.create(
            name=validated_data["company_name"],
            description=validated_data.get("company_description", ""),
        )
        
        # Create user
        user = CustomUser(
            username=validated_data["email"],
            email=validated_data["email"],
            image=validated_data.get("image", None),
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            is_active=False,
            role="admin",
            company=company,
        )
        user.set_password(validated_data["password"])
        user.save()
        
        # Create registration record
        registration = Registration.objects.create(
            user=user,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            company_name=company.name,
            accept_terms=accept_terms,
            subscribe_newsletter=subscribe_newsletter,
            trial_days=trial_days,
            status='pending'
        )
        
        # Set trial dates if trial requested
        if trial_days > 0:
            registration.trial_start_date = timezone.now()
            registration.trial_end_date = timezone.now() + timezone.timedelta(days=trial_days)
            registration.save()

        # Get request context for IP and user agent
        request = self.context.get('request')
        if request:
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                registration.ip_address = x_forwarded_for.split(',')[0].strip()
            else:
                registration.ip_address = request.META.get('REMOTE_ADDR')
            
            registration.user_agent = request.META.get('HTTP_USER_AGENT', '')
            registration.save()

        # Send verification email
        verification_token = VerificationToken.objects.create(user=user)
        rest_url = f"verify-email/{verification_token.token}/"
        verification_url = f"{settings.FRONTEND_URL}/{rest_url}"
        send_mail(
            subject="Verify Your Email",
            message=(
                f"Click the link to verify your email: {verification_url}\n"
                f"This link expires in 24 hours."
            ),
            from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None),
            recipient_list=[user.email],
        )
        
        return user

    def to_representation(self, instance):
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
    send_invite = serializers.BooleanField(write_only=True, default=True)
    
    class Meta:
        model = CustomUser
        fields = [
            "id",
            "email",
            "password",
            "image",
            "first_name",
            "role",
            "send_invite",
        ]
        extra_kwargs = {"password": {"write_only": True, "required": False}}

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_role(self, value):
        # Disallow creating users with superadmin role
        if value == "superadmin":
            raise serializers.ValidationError("Invalid role selection.")
        # Ensure role is one of allowed choices (excluding superadmin)
        allowed_roles = {"admin", "pm", "program_manager", "contibuter", "reviewer", "guest"}
        if value not in allowed_roles:
            raise serializers.ValidationError(
                "Role must be one of admin, program_manager, pm, contibuter, reviewer or guest."
            )
        return value
    
    def validate(self, attrs):
        send_invite = attrs.get('send_invite', True)
        password = attrs.get('password')
        
        # Password required only if NOT sending invite
        if not send_invite and not password:
            raise serializers.ValidationError({
                "password": "Password is required when not sending invite email."
            })
        
        return attrs

    def create(self, validated_data):
        send_invite = validated_data.pop('send_invite', True)
        password = validated_data.pop('password', None)

        request = self.context.get("request")
        admin_user: CustomUser = request.user  # type: ignore

        user = CustomUser(
            username=validated_data["email"],
            email=validated_data["email"],
            image=validated_data.get("image", None),
            first_name=validated_data.get("first_name", ""),
            is_active=False,
            role=validated_data.get("role", "pm"),
            company=admin_user.company,
        )

        if password:
            user.set_password(password)
        else:
            # Set unusable password - user will set via invite
            user.set_unusable_password()

        user.save()

        # Send invite email if send_invite is True
        if send_invite:
            try:
                from django.core.mail import EmailMultiAlternatives
                from django.template.loader import render_to_string
                import logging
                logger = logging.getLogger(__name__)

                verification_token = VerificationToken.objects.create(user=user)
                verification_url = f"{settings.FRONTEND_URL}/verify-email/{verification_token.token}/"

                # Render HTML template
                html_content = render_to_string("emails/verify_email.html", {
                    "first_name": user.first_name or user.email.split('@')[0],
                    "verification_url": verification_url,
                })

                # Plain text fallback
                text_content = f"""Hi {user.first_name or user.email.split('@')[0]},

You've been invited to join ProjeXtPal!

Please set your password and activate your account by clicking: {verification_url}

This link expires in 24 hours.

Best regards,
The ProjeXtPal Team"""

                # Send email with both HTML and text
                email = EmailMultiAlternatives(
                    subject="Welcome to ProjeXtPal - Set Your Password",
                    body=text_content,
                    from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@projextpal.com"),
                    to=[user.email],
                )
                email.attach_alternative(html_content, "text/html")
                email.send()
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Failed to send invite email to {user.email}: {e}")

        return user



# Admin updates a user within same company
class AdminUpdateUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            "id",
            "first_name",
            "image",
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
        allowed_roles = {"admin", "pm", "program_manager", "contibuter", "reviewer", "guest"}
        if value not in allowed_roles:
            raise serializers.ValidationError(
                "Role must be one of admin, program_manager, pm, contibuter, reviewer or guest."
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
        for field in ["first_name", "image", "role", "is_active"]:
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
            "last_name",
        ]
        extra_kwargs = {
            "first_name": {"required": False, "allow_blank": True},
            "last_name": {"required": False, "allow_blank": True},
        }

    def update(self, instance: CustomUser, validated_data):
        for field in ["first_name", "last_name"]:
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

def send_verification_email(user, verification_token):
    """Send HTML verification email with ProjeXtPal branding"""
    from django.conf import settings
    from django.template.loader import render_to_string
    from django.core.mail import EmailMultiAlternatives
    from django.utils.html import strip_tags
    
    # Generate URLs for both web and mobile
    web_verification_url = f"{settings.FRONTEND_URL}/verify-email/{verification_token.token}/"
    mobile_verification_url = f"{getattr(settings, 'MOBILE_DEEP_LINK', 'projextpal://')}verify-email?token={verification_token.token}"
    
    # Render HTML template
    html_content = render_to_string("emails/email_verification.html", {
        "user": user,
        "verification_url": web_verification_url,
        "mobile_url": mobile_verification_url,
    })
    
    # Plain text fallback
    text_content = f"""Welkom bij ProjeXtPal!

Hi {user.first_name or user.email.split('@')[0]},

Bedankt voor je registratie! Klik op de link hieronder om je email te verifiëren:

{web_verification_url}

Deze link verloopt over 24 uur.

Heb je deze email niet aangevraagd? Je kunt deze email veilig negeren.

Met vriendelijke groet,
Het ProjeXtPal Team

---
ProjeXtPal - Project Management Excellence
© 2026 ProjeXtPal by Inclufy"""
    
    # Send email with both HTML and text
    email = EmailMultiAlternatives(
        subject="Verifieer je Email - ProjeXtPal",
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email],
    )
    email.attach_alternative(html_content, "text/html")
    email.send(fail_silently=False)