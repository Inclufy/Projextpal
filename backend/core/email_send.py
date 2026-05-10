"""
Branded email-send helpers for ProjeXtPal transactional flows.

Wraps `EmailMultiAlternatives` with the shared base template + i18n module so
callers can do a one-liner:

    from core.email_send import send_branded_email
    send_branded_email(
        template_key='verify_email',
        recipient='user@example.com',
        lang='nl',
        url='https://projextpal.com/verify-email/abc',
        name='Sami',
        expires_in_hours=24,
    )

Also exports plain-text fallback rendering so HTML-disabled clients see
something readable.
"""
from __future__ import annotations

import logging

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

from core.email_i18n import get_email_context

logger = logging.getLogger(__name__)


# Map every supported template_key → its HTML template path.
_TEMPLATE_PATHS = {
    "verify_email": "email/transactional/verify_email.html",
    "password_reset": "email/transactional/password_reset.html",
    "admin_invite": "email/transactional/admin_invite.html",
}


def _build_expires_text(ctx_i18n: dict, expires_in_hours: int | None) -> str:
    if not expires_in_hours:
        return ""
    if expires_in_hours < 1:
        # treat as minutes for sub-hour windows
        minutes = max(1, int(expires_in_hours * 60))
        tmpl = ctx_i18n.get("expires_in_hour", "")
        try:
            return tmpl.format(minutes=minutes)
        except (KeyError, IndexError):
            return ""
    tmpl = ctx_i18n.get("expires_in_hours", "")
    try:
        return tmpl.format(hours=expires_in_hours)
    except (KeyError, IndexError):
        return ""


def _build_plain_text(ctx: dict) -> str:
    """Compose a readable plain-text version of the HTML email."""
    i18n = ctx["i18n"]
    parts = [
        i18n.get("title", ""),
        "",
        i18n.get("greeting", ""),
        "",
        i18n.get("body", ""),
        "",
        i18n.get("cta", ""),
        ctx.get("url", ""),
        "",
        ctx.get("expires_text", ""),
        "",
        i18n.get("info", ""),
        "",
        "—",
        i18n.get("footer_tagline", ""),
        "support@inclufy.com · projextpal.com",
    ]
    return "\n".join(p for p in parts if p is not None)


def send_branded_email(
    template_key: str,
    recipient: str,
    lang: str | None = None,
    *,
    url: str = "",
    name: str = "",
    expires_in_hours: int | None = None,
    fail_silently: bool = False,
    **extra_format_kwargs,
) -> bool:
    """Render the chosen template + i18n strings and send via configured SMTP.

    Returns True on send, False on caught exception when fail_silently=True.
    Raises on send failure when fail_silently=False (default).
    """
    if template_key not in _TEMPLATE_PATHS:
        raise ValueError(f"Unknown email template_key: {template_key!r}")

    ctx = get_email_context(
        template_key,
        lang=lang,
        name=name or "",
        url=url,
        **extra_format_kwargs,
    )
    ctx["url"] = url
    ctx["expires_text"] = _build_expires_text(ctx["i18n"], expires_in_hours)

    html_body = render_to_string(_TEMPLATE_PATHS[template_key], ctx)
    text_body = _build_plain_text(ctx)
    subject = ctx["subject"] or "ProjeXtPal"

    msg = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None),
        to=[recipient],
    )
    msg.attach_alternative(html_body, "text/html")

    try:
        msg.send(fail_silently=False)
        return True
    except Exception:
        logger.exception(
            "Branded email send failed (template=%s, to=%s, lang=%s)",
            template_key, recipient, lang,
        )
        if fail_silently:
            return False
        raise
