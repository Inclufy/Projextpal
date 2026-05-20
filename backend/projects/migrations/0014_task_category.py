from django.db import migrations, models


class Migration(migrations.Migration):
    """Sprint 1 — Task.category for Yanmar Action Tracker sub-totals."""

    dependencies = [
        ("projects", "0013_yanmar_schema_batch"),
    ]

    operations = [
        migrations.AddField(
            model_name="task",
            name="category",
            field=models.CharField(
                blank=True, db_index=True, default="", max_length=100,
                help_text=(
                    "Optional grouping label used for sub-totals (Action Tracker "
                    "style)."
                ),
            ),
        ),
    ]
