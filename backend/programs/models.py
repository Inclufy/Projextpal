from django.db import models
from django.conf import settings


class Program(models.Model):
    """Program management model for coordinating multiple related projects."""

    METHODOLOGY_CHOICES = [
        ("inclufy", "Inclufy Best Practice"),
        ("safe", "SAFe (Scaled Agile Framework)"),
        ("msp", "MSP (Managing Successful Programmes)"),
        ("pmi", "PMI Program Management"),
        ("prince2_programme", "PRINCE2 Programme"),
        ("p2_programme", "P2 Programme (PRINCE2-based blueprint)"),
        ("hybrid", "Hybrid"),
        ("hybrid_programme", "Hybrid Programme"),
    ]

    STATUS_CHOICES = [
        ("planning", "Planning"),
        ("active", "Active"),
        ("on_hold", "On Hold"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    HEALTH_CHOICES = [
        ("green", "On Track"),
        ("amber", "At Risk"),
        ("red", "Critical"),
    ]

    CURRENCY_CHOICES = [
        ("EUR", "Euro"),
        ("USD", "US Dollar"),
        ("GBP", "British Pound"),
    ]

    # Basic Information
    company = models.ForeignKey(
        "accounts.Company", on_delete=models.CASCADE, related_name="programs"
    )
    portfolio = models.ForeignKey(
        "governance.Portfolio", on_delete=models.SET_NULL, null=True, blank=True, related_name="programs"
    )
    name = models.CharField(max_length=255)
    program_code = models.CharField(
        max_length=64, blank=True, db_index=True,
        help_text="Code used by finance/admin systems for invoice matching (e.g. 'PG-2026-001').",
    )
    description = models.TextField(blank=True)
    strategic_objective = models.TextField(blank=True, help_text="Strategic objective this program supports")
    
    # Methodology and Status
    methodology = models.CharField(max_length=50, choices=METHODOLOGY_CHOICES, default="hybrid")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="planning")
    health_status = models.CharField(max_length=10, choices=HEALTH_CHOICES, default="green")
    
    # Timeline
    start_date = models.DateField(null=True, blank=True)
    target_end_date = models.DateField(null=True, blank=True)
    actual_end_date = models.DateField(null=True, blank=True)
    
    # Budget
    total_budget = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    spent_budget = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default="EUR")
    
    # People
    program_manager = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="managed_programs",
    )
    executive_sponsor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sponsored_programs",
    )
    
    # Related Projects (Many-to-Many)
    projects = models.ManyToManyField(
        "projects.Project",
        blank=True,
        related_name="programs",
    )
    
    # Metadata
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_programs",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["company", "status"]),
            models.Index(fields=["company", "methodology"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.company.name})"

    @property
    def progress(self):
        """Calculate overall program progress based on linked projects."""
        linked_projects = self.projects.all()
        if not linked_projects.exists():
            return 0
        
        total_progress = 0
        for project in linked_projects:
            total_progress += project.compute_progress_from_work()
        
        return int(round(total_progress / linked_projects.count()))

    @property
    def project_count(self):
        """Return number of linked projects."""
        return self.projects.count()

    @property
    def budget_variance(self):
        """Calculate budget variance."""
        return self.total_budget - self.spent_budget


class ProgramTeam(models.Model):
    """Team members assigned to a program."""

    program = models.ForeignKey(
        Program, on_delete=models.CASCADE, related_name="team_members"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="program_teams"
    )
    role = models.CharField(max_length=100, blank=True)
    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="added_program_team_members",
    )
    added_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ["program", "user"]
        ordering = ["-added_at"]

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.email} - {self.program.name}"

    # ------------------------------------------------------------------
    # S4-11 — team-membership cascade for time registration.
    # ------------------------------------------------------------------
    # Why this lives on ProgramTeam (and not a signal):
    #   * explicit opt-in — the admin UI shows a project checklist on add,
    #     so this cascade only runs when the admin asks for it;
    #   * idempotent — safe to call repeatedly without creating duplicates
    #     or re-activating a row the admin deliberately took out;
    #   * tenant-safe — only projects whose program == self.program are
    #     touched, so this can never leak across tenants.
    def cascade_to_project_teams(self, project_ids=None, added_by=None):
        """Create ProjectTeam rows under this program's projects for this user.

        Args:
            project_ids: iterable of project ids to cascade into. ``None``
                means "every project linked to this program" (the common
                case from the admin UI's default-checked list). An empty
                iterable is a no-op.
            added_by: user recorded on the created ProjectTeam rows. Falls
                back to ``self.added_by`` so the cascade keeps the same
                provenance as the ProgramTeam row that triggered it.

        Returns:
            A ``(created, skipped)`` tuple of ``ProjectTeam`` querysets /
            lists for the caller to report back as ``created_project_teams``
            and ``skipped_duplicates``.

        Methodology choice (deliberately opinionated, see S4-11 spec):
            * ``is_active=True`` — the cascaded member is immediately live
              on the project.
            * ``can_view_costs=True`` — a program-manager who was added at
              the program level needs the financial view on the project
              too; admins can downgrade later.
            * ``hourly_rate=0`` — unknown at cascade time; the admin fills
              it in when needed.
            * ``role`` is NOT set here — ProjectTeam has no per-project
              role field; the user's CustomUser.role (e.g.
              ``program_manager``) is what the rest of the app reads.
        """
        # Deferred import — projects imports accounts which imports programs;
        # at module-import time projects.models is not yet loaded.
        from projects.models import ProjectTeam

        # Resolve the target project set. ``None`` → every project linked to
        # this program; a list stays as given but is intersected with the
        # program's linked projects so a caller can never slip a project
        # from another program (or another tenant) into the cascade.
        linked_ids = set(self.program.projects.values_list("id", flat=True))
        if project_ids is None:
            target_ids = linked_ids
        else:
            try:
                requested = {int(pid) for pid in project_ids}
            except (TypeError, ValueError):
                requested = set()
            target_ids = requested & linked_ids

        if not target_ids:
            return [], []

        provenance = added_by or self.added_by

        existing_project_ids = set(
            ProjectTeam.objects.filter(
                project_id__in=target_ids, user=self.user,
            ).values_list("project_id", flat=True)
        )

        created = []
        skipped = []
        for pid in target_ids:
            if pid in existing_project_ids:
                skipped.append(pid)
                continue
            pt = ProjectTeam.objects.create(
                project_id=pid,
                user=self.user,
                added_by=provenance,
                is_active=True,
                can_view_costs=True,
                hourly_rate=0,
            )
            created.append(pt)
        return created, skipped


class ProgramBenefit(models.Model):
    """Benefits tracking for programs."""

    STATUS_CHOICES = [
        ("identified", "Identified"),
        ("planned", "Planned"),
        ("in_progress", "In Progress"),
        ("realized", "Realized"),
        ("not_achieved", "Not Achieved"),
    ]

    CATEGORY_CHOICES = [
        ("financial", "Financial"),
        ("operational", "Operational"),
        ("strategic", "Strategic"),
        ("customer", "Customer"),
        ("employee", "Employee"),
    ]

    program = models.ForeignKey(
        Program, on_delete=models.CASCADE, related_name="benefits"
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default="operational")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="identified")
    
    # Measurement
    target_value = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    actual_value = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    measurement_unit = models.CharField(max_length=50, blank=True)
    
    # Timeline
    expected_date = models.DateField(null=True, blank=True)
    realized_date = models.DateField(null=True, blank=True)
    
    # Owner
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="owned_benefits",
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} - {self.program.name}"


class ProgramRisk(models.Model):
    """Risk management for programs."""

    IMPACT_CHOICES = [
        ("high", "High"),
        ("medium", "Medium"),
        ("low", "Low"),
    ]

    PROBABILITY_CHOICES = [
        ("high", "High"),
        ("medium", "Medium"),
        ("low", "Low"),
    ]

    STATUS_CHOICES = [
        ("open", "Open"),
        ("mitigating", "Mitigating"),
        ("mitigated", "Mitigated"),
        ("closed", "Closed"),
    ]

    program = models.ForeignKey(
        Program, on_delete=models.CASCADE, related_name="risks"
    )
    name = models.CharField(max_length=255)
    description = models.TextField()
    impact = models.CharField(max_length=20, choices=IMPACT_CHOICES, default="medium")
    probability = models.CharField(max_length=20, choices=PROBABILITY_CHOICES, default="medium")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="open")
    mitigation_plan = models.TextField(blank=True)
    
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="owned_program_risks",
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} - {self.program.name}"


class ProgramMilestone(models.Model):
    """Program-level milestones."""

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("delayed", "Delayed"),
    ]

    program = models.ForeignKey(
        Program, on_delete=models.CASCADE, related_name="milestones"
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    target_date = models.DateField()
    actual_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["target_date"]

    def __str__(self):
        return f"{self.name} - {self.program.name}"

# ========================================
# ADD THESE TO THE END OF programs/models.py
# ========================================

class ProgramBudget(models.Model):
    """Overall budget tracking per program"""
    program = models.OneToOneField(
        Program,
        on_delete=models.CASCADE,
        related_name='program_budget'
    )
    total_budget = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default='EUR')
    period_start = models.DateField(null=True, blank=True)
    period_end = models.DateField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Program Budget'
        verbose_name_plural = 'Program Budgets'

    def __str__(self):
        return f"Budget - {self.program.name}"

    @property
    def total_spent(self):
        """Calculate total spent from program budget items"""
        return self.program.program_budget_items.filter(
            status='approved',
            type='expense'
        ).aggregate(
            total=models.Sum('amount')
        )['total'] or 0

    @property
    def total_remaining(self):
        """Calculate remaining budget"""
        return float(self.total_budget) - float(self.total_spent)

    @property
    def projects_budget(self):
        """Sum of all linked projects budgets"""
        return self.program.projects.aggregate(
            total=models.Sum('budget')
        )['total'] or 0


class ProgramBudgetCategory(models.Model):
    """Budget categories for program-level expenses"""
    name = models.CharField(max_length=100)
    program = models.ForeignKey(
        Program,
        on_delete=models.CASCADE,
        related_name='budget_categories'
    )
    allocated = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    color = models.CharField(max_length=7, blank=True, null=True)
    icon = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Program Budget Categories'
        ordering = ['name']
        unique_together = ['name', 'program']

    def __str__(self):
        return f"{self.name} - {self.program.name}"

    @property
    def spent(self):
        """Calculate total spent in this category"""
        return self.program_budget_items.filter(
            status='approved'
        ).aggregate(
            total=models.Sum('amount')
        )['total'] or 0

    @property
    def remaining(self):
        """Calculate remaining budget"""
        return float(self.allocated) - float(self.spent)


class ProgramBudgetItem(models.Model):
    """Budget items for programs"""
    TYPE_CHOICES = [
        ('expense', 'Expense'),
        ('income', 'Income'),
        ('transfer', 'Transfer'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    program = models.ForeignKey(
        Program,
        on_delete=models.CASCADE,
        related_name='program_budget_items'
    )
    category = models.ForeignKey(
        ProgramBudgetCategory,
        on_delete=models.SET_NULL,
        null=True,
        related_name='program_budget_items'
    )
    description = models.TextField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateField()
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='expense')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_program_budget_items'
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_program_budget_items'
    )
    
    receipt_url = models.URLField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    rejection_reason = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']
        verbose_name = 'Program Budget Item'
        verbose_name_plural = 'Program Budget Items'

    def __str__(self):
        return f"{self.description} - €{self.amount} - {self.program.name}"

class ProgramTailoring(models.Model):
    """Tailoring decision for a programme (the programme-wizard outcome).
    Mirrors projects.ProjectTailoring at programme scale — drives the
    'Aanbevolen vs Meer' surfacing and records the tailoring justification."""

    SHAPE_CHOICES = [("light", "Light"), ("medium", "Medium"), ("heavy", "Heavy")]
    SOURCE_CHOICES = [("ai", "AI"), ("manual", "Manual"), ("scenario", "Scenario")]
    BOARD_CHOICES = [("auto", "AI bepaalt"), ("light", "Lichte review"), ("formal", "Formele board")]
    AUTH_CHOICES = [("owner", "Alleen programmabestuur"), ("owner_pm", "Bestuur + programmamanager")]

    program = models.OneToOneField("Program", on_delete=models.CASCADE, related_name="tailoring")
    project_type = models.CharField(max_length=40, blank=True, default="")

    dim_scope = models.PositiveSmallIntegerField(default=3)
    dim_budget = models.PositiveSmallIntegerField(default=2)
    dim_duur = models.PositiveSmallIntegerField(default=3)
    dim_politiek = models.PositiveSmallIntegerField(default=2)
    dim_risico = models.PositiveSmallIntegerField(default=2)
    dim_regel = models.PositiveSmallIntegerField(default=1)

    team_size = models.CharField(max_length=4, blank=True, default="l")
    departments = models.PositiveSmallIntegerField(default=2)

    gov_authority = models.CharField(max_length=12, choices=AUTH_CHOICES, default="owner")
    gov_board = models.CharField(max_length=8, choices=BOARD_CHOICES, default="auto")
    gov_portfolio = models.BooleanField(default=False)
    gov_stakeholder_matrix = models.BooleanField(default=False)
    gov_periodic_cadence = models.BooleanField(default=False)

    shape = models.CharField(max_length=8, choices=SHAPE_CHOICES, default="heavy")
    score = models.PositiveSmallIntegerField(default=14)
    recommended_modules = models.JSONField(default=list, blank=True)
    coach_mode = models.BooleanField(default=False)
    ai_rationale = models.TextField(blank=True, default="")
    source = models.CharField(max_length=10, choices=SOURCE_CHOICES, default="manual")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"ProgramTailoring<{self.program_id}> {self.shape}"

    @property
    def dimensions(self):
        return {
            "scope": self.dim_scope, "budget": self.dim_budget, "duur": self.dim_duur,
            "politiek": self.dim_politiek, "risico": self.dim_risico, "regel": self.dim_regel,
        }


class ProgramAIContext(models.Model):
    """Snapshot van door de gebruiker geüploade documenten die als context
    gelden voor élke AI-call op dit programma (Programme AI-advisor, Benefits
    Map draft, Ask Co-pilot bij een programme, …).

    Spiegeltje van ``projects.ProjectAIContext`` maar op programme-niveau:
    denk aan een programme-charter, meerjarenplan, business-case portefeuille
    of MSP Blueprint-input die voor élk constituent-project én voor élke
    AI-draft op het programma geldt.

    Opgezet als 1-op-1 met Program (niet als veld op Program zelf) zodat
    parallelle feature-branches op ``programs/models.py`` niet collider op
    hetzelfde model.

    ``extracted_text`` is al door ``plan_from_documents`` getrimd + genormalis-
    eerd; we knippen hier op 50_000 tekens om DB-grootte in de hand te
    houden (ruim voor een gemiddeld programma-dossier)."""

    MAX_TEXT = 50_000

    program = models.OneToOneField(
        Program, on_delete=models.CASCADE, related_name="ai_context",
    )
    enabled = models.BooleanField(
        default=True,
        help_text="If false, the AI endpoints will ignore this context even "
                  "though it is stored (soft off-switch).",
    )
    extracted_text = models.TextField(blank=True, default="")
    source_files = models.JSONField(
        default=list, blank=True,
        help_text="List of {name, size, pages} dicts for traceability.",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Program AI Context"

    def __str__(self):
        return f"AI-context<program={self.program_id}> enabled={self.enabled}"

    def save(self, *args, **kwargs):
        if self.extracted_text and len(self.extracted_text) > self.MAX_TEXT:
            self.extracted_text = self.extracted_text[: self.MAX_TEXT]
        super().save(*args, **kwargs)
