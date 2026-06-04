from django.db import models
from django.conf import settings
import uuid


class HybridGovernanceConfig(models.Model):
    """Governance configuration for hybrid programmes mixing multiple frameworks"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    programme = models.ForeignKey('programs.Program', on_delete=models.CASCADE, related_name='hybrid_governance_configs')
    primary_framework = models.CharField(max_length=50)
    secondary_frameworks = models.JSONField(default=list)
    rationale = models.TextField(blank=True)
    governance_structure = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Hybrid Governance Configuration'

    def __str__(self):
        frameworks = ', '.join(str(f) for f in (self.secondary_frameworks or []))
        return f"{self.primary_framework} + {frameworks} - {self.programme.name}"


class HybridAdaptation(models.Model):
    """Adaptive responses to changing conditions in a hybrid programme"""

    TRIGGER_CHOICES = [
        ('market_change', 'Market Change'),
        ('technology_shift', 'Technology Shift'),
        ('regulatory_change', 'Regulatory Change'),
        ('resource_change', 'Resource Change'),
        ('stakeholder_change', 'Stakeholder Change'),
        ('performance_issue', 'Performance Issue'),
    ]

    RESPONSE_CHOICES = [
        ('increase_agility', 'Increase Agility'),
        ('increase_control', 'Increase Control'),
        ('rebalance', 'Rebalance'),
        ('pivot', 'Pivot'),
        ('scale_up', 'Scale Up'),
        ('scale_down', 'Scale Down'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    programme = models.ForeignKey('programs.Program', on_delete=models.CASCADE, related_name='hybrid_adaptations')
    trigger = models.CharField(max_length=30, choices=TRIGGER_CHOICES)
    response = models.CharField(max_length=30, choices=RESPONSE_CHOICES)
    methodology_adjustment = models.TextField(blank=True)
    impact_assessment = models.TextField(blank=True)
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    effective_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Hybrid Adaptation'

    def __str__(self):
        return f"{self.get_trigger_display()} -> {self.get_response_display()}"


class ConstituentAuthorization(models.Model):
    """A constituent project inside a hybrid programme, authorized under the
    governance MODE its config assigns it (backlog #39).

    A hybrid programme blends frameworks: some constituents run predictive
    (stage-gated), some adaptive (cadence checkpoints), some a blend of both.
    The `governance_mode` is NOT decorative — it selects which gate the
    `authorize` action enforces, so two contrasting configs produce different
    authorization behaviour at runtime:

      predictive -> a stage-gate review must be PASSED before authorize
      adaptive   -> a cadence checkpoint must be logged within `cadence_days`
      blend      -> BOTH the stage-gate AND a current checkpoint

    `status` is mutated ONLY by the authorize action (read_only in the
    serializer), so a constituent can't be marked authorized by a raw PATCH.
    """

    GOVERNANCE_MODE_CHOICES = [
        ('predictive', 'Predictive (stage-gate)'),
        ('adaptive', 'Adaptive (cadence checkpoint)'),
        ('blend', 'Blended (gate + cadence)'),
    ]

    STATUS_CHOICES = [
        ('proposed', 'Proposed'),
        ('authorized', 'Authorized'),
        ('paused', 'Paused'),
        ('closed', 'Closed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    programme = models.ForeignKey('programs.Program', on_delete=models.CASCADE, related_name='constituent_authorizations')
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='hybrid_programme_authorizations')
    governance_mode = models.CharField(max_length=20, choices=GOVERNANCE_MODE_CHOICES, default='predictive')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='proposed')

    # Predictive precondition: a recorded stage-gate review pass.
    stage_gate_passed = models.BooleanField(default=False)
    stage_gate_notes = models.TextField(blank=True)
    # Adaptive precondition: the last cadence checkpoint and the cadence window.
    last_checkpoint_at = models.DateTimeField(null=True, blank=True)
    cadence_days = models.PositiveIntegerField(default=14)

    authorized_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='hybrid_programme_authorized',
    )
    authorized_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Constituent Authorization'

    def __str__(self):
        return f"{self.project_id} [{self.governance_mode}] -> {self.status}"

    def checkpoint_is_current(self):
        """True if a cadence checkpoint was logged within the cadence window."""
        if not self.last_checkpoint_at:
            return False
        from django.utils import timezone
        from datetime import timedelta
        return self.last_checkpoint_at >= timezone.now() - timedelta(days=self.cadence_days)
