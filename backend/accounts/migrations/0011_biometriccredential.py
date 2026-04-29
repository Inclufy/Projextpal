from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('accounts', '0010_company_require_2fa_and_billing_dates'),
    ]

    operations = [
        migrations.CreateModel(
            name='BiometricCredential',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('credential_id', models.TextField(help_text='Base64url-encoded credential ID from WebAuthn', unique=True)),
                ('public_key', models.TextField(help_text='JSON-serialized public key data from WebAuthn')),
                ('device_name', models.CharField(default='Biometric Device', help_text="User-friendly device name (e.g., 'iPhone Face ID')", max_length=255)),
                ('sign_count', models.IntegerField(default=0, help_text='Signature counter for replay protection')),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('last_used_at', models.DateTimeField(blank=True, null=True)),
                ('user', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='biometric_credentials',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'db_table': 'biometric_credentials',
                'ordering': ['-created_at'],
                'indexes': [
                    models.Index(fields=['user', 'is_active'], name='bio_cred_user_active_idx'),
                    models.Index(fields=['credential_id'], name='bio_cred_credid_idx'),
                ],
            },
        ),
    ]
