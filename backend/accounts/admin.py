from django import forms
from django.contrib import admin
from accounts.models import (
    CustomUser,
    VerificationToken,
    PasswordResetToken,
    Company,
    CompanyAIKey,
    TenantAIFeatureFlags,
)


class CompanyAIKeyForm(forms.ModelForm):
    """Render API keys as masked password fields in the Django admin."""

    openai_api_key = forms.CharField(
        widget=forms.PasswordInput(render_value=True), required=False,
    )
    anthropic_api_key = forms.CharField(
        widget=forms.PasswordInput(render_value=True), required=False,
    )

    class Meta:
        model = CompanyAIKey
        fields = "__all__"


@admin.register(CompanyAIKey)
class CompanyAIKeyAdmin(admin.ModelAdmin):
    form = CompanyAIKeyForm
    list_display = (
        "company", "is_active",
        "has_openai", "has_anthropic",
        "last_used_provider", "last_used_at",
    )
    list_filter = ("is_active", "last_used_provider")
    search_fields = ("company__name",)
    readonly_fields = ("last_used_at", "last_used_provider", "created_at", "updated_at")

    def has_openai(self, obj):
        return bool(obj.openai_api_key)
    has_openai.boolean = True
    has_openai.short_description = "OpenAI"

    def has_anthropic(self, obj):
        return bool(obj.anthropic_api_key)
    has_anthropic.boolean = True
    has_anthropic.short_description = "Anthropic"


@admin.register(TenantAIFeatureFlags)
class TenantAIFeatureFlagsAdmin(admin.ModelAdmin):
    list_display = (
        "company",
        "ai_context_enabled",
        "ai_autodrafts_enabled",
        "team_match_enabled",
        "compliance_scan_enabled",
        "dashboard_narratives_enabled",
        "audit_log_retention_days",
        "updated_at",
    )
    list_filter = (
        "ai_context_enabled",
        "ai_autodrafts_enabled",
        "team_match_enabled",
        "compliance_scan_enabled",
        "dashboard_narratives_enabled",
    )
    search_fields = ("company__name",)
    readonly_fields = ("created_at", "updated_at")


class CompanyAdmin(admin.ModelAdmin):
    list_display = (
        "id", "name", "is_subscribed", "ai_premium_models",
        "ai_user_daily_token_cap", "ai_monthly_token_quota",
    )
    list_filter = ("is_subscribed", "ai_premium_models")
    search_fields = ("name",)
    fieldsets = (
        (None, {"fields": ("name", "description", "is_subscribed")}),
        ("Branding", {"fields": ("logo", "primary_color", "custom_domain"),
                      "classes": ("collapse",)}),
        ("Tenant defaults", {"fields": ("industry", "organization_size",
                                        "timezone", "locale", "currency"),
                              "classes": ("collapse",)}),
        ("AI model tier", {
            "fields": ("ai_premium_models",),
            "description": (
                "OFF (default): Sonnet-first ladder for heavy drafts "
                "(BC/Brief/Scrum), Haiku-first for light drafts "
                "(risks/milestones/swimlanes). Keeps bruto marge ~80%. "
                "ON: Opus-first for heavy drafts, Sonnet-first for light "
                "ones. ~5x more expensive on inkoop; only enable for "
                "Enterprise-tier contracts or on explicit customer request."
            ),
        }),
        ("AI caps (per-tenant override)", {
            "fields": ("ai_user_daily_token_cap", "ai_monthly_token_quota"),
            "description": (
                "Leave blank to use the global settings defaults "
                "(100.000 tokens/day/user and 1.000.000 tokens/month/tenant). "
                "Set a positive number to override. Set 0 to disable the cap "
                "for this tenant. No deploy needed, takes effect immediately."
            ),
        }),
        ("Advanced", {"fields": ("eval_mode", "require_2fa",
                                  "require_project_membership_for_time_entry",
                                  "default_hourly_rate"),
                       "classes": ("collapse",)}),
    )


class CustomUserAdmin(admin.ModelAdmin):
    list_display = ("id", "email", "role")
    list_filter = ("theme", "role")
    search_fields = ("email", "username")


class VerificationTokenAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "token", "created_at", "expires_at", "is_used")
    list_filter = ("is_used", "created_at", "expires_at")
    search_fields = ("user__email", "token")


class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "token", "created_at", "expires_at", "is_used")
    list_filter = ("is_used", "created_at", "expires_at")
    search_fields = ("user__email", "token")


# Register your models here.
admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(VerificationToken, VerificationTokenAdmin)
admin.site.register(PasswordResetToken, PasswordResetTokenAdmin)
admin.site.register(Company, CompanyAdmin)
