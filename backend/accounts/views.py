from rest_framework import generics, status, viewsets
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from django.utils import timezone
import requests
from accounts.serializers import (
    MyTokenObtainPairSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    PublicAdminRegisterSerializer,
    AdminCreateUserSerializer,
    CustomUserSerializer,
    AdminUpdateUserSerializer,
    UpdateOwnProfileSerializer,
    ChangePasswordSerializer,
    CrmApiKeySerializer,
    CrmApiKeyCreateSerializer,
)
from accounts.models import VerificationToken, CrmApiKey
from accounts.permissions import HasRole
from django.contrib.auth import get_user_model
from accounts.models import CustomUser
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
import os

# Get User model for use throughout the file
User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_users_list(request):
    """Get all users for team management"""
    users = CustomUser.objects.all().order_by('first_name', 'email')
    
    data = []
    for user in users:
        image_url = None
        if getattr(user, 'image', None):
            try:
                image_url = request.build_absolute_uri(user.image.url)
            except Exception:
                pass
        
        data.append({
            'id': user.id,
            'email': user.email,
            'username': user.username if hasattr(user, 'username') else user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'name': f"{user.first_name} {user.last_name}".strip() or user.email,
            'is_active': user.is_active,
            'is_staff': user.is_staff if hasattr(user, 'is_staff') else False,
            'is_superuser': user.is_superuser,
            'image': image_url,
            'role': getattr(user, 'role', None),
            'company_name': user.company.name if user.company else None,
            'date_joined': user.date_joined.isoformat() if user.date_joined else None,
        })
    
    return Response(data, status=status.HTTP_200_OK)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_image(request):
    """Upload user profile image"""
    try:
        image = request.FILES.get('image')
        
        if not image:
            return Response(
                {'error': 'No image provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Save image to user model
        user = request.user
        user.image = image
        user.save()
        
        # Return full URL
        image_url = request.build_absolute_uri(user.image.url)
        
        return Response({
            'image_url': image_url,
            'message': 'Profile image updated successfully'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_registration_intent(request):
    """Save user's post-registration intent"""
    intent = request.data.get('intent')
    email = request.data.get('email')
    
    # Save to Registration model
    try:
        from accounts.models import Registration
        registration = Registration.objects.filter(email=email).first()
        if registration:
            registration.intent = intent
            registration.save()
            return Response({'success': True})
    except Exception as e:
        pass
    
    return Response({'success': True}, status=status.HTTP_200_OK)


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def update_subscription_status(request, user_id):
    """
    Update subscription status AND user account status
    """
    try:
        user = User.objects.get(pk=user_id)
        is_active = request.data.get('is_active')
        
        if is_active is None:
            return Response(
                {'error': 'is_active field is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update USER account status
        user.is_active = is_active  # ← NIEUW!
        user.save()
        
        # Update subscription status
        if hasattr(user, 'subscription'):
            if is_active:
                user.subscription.status = 'active'
                if not user.subscription.end_date:
                    from datetime import timedelta
                    user.subscription.start_date = timezone.now()
                    user.subscription.end_date = timezone.now() + timedelta(days=14)
            else:
                user.subscription.status = 'cancelled'
            user.subscription.save()
        else:
            from accounts.models import UserSubscription
            from datetime import timedelta
            
            UserSubscription.objects.create(
                user=user,
                tier='trial',
                status='active' if is_active else 'cancelled',
                start_date=timezone.now() if is_active else None,
                end_date=timezone.now() + timedelta(days=14) if is_active else None
            )
        
        return Response({
            'success': True,
            'message': f'User and subscription {"activated" if is_active else "deactivated"} successfully',
            'user_id': user.id,
            'is_active': is_active
        })
        
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# Login view
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


# Logout view (unchanged)
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response(
                    {"error": "Refresh token is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {"message": "Successfully logged out"},
                status=status.HTTP_205_RESET_CONTENT,
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# Email verification view
class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, token):
        """Check if token is valid without activating"""
        try:
            verification_token = VerificationToken.objects.get(token=token)
            if not verification_token.is_valid():
                return Response(
                    {"error": "Token is invalid, expired, or already used"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user = verification_token.user
            if user.is_active:
                return Response(
                    {"message": "Email already verified", "is_active": True}, 
                    status=status.HTTP_200_OK
                )
            return Response(
                {
                    "message": "Token is valid",
                    "email": user.email,
                    "first_name": user.first_name,
                    "is_active": False,
                }, 
                status=status.HTTP_200_OK
            )
        except VerificationToken.DoesNotExist:
            return Response(
                {"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST
            )

    def post(self, request, token):
        """Verify email and set password"""
        try:
            verification_token = VerificationToken.objects.get(token=token)
            if not verification_token.is_valid():
                return Response(
                    {"error": "Token is invalid, expired, or already used"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            
            user = verification_token.user
            password = request.data.get('password')
            
            if not password:
                return Response(
                    {"error": "Password is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            
            # Validate password length
            if len(password) < 8:
                return Response(
                    {"error": "Password must be at least 8 characters"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            
            # Set password and activate user
            user.set_password(password)
            user.is_active = True
            user.save()
            
            # Mark token as used
            verification_token.is_used = True
            verification_token.save()
            
            return Response(
                {"message": "Email verified and password set successfully"},
                status=status.HTTP_200_OK
            )
        except VerificationToken.DoesNotExist:
            return Response(
                {"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST
            )


# Forgot password view
class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        from django.core.mail import EmailMultiAlternatives
        from django.template.loader import render_to_string
        from django.utils.html import strip_tags
        from accounts.models import PasswordResetToken
        
        email = request.data.get('email')
        
        if not email:
            return Response(
                {"error": "Email is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(email=email)
            
            # Create reset token
            reset_token = PasswordResetToken.objects.create(user=user)
            
            # Generate URLs
            web_reset_url = f"{settings.FRONTEND_URL}/reset-password/{reset_token.token}"
            mobile_reset_url = f"{settings.MOBILE_DEEP_LINK}reset-password?token={reset_token.token}"
            
            # Render HTML template
            html_content = render_to_string('emails/password_reset.html', {
                'user': user,
                'reset_url': web_reset_url,
                'mobile_url': mobile_reset_url,
            })
            
            # Plain text fallback
            plain_message = strip_tags(html_content)
            
            # Create and send email
            email_message = EmailMultiAlternatives(
                subject='Wachtwoord Reset - ProjeXtPal',
                body=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[user.email],
            )
            email_message.attach_alternative(html_content, "text/html")
            email_message.send(fail_silently=False)
            
        except User.DoesNotExist:
            pass  # Don't reveal if email exists
        
        return Response(
            {"message": "Als dit email adres bestaat, ontvang je een reset link."},
            status=status.HTTP_200_OK
        )

# Reset password view
class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, token):
        serializer = ResetPasswordSerializer(data={**request.data, "token": token})
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Password reset successfully"}, status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Current user view
class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from subscriptions.models import CompanySubscription
        
        serializer = CustomUserSerializer(request.user)
        data = serializer.data
        
        # Add subscription status information
        company = getattr(request.user, "company", None)
        data["has_active_subscription"] = False
        data["subscription_status"] = None
        
        if company:
            try:
                active_subscription = CompanySubscription.objects.get(
                    company=company,
                    status__in=["active", "trialing", "past_due"]
                )
                data["has_active_subscription"] = True
                data["subscription_status"] = active_subscription.status
                data["subscription_plan"] = active_subscription.plan.name
            except CompanySubscription.DoesNotExist:
                data["has_active_subscription"] = False
                data["subscription_status"] = "inactive"
        
        if getattr(request.user, "image", None):
            try:
                data["image"] = request.build_absolute_uri(request.user.image.url)
            except Exception:
                pass
        return Response(data)

    def post(self, request):
        """SuperAdmin: link current user to a company (create if needed)."""
        if getattr(request.user, "role", None) != "superadmin":
            return Response(
                {"error": "Only SuperAdmins can link themselves to a company."},
                status=status.HTTP_403_FORBIDDEN,
            )

        company_name = request.data.get("company_name", "").strip()
        if not company_name:
            return Response(
                {"error": "company_name is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from accounts.models import Company

        company, created = Company.objects.get_or_create(
            name=company_name.lower(),
            defaults={"description": f"Company: {company_name}"},
        )

        request.user.company = company
        request.user.save(update_fields=["company"])

        return Response(
            {
                "message": f"User linked to company '{company.name}'.",
                "company_id": company.id,
                "company_name": company.name,
                "created": created,
            },
            status=status.HTTP_200_OK,
        )


# Public admin registration: creates company + admin user
class PublicAdminRegisterView(generics.CreateAPIView):
    serializer_class = PublicAdminRegisterSerializer
    permission_classes = [AllowAny]


# Admin creates users within same company
class AdminCreateUserView(generics.CreateAPIView):
    serializer_class = AdminCreateUserSerializer
    permission_classes = [HasRole("admin", "superadmin")]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context


# Admin updates/deletes users within same company
class AdminUpdateUserView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AdminUpdateUserSerializer
    permission_classes = [HasRole("admin", "superadmin")]

    def get_queryset(self):
        user_model = get_user_model()
        request_user = self.request.user
        if getattr(request_user, "company_id", None) is None:
            return user_model.objects.none()
        return user_model.objects.filter(company_id=request_user.company_id)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Prevent admin from deleting themselves
        if instance.id == request.user.id:
            return Response(
                {"error": "You cannot delete your own account"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().destroy(request, *args, **kwargs)


class CompanyUsersView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get all users in the same company as the requesting user"""
        user = request.user
        company = getattr(user, "company", None)
        
        if company is None:
            return Response([], status=status.HTTP_200_OK)
        
        users = (
            User.objects.filter(company=company)
            .only(
                "id", "first_name", "email", "role", "is_active", "image", "date_joined"
            )
            .order_by("first_name", "email")
        )
        
        data = []
        for u in users:
            image_url = None
            if getattr(u, "image", None):
                try:
                    image_url = request.build_absolute_uri(u.image.url)
                except Exception:
                    image_url = u.image.url
            
            data.append(
                {
                    "id": u.id,
                    "name": (u.first_name or u.email or str(u.id)),
                    "email": u.email,
                    "role": getattr(u, "role", None),
                    "is_active": getattr(u, "is_active", None),
                    "image": image_url,
                    "created_at": u.date_joined.isoformat() if u.date_joined else None,
                }
            )
        
        return Response(data, status=status.HTTP_200_OK)


# Admin resets user password (sends reset email)
class AdminResetUserPasswordView(APIView):
    permission_classes = [HasRole("admin", "superadmin")]

    def post(self, request, pk):
        """Send password reset email to user"""
        user_model = get_user_model()
        request_user = request.user
        
        # Check admin's company
        if getattr(request_user, "company_id", None) is None:
            return Response(
                {"error": "Admin must belong to a company"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # Get user and verify same company
        try:
            user = user_model.objects.get(id=pk, company_id=request_user.company_id)
        except user_model.DoesNotExist:
            return Response(
                {"error": "User not found or not in your company"},
                status=status.HTTP_404_NOT_FOUND,
            )
        
        # Prevent admin from resetting their own password this way
        if user.id == request_user.id:
            return Response(
                {"error": "Use the forgot password feature to reset your own password"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # Create password reset token
        from accounts.models import PasswordResetToken
        reset_token = PasswordResetToken.objects.create(user=user)
        
        # Send reset email
        reset_url = f"{settings.FRONTEND_URL}/reset-password/{reset_token.token}/"
        
        from django.core.mail import EmailMultiAlternatives
        from django.template.loader import render_to_string
        
        # Plain text email
        text_content = f"""Hi {user.first_name or user.email.split('@')[0]},

Your administrator has requested a password reset for your ProjeXtPal account.

Click the link below to set a new password:
{reset_url}

This link expires in 1 hour.

If you did not request this reset, please contact your administrator.

Best regards,
The ProjeXtPal Team"""
        
        email = EmailMultiAlternatives(
            subject="Password Reset Requested by Administrator",
            body=text_content,
            from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@projextpal.com"),
            to=[user.email],
        )
        email.send()
        
        return Response(
            {"message": f"Password reset email sent to {user.email}"},
            status=status.HTTP_200_OK,
        )

    def get(self, request):
        user = request.user
        company = getattr(user, "company", None)
        if company is None:
            return Response([], status=status.HTTP_200_OK)
        users = (
            User.objects.filter(company=company)
            .only(
                "id", "first_name", "email", "role", "is_active", "image", "date_joined"
            )
            .order_by("first_name", "email")
        )
        data = []
        for u in users:
            image_url = None
            if getattr(u, "image", None):
                try:
                    image_url = request.build_absolute_uri(u.image.url)
                except Exception:
                    image_url = u.image.url
            data.append(
                {
                    "id": u.id,
                    "name": (u.first_name or u.email or str(u.id)),
                    "email": u.email,
                    "role": getattr(u, "role", None),
                    "is_active": getattr(u, "is_active", None),
                    "image": image_url,
                    "created_at": u.date_joined.isoformat() if u.date_joined else None,
                }
            )
        return Response(data, status=status.HTTP_200_OK)


class UpdateOwnProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        serializer = UpdateOwnProfileSerializer(
            instance=request.user, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            # return the updated lightweight user data consistent with CustomUserSerializer
            user = request.user
            data = {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "image": (
                    request.build_absolute_uri(user.image.url) if user.image else None
                ),
                "role": getattr(user, "role", None),
                "is_superuser": getattr(user, "is_superuser", False),
            }
            return Response(data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Password changed successfully"}, status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CrmApiKeyViewSet(viewsets.ModelViewSet):
    """ViewSet for managing CRM API keys"""
    permission_classes = [IsAuthenticated, HasRole("admin", "pm")]
    
    def get_queryset(self):
        """Filter API keys by user's company"""
        user = self.request.user
        if not user.company:
            return CrmApiKey.objects.none()
        return CrmApiKey.objects.filter(company=user.company)
    
    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return CrmApiKeyCreateSerializer
        return CrmApiKeySerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context
    
    def perform_create(self, serializer):
        """Set created_by and company"""
        serializer.save(
            company=self.request.user.company,
            created_by=self.request.user
        )
    
    @action(detail=True, methods=["post"], url_path="test")
    def test_api_key(self, request, pk=None):
        """Test the API key by making a test request to the CRM API"""
        api_key_obj = self.get_object()
        
        try:
            # Construct the API endpoint URL
            base_url = api_key_obj.api_base_url.rstrip('/')
            api_url = f"{base_url}/api/accounts/tenant-users/"
            
            # Make request to CRM API
            headers = {
                "X-Tenant-API-Key": api_key_obj.api_key,
                "Content-Type": "application/json"
            }
            
            response = requests.get(
                api_url,
                headers=headers,
                params={"page": 1, "page_size": 1},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                # Update last_fetched_at on success
                api_key_obj.last_fetched_at = timezone.now()
                api_key_obj.save(update_fields=["last_fetched_at"])
                
                return Response({
                    "success": True,
                    "message": "API key is valid",
                    "tenant_name": data.get("tenant_name"),
                    "tenant_type": data.get("tenant_type"),
                    "user_count": data.get("count", 0)
                })
            else:
                error_data = response.json() if response.content else {}
                return Response({
                    "success": False,
                    "message": error_data.get("message", f"API request failed with status {response.status_code}"),
                    "status_code": response.status_code
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except requests.exceptions.Timeout:
            return Response({
                "success": False,
                "message": "Request timed out. Please check the API URL and try again."
            }, status=status.HTTP_408_REQUEST_TIMEOUT)
        except requests.exceptions.RequestException as e:
            return Response({
                "success": False,
                "message": f"Failed to connect to CRM API: {str(e)}"
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                "success": False,
                "message": f"An error occurred: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=["post"], url_path="fetch-users")
    def fetch_users(self, request, pk=None):
        """Fetch users from the CRM API using the stored API key"""
        api_key_obj = self.get_object()
        
        # Get pagination parameters
        page = int(request.data.get("page", 1))
        page_size = int(request.data.get("page_size", 100))
        page_size = min(page_size, 100)  # Max 100 per page
        
        try:
            # Construct the API endpoint URL
            base_url = api_key_obj.api_base_url.rstrip('/')
            api_url = f"{base_url}/api/accounts/tenant-users/"
            
            # Make request to CRM API
            headers = {
                "X-Tenant-API-Key": api_key_obj.api_key,
                "Content-Type": "application/json"
            }
            
            params = {
                "page": page,
                "page_size": page_size
            }
            
            response = requests.get(
                api_url,
                headers=headers,
                params=params,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                # Update last_fetched_at on success
                api_key_obj.last_fetched_at = timezone.now()
                api_key_obj.save(update_fields=["last_fetched_at"])
                
                # Return the users and pagination info
                return Response({
                    "success": True,
                    "users": data.get("users", []),
                    "count": data.get("count", 0),
                    "next": data.get("next"),
                    "previous": data.get("previous"),
                    "tenant_name": data.get("tenant_name"),
                    "tenant_type": data.get("tenant_type"),
                })
            else:
                error_data = response.json() if response.content else {}
                return Response({
                    "success": False,
                    "message": error_data.get("message", f"API request failed with status {response.status_code}"),
                    "status_code": response.status_code
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except requests.exceptions.Timeout:
            return Response({
                "success": False,
                "message": "Request timed out. Please try again."
            }, status=status.HTTP_408_REQUEST_TIMEOUT)
        except requests.exceptions.RequestException as e:
            return Response({
                "success": False,
                "message": f"Failed to connect to CRM API: {str(e)}"
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                "success": False,
                "message": f"An error occurred: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CompanyListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from accounts.models import Company
        if not request.user.is_superuser:
            return Response({'detail': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
        
        companies = Company.objects.all().order_by('name')
        data = []
        
        for c in companies:
            # Get user count
            user_count = User.objects.filter(company=c).count()
            
            # Get owner (first admin/superadmin user)
            owner = User.objects.filter(
                company=c, 
                role__in=['admin', 'superadmin']
            ).first()
            
            owner_data = None
            if owner:
                owner_data = {
                    'id': owner.id,
                    'email': owner.email,
                    'full_name': f"{owner.first_name} {owner.last_name}".strip() or owner.email
                }
            
            # Get subscription status
            subscription_status = 'none'
            plan_name = None
            billing_cycle = None
            payment_method = None
            
            try:
                from subscriptions.models import CompanySubscription
                # Get ANY subscription, not just active ones
                subscription = CompanySubscription.objects.filter(
                    company=c
                ).select_related('plan').order_by('-created_at').first()  # Get most recent
                
                if subscription:
                    subscription_status = subscription.status
                    if hasattr(subscription, 'plan') and subscription.plan:
                        plan_name = subscription.plan.name
                    # FIXED: Get billing_cycle and payment_method from subscription
                    billing_cycle = getattr(subscription, 'billing_cycle', None)
                    payment_method = getattr(subscription, 'payment_method', None)
            except:
                pass
            
            data.append({
                'id': c.id,
                'name': c.name,
                'description': c.description if hasattr(c, 'description') else None,
                'is_subscribed': c.is_subscribed if hasattr(c, 'is_subscribed') else False,
                'user_count': user_count,
                'subscription_status': subscription_status,
                'plan_name': plan_name,
                'billing_cycle': billing_cycle,
                'payment_method': payment_method,
                'owner': owner_data,
                'created_at': c.created_at.isoformat() if hasattr(c, 'created_at') and c.created_at else None,
                'updated_at': c.updated_at.isoformat() if hasattr(c, 'updated_at') and c.updated_at else None,
            })
        
        return Response(data, status=status.HTTP_200_OK)
    
    def post(self, request):
        from accounts.models import Company
        if not request.user.is_superuser:
            return Response({'detail': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
        
        name = request.data.get('name', '').strip()
        description = request.data.get('description', '').strip()
        subscription_plan_id = request.data.get('subscription_plan_id')
        subscription_status = request.data.get('subscription_status')
        
        if not name:
            return Response({'detail': 'Company name is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if Company.objects.filter(name__iexact=name).exists():
            return Response({'detail': 'Company with this name already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        company = Company.objects.create(
            name=name,
            description=description,
            is_subscribed=False
        )
        
        # Create subscription if plan selected
        if subscription_plan_id and subscription_plan_id != 'none':
            try:
                from subscriptions.models import SubscriptionPlan, CompanySubscription
                plan = SubscriptionPlan.objects.get(id=subscription_plan_id)
                
                # Use provided status or default to 'active'
                status_value = subscription_status if subscription_status and subscription_status != 'none' else 'active'
                
                # FIXED: Read billing_cycle and payment_method from request.data
                CompanySubscription.objects.create(
                    company=company,
                    plan=plan,
                    status=status_value,
                    billing_cycle=request.data.get('billing_cycle', 'monthly'),
                    payment_method=request.data.get('payment_method', 'stripe')
                )
                company.is_subscribed = True
                company.save()
            except SubscriptionPlan.DoesNotExist:
                print(f"Subscription plan {subscription_plan_id} not found")
            except Exception as e:
                print(f"Failed to create subscription: {e}")
        
        return Response({
            'id': company.id, 
            'name': company.name, 
            'description': company.description,
            'is_subscribed': company.is_subscribed
        }, status=status.HTTP_201_CREATED)


class CompanyDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        from accounts.models import Company
        if not request.user.is_superuser:
            return Response({'detail': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            company = Company.objects.get(pk=pk)
            user_count = User.objects.filter(company=company).count()
            data = {
                'id': company.id,
                'name': company.name,
                'description': company.description,
                'is_subscribed': company.is_subscribed,
                'created_at': company.created_at.isoformat() if company.created_at else None,
                'user_count': user_count
            }
            return Response(data, status=status.HTTP_200_OK)
        except Company.DoesNotExist:
            return Response({'detail': 'Company not found'}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, pk):
        print(f"=== DEBUG PATCH === request.data: {request.data}")
        from accounts.models import Company
        if not request.user.is_superuser:
            return Response({'detail': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            company = Company.objects.get(pk=pk)
            
            # Update basic fields
            if 'name' in request.data:
                name = request.data['name'].strip()
                if not name:
                    return Response({'detail': 'Company name cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)
                if Company.objects.filter(name__iexact=name).exclude(pk=pk).exists():
                    return Response({'detail': 'Company with this name already exists'}, status=status.HTTP_400_BAD_REQUEST)
                company.name = name
            
            if 'description' in request.data:
                company.description = request.data['description'].strip()
            
            if 'is_subscribed' in request.data:
                company.is_subscribed = request.data['is_subscribed']
            
            company.save()
            
            # Handle subscription update
            subscription_plan_id = request.data.get('subscription_plan_id')
            subscription_status = request.data.get('subscription_status')
            
            if subscription_plan_id is not None or subscription_status is not None:
                try:
                    from subscriptions.models import SubscriptionPlan, CompanySubscription
                    
                    existing_sub = CompanySubscription.objects.filter(
                        company=company
                    ).order_by('-created_at').first()
                    
                    if subscription_plan_id and subscription_plan_id != 'none':
                        plan = SubscriptionPlan.objects.get(id=subscription_plan_id)
                        
                        if existing_sub:
                            existing_sub.plan = plan
                            existing_sub.billing_cycle = request.data.get('billing_cycle', existing_sub.billing_cycle or 'monthly')
                            existing_sub.payment_method = request.data.get('payment_method', existing_sub.payment_method or 'stripe')
                            if subscription_status and subscription_status != 'none':
                                existing_sub.status = subscription_status
                            existing_sub.save()
                        else:
                            new_status = subscription_status if subscription_status and subscription_status != 'none' else 'active'
                            CompanySubscription.objects.create(
                                company=company,
                                plan=plan,
                                status=new_status,
                                billing_cycle=request.data.get('billing_cycle', 'monthly'),
                                payment_method=request.data.get('payment_method', 'stripe')
                            )
                        
                        company.is_subscribed = True
                        company.save()
                    elif subscription_status and subscription_status != 'none' and existing_sub:
                        # Update status AND billing_cycle/payment_method
                        existing_sub.status = subscription_status
                        if 'billing_cycle' in request.data:
                            existing_sub.billing_cycle = request.data.get('billing_cycle')
                        if 'payment_method' in request.data:
                            existing_sub.payment_method = request.data.get('payment_method')
                        existing_sub.save()
                        
                        if subscription_status == 'canceled':
                            company.is_subscribed = False
                            company.save()
                    else:
                        if existing_sub:
                            existing_sub.status = 'canceled'
                            existing_sub.save()
                        company.is_subscribed = False
                        company.save()
                            
                except SubscriptionPlan.DoesNotExist:
                    return Response({'detail': 'Subscription plan not found'}, status=status.HTTP_404_NOT_FOUND)
                except Exception as e:
                    print(f"Failed to update subscription: {e}")
            
            return Response({
                'id': company.id,
                'name': company.name,
                'description': company.description,
                'is_subscribed': company.is_subscribed
            }, status=status.HTTP_200_OK)
        except Company.DoesNotExist:
            return Response({'detail': 'Company not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def delete(self, request, pk):
        from accounts.models import Company
        if not request.user.is_superuser:
            return Response({'detail': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            company = Company.objects.get(pk=pk)
            user_count = User.objects.filter(company=company).count()
            if user_count > 0:
                return Response({
                    'detail': f'Cannot delete company with {user_count} user(s). Please remove users first.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            company.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Company.DoesNotExist:
            return Response({'detail': 'Company not found'}, status=status.HTTP_404_NOT_FOUND)


class CompanyUsersListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        from accounts.models import Company
        if not request.user.is_superuser:
            return Response({'detail': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            company = Company.objects.get(pk=pk)
            users = User.objects.filter(company=company).order_by('first_name', 'email')
            
            data = []
            for u in users:
                data.append({
                    'id': u.id,
                    'email': u.email,
                    'first_name': u.first_name,
                    'full_name': f"{u.first_name} {u.last_name}".strip() or u.email,
                    'role': getattr(u, 'role', None),
                    'is_active': u.is_active,
                    'date_joined': u.date_joined.isoformat() if u.date_joined else None
                })
            
            return Response(data, status=status.HTTP_200_OK)
        except Company.DoesNotExist:
            return Response({'detail': 'Company not found'}, status=status.HTTP_404_NOT_FOUND)


class AdminStatsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        from accounts.models import Company
        from datetime import timedelta
        from django.db.models import Sum, Count, Q
        
        if not request.user.is_superuser:
            return Response({'detail': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
        
        now = timezone.now()
        week_ago = now - timedelta(days=7)
        two_weeks_ago = now - timedelta(days=14)
        month_ago = now - timedelta(days=30)
        two_months_ago = now - timedelta(days=60)
        
        # ============================================================
        # OVERVIEW STATS
        # ============================================================
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        inactive_users = total_users - active_users
        total_companies = Company.objects.count()
        
        # Active subscriptions
        try:
            from subscriptions.models import CompanySubscription
            active_subscriptions = CompanySubscription.objects.filter(
                status__in=['active', 'trialing']
            ).count()
        except:
            active_subscriptions = 0
        
        # ============================================================
        # REVENUE CALCULATION
        # ============================================================
        mrr = 0
        arr = 0
        mrr_last_month = 0
        currency = 'EUR'
        
        try:
            from subscriptions.models import CompanySubscription
            
            # Current MRR - sum of all active subscription prices
            active_subs = CompanySubscription.objects.filter(
                status__in=['active', 'trialing']
            ).select_related('plan')
            
            for sub in active_subs:
                if hasattr(sub, 'plan') and hasattr(sub.plan, 'price'):
                    # Convert to monthly if needed
                    if sub.billing_cycle == 'yearly':
                        mrr += sub.plan.price / 12
                    else:  # monthly
                        mrr += sub.plan.price
            
            arr = mrr * 12
            
            # Last month MRR for growth calculation
            subs_last_month = CompanySubscription.objects.filter(
                status__in=['active', 'trialing'],
                created_at__lt=month_ago
            ).select_related('plan')
            
            for sub in subs_last_month:
                if hasattr(sub, 'plan') and hasattr(sub.plan, 'price'):
                    if sub.billing_cycle == 'yearly':
                        mrr_last_month += sub.plan.price / 12
                    else:
                        mrr_last_month += sub.plan.price
        except Exception as e:
            print(f"Revenue calculation error: {e}")
        
        # ============================================================
        # USERS BY ROLE
        # ============================================================
        admins = User.objects.filter(role__in=['admin', 'superadmin']).count()
        pms = User.objects.filter(role='pm').count()
        
        # ============================================================
        # GROWTH CALCULATIONS
        # ============================================================
        
        # Users growth (last 7 days vs previous 7 days)
        recent_users = User.objects.filter(date_joined__gte=week_ago).count()
        previous_week_users = User.objects.filter(
            date_joined__gte=two_weeks_ago,
            date_joined__lt=week_ago
        ).count()
        
        users_growth = 0
        if previous_week_users > 0:
            users_growth = ((recent_users - previous_week_users) / previous_week_users) * 100
        elif recent_users > 0:
            users_growth = 100
        
        # Companies growth
        recent_companies = Company.objects.filter(
            created_at__gte=month_ago
        ).count() if hasattr(Company, 'created_at') else 0
        
        previous_month_companies = Company.objects.filter(
            created_at__gte=two_months_ago,
            created_at__lt=month_ago
        ).count() if hasattr(Company, 'created_at') else 0
        
        companies_growth = 0
        if previous_month_companies > 0:
            companies_growth = ((recent_companies - previous_month_companies) / previous_month_companies) * 100
        elif recent_companies > 0:
            companies_growth = 100
        
        # MRR growth
        mrr_growth = 0
        if mrr_last_month > 0:
            mrr_growth = ((mrr - mrr_last_month) / mrr_last_month) * 100
        elif mrr > 0:
            mrr_growth = 100
        
        # Subscriptions growth
        try:
            from subscriptions.models import CompanySubscription
            current_subs = CompanySubscription.objects.filter(
                status__in=['active', 'trialing']
            ).count()
            
            last_month_subs = CompanySubscription.objects.filter(
                status__in=['active', 'trialing'],
                created_at__lt=month_ago
            ).count()
            
            subscriptions_growth = 0
            if last_month_subs > 0:
                subscriptions_growth = ((current_subs - last_month_subs) / last_month_subs) * 100
            elif current_subs > 0:
                subscriptions_growth = 100
        except:
            subscriptions_growth = 0
        
        # ============================================================
        # NEW USERS (Last 10)
        # ============================================================
        new_users_queryset = User.objects.order_by('-date_joined')[:10]
        new_users = []
        
        for user in new_users_queryset:
            company_name = None
            if hasattr(user, 'company') and user.company:
                company_name = user.company.name
            
            new_users.append({
                'id': user.id,
                'email': user.email,
                'full_name': f"{user.first_name} {user.last_name}".strip() or user.email,
                'company_name': company_name,
                'is_active': user.is_active,
                'date_joined': user.date_joined.isoformat() if user.date_joined else None,
            })
        
        # ============================================================
        # RECENT ACTIVITY (Mock data for now)
        # ============================================================
        recent_activity = []
        
        # Get recent user signups as activity
        recent_signups = User.objects.order_by('-date_joined')[:5]
        for user in recent_signups:
            recent_activity.append({
                'id': f'signup_{user.id}',
                'user_email': user.email,
                'action': 'user_signup',
                'description': f"New user registered: {user.email}",
                'created_at': user.date_joined.isoformat() if user.date_joined else now.isoformat(),
                'severity': 'info',
            })
        
        # ============================================================
        # SUBSCRIPTIONS BY PLAN
        # ============================================================
        subscriptions_by_plan = []
        
        try:
            from subscriptions.models import CompanySubscription
            
            plan_counts = CompanySubscription.objects.filter(
                status__in=['active', 'trialing']
            ).values('plan__name').annotate(count=Count('id'))
            
            for item in plan_counts:
                subscriptions_by_plan.append({
                    'plan': item['plan__name'] or 'Unknown',
                    'count': item['count'],
                })
        except:
            pass
        
        # ============================================================
        # STRUCTURE RESPONSE
        # ============================================================
        stats = {
            'overview': {
                'total_users': total_users,
                'active_users': active_users,
                'inactive_users': inactive_users,
                'total_companies': total_companies,
                'active_subscriptions': active_subscriptions,
            },
            'revenue': {
                'mrr': round(mrr, 2),
                'arr': round(arr, 2),
                'currency': currency,
            },
            'users': {
                'admins': admins,
                'project_managers': pms,
                'recent_signups': recent_users,
            },
            'growth': {
                'users': round(users_growth, 1),
                'companies': round(companies_growth, 1),
                'mrr': round(mrr_growth, 1),
                'subscriptions': round(subscriptions_growth, 1),
            },
            'activity': {
                'recent_logins': active_users,
                'active_projects': 0,  # Placeholder - implement when projects model is available
                'pending_tasks': 0,  # Placeholder
            },
            'recent_activity': recent_activity,
            'new_users': new_users,
            'subscriptions_by_plan': subscriptions_by_plan,
        }
        
        return Response(stats, status=status.HTTP_200_OK)


class PlanViewSet(viewsets.ModelViewSet):
    """ViewSet for managing subscription plans"""
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        from subscriptions.models import SubscriptionPlan
        if not self.request.user.is_superuser:
            return SubscriptionPlan.objects.none()
        return SubscriptionPlan.objects.all().order_by('plan_level', 'price')
    
    def list(self, request):
        from subscriptions.models import SubscriptionPlan, CompanySubscription
        
        if not request.user.is_superuser:
            return Response({'detail': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
        
        plans = SubscriptionPlan.objects.all().order_by('plan_level', 'price')
        data = []
        
        for plan in plans:
            # Count active subscribers
            subscriber_count = CompanySubscription.objects.filter(
                plan=plan,
                status__in=['active', 'trialing']
            ).count()
            
            # Calculate monthly revenue
            monthly_revenue = 0
            active_subs = CompanySubscription.objects.filter(
                plan=plan,
                status__in=['active', 'trialing']
            )
            
            for sub in active_subs:
                billing_cycle = getattr(sub, 'billing_cycle', 'monthly')
                if billing_cycle == 'yearly':
                    monthly_revenue += plan.price / 12
                else:
                    monthly_revenue += plan.price
            
            data.append({
                'id': plan.id,
                'name': plan.name,
                'plan_type': plan.billing_cycle if hasattr(plan, 'billing_cycle') else 'monthly',
                'plan_level': plan.plan_level if hasattr(plan, 'plan_level') else 'basic',
                'price': float(plan.price),
                'stripe_price_id': plan.stripe_price_id if hasattr(plan, 'stripe_price_id') else '',
                'stripe_product_id': plan.stripe_product_id if hasattr(plan, 'stripe_product_id') else None,
                'max_users': plan.max_users if hasattr(plan, 'max_users') else None,
                'max_projects': plan.max_projects if hasattr(plan, 'max_projects') else None,
                'storage_limit_gb': float(plan.storage_limit_gb) if hasattr(plan, 'storage_limit_gb') and plan.storage_limit_gb else None,
                'features': plan.features.split(',') if hasattr(plan, 'features') and plan.features else [],
                'is_active': plan.is_active if hasattr(plan, 'is_active') else True,
                'is_popular': plan.is_popular if hasattr(plan, 'is_popular') else False,
                'priority_support': plan.priority_support if hasattr(plan, 'priority_support') else False,
                'advanced_analytics': plan.advanced_analytics if hasattr(plan, 'advanced_analytics') else False,
                'custom_integrations': plan.custom_integrations if hasattr(plan, 'custom_integrations') else False,
                'subscriber_count': subscriber_count,
                'monthly_revenue': float(monthly_revenue),
                'created_at': plan.created_at.isoformat() if hasattr(plan, 'created_at') and plan.created_at else None,
                'updated_at': plan.updated_at.isoformat() if hasattr(plan, 'updated_at') and plan.updated_at else None,
            })
        
        return Response(data, status=status.HTTP_200_OK)
    
    def create(self, request):
        from subscriptions.models import SubscriptionPlan
        
        if not request.user.is_superuser:
            return Response({'detail': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            plan = SubscriptionPlan.objects.create(
                name=request.data.get('name'),
                price=request.data.get('price'),
                stripe_price_id=request.data.get('stripe_price_id'),
                stripe_product_id=request.data.get('stripe_product_id'),
                max_users=request.data.get('max_users'),
                max_projects=request.data.get('max_projects'),
                storage_limit_gb=request.data.get('storage_limit_gb'),
                is_active=request.data.get('is_active', True),
                is_popular=request.data.get('is_popular', False),
                priority_support=request.data.get('priority_support', False),
                advanced_analytics=request.data.get('advanced_analytics', False),
                custom_integrations=request.data.get('custom_integrations', False),
            )
            
            # Set optional fields
            if hasattr(plan, 'billing_cycle'):
                plan.billing_cycle = request.data.get('plan_type', 'monthly')
            if hasattr(plan, 'plan_level'):
                plan.plan_level = request.data.get('plan_level', 'basic')
            if hasattr(plan, 'features'):
                features = request.data.get('features', [])
                plan.features = ','.join(features) if isinstance(features, list) else features
            
            plan.save()
            
            return Response({'id': plan.id, 'name': plan.name}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    def partial_update(self, request, pk=None):
        from subscriptions.models import SubscriptionPlan
        
        if not request.user.is_superuser:
            return Response({'detail': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            plan = SubscriptionPlan.objects.get(pk=pk)
            
            # Update fields
            for field in ['name', 'price', 'max_users', 'max_projects', 'storage_limit_gb', 
                        'is_active', 'is_popular', 'priority_support', 'advanced_analytics', 
                        'custom_integrations']:
                if field in request.data:
                    setattr(plan, field, request.data[field])
            
            if 'plan_type' in request.data and hasattr(plan, 'billing_cycle'):
                plan.billing_cycle = request.data['plan_type']
            
            if 'plan_level' in request.data and hasattr(plan, 'plan_level'):
                plan.plan_level = request.data['plan_level']
            
            plan.save()
            
            return Response({'id': plan.id, 'name': plan.name}, status=status.HTTP_200_OK)
        except SubscriptionPlan.DoesNotExist:
            return Response({'detail': 'Plan not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, pk=None):
        from subscriptions.models import SubscriptionPlan, CompanySubscription
        
        if not request.user.is_superuser:
            return Response({'detail': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            plan = SubscriptionPlan.objects.get(pk=pk)
            
            # Check if plan has active subscribers
            active_subs = CompanySubscription.objects.filter(
                plan=plan,
                status__in=['active', 'trialing']
            ).count()
            
            if active_subs > 0:
                return Response({
                    'detail': f'Cannot delete plan with {active_subs} active subscriber(s)'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            plan.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except SubscriptionPlan.DoesNotExist:
            return Response({'detail': 'Plan not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        from subscriptions.models import SubscriptionPlan
        
        if not request.user.is_superuser:
            return Response({'detail': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            plan = SubscriptionPlan.objects.get(pk=pk)
            plan.is_active = not plan.is_active
            plan.save()
            return Response({'is_active': plan.is_active}, status=status.HTTP_200_OK)
        except SubscriptionPlan.DoesNotExist:
            return Response({'detail': 'Plan not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def set_popular(self, request, pk=None):
        from subscriptions.models import SubscriptionPlan
        
        if not request.user.is_superuser:
            return Response({'detail': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            # Remove popular from all plans
            SubscriptionPlan.objects.all().update(is_popular=False)
            
            # Set this plan as popular
            plan = SubscriptionPlan.objects.get(pk=pk)
            plan.is_popular = True
            plan.save()
            
            return Response({'is_popular': True}, status=status.HTTP_200_OK)
        except SubscriptionPlan.DoesNotExist:
            return Response({'detail': 'Plan not found'}, status=status.HTTP_404_NOT_FOUND)


class ResendVerificationEmailView(APIView):
    """Resend verification email to a user"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        from accounts.serializers import send_verification_email
        
        email = request.data.get("email")
        if not email:
            return Response(
                {"error": "Email is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = CustomUser.objects.get(email=email)
            
            # Check if user is already active
            if user.is_active:
                return Response(
                    {"message": "Email already verified"},
                    status=status.HTTP_200_OK
                )
            
            # Get or create new verification token
            old_tokens = VerificationToken.objects.filter(user=user, is_used=False)
            old_tokens.update(is_used=True)  # Invalidate old tokens
            
            # Create new token
            verification_token = VerificationToken.objects.create(user=user)
            
            # Send email
            send_verification_email(user, verification_token)
            
            return Response(
                {"message": f"Verification email sent to {email}"},
                status=status.HTTP_200_OK
            )
            
        except CustomUser.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class ApproveRegistrationView(APIView):
    """Approve or reject a trial registration"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, registration_id):
        # Only superadmin can approve
        if not request.user.is_superuser:
            return Response(
                {"error": "Only superadmin can approve registrations"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        action = request.data.get("action")  # "approve" or "reject"
        
        try:
            from accounts.models import Registration
            registration = Registration.objects.get(id=registration_id)
            
            if action == "approve":
                registration.status = "approved"
                registration.approved_at = timezone.now()
                registration.approved_by = request.user
                
                # Activate user
                user = registration.user
                if user and not user.is_active:
                    user.is_active = True
                    user.save()
                
                registration.save()
                
                # Send approval email
                from django.core.mail import EmailMultiAlternatives
                from django.template.loader import render_to_string
                
                try:
                    html_content = f"""
                    <p>Hi {user.first_name},</p>
                    <p>Great news! Your ProjeXtPal trial has been approved.</p>
                    <p>You can now login at: <a href="{settings.FRONTEND_URL}/login">projextpal.com/login</a></p>
                    <p><strong>Trial Limitations:</strong></p>
                    <ul>
                        <li>1 Program with 1 methodology</li>
                        <li>1 Project with 1 methodology</li>
                        <li>1 User (you)</li>
                        <li>Limited features (no Time Tracking, Teams, Post Project)</li>
                    </ul>
                    <p>To unlock full features, upgrade to a paid subscription.</p>
                    <p>Best regards,<br>The ProjeXtPal Team</p>
                    """
                    
                    email = EmailMultiAlternatives(
                        subject="Your ProjeXtPal Trial Has Been Approved!",
                        body=f"Hi {user.first_name}, Your trial has been approved. Login at {settings.FRONTEND_URL}/login",
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        to=[user.email],
                    )
                    email.attach_alternative(html_content, "text/html")
                    email.send()
                except Exception as e:
                    print(f"Failed to send approval email: {e}")
                
                return Response({
                    "message": f"Registration approved for {registration.email}",
                    "status": "approved"
                }, status=status.HTTP_200_OK)
                
            elif action == "reject":
                registration.status = "rejected"
                registration.save()
                
                # Send rejection email
                try:
                    email = EmailMultiAlternatives(
                        subject="ProjeXtPal Trial Application",
                        body=f"Hi {registration.first_name}, Unfortunately your trial application was not approved at this time.",
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        to=[registration.email],
                    )
                    email.send()
                except Exception as e:
                    print(f"Failed to send rejection email: {e}")
                
                return Response({
                    "message": f"Registration rejected for {registration.email}",
                    "status": "rejected"
                }, status=status.HTTP_200_OK)
            else:
                return Response(
                    {"error": "Invalid action. Use approve or reject"},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Registration.DoesNotExist:
            return Response(
                {"error": "Registration not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class DeactivateUserView(APIView):
    """Deactivate a user"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, registration_id):
        # Only superadmin can deactivate
        if not request.user.is_superuser:
            return Response(
                {"error": "Only superadmin can deactivate users"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            from accounts.models import Registration
            registration = Registration.objects.get(id=registration_id)
            
            # Deactivate user
            user = registration.user
            if user:
                user.is_active = False
                user.save()
            
            # Keep current status, just deactivate
            registration.save()
            
            return Response({
                "message": f"User {registration.email} deactivated",
                "status": "cancelled"
            }, status=status.HTTP_200_OK)
            
        except Registration.DoesNotExist:
            return Response(
                {"error": "Registration not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class ActivateUserView(APIView):
    """Activate a deactivated user"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, registration_id):
        # Only superadmin can activate
        if not request.user.is_superuser:
            return Response(
                {"error": "Only superadmin can activate users"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            from accounts.models import Registration
            registration = Registration.objects.get(id=registration_id)
            
            # Activate user
            user = registration.user
            if user:
                user.is_active = True
                user.save()
            
            # Set status back to approved or active
            if registration.trial_days > 0:
                registration.status = "approved"
            else:
                registration.status = "active"
            registration.save()
            
            return Response({
                "message": f"User {registration.email} activated",
                "status": registration.status
            }, status=status.HTTP_200_OK)
            
        except Registration.DoesNotExist:
            return Response(
                {"error": "Registration not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class UserFeaturesView(APIView):
    """Get current user feature access and limits"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        from accounts.models import SubscriptionTier
        
        user = request.user
        tier = SubscriptionTier.get_user_tier(user)
        tier_config = SubscriptionTier.TIER_FEATURES.get(tier, {})
        
        # Calculate current usage
        company = user.company if hasattr(user, "company") else None
        usage = {}
        
        if company:
            from accounts.models import CustomUser
            from programs.models import Program
            from projects.models import Project
            
            usage = {
                "users": CustomUser.objects.filter(company=company, is_active=True).count(),
                "programs": Program.objects.filter(company=company).count(),
                "projects": Project.objects.filter(company=company).count(),
            }
        
        return Response({
            "tier": tier,
            "features": tier_config.get("features", {}),
            "limits": {
                "max_users": tier_config.get("max_users", 0),
                "max_programs": tier_config.get("max_programs", 0),
                "max_projects": tier_config.get("max_projects", 0),
            },
            "usage": usage,
            "can_create": {
                "user": SubscriptionTier.check_limit(user, "users"),
                "program": SubscriptionTier.check_limit(user, "programs"),
                "project": SubscriptionTier.check_limit(user, "projects"),
            }
        }, status=status.HTTP_200_OK)


from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta
from accounts.models import UserSubscription, CustomUser
from accounts.permissions import IsSuperAdmin


class SubscriptionManagementView(APIView):
    """
    Admin endpoint to manage all subscriptions
    GET: List all subscriptions
    """
    permission_classes = [IsSuperAdmin]
    
    def get(self, request):
        subscriptions = UserSubscription.objects.select_related('user').all()
        
        data = []
        for sub in subscriptions:
            data.append({
                'id': sub.id,
                'user_id': sub.user.id,
                'user_email': sub.user.email,
                'user_name': f"{sub.user.first_name} {sub.user.last_name}".strip() or sub.user.email,
                'tier': sub.tier,
                'tier_display': sub.get_tier_display(),
                'status': sub.status,
                'status_display': sub.get_status_display(),
                'start_date': sub.start_date.isoformat() if sub.start_date else None,
                'end_date': sub.end_date.isoformat() if sub.end_date else None,
                'days_remaining': sub.days_remaining,
                'is_active': sub.is_active,
                'auto_renew': sub.auto_renew,
                'stripe_subscription_id': sub.stripe_subscription_id,
                'created_at': sub.created_at.isoformat(),
                'updated_at': sub.updated_at.isoformat(),
                'notes': sub.notes,
            })
        
        return Response({
            'count': len(data),
            'subscriptions': data
        })


class UserSubscriptionDetailView(APIView):
    """
    Admin endpoint to manage individual user subscription
    GET: Get subscription details
    PUT: Update subscription
    POST: Create subscription
    DELETE: Cancel subscription
    """
    permission_classes = [IsSuperAdmin]
    
    def get(self, request, user_id):
        try:
            user = CustomUser.objects.get(id=user_id)
            
            # Get or create subscription
            subscription, created = UserSubscription.objects.get_or_create(
                user=user,
                defaults={
                    'tier': 'trial',
                    'status': 'pending',
                }
            )
            
            return Response({
                'id': subscription.id,
                'user_id': user.id,
                'user_email': user.email,
                'tier': subscription.tier,
                'tier_display': subscription.get_tier_display(),
                'status': subscription.status,
                'status_display': subscription.get_status_display(),
                'start_date': subscription.start_date.isoformat() if subscription.start_date else None,
                'end_date': subscription.end_date.isoformat() if subscription.end_date else None,
                'days_remaining': subscription.days_remaining,
                'is_active': subscription.is_active,
                'auto_renew': subscription.auto_renew,
                'features': subscription.get_features(),
                'limits': subscription.get_limits(),
                'stripe_subscription_id': subscription.stripe_subscription_id,
                'stripe_customer_id': subscription.stripe_customer_id,
                'notes': subscription.notes,
            })
        
        except CustomUser.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def put(self, request, user_id):
        """Update user subscription"""
        try:
            user = CustomUser.objects.get(id=user_id)
            subscription, created = UserSubscription.objects.get_or_create(user=user)
            
            # Update fields
            if 'tier' in request.data:
                subscription.tier = request.data['tier']
            
            if 'status' in request.data:
                subscription.status = request.data['status']
            
            if 'auto_renew' in request.data:
                subscription.auto_renew = request.data['auto_renew']
            
            if 'duration_days' in request.data:
                # Set new billing cycle
                now = timezone.now()
                subscription.start_date = now
                subscription.end_date = now + timedelta(days=int(request.data['duration_days']))
                subscription.status = 'active'
            
            if 'notes' in request.data:
                subscription.notes = request.data['notes']
            
            if 'stripe_subscription_id' in request.data:
                subscription.stripe_subscription_id = request.data['stripe_subscription_id']
            
            if 'stripe_customer_id' in request.data:
                subscription.stripe_customer_id = request.data['stripe_customer_id']
            
            subscription.save()
            
            return Response({
                'message': 'Subscription updated successfully',
                'subscription': {
                    'id': subscription.id,
                    'tier': subscription.tier,
                    'status': subscription.status,
                    'days_remaining': subscription.days_remaining,
                }
            })
        
        except CustomUser.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def post(self, request, user_id):
        """Create/activate subscription for user"""
        try:
            user = CustomUser.objects.get(id=user_id)
            
            tier = request.data.get('tier', 'trial')
            duration_days = request.data.get('duration_days', 14 if tier == 'trial' else 30)
            
            # Create or update subscription
            subscription, created = UserSubscription.objects.get_or_create(
                user=user,
                defaults={
                    'tier': tier,
                    'status': 'active',
                }
            )
            
            # Activate subscription
            subscription.activate(duration_days=duration_days)
            
            return Response({
                'message': 'Subscription activated successfully',
                'subscription': {
                    'id': subscription.id,
                    'tier': subscription.tier,
                    'status': subscription.status,
                    'start_date': subscription.start_date.isoformat(),
                    'end_date': subscription.end_date.isoformat(),
                    'days_remaining': subscription.days_remaining,
                }
            }, status=status.HTTP_201_CREATED)
        
        except CustomUser.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def delete(self, request, user_id):
        """Cancel user subscription"""
        try:
            user = CustomUser.objects.get(id=user_id)
            
            if hasattr(user, 'subscription'):
                subscription = user.subscription
                subscription.cancel()
                
                return Response({
                    'message': 'Subscription cancelled successfully'
                })
            else:
                return Response(
                    {'error': 'No subscription found for this user'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        except CustomUser.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class SubscriptionTiersView(APIView):
    """
    Get available subscription tiers and their features
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        from accounts.models import SubscriptionTier
        
        tiers = []
        for tier_key, features in SubscriptionTier.TIER_FEATURES.items():
            tier_info = {
                'key': tier_key,
                'name': tier_key.replace('_', ' ').title(),
                'features': features,
            }
            tiers.append(tier_info)
        
        return Response({
            'tiers': tiers
        })


class RegistrationsView(APIView):
    """
    Admin endpoint to view and manage user registrations
    Enhanced with subscription information
    
    GET: Admin only - view all registrations
    POST: Public - create new registration (same as /register/)
    """
    
    def get_permissions(self):
        """
        GET requires SuperAdmin
        POST is public (AllowAny)
        """
        if self.request.method == 'POST':
            return [AllowAny()]
        return [IsSuperAdmin()]
    
    def post(self, request):
        """
        Public endpoint for registration - redirects to PublicAdminRegisterView logic
        """
        serializer = PublicAdminRegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "message": "Registration successful. Please check your email to verify your account.",
                    "email": serializer.validated_data.get("email")
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get(self, request):
        # Get all users
        users = CustomUser.objects.all().order_by('-date_joined')
        
        registrations = []
        for user in users:
            # Get subscription info
            subscription_info = {
                'tier': None,
                'tier_display': None,
                'status': None,
                'days_remaining': None,
                'is_active': False,
            }
            
            if hasattr(user, 'subscription'):
                sub = user.subscription
                subscription_info = {
                    'tier': sub.tier,
                    'tier_display': sub.get_tier_display(),
                    'status': sub.status,
                    'status_display': sub.get_status_display(),
                    'days_remaining': sub.days_remaining,
                    'is_active': sub.is_active,
                    'start_date': sub.start_date.isoformat() if sub.start_date else None,
                    'end_date': sub.end_date.isoformat() if sub.end_date else None,
                }
                
            registrations.append({
                'id': user.id,
                'email': user.email,
                'name': f"{user.first_name} {user.last_name}".strip() or user.email,
                'company': user.company.name if user.company else None,
                'status': 'approved' if user.is_active else 'pending',
                'is_active': user.is_active,
                'trial_approved': user.is_active,
                'trial_start_date': None,
                'trial_days_remaining': None,
                'email_verified': user.is_active,
                'registered': user.date_joined.isoformat(),
                'last_login': user.last_login.isoformat() if user.last_login else None,
                
                # Subscription info
                'subscription': subscription_info,
            })
        
        return Response({
            'count': len(registrations),
            'registrations': registrations,
            'stats': {
                'total': len(registrations),
                'pending': sum(1 for r in registrations if r['status'] == 'pending'),
                'approved': sum(1 for r in registrations if r['status'] == 'approved'),
                'active_trials': sum(1 for r in registrations if r['subscription']['is_active'] and r['subscription']['tier'] == 'trial'),
            }
        })


# ============================================================
# COMPANY API KEYS VIEW (client-facing, admin roles only)
# ============================================================

class CompanyApiKeysView(APIView):
    """
    GET  /api/v1/auth/company-api-keys/ - Get API keys for user's company
    POST /api/v1/auth/company-api-keys/ - Create/update an API key for user's company
    DELETE /api/v1/auth/company-api-keys/<provider>/ - Remove an API key
    """
    permission_classes = [IsAuthenticated]

    def _check_admin_role(self, user):
        return getattr(user, 'role', None) in ('superadmin', 'admin')

    def get(self, request):
        if not self._check_admin_role(request.user):
            return Response(
                {'error': 'Only admin users can manage API keys'},
                status=status.HTTP_403_FORBIDDEN,
            )
        company = getattr(request.user, 'company', None)
        if not company:
            return Response({'openai': None, 'anthropic': None})

        from admin_portal.models import ClientApiKey
        keys = ClientApiKey.objects.filter(company=company)
        result = {}
        for k in keys:
            result[k.provider] = {
                'id': str(k.id),
                'masked_key': k.masked_key,
                'is_active': k.is_active,
                'use_custom': True,
                'updated_at': k.updated_at.isoformat() if k.updated_at else None,
            }
        # Ensure both providers are in response
        for provider in ('openai', 'anthropic'):
            if provider not in result:
                result[provider] = None
        return Response(result)

    def post(self, request):
        if not self._check_admin_role(request.user):
            return Response(
                {'error': 'Only admin users can manage API keys'},
                status=status.HTTP_403_FORBIDDEN,
            )
        company = getattr(request.user, 'company', None)
        if not company:
            return Response(
                {'error': 'User is not associated with a company'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        provider = request.data.get('provider')
        api_key = request.data.get('api_key', '')
        use_custom = request.data.get('use_custom', True)

        if provider not in ('openai', 'anthropic'):
            return Response(
                {'error': 'provider must be openai or anthropic'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from admin_portal.models import ClientApiKey, log_action

        if not use_custom:
            # User wants to use the default platform key - delete their custom key
            ClientApiKey.objects.filter(company=company, provider=provider).delete()
            return Response({'status': 'using_default', 'provider': provider})

        if not api_key:
            return Response(
                {'error': 'api_key is required when using a custom key'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        obj, created = ClientApiKey.objects.update_or_create(
            company=company,
            provider=provider,
            defaults={
                'api_key': api_key,
                'is_active': True,
                'updated_by': request.user,
            },
        )

        log_action(
            user=request.user,
            action='api_key_created' if created else 'settings_updated',
            category='settings',
            description=f"{'Set' if created else 'Updated'} {provider} API key for {company.name}",
            resource_type='client_api_key',
            resource_id=str(obj.id),
            company=company,
            request=request,
        )

        return Response({
            'id': str(obj.id),
            'provider': provider,
            'masked_key': obj.masked_key,
            'is_active': obj.is_active,
            'use_custom': True,
        })

    def delete(self, request, provider=None):
        if not self._check_admin_role(request.user):
            return Response(
                {'error': 'Only admin users can manage API keys'},
                status=status.HTTP_403_FORBIDDEN,
            )
        company = getattr(request.user, 'company', None)
        if not company or provider not in ('openai', 'anthropic'):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        from admin_portal.models import ClientApiKey, log_action

        deleted_count, _ = ClientApiKey.objects.filter(
            company=company, provider=provider
        ).delete()

        if deleted_count:
            log_action(
                user=request.user,
                action='api_key_revoked',
                category='settings',
                severity='warning',
                description=f"Removed {provider} API key for {company.name}",
                company=company,
                request=request,
            )

        return Response(status=status.HTTP_204_NO_CONTENT)