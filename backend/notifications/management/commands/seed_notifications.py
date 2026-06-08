"""Seed a handful of demo notifications so the bell is populated for the demo.

Idempotent-ish: clears this user's auto-seeded demo notifications first, then
recreates them. Scoped to a single recipient (default sami@inclufy.com).

Usage:
    python manage.py seed_notifications
    python manage.py seed_notifications --email someone@example.com
"""
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model


DEMO = [
    ("task_assigned", "Task assigned: Circulate Stage 2 Highlight Report", "Maya assigned you a task on Renovation Phase 2.", "/projects", 0, False),
    ("action_assigned", "Action assigned: Confirm electrical permit", "From the last Project Board meeting.", "", 1, False),
    ("approval", "Approval requested: Due-date change on HVAC", "Tom requested a 2-week extension.", "", 3, False),
    ("status", "Highlight Report published", "The weekly status report for Renovation Phase 2 is ready.", "/reports", 26, True),
    ("message", "New comment on Risk R-04", "Lena replied on the budget-variance risk.", "", 30, True),
    ("system", "Welcome to ProjeXtPal", "Your workspace is ready. Tip: pin a custom dashboard for management.", "/reports", 120, True),
]


class Command(BaseCommand):
    help = "Seed demo notifications for the bell."

    def add_arguments(self, parser):
        parser.add_argument("--email", default="sami@inclufy.com")

    def handle(self, *args, **opts):
        from notifications.models import Notification
        User = get_user_model()
        user = User.objects.filter(email=opts["email"]).first()
        if not user:
            self.stdout.write(self.style.ERROR(f"No user {opts['email']}"))
            return

        Notification.objects.filter(recipient=user, title__in=[d[1] for d in DEMO]).delete()

        now = timezone.now()
        n = 0
        for kind, title, body, url, mins_ago, read in DEMO:
            Notification.objects.create(
                recipient=user, company=getattr(user, "company", None),
                kind=kind, title=title, body=body, url=url, read=read,
            )
            # Backdate created_at so the "x ago" labels look realistic.
            Notification.objects.filter(recipient=user, title=title).update(
                created_at=now - timedelta(minutes=mins_ago)
            )
            n += 1
        unread = Notification.objects.filter(recipient=user, read=False).count()
        self.stdout.write(self.style.SUCCESS(
            f"Seeded {n} notifications for {user.email} ({unread} unread)."))
