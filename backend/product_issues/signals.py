"""Notification signals for ProductIssue lifecycle events.

Three events trigger emails:

1. **New issue submitted** → admin watchlist gets notified.
2. **Status changes** (triaging → in_review → in_progress → etc.) → reporter
   gets a "we're on it" update; admin also gets a progress ping.
3. **Issue resolved** → reporter gets a "your issue is fixed" closing email.

All emails go via Django's email backend (configured to Resend SMTP) so they
benefit from the same DKIM/SPF/DMARC alignment as the rest of the system.

Failure modes are non-fatal: if SMTP throws, we log a warning and let the
caller continue — the issue update itself is independent of notification
delivery.

Admin watchlist
---------------
The list of admins that get pinged is controlled by the env var
`PRODUCT_ISSUE_ADMIN_NOTIFY_EMAILS` (comma-separated). If unset, falls back
to `DEFAULT_FROM_EMAIL` so at least someone sees the alert. To add or remove
admins, edit the env var and restart the backend container.
"""
from __future__ import annotations

import logging

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone

from .models import ProductIssue

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _admin_emails() -> list[str]:
    """Return the list of admin email addresses to notify on new + progress.

    Reads `PRODUCT_ISSUE_ADMIN_NOTIFY_EMAILS` env var (comma-separated).
    Falls back to DEFAULT_FROM_EMAIL or 'sami@inclufy.com'.
    """
    raw = getattr(settings, "PRODUCT_ISSUE_ADMIN_NOTIFY_EMAILS", "") or ""
    emails = [e.strip() for e in raw.split(",") if e.strip()]
    if not emails:
        fallback = getattr(settings, "DEFAULT_FROM_EMAIL", "") or "sami@inclufy.com"
        # If DEFAULT_FROM_EMAIL is a display-name form ("ProjeXtPal <noreply@inclufy.com>"),
        # extract the bare email. Otherwise route admin notifications to sami@.
        if "<" in fallback and ">" in fallback:
            emails = ["sami@inclufy.com"]
        else:
            emails = [fallback]
    return emails


def _issue_url(issue: ProductIssue) -> str:
    """Absolute URL to the issue page (admin portal)."""
    base = getattr(settings, "FRONTEND_URL", "https://projextpal.com").rstrip("/")
    return f"{base}/admin/issues/{issue.id}"


def _send_email_safe(
    *,
    subject: str,
    text_body: str,
    html_body: str,
    to: list[str],
    reply_to: list[str] | None = None,
) -> bool:
    """Send a transactional email; never raise — caller continues regardless."""
    if not to:
        return False
    try:
        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_body,
            from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "support@inclufy.com"),
            to=to,
            reply_to=reply_to or ["support@inclufy.com"],
        )
        msg.attach_alternative(html_body, "text/html")
        msg.send(fail_silently=False)
        return True
    except Exception as exc:
        logger.warning(
            "ProductIssue notification email failed (to=%s, subject=%r): %s",
            to, subject, exc,
        )
        return False


def _wrap_html(title: str, body_html: str, cta_url: str, cta_label: str) -> str:
    """Wrap notification body in ProjeXtPal branded HTML template."""
    return f"""<!DOCTYPE html>
<html><body style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
  <div style="background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 28px 24px; border-radius: 12px 12px 0 0;">
    <h1 style="margin: 0; font-size: 22px;">{title}</h1>
  </div>
  <div style="background: #fafafa; padding: 32px 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    {body_html}
    <div style="text-align: center; margin: 28px 0;">
      <a href="{cta_url}" style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 14px;">{cta_label}</a>
    </div>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
    <p style="font-size: 12px; color: #9ca3af; margin: 0;">
      Reageren? Beantwoord deze mail — komt aan bij support@inclufy.com.<br>
      ProjeXtPal · Inclufy
    </p>
  </div>
</body></html>"""


# ---------------------------------------------------------------------------
# Track status transitions via pre_save (need the OLD value to compare)
# ---------------------------------------------------------------------------

@receiver(pre_save, sender=ProductIssue)
def _capture_old_status(sender, instance: ProductIssue, **kwargs):
    """Stash the previous status on the instance so post_save can compare."""
    if instance.pk:
        try:
            old = ProductIssue.objects.only("status").get(pk=instance.pk)
            instance._old_status = old.status
        except ProductIssue.DoesNotExist:
            instance._old_status = None
    else:
        instance._old_status = None


# ---------------------------------------------------------------------------
# Main dispatch
# ---------------------------------------------------------------------------

@receiver(post_save, sender=ProductIssue)
def notify_on_product_issue_change(sender, instance: ProductIssue, created, **kwargs):
    """Route ProductIssue lifecycle events to the right notification emails."""
    issue = instance
    issue_url = _issue_url(issue)
    old_status = getattr(issue, "_old_status", None)

    # ── 1. NEW issue submitted ────────────────────────────────────────────
    if created:
        _notify_admins_new_issue(issue, issue_url)
        return

    # ── 2. Status changed? ────────────────────────────────────────────────
    if old_status == issue.status:
        return  # nothing of consequence changed

    # 2a. RESOLVED → notify reporter (closing email)
    if issue.status == "resolved":
        _notify_reporter_resolved(issue, issue_url)
        _notify_admins_progress(issue, issue_url, "Resolved")
        return

    # 2b. Status progressed (new → triaging → in_review → in_progress, etc.)
    # Notify reporter "we're on it" + admins for visibility.
    _notify_reporter_progress(issue, issue_url, old_status)
    _notify_admins_progress(issue, issue_url, issue.get_status_display())


# ---------------------------------------------------------------------------
# Individual email builders
# ---------------------------------------------------------------------------

def _notify_admins_new_issue(issue: ProductIssue, issue_url: str) -> None:
    subject = f"[ProjeXtPal] Nieuwe issue: {issue.title[:80]}"
    reporter_name = issue.reporter.email if issue.reporter else "(anonymous / system)"
    company_name = issue.company.name if issue.company_id else "(no company)"

    text = (
        f"Nieuwe ProductIssue gemeld op ProjeXtPal.\n\n"
        f"Titel: {issue.title}\n"
        f"Reporter: {reporter_name}\n"
        f"Company: {company_name}\n"
        f"Source: {issue.get_source_display()}\n"
        f"Category: {issue.get_category_display()}\n\n"
        f"Bekijk: {issue_url}\n"
    )
    html_body = f"""
      <p style="font-size: 15px;">Een nieuwe ProductIssue is gemeld:</p>
      <table style="width:100%; font-size:14px; border-collapse:collapse; margin: 16px 0;">
        <tr><td style="padding:6px 0; color:#6b7280; width:120px;">Titel</td><td style="padding:6px 0;"><strong>{issue.title}</strong></td></tr>
        <tr><td style="padding:6px 0; color:#6b7280;">Reporter</td><td style="padding:6px 0;">{reporter_name}</td></tr>
        <tr><td style="padding:6px 0; color:#6b7280;">Company</td><td style="padding:6px 0;">{company_name}</td></tr>
        <tr><td style="padding:6px 0; color:#6b7280;">Source</td><td style="padding:6px 0;">{issue.get_source_display()}</td></tr>
        <tr><td style="padding:6px 0; color:#6b7280;">Category</td><td style="padding:6px 0;">{issue.get_category_display()}</td></tr>
      </table>
    """
    html = _wrap_html("Nieuwe ProductIssue", html_body, issue_url, "Bekijk issue →")

    _send_email_safe(
        subject=subject, text_body=text, html_body=html,
        to=_admin_emails(),
    )


def _notify_reporter_progress(issue: ProductIssue, issue_url: str, old_status: str | None) -> None:
    if not issue.reporter or not issue.reporter.email:
        return
    new_status = issue.get_status_display()
    subject = f"[ProjeXtPal] Update over jouw issue: {issue.title[:60]}"
    text = (
        f"Hallo {issue.reporter.first_name or 'daar'},\n\n"
        f"Je gemelde issue '{issue.title}' is nu in status: {new_status}.\n"
        f"(was: {old_status})\n\n"
        f"Volg de voortgang: {issue_url}\n\n"
        f"Met vriendelijke groet,\nProjeXtPal support"
    )
    html_body = f"""
      <p style="font-size: 15px;">Hallo {issue.reporter.first_name or 'daar'},</p>
      <p style="font-size: 15px; line-height: 1.6;">
        Je gemelde issue <strong>"{issue.title}"</strong> is nu in status:
        <span style="background:#ede9fe; color:#6d28d9; padding:2px 8px; border-radius:4px; font-weight:600;">{new_status}</span>
      </p>
      <p style="font-size: 14px; color: #6b7280;">
        Eerdere status: <em>{old_status}</em>
      </p>
    """
    html = _wrap_html("Update over jouw issue", html_body, issue_url, "Volg voortgang →")
    _send_email_safe(
        subject=subject, text_body=text, html_body=html,
        to=[issue.reporter.email],
    )


def _notify_reporter_resolved(issue: ProductIssue, issue_url: str) -> None:
    if not issue.reporter or not issue.reporter.email:
        return
    subject = f"[ProjeXtPal] Opgelost: {issue.title[:70]}"
    resolution = issue.resolution_summary or "(geen samenvatting beschikbaar — vraag support voor details)"

    text = (
        f"Hallo {issue.reporter.first_name or 'daar'},\n\n"
        f"Goed nieuws — jouw issue '{issue.title}' is opgelost.\n\n"
        f"Resolutie:\n{resolution}\n\n"
        f"Bekijk het ticket: {issue_url}\n\n"
        f"Werkt het niet zoals verwacht? Beantwoord deze mail of meld een nieuwe issue.\n\n"
        f"Met vriendelijke groet,\nProjeXtPal support"
    )
    html_body = f"""
      <p style="font-size: 15px;">Hallo {issue.reporter.first_name or 'daar'},</p>
      <p style="font-size: 15px; line-height: 1.6;">
        Goed nieuws — jouw gemelde issue is <strong style="color:#059669;">opgelost</strong>:
      </p>
      <p style="font-size: 15px; background: #f0fdf4; border-left: 3px solid #10b981; padding: 12px 16px; margin: 16px 0;">
        <strong>"{issue.title}"</strong>
      </p>
      <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
        <strong>Resolutie:</strong><br>
        {resolution}
      </p>
      <p style="font-size: 13px; color: #6b7280; margin-top: 20px;">
        Werkt het niet zoals verwacht? Beantwoord deze mail of meld een nieuwe issue.
      </p>
    """
    html = _wrap_html("Issue opgelost", html_body, issue_url, "Bekijk ticket →")
    _send_email_safe(
        subject=subject, text_body=text, html_body=html,
        to=[issue.reporter.email],
    )


def _notify_admins_progress(issue: ProductIssue, issue_url: str, new_status_display: str) -> None:
    subject = f"[ProjeXtPal] Issue → {new_status_display}: {issue.title[:60]}"
    text = (
        f"Issue status gewijzigd.\n\n"
        f"Titel: {issue.title}\n"
        f"Status: {new_status_display}\n"
        f"Reporter: {issue.reporter.email if issue.reporter else '(anonymous)'}\n\n"
        f"Bekijk: {issue_url}\n"
    )
    html_body = f"""
      <p style="font-size: 15px;">Issue voortgang:</p>
      <table style="width:100%; font-size:14px; border-collapse:collapse; margin: 12px 0;">
        <tr><td style="padding:5px 0; color:#6b7280; width:100px;">Titel</td><td><strong>{issue.title}</strong></td></tr>
        <tr><td style="padding:5px 0; color:#6b7280;">Status</td><td><span style="background:#ede9fe; color:#6d28d9; padding:2px 8px; border-radius:4px; font-weight:600;">{new_status_display}</span></td></tr>
        <tr><td style="padding:5px 0; color:#6b7280;">Reporter</td><td>{issue.reporter.email if issue.reporter else '(anonymous)'}</td></tr>
      </table>
    """
    html = _wrap_html("Issue voortgang", html_body, issue_url, "Bekijk issue →")
    _send_email_safe(
        subject=subject, text_body=text, html_body=html,
        to=_admin_emails(),
    )
