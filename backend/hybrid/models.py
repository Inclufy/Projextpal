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
        return f"{self.primary_methodology} + {', '.join(self.secondary_methodologies)} - {self.project.name}"


class PhaseMethodology(models.Model):
    """Mapping of methodology to project phase for hybrid projects"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='hybrid_phase_methodologies')
    phase = models.CharField(max_length=100)
    methodology = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'created_at']
        verbose_name = 'Phase Methodology'
        verbose_name_plural = 'Phase Methodologies'

    def __str__(self):
        return f"{self.phase} -> {self.methodology}"
