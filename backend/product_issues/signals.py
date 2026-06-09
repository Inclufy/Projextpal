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
import threading

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

    Merges two sources:
      1. `PRODUCT_ISSUE_ADMIN_NOTIFY_EMAILS` env var (comma-separated extras)
      2. DB query: every CustomUser with role='superadmin' OR is_superuser=True

    Superadmins are ALWAYS notified — they cannot opt out via env var
    omission. This guarantees the platform owner sees every new issue
    regardless of config drift.

    De-duplicated, lowercased, empties stripped.
    """
    emails: set[str] = set()

    # 1. Env-var extras (multi-admin list)
    raw = getattr(settings, "PRODUCT_ISSUE_ADMIN_NOTIFY_EMAILS", "") or ""
    for e in raw.split(","):
        e = e.strip().lower()
        if e:
            emails.add(e)

    # 2. Active superadmins from DB. Done lazily so the import order of
    # apps.ready() doesn't bite. Use the auth user model (settings.AUTH_USER_MODEL)
    # so this stays portable across the ecosystem.
    try:
        from django.contrib.auth import get_user_model
        from django.db.models import Q
        User = get_user_model()
        superadmin_emails = (
            User.objects.filter(
                Q(role="superadmin") | Q(is_superuser=True),
                is_active=True,
            )
            .exclude(email="")
            .values_list("email", flat=True)
        )
        for e in superadmin_emails:
            emails.add(str(e).strip().lower())
    except Exception as exc:
        logger.warning("ProductIssue notify: could not query superadmins: %s", exc)

    # 3. Final fallback — never send a notification into the void
    if not emails:
        emails.add("sami@inclufy.com")

    return sorted(emails)


def _superadmin_emails() -> list[str]:
    """Return ONLY the superadmin emails — used for escalation routing.

    Different from `_admin_emails()`: this is the subset that handles
    issues the AI triage agent cannot resolve. Routing to this list
    surfaces the "human attention required" pile clearly.
    """
    try:
        from django.contrib.auth import get_user_model
        from django.db.models import Q
        User = get_user_model()
        emails = (
            User.objects.filter(
                Q(role="superadmin") | Q(is_superuser=True),
                is_active=True,
            )
            .exclude(email="")
            .values_list("email", flat=True)
        )
        out = sorted({str(e).strip().lower() for e in emails if e})
        return out or ["sami@inclufy.com"]
    except Exception as exc:
        logger.warning("ProductIssue notify: superadmin lookup failed: %s", exc)
        return ["sami@inclufy.com"]


def _needs_human_escalation(issue: ProductIssue, old_status: str | None) -> tuple[bool, str]:
    """Decide whether this transition warrants a superadmin escalation email.

    Returns (should_escalate, reason). Reason is a one-line explanation
    shown in the escalation email so the human knows WHY it landed in
    their inbox.

    Triggers (any one):
      a) reproduction_result == 'cannot-reproduce' → agent gave up
      b) reproduction_result == 'needs-data' → agent needs production sample
      c) status changed to 'needs-info' → agent flagged human input required
      d) priority == 'P0' (blocker) — always escalate regardless of agent
      e) classification == 'security' or category == 'security' — never
         leave a security report sitting in the auto-triage queue

    We only fire on STATE CHANGE (not every save) to avoid spam — if
    status / priority / reproduction_result didn't change, return False.
    """
    # Only consider this a trigger if something MATERIAL changed
    changed = old_status != issue.status

    # a + b: reproduction failed at the agent level
    if issue.reproduction_result in ("cannot-reproduce", "needs-data") and changed:
        return True, (
            f"AI triage kon issue niet reproduceren (resultaat: "
            f"{issue.get_reproduction_result_display()})"
        )

    # c: agent flagged "needs more info from reporter"
    if issue.status == "needs-info" and old_status != "needs-info":
        return True, "AI triage heeft extra informatie nodig van de reporter"

    # d: blocker priority — always to superadmin
    if issue.priority == "P0" and changed:
        return True, "Priority = P0 (blocker) — automatische escalatie"

    # e: security flag — never leave in auto-queue
    if (issue.classification == "security" or issue.category == "security") and changed:
        return True, "Security-classificatie — escalatie naar superadmin verplicht"

    return False, ""


def _issue_url(issue: ProductIssue) -> str:
    """Absolute URL where the recipient can view the issue.

    NOTE: nginx routes `/admin/` to Django backend (port 8001), so we can NOT
    link to `/admin/issues/<id>` even though that's the conceptual admin path
    — the SPA never gets a chance. Use `/dashboard?issue=<id>` instead, which
    goes through the frontend nginx and lets React Router + AI Copilot
    Issues panel surface the relevant issue.
    """
    base = getattr(settings, "FRONTEND_URL", "https://projextpal.com").rstrip("/")
    return f"{base}/dashboard?issue={issue.id}"


def _detect_client(env) -> str:
    """Detect whether the issue was reported from a web or mobile client.

    Inspects `environment` JSONField for explicit signals first, then falls
    back to UA heuristics. Mirrors the same logic in the Supabase edge
    function (supabase/functions/product-issue-lifecycle/index.ts) so AMOS,
    Finance, and ProjeXtPal all produce subjects in the same `· Web` /
    `· Mobile` shape.

    Returns "Web", "Mobile", or "" if origin can't be determined.
    """
    if not env or not isinstance(env, dict):
        return ""

    # Explicit signals win
    client = str(env.get("client") or env.get("client_type") or "").lower()
    if client in ("mobile", "ios", "android"):
        return "Mobile"
    if client in ("web", "browser"):
        return "Web"

    # Platform field next
    platform = str(env.get("platform") or "").lower()
    if platform in ("ios", "android"):
        return "Mobile"

    # UA heuristic
    ua = str(env.get("user_agent") or env.get("userAgent") or "")
    import re
    if re.search(r"Expo|ReactNative|React Native|InclufyGO|com\.inclufy", ua, re.IGNORECASE):
        return "Mobile"
    if ua:
        return "Web"
    return ""


def _client_suffix(env) -> str:
    """Return ` · Mobile` / ` · Web` / `` for use in email subject prefixes."""
    c = _detect_client(env)
    return f" · {c}" if c else ""


def _app_prefix(issue: ProductIssue) -> str:
    """Return the bracketed app prefix for email subjects.

    e.g. `[ProjeXtPal · Mobile]` or `[ProjeXtPal · Web]` or `[ProjeXtPal]`
    when client origin can't be determined.
    """
    return f"[ProjeXtPal{_client_suffix(getattr(issue, 'environment', None))}]"


def _send_email_safe(
    *,
    subject: str,
    text_body: str,
    html_body: str,
    to: list[str],
    reply_to: list[str] | None = None,
) -> bool:
    """Build the email synchronously, then dispatch the SMTP TCP call to a
    daemon thread so the post_save signal returns to the request thread in
    ~1ms instead of blocking on Resend SMTP for up to EMAIL_TIMEOUT seconds
    (15s by default). See BUG-031.

    Returns True optimistically as soon as the thread is started. SMTP
    failures inside the thread are logged via logger.warning but never
    raised — consistent with the previous fail_silently=False + try/except
    behavior from the caller's point of view (errors don't propagate).

    Note: build the EmailMultiAlternatives object in the request thread
    so any DB lookups (DEFAULT_FROM_EMAIL etc.) happen with the request's
    DB connection. The thread only owns the network send.
    """
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
    except Exception as exc:
        # Construction error (rare). Log and bail BEFORE we spawn anything.
        logger.warning(
            "ProductIssue notification email construction failed (to=%s, subject=%r): %s",
            to, subject, exc,
        )
        return False

    def _do_send() -> None:
        try:
            msg.send(fail_silently=False)
        except Exception as exc:
            logger.warning(
                "ProductIssue notification email send failed in background "
                "(to=%s, subject=%r): %s",
                to, subject, exc,
            )

    threading.Thread(
        target=_do_send,
        daemon=True,
        name=f"product-issue-email-{subject[:40]}",
    ).start()
    return True


def _wrap_html(title: str, body_html: str, cta_url: str, cta_label: str) -> str:
    """Wrap notification body in ProjeXtPal branded HTML template."""
    return f"""<!DOCTYPE html>
<html><body style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
  <div style="background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 28px 24px; border-radius: 12px 12px 0 0;">
    <h1 style="margin: 0; font-size: 22px;">{title}</h1>
  </div>
  <div style="background: #fafafa; padding: 32px 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 20px;"><tr><td align="center" valign="middle" style="width:64px;height:64px;border-radius:18px;background:linear-gradient(135deg,#8B5CF6 0%,#EC4899 100%);box-shadow:0 8px 18px rgba(139,92,246,0.3);"><span style="display:inline-block;line-height:0;"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg></span></td></tr></table>
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
    """Route ProductIssue lifecycle events to the right notification emails.

    Callers (e.g. the auto-triage cron) can short-circuit the per-issue
    emails by setting `instance._suppress_email_on_save = True` BEFORE
    calling `.save()` — the batch will then send a single digest mail
    instead of one mail per row.
    """
    # Per-call email suppression (auto-triage cron uses this to avoid
    # an N-issue email storm; it sends ONE digest after the batch).
    if getattr(instance, "_suppress_email_on_save", False):
        return

    issue = instance
    issue_url = _issue_url(issue)
    old_status = getattr(issue, "_old_status", None)

    # ── 1. NEW issue submitted ────────────────────────────────────────────
    if created:
        _notify_admins_new_issue(issue, issue_url)
        # Brand-new P0 / security issues also escalate immediately
        should_escalate, reason = _needs_human_escalation(issue, old_status=None)
        if should_escalate:
            _notify_superadmin_escalation(issue, issue_url, reason)
        return

    # ── 2. Escalation to superadmin (if AI can't resolve) ─────────────────
    # Always check this BEFORE the status-change branch so we never miss
    # a transition that lands the issue in a "needs human" state.
    should_escalate, reason = _needs_human_escalation(issue, old_status)
    if should_escalate:
        _notify_superadmin_escalation(issue, issue_url, reason)
        # Don't return — we still want the normal status-change email
        # to go to reporter + admin watchlist below.

    # ── 3. Status changed? ────────────────────────────────────────────────
    if old_status == issue.status:
        return  # nothing of consequence changed

    # 3a. RESOLVED → notify reporter (closing email)
    if issue.status == "resolved":
        _notify_reporter_resolved(issue, issue_url)
        _notify_admins_progress(issue, issue_url, "Resolved")
        return

    # 3b. Status progressed (new → triaging → in_review → in_progress, etc.)
    # Notify reporter "we're on it" + admins for visibility.
    _notify_reporter_progress(issue, issue_url, old_status)
    _notify_admins_progress(issue, issue_url, issue.get_status_display())


# ---------------------------------------------------------------------------
# Individual email builders
# ---------------------------------------------------------------------------

def _notify_admins_new_issue(issue: ProductIssue, issue_url: str) -> None:
    subject = f"{_app_prefix(issue)} Nieuwe issue: {issue.title[:80]}"
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
    subject = f"{_app_prefix(issue)} Update over jouw issue: {issue.title[:60]}"
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
    subject = f"{_app_prefix(issue)} Opgelost: {issue.title[:70]}"
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


def _notify_superadmin_escalation(issue: ProductIssue, issue_url: str, reason: str) -> None:
    """Send an URGENT escalation email to all active superadmins.

    Fires when the AI triage agent cannot resolve the issue (cannot-reproduce,
    needs-data, needs-info) OR the priority is P0 (blocker) OR the
    classification is security. Distinct from the regular admin-progress
    email — uses a red accent + 'AI escalatie' subject prefix so it stands
    out in the inbox.
    """
    targets = _superadmin_emails()
    if not targets:
        return

    reporter_email = issue.reporter.email if issue.reporter else "(anonymous / system)"
    company_name = issue.company.name if issue.company_id else "(no company)"
    priority_display = issue.get_priority_display() if issue.priority else "(not set)"
    classification_display = (
        issue.get_classification_display() if issue.classification else "(not set)"
    )
    repro_display = (
        issue.get_reproduction_result_display()
        if issue.reproduction_result
        else "(not attempted)"
    )

    # Escalation prefix puts `— AI ESCALATIE` inside the brackets to match
    # the Supabase edge function format and keep the visual urgency.
    suffix = _client_suffix(getattr(issue, "environment", None))
    subject = f"[ProjeXtPal{suffix} — AI ESCALATIE] {issue.title[:70]}"

    text = (
        f"AI-triage escalatie naar superadmin.\n\n"
        f"Reden: {reason}\n\n"
        f"--- Issue details ---\n"
        f"Titel:           {issue.title}\n"
        f"Status:          {issue.get_status_display()}\n"
        f"Priority:        {priority_display}\n"
        f"Classification:  {classification_display}\n"
        f"Reproduction:    {repro_display}\n"
        f"Reporter:        {reporter_email}\n"
        f"Company:         {company_name}\n"
        f"Source:          {issue.get_source_display()}\n\n"
        f"--- Beschrijving ---\n"
        f"{issue.description or '(geen beschrijving)'}\n\n"
        f"Open issue: {issue_url}\n\n"
        f"De AI-triage agent kon dit niet zelfstandig afhandelen — "
        f"menselijke beoordeling nodig.\n"
    )

    description_html = (issue.description or "(geen beschrijving)").replace("\n", "<br>")
    html_body = f"""
      <p style="font-size: 15px; color: #b91c1c; font-weight: 600;">
        ⚠️ AI-triage agent kan dit issue niet zelfstandig oplossen — menselijke beoordeling nodig
      </p>
      <p style="font-size: 14px; background: #fef2f2; border-left: 3px solid #ef4444; padding: 12px 16px; margin: 16px 0;">
        <strong>Reden:</strong> {reason}
      </p>
      <table style="width:100%; font-size:14px; border-collapse:collapse; margin: 16px 0;">
        <tr><td style="padding:6px 0; color:#6b7280; width:140px;">Titel</td><td style="padding:6px 0;"><strong>{issue.title}</strong></td></tr>
        <tr><td style="padding:6px 0; color:#6b7280;">Status</td><td style="padding:6px 0;"><span style="background:#fef3c7; color:#92400e; padding:2px 8px; border-radius:4px; font-weight:600;">{issue.get_status_display()}</span></td></tr>
        <tr><td style="padding:6px 0; color:#6b7280;">Priority</td><td style="padding:6px 0;">{priority_display}</td></tr>
        <tr><td style="padding:6px 0; color:#6b7280;">Classification</td><td style="padding:6px 0;">{classification_display}</td></tr>
        <tr><td style="padding:6px 0; color:#6b7280;">Reproduction</td><td style="padding:6px 0;">{repro_display}</td></tr>
        <tr><td style="padding:6px 0; color:#6b7280;">Reporter</td><td style="padding:6px 0;">{reporter_email}</td></tr>
        <tr><td style="padding:6px 0; color:#6b7280;">Company</td><td style="padding:6px 0;">{company_name}</td></tr>
        <tr><td style="padding:6px 0; color:#6b7280;">Source</td><td style="padding:6px 0;">{issue.get_source_display()}</td></tr>
      </table>
      <p style="font-size: 13px; color: #6b7280; margin-top: 12px;"><strong>Beschrijving</strong></p>
      <p style="font-size: 13px; color: #374151; background: #f9fafb; padding: 12px; border-radius: 6px; line-height: 1.6;">
        {description_html}
      </p>
    """
    # Use a custom red-accent wrapper for visual urgency
    html = f"""<!DOCTYPE html>
<html><body style="font-family: -apple-system, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
  <div style="background: linear-gradient(135deg, #b91c1c, #ef4444); color: white; padding: 28px 24px; border-radius: 12px 12px 0 0;">
    <h1 style="margin: 0; font-size: 22px;">AI Escalatie — Superadmin actie nodig</h1>
    <p style="margin: 8px 0 0; opacity: 0.95; font-size: 14px;">Auto-triage kon dit issue niet afhandelen</p>
  </div>
  <div style="background: #fafafa; padding: 32px 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    {html_body}
    <div style="text-align: center; margin: 28px 0;">
      <a href="{issue_url}" style="background: #b91c1c; color: white; padding: 13px 26px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 14px;">Open issue voor beoordeling →</a>
    </div>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
    <p style="font-size: 12px; color: #9ca3af; margin: 0;">
      Deze mail gaat ALLEEN naar actieve superadmins. Andere admins zien dit issue ook in hun normale notificaties.<br>
      ProjeXtPal · Inclufy
    </p>
  </div>
</body></html>"""

    _send_email_safe(
        subject=subject, text_body=text, html_body=html,
        to=targets,
    )


def _notify_admins_progress(issue: ProductIssue, issue_url: str, new_status_display: str) -> None:
    subject = f"{_app_prefix(issue)} Issue → {new_status_display}: {issue.title[:60]}"
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
