from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    """Sprint 2 — Yanmar project-closing sign-off."""

    dependencies = [
        ("projects", "0015_pushback_workflow"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="ProjectSignOff",
            fields=[
                ("id", models.AutoField(
                    auto_created=True, primary_key=True, serialize=False, verbose_name="ID",
                )),
                ("signed_off_role", models.CharField(
                    blank=True, default="", max_length=120,
                    help_text="e.g. 'Senior Manager', 'Project Sponsor'.",
                )),
                ("signed_off_at", models.DateTimeField(blank=True, null=True)),
                ("signature_image", models.FileField(
                    blank=True, null=True,
                    upload_to="signoffs/%Y/%m/",
                    help_text=(
                        "PNG of the signature (drawn in-app or uploaded)."
                    ),
                )),
                ("sign_off_note", models.TextField(blank=True, default="")),
                ("is_valid", models.BooleanField(
                    default=True,
                    help_text=(
                        "Set to False to revoke a sign-off (e.g. on "
                        "re-opening the project). History is preserved via "
                        "updated_at."
                    ),
                )),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("project", models.OneToOneField(
                    on_delete=models.deletion.CASCADE,
                    related_name="sign_off",
                    to="projects.project",
                )),
                ("signed_off_by", models.ForeignKey(
                    blank=True, null=True,
                    on_delete=models.deletion.SET_NULL,
                    related_name="signed_off_projects",
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                "verbose_name": "Project Sign-Off",
                "verbose_name_plural": "Project Sign-Offs",
            },
        ),
    ]
