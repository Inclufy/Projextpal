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
    # Classic Kanban classes of service. 'expedite' bypasses WIP limits, sorts
    # to the top of its column, and is held to a tight service-level expectation.
    CLASS_OF_SERVICE_CHOICES = [
        ('standard', 'Standard'),
        ('expedite', 'Expedite'),
        ('fixed_date', 'Fixed Date'),
        ('intangible', 'Intangible'),
    ]

    board = models.ForeignKey(KanbanBoard, on_delete=models.CASCADE, related_name='cards')
    column = models.ForeignKey(KanbanColumn, on_delete=models.CASCADE, related_name='cards')
    swimlane = models.ForeignKey(KanbanSwimlane, on_delete=models.SET_NULL, null=True, blank=True, related_name='cards')
    
    title = models.CharField(max_length=300, blank=True, default='')
    description = models.TextField(blank=True, null=True)
    card_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='task')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    class_of_service = models.CharField(max_length=20, choices=CLASS_OF_SERVICE_CHOICES, default='standard')
    # Service Level Expectation (days). A card whose age in flow exceeds this is
    # breaching its SLE and is flagged on the board + in Flow Metrics.
    sle_days = models.IntegerField(blank=True, null=True, help_text='Service Level Expectation in days')
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
    blocked_at = models.DateTimeField(blank=True, null=True, help_text='When the card was last blocked (for aging/blocked-time tiles)')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Expedite cards sort to the top, then by order. This makes class of
        # service visible in the natural board ordering.
        ordering = ['order', '-created_at']

    @property
    def is_expedite(self):
        return self.class_of_service == 'expedite'

    @property
    def age_in_column_hours(self):
        from django.utils import timezone
        if not self.entered_column_at:
            return None
        return round((timezone.now() - self.entered_column_at).total_seconds() / 3600, 2)

    @property
    def flow_age_hours(self):
        """Hours since the card was created (lead-time age while still in flow)."""
        from django.utils import timezone
        if not self.created_at:
            return None
        return round((timezone.now() - self.created_at).total_seconds() / 3600, 2)

    @property
    def is_sle_breached(self):
        if not self.sle_days or self.completed_date:
            return False
        age = self.flow_age_hours
        return age is not None and age > self.sle_days * 24


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

class WorkPolicy(models.Model):
    CATEGORY_CHOICES = [
        ('workflow', 'Workflow'),
        ('quality', 'Quality'),
        ('team', 'Team'),
        ('process', 'Process'),
    ]
    
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='work_policies')
    # Column-scoped explicit policy. When set, the policy is the "explicit
    # policy" for that column and renders at the column header; when null it is
    # a board-wide policy. (Make Policies Explicit — core Kanban practice.)
    column = models.ForeignKey(KanbanColumn, on_delete=models.CASCADE, null=True, blank=True, related_name='policies')
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'kanban_work_policies'
        ordering = ['order', 'id']

    def __str__(self):
        return f"{self.project.name} - {self.title}"


class BlockEvent(models.Model):
    """A single block/unblock episode on a card. Lets the board measure total
    blocked time and aging-while-blocked, not just a boolean flag."""
    card = models.ForeignKey(KanbanCard, on_delete=models.CASCADE, related_name='block_events')
    reason = models.TextField(blank=True, default='')
    blocked_at = models.DateTimeField(auto_now_add=True)
    unblocked_at = models.DateTimeField(blank=True, null=True)
    blocked_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='kanban_blocks_raised')

    class Meta:
        ordering = ['-blocked_at']

    @property
    def blocked_hours(self):
        from django.utils import timezone
        end = self.unblocked_at or timezone.now()
        return round((end - self.blocked_at).total_seconds() / 3600, 2)

    @property
    def is_open(self):
        return self.unblocked_at is None


class KaizenAction(models.Model):
    """A continuous-improvement (kaizen) action raised from the flow — e.g. a
    recurring blocker or an SLE breach. Closes the improvement loop Kanban
    expects from its feedback cadences."""
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('done', 'Done'),
        ('dropped', 'Dropped'),
    ]
    TRIGGER_CHOICES = [
        ('blocker', 'Recurring Blocker'),
        ('sle_breach', 'SLE Breach'),
        ('wip_breach', 'WIP Breach'),
        ('retro', 'Retrospective'),
        ('other', 'Other'),
    ]

    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='kanban_kaizen_actions')
    board = models.ForeignKey(KanbanBoard, on_delete=models.CASCADE, null=True, blank=True, related_name='kaizen_actions')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    trigger = models.CharField(max_length=20, choices=TRIGGER_CHOICES, default='other')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='kanban_kaizen_owned')
    source_card = models.ForeignKey(KanbanCard, on_delete=models.SET_NULL, null=True, blank=True, related_name='kaizen_actions')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='kanban_kaizen_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'kanban_kaizen_action'
        ordering = ['status', '-created_at']

    def __str__(self):
        return f"{self.title} ({self.status})"


class KanbanCadence(models.Model):
    """A recurring Kanban feedback cadence (replenishment, standup, delivery
    planning, service-delivery review, risk review, operations review).
    Cadences are how Kanban drives flow without sprints."""
    CADENCE_TYPE_CHOICES = [
        ('replenishment', 'Replenishment'),
        ('standup', 'Daily Standup'),
        ('delivery_planning', 'Delivery Planning'),
        ('service_delivery_review', 'Service Delivery Review'),
        ('risk_review', 'Risk Review'),
        ('operations_review', 'Operations Review'),
        ('strategy_review', 'Strategy Review'),
    ]
    FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('biweekly', 'Bi-weekly'),
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('on_demand', 'On Demand'),
    ]

    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='kanban_cadences')
    board = models.ForeignKey(KanbanBoard, on_delete=models.CASCADE, null=True, blank=True, related_name='cadences')
    name = models.CharField(max_length=200)
    cadence_type = models.CharField(max_length=40, choices=CADENCE_TYPE_CHOICES, default='standup')
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES, default='weekly')
    day_of_week = models.CharField(max_length=20, blank=True, default='')
    notes = models.TextField(blank=True, default='')
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'kanban_cadence'
        ordering = ['order', 'id']

    def __str__(self):
        return f"{self.name} ({self.get_frequency_display()})"
