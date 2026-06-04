"""PRINCE2 behavioural signals.

Wires *Manage by Exception* into actual behaviour: when a ProjectTolerance is
flagged as exceeded, an Exception Report is auto-raised for the Project Board
instead of the breach silently sitting as a boolean nobody reads.
"""
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.utils import timezone

from .models import ProjectTolerance, Prince2ExceptionReport, Stage


@receiver(pre_save, sender=ProjectTolerance)
def _capture_tolerance_state(sender, instance, **kwargs):
    """Remember the previous is_exceeded value so post_save can detect a breach
    transition (False -> True) rather than firing on every save."""
    if instance.pk:
        try:
            instance._old_is_exceeded = sender.objects.get(pk=instance.pk).is_exceeded
        except sender.DoesNotExist:
            instance._old_is_exceeded = False
    else:
        instance._old_is_exceeded = False


@receiver(post_save, sender=ProjectTolerance)
def _raise_exception_on_breach(sender, instance, created, **kwargs):
    became_exceeded = instance.is_exceeded and not getattr(instance, '_old_is_exceeded', False)
    if not became_exceeded:
        return
    # Idempotent: don't pile up reports while one is still open for this tolerance.
    if Prince2ExceptionReport.objects.filter(
        breaching_tolerance=instance,
        status__in=['open', 'under_review', 'board_decision'],
    ).exists():
        return
    active_stage = (
        Stage.objects.filter(project=instance.project, status='active')
        .order_by('order')
        .first()
    )
    type_label = instance.get_tolerance_type_display() if instance.tolerance_type else 'Tolerance'
    Prince2ExceptionReport.objects.create(
        project=instance.project,
        stage=active_stage,
        breaching_tolerance=instance,
        title=f"{type_label} tolerance exceeded",
        cause=instance.current_status or instance.description or '',
        status='open',
        auto_generated=True,
        date_raised=timezone.now().date(),
    )
