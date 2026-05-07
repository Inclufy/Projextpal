from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0012_rename_bio_cred_user_active_idx_biometric_c_user_id_481b54_idx_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='company',
            name='logo',
            field=models.ImageField(blank=True, null=True, upload_to='company_logos/'),
        ),
        migrations.AddField(
            model_name='company',
            name='primary_color',
            field=models.CharField(blank=True, help_text='Hex color, e.g. #7C3AED', max_length=7, null=True),
        ),
        migrations.AddField(
            model_name='company',
            name='custom_domain',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='company',
            name='industry',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='company',
            name='organization_size',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='company',
            name='timezone',
            field=models.CharField(default='Europe/Amsterdam', max_length=64),
        ),
        migrations.AddField(
            model_name='company',
            name='locale',
            field=models.CharField(default='en', max_length=10),
        ),
        migrations.AddField(
            model_name='company',
            name='currency',
            field=models.CharField(default='EUR', max_length=3),
        ),
        migrations.AddField(
            model_name='company',
            name='onboarding_completed',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='company',
            name='onboarding_completed_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='company',
            name='onboarding_data',
            field=models.JSONField(blank=True, help_text='Raw onboarding answers for audit/replay.', null=True),
        ),
    ]
