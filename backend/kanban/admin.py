from django.contrib import admin
from .models import (
    KanbanBoard, KanbanColumn, KanbanSwimlane, KanbanCard,
    CardHistory, CardComment, CardChecklist, ChecklistItem,
    CumulativeFlowData, KanbanMetrics, WipLimitViolation
)


@admin.register(KanbanBoard)
class KanbanBoardAdmin(admin.ModelAdmin):
    list_display = ['project', 'name', 'created_at']
    search_fields = ['project__name', 'name']


@admin.register(KanbanColumn)
class KanbanColumnAdmin(admin.ModelAdmin):
    list_display = ['board', 'name', 'column_type', 'order', 'wip_limit', 'is_done_column']
    list_filter = ['column_type', 'is_done_column']
    ordering = ['board', 'order']


@admin.register(KanbanSwimlane)
class KanbanSwimlaneAdmin(admin.ModelAdmin):
    list_display = ['board', 'name', 'order', 'is_default']
    ordering = ['board', 'order']


@admin.register(KanbanCard)
class KanbanCardAdmin(admin.ModelAdmin):
    list_display = ['title', 'board', 'column', 'card_type', 'priority', 'assignee', 'is_blocked']
    list_filter = ['card_type', 'priority', 'is_blocked']
    search_fields = ['title', 'description']


@admin.register(CardHistory)
class CardHistoryAdmin(admin.ModelAdmin):
    list_display = ['card', 'from_column', 'to_column', 'moved_by', 'moved_at']
    ordering = ['-moved_at']


@admin.register(CardComment)
class CardCommentAdmin(admin.ModelAdmin):
    list_display = ['card', 'user', 'created_at']
    ordering = ['-created_at']


@admin.register(CardChecklist)
class CardChecklistAdmin(admin.ModelAdmin):
    list_display = ['card', 'title', 'order']


@admin.register(ChecklistItem)
class ChecklistItemAdmin(admin.ModelAdmin):
    list_display = ['checklist', 'text', 'is_completed', 'order']
    list_filter = ['is_completed']


@admin.register(CumulativeFlowData)
class CumulativeFlowDataAdmin(admin.ModelAdmin):
    list_display = ['board', 'date', 'column', 'card_count']
    ordering = ['-date']


@admin.register(KanbanMetrics)
class KanbanMetricsAdmin(admin.ModelAdmin):
    list_display = ['board', 'date', 'cards_completed', 'total_wip', 'avg_lead_time_hours']
    ordering = ['-date']


@admin.register(WipLimitViolation)
class WipLimitViolationAdmin(admin.ModelAdmin):
    list_display = ['column', 'violated_at', 'card_count', 'wip_limit', 'resolved_at']
    ordering = ['-violated_at']
