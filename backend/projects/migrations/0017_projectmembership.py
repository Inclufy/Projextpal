from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    """Sprint 2 — Yanmar unified 6-role ProjectMembership."""

    dependencies = [
        ("projects", "0016_project_signoff"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="ProjectMembership",
            fields=[
                ("id", models.AutoField(
                    auto_created=True, primary_key=True, serialize=False, verbose_name="ID",
                )),
                ("role", models.CharField(
                    choices=[
                        ("project_owner", "Project Owner"),
                        ("project_manager", "Project Manager"),
                        ("project_leader", "Project Leader"),
                        ("facilitator", "Facilitator"),
                        ("outside_eyes", "Outside Eyes"),
                        ("stakeholder", "Stakeholder"),
                        ("other", "Other"),
                    ],
                    max_length=30,
                )),
                ("responsibilities", models.TextField(blank=True, default="")),
                ("is_primary", models.BooleanField(
                    default=False,
                    help_text=(
                        "Mark the primary holder of this role (e.g. THE "
                        "Project Manager)."
                    ),
                )),
                ("starts_on", models.DateField(blank=True, null=True)),
                ("ends_on", models.DateField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("project", models.ForeignKey(
                    on_delete=models.deletion.CASCADE,
                    related_name="memberships",
                    to="projects.project",
                )),
                ("user", models.ForeignKey(
                    on_delete=models.deletion.CASCADE,
                    related_name="project_memberships",
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                "ordering": ["project", "role", "id"],
                "unique_together": {("project", "user", "role")},
                "indexes": [
                    models.Index(
                        fields=["project", "role"],
                        name="projects_pr_proj_role_idx",
                    ),
                ],
            },
        ),
    ]
