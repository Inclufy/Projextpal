from django.contrib import admin
from .models import DMAICPhase, LSSGreenMetric, LSSGreenMeasurement


@admin.register(DMAICPhase)
class DMAICPhaseAdmin(admin.ModelAdmin):
    list_display = ['phase', 'project', 'status', 'order', 'created_at']
    list_filter = ['phase', 'status']
    search_fields = ['project__name', 'objective']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(LSSGreenMetric)
class LSSGreenMetricAdmin(admin.ModelAdmin):
    list_display = ['metric_type', 'project', 'cp', 'cpk', 'defects_per_million', 'created_at']
    list_filter = ['metric_type']
    search_fields = ['project__name']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(LSSGreenMeasurement)
class LSSGreenMeasurementAdmin(admin.ModelAdmin):
    list_display = ['metric', 'phase', 'project', 'baseline_value', 'actual_value', 'unit', 'created_at']
    list_filter = ['phase']
    search_fields = ['metric', 'project__name']
    readonly_fields = ['id', 'created_at', 'updated_at']
