"""Backfill `avg_lead_time_hours` / `avg_cycle_time_hours` on KanbanMetrics.

Anderson's Kanban (Lean / "Kanban: Successful Evolutionary Change", 2010)
treats lead time and cycle time as the two cornerstone metrics. Existing
demo metric records have nulls for both — this command fills them in
either by computing from CardHistory or by seeding sane demo values.

Idempotent: only updates rows where both values are NULL.

Usage:
    python manage.py backfill_kanban_metrics
"""
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from kanban.models import KanbanMetrics, KanbanCard


# Sensible demo defaults if no history exists (in hours).
DEMO_LEAD_TIME_HOURS = 96.0   # 4 days
DEMO_CYCLE_TIME_HOURS = 48.0  # 2 days


class Command(BaseCommand):
    help = "Backfill avg_lead_time_hours / avg_cycle_time_hours on KanbanMetrics."

    @transaction.atomic
    def handle(self, *args, **options):
        pending = KanbanMetrics.objects.filter(
            avg_lead_time_hours__isnull=True,
            avg_cycle_time_hours__isnull=True,
        )
        if not pending.exists():
            self.stdout.write(self.style.SUCCESS(
                "No pending KanbanMetrics rows — nothing to backfill."
            ))
            return

        updated = 0
        for metric in pending:
            board = metric.board
            window_start = (metric.date or timezone.now().date()) - timedelta(days=30)
            completed_cards = KanbanCard.objects.filter(
                board=board,
                completed_date__gte=window_start,
                completed_date__isnull=False,
            )

            lead_times = []
            cycle_times = []
            for card in completed_cards:
                if card.completed_date and card.created_at:
                    lead_times.append(
                        (card.completed_date - card.created_at.date()).total_seconds() / 3600
                    )
                first_ip = card.history.filter(
                    to_column__column_type='in_progress'
                ).order_by('moved_at').first()
                started = first_ip.moved_at if first_ip else card.entered_column_at
                if card.completed_date and started:
                    c = (card.completed_date - started.date()).total_seconds() / 3600
                    if c >= 0:
                        cycle_times.append(c)

            metric.avg_lead_time_hours = (
                round(sum(lead_times) / len(lead_times), 2)
                if lead_times else DEMO_LEAD_TIME_HOURS
            )
            metric.avg_cycle_time_hours = (
                round(sum(cycle_times) / len(cycle_times), 2)
                if cycle_times else DEMO_CYCLE_TIME_HOURS
            )
            metric.save(update_fields=['avg_lead_time_hours', 'avg_cycle_time_hours'])
            updated += 1

        self.stdout.write(self.style.SUCCESS(
            f"Backfilled {updated} KanbanMetrics rows."
        ))
