from django.db import models
from django.conf import settings


class BiometricCredential(models.Model):
    """
    Stores WebAuthn/FIDO2 credentials for biometric login (Face ID, fingerprint).
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='biometric_credentials',
    )
    credential_id = models.TextField(
        unique=True,
        help_text="Base64url-encoded credential ID from WebAuthn"
    )
    public_key = models.TextField(
        help_text="JSON-serialized public key data from WebAuthn"
    )
    device_name = models.CharField(
        max_length=255,
        default='Biometric Device',
        help_text="User-friendly device name (e.g., 'iPhone Face ID')"
    )
    sign_count = models.IntegerField(
        default=0,
        help_text="Signature counter for replay protection"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_used_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'biometric_credentials'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['credential_id']),
        ]

    def __str__(self):
        return f"{self.device_name} - {self.user.email}"
