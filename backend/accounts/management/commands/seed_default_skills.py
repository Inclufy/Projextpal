"""Seed the member-skills catalog with ~20 opinionated defaults.

Idempotent: uses ``update_or_create`` on ``code`` so re-running is a no-op
(and picks up new entries added to this list without wiping manual edits
of names/descriptions — only the fields we set are overwritten).

    python manage.py seed_default_skills

Runs cheap. Safe for prod.
"""
from __future__ import annotations

from django.core.management.base import BaseCommand

from accounts.models import Skill


DEFAULT_SKILLS: list[tuple[str, str, str, str]] = [
    # (code, name, name_nl, category)
    ("prince2", "PRINCE2", "PRINCE2", "methodology"),
    ("agile", "Agile", "Agile", "methodology"),
    ("scrum", "Scrum", "Scrum", "methodology"),
    ("kanban", "Kanban", "Kanban", "methodology"),
    ("safe", "SAFe", "SAFe", "methodology"),
    ("lss", "Lean Six Sigma", "Lean Six Sigma", "methodology"),
    ("waterfall", "Waterfall", "Waterval", "methodology"),
    ("hybrid", "Hybrid delivery", "Hybride levering", "methodology"),

    ("python", "Python", "Python", "technical"),
    ("react", "React", "React", "technical"),
    ("django", "Django", "Django", "technical"),

    ("ux", "UX design", "UX-design", "domain"),
    ("product_management", "Product Management", "Productmanagement", "domain"),
    ("finance", "Finance", "Financiën", "domain"),
    ("change_management", "Change Management", "Verandermanagement", "domain"),
    ("project_planning", "Project Planning", "Projectplanning", "domain"),

    ("stakeholder_mgmt", "Stakeholder Management", "Stakeholdermanagement", "soft"),
    ("facilitation", "Facilitation", "Facilitatie", "soft"),
    ("coaching", "Coaching", "Coaching", "soft"),
    ("communication", "Communication", "Communicatie", "soft"),

    ("lang_dutch", "Dutch", "Nederlands", "soft"),
    ("lang_english", "English", "Engels", "soft"),
]


class Command(BaseCommand):
    help = "Seed the Skill catalog with ~20 default methodology/technical/soft/domain skills."

    def handle(self, *args, **opts):
        created = 0
        updated = 0
        for code, name, name_nl, category in DEFAULT_SKILLS:
            obj, was_created = Skill.objects.update_or_create(
                code=code,
                defaults={
                    "name": name,
                    "name_nl": name_nl,
                    "category": category,
                },
            )
            if was_created:
                created += 1
            else:
                updated += 1
        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded {created} new skills, refreshed {updated} existing "
                f"(total catalog size: {Skill.objects.count()})."
            )
        )
