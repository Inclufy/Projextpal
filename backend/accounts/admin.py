from django import forms
from django.contrib import admin
from accounts.models import (
    CustomUser,
    VerificationToken,
    PasswordResetToken,
    Company,
    CompanyAIKey,
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


class CompanyAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "is_subscribed")
    list_filter = ("is_subscribed",)
    search_fields = ("name",)


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
