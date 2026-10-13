"""Re-save every ProjectAIContext row so the plaintext ``extracted_text``
is re-written through ``EncryptedTextField`` and stored Fernet-encrypted.

Idempotent: ``EncryptedTextField.get_prep_value`` skips values that already
start with the Fernet token prefix, so running this twice is harmless.

Backwards: no-op. The previous migration swapped the field class but kept
the DB column, so a reversal just leaves the (now-encrypted) rows intact —
``EncryptedTextField.from_db_value`` would still read them correctly if
anyone re-pointed the model at TextField, as long as the key is present."""
from django.db import migrations


def forwards(apps, schema_editor):
    ProjectAIContext = apps.get_model("projects", "ProjectAIContext")
    # Historical model: ``extracted_text`` is a plain TextField at this point
    # in migration land, so reads give us raw bytes. We save through a real
    # model instance that sees the current ``EncryptedTextField`` descriptor
    # by routing through the live model — but doing that from a migration
    # breaks apps-registry isolation. Simpler: encrypt_text() + raw UPDATE.
    from core.secret_field import FERNET_TOKEN_PREFIX, encrypt_text

    for row in ProjectAIContext.objects.all().iterator():
        value = row.extracted_text or ""
        if not value:
            continue
        if value.startswith(FERNET_TOKEN_PREFIX):
            continue
        row.extracted_text = encrypt_text(value)
        row.save(update_fields=["extracted_text", "updated_at"])


def backwards(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("projects", "0039_projectaicontext_extracted_text_encrypted"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
