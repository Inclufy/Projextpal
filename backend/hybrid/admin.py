from django.contrib import admin
from .models import HybridArtifact, HybridConfiguration, PhaseMethodology


@admin.register(HybridArtifact)
class HybridArtifactAdmin(admin.ModelAdmin):
    list_display = ['name', 'project', 'source_methodology', 'status', 'created_at']
    list_filter = ['source_methodology', 'status']
    search_fields = ['name', 'description', 'project__name']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(HybridConfiguration)
class HybridConfigurationAdmin(admin.ModelAdmin):
    list_display = ['project', 'primary_methodology', 'is_active', 'created_at']
    list_filter = ['primary_methodology', 'is_active']
    search_fields = ['project__name', 'approach_description']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(PhaseMethodology)
class PhaseMethodologyAdmin(admin.ModelAdmin):
    list_display = ['phase', 'methodology', 'project', 'order', 'created_at']
    list_filter = ['methodology']
    search_fields = ['phase', 'project__name']
    readonly_fields = ['id', 'created_at', 'updated_at']
