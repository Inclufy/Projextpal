# ============================================================
# INTEGRATIONS - Models
#
# Minimal scaffolding for admin panel surfaces. Real wire-up
# (Salesforce sync, Zapier triggers, webhook delivery, CRM
# token rotation) is a Phase 2+ concern.
# ============================================================

import uuid
from django.db import models
from django.conf import settings


class Integration(models.Model):
    """
    External system integration (Salesforce / HubSpot / Zapier-style).
    """

    INTEGRATION_TYPES = [
        ('salesforce', 'Salesforce'),
        ('hubspot', 'HubSpot'),
        ('zapier', 'Zapier'),
        ('slack', 'Slack'),
        ('teams', 'Microsoft Teams'),
        ('google', 'Google Workspace'),
        ('other', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(
        'accounts.Company',
        on_delete=models.CASCADE,
        related_name='integrations',
    )
    name = models.CharField(max_length=200)
    type = models.CharField(max_length=30, choices=INTEGRATION_TYPES)
    config = models.JSONField(
        default=dict, blank=True,
        help_text='Provider-specific configuration (URLs, IDs, scopes).'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='created_integrations',
    )

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['tenant', 'type']),
        ]

    def __str__(self):
        return f'{self.tenant.name} — {self.get_type_display()} ({self.name})'


class CrmKey(models.Model):
    """
    CRM API key — stored per-tenant. Lightweight wrapper to render
    the admin /admin/crm-keys/ surface. The legacy
    accounts.CrmApiKey row points at our internal CRM bridge; this
    one is for outbound CRM provider keys (Salesforce, HubSpot).
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(
        'accounts.Company',
        on_delete=models.CASCADE,
        related_name='outbound_crm_keys',
    )
    name = models.CharField(max_length=200)
    type = models.CharField(
        max_length=30,
        choices=[
            ('salesforce', 'Salesforce'),
            ('hubspot', 'HubSpot'),
            ('pipedrive', 'Pipedrive'),
            ('zoho', 'Zoho CRM'),
            ('other', 'Other'),
        ],
    )
    config = models.JSONField(
        default=dict, blank=True,
        help_text='Holds API key / OAuth token / refresh token.'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='created_crm_keys',
    )

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.tenant.name} — {self.name}'


class Webhook(models.Model):
    """
    Outbound webhook endpoint.
    """

    EVENT_CHOICES = [
        ('project.created', 'project.created'),
        ('project.updated', 'project.updated'),
        ('user.created', 'user.created'),
        ('subscription.changed', 'subscription.changed'),
        ('all', 'All events'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(
        'accounts.Company',
        on_delete=models.CASCADE,
        related_name='webhooks',
    )
    name = models.CharField(max_length=200)
    type = models.CharField(
        max_length=40, choices=EVENT_CHOICES, default='all',
        help_text='Event filter — which events trigger this webhook.',
    )
    config = models.JSONField(
        default=dict, blank=True,
        help_text='url, secret, headers, retry policy.',
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='created_webhooks',
    )

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.tenant.name} — {self.name}'
