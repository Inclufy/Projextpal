from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("accounts", "0022_role_default_guest"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="AIContextAccessLog",
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
                    "context_type",
                    models.CharField(
                        choices=[
                            ("project", "Project"),
                            ("program", "Programme"),
                            ("portfolio", "Portfolio"),
                        ],
                        db_index=True,
                        max_length=16,
                    ),
                ),
                (
                    "context_id",
                    models.CharField(
                        db_index=True,
                        help_text=(
                            "Project/program id (int) or portfolio id (UUID), "
                            "stored as string so one column covers all three."
                        ),
                        max_length=64,
                    ),
                ),
                (
                    "surface",
                    models.CharField(
                        help_text=(
                            "AI surface that consumed the context, e.g. "
                            "'copilot', 'coach', 'autodraft'."
                        ),
                        max_length=64,
                    ),
                ),
                (
                    "chars_used",
                    models.PositiveIntegerField(
                        default=0,
                        help_text="Length of the context prefix the LLM saw.",
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                (
                    "company",
                    models.ForeignKey(
                        blank=True,
                        help_text=(
                            "Owning tenant. Nullable because superadmin reads "
                            "across tenants may not resolve to a single "
                            "company; the log row is still kept."
                        ),
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="ai_access_logs",
                        to="accounts.company",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="ai_access_logs",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "AI Context Access Log",
                "ordering": ["-created_at"],
                "indexes": [
                    models.Index(
                        fields=["company", "created_at"],
                        name="ai_audit_ai_company_a6d684_idx",
                    ),
                    models.Index(
                        fields=["context_type", "context_id"],
                        name="ai_audit_ai_context_5d9926_idx",
                    ),
                    models.Index(
                        fields=["user", "created_at"],
                        name="ai_audit_ai_user_id_ffb41d_idx",
                    ),
                ],
            },
        ),
    ]
