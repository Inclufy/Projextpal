"""S4-11 — Team-membership cascade for time registration.

Adds the tenant-level knob that gates the TimeEntry project-select filter.
Additive-with-default (True) so existing tenants keep the stricter behaviour
by default; a tenant that wants the looser flow (any company user can log
hours on any company project) can turn it off from the admin panel.
"""

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0024_backfill_tenant_ai_feature_flags"),
    ]

    operations = [
        migrations.AddField(
            model_name="company",
            name="require_project_membership_for_time_entry",
            field=models.BooleanField(
                default=True,
                help_text=(
                    "If True: users may only log time on projects where they "
                    "are on ProjectTeam. Default True — individual tenants "
                    "can turn this off."
                ),
            ),
        ),
    ]
