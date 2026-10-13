from django.db import models
from django.conf import settings


class ProjectResourceAllocation(models.Model):
    """S7-08 — Per-user time-slot allocation on a project.

    ProjectTeam answers *who* is on the project; ProjectResourceAllocation
    answers *when* and *how much*. One row = one planned block of hours for
    one team-member in a date range. The Gantt view groups rows by
    ProjectTeam member and lays them along the time axis.

    Sprint 7 ships a read-only Gantt + a dialog-driven create/edit/delete.
    Drag/resize on the Gantt itself lands in Sprint 8.
    """

    project_team = models.ForeignKey(
        "projects.ProjectTeam",
        on_delete=models.CASCADE,
        related_name="allocations",
        help_text="The ProjectTeam row this allocation plans against.",
    )
    start_date = models.DateField()
    end_date = models.DateField()
    allocated_hours = models.DecimalField(
        max_digits=8, decimal_places=2,
        help_text="Hours planned across start_date..end_date (inclusive).",
    )
    note = models.CharField(max_length=255, blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_resource_allocations",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["start_date", "id"]
        constraints = [
            models.CheckConstraint(
                check=models.Q(end_date__gte=models.F("start_date")),
                name="resourceallocation_end_gte_start",
            ),
            models.CheckConstraint(
                check=models.Q(allocated_hours__gte=0),
                name="resourceallocation_hours_nonneg",
            ),
        ]
        indexes = [
            models.Index(fields=["project_team", "start_date"]),
            models.Index(fields=["start_date", "end_date"]),
        ]

    def __str__(self):
        return (
            f"{self.project_team} {self.start_date}→{self.end_date}: "
            f"{self.allocated_hours}h"
        )


class Stakeholder(models.Model):
    INFLUENCE_CHOICES = [
        ("Low", "Low"),
        ("Medium", "Medium"),
        ("High", "High"),
    ]

    GOVERNANCE_CHOICES = [
        ("Sponsor", "Sponsor"),
        ("Advisor", "Advisor"),
        ("Team Member", "Team Member"),
        ("Other", "Other"),
    ]

    company = models.ForeignKey(
        "accounts.Company", on_delete=models.CASCADE, related_name="stakeholders"
    )
    project = models.ForeignKey(
        "projects.Project", on_delete=models.CASCADE, related_name="stakeholders"
    )
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=255, blank=True)
    contact = models.EmailField(blank=True)
    influence = models.CharField(
        max_length=10, choices=INFLUENCE_CHOICES, default="Low"
    )
    governance_type = models.CharField(
        max_length=20, choices=GOVERNANCE_CHOICES, default="Sponsor"
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_stakeholders",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at", "id"]
        unique_together = ("project", "name", "contact")

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.name} ({self.role}) - {self.project.name}"


class Governance(models.Model):
    """Governance setup for projects including structure, impact analysis, and risk management."""

    project = models.OneToOneField(
        "projects.Project", on_delete=models.CASCADE, related_name="governance"
    )

    # Governance structure data (hierarchy levels and teams)
    structure_data = models.JSONField(default=list, blank=True)

    # Project impact analysis
    impact_data = models.JSONField(default=dict, blank=True)

    # Risk management data
    risks_data = models.JSONField(default=list, blank=True)

    # Additional governance fields
    meeting_cadence = models.CharField(max_length=255, blank=True)
    change_control_process = models.TextField(blank=True)
    decision_rights = models.JSONField(default=dict, blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_governance",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Governance - {self.project.name}"


class ChangeRequest(models.Model):
    """Change requests submitted through the governance process."""

    STATUS_CHOICES = [
        ("pending", "Pending Review"),
        ("under_review", "Under Review"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
        ("implemented", "Implemented"),
    ]

    PRIORITY_CHOICES = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
        ("urgent", "Urgent"),
    ]

    CHANGE_TYPE_CHOICES = [
        ("scope", "Scope Change"),
        ("timeline", "Timeline Change"),
        ("budget", "Budget Change"),
        ("resource", "Resource Change"),
        ("technical", "Technical Change"),
        ("other", "Other"),
    ]

    project = models.ForeignKey(
        "projects.Project", on_delete=models.CASCADE, related_name="change_requests"
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    change_type = models.CharField(max_length=20, choices=CHANGE_TYPE_CHOICES)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default="medium")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    # Impact assessment
    impact_description = models.TextField(blank=True)
    cost_impact = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    timeline_impact_days = models.IntegerField(null=True, blank=True)

    # Approval workflow
    approval_stage = models.ForeignKey(
        "projects.ApprovalStage",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="change_requests",
    )

    # Requestor information
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="change_requests",
    )
    requested_date = models.DateTimeField(auto_now_add=True)

    # Review information
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_change_requests",
    )
    reviewed_date = models.DateTimeField(null=True, blank=True)
    review_comments = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} - {self.project.name} ({self.status})"
