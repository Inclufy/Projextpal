from django.db import models
from django.conf import settings


class ProductBacklog(models.Model):
    """Scrum Product Backlog"""
    project = models.OneToOneField('projects.Project', on_delete=models.CASCADE, related_name='scrum_backlog')
    description = models.TextField(blank=True, null=True)
    vision = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


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
    title = models.CharField(max_length=300, blank=True, default='')
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
    name = models.CharField(max_length=100, blank=True, default='')
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
    
    @property
    def total_story_points(self):
        return self.items.aggregate(total=models.Sum('story_points'))['total'] or 0
    
    @property
    def completed_story_points(self):
        return self.items.filter(status='done').aggregate(total=models.Sum('story_points'))['total'] or 0


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


class DailyStandup(models.Model):
    """Daily Standup Meeting Log"""
    sprint = models.ForeignKey(Sprint, on_delete=models.CASCADE, related_name='standups')
    date = models.DateField()
    notes = models.TextField(blank=True, null=True)
    blockers = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']


class StandupUpdate(models.Model):
    """Individual team member standup update"""
    standup = models.ForeignKey(DailyStandup, on_delete=models.CASCADE, related_name='updates')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    yesterday = models.TextField(blank=True, null=True)
    today = models.TextField(blank=True, null=True)
    blockers = models.TextField(blank=True, null=True)


class SprintReview(models.Model):
    """Sprint Review Meeting"""
    sprint = models.ForeignKey(Sprint, on_delete=models.CASCADE, related_name='reviews')
    date = models.DateField(blank=True, null=True)
    demo_notes = models.TextField(blank=True, null=True)
    stakeholder_feedback = models.TextField(blank=True, null=True)
    accepted_items = models.TextField(blank=True, null=True)
    rejected_items = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)


class SprintRetrospective(models.Model):
    """Sprint Retrospective Meeting"""
    sprint = models.ForeignKey(Sprint, on_delete=models.CASCADE, related_name='retrospectives')
    date = models.DateField(blank=True, null=True)
    went_well = models.TextField(blank=True, null=True)
    to_improve = models.TextField(blank=True, null=True)
    action_items = models.TextField(blank=True, null=True)
    team_morale = models.IntegerField(blank=True, null=True, help_text='1-5 scale')
    created_at = models.DateTimeField(auto_now_add=True)


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


class DefinitionOfDone(models.Model):
    """Definition of Done Checklist"""
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='scrum_dod')
    item = models.CharField(max_length=300)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']


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
