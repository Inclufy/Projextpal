"""
Seed 5 global Learning Paths (PM tracks) with ordered items so the Learning
Path builder is populated for a demo. Idempotent. Global (company=null).

Usage: python manage.py seed_learning_paths
"""
from django.core.management.base import BaseCommand
from django.db import transaction

PATHS = [
    ("PM Starter", "Start your PM journey with fundamentals", False,
     ["Project Management Fundamentals", "Agile Fundamentals"]),
    ("Agile Expert", "Master Agile methodologies", True,
     ["Agile Fundamentals", "Scrum Master", "Kanban"]),
    ("Traditional PM", "Master structured methodologies", True,
     ["Project Management Fundamentals", "Waterfall", "PRINCE2"]),
    ("Process Excellence", "Optimize with Lean Six Sigma", True,
     ["Lean Six Sigma", "Kanban"]),
    ("Complete PM", "Full PM certification path", True,
     ["Project Management Fundamentals", "PRINCE2", "Scrum Master", "Lean Six Sigma"]),
]


class Command(BaseCommand):
    help = "Seed demo Learning Paths."

    @transaction.atomic
    def handle(self, *args, **opts):
        from academy.models import LearningPath, LearningPathItem, Course

        made = 0
        for order, (title, desc, cert, items) in enumerate(PATHS):
            path, _ = LearningPath.objects.update_or_create(
                title=title, company=None,
                defaults=dict(description=desc, active=True,
                              leads_to_certificate=cert, order=order),
            )
            # Rebuild items idempotently
            path.items.all().delete()
            for i, kw in enumerate(items):
                course = Course.objects.filter(title__icontains=kw).first()
                LearningPathItem.objects.create(
                    path=path, order=i,
                    item_type="course" if course else "module",
                    course=course,
                    label="" if course else kw,
                )
            made += 1

        self.stdout.write(self.style.SUCCESS(f"Seeded {made} learning paths."))
        self.stdout.write("  View: /academy/learning-paths")
