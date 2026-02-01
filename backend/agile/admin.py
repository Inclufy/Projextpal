from django.contrib import admin
from .models import (
    AgileTeamMember, AgileProductVision, AgileProductGoal,
    AgileUserPersona, AgileEpic, AgileBacklogItem, AgileIteration,
    AgileRelease, AgileDailyUpdate, AgileRetrospective, AgileRetroItem,
    AgileBudget, AgileBudgetItem
)


@admin.register(AgileTeamMember)
class AgileTeamMemberAdmin(admin.ModelAdmin):
    list_display = ['user', 'project', 'role', 'capacity_hours', 'joined_at']
    list_filter = ['role', 'project']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']


@admin.register(AgileProductVision)
class AgileProductVisionAdmin(admin.ModelAdmin):
    list_display = ['project', 'created_at', 'updated_at']
    search_fields = ['project__name']


@admin.register(AgileProductGoal)
class AgileProductGoalAdmin(admin.ModelAdmin):
    list_display = ['title', 'vision', 'priority', 'status', 'target_date']
    list_filter = ['priority', 'status']
    search_fields = ['title']


@admin.register(AgileUserPersona)
class AgileUserPersonaAdmin(admin.ModelAdmin):
    list_display = ['name', 'role', 'project', 'created_at']
    list_filter = ['project']
    search_fields = ['name', 'role']


@admin.register(AgileEpic)
class AgileEpicAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'priority', 'order', 'created_at']
    list_filter = ['priority', 'project']
    search_fields = ['title']


@admin.register(AgileBacklogItem)
class AgileBacklogItemAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'epic', 'item_type', 'priority', 'status', 'story_points', 'iteration']
    list_filter = ['item_type', 'priority', 'status', 'project']
    search_fields = ['title']
    raw_id_fields = ['epic', 'assignee', 'iteration']


@admin.register(AgileIteration)
class AgileIterationAdmin(admin.ModelAdmin):
    list_display = ['name', 'project', 'status', 'start_date', 'end_date', 'velocity_committed', 'velocity_completed']
    list_filter = ['status', 'project']
    search_fields = ['name']


@admin.register(AgileRelease)
class AgileReleaseAdmin(admin.ModelAdmin):
    list_display = ['name', 'version', 'project', 'status', 'target_date']
    list_filter = ['status', 'project']
    search_fields = ['name', 'version']


@admin.register(AgileDailyUpdate)
class AgileDailyUpdateAdmin(admin.ModelAdmin):
    list_display = ['user', 'project', 'iteration', 'date', 'created_at']
    list_filter = ['date', 'project']
    raw_id_fields = ['user', 'iteration']


@admin.register(AgileRetrospective)
class AgileRetrospectiveAdmin(admin.ModelAdmin):
    list_display = ['iteration', 'date', 'facilitator', 'created_at']
    raw_id_fields = ['facilitator']


@admin.register(AgileRetroItem)
class AgileRetroItemAdmin(admin.ModelAdmin):
    list_display = ['content', 'retrospective', 'category', 'votes', 'status']
    list_filter = ['category', 'status']


@admin.register(AgileBudget)
class AgileBudgetAdmin(admin.ModelAdmin):
    list_display = ['project', 'total_budget', 'currency', 'created_at']
    search_fields = ['project__name']


@admin.register(AgileBudgetItem)
class AgileBudgetItemAdmin(admin.ModelAdmin):
    list_display = ['description', 'budget', 'category', 'planned_amount', 'actual_amount', 'date']
    list_filter = ['category']
