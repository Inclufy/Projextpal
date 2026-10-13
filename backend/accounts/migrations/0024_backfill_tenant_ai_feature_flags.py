"""Create a default TenantAIFeatureFlags row for every existing Company."""
from django.db import migrations


def forwards(apps, schema_editor):
    Company = apps.get_model("accounts", "Company")
    TenantAIFeatureFlags = apps.get_model("accounts", "TenantAIFeatureFlags")
    for company in Company.objects.all():
        TenantAIFeatureFlags.objects.get_or_create(company=company)


def backwards(apps, schema_editor):
    # No-op; dropping the table is handled by reversing 0023.
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0023_tenantaifeatureflags"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
