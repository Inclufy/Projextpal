from django.contrib import admin
from .models import (
    ProductBacklog, BacklogItem, Sprint, SprintBurndown,
    DailyStandup, StandupUpdate, SprintReview, SprintRetrospective,
    Velocity, DefinitionOfDone, ScrumTeam
)


@admin.register(ProductBacklog)
class ProductBacklogAdmin(admin.ModelAdmin):
    list_display = ['project', 'created_at']
    search_fields = ['project__name']


@admin.register(BacklogItem)
class BacklogItemAdmin(admin.ModelAdmin):
    list_display = ['title', 'item_type', 'status', 'priority', 'story_points', 'sprint', 'assignee']
    list_filter = ['item_type', 'status', 'priority']
    search_fields = ['title', 'description']


@admin.register(Sprint)
class SprintAdmin(admin.ModelAdmin):
    list_display = ['name', 'project', 'number', 'status', 'start_date', 'end_date']
    list_filter = ['status']
    ordering = ['-number']


@admin.register(SprintBurndown)
class SprintBurndownAdmin(admin.ModelAdmin):
    list_display = ['sprint', 'date', 'remaining_points', 'completed_points']
    ordering = ['-date']


@admin.register(DailyStandup)
class DailyStandupAdmin(admin.ModelAdmin):
    list_display = ['sprint', 'date']
    ordering = ['-date']


@admin.register(StandupUpdate)
class StandupUpdateAdmin(admin.ModelAdmin):
    list_display = ['standup', 'user']


@admin.register(SprintReview)
class SprintReviewAdmin(admin.ModelAdmin):
    list_display = ['sprint', 'date']


@admin.register(SprintRetrospective)
class SprintRetrospectiveAdmin(admin.ModelAdmin):
    list_display = ['sprint', 'date', 'team_morale']


@admin.register(Velocity)
class VelocityAdmin(admin.ModelAdmin):
    list_display = ['project', 'sprint', 'committed_points', 'completed_points']


@admin.register(DefinitionOfDone)
class DefinitionOfDoneAdmin(admin.ModelAdmin):
    list_display = ['project', 'item', 'order', 'is_active']
    list_filter = ['is_active']


@admin.register(ScrumTeam)
class ScrumTeamAdmin(admin.ModelAdmin):
    list_display = ['project', 'user', 'role', 'capacity_per_sprint']
    list_filter = ['role']
