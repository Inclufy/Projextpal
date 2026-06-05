from django.db import models
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone


class Project(models.Model):
    PROJECT_TYPE_CHOICES = [
        ("software", "Software"),
        ("design", "Design"),
        ("research", "Research"),
        ("other", "Other"),
    ]

    METHODOLOGY_CHOICES = [
        ("inclufy", "Inclufy Best Practice"),
        ("prince2", "PRINCE2"),
        ("agile", "Agile"),
        ("scrum", "Scrum"),
        ("kanban", "Kanban"),
        ("waterfall", "Waterfall"),
        ("lean_six_sigma_green", "Lean Six Sigma (Green Belt)"),
        ("lean_six_sigma_black", "Lean Six Sigma (Black Belt)"),
        ("program", "Program Management"),
        ("hybrid", "Hybrid"),
    ]
    OLD_METHODOLOGY_CHOICES = [
        ("prince2", "PRINCE2"),
        ("agile", "Agile"),
        ("scrum", "Scrum"),
        ("kanban", "Kanban"),
        ("waterfall", "Waterfall"),
        ("lean_six_sigma_green", "Lean Six Sigma (Green Belt)"),
        ("lean_six_sigma_black", "Lean Six Sigma (Black Belt)"),
        ("program", "Program Management"),
        ("hybrid", "Hybrid"),
    ]
    OLD_METHODOLOGY_CHOICES = [
        ("prince2", "PRINCE2"),
        ("agile", "Agile"),
        ("scrum", "Scrum"),
        ("kanban", "Kanban"),
        ("waterfall", "Waterfall"),
        ("lean_six_sigma_green", "Lean Six Sigma (Green Belt)"),
        ("lean_six_sigma_black", "Lean Six Sigma (Black Belt)"),
        ("program", "Program Management"),
        ("hybrid", "Hybrid"),
    ]
    OLD_METHODOLOGY_CHOICES = [
        ("Scrum", "Scrum"),
        ("Agile", "Agile"),
        ("Waterfall", "Waterfall"),
        ("Kanban", "Kanban"),
    ]

    STATUS_CHOICES = [
        ("planning", "Planning"),
        ("pending", "Pending"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("on_hold", "On Hold"),
        ("cancelled", "Cancelled"),
    ]

    CURRENCY_CHOICES = [
        ("EUR", "Euro"),
        ("USD", "US Dollar"),
        ("GBP", "British Pound"),
        ("AED", "UAE Dirham"),
        ("SAR", "Saudi Riyal"),
        ("MAD", "Moroccan Dirham"),
    ]

    company = models.ForeignKey(
        "accounts.Company", on_delete=models.CASCADE, related_name="projects"
    )
    portfolio = models.ForeignKey(
        "governance.Portfolio", on_delete=models.SET_NULL, null=True, blank=True, related_name="projects"
    )
    program = models.ForeignKey(
        "programs.Program", on_delete=models.SET_NULL, null=True, blank=True, related_name="linked_projects"
    )
    name = models.CharField(max_length=255)
    project_code = models.CharField(
        max_length=64, blank=True, db_index=True,
        help_text="Code used by finance/admin systems for invoice matching (e.g. 'P-2026-001').",
    )
    project_type = models.CharField(
        max_length=50, choices=PROJECT_TYPE_CHOICES, null=True, blank=True
    )
    methodology = models.CharField(
        max_length=50, choices=METHODOLOGY_CHOICES, null=True, blank=True
    )
    budget = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default="EUR")
    start_date = models.DateField(null=True, blank=True)
    target_implementation_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True)
    project_goal = models.TextField(blank=True)
    scope_in = models.TextField(blank=True, default="")
    scope_out = models.TextField(blank=True, default="")
    # Yanmar Project Plan template — "Impact / Solution" pair for problem-
    # statement-driven projects + ROI tracking.
    problem_impact = models.TextField(
        blank=True, default="",
        help_text="Impact of NOT changing or resolving the problem.",
    )
    proposed_solution = models.TextField(
        blank=True, default="",
        help_text="Proposed solution to resolve the problem.",
    )
    roi_target_pct = models.DecimalField(
        max_digits=6, decimal_places=2, null=True, blank=True,
        help_text="Expected return on investment (percentage, e.g. 12.5).",
    )
    roi_realized_pct = models.DecimalField(
        max_digits=6, decimal_places=2, null=True, blank=True,
        help_text="Measured ROI post go-live.",
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_projects",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Health metrics (colors for dashboard display)
    health_scope = models.CharField(max_length=7, default='#808080', blank=True)  # Gray default
    health_time = models.CharField(max_length=7, default='#808080', blank=True)
    health_cost = models.CharField(max_length=7, default='#808080', blank=True)
    health_cash_flow = models.CharField(max_length=7, default='#808080', blank=True)
    health_safety = models.CharField(max_length=7, default='#808080', blank=True)
    health_risk = models.CharField(max_length=7, default='#808080', blank=True)
    health_quality = models.CharField(max_length=7, default='#808080', blank=True)
    last_analysis_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.company.name})"

    def compute_progress_from_work(self) -> int:
        from .models import Task, Milestone  # local import to avoid cycles

        # Prefer task-based progress if tasks exist
        task_qs = Task.objects.filter(milestone__project=self)
        task_count = task_qs.count()
        if task_count > 0:
            # Calculate progress for each task based on subtasks, then average
            total_progress = 0
            for task in task_qs:
                task_progress = task.compute_progress_from_subtasks()
                total_progress += task_progress

            avg = total_progress / task_count
            return int(round(avg))

        # Fallback to milestones if no tasks
        milestone_qs = Milestone.objects.filter(project=self)
        m_count = milestone_qs.count()
        if m_count > 0:
            completed = milestone_qs.filter(status="completed").count()
            return int(round((completed / m_count) * 100))

        # No tasks or milestones
        return 0

    # Stored progress is removed; progress is computed on the fly via serializer.


class Milestone(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("on_hold", "On Hold"),
    ]

    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="milestones"
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    order_index = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order_index", "id"]

    def __str__(self):
        return f"{self.name} - {self.project.name}"


class Task(models.Model):
    STATUS_CHOICES = [
        ("todo", "To Do"),
        ("in_progress", "In Progress"),
        ("done", "Done"),
        ("blocked", "Blocked"),
    ]

    PRIORITY_CHOICES = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
        ("urgent", "Urgent"),
    ]

    milestone = models.ForeignKey(
        Milestone, on_delete=models.CASCADE, related_name="tasks"
    )
    # PRINCE2 roll-up links (optional). A task can belong to a Work Package and
    # deliver a specific Product so the WP that authorises the work owns its
    # tasks, and a deliverable's progress can be derived from its tasks.
    # String app-refs avoid a circular import (prince2 already FKs projects).
    work_package = models.ForeignKey(
        "prince2.WorkPackage",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tasks",
    )
    product = models.ForeignKey(
        "prince2.Product",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tasks",
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    # Yanmar Action Tracker (PRJ LEGO) uses a free-text Category column to group
    # tasks for COUNTIFS sub-totals. Keep it free-text so customers can use their
    # own taxonomy (no enum lock-in).
    category = models.CharField(
        max_length=100, blank=True, default="", db_index=True,
        help_text="Optional grouping label used for sub-totals (Action Tracker style).",
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tasks",
    )
    start_date = models.DateField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    revised_due_date = models.DateField(null=True, blank=True)
    completed_on = models.DateField(null=True, blank=True)
    # Yanmar Project Plan rule: "Due dates can only be pushed back once for a
    # maximum of 2 weeks. More than this requires Project Owner approval."
    # `revision_count` counts how many times due_date was successfully pushed
    # back without approval. The validation is enforced in the serializer.
    revision_count = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="todo")
    priority = models.CharField(
        max_length=10, choices=PRIORITY_CHOICES, default="medium"
    )
    progress = models.PositiveIntegerField(default=0)
    order_index = models.PositiveIntegerField(default=0)
    # RACI fields
    raci_responsible = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tasks_responsible",
    )
    raci_accountable = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tasks_accountable",
    )
    raci_consulted = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        blank=True,
        related_name="tasks_consulted",
    )
    raci_informed = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        blank=True,
        related_name="tasks_informed",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order_index", "id"]

    def __str__(self):
        return f"{self.title} - {self.milestone.name}"

    @property
    def effective_due_date(self):
        """Revised due date if set, otherwise original due date."""
        return self.revised_due_date or self.due_date

    @property
    def delay_days(self):
        """Days delay between due_date and completion or revision.

        Positive = late, negative = early. Returns None if not enough info.
        """
        if not self.due_date:
            return None
        reference = self.completed_on or self.revised_due_date
        if not reference:
            return None
        return (reference - self.due_date).days

    def compute_progress_from_subtasks(self):
        """Calculate progress from subtasks, or fall back to task status.

        Project-level progress aggregates this per task. When a task has no
        subtasks we must not return 0 just because self.progress is unset —
        infer from status so a ``done`` task contributes 100% and an
        ``in_progress`` task contributes 50%.
        """
        subtasks = self.subtasks.all()
        if subtasks.exists():
            completed_count = subtasks.filter(completed=True).count()
            total_count = subtasks.count()
            return int(round((completed_count / total_count) * 100))

        if self.progress:
            return int(self.progress)
        status_to_pct = {"done": 100, "in_progress": 50, "blocked": 0, "todo": 0}
        return status_to_pct.get(self.status, 0)

    def update_progress_from_subtasks(self, save=True):
        """Update task progress based on subtask completion"""
        new_progress = self.compute_progress_from_subtasks()
        self.progress = new_progress

        # Update status based on progress
        if new_progress == 100:
            self.status = "done"
        elif new_progress > 0 and self.status == "todo":
            self.status = "in_progress"

        if save:
            self.save(update_fields=["progress", "status"])

        return new_progress


class TaskDueDateChangeRequest(models.Model):
    """
    Yanmar Project Plan rule enforcement.

    Yanmar's template states: "Due dates can only be pushed back once for a
    maximum period of 2 weeks. More than this should be discussed with and
    approved by project owner."

    When a user tries to make a 2nd push-back OR a push-back >14 days, the
    serializer creates one of these rows in "pending" state instead of
    silently mutating the task. The Project Owner approves or rejects;
    approval applies the requested date and increments revision_count.
    """

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]

    task = models.ForeignKey(
        Task, on_delete=models.CASCADE, related_name="due_date_change_requests"
    )
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name="requested_due_changes",
    )
    requested_date = models.DateField()
    previous_due_date = models.DateField(null=True, blank=True)
    delta_days = models.IntegerField(
        help_text="requested_date - previous_due_date (positive = push-back).",
    )
    reason = models.TextField(blank=True, default="")
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="pending"
    )
    decided_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name="decided_due_changes",
    )
    decided_at = models.DateTimeField(null=True, blank=True)
    decision_note = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["task", "status"]),
        ]

    def __str__(self):
        return f"DueDateChange<{self.task_id}> {self.previous_due_date}→{self.requested_date} [{self.status}]"


class Subtask(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="subtasks")
    title = models.CharField(max_length=255)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.title} ({'Completed' if self.completed else 'Pending'})"


class Expense(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("paid", "Paid"),
    ]

    CATEGORY_CHOICES = [
        ("Labor Cost", "Labor Cost"),
        ("Material Cost", "Material Cost"),
        ("Software", "Software"),
        ("Other", "Other"),
    ]

    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="expenses"
    )
    description = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    date = models.DateField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    # Optional links to finance app — string FKs to avoid circular imports.
    vendor = models.ForeignKey(
        "finance.Vendor",
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="expenses",
    )
    invoice = models.ForeignKey(
        "finance.Invoice",
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="expenses",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_expenses",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date", "-id"]

    def __str__(self):
        return f"{self.project.name}: {self.description} - {self.amount}"


class ProjectActivity(models.Model):
    """Auditable activity log for project-related actions to power Recent Activities UI."""

    ACTION_CHOICES = [
        ("created", "Created"),
        ("updated", "Updated"),
        ("deleted", "Deleted"),
        ("status_changed", "Status Changed"),
        ("commented", "Commented"),
    ]

    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="activities"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="project_activities",
    )
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    message = models.CharField(max_length=512)

    # Optional linkage to any object (Task, Milestone, Expense)
    target_content_type = models.ForeignKey(
        ContentType, on_delete=models.SET_NULL, null=True, blank=True
    )
    target_object_id = models.PositiveIntegerField(null=True, blank=True)
    target = GenericForeignKey("target_content_type", "target_object_id")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at", "-id"]

    def __str__(self):
        subject = self.message or self.get_action_display()
        return f"{self.project.name}: {subject}"


class ApprovalStage(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("in-review", "In Review"),
        ("approve", "Approved"),
        ("reject", "Rejected"),
    ]

    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="approval_stages"
    )
    name = models.CharField(max_length=100)
    value = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    order_index = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    # Approver snapshot fields
    approver_name = models.CharField(max_length=255, blank=True)
    approver_role = models.CharField(max_length=255, blank=True)
    approver_comments = models.TextField(blank=True)
    reviewed_at = models.DateField(null=True, blank=True)
    # Optional uploaded evidence
    # Generic upload stored in Upload model
    # Linked as foreign key for traceability
    evidence = models.ForeignKey(
        "projects.Upload",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approval_stages",
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_approval_stages",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order_index", "id"]

    def __str__(self):
        return f"{self.project.name} - {self.name} ({self.status})"


class Upload(models.Model):
    """Generic file upload to be reused across features."""

    file = models.FileField(upload_to="uploads/%Y/%m/%d/")
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="uploads",
    )
    company = models.ForeignKey(
        "accounts.Company",
        on_delete=models.CASCADE,
        related_name="uploads",
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at", "-id"]

    def __str__(self):
        return f"Upload {self.id}: {getattr(self.file, 'name', '')}"


class Risk(models.Model):
    """Risk management for projects."""

    CATEGORY_CHOICES = [
        ("Technical", "Technical"),
        ("Schedule", "Schedule"),
        ("Financial", "Financial"),
        ("Operational", "Operational"),
        ("Strategic", "Strategic"),
        ("Compliance", "Compliance"),
    ]

    IMPACT_CHOICES = [
        ("High", "High"),
        ("Medium", "Medium"),
        ("Low", "Low"),
    ]

    LEVEL_CHOICES = [
        ("High", "High"),
        ("Medium", "Medium"),
        ("Low", "Low"),
    ]

    STATUS_CHOICES = [
        ("Open", "Open"),
        ("Mitigated", "Mitigated"),
        ("Closed", "Closed"),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="risks")
    name = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    impact = models.CharField(max_length=20, choices=IMPACT_CHOICES)
    # Probability stored as percentage integer [0-100]
    probability = models.PositiveIntegerField(default=0)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Open")
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="owned_risks",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_risks",
    )
    # Optional supporting evidence (FMEA-doc, vendor letter, BCG matrix
    # screenshots, etc.). Reuses the existing generic Upload model.
    attachments = models.ManyToManyField(
        "projects.Upload",
        blank=True,
        related_name="+",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} - {self.project.name}"


class AIMitigation(models.Model):
    """AI-generated mitigation strategy for risks."""

    COST_CHOICES = [
        ("Low", "Low"),
        ("Medium", "Medium"),
        ("High", "High"),
    ]

    risk = models.OneToOneField(
        Risk, on_delete=models.CASCADE, related_name="ai_mitigation"
    )
    strategy = models.TextField()
    actions = models.JSONField(default=list)  # List of action items
    timeline = models.CharField(max_length=100)
    cost = models.CharField(max_length=20, choices=COST_CHOICES)
    effectiveness = models.CharField(max_length=50)  # e.g., "85%"
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"AI Mitigation for {self.risk.name}"


class ManualMitigation(models.Model):
    """Manual mitigation plan for risks."""

    COST_CHOICES = [
        ("Low", "Low"),
        ("Medium", "Medium"),
        ("High", "High"),
    ]

    risk = models.OneToOneField(
        Risk, on_delete=models.CASCADE, related_name="manual_mitigation"
    )
    strategy = models.TextField(blank=True)
    actions = models.JSONField(default=list)  # List of action items
    timeline = models.CharField(max_length=100, blank=True)
    cost = models.CharField(max_length=20, choices=COST_CHOICES, blank=True)
    effectiveness = models.PositiveIntegerField(
        default=0, help_text="Effectiveness percentage (0-100)"
    )
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_manual_mitigations",
    )
    # Mitigation supporting docs: vendor quotes, decision memos,
    # remediation runbooks, action-plan PDFs.
    attachments = models.ManyToManyField(
        "projects.Upload",
        blank=True,
        related_name="+",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Manual Mitigation for {self.risk.name}"


class ProjectTeam(models.Model):
    """Model to manage dedicated team members for each project"""

    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="team_members"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="project_teams"
    )
    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="added_team_members",
    )
    added_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    hourly_rate = models.DecimalField(
        max_digits=10, decimal_places=2, default=0,
        help_text="Hourly rate for this team member on this project"
    )

    class Meta:
        unique_together = ["project", "user"]
        ordering = ["-added_at"]

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.project.name} ({self.user.get_role_display()})"


class TimeEntry(models.Model):
    """Time tracking entries for project team members"""

    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("submitted", "Submitted"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]

    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="time_entries"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="time_entries",
    )
    task = models.ForeignKey(
        Task,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="time_entries",
        help_text="Optional: Link to a specific task"
    )
    milestone = models.ForeignKey(
        Milestone,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="time_entries",
        help_text="Optional: Link to a specific milestone"
    )
    date = models.DateField()
    hours = models.DecimalField(
        max_digits=5, decimal_places=2,
        help_text="Number of hours worked"
    )
    description = models.TextField(
        blank=True,
        help_text="Description of work performed"
    )
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="draft"
    )
    hourly_rate_snapshot = models.DecimalField(
        max_digits=10, decimal_places=2, default=0,
        help_text="Hourly rate at the time of entry (for historical accuracy)"
    )
    billable = models.BooleanField(
        default=True,
        help_text="Whether this time entry is billable"
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_time_entries",
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date", "-created_at"]
        indexes = [
            models.Index(fields=["project", "date"]),
            models.Index(fields=["user", "date"]),
            models.Index(fields=["project", "user", "date"]),
            models.Index(fields=["project", "status"]),
        ]

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.project.name} - {self.date} ({self.hours}h)"

    @property
    def labor_cost(self):
        """Calculate the labor cost for this entry"""
        return self.hours * self.hourly_rate_snapshot

    def save(self, *args, **kwargs):
        # Auto-populate hourly rate from ProjectTeam if not set
        if not self.hourly_rate_snapshot:
            try:
                team_member = ProjectTeam.objects.get(
                    project=self.project, user=self.user
                )
                self.hourly_rate_snapshot = team_member.hourly_rate
            except ProjectTeam.DoesNotExist:
                self.hourly_rate_snapshot = 0
        super().save(*args, **kwargs)


class ProjectEvent(models.Model):
    """Calendar events for projects"""

    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="events"
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    start_date = models.DateField()
    end_date = models.DateField()
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_events",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["start_date", "-created_at"]
        indexes = [
            models.Index(fields=["project", "start_date"]),
            models.Index(fields=["project", "end_date"]),
        ]

    def __str__(self):
        return (
            f"{self.title} - {self.project.name} ({self.start_date} to {self.end_date})"
        )


class Document(models.Model):
    """Project documents that can be linked to milestones and stages"""

    CATEGORY_CHOICES = [
        ("planning", "Planning"),
        ("requirements", "Requirements"),
        ("design", "Design"),
        ("development", "Development"),
        ("testing", "Testing"),
        ("deployment", "Deployment"),
        ("training", "Training"),
        ("general", "General"),
    ]

    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("in_review", "In Review"),
        ("approved", "Approved"),
        ("archived", "Archived"),
    ]

    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="documents"
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.CharField(
        max_length=50, choices=CATEGORY_CHOICES, default="general"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")

    # File upload using existing Upload model
    file = models.ForeignKey(Upload, on_delete=models.CASCADE, related_name="documents")

    # Links to milestones and stages
    linked_milestones = models.ManyToManyField(
        Milestone, blank=True, related_name="linked_documents"
    )
    linked_stages = models.JSONField(
        default=list, help_text="List of stage names this document is linked to"
    )

    # Metadata
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="owned_documents",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_documents",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["project", "category"]),
            models.Index(fields=["project", "status"]),
        ]

    def __str__(self):
        return f"{self.name} - {self.project.name}"

    @property
    def file_size(self):
        """Get human readable file size"""
        if self.file and self.file.file:
            size = self.file.file.size
            for unit in ["B", "KB", "MB", "GB"]:
                if size < 1024.0:
                    return f"{size:.1f} {unit}"
                size /= 1024.0
            return f"{size:.1f} TB"
        return "0 B"

    @property
    def file_type(self):
        """Get file extension"""
        if self.file and self.file.file:
            return self.file.file.name.split(".")[-1].upper()
        return ""


class TrainingMaterial(models.Model):
    """Training materials for projects"""

    AUDIENCE_CHOICES = [
        ("end_users", "End Users"),
        ("administrators", "Administrators"),
        ("developers", "Developers"),
        ("managers", "Managers"),
        ("all", "All"),
    ]

    FORMAT_CHOICES = [
        ("pdf", "PDF"),
        ("docx", "DOCX"),
        ("pptx", "PPTX"),
        ("mp4", "MP4"),
        ("mp3", "MP3"),
        ("other", "Other"),
    ]

    STATUS_CHOICES = [
        ("not_started", "Not Started"),
        ("draft", "Draft"),
        ("in_review", "In Review"),
        ("completed", "Completed"),
    ]

    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="training_materials"
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    audience = models.CharField(
        max_length=50, choices=AUDIENCE_CHOICES, default="end_users"
    )
    format_type = models.CharField(max_length=20, choices=FORMAT_CHOICES, default="pdf")
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="not_started"
    )

    # Optional file upload
    file = models.ForeignKey(
        Upload,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="training_materials",
    )

    # Metadata
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_training_materials",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["project", "audience"]),
            models.Index(fields=["project", "status"]),
        ]

    def __str__(self):
        return f"{self.name} - {self.project.name}"

    @property
    def file_size(self):
        """Get human readable file size"""
        if self.file and self.file.file:
            size = self.file.file.size
            for unit in ["B", "KB", "MB", "GB"]:
                if size < 1024.0:
                    return f"{size:.1f} {unit}"
                size /= 1024.0
            return f"{size:.1f} TB"
        return "0 B"
# ========================================
# ADD THESE TO THE END OF projects/models.py
# ========================================

class BudgetCategory(models.Model):
    """Budget categories for organizing project expenses"""
    name = models.CharField(max_length=100)
    company = models.ForeignKey(
        'accounts.Company',
        on_delete=models.CASCADE,
        related_name='budget_categories'
    )
    allocated = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    color = models.CharField(max_length=7, blank=True, null=True)
    icon = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Budget Categories'
        ordering = ['name']
        unique_together = ['name', 'company']

    def __str__(self):
        return f"{self.name} - {self.company.name}"

    @property
    def spent(self):
        """Total spent in this category, aggregated from related BudgetItems."""
        from django.db.models import Sum
        total = BudgetItem.objects.filter(category=self, type='expense').aggregate(
            total=Sum('amount')
        )['total']
        return total or 0

    @property
    def remaining(self):
        """Allocated minus spent. Returns 0 if negative (over budget)."""
        return (self.allocated or 0) - self.spent

    @property
    def spent(self):
        """Calculate total spent in this category"""
        return self.budget_items.filter(
            status='approved'
        ).aggregate(
            total=models.Sum('amount')
        )['total'] or 0

    @property
    def remaining(self):
        """Calculate remaining budget"""
        return float(self.allocated) - float(self.spent)


class BudgetItem(models.Model):
    """Enhanced budget items for projects (extends Expense model functionality)"""
    TYPE_CHOICES = [
        ('expense', 'Expense'),
        ('income', 'Income'),
        ('transfer', 'Transfer'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='budget_items'
    )
    category = models.ForeignKey(
        BudgetCategory,
        on_delete=models.SET_NULL,
        null=True,
        related_name='budget_items'
    )
    description = models.TextField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateField()
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='expense')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_budget_items'
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_budget_items'
    )
    
    receipt_url = models.URLField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    rejection_reason = models.TextField(blank=True, null=True)

    # Optional links to finance app — string FKs to avoid circular imports.
    vendor = models.ForeignKey(
        'finance.Vendor',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='budget_items',
    )
    invoice = models.ForeignKey(
        'finance.Invoice',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='budget_items',
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']
        verbose_name = 'Budget Item'
        verbose_name_plural = 'Budget Items'

    def __str__(self):
        return f"{self.description} - €{self.amount}"


class ProjectBudget(models.Model):
    """Overall budget tracking per project"""
    project = models.OneToOneField(
        Project,
        on_delete=models.CASCADE,
        related_name='project_budget'
    )
    total_budget = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    etc = models.DecimalField(
        max_digits=15, decimal_places=2, default=0,
        help_text="Estimate To Complete — forecasted remaining cost to finish the project.",
    )
    contingency = models.DecimalField(
        max_digits=15, decimal_places=2, default=0,
        help_text="Contingency reserve held outside the working budget.",
    )
    currency = models.CharField(max_length=3, default='EUR')
    period_start = models.DateField(null=True, blank=True)
    period_end = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Project Budget'
        verbose_name_plural = 'Project Budgets'

    def __str__(self):
        return f"Budget - {self.project.name}"

    @property
    def total_spent(self):
        """Calculate total spent from budget items"""
        return self.project.budget_items.filter(
            status='approved',
            type='expense'
        ).aggregate(
            total=models.Sum('amount')
        )['total'] or 0

    @property
    def total_remaining(self):
        """Calculate remaining budget"""
        return float(self.total_budget) - float(self.total_spent)

    @property
    def variance(self):
        """Budget variance per Yanmar Highlight Report: Budget - (Actuals + ETC)."""
        return float(self.total_budget) - (float(self.total_spent) + float(self.etc))


# ============================================================================
# Sprint 2 — Project Closing sign-off (Yanmar template requirement)
# ============================================================================
#
# Yanmar Project Plan template: "Senior manager should sign off every
# project to be considered as a 'finished project'." This model captures
# that formal sign-off independent of methodology, so PRINCE2 projects
# (with EndProjectReport) and non-PRINCE2 projects (with PostProject)
# share the same closure-attestation surface.

class ProjectSignOff(models.Model):
    """Senior-manager closing sign-off + signature for a project."""

    project = models.OneToOneField(
        "projects.Project",
        on_delete=models.CASCADE,
        related_name="sign_off",
    )
    signed_off_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="signed_off_projects",
    )
    signed_off_role = models.CharField(
        max_length=120, blank=True, default="",
        help_text="e.g. 'Senior Manager', 'Project Sponsor'.",
    )
    signed_off_at = models.DateTimeField(null=True, blank=True)
    signature_image = models.FileField(
        upload_to="signoffs/%Y/%m/", null=True, blank=True,
        help_text="PNG of the signature (drawn in-app or uploaded).",
    )
    sign_off_note = models.TextField(blank=True, default="")
    is_valid = models.BooleanField(
        default=True,
        help_text=(
            "Set to False to revoke a sign-off (e.g. on re-opening the "
            "project). History is preserved via updated_at."
        ),
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Project Sign-Off"
        verbose_name_plural = "Project Sign-Offs"

    def __str__(self):
        who = self.signed_off_by.email if self.signed_off_by_id else "—"
        return f"SignOff<{self.project_id}> by {who} at {self.signed_off_at}"


# ============================================================================
# Sprint 2 — Unified 6-role ProjectMembership (Yanmar Project Plan template)
# ============================================================================
#
# Yanmar's Project Plan template names 6 distinct roles. Today these live
# scattered across PRINCE2 ProjectBoardMember, ProjectTeam, and Stakeholder.
# ProjectMembership consolidates them under one canonical taxonomy.
# Existing models stay in place — exporters read ProjectMembership first
# and fall back to legacy data when no row exists for a role.

class ProjectMembership(models.Model):
    """One row per (project, user, Yanmar role)."""

    ROLE_CHOICES = [
        ("project_owner", "Project Owner"),
        ("project_manager", "Project Manager"),
        ("project_leader", "Project Leader"),
        ("facilitator", "Facilitator"),
        ("outside_eyes", "Outside Eyes"),
        ("stakeholder", "Stakeholder"),
        ("other", "Other"),
    ]

    project = models.ForeignKey(
        "projects.Project",
        on_delete=models.CASCADE,
        related_name="memberships",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="project_memberships",
    )
    role = models.CharField(max_length=30, choices=ROLE_CHOICES)
    responsibilities = models.TextField(blank=True, default="")
    is_primary = models.BooleanField(
        default=False,
        help_text="Mark the primary holder of this role (e.g. THE Project Manager).",
    )
    starts_on = models.DateField(null=True, blank=True)
    ends_on = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [("project", "user", "role")]
        ordering = ["project", "role", "id"]
        indexes = [
            models.Index(fields=["project", "role"]),
        ]

    def __str__(self):
        return f"{self.user} on {self.project} as {self.role}"


# ============================================================================
# Sprint 3 — CommunicationPlan + PlanEvent (Yanmar Project Plan §7)
# ============================================================================
#
# Yanmar's Project Plan template names four communication cadences:
#   - Kick-off meeting
#   - Onboarding of stakeholders meeting
#   - Regular update meetings (weekly / bi-weekly / monthly)
#   - Project completion meeting
#
# We model this as a CommunicationPlan per project with a list of
# PlanEvent rows. Each PlanEvent may link to a concrete Meeting once
# held (so AI Minutes generated for that Meeting roll back up here).

class CommunicationPlan(models.Model):
    """One per project — declares the planned communication cadence."""

    project = models.OneToOneField(
        "projects.Project",
        on_delete=models.CASCADE,
        related_name="communication_plan",
    )
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name="owned_communication_plans",
        help_text="Person responsible for keeping the plan up to date.",
    )
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Communication Plan"
        verbose_name_plural = "Communication Plans"

    def __str__(self):
        return f"CommunicationPlan<{self.project_id}>"


class PlanEvent(models.Model):
    """A scheduled or recurring communication event."""

    EVENT_TYPE_CHOICES = [
        ("kickoff",   "Kick-off"),
        ("onboarding", "Onboarding"),
        ("regular",   "Regular update"),
        ("gate",      "Stage / gate review"),
        ("closing",   "Project closing"),
        ("other",     "Other"),
    ]
    CADENCE_CHOICES = [
        ("once",      "Once"),
        ("weekly",    "Weekly"),
        ("biweekly",  "Bi-weekly"),
        ("monthly",   "Monthly"),
        ("quarterly", "Quarterly"),
    ]
    STATUS_CHOICES = [
        ("planned",   "Planned"),
        ("done",      "Done"),
        ("cancelled", "Cancelled"),
    ]

    plan = models.ForeignKey(
        CommunicationPlan,
        on_delete=models.CASCADE,
        related_name="events",
    )
    event_type = models.CharField(max_length=20, choices=EVENT_TYPE_CHOICES)
    cadence = models.CharField(
        max_length=20, choices=CADENCE_CHOICES, default="once",
    )
    name = models.CharField(max_length=200)
    audience = models.JSONField(
        default=list, blank=True,
        help_text="List of role names / stakeholder labels.",
    )
    scheduled_at = models.DateTimeField(null=True, blank=True)
    last_held_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, default="")
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="planned",
    )
    # Optional link to the actual Meeting once held (for one-time events
    # or the most recent occurrence of a recurring event).
    meeting = models.ForeignKey(
        "communication.Meeting",
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name="plan_events",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["event_type", "scheduled_at", "id"]
        indexes = [
            models.Index(fields=["plan", "event_type"]),
            models.Index(fields=["plan", "status"]),
        ]

    def __str__(self):
        return f"{self.event_type}/{self.cadence} {self.name}"
    

# ============================================================================
# RAID-Log completion: Assumption + Issue (Risk + Dependency already exist)
# ============================================================================
#
# PMBOK 7 / PRINCE2 7 best practice: every project tracks a RAID-log:
#   R - Risks         (already: projects.Risk)
#   A - Assumptions   (NEW: this model)
#   I - Issues        (NEW: this model)
#   D - Dependencies  (already: charater.Dependency)
#
# Without A and I a project team has no formal place to register "we are
# assuming the vendor delivers in week 6" or "production deploy is blocked
# by stalled DBA approval". Both are critical artifacts for steering-com
# governance.

class Assumption(models.Model):
    """RAID-log Assumption — a stated belief the project plan depends on."""

    VALIDATION_CHOICES = [
        ("Unvalidated", "Unvalidated"),
        ("Validated", "Validated"),
        ("Invalidated", "Invalidated"),
    ]
    IMPACT_CHOICES = [
        ("High", "High"),
        ("Medium", "Medium"),
        ("Low", "Low"),
    ]

    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="assumptions"
    )
    name = models.CharField(max_length=255)
    description = models.TextField()
    impact = models.CharField(max_length=20, choices=IMPACT_CHOICES, default="Medium")
    validation_status = models.CharField(
        max_length=20, choices=VALIDATION_CHOICES, default="Unvalidated"
    )
    validation_target_date = models.DateField(null=True, blank=True)
    validated_at = models.DateTimeField(null=True, blank=True)
    validated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="validated_assumptions",
    )
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="owned_assumptions",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_assumptions",
    )
    attachments = models.ManyToManyField(
        "projects.Upload", blank=True, related_name="+"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.validation_status})"


class Issue(models.Model):
    """RAID-log Issue — a problem that has materialised and needs action."""

    SEVERITY_CHOICES = [
        ("Blocker", "Blocker"),
        ("Critical", "Critical"),
        ("Major", "Major"),
        ("Minor", "Minor"),
    ]
    STATUS_CHOICES = [
        ("Open", "Open"),
        ("In Progress", "In Progress"),
        ("Resolved", "Resolved"),
        ("Closed", "Closed"),
    ]

    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="issues"
    )
    name = models.CharField(max_length=255)
    description = models.TextField()
    severity = models.CharField(
        max_length=20, choices=SEVERITY_CHOICES, default="Major"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Open")
    raised_date = models.DateField(default=timezone.now)
    target_resolution_date = models.DateField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolution = models.TextField(blank=True)
    # Optional escalation: link to another model (Risk that materialised, etc.)
    related_risk = models.ForeignKey(
        Risk,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="materialised_issues",
        help_text="If this issue is a risk that materialised, link the original Risk",
    )
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="owned_issues",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_issues",
    )
    attachments = models.ManyToManyField(
        "projects.Upload", blank=True, related_name="+"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-severity", "-created_at"]

    def __str__(self):
        return f"{self.name} ({self.severity}, {self.status})"


# ============================================================================
# Lessons Learned register — PMBOK / PRINCE2 / MSP requirement
# ============================================================================
#
# A formal register that captures what worked, what didn't, and what to do
# differently next time. Critical for organisational learning and gate
# reviews (PRINCE2 stage end, MSP tranche review, retrospectives).

class LessonLearned(models.Model):
    """Single lesson captured during or after a project."""

    CATEGORY_CHOICES = [
        ("Process", "Process"),
        ("Technical", "Technical"),
        ("Stakeholder", "Stakeholder"),
        ("Resource", "Resource"),
        ("Communication", "Communication"),
        ("Risk", "Risk"),
        ("Quality", "Quality"),
        ("Schedule", "Schedule"),
        ("Cost", "Cost"),
        ("Other", "Other"),
    ]
    SENTIMENT_CHOICES = [
        ("positive", "Positive (what worked)"),
        ("negative", "Negative (what didn't)"),
        ("neutral", "Neutral (observation)"),
    ]
    APPLICABILITY_CHOICES = [
        ("project", "This project only"),
        ("portfolio", "Portfolio-wide"),
        ("organisation", "Organisation-wide"),
    ]

    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="lessons_learned"
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    sentiment = models.CharField(
        max_length=20, choices=SENTIMENT_CHOICES, default="neutral"
    )
    recommended_action = models.TextField(
        blank=True,
        help_text="What to do (or not do) next time based on this lesson",
    )
    applicable_to = models.CharField(
        max_length=20, choices=APPLICABILITY_CHOICES, default="project"
    )
    captured_during_phase = models.CharField(
        max_length=100,
        blank=True,
        help_text="Methodology phase: e.g. 'Sprint 5 retro', 'Stage 2 closure', 'DMAIC Control'",
    )
    captured_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="captured_lessons",
    )
    attachments = models.ManyToManyField(
        "projects.Upload", blank=True, related_name="+"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} ({self.category}, {self.sentiment})"


# ============================================================================
# Definition of Done — Scrum/Agile/Hybrid requirement
# ============================================================================
#
# Scrum Guide 2020 calls DoD a "commitment" of the Increment. Without a
# formal DoD model the team has no consistent, queryable acceptance bar —
# only ad-hoc text in tickets. This model lets you scope DoD per project
# (org-wide default) or per scope (sprint/feature/epic) and reference it
# from increments / acceptance checks.

class DefinitionOfDone(models.Model):
    """Definition of Done criteria, optionally scoped to sprint/feature."""

    SCOPE_CHOICES = [
        ("project", "Project-wide"),
        ("sprint", "Sprint-specific"),
        ("feature", "Feature-specific"),
        ("epic", "Epic-specific"),
    ]

    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="definitions_of_done"
    )
    scope = models.CharField(max_length=20, choices=SCOPE_CHOICES, default="project")
    scope_reference = models.CharField(
        max_length=255,
        blank=True,
        help_text="Free-form ID/name of the sprint/feature/epic this DoD applies to",
    )
    title = models.CharField(max_length=255, default="Definition of Done")
    criteria = models.JSONField(
        default=list,
        help_text="List of acceptance criteria strings; checked off per increment",
    )
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_definitions_of_done",
    )
    attachments = models.ManyToManyField(
        "projects.Upload", blank=True, related_name="+"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_active", "scope", "-created_at"]

    def __str__(self):
        return f"DoD: {self.title} ({self.scope})"
