from django.contrib import admin
from .models import P2Blueprint, P2ProgrammeProject


@admin.register(P2Blueprint)
class P2BlueprintAdmin(admin.ModelAdmin):
    list_display = ['name', 'programme', 'version', 'status', 'created_by', 'created_at']
    list_filter = ['status', 'version']
    search_fields = ['name', 'description', 'programme__name']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(P2ProgrammeProject)
class P2ProgrammeProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'programme', 'methodology', 'status', 'start_date', 'end_date', 'budget']
    list_filter = ['methodology', 'status']
    search_fields = ['name', 'description', 'programme__name']
    readonly_fields = ['id', 'created_at', 'updated_at']
