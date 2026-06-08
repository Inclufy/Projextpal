from django.db import migrations, models


def shared_to_audience(apps, schema_editor):
    Dash = apps.get_model("projects", "SavedAnalyticsDashboard")
    # Existing dashboards defaulted to shared=True (tenant-wide). Preserve that.
    Dash.objects.filter(shared=True).update(audience="tenant")
    Dash.objects.filter(shared=False).update(audience="private")


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("projects", "0026_savedanalyticsdashboard"),
    ]

    operations = [
        migrations.AddField(
            model_name="savedanalyticsdashboard",
            name="description",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="savedanalyticsdashboard",
            name="audience",
            field=models.CharField(
                choices=[
                    ("private", "Private (only me)"),
                    ("management", "Management"),
                    ("tenant", "Whole organization"),
                ],
                default="private",
                max_length=16,
            ),
        ),
        migrations.RunPython(shared_to_audience, noop),
    ]
