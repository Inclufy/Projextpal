from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from .models import (
    Subtask,
    Task,
    Milestone,
    Expense,
    ProjectActivity,
    Project,
    ProjectTeam,
    ApprovalStage,
)


@receiver(post_save, sender=Subtask)
def update_task_progress_on_subtask_save(sender, instance, created, **kwargs):
    """Update task progress when a subtask is created or updated"""
    if instance.task:
        instance.task.update_progress_from_subtasks(save=True)

    # Activity log
    try:
        ProjectActivity.objects.create(
            project=instance.task.milestone.project,
            user=getattr(instance, "updated_by", None),
            action="created" if created else "updated",
            message=f"Subtask '{instance.title}' { 'created' if created else 'updated' }",
            target=instance,
        )
    except Exception:
        pass


@receiver(post_delete, sender=Subtask)
def update_task_progress_on_subtask_delete(sender, instance, **kwargs):
    """Update task progress when a subtask is deleted"""
    if instance.task:
        instance.task.update_progress_from_subtasks(save=True)

    # Activity log
    try:
        ProjectActivity.objects.create(
            project=instance.task.milestone.project,
            user=getattr(instance, "updated_by", None),
            action="deleted",
            message=f"Subtask '{instance.title}' deleted",
            target=instance,
        )
    except Exception:
        pass


@receiver(post_save, sender=Task)
def log_task_changes(sender, instance, created, **kwargs):
    try:
        ProjectActivity.objects.create(
            project=instance.milestone.project,
            user=getattr(instance, "assigned_to", None),
            action="created" if created else "updated",
            message=f"Task '{instance.title}' { 'created' if created else 'updated' }",
            target=instance,
        )
    except Exception:
        pass


@receiver(post_save, sender=Milestone)
def log_milestone_changes(sender, instance, created, **kwargs):
    try:
        ProjectActivity.objects.create(
            project=instance.project,
            user=getattr(instance, "updated_by", None),
            action="created" if created else "updated",
            message=f"Milestone '{instance.name}' { 'created' if created else 'updated' }",
            target=instance,
        )
    except Exception:
        pass


@receiver(post_save, sender=Expense)
def log_expense_changes(sender, instance, created, **kwargs):
    try:
        ProjectActivity.objects.create(
            project=instance.project,
            user=getattr(instance, "created_by", None),
            action="created" if created else "updated",
            message=f"Expense '{instance.description}' { 'created' if created else 'updated' }",
            target=instance,
        )
    except Exception:
        pass


@receiver(post_delete, sender=Expense)
def log_expense_delete(sender, instance, **kwargs):
    try:
        ProjectActivity.objects.create(
            project=instance.project,
            user=getattr(instance, "created_by", None),
            action="deleted",
            message=f"Expense '{instance.description}' deleted",
            target=instance,
        )
    except Exception:
        pass


# Track previous status for Project status changes
_project_previous_status = {}


@receiver(pre_save, sender=Project)
def track_project_status(sender, instance, **kwargs):
    """Track previous status before save"""
    if instance.pk:
        try:
            old_instance = Project.objects.get(pk=instance.pk)
            _project_previous_status[instance.pk] = old_instance.status
        except Project.DoesNotExist:
            pass


@receiver(post_save, sender=Project)
def log_project_changes(sender, instance, created, **kwargs):
    """Log project creation and status changes"""
    try:
        if created:
            ProjectActivity.objects.create(
                project=instance,
                user=getattr(instance, "created_by", None),
                action="created",
                message=f"created project",
                target=instance,
            )
        else:
            # Check if status changed
            old_status = _project_previous_status.get(instance.pk)
            if old_status and old_status != instance.status:
                status_display = dict(Project.STATUS_CHOICES).get(
                    instance.status, instance.status
                )
                ProjectActivity.objects.create(
                    project=instance,
                    user=getattr(instance, "created_by", None),
                    action="status_changed",
                    message=f"changed project status to {status_display}",
                    target=instance,
                )
            # Clean up tracking dict
            if instance.pk in _project_previous_status:
                del _project_previous_status[instance.pk]
    except Exception:
        pass


@receiver(post_save, sender=ProjectTeam)
def log_team_member_addition(sender, instance, created, **kwargs):
    """Log when team members are added"""
    if created:
        try:
            user_name = instance.user.get_full_name() or instance.user.email
            ProjectActivity.objects.create(
                project=instance.project,
                user=instance.added_by,
                action="created",
                message=f"added {user_name} to the team",
                target=instance,
            )
        except Exception:
            pass


@receiver(post_delete, sender=ProjectTeam)
def log_team_member_removal(sender, instance, **kwargs):
    """Log when team members are removed"""
    try:
        user_name = instance.user.get_full_name() or instance.user.email
        ProjectActivity.objects.create(
            project=instance.project,
            user=instance.added_by,
            action="deleted",
            message=f"removed {user_name} from the team",
            target=instance,
        )
    except Exception:
        pass


@receiver(post_save, sender=ApprovalStage)
def log_approval_stage_changes(sender, instance, created, **kwargs):
    """Log approval stage creation and reviews"""
    try:
        if created:
            ProjectActivity.objects.create(
                project=instance.project,
                user=None,  # Could be from admin action
                action="created",
                message=f"created approval stage '{instance.name}'",
                target=instance,
            )
        else:
            # Log if stage was reviewed
            if instance.status and instance.status != "pending":
                status_display = dict(ApprovalStage.STATUS_CHOICES).get(
                    instance.status, instance.status
                )
                ProjectActivity.objects.create(
                    project=instance.project,
                    user=None,
                    action="updated",
                    message=f"reviewed stage '{instance.name}' as {status_display}",
                    target=instance,
                )
    except Exception:
        pass
