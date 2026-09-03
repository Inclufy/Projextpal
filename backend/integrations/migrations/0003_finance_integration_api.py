# Inclufy Finance integratie-API: pxp_live-API-sleutels (alleen sha256-hash
# opgeslagen) + inbox voor door Finance gepushte masterdata.

import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0022_role_default_guest'),
        ('integrations', '0002_automationrule_automationrun_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='FinanceIntegrationApiKey',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(default='Inclufy Finance', help_text='Waar deze sleutel voor wordt gebruikt.', max_length=200)),
                ('key_prefix', models.CharField(help_text='Eerste tekens van de sleutel, voor herkenning in de UI.', max_length=20)),
                ('key_hash', models.CharField(db_index=True, help_text='sha256-hex van de volledige sleutel; de sleutel zelf wordt nooit opgeslagen.', max_length=64, unique=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('last_used_at', models.DateTimeField(blank=True, null=True)),
                ('company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='finance_api_keys', to='accounts.company')),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_finance_api_keys', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='FinanceInboundDocument',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('entity_type', models.CharField(choices=[('cost-centers', 'Cost centers'), ('budgets', 'Budgets')], max_length=30)),
                ('external_id', models.CharField(max_length=200)),
                ('external_name', models.CharField(blank=True, default='', max_length=255)),
                ('payload', models.JSONField(blank=True, default=dict)),
                ('received_at', models.DateTimeField(auto_now=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='finance_inbound_documents', to='accounts.company')),
            ],
            options={
                'ordering': ['-received_at'],
                'unique_together': {('company', 'entity_type', 'external_id')},
            },
        ),
    ]
