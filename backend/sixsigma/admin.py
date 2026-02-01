from django.contrib import admin
from .models import (
    # Define
    SIPOCDiagram, SIPOCItem, VoiceOfCustomer, ProjectCharter,
    # Measure
    DataCollectionPlan, DataCollectionMetric, MSAResult, BaselineMetric,
    # Analyze
    FishboneDiagram, FishboneCause, ParetoAnalysis, ParetoCategory, HypothesisTest,
    # Improve
    Solution, PilotPlan, FMEA, ImplementationPlan,
    # Control
    ControlPlan, ControlPlanItem, ControlChart, ControlChartData,
    TollgateReview, ProjectClosure,
)


# =============================================================================
# DEFINE PHASE ADMIN
# =============================================================================

class SIPOCItemInline(admin.TabularInline):
    model = SIPOCItem
    extra = 1
    ordering = ['category', 'order']


@admin.register(SIPOCDiagram)
class SIPOCDiagramAdmin(admin.ModelAdmin):
    list_display = ['project', 'process_name', 'created_by', 'created_at']
    list_filter = ['project__company', 'created_at']
    search_fields = ['project__name', 'process_name']
    inlines = [SIPOCItemInline]
    readonly_fields = ['created_at', 'updated_at']


@admin.register(VoiceOfCustomer)
class VoiceOfCustomerAdmin(admin.ModelAdmin):
    list_display = ['project', 'customer_segment', 'ctq_requirement', 'priority', 'created_at']
    list_filter = ['priority', 'project__company', 'created_at']
    search_fields = ['project__name', 'customer_segment', 'ctq_requirement']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(ProjectCharter)
class ProjectCharterAdmin(admin.ModelAdmin):
    list_display = ['project', 'approved', 'champion', 'estimated_savings', 'created_at']
    list_filter = ['approved', 'project__company', 'created_at']
    search_fields = ['project__name', 'problem_statement']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Project', {
            'fields': ('project',)
        }),
        ('Problem & Goals', {
            'fields': ('problem_statement', 'business_case', 'goal_statement')
        }),
        ('Scope', {
            'fields': ('project_scope', 'out_of_scope')
        }),
        ('Financial', {
            'fields': ('estimated_savings', 'estimated_cost')
        }),
        ('Timeline', {
            'fields': ('target_completion_date',)
        }),
        ('Stakeholders', {
            'fields': ('champion', 'process_owner')
        }),
        ('Approval', {
            'fields': ('approved', 'approved_date', 'approved_by')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


# =============================================================================
# MEASURE PHASE ADMIN
# =============================================================================

class DataCollectionMetricInline(admin.TabularInline):
    model = DataCollectionMetric
    extra = 1


@admin.register(DataCollectionPlan)
class DataCollectionPlanAdmin(admin.ModelAdmin):
    list_display = ['project', 'objective', 'status', 'target_sample_size', 'start_date', 'end_date']
    list_filter = ['status', 'project__company']
    search_fields = ['project__name', 'objective']
    inlines = [DataCollectionMetricInline]
    readonly_fields = ['created_at', 'updated_at']


@admin.register(MSAResult)
class MSAResultAdmin(admin.ModelAdmin):
    list_display = ['project', 'study_name', 'gauge_rr', 'ndc', 'status', 'study_date']
    list_filter = ['project__company', 'study_date']
    search_fields = ['project__name', 'study_name', 'measurement_system']
    readonly_fields = ['created_at', 'updated_at', 'status', 'status_display']


@admin.register(BaselineMetric)
class BaselineMetricAdmin(admin.ModelAdmin):
    list_display = ['project', 'metric_name', 'baseline_value', 'current_value', 'target_value', 'unit']
    list_filter = ['project__company', 'measured_date']
    search_fields = ['project__name', 'metric_name']
    readonly_fields = ['created_at', 'updated_at', 'improvement_percentage']


# =============================================================================
# ANALYZE PHASE ADMIN
# =============================================================================

class FishboneCauseInline(admin.TabularInline):
    model = FishboneCause
    extra = 1
    ordering = ['category', '-votes']


@admin.register(FishboneDiagram)
class FishboneDiagramAdmin(admin.ModelAdmin):
    list_display = ['project', 'problem_statement', 'created_by', 'created_at']
    list_filter = ['project__company', 'created_at']
    search_fields = ['project__name', 'problem_statement']
    inlines = [FishboneCauseInline]
    readonly_fields = ['created_at', 'updated_at']


class ParetoCategoryInline(admin.TabularInline):
    model = ParetoCategory
    extra = 1
    ordering = ['-count']


@admin.register(ParetoAnalysis)
class ParetoAnalysisAdmin(admin.ModelAdmin):
    list_display = ['project', 'name', 'total_count', 'analysis_date']
    list_filter = ['project__company', 'analysis_date']
    search_fields = ['project__name', 'name']
    inlines = [ParetoCategoryInline]
    readonly_fields = ['created_at', 'updated_at', 'total_count']


@admin.register(HypothesisTest)
class HypothesisTestAdmin(admin.ModelAdmin):
    list_display = ['project', 'name', 'test_type', 'p_value', 'conclusion', 'test_date']
    list_filter = ['test_type', 'conclusion', 'project__company']
    search_fields = ['project__name', 'name', 'null_hypothesis']
    readonly_fields = ['created_at', 'updated_at', 'is_significant']


# =============================================================================
# IMPROVE PHASE ADMIN
# =============================================================================

@admin.register(Solution)
class SolutionAdmin(admin.ModelAdmin):
    list_display = ['project', 'name', 'category', 'impact', 'effort', 'status', 'priority_score']
    list_filter = ['status', 'impact', 'effort', 'category', 'project__company']
    search_fields = ['project__name', 'name', 'description']
    readonly_fields = ['created_at', 'updated_at', 'priority_score', 'priority_quadrant']


@admin.register(PilotPlan)
class PilotPlanAdmin(admin.ModelAdmin):
    list_display = ['solution', 'status', 'start_date', 'end_date', 'is_successful']
    list_filter = ['status', 'is_successful']
    search_fields = ['solution__name', 'scope']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(FMEA)
class FMEAAdmin(admin.ModelAdmin):
    list_display = ['project', 'process_step', 'potential_failure_mode', 'severity', 'occurrence', 'detection', 'rpn']
    list_filter = ['project__company']
    search_fields = ['project__name', 'process_step', 'potential_failure_mode']
    readonly_fields = ['created_at', 'updated_at', 'rpn', 'new_rpn', 'rpn_reduction']


@admin.register(ImplementationPlan)
class ImplementationPlanAdmin(admin.ModelAdmin):
    list_display = ['project', 'solution', 'phase_name', 'status', 'progress', 'start_date', 'end_date']
    list_filter = ['status', 'project__company']
    search_fields = ['project__name', 'solution__name', 'phase_name']
    readonly_fields = ['created_at', 'updated_at']


# =============================================================================
# CONTROL PHASE ADMIN
# =============================================================================

class ControlPlanItemInline(admin.TabularInline):
    model = ControlPlanItem
    extra = 1
    ordering = ['order']


@admin.register(ControlPlan)
class ControlPlanAdmin(admin.ModelAdmin):
    list_display = ['project', 'process_name', 'process_owner', 'effective_date', 'revision']
    list_filter = ['project__company', 'effective_date']
    search_fields = ['project__name', 'process_name']
    inlines = [ControlPlanItemInline]
    readonly_fields = ['created_at', 'updated_at']


class ControlChartDataInline(admin.TabularInline):
    model = ControlChartData
    extra = 1
    ordering = ['-date']
    readonly_fields = ['is_violation']


@admin.register(ControlChart)
class ControlChartAdmin(admin.ModelAdmin):
    list_display = ['project', 'name', 'chart_type', 'metric_name', 'ucl', 'center_line', 'lcl', 'is_active']
    list_filter = ['chart_type', 'is_active', 'project__company']
    search_fields = ['project__name', 'name', 'metric_name']
    inlines = [ControlChartDataInline]
    readonly_fields = ['created_at', 'updated_at', 'total_violations', 'is_in_control']


@admin.register(TollgateReview)
class TollgateReviewAdmin(admin.ModelAdmin):
    list_display = ['project', 'phase', 'status', 'scheduled_date', 'actual_date', 'approved']
    list_filter = ['phase', 'status', 'approved', 'project__company']
    search_fields = ['project__name']
    readonly_fields = ['created_at', 'updated_at']
    filter_horizontal = ['attendees']


@admin.register(ProjectClosure)
class ProjectClosureAdmin(admin.ModelAdmin):
    list_display = ['project', 'initial_sigma', 'final_sigma', 'sigma_improvement', 
                    'projected_savings', 'realized_savings', 'closure_date']
    list_filter = ['project__company', 'closure_date']
    search_fields = ['project__name', 'lessons_learned']
    readonly_fields = ['created_at', 'updated_at', 'sigma_improvement', 
                       'defect_reduction_percentage', 'roi']
    fieldsets = (
        ('Project', {
            'fields': ('project',)
        }),
        ('Sigma Metrics', {
            'fields': ('initial_sigma', 'final_sigma', 'sigma_improvement',
                       'initial_defect_rate', 'final_defect_rate', 'defect_reduction_percentage')
        }),
        ('Financial', {
            'fields': ('projected_savings', 'realized_savings', 'total_project_cost', 'roi')
        }),
        ('Documentation', {
            'fields': ('lessons_learned', 'best_practices', 'recommendations')
        }),
        ('Handover', {
            'fields': ('process_owner', 'handover_completed', 'training_completed', 
                       'documentation_completed')
        }),
        ('Closure', {
            'fields': ('closure_date', 'approved_by')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )