from django.db import models
from django.conf import settings


class ProjectBrief(models.Model):
    """PRINCE2 Project Brief - Pre-project document"""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('approved', 'Approved'),
    ]
    
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='prince2_briefs')
    project_definition = models.TextField(blank=True, default='')
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