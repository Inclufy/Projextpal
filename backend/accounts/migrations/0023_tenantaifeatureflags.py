from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0022_role_default_guest"),
    ]

    operations = [
        migrations.CreateModel(
            name="TenantAIFeatureFlags",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "ai_context_enabled",
                    models.BooleanField(
                        default=True,
                        help_text=(
                            "Master switch for ProjectAIContext / ProgramAIContext / "
                            "PortfolioAIContext injection into any AI call."
                        ),
                    ),
                ),
                (
                    "ai_autodrafts_enabled",
                    models.BooleanField(
                        default=True,
                        help_text=(
                            "Methodology auto-drafts (PRINCE2 Business Case / Project "
                            "Brief, Scrum, Waterfall, LSS, status-report)."
                        ),
                    ),
                ),
                (
                    "team_match_enabled",
                    models.BooleanField(
                        default=True,
                        help_text="Sprint 5 team recommender.",
                    ),
                ),
                (
                    "compliance_scan_enabled",
                    models.BooleanField(
                        default=True,
                        help_text="Sprint 5 compliance rescan + auto-tag.",
                    ),
                ),
                (
                    "dashboard_narratives_enabled",
                    models.BooleanField(
                        default=True,
                        help_text="Sprint 5 proactive dashboard narrative generator.",
                    ),
                ),
                (
                    "audit_log_retention_days",
                    models.PositiveIntegerField(
                        default=365,
                        help_text=(
                            "How long AIContextAccessLog rows are kept before the "
                            "nightly janitor purges them. 0 = keep forever."
                        ),
                    ),
                ),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "company",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="ai_feature_flags",
                        to="accounts.company",
                    ),
                ),
            ],
            options={
                "verbose_name": "Tenant AI Feature Flags",
                "verbose_name_plural": "Tenant AI Feature Flags",
            },
        ),
    ]
