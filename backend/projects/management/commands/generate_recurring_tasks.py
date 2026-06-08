"""Cron entrypoint: materialize every due recurring task rule.

Run daily (e.g. crontab / scheduled task):
    python manage.py generate_recurring_tasks
"""
from django.core.management.base import BaseCommand

from projects.recurring_engine import run_due_rules


class Command(BaseCommand):
    help = "Generate tasks for all recurring task rules that are due."

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true", help="Report what would be generated without creating tasks.")

    def handle(self, *args, **options):
        if options.get("dry_run"):
            from datetime import date
            from projects.models import RecurringTaskRule
            due = RecurringTaskRule.objects.filter(active=True, next_run_date__lte=date.today())
            self.stdout.write(f"[dry-run] {due.count()} rule(s) due: " + ", ".join(f"{r.title} @ {r.next_run_date}" for r in due[:20]))
            return
        touched, total = run_due_rules()
        self.stdout.write(self.style.SUCCESS(f"Generated {total} task(s) from {touched} recurring rule(s)."))
