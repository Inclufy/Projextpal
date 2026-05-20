from django.db import migrations, models


class Migration(migrations.Migration):
    """Sprint 3 — Yanmar Project Plan: Impact / Solution / ROI."""

    dependencies = [
        ("projects", "0017_projectmembership"),
    ]

    operations = [
        migrations.AddField(
            model_name="project",
            name="problem_impact",
            field=models.TextField(
                blank=True, default="",
                help_text="Impact of NOT changing or resolving the problem.",
            ),
        ),
        migrations.AddField(
            model_name="project",
            name="proposed_solution",
            field=models.TextField(
                blank=True, default="",
                help_text="Proposed solution to resolve the problem.",
            ),
        ),
        migrations.AddField(
            model_name="project",
            name="roi_target_pct",
            field=models.DecimalField(
                max_digits=6, decimal_places=2, null=True, blank=True,
                help_text=(
                    "Expected return on investment (percentage, e.g. 12.5)."
                ),
            ),
        ),
        migrations.AddField(
            model_name="project",
            name="roi_realized_pct",
            field=models.DecimalField(
                max_digits=6, decimal_places=2, null=True, blank=True,
                help_text="Measured ROI post go-live.",
            ),
        ),
    ]
