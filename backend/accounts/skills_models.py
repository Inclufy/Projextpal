"""Member-skills catalog + user-skill linkage.

Sprint 9 Agent B (S9-05). Lives in its own module so we don't have to
touch the already-large ``accounts/models.py`` surface (and so a future
re-org can lift it into its own app). The models are re-exported from
``accounts/models.py`` so Django's app registry picks them up for the
``accounts`` label.

Scope:
  * ``Skill``  — tenant-independent catalog of named skills (code is the
    stable identifier used by project matching).
  * ``UserSkill`` — a per-user link to a catalog ``Skill`` with proficiency
    level and optional verification.
"""
from django.conf import settings
from django.db import models


class Skill(models.Model):
    """Catalog entry for one skill. Shared across all tenants on purpose:
    "PRINCE2" or "Python" means the same thing regardless of company, and
    the project-matching endpoint relies on stable, globally-unique codes."""

    CATEGORY_CHOICES = [
        ("methodology", "Methodology"),
        ("technical", "Technical"),
        ("soft", "Soft Skill"),
        ("domain", "Domain"),
    ]

    code = models.CharField(max_length=50, unique=True, db_index=True)
    name = models.CharField(max_length=120)
    name_nl = models.CharField(max_length=120, blank=True)
    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES,
        default="technical",
    )
    description = models.TextField(blank=True)
    description_nl = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["category", "name"]

    def __str__(self):
        return f"{self.code} — {self.name}"


class UserSkill(models.Model):
    """A user's claim/record of possessing a catalog Skill at some level.

    One row per (user, skill); re-adding bumps the level/years via PATCH.
    ``verified_by``/``verified_at`` are optional admin trust signals used
    to rank matches (verified rows outrank self-reported ones)."""

    LEVEL_CHOICES = [
        ("beginner", "Beginner"),
        ("intermediate", "Intermediate"),
        ("expert", "Expert"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="user_skills",
    )
    skill = models.ForeignKey(
        Skill,
        on_delete=models.CASCADE,
        related_name="user_skills",
    )
    level = models.CharField(
        max_length=20,
        choices=LEVEL_CHOICES,
        default="intermediate",
    )
    years_experience = models.PositiveIntegerField(null=True, blank=True)
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="verified_skills",
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [("user", "skill")]
        ordering = ["-added_at"]

    def __str__(self):
        return f"{self.user_id}:{self.skill.code}:{self.level}"
