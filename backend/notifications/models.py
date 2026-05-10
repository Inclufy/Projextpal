"""
Notification engine models for ProjeXtPal.

Two tables:
  - Notification:     a single in-app event addressed to one user
  - NotificationPreference: per-user opt-in/out per event-kind

Design choices:
  - `kind` is a short slug (task_assigned, comment_mention, ...) — matches the
    keys in core.email_i18n._TEMPLATES["notification_<kind>"]
  - `payload` is opaque JSON so signals can stash any context the email/UI
    later needs to render (project_id, task_url, etc.) without DB migrations
  - `is_read` + `read_at` for the bell-icon unread badge
  - GenericForeignKey would have been cleaner but adds query complexity; we
    use a flat `target_url` string instead (frontend follows it on click)
"""
from __future__ import annotations

from django.conf import settings
from django.db import models


class NotificationKind(models.TextChoices):
    TASK_ASSIGNED = "task_assigned", "Task assigned"
    COMMENT_MENTION = "comment_mention", "Comment mention"
    PROJECT_MEMBER_ADDED = "project_member_added", "Project member added"
    DEADLINE_APPROACHING = "deadline_approaching", "Deadline approaching"


class Notification(models.Model):
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    kind = models.CharField(max_length=32, choices=NotificationKind.choices)
    title = models.CharField(max_length=200)
    body = models.TextField(blank=True)
    target_url = models.CharField(max_length=512, blank=True)
    payload = models.JSONField(default=dict, blank=True)

    is_read = models.BooleanField(default=False, db_index=True)
    read_at = models.DateTimeField(null=True, blank=True)
    email_sent = models.BooleanField(default=False)
    email_sent_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["recipient", "is_read", "-created_at"]),
        ]

    def __str__(self):
        return f"{self.kind} → {self.recipient_id} [{'read' if self.is_read else 'unread'}]"


class NotificationPreference(models.Model):
    """One row per user. Defaults to all-on; user can opt out per event."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notification_preferences",
    )

    # In-app (always shown in bell). Email is opt-in/out per kind.
    email_task_assigned = models.BooleanField(default=True)
    email_comment_mention = models.BooleanField(default=True)
    email_project_member_added = models.BooleanField(default=True)
    email_deadline_approaching = models.BooleanField(default=True)

    # Master switches
    in_app_enabled = models.BooleanField(default=True)
    email_enabled = models.BooleanField(default=True)

    updated_at = models.DateTimeField(auto_now=True)

    def wants_email_for(self, kind: str) -> bool:
        if not self.email_enabled:
            return False
        field = f"email_{kind}"
        return bool(getattr(self, field, False))

    @classmethod
    def get_or_default(cls, user):
        pref, _ = cls.objects.get_or_create(user=user)
        return pref
