from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('programs', '0004_programteam'),
        ('hybrid_programme', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='hybridgovernanceconfig',
            name='programme',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='hybrid_governance_configs',
                to='programs.program',
            ),
        ),
        migrations.AlterField(
            model_name='hybridadaptation',
            name='programme',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='hybrid_adaptations',
                to='programs.program',
            ),
        ),
    ]
