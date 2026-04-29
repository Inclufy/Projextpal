"""Finance views — vendors, invoices, line items, payments, cost summary, import."""
import csv
import io
from datetime import datetime
from decimal import Decimal, InvalidOperation

from django.db import transaction
from django.db.models import Q, Sum, Count
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Invoice, InvoiceLineItem, InvoicePayment, Vendor
from .serializers import (
    InvoiceCreateUpdateSerializer,
    InvoiceDetailSerializer,
    InvoiceLineItemSerializer,
    InvoiceListSerializer,
    InvoicePaymentSerializer,
    VendorListSerializer,
    VendorSerializer,
)

# Statuses considered as "real cost incurred"
INVOICED_STATUSES = ("received", "approved", "paid")
NON_CANCELLED_STATUSES = ("draft", "received", "approved", "paid", "disputed")


def _user_company(user):
    return getattr(user, "company", None)


def _is_superadmin(user):
    return getattr(user, "role", "") == "superadmin"


# -------------------- Vendor --------------------

class VendorViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Vendor.objects.all()

    def get_serializer_class(self):
        if self.action == "list":
            return VendorListSerializer
        return VendorSerializer

    def get_queryset(self):
        qs = Vendor.objects.all()
        user = self.request.user
        if not _is_superadmin(user):
            company = _user_company(user)
            qs = qs.filter(company=company) if company else qs.none()

        q = self.request.query_params.get("search") or self.request.query_params.get("q")
        if q:
            qs = qs.filter(
                Q(name__icontains=q)
                | Q(vendor_code__icontains=q)
                | Q(vat_id__icontains=q)
            )
        active = self.request.query_params.get("is_active")
        if active is not None:
            qs = qs.filter(is_active=str(active).lower() in ("1", "true", "yes"))
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(company=_user_company(user), created_by=user)


# -------------------- Invoice --------------------

class InvoiceViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Invoice.objects.all()

    def get_serializer_class(self):
        if self.action == "list":
            return InvoiceListSerializer
        if self.action in ("create", "update", "partial_update"):
            return InvoiceCreateUpdateSerializer
        return InvoiceDetailSerializer

    def get_queryset(self):
        qs = Invoice.objects.all().select_related("vendor", "project", "program")
        user = self.request.user
        if not _is_superadmin(user):
            company = _user_company(user)
            qs = qs.filter(company=company) if company else qs.none()

        params = self.request.query_params
        if params.get("vendor"):
            qs = qs.filter(vendor_id=params["vendor"])
        if params.get("project"):
            qs = qs.filter(project_id=params["project"])
        if params.get("program"):
            qs = qs.filter(program_id=params["program"])
        if params.get("status"):
            qs = qs.filter(status=params["status"].lower())
        if params.get("from_date"):
            qs = qs.filter(issue_date__gte=params["from_date"])
        if params.get("to_date"):
            qs = qs.filter(issue_date__lte=params["to_date"])
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(company=_user_company(user), submitted_by=user)

    @action(detail=True, methods=["post"], url_path="mark_paid")
    def mark_paid(self, request, pk=None):
        invoice = self.get_object()
        amount = request.data.get("amount")
        paid_at = request.data.get("paid_at") or timezone.now().date()
        method = request.data.get("method", "")
        reference = request.data.get("reference", "")
        try:
            amount_dec = Decimal(str(amount)) if amount is not None else (
                Decimal(invoice.total_amount) - Decimal(invoice.paid_amount)
            )
        except (InvalidOperation, TypeError):
            return Response({"detail": "Invalid amount."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            payment = InvoicePayment.objects.create(
                invoice=invoice,
                paid_at=paid_at,
                amount=amount_dec,
                method=method,
                reference=reference,
                recorded_by=request.user,
            )
            invoice.paid_amount = (Decimal(invoice.paid_amount) + amount_dec)
            if invoice.paid_amount >= invoice.total_amount:
                invoice.status = "paid"
                invoice.paid_at = paid_at
            invoice.save()

        return Response(
            {
                "payment": InvoicePaymentSerializer(payment).data,
                "invoice": InvoiceDetailSerializer(invoice).data,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"], url_path="approve")
    def approve(self, request, pk=None):
        invoice = self.get_object()
        invoice.status = "approved"
        invoice.approved_by = request.user
        invoice.approved_at = timezone.now()
        invoice.save(update_fields=["status", "approved_by", "approved_at", "updated_at"])
        return Response(InvoiceDetailSerializer(invoice).data)

    # -------------------- Import --------------------

    @action(detail=False, methods=["post"], url_path="import")
    def import_invoices(self, request):
        """Bulk import invoices from financial admin (JSON or CSV)."""
        user = request.user
        company = _user_company(user)
        if not company and not _is_superadmin(user):
            return Response({"detail": "User has no company."}, status=400)

        source_default = "import_api"
        invoices_payload = []
        content_type = request.content_type or ""

        if "csv" in content_type.lower():
            source_default = "import_csv"
            raw = request.body.decode("utf-8") if isinstance(request.body, bytes) else request.body
            reader = csv.DictReader(io.StringIO(raw))
            invoices_payload = [dict(r) for r in reader]
            payload_source = source_default
        else:
            data = request.data if isinstance(request.data, dict) else {}
            payload_source = data.get("source") or source_default
            invoices_payload = data.get("invoices") or []

        results = []
        errors = []
        created_count = updated_count = skipped_count = 0

        for idx, item in enumerate(invoices_payload):
            try:
                with transaction.atomic():
                    res = self._import_one(item, company, user, payload_source)
                results.append(res)
                if res["status"] == "created":
                    created_count += 1
                elif res["status"] == "updated":
                    updated_count += 1
                else:
                    skipped_count += 1
            except Exception as exc:  # noqa: BLE001
                skipped_count += 1
                errors.append({"index": idx, "invoice_number": item.get("invoice_number"), "error": str(exc)})
                results.append({
                    "invoice_number": item.get("invoice_number"),
                    "status": "skipped",
                    "invoice_id": None,
                    "error": str(exc),
                })

        return Response(
            {
                "created": created_count,
                "updated": updated_count,
                "skipped": skipped_count,
                "errors": errors,
                "results": results,
            },
            status=status.HTTP_200_OK,
        )

    def _import_one(self, item, company, user, source):
        """Process one invoice payload — atomic per call. Returns result dict."""
        invoice_number = (item.get("invoice_number") or "").strip()
        issue_date = item.get("issue_date")
        total_amount = item.get("total_amount")
        vendor_code = (item.get("vendor_code") or "").strip()
        vendor_name = (item.get("vendor_name") or "").strip()
        vat_id = (item.get("vat_id") or "").strip()

        if not invoice_number:
            raise ValueError("invoice_number is required")
        if not issue_date:
            raise ValueError("issue_date is required")
        if total_amount in (None, ""):
            raise ValueError("total_amount is required")
        if not (vendor_code or vendor_name):
            raise ValueError("vendor_code or vendor_name is required")

        # Match / create vendor
        vendor = None
        if vendor_code:
            vendor = Vendor.objects.filter(company=company, vendor_code=vendor_code).first()
        if not vendor and vat_id:
            vendor = Vendor.objects.filter(company=company, vat_id=vat_id).first()
        if not vendor:
            vendor = Vendor.objects.create(
                company=company,
                name=vendor_name or vendor_code or "Unknown vendor",
                vendor_code=vendor_code,
                vat_id=vat_id,
                created_by=user,
            )

        # Match project / program by code (best-effort, optional)
        project = None
        program = None
        project_code = (item.get("project_code") or "").strip()
        program_code = (item.get("program_code") or "").strip()
        if project_code:
            from projects.models import Project
            project = Project.objects.filter(company=company, project_code=project_code).first()
        if program_code:
            from programs.models import Program
            program = Program.objects.filter(company=company, program_code=program_code).first()

        external_id = (item.get("external_id") or "").strip()

        # Idempotency: lookup existing
        existing = None
        if external_id:
            existing = Invoice.objects.filter(company=company, external_id=external_id).first()
        if not existing:
            existing = Invoice.objects.filter(vendor=vendor, invoice_number=invoice_number).first()

        # Decimal-coerce amounts
        def _dec(v, default="0"):
            if v in (None, ""):
                return Decimal(default)
            try:
                return Decimal(str(v))
            except (InvalidOperation, TypeError):
                return Decimal(default)

        common_fields = {
            "company": company,
            "vendor": vendor,
            "project": project,
            "program": program,
            "invoice_number": invoice_number,
            "project_code": project_code,
            "program_code": program_code,
            "purchase_order": (item.get("purchase_order") or "")[:64],
            "external_id": external_id,
            "issue_date": issue_date,
            "due_date": item.get("due_date") or None,
            "currency": (item.get("currency") or "EUR")[:3],
            "amount_excl_vat": _dec(item.get("amount_excl_vat")),
            "vat_rate": _dec(item.get("vat_rate"), "21"),
            "vat_amount": _dec(item.get("vat_amount")),
            "total_amount": _dec(total_amount),
            "file_url": item.get("file_url") or "",
            "source": source,
        }

        if existing:
            for k, v in common_fields.items():
                # Don't overwrite project/program with None if they were set manually.
                if k in ("project", "program") and v is None and getattr(existing, k):
                    continue
                setattr(existing, k, v)
            existing.save()
            invoice = existing
            action_taken = "updated"
        else:
            invoice = Invoice.objects.create(submitted_by=user, **common_fields)
            action_taken = "created"

        # Replace line items if provided
        line_items = item.get("line_items") or []
        if line_items:
            invoice.line_items.all().delete()
            for li in line_items:
                InvoiceLineItem.objects.create(
                    invoice=invoice,
                    description=(li.get("description") or "")[:512],
                    category=(li.get("category") or "other"),
                    quantity=_dec(li.get("quantity"), "1"),
                    unit_price=_dec(li.get("unit_price")),
                    vat_rate=_dec(li.get("vat_rate"), "21"),
                    cost_center=(li.get("cost_center") or "")[:64],
                )

        return {
            "invoice_number": invoice_number,
            "status": action_taken,
            "invoice_id": invoice.id,
        }


# -------------------- Line items / payments --------------------

class InvoiceLineItemViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = InvoiceLineItemSerializer
    queryset = InvoiceLineItem.objects.all()

    def get_queryset(self):
        qs = InvoiceLineItem.objects.select_related("invoice", "invoice__vendor")
        user = self.request.user
        if not _is_superadmin(user):
            company = _user_company(user)
            qs = qs.filter(invoice__company=company) if company else qs.none()
        invoice_id = self.request.query_params.get("invoice")
        if invoice_id:
            qs = qs.filter(invoice_id=invoice_id)
        return qs


class InvoicePaymentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = InvoicePaymentSerializer
    queryset = InvoicePayment.objects.all()

    def get_queryset(self):
        qs = InvoicePayment.objects.select_related("invoice")
        user = self.request.user
        if not _is_superadmin(user):
            company = _user_company(user)
            qs = qs.filter(invoice__company=company) if company else qs.none()
        invoice_id = self.request.query_params.get("invoice")
        if invoice_id:
            qs = qs.filter(invoice_id=invoice_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)


# -------------------- Cost summary --------------------

def _summarize_invoices(invoice_qs):
    invoiced = invoice_qs.filter(status__in=INVOICED_STATUSES).aggregate(s=Sum("total_amount"))["s"] or 0
    paid = invoice_qs.aggregate(s=Sum("paid_amount"))["s"] or 0
    outstanding_qs = invoice_qs.exclude(status="cancelled")
    outstanding = 0
    for inv in outstanding_qs:
        outstanding += float(inv.total_amount) - float(inv.paid_amount)
    return float(invoiced), float(paid), float(outstanding)


def _by_category_from_invoices(invoice_qs):
    """Aggregate line-item amounts per category for the given invoice queryset."""
    rows = (
        InvoiceLineItem.objects.filter(invoice__in=invoice_qs)
        .values("category")
        .annotate(amount=Sum("line_total"))
        .order_by("-amount")
    )
    return [{"category": r["category"], "amount": float(r["amount"] or 0)} for r in rows]


def _internal_cost_for_project(project):
    from projects.models import TimeEntry
    total = Decimal("0")
    for te in TimeEntry.objects.filter(project=project):
        total += (te.hours or 0) * (te.hourly_rate_snapshot or 0)
    return float(total)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def project_cost_summary(request, project_id):
    """Cost summary for a single project."""
    from projects.models import Project, BudgetItem

    user = request.user
    project = get_object_or_404(Project, pk=project_id)
    if not _is_superadmin(user):
        company = _user_company(user)
        if not company or project.company_id != company.id:
            return Response({"detail": "Not found."}, status=404)

    # Budget figures
    budget_total = float(project.budget or 0)
    spent_via_expenses = float(
        project.expenses.filter(status__in=("approved", "paid"))
        .aggregate(s=Sum("amount"))["s"] or 0
    )
    invoice_qs = Invoice.objects.filter(project=project)
    spent_via_invoices = float(
        invoice_qs.filter(status__in=INVOICED_STATUSES).aggregate(s=Sum("total_amount"))["s"] or 0
    )
    spent_via_time_entries = _internal_cost_for_project(project)
    total_spent = spent_via_expenses + spent_via_invoices + spent_via_time_entries
    remaining = budget_total - total_spent
    variance = budget_total - total_spent

    invoiced, paid, outstanding = _summarize_invoices(invoice_qs)

    return Response({
        "project_id": project.id,
        "project_name": project.name,
        "currency": project.currency,
        "budget": {
            "total": budget_total,
            "spent_via_expenses": spent_via_expenses,
            "spent_via_invoices": spent_via_invoices,
            "spent_via_time_entries": spent_via_time_entries,
            "total_spent": total_spent,
            "remaining": remaining,
            "variance": variance,
        },
        "internal_cost": spent_via_time_entries,
        "external_cost_invoiced": invoiced,
        "external_cost_paid": paid,
        "external_cost_outstanding": outstanding,
        "vendor_count": invoice_qs.values("vendor").distinct().count(),
        "invoice_count": invoice_qs.count(),
        "by_category": _by_category_from_invoices(invoice_qs),
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def program_cost_summary(request, program_id):
    """Cost summary rolled up across all linked projects + program-level invoices."""
    from programs.models import Program

    user = request.user
    program = get_object_or_404(Program, pk=program_id)
    if not _is_superadmin(user):
        company = _user_company(user)
        if not company or program.company_id != company.id:
            return Response({"detail": "Not found."}, status=404)

    linked_projects = list(program.projects.all())
    project_ids = [p.id for p in linked_projects]

    # Budgets/spend across projects
    budget_total = float(sum((p.budget or 0) for p in linked_projects)) + float(program.total_budget or 0)
    spent_via_expenses = 0.0
    spent_via_time_entries = 0.0
    for p in linked_projects:
        spent_via_expenses += float(
            p.expenses.filter(status__in=("approved", "paid")).aggregate(s=Sum("amount"))["s"] or 0
        )
        spent_via_time_entries += _internal_cost_for_project(p)

    invoice_qs = Invoice.objects.filter(
        Q(program=program) | Q(project_id__in=project_ids)
    ).distinct()
    spent_via_invoices = float(
        invoice_qs.filter(status__in=INVOICED_STATUSES).aggregate(s=Sum("total_amount"))["s"] or 0
    )

    total_spent = spent_via_expenses + spent_via_invoices + spent_via_time_entries
    remaining = budget_total - total_spent
    variance = budget_total - total_spent

    invoiced, paid, outstanding = _summarize_invoices(invoice_qs)

    return Response({
        "program_id": program.id,
        "program_name": program.name,
        "currency": program.currency,
        "budget": {
            "total": budget_total,
            "spent_via_expenses": spent_via_expenses,
            "spent_via_invoices": spent_via_invoices,
            "spent_via_time_entries": spent_via_time_entries,
            "total_spent": total_spent,
            "remaining": remaining,
            "variance": variance,
        },
        "internal_cost": spent_via_time_entries,
        "external_cost_invoiced": invoiced,
        "external_cost_paid": paid,
        "external_cost_outstanding": outstanding,
        "vendor_count": invoice_qs.values("vendor").distinct().count(),
        "invoice_count": invoice_qs.count(),
        "by_category": _by_category_from_invoices(invoice_qs),
        "linked_project_ids": project_ids,
    })
