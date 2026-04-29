from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from datetime import timedelta
import uuid


class Company(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_subscribed = models.BooleanField(default=False)

    # Tenant-wide 2FA enforcement
    # When True, every user in the tenant must enrol 2FA at next login.
    # The login flow checks `not has_2fa(user) and user.company.require_2fa`
    # and redirects to 2FA enrolment.
    require_2fa = models.BooleanField(
        default=False,
        help_text="Force all users in this tenant to enable 2FA at next login.",
    )
    require_2fa_enabled_at = models.DateTimeField(null=True, blank=True)

    # Subscription billing helpers (lightweight — full billing lives in
    # subscriptions app + Stripe). next_invoice_date / last_payment_date
    # are populated by the subscriptions webhook handler.
    next_invoice_date = models.DateTimeField(null=True, blank=True)
    last_payment_date = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.name


class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    image = models.ImageField(upload_to="user_images/", null=True, blank=True)
    company = models.ForeignKey(
        Company, on_delete=models.CASCADE, null=True, blank=True
    )
    ROLE_CHOICES = [
        ("superadmin", "Super Admin"),
        ("admin", "Administrator"),
        ("pm", "Project Manager"),
        ("program_manager", "Program Manager"),
        ("contibuter", "Contibuter"),
        ("reviewer", "Reviewer"),
        ("guest", "Guest"),
    ]
    role = models.CharField(max_length=100, choices=ROLE_CHOICES, default="superadmin")
    THEME_CHOICES = [
        ("light", "Light"),
        ("dark", "Dark"),
    ]
    theme = models.CharField(max_length=100, choices=THEME_CHOICES, default="light")
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]


class VerificationToken(models.Model):
    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="verification_tokens"
    )
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(
                hours=24
            )  # 24-hour expiration
        super().save(*args, **kwargs)

    def is_valid(self):
        return not self.is_used and timezone.now() <= self.expires_at

    def __str__(self):
        return f"Verification token for {self.user.email} - {self.token}"


class PasswordResetToken(models.Model):
    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="reset_tokens"
    )
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(
                hours=1
            )  # 1-hour expiration
        super().save(*args, **kwargs)

    def is_valid(self):
        return not self.is_used and timezone.now() <= self.expires_at

    def __str__(self):
        return f"Token for {self.user.email} - {self.token}"


class CrmApiKey(models.Model):
    """CRM API Key for fetching users from external CRM system"""
    
    company = models.ForeignKey(
        Company, on_delete=models.CASCADE, related_name="crm_api_keys"
    )
    name = models.CharField(
        max_length=255,
        help_text="Descriptive name for this API key (e.g., 'Production CRM', 'Sales CRM')"
    )
    api_key = models.CharField(
        max_length=500,
        help_text="The API key for accessing the CRM API"
    )
    api_base_url = models.URLField(
        default="http://api.inclufy.com",
        help_text="Base URL for the CRM API"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this API key is currently active"
    )
    last_fetched_at = models.DateTimeField(
        null=True, blank=True,
        help_text="Last time CRM users were successfully fetched using this key"
    )
    created_by = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_crm_api_keys"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["company", "is_active"]),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.company.name})"

class Registration(models.Model):
    """Track user registrations with metadata"""
    
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='registration'
    )
    intent = models.CharField(
        max_length=50, 
        blank=True, 
        null=True,
        choices=[
            ('14_day_trial', '14 Day Trial'),
            ('demo', 'Request Demo'),
            ('become_customer', 'Become Customer'),
            ('more_info', 'More Information'),
            ('contact_sales', 'Contact Sales'),
        ]
    )
    
    # Registration details
    email = models.EmailField()
    first_name = models.CharField(max_length=255, blank=True)
    last_name = models.CharField(max_length=255, blank=True)
    company_name = models.CharField(max_length=255)
    
    # Marketing preferences
    accept_terms = models.BooleanField(default=False)
    subscribe_newsletter = models.BooleanField(default=False)
    
    # Trial information
    trial_days = models.IntegerField(default=0)
    trial_start_date = models.DateTimeField(null=True, blank=True)
    trial_end_date = models.DateTimeField(null=True, blank=True)
    
    # Status tracking
    STATUS_CHOICES = [
        ('pending', 'Pending Verification'),
        ('verified', 'Email Verified'),
        ('active', 'Active Account'),
        ('trial_expired', 'Trial Expired'),
        ('cancelled', 'Cancelled'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Tracking metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    source = models.CharField(max_length=100, blank=True)
    utm_source = models.CharField(max_length=100, blank=True)
    utm_medium = models.CharField(max_length=100, blank=True)
    utm_campaign = models.CharField(max_length=100, blank=True)
    
    # Timestamps
    registered_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    last_login_at = models.DateTimeField(null=True, blank=True)
    
    notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-registered_at']
        indexes = [
            models.Index(fields=['-registered_at']),
            models.Index(fields=['status', '-registered_at']),
            models.Index(fields=['email']),
        ]
    
    def __str__(self):
        return f"{self.email} - {self.company_name} ({self.status})"
    
    def days_since_registration(self):
        from django.utils import timezone
        delta = timezone.now() - self.registered_at
        return delta.days

class TrialLimits:
    """Trial user limitations"""
    MAX_PROGRAMS = 1
    MAX_PROGRAM_METHODOLOGIES = 1
    MAX_PROJECTS = 1
    MAX_PROJECT_METHODOLOGIES = 1
    MAX_USERS = 1
    
    DISABLED_FEATURES = [
        "time_tracking",
        "teams",
        "post_project",
        "advanced_analytics",
        "custom_integrations",
    ]
    
    @staticmethod
    def is_trial_user(user):
        """Check if user is on trial"""
        try:
            registration = Registration.objects.get(user=user)
            if registration.trial_days > 0 and registration.status == "approved":
                # Check if trial is still active
                if registration.trial_end_date and registration.trial_end_date > timezone.now():
                    return True
        except Registration.DoesNotExist:
            pass
        return False
    
    @staticmethod
    def check_limit(user, resource_type):
        """Check if user has reached trial limit for resource"""
        if not TrialLimits.is_trial_user(user):
            return True  # Not a trial user, no limits
        
        company = user.company
        if not company:
            return False
        
        if resource_type == "programs":
            from programs.models import Program
            count = Program.objects.filter(company=company).count()
            return count < TrialLimits.MAX_PROGRAMS
        
        elif resource_type == "projects":
            from projects.models import Project
            count = Project.objects.filter(company=company).count()
            return count < TrialLimits.MAX_PROJECTS
        
        elif resource_type == "users":
            from accounts.models import CustomUser
            count = CustomUser.objects.filter(company=company, is_active=True).count()
            return count < TrialLimits.MAX_USERS
        
        return True


class SubscriptionTier:
    """Subscription tier definitions and feature limits"""
    
    TRIAL = "trial"
    STARTER = "starter"
    PROFESSIONAL = "professional"
    TEAM = "team"
    ENTERPRISE = "enterprise"
    
    TIER_FEATURES = {
        TRIAL: {
            "max_users": 1,
            "max_programs": 1,
            "max_program_methodologies": 1,
            "max_projects": 1,
            "max_project_methodologies": 1,
            "trial_days": 14,
            "features": {
                "web_access": False,
                "mobile_access": True,
                "time_tracking": False,
                "teams": False,
                "post_project": False,
                "program_management": True,
                "ai_assistant": False,
                "methodology_templates": True,
                "gantt_charts": False,
                "resource_management": False,
            }
        },
        STARTER: {
            "max_users": 1,
            "max_programs": 0,  # No programs
            "max_program_methodologies": 0,
            "max_projects": 5,
            "max_project_methodologies": -1,  # Unlimited
            "trial_days": 0,
            "features": {
                "web_access": False,
                "mobile_access": True,
                "time_tracking": True,
                "teams": False,
                "post_project": False,
                "program_management": False,
                "ai_assistant": True,
                "methodology_templates": False,
                "gantt_charts": False,
                "resource_management": False,
            }
        },
        PROFESSIONAL: {
            "max_users": 1,
            "max_programs": -1,  # Unlimited
            "max_program_methodologies": -1,
            "max_projects": 10,
            "max_project_methodologies": -1,
            "trial_days": 0,
            "features": {
                "web_access": True,
                "mobile_access": True,
                "time_tracking": True,
                "teams": False,
                "post_project": False,
                "program_management": True,
                "ai_assistant": True,
                "methodology_templates": True,
                "gantt_charts": True,
                "resource_management": True,
            }
        },
        TEAM: {
            "max_users": 25,
            "max_programs": -1,
            "max_program_methodologies": -1,
            "max_projects": -1,  # Unlimited
            "max_project_methodologies": -1,
            "trial_days": 0,
            "features": {
                "web_access": True,
                "mobile_access": True,
                "time_tracking": True,
                "teams": True,
                "post_project": True,
                "program_management": True,
                "ai_assistant": True,
                "methodology_templates": True,
                "gantt_charts": True,
                "resource_management": True,
                "admin_permissions": True,
                "team_dashboards": True,
            }
        },
        ENTERPRISE: {
            "max_users": -1,  # Unlimited
            "max_programs": -1,
            "max_program_methodologies": -1,
            "max_projects": -1,
            "max_project_methodologies": -1,
            "trial_days": 0,
            "features": {
                "web_access": True,
                "mobile_access": True,
                "time_tracking": True,
                "teams": True,
                "post_project": True,
                "program_management": True,
                "ai_assistant": True,
                "methodology_templates": True,
                "gantt_charts": True,
                "resource_management": True,
                "admin_permissions": True,
                "team_dashboards": True,
                "sso_saml": True,
                "api_access": True,
                "custom_workflows": True,
                "dedicated_support": True,
                "white_label": True,
            }
        }
    }
    
    @staticmethod
    def get_user_tier(user):
        """Get subscription tier for a user"""
        # Check if trial user
        try:
            from accounts.models import Registration
            from django.utils import timezone
            
            reg = Registration.objects.get(user=user)
            if reg.trial_days > 0:
                if reg.trial_end_date and reg.trial_end_date > timezone.now():
                    return SubscriptionTier.TRIAL
        except Registration.DoesNotExist:
            pass
        
        # Check company subscription
        if hasattr(user, "company") and user.company:
            try:
                from subscriptions.models import CompanySubscription
                subscription = CompanySubscription.objects.filter(
                    company=user.company,
                    status__in=["active", "trialing"]
                ).select_related("plan").first()
                
                if subscription and hasattr(subscription.plan, "plan_level"):
                    return subscription.plan.plan_level
            except:
                pass
        
        # Default to starter
        return SubscriptionTier.STARTER
    
    @staticmethod
    def has_feature(user, feature_name):
        """Check if user has access to a feature"""
        tier = SubscriptionTier.get_user_tier(user)
        tier_config = SubscriptionTier.TIER_FEATURES.get(tier, {})
        features = tier_config.get("features", {})
        return features.get(feature_name, False)
    
    @staticmethod
    def get_limit(user, limit_name):
        """Get limit value for user (-1 = unlimited, 0 = not allowed)"""
        tier = SubscriptionTier.get_user_tier(user)
        tier_config = SubscriptionTier.TIER_FEATURES.get(tier, {})
        return tier_config.get(limit_name, 0)
    
    @staticmethod
    def check_limit(user, resource_type):
        """Check if user can create more of a resource type"""
        limit = SubscriptionTier.get_limit(user, f"max_{resource_type}")
        
        if limit == -1:  # Unlimited
            return True
        elif limit == 0:  # Not allowed
            return False
        
        # Count current resources
        company = user.company if hasattr(user, "company") else None
        if not company:
            return False
        
        if resource_type == "users":
            from accounts.models import CustomUser
            count = CustomUser.objects.filter(company=company, is_active=True).count()
        elif resource_type == "programs":
            from programs.models import Program
            count = Program.objects.filter(company=company).count()
        elif resource_type == "projects":
            from projects.models import Project
            count = Project.objects.filter(company=company).count()
        else:
            return True
        
        return count < limit# ============================================
# ADD THIS TO: backend/accounts/models.py
# LOCATION: After the SubscriptionTier class
# ============================================

from django.utils import timezone
from datetime import timedelta

class UserSubscription(models.Model):
    """
    Tracks individual user subscriptions with billing cycles
    """
    TIER_CHOICES = [
        ('trial', 'Trial'),
        ('starter', 'Starter'),
        ('professional', 'Professional'),
        ('team', 'Team'),
        ('enterprise', 'Enterprise'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
        ('pending', 'Pending'),
    ]
    
    user = models.OneToOneField(
        'CustomUser',
        on_delete=models.CASCADE,
        related_name='subscription'
    )
    tier = models.CharField(max_length=20, choices=TIER_CHOICES, default='trial')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Billing
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    auto_renew = models.BooleanField(default=True)
    
    # Payment
    stripe_subscription_id = models.CharField(max_length=255, null=True, blank=True)
    stripe_customer_id = models.CharField(max_length=255, null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'user_subscriptions'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.get_tier_display()}"
    
    @property
    def days_remaining(self):
        """Calculate days remaining until subscription expires"""
        if not self.end_date:
            return None
        
        now = timezone.now()
        if now > self.end_date:
            return 0
        
        delta = self.end_date - now
        return delta.days
    
    @property
    def is_active(self):
        """Check if subscription is currently active"""
        if self.status != 'active':
            return False
        
        if not self.end_date:
            return True
        
        return timezone.now() <= self.end_date
    
    @property
    def is_trial(self):
        """Check if this is a trial subscription"""
        return self.tier == 'trial'
    
    def activate(self, duration_days=30):
        """Activate subscription with specified duration"""
        now = timezone.now()
        self.start_date = now
        self.end_date = now + timedelta(days=duration_days)
        self.status = 'active'
        self.save()
    
    def cancel(self):
        """Cancel subscription"""
        self.status = 'cancelled'
        self.auto_renew = False
        self.save()
    
    def expire(self):
        """Mark subscription as expired"""
        self.status = 'expired'
        self.save()
    
    def upgrade(self, new_tier):
        """Upgrade to a new tier"""
        self.tier = new_tier
        self.save()
    
    def get_features(self):
        """Get features for this subscription tier"""
        return SubscriptionTier.TIER_FEATURES.get(self.tier, {})
    
    def get_limits(self):
        """Get resource limits for this subscription tier"""
        features = self.get_features()
        return {
            'max_users': features.get('max_users', 1),
            'max_programs': features.get('max_programs', 0),
            'max_projects': features.get('max_projects', 1),
        }


# ============================================
# ALSO UPDATE CustomUser model to handle subscription
# ADD this method to CustomUser class:
# ============================================

def get_subscription_tier(self):
    """Get user's subscription tier"""
    if hasattr(self, 'subscription') and self.subscription:
        return self.subscription.tier
    
    # Fallback to trial logic
    if self.is_trial_approved and self.trial_start_date:
        trial_end = self.trial_start_date + timedelta(days=14)
        if timezone.now() <= trial_end:
            return 'trial'
    
    return 'trial'  # Default to trial

def get_subscription_status(self):
    """Get user's subscription status"""
    if hasattr(self, 'subscription') and self.subscription:
        return self.subscription.status
    return 'pending'
from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid
from datetime import timedelta


class TeamInvitation(models.Model):
    """
    Team/Project invitation model
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
        ('expired', 'Expired'),
    ]
    
    ROLE_CHOICES = [
        ('guest', 'Guest'),
        ('pm', 'Project Manager'),
        ('program_manager', 'Program Manager'),
        ('admin', 'Admin'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Who is being invited
    email = models.EmailField()
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='guest')
    
    # Who sent the invitation
    invited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_invitations'
    )
    
    # What they're invited to
    project = models.ForeignKey(
        'projects.Project',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='invitations'
    )
    
    program = models.ForeignKey(
        'programs.Program',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='invitations'
    )
    
    # Invitation details
    token = models.CharField(max_length=255, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    message = models.TextField(blank=True, help_text="Personal message from inviter")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    accepted_at = models.DateTimeField(null=True, blank=True)
    
    # Accepted user
    accepted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='accepted_invitations'
    )
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"Invitation for {self.email} to {self.project or self.program}"
    
    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(days=7)
        super().save(*args, **kwargs)
    
    @property
    def is_expired(self):
        return timezone.now() > self.expires_at

    @property
    def can_be_accepted(self):
        return self.status == 'pending' and not self.is_expired


# Re-export biometric model so Django auto-discovers it for migrations.
from .models_biometric import BiometricCredential  # noqa: E402,F401
