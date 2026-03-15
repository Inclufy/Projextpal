from django.contrib import admin
from .models import OnboardingProfile


@admin.register(OnboardingProfile)
class OnboardingProfileAdmin(admin.ModelAdmin):
    list_display = ['company_name', 'industry', 'default_methodology', 'onboarding_completed', 'created_at']
    list_filter = ['onboarding_completed', 'default_methodology', 'industry']
    search_fields = ['company_name', 'industry']
    readonly_fields = ['created_at', 'updated_at', 'completed_at']
