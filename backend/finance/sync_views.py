"""HTTP entry points for the Inclufy Finance integration.

Two surfaces:

1. POST /api/v1/finance/sync/inclufy/  — admin-triggered pull-sync. The caller
   is an authenticated ProjeXtPal admin/superadmin; the server fetches data
   from Inclufy Finance via Supabase REST and reconciles it locally.

2. POST /api/v1/finance/webhooks/inclufy/ — push from Inclufy Finance. The
   payload arrives signed with a shared X-Inclufy-Webhook-Token header.
   Behaves like /invoices/import/ but is called automatically by Inclufy
   Finance whenever an invoice is created/updated.
"""
import hashlib
import hmac
import json
from datetime import datetime, timedelta

from django.conf import settings
from django.db import transaction
from django.utils import timezone
from rest_framework import status as http_status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .inclufy_sync import sync_for_company, InclufyFinanceClient


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def inclufy_finance_sync_trigger(request):
    """Admin-triggered pull-sync. Body (all optional):
    {
      "company_id": 1,                  # default = request.user.company
      "since":      "2026-04-01T00:00", # default = 24h ago
      "all_companies": false             # superadmin only
    }
    """
    user = request.user
    role = getattr(user, "role", None)
    is_super = role == "superadmin" or getattr(user, "is_superuser", False)
    if role not in ("admin", "superadmin") and not is_super:
        return Response({"error": "Admin role required."}, status=http_status.HTTP_403_FORBIDDEN)

    body = request.data or {}

    # Resolve target companies.
    from accounts.models import Company
    if body.get("all_companies"):
        if not is_super:
            return Response({"error": "Only superadmin may sync all companies."},
                            status=http_status.HTTP_403_FORBIDDEN)
        companies = Company.objects.all()
    else:
        company_id = body.get("company_id") or getattr(user.company, "id", None)
        if not company_id:
            return Response({"error": "company_id required (or be linked to a company)."},
                            status=http_status.HTTP_400_BAD_REQUEST)
        companies = Company.objects.filter(id=company_id)

    if not companies.exists():
        return Response({"error": "No matching company."}, status=http_status.HTTP_404_NOT_FOUND)

    since_str = body.get("since")
    try:
        since = datetime.fromisoformat(since_str) if since_str else timezone.now() - timedelta(hours=24)
    except ValueError:
        return Response({"error": f"Invalid since: {since_str!r}"},
                        status=http_status.HTTP_400_BAD_REQUEST)

    try:
        client = InclufyFinanceClient()
    except ValueError as e:
        return Response({"error": str(e)}, status=http_status.HTTP_503_SERVICE_UNAVAILABLE)

    results = {}
    for company in companies:
        results[str(company.id)] = dict(sync_for_company(company, since=since, client=client))

    return Response(
        {"since": since.isoformat(), "results": results},
        status=http_status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def inclufy_finance_webhook_receive(request):
    """Webhook endpoint called by Inclufy Finance.

    Authentication: HMAC-SHA256 signature of the raw body using the shared
    secret in settings.INCLUFY_FINANCE_WEBHOOK_SECRET, sent in the
    X-Inclufy-Signature header. We additionally accept a plain shared token
    via X-Inclufy-Webhook-Token for the simpler MVP setup.

    Payload format mirrors /api/v1/finance/invoices/import/:
    {
      "event": "invoice.created" | "invoice.updated" | "invoice.paid",
      "company_id": 1,
      "invoice": { ... Inclufy Finance invoice row ... },
      "lines":   [ ... invoice_lines rows ... ],
      "supplier": { ... suppliers row ... }
    }
    """
    secret = getattr(settings, "INCLUFY_FINANCE_WEBHOOK_SECRET", "")
    if not secret:
        return Response({"error": "Webhook not configured."},
                        status=http_status.HTTP_503_SERVICE_UNAVAILABLE)

    if not _verify_signature(request, secret):
        return Response({"error": "Invalid signature."},
                        status=http_status.HTTP_401_UNAUTHORIZED)

    try:
        payload = json.loads(request.body.decode("utf-8")) if request.body else (request.data or {})
    except (ValueError, UnicodeDecodeError):
        return Response({"error": "Body must be valid JSON."},
                        status=http_status.HTTP_400_BAD_REQUEST)

    company_id = payload.get("company_id")
    if not company_id:
        return Response({"error": "company_id is required."},
                        status=http_status.HTTP_400_BAD_REQUEST)

    from accounts.models import Company
    try:
        company = Company.objects.get(id=company_id)
    except Company.DoesNotExist:
        return Response({"error": f"Company {company_id} not found."},
                        status=http_status.HTTP_404_NOT_FOUND)

    invoice_row = payload.get("invoice") or {}
    supplier_row = payload.get("supplier") or {}
    line_rows = payload.get("lines") or []

    if not invoice_row.get("id") or not invoice_row.get("invoice_number"):
        return Response({"error": "invoice.id and invoice.invoice_number required."},
                        status=http_status.HTTP_400_BAD_REQUEST)

    # Reuse the sync engine's upsert helpers — single-row form.
    from .inclufy_sync import (
        _upsert_vendor, _upsert_invoice, _upsert_invoice_line,
    )

    with transaction.atomic():
        vendor_lookup = {}
        if supplier_row.get("id"):
            try:
                vendor, _ = _upsert_vendor(company, supplier_row)
                vendor_lookup[str(supplier_row["id"])] = vendor
            except Exception as e:
                return Response({"error": f"vendor upsert failed: {e}"},
                                status=http_status.HTTP_400_BAD_REQUEST)

        try:
            client = InclufyFinanceClient() if getattr(settings, "INCLUFY_FINANCE_SUPABASE_URL", "") else None
            inv, created = _upsert_invoice(company, invoice_row, vendor_lookup, client)
        except Exception as e:
            return Response({"error": f"invoice upsert failed: {e}"},
                            status=http_status.HTTP_400_BAD_REQUEST)

        line_count = 0
        for line in line_rows:
            try:
                if _upsert_invoice_line(inv, line):
                    line_count += 1
            except Exception:
                # Don't fail the webhook just because one line is malformed.
                continue

    return Response({
        "ok": True,
        "invoice_id": inv.id if inv else None,
        "created": created if inv else False,
        "lines_added": line_count,
    }, status=http_status.HTTP_200_OK)


def _verify_signature(request, secret: str) -> bool:
    # Plain shared-token path (MVP).
    token = request.META.get("HTTP_X_INCLUFY_WEBHOOK_TOKEN", "")
    if token and hmac.compare_digest(token, secret):
        return True

    # HMAC path.
    sig = request.META.get("HTTP_X_INCLUFY_SIGNATURE", "")
    if not sig:
        return False
    expected = hmac.new(secret.encode(), request.body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(sig.lower(), expected.lower())
