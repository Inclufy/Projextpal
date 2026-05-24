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


ITEMS = [
    {
        "sku": "PXP-SEAT",
        "name": "ProjeXtPal — Seat",
        "description": "Per gebruiker per maand. Alle methodologies (Agile/Kanban/Waterfall/Hybrid).",
        "category": "license_variable",
        "pricing_model": "per_user",
        "unit_price_cents": 1900,
        "setup_fee_cents": 25000,
        "currency": "EUR",
        "recurring_interval": "monthly",
        "metadata": {},
    },
    {
        "sku": "PXP-LSS",
        "name": "LSS Black/Green add-on",
        "description": "Lean Six Sigma module per organisatie.",
        "category": "addon",
        "pricing_model": "per_module",
        "unit_price_cents": 9900,
        "setup_fee_cents": 0,
        "currency": "EUR",
        "recurring_interval": "monthly",
        "metadata": {},
    },
    {
        "sku": "PXP-MSP",
        "name": "MSP programme add-on",
        "description": "Managing Successful Programmes — multi-project governance.",
        "category": "addon",
        "pricing_model": "per_module",
        "unit_price_cents": 14900,
        "setup_fee_cents": 0,
        "currency": "EUR",
        "recurring_interval": "monthly",
        "metadata": {},
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
