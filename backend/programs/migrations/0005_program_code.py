"""Add program_code on Program."""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('programs', '0004_programteam'),
    ]

    operations = [
        migrations.AddField(
            model_name='program',
            name='program_code',
            field=models.CharField(
                blank=True, db_index=True, max_length=64,
                help_text="Code used by finance/admin systems for invoice matching (e.g. 'PG-2026-001').",
            ),
        ),
    ]
