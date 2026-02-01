from django.contrib import admin
from .models import DeploymentPlan, StrategyItem, RolloutPhase

admin.site.register(DeploymentPlan)
admin.site.register(StrategyItem)
admin.site.register(RolloutPhase)
