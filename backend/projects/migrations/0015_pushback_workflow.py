from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    """Sprint 1 — Task.revision_count + TaskDueDateChangeRequest."""

    dependencies = [
        ("projects", "0014_task_category"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name="task",
            name="revision_count",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.CreateModel(
            name="TaskDueDateChangeRequest",
            fields=[
                ("id", models.AutoField(
                    auto_created=True, primary_key=True, serialize=False, verbose_name="ID",
                )),
                ("requested_date", models.DateField()),
                ("previous_due_date", models.DateField(blank=True, null=True)),
                ("delta_days", models.IntegerField(
                    help_text=(
                        "requested_date - previous_due_date "
                        "(positive = push-back)."
                    ),
                )),
                ("reason", models.TextField(blank=True, default="")),
                ("status", models.CharField(
                    choices=[
                        ("pending", "Pending"),
                        ("approved", "Approved"),
                        ("rejected", "Rejected"),
                    ],
                    default="pending", max_length=20,
                )),
                ("decided_at", models.DateTimeField(blank=True, null=True)),
                ("decision_note", models.TextField(blank=True, default="")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("task", models.ForeignKey(
                    on_delete=models.deletion.CASCADE,
                    related_name="due_date_change_requests",
                    to="projects.task",
                )),
                ("requested_by", models.ForeignKey(
                    blank=True, null=True,
                    on_delete=models.deletion.SET_NULL,
                    related_name="requested_due_changes",
                    to=settings.AUTH_USER_MODEL,
                )),
                ("decided_by", models.ForeignKey(
                    blank=True, null=True,
                    on_delete=models.deletion.SET_NULL,
                    related_name="decided_due_changes",
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                "ordering": ["-created_at"],
                "indexes": [
                    models.Index(
                        fields=["task", "status"],
                        name="projects_ta_task_id_status_idx",
                    ),
                ],
            },
        ),
    ]
