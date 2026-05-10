"""
Run daily via cron:

    docker exec projextpal-backend-prod python3 manage.py send_deadline_notifications

Finds tasks with due_date in [today+1, today+3] that have not yet had a
deadline notification fired. Idempotent: each (task, T-window) pair is
only notified once thanks to the payload-key check.
"""
from __future__ import annotations

from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone


class Command(BaseCommand):
    help = "Send deadline-approaching notifications for tasks due in 1 or 3 days."

    def handle(self, *args, **options):
        from projects.models import Task
        from notifications.dispatcher import dispatch
        from notifications.models import Notification, NotificationKind

        today = timezone.localdate()
        windows = [(1, "tomorrow"), (3, "in 3 days")]

        total_sent = 0
        for delta_days, label in windows:
            target_date = today + timedelta(days=delta_days)
            tasks = Task.objects.filter(
                due_date=target_date,
                assigned_to__isnull=False,
            ).exclude(status="done").select_related("assigned_to", "milestone")

            for task in tasks:
                # Idempotency: skip if we've already fired this exact (task, window)
                already = Notification.objects.filter(
                    recipient_id=task.assigned_to_id,
                    kind=NotificationKind.DEADLINE_APPROACHING,
                    payload__contains={"task_id": task.pk, "window": label},
                ).exists()
                if already:
                    continue

                dispatch(
                    recipient=task.assigned_to,
                    kind=NotificationKind.DEADLINE_APPROACHING,
                    title=f"Deadline {label}: {task.title}",
                    body=f"Task '{task.title}' is due {label} ({target_date.isoformat()}).",
                    target_url=_frontend_url(f"tasks/{task.pk}"),
                    payload={
                        "task_id": task.pk,
                        "window": label,
                        "due_date": target_date.isoformat(),
                    },
                )
                total_sent += 1

        self.stdout.write(self.style.SUCCESS(f"Sent {total_sent} deadline notifications."))


def _frontend_url(path: str = "") -> str:
    from django.conf import settings
    base = getattr(settings, "FRONTEND_URL", "https://projextpal.com").rstrip("/")
    return f"{base}/{path.lstrip('/')}" if path else base
