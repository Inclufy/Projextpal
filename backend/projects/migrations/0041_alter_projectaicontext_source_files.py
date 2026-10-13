"""Sprint 6 — update help_text on source_files to document the per-document
``enabled`` flag introduced by S6-04. No schema change: JSONField shape is
backward-compatible (``.get('enabled', True)`` keeps old rows readable)."""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("projects", "0040_encrypt_ai_context_text"),
    ]

    operations = [
        migrations.AlterField(
            model_name="projectaicontext",
            name="id",
            field=models.BigAutoField(
                auto_created=True, primary_key=True, serialize=False, verbose_name="ID",
            ),
        ),
        migrations.AlterField(
            model_name="projectaicontext",
            name="source_files",
            field=models.JSONField(
                blank=True,
                default=list,
                help_text=(
                    "List of {name, size, pages, enabled} dicts for traceability. "
                    "The optional `enabled` flag lets the user hide a single "
                    "document from AI context without removing it."
                ),
            ),
        ),
    ]
