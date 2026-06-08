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

    # Idempotent column adds: this environment has shown migration-state drift
    # (columns present while the migration record is missing). Using
    # SeparateDatabaseAndState with ADD COLUMN IF NOT EXISTS keeps the schema
    # in sync without crashing when a column already exists, while Django's
    # model state still learns about the new fields.
    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(
                    sql=(
                        "ALTER TABLE projects_savedanalyticsdashboard "
                        "ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '';"
                    ),
                    reverse_sql=(
                        "ALTER TABLE projects_savedanalyticsdashboard "
                        "DROP COLUMN IF EXISTS description;"
                    ),
                ),
                migrations.RunSQL(
                    sql=(
                        "ALTER TABLE projects_savedanalyticsdashboard "
                        "ADD COLUMN IF NOT EXISTS audience varchar(16) NOT NULL DEFAULT 'private';"
                    ),
                    reverse_sql=(
                        "ALTER TABLE projects_savedanalyticsdashboard "
                        "DROP COLUMN IF EXISTS audience;"
                    ),
                ),
            ],
            state_operations=[
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
            ],
        ),
        migrations.RunPython(shared_to_audience, noop),
    ]
