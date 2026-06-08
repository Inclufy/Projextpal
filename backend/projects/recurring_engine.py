"""Shared materialization logic for recurring task rules, used both by the
`generate_recurring_tasks` management command (cron) and the API run_now action.
"""
from datetime import date, timedelta

from .models import Task, Milestone, CustomFieldDefinition


def _resolve_milestone(rule):
    if rule.milestone_id:
        return rule.milestone
    ms = Milestone.objects.filter(project_id=rule.project_id, name="Recurring").first()
    if ms:
        return ms
    first = Milestone.objects.filter(project_id=rule.project_id).first()
    return first or Milestone.objects.create(
        project_id=rule.project_id, name="Recurring", description="Recurring tasks"
    )


def _create_task_for(rule, run_date):
    ms = _resolve_milestone(rule)
    active_keys = set(
        CustomFieldDefinition.objects.filter(
            company_id=rule.company_id, entity="task", active=True
        ).values_list("key", flat=True)
    )
    cf = {k: v for k, v in (rule.custom_fields or {}).items() if k in active_keys} if active_keys else {}
    due = run_date + timedelta(days=rule.due_offset_days or 0)
    return Task.objects.create(
        milestone=ms,
        title=rule.title[:255],
        description=rule.description or "",
        category=rule.category or "",
        priority=rule.priority or "medium",
        assigned_to=rule.assigned_to,
        start_date=run_date,
        due_date=due,
        custom_fields=cf,
    )


def materialize_rule(rule, today=None, force=False, max_catchup=12):
    """Generate the Task(s) due for one rule and advance next_run_date.

    Returns the number of tasks created. With ``force`` it always creates one
    task for the current next_run_date (used by the run-now action). Otherwise
    it catches up any missed periods up to ``max_catchup`` to avoid runaway.
    """
    today = today or date.today()
    created = 0

    if force:
        _create_task_for(rule, rule.next_run_date)
        rule.last_generated_date = rule.next_run_date
        rule.next_run_date = rule.step(rule.next_run_date)
        rule.save(update_fields=["last_generated_date", "next_run_date", "updated_at"])
        return 1

    if not rule.active:
        return 0
    while (
        created < max_catchup
        and rule.next_run_date <= today
        and (rule.end_date is None or rule.next_run_date <= rule.end_date)
    ):
        _create_task_for(rule, rule.next_run_date)
        created += 1
        rule.last_generated_date = rule.next_run_date
        rule.next_run_date = rule.step(rule.next_run_date)

    # Deactivate once we pass the end date.
    if rule.end_date and rule.next_run_date > rule.end_date:
        rule.active = False
    if created or (rule.end_date and not rule.active):
        rule.save(update_fields=["last_generated_date", "next_run_date", "active", "updated_at"])
    return created


def run_due_rules(today=None):
    """Materialize every active rule that is due. Returns (rules_touched, tasks_created)."""
    from .models import RecurringTaskRule
    today = today or date.today()
    touched, total = 0, 0
    qs = RecurringTaskRule.objects.filter(active=True, next_run_date__lte=today)
    for rule in qs.select_related("project", "milestone", "assigned_to"):
        n = materialize_rule(rule, today=today)
        if n:
            touched += 1
            total += n
    return touched, total
