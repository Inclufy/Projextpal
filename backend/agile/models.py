from django.db import models
from django.conf import settings
from projects.models import Project


# ============================================
# AGILE MODELS
# ============================================

class AgileTeamMember(models.Model):
    """Cross-functional team member for Agile projects"""
    ROLE_CHOICES = [
        ('product_owner', 'Product Owner'),
        ('tech_lead', 'Tech Lead'),
        ('developer', 'Developer'),
        ('designer', 'Designer'),
        ('qa', 'QA Engineer'),
        ('devops', 'DevOps'),
        ('analyst', 'Business Analyst'),
    ]
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='agile_team')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='developer')
    capacity_hours = models.IntegerField(default=40, help_text="Hours per week")
    skills = models.JSONField(default=list, blank=True)  # List of skill tags
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['project', 'user']
        ordering = ['role', 'user__first_name']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.get_role_display()}"


class AgileProductVision(models.Model):
    """Product vision and goals for Agile projects"""
    project = models.OneToOneField(Project, on_delete=models.CASCADE, related_name='agile_vision')
    vision_statement = models.TextField(blank=True)
    target_audience = models.TextField(blank=True)
    problem_statement = models.TextField(blank=True)
    unique_value_proposition = models.TextField(blank=True)
    success_criteria = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Vision for {self.project.name}"


class AgileProductGoal(models.Model):
    """Product goals linked to vision"""
    PRIORITY_CHOICES = [
        ('critical', 'Critical'),
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]
    STATUS_CHOICES = [
        ('planned', 'Planned'),
        ('in_progress', 'In Progress'),
        ('achieved', 'Achieved'),
        ('deferred', 'Deferred'),
    ]
    
    vision = models.ForeignKey(AgileProductVision, on_delete=models.CASCADE, related_name='goals')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planned')
    target_date = models.DateField(null=True, blank=True)
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order', '-priority']
    
    def __str__(self):
        return self.title


class AgileUserPersona(models.Model):
    """User personas for Agile projects"""
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='agile_personas')
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=100)
    age_range = models.CharField(max_length=50, blank=True)
    background = models.TextField(blank=True)
    goals = models.JSONField(default=list, blank=True)
    pain_points = models.JSONField(default=list, blank=True)
    quote = models.TextField(blank=True)
    avatar_color = models.CharField(max_length=20, default='blue')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.role})"


class AgileEpic(models.Model):
    """Epics for grouping user stories"""
    PRIORITY_CHOICES = [
        ('must_have', 'Must Have'),
        ('should_have', 'Should Have'),
        ('could_have', 'Could Have'),
        ('wont_have', 'Won\'t Have'),
    ]
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='agile_epics')
    # Goal→Epic→Item traceability: an epic advances a single Product Goal so
    # every backlog item rolls up to an outcome (the Agile value chain).
    product_goal = models.ForeignKey(
        AgileProductGoal, on_delete=models.SET_NULL, null=True, blank=True, related_name='epics'
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='should_have')
    color = models.CharField(max_length=20, default='blue')
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return self.title
    
    @property
    def total_points(self):
        return self.stories.aggregate(total=models.Sum('story_points'))['total'] or 0
    
    @property
    def completed_points(self):
        return self.stories.filter(status='done').aggregate(total=models.Sum('story_points'))['total'] or 0


class AgileBacklogItem(models.Model):
    """User stories and tasks in the backlog"""
    TYPE_CHOICES = [
        ('story', 'User Story'),
        ('task', 'Task'),
        ('bug', 'Bug'),
        ('spike', 'Spike'),
    ]
    PRIORITY_CHOICES = [
        ('must_have', 'Must Have'),
        ('should_have', 'Should Have'),
        ('could_have', 'Could Have'),
        ('wont_have', 'Won\'t Have'),
    ]
    STATUS_CHOICES = [
        ('backlog', 'Backlog'),
        ('ready', 'Ready'),
        ('in_progress', 'In Progress'),
        ('review', 'Review'),
        ('done', 'Done'),
    ]
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='agile_backlog')
    epic = models.ForeignKey(AgileEpic, on_delete=models.SET_NULL, null=True, blank=True, related_name='stories')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    acceptance_criteria = models.TextField(blank=True)
    item_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='story')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='should_have')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='backlog')
    story_points = models.IntegerField(null=True, blank=True)
    assignee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    iteration = models.ForeignKey('AgileIteration', on_delete=models.SET_NULL, null=True, blank=True, related_name='items')
    order = models.IntegerField(default=0)
    # Flow timestamps — stamped on board transitions so cycle-time / throughput
    # are computed from real events, not guessed. This is the Agile differentiator.
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', '-priority']

    def __str__(self):
        return self.title

    @property
    def cycle_time_hours(self):
        """Hours from first 'in_progress' to 'done'. None until completed."""
        if self.started_at and self.completed_at:
            return round((self.completed_at - self.started_at).total_seconds() / 3600, 2)
        return None

    def dod_status(self):
        """(all_met, [unmet descriptions]) for this item against the project's
        REQUIRED Definition of Done. No required criteria → vacuously met."""
        required = list(
            DefinitionOfDone.objects.filter(project_id=self.project_id, is_required=True)
        )
        if not required:
            return True, []
        met_ids = set(self.dod_entries.filter(is_met=True).values_list('criterion_id', flat=True))
        unmet = [c.description for c in required if c.id not in met_ids]
        return len(unmet) == 0, unmet


class AgileIteration(models.Model):
    """Iterations/Sprints for Agile projects"""
    STATUS_CHOICES = [
        ('planning', 'Planning'),
        ('active', 'Active'),
        ('completed', 'Completed'),
    ]
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='agile_iterations')
    name = models.CharField(max_length=100)
    goal = models.TextField(blank=True)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planning')
    velocity_committed = models.IntegerField(default=0)
    velocity_completed = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-start_date']
    
    def __str__(self):
        return f"{self.name} ({self.project.name})"
    
    @property
    def total_points(self):
        return self.items.aggregate(total=models.Sum('story_points'))['total'] or 0
    
    @property
    def completed_points(self):
        return self.items.filter(status='done').aggregate(total=models.Sum('story_points'))['total'] or 0
    
    @property
    def days_remaining(self):
        from datetime import date
        if self.status == 'completed':
            return 0
        delta = self.end_date - date.today()
        return max(0, delta.days)


class AgileRelease(models.Model):
    """Release planning for Agile projects"""
    STATUS_CHOICES = [
        ('planning', 'Planning'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='agile_releases')
    name = models.CharField(max_length=100)
    version = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True)
    target_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planning')
    features = models.JSONField(default=list, blank=True)  # Key features list
    iterations = models.ManyToManyField(AgileIteration, blank=True, related_name='releases')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['target_date']
    
    def __str__(self):
        return f"{self.name} ({self.version})"
    
    @property
    def progress(self):
        total = self.iterations.aggregate(total=models.Sum('velocity_committed'))['total'] or 0
        completed = self.iterations.aggregate(completed=models.Sum('velocity_completed'))['completed'] or 0
        return int((completed / total * 100) if total > 0 else 0)


class AgileDailyUpdate(models.Model):
    """Daily standup updates"""
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='agile_daily_updates')
    iteration = models.ForeignKey(AgileIteration, on_delete=models.CASCADE, related_name='daily_updates')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    date = models.DateField()
    yesterday = models.TextField(blank=True)
    today = models.TextField(blank=True)
    blockers = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['iteration', 'user', 'date']
        ordering = ['-date', 'user__first_name']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.date}"


class AgileRetrospective(models.Model):
    """Iteration retrospectives"""
    iteration = models.OneToOneField(AgileIteration, on_delete=models.CASCADE, related_name='retrospective')
    date = models.DateField()
    facilitator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Retro - {self.iteration.name}"


class AgileRetroItem(models.Model):
    """Items in a retrospective"""
    CATEGORY_CHOICES = [
        ('went_well', 'What Went Well'),
        ('to_improve', 'What to Improve'),
        ('action_item', 'Action Item'),
    ]
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('done', 'Done'),
    ]
    
    retrospective = models.ForeignKey(AgileRetrospective, on_delete=models.CASCADE, related_name='items')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    content = models.TextField()
    votes = models.IntegerField(default=0)
    assignee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='retro_items_created')
    
    class Meta:
        ordering = ['-votes', 'category']
    
    def __str__(self):
        return f"{self.get_category_display()}: {self.content[:50]}"


class AgileBudget(models.Model):
    """Budget tracking for Agile projects"""
    project = models.OneToOneField(Project, on_delete=models.CASCADE, related_name='agile_budget')
    total_budget = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default='EUR')
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


class AgileBudgetItem(models.Model):
    """Individual budget line items"""
    CATEGORY_CHOICES = [
        ('development', 'Development'),
        ('design', 'Design'),
        ('qa', 'QA'),
        ('infrastructure', 'Infrastructure'),
        ('tools', 'Tools'),
        ('training', 'Training'),
        ('other', 'Other'),
    ]
    
    budget = models.ForeignKey(AgileBudget, on_delete=models.CASCADE, related_name='items')
    iteration = models.ForeignKey(AgileIteration, on_delete=models.SET_NULL, null=True, blank=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    description = models.CharField(max_length=200)
    planned_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    actual_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    date = models.DateField(null=True, blank=True)
    
    class Meta:
        ordering = ['-date', 'category']
    
    def __str__(self):
        return f"{self.category}: {self.description}"

class DefinitionOfDone(models.Model):
    CATEGORY_CHOICES = [
        ('development', 'Development'),
        ('testing', 'Testing'),
        ('review', 'Review'),
        ('documentation', 'Documentation'),
        ('quality', 'Quality'),
        ('acceptance', 'Acceptance'),
        ('security', 'Security'),
    ]
    
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='agile_dod')
    description = models.CharField(max_length=500)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    is_required = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'agile_definition_of_done'
        ordering = ['order', 'id']

    def __str__(self):
        return f"{self.project.name} - {self.description[:50]}"


class AgileFlowConfig(models.Model):
    """Continuous-flow cadence settings for an Agile project. A WIP limit caps
    how many items can sit 'in_progress' at once — the lever that makes Agile a
    flow system (Kanban-style) rather than a batch/sprint system like Scrum."""
    project = models.OneToOneField('projects.Project', on_delete=models.CASCADE, related_name='agile_flow_config')
    wip_limit = models.IntegerField(default=0, help_text="Max items in_progress at once. 0 = unlimited.")
    target_cycle_time_days = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'agile_flow_config'

    def __str__(self):
        return f"Flow config for {self.project.name} (WIP {self.wip_limit or '∞'})"


class AgileDodEntry(models.Model):
    """Per-item Definition-of-Done tick. An item can only move to 'done' once
    every REQUIRED DoD criterion for its project has a met entry — this is what
    makes 'done' a real gate instead of a status label."""
    item = models.ForeignKey(AgileBacklogItem, on_delete=models.CASCADE, related_name='dod_entries')
    criterion = models.ForeignKey(DefinitionOfDone, on_delete=models.CASCADE, related_name='entries')
    is_met = models.BooleanField(default=False)
    met_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    met_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'agile_dod_entry'
        unique_together = ['item', 'criterion']
        ordering = ['criterion__order', 'id']

    def __str__(self):
        return f"{self.item.title[:30]} · {self.criterion.description[:30]} · {'met' if self.is_met else 'unmet'}"


class StakeholderFeedback(models.Model):
    """Per-iteration stakeholder feedback on shipped work (AG-3).

    Agile asks business people and developers to work together throughout the
    project and to inspect a working increment regularly. This artifact captures
    that conversation: at the end (or review) of an iteration a stakeholder gives
    structured feedback on what was delivered, optionally tied to the specific
    backlog item, with a sentiment and an optional follow-up action that can be
    triaged back into the backlog. It closes the empirical loop the daily update
    and retro don't — feedback from *outside* the delivery team."""

    SENTIMENT_CHOICES = [
        ('positive', 'Positive'),
        ('neutral', 'Neutral'),
        ('negative', 'Negative'),
    ]

    iteration = models.ForeignKey(
        AgileIteration, on_delete=models.CASCADE, related_name='stakeholder_feedback'
    )
    backlog_item = models.ForeignKey(
        AgileBacklogItem, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='stakeholder_feedback',
        help_text='The shipped item this feedback is about (optional).',
    )
    stakeholder_name = models.CharField(max_length=150)
    stakeholder_role = models.CharField(max_length=100, blank=True)
    sentiment = models.CharField(max_length=10, choices=SENTIMENT_CHOICES, default='neutral')
    rating = models.PositiveSmallIntegerField(
        null=True, blank=True, help_text='Optional 1-5 satisfaction score.'
    )
    feedback = models.TextField()
    follow_up_action = models.TextField(
        blank=True, help_text='Optional action to feed back into the backlog.'
    )
    follow_up_done = models.BooleanField(default=False)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='agile_stakeholder_feedback',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'agile_stakeholder_feedback'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.stakeholder_name} · {self.get_sentiment_display()} · {self.iteration.name}"
