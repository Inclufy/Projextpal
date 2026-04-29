from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('programs', '0004_programteam'),
        ('msp', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='mspbenefit',
            name='program',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='msp_benefits',
                to='programs.program',
            ),
        ),
        migrations.AlterField(
            model_name='msptranche',
            name='program',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='msp_tranches',
                to='programs.program',
            ),
        ),
    ]
