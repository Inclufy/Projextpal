from django.db import models
from django.conf import settings


class ProjectBrief(models.Model):
    """PRINCE2 Project Brief - Pre-project document.

    Note: the canonical PRINCE2 manual labels the opening narrative section
    *Background*. The DB column is now `background`; `project_definition`
    is preserved as a property alias for backward compatibility with
    existing clients (frontend / mobile app).
    """
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('approved', 'Approved'),
    ]

    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='prince2_briefs')
    background = models.TextField(blank=True, default='')
    project_approach = models.TextField(blank=True, default='')
    outline_business_case = models.TextField(blank=True, default='')
    project_objectives = models.TextField(blank=True, null=True)
    project_scope = models.TextField(blank=True, null=True)
    project_team_structure = models.TextField(blank=True, null=True)
    constraints = models.TextField(blank=True, null=True)
    assumptions = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    version = models.CharField(max_length=10, default='1.0')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def project_definition(self):
        """Backward-compat alias for the renamed `background` field."""
        return self.background

    @project_definition.setter
    def project_definition(self, value):
        self.background = value

    class Meta:
        ordering = ['-created_at']


class BusinessCase(models.Model):
    """PRINCE2 Business Case"""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('approved', 'Approved'),
        ('updated', 'Updated'),
    ]
    
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='prince2_business_cases')
    executive_summary = models.TextField(blank=True, null=True)
    reasons = models.TextField(blank=True, null=True)
    business_options = models.TextField(blank=True, null=True)  # Options considered
    expected_benefits = models.TextField(blank=True, null=True)
    expected_dis_benefits = models.TextField(blank=True, null=True)  # Negative consequences
    timescale = models.TextField(blank=True, null=True)
    costs = models.TextField(blank=True, null=True)
    investment_appraisal = models.TextField(blank=True, null=True)
    major_risks = models.TextField(blank=True, null=True)
    development_costs = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    ongoing_costs = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    roi_percentage = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    net_present_value = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    payback_period_months = models.IntegerField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    version = models.CharField(max_length=10, default='1.0')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def total_costs(self):
        return self.development_costs + self.ongoing_costs

    class Meta:
        ordering = ['-created_at']


class BusinessCaseBenefit(models.Model):
    """Benefits for Business Case"""
    BENEFIT_TYPE_CHOICES = [
        ('financial', 'Financial'),
        ('non_financial', 'Non-Financial'),
        ('intangible', 'Intangible'),
    ]
    
    business_case = models.ForeignKey(BusinessCase, on_delete=models.CASCADE, related_name='benefits')
    description = models.TextField(blank=True, default='')
    benefit_type = models.CharField(max_length=20, choices=BENEFIT_TYPE_CHOICES, blank=True, default='financial')
    value = models.CharField(max_length=100, blank=True, null=True)
    timing = models.CharField(max_length=100, blank=True, null=True)
    measurable = models.BooleanField(default=True)


class BusinessCaseRisk(models.Model):
    """Risks for Business Case"""
    PROBABILITY_CHOICES = [
        ('very_low', 'Very Low'),
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('very_high', 'Very High'),
    ]
    
    business_case = models.ForeignKey(BusinessCase, on_delete=models.CASCADE, related_name='risks')
    description = models.TextField(blank=True, default='')
    probability = models.CharField(max_length=20, choices=PROBABILITY_CHOICES, default='medium')
    impact = models.CharField(max_length=20, choices=PROBABILITY_CHOICES, default='medium')
    mitigation = models.TextField(blank=True, null=True)


class ProjectInitiationDocument(models.Model):
    """PRINCE2 PID"""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('baselined', 'Baselined'),
        ('updated', 'Updated'),
    ]
    
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='prince2_pids')
    project_definition = models.TextField(blank=True, default='')
    project_approach = models.TextField(blank=True, default='')
    project_objectives = models.TextField(blank=True, null=True)
    success_criteria = models.TextField(blank=True, null=True)
    quality_management_approach = models.TextField(blank=True, default='')
    risk_management_approach = models.TextField(blank=True, default='')
    change_control_approach = models.TextField(blank=True, default='')
    communication_management_approach = models.TextField(blank=True, default='')
    project_controls = models.TextField(blank=True, null=True)
    tailoring = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    version = models.CharField(max_length=10, default='1.0')
    baseline_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']


class Stage(models.Model):
    """PRINCE2 Management Stage"""
    STATUS_CHOICES = [
        ('planned', 'Planned'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('exception', 'Exception'),
    ]
    
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='prince2_stages')
    name = models.CharField(max_length=200, blank=True, default='')
    order = models.IntegerField(default=1)
    description = models.TextField(blank=True, null=True)
    objectives = models.TextField(blank=True, null=True)
    planned_start_date = models.DateField(blank=True, null=True)
    planned_end_date = models.DateField(blank=True, null=True)
    actual_start_date = models.DateField(blank=True, null=True)
    actual_end_date = models.DateField(blank=True, null=True)
    time_tolerance = models.CharField(max_length=50, blank=True, null=True)
    cost_tolerance = models.CharField(max_length=50, blank=True, null=True)
    scope_tolerance = models.CharField(max_length=50, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planned')
    progress_percentage = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']


class StagePlan(models.Model):
    """PRINCE2 Stage Plan"""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('approved', 'Approved'),
        ('baselined', 'Baselined'),
    ]
    
    stage = models.ForeignKey(Stage, on_delete=models.CASCADE, related_name='plans')
    plan_description = models.TextField(blank=True, null=True)
    budget = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    resource_requirements = models.TextField(blank=True, null=True)
    quality_approach = models.TextField(blank=True, null=True)
    dependencies = models.TextField(blank=True, null=True)
    assumptions = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    version = models.CharField(max_length=10, default='1.0')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class StageGate(models.Model):
    """PRINCE2 Stage Gate Review"""
    OUTCOME_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('conditional', 'Conditional'),
        ('rejected', 'Rejected'),
        ('deferred', 'Deferred'),
    ]
    
    stage = models.ForeignKey(Stage, on_delete=models.CASCADE, related_name='gates')
    review_date = models.DateField(blank=True, null=True)
    outcome = models.CharField(max_length=20, choices=OUTCOME_CHOICES, default='pending')
    decision_notes = models.TextField(blank=True, null=True)
    stage_performance_summary = models.TextField(blank=True, null=True)
    products_completed = models.TextField(blank=True, null=True)
    products_pending = models.TextField(blank=True, null=True)
    lessons_learned = models.TextField(blank=True, null=True)
    business_case_still_valid = models.BooleanField(default=True)
    next_stage_plan_approved = models.BooleanField(default=False)
    reviewer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class WorkPackage(models.Model):
    """PRINCE2 Work Package"""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('authorized', 'Authorized'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('closed', 'Closed'),
    ]
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='prince2_work_packages')
    stage = models.ForeignKey(Stage, on_delete=models.CASCADE, related_name='work_packages', null=True, blank=True)
    reference = models.CharField(max_length=50, blank=True, default='')
    title = models.CharField(max_length=200, blank=True, default='')
    description = models.TextField(blank=True, null=True)
    product_descriptions = models.TextField(blank=True, null=True)
    techniques = models.TextField(blank=True, null=True)
    tolerances = models.TextField(blank=True, null=True)
    constraints = models.TextField(blank=True, null=True)
    reporting_requirements = models.TextField(blank=True, null=True)
    team_manager = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    planned_start_date = models.DateField(blank=True, null=True)
    planned_end_date = models.DateField(blank=True, null=True)
    actual_start_date = models.DateField(blank=True, null=True)
    actual_end_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    progress_percentage = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']


class ProjectBoard(models.Model):
    """PRINCE2 Project Board"""
    project = models.OneToOneField('projects.Project', on_delete=models.CASCADE, related_name='prince2_board')
    meeting_frequency = models.CharField(max_length=50, blank=True, null=True)
    next_meeting_date = models.DateField(blank=True, null=True)
    governance_notes = models.TextField(blank=True, null=True)
    budget_authority = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class ProjectBoardMember(models.Model):
    """PRINCE2 Project Board Member"""
    ROLE_CHOICES = [
        ('executive', 'Executive'),
        ('senior_user', 'Senior User'),
        ('senior_supplier', 'Senior Supplier'),
        ('project_manager', 'Project Manager'),
        ('project_assurance', 'Project Assurance'),
        ('change_authority', 'Change Authority'),
        ('project_support', 'Project Support'),
    ]
    
    board = models.ForeignKey(ProjectBoard, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    role = models.CharField(max_length=30, choices=ROLE_CHOICES, blank=True, default='project_support')
    responsibilities = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)


class CheckpointReport(models.Model):
    """PRINCE2 Checkpoint Report (PRINCE2 6th Ed §A.3).

    Produced by a Team Manager and sent to the Project Manager during a
    work-package execution period. Distinct from a Highlight Report
    (PM -> Project Board). Both are mandatory PRINCE2 management products.
    """
    STATUS_CHOICES = [
        ('green', 'Green'),
        ('amber', 'Amber'),
        ('red', 'Red'),
    ]

    project = models.ForeignKey(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='prince2_checkpoint_reports',
    )
    work_package = models.ForeignKey(
        WorkPackage,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='checkpoint_reports',
    )
    period_start = models.DateField()
    period_end = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='green')
    products_completed = models.TextField(
        blank=True,
        help_text="Products completed during the reporting period.",
    )
    products_planned = models.TextField(
        blank=True,
        help_text="Products planned for the next reporting period.",
    )
    risks_issues_summary = models.TextField(
        blank=True,
        help_text="Risk and issue commentary for the period.",
    )
    team_manager = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='prince2_checkpoint_reports_authored',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-period_end', '-created_at']

    def __str__(self):
        return (
            f"Checkpoint {self.period_start}–{self.period_end} "
            f"(project {self.project_id})"
        )


class HighlightReport(models.Model):
    """PRINCE2 Highlight Report"""
    STATUS_CHOICES = [
        ('green', 'Green'),
        ('amber', 'Amber'),
        ('red', 'Red'),
    ]

    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='prince2_highlight_reports')
    stage = models.ForeignKey(Stage, on_delete=models.CASCADE, related_name='highlight_reports', null=True, blank=True)
    report_date = models.DateField(null=True, blank=True)
    period_start = models.DateField(blank=True, null=True)
    period_end = models.DateField(blank=True, null=True)
    overall_status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='green')
    status_summary = models.TextField(blank=True, null=True)
    work_completed = models.TextField(blank=True, null=True)
    work_planned_next_period = models.TextField(blank=True, null=True)
    issues_summary = models.TextField(blank=True, null=True)
    risks_summary = models.TextField(blank=True, null=True)
    budget_spent = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    budget_forecast = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-report_date']

    # ------------------------------------------------------------------
    # Auto-draft engine
    # ------------------------------------------------------------------
    def auto_draft_content(self, save=True):
        """Synthesise highlight-report content from live project signals.

        Pulls from:
          - Project.status / overall health
          - Recently-closed Tasks within [period_start, period_end]
          - Upcoming Milestones (after period_end)
          - Open Risks (severity-grouped)
          - Blocked tasks (proxy for issues — no Issue model exists yet)

        Populates `status_summary`, `work_completed`,
        `work_planned_next_period`, `issues_summary`, `risks_summary`.
        Returns the report instance (saved if `save=True`).
        """
        from datetime import date, timedelta
        from django.db.models import Q

        # Lazy imports to avoid circular dependency at module load time.
        from projects.models import Task, Milestone, Risk

        project = self.project
        period_end = self.period_end or self.report_date or date.today()
        period_start = self.period_start or (period_end - timedelta(days=7))

        # --- Status summary ---------------------------------------------------
        proj_status = getattr(project, 'status', None) or 'active'
        # Risk-level health hint
        open_risks = Risk.objects.filter(project=project, status='Open')
        high_risks = open_risks.filter(level__in=['High']).count()
        if high_risks >= 3:
            health_hint = 'RED — multiple high-severity risks open'
        elif high_risks >= 1:
            health_hint = 'AMBER — at least one high-severity risk'
        else:
            health_hint = 'GREEN — no high-severity risks'
        self.status_summary = (
            f"Project '{project.name}' is currently {proj_status.upper()}. "
            f"{health_hint}. Period covered: {period_start.isoformat()} → "
            f"{period_end.isoformat()}."
        )

        # --- Work completed (recently-closed tasks in this period) ----------
        completed_tasks = Task.objects.filter(
            milestone__project=project,
            status='done',
            updated_at__date__gte=period_start,
            updated_at__date__lte=period_end,
        ).order_by('-updated_at')[:10]
        if completed_tasks:
            lines = [f"- {t.title}" for t in completed_tasks]
            self.work_completed = (
                f"{len(lines)} task(s) closed this period:\n" + "\n".join(lines)
            )
        else:
            self.work_completed = "No tasks closed in this reporting period."

        # --- Work planned next period (upcoming milestones) -----------------
        next_window_end = period_end + timedelta(days=14)
        upcoming = Milestone.objects.filter(
            project=project,
            end_date__gte=period_end,
            end_date__lte=next_window_end,
        ).exclude(status='completed').order_by('end_date')[:5]
        if upcoming:
            lines = [
                f"- {m.name} (target {m.end_date.isoformat() if m.end_date else 'TBD'})"
                for m in upcoming
            ]
            self.work_planned_next_period = (
                f"{len(lines)} milestone(s) targeted in the next 14 days:\n"
                + "\n".join(lines)
            )
        else:
            self.work_planned_next_period = (
                "No milestones scheduled in the next 14 days. Continue current "
                "work-package execution."
            )

        # --- Issues summary (blocked tasks proxy) ---------------------------
        blocked = Task.objects.filter(
            milestone__project=project, status='blocked'
        ).order_by('-updated_at')
        blocked_count = blocked.count()
        top3_blocked = list(blocked[:3].values_list('title', flat=True))
        if blocked_count:
            self.issues_summary = (
                f"{blocked_count} blocked task(s) acting as open issues. "
                f"Top 3: " + "; ".join(top3_blocked)
            )
        else:
            self.issues_summary = "No blocking issues recorded this period."

        # --- Risks summary ---------------------------------------------------
        open_risk_count = open_risks.count()
        by_level = {
            'High': open_risks.filter(level='High').count(),
            'Medium': open_risks.filter(level='Medium').count(),
            'Low': open_risks.filter(level='Low').count(),
        }
        top3_risks = list(
            open_risks.order_by('-created_at')[:3].values_list('name', flat=True)
        )
        risk_line = (
            f"{open_risk_count} open risk(s) — "
            f"High: {by_level['High']}, Medium: {by_level['Medium']}, "
            f"Low: {by_level['Low']}."
        )
        if top3_risks:
            risk_line += " Top 3: " + "; ".join(top3_risks)
        self.risks_summary = risk_line

        # Set overall_status from health_hint
        if high_risks >= 3:
            self.overall_status = 'red'
        elif high_risks >= 1:
            self.overall_status = 'amber'
        else:
            self.overall_status = 'green'

        if save:
            self.save()
        return self


class EndProjectReport(models.Model):
    """PRINCE2 End Project Report"""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('approved', 'Approved'),
    ]
    
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='prince2_end_reports')
    report_date = models.DateField(blank=True, null=True)
    achievements_summary = models.TextField(blank=True, default='')
    performance_against_plan = models.TextField(blank=True, default='')
    benefits_achieved = models.TextField(blank=True, null=True)
    quality_review = models.TextField(blank=True, null=True)
    final_cost = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    budget_variance = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    schedule_variance = models.CharField(max_length=100, blank=True, null=True)
    follow_on_actions = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class LessonsLog(models.Model):
    """PRINCE2 Lessons Log"""
    TYPE_CHOICES = [
        ('positive', 'Positive'),
        ('negative', 'Negative'),
    ]
    CATEGORY_CHOICES = [
        ('process', 'Process'),
        ('technology', 'Technology'),
        ('people', 'People'),
        ('supplier', 'Supplier'),
        ('communication', 'Communication'),
        ('quality', 'Quality'),
        ('risk', 'Risk'),
    ]
    
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='prince2_lessons')
    title = models.CharField(max_length=200, blank=True, default='')
    lesson_type = models.CharField(max_length=20, choices=TYPE_CHOICES, blank=True, default='positive')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    recommendation = models.TextField(blank=True, null=True)
    stage = models.ForeignKey(Stage, on_delete=models.SET_NULL, null=True, blank=True)
    logged_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    date_logged = models.DateField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class ProjectTolerance(models.Model):
    """PRINCE2 Project Tolerances"""
    TYPE_CHOICES = [
        ('time', 'Time'),
        ('cost', 'Cost'),
        ('scope', 'Scope'),
        ('quality', 'Quality'),
        ('benefit', 'Benefit'),
        ('risk', 'Risk'),
    ]
    
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='prince2_tolerances')
    tolerance_type = models.CharField(max_length=20, choices=TYPE_CHOICES, blank=True, default='cost')
    description = models.TextField(blank=True, null=True)
    plus_tolerance = models.CharField(max_length=50, blank=True, null=True)
    minus_tolerance = models.CharField(max_length=50, blank=True, null=True)
    current_status = models.CharField(max_length=200, blank=True, null=True)
    is_exceeded = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['project', 'tolerance_type']

class Product(models.Model):
    """PRINCE2 Product - deliverable or output"""
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='prince2_products')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    product_type = models.CharField(max_length=50, choices=[
        ('specialist', 'Specialist Product'),
        ('management', 'Management Product'),
    ], default='specialist')
    format = models.CharField(max_length=100, blank=True)
    quality_criteria = models.TextField(help_text='Quality criteria for this product', blank=True)
    quality_tolerance = models.TextField(help_text='Acceptable deviation from quality criteria', blank=True)
    quality_method = models.CharField(max_length=200, help_text='How quality will be checked', blank=True)
    quality_responsibility = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='prince2_quality_products')
    derivation = models.TextField(help_text='Source/composition of the product', blank=True)
    status = models.CharField(max_length=50, choices=[
        ('planned', 'Planned'),
        ('in_progress', 'In Progress'),
        ('quality_check', 'Quality Check'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ], default='planned')
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='prince2_owned_products')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['title']

    def __str__(self):
        return f"{self.title} ({self.project.name})"
