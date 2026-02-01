from django.contrib import admin
from .models import Program, ProgramBenefit, ProgramRisk, ProgramMilestone


class ProgramBenefitInline(admin.TabularInline):
    model = ProgramBenefit
    extra = 0


class ProgramRiskInline(admin.TabularInline):
    model = ProgramRisk
    extra = 0


class ProgramMilestoneInline(admin.TabularInline):
    model = ProgramMilestone
    extra = 0


@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = ['name', 'company', 'methodology', 'status', 'health_status', 'program_manager', 'created_at']
    list_filter = ['status', 'methodology', 'health_status', 'company']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    filter_horizontal = ['projects']
    inlines = [ProgramBenefitInline, ProgramRiskInline, ProgramMilestoneInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('company', 'name', 'description', 'strategic_objective')
        }),
        ('Methodology & Status', {
            'fields': ('methodology', 'status', 'health_status')
        }),
        ('Timeline', {
            'fields': ('start_date', 'target_end_date', 'actual_end_date')
        }),
        ('Budget', {
            'fields': ('total_budget', 'spent_budget', 'currency')
        }),
        ('People', {
            'fields': ('program_manager', 'executive_sponsor', 'created_by')
        }),
        ('Linked Projects', {
            'fields': ('projects',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ProgramBenefit)
class ProgramBenefitAdmin(admin.ModelAdmin):
    list_display = ['name', 'program', 'category', 'status', 'owner']
    list_filter = ['status', 'category']
    search_fields = ['name', 'description']


@admin.register(ProgramRisk)
class ProgramRiskAdmin(admin.ModelAdmin):
    list_display = ['name', 'program', 'impact', 'probability', 'status', 'owner']
    list_filter = ['status', 'impact', 'probability']
    search_fields = ['name', 'description']


@admin.register(ProgramMilestone)
class ProgramMilestoneAdmin(admin.ModelAdmin):
    list_display = ['name', 'program', 'target_date', 'status']
    list_filter = ['status']
    search_fields = ['name']

# ========================================
# ADD TO programs/admin.py
# ========================================

from .models import (
    ProgramBudget,
    ProgramBudgetCategory,
    ProgramBudgetItem
)


@admin.register(ProgramBudget)
class ProgramBudgetAdmin(admin.ModelAdmin):
    list_display = [
        'program', 'total_budget', 'total_spent',
        'total_remaining', 'projects_budget', 'currency', 'updated_at'
    ]
    list_filter = ['currency', 'updated_at']
    search_fields = ['program__name', 'program__company__name']
    readonly_fields = ['total_spent', 'total_remaining', 'projects_budget', 'created_at', 'updated_at']


@admin.register(ProgramBudgetCategory)
class ProgramBudgetCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'program', 'allocated', 'spent', 'remaining', 'created_at']
    list_filter = ['program', 'created_at']
    search_fields = ['name', 'program__name']
    readonly_fields = ['spent', 'remaining', 'created_at', 'updated_at']


@admin.register(ProgramBudgetItem)
class ProgramBudgetItemAdmin(admin.ModelAdmin):
    list_display = [
        'description', 'amount', 'date', 'type', 'status',
        'category', 'program', 'created_by'
    ]
    list_filter = ['status', 'type', 'date', 'category', 'program']
    search_fields = ['description', 'created_by__email', 'program__name']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'date'