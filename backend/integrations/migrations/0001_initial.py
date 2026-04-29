import uuid
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('accounts', '0010_company_require_2fa_and_billing_dates'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Integration',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=200)),
                ('type', models.CharField(choices=[
                    ('salesforce', 'Salesforce'),
                    ('hubspot', 'HubSpot'),
                    ('zapier', 'Zapier'),
                    ('slack', 'Slack'),
                    ('teams', 'Microsoft Teams'),
                    ('google', 'Google Workspace'),
                    ('other', 'Other'),
                ], max_length=30)),
                ('config', models.JSONField(blank=True, default=dict, help_text='Provider-specific configuration (URLs, IDs, scopes).')),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(blank=True, null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='created_integrations',
                    to=settings.AUTH_USER_MODEL)),
                ('tenant', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='integrations',
                    to='accounts.company')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='integration',
            index=models.Index(fields=['tenant', 'type'], name='integration_tenant__ebabc1_idx'),
        ),
        migrations.CreateModel(
            name='CrmKey',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=200)),
                ('type', models.CharField(choices=[
                    ('salesforce', 'Salesforce'),
                    ('hubspot', 'HubSpot'),
                    ('pipedrive', 'Pipedrive'),
                    ('zoho', 'Zoho CRM'),
                    ('other', 'Other'),
                ], max_length=30)),
                ('config', models.JSONField(blank=True, default=dict, help_text='Holds API key / OAuth token / refresh token.')),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(blank=True, null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='created_crm_keys',
                    to=settings.AUTH_USER_MODEL)),
                ('tenant', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='outbound_crm_keys',
                    to='accounts.company')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='Webhook',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=200)),
                ('type', models.CharField(choices=[
                    ('project.created', 'project.created'),
                    ('project.updated', 'project.updated'),
                    ('user.created', 'user.created'),
                    ('subscription.changed', 'subscription.changed'),
                    ('all', 'All events'),
                ], default='all', max_length=40,
                help_text='Event filter — which events trigger this webhook.')),
                ('config', models.JSONField(blank=True, default=dict, help_text='url, secret, headers, retry policy.')),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(blank=True, null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='created_webhooks',
                    to=settings.AUTH_USER_MODEL)),
                ('tenant', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='webhooks',
                    to='accounts.company')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]
