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
    
    PRIORITY_CHOICES = [
        ('critical', 'Critical'),
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    company = models.ForeignKey('accounts.Company', on_delete=models.CASCADE, related_name='portfolios', null=True, blank=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='owned_portfolios')

    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='active')
    strategic_objectives = models.TextField(blank=True, help_text="High-level strategic objectives")
    budget_allocated = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    # Portfolio prioritisation: rank orders the funded components, priority is
    # the qualitative band. Funding decisions are made against this ordering.
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    rank = models.PositiveIntegerField(default=0, help_text="Lower = higher priority in the funded queue")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Portfolios'
        ordering = ['rank', '-created_at']

    def __str__(self):
        return self.name

    @property
    def total_funded(self):
        """Sum of approved funding allocations against this portfolio."""
        from decimal import Decimal
        agg = self.funding_allocations.filter(status='approved').aggregate(
            total=models.Sum('amount')
        )
        return agg['total'] or Decimal('0')

    @property
    def remaining_budget(self):
        """Allocated budget minus already-approved funding. None if no budget set."""
        if self.budget_allocated is None:
            return None
        return self.budget_allocated - self.total_funded


class ComponentFunding(models.Model):
    """A funding allocation from a Portfolio to one of its components (a program
    or a project) for a fiscal period. Turns the portfolio's budget from a
    single number into an auditable ledger: the sum of approved allocations
    cannot exceed the portfolio's allocated budget."""

    STATUS_CHOICES = [
        ('requested', 'Requested'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    portfolio = models.ForeignKey(
        Portfolio, on_delete=models.CASCADE, related_name='funding_allocations'
    )
    program = models.ForeignKey(
        'programs.Program', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='portfolio_funding'
    )
    project = models.ForeignKey(
        'projects.Project', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='portfolio_funding'
    )
    title = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.CharField(max_length=8, default='EUR')
    fiscal_period = models.CharField(max_length=32, blank=True, help_text="e.g. FY2026 or Q1-2026")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='requested')
    rationale = models.TextField(blank=True)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='approved_fundings'
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='created_fundings'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Component Funding'
        verbose_name_plural = 'Component Fundings'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.amount} {self.currency})"


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
    # Quorum: the minimum number of APPROVE votes a board-level decision needs
    # before it can be applied. 0 = no formal vote required (default, backward
    # compatible). >0 makes board decisions binding only with enough support.
    quorum = models.PositiveIntegerField(
        default=0, help_text="Minimum approve votes required to pass a board decision (0 = no vote required)"
    )

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
    # Stakeholder engagement assessment (PMBOK/MSP): current vs desired
    # engagement on the unaware→leading scale. The gap drives the engagement
    # actions in the communication plan.
    ENGAGEMENT_LEVELS = [
        ('unaware', 'Unaware'),
        ('resistant', 'Resistant'),
        ('neutral', 'Neutral'),
        ('supportive', 'Supportive'),
        ('leading', 'Leading'),
    ]
    current_engagement = models.CharField(max_length=20, choices=ENGAGEMENT_LEVELS, default='neutral')
    desired_engagement = models.CharField(max_length=20, choices=ENGAGEMENT_LEVELS, default='supportive')
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Governance Stakeholder'
        verbose_name_plural = 'Governance Stakeholders'

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.email} - {self.get_role_display()}"
    
    _ENGAGEMENT_ORDER = ['unaware', 'resistant', 'neutral', 'supportive', 'leading']

    @property
    def engagement_gap(self):
        """Steps the stakeholder must move from current to desired engagement.
        Positive = needs more engagement; 0 = at/above target."""
        try:
            cur = self._ENGAGEMENT_ORDER.index(self.current_engagement)
            des = self._ENGAGEMENT_ORDER.index(self.desired_engagement)
        except ValueError:
            return 0
        return max(0, des - cur)

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

    # Outcome drives what the decision *does* to its target component when
    # applied (P0-1). authorize/continue → make the component active;
    # hold → on_hold; stop → terminate.
    OUTCOME_CHOICES = [
        ('authorize', 'Authorize'),
        ('continue', 'Continue'),
        ('hold', 'Hold'),
        ('stop', 'Stop'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    program = models.ForeignKey(
        'programs.Program', on_delete=models.CASCADE,
        null=True, blank=True, related_name='decisions',
    )
    # Board-level decision: a Decision can be tied to a specific GovernanceBoard
    # (e.g. taken by the Steering Committee). SET_NULL so deleting the board
    # leaves the decision history intact.
    board = models.ForeignKey(
        'governance.GovernanceBoard', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='decisions',
    )
    # Meeting-level decision: most decisions are taken IN a specific meeting,
    # which makes the audit trail much stronger. SET_NULL preserves history.
    meeting = models.ForeignKey(
        'governance.Meeting', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='decisions',
    )
    # Risk-driven decision: a Decision may be taken specifically in response
    # to a Risk (mitigation accepted, owner reassigned, escalation closed,
    # etc.). Cross-app FK uses string reference. SET_NULL preserves the
    # decision history if the risk is archived.
    risk = models.ForeignKey(
        'projects.Risk', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='governance_decisions',
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
    outcome = models.CharField(
        max_length=12, choices=OUTCOME_CHOICES, blank=True,
        help_text='What this decision does to its target component when applied.',
    )
    # Exactly one of these target FKs should be set when an outcome is to be
    # applied. Nullable explicit FKs (not generic content_type) keep the
    # cross-tenant scoping queries straightforward.
    authorized_project = models.ForeignKey(
        'projects.Project', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='authorizing_decisions',
    )
    authorized_program = models.ForeignKey(
        'programs.Program', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='authorizing_decisions',
    )
    authorized_portfolio = models.ForeignKey(
        'governance.Portfolio', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='authorizing_decisions',
    )
    # Set once the outcome has been applied to the target. Non-null makes the
    # decision append-only (no further edits) — a governance audit invariant.
    applied_at = models.DateTimeField(null=True, blank=True)
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

    # outcome → target status, per target kind (each model has its own vocab).
    _OUTCOME_STATUS = {
        'project': {'authorize': 'in_progress', 'continue': 'in_progress', 'hold': 'on_hold', 'stop': 'cancelled'},
        'program': {'authorize': 'active', 'continue': 'active', 'hold': 'on_hold', 'stop': 'cancelled'},
        'portfolio': {'authorize': 'active', 'continue': 'active', 'hold': 'on_hold', 'stop': 'closed'},
    }

    def get_target(self):
        """Return (kind, instance) for the single linked component, or (None, None)."""
        if self.authorized_project_id:
            return 'project', self.authorized_project
        if self.authorized_program_id:
            return 'program', self.authorized_program
        if self.authorized_portfolio_id:
            return 'portfolio', self.authorized_portfolio
        return None, None

    def target_status_for_outcome(self, kind):
        return self._OUTCOME_STATUS.get(kind, {}).get(self.outcome)

    def vote_tally(self):
        """Return {approve, reject, abstain, total} for this decision's votes."""
        tally = {'approve': 0, 'reject': 0, 'abstain': 0, 'total': 0}
        for v in self.votes.all():
            if v.vote in tally:
                tally[v.vote] += 1
            tally['total'] += 1
        return tally

    def quorum_check(self):
        """Enforce the board's quorum on a board-level decision.

        Returns (ok, blockers). A board decision needs at least `board.quorum`
        APPROVE votes AND a strict majority of cast (non-abstain) votes. Boards
        with quorum 0 (or no board) are unconstrained → (True, [])."""
        board = self.board
        if board is None or not board.quorum:
            return True, []
        tally = self.vote_tally()
        blockers = []
        if tally['approve'] < board.quorum:
            blockers.append(
                f"Needs {board.quorum} approve vote(s); has {tally['approve']}."
            )
        decisive = tally['approve'] + tally['reject']
        if decisive and tally['approve'] <= tally['reject']:
            blockers.append(
                f"Approve votes ({tally['approve']}) must outnumber reject votes ({tally['reject']})."
            )
        return (len(blockers) == 0), blockers


class DecisionVote(models.Model):
    """A board member's recorded vote on a governance Decision. Makes a
    board-level decision binding: it can only be applied once the board's
    quorum of approve votes is reached (see Decision.quorum_check)."""

    VOTE_CHOICES = [
        ('approve', 'Approve'),
        ('reject', 'Reject'),
        ('abstain', 'Abstain'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    decision = models.ForeignKey(
        Decision, on_delete=models.CASCADE, related_name='votes'
    )
    voter = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='decision_votes'
    )
    vote = models.CharField(max_length=10, choices=VOTE_CHOICES)
    rationale = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['decision', 'voter']
        verbose_name = 'Decision Vote'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.voter} → {self.vote} on {self.decision.title}"


class DecisionAuditLog(models.Model):
    """Append-only audit row written each time a Decision outcome is applied
    to a component (P0-1). Immutable: rows cannot be edited once created."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # SET_NULL + denormalised title so the trail survives a decision deletion.
    decision = models.ForeignKey(
        'governance.Decision', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='audit_logs',
    )
    decision_title = models.CharField(max_length=255, blank=True)
    outcome = models.CharField(max_length=12, blank=True)
    target_kind = models.CharField(max_length=16)
    target_id = models.CharField(max_length=64)
    previous_status = models.CharField(max_length=32, blank=True)
    new_status = models.CharField(max_length=32, blank=True)
    applied_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='applied_decision_audits',
    )
    applied_at = models.DateTimeField(auto_now_add=True)
    note = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Decision Audit Log'
        verbose_name_plural = 'Decision Audit Logs'
        ordering = ['-applied_at']

    def __str__(self):
        return f"{self.decision_title}: {self.target_kind} → {self.new_status}"

    def save(self, *args, **kwargs):
        # Immutable: only the initial insert is allowed.
        if self.pk is not None and DecisionAuditLog.objects.filter(pk=self.pk).exists():
            raise ValueError("DecisionAuditLog rows are append-only and cannot be modified.")
        super().save(*args, **kwargs)


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
    # Board-level meeting: a Meeting can be tied to a specific GovernanceBoard
    # (e.g. a regular Steering Committee meeting). SET_NULL so deleting the
    # board leaves the meeting history intact. Used by BoardDetail's Meetings
    # panel to query precisely by board instead of falling back to program-
    # scoped + filtering.
    board = models.ForeignKey(
        'governance.GovernanceBoard', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='meetings_explicit',
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


class MeetingAction(models.Model):
    """A tracked action item coming out of a governance Meeting (P0-2).

    Minutes used to be dead text — a meeting could 'agree' on follow-ups with
    no record of who owns them or whether they ever closed. A MeetingAction
    gives each follow-up an owner, a due date, and a lifecycle, so an open or
    overdue action has consequence instead of disappearing into prose.
    """

    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('done', 'Done'),
        ('cancelled', 'Cancelled'),
    ]

    # Terminal states close the action — closed_at is stamped on entry.
    CLOSED_STATUSES = frozenset({'done', 'cancelled'})

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    meeting = models.ForeignKey(
        'governance.Meeting', on_delete=models.CASCADE,
        related_name='actions',
    )
    description = models.TextField()
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='governance_meeting_actions',
    )
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default='open')
    # Stamped automatically when status enters a terminal state (done/cancelled).
    closed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Meeting Action'
        verbose_name_plural = 'Meeting Actions'
        # Open + overdue first (soonest due date), then newest.
        ordering = ['status', 'due_date', '-created_at']

    def __str__(self):
        return f"{self.description[:40]} ({self.get_status_display()})"

    @property
    def is_overdue(self):
        """Open/in-progress action whose due date has passed."""
        from django.utils import timezone
        if self.status in self.CLOSED_STATUSES or not self.due_date:
            return False
        return self.due_date < timezone.now().date()
