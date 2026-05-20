from django.db import migrations, models


class Migration(migrations.Migration):
    """Yanmar Sprint 0 — additive schema batch.

    All fields nullable/defaulted -> online-safe.
    """

    dependencies = [
        ("projects", "0012_manualmitigation_attachments_risk_attachments_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="project",
            name="scope_in",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="project",
            name="scope_out",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="project",
            name="target_implementation_date",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="task",
            name="revised_due_date",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="task",
            name="completed_on",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="projectbudget",
            name="etc",
            field=models.DecimalField(
                decimal_places=2, default=0,
                help_text=(
                    "Estimate To Complete — forecasted remaining cost to "
                    "finish the project."
                ),
                max_digits=15,
            ),
        ),
        migrations.AddField(
            model_name="projectbudget",
            name="contingency",
            field=models.DecimalField(
                decimal_places=2, default=0,
                help_text="Contingency reserve held outside the working budget.",
                max_digits=15,
            ),
        ),
    ]
