"""Sprint 7 S7-01 — add timesheet_required + budgeted_hours to ProjectTeam.

Both are additive with safe defaults (True / NULL) so the migration is
backward-compatible: pre-existing ProjectTeam rows keep working and the
older application image still boots without the fields referenced in a
query.
"""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("projects", "0041_alter_projectaicontext_source_files"),
    ]

    operations = [
        migrations.AddField(
            model_name="projectteam",
            name="timesheet_required",
            field=models.BooleanField(
                default=True,
                help_text=(
                    "Whether this member is expected to log hours on this "
                    "project. When False the picker still lets them pick "
                    "the project but no nudge is shown."
                ),
            ),
        ),
        migrations.AddField(
            model_name="projectteam",
            name="budgeted_hours",
            field=models.DecimalField(
                max_digits=8,
                decimal_places=2,
                null=True,
                blank=True,
                help_text=(
                    "Begrote uren voor deze persoon op dit project. "
                    "Overschrijding = warning, niet blocking."
                ),
            ),
        ),
    ]
