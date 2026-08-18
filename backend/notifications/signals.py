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
        if getattr(instance, "status", "") == "done":
            return  # afgeronde taak: een "toegewezen"-mail is dan verwarrend
        url = ""
        project_name = ""
        try:
            url = f"/projects/{instance.milestone.project_id}/planning/tasks"
            project_name = instance.milestone.project.name
        except Exception:
            pass
        in_project = f" in project “{project_name}”" if project_name else ""
        notify(
            instance.assigned_to, kind="task_assigned",
            title=f"Taak toegewezen: {instance.title}",
            body=f"Je bent toegewezen aan de taak “{instance.title}”{in_project}.",
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
        label = (desc[:80] + "…") if len(desc) > 80 else (desc or "Nieuwe actie")
        notify(
            instance.owner, kind="action_assigned",
            title=f"Actie toegewezen: {label}",
            body="Je bent toegewezen aan een actiepunt uit een vergadering.",
            url="",
        )
except Exception:
    pass


# --- Meeting action ITEM (communication) PIC assignment --------------------
try:
    from communication.models import MeetingActionItem

    @receiver(pre_save, sender=MeetingActionItem, dispatch_uid="notif_mai_pre")
    def _mai_pre(sender, instance, **kwargs):
        instance._old_pic = _old_value(sender, instance, "pic_user_id")

    @receiver(post_save, sender=MeetingActionItem, dispatch_uid="notif_mai_post")
    def _mai_post(sender, instance, created, **kwargs):
        new = getattr(instance, "pic_user_id", None)
        if not new:
            return
        if not created and getattr(instance, "_old_pic", None) == new:
            return  # PIC unchanged
        subject = (getattr(instance, "subject", "") or "").strip() or "Nieuwe actie"
        url = ""
        try:
            url = f"/projects/{instance.meeting.project_id}/execution/communication/meeting"
        except Exception:
            pass
        notify(
            instance.pic_user, kind="action_assigned",
            title=f"Actie toegewezen: {subject}",
            body=f"Je bent verantwoordelijk gemaakt voor de vergaderactie “{subject}”.",
            url=url,
        )
except Exception:
    pass
