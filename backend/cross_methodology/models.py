from django.db import models
from django.conf import settings
import uuid


class MethodologyComparison(models.Model):
    """Cross-methodology comparison records"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey('accounts.Company', on_delete=models.CASCADE, related_name='methodology_comparisons', null=True, blank=True)
    name = models.CharField(max_length=200)
    methodologies = models.JSONField(default=list, help_text="List of methodologies being compared")
    criteria = models.JSONField(default=list, help_text="Comparison criteria")
    results = models.JSONField(default=dict, blank=True)
    recommendation = models.TextField(blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Methodology Comparison'

    def __str__(self):
        return f"{self.name} ({', '.join(self.methodologies)})"


class MethodologyMetrics(models.Model):
    """Aggregated metrics across all methodologies for analytics"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey('accounts.Company', on_delete=models.CASCADE, related_name='methodology_metrics', null=True, blank=True)
    methodology = models.CharField(max_length=50)
    period = models.CharField(max_length=20, help_text="e.g., 2026-Q1, 2026-02")
    project_count = models.IntegerField(default=0)
    completed_count = models.IntegerField(default=0)
    on_time_percentage = models.FloatField(null=True, blank=True)
    on_budget_percentage = models.FloatField(null=True, blank=True)
    average_duration_days = models.FloatField(null=True, blank=True)
    team_satisfaction = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-period', 'methodology']
        verbose_name = 'Methodology Metrics'
        verbose_name_plural = 'Methodology Metrics'
        unique_together = ['company', 'methodology', 'period']

    def __str__(self):
        return f"{self.methodology} - {self.period}"
