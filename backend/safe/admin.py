from django.contrib import admin
from .models import AgileReleaseTrain, ARTSync, ProgramIncrement, PIObjective


@admin.register(AgileReleaseTrain)
class AgileReleaseTrainAdmin(admin.ModelAdmin):
    list_display = ['name', 'program', 'team_count', 'rte', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name', 'description', 'program__name']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(ARTSync)
class ARTSyncAdmin(admin.ModelAdmin):
    list_display = ['art', 'meeting_date', 'created_at']
    list_filter = ['meeting_date']
    search_fields = ['art__name']
    readonly_fields = ['id', 'created_at']


@admin.register(ProgramIncrement)
class ProgramIncrementAdmin(admin.ModelAdmin):
    list_display = ['name', 'program', 'iteration_count', 'start_date', 'end_date', 'status', 'created_at']
    list_filter = ['status']
    search_fields = ['name', 'program__name']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(PIObjective)
class PIObjectiveAdmin(admin.ModelAdmin):
    list_display = ['description', 'pi', 'business_value', 'committed', 'achieved', 'created_at']
    list_filter = ['committed', 'achieved']
    search_fields = ['description', 'team']
    readonly_fields = ['id', 'created_at', 'updated_at']
