"""Seed/repair LSS-Black demo data.

Currently fills in the missing p_value + reject_null on the existing two
HypothesisTest demo records so the Yanmar audience sees realistic
statistical output (ASQ Black Belt BoK requires test statistic, p-value,
and reject/fail-to-reject conclusion for the Analyze gate).

Idempotent: only updates rows where p_value IS NULL.

Usage:
    python manage.py seed_lss_demo_data
"""
from django.core.management.base import BaseCommand
from django.db import transaction

from lss_black.models import HypothesisTest


# Realistic two-sample paired demo values (one significant, one not).
DEMO_VALUES = [
    {"p_value": 0.023, "reject_null": True},
    {"p_value": 0.187, "reject_null": False},
]


class Command(BaseCommand):
    help = "Seed/repair LSS-Black HypothesisTest demo data (p_value, reject_null)."

    @transaction.atomic
    def handle(self, *args, **options):
        pending = list(
            HypothesisTest.objects.filter(p_value__isnull=True).order_by('id')
        )
        if not pending:
            self.stdout.write(self.style.SUCCESS(
                "No pending hypothesis tests — all rows already have p_value."
            ))
            return

        updated = 0
        for idx, ht in enumerate(pending):
            preset = DEMO_VALUES[idx % len(DEMO_VALUES)]
            ht.p_value = preset['p_value']
            ht.reject_null = preset['reject_null']
            # Recompute via save() so the model's reject_null logic stays consistent.
            ht.save()
            updated += 1

        self.stdout.write(self.style.SUCCESS(
            f"Updated {updated} HypothesisTest rows with demo p_value / reject_null."
        ))
