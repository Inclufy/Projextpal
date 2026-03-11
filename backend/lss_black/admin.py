from django.contrib import admin
from .models import HypothesisTest, DesignOfExperiment, ControlPlan, SPCChart


@admin.register(HypothesisTest)
class HypothesisTestAdmin(admin.ModelAdmin):
    list_display = ['test_type', 'project', 'alpha', 'p_value', 'reject_null', 'created_at']
    list_filter = ['test_type', 'reject_null']
    search_fields = ['null_hypothesis', 'alternative_hypothesis', 'project__name']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(DesignOfExperiment)
class DesignOfExperimentAdmin(admin.ModelAdmin):
    list_display = ['experiment_name', 'project', 'design_type', 'levels', 'created_at']
    list_filter = ['design_type']
    search_fields = ['experiment_name', 'project__name']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(ControlPlan)
class ControlPlanAdmin(admin.ModelAdmin):
    list_display = ['process_step', 'project', 'control_method', 'measurement_frequency', 'is_active', 'created_at']
    list_filter = ['is_active', 'measurement_frequency']
    search_fields = ['process_step', 'control_method', 'project__name']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(SPCChart)
class SPCChartAdmin(admin.ModelAdmin):
    list_display = ['chart_type', 'project', 'ucl', 'center_line', 'lcl', 'created_at']
    list_filter = ['chart_type']
    search_fields = ['project__name']
    readonly_fields = ['id', 'created_at', 'updated_at']
