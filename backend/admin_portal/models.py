# ============================================================
# ADMIN PORTAL - MODELS
# Additional models for audit logging and system settings
# ============================================================

from django.db import models
from django.conf import settings
import uuid


class AuditLog(models.Model):
    """
    Comprehensive audit logging for admin actions
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Who performed the action
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='audit_logs'
    )
    user_email = models.EmailField(help_text="Stored separately for historical record")
    
    # What action was performed
    ACTION_CHOICES = [
        # Auth
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('login_failed', 'Login Failed'),
        ('password_change', 'Password Changed'),
        ('password_reset', 'Password Reset'),
        
        # Users
        ('user_created', 'User Created'),
        ('user_updated', 'User Updated'),
        ('user_deleted', 'User Deleted'),
        ('user_invited', 'User Invited'),
        ('user_activated', 'User Activated'),
        ('user_suspended', 'User Suspended'),
        
        # Companies/Tenants
        ('company_created', 'Company Created'),
        ('company_updated', 'Company Updated'),
        ('company_deleted', 'Company Deleted'),
        
        # Subscriptions
        ('subscription_created', 'Subscription Created'),
        ('subscription_upgraded', 'Subscription Upgraded'),
        ('subscription_downgraded', 'Subscription Downgraded'),
        ('subscription_cancelled', 'Subscription Cancelled'),
        ('payment_success', 'Payment Successful'),
        ('payment_failed', 'Payment Failed'),
        
        # Projects/Programs
        ('project_created', 'Project Created'),
        ('project_updated', 'Project Updated'),
        ('project_deleted', 'Project Deleted'),
        ('program_created', 'Program Created'),
        ('program_updated', 'Program Updated'),
        ('program_deleted', 'Program Deleted'),
        
        # Settings
        ('settings_updated', 'Settings Updated'),
        ('api_key_created', 'API Key Created'),
        ('api_key_revoked', 'API Key Revoked'),
        
        # Admin
        ('admin_impersonate', 'Admin Impersonated User'),
        ('data_exported', 'Data Exported'),
        ('data_imported', 'Data Imported'),
    ]
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    
    # Category for filtering
    CATEGORY_CHOICES = [
        ('auth', 'Authentication'),
        ('user', 'User Management'),
        ('company', 'Company Management'),
        ('subscription', 'Subscription'),
        ('project', 'Project'),
        ('program', 'Program'),
        ('settings', 'Settings'),
        ('admin', 'Admin'),
        ('security', 'Security'),
    ]
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    
    # Severity level
    SEVERITY_CHOICES = [
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('error', 'Error'),
        ('critical', 'Critical'),
    ]
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES, default='info')
    
    # Details
    description = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)
    
    # Target resource
    resource_type = models.CharField(max_length=50, blank=True)
    resource_id = models.CharField(max_length=100, blank=True)
    
    # Company context
    company = models.ForeignKey(
        'accounts.Company',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs'
    )
    
    # Request context
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    # Timestamp
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['company', '-created_at']),
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['action', '-created_at']),
            models.Index(fields=['category', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.action} by {self.user_email} at {self.created_at}"


class SystemSetting(models.Model):
    """
    Global platform settings stored as key-value pairs
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Setting key (unique identifier)
    key = models.CharField(max_length=100, unique=True)
    
    # Value (JSON for flexibility)
    value = models.JSONField()
    
    # Metadata
    CATEGORY_CHOICES = [
        ('general', 'General'),
        ('security', 'Security'),
        ('email', 'Email'),
        ('integrations', 'Integrations'),
        ('billing', 'Billing'),
        ('features', 'Features'),
        ('maintenance', 'Maintenance'),
    ]
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    
    description = models.TextField(blank=True)
    is_sensitive = models.BooleanField(default=False, help_text="Hide value in API responses")
    
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    class Meta:
        ordering = ['category', 'key']
    
    def __str__(self):
        return f"{self.key} ({self.category})"


class ClientApiKey(models.Model):
    """
    Per-client (company) API keys for external AI services (OpenAI, Anthropic)
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    company = models.ForeignKey(
        'accounts.Company',
        on_delete=models.CASCADE,
        related_name='ai_api_keys'
    )

    PROVIDER_CHOICES = [
        ('openai', 'OpenAI'),
        ('anthropic', 'Anthropic'),
    ]
    provider = models.CharField(max_length=20, choices=PROVIDER_CHOICES)

    api_key = models.CharField(max_length=500)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    class Meta:
        ordering = ['company', 'provider']
        unique_together = ['company', 'provider']

    def __str__(self):
        return f"{self.company.name} - {self.get_provider_display()}"

    @property
    def masked_key(self):
        if len(self.api_key) > 8:
            return self.api_key[:4] + '****' + self.api_key[-4:]
        return '********'


class CloudProviderConfig(models.Model):
    """
    Cloud provider configuration for storage, email, database, and CDN services.
    One entry per provider (AWS, Azure, GCP, DigitalOcean).
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    PROVIDER_CHOICES = [
        ('aws', 'Amazon Web Services'),
        ('azure', 'Microsoft Azure'),
        ('gcp', 'Google Cloud Platform'),
        ('digitalocean', 'DigitalOcean'),
    ]
    provider = models.CharField(max_length=20, choices=PROVIDER_CHOICES, unique=True)

    is_active = models.BooleanField(default=False, help_text="Enable this cloud provider")

    # Storage config (S3, Azure Blob, GCS, Spaces)
    storage_enabled = models.BooleanField(default=False)
    storage_config = models.JSONField(default=dict, blank=True)

    # Email service config (SES, SendGrid, etc.)
    email_enabled = models.BooleanField(default=False)
    email_config = models.JSONField(default=dict, blank=True)

    # Database config (RDS, Azure SQL, Cloud SQL)
    database_enabled = models.BooleanField(default=False)
    database_config = models.JSONField(default=dict, blank=True)

    # CDN config (CloudFront, Azure CDN, Cloud CDN)
    cdn_enabled = models.BooleanField(default=False)
    cdn_config = models.JSONField(default=dict, blank=True)

    # Credentials (stored encrypted in production)
    credentials = models.JSONField(
        default=dict, blank=True,
        help_text="Provider credentials (access keys, secrets, service account JSON)"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    class Meta:
        ordering = ['provider']
        verbose_name = 'Cloud Provider Configuration'
        verbose_name_plural = 'Cloud Provider Configurations'

    def __str__(self):
        status = "Active" if self.is_active else "Inactive"
        return f"{self.get_provider_display()} ({status})"

    @property
    def masked_credentials(self):
        """Return credentials with sensitive values masked."""
        masked = {}
        for key, value in self.credentials.items():
            if isinstance(value, str) and len(value) > 8:
                masked[key] = value[:4] + '****' + value[-4:]
            elif isinstance(value, str):
                masked[key] = '********'
            else:
                masked[key] = value
        return masked

    @property
    def active_services(self):
        """List of enabled services for this provider."""
        services = []
        if self.storage_enabled:
            services.append('storage')
        if self.email_enabled:
            services.append('email')
        if self.database_enabled:
            services.append('database')
        if self.cdn_enabled:
            services.append('cdn')
        return services


# Default system settings to initialize when none exist
DEFAULT_SYSTEM_SETTINGS = [
    {'key': 'site_name', 'value': 'ProjeXtPal', 'category': 'general', 'description': 'Platform name'},
    {'key': 'support_email', 'value': 'support@projextpal.com', 'category': 'general', 'description': 'Support contact email'},
    {'key': 'default_language', 'value': 'nl', 'category': 'general', 'description': 'Default platform language'},
    {'key': 'maintenance_mode', 'value': False, 'category': 'maintenance', 'description': 'Enable maintenance mode'},
    {'key': 'allow_registration', 'value': True, 'category': 'security', 'description': 'Allow new user registrations'},
    {'key': 'require_email_verification', 'value': True, 'category': 'security', 'description': 'Require email verification for new accounts'},
    {'key': 'max_upload_size_mb', 'value': 10, 'category': 'general', 'description': 'Maximum file upload size in MB'},
    {'key': 'session_timeout_minutes', 'value': 480, 'category': 'security', 'description': 'Session timeout in minutes'},
    {'key': 'default_trial_days', 'value': 14, 'category': 'billing', 'description': 'Default trial period in days'},
    {'key': 'smtp_host', 'value': '', 'category': 'email', 'description': 'SMTP server hostname'},
    {'key': 'smtp_port', 'value': 587, 'category': 'email', 'description': 'SMTP server port'},
    {'key': 'smtp_from_email', 'value': 'noreply@projextpal.com', 'category': 'email', 'description': 'Default sender email address'},
    {'key': 'enable_ai_features', 'value': True, 'category': 'features', 'description': 'Enable AI-powered features globally'},
    {'key': 'enable_academy', 'value': True, 'category': 'features', 'description': 'Enable Academy/Training module'},
]


def initialize_default_settings():
    """Create default system settings if none exist"""
    created = []
    for setting_data in DEFAULT_SYSTEM_SETTINGS:
        obj, was_created = SystemSetting.objects.get_or_create(
            key=setting_data['key'],
            defaults={
                'value': setting_data['value'],
                'category': setting_data['category'],
                'description': setting_data['description'],
            }
        )
        if was_created:
            created.append(setting_data['key'])
    return created


# ============================================================
# HELPER FUNCTION FOR AUDIT LOGGING
# ============================================================

def log_action(
    user,
    action: str,
    category: str,
    description: str,
    severity: str = 'info',
    resource_type: str = '',
    resource_id: str = '',
    company=None,
    metadata: dict = None,
    request=None
):
    """
    Helper function to create audit log entries
    
    Usage:
        from admin_portal.models import log_action
        
        log_action(
            user=request.user,
            action='user_created',
            category='user',
            description=f"Created user {new_user.email}",
            resource_type='user',
            resource_id=str(new_user.id),
            company=new_user.company,
            request=request
        )
    """
    ip_address = None
    user_agent = ''
    
    if request:
        # Get IP address
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip_address = x_forwarded_for.split(',')[0].strip()
        else:
            ip_address = request.META.get('REMOTE_ADDR')
        
        # Get user agent
        user_agent = request.META.get('HTTP_USER_AGENT', '')
    
    return AuditLog.objects.create(
        user=user,
        user_email=user.email if user else 'system',
        action=action,
        category=category,
        severity=severity,
        description=description,
        resource_type=resource_type,
        resource_id=str(resource_id) if resource_id else '',
        company=company,
        metadata=metadata or {},
        ip_address=ip_address,
        user_agent=user_agent
    )
