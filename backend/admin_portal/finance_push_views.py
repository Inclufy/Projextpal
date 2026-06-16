# ============================================================
# ADMIN PORTAL - FINANCE CROSS-APP PUSH VIEW
# Stateless endpoint that pushes a financial document (quote,
# invoice, order, receipt) to Inclufy Finance's inbound webhook.
# No model, no persistence — just dispatch and relay the result.
# ============================================================

import logging

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .permissions import IsAdminOrSuperAdmin
from finance.cross_app import dispatch_cross_app_event

logger = logging.getLogger(__name__)


class FinancePushView(APIView):
    """
    POST /api/v1/admin/finance/push/ — push a financial document to Inclufy
    Finance via the outbound cross-app dispatcher. Stateless: nothing is
    persisted on the ProjeXtPal side. Admin/superadmin only.

    body: {
        "doc_type": "quote" | "invoice" | "order" | "receipt",
        "document": { ...the contract payload (money in integer cents)... }
    }

    The document payload is passed through to Inclufy Finance unchanged.

    response: 200 {"ok": true, "status": <2xx>}            on success
              400 {"ok": false, "error": "..."}            invalid doc_type / not_configured
              502 {"ok": false, "error": "..."}            downstream / network failure
    """

    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]

    # doc_type → cross-app event name.
    DOC_TYPE_EVENTS = {
        "quote": "quote.created",
        "invoice": "invoice.created",
        "order": "order.created",
        "receipt": "receipt.created",
    }

    def post(self, request):
        data = request.data or {}

        doc_type = (data.get("doc_type") or "").strip()
        event = self.DOC_TYPE_EVENTS.get(doc_type)
        if not event:
            return Response(
                {
                    "ok": False,
                    "error": f"Invalid doc_type {doc_type!r}; expected one of "
                             f"{sorted(self.DOC_TYPE_EVENTS)}.",
                },
                status=400,
            )

        document = data.get("document")
        if not isinstance(document, dict):
            return Response(
                {"ok": False, "error": "document must be an object."},
                status=400,
            )

        result = dispatch_cross_app_event(
            event,
            document,
            idempotency_key=document.get("external_id"),
        )

        if result.get("ok"):
            return Response(result, status=200)

        # not_configured / bad request → 400; everything else (downstream
        # http_5xx, network errors) → 502 Bad Gateway.
        error = result.get("error", "")
        if error == "not_configured":
            return Response(result, status=400)
        return Response(result, status=502)
