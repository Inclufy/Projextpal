"""Sprint 6 — PortfolioAIContext.extracted_text → EncryptedTextField + re-encrypt
existing plaintext rows. Mirrors projects/0039+0040 in one step."""
from django.db import migrations

import core.secret_field


def forwards(apps, schema_editor):
    PortfolioAIContext = apps.get_model("governance", "PortfolioAIContext")
    from core.secret_field import FERNET_TOKEN_PREFIX, encrypt_text

    for row in PortfolioAIContext.objects.all().iterator():
        value = row.extracted_text or ""
        if not value or value.startswith(FERNET_TOKEN_PREFIX):
            continue
        row.extracted_text = encrypt_text(value)
        row.save(update_fields=["extracted_text", "updated_at"])


def backwards(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("governance", "0014_portfolioaicontext"),
    ]

    operations = [
        migrations.AlterField(
            model_name="portfolioaicontext",
            name="extracted_text",
            field=core.secret_field.EncryptedTextField(blank=True, default=""),
        ),
        migrations.RunPython(forwards, backwards),
    ]
