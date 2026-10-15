"""Monthly AI-usage invoice dispatcher.

Runs on the first day of the month and aggregates ``AIUsageLog`` rows for
the PREVIOUS month per company. For every tenant that:

  * has a non-zero Inclufy-pool spend (``byok=False`` rows), AND
  * does NOT have an active ``CompanyAIKey`` (BYOK tenants are billed by
    their own LLM provider, not by Inclufy),

we send one ``invoice.created`` cross-app event to Inclufy Finance via
``finance.cross_app.dispatch_cross_app_event``. Finance receives the
payload through its generic inbound webhook (see docs/cross-app-financial-
documents.md) and creates an invoice draft the operator can review before
sending.

Idempotency: ``idempotency_key`` is set to ``ai-invoice-<company_id>-<YYYY-MM>``
so a re-run in the same month is a no-op on the Finance side.

Usage:
    python manage.py send_monthly_ai_invoices                  # previous month, live
    python manage.py send_monthly_ai_invoices --month 2026-09  # explicit month
    python manage.py send_monthly_ai_invoices --dry-run        # log, don't dispatch
"""
from __future__ import annotations

from datetime import date
from typing import Any

from django.core.management.base import BaseCommand, CommandError
from django.db.models import Sum, Count


def _month_bounds(year: int, month: int) -> tuple[date, date]:
    start = date(year, month, 1)
    if month == 12:
        end = date(year + 1, 1, 1)
    else:
        end = date(year, month + 1, 1)
    return start, end


class Command(BaseCommand):
    help = "Aggregate the previous month's AI usage per company and ship invoice line-items to Inclufy Finance."

    def add_arguments(self, parser):
        parser.add_argument(
            "--month",
            type=str,
            default="",
            help="YYYY-MM (default: previous calendar month).",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Compute + log aggregates but do NOT dispatch to Finance.",
        )

    def handle(self, *args, **options):
        from accounts.models import AIUsageLog, Company, CompanyAIKey
        from finance.cross_app import dispatch_cross_app_event

        today = date.today()
        if options["month"]:
            try:
                y, m = options["month"].split("-")
                target_year, target_month = int(y), int(m)
            except (ValueError, IndexError):
                raise CommandError(f"Invalid --month {options['month']!r}; expected YYYY-MM.")
        else:
            # Default: previous calendar month.
            if today.month == 1:
                target_year, target_month = today.year - 1, 12
            else:
                target_year, target_month = today.year, today.month - 1

        start, end = _month_bounds(target_year, target_month)
        label = f"{target_year}-{target_month:02d}"
        self.stdout.write(self.style.NOTICE(f"Target month: {label} [{start} .. {end})"))

        # Only Inclufy-pool rows are billable — BYOK tenants' cost sits on
        # their own LLM-provider account.
        qs = AIUsageLog.objects.filter(
            created_at__gte=start, created_at__lt=end, byok=False,
        ).exclude(company_id=None)
        agg = (
            qs.values("company_id")
            .annotate(
                tokens=Sum("tokens"),
                cost_cents=Sum("cost_cents"),
                calls=Count("id"),
            )
            .order_by("-cost_cents")
        )

        companies_with_byok = set(
            CompanyAIKey.objects.filter(is_active=True)
            .exclude(openai_api_key="", anthropic_api_key="")
            .values_list("company_id", flat=True)
        )

        billed = 0
        skipped_byok = 0
        for row in agg:
            cid = row["company_id"]
            cost = int(row["cost_cents"] or 0)
            if cost <= 0:
                continue
            if cid in companies_with_byok:
                # Belt-and-braces — _usage.record_call() already drops cost_cents
                # to 0 for byok=True rows, but a tenant may have activated a key
                # mid-month after some non-BYOK calls landed. Skip to avoid a
                # confusing invoice.
                skipped_byok += 1
                self.stdout.write(f"  skip BYOK  company={cid} cost_cents={cost}")
                continue
            company = Company.objects.filter(pk=cid).only("id", "name").first()
            payload = _invoice_payload(company, label, row)
            if options["dry_run"]:
                self.stdout.write(
                    f"  DRY  company={cid} name={getattr(company,'name','?')} "
                    f"tokens={row['tokens']} cost={cost}c calls={row['calls']}"
                )
                continue
            res = dispatch_cross_app_event(
                event="invoice.created",
                payload=payload,
                idempotency_key=f"ai-invoice-{cid}-{label}",
            )
            if res.get("ok"):
                billed += 1
                self.stdout.write(self.style.SUCCESS(
                    f"  ok   company={cid} cost={cost}c → Finance"
                ))
            else:
                self.stdout.write(self.style.WARNING(
                    f"  err  company={cid} cost={cost}c → {res}"
                ))

        self.stdout.write(self.style.SUCCESS(
            f"done: {billed} invoices dispatched, {skipped_byok} skipped (BYOK)."
        ))


def _invoice_payload(company: Any, month_label: str, row: dict) -> dict:
    """Build the ``invoice.created`` payload per the cross-app contract.

    Finance accepts the following top-level keys (see
    docs/cross-app-financial-documents.md § invoice): ``customer``,
    ``issue_date``, ``period``, ``currency``, ``lines[]`` with each line a
    ``{description, quantity, unit_price_cents, total_cents}``.
    """
    tokens = int(row["tokens"] or 0)
    cost_cents = int(row["cost_cents"] or 0)
    unit_cents = round(cost_cents / tokens * 1000, 4) if tokens else 0
    return {
        "customer": {
            "external_id": f"projextpal-company-{row['company_id']}",
            "name": getattr(company, "name", "") or f"Company #{row['company_id']}",
        },
        "issue_date": date.today().isoformat(),
        "period": {
            "month": month_label,
            "kind": "ai_usage",
        },
        "currency": "EUR",
        "lines": [
            {
                "description": (
                    f"AI-token verbruik {month_label} — {tokens:,} tokens via "
                    f"Inclufy-pool keys ({row['calls']} calls)"
                ),
                "quantity": max(1, tokens // 1000),  # per-1000 tokens
                "unit_price_cents": unit_cents,
                "total_cents": cost_cents,
                "ai_breakdown": {
                    "tokens_total": tokens,
                    "calls": row["calls"],
                },
            }
        ],
        "notes": (
            "Deze factuur dekt alleen AI-token verbruik via Inclufy's eigen "
            "LLM-pool keys. Ingericht per tenant eigen key (BYOK): rechtstreekse "
            "facturatie door jouw provider, geen Inclufy-regel."
        ),
    }
