from django.db import models
from django.conf import settings
import uuid


class HypothesisTest(models.Model):
    """Statistical hypothesis testing for LSS Black Belt"""

    TEST_TYPE_CHOICES = [
        ('t_test', 'T-Test'),
        ('z_test', 'Z-Test'),
        ('chi_square', 'Chi-Square'),
        ('anova', 'ANOVA'),
        ('f_test', 'F-Test'),
        ('mann_whitney', 'Mann-Whitney U'),
        ('kruskal_wallis', 'Kruskal-Wallis'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='lss_black_hypothesis_tests')
    test_type = models.CharField(max_length=30, choices=TEST_TYPE_CHOICES)
    null_hypothesis = models.TextField()
    alternative_hypothesis = models.TextField()
    alpha = models.FloatField(default=0.05)
    p_value = models.FloatField(null=True, blank=True)
    test_statistic = models.FloatField(null=True, blank=True)
    conclusion = models.TextField(blank=True)
    reject_null = models.BooleanField(null=True, blank=True)
    sample_size = models.IntegerField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Hypothesis Test'

    def __str__(self):
        return f"{self.get_test_type_display()} - {self.project.name}"

    def save(self, *args, **kwargs):
        if self.p_value is not None and self.alpha:
            self.reject_null = self.p_value < self.alpha
        super().save(*args, **kwargs)


class DesignOfExperiment(models.Model):
    """Design of Experiments (DOE) for LSS Black Belt"""

    DESIGN_TYPE_CHOICES = [
        ('full_factorial', 'Full Factorial'),
        ('fractional_factorial', 'Fractional Factorial'),
        ('taguchi', 'Taguchi'),
        ('response_surface', 'Response Surface'),
        ('plackett_burman', 'Plackett-Burman'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='lss_black_doe')
    experiment_name = models.CharField(max_length=200)
    design_type = models.CharField(max_length=30, choices=DESIGN_TYPE_CHOICES)
    factors = models.JSONField(default=list, help_text="List of experimental factors")
    levels = models.IntegerField(default=2)
    response_variable = models.CharField(max_length=200, blank=True)
    objective = models.TextField(blank=True)
    results = models.JSONField(default=dict, blank=True)
    conclusion = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Design of Experiment'

    def __str__(self):
        return f"{self.experiment_name} - {self.project.name}"


class ControlPlan(models.Model):
    """Control plans for sustaining improvements"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='lss_black_control_plans')
    process_step = models.CharField(max_length=200)
    control_method = models.CharField(max_length=200)
    measurement_frequency = models.CharField(max_length=100)
    specification_limits = models.CharField(max_length=200, blank=True)
    reaction_plan = models.TextField()
    responsible = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Control Plan'

    def __str__(self):
        return f"{self.process_step} - {self.control_method}"


class SPCChart(models.Model):
    """Statistical Process Control charts"""

    CHART_TYPE_CHOICES = [
        ('x_bar_r', 'X-bar R Chart'),
        ('x_bar_s', 'X-bar S Chart'),
        ('i_mr', 'Individual Moving Range'),
        ('p_chart', 'P Chart'),
        ('np_chart', 'NP Chart'),
        ('c_chart', 'C Chart'),
        ('u_chart', 'U Chart'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='lss_black_spc_charts')
    chart_type = models.CharField(max_length=20, choices=CHART_TYPE_CHOICES)
    ucl = models.FloatField(help_text="Upper Control Limit")
    center_line = models.FloatField(help_text="Center Line / Mean")
    lcl = models.FloatField(help_text="Lower Control Limit")
    usl = models.FloatField(null=True, blank=True, help_text="Upper Specification Limit")
    lsl = models.FloatField(null=True, blank=True, help_text="Lower Specification Limit")
    data_points = models.JSONField(default=list, blank=True)
    subgroup_size = models.IntegerField(default=5)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'SPC Chart'

    def __str__(self):
        return f"{self.get_chart_type_display()} - {self.project.name}"
