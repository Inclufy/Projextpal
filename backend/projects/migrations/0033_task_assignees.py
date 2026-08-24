"""Multi-assignee + delegatie op taken.

- M2M `assignees` naast de primaire `assigned_to`; backfill: bestaande taken
  met een assigned_to krijgen die gebruiker ook als assignee.
- Delegatiespoor (optie A): delegated_by / delegated_at / delegation_note.
"""
from django.conf import settings
from django.db import migrations, models


def backfill_assignees(apps, schema_editor):
    Task = apps.get_model("projects", "Task")
    through = Task.assignees.through
    rows = [
        through(task_id=task_id, customuser_id=user_id)
        for task_id, user_id in Task.objects.exclude(assigned_to=None)
        .values_list("id", "assigned_to_id")
    ]
    through.objects.bulk_create(rows, ignore_conflicts=True)


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("projects", "0032_projecttailoring"),
    ]

    operations = [
        migrations.AddField(
            model_name="task",
            name="assignees",
            field=models.ManyToManyField(
                blank=True,
                related_name="tasks_assigned",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name="task",
            name="delegated_by",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=models.SET_NULL,
                related_name="tasks_delegated",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name="task",
            name="delegated_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="task",
            name="delegation_note",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.RunPython(backfill_assignees, migrations.RunPython.noop),
    ]
