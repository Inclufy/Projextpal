"""Signal handlers that turn domain events into per-user notifications.

Wired in NotificationsConfig.ready(). Each handler is defensive — a failure to
create a notification must never break the originating model save.
"""
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from .models import notify


def _old_value(sender, instance, field):
    """Previous value of `field` for an existing row, else None (on create)."""
    if not instance.pk:
        return None
    try:
        return sender.objects.filter(pk=instance.pk).values_list(field, flat=True).first()
    except Exception:
        return None


# --- Task assignment -------------------------------------------------------
try:
    from projects.models import Task

    @receiver(pre_save, sender=Task, dispatch_uid="notif_task_pre")
    def _task_pre(sender, instance, **kwargs):
        instance._old_assignee = _old_value(sender, instance, "assigned_to_id")

    @receiver(post_save, sender=Task, dispatch_uid="notif_task_post")
    def _task_post(sender, instance, created, **kwargs):
        new = getattr(instance, "assigned_to_id", None)
        if not new:
            return
        if not created and getattr(instance, "_old_assignee", None) == new:
            return  # assignee unchanged
        url = ""
        try:
            url = f"/projects/{instance.milestone.project_id}/planning/tasks"
        except Exception:
            pass
        notify(
            instance.assigned_to, kind="task_assigned",
            title=f"Task assigned: {instance.title}",
            body=f"You were assigned the task “{instance.title}”.",
            url=url,
        )
except Exception:
    pass


# --- Meeting action assignment --------------------------------------------
try:
    from governance.models import MeetingAction

    @receiver(pre_save, sender=MeetingAction, dispatch_uid="notif_ma_pre")
    def _ma_pre(sender, instance, **kwargs):
        instance._old_assignee = _old_value(sender, instance, "owner_id")

    @receiver(post_save, sender=MeetingAction, dispatch_uid="notif_ma_post")
    def _ma_post(sender, instance, created, **kwargs):
        new = getattr(instance, "owner_id", None)
        if not new:
            return
        if not created and getattr(instance, "_old_assignee", None) == new:
            return
        desc = (getattr(instance, "description", "") or "").strip()
        label = (desc[:80] + "…") if len(desc) > 80 else (desc or "New action")
        notify(
            instance.owner, kind="action_assigned",
            title=f"Action assigned: {label}",
            body="You were assigned a meeting action item.",
            url="",
        )
except Exception:
    pass
