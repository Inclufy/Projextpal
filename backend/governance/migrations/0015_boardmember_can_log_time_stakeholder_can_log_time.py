"""S4-11 — Team-membership cascade for time registration.

Governance role-holders (board members, stakeholders) are oversight roles by
default, not delivery roles — they should not appear in a user's TimeEntry
project picker unless the tenant explicitly opts them in. We add a per-row
``can_log_time`` boolean (default False) so a working-chair or a BCM who
also delivers can be flipped on without touching the broader filter.

Additive-with-default, non-destructive.
"""

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("governance", "0014_portfolioaicontext"),
    ]

    operations = [
        migrations.AddField(
            model_name="boardmember",
            name="can_log_time",
            field=models.BooleanField(
                default=False,
                help_text=(
                    "Allow this board member to log time on the components "
                    "under their board. Default False — oversight role, "
                    "not delivery."
                ),
            ),
        ),
        migrations.AddField(
            model_name="governancestakeholder",
            name="can_log_time",
            field=models.BooleanField(
                default=False,
                help_text=(
                    "Allow this stakeholder to log time on the components "
                    "they are tied to. Default False — governance role, "
                    "not delivery."
                ),
            ),
        ),
    ]
