from django.db import models
from django.conf import settings
from projects.models import Project

class DeploymentPlan(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='deployment_plans')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.title

class StrategyItem(models.Model):
    plan = models.ForeignKey(DeploymentPlan, on_delete=models.CASCADE, related_name='strategy_items')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    order = models.IntegerField(default=0)
    def __str__(self):
        return self.title

class RolloutPhase(models.Model):
    plan = models.ForeignKey(DeploymentPlan, on_delete=models.CASCADE, related_name='rollout_phases')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    def __str__(self):
        return self.name
