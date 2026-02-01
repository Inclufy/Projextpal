from django.contrib import admin
from .models import (
    WaterfallPhase, WaterfallTeamMember, WaterfallRequirement,
    WaterfallDesignDocument, WaterfallTask, WaterfallTestCase,
    WaterfallMilestone, WaterfallGanttTask, WaterfallChangeRequest,
    WaterfallDeploymentChecklist, WaterfallMaintenanceItem,
    WaterfallBudget, WaterfallBudgetItem
)


@admin.register(WaterfallPhase)
class WaterfallPhaseAdmin(admin.ModelAdmin):
    list_display = ['name', 'project', 'phase_type', 'status', 'progress', 'start_date', 'end_date', 'order']
    list_filter = ['phase_type', 'status', 'project']
    search_fields = ['name', 'project__name']


@admin.register(WaterfallTeamMember)
class WaterfallTeamMemberAdmin(admin.ModelAdmin):
    list_display = ['user', 'project', 'role', 'phase', 'allocation_percentage']
    list_filter = ['role', 'project']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    raw_id_fields = ['phase']


@admin.register(WaterfallRequirement)
class WaterfallRequirementAdmin(admin.ModelAdmin):
    list_display = ['requirement_id', 'title', 'project', 'requirement_type', 'priority', 'status', 'created_at']
    list_filter = ['requirement_type', 'priority', 'status', 'project']
    search_fields = ['requirement_id', 'title']
    raw_id_fields = ['created_by', 'approved_by']


@admin.register(WaterfallDesignDocument)
class WaterfallDesignDocumentAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'document_type', 'version', 'status', 'author', 'created_at']
    list_filter = ['document_type', 'status', 'project']
    search_fields = ['title']
    raw_id_fields = ['author', 'reviewer']


@admin.register(WaterfallTask)
class WaterfallTaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'phase', 'priority', 'status', 'assignee', 'due_date']
    list_filter = ['priority', 'status', 'phase', 'project']
    search_fields = ['title']
    raw_id_fields = ['assignee']


@admin.register(WaterfallTestCase)
class WaterfallTestCaseAdmin(admin.ModelAdmin):
    list_display = ['test_id', 'name', 'project', 'test_type', 'priority', 'status', 'assignee', 'executed_at']
    list_filter = ['test_type', 'priority', 'status', 'project']
    search_fields = ['test_id', 'name']
    raw_id_fields = ['requirement', 'assignee', 'executed_by']


@admin.register(WaterfallMilestone)
class WaterfallMilestoneAdmin(admin.ModelAdmin):
    list_display = ['name', 'project', 'phase', 'status', 'due_date', 'completed_date', 'owner']
    list_filter = ['status', 'project']
    search_fields = ['name']
    raw_id_fields = ['owner']


@admin.register(WaterfallGanttTask)
class WaterfallGanttTaskAdmin(admin.ModelAdmin):
    list_display = ['name', 'project', 'phase', 'start_date', 'end_date', 'progress', 'is_milestone']
    list_filter = ['is_milestone', 'phase', 'project']
    search_fields = ['name']
    raw_id_fields = ['assignee']


@admin.register(WaterfallChangeRequest)
class WaterfallChangeRequestAdmin(admin.ModelAdmin):
    list_display = ['change_id', 'title', 'project', 'priority', 'status', 'requested_by', 'created_at']
    list_filter = ['priority', 'status', 'project']
    search_fields = ['change_id', 'title']
    raw_id_fields = ['requested_by', 'reviewed_by', 'affected_phase']


@admin.register(WaterfallDeploymentChecklist)
class WaterfallDeploymentChecklistAdmin(admin.ModelAdmin):
    list_display = ['item', 'project', 'category', 'is_required', 'is_completed', 'completed_by', 'completed_at']
    list_filter = ['category', 'is_required', 'is_completed', 'project']
    search_fields = ['item']


@admin.register(WaterfallMaintenanceItem)
class WaterfallMaintenanceItemAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'item_type', 'priority', 'status', 'reported_by', 'reported_date']
    list_filter = ['item_type', 'priority', 'status', 'project']
    search_fields = ['title']
    raw_id_fields = ['reported_by', 'assignee']


@admin.register(WaterfallBudget)
class WaterfallBudgetAdmin(admin.ModelAdmin):
    list_display = ['project', 'total_budget', 'currency', 'contingency_percentage', 'created_at']
    search_fields = ['project__name']


@admin.register(WaterfallBudgetItem)
class WaterfallBudgetItemAdmin(admin.ModelAdmin):
    list_display = ['description', 'budget', 'phase', 'category', 'planned_amount', 'actual_amount', 'date']
    list_filter = ['category']
    raw_id_fields = ['phase']
