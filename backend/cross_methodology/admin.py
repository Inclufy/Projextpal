from django.contrib import admin
from .models import MethodologyComparison, MethodologyMetrics


@admin.register(MethodologyComparison)
class MethodologyComparisonAdmin(admin.ModelAdmin):
    list_display = ['name', 'company', 'created_by', 'created_at']
    list_filter = ['company']
    search_fields = ['name', 'recommendation']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(MethodologyMetrics)
class MethodologyMetricsAdmin(admin.ModelAdmin):
    list_display = ['methodology', 'period', 'company', 'project_count', 'completed_count', 'on_time_percentage', 'on_budget_percentage']
    list_filter = ['methodology', 'period']
    search_fields = ['methodology']
    readonly_fields = ['id', 'created_at', 'updated_at']
