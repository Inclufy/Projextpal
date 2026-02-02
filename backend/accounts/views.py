from rest_framework import generics, status, viewsets
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
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

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
import os

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_profile_image(request):
    """Upload user profile image"""
    try:
        profile_image = request.FILES.get('profile_image')
        
        if not profile_image:
            return Response(
                {'error': 'No image provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Save image to user model
        user = request.user
        user.profile_image = profile_image
        user.save()
        
        # Return full URL
        image_url = request.build_absolute_uri(user.profile_image.url)
        
        return Response({
            'profile_image_url': image_url,
            'message': 'Profile image updated successfully'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
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
                    {"message": "Email already verified"}, status=status.HTTP_200_OK
                )
            user.is_active = True
            user.save()
            verification_token.is_used = True  # Mark token as used
            verification_token.save()
            return Response(
                {"message": "Email verified successfully"}, status=status.HTTP_200_OK
            )
        except VerificationToken.DoesNotExist:
            return Response(
                {"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST
            )


# Forgot password view
class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Password reset link sent to your email"},
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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


# List users in the same company as the requester
User = get_user_model()


class CompanyUsersView(APIView):
    permission_classes = [IsAuthenticated]

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