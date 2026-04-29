from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0009_alter_customuser_role_alter_teaminvitation_role'),
    ]

    operations = [
        migrations.AddField(
            model_name='company',
            name='require_2fa',
            field=models.BooleanField(
                default=False,
                help_text='Force all users in this tenant to enable 2FA at next login.',
            ),
        ),
        migrations.AddField(
            model_name='company',
            name='require_2fa_enabled_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='company',
            name='next_invoice_date',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='company',
            name='last_payment_date',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
