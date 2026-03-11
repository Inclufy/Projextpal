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

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    program = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='msp_benefits')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
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
    program = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='msp_tranches')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    sequence = models.PositiveIntegerField(default=1)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planning')
    budget = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['sequence']
        verbose_name = 'MSP Tranche'

    def __str__(self):
        return f"{self.name} (Tranche {self.sequence}) - {self.program.name}"
