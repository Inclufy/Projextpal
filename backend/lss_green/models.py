from django.db import models
from django.conf import settings
import uuid


class DMAICPhase(models.Model):
    """DMAIC phase for Lean Six Sigma Green Belt projects"""

    PHASE_CHOICES = [
        ('define', 'Define'),
        ('measure', 'Measure'),
        ('analyze', 'Analyze'),
        ('improve', 'Improve'),
        ('control', 'Control'),
    ]

    STATUS_CHOICES = [
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='lss_green_dmaic_phases')
    phase = models.CharField(max_length=20, choices=PHASE_CHOICES)
    objective = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')
    order = models.PositiveIntegerField(default=0)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'created_at']
        verbose_name = 'DMAIC Phase'
        verbose_name_plural = 'DMAIC Phases'

    def __str__(self):
        return f"{self.get_phase_display()} - {self.project.name}"


class LSSGreenMetric(models.Model):
    """Process capability and quality metrics for LSS Green Belt"""

    METRIC_TYPE_CHOICES = [
        ('process_capability', 'Process Capability'),
        ('defect_rate', 'Defect Rate'),
        ('cycle_time', 'Cycle Time'),
        ('throughput', 'Throughput'),
        ('yield_rate', 'Yield Rate'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='lss_green_metrics')
    metric_type = models.CharField(max_length=30, choices=METRIC_TYPE_CHOICES)
    cp = models.FloatField(null=True, blank=True, help_text="Process Capability Index")
    cpk = models.FloatField(null=True, blank=True, help_text="Process Capability Index (centered)")
    defects_per_million = models.FloatField(null=True, blank=True)
    sigma_level = models.FloatField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'LSS Green Metric'

    def __str__(self):
        return f"{self.get_metric_type_display()} - {self.project.name}"


class LSSGreenMeasurement(models.Model):
    """Baseline and target measurements for LSS Green Belt"""

    PHASE_CHOICES = [
        ('define', 'Define'),
        ('measure', 'Measure'),
        ('analyze', 'Analyze'),
        ('improve', 'Improve'),
        ('control', 'Control'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='lss_green_measurements')
    phase = models.CharField(max_length=20, choices=PHASE_CHOICES)
    metric = models.CharField(max_length=100)
    baseline_value = models.FloatField(null=True, blank=True)
    target_value = models.FloatField(null=True, blank=True)
    actual_value = models.FloatField(null=True, blank=True)
    unit = models.CharField(max_length=50, blank=True)
    measurement_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'LSS Green Measurement'

    def __str__(self):
        return f"{self.metric} ({self.phase}) - {self.project.name}"
