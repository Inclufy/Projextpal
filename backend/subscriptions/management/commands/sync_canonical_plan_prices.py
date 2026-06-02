"""
sync_canonical_plan_prices — upsert the canonical 4-tier SubscriptionPlan
rows that the public projextpal.com/pricing page reads via
/api/v1/subscriptions/plans/.

Why this exists:
  Pricing.tsx fetches /api/v1/subscriptions/plans/ at load time and
  merges the API response over the hardcoded plan config. So if the
  DB has stale rows (e.g. old "Basic €25 / Professional €75 /
  Enterprise €200") they OVERRIDE the new hardcoded prices and the
  page shows wrong numbers.

  This command idempotently writes the canonical 4-tier set so the
  API + hardcoded + Stripe + Finance catalog all agree.

Usage:
  python manage.py sync_canonical_plan_prices            # apply
  python manage.py sync_canonical_plan_prices --dry-run  # preview

Distinct from setup_stripe_products.py:
  setup_stripe_products creates products+prices on Stripe (gets new
  Stripe Price IDs). This command writes the SubscriptionPlan rows in
  Postgres. They go hand-in-hand: run setup_stripe_products FIRST to
  get the Price IDs, then this command to wire those IDs into the DB.
"""
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction

from subscriptions.models import SubscriptionPlan


# Canonical 4-tier set — must match Pricing.tsx, pricing_catalog_view.py,
# setup_stripe_products.py, and inclufy-finance product_catalog seed.
CANONICAL_PLANS = [
    {
        "name": "Starter",
        "plan_level": "starter",
        "monthly_price": Decimal("25.00"),
        "yearly_price": Decimal("270.00"),    # 25 × 12 × 0.9
        "max_users": None,
        "max_projects": None,
        "features": [
            "Web + mobile",
            "Unlimited projects",
            "Agile / Kanban / Waterfall",
            "Tasks + deadlines",
            "Basic dashboards",
            "Time tracking",
            "Email support",
        ],
        "is_popular": False,
    },
    {
        "name": "Professional",
        "plan_level": "professional",
        "monthly_price": Decimal("49.00"),
        "yearly_price": Decimal("529.20"),    # 49 × 12 × 0.9
        "max_users": None,
        "max_projects": None,
        "features": [
            "Everything in Starter",
            "Advanced roles & approvals",
            "Document generation (Word & PowerPoint)",
            "AI assistant for meeting notes",
            "Gantt charts & planning",
            "KPI dashboards",
            "Priority support",
        ],
        "is_popular": True,
        "priority_support": True,
        "advanced_analytics": True,
    },
    {
        "name": "Business",
        "plan_level": "business",
        "monthly_price": Decimal("79.00"),
        "yearly_price": Decimal("853.20"),    # 79 × 12 × 0.9
        "max_users": None,
        "max_projects": None,
        "features": [
            "Everything in Professional",
            "Portfolio management",
            "Multi-workspace / departments",
            "Advanced analytics & custom dashboards",
            "Resource planning",
            "Standard integrations (Slack, Teams, Drive)",
            "Priority feature requests",
            "24/5 extended support",
        ],
        "is_popular": False,
        "priority_support": True,
        "advanced_analytics": True,
    },
    {
        "name": "Enterprise",
        "plan_level": "enterprise",
        "monthly_price": Decimal("120.00"),
        "yearly_price": Decimal("1296.00"),   # 120 × 12 × 0.9
        "max_users": None,
        "max_projects": None,
        "features": [
            "Everything in Business",
            "Bring-your-own AI account",
            "Advanced data encryption",
            "Full audit trail + GDPR export",
            "Digital project sign-off",
            "SSO/SAML + 2FA + custom domain",
            "SLA 99.9% + dedicated success manager",
            "Custom integrations (SAP, Jira — on request)",
        ],
        "is_popular": False,
        "priority_support": True,
        "advanced_analytics": True,
        "custom_integrations": True,
    },
]


class Command(BaseCommand):
    help = (
        "Upsert the canonical 4-tier SubscriptionPlan rows "
        "(Starter/Professional/Business/Enterprise) so the public "
        "pricing page shows the right numbers. Idempotent."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run", action="store_true",
            help="Show what would change without writing.",
        )
        parser.add_argument(
            "--deactivate-legacy", action="store_true",
            help=(
                "Set is_active=False on any plan whose name is NOT in "
                "the canonical 4-tier set (e.g. old 'Basic', 'Team', "
                "'Trial' rows). Keeps the row for historical reference "
                "but stops it showing on the public page."
            ),
        )

    def handle(self, *args, **opts):
        dry_run = opts["dry_run"]
        deactivate_legacy = opts["deactivate_legacy"]

        self.stdout.write(self.style.NOTICE(
            f"Sync canonical plan prices — dry_run={dry_run}, "
            f"deactivate_legacy={deactivate_legacy}"
        ))
        self.stdout.write("")

        canonical_names = {p["name"] for p in CANONICAL_PLANS}
        n_updated = 0
        n_created = 0
        n_deactivated = 0

        with transaction.atomic():
            for cp in CANONICAL_PLANS:
                # Both monthly + yearly rows
                for plan_type, price in (
                    ("monthly", cp["monthly_price"]),
                    ("yearly", cp["yearly_price"]),
                ):
                    defaults = {
                        "plan_level": cp["plan_level"],
                        "price": price,
                        "features": cp["features"],
                        "is_active": True,
                        "is_popular": cp["is_popular"] and plan_type == "monthly",
                        "max_users": cp.get("max_users"),
                        "max_projects": cp.get("max_projects"),
                        "priority_support": cp.get("priority_support", False),
                        "advanced_analytics": cp.get("advanced_analytics", False),
                        "custom_integrations": cp.get("custom_integrations", False),
                    }
                    existing = SubscriptionPlan.objects.filter(
                        name=cp["name"], plan_type=plan_type
                    ).first()

                    if existing:
                        diffs = []
                        for k, v in defaults.items():
                            old = getattr(existing, k)
                            if old != v:
                                diffs.append(f"{k}: {old!r} -> {v!r}")
                        if diffs:
                            n_updated += 1
                            self.stdout.write(
                                f"  ~ UPDATE {cp['name']} ({plan_type}): "
                                + "; ".join(diffs)
                            )
                            if not dry_run:
                                for k, v in defaults.items():
                                    setattr(existing, k, v)
                                existing.save()
                        else:
                            self.stdout.write(
                                f"  = {cp['name']} ({plan_type}): "
                                f"already canonical, skip"
                            )
                    else:
                        n_created += 1
                        self.stdout.write(
                            f"  + CREATE {cp['name']} ({plan_type}): "
                            f"price=€{price}"
                        )
                        if not dry_run:
                            # stripe_price_id required + unique. We
                            # don't know Stripe IDs from here — caller
                            # should run setup_stripe_products FIRST,
                            # then copy IDs in via admin, OR seed a
                            # placeholder that admin can edit.
                            placeholder_stripe_id = (
                                f"placeholder_{cp['plan_level']}_{plan_type}"
                            )
                            SubscriptionPlan.objects.create(
                                name=cp["name"],
                                plan_type=plan_type,
                                stripe_price_id=placeholder_stripe_id,
                                **defaults,
                            )

            if deactivate_legacy:
                legacy = SubscriptionPlan.objects.filter(
                    is_active=True
                ).exclude(name__in=canonical_names)
                for lp in legacy:
                    n_deactivated += 1
                    self.stdout.write(self.style.WARNING(
                        f"  - DEACTIVATE legacy: {lp.name} "
                        f"({lp.plan_type}) — was €{lp.price}"
                    ))
                    if not dry_run:
                        lp.is_active = False
                        lp.save(update_fields=["is_active"])

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS(
            f"Done. {n_created} created, {n_updated} updated, "
            f"{n_deactivated} legacy deactivated."
            + (" (DRY RUN — no DB writes)" if dry_run else "")
        ))
