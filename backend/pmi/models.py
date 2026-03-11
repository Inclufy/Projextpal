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
