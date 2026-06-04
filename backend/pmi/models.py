from django.db import models
from django.conf import settings
import uuid


class PMIComponent(models.Model):
    """Program component (project or subsidiary program) within a PMI program"""

    COMPONENT_TYPE_CHOICES = [
        ('project', 'Project'),
        ('subsidiary_program', 'Subsidiary Program'),
        ('operational_activity', 'Operational Activity'),
    ]

    STATUS_CHOICES = [
        ('proposed', 'Proposed'),
        ('approved', 'Approved'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    program = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='pmi_components')
    name = models.CharField(max_length=200)
    type = models.CharField(max_length=30, choices=COMPONENT_TYPE_CHOICES, default='project')
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='proposed')
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    budget = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    manager = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    depends_on = models.ManyToManyField('self', symmetrical=False, blank=True, related_name='dependents')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'PMI Component'

    def __str__(self):
        return f"{self.name} ({self.get_type_display()}) - {self.program.name}"


class PMIGovernanceBoard(models.Model):
    """Program governance board meetings for PMI"""

    MEETING_TYPE_CHOICES = [
        ('steering_committee', 'Steering Committee'),
        ('program_board', 'Program Board'),
        ('review_meeting', 'Review Meeting'),
        ('gate_review', 'Gate Review'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    program = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='pmi_governance_boards')
    meeting_type = models.CharField(max_length=30, choices=MEETING_TYPE_CHOICES)
    meeting_date = models.DateField()
    attendees = models.JSONField(default=list)
    agenda = models.TextField(blank=True)
    decisions = models.JSONField(default=list)
    action_items = models.JSONField(default=list, blank=True)
    minutes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-meeting_date']
        verbose_name = 'PMI Governance Board'

    def __str__(self):
        return f"{self.get_meeting_type_display()} - {self.meeting_date} - {self.program.name}"


class PMIGateDecision(models.Model):
    """A recorded governance gate decision over a component.

    PMI components only change status through a recorded gate decision (the
    governance board authorizes / continues / holds / stops a component). The
    component's status field is read-only on the API; this decision is the only
    sanctioned mutation path. Mirrors the P0-1 governance Decision pattern.
    """

    OUTCOME_CHOICES = [
        ('authorize', 'Authorize'),
        ('continue', 'Continue'),
        ('hold', 'Hold'),
        ('stop', 'Stop'),
    ]
    # How each outcome maps onto the component status it sets. `hold` deliberately
    # leaves status unchanged (a pause, not a state transition).
    OUTCOME_TO_STATUS = {
        'authorize': 'approved',
        'continue': 'active',
        'stop': 'cancelled',
    }

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    component = models.ForeignKey(PMIComponent, on_delete=models.CASCADE, related_name='gate_decisions')
    board = models.ForeignKey(PMIGovernanceBoard, on_delete=models.SET_NULL, null=True, blank=True, related_name='gate_decisions')
    outcome = models.CharField(max_length=12, choices=OUTCOME_CHOICES)
    gate = models.CharField(max_length=100, blank=True, help_text="Lifecycle gate / phase this decision applies at.")
    rationale = models.TextField(blank=True)
    decided_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='pmi_gate_decisions')
    previous_status = models.CharField(max_length=20, blank=True)
    new_status = models.CharField(max_length=20, blank=True)
    decided_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-decided_at']
        verbose_name = 'PMI Gate Decision'

    def __str__(self):
        return f"{self.get_outcome_display()} {self.component.name} @ {self.gate or 'gate'}"


class PMIProgramCharter(models.Model):
    """The program charter — mandate, vision, objectives and success criteria."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    program = models.OneToOneField('projects.Project', on_delete=models.CASCADE, related_name='pmi_charter')
    vision = models.TextField(blank=True)
    objectives = models.TextField(blank=True)
    scope = models.TextField(blank=True)
    success_criteria = models.TextField(blank=True)
    sponsor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='pmi_sponsored_charters')
    approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'PMI Program Charter'

    def __str__(self):
        return f"Charter - {self.program.name}"


class PMIBenefit(models.Model):
    """Program benefit, tracked across the PMI benefit life-cycle."""

    STATUS_CHOICES = [
        ('identified', 'Identified'),
        ('analyzed', 'Analyzed'),
        ('planned', 'Planned'),
        ('realizing', 'Realizing'),
        ('realized', 'Realized'),
        ('sustained', 'Sustained'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    program = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='pmi_benefits')
    component = models.ForeignKey(PMIComponent, on_delete=models.SET_NULL, null=True, blank=True, related_name='benefits',
                                  help_text="The component that delivers this benefit.")
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='identified')
    target_value = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    realized_value = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='pmi_owned_benefits')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'PMI Benefit'

    def __str__(self):
        return f"{self.name} ({self.get_status_display()}) - {self.program.name}"


class PMIStakeholder(models.Model):
    """A program stakeholder placed on the power/interest grid."""

    LEVEL_CHOICES = [('low', 'Low'), ('high', 'High')]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    program = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='pmi_stakeholders')
    name = models.CharField(max_length=200)
    role = models.CharField(max_length=200, blank=True)
    power = models.CharField(max_length=10, choices=LEVEL_CHOICES, default='low')
    interest = models.CharField(max_length=10, choices=LEVEL_CHOICES, default='low')
    engagement_strategy = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'PMI Stakeholder'

    def __str__(self):
        return f"{self.name} (P:{self.power}/I:{self.interest})"

    @property
    def quadrant(self):
        """Power/interest grid strategy."""
        if self.power == 'high' and self.interest == 'high':
            return 'manage_closely'
        if self.power == 'high':
            return 'keep_satisfied'
        if self.interest == 'high':
            return 'keep_informed'
        return 'monitor'


class PMIRoadmapItem(models.Model):
    """A life-cycle phase / milestone on the program roadmap."""

    STATUS_CHOICES = [
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('complete', 'Complete'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    program = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='pmi_roadmap_items')
    name = models.CharField(max_length=200)
    phase = models.CharField(max_length=100, blank=True, help_text="Life-cycle phase label.")
    sequence = models.PositiveIntegerField(default=1)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['sequence', 'start_date']
        verbose_name = 'PMI Roadmap Item'

    def __str__(self):
        return f"{self.sequence}. {self.name} - {self.program.name}"
