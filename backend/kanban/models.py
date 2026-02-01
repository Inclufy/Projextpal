from django.db import models
from django.conf import settings


class KanbanBoard(models.Model):
    """Kanban Board"""
    project = models.OneToOneField('projects.Project', on_delete=models.CASCADE, related_name='kanban_board')
    name = models.CharField(max_length=200, blank=True, default='Kanban Board')
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class KanbanColumn(models.Model):
    """Kanban Column (Workflow Stage)"""
    COLUMN_TYPE_CHOICES = [
        ('backlog', 'Backlog'),
        ('todo', 'To Do'),
        ('in_progress', 'In Progress'),
        ('review', 'Review'),
        ('done', 'Done'),
        ('custom', 'Custom'),
    ]
    
    board = models.ForeignKey(KanbanBoard, on_delete=models.CASCADE, related_name='columns')
    name = models.CharField(max_length=100, blank=True, default='')
    column_type = models.CharField(max_length=20, choices=COLUMN_TYPE_CHOICES, default='custom')
    order = models.IntegerField(default=0)
    wip_limit = models.IntegerField(blank=True, null=True, help_text='Work In Progress limit')
    color = models.CharField(max_length=7, blank=True, default='#6366f1')  # Hex color
    is_done_column = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']

    @property
    def cards_count(self):
        return self.cards.count()

    @property
    def is_wip_exceeded(self):
        if self.wip_limit:
            return self.cards.count() > self.wip_limit
        return False


class KanbanSwimlane(models.Model):
    """Kanban Swimlane (Horizontal grouping)"""
    board = models.ForeignKey(KanbanBoard, on_delete=models.CASCADE, related_name='swimlanes')
    name = models.CharField(max_length=100, blank=True, default='')
    order = models.IntegerField(default=0)
    color = models.CharField(max_length=7, blank=True, default='#f3f4f6')
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']


class KanbanCard(models.Model):
    """Kanban Card (Work Item)"""
    PRIORITY_CHOICES = [
        ('critical', 'Critical'),
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]
    TYPE_CHOICES = [
        ('feature', 'Feature'),
        ('bug', 'Bug'),
        ('task', 'Task'),
        ('improvement', 'Improvement'),
        ('other', 'Other'),
    ]
    
    board = models.ForeignKey(KanbanBoard, on_delete=models.CASCADE, related_name='cards')
    column = models.ForeignKey(KanbanColumn, on_delete=models.CASCADE, related_name='cards')
    swimlane = models.ForeignKey(KanbanSwimlane, on_delete=models.SET_NULL, null=True, blank=True, related_name='cards')
    
    title = models.CharField(max_length=300, blank=True, default='')
    description = models.TextField(blank=True, null=True)
    card_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='task')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    order = models.IntegerField(default=0)
    
    # Assignment
    assignee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='kanban_assigned_cards')
    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='kanban_reported_cards')
    
    # Dates
    due_date = models.DateField(blank=True, null=True)
    start_date = models.DateField(blank=True, null=True)
    completed_date = models.DateField(blank=True, null=True)
    
    # Time tracking (for metrics)
    entered_column_at = models.DateTimeField(auto_now_add=True)
    
    # Tags/Labels
    tags = models.CharField(max_length=500, blank=True, null=True, help_text='Comma-separated tags')
    
    # Estimation
    estimated_hours = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    actual_hours = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    
    # Blocked
    is_blocked = models.BooleanField(default=False)
    blocked_reason = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', '-created_at']


class CardHistory(models.Model):
    """Track card movements for metrics"""
    card = models.ForeignKey(KanbanCard, on_delete=models.CASCADE, related_name='history')
    from_column = models.ForeignKey(KanbanColumn, on_delete=models.SET_NULL, null=True, related_name='cards_moved_from')
    to_column = models.ForeignKey(KanbanColumn, on_delete=models.SET_NULL, null=True, related_name='cards_moved_to')
    moved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    moved_at = models.DateTimeField(auto_now_add=True)
    time_in_column = models.DurationField(blank=True, null=True)  # Time spent in from_column


class CardComment(models.Model):
    """Comments on Kanban cards"""
    card = models.ForeignKey(KanbanCard, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']


class CardChecklist(models.Model):
    """Checklist for Kanban card"""
    card = models.ForeignKey(KanbanCard, on_delete=models.CASCADE, related_name='checklists')
    title = models.CharField(max_length=200)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']


class ChecklistItem(models.Model):
    """Individual checklist item"""
    checklist = models.ForeignKey(CardChecklist, on_delete=models.CASCADE, related_name='items')
    text = models.CharField(max_length=300)
    is_completed = models.BooleanField(default=False)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']


class CumulativeFlowData(models.Model):
    """Daily cumulative flow data for CFD chart"""
    board = models.ForeignKey(KanbanBoard, on_delete=models.CASCADE, related_name='cfd_data')
    date = models.DateField()
    column = models.ForeignKey(KanbanColumn, on_delete=models.CASCADE)
    card_count = models.IntegerField(default=0)

    class Meta:
        unique_together = ['board', 'date', 'column']
        ordering = ['date', 'column__order']


class KanbanMetrics(models.Model):
    """Kanban metrics snapshot"""
    board = models.ForeignKey(KanbanBoard, on_delete=models.CASCADE, related_name='metrics')
    date = models.DateField()
    
    # Throughput
    cards_completed = models.IntegerField(default=0)
    
    # Lead Time (time from creation to done)
    avg_lead_time_hours = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    
    # Cycle Time (time from in_progress to done)
    avg_cycle_time_hours = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    
    # WIP
    total_wip = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['board', 'date']
        ordering = ['-date']


class WipLimitViolation(models.Model):
    """Track WIP limit violations"""
    column = models.ForeignKey(KanbanColumn, on_delete=models.CASCADE, related_name='violations')
    violated_at = models.DateTimeField(auto_now_add=True)
    card_count = models.IntegerField()
    wip_limit = models.IntegerField()
    resolved_at = models.DateTimeField(blank=True, null=True)
