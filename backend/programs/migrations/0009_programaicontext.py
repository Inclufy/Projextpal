from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("programs", "0008_programtailoring"),
    ]

    operations = [
        migrations.CreateModel(
            name="ProgramAIContext",
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
                    "program",
                    models.OneToOneField(
                        on_delete=models.deletion.CASCADE,
                        related_name="ai_context",
                        to="programs.program",
                    ),
                ),
            ],
            options={
                "verbose_name": "Program AI Context",
            },
        ),
    ]
