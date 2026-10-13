"""Sprint 5 S5-02 — add Project.ai_suggested_tags.

Additive, non-destructive. Default is an empty list so legacy rows are
unaffected. Populated by the Sprint 5 auto-tag flow when a project is
created and a ``ProjectAIContext`` already exists.
"""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("projects", "0037_project_compliance_flags"),
    ]

    operations = [
        migrations.AddField(
            model_name="project",
            name="ai_suggested_tags",
            field=models.JSONField(blank=True, default=list),
        ),
    ]
