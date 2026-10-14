"""Sprint 7 S7-01 — add timesheet_required + budgeted_hours to ProgramTeam.

Both are additive with safe defaults (True / NULL) so the migration is
backward-compatible: pre-existing ProgramTeam rows keep working and the
older application image still boots without the fields referenced in a
query.
"""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("programs", "0011_alter_programaicontext_source_files"),
    ]

    operations = [
        migrations.AddField(
            model_name="programteam",
            name="timesheet_required",
            field=models.BooleanField(
                default=True,
                help_text=(
                    "Whether this member is expected to log hours on "
                    "projects under this program. Cascades to "
                    "ProjectTeam.timesheet_required when a program "
                    "membership fans out to constituent projects."
                ),
            ),
        ),
        migrations.AddField(
            model_name="programteam",
            name="budgeted_hours",
            field=models.DecimalField(
                max_digits=8,
                decimal_places=2,
                null=True,
                blank=True,
                help_text=(
                    "Begrote uren voor deze persoon op het programma. "
                    "Overschrijding = warning, niet blocking."
                ),
            ),
        ),
    ]
