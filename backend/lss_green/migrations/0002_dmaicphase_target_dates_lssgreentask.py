from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("projects", "0009_project_portfolio_project_program"),
        ("lss_green", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="dmaicphase",
            name="target_start_date",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="dmaicphase",
            name="target_end_date",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.CreateModel(
            name="LSSGreenTask",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("title", models.CharField(max_length=255)),
                ("description", models.TextField(blank=True)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("not_started", "Not Started"),
                            ("in_progress", "In Progress"),
                            ("blocked", "Blocked"),
                            ("done", "Done"),
                        ],
                        default="not_started",
                        max_length=20,
                    ),
                ),
                (
                    "priority",
                    models.CharField(
                        choices=[
                            ("low", "Low"),
                            ("medium", "Medium"),
                            ("high", "High"),
                            ("urgent", "Urgent"),
                        ],
                        default="medium",
                        max_length=20,
                    ),
                ),
                ("start_date", models.DateField(blank=True, null=True)),
                ("due_date", models.DateField(blank=True, null=True)),
                ("completed_at", models.DateTimeField(blank=True, null=True)),
                ("order", models.PositiveIntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "assignee",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="lss_green_assigned_tasks",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "created_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="lss_green_created_tasks",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "phase",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="tasks",
                        to="lss_green.dmaicphase",
                    ),
                ),
                (
                    "project",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="lss_green_tasks",
                        to="projects.project",
                    ),
                ),
            ],
            options={
                "verbose_name": "LSS Green Task",
                "verbose_name_plural": "LSS Green Tasks",
                "ordering": ["order", "created_at"],
            },
        ),
    ]
