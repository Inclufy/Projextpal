from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("governance", "0013_financial_disclosure_ack"),
    ]

    operations = [
        migrations.CreateModel(
            name="PortfolioAIContext",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "enabled",
                    models.BooleanField(
                        default=True,
                        help_text=(
                            "If false, the AI endpoints will ignore this "
                            "context even though it is stored (soft "
                            "off-switch)."
                        ),
                    ),
                ),
                ("extracted_text", models.TextField(blank=True, default="")),
                (
                    "source_files",
                    models.JSONField(
                        blank=True,
                        default=list,
                        help_text=(
                            "List of {name, size, pages} dicts for traceability."
                        ),
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "portfolio",
                    models.OneToOneField(
                        on_delete=models.deletion.CASCADE,
                        related_name="ai_context",
                        to="governance.portfolio",
                    ),
                ),
            ],
            options={
                "verbose_name": "Portfolio AI Context",
            },
        ),
    ]
