"""Member-skills catalog + user linkage.

Additive-only: creates two brand-new tables (``accounts_skill`` and
``accounts_userskill``). No existing columns or data are touched, so
the migration is safe to run against production (per the Sprint 9 B
plan). The ``accounts.Skill`` label does NOT collide with the pre-existing
``academy.Skill`` — Django scopes model names by app label.
"""
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0027_rename_contibuter_role_to_contributor"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Skill",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "code",
                    models.CharField(db_index=True, max_length=50, unique=True),
                ),
                ("name", models.CharField(max_length=120)),
                ("name_nl", models.CharField(blank=True, max_length=120)),
                (
                    "category",
                    models.CharField(
                        choices=[
                            ("methodology", "Methodology"),
                            ("technical", "Technical"),
                            ("soft", "Soft Skill"),
                            ("domain", "Domain"),
                        ],
                        default="technical",
                        max_length=50,
                    ),
                ),
                ("description", models.TextField(blank=True)),
                ("description_nl", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={"ordering": ["category", "name"]},
        ),
        migrations.CreateModel(
            name="UserSkill",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "level",
                    models.CharField(
                        choices=[
                            ("beginner", "Beginner"),
                            ("intermediate", "Intermediate"),
                            ("expert", "Expert"),
                        ],
                        default="intermediate",
                        max_length=20,
                    ),
                ),
                (
                    "years_experience",
                    models.PositiveIntegerField(blank=True, null=True),
                ),
                ("verified_at", models.DateTimeField(blank=True, null=True)),
                ("added_at", models.DateTimeField(auto_now_add=True)),
                (
                    "skill",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="user_skills",
                        to="accounts.skill",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="user_skills",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "verified_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="verified_skills",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["-added_at"],
                "unique_together": {("user", "skill")},
            },
        ),
    ]
