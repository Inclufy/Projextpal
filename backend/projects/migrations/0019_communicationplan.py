from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    """Sprint 3 — CommunicationPlan + PlanEvent (Yanmar §7)."""

    dependencies = [
        ("projects", "0018_project_impact_solution_roi"),
        ("communication", "0004_meeting_expansion"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="CommunicationPlan",
            fields=[
                ("id", models.AutoField(
                    auto_created=True, primary_key=True, serialize=False, verbose_name="ID",
                )),
                ("notes", models.TextField(blank=True, default="")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("project", models.OneToOneField(
                    on_delete=models.deletion.CASCADE,
                    related_name="communication_plan",
                    to="projects.project",
                )),
                ("owner", models.ForeignKey(
                    blank=True, null=True,
                    on_delete=models.deletion.SET_NULL,
                    related_name="owned_communication_plans",
                    to=settings.AUTH_USER_MODEL,
                    help_text=(
                        "Person responsible for keeping the plan up to date."
                    ),
                )),
            ],
            options={
                "verbose_name": "Communication Plan",
                "verbose_name_plural": "Communication Plans",
            },
        ),
        migrations.CreateModel(
            name="PlanEvent",
            fields=[
                ("id", models.AutoField(
                    auto_created=True, primary_key=True, serialize=False, verbose_name="ID",
                )),
                ("event_type", models.CharField(
                    choices=[
                        ("kickoff", "Kick-off"),
                        ("onboarding", "Onboarding"),
                        ("regular", "Regular update"),
                        ("gate", "Stage / gate review"),
                        ("closing", "Project closing"),
                        ("other", "Other"),
                    ],
                    max_length=20,
                )),
                ("cadence", models.CharField(
                    choices=[
                        ("once", "Once"),
                        ("weekly", "Weekly"),
                        ("biweekly", "Bi-weekly"),
                        ("monthly", "Monthly"),
                        ("quarterly", "Quarterly"),
                    ],
                    default="once", max_length=20,
                )),
                ("name", models.CharField(max_length=200)),
                ("audience", models.JSONField(
                    blank=True, default=list,
                    help_text="List of role names / stakeholder labels.",
                )),
                ("scheduled_at", models.DateTimeField(blank=True, null=True)),
                ("last_held_at", models.DateTimeField(blank=True, null=True)),
                ("notes", models.TextField(blank=True, default="")),
                ("status", models.CharField(
                    choices=[
                        ("planned", "Planned"),
                        ("done", "Done"),
                        ("cancelled", "Cancelled"),
                    ],
                    default="planned", max_length=20,
                )),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("plan", models.ForeignKey(
                    on_delete=models.deletion.CASCADE,
                    related_name="events",
                    to="projects.communicationplan",
                )),
                ("meeting", models.ForeignKey(
                    blank=True, null=True,
                    on_delete=models.deletion.SET_NULL,
                    related_name="plan_events",
                    to="communication.meeting",
                )),
            ],
            options={
                "ordering": ["event_type", "scheduled_at", "id"],
                "indexes": [
                    models.Index(
                        fields=["plan", "event_type"],
                        name="projects_pl_plan_event_type_idx",
                    ),
                    models.Index(
                        fields=["plan", "status"],
                        name="projects_pl_plan_status_idx",
                    ),
                ],
            },
        ),
    ]
