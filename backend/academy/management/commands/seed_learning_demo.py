"""
Seed Academy learning demo data — skills + per-user skill progress — so the
Skill Passport and Learning Dashboard look populated for a demo.

Idempotent: re-running updates in place (get_or_create / update_or_create).
Scoped to the demo viewer (sami@inclufy.com) + the Yanmar demo team users
created by seed_yanmar_demo. Does NOT touch live-customer tenants.

Usage:
    python manage.py seed_learning_demo
"""
from __future__ import annotations

from django.core.management.base import BaseCommand
from django.db import transaction


# Skill catalogue (id, name, name_nl)
SKILLS = [
    ("skill-prince2", "PRINCE2 Practitioner", "PRINCE2 Practitioner"),
    ("skill-scrum", "Scrum Mastery", "Scrum-beheersing"),
    ("skill-kanban", "Kanban Flow", "Kanban-flow"),
    ("skill-risk", "Risk Management", "Risicomanagement"),
    ("skill-stakeholder", "Stakeholder Management", "Stakeholdermanagement"),
    ("skill-planning", "Planning & Scheduling", "Planning & Roostering"),
    ("skill-agile", "Agile Delivery", "Agile-levering"),
    ("skill-leadership", "Leadership", "Leiderschap"),
]

# Per-user points per skill (drives the level via the 0/100/300/600/1000 bands).
# email -> { skill_id: points }
USER_POINTS = {
    "sami@inclufy.com": {
        "skill-prince2": 1200, "skill-scrum": 820, "skill-kanban": 430,
        "skill-risk": 700, "skill-stakeholder": 350, "skill-planning": 560,
        "skill-agile": 250, "skill-leadership": 980,
    },
    "maya.okonkwo@yanmar-demo.com": {
        "skill-prince2": 900, "skill-risk": 480, "skill-planning": 320,
        "skill-stakeholder": 610,
    },
    "tom.devries@yanmar-demo.com": {
        "skill-scrum": 700, "skill-kanban": 540, "skill-agile": 410,
    },
    "lena.fischer@yanmar-demo.com": {
        "skill-risk": 360, "skill-planning": 250, "skill-prince2": 180,
    },
    "raj.patel@yanmar-demo.com": {
        "skill-stakeholder": 430, "skill-leadership": 290, "skill-kanban": 160,
    },
}

THRESHOLDS = [(1000, 5), (600, 4), (300, 3), (100, 2), (0, 1)]


def level_for(points: int) -> int:
    for threshold, lvl in THRESHOLDS:
        if points >= threshold:
            return lvl
    return 1


class Command(BaseCommand):
    help = "Seed Academy skills + per-user skill progress for the demo."

    @transaction.atomic
    def handle(self, *args, **opts):
        from academy.models import SkillCategory, Skill, UserSkill
        from accounts.models import CustomUser

        cat, _ = SkillCategory.objects.get_or_create(
            id="cat-project-management",
            defaults=dict(
                name="Project Management", name_nl="Projectmanagement",
                icon="briefcase", color="#7c3aed", order=1,
            ),
        )

        skills = {}
        for sid, name, name_nl in SKILLS:
            s, _ = Skill.objects.update_or_create(
                id=sid,
                defaults=dict(
                    category=cat, name=name, name_nl=name_nl,
                    description=f"{name} competency track.",
                    level_1_points=0, level_2_points=100, level_3_points=300,
                    level_4_points=600, level_5_points=1000,
                ),
            )
            skills[sid] = s

        seeded_users = 0
        seeded_rows = 0
        for email, points_map in USER_POINTS.items():
            user = CustomUser.objects.filter(email=email).first()
            if not user:
                self.stdout.write(self.style.WARNING(f"  skip (no user): {email}"))
                continue
            seeded_users += 1
            for sid, points in points_map.items():
                UserSkill.objects.update_or_create(
                    user=user, skill=skills[sid],
                    defaults=dict(points=points, level=level_for(points)),
                )
                seeded_rows += 1

        self.stdout.write(self.style.SUCCESS(
            f"Seeded {len(skills)} skills under '{cat.name}', "
            f"{seeded_rows} user-skill rows across {seeded_users} users."
        ))
        self.stdout.write("  Skill Passport: /academy/skill-passport (log in as one of the seeded users)")
