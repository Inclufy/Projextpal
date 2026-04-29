from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.conf import settings
import uuid


class HybridArtifact(models.Model):
    """Artifacts from different methodologies used in a hybrid project"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='hybrid_artifacts')
    name = models.CharField(max_length=200)
    source_methodology = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    content = models.JSONField(default=dict, blank=True)
    status = models.CharField(max_length=20, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Hybrid Artifact'

    def __str__(self):
        return f"{self.name} ({self.source_methodology})"


class HybridConfiguration(models.Model):
    """Configuration for how methodologies are combined in a hybrid project"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='hybrid_configs')
    primary_methodology = models.CharField(max_length=50)
    secondary_methodologies = models.JSONField(default=list)
    approach_description = models.TextField(blank=True)
    rationale = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Hybrid Configuration'

    def __str__(self):
        methodologies = ', '.join(str(m) for m in (self.secondary_methodologies or []))
        return f"{self.primary_methodology} + {methodologies} - {self.project.name}"


class PhaseMethodology(models.Model):
    """Mapping of methodology to project phase for hybrid projects"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='hybrid_phase_methodologies')
    phase = models.CharField(max_length=100)
    methodology = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    progress = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'created_at']
        verbose_name = 'Phase Methodology'
        verbose_name_plural = 'Phase Methodologies'

    def __str__(self):
        return f"{self.phase} -> {self.methodology}"


class HybridTask(models.Model):
    """Per-phase task with assignee + planning dates for Hybrid projects."""

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
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='hybrid_tasks')
    phase = models.ForeignKey(PhaseMethodology, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='hybrid_assigned_tasks'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    start_date = models.DateField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    order = models.PositiveIntegerField(default=0)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='hybrid_created_tasks'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'created_at']
        verbose_name = 'Hybrid Task'
        verbose_name_plural = 'Hybrid Tasks'

    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"
