from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal


# =============================================================================
# DEFINE PHASE MODELS
# =============================================================================

class SIPOCDiagram(models.Model):
    """SIPOC (Suppliers, Inputs, Process, Outputs, Customers) Diagram"""
    project = models.OneToOneField(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='sipoc_diagram'
    )
    process_name = models.CharField(max_length=255)
    process_description = models.TextField(blank=True)
    process_start = models.TextField(help_text="Process trigger/start point")
    process_end = models.TextField(help_text="Process end point/deliverable")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_sipocs'
    )

    class Meta:
        verbose_name = "SIPOC Diagram"
        verbose_name_plural = "SIPOC Diagrams"

    def __str__(self):
        return f"SIPOC - {self.project.name}"


class SIPOCItem(models.Model):
    """Individual items in a SIPOC diagram"""
    CATEGORY_CHOICES = [
        ('suppliers', 'Suppliers'),
        ('inputs', 'Inputs'),
        ('process', 'Process Steps'),
        ('outputs', 'Outputs'),
        ('customers', 'Customers'),
    ]
    
    sipoc = models.ForeignKey(
        SIPOCDiagram,
        on_delete=models.CASCADE,
        related_name='items'
    )
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    description = models.TextField()
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['category', 'order']
        verbose_name = "SIPOC Item"
        verbose_name_plural = "SIPOC Items"

    def __str__(self):
        return f"{self.get_category_display()}: {self.description[:50]}"


class VoiceOfCustomer(models.Model):
    """Voice of Customer (VOC) and Critical to Quality (CTQ) requirements"""
    PRIORITY_CHOICES = [
        ('critical', 'Critical'),
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]
    
    project = models.ForeignKey(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='voc_items'
    )
    customer_segment = models.CharField(max_length=255)
    customer_need = models.TextField(help_text="What the customer says they want")
    ctq_requirement = models.TextField(help_text="Critical to Quality requirement")
    measurement = models.CharField(max_length=255, help_text="How this will be measured")
    target_value = models.CharField(max_length=100, help_text="Target specification")
    lower_spec_limit = models.CharField(max_length=100, blank=True)
    upper_spec_limit = models.CharField(max_length=100, blank=True)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Voice of Customer"
        verbose_name_plural = "Voice of Customer Items"
        ordering = ['-priority', '-created_at']

    def __str__(self):
        return f"VOC: {self.customer_segment} - {self.ctq_requirement[:50]}"


class ProjectCharter(models.Model):
    """Six Sigma Project Charter - extends basic project info"""
    project = models.OneToOneField(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='sixsigma_charter'
    )
    problem_statement = models.TextField()
    business_case = models.TextField(help_text="Why this project matters")
    goal_statement = models.TextField(help_text="SMART goal")
    project_scope = models.TextField()
    out_of_scope = models.TextField(blank=True)
    
    # Financial impact
    estimated_savings = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    estimated_cost = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    
    # Timeline
    target_completion_date = models.DateField(null=True, blank=True)
    
    # Approvals
    champion = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='championed_sixsigma_projects'
    )
    process_owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='owned_sixsigma_processes'
    )
    
    approved = models.BooleanField(default=False)
    approved_date = models.DateField(null=True, blank=True)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_sixsigma_charters'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Six Sigma Charter"
        verbose_name_plural = "Six Sigma Charters"

    def __str__(self):
        return f"Charter - {self.project.name}"


# =============================================================================
# MEASURE PHASE MODELS
# =============================================================================

class DataCollectionPlan(models.Model):
    """Data Collection Plan for the Measure phase"""
    project = models.OneToOneField(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='data_collection_plan'
    )
    objective = models.TextField(help_text="What are we trying to measure?")
    data_collection_method = models.TextField(blank=True)
    sampling_strategy = models.TextField(blank=True)
    target_sample_size = models.PositiveIntegerField(default=30)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('planning', 'Planning'),
            ('collecting', 'Collecting'),
            ('completed', 'Completed'),
        ],
        default='planning'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Data Collection Plan"
        verbose_name_plural = "Data Collection Plans"

    def __str__(self):
        return f"Data Collection Plan - {self.project.name}"

    @property
    def collection_progress(self):
        """Calculate collection progress percentage"""
        metrics = self.metrics.all()
        if not metrics:
            return 0
        total_target = sum(m.target_samples for m in metrics)
        total_collected = sum(m.collected_samples for m in metrics)
        if total_target == 0:
            return 0
        return round((total_collected / total_target) * 100, 1)


class DataCollectionMetric(models.Model):
    """Individual metrics in the data collection plan"""
    DATA_TYPE_CHOICES = [
        ('continuous', 'Continuous'),
        ('discrete', 'Discrete'),
        ('attribute', 'Attribute'),
    ]
    
    plan = models.ForeignKey(
        DataCollectionPlan,
        on_delete=models.CASCADE,
        related_name='metrics'
    )
    name = models.CharField(max_length=255)
    data_type = models.CharField(max_length=20, choices=DATA_TYPE_CHOICES)
    operational_definition = models.TextField(help_text="Clear definition of what is measured")
    data_source = models.CharField(max_length=255)
    collection_frequency = models.CharField(max_length=100)
    responsible_person = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    target_samples = models.PositiveIntegerField(default=30)
    collected_samples = models.PositiveIntegerField(default=0)
    unit = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Data Collection Metric"
        verbose_name_plural = "Data Collection Metrics"

    def __str__(self):
        return f"{self.name} ({self.get_data_type_display()})"

    @property
    def progress_percentage(self):
        if self.target_samples == 0:
            return 0
        return round((self.collected_samples / self.target_samples) * 100, 1)


class MSAResult(models.Model):
    """Measurement System Analysis (Gauge R&R) Results"""
    STATUS_CHOICES = [
        ('excellent', 'Excellent (<10%)'),
        ('acceptable', 'Acceptable (10-30%)'),
        ('unacceptable', 'Unacceptable (>30%)'),
    ]
    
    project = models.OneToOneField(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='msa_result'
    )
    study_name = models.CharField(max_length=255)
    measurement_system = models.CharField(max_length=255)
    study_date = models.DateField(null=True, blank=True)
    
    # Gauge R&R Results
    repeatability = models.DecimalField(
        max_digits=5, decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Equipment variation %"
    )
    reproducibility = models.DecimalField(
        max_digits=5, decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Appraiser variation %"
    )
    gauge_rr = models.DecimalField(
        max_digits=5, decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Total Gauge R&R %"
    )
    part_to_part = models.DecimalField(
        max_digits=5, decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Part-to-part variation %",
        null=True, blank=True
    )
    ndc = models.PositiveIntegerField(
        help_text="Number of Distinct Categories",
        validators=[MinValueValidator(1)]
    )
    
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "MSA Result"
        verbose_name_plural = "MSA Results"

    def __str__(self):
        return f"MSA - {self.project.name}"

    @property
    def status(self):
        if self.gauge_rr < 10:
            return 'excellent'
        elif self.gauge_rr < 30:
            return 'acceptable'
        else:
            return 'unacceptable'

    @property
    def status_display(self):
        return dict(self.STATUS_CHOICES).get(self.status, 'Unknown')


class BaselineMetric(models.Model):
    """Baseline metrics established during Measure phase"""
    project = models.ForeignKey(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='baseline_metrics'
    )
    metric_name = models.CharField(max_length=255)
    baseline_value = models.DecimalField(max_digits=15, decimal_places=4)
    current_value = models.DecimalField(max_digits=15, decimal_places=4)
    target_value = models.DecimalField(max_digits=15, decimal_places=4)
    unit = models.CharField(max_length=50)
    
    # Sigma level calculations
    baseline_sigma = models.DecimalField(
        max_digits=4, decimal_places=2, null=True, blank=True
    )
    current_sigma = models.DecimalField(
        max_digits=4, decimal_places=2, null=True, blank=True
    )
    target_sigma = models.DecimalField(
        max_digits=4, decimal_places=2, null=True, blank=True
    )
    
    measured_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Baseline Metric"
        verbose_name_plural = "Baseline Metrics"

    def __str__(self):
        return f"{self.metric_name}: {self.baseline_value} → {self.target_value}"

    @property
    def improvement_percentage(self):
        if self.baseline_value == 0:
            return 0
        return round(
            ((self.baseline_value - self.current_value) / self.baseline_value) * 100, 
            2
        )


# =============================================================================
# ANALYZE PHASE MODELS
# =============================================================================

class FishboneDiagram(models.Model):
    """Ishikawa (Fishbone) Diagram for root cause analysis"""
    project = models.OneToOneField(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='fishbone_diagram'
    )
    problem_statement = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )

    class Meta:
        verbose_name = "Fishbone Diagram"
        verbose_name_plural = "Fishbone Diagrams"

    def __str__(self):
        return f"Fishbone - {self.project.name}"


class FishboneCause(models.Model):
    """Causes in a Fishbone diagram (6M categories)"""
    CATEGORY_CHOICES = [
        ('manpower', 'Manpower (People)'),
        ('method', 'Method (Process)'),
        ('machine', 'Machine (Equipment)'),
        ('material', 'Material'),
        ('measurement', 'Measurement'),
        ('mother_nature', 'Mother Nature (Environment)'),
    ]
    
    fishbone = models.ForeignKey(
        FishboneDiagram,
        on_delete=models.CASCADE,
        related_name='causes'
    )
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    cause = models.TextField()
    sub_cause = models.TextField(blank=True, help_text="More specific cause")
    votes = models.PositiveIntegerField(default=0)
    is_root_cause = models.BooleanField(default=False)
    verified = models.BooleanField(default=False, help_text="Verified with data")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Fishbone Cause"
        verbose_name_plural = "Fishbone Causes"
        ordering = ['category', '-votes', '-is_root_cause']

    def __str__(self):
        return f"{self.get_category_display()}: {self.cause[:50]}"


class ParetoAnalysis(models.Model):
    """Pareto Analysis for identifying vital few"""
    project = models.ForeignKey(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='pareto_analyses'
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    analysis_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Pareto Analysis"
        verbose_name_plural = "Pareto Analyses"

    def __str__(self):
        return f"Pareto - {self.name}"

    @property
    def total_count(self):
        return sum(cat.count for cat in self.categories.all())


class ParetoCategory(models.Model):
    """Categories in a Pareto analysis"""
    analysis = models.ForeignKey(
        ParetoAnalysis,
        on_delete=models.CASCADE,
        related_name='categories'
    )
    name = models.CharField(max_length=255)
    count = models.PositiveIntegerField()
    order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = "Pareto Category"
        verbose_name_plural = "Pareto Categories"
        ordering = ['-count']

    def __str__(self):
        return f"{self.name}: {self.count}"

    @property
    def percentage(self):
        total = self.analysis.total_count
        if total == 0:
            return 0
        return round((self.count / total) * 100, 1)


class HypothesisTest(models.Model):
    """Statistical hypothesis tests"""
    TEST_TYPE_CHOICES = [
        ('1_sample_t', '1-Sample T-Test'),
        ('2_sample_t', '2-Sample T-Test'),
        ('paired_t', 'Paired T-Test'),
        ('1_proportion', '1-Proportion Test'),
        ('2_proportion', '2-Proportion Test'),
        ('chi_square', 'Chi-Square Test'),
        ('anova', 'ANOVA'),
        ('regression', 'Regression'),
        ('correlation', 'Correlation'),
    ]
    
    CONCLUSION_CHOICES = [
        ('reject', 'Reject Null Hypothesis'),
        ('fail_to_reject', 'Fail to Reject Null Hypothesis'),
        ('inconclusive', 'Inconclusive'),
    ]
    
    project = models.ForeignKey(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='hypothesis_tests'
    )
    name = models.CharField(max_length=255)
    test_type = models.CharField(max_length=20, choices=TEST_TYPE_CHOICES)
    null_hypothesis = models.TextField(help_text="H0: Statement of no effect/difference")
    alt_hypothesis = models.TextField(help_text="Ha: Statement of effect/difference")
    
    # Test parameters
    alpha = models.DecimalField(
        max_digits=4, decimal_places=3, 
        default=Decimal('0.05'),
        help_text="Significance level"
    )
    sample_size = models.PositiveIntegerField(null=True, blank=True)
    
    # Results
    test_statistic = models.DecimalField(
        max_digits=10, decimal_places=4, null=True, blank=True
    )
    p_value = models.DecimalField(
        max_digits=10, decimal_places=6, null=True, blank=True
    )
    confidence_interval_lower = models.DecimalField(
        max_digits=15, decimal_places=4, null=True, blank=True
    )
    confidence_interval_upper = models.DecimalField(
        max_digits=15, decimal_places=4, null=True, blank=True
    )
    
    conclusion = models.CharField(
        max_length=20, choices=CONCLUSION_CHOICES, blank=True
    )
    interpretation = models.TextField(blank=True)
    
    test_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Hypothesis Test"
        verbose_name_plural = "Hypothesis Tests"

    def __str__(self):
        return f"{self.name} ({self.get_test_type_display()})"

    @property
    def is_significant(self):
        if self.p_value is None:
            return None
        return self.p_value < self.alpha


# =============================================================================
# IMPROVE PHASE MODELS
# =============================================================================

class Solution(models.Model):
    """Improvement solutions"""
    IMPACT_CHOICES = [
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]
    EFFORT_CHOICES = [
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]
    STATUS_CHOICES = [
        ('proposed', 'Proposed'),
        ('evaluating', 'Evaluating'),
        ('approved', 'Approved'),
        ('piloting', 'Piloting'),
        ('implementing', 'Implementing'),
        ('implemented', 'Implemented'),
        ('rejected', 'Rejected'),
    ]
    CATEGORY_CHOICES = [
        ('process', 'Process Change'),
        ('technology', 'Technology'),
        ('people', 'People/Training'),
        ('policy', 'Policy Change'),
        ('equipment', 'Equipment'),
        ('other', 'Other'),
    ]
    
    project = models.ForeignKey(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='solutions'
    )
    name = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='process')
    
    # Priority matrix
    impact = models.CharField(max_length=10, choices=IMPACT_CHOICES, default='medium')
    effort = models.CharField(max_length=10, choices=EFFORT_CHOICES, default='medium')
    
    # Expected outcomes
    expected_improvement = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True,
        help_text="Expected improvement percentage"
    )
    expected_savings = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    implementation_cost = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    
    # Root cause linkage
    addresses_root_cause = models.ForeignKey(
        FishboneCause,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='solutions'
    )
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='proposed')
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Solution"
        verbose_name_plural = "Solutions"
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    @property
    def priority_score(self):
        """Calculate priority score for impact/effort matrix"""
        impact_scores = {'high': 3, 'medium': 2, 'low': 1}
        effort_scores = {'high': 1, 'medium': 2, 'low': 3}
        return impact_scores.get(self.impact, 1) * effort_scores.get(self.effort, 1)

    @property
    def priority_quadrant(self):
        """Determine quadrant in impact/effort matrix"""
        if self.impact == 'high' and self.effort == 'low':
            return 'quick_win'
        elif self.impact == 'high' and self.effort == 'high':
            return 'major_project'
        elif self.impact == 'low' and self.effort == 'low':
            return 'fill_in'
        else:
            return 'thankless'


class PilotPlan(models.Model):
    """Pilot plan for testing solutions"""
    STATUS_CHOICES = [
        ('planning', 'Planning'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    solution = models.OneToOneField(
        Solution,
        on_delete=models.CASCADE,
        related_name='pilot'
    )
    
    # Pilot scope
    scope = models.TextField(help_text="Where/what will be piloted")
    duration = models.CharField(max_length=100)
    sample_size = models.PositiveIntegerField()
    
    # Success criteria
    success_criteria = models.TextField()
    primary_metric = models.CharField(max_length=255)
    target_value = models.DecimalField(max_digits=15, decimal_places=4)
    
    # Timeline
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    
    # Results
    baseline_value = models.DecimalField(
        max_digits=15, decimal_places=4, null=True, blank=True
    )
    pilot_value = models.DecimalField(
        max_digits=15, decimal_places=4, null=True, blank=True
    )
    improvement_percentage = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True
    )
    p_value = models.DecimalField(
        max_digits=10, decimal_places=6, null=True, blank=True,
        help_text="Statistical significance"
    )
    is_successful = models.BooleanField(null=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planning')
    lessons_learned = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Pilot Plan"
        verbose_name_plural = "Pilot Plans"

    def __str__(self):
        return f"Pilot - {self.solution.name}"


class FMEA(models.Model):
    """Failure Mode and Effects Analysis"""
    project = models.ForeignKey(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='fmea_items'
    )
    process_step = models.CharField(max_length=255)
    potential_failure_mode = models.TextField()
    potential_effect = models.TextField()
    potential_cause = models.TextField()
    
    # RPN components (1-10 scale)
    severity = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text="Severity of effect (1-10)"
    )
    occurrence = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text="Likelihood of occurrence (1-10)"
    )
    detection = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text="Ability to detect (1-10, lower is better)"
    )
    
    # Current controls
    current_controls = models.TextField(blank=True)
    
    # Recommended actions
    recommended_action = models.TextField(blank=True)
    action_owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    target_date = models.DateField(null=True, blank=True)
    
    # After actions taken
    action_taken = models.TextField(blank=True)
    new_severity = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        null=True, blank=True
    )
    new_occurrence = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        null=True, blank=True
    )
    new_detection = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        null=True, blank=True
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "FMEA"
        verbose_name_plural = "FMEA Items"
        ordering = ['-severity', '-occurrence']

    def __str__(self):
        return f"FMEA - {self.process_step}: {self.potential_failure_mode[:50]}"

    @property
    def rpn(self):
        """Risk Priority Number"""
        return self.severity * self.occurrence * self.detection

    @property
    def new_rpn(self):
        """New RPN after actions"""
        if all([self.new_severity, self.new_occurrence, self.new_detection]):
            return self.new_severity * self.new_occurrence * self.new_detection
        return None

    @property
    def rpn_reduction(self):
        """RPN reduction percentage"""
        if self.new_rpn:
            return round(((self.rpn - self.new_rpn) / self.rpn) * 100, 1)
        return None


class ImplementationPlan(models.Model):
    """Implementation plan for rolling out solutions"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('on_hold', 'On Hold'),
    ]
    
    project = models.ForeignKey(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='implementation_plans'
    )
    solution = models.ForeignKey(
        Solution,
        on_delete=models.CASCADE,
        related_name='implementation_plans'
    )
    phase_name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    start_date = models.DateField()
    end_date = models.DateField()
    
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    progress = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Implementation Plan"
        verbose_name_plural = "Implementation Plans"
        ordering = ['start_date']

    def __str__(self):
        return f"{self.phase_name} - {self.solution.name}"


# =============================================================================
# CONTROL PHASE MODELS
# =============================================================================

class ControlPlan(models.Model):
    """Control Plan for sustaining improvements"""
    project = models.OneToOneField(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='control_plan'
    )
    process_name = models.CharField(max_length=255)
    process_owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='owned_control_plans'
    )
    effective_date = models.DateField()
    revision = models.PositiveIntegerField(default=1)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Control Plan"
        verbose_name_plural = "Control Plans"

    def __str__(self):
        return f"Control Plan - {self.project.name} (Rev {self.revision})"


class ControlPlanItem(models.Model):
    """Individual items in a Control Plan"""
    plan = models.ForeignKey(
        ControlPlan,
        on_delete=models.CASCADE,
        related_name='items'
    )
    process_step = models.CharField(max_length=255)
    characteristic = models.CharField(max_length=255, help_text="What to control")
    specification = models.CharField(max_length=255, help_text="Target/limits")
    measurement_method = models.CharField(max_length=255)
    sample_size = models.CharField(max_length=100)
    frequency = models.CharField(max_length=100)
    control_method = models.CharField(max_length=255, help_text="How it's controlled")
    reaction_plan = models.TextField(help_text="What to do if out of control")
    responsible = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    order = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Control Plan Item"
        verbose_name_plural = "Control Plan Items"
        ordering = ['order']

    def __str__(self):
        return f"{self.process_step}: {self.characteristic}"


class ControlChart(models.Model):
    """Statistical Process Control (SPC) Chart"""
    CHART_TYPE_CHOICES = [
        ('i_mr', 'I-MR (Individuals)'),
        ('xbar_r', 'X-bar R'),
        ('xbar_s', 'X-bar S'),
        ('p', 'P Chart (Proportion)'),
        ('np', 'NP Chart'),
        ('c', 'C Chart (Count)'),
        ('u', 'U Chart'),
    ]
    
    project = models.ForeignKey(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='control_charts'
    )
    name = models.CharField(max_length=255)
    chart_type = models.CharField(max_length=10, choices=CHART_TYPE_CHOICES)
    metric_name = models.CharField(max_length=255)
    unit = models.CharField(max_length=50, blank=True)
    
    # Control limits
    ucl = models.DecimalField(
        max_digits=15, decimal_places=4,
        help_text="Upper Control Limit"
    )
    lcl = models.DecimalField(
        max_digits=15, decimal_places=4,
        help_text="Lower Control Limit"
    )
    center_line = models.DecimalField(
        max_digits=15, decimal_places=4,
        help_text="Center Line (Mean)"
    )
    
    # Specification limits (optional)
    usl = models.DecimalField(
        max_digits=15, decimal_places=4, null=True, blank=True,
        help_text="Upper Specification Limit"
    )
    lsl = models.DecimalField(
        max_digits=15, decimal_places=4, null=True, blank=True,
        help_text="Lower Specification Limit"
    )
    target = models.DecimalField(
        max_digits=15, decimal_places=4, null=True, blank=True
    )
    
    # Process capability
    cp = models.DecimalField(
        max_digits=5, decimal_places=3, null=True, blank=True,
        help_text="Process Capability"
    )
    cpk = models.DecimalField(
        max_digits=5, decimal_places=3, null=True, blank=True,
        help_text="Process Capability Index"
    )
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Control Chart"
        verbose_name_plural = "Control Charts"

    def __str__(self):
        return f"{self.name} ({self.get_chart_type_display()})"

    @property
    def total_violations(self):
        return self.data_points.filter(is_violation=True).count()

    @property
    def is_in_control(self):
        """Check if last 10 points are in control"""
        recent = self.data_points.order_by('-date')[:10]
        return not any(p.is_violation for p in recent)


class ControlChartData(models.Model):
    """Data points for control charts"""
    chart = models.ForeignKey(
        ControlChart,
        on_delete=models.CASCADE,
        related_name='data_points'
    )
    date = models.DateTimeField()
    value = models.DecimalField(max_digits=15, decimal_places=4)
    subgroup_size = models.PositiveIntegerField(default=1)
    is_violation = models.BooleanField(default=False)
    violation_rule = models.CharField(
        max_length=100, blank=True,
        help_text="Which control rule was violated"
    )
    assignable_cause = models.TextField(blank=True)
    corrective_action = models.TextField(blank=True)
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Control Chart Data"
        verbose_name_plural = "Control Chart Data Points"
        ordering = ['date']

    def __str__(self):
        return f"{self.chart.name}: {self.value} @ {self.date}"

    def save(self, *args, **kwargs):
        # Auto-detect violations
        if self.value > self.chart.ucl or self.value < self.chart.lcl:
            self.is_violation = True
            if not self.violation_rule:
                self.violation_rule = "Point outside control limits"
        super().save(*args, **kwargs)


class TollgateReview(models.Model):
    """DMAIC Phase Tollgate Reviews"""
    PHASE_CHOICES = [
        ('define', 'Define'),
        ('measure', 'Measure'),
        ('analyze', 'Analyze'),
        ('improve', 'Improve'),
        ('control', 'Control'),
    ]
    STATUS_CHOICES = [
        ('upcoming', 'Upcoming'),
        ('scheduled', 'Scheduled'),
        ('in_review', 'In Review'),
        ('passed', 'Passed'),
        ('conditional', 'Conditional Pass'),
        ('failed', 'Failed'),
        ('rework', 'Rework Required'),
    ]
    
    project = models.ForeignKey(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='tollgate_reviews'
    )
    phase = models.CharField(max_length=10, choices=PHASE_CHOICES)
    
    # Scheduling
    scheduled_date = models.DateField(null=True, blank=True)
    actual_date = models.DateField(null=True, blank=True)
    
    # Review details
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='conducted_tollgates'
    )
    attendees = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        blank=True,
        related_name='attended_tollgates'
    )
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='upcoming')
    
    # Checklist and notes
    checklist_completed = models.BooleanField(default=False)
    deliverables_reviewed = models.TextField(blank=True)
    findings = models.TextField(blank=True)
    action_items = models.TextField(blank=True)
    
    # Approval
    approved = models.BooleanField(default=False)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_tollgates'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Tollgate Review"
        verbose_name_plural = "Tollgate Reviews"
        unique_together = ['project', 'phase']
        ordering = ['project', 'phase']

    def __str__(self):
        return f"{self.project.name} - {self.get_phase_display()} Tollgate"


class ProjectClosure(models.Model):
    """Six Sigma Project Closure"""
    project = models.OneToOneField(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='sixsigma_closure'
    )
    
    # Before/After metrics
    initial_sigma = models.DecimalField(max_digits=4, decimal_places=2)
    final_sigma = models.DecimalField(max_digits=4, decimal_places=2)
    initial_defect_rate = models.DecimalField(
        max_digits=10, decimal_places=4,
        help_text="DPMO or percentage"
    )
    final_defect_rate = models.DecimalField(
        max_digits=10, decimal_places=4,
        help_text="DPMO or percentage"
    )
    
    # Financial results
    projected_savings = models.DecimalField(max_digits=12, decimal_places=2)
    realized_savings = models.DecimalField(max_digits=12, decimal_places=2)
    total_project_cost = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    
    # Documentation
    lessons_learned = models.TextField()
    best_practices = models.TextField(blank=True)
    recommendations = models.TextField(blank=True)
    
    # Handover
    process_owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='received_sixsigma_closures'
    )
    handover_completed = models.BooleanField(default=False)
    training_completed = models.BooleanField(default=False)
    documentation_completed = models.BooleanField(default=False)
    
    # Closure
    closure_date = models.DateField()
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_sixsigma_closures'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Project Closure"
        verbose_name_plural = "Project Closures"

    def __str__(self):
        return f"Closure - {self.project.name}"

    @property
    def sigma_improvement(self):
        return self.final_sigma - self.initial_sigma

    @property
    def defect_reduction_percentage(self):
        if self.initial_defect_rate == 0:
            return 0
        return round(
            ((self.initial_defect_rate - self.final_defect_rate) / self.initial_defect_rate) * 100,
            2
        )

    @property
    def roi(self):
        """Return on Investment"""
        if self.total_project_cost and self.total_project_cost > 0:
            return round(
                ((self.realized_savings - self.total_project_cost) / self.total_project_cost) * 100,
                2
            )
        return None