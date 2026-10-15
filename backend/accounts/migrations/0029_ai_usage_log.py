"""AIUsageLog — per-call persistent audit for BYOK dashboards + monthly billing.

Additive-only: new table, no existing columns touched. Rollback-safe without
a DB restore (per CLAUDE.md §3).
"""
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0028_skill_userskill"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="AIUsageLog",
            fields=[
                ("id", models.AutoField(primary_key=True, auto_created=True, serialize=False)),
                ("provider", models.CharField(
                    max_length=20,
                    choices=[
                        ("openai", "OpenAI"),
                        ("anthropic", "Anthropic"),
                        ("gemini", "Google Gemini"),
                        ("deepseek", "DeepSeek"),
                        ("ollama", "Ollama (local)"),
                        ("other", "Other"),
                    ],
                    db_index=True,
                )),
                ("model", models.CharField(max_length=100, blank=True, default="")),
                ("surface", models.CharField(max_length=64, blank=True, default="", db_index=True)),
                ("tokens", models.PositiveIntegerField(default=0)),
                ("tokens_prompt", models.PositiveIntegerField(default=0)),
                ("tokens_completion", models.PositiveIntegerField(default=0)),
                ("cost_cents", models.PositiveIntegerField(default=0)),
                ("byok", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("company", models.ForeignKey(
                    to="accounts.company",
                    on_delete=models.deletion.CASCADE,
                    related_name="ai_usage_logs",
                    null=True, blank=True,
                )),
                ("user", models.ForeignKey(
                    to=settings.AUTH_USER_MODEL,
                    on_delete=models.deletion.SET_NULL,
                    related_name="ai_usage_logs",
                    null=True, blank=True,
                )),
            ],
            options={
                "verbose_name": "AI usage log",
                "ordering": ["-created_at"],
            },
        ),
        migrations.AddIndex(
            model_name="aiusagelog",
            index=models.Index(fields=["company", "created_at"], name="aiusage_company_crea_idx"),
        ),
        migrations.AddIndex(
            model_name="aiusagelog",
            index=models.Index(fields=["company", "byok", "created_at"], name="aiusage_company_byok_idx"),
        ),
        migrations.AddIndex(
            model_name="aiusagelog",
            index=models.Index(fields=["user", "created_at"], name="aiusage_user_crea_idx"),
        ),
        migrations.AddIndex(
            model_name="aiusagelog",
            index=models.Index(fields=["surface", "created_at"], name="aiusage_surf_crea_idx"),
        ),
    ]
