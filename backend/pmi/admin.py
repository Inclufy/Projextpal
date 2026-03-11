from django.contrib import admin
from .models import PMIComponent, PMIGovernanceBoard


@admin.register(PMIComponent)
class PMIComponentAdmin(admin.ModelAdmin):
    list_display = ['name', 'program', 'type', 'status', 'start_date', 'end_date', 'budget']
    list_filter = ['type', 'status']
    search_fields = ['name', 'description', 'program__name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    filter_horizontal = ['depends_on']


@admin.register(PMIGovernanceBoard)
class PMIGovernanceBoardAdmin(admin.ModelAdmin):
    list_display = ['meeting_type', 'program', 'meeting_date', 'created_at']
    list_filter = ['meeting_type', 'meeting_date']
    search_fields = ['program__name', 'agenda', 'minutes']
    readonly_fields = ['id', 'created_at', 'updated_at']
