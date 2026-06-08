"""
Seed the Action Tracker for the Yanmar demo project with realistic open
actions + follow-ups, so the Action Tracker screen is populated for the
demo (KPI spread over Overdue / Today / This week / Next week).

The Action Tracker is fed by Tasks with category="Action" under an
"Actions" milestone of the project (see frontend ActionTracker.tsx isAction).

Idempotent: get_or_create by (milestone, title); re-running updates in place.
Scoped to the demo project only ("Renovation Phase 2"); never touches live
tenants. Pass --project <id> to target a different project.

Usage:
    python manage.py seed_action_tracker
    python manage.py seed_action_tracker --project 92
"""
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction


DEMO_PROJECT_NAME = "Renovation Phase 2"

# (title, assignee_email, day_offset_from_today, priority, status)
ACTIONS = [
    ("Chase HVAC contractor for revised quote", "tom.devries@yanmar-demo.com", -3, "high", "in_progress"),
    ("Resolve budget variance on Electrical fit-out", "lena.fischer@yanmar-demo.com", -1, "urgent", "todo"),
    ("Follow up DPIA action with DPO", "maya.okonkwo@yanmar-demo.com", -5, "medium", "in_progress"),
    ("Circulate Stage 2 Highlight Report to Project Board", "maya.okonkwo@yanmar-demo.com", 0, "high", "todo"),
    ("Confirm electrical permit with municipality", "lena.fischer@yanmar-demo.com", 1, "urgent", "todo"),
    ("Update risk register after site survey", "maya.okonkwo@yanmar-demo.com", 2, "medium", "in_progress"),
    ("Book furniture delivery slot", "raj.patel@yanmar-demo.com", 4, "low", "todo"),
    ("Schedule next Project Board meeting", "sami@inclufy.com", 6, "medium", "todo"),
    ("Sign off Work Package: HVAC installation", "tom.devries@yanmar-demo.com", 9, "high", "todo"),
    ("Close-out: snagging list walk-through", "raj.patel@yanmar-demo.com", -7, "low", "done"),
]


class Command(BaseCommand):
    help = "Seed Action Tracker (category=Action tasks) for the demo project."

    def add_arguments(self, parser):
        parser.add_argument("--project", type=int, default=None, help="Target project id (default: the demo project).")

    @transaction.atomic
    def handle(self, *args, **opts):
        from django.contrib.auth import get_user_model
        from projects.models import Project, Milestone, Task
        User = get_user_model()

        if opts["project"]:
            project = Project.objects.filter(id=opts["project"]).first()
        else:
            project = Project.objects.filter(name=DEMO_PROJECT_NAME).order_by("-id").first()
        if not project:
            self.stdout.write(self.style.ERROR("Demo project not found — run seed_yanmar_demo first (or pass --project)."))
            return

        ms, _ = Milestone.objects.get_or_create(
            project=project, name="Actions",
            defaults=dict(description="Action tracker items"),
        )

        def user_for(email):
            return User.objects.filter(email=email).first()

        today = timezone.localdate()
        n = 0
        for title, email, offset, prio, status in ACTIONS:
            defaults = dict(
                category="Action",
                assigned_to=user_for(email),
                due_date=today + timedelta(days=offset),
                priority=prio,
                status=status,
                progress=100 if status == "done" else (40 if status == "in_progress" else 0),
                description="Auto-seeded demo action.",
            )
            obj, created = Task.objects.get_or_create(milestone=ms, title=title, defaults=defaults)
            if not created:
                for k, v in defaults.items():
                    setattr(obj, k, v)
                obj.save()
            n += 1

        self.stdout.write(self.style.SUCCESS(
            f"Seeded {n} actions on project #{project.id} '{project.name}' (milestone #{ms.id} 'Actions')."))
