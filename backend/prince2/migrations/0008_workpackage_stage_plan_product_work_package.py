import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('prince2', '0007_projectbrief_quality_dependencies'),
    ]

    operations = [
        migrations.AddField(
            model_name='workpackage',
            name='stage_plan',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='work_packages',
                to='prince2.stageplan',
            ),
        ),
        migrations.AddField(
            model_name='product',
            name='work_package',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='products',
                to='prince2.workpackage',
            ),
        ),
    ]
