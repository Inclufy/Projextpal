"""Sprint 6 — switch ProjectAIContext.extracted_text to EncryptedTextField.

Both ``TextField`` and ``EncryptedTextField`` map to PostgreSQL ``text`` so
this is a no-op at the schema level; Django still records the field-class
change in state because ``EncryptedTextField.deconstruct()`` points at the
new class.

Existing plaintext rows are left untouched here; the data migration
``0040_encrypt_ai_context_text`` re-saves them so the stored value is
Fernet-encrypted.
"""
from django.db import migrations

import core.secret_field


class Migration(migrations.Migration):

    dependencies = [
        ("projects", "0038_project_ai_suggested_tags"),
    ]

    operations = [
        migrations.AlterField(
            model_name="projectaicontext",
            name="extracted_text",
            field=core.secret_field.EncryptedTextField(blank=True, default=""),
        ),
    ]
