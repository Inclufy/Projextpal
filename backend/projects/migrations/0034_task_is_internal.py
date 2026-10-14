from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("projects", "0033_task_assignees"),
    ]

    operations = [
        migrations.AddField(
            model_name="task",
            name="is_internal",
            field=models.BooleanField(
                default=False,
                help_text="Hide this task from external (cross-tenant) collaborators.",
            ),
        ),
    ]
