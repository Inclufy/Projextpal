# ============================================================
# ADMIN PORTAL - VIEWS
# API views for admin portal endpoints
# ============================================================

from rest_framework import viewsets, status, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.db.models import Count, Sum, Q
from django.db.models.functions import TruncMonth
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from accounts.models import Company
from subscriptions.models import SubscriptionPlan, CompanySubscription
from .models import AuditLog, SystemSetting, log_action
from .serializers import (
    UserListSerializer, UserDetailSerializer, UserCreateSerializer, UserUpdateSerializer,
    CompanyListSerializer, CompanyDetailSerializer, CompanyCreateSerializer,
    SubscriptionPlanListSerializer, SubscriptionPlanDetailSerializer, SubscriptionPlanCreateUpdateSerializer,
    AuditLogSerializer, SystemSettingSerializer, CurrentUserSerializer, DashboardStatsSerializer
)
from .permissions import IsSuperAdmin

User = get_user_model()


# ============================================================
# CURRENT USER VIEW (/api/v1/users/me/)
# ============================================================

class CurrentUserView(generics.RetrieveUpdateAPIView):
    """
    GET /api/v1/users/me/ - Get current user info
    PATCH /api/v1/users/me/ - Update current user
    """
    serializer_class = CurrentUserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user


# ============================================================
# DASHBOARD STATS VIEW
# ============================================================

class DashboardStatsView(APIView):
    """
    GET /api/v1/admin/stats/ - Get dashboard statistics
    """
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    
    def get(self, request):
        now = timezone.now()
        last_month = now - timedelta(days=30)
        two_months_ago = now - timedelta(days=60)
        
        # Current stats
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        total_companies = Company.objects.count()
        active_subscriptions = CompanySubscription.objects.filter(
            status__in=['active', 'trialing']
        ).count()
        
        # Calculate MRR
        mrr = Decimal('0.00')
        active_subs = CompanySubscription.objects.filter(status__in=['active', 'trialing'])
        for sub in active_subs:
            if sub.plan.plan_type == 'monthly':
                mrr += sub.plan.price
            else:  # yearly
                mrr += sub.plan.price / 12
        
        arr = mrr * 12
        
        # Last month stats for growth calculation
        users_last_month = User.objects.filter(date_joined__lt=last_month).count()
        companies_last_month = Company.objects.filter(created_at__lt=last_month).count()
        
        # Calculate growth percentages
        users_growth = ((total_users - users_last_month) / users_last_month * 100) if users_last_month > 0 else 0
        companies_growth = ((total_companies - companies_last_month) / companies_last_month * 100) if companies_last_month > 0 else 0
        
        # Recent activity
        recent_logs = AuditLog.objects.all()[:10]
        recent_activity = AuditLogSerializer(recent_logs, many=True).data
        
        # New users (last 5)
        new_users = User.objects.order_by('-date_joined')[:5]
        new_users_data = UserListSerializer(new_users, many=True).data
        
        # Subscriptions by plan
        subscriptions_by_plan = []
        for plan in SubscriptionPlan.objects.filter(is_active=True):
            count = plan.company_subscriptions.filter(status__in=['active', 'trialing']).count()
            subscriptions_by_plan.append({
                'plan': plan.name,
                'count': count
            })
        
        return Response({
            'overview': {
                'total_users': total_users,
                'active_users': active_users,
                'total_companies': total_companies,
                'active_subscriptions': active_subscriptions,
            },
            'revenue': {
                'mrr': float(mrr),
                'arr': float(arr),
                'currency': 'EUR',
            },
            'growth': {
                'users': round(users_growth, 1),
                'companies': round(companies_growth, 1),
                'mrr': 15.3,  # TODO: Calculate actual MRR growth
                'subscriptions': 5.1,  # TODO: Calculate actual growth
            },
            'recent_activity': recent_activity,
            'new_users': new_users_data,
            'subscriptions_by_plan': subscriptions_by_plan,
        })


# ============================================================
# USER MANAGEMENT VIEWSET
# ============================================================

class AdminUserViewSet(viewsets.ModelViewSet):
    """
    Admin viewset for user management
    
    GET /api/v1/admin/users/ - List all users
    POST /api/v1/admin/users/ - Create new user
    GET /api/v1/admin/users/{id}/ - Get user detail
    PATCH /api/v1/admin/users/{id}/ - Update user
    DELETE /api/v1/admin/users/{id}/ - Delete user
    """
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    queryset = User.objects.all().order_by('-date_joined')
    filterset_fields = ['role', 'is_active', 'company']
    search_fields = ['email', 'first_name', 'last_name', 'username']
    ordering_fields = ['date_joined', 'email', 'last_login']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return UserListSerializer
        elif self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserDetailSerializer
    
    def perform_create(self, serializer):
        user = serializer.save()
        log_action(
            user=self.request.user,
            action='user_created',
            category='user',
            description=f"Created user {user.email}",
            resource_type='user',
            resource_id=str(user.id),
            company=user.company,
            request=self.request
        )
    
    def perform_update(self, serializer):
        user = serializer.save()
        log_action(
            user=self.request.user,
            action='user_updated',
            category='user',
            description=f"Updated user {user.email}",
            resource_type='user',
            resource_id=str(user.id),
            company=user.company,
            request=self.request
        )
    
    def perform_destroy(self, instance):
        email = instance.email
        company = instance.company
        user_id = instance.id
        instance.delete()
        log_action(
            user=self.request.user,
            action='user_deleted',
            category='user',
            severity='warning',
            description=f"Deleted user {email}",
            resource_type='user',
            resource_id=str(user_id),
            company=company,
            request=self.request
        )
    
    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        """Suspend a user"""
        user = self.get_object()
        user.is_active = False
        user.save()
        
        log_action(
            user=request.user,
            action='user_suspended',
            category='user',
            severity='warning',
            description=f"Suspended user {user.email}",
            resource_type='user',
            resource_id=str(user.id),
            company=user.company,
            request=request
        )
        
        return Response({'status': 'suspended', 'user': UserDetailSerializer(user).data})
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a suspended user"""
        user = self.get_object()
        user.is_active = True
        user.save()
        
        log_action(
            user=request.user,
            action='user_activated',
            category='user',
            description=f"Activated user {user.email}",
            resource_type='user',
            resource_id=str(user.id),
            company=user.company,
            request=request
        )
        
        return Response({'status': 'activated', 'user': UserDetailSerializer(user).data})
    
    @action(detail=True, methods=['post'])
    def resend_invite(self, request, pk=None):
        """Resend invitation email"""
        user = self.get_object()
        
        # TODO: Implement actual email sending
        
        log_action(
            user=request.user,
            action='user_invited',
            category='user',
            description=f"Resent invitation to {user.email}",
            resource_type='user',
            resource_id=str(user.id),
            company=user.company,
            request=request
        )
        
        return Response({'status': 'invite_sent', 'email': user.email})


# ============================================================
# COMPANY (TENANT) MANAGEMENT VIEWSET
# ============================================================

class AdminCompanyViewSet(viewsets.ModelViewSet):
    """
    Admin viewset for company/tenant management
    
    GET /api/v1/admin/tenants/ - List all companies
    POST /api/v1/admin/tenants/ - Create new company
    GET /api/v1/admin/tenants/{id}/ - Get company detail
    PATCH /api/v1/admin/tenants/{id}/ - Update company
    DELETE /api/v1/admin/tenants/{id}/ - Delete company
    """
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    queryset = Company.objects.all().order_by('-created_at')
    filterset_fields = ['is_subscribed']
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'name']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return CompanyListSerializer
        elif self.action == 'create':
            return CompanyCreateSerializer
        return CompanyDetailSerializer
    
    def create(self, request, *args, **kwargs):
        print(f"=== DEBUG CREATE === request.data: {request.data}")
        
        # Create company first
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        company = serializer.save()
        
        # Handle subscription creation
        subscription_plan_id = request.data.get('subscription_plan_id')
        subscription_status = request.data.get('subscription_status')
        billing_cycle = request.data.get('billing_cycle')
        payment_method = request.data.get('payment_method')
        
        if subscription_plan_id and subscription_plan_id != 'none':
            try:
                plan = SubscriptionPlan.objects.get(id=subscription_plan_id)
                status_value = subscription_status if subscription_status and subscription_status != 'none' else 'active'
                
                CompanySubscription.objects.create(
                    company=company,
                    plan=plan,
                    status=status_value,
                    billing_cycle=billing_cycle or 'monthly',
                    payment_method=payment_method or 'stripe'
                )
                print(f"Created subscription: {status_value}, {billing_cycle}, {payment_method}")
                
                company.is_subscribed = True
                company.save()
            except SubscriptionPlan.DoesNotExist:
                print(f"Plan {subscription_plan_id} not found")
        
        # Log action
        log_action(
            user=self.request.user,
            action='company_created',
            category='company',
            description=f"Created company {company.name}",
            resource_type='company',
            resource_id=str(company.id),
            company=company,
            request=self.request
        )
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def perform_update(self, serializer):
        company = serializer.save()
        log_action(
            user=self.request.user,
            action='company_updated',
            category='company',
            description=f"Updated company {company.name}",
            resource_type='company',
            resource_id=str(company.id),
            company=company,
            request=self.request
        )
    
    def perform_destroy(self, instance):
        name = instance.name
        company_id = instance.id
        instance.delete()
        log_action(
            user=self.request.user,
            action='company_deleted',
            category='company',
            severity='warning',
            description=f"Deleted company {name}",
            resource_type='company',
            resource_id=str(company_id),
            request=self.request
        )
    def perform_destroy(self, instance):
        name = instance.name
        company_id = instance.id
        instance.delete()
        log_action(
            user=self.request.user,
            action='company_deleted',
            category='company',
            severity='warning',
            description=f"Deleted company {name}",
            resource_type='company',
            resource_id=str(company_id),
            request=self.request
        )
    
    def partial_update(self, request, *args, **kwargs):
        print(f"=== DEBUG PATCH === request.data: {request.data}")
        
        instance = self.get_object()
        
        # Handle subscription update separately
        subscription_plan_id = request.data.get('subscription_plan_id')
        subscription_status = request.data.get('subscription_status')
        billing_cycle = request.data.get('billing_cycle')
        payment_method = request.data.get('payment_method')
        
        if subscription_plan_id is not None or subscription_status is not None:
            existing_sub = CompanySubscription.objects.filter(
                company=instance
            ).order_by('-created_at').first()
            
            if subscription_plan_id and subscription_plan_id != 'none':
                try:
                    plan = SubscriptionPlan.objects.get(id=subscription_plan_id)
                    
                    if existing_sub:
                        existing_sub.plan = plan
                        existing_sub.billing_cycle = billing_cycle or existing_sub.billing_cycle or 'monthly'
                        existing_sub.payment_method = payment_method or existing_sub.payment_method or 'stripe'
                        if subscription_status and subscription_status != 'none':
                            existing_sub.status = subscription_status
                        existing_sub.save()
                        print(f"Updated subscription: {existing_sub.status}, {existing_sub.billing_cycle}, {existing_sub.payment_method}")
                    else:
                        new_status = subscription_status if subscription_status and subscription_status != 'none' else 'active'
                        CompanySubscription.objects.create(
                            company=instance,
                            plan=plan,
                            status=new_status,
                            billing_cycle=billing_cycle or 'monthly',
                            payment_method=payment_method or 'stripe'
                        )
                        print(f"Created new subscription")
                    
                    instance.is_subscribed = True
                    instance.save()
                except SubscriptionPlan.DoesNotExist:
                    pass
            elif subscription_status and subscription_status != 'none' and existing_sub:
                existing_sub.status = subscription_status
                if billing_cycle:
                    existing_sub.billing_cycle = billing_cycle
                if payment_method:
                    existing_sub.payment_method = payment_method
                existing_sub.save()
                print(f"Updated status only: {existing_sub.status}")
                
                if subscription_status == 'canceled':
                    instance.is_subscribed = False
                    instance.save()
        
        # Call parent for normal field updates
        return super().partial_update(request, *args, **kwargs)

    @action(detail=True, methods=['get'])
    def users(self, request, pk=None):
        """Get all users for a company"""
        company = self.get_object()
        users = company.customuser_set.all()
        serializer = UserListSerializer(users, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def subscription(self, request, pk=None):
        """Get subscription details for a company"""
        company = self.get_object()
        subscription = company.subscriptions.filter(
            status__in=['active', 'trialing', 'past_due']
        ).first()
        
        if not subscription:
            return Response({'detail': 'No active subscription'}, status=404)
        
        return Response({
            'id': str(subscription.id),
            'plan': SubscriptionPlanListSerializer(subscription.plan).data,
            'status': subscription.status,
            'current_period_start': subscription.current_period_start,
            'current_period_end': subscription.current_period_end,
            'cancel_at_period_end': subscription.cancel_at_period_end
        })


# ============================================================
# SUBSCRIPTION PLAN VIEWSET
# ============================================================

class AdminPlanViewSet(viewsets.ModelViewSet):
    """
    Admin viewset for subscription plan management
    
    GET /api/v1/admin/plans/ - List all plans
    POST /api/v1/admin/plans/ - Create new plan
    GET /api/v1/admin/plans/{id}/ - Get plan detail
    PATCH /api/v1/admin/plans/{id}/ - Update plan
    DELETE /api/v1/admin/plans/{id}/ - Delete plan
    """
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    queryset = SubscriptionPlan.objects.all().order_by('plan_type', 'price')
    filterset_fields = ['plan_type', 'plan_level', 'is_active', 'is_popular']
    search_fields = ['name']
    ordering_fields = ['price', 'created_at', 'name']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return SubscriptionPlanCreateUpdateSerializer
        elif self.action == 'retrieve':
            return SubscriptionPlanDetailSerializer
        return SubscriptionPlanListSerializer
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Toggle plan active status"""
        plan = self.get_object()
        plan.is_active = not plan.is_active
        plan.save()
        
        log_action(
            user=request.user,
            action='settings_updated',
            category='subscription',
            description=f"{'Activated' if plan.is_active else 'Deactivated'} plan {plan.name}",
            resource_type='plan',
            resource_id=str(plan.id),
            request=request
        )
        
        return Response({'status': 'active' if plan.is_active else 'inactive'})
    
    @action(detail=True, methods=['post'])
    def set_popular(self, request, pk=None):
        """Set plan as popular (only one can be popular per plan_type)"""
        plan = self.get_object()
        
        # Remove popular from other plans of same type
        SubscriptionPlan.objects.filter(
            plan_type=plan.plan_type,
            is_popular=True
        ).update(is_popular=False)
        
        plan.is_popular = True
        plan.save()
        
        return Response({'status': 'set_as_popular'})


# ============================================================
# AUDIT LOG VIEWSET
# ============================================================

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only viewset for audit logs
    
    GET /api/v1/admin/logs/ - List all logs
    GET /api/v1/admin/logs/{id}/ - Get log detail
    """
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    serializer_class = AuditLogSerializer
    queryset = AuditLog.objects.all().order_by('-created_at')
    filterset_fields = ['action', 'category', 'severity', 'user', 'company']
    search_fields = ['description', 'user_email']
    ordering_fields = ['created_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Date filters
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def export(self, request):
        """Export logs as CSV"""
        # TODO: Implement CSV export
        return Response({'detail': 'Export functionality coming soon'})


# ============================================================
# SYSTEM SETTINGS VIEW
# ============================================================

class SystemSettingsView(APIView):
    """
    GET /api/v1/admin/settings/ - Get all settings
    PATCH /api/v1/admin/settings/ - Update settings
    """
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    
    def get(self, request):
        settings = SystemSetting.objects.all()
        
        # Group by category
        grouped = {}
        for setting in settings:
            if setting.category not in grouped:
                grouped[setting.category] = {}
            
            value = setting.value
            if setting.is_sensitive:
                value = '********'
            
            grouped[setting.category][setting.key] = value
        
        return Response(grouped)
    
    def patch(self, request):
        updated = []
        
        for category, settings_dict in request.data.items():
            if isinstance(settings_dict, dict):
                for key, value in settings_dict.items():
                    setting, created = SystemSetting.objects.update_or_create(
                        key=key,
                        defaults={
                            'value': value,
                            'category': category,
                            'updated_by': request.user
                        }
                    )
                    updated.append(key)
        
        log_action(
            user=request.user,
            action='settings_updated',
            category='settings',
            description=f"Updated settings: {', '.join(updated)}",
            request=request
        )
        
        return Response({'status': 'updated', 'keys': updated})
    
    @action(detail=False, methods=['get'])
    def system_info(self, request):
        """Get system information"""
        return Response({
            'version': '1.0.0',
            'environment': 'development',
            'database': {
                'type': 'sqlite',
            },
            'uptime_days': 45,
        })
