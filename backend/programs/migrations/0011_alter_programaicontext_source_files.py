"""Sprint 6 — update help_text on source_files + BigAutoField on id."""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("programs", "0010_encrypt_program_ai_context"),
    ]

    operations = [
        migrations.AlterField(
            model_name="programaicontext",
            name="id",
            field=models.BigAutoField(
                auto_created=True, primary_key=True, serialize=False, verbose_name="ID",
            ),
        ),
        migrations.AlterField(
            model_name="programaicontext",
            name="source_files",
            field=models.JSONField(
                blank=True,
                default=list,
                help_text=(
                    "List of {name, size, pages, enabled} dicts for traceability. "
                    "Optional per-document ``enabled`` flag (default True) hides "
                    "a single document from AI context without removing it."
                ),
            ),
        ),
    ]
