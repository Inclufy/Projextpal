"""
Inclufy Finance → ProjeXtPal sync.

Pulls suppliers, invoices, invoice lines, and booking entries from the
Inclufy Finance Supabase database and reconciles them into ProjeXtPal's
finance models (Vendor, Invoice, InvoiceLineItem).

Project linking:
- Inclufy Finance booking_entries.project_id is a UUID inside the Finance
  database. ProjeXtPal Project.project_code is the user-controlled string
  that bridges the two. To match an invoice to a ProjeXtPal project, the
  Finance side must put the ProjeXtPal project_code on either
  invoices.description (legacy) or booking_entries.cost_center, OR Finance
  creates a project shadow record whose `name` equals the project_code.
- For now we match via the invoice's `description` field if it contains
  a "P-CODE: XYZ" or "[XYZ]" tag; otherwise we leave invoice.project = null
  and let the user assign manually.

Settings required:
- INCLUFY_FINANCE_SUPABASE_URL — e.g. https://nruqfegrngpzoigflexn.supabase.co
- INCLUFY_FINANCE_SUPABASE_SERVICE_KEY — the service-role key (server-only,
  never the anon key).

Idempotency: every record uses external_id = Finance row's UUID.
"""
import re
import logging
from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, Iterable, List, Optional

import requests
from django.conf import settings
from django.db import transaction
from django.utils import timezone

from accounts.models import Company
from projects.models import Project
from .models import Vendor, Invoice, InvoiceLineItem, InvoicePayment

logger = logging.getLogger(__name__)


PROJECT_CODE_REGEX = re.compile(r"\[([A-Z0-9][A-Z0-9_\-/]{1,63})\]|P-CODE:\s*([A-Z0-9][A-Z0-9_\-/]{1,63})", re.IGNORECASE)


# -----------------------------------------------------------------------
# Inclufy Finance Supabase client
# -----------------------------------------------------------------------

class InclufyFinanceClient:
    """Thin wrapper around the Supabase REST API of the Inclufy Finance project."""

    def __init__(self, base_url: Optional[str] = None, service_key: Optional[str] = None):
        self.base_url = (base_url or getattr(settings, "INCLUFY_FINANCE_SUPABASE_URL", "")).rstrip("/")
        self.service_key = service_key or getattr(settings, "INCLUFY_FINANCE_SUPABASE_SERVICE_KEY", "")
        if not self.base_url or not self.service_key:
            raise ValueError(
                "Inclufy Finance is not configured. Set "
                "INCLUFY_FINANCE_SUPABASE_URL and INCLUFY_FINANCE_SUPABASE_SERVICE_KEY in settings."
            )

    def _headers(self) -> Dict[str, str]:
        return {
            "apikey": self.service_key,
            "Authorization": f"Bearer {self.service_key}",
            "Accept": "application/json",
            "Content-Type": "application/json",
        }

    def _get(self, table: str, params: Optional[Dict[str, str]] = None) -> List[Dict[str, Any]]:
        url = f"{self.base_url}/rest/v1/{table}"
        # Default to fetching up to 1000 rows; Supabase enforces 1000 cap unless overridden.
        params = dict(params or {})
        params.setdefault("select", "*")
        resp = requests.get(url, headers=self._headers(), params=params, timeout=60)
        resp.raise_for_status()
        return resp.json()

    def list_suppliers(self, since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        params = {"select": "*", "order": "updated_at.asc", "status": "eq.active"}
        if since:
            params["updated_at"] = f"gte.{since.isoformat()}"
        return self._get("suppliers", params)

    def list_invoices(self, since: Optional[datetime] = None,
                      invoice_type: str = "payable") -> List[Dict[str, Any]]:
        # Only payable invoices (received from suppliers) are project costs.
        params = {
            "select": "*",
            "order": "updated_at.asc",
            "invoice_type": f"eq.{invoice_type}",
        }
        if since:
            params["updated_at"] = f"gte.{since.isoformat()}"
        return self._get("invoices", params)

    def list_invoice_lines(self, invoice_id: str) -> List[Dict[str, Any]]:
        return self._get("invoice_lines", {"invoice_id": f"eq.{invoice_id}"})

    def list_booking_entries(self, since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        params = {"select": "*", "order": "updated_at.asc"}
        if since:
            params["updated_at"] = f"gte.{since.isoformat()}"
        return self._get("booking_entries", params)


# -----------------------------------------------------------------------
# Field mapping helpers
# -----------------------------------------------------------------------

# Inclufy Finance status → ProjeXtPal Invoice status
_INVOICE_STATUS_MAP = {
    "draft": "draft",
    "sent": "received",         # Finance "sent" means "issued/recorded" → received in ProjeXtPal
    "paid": "paid",
    "overdue": "received",      # still received, just overdue — ProjeXtPal computes is_overdue from due_date
    "cancelled": "cancelled",
}


def _extract_project_code(text: Optional[str]) -> Optional[str]:
    if not text:
        return None
    m = PROJECT_CODE_REGEX.search(text)
    if not m:
        return None
    return (m.group(1) or m.group(2) or "").upper()


def _safe_decimal(value: Any) -> Decimal:
    if value is None:
        return Decimal(0)
    try:
        return Decimal(str(value))
    except Exception:
        return Decimal(0)


# -----------------------------------------------------------------------
# Sync engine
# -----------------------------------------------------------------------

class InclufySyncResult(dict):
    """Plain dict with summary counts, suitable for JSON serialisation."""

    def __init__(self):
        super().__init__()
        self.update({
            "vendors_created": 0,
            "vendors_updated": 0,
            "invoices_created": 0,
            "invoices_updated": 0,
            "invoice_lines_created": 0,
            "bookings_recorded": 0,
            "errors": [],
        })

    def error(self, message: str):
        self["errors"].append(message)
        logger.warning("Inclufy sync error: %s", message)


def sync_for_company(
    company: Company,
    since: Optional[datetime] = None,
    client: Optional[InclufyFinanceClient] = None,
) -> InclufySyncResult:
    """Run a full pull-sync from Inclufy Finance for the given company.

    The company argument is the ProjeXtPal Company that owns the resulting
    vendors/invoices. The Inclufy Finance database is a single tenant in
    the current product; if/when Finance becomes multi-tenant the mapping
    here will need a per-company filter.
    """
    client = client or InclufyFinanceClient()
    result = InclufySyncResult()

    # ----------- 1. Suppliers → Vendors -----------
    try:
        suppliers = client.list_suppliers(since=since)
    except Exception as exc:
        result.error(f"list_suppliers failed: {exc}")
        return result

    vendor_lookup_by_external: Dict[str, Vendor] = {}
    for row in suppliers:
        external_id = row.get("id")
        if not external_id:
            continue
        try:
            vendor, created = _upsert_vendor(company, row)
            vendor_lookup_by_external[str(external_id)] = vendor
            if created:
                result["vendors_created"] += 1
            else:
                result["vendors_updated"] += 1
        except Exception as exc:
            result.error(f"vendor {row.get('name')} failed: {exc}")

    # ----------- 2. Invoices → Invoice records -----------
    try:
        invoices = client.list_invoices(since=since)
    except Exception as exc:
        result.error(f"list_invoices failed: {exc}")
        return result

    for row in invoices:
        try:
            inv, created = _upsert_invoice(company, row, vendor_lookup_by_external, client)
            if inv is None:
                continue
            if created:
                result["invoices_created"] += 1
            else:
                result["invoices_updated"] += 1
            # line items
            try:
                lines = client.list_invoice_lines(row["id"])
                for line in lines:
                    if _upsert_invoice_line(inv, line):
                        result["invoice_lines_created"] += 1
            except Exception as line_exc:
                result.error(
                    f"line items for {row.get('invoice_number')} failed: {line_exc}"
                )
        except Exception as exc:
            result.error(f"invoice {row.get('invoice_number')} failed: {exc}")

    # ----------- 3. Booking entries → InvoicePayment + ProjectActivity -----------
    try:
        bookings = client.list_booking_entries(since=since)
    except Exception as exc:
        # Booking sync is optional — don't bail the whole run if missing.
        result.error(f"list_booking_entries failed (continuing): {exc}")
        bookings = []

    for row in bookings:
        try:
            if _record_booking(company, row):
                result["bookings_recorded"] += 1
        except Exception as exc:
            result.error(f"booking {row.get('id')} failed: {exc}")

    logger.info("Inclufy sync for company=%s completed: %s", company.id, dict(result))
    return result


# -----------------------------------------------------------------------
# Upsert helpers
# -----------------------------------------------------------------------

def _upsert_vendor(company: Company, row: Dict[str, Any]) -> tuple:
    external_id = str(row["id"])
    defaults = {
        "name": row.get("name") or "Unknown supplier",
        "legal_name": row.get("name", "")[:255],
        "vat_id": (row.get("btw_number") or "")[:64],
        "chamber_of_commerce": (row.get("kvk_number") or "")[:64],
        "contact_name": (row.get("contact_person") or "")[:255],
        "contact_email": (row.get("email") or "")[:254],
        "contact_phone": (row.get("phone") or "")[:64],
        "address_line_1": (row.get("address") or "")[:255],
        "postal_code": (row.get("postal_code") or "")[:32],
        "city": (row.get("city") or "")[:128],
        "country": _country_iso2(row.get("country")) or "",
        "is_active": (row.get("status") == "active"),
        "notes": (row.get("notes") or ""),
    }
    # vendor_code is optional in ProjeXtPal but unique per company. Use the
    # Finance UUID prefix so we can correlate. Skip if a manual vendor with
    # the same name already exists.
    derived_code = f"if-{external_id[:8]}"
    vendor = (
        Vendor.objects.filter(company=company, vendor_code=derived_code).first()
        or Vendor.objects.filter(company=company, vat_id=defaults["vat_id"]).first()
        if defaults["vat_id"] else None
    )
    created = False
    if vendor is None:
        vendor = Vendor.objects.filter(company=company, name=defaults["name"]).first()
    if vendor is None:
        vendor = Vendor.objects.create(
            company=company,
            vendor_code=derived_code,
            **defaults,
        )
        created = True
    else:
        for key, value in defaults.items():
            if value and getattr(vendor, key) != value:
                setattr(vendor, key, value)
        if not vendor.vendor_code:
            vendor.vendor_code = derived_code
        vendor.save()
    return vendor, created


def _upsert_invoice(
    company: Company,
    row: Dict[str, Any],
    vendor_lookup: Dict[str, Vendor],
    client: InclufyFinanceClient,
):
    external_id = str(row["id"])
    invoice_number = row.get("invoice_number") or external_id
    supplier_external = str(row.get("supplier_id") or "")
    vendor = vendor_lookup.get(supplier_external)
    if vendor is None and supplier_external:
        # Vendor wasn't in the suppliers feed (maybe inactive). Pull it directly.
        try:
            sup_rows = client._get("suppliers", {"id": f"eq.{supplier_external}"})
            if sup_rows:
                vendor, _ = _upsert_vendor(company, sup_rows[0])
                vendor_lookup[supplier_external] = vendor
        except Exception:
            vendor = None

    if vendor is None:
        # Fall back to "Unknown" vendor record so the invoice still lands.
        vendor, _ = Vendor.objects.get_or_create(
            company=company,
            vendor_code="if-unknown",
            defaults={"name": "Inclufy Finance — unknown supplier"},
        )

    # Project matching via project_code embedded in description / metadata.
    project_code = _extract_project_code(row.get("description")) or _extract_project_code(row.get("entity_name"))
    project = None
    if project_code:
        project = Project.objects.filter(company=company, project_code__iexact=project_code).first()

    defaults = {
        "company": company,
        "vendor": vendor,
        "project": project,
        "project_code": project_code or "",
        "issue_date": row.get("invoice_date") or timezone.now().date(),
        "due_date": row.get("due_date"),
        "paid_at": row.get("payment_date"),
        "currency": "EUR",  # Finance is single-currency at the moment
        "amount_excl_vat": _safe_decimal(row.get("subtotal")),
        "vat_amount": _safe_decimal(row.get("tax_amount")),
        "total_amount": _safe_decimal(row.get("total_amount")),
        "paid_amount": _safe_decimal(row.get("paid_amount")),
        "status": _INVOICE_STATUS_MAP.get(row.get("status"), "received"),
        "source": "import_api",
        "notes": (row.get("description") or "")[:5000],
    }
    inv = Invoice.objects.filter(external_id=external_id).first()
    if inv is None:
        # Also catch existing rows by (vendor, invoice_number) to avoid
        # duplicating a manually-entered invoice.
        inv = Invoice.objects.filter(vendor=vendor, invoice_number=invoice_number).first()

    created = False
    if inv is None:
        inv = Invoice.objects.create(
            invoice_number=invoice_number,
            external_id=external_id,
            **defaults,
        )
        created = True
    else:
        for key, value in defaults.items():
            setattr(inv, key, value)
        inv.invoice_number = invoice_number
        inv.external_id = external_id
        inv.save()
    return inv, created


def _upsert_invoice_line(invoice: Invoice, line: Dict[str, Any]) -> bool:
    description = (line.get("description") or "Line item")[:512]
    # If the same description+amount already exists on this invoice, skip.
    existing = invoice.line_items.filter(
        description=description,
        line_total=_safe_decimal(line.get("line_total") or line.get("amount") or 0),
    ).first()
    if existing:
        return False
    InvoiceLineItem.objects.create(
        invoice=invoice,
        description=description,
        category=_classify_category(description),
        quantity=_safe_decimal(line.get("quantity") or 1),
        unit_price=_safe_decimal(line.get("unit_price") or line.get("amount") or 0),
        line_total=_safe_decimal(line.get("line_total") or line.get("amount") or 0),
        vat_rate=_safe_decimal(line.get("vat_rate") or line.get("tax_rate") or 21),
        cost_center=(line.get("cost_center") or "")[:64],
    )
    return True


def _record_booking(company: Company, row: Dict[str, Any]) -> bool:
    """Record an Inclufy Finance booking entry against the linked invoice
    (if any) as a payment trail. Booking entries that don't link to an
    invoice we synced are ignored — they belong to other accounting flows.
    """
    invoice_external = row.get("invoice_id")
    if not invoice_external:
        return False
    invoice = Invoice.objects.filter(external_id=str(invoice_external)).first()
    if invoice is None:
        return False

    amount = _safe_decimal(row.get("amount"))
    paid_at = row.get("entry_date") or timezone.now().date()

    # Idempotent: dedupe on (invoice, paid_at, amount, reference).
    reference = (row.get("reference") or "")[:128]
    existing = invoice.payments.filter(
        paid_at=paid_at, amount=amount, reference=reference
    ).first()
    if existing:
        return False
    InvoicePayment.objects.create(
        invoice=invoice,
        paid_at=paid_at,
        amount=amount,
        method=(row.get("entry_type") or "")[:64],
        reference=reference,
    )
    # Update the invoice paid_amount + status if fully paid.
    paid_total = sum((p.amount for p in invoice.payments.all()), Decimal(0))
    invoice.paid_amount = paid_total
    if paid_total >= invoice.total_amount and invoice.status != "cancelled":
        invoice.status = "paid"
    invoice.save(update_fields=["paid_amount", "status"])
    return True


# -----------------------------------------------------------------------
# Light heuristic for line-item categorisation. Replaces "uncategorised".
# -----------------------------------------------------------------------

_CATEGORY_KEYWORDS = [
    ("subcontractor", ["onderaannem", "subcontract", "freelance", "zzp"]),
    ("consulting", ["consultancy", "advies", "consulting"]),
    ("travel", ["reis", "travel", "trein", "vlucht", "hotel"]),
    ("hardware", ["laptop", "monitor", "macbook", "hardware"]),
    ("software_license", ["licen", "subscription", "saas"]),
    ("cloud_services", ["aws", "azure", "gcp", "cloud", "hosting"]),
    ("marketing", ["marketing", "campaign", "ads", "google ads"]),
    ("legal", ["juridisch", "legal", "advocaat", "notary"]),
    ("training", ["training", "course", "cursus"]),
    ("office", ["office", "kantoor", "verzekering", "huur"]),
]


def _classify_category(description: str) -> str:
    text = (description or "").lower()
    for category, keywords in _CATEGORY_KEYWORDS:
        if any(kw in text for kw in keywords):
            return category
    return "other"


# -----------------------------------------------------------------------
# Country normalisation
# -----------------------------------------------------------------------

_COUNTRY_ALIASES = {
    "nl": "NL", "nederland": "NL", "netherlands": "NL", "the netherlands": "NL",
    "belgium": "BE", "belgië": "BE", "belgique": "BE", "be": "BE",
    "germany": "DE", "duitsland": "DE", "deutschland": "DE", "de": "DE",
    "france": "FR", "frankrijk": "FR", "fr": "FR",
}


def _country_iso2(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    key = value.strip().lower()
    return _COUNTRY_ALIASES.get(key, value.strip().upper()[:2] if value else None)
