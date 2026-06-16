"""Outbound cross-app financial-document dispatcher.

ProjeXtPal → Inclufy Finance. We push documents (quotes, invoices, orders,
receipts) to Inclufy Finance's generic inbound webhook receiver.

This is the OUTBOUND counterpart to the INBOUND receiver in
``finance/sync_views.py`` (``inclufy_finance_webhook_receive`` /
``_verify_signature``). The HMAC signing here MIRRORS the verification there:
HMAC-SHA256 over the *raw* request body (the exact bytes we POST), hex digest,
shared-secret key. The receiving side recomputes the same digest over the bytes
it receives, so we MUST sign and send the identical byte string — hence we
serialise once to a compact JSON string and reuse that string for both the
signature and the request body.

Settings (read via getattr — NEVER hardcode secrets):
- FINANCE_CROSS_APP_URL    — full URL of the inbound receiver, e.g.
  https://nruqfegrngpzoigflexn.supabase.co/functions/v1/cross-app-webhook-receive
- FINANCE_CROSS_APP_SECRET — shared HMAC secret / webhook token.
- FINANCE_ORG_ID           — optional organization id stamped on the envelope.

If URL or secret is missing we degrade gracefully (return ``not_configured``)
rather than raising, so callers can fire-and-forget without guarding.
"""
import hashlib
import hmac
import json
import uuid
from datetime import timezone as dt_timezone

import requests
from django.conf import settings
from django.utils import timezone


def _hmac_sha256_hex(secret: str, raw_body: bytes) -> str:
    """HMAC-SHA256 hex digest over raw bytes — same convention as the inbound
    verify in ``finance/sync_views.py`` (``hmac.new(secret.encode(), body,
    hashlib.sha256).hexdigest()``)."""
    return hmac.new(secret.encode(), raw_body, hashlib.sha256).hexdigest()


def dispatch_cross_app_event(
    event: str,
    payload: dict,
    *,
    idempotency_key: str | None = None,
) -> dict:
    """Sign and POST a single cross-app event to Inclufy Finance.

    Args:
        event: event name, e.g. "quote.created", "invoice.created".
        payload: the document contract payload (passed through as-is).
        idempotency_key: optional caller-supplied dedupe key; if omitted a
            random uuid4 is used.

    Returns a plain dict, never raises:
        {"ok": True, "status": <2xx code>}                  on success
        {"ok": False, "error": "not_configured"}            URL/secret missing
        {"ok": False, "error": "http_<code>", "status": n}  non-2xx response
        {"ok": False, "error": "<exception str>"}           network/other error
    """
    url = getattr(settings, "FINANCE_CROSS_APP_URL", "") or ""
    secret = getattr(settings, "FINANCE_CROSS_APP_SECRET", "") or ""
    org_id = getattr(settings, "FINANCE_ORG_ID", "") or ""

    if not url or not secret:
        return {"ok": False, "error": "not_configured"}

    envelope = {
        "event": event,
        "occurred_at": timezone.now().astimezone(dt_timezone.utc).isoformat(),
        "organization_id": org_id,
        "delivery_id": str(uuid.uuid4()),
        "idempotency_key": idempotency_key or str(uuid.uuid4()),
        "payload": payload,
    }

    # Serialise ONCE to a compact JSON string. This exact string is what gets
    # signed AND what gets sent as the body — the raw-body discipline the
    # inbound verifier relies on.
    raw_body = json.dumps(envelope, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    signature = _hmac_sha256_hex(secret, raw_body)

    headers = {
        "Content-Type": "application/json",
        "X-Inclufy-Webhook-Token": secret,
        "X-Inclufy-Signature": signature,
        "X-Inclufy-Event": event,
        "X-Inclufy-Source": "projextpal",
    }

    try:
        resp = requests.post(url, data=raw_body, headers=headers, timeout=20)
    except Exception as exc:  # network error, DNS, timeout, etc.
        return {"ok": False, "error": str(exc)}

    if 200 <= resp.status_code < 300:
        return {"ok": True, "status": resp.status_code}
    return {"ok": False, "error": f"http_{resp.status_code}", "status": resp.status_code}
