from django.db import models
from django.conf import settings
import uuid


class MSPBenefit(models.Model):
    """Benefits management for MSP programmes"""

    STATUS_CHOICES = [
        ('identified', 'Identified'),
        ('planned', 'Planned'),
        ('realizing', 'Realizing'),
        ('realized', 'Realized'),
    ]

    BENEFIT_TYPE_CHOICES = [
        ('financial', 'Financial'),
        ('non_financial', 'Non-Financial'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    program = models.ForeignKey('programs.Program', on_delete=models.CASCADE, related_name='msp_benefits')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    benefit_type = models.CharField(max_length=20, choices=BENEFIT_TYPE_CHOICES, default='financial')
    # A benefit needs a BASELINE to compute variance, not just a target. Before
    # this field only a baseline_DATE existed, so actual-vs-baseline variance was
    # uncomputable (the AC for #35).
    baseline_value = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True,
                                         help_text="Starting measurement the benefit improves from.")
    target_value = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    measurement_method = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='identified')
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    baseline_date = models.DateField(null=True, blank=True)
    target_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'MSP Benefit'

    def __str__(self):
        return f"{self.name} - {self.program.name}"

    @property
    def latest_actual(self):
        """Most recent measured value, or None if never measured."""
        latest = self.realizations.order_by('-measurement_date', '-created_at').first()
        return latest.actual_value if latest else None

    @property
    def variance(self):
        """Actual movement vs baseline (latest_actual - baseline_value)."""
        actual = self.latest_actual
        if actual is None or self.baseline_value is None:
            return None
        return actual - self.baseline_value


class BenefitRealization(models.Model):
    """Tracking actual benefit realization over time"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    benefit = models.ForeignKey(MSPBenefit, on_delete=models.CASCADE, related_name='realizations')
    actual_value = models.DecimalField(max_digits=15, decimal_places=2)
    measurement_date = models.DateField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-measurement_date']
        verbose_name = 'Benefit Realization'

    def __str__(self):
        return f"{self.benefit.name} - {self.measurement_date}: {self.actual_value}"


class MSPTranche(models.Model):
    """Programme tranches for MSP"""

    STATUS_CHOICES = [
        ('planning', 'Planning'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('closed', 'Closed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    program = models.ForeignKey('programs.Program', on_delete=models.CASCADE, related_name='msp_tranches')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    sequence = models.PositiveIntegerField(default=1)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planning')
    budget = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    # An MSP tranche closes at an end-of-tranche review where benefits realized so
    # far are assessed and the programme decides whether to continue. The boundary
    # review must be done before the tranche can close (the gate, #35).
    boundary_review_done = models.BooleanField(default=False)
    boundary_review_notes = models.TextField(blank=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['sequence']
        verbose_name = 'MSP Tranche'

    def __str__(self):
        return f"{self.name} (Tranche {self.sequence}) - {self.program.name}"


class MSPBlueprint(models.Model):
    """The programme Blueprint — the POTI model of the future (target) operating
    state the programme is steering toward, plus the programme Vision."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    program = models.OneToOneField('programs.Program', on_delete=models.CASCADE, related_name='msp_blueprint')
    vision = models.TextField(blank=True, help_text="The compelling future-state vision statement.")
    # POTI — Processes, Organisation, Technology, Information.
    processes = models.TextField(blank=True, help_text="Future-state business processes / ways of working.")
    organisation = models.TextField(blank=True, help_text="Future-state structure, roles, skills, culture.")
    technology = models.TextField(blank=True, help_text="Future-state technology, tools, infrastructure.")
    information = models.TextField(blank=True, help_text="Future-state data / information requirements.")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'MSP Blueprint'

    def __str__(self):
        return f"Blueprint - {self.program.name}"


class MSPTransition(models.Model):
    """A step that embeds change into business-as-usual, owned by the Business
    Change Manager (BCM)."""

    STATUS_CHOICES = [
        ('planned', 'Planned'),
        ('in_progress', 'In Progress'),
        ('embedded', 'Embedded'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    program = models.ForeignKey('programs.Program', on_delete=models.CASCADE, related_name='msp_transitions')
    tranche = models.ForeignKey(MSPTranche, on_delete=models.SET_NULL, null=True, blank=True, related_name='transitions')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    bcm = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
                            related_name='msp_business_change_transitions', help_text="Business Change Manager")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planned')
    planned_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['planned_date', '-created_at']
        verbose_name = 'MSP Transition'

    def __str__(self):
        return f"{self.name} - {self.program.name}"
