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
