"""Per-tenant AI cap overrides.

Adds two nullable PositiveIntegerField columns to Company:

  * ai_user_daily_token_cap  — per-user daily token limit for THIS tenant.
    NULL = use settings.AI_USER_DAILY_TOKEN_CAP (default 100_000).
  * ai_monthly_token_quota   — per-company monthly token quota for THIS
    tenant. NULL = use settings.AI_MONTHLY_TOKEN_QUOTA (default 1_000_000).

Additive migration — all existing tenants fall back to the current
settings defaults (no behaviour change until an admin sets a value).
"""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0029_ai_usage_log"),
    ]

    operations = [
        migrations.AddField(
            model_name="company",
            name="ai_user_daily_token_cap",
            field=models.PositiveIntegerField(
                null=True, blank=True,
                help_text=(
                    "Override the global per-user daily token cap for this "
                    "tenant. NULL = use settings default (100.000 tokens/day"
                    "/user). Set to 0 to disable the cap entirely for this "
                    "tenant."
                ),
            ),
        ),
        migrations.AddField(
            model_name="company",
            name="ai_monthly_token_quota",
            field=models.PositiveIntegerField(
                null=True, blank=True,
                help_text=(
                    "Override the global per-company monthly token quota "
                    "for this tenant. NULL = use settings default (1.000.000 "
                    "tokens/month). Set to 0 to disable the quota entirely "
                    "for this tenant."
                ),
            ),
        ),
    ]
