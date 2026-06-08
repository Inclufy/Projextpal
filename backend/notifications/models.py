"""Per-user, persistent in-app notifications (the bell in the top nav).

Distinct from consumers.py, which is a websocket broadcast channel for admins.
This model is the durable store the notification centre reads + marks read.
"""
from django.conf import settings
from django.db import models


class Notification(models.Model):
    KIND_CHOICES = [
        ("task_assigned", "Task assigned"),
        ("action_assigned", "Action assigned"),
        ("mention", "Mention"),
        ("message", "Message"),
        ("approval", "Approval requested"),
        ("status", "Status update"),
        ("system", "System"),
    ]

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications"
    )
    # Tenant scoping — best-effort copy of the recipient's company so a query can
    # stay company-bounded even if the user later moves company.
    company = models.ForeignKey(
        "accounts.Company", on_delete=models.CASCADE, null=True, blank=True,
        related_name="notifications",
    )
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="+",
    )
    kind = models.CharField(max_length=24, choices=KIND_CHOICES, default="system")
    title = models.CharField(max_length=255)
    body = models.TextField(blank=True, default="")
    # Frontend deep-link, e.g. "/projects/92/planning/action-tracker".
    url = models.CharField(max_length=255, blank=True, default="")
    read = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["recipient", "read", "-created_at"], name="notif_recip_read_idx"),
        ]

    def __str__(self):
        return f"{self.title} -> {self.recipient_id} ({'read' if self.read else 'unread'})"


def notify(recipient, *, kind="system", title="", body="", url="", actor=None, company=None):
    """Create a notification for `recipient`. Safe no-op if recipient is None or
    the recipient would be notified about their own action.

    Never raises — notification failures must not break the originating save.
    """
    try:
        if recipient is None:
            return None
        if actor is not None and getattr(actor, "id", None) == getattr(recipient, "id", None):
            return None  # don't notify someone about their own action
        if company is None:
            company = getattr(recipient, "company", None)
        return Notification.objects.create(
            recipient=recipient, company=company, actor=actor,
            kind=kind, title=title[:255], body=body or "", url=url or "",
        )
    except Exception:
        return None
