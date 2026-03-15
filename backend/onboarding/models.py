from django.db import models
from django.conf import settings


class OnboardingProfile(models.Model):
    """Stores onboarding setup data per company."""

    company = models.OneToOneField(
        'accounts.Company',
        on_delete=models.CASCADE,
        related_name='onboarding_profile',
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='onboarding_profiles',
    )

    # Company basics (Phase 1)
    company_name = models.CharField(max_length=255)
    website = models.URLField(blank=True, default='')
    industry = models.CharField(max_length=100, blank=True, default='')
    country = models.CharField(max_length=2, default='NL')
    description = models.TextField(blank=True, default='')

    # AI analysis result (Phase 1 output)
    analysis_data = models.JSONField(null=True, blank=True)

    # Configuration (Phase 2)
    default_methodology = models.CharField(
        max_length=50,
        blank=True,
        default='',
        choices=[
            ('prince2', 'PRINCE2'),
            ('agile', 'Agile'),
            ('scrum', 'Scrum'),
            ('kanban', 'Kanban'),
            ('waterfall', 'Waterfall'),
            ('lean_six_sigma_green', 'Lean Six Sigma (Green Belt)'),
            ('lean_six_sigma_black', 'Lean Six Sigma (Black Belt)'),
            ('hybrid', 'Hybrid'),
        ],
    )
    project_types = models.JSONField(default=list, blank=True)
    team_roles = models.JSONField(default=list, blank=True)
    company_size = models.CharField(
        max_length=20,
        blank=True,
        default='small',
        choices=[
            ('solo', '1 persoon'),
            ('small', '2-10'),
            ('medium', '11-50'),
            ('large', '51-200'),
            ('enterprise', '200+'),
        ],
    )

    # Settings (Phase 2)
    currency = models.CharField(max_length=3, default='EUR')
    time_tracking_enabled = models.BooleanField(default=True)
    risk_management_enabled = models.BooleanField(default=True)
    governance_enabled = models.BooleanField(default=True)

    # AI-generated setup (Phase 3)
    setup_suggestion = models.JSONField(null=True, blank=True)
    methodology_confirmed = models.BooleanField(default=False)
    roles_confirmed = models.BooleanField(default=False)
    templates_confirmed = models.BooleanField(default=False)

    # Completion tracking
    onboarding_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Onboarding Profile'
        verbose_name_plural = 'Onboarding Profiles'

    def __str__(self):
        return f"Onboarding: {self.company_name} ({self.company_id})"
