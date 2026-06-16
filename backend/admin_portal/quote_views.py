# ============================================================
# ADMIN PORTAL - QUOTE EMAIL VIEW
# Stateless endpoint that emails a branded price quote (offerte)
# to a customer. No model, no persistence.
# ============================================================

import logging

from django.conf import settings
from django.utils.html import strip_tags
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .permissions import IsAdminOrSuperAdmin

logger = logging.getLogger(__name__)


def _format_eur(value):
    """Format a number as EUR with no decimals, e.g. '€ 490'.
    Returns '' for None / non-numeric input."""
    if value is None or value == "":
        return ""
    try:
        amount = round(float(value))
    except (TypeError, ValueError):
        return ""
    # Thousands separator with a dot (NL style): € 8.830
    return "€ " + f"{amount:,.0f}".replace(",", ".")


class SendQuoteView(APIView):
    """
    POST /api/v1/admin/quotes/send/ — render a premium HTML quote (offerte)
    email and send it to a customer. Stateless: nothing is persisted.
    Admin/superadmin only.

    body: {
        customer_email, customer_name, company_name,
        line_items: [{sku, name, qty, unit, unit_price, line_total, period}],
        totals: {monthly_recurring, one_time_setup, year_one_total, per_user_year},
        notes
    }
    response: 200 {"sent": true, "to": "<email>"}
              400 {"sent": false, "error": "..."}  (missing customer_email)
              500-safe {"sent": false, "error": "..."}  (send failure)
    """
    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]

    # Human-readable labels for the `unit` field shown in the qty column.
    UNIT_LABELS = {
        "per_user_month": "gebr./mnd",
        "per_user_year": "gebr./jaar",
        "per_month": "/mnd",
        "per_year": "/jaar",
        "one_time": "eenmalig",
    }

    def post(self, request):
        data = request.data or {}

        customer_email = (data.get("customer_email") or "").strip()
        if not customer_email:
            return Response(
                {"sent": False, "error": "customer_email is verplicht."},
                status=400,
            )

        customer_name = (data.get("customer_name") or "").strip()
        company_name = (data.get("company_name") or "").strip()
        notes = (data.get("notes") or "").strip()

        # Build formatted line items (currency formatted in Python).
        line_items = []
        for raw in (data.get("line_items") or []):
            if not isinstance(raw, dict):
                continue
            unit = raw.get("unit") or ""
            line_items.append({
                "sku": raw.get("sku") or "",
                "name": raw.get("name") or "",
                "qty": raw.get("qty"),
                "unit_label": self.UNIT_LABELS.get(unit, ""),
                "unit_price_fmt": _format_eur(raw.get("unit_price")),
                "line_total_fmt": _format_eur(raw.get("line_total")),
                "period": raw.get("period") or "",
            })

        raw_totals = data.get("totals") or {}
        totals = {
            "monthly_recurring_fmt": _format_eur(raw_totals.get("monthly_recurring")),
            "one_time_setup_fmt": _format_eur(raw_totals.get("one_time_setup")),
            "year_one_total_fmt": _format_eur(raw_totals.get("year_one_total")),
            "per_user_year_fmt": _format_eur(raw_totals.get("per_user_year")),
        }

        try:
            from django.core.mail import EmailMultiAlternatives
            from django.template.loader import render_to_string

            html = render_to_string("emails/quote.html", {
                "customer_name": customer_name,
                "company_name": company_name,
                "line_items": line_items,
                "totals": totals,
                "notes": notes,
            })

            subject = "Je offerte voor ProjeXtPal"
            if company_name:
                subject = f"Je offerte voor ProjeXtPal — {company_name}"

            msg = EmailMultiAlternatives(
                subject=subject,
                body=strip_tags(html),
                from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@inclufy.com"),
                to=[customer_email],
            )
            msg.attach_alternative(html, "text/html")
            msg.send(fail_silently=False)
        except Exception as exc:
            logger.exception("Quote email failed for %s: %s", customer_email, exc)
            return Response({"sent": False, "error": str(exc)}, status=500)

        # Best-effort audit log (never blocks the response).
        try:
            from accounts.models import audit
            audit(
                request.user, "admin.quote_send",
                summary=f"Quote sent to {customer_email}"
                        + (f" ({company_name})" if company_name else ""),
                request=request,
            )
        except Exception:
            pass

        return Response({"sent": True, "to": customer_email}, status=200)
