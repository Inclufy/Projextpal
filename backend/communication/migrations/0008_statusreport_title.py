from django.db import migrations, models


class Migration(migrations.Migration):
    """P2-7: additive-with-default title column on StatusReport.

    Report rows across the app expect an id/title/created_at/project
    contract; StatusReport had no title field. Adding one as a nullable
    short string with a blank default is safe for existing data.
    """

    dependencies = [
        ('communication', '0007_methodologyreport'),
    ]

    operations = [
        migrations.AddField(
            model_name='statusreport',
            name='title',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
    ]
