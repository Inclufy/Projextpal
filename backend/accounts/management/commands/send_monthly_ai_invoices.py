"""Monthly AI-usage invoice dispatcher.

Runs on the first day of the month and aggregates ``AIUsageLog`` rows for
the PREVIOUS month per company. For every tenant with a non-zero spend we
send one ``invoice.created`` cross-app event to Inclufy Finance via
``finance.cross_app.dispatch_cross_app_event``. Finance receives the
payload through its generic inbound webhook (see docs/cross-app-financial-
documents.md) and creates an invoice draft the operator can review before
sending.

Two tiers end up on the same invoice (as separate lines when both apply
within the month):

  * **Inclufy-pool** line — full list-price for ``byok=False`` rows (we
    paid the LLM provider, we invoice the tenant).
  * **BYOK service-fee** line — 15% service-fee share aggregated from
    ``byok=True`` rows (tenant pays provider directly; we only cover
    plumbing). Omitted when zero.

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
        from accounts.models import AIUsageLog, Company
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

        # Aggregate per tenant AND per tier — a tenant may have switched to
        # BYOK mid-month, so both lines can coexist on one invoice.
        qs = AIUsageLog.objects.filter(
            created_at__gte=start, created_at__lt=end,
        ).exclude(company_id=None)
        agg = (
            qs.values("company_id", "byok")
            .annotate(
                tokens=Sum("tokens"),
                cost_cents=Sum("cost_cents"),
                calls=Count("id"),
            )
        )

        # Fold the (company_id, byok) rows into one dict per company.
        per_company: dict[int, dict] = {}
        for row in agg:
            cid = row["company_id"]
            bucket = per_company.setdefault(cid, {
                "pool": {"tokens": 0, "cost_cents": 0, "calls": 0},
                "byok": {"tokens": 0, "cost_cents": 0, "calls": 0},
            })
            kind = "byok" if row["byok"] else "pool"
            bucket[kind]["tokens"] = int(row["tokens"] or 0)
            bucket[kind]["cost_cents"] = int(row["cost_cents"] or 0)
            bucket[kind]["calls"] = int(row["calls"] or 0)

        # Sort by total cost (highest first) so the log reads top-down.
        sorted_cids = sorted(
            per_company.keys(),
            key=lambda c: -(per_company[c]["pool"]["cost_cents"]
                            + per_company[c]["byok"]["cost_cents"]),
        )

        billed = 0
        skipped_zero = 0
        for cid in sorted_cids:
            buckets = per_company[cid]
            total_cost = buckets["pool"]["cost_cents"] + buckets["byok"]["cost_cents"]
            if total_cost <= 0:
                skipped_zero += 1
                continue
            company = Company.objects.filter(pk=cid).only("id", "name").first()
            payload = _invoice_payload(company, label, cid, buckets)
            if options["dry_run"]:
                self.stdout.write(
                    f"  DRY  company={cid} name={getattr(company,'name','?')} "
                    f"pool={buckets['pool']['cost_cents']}c "
                    f"byok_fee={buckets['byok']['cost_cents']}c "
                    f"total={total_cost}c"
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
                    f"  ok   company={cid} total={total_cost}c → Finance"
                ))
            else:
                self.stdout.write(self.style.WARNING(
                    f"  err  company={cid} total={total_cost}c → {res}"
                ))

        self.stdout.write(self.style.SUCCESS(
            f"done: {billed} invoices dispatched, {skipped_zero} zero-cost companies skipped."
        ))


def _invoice_payload(company: Any, month_label: str, company_id: int, buckets: dict) -> dict:
    """Build the ``invoice.created`` payload per the cross-app contract.

    Emits up to two line items:
      * ``Inclufy-pool`` — full list-price for non-BYOK calls.
      * ``BYOK service-fee`` — 15% service-fee aggregated from BYOK calls.
    Lines with zero cost are dropped so a pure-BYOK tenant only gets the
    fee line, and vice versa.

    Finance accepts: ``customer``, ``issue_date``, ``period``, ``currency``,
    ``lines[]`` with each line a ``{description, quantity,
    unit_price_cents, total_cents}``.
    """
    pool = buckets["pool"]
    byok = buckets["byok"]
    lines = []
    if pool["cost_cents"] > 0:
        tokens = pool["tokens"]
        unit_cents = round(pool["cost_cents"] / tokens * 1000, 4) if tokens else 0
        lines.append({
            "description": (
                f"AI-token verbruik {month_label} — {tokens:,} tokens via "
                f"Inclufy-pool keys ({pool['calls']} calls)"
            ),
            "quantity": max(1, tokens // 1000),
            "unit_price_cents": unit_cents,
            "total_cents": pool["cost_cents"],
            "ai_breakdown": {
                "tier": "inclufy_pool",
                "tokens_total": tokens,
                "calls": pool["calls"],
            },
        })
    if byok["cost_cents"] > 0:
        tokens = byok["tokens"]
        unit_cents = round(byok["cost_cents"] / tokens * 1000, 4) if tokens else 0
        lines.append({
            "description": (
                f"AI service-fee {month_label} — {tokens:,} tokens via eigen "
                f"AI-key ({byok['calls']} calls, 15% van lijstprijs)"
            ),
            "quantity": max(1, tokens // 1000),
            "unit_price_cents": unit_cents,
            "total_cents": byok["cost_cents"],
            "ai_breakdown": {
                "tier": "byok_service_fee",
                "tokens_total": tokens,
                "calls": byok["calls"],
            },
        })
    return {
        "customer": {
            "external_id": f"projextpal-company-{company_id}",
            "name": getattr(company, "name", "") or f"Company #{company_id}",
        },
        "issue_date": date.today().isoformat(),
        "period": {
            "month": month_label,
            "kind": "ai_usage",
        },
        "currency": "EUR",
        "lines": lines,
        "notes": (
            "AI-verbruik factuur Inclufy. 'Inclufy-pool' = volledige lijstprijs "
            "voor calls via onze gedeelde LLM-keys. 'BYOK service-fee' = 15% "
            "servicevergoeding voor calls via jouw eigen key (jouw provider "
            "factureert het ruwe token-verbruik rechtstreeks aan jou)."
        ),
    }
