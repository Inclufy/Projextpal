from django.db import models
from django.conf import settings
import uuid


class P2Blueprint(models.Model):
    """Programme blueprint for PRINCE2 Programme management"""

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('approved', 'Approved'),
        ('active', 'Active'),
        ('superseded', 'Superseded'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    programme = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='p2_blueprints')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    version = models.CharField(max_length=20, default='1.0')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    target_operating_model = models.TextField(blank=True)
    capabilities = models.JSONField(default=list, blank=True)
    outcomes = models.JSONField(default=list, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-version', '-created_at']
        verbose_name = 'P2 Blueprint'

    def __str__(self):
        return f"{self.name} v{self.version} - {self.programme.name}"


class P2ProgrammeProject(models.Model):
    """Projects within a PRINCE2 Programme"""

    METHODOLOGY_CHOICES = [
        ('prince2', 'PRINCE2'),
        ('agile', 'Agile'),
        ('waterfall', 'Waterfall'),
        ('hybrid', 'Hybrid'),
    ]

    STATUS_CHOICES = [
        ('proposed', 'Proposed'),
        ('approved', 'Approved'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('closed', 'Closed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    programme = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='p2_projects')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    methodology = models.CharField(max_length=20, choices=METHODOLOGY_CHOICES, default='prince2')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='proposed')
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    budget = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    project_manager = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    blueprint = models.ForeignKey(P2Blueprint, on_delete=models.SET_NULL, null=True, blank=True, related_name='projects')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['start_date', 'name']
        verbose_name = 'P2 Programme Project'

    def __str__(self):
        return f"{self.name} - {self.programme.name}"
