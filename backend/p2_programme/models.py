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
    programme = models.ForeignKey('programs.Program', on_delete=models.CASCADE, related_name='p2_blueprints')
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
    programme = models.ForeignKey('programs.Program', on_delete=models.CASCADE, related_name='p2_projects')
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


class P2ProgrammeBoardDecision(models.Model):
    """A programme-board decision that authorizes / starts / stops a constituent project.

    A constituent project's status changes ONLY through a recorded board decision —
    the status field is read-only on the API. `authorize` additionally requires the
    project to reference a Blueprint (the operating model it contributes to), so a
    project cannot be authorized outside the programme's target operating model.
    Mirrors the PMI gate-decision pattern (#36) and the P0-1 governance Decision.
    """

    DECISION_CHOICES = [
        ('authorize', 'Authorize'),
        ('start', 'Start'),
        ('stop', 'Stop'),
        ('defer', 'Defer'),
    ]
    # How each decision maps onto the constituent-project status it sets.
    # `defer` deliberately leaves status unchanged.
    DECISION_TO_STATUS = {
        'authorize': 'approved',
        'start': 'active',
        'stop': 'closed',
    }

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    programme = models.ForeignKey('programs.Program', on_delete=models.CASCADE, related_name='p2_board_decisions')
    project = models.ForeignKey(P2ProgrammeProject, on_delete=models.CASCADE, related_name='board_decisions')
    decision = models.CharField(max_length=12, choices=DECISION_CHOICES)
    gate = models.CharField(max_length=100, blank=True, help_text="Programme gate / tranche this decision applies at.")
    rationale = models.TextField(blank=True)
    decided_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='p2_board_decisions')
    previous_status = models.CharField(max_length=20, blank=True)
    new_status = models.CharField(max_length=20, blank=True)
    decided_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-decided_at']
        verbose_name = 'P2 Programme Board Decision'

    def __str__(self):
        return f"{self.get_decision_display()} {self.project.name}"
