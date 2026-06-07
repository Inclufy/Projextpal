"""
Map Academy course lessons to skills so completing them awards skill
points that show up in the Skill Passport. Idempotent.

Each course = one skill; every lesson of that course awards points to it.
Lesson ids are the static course-data ids the learning player sends to
the award_points endpoint (e.g. 'pm-l1').

Usage: python manage.py seed_lesson_skills
"""
from django.core.management.base import BaseCommand
from django.db import transaction

MAP = {
    ("Lean Six Sigma", "skill-c-lean-six-sigma"): ["lss-l1", "lss-l10", "lss-l2", "lss-l3", "lss-l4", "lss-l5", "lss-l6", "lss-l7", "lss-l8", "lss-l9"],
    ("Scrum Mastery", "skill-c-scrum-mastery"): ["scrum-l1", "scrum-l10", "scrum-l11", "scrum-l12", "scrum-l13", "scrum-l2", "scrum-l3", "scrum-l4", "scrum-l5", "scrum-l6", "scrum-l7", "scrum-l8", "scrum-l9"],
    ("Kanban Flow", "skill-c-kanban-flow"): ["kb-l1", "kb-l10", "kb-l2", "kb-l3", "kb-l4", "kb-l5", "kb-l6", "kb-l7", "kb-l8", "kb-l9"],
    ("Lean Six Sigma Black Belt", "skill-c-lean-six-sigma-black-belt"): ["lssbb-l1", "lssbb-l10", "lssbb-l11", "lssbb-l12", "lssbb-l13", "lssbb-l14", "lssbb-l15", "lssbb-l16", "lssbb-l17", "lssbb-l2", "lssbb-l3", "lssbb-l4", "lssbb-l5", "lssbb-l6", "lssbb-l7", "lssbb-l8", "lssbb-l9"],
    ("Waterfall Delivery", "skill-c-waterfall-delivery"): ["wf-l1", "wf-l10", "wf-l2", "wf-l3", "wf-l4", "wf-l5", "wf-l6", "wf-l7", "wf-l8", "wf-l9"],
    ("Program Management", "skill-c-program-management"): ["pgm-l1", "pgm-l10", "pgm-l11", "pgm-l12", "pgm-l13", "pgm-l14", "pgm-l15", "pgm-l16", "pgm-l17", "pgm-l18", "pgm-l2", "pgm-l3", "pgm-l4", "pgm-l5", "pgm-l6", "pgm-l7", "pgm-l8", "pgm-l9"],
    ("Leadership", "skill-c-leadership"): ["lead-l1", "lead-l10", "lead-l11", "lead-l12", "lead-l13", "lead-l14", "lead-l15", "lead-l16", "lead-l2", "lead-l3", "lead-l4", "lead-l5", "lead-l6", "lead-l7", "lead-l8", "lead-l9"],
    ("Project Management Fundamentals", "skill-c-project-management-fundamentals"): ["pm-l1", "pm-l10", "pm-l11", "pm-l12", "pm-l13", "pm-l14", "pm-l15", "pm-l16", "pm-l17", "pm-l18", "pm-l19", "pm-l2", "pm-l20", "pm-l21", "pm-l22", "pm-l23", "pm-l24", "pm-l25", "pm-l26", "pm-l3", "pm-l4", "pm-l5", "pm-l6", "pm-l7", "pm-l8", "pm-l9"],
    ("MS Project", "skill-c-ms-project"): ["msp-l1", "msp-l10", "msp-l11", "msp-l12", "msp-l13", "msp-l14", "msp-l15", "msp-l16", "msp-l17", "msp-l18", "msp-l19", "msp-l2", "msp-l20", "msp-l3", "msp-l4", "msp-l5", "msp-l6", "msp-l7", "msp-l8", "msp-l9"],
    ("PRINCE2 Practitioner", "skill-c-prince2-practitioner"): ["p2-l1", "p2-l10", "p2-l11", "p2-l12", "p2-l13", "p2-l14", "p2-l15", "p2-l16", "p2-l17", "p2-l18", "p2-l19", "p2-l2", "p2-l20", "p2-l3", "p2-l4", "p2-l5", "p2-l6", "p2-l7", "p2-l8", "p2-l9"],
    ("SAFe / Scaling Agile", "skill-c-safe-scaling-agile"): ["safe-l1", "safe-l10", "safe-l11", "safe-l12", "safe-l13", "safe-l14", "safe-l15", "safe-l16", "safe-l17", "safe-l18", "safe-l19", "safe-l2", "safe-l3", "safe-l4", "safe-l5", "safe-l6", "safe-l7", "safe-l8", "safe-l9"],
    ("AI Literacy", "skill-c-ai-literacy"): ["ail-l1", "ail-l10", "ail-l11", "ail-l12", "ail-l13", "ail-l14", "ail-l15", "ail-l16", "ail-l2", "ail-l3", "ail-l4", "ail-l5", "ail-l6", "ail-l7", "ail-l8", "ail-l9"],
    ("Agile Delivery", "skill-c-agile-delivery"): ["ag-l1", "ag-l10", "ag-l2", "ag-l3", "ag-l4", "ag-l5", "ag-l6", "ag-l7", "ag-l8", "ag-l9"],
    ("Stakeholder Management", "skill-c-stakeholder-management"): ["stk-l1", "stk-l10", "stk-l11", "stk-l2", "stk-l3", "stk-l4", "stk-l5", "stk-l6", "stk-l7", "stk-l8", "stk-l9"],
}


class Command(BaseCommand):
    help = "Map course lessons to skills (Skill Passport award wiring)."

    @transaction.atomic
    def handle(self, *args, **opts):
        from academy.models import SkillCategory, Skill, LessonSkillMapping
        cat, _ = SkillCategory.objects.get_or_create(
            id="cat-project-management",
            defaults=dict(name="Project Management", name_nl="Projectmanagement", icon="briefcase", color="#7c3aed", order=1),
        )
        skills = 0; maps = 0
        for (name, sid), ids in MAP.items():
            skill, _ = Skill.objects.update_or_create(
                id=sid,
                defaults=dict(category=cat, name=name, name_nl=name,
                              description=f"{name} competency from the Academy course.",
                              level_1_points=0, level_2_points=100, level_3_points=300,
                              level_4_points=600, level_5_points=1000),
            )
            skills += 1
            for lid in ids:
                LessonSkillMapping.objects.update_or_create(
                    lesson_id=lid, skill=skill,
                    defaults=dict(points_awarded=10, quiz_bonus=20,
                                  simulation_bonus=15, practice_bonus=15),
                )
                maps += 1
        self.stdout.write(self.style.SUCCESS(
            f"Mapped {maps} lessons to {skills} skills.")
        )
