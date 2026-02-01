from django.db import models
from django.conf import settings


class Program(models.Model):
    """Program management model for coordinating multiple related projects."""

    METHODOLOGY_CHOICES = [
        ("safe", "SAFe (Scaled Agile Framework)"),
        ("msp", "MSP (Managing Successful Programmes)"),
        ("pmi", "PMI Program Management"),
        ("prince2_programme", "PRINCE2 Programme"),
        ("hybrid", "Hybrid"),
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
    name = models.CharField(max_length=255)
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