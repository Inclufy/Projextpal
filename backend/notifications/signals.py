"""
Signal handlers for the 4 v1 notification events.

  - Task assigned       → Task.post_save, when assigned_to changed to a real user
  - Comment mention     → CardComment.post_save, parse "@username" in content
  - Project member add  → ProjectTeam.post_save, on create with is_active=True
  - Deadline            → triggered by `manage.py send_deadline_notifications`
                          (cron job hits this; not a signal)
"""
from __future__ import annotations

import logging
import re

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver

from .dispatcher import dispatch
from .models import NotificationKind

logger = logging.getLogger(__name__)
User = get_user_model()

MENTION_RE = re.compile(r"@([A-Za-z0-9._-]+)")


def _frontend_url(path: str = "") -> str:
    base = getattr(settings, "FRONTEND_URL", "https://projextpal.com").rstrip("/")
    return f"{base}/{path.lstrip('/')}" if path else base


# ----------------------------------------------------------------------
# 1. Task assigned
# ----------------------------------------------------------------------
def _handle_task_saved(sender, instance, created, **kwargs):
    """Fire when assigned_to is set or changed.

    On create: if assignee present → notify.
    On update: only notify if assignee changed (we stash previous on the
    instance via the pre_save companion below).
    """
    if not instance.assigned_to_id:
        return
    actor = getattr(instance, "_actor", None)
    if instance.assigned_to_id == getattr(actor, "pk", None):
        # User assigned themselves — don't notify themselves
        return

    previous_assignee_id = getattr(instance, "_previous_assigned_to_id", None)
    if not created and previous_assignee_id == instance.assigned_to_id:
        return  # assignee didn't change

    dispatch(
        recipient=instance.assigned_to,
        kind=NotificationKind.TASK_ASSIGNED,
        title=f"Task assigned: {instance.title}",
        body=instance.description[:300] if instance.description else "",
        target_url=_frontend_url(f"tasks/{instance.pk}"),
        payload={
            "task_id": instance.pk,
            "task_title": instance.title,
            "milestone_id": instance.milestone_id,
        },
    )


def _handle_task_pre_save(sender, instance, **kwargs):
    """Stash previous assigned_to so post_save can detect changes."""
    if not instance.pk:
        instance._previous_assigned_to_id = None
        return
    try:
        previous = sender.objects.only("assigned_to_id").get(pk=instance.pk)
        instance._previous_assigned_to_id = previous.assigned_to_id
    except sender.DoesNotExist:
        instance._previous_assigned_to_id = None


# ----------------------------------------------------------------------
# 2. Comment mention
# ----------------------------------------------------------------------
def _handle_comment_saved(sender, instance, created, **kwargs):
    if not created:
        return
    content = (instance.content or "").strip()
    if not content or "@" not in content:
        return

    handles = set(MENTION_RE.findall(content))
    if not handles:
        return

    # Find users whose username OR email-prefix matches the mentioned handle
    mentioned = User.objects.filter(username__in=handles).distinct()
    if not mentioned:
        # fall back to email-prefix match
        mentioned = User.objects.filter(
            email__regex=r"^(" + "|".join(re.escape(h) for h in handles) + r")@"
        ).distinct()

    actor_id = getattr(instance.user, "pk", None)
    for user in mentioned:
        if user.pk == actor_id:
            continue  # don't notify yourself
        dispatch(
            recipient=user,
            kind=NotificationKind.COMMENT_MENTION,
            title=f"You were mentioned by {instance.user.first_name or instance.user.email}",
            body=content[:300],
            target_url=_frontend_url(f"kanban/cards/{instance.card_id}"),
            payload={
                "card_id": instance.card_id,
                "comment_id": instance.pk,
                "from_user_id": actor_id,
            },
        )


# ----------------------------------------------------------------------
# 3. Project member added
# ----------------------------------------------------------------------
def _handle_team_member_saved(sender, instance, created, **kwargs):
    if not created or not instance.is_active or not instance.user_id:
        return
    actor_id = getattr(instance.added_by, "pk", None)
    if instance.user_id == actor_id:
        return  # added themselves (rare but possible) — no spam

    project = getattr(instance, "project", None)
    project_name = getattr(project, "name", "a project") if project else "a project"

    dispatch(
        recipient=instance.user,
        kind=NotificationKind.PROJECT_MEMBER_ADDED,
        title=f"You were added to {project_name}",
        body="",
        target_url=_frontend_url(f"projects/{instance.project_id}"),
        payload={
            "project_id": instance.project_id,
            "project_name": project_name,
            "added_by_id": actor_id,
        },
    )


# ----------------------------------------------------------------------
# Wire signals (lazy imports — projects/kanban are sibling apps)
# ----------------------------------------------------------------------
try:
    from projects.models import Task, ProjectTeam
    from django.db.models.signals import pre_save

    pre_save.connect(_handle_task_pre_save, sender=Task, dispatch_uid="notifications.task_pre_save")
    post_save.connect(_handle_task_saved, sender=Task, dispatch_uid="notifications.task_saved")
    post_save.connect(_handle_team_member_saved, sender=ProjectTeam, dispatch_uid="notifications.team_member_saved")
except Exception:
    logger.exception("notifications: failed to wire projects signals")

try:
    from kanban.models import CardComment
    post_save.connect(_handle_comment_saved, sender=CardComment, dispatch_uid="notifications.comment_saved")
except Exception:
    logger.exception("notifications: failed to wire kanban CardComment signal")
