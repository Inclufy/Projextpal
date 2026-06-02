"""
ProjeXtPal — /pricing-catalog endpoint
=========================================
Public endpoint consumed by Inclufy Finance Quotation Engine
(sync-product-catalog cron + pricing-catalog-webhook). Returns the canonical
ProjeXtPal SKU set in the exact shape Finance expects, so the Finance cron
poll can detect price drift and version-bump the catalog automatically.

Optional Bearer-token auth: if env var PRICING_CATALOG_TOKEN is set, the
caller must send `Authorization: Bearer <token>`. Same token goes into
Finance's CATALOG_SOURCE_TOKEN_PROJEXTPAL secret.

Source-of-truth: this list mirrors product_catalog_inclufy_ecosystem.sql
in inclufy-auto-finance-main. When pricing changes, edit ITEMS below and
redeploy — Finance's cron picks it up within 6h.

ETag: SHA-256 of the items JSON, so callers can skip on 304 Not Modified.
"""

import hashlib
import json
import os
from datetime import datetime, timezone

from django.http import HttpResponse, JsonResponse
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView


# Each item is a sales-ready SKU — clear price, clear value-prop, clear
# category — curated for the Inclufy Finance offerte builder. The
# `metadata.quotable` flag is used by Finance to filter out internal
# items (currently all items are quotable; the flag is here for future
# internal-only SKUs like volume discounts or partner-only bundles).
#
# Pricing decisions:
#   - Tier prices (€19 / €39 / €79 per user / month) match exactly the
#     public projextpal.com/pricing page AND the Stripe seed at
#     management/commands/setup_stripe_products.py. Any tier-price
#     change here MUST also update those two — otherwise a customer
#     who reads the website (€39) gets quoted by sales (€25) and
#     billed by Stripe (€75). Don't let that happen again.
#   - Methodology modules (LSS / MSP / PRINCE2) priced per-org per-month
#     since they're feature flags, not per-user. Not on public page —
#     enterprise sales-only.
#   - Feature add-ons priced low-€/mo per-org so they're easy add-ons
#     during quote-build (€29-199/mo each).
#   - Services (DPIA / AWS / Custom Integration) are one-off — show as
#     setup_fee with recurring_interval=null.
ITEMS = [
    # ------------------------------------------------------------------
    # Tiered seats (3) — replace the old generic PXP-SEAT
    # ------------------------------------------------------------------
    {
        "sku": "PXP-STARTER",
        "name": "ProjeXtPal Starter",
        "description": (
            "Per gebruiker per maand. Web + mobile toegang, "
            "Agile/Kanban/Waterfall, 3-role membership "
            "(Owner/PM/Member), basis exports."
        ),
        "category": "license_variable",
        "pricing_model": "per_user",
        "unit_price_cents": 1900,
        "setup_fee_cents": 0,
        "currency": "EUR",
        "recurring_interval": "monthly",
        "metadata": {"tier": "starter", "quotable": True},
    },
    {
        "sku": "PXP-PRO",
        "name": "ProjeXtPal Professional",
        "description": (
            "Per gebruiker per maand. Inclusief Starter + 6-role "
            "governance, push-back approval workflow, DOCX/PPTX exports, "
            "category sub-totals + KPIs, AI Meeting Minutes, Gantt charts."
        ),
        "category": "license_variable",
        "pricing_model": "per_user",
        "unit_price_cents": 3900,
        "setup_fee_cents": 0,
        "currency": "EUR",
        "recurring_interval": "monthly",
        "metadata": {"tier": "professional", "quotable": True},
    },
    {
        "sku": "PXP-ENTERPRISE",
        "name": "ProjeXtPal Enterprise",
        "description": (
            "Per gebruiker per maand. Inclusief Professional + BYO LLM "
            "keys, Fernet encryption at rest, full audit log + GDPR "
            "data-export, e-sig project closing, TOTP 2FA, custom domain, "
            "SLA 99.9%, dedicated manager."
        ),
        "category": "license_variable",
        "pricing_model": "per_user",
        "unit_price_cents": 7900,
        "setup_fee_cents": 0,
        "currency": "EUR",
        "recurring_interval": "monthly",
        "metadata": {"tier": "enterprise", "quotable": True},
    },
    # ------------------------------------------------------------------
    # Methodology modules (3) — feature flags per organisation
    # ------------------------------------------------------------------
    {
        "sku": "PXP-LSS",
        "name": "LSS Black/Green add-on",
        "description": "Lean Six Sigma module per organisatie (DMAIC, control plans, RACI).",
        "category": "addon",
        "pricing_model": "per_module",
        "unit_price_cents": 9900,
        "setup_fee_cents": 0,
        "currency": "EUR",
        "recurring_interval": "monthly",
        "metadata": {"family": "methodology", "quotable": True},
    },
    {
        "sku": "PXP-MSP",
        "name": "MSP programme add-on",
        "description": "Managing Successful Programmes — multi-project governance + benefits realisation.",
        "category": "addon",
        "pricing_model": "per_module",
        "unit_price_cents": 14900,
        "setup_fee_cents": 0,
        "currency": "EUR",
        "recurring_interval": "monthly",
        "metadata": {"family": "methodology", "quotable": True},
    },
    {
        "sku": "PXP-PRINCE2",
        "name": "PRINCE2 + Highlight Reports add-on",
        "description": (
            "PRINCE2 stages, business case, end-project report, e-sig "
            "closing, Highlight Report PPTX export per maand."
        ),
        "category": "addon",
        "pricing_model": "per_module",
        "unit_price_cents": 7900,
        "setup_fee_cents": 0,
        "currency": "EUR",
        "recurring_interval": "monthly",
        "metadata": {"family": "methodology", "quotable": True},
    },
    # ------------------------------------------------------------------
    # Feature add-ons (4) — bundles derived from Sprint 0-3 work
    # ------------------------------------------------------------------
    {
        "sku": "PXP-AI-MINUTES",
        "name": "AI Meeting Minutes",
        "description": (
            "Upload meeting transcript → Claude-gegenereerde notulen + "
            "actiepunten → DOCX export. Onbeperkt aantal meetings per org."
        ),
        "category": "addon",
        "pricing_model": "per_module",
        "unit_price_cents": 2900,
        "setup_fee_cents": 0,
        "currency": "EUR",
        "recurring_interval": "monthly",
        "metadata": {"family": "ai", "quotable": True},
    },
    {
        "sku": "PXP-COMPLIANCE",
        "name": "Enterprise Compliance Pack",
        "description": (
            "BYO LLM keys (eigen Anthropic/OpenAI account) + Fernet "
            "encryption at rest voor alle credentials + uitgebreide "
            "audit log + DPIA template + GDPR data-export endpoints. "
            "Voor InfoSec-gating bij enterprise procurement."
        ),
        "category": "addon",
        "pricing_model": "per_module",
        "unit_price_cents": 19900,
        "setup_fee_cents": 0,
        "currency": "EUR",
        "recurring_interval": "monthly",
        "metadata": {"family": "compliance", "quotable": True},
    },
    {
        "sku": "PXP-GOVERNANCE",
        "name": "PMO Governance Pack",
        "description": (
            "6-role unified membership (Owner/PM/Leader/Facilitator/"
            "Outside Eyes/Stakeholder), push-back approval workflow met "
            "14-dag rule, e-sig project closing met canvas pad."
        ),
        "category": "addon",
        "pricing_model": "per_module",
        "unit_price_cents": 9900,
        "setup_fee_cents": 0,
        "currency": "EUR",
        "recurring_interval": "monthly",
        "metadata": {"family": "governance", "quotable": True},
    },
    {
        "sku": "PXP-EXPORT-PACK",
        "name": "Country-specific Export Templates",
        "description": (
            "Methodology-aware exports met landspecifieke templates "
            "(NL Belastingdienst layout / FR Liasse fiscale / DE / "
            "MA DGI / AE FTA). Prijs per land per maand."
        ),
        "category": "addon",
        "pricing_model": "per_module",
        "unit_price_cents": 3900,
        "setup_fee_cents": 0,
        "currency": "EUR",
        "recurring_interval": "monthly",
        "metadata": {"family": "exports", "quotable": True},
    },
    # ------------------------------------------------------------------
    # Implementation services (3) — one-off setup fees
    # ------------------------------------------------------------------
    {
        "sku": "PXP-SVC-DPIA",
        "name": "DPIA-review + GDPR consult",
        "description": (
            "Eenmalige DPIA-review + GDPR-compliance assessment door "
            "Inclufy consultant. Inclusief 1 workshop + DPIA-document "
            "op klant-template."
        ),
        "category": "service",
        "pricing_model": "one_off",
        "unit_price_cents": 0,
        "setup_fee_cents": 250000,
        "currency": "EUR",
        "recurring_interval": None,
        "metadata": {"family": "services", "quotable": True},
    },
    {
        "sku": "PXP-SVC-AWS",
        "name": "AWS dedicated hosting setup",
        "description": (
            "Dedicated AWS-omgeving met KMS-CMK, VPC peering, en "
            "dedicated Postgres. Inclusief topology-document + "
            "migratie van shared tenant naar dedicated."
        ),
        "category": "service",
        "pricing_model": "one_off",
        "unit_price_cents": 0,
        "setup_fee_cents": 500000,
        "currency": "EUR",
        "recurring_interval": None,
        "metadata": {"family": "services", "quotable": True},
    },
    {
        "sku": "PXP-SVC-INTEGRATION",
        "name": "Custom Integration (SAP / Jira / etc.)",
        "description": (
            "Klant-specifieke integratie met externe systemen "
            "(SAP S/4HANA, Jira, MS Project, Salesforce). Prijs op "
            "aanvraag — afhankelijk van scope."
        ),
        "category": "service",
        "pricing_model": "one_off",
        "unit_price_cents": 0,
        "setup_fee_cents": 0,
        "currency": "EUR",
        "recurring_interval": None,
        "metadata": {"family": "services", "quotable": True, "price_on_request": True},
    },
    # ------------------------------------------------------------------
    # Deprecated — kept for quote-reproducibility (existing quotes that
    # referenced PXP-SEAT still resolve). Marked `quotable: False` so
    # the Finance offerte builder skips it in the picker.
    # ------------------------------------------------------------------
    {
        "sku": "PXP-SEAT",
        "name": "ProjeXtPal — Seat (deprecated)",
        "description": (
            "Per gebruiker per maand. Alle methodologies "
            "(Agile/Kanban/Waterfall/Hybrid). Vervangen door "
            "PXP-STARTER/PRO/ENTERPRISE tiers — alleen zichtbaar voor "
            "reproductie van bestaande offertes."
        ),
        "category": "license_variable",
        "pricing_model": "per_user",
        "unit_price_cents": 1900,
        "setup_fee_cents": 25000,
        "currency": "EUR",
        "recurring_interval": "monthly",
        "metadata": {"quotable": False, "deprecated_in_favor_of": "PXP-PRO"},
    },
]


def _etag(payload_str: str) -> str:
    return '"' + hashlib.sha256(payload_str.encode("utf-8")).hexdigest() + '"'


class PricingCatalogView(APIView):
    """
    GET /api/v1/public/pricing-catalog/

    Returns {source_app, generated_at, items: [...]} in the shape Finance
    Quotation Engine expects. Public unless PRICING_CATALOG_TOKEN is set,
    in which case Bearer auth is required.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        expected = os.environ.get("PRICING_CATALOG_TOKEN", "")
        if expected:
            auth = request.headers.get("Authorization", "")
            got = auth[7:] if auth.startswith("Bearer ") else ""
            if got != expected:
                return JsonResponse({"error": "Unauthorized"}, status=401)

        payload = {
            "source_app": "projextpal",
            "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "items": ITEMS,
        }
        body = json.dumps(payload, separators=(",", ":"))
        etag = _etag(body)

        if request.headers.get("If-None-Match") == etag:
            return HttpResponse(status=304, headers={"ETag": etag})

        return HttpResponse(
            body,
            content_type="application/json",
            headers={
                "ETag": etag,
                "Cache-Control": "public, max-age=300",
            },
        )
