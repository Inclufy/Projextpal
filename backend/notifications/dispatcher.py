"""
Central dispatcher: create a Notification row + (optionally) send a branded email.

Signal handlers should NOT call EmailMultiAlternatives or send_mail directly.
They call `dispatch(...)` which:
  1. Creates the Notification row (in-app bell sees it)
  2. Reads NotificationPreference to decide email/no-email
  3. Calls send_branded_email with i18n strings for the right kind
  4. Marks email_sent on the Notification

This keeps signal handlers thin and email-rendering testable in isolation.
"""
from __future__ import annotations

import logging
from typing import Any

from django.utils import timezone

from .models import Notification, NotificationPreference

logger = logging.getLogger(__name__)


def dispatch(
    *,
    recipient,
    kind: str,
    title: str,
    body: str = "",
    target_url: str = "",
    payload: dict[str, Any] | None = None,
    send_email: bool | None = None,
) -> Notification | None:
    """Create a Notification + maybe send a branded email.

    Returns the Notification (or None if recipient is invalid / dispatcher
    swallowed an exception — so signal callers don't crash on edge cases).
    """
    if recipient is None or not getattr(recipient, "pk", None):
        return None

    payload = payload or {}

    try:
        n = Notification.objects.create(
            recipient=recipient,
            kind=kind,
            title=title,
            body=body,
            target_url=target_url,
            payload=payload,
        )
    except Exception:
        logger.exception("Failed to create Notification (kind=%s, user=%s)", kind, recipient)
        return None

    # Decide whether to email
    if send_email is None:
        try:
            pref = NotificationPreference.get_or_default(recipient)
            send_email = pref.wants_email_for(kind)
        except Exception:
            logger.exception("Failed to read NotificationPreference for %s", recipient)
            send_email = False

    if not send_email:
        return n

    # Send branded email — late import to avoid circulars during app load
    try:
        from core.email_send import send_branded_email
        send_branded_email(
            template_key=f"notification_{kind}",
            recipient=recipient.email,
            lang=getattr(recipient, "language", None),
            url=target_url,
            name=recipient.first_name or recipient.email,
            title_override=title,
            body_override=body,
            fail_silently=True,
        )
        n.email_sent = True
        n.email_sent_at = timezone.now()
        n.save(update_fields=["email_sent", "email_sent_at"])
    except Exception:
        logger.exception("Branded notification email failed (kind=%s, user=%s)", kind, recipient)

    return n
