# BUG-005 (second life): the invitation token is a JWT that embeds the
# invitee's email, so for emails longer than ~27 chars it exceeded the old
# varchar(255) and Postgres rejected the INSERT with StringDataRightTruncation
# -> 500 on POST /api/v1/auth/invitations/create/. Widen to TEXT.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0019_company_eval_mode'),
    ]

    operations = [
        migrations.AlterField(
            model_name='teaminvitation',
            name='token',
            field=models.TextField(unique=True),
        ),
    ]
