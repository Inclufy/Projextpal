from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
import uuid


class Company(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_subscribed = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        self.name = self.name.lower()
        super().save(*args, **kwargs)


class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)

    # ✅ ADD THIS (not the path() line!)
    profile_image = models.ImageField(
        upload_to='profile_images/', 
        null=True, 
        blank=True
    )

    company = models.ForeignKey(
        Company, on_delete=models.CASCADE, null=True, blank=True
    )
    ROLE_CHOICES = [
        ("superadmin", "Super Admin"),
        ("admin", "Administrator"),
        ("pm", "Project Manager"),
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
