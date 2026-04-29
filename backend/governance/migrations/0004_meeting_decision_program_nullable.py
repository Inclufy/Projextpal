from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('programs', '0004_programteam'),
        ('governance', '0003_decision_meeting'),
    ]

    operations = [
        migrations.AlterField(
            model_name='decision',
            name='program',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='decisions',
                to='programs.program',
            ),
        ),
        migrations.AlterField(
            model_name='meeting',
            name='program',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='governance_meetings',
                to='programs.program',
            ),
        ),
    ]
