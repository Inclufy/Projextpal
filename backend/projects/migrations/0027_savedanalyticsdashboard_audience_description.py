from django.db import migrations, models


def shared_to_audience(apps, schema_editor):
    Dash = apps.get_model("projects", "SavedAnalyticsDashboard")
    # Existing dashboards defaulted to shared=True (tenant-wide). Preserve that.
    Dash.objects.filter(shared=True).update(audience="tenant")
    Dash.objects.filter(shared=False).update(audience="private")


def noop(apps, schema_editor):
    pass


# Idempotent column adds: this environment has shown migration-state drift
# (columns present while the migration record is missing). PostgreSQL uses
# ADD COLUMN IF NOT EXISTS; other backends (SQLite in tests/CI) add only when
# introspection shows the column missing — same pattern as 0029/0031.
def add_cols(apps, schema_editor):
    conn = schema_editor.connection
    if conn.vendor == "postgresql":
        schema_editor.execute(
            "ALTER TABLE projects_savedanalyticsdashboard "
            "ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '';"
        )
        schema_editor.execute(
            "ALTER TABLE projects_savedanalyticsdashboard "
            "ADD COLUMN IF NOT EXISTS audience varchar(16) NOT NULL DEFAULT 'private';"
        )
        return
    # Bewust géén schema_editor.add_field: op SQLite herbouwt die de tabel
    # vanuit het historische model, waardoor de tweede add_field de eerste
    # (nog niet in de modelstate bekende) kolom weer laat vervallen.
    # Plain ADD COLUMN met default is op alle backends geldig.
    with conn.cursor() as c:
        cols = [col.name for col in conn.introspection.get_table_description(
            c, "projects_savedanalyticsdashboard")]
    if "description" not in cols:
        schema_editor.execute(
            "ALTER TABLE projects_savedanalyticsdashboard "
            "ADD COLUMN description text NOT NULL DEFAULT '';")
    if "audience" not in cols:
        schema_editor.execute(
            "ALTER TABLE projects_savedanalyticsdashboard "
            "ADD COLUMN audience varchar(16) NOT NULL DEFAULT 'private';")


def drop_cols(apps, schema_editor):
    if schema_editor.connection.vendor == "postgresql":
        schema_editor.execute(
            "ALTER TABLE projects_savedanalyticsdashboard DROP COLUMN IF EXISTS description;")
        schema_editor.execute(
            "ALTER TABLE projects_savedanalyticsdashboard DROP COLUMN IF EXISTS audience;")


class Migration(migrations.Migration):

    dependencies = [
        ("projects", "0026_savedanalyticsdashboard"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[migrations.RunPython(add_cols, drop_cols)],
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
