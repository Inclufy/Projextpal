"""Merge the duplicate demo skills (skill-*) into the canonical, lesson-mapped
course skills (skill-c-*).

Two earlier seeds created two parallel skill sets with overlapping NAMES:
  - seed_learning_demo  -> skill-*    (carries the demo USER progress)
  - seed_lesson_skills  -> skill-c-*  (carries the 216 LESSON mappings)

That made every overlapping competency show up twice in the catalogue, and —
worse — a real learner's lesson completions accrued on skill-c-* while the
passport progress lived on skill-*. This command makes skill-c-* canonical:
it re-points the demo UserSkill rows onto the matching course skill (keeping
the higher points), then deletes the now-empty demo skill.

Idempotent: re-running after a successful merge is a no-op (the demo skills
are already gone). Safe to run repeatedly.

skill-risk and skill-planning have no course equivalent, so they are LEFT
in place as standalone competencies (no duplicate, no lessons yet).
"""
from django.core.management.base import BaseCommand
from django.db import transaction

# demo skill id  ->  canonical lesson-mapped skill id
PAIRS = {
    "skill-prince2": "skill-c-prince2-practitioner",
    "skill-scrum": "skill-c-scrum-mastery",
    "skill-kanban": "skill-c-kanban-flow",
    "skill-leadership": "skill-c-leadership",
    "skill-agile": "skill-c-agile-delivery",
    "skill-stakeholder": "skill-c-stakeholder-management",
}

THRESHOLDS = [(1000, 5), (600, 4), (300, 3), (100, 2), (0, 1)]


def level_for(points: int) -> int:
    for threshold, lvl in THRESHOLDS:
        if points >= threshold:
            return lvl
    return 1


class Command(BaseCommand):
    help = "Merge duplicate demo skills (skill-*) into lesson-mapped course skills (skill-c-*)."

    @transaction.atomic
    def handle(self, *args, **opts):
        from academy.models import Skill, UserSkill

        merged = moved = deleted = 0
        for demo_id, course_id in PAIRS.items():
            demo = Skill.objects.filter(id=demo_id).first()
            if not demo:
                continue  # already merged on a previous run
            course = Skill.objects.filter(id=course_id).first()
            if not course:
                self.stdout.write(
                    f"  ! canonical skill '{course_id}' not found — leaving '{demo_id}' as-is"
                )
                continue

            for us in UserSkill.objects.filter(skill=demo):
                target, _ = UserSkill.objects.get_or_create(
                    user=us.user, skill=course, defaults=dict(points=0, level=1)
                )
                if us.points > target.points:
                    target.points = us.points
                    target.level = level_for(us.points)
                    target.save(update_fields=["points", "level"])
                us.delete()
                moved += 1

            demo.delete()
            deleted += 1
            merged += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Merged {merged} duplicate skills · moved {moved} user-skill rows · "
                f"deleted {deleted} demo skills. Canonical set = skill-c-* (lesson-mapped)."
            )
        )
