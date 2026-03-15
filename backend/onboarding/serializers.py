from rest_framework import serializers
from .models import OnboardingProfile


class AnalyzeCompanySerializer(serializers.Serializer):
    """Input for website analysis."""
    url = serializers.URLField(required=True)
    language = serializers.ChoiceField(choices=['nl', 'en'], default='nl')


class SuggestSetupSerializer(serializers.Serializer):
    """Input for AI setup suggestion."""
    industry = serializers.CharField(required=True)
    company_size = serializers.ChoiceField(
        choices=['solo', 'small', 'medium', 'large', 'enterprise'],
        default='small',
    )
    project_types = serializers.ListField(
        child=serializers.CharField(),
        default=['software'],
    )
    default_methodology = serializers.CharField(default='agile')
    country = serializers.CharField(default='NL')
    company_name = serializers.CharField(required=True)
    language = serializers.ChoiceField(choices=['nl', 'en'], default='nl')


class OnboardingCompleteSerializer(serializers.Serializer):
    """Input for completing onboarding — saves all collected data."""
    # Phase 1
    company_name = serializers.CharField(required=True)
    website = serializers.URLField(required=False, allow_blank=True, default='')
    industry = serializers.CharField(required=False, allow_blank=True, default='')
    country = serializers.CharField(default='NL')
    description = serializers.CharField(required=False, allow_blank=True, default='')

    # Phase 2
    default_methodology = serializers.CharField(default='agile')
    project_types = serializers.ListField(
        child=serializers.CharField(),
        default=['software'],
    )
    team_roles = serializers.ListField(
        child=serializers.DictField(),
        default=[],
    )
    company_size = serializers.CharField(default='small')
    currency = serializers.CharField(default='EUR')
    time_tracking_enabled = serializers.BooleanField(default=True)
    risk_management_enabled = serializers.BooleanField(default=True)
    governance_enabled = serializers.BooleanField(default=True)

    # Phase 3 — AI suggestions confirmed
    setup_suggestion = serializers.DictField(required=False, default=None)

    # Demo data
    generate_demo_data = serializers.BooleanField(default=False)
    demo_industry = serializers.CharField(required=False, allow_blank=True, default='')


class OnboardingProfileSerializer(serializers.ModelSerializer):
    """Output serializer for onboarding profile status."""

    class Meta:
        model = OnboardingProfile
        fields = [
            'id',
            'company_name',
            'website',
            'industry',
            'country',
            'description',
            'default_methodology',
            'project_types',
            'team_roles',
            'company_size',
            'currency',
            'time_tracking_enabled',
            'risk_management_enabled',
            'governance_enabled',
            'setup_suggestion',
            'methodology_confirmed',
            'roles_confirmed',
            'templates_confirmed',
            'onboarding_completed',
            'completed_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
