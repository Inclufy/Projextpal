from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    """Sprint 2 — Yanmar BYO LLM keys per company."""

    dependencies = [
        ("accounts", "0013_company_onboarding_fields"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="CompanyAIKey",
            fields=[
                ("id", models.AutoField(
                    auto_created=True, primary_key=True, serialize=False, verbose_name="ID",
                )),
                ("openai_api_key", models.CharField(
                    blank=True, default="", max_length=500,
                    help_text=(
                        "Optional. If set, used for all OpenAI calls from "
                        "this company."
                    ),
                )),
                ("openai_organization_id", models.CharField(
                    blank=True, default="", max_length=200,
                    help_text=(
                        "Optional OpenAI org id (X-OpenAI-Organization header)."
                    ),
                )),
                ("openai_base_url", models.URLField(
                    blank=True, default="",
                    help_text=(
                        "Optional override (e.g. corporate proxy or Azure "
                        "OpenAI)."
                    ),
                )),
                ("anthropic_api_key", models.CharField(
                    blank=True, default="", max_length=500,
                    help_text=(
                        "Optional. If set, used for all Anthropic calls from "
                        "this company."
                    ),
                )),
                ("anthropic_base_url", models.URLField(
                    blank=True, default="",
                    help_text=(
                        "Optional override for Anthropic API (e.g. Bedrock "
                        "proxy)."
                    ),
                )),
                ("is_active", models.BooleanField(default=True)),
                ("last_used_at", models.DateTimeField(blank=True, null=True)),
                ("last_used_provider", models.CharField(
                    blank=True, default="",
                    choices=[
                        ("openai", "OpenAI"),
                        ("anthropic", "Anthropic"),
                    ],
                    max_length=20,
                )),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("company", models.OneToOneField(
                    on_delete=models.deletion.CASCADE,
                    related_name="ai_key",
                    to="accounts.company",
                )),
                ("created_by", models.ForeignKey(
                    blank=True, null=True,
                    on_delete=models.deletion.SET_NULL,
                    related_name="created_company_ai_keys",
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                "verbose_name": "Company AI Key",
                "verbose_name_plural": "Company AI Keys",
                "indexes": [
                    models.Index(
                        fields=["company", "is_active"],
                        name="accounts_co_company_active_idx",
                    ),
                ],
            },
        ),
    ]
