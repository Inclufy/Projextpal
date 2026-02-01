from django.db import models
from django.conf import settings
from projects.models import Project


# ============================================
# WATERFALL MODELS
# ============================================

class WaterfallPhase(models.Model):
    """Project phases in Waterfall methodology"""
    PHASE_CHOICES = [
        ('requirements', 'Requirements'),
        ('design', 'Design'),
        ('development', 'Development'),
        ('testing', 'Testing'),
        ('deployment', 'Deployment'),
        ('maintenance', 'Maintenance'),
    ]
    STATUS_CHOICES = [
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('on_hold', 'On Hold'),
    ]
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='waterfall_phases')
    phase_type = models.CharField(max_length=20, choices=PHASE_CHOICES)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    actual_start_date = models.DateField(null=True, blank=True)
    actual_end_date = models.DateField(null=True, blank=True)
    progress = models.IntegerField(default=0)  # 0-100
    order = models.IntegerField(default=0)
    sign_off_required = models.BooleanField(default=True)
    signed_off_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    signed_off_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['order']
        unique_together = ['project', 'phase_type']
    
    def __str__(self):
        return f"{self.get_phase_type_display()} - {self.project.name}"


class WaterfallTeamMember(models.Model):
    """Team members for Waterfall projects"""
    ROLE_CHOICES = [
        ('project_manager', 'Project Manager'),
        ('business_analyst', 'Business Analyst'),
        ('architect', 'Architect'),
        ('developer', 'Developer'),
        ('designer', 'Designer'),
        ('qa_lead', 'QA Lead'),
        ('tester', 'Tester'),
        ('devops', 'DevOps'),
        ('dba', 'DBA'),
        ('tech_writer', 'Technical Writer'),
    ]
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='waterfall_team')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='developer')
    phase = models.ForeignKey(WaterfallPhase, on_delete=models.SET_NULL, null=True, blank=True, related_name='team_members')
    allocation_percentage = models.IntegerField(default=100)  # 0-100
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    
    class Meta:
        unique_together = ['project', 'user']
        ordering = ['role', 'user__first_name']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.get_role_display()}"


class WaterfallRequirement(models.Model):
    """Requirements documentation"""
    TYPE_CHOICES = [
        ('functional', 'Functional'),
        ('non_functional', 'Non-Functional'),
        ('business', 'Business'),
        ('technical', 'Technical'),
        ('interface', 'Interface'),
    ]
    PRIORITY_CHOICES = [
        ('must_have', 'Must Have'),
        ('should_have', 'Should Have'),
        ('could_have', 'Could Have'),
        ('wont_have', 'Won\'t Have'),
    ]
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('review', 'In Review'),
        ('approved', 'Approved'),
        ('implemented', 'Implemented'),
        ('deferred', 'Deferred'),
    ]
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='waterfall_requirements')
    requirement_id = models.CharField(max_length=20)  # e.g., REQ-001
    title = models.CharField(max_length=200)
    description = models.TextField()
    requirement_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='functional')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='should_have')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    source = models.CharField(max_length=200, blank=True)  # Who requested this
    acceptance_criteria = models.TextField(blank=True)
    dependencies = models.ManyToManyField('self', blank=True, symmetrical=False)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='requirements_created')
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='requirements_approved')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['requirement_id']
        unique_together = ['project', 'requirement_id']
    
    def __str__(self):
        return f"{self.requirement_id}: {self.title}"


class WaterfallDesignDocument(models.Model):
    """Design phase documents"""
    TYPE_CHOICES = [
        ('architecture', 'System Architecture'),
        ('database', 'Database Design'),
        ('ui_ux', 'UI/UX Design'),
        ('api', 'API Design'),
        ('security', 'Security Design'),
        ('integration', 'Integration Design'),
    ]
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('review', 'In Review'),
        ('approved', 'Approved'),
        ('superseded', 'Superseded'),
    ]
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='waterfall_designs')
    title = models.CharField(max_length=200)
    document_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    version = models.CharField(max_length=20, default='1.0')
    description = models.TextField(blank=True)
    content = models.TextField(blank=True)  # Or link to external doc
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='designs_authored')
    reviewer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='designs_reviewed')
    requirements = models.ManyToManyField(WaterfallRequirement, blank=True, related_name='designs')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['document_type', '-version']
    
    def __str__(self):
        return f"{self.title} v{self.version}"


class WaterfallTask(models.Model):
    """Development tasks linked to phases"""
    PRIORITY_CHOICES = [
        ('critical', 'Critical'),
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]
    STATUS_CHOICES = [
        ('todo', 'To Do'),
        ('in_progress', 'In Progress'),
        ('blocked', 'Blocked'),
        ('completed', 'Completed'),
    ]
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='waterfall_tasks')
    phase = models.ForeignKey(WaterfallPhase, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='todo')
    assignee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    estimated_hours = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    actual_hours = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    start_date = models.DateField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    completed_date = models.DateField(null=True, blank=True)
    requirements = models.ManyToManyField(WaterfallRequirement, blank=True, related_name='tasks')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['phase', '-priority', 'due_date']
    
    def __str__(self):
        return self.title


class WaterfallTestCase(models.Model):
    """Test cases for testing phase"""
    TYPE_CHOICES = [
        ('unit', 'Unit Test'),
        ('integration', 'Integration Test'),
        ('system', 'System Test'),
        ('acceptance', 'Acceptance Test'),
        ('regression', 'Regression Test'),
        ('performance', 'Performance Test'),
    ]
    PRIORITY_CHOICES = [
        ('critical', 'Critical'),
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('passed', 'Passed'),
        ('failed', 'Failed'),
        ('blocked', 'Blocked'),
        ('skipped', 'Skipped'),
    ]
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='waterfall_test_cases')
    test_id = models.CharField(max_length=20)  # e.g., TC-001
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    test_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='system')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    preconditions = models.TextField(blank=True)
    test_steps = models.TextField(blank=True)
    expected_result = models.TextField(blank=True)
    actual_result = models.TextField(blank=True)
    requirement = models.ForeignKey(WaterfallRequirement, on_delete=models.SET_NULL, null=True, blank=True, related_name='test_cases')
    assignee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    executed_at = models.DateTimeField(null=True, blank=True)
    executed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='tests_executed')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['test_id']
        unique_together = ['project', 'test_id']
    
    def __str__(self):
        return f"{self.test_id}: {self.name}"


class WaterfallMilestone(models.Model):
    """Project milestones"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('at_risk', 'At Risk'),
        ('overdue', 'Overdue'),
    ]
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='waterfall_milestones')
    phase = models.ForeignKey(WaterfallPhase, on_delete=models.SET_NULL, null=True, blank=True, related_name='milestones')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    due_date = models.DateField()
    completed_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    deliverables = models.JSONField(default=list, blank=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['due_date']
    
    def __str__(self):
        return self.name
    
    @property
    def days_remaining(self):
        from datetime import date
        if self.status == 'completed':
            return 0
        delta = self.due_date - date.today()
        return delta.days


class WaterfallGanttTask(models.Model):
    """Gantt chart tasks"""
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='waterfall_gantt_tasks')
    phase = models.ForeignKey(WaterfallPhase, on_delete=models.CASCADE, related_name='gantt_tasks')
    name = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField()
    progress = models.IntegerField(default=0)  # 0-100
    dependencies = models.ManyToManyField('self', blank=True, symmetrical=False)
    assignee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    is_milestone = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['start_date', 'order']
    
    def __str__(self):
        return self.name


class WaterfallChangeRequest(models.Model):
    """Change control for Waterfall projects"""
    PRIORITY_CHOICES = [
        ('critical', 'Critical'),
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]
    STATUS_CHOICES = [
        ('submitted', 'Submitted'),
        ('under_review', 'Under Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('implemented', 'Implemented'),
        ('deferred', 'Deferred'),
    ]
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='waterfall_change_requests')
    change_id = models.CharField(max_length=20)  # e.g., CR-001
    title = models.CharField(max_length=200)
    description = models.TextField()
    reason = models.TextField(blank=True)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted')
    affected_phase = models.ForeignKey(WaterfallPhase, on_delete=models.SET_NULL, null=True, blank=True)
    schedule_impact = models.CharField(max_length=100, blank=True)
    budget_impact = models.CharField(max_length=100, blank=True)
    scope_impact = models.TextField(blank=True)
    requested_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='change_requests_submitted')
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='change_requests_reviewed')
    approval_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['project', 'change_id']
    
    def __str__(self):
        return f"{self.change_id}: {self.title}"


class WaterfallDeploymentChecklist(models.Model):
    """Deployment checklist items"""
    CATEGORY_CHOICES = [
        ('testing', 'Testing'),
        ('documentation', 'Documentation'),
        ('infrastructure', 'Infrastructure'),
        ('approval', 'Approval'),
        ('backup', 'Backup'),
        ('security', 'Security'),
    ]
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='waterfall_deployment_checklist')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    item = models.CharField(max_length=200)
    is_required = models.BooleanField(default=True)
    is_completed = models.BooleanField(default=False)
    completed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    assignee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='deployment_items_assigned')
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['category', 'order']
    
    def __str__(self):
        return f"{self.get_category_display()}: {self.item}"


class WaterfallMaintenanceItem(models.Model):
    """Maintenance phase items"""
    TYPE_CHOICES = [
        ('bug_fix', 'Bug Fix'),
        ('enhancement', 'Enhancement'),
        ('security', 'Security'),
        ('performance', 'Performance'),
    ]
    PRIORITY_CHOICES = [
        ('critical', 'Critical'),
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='waterfall_maintenance')
    title = models.CharField(max_length=200)
    description = models.TextField()
    item_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='bug_fix')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    reported_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='maintenance_reported')
    assignee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='maintenance_assigned')
    reported_date = models.DateField(auto_now_add=True)
    resolved_date = models.DateField(null=True, blank=True)
    resolution = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-reported_date', '-priority']
    
    def __str__(self):
        return self.title


class WaterfallBudget(models.Model):
    """Budget tracking for Waterfall projects"""
    project = models.OneToOneField(Project, on_delete=models.CASCADE, related_name='waterfall_budget')
    total_budget = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default='EUR')
    contingency_percentage = models.IntegerField(default=10)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Budget for {self.project.name}"
    
    @property
    def total_spent(self):
        return self.items.aggregate(total=models.Sum('actual_amount'))['total'] or 0
    
    @property
    def remaining(self):
        return self.total_budget - self.total_spent


class WaterfallBudgetItem(models.Model):
    """Budget line items by phase"""
    budget = models.ForeignKey(WaterfallBudget, on_delete=models.CASCADE, related_name='items')
    phase = models.ForeignKey(WaterfallPhase, on_delete=models.SET_NULL, null=True, blank=True)
    category = models.CharField(max_length=100)
    description = models.CharField(max_length=200)
    planned_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    actual_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    date = models.DateField(null=True, blank=True)
    
    class Meta:
        ordering = ['phase', 'category']
    
    def __str__(self):
        return f"{self.category}: {self.description}"
