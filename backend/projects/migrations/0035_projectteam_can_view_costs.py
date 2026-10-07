from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("projects", "0034_task_is_internal"),
    ]

    operations = [
        migrations.AddField(
            model_name="projectteam",
            name="can_view_costs",
            field=models.BooleanField(
                default=True,
                help_text="Allow this member to see budgets/rates on this project.",
            ),
        ),
    ]
