from django.db import models
from django.conf import settings
import uuid


class HybridGovernanceConfig(models.Model):
    """Governance configuration for hybrid programmes mixing multiple frameworks"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    programme = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='hybrid_governance_configs')
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
        return f"{self.primary_framework} + {', '.join(self.secondary_frameworks)} - {self.programme.name}"


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
    programme = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='hybrid_adaptations')
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
