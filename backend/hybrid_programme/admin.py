from django.contrib import admin
from .models import HybridGovernanceConfig, HybridAdaptation


@admin.register(HybridGovernanceConfig)
class HybridGovernanceConfigAdmin(admin.ModelAdmin):
    list_display = ['programme', 'primary_framework', 'is_active', 'created_at']
    list_filter = ['primary_framework', 'is_active']
    search_fields = ['programme__name', 'rationale']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(HybridAdaptation)
class HybridAdaptationAdmin(admin.ModelAdmin):
    list_display = ['programme', 'trigger', 'response', 'effective_date', 'approved_by', 'created_at']
    list_filter = ['trigger', 'response']
    search_fields = ['programme__name', 'methodology_adjustment']
    readonly_fields = ['id', 'created_at', 'updated_at']
