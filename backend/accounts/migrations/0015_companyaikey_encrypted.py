from django.db import migrations

import core.secret_field


class Migration(migrations.Migration):
    """Sprint 3 — switch CompanyAIKey api-key fields to EncryptedCharField.

    Database-wise this widens the column to max_length=2000 to accommodate
    Fernet ciphertext. Existing plaintext rows remain readable (Fernet
    `decrypt_text` falls back to the stored value when it isn't a token).
    Run `manage.py re_encrypt_api_keys` after deploy to migrate them.
    """

    dependencies = [
        ("accounts", "0014_companyaikey"),
    ]

    operations = [
        migrations.AlterField(
            model_name="companyaikey",
            name="openai_api_key",
            field=core.secret_field.EncryptedCharField(
                blank=True, default="", max_length=2000,
                help_text=(
                    "Optional. Encrypted at rest. If set, used for all "
                    "OpenAI calls from this company."
                ),
            ),
        ),
        migrations.AlterField(
            model_name="companyaikey",
            name="anthropic_api_key",
            field=core.secret_field.EncryptedCharField(
                blank=True, default="", max_length=2000,
                help_text=(
                    "Optional. Encrypted at rest. If set, used for all "
                    "Anthropic calls from this company."
                ),
            ),
        ),
    ]
