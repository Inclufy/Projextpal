from django.contrib import admin
from .models import (
    Project,
    Milestone,
    Task,
    Subtask,
    Expense,
    Risk,
    ManualMitigation,
    AIMitigation,
    ProjectEvent,
)


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "company", "status", "created_at")
    list_filter = ("company", "status", "methodology", "project_type")
    search_fields = ("name", "description", "project_goal")


@admin.register(Milestone)
class MilestoneAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "project", "status", "order_index")
    list_filter = ("status", "project")
    search_fields = ("name", "description")


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "milestone",
        "assigned_to",
        "status",
        "priority",
        "progress",
    )
    list_filter = ("status", "priority")
    search_fields = ("title", "description")


@admin.register(Subtask)
class SubtaskAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "task", "completed")
    list_filter = ("completed",)
    search_fields = ("title",)


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "project",
        "description",
        "category",
        "amount",
        "status",
        "date",
    )
    list_filter = ("status", "category", "project")
    search_fields = ("description",)


@admin.register(Risk)
class RiskAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "project", "status", "level")
    list_filter = ("status", "level", "project")
    search_fields = ("name", "description")
    raw_id_fields = ("project", "owner", "created_by")


@admin.register(ManualMitigation)
class ManualMitigationAdmin(admin.ModelAdmin):
    list_display = ("id", "risk", "strategy", "cost", "effectiveness")
    list_filter = ("cost", "effectiveness")
    search_fields = ("strategy", "notes")
    raw_id_fields = ("risk", "created_by")


@admin.register(AIMitigation)
class AIMitigationAdmin(admin.ModelAdmin):
    list_display = ("id", "risk", "strategy", "cost", "effectiveness")
    list_filter = ("cost", "effectiveness")
    search_fields = ("strategy", "notes")


@admin.register(ProjectEvent)
class ProjectEventAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "project", "start_date", "end_date", "created_by")
    list_filter = ("project", "start_date", "end_date")
    search_fields = ("title", "description")
    raw_id_fields = ("project", "created_by")

# ========================================
# ADD TO projects/admin.py
# ========================================

from .models import BudgetCategory, BudgetItem, ProjectBudget


@admin.register(BudgetCategory)
class BudgetCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'company', 'allocated', 'spent', 'remaining', 'created_at']
    list_filter = ['company', 'created_at']
    search_fields = ['name', 'company__name']
    readonly_fields = ['spent', 'remaining', 'created_at', 'updated_at']


@admin.register(BudgetItem)
class BudgetItemAdmin(admin.ModelAdmin):
    list_display = [
        'description', 'amount', 'date', 'type', 'status',
        'category', 'project', 'created_by'
    ]
    list_filter = ['status', 'type', 'date', 'category', 'project']
    search_fields = ['description', 'created_by__email', 'project__name']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'date'


@admin.register(ProjectBudget)
class ProjectBudgetAdmin(admin.ModelAdmin):
    list_display = [
        'project', 'total_budget', 'total_spent',
        'total_remaining', 'currency', 'updated_at'
    ]
    list_filter = ['currency', 'updated_at']
    search_fields = ['project__name']
    readonly_fields = ['total_spent', 'total_remaining', 'created_at', 'updated_at']