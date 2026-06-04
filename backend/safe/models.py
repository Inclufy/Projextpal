from django.db import models
from django.conf import settings
import uuid


class AgileReleaseTrain(models.Model):
    """Agile Release Train (ART) in SAFe"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    program = models.ForeignKey('programs.Program', on_delete=models.CASCADE, related_name='safe_arts')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    team_count = models.IntegerField(default=0)
    rte = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='managed_arts', help_text="Release Train Engineer")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Agile Release Train'

    def __str__(self):
        return f"{self.name} - {self.program.name}"


class ARTSync(models.Model):
    """ART Sync meetings"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    art = models.ForeignKey(AgileReleaseTrain, on_delete=models.CASCADE, related_name='syncs')
    meeting_date = models.DateField()
    attendees = models.JSONField(default=list)
    decisions = models.JSONField(default=list)
    impediments = models.JSONField(default=list, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-meeting_date']
        verbose_name = 'ART Sync'

    def __str__(self):
        return f"Sync {self.meeting_date} - {self.art.name}"


class ProgramIncrement(models.Model):
    """Program Increment (PI) in SAFe"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    program = models.ForeignKey('programs.Program', on_delete=models.CASCADE, related_name='safe_pis')
    name = models.CharField(max_length=200)
    iteration_count = models.IntegerField(default=5)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, default='planning', choices=[
        ('planning', 'Planning'),
        ('active', 'Active'),
        ('completed', 'Completed'),
    ])
    pi_planning_date = models.DateField(null=True, blank=True)
    innovation_sprint = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_date']
        verbose_name = 'Program Increment'

    def __str__(self):
        return f"{self.name} - {self.program.name}"


class PIObjective(models.Model):
    """PI Objectives for teams within a Program Increment"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pi = models.ForeignKey(ProgramIncrement, on_delete=models.CASCADE, related_name='objectives')
    description = models.TextField()
    business_value = models.IntegerField(default=0, help_text="Business value 1-10")
    actual_value = models.IntegerField(default=0, help_text="Actual delivered value 1-10 (scored at PI end)")
    committed = models.BooleanField(default=True)
    achieved = models.BooleanField(default=False)
    # Legacy free-text team label (kept for back-compat). New work links a real
    # ProgramTeam via assigned_team so objectives roll up per team.
    team = models.CharField(max_length=200, blank=True)
    assigned_team = models.ForeignKey(
        'programs.ProgramTeam', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='safe_pi_objectives',
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-business_value']
        verbose_name = 'PI Objective'

    def __str__(self):
        return f"BV:{self.business_value} - {self.description[:50]}"


class Feature(models.Model):
    """A SAFe Feature on the Program Kanban, prioritised by WSJF.

    WSJF (Weighted Shortest Job First) = Cost of Delay / Job Size, where
    Cost of Delay = Business Value + Time Criticality + Risk Reduction/Opportunity
    Enablement. Higher WSJF is sequenced first. Features decompose into Stories
    owned by individual ProgramTeams.
    """

    STATE_CHOICES = [
        ('funnel', 'Funnel'),
        ('analyzing', 'Analyzing'),
        ('backlog', 'Program Backlog'),
        ('implementing', 'Implementing'),
        ('validating', 'Validating'),
        ('done', 'Done'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pi = models.ForeignKey(
        ProgramIncrement, on_delete=models.CASCADE, related_name='features',
        null=True, blank=True,
        help_text="The PI this feature is planned into (null = still in the funnel/backlog).",
    )
    art = models.ForeignKey(
        AgileReleaseTrain, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='features',
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    benefit_hypothesis = models.TextField(blank=True, help_text="Why this feature delivers value.")
    # WSJF components (relative Fibonacci-ish scores).
    business_value = models.IntegerField(default=1, help_text="WSJF: user/business value")
    time_criticality = models.IntegerField(default=1, help_text="WSJF: time criticality")
    risk_reduction = models.IntegerField(default=1, help_text="WSJF: risk reduction / opportunity enablement")
    job_size = models.IntegerField(default=1, help_text="WSJF: job size (denominator)")
    state = models.CharField(max_length=20, choices=STATE_CHOICES, default='funnel')
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Default ordering surfaces the backlog in WSJF priority. WSJF can't be
        # ordered in the DB directly (it's computed), so views re-sort; this is
        # a stable fallback.
        ordering = ['order', '-business_value']
        verbose_name = 'SAFe Feature'

    def __str__(self):
        return f"{self.name} (WSJF {self.wsjf})"

    @property
    def cost_of_delay(self):
        return self.business_value + self.time_criticality + self.risk_reduction

    @property
    def wsjf(self):
        size = self.job_size or 0
        if size <= 0:
            return 0.0
        return round(self.cost_of_delay / size, 2)


class Story(models.Model):
    """A team-level Story decomposed from a Feature and owned by a ProgramTeam."""

    STATE_CHOICES = [
        ('backlog', 'Backlog'),
        ('in_progress', 'In Progress'),
        ('done', 'Done'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    feature = models.ForeignKey(Feature, on_delete=models.CASCADE, related_name='stories')
    team = models.ForeignKey(
        'programs.ProgramTeam', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='safe_stories',
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    story_points = models.IntegerField(default=0)
    state = models.CharField(max_length=20, choices=STATE_CHOICES, default='backlog')
    iteration = models.IntegerField(null=True, blank=True, help_text="Iteration (sprint) number within the PI.")
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'created_at']
        verbose_name = 'SAFe Story'

    def __str__(self):
        return f"{self.title} ({self.get_state_display()})"


class Dependency(models.Model):
    """A cross-team/feature dependency surfaced on the Program Board and risk-
    managed with ROAM (Resolved / Owned / Accepted / Mitigated)."""

    ROAM_CHOICES = [
        ('resolved', 'Resolved'),
        ('owned', 'Owned'),
        ('accepted', 'Accepted'),
        ('mitigated', 'Mitigated'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pi = models.ForeignKey(ProgramIncrement, on_delete=models.CASCADE, related_name='dependencies')
    # The feature that needs something (source) from another feature (target).
    source_feature = models.ForeignKey(
        Feature, on_delete=models.CASCADE, related_name='outgoing_dependencies',
    )
    target_feature = models.ForeignKey(
        Feature, on_delete=models.CASCADE, related_name='incoming_dependencies',
        null=True, blank=True,
    )
    description = models.TextField(blank=True)
    roam = models.CharField(
        max_length=12, choices=ROAM_CHOICES, blank=True,
        help_text="ROAM disposition. Blank = not yet triaged.",
    )
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='safe_dependencies',
    )
    needed_by_iteration = models.IntegerField(null=True, blank=True)
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['needed_by_iteration', '-created_at']
        verbose_name = 'SAFe Dependency'
        verbose_name_plural = 'SAFe Dependencies'

    def __str__(self):
        return f"{self.source_feature.name} → {self.target_feature.name if self.target_feature else '?'} ({self.roam or 'untriaged'})"


class SystemDemo(models.Model):
    """The PI System Demo — the meaningful, integrated milestone at iteration end."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pi = models.ForeignKey(ProgramIncrement, on_delete=models.CASCADE, related_name='system_demos')
    iteration = models.IntegerField(default=1, help_text="Iteration number within the PI.")
    demo_date = models.DateField(null=True, blank=True)
    summary = models.TextField(blank=True)
    feedback = models.TextField(blank=True)
    features_demoed = models.ManyToManyField(Feature, blank=True, related_name='demos')
    attendees = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['iteration']
        verbose_name = 'System Demo'

    def __str__(self):
        return f"System Demo I{self.iteration} - {self.pi.name}"


class InspectAdapt(models.Model):
    """The PI Inspect & Adapt event — quantitative measurement (PI predictability)
    plus a problem-solving workshop that yields improvement backlog items."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pi = models.OneToOneField(ProgramIncrement, on_delete=models.CASCADE, related_name='inspect_adapt')
    event_date = models.DateField(null=True, blank=True)
    # PI predictability = actual business value achieved / planned business value.
    # Stored as a percentage snapshot taken at the event (the live value is also
    # computable from objectives).
    predictability = models.IntegerField(null=True, blank=True, help_text="PI predictability %, snapshotted at the event.")
    problems = models.JSONField(default=list, blank=True, help_text="Problem-solving workshop items.")
    improvement_items = models.JSONField(default=list, blank=True, help_text="Improvement backlog items for the next PI.")
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Inspect & Adapt'
        verbose_name_plural = 'Inspect & Adapt'

    def __str__(self):
        return f"I&A - {self.pi.name}"
