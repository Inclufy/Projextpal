from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('programs', '0004_programteam'),
        ('p2_programme', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='p2blueprint',
            name='programme',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='p2_blueprints',
                to='programs.program',
            ),
        ),
        migrations.AlterField(
            model_name='p2programmeproject',
            name='programme',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='p2_projects',
                to='programs.program',
            ),
        ),
    ]
