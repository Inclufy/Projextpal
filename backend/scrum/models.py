from django.db import models
from django.conf import settings
from django.utils import timezone


class ProductBacklog(models.Model):
    """Scrum Product Backlog"""
    project = models.OneToOneField('projects.Project', on_delete=models.CASCADE, related_name='scrum_backlog')
    description = models.TextField(blank=True, null=True)
    vision = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Backlog for {self.project.name}"


class BacklogItem(models.Model):
    """Product Backlog Item (User Story, Bug, Task, etc.)"""
    TYPE_CHOICES = [
        ('user_story', 'User Story'),
        ('bug', 'Bug'),
        ('task', 'Task'),
        ('spike', 'Spike'),
        ('epic', 'Epic'),
    ]
    STATUS_CHOICES = [
        ('new', 'New'),
        ('ready', 'Ready'),
        ('in_progress', 'In Progress'),
        ('done', 'Done'),
        ('removed', 'Removed'),
    ]
    PRIORITY_CHOICES = [
        ('critical', 'Critical'),
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]
    
    backlog = models.ForeignKey(ProductBacklog, on_delete=models.CASCADE, related_name='items')
    item_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='user_story')
    title = models.CharField(max_length=300, default='New Item')  # FIX: Added default title
    description = models.TextField(blank=True, null=True)
    acceptance_criteria = models.TextField(blank=True, null=True)
    story_points = models.IntegerField(blank=True, null=True)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    order = models.IntegerField(default=0)
    
    # Parent for sub-tasks or epic linkage
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='children')
    
    # Assignment
    assignee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='scrum_assigned_items')
    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='scrum_reported_items')
    
    # Sprint assignment (null means in backlog)
    sprint = models.ForeignKey('Sprint', on_delete=models.SET_NULL, null=True, blank=True, related_name='items')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', '-priority', '-created_at']

    def __str__(self):
        return f"{self.get_item_type_display()}: {self.title}"


class Sprint(models.Model):
    """Scrum Sprint"""
    STATUS_CHOICES = [
        ('planning', 'Planning'),
        ('active', 'Active'),
        ('review', 'In Review'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='scrum_sprints')
    name = models.CharField(max_length=100, default='New Sprint')  # FIX: Added default
    number = models.IntegerField(default=1)
    goal = models.TextField(blank=True, null=True)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planning')
    
    # Capacity
    team_capacity = models.IntegerField(blank=True, null=True, help_text='Total story points capacity')
    
    # Retrospective data
    went_well = models.TextField(blank=True, null=True)
    to_improve = models.TextField(blank=True, null=True)
    action_items = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-number']
    
    def __str__(self):
        return f"{self.name} - {self.project.name}"
    
    @property
    def total_story_points(self):
        return self.items.aggregate(total=models.Sum('story_points'))['total'] or 0
    
    @property
    def completed_story_points(self):
        return self.items.filter(status='done').aggregate(total=models.Sum('story_points'))['total'] or 0
    
    def save(self, *args, **kwargs):
        # Auto-generate name if not provided
        if not self.name or self.name == 'New Sprint':
            self.name = f"Sprint {self.number}"
        super().save(*args, **kwargs)


# ==================== NEW MODELS ====================

class SprintGoal(models.Model):
    """Sprint Goal - The objective for a Sprint"""
    sprint = models.OneToOneField(
        Sprint,
        on_delete=models.CASCADE,
        related_name='sprint_goal'
    )
    description = models.TextField(
        help_text="What do we want to achieve this sprint?"
    )
    success_criteria = models.JSONField(
        default=list,
        blank=True,
        help_text="List of criteria to measure success"
    )
    is_achieved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='sprint_goals_created'
    )

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Goal: {self.sprint.name}"


class SprintPlanning(models.Model):
    """Sprint Planning Meeting"""
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    sprint = models.OneToOneField(
        Sprint,
        on_delete=models.CASCADE,
        related_name='planning_meeting'
    )
    scheduled_date = models.DateTimeField()
    duration_minutes = models.IntegerField(
        default=120,
        help_text="Meeting duration in minutes"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='scheduled'
    )
    
    # Planning artifacts
    team_capacity = models.IntegerField(
        null=True,
        blank=True,
        help_text="Total story points team can commit to"
    )
    committed_story_points = models.IntegerField(
        default=0,
        help_text="Story points committed during planning"
    )
    
    # Attendees
    attendees = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='sprint_planning_attended',
        blank=True
    )
    facilitator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='sprint_planning_facilitated'
    )
    
    # Meeting notes
    notes = models.TextField(blank=True)
    decisions = models.JSONField(
        default=list,
        blank=True,
        help_text="Key decisions made during planning"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-scheduled_date']

    def __str__(self):
        return f"Sprint Planning: {self.sprint.name}"


class Increment(models.Model):
    """Product Increment - Sum of completed work"""
    sprint = models.ForeignKey(
        Sprint,
        on_delete=models.CASCADE,
        related_name='increments'
    )
    project = models.ForeignKey(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='increments'
    )
    version = models.CharField(
        max_length=50,
        help_text="Version number (e.g., 1.0.0, Sprint-5)"
    )
    description = models.TextField(
        help_text="What's included in this increment"
    )
    
    # Release info
    is_released = models.BooleanField(
        default=False,
        help_text="Has this increment been released to production?"
    )
    release_date = models.DateTimeField(null=True, blank=True)
    release_notes = models.TextField(blank=True)
    
    # Quality metrics
    meets_dod = models.BooleanField(
        default=False,
        help_text="Does this increment meet Definition of Done?"
    )
    test_coverage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Test coverage percentage"
    )
    
    # Artifacts
    completed_tasks = models.ManyToManyField(
        BacklogItem,
        related_name='increments',
        blank=True
    )
    artifacts = models.JSONField(
        default=list,
        blank=True,
        help_text="Links to builds, deployments, documentation"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )

    class Meta:
        ordering = ['-created_at']
        unique_together = ['project', 'version']

    def __str__(self):
        return f"{self.project.name} - v{self.version}"


# ==================== EXISTING MODELS (kept for backward compatibility) ====================

class SprintBurndown(models.Model):
    """Daily burndown data for sprint"""
    sprint = models.ForeignKey(Sprint, on_delete=models.CASCADE, related_name='burndown_data')
    date = models.DateField()
    remaining_points = models.IntegerField(default=0)
    completed_points = models.IntegerField(default=0)
    ideal_remaining = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    
    class Meta:
        ordering = ['date']
        unique_together = ['sprint', 'date']

    def __str__(self):
        return f"{self.sprint.name} - {self.date}"


class DailyStandup(models.Model):
    """Daily Standup Meeting Log"""
    sprint = models.ForeignKey(Sprint, on_delete=models.CASCADE, related_name='standups')
    date = models.DateField()
    notes = models.TextField(blank=True, null=True)
    blockers = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"Standup {self.date} - {self.sprint.name}"


class StandupUpdate(models.Model):
    """Individual team member standup update"""
    standup = models.ForeignKey(DailyStandup, on_delete=models.CASCADE, related_name='updates')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    yesterday = models.TextField(blank=True, null=True)
    today = models.TextField(blank=True, null=True)
    blockers = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.standup.date}"


class SprintReview(models.Model):
    """Sprint Review Meeting - ENHANCED VERSION"""
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    sprint = models.ForeignKey(Sprint, on_delete=models.CASCADE, related_name='reviews')
    date = models.DateField(blank=True, null=True)
    scheduled_date = models.DateTimeField(null=True, blank=True)  # NEW
    duration_minutes = models.IntegerField(default=60, null=True, blank=True)  # NEW
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled', null=True, blank=True)  # NEW
    
    # Review metrics - NEW
    completed_story_points = models.IntegerField(default=0)
    sprint_goal_achieved = models.BooleanField(default=False)
    
    # Meeting participants - NEW
    attendees = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='sprint_review_attended',
        blank=True
    )
    stakeholders = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='sprint_review_stakeholders',
        blank=True
    )
    facilitator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sprint_review_facilitated'
    )
    
    # Review artifacts
    demo_notes = models.TextField(blank=True, null=True)
    stakeholder_feedback = models.TextField(blank=True, null=True)
    demo_items = models.ManyToManyField(
        BacklogItem,
        related_name='sprint_reviews_demo',
        blank=True
    )
    
    # OLD fields (kept for backward compatibility)
    accepted_items = models.TextField(blank=True, null=True)
    rejected_items = models.TextField(blank=True, null=True)
    
    # Action items - NEW
    action_items = models.JSONField(
        default=list,
        blank=True,
        help_text="Action items from the review"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"Review: {self.sprint.name} - {self.date}"


class SprintRetrospective(models.Model):
    """Sprint Retrospective Meeting"""
    sprint = models.ForeignKey(Sprint, on_delete=models.CASCADE, related_name='retrospectives')
    date = models.DateField(blank=True, null=True)
    went_well = models.TextField(blank=True, null=True)
    to_improve = models.TextField(blank=True, null=True)
    action_items = models.TextField(blank=True, null=True)
    team_morale = models.IntegerField(blank=True, null=True, help_text='1-5 scale')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Retro: {self.sprint.name} - {self.date}"


class Velocity(models.Model):
    """Sprint Velocity Tracking"""
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='scrum_velocity')
    sprint = models.OneToOneField(Sprint, on_delete=models.CASCADE, related_name='velocity')
    committed_points = models.IntegerField(default=0)
    completed_points = models.IntegerField(default=0)
    
    @property
    def completion_rate(self):
        if self.committed_points > 0:
            return round((self.completed_points / self.committed_points) * 100, 1)
        return 0

    def __str__(self):
        return f"Velocity: {self.sprint.name} - {self.completed_points}/{self.committed_points}"


class DefinitionOfDone(models.Model):
    """Definition of Done Checklist - ENHANCED VERSION"""
    SCOPE_CHOICES = [
        ('project', 'Project Level'),
        ('sprint', 'Sprint Level'),
        ('task', 'Task Level'),
    ]

    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='scrum_dod')
    
    # Enhanced fields
    name = models.CharField(max_length=200, default='Definition of Done')  # NEW
    scope = models.CharField(
        max_length=20,
        choices=SCOPE_CHOICES,
        default='project',
        null=True,
        blank=True
    )  # NEW
    description = models.TextField(blank=True, null=True)  # NEW
    
    # Original field
    item = models.CharField(max_length=300)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    # Checklist items (NEW - for more complex DoD)
    checklist = models.JSONField(
        default=list,
        blank=True,
        help_text="List of criteria: [{'item': 'Code reviewed', 'required': true}]"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)  # NEW
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )  # NEW

    class Meta:
        ordering = ['order']
        verbose_name_plural = 'Definitions of Done'

    def __str__(self):
        return f"{self.name} - {self.item}"


class DoDChecklistCompletion(models.Model):
    """Track DoD checklist completion for tasks/sprints - NEW"""
    ITEM_TYPE_CHOICES = [
        ('task', 'Task'),
        ('sprint', 'Sprint'),
        ('increment', 'Increment'),
    ]

    definition_of_done = models.ForeignKey(
        DefinitionOfDone,
        on_delete=models.CASCADE,
        related_name='completions'
    )
    item_type = models.CharField(max_length=20, choices=ITEM_TYPE_CHOICES)
    item_id = models.IntegerField(help_text="ID of the task/sprint/increment")
    
    # Completion tracking
    completed_items = models.JSONField(
        default=list,
        help_text="List of completed checklist item indices"
    )
    completion_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0
    )
    is_fully_complete = models.BooleanField(default=False)
    
    completed_at = models.DateTimeField(null=True, blank=True)
    completed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['definition_of_done', 'item_type', 'item_id']

    def __str__(self):
        return f"DoD {self.item_type} {self.item_id} - {self.completion_percentage}%"


class DoDChecklistEntry(models.Model):
    """Per-sprint, per-DoD-item completion ticking.

    Lets the Scrum team check off Definition-of-Done criteria during the
    Sprint Review. Scrum Guide 2020 — "Developers are required to conform
    to the Definition of Done" — conformance requires per-criterion sign-off.
    """
    dod_item = models.ForeignKey(
        DefinitionOfDone, on_delete=models.CASCADE, related_name='entries'
    )
    sprint = models.ForeignKey(
        Sprint, on_delete=models.CASCADE, related_name='dod_entries'
    )
    completed = models.BooleanField(default=False)
    completed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='dod_completions_marked',
    )
    completed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['dod_item', 'sprint']
        ordering = ['sprint', 'dod_item__order']

    def __str__(self):
        return f"DoD {self.dod_item_id} / Sprint {self.sprint_id}: {self.completed}"


class ScrumTeam(models.Model):
    """Scrum Team Configuration"""
    ROLE_CHOICES = [
        ('product_owner', 'Product Owner'),
        ('scrum_master', 'Scrum Master'),
        ('developer', 'Developer'),
        ('stakeholder', 'Stakeholder'),
    ]
    
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='scrum_team')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='developer')
    capacity_per_sprint = models.IntegerField(blank=True, null=True, help_text='Story points per sprint')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['project', 'user']

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.get_role_display()}"