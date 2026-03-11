# ============================================================
# ADMIN PORTAL - SERIALIZERS
# Serializers for admin API endpoints
# ============================================================

from rest_framework import serializers
from django.contrib.auth import get_user_model
from accounts.models import Company
from subscriptions.models import SubscriptionPlan, CompanySubscription
from .models import AuditLog, SystemSetting, ClientApiKey, CloudProviderConfig
from accounts.models import Registration

User = get_user_model()


# ============================================================
# USER SERIALIZERS
# ============================================================

class UserListSerializer(serializers.ModelSerializer):
    """Serializer for user list view"""
    
    company_name = serializers.CharField(source='company.name', read_only=True, allow_null=True)
    full_name = serializers.SerializerMethodField()
    is_superadmin = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 'full_name',
            'role', 'company', 'company_name', 'is_active', 'is_superadmin',
            'date_joined', 'last_login', 'image', 'theme'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.email
    
    def get_is_superadmin(self, obj):
        return obj.role == 'superadmin'


class UserDetailSerializer(serializers.ModelSerializer):
    """Serializer for user detail view"""
    
    company_name = serializers.CharField(source='company.name', read_only=True, allow_null=True)
    full_name = serializers.SerializerMethodField()
    is_superadmin = serializers.SerializerMethodField()
    subscription_info = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 'full_name',
            'role', 'company', 'company_name', 'is_active', 'is_staff',
            'is_superadmin', 'date_joined', 'last_login', 'image', 'theme',
            'subscription_info'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.email
    
    def get_is_superadmin(self, obj):
        return obj.role == 'superadmin'
    
    def get_subscription_info(self, obj):
        if not obj.company:
            return None
        
        subscription = CompanySubscription.objects.filter(
            company=obj.company,
            status__in=['active', 'trialing']
        ).first()
        
        if subscription:
            return {
                'plan_name': subscription.plan.name,
                'status': subscription.status,
                'current_period_end': subscription.current_period_end
            }
        return None


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new users"""
    
    password = serializers.CharField(write_only=True, required=False)
    send_invite = serializers.BooleanField(write_only=True, default=True)
    
    class Meta:
        model = User
        fields = [
            'email', 'username', 'first_name', 'last_name',
            'role', 'company', 'password', 'send_invite'
        ]
    
    def create(self, validated_data):
        send_invite = validated_data.pop('send_invite', True)
        password = validated_data.pop('password', None)
        
        # Generate username from email if not provided
        if not validated_data.get('username'):
            validated_data['username'] = validated_data['email'].split('@')[0]
        
        user = User(**validated_data)
        
        if password:
            user.set_password(password)
        else:
            # Set unusable password - user will need to set via invite
            user.set_unusable_password()
            user.is_active = False
        
        user.save()
        
        # Send invite email if send_invite is True
        if send_invite and not password:
            from accounts.models import VerificationToken
            from django.core.mail import EmailMultiAlternatives
            from django.template.loader import render_to_string
            from django.conf import settings
            
            # Create verification token
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
        
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating users"""
    
    class Meta:
        model = User
        fields = [
            'email', 'username', 'first_name', 'last_name',
            'role', 'company', 'is_active', 'theme'
        ]


# ============================================================
# COMPANY (TENANT) SERIALIZERS
# ============================================================

class CompanyListSerializer(serializers.ModelSerializer):
    """Serializer for company list view"""
    
    user_count = serializers.SerializerMethodField()
    subscription_status = serializers.SerializerMethodField()
    plan_name = serializers.SerializerMethodField()
    billing_cycle = serializers.SerializerMethodField()
    payment_method = serializers.SerializerMethodField()
    owner = serializers.SerializerMethodField()
    
    class Meta:
        model = Company
        fields = [
            'id', 'name', 'description', 'is_subscribed',
            'user_count', 'subscription_status', 'plan_name', 
            'billing_cycle', 'payment_method', 'owner',
            'created_at', 'updated_at'
        ]
    
    def get_user_count(self, obj):
        return obj.customuser_set.count()
    
    def get_subscription_status(self, obj):
        subscription = obj.subscriptions.filter(
            status__in=['active', 'trialing', 'past_due']
        ).first()
        return subscription.status if subscription else 'none'
    
    def get_plan_name(self, obj):
        subscription = obj.subscriptions.filter(
            status__in=['active', 'trialing', 'past_due']
        ).first()
        return subscription.plan.name if subscription else None
    
    def get_billing_cycle(self, obj):
        subscription = obj.subscriptions.order_by('-created_at').first()
        return getattr(subscription, 'billing_cycle', None) if subscription else None
    
    def get_payment_method(self, obj):
        subscription = obj.subscriptions.order_by('-created_at').first()
        return getattr(subscription, 'payment_method', None) if subscription else None
    
    def get_owner(self, obj):
        owner = obj.customuser_set.filter(role__in=['superadmin', 'admin']).first()
        if owner:
            return {
                'id': owner.id,
                'email': owner.email,
                'full_name': f"{owner.first_name} {owner.last_name}".strip() or owner.email
            }
        return None


class CompanyDetailSerializer(serializers.ModelSerializer):
    """Serializer for company detail view"""
    
    users = serializers.SerializerMethodField()
    subscription = serializers.SerializerMethodField()
    usage = serializers.SerializerMethodField()
    
    class Meta:
        model = Company
        fields = [
            'id', 'name', 'description', 'is_subscribed',
            'users', 'subscription', 'usage',
            'created_at', 'updated_at'
        ]
    
    def get_users(self, obj):
        users = obj.customuser_set.all()[:10]  # Limit to 10
        return UserListSerializer(users, many=True).data
    
    def get_subscription(self, obj):
        subscription = obj.subscriptions.filter(
            status__in=['active', 'trialing', 'past_due']
        ).first()
        
        if subscription:
            return {
                'id': str(subscription.id),
                'plan_name': subscription.plan.name,
                'plan_level': subscription.plan.plan_level,
                'status': subscription.status,
                'current_period_start': subscription.current_period_start,
                'current_period_end': subscription.current_period_end,
                'cancel_at_period_end': subscription.cancel_at_period_end
            }
        return None
    
    def get_usage(self, obj):
        subscription = obj.subscriptions.filter(
            status__in=['active', 'trialing']
        ).first()
        
        user_count = obj.customuser_set.count()
        # You can add project count here if you have access to projects model
        
        if subscription:
            return {
                'users': {
                    'current': user_count,
                    'max': subscription.plan.max_users,
                    'percentage': round((user_count / subscription.plan.max_users * 100), 1) if subscription.plan.max_users else 0
                }
            }
        return {
            'users': {'current': user_count, 'max': None, 'percentage': 0}
        }


class CompanyCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating companies"""
    
    owner_email = serializers.EmailField(write_only=True, required=False)
    
    class Meta:
        model = Company
        fields = ['name', 'description', 'owner_email']
    
    def create(self, validated_data):
        owner_email = validated_data.pop('owner_email', None)
        company = Company.objects.create(**validated_data)
        
        # Create owner user if email provided
        if owner_email:
            User.objects.create(
                email=owner_email,
                username=owner_email.split('@')[0],
                company=company,
                role='superadmin',
                is_active=False  # Will need to verify email
            )
        
        return company


# ============================================================
# SUBSCRIPTION PLAN SERIALIZERS
# ============================================================

class SubscriptionPlanListSerializer(serializers.ModelSerializer):
    """Serializer for plan list view"""
    
    subscriber_count = serializers.SerializerMethodField()
    monthly_revenue = serializers.SerializerMethodField()
    
    class Meta:
        model = SubscriptionPlan
        fields = [
            'id', 'name', 'plan_type', 'plan_level', 'price',
            'stripe_price_id', 'max_users', 'max_projects', 'storage_limit_gb',
            'features', 'is_active', 'is_popular',
            'priority_support', 'advanced_analytics', 'custom_integrations',
            'subscriber_count', 'monthly_revenue',
            'created_at', 'updated_at'
        ]
    
    def get_subscriber_count(self, obj):
        return obj.company_subscriptions.filter(
            status__in=['active', 'trialing']
        ).count()
    
    def get_monthly_revenue(self, obj):
        count = self.get_subscriber_count(obj)
        if obj.plan_type == 'yearly':
            return float(obj.price / 12 * count)
        return float(obj.price * count)


class SubscriptionPlanDetailSerializer(serializers.ModelSerializer):
    """Serializer for plan detail view"""
    
    subscriber_count = serializers.SerializerMethodField()
    subscribers = serializers.SerializerMethodField()
    
    class Meta:
        model = SubscriptionPlan
        fields = '__all__'
    
    def get_subscriber_count(self, obj):
        return obj.company_subscriptions.filter(
            status__in=['active', 'trialing']
        ).count()
    
    def get_subscribers(self, obj):
        subscriptions = obj.company_subscriptions.filter(
            status__in=['active', 'trialing']
        )[:10]
        return [{
            'company_name': sub.company.name,
            'status': sub.status,
            'current_period_end': sub.current_period_end
        } for sub in subscriptions]


class SubscriptionPlanCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating plans"""
    
    class Meta:
        model = SubscriptionPlan
        fields = [
            'name', 'plan_type', 'plan_level', 'price',
            'stripe_price_id', 'stripe_product_id',
            'max_users', 'max_projects', 'storage_limit_gb',
            'features', 'is_active', 'is_popular',
            'priority_support', 'advanced_analytics', 'custom_integrations'
        ]


# ============================================================
# AUDIT LOG SERIALIZERS
# ============================================================

class AuditLogSerializer(serializers.ModelSerializer):
    """Serializer for audit logs"""
    
    user_info = serializers.SerializerMethodField()
    company_name = serializers.CharField(source='company.name', read_only=True, allow_null=True)
    
    class Meta:
        model = AuditLog
        fields = [
            'id', 'user', 'user_email', 'user_info',
            'action', 'category', 'severity',
            'description', 'metadata',
            'resource_type', 'resource_id',
            'company', 'company_name',
            'ip_address', 'created_at'
        ]
    
    def get_user_info(self, obj):
        if obj.user:
            return {
                'id': obj.user.id,
                'email': obj.user.email,
                'full_name': f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.email
            }
        return None


# ============================================================
# SYSTEM SETTINGS SERIALIZERS
# ============================================================

class SystemSettingSerializer(serializers.ModelSerializer):
    """Serializer for system settings"""

    class Meta:
        model = SystemSetting
        fields = ['id', 'key', 'value', 'category', 'description', 'is_sensitive', 'updated_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Hide sensitive values
        if instance.is_sensitive:
            data['value'] = '********'
        return data


class CloudProviderConfigListSerializer(serializers.ModelSerializer):
    """Serializer for listing cloud provider configs (masks credentials)"""

    provider_display = serializers.CharField(source='get_provider_display', read_only=True)
    masked_credentials = serializers.DictField(read_only=True)
    active_services = serializers.ListField(read_only=True)

    class Meta:
        model = CloudProviderConfig
        fields = [
            'id', 'provider', 'provider_display', 'is_active',
            'storage_enabled', 'storage_config',
            'email_enabled', 'email_config',
            'database_enabled', 'database_config',
            'cdn_enabled', 'cdn_config',
            'masked_credentials', 'active_services',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CloudProviderConfigWriteSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating cloud provider configs"""

    class Meta:
        model = CloudProviderConfig
        fields = [
            'provider', 'is_active',
            'storage_enabled', 'storage_config',
            'email_enabled', 'email_config',
            'database_enabled', 'database_config',
            'cdn_enabled', 'cdn_config',
            'credentials',
        ]


class ClientApiKeySerializer(serializers.ModelSerializer):
    """Serializer for per-client AI API keys"""

    company_name = serializers.CharField(source='company.name', read_only=True)
    masked_key = serializers.CharField(read_only=True)

    class Meta:
        model = ClientApiKey
        fields = [
            'id', 'company', 'company_name', 'provider',
            'masked_key', 'is_active',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


# ============================================================
# CURRENT USER SERIALIZER (for /users/me/)
# ============================================================

class CurrentUserSerializer(serializers.ModelSerializer):
    """Serializer for the current authenticated user"""
    
    full_name = serializers.SerializerMethodField()
    is_superadmin = serializers.SerializerMethodField()
    company_name = serializers.CharField(source='company.name', read_only=True, allow_null=True)
    subscription = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 'full_name',
            'role', 'is_superadmin', 'company', 'company_name',
            'is_active', 'is_staff', 'date_joined', 'last_login',
            'image', 'theme', 'subscription'
        ]
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.email
    
    def get_is_superadmin(self, obj):
        return obj.role == 'superadmin'
    
    def get_subscription(self, obj):
        if not obj.company:
            return None
        
        subscription = CompanySubscription.objects.filter(
            company=obj.company,
            status__in=['active', 'trialing']
        ).first()
        
        if subscription:
            return {
                'plan_name': subscription.plan.name,
                'plan_level': subscription.plan.plan_level,
                'status': subscription.status
            }
        return None


# ============================================================
# DASHBOARD STATS SERIALIZER
# ============================================================

class DashboardStatsSerializer(serializers.Serializer):
    """Serializer for dashboard statistics"""
    
    total_users = serializers.IntegerField()
    active_users = serializers.IntegerField()
    total_companies = serializers.IntegerField()
    active_subscriptions = serializers.IntegerField()
    mrr = serializers.DecimalField(max_digits=12, decimal_places=2)
    arr = serializers.DecimalField(max_digits=12, decimal_places=2)
    
    users_growth = serializers.FloatField()
    companies_growth = serializers.FloatField()
    mrr_growth = serializers.FloatField()
    subscriptions_growth = serializers.FloatField()

class RegistrationSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    company_id = serializers.IntegerField(source='user.company.id', read_only=True, allow_null=True)
    is_subscribed = serializers.BooleanField(source='user.company.is_subscribed', read_only=True, allow_null=True)
    days_since_registration = serializers.SerializerMethodField()
    trial_days_remaining = serializers.SerializerMethodField()
    
    class Meta:
        model = Registration
        fields = [
            'id',
            'user_id',
            'user_email',
            'email',
            'first_name',
            'last_name',
            'company_name',
            'company_id',
            'is_subscribed',
            'status',
            'trial_days',
            'trial_start_date',
            'trial_end_date',
            'trial_days_remaining',
            'accept_terms',
            'subscribe_newsletter',
            'ip_address',
            'user_agent',
            'source',
            'utm_source',
            'utm_medium',
            'utm_campaign',
            'registered_at',
            'verified_at',
            'last_login_at',
            'days_since_registration',
            'notes',
        ]
        read_only_fields = ['id', 'registered_at']
    
    def get_days_since_registration(self, obj):
        return obj.days_since_registration()
    
    def get_trial_days_remaining(self, obj):
        if not obj.trial_end_date:
            return None
        from django.utils import timezone
        remaining = (obj.trial_end_date - timezone.now()).days
        return max(0, remaining)


class RegistrationStatsSerializer(serializers.Serializer):
    total_registrations = serializers.IntegerField()
    by_status = serializers.DictField()
    time_based = serializers.DictField()
    trial_stats = serializers.DictField()
    marketing = serializers.DictField()
    conversion_rate_percent = serializers.FloatField()