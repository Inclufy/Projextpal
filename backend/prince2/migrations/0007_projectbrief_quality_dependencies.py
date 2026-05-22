from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('prince2', '0006_yanmar_highlight_report_rag'),
    ]

    operations = [
        migrations.AddField(
            model_name='projectbrief',
            name='dependencies',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='projectbrief',
            name='customer_quality_expectations',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='projectbrief',
            name='acceptance_criteria',
            field=models.TextField(blank=True, null=True),
        ),
    ]
