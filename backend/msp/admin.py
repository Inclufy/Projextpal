from django.contrib import admin
from .models import MSPBenefit, BenefitRealization, MSPTranche


@admin.register(MSPBenefit)
class MSPBenefitAdmin(admin.ModelAdmin):
    list_display = ['name', 'program', 'target_value', 'status', 'owner', 'created_at']
    list_filter = ['status']
    search_fields = ['name', 'description', 'program__name']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(BenefitRealization)
class BenefitRealizationAdmin(admin.ModelAdmin):
    list_display = ['benefit', 'actual_value', 'measurement_date', 'created_at']
    list_filter = ['measurement_date']
    search_fields = ['benefit__name']
    readonly_fields = ['id', 'created_at']


@admin.register(MSPTranche)
class MSPTrancheAdmin(admin.ModelAdmin):
    list_display = ['name', 'program', 'sequence', 'start_date', 'end_date', 'status', 'budget']
    list_filter = ['status']
    search_fields = ['name', 'program__name']
    readonly_fields = ['id', 'created_at', 'updated_at']
