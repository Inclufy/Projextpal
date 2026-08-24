"""Signal handlers that turn domain events into per-user notifications.

Wired in NotificationsConfig.ready(). Each handler is defensive — a failure to
create a notification must never break the originating model save.
"""
from django.db.models.signals import m2m_changed, post_save, pre_save
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

    def _task_context(instance):
        url = ""
        project_name = ""
        try:
            url = f"/projects/{instance.milestone.project_id}/planning/tasks"
            project_name = instance.milestone.project.name
        except Exception:
            pass
        in_project = f" in project “{project_name}”" if project_name else ""
        return url, in_project

    @receiver(pre_save, sender=Task, dispatch_uid="notif_task_pre")
    def _task_pre(sender, instance, **kwargs):
        instance._old_assignee = _old_value(sender, instance, "assigned_to_id")
        instance._old_status = _old_value(sender, instance, "status")

    @receiver(post_save, sender=Task, dispatch_uid="notif_task_post")
    def _task_post(sender, instance, created, **kwargs):
        # Gedelegeerde taak afgerond → meld het aan de delegeerder.
        if (
            not created
            and getattr(instance, "status", "") == "done"
            and getattr(instance, "_old_status", None) not in (None, "done")
            and getattr(instance, "delegated_by_id", None)
            and instance.delegated_by_id != getattr(instance, "assigned_to_id", None)
        ):
            url, in_project = _task_context(instance)
            notify(
                instance.delegated_by, kind="task_delegated_done",
                title=f"Gedelegeerde taak afgerond: {instance.title}",
                body=f"De door jou gedelegeerde taak “{instance.title}”{in_project} is afgerond.",
                url=url,
            )
        new = getattr(instance, "assigned_to_id", None)
        if not new:
            return
        if getattr(instance, "_skip_assign_notify", False):
            return  # delegatie stuurt zelf een rijkere melding
        if not created and getattr(instance, "_old_assignee", None) == new:
            return  # assignee unchanged
        if getattr(instance, "status", "") == "done":
            return  # afgeronde taak: een "toegewezen"-mail is dan verwarrend
        url, in_project = _task_context(instance)
        notify(
            instance.assigned_to, kind="task_assigned",
            title=f"Taak toegewezen: {instance.title}",
            body=f"Je bent toegewezen aan de taak “{instance.title}”{in_project}.",
            url=url,
        )

    @receiver(m2m_changed, sender=Task.assignees.through, dispatch_uid="notif_task_assignees")
    def _task_assignees_changed(sender, instance, action, pk_set, **kwargs):
        """Nieuw toegevoegde co-assignees krijgen dezelfde "toegewezen"-mail.

        De primaire eigenaar (assigned_to) wordt al gedekt door het
        FK-signaal hierboven, dus die slaan we hier over — geen dubbele mails.
        """
        if action != "post_add" or not pk_set:
            return
        if getattr(instance, "status", "") == "done":
            return
        if getattr(instance, "_skip_assign_notify", False):
            return  # delegatie stuurt zelf een rijkere melding
        from django.contrib.auth import get_user_model
        url, in_project = _task_context(instance)
        User = get_user_model()
        for user in User.objects.filter(pk__in=pk_set).exclude(
            pk=getattr(instance, "assigned_to_id", None) or 0
        ):
            notify(
                user, kind="task_assigned",
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
