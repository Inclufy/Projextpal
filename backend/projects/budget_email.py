"""Sprint 9 S9-01 — budget-overschrijding e-mails.

Hook: a ``TimeEntry`` is saved and the cumulative actual hours for that
``(project, user)`` now exceed the user's ``ProjectTeam.budgeted_hours``.
Deliver a short NL+EN email to:

  1. The project owner (``project.created_by``), and
  2. One admin of the project's company (first by id).

Non-blocking: build + dispatch the email on a daemon thread, swallow + log
on failure. The TimeEntry save MUST succeed even if SMTP wedges.

The post_save signal is registered via ``projects.apps.ProjectsConfig.ready``
so URL / app bootstrapping stays untouched.
"""
from __future__ import annotations

import logging
import threading
from decimal import Decimal

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.db.models import Sum
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import ProjectTeam, TimeEntry

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# i18n copy — NL + EN. Short, factual, no HTML template framework needed.
# ---------------------------------------------------------------------------

_SUBJECT = {
    "nl": "[ProjeXtPal] Budget-overschrijding op {project} door {user}",
    "en": "[ProjeXtPal] Budget exceeded on {project} by {user}",
}

_TEXT = {
    "nl": (
        "Hallo,\n\n"
        "{user} heeft op project '{project}' het begrote aantal uren "
        "overschreden.\n\n"
        "Begroting: {budget} uur\n"
        "Actueel:   {actual} uur\n"
        "Overschrijding: {pct}%\n\n"
        "Je kunt dit controleren op de Tijd & Budget-tab van het project.\n\n"
        "— ProjeXtPal\n"
    ),
    "en": (
        "Hello,\n\n"
        "{user} has exceeded the budgeted hours on project '{project}'.\n\n"
        "Budget:    {budget} hours\n"
        "Actual:    {actual} hours\n"
        "Overrun:   {pct}%\n\n"
        "You can review this on the project's Time & Budget tab.\n\n"
        "— ProjeXtPal\n"
    ),
}

_HTML = {
    "nl": (
        "<p>Hallo,</p>"
        "<p><strong>{user}</strong> heeft op project "
        "<strong>'{project}'</strong> het begrote aantal uren overschreden.</p>"
        "<ul>"
        "<li>Begroting: <strong>{budget}</strong> uur</li>"
        "<li>Actueel: <strong>{actual}</strong> uur</li>"
        "<li>Overschrijding: <strong>{pct}%</strong></li>"
        "</ul>"
        "<p>Je kunt dit controleren op de Tijd &amp; Budget-tab van het project.</p>"
        "<p>— ProjeXtPal</p>"
    ),
    "en": (
        "<p>Hello,</p>"
        "<p><strong>{user}</strong> has exceeded the budgeted hours on "
        "project <strong>'{project}'</strong>.</p>"
        "<ul>"
        "<li>Budget: <strong>{budget}</strong> hours</li>"
        "<li>Actual: <strong>{actual}</strong> hours</li>"
        "<li>Overrun: <strong>{pct}%</strong></li>"
        "</ul>"
        "<p>You can review this on the project's Time &amp; Budget tab.</p>"
        "<p>— ProjeXtPal</p>"
    ),
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _lang_for(user) -> str:
    """Pick NL vs EN per recipient.

    No per-user locale field exists today; fall back to the user's
    company.locale (set at tenant onboarding, defaults to 'en').
    """
    try:
        loc = (getattr(getattr(user, "company", None), "locale", "") or "").lower()
    except Exception:
        loc = ""
    return "nl" if loc.startswith("nl") else "en"


def _display_name(user) -> str:
    try:
        full = (user.get_full_name() or "").strip() if user else ""
    except Exception:
        full = ""
    return full or (getattr(user, "email", "") or "")


def _pick_company_admin(company):
    """Return one admin of the given company.

    Preference: a tenant admin (role='admin') with the lowest id. If none,
    returns None (we skip that recipient — superadmins already get the
    product-issues watchlist and don't need every budget overrun).
    """
    if company is None:
        return None
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        return (
            User.objects
            .filter(company=company, role="admin", is_active=True)
            .exclude(email="")
            .order_by("id")
            .first()
        )
    except Exception:
        return None


def _send_async(subject: str, text_body: str, html_body: str, to: list[str]) -> bool:
    """Build the EmailMultiAlternatives in the request thread, then send
    on a daemon thread so the TimeEntry save returns in ~1ms. Mirrors the
    pattern in ``product_issues/signals.py``."""
    if not to:
        return False
    try:
        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_body,
            from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "support@inclufy.com"),
            to=to,
            reply_to=["support@inclufy.com"],
        )
        msg.attach_alternative(html_body, "text/html")
    except Exception as exc:
        logger.warning(
            "Budget-overrun email construction failed (to=%s): %s", to, exc,
        )
        return False

    def _do_send():
        try:
            msg.send(fail_silently=False)
        except Exception as exc:
            logger.warning(
                "Budget-overrun email send failed in background (to=%s): %s",
                to, exc,
            )

    threading.Thread(
        target=_do_send, daemon=True, name="budget-overrun-email",
    ).start()
    return True


def _format_hours(h) -> str:
    """Format a Decimal / float as '12.5' (strip trailing .00)."""
    try:
        d = Decimal(str(h))
    except Exception:
        return str(h)
    # Prefer plain decimal — no scientific notation.
    txt = format(d.normalize(), "f")
    if "." in txt:
        txt = txt.rstrip("0").rstrip(".")
    return txt or "0"


def _compute_overrun(instance: TimeEntry):
    """Return a dict ``{budget, actual, pct}`` if this TimeEntry's save
    pushed cumulative hours past the user's budget on this project,
    otherwise ``None``. Mirrors ``_compute_budget_warning`` in the
    serializer so the email fires on the same condition as the UI banner.
    """
    project = getattr(instance, "project", None)
    user = getattr(instance, "user", None)
    if project is None or user is None:
        return None
    try:
        tm = ProjectTeam.objects.get(project=project, user=user)
    except ProjectTeam.DoesNotExist:
        return None
    if tm.budgeted_hours is None:
        return None
    total = (
        TimeEntry.objects
        .filter(project=project, user=user)
        .aggregate(total=Sum("hours"))["total"]
        or Decimal("0")
    )
    budget = tm.budgeted_hours
    if total <= budget:
        return None
    pct = (
        round(float(total) / float(budget) * 100.0, 2)
        if float(budget) > 0 else 100.0 + float(total)
    )
    return {"budget": budget, "actual": total, "pct": pct}


# ---------------------------------------------------------------------------
# Signal — fires when a TimeEntry is saved and cumulative hours > budget.
# ---------------------------------------------------------------------------

def _notify_budget_overrun(instance: TimeEntry) -> None:
    """Build + send the overrun email(s). Called from the post_save signal.

    One pair of mails per save-that-crosses-budget: the project owner and
    (if different) one admin of the company. Each recipient gets their
    own-language copy. Entirely non-blocking — SMTP runs on a daemon thread.
    """
    overrun = _compute_overrun(instance)
    if overrun is None:
        return

    project = instance.project
    user = instance.user
    owner = getattr(project, "created_by", None)
    admin = _pick_company_admin(getattr(project, "company", None))

    recipients = []
    seen = set()
    for u in (owner, admin):
        if not u:
            continue
        email = (getattr(u, "email", "") or "").strip()
        if not email or email.lower() in seen:
            continue
        seen.add(email.lower())
        recipients.append(u)

    if not recipients:
        return

    ctx = {
        "project": getattr(project, "name", "") or "",
        "user": _display_name(user),
        "budget": _format_hours(overrun["budget"]),
        "actual": _format_hours(overrun["actual"]),
        "pct": _format_hours(overrun["pct"]),
    }

    for recipient in recipients:
        lang = _lang_for(recipient)
        subject = _SUBJECT[lang].format(**ctx)
        text_body = _TEXT[lang].format(**ctx)
        html_body = _HTML[lang].format(**ctx)
        _send_async(subject, text_body, html_body, [recipient.email])


@receiver(post_save, sender=TimeEntry)
def time_entry_budget_overrun_email(sender, instance, created, raw=False, **kwargs):
    """Fires on every TimeEntry save. The non-blocking contract:

    * email computation errors are swallowed + logged
    * SMTP delivery is dispatched to a daemon thread
    * TimeEntry save ALWAYS succeeds, regardless of mail outcome
    """
    if raw:
        return
    try:
        _notify_budget_overrun(instance)
    except Exception as exc:
        logger.warning("Budget-overrun email handler failed: %s", exc)
