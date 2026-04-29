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
    target_start_date = models.DateField(null=True, blank=True)
    target_end_date = models.DateField(null=True, blank=True)
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


class LSSGreenTask(models.Model):
    """Per-phase task with assignee + planning dates for LSS Green Belt."""

    STATUS_CHOICES = [
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('blocked', 'Blocked'),
        ('done', 'Done'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='lss_green_tasks')
    phase = models.ForeignKey(DMAICPhase, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='lss_green_assigned_tasks'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    start_date = models.DateField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    order = models.PositiveIntegerField(default=0)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='lss_green_created_tasks'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'created_at']
        verbose_name = 'LSS Green Task'
        verbose_name_plural = 'LSS Green Tasks'

    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"


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
