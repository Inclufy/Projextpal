from django.db import migrations

import core.secret_field


class Migration(migrations.Migration):
    """Sprint 3 — encrypt ClientApiKey.api_key at rest via Fernet."""

    dependencies = [
        ("admin_portal", "0003_add_cloud_provider_config"),
    ]

    operations = [
        migrations.AlterField(
            model_name="clientapikey",
            name="api_key",
            field=core.secret_field.EncryptedCharField(max_length=2000),
        ),
    ]
