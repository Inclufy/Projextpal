from django.db import migrations, models


class Migration(migrations.Migration):
    """Sprint 3 — per-company default export-template preference."""

    dependencies = [
        ("accounts", "0015_companyaikey_encrypted"),
    ]

    operations = [
        migrations.CreateModel(
            name="CompanyExportPreference",
            fields=[
                ("id", models.AutoField(
                    auto_created=True, primary_key=True, serialize=False, verbose_name="ID",
                )),
                ("default_template", models.CharField(
                    choices=[
                        ("yanmar", "Yanmar / YEU layout"),
                        ("prince2", "PRINCE2 6th Edition"),
                        ("generic", "Generic"),
                    ],
                    default="yanmar", max_length=20,
                )),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("company", models.OneToOneField(
                    on_delete=models.deletion.CASCADE,
                    related_name="export_pref",
                    to="accounts.company",
                )),
            ],
        ),
    ]
