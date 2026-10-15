"""Sprint 5 S5-01 — add Project.compliance_flags.

Additive, non-destructive. Default is an empty list so legacy rows are
unaffected. The field is populated by
``projects.compliance_scan.scan_text()`` whenever a ``ProjectAIContext``
is created or updated (see ``projects/signals.py`` for the hook).
"""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("projects", "0036_projectaicontext"),
    ]

    operations = [
        migrations.AddField(
            model_name="project",
            name="compliance_flags",
            field=models.JSONField(blank=True, default=list),
        ),
    ]
