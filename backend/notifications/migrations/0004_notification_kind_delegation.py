"""Nieuwe notificatie-soorten voor taakdelegatie (state-only, geen SQL)."""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("notifications", "0003_notificationpreference"),
    ]

    operations = [
        migrations.AlterField(
            model_name="notification",
            name="kind",
            field=models.CharField(
                choices=[
                    ("task_assigned", "Task assigned"),
                    ("task_delegated", "Task delegated"),
                    ("task_delegated_done", "Delegated task completed"),
                    ("action_assigned", "Action assigned"),
                    ("mention", "Mention"),
                    ("message", "Message"),
                    ("approval", "Approval requested"),
                    ("status", "Status update"),
                    ("system", "System"),
                ],
                default="system",
                max_length=24,
            ),
        ),
    ]
