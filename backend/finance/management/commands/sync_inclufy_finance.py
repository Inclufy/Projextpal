"""
Pull-sync from Inclufy Finance into ProjeXtPal.

Usage (intended to run from cron / Celery beat / GitLab scheduled pipeline):

    python manage.py sync_inclufy_finance --company 1
    python manage.py sync_inclufy_finance --company 1 --since 2026-04-01
    python manage.py sync_inclufy_finance --all-companies
    python manage.py sync_inclufy_finance --company 1 --dry-run
"""
import json
from datetime import datetime, timedelta

from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone

from accounts.models import Company
from finance.inclufy_sync import sync_for_company, InclufyFinanceClient


class Command(BaseCommand):
    help = "Pull suppliers / invoices / line items / bookings from Inclufy Finance into ProjeXtPal."

    def add_arguments(self, parser):
        parser.add_argument(
            "--company", type=int,
            help="ProjeXtPal Company id to sync into. Required unless --all-companies.",
        )
        parser.add_argument(
            "--all-companies", action="store_true",
            help="Iterate over every Company.",
        )
        parser.add_argument(
            "--since", type=str,
            help="ISO date (e.g. 2026-04-01). Only fetch records updated on/after this date. Default: 24h ago.",
        )
        parser.add_argument(
            "--dry-run", action="store_true",
            help="Run the client and print summary, but do not write to the database.",
        )

    def handle(self, *args, **opts):
        if not opts.get("company") and not opts.get("all_companies"):
            raise CommandError("Provide --company <id> or --all-companies.")

        since: datetime
        if opts.get("since"):
            try:
                since = datetime.fromisoformat(opts["since"])
            except ValueError:
                raise CommandError(f"Invalid --since: {opts['since']!r}")
        else:
            since = timezone.now() - timedelta(hours=24)

        companies = (
            Company.objects.all()
            if opts.get("all_companies")
            else Company.objects.filter(id=opts["company"])
        )
        if not companies.exists():
            raise CommandError("No matching Company found.")

        try:
            client = InclufyFinanceClient()
        except ValueError as e:
            raise CommandError(str(e))

        if opts.get("dry_run"):
            self.stdout.write(self.style.WARNING("DRY RUN — fetching only, not persisting."))
            suppliers = client.list_suppliers(since=since)
            invoices = client.list_invoices(since=since)
            self.stdout.write(f"  suppliers fetched: {len(suppliers)}")
            self.stdout.write(f"  invoices fetched:  {len(invoices)}")
            return

        for company in companies:
            self.stdout.write(f"=== Syncing company {company.id} ({company.name}) since {since.isoformat()} ===")
            result = sync_for_company(company, since=since, client=client)
            self.stdout.write(json.dumps(dict(result), indent=2, default=str))
