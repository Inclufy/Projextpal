from django.db import models
from django.conf import settings
import uuid


class Portfolio(models.Model):
    """Strategic Portfolio - highest organizational level"""
    
    STATUS_CHOICES = [
        ('planning', 'Planning'),
        ('active', 'Active'),
        ('on_hold', 'On Hold'),
        ('closed', 'Closed')
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    company = models.ForeignKey('accounts.Company', on_delete=models.CASCADE, related_name='portfolios', null=True, blank=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='owned_portfolios')
    
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='active')
    strategic_objectives = models.TextField(blank=True, help_text="High-level strategic objectives")
    budget_allocated = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Portfolios'
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class GovernanceBoard(models.Model):
    """Steering Committee, Program Board, Project Board"""
    
    BOARD_TYPES = [
        ('steering_committee', 'Steering Committee'),
        ('program_board', 'Program Board'),
        ('project_board', 'Project Board'),
        ('advisory_board', 'Advisory Board'),
        ('executive_board', 'Executive Board'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    board_type = models.CharField(max_length=50, choices=BOARD_TYPES)
    description = models.TextField(blank=True)
    
    # Link to Portfolio, Program, or Project
    portfolio = models.ForeignKey(Portfolio, on_delete=models.CASCADE, null=True, blank=True, related_name='boards')
    program = models.ForeignKey('programs.Program', on_delete=models.CASCADE, null=True, blank=True, related_name='governance_boards')
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, null=True, blank=True, related_name='governance_boards')
    
    meeting_frequency = models.CharField(max_length=100, blank=True)
    chair = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='chaired_boards')
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Governance Board'
        verbose_name_plural = 'Governance Boards'

    def __str__(self):
        return f"{self.get_board_type_display()} - {self.name}"


class BoardMember(models.Model):
    """Members of governance boards"""
    
    MEMBER_ROLES = [
        ('chair', 'Chair'),
        ('member', 'Member'),
        ('secretary', 'Secretary'),
        ('observer', 'Observer'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    board = models.ForeignKey(GovernanceBoard, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    role = models.CharField(max_length=50, choices=MEMBER_ROLES, default='member')
    
    joined_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ['board', 'user']
        verbose_name = 'Board Member'

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.email} - {self.board.name}"


class GovernanceStakeholder(models.Model):
    """Key stakeholders with governance roles and Power/Interest mapping"""
    
    STAKEHOLDER_ROLES = [
        ('executive_sponsor', 'Executive Sponsor'),
        ('senior_responsible_owner', 'Senior Responsible Owner'),
        ('business_change_manager', 'Business Change Manager'),
        ('project_executive', 'Project Executive'),
        ('key_stakeholder', 'Key Stakeholder'),
    ]
    
    INFLUENCE_LEVELS = [
        ('high', 'High - Decision Maker'),
        ('medium', 'Medium - Influencer'),
        ('low', 'Low - Informed'),
    ]
    
    INTEREST_LEVELS = [
        ('high', 'High Interest'),
        ('medium', 'Medium Interest'),
        ('low', 'Low Interest'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='governance_roles')
    role = models.CharField(max_length=50, choices=STAKEHOLDER_ROLES)
    influence_level = models.CharField(max_length=20, choices=INFLUENCE_LEVELS, default='medium')
    interest_level = models.CharField(max_length=20, choices=INTEREST_LEVELS, default='medium')
    
    # Link to entities
    portfolio = models.ForeignKey(Portfolio, on_delete=models.CASCADE, null=True, blank=True, related_name='stakeholders')
    program = models.ForeignKey('programs.Program', on_delete=models.CASCADE, null=True, blank=True, related_name='governance_stakeholders')
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, null=True, blank=True, related_name='governance_stakeholders')
    
    communication_plan = models.TextField(blank=True, help_text="How to engage this stakeholder")
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Governance Stakeholder'
        verbose_name_plural = 'Governance Stakeholders'

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.email} - {self.get_role_display()}"
    
    @property
    def stakeholder_quadrant(self):
        """Power/Interest Matrix quadrant for stakeholder management"""
        if self.influence_level == 'high' and self.interest_level == 'high':
            return 'manage_closely'  # Key Players
        elif self.influence_level == 'high' and self.interest_level in ['medium', 'low']:
            return 'keep_satisfied'  # Keep Satisfied
        elif self.influence_level in ['medium', 'low'] and self.interest_level == 'high':
            return 'keep_informed'  # Keep Informed
        else:
            return 'monitor'  # Monitor


class Decision(models.Model):
    """Programme-level governance decisions (steering board, sponsor calls, etc.)."""

    IMPACT_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    program = models.ForeignKey(
        'programs.Program', on_delete=models.CASCADE,
        null=True, blank=True, related_name='decisions',
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    decided_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='governance_decisions',
    )
    decided_at = models.DateTimeField(null=True, blank=True)
    impact = models.CharField(max_length=10, choices=IMPACT_CHOICES, default='medium')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    evidence = models.TextField(
        blank=True,
        help_text='Links / references to supporting artefacts (board minutes, business case, etc.)',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Decision'
        verbose_name_plural = 'Decisions'
        ordering = ['-decided_at', '-created_at']

    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"


class Meeting(models.Model):
    """Programme governance meetings (steering committee, programme board, etc.)."""

    TYPE_CHOICES = [
        ('steering', 'Steering Committee'),
        ('board', 'Programme Board'),
        ('working', 'Working Group'),
    ]

    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    program = models.ForeignKey(
        'programs.Program', on_delete=models.CASCADE,
        null=True, blank=True, related_name='governance_meetings',
    )
    title = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='steering')
    scheduled_at = models.DateTimeField(null=True, blank=True)
    facilitator = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='facilitated_meetings',
    )
    attendees = models.ManyToManyField(
        settings.AUTH_USER_MODEL, blank=True, related_name='attended_meetings'
    )
    agenda = models.TextField(blank=True)
    minutes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Governance Meeting'
        verbose_name_plural = 'Governance Meetings'
        ordering = ['-scheduled_at', '-created_at']

    def __str__(self):
        return f"{self.title} ({self.get_type_display()})"
