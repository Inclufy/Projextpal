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


class AutomationRule(models.Model):
    """A trigger → condition → action automation (IL-3).

    Unlike the static Webhook (which just stores a URL), a rule is *evaluated*:
    when an event of its `trigger` type fires, the engine tests the rule's
    `condition` against the event payload and, if it matches, dispatches the
    configured `action`. Every evaluation is recorded as an AutomationRun, so the
    automation is auditable rather than fire-and-forget.

    Condition shape (JSON):
        {"match": "all"|"any", "clauses": [
            {"field": "status", "op": "changed_to", "value": "done"}, ...]}
    Supported ops: eq, ne, gt, gte, lt, lte, in, contains, exists, changed_to.
    `changed_to` reads payload['changes'][field] == {'from':..,'to':value}.
    Field paths may be dotted (e.g. "item.status").

    Action config (JSON) is templated with `{{path}}` placeholders resolved from
    the payload before dispatch.
    """

    TRIGGER_CHOICES = [
        ('task.status_changed', 'Task status changed'),
        ('task.created', 'Task created'),
        ('backlog_item.status_changed', 'Backlog item status changed'),
        ('iteration.completed', 'Iteration completed'),
        ('risk.created', 'Risk created'),
        ('risk.exposure_changed', 'Risk exposure changed'),
        ('milestone.due', 'Milestone due'),
        ('phase.gate_requested', 'Phase gate requested'),
        ('custom', 'Custom event'),
    ]

    ACTION_CHOICES = [
        ('notify', 'Send notification'),
        ('field_update', 'Update a field'),
        ('webhook', 'Call a webhook'),
        ('gate_transition', 'Request a gate transition'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(
        'accounts.Company', on_delete=models.CASCADE, related_name='automation_rules',
    )
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    trigger = models.CharField(max_length=40, choices=TRIGGER_CHOICES)
    condition = models.JSONField(
        default=dict, blank=True,
        help_text='match (all/any) + clauses. Empty = always matches.',
    )
    action_type = models.CharField(max_length=30, choices=ACTION_CHOICES)
    action_config = models.JSONField(
        default=dict, blank=True,
        help_text='Action params (notify: recipients/message; webhook: url; '
                  'field_update: target/field/value; gate_transition: target/to).',
    )
    is_active = models.BooleanField(default=True)
    trigger_count = models.PositiveIntegerField(default=0)
    last_triggered_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='created_automation_rules',
    )

    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['tenant', 'trigger', 'is_active'])]

    def __str__(self):
        return f'{self.tenant.name} — {self.name} [{self.trigger}→{self.action_type}]'


class AutomationRun(models.Model):
    """Audit record of one rule evaluation against one event."""

    STATUS_CHOICES = [
        ('matched', 'Matched — action dispatched'),
        ('skipped', 'Skipped — condition not met'),
        ('failed', 'Failed — dispatch error'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    rule = models.ForeignKey(
        AutomationRule, on_delete=models.CASCADE, related_name='runs',
    )
    trigger = models.CharField(max_length=40)
    payload = models.JSONField(default=dict, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    action_type = models.CharField(max_length=30, blank=True)
    action_result = models.JSONField(
        default=dict, blank=True,
        help_text='Resolved action (templated config) + dispatch outcome.',
    )
    error = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['rule', 'status'])]

    def __str__(self):
        return f'{self.rule.name} · {self.status} · {self.created_at:%Y-%m-%d %H:%M}'
