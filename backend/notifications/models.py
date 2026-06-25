"""Per-user, persistent in-app notifications (the bell in the top nav).

Distinct from consumers.py, which is a websocket broadcast channel for admins.
This model is the durable store the notification centre reads + marks read.
"""
from django.conf import settings
from django.db import models


class Notification(models.Model):
    KIND_CHOICES = [
        ("task_assigned", "Task assigned"),
        ("action_assigned", "Action assigned"),
        ("mention", "Mention"),
        ("message", "Message"),
        ("approval", "Approval requested"),
        ("status", "Status update"),
        ("system", "System"),
    ]

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications"
    )
    # Tenant scoping — best-effort copy of the recipient's company so a query can
    # stay company-bounded even if the user later moves company.
    company = models.ForeignKey(
        "accounts.Company", on_delete=models.CASCADE, null=True, blank=True,
        related_name="notifications",
    )
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="+",
    )
    kind = models.CharField(max_length=24, choices=KIND_CHOICES, default="system")
    title = models.CharField(max_length=255)
    body = models.TextField(blank=True, default="")
    # Frontend deep-link, e.g. "/projects/92/planning/action-tracker".
    url = models.CharField(max_length=255, blank=True, default="")
    read = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["recipient", "read", "-created_at"], name="notif_recip_read_idx"),
        ]

    def __str__(self):
        return f"{self.title} -> {self.recipient_id} ({'read' if self.read else 'unread'})"


# Notification categories the user can independently mute (per channel).
# Maps the notify() `kind` values onto a smaller set of user-facing categories.
NOTIF_CATEGORIES = ["task_assigned", "mention", "message", "approval", "deadline", "status_digest", "programme_update"]
_KIND_TO_CATEGORY = {
    "task_assigned": "task_assigned",
    "action_assigned": "task_assigned",
    "mention": "mention",
    "message": "message",
    "approval": "approval",
    "deadline": "deadline",
    "status": "status_digest",
    "system": "status_digest",
}


class NotificationPreference(models.Model):
    """Per-user notification preferences. Master switches per channel (email /
    push) plus a per-category toggle. Missing row = everything on (opt-out
    model). Essential transactional mail (password reset, email verification,
    invitations) ignores these — only notification mail/push is governed."""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notification_preference"
    )
    email_enabled = models.BooleanField(default=True)   # master email switch
    push_enabled = models.BooleanField(default=True)    # master push switch
    # Per-category (applies to whichever channel is enabled).
    task_assigned = models.BooleanField(default=True)
    mention = models.BooleanField(default=True)
    message = models.BooleanField(default=True)
    approval = models.BooleanField(default=True)
    deadline = models.BooleanField(default=True)
    status_digest = models.BooleanField(default=True)
    programme_update = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Notif prefs for {self.user_id}"

    def category_on(self, kind):
        cat = _KIND_TO_CATEGORY.get(kind, "status_digest")
        return bool(getattr(self, cat, True))


def _prefs_for(user):
    if user is None:
        return None
    try:
        return NotificationPreference.objects.filter(user=user).first()
    except Exception:
        return None


def should_email(user, kind):
    """Whether a NOTIFICATION email of this kind should go to the user.
    Opt-out: True unless the user explicitly disabled the master or category."""
    p = _prefs_for(user)
    if p is None:
        return True
    return p.email_enabled and p.category_on(kind)


def should_push(user, kind):
    p = _prefs_for(user)
    if p is None:
        return True
    return p.push_enabled and p.category_on(kind)


class DeviceToken(models.Model):
    """An Expo push token for one of a user's devices. The mobile app registers
    it on startup (POST /api/v1/auth/devices/register/); notify() fans a push
    out to every active token of the recipient."""
    PLATFORM_CHOICES = [("ios", "iOS"), ("android", "Android"), ("web", "Web")]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="device_tokens"
    )
    token = models.CharField(max_length=255, unique=True)
    platform = models.CharField(max_length=10, choices=PLATFORM_CHOICES, default="ios")
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.platform} token for {self.user_id}"


def send_push(recipient, *, title="", body="", url="", data=None):
    """Best-effort Expo push to all of `recipient`'s active device tokens.
    Never raises — push failures must not break the originating save. Returns
    the number of tokens a message was attempted for."""
    try:
        import requests  # available in the backend image
    except Exception:
        return 0
    try:
        tokens = list(
            DeviceToken.objects.filter(user=recipient, active=True)
            .values_list("token", flat=True)
        )
        tokens = [t for t in tokens if t and t.startswith("ExponentPushToken")]
        if not tokens:
            return 0
        payload = [{
            "to": t,
            "title": (title or "ProjeXtPal")[:178],
            "body": (body or "")[:178],
            "sound": "default",
            "data": {"url": url or "", **(data or {})},
        } for t in tokens]
        requests.post(
            "https://exp.host/--/api/v2/push/send",
            json=payload,
            headers={"Content-Type": "application/json", "Accept": "application/json"},
            timeout=5,
        )
        return len(tokens)
    except Exception:
        return 0


def notify(recipient, *, kind="system", title="", body="", url="", actor=None, company=None):
    """Create a notification for `recipient`. Safe no-op if recipient is None or
    the recipient would be notified about their own action.

    Never raises — notification failures must not break the originating save.
    """
    try:
        if recipient is None:
            return None
        if actor is not None and getattr(actor, "id", None) == getattr(recipient, "id", None):
            return None  # don't notify someone about their own action
        if company is None:
            company = getattr(recipient, "company", None)
        n = Notification.objects.create(
            recipient=recipient, company=company, actor=actor,
            kind=kind, title=title[:255], body=body or "", url=url or "",
        )
        # Fan out to the recipient's mobile devices, respecting their push
        # preference (best-effort, never raises).
        if should_push(recipient, kind):
            send_push(recipient, title=title, body=body, url=url, data={"kind": kind})
        # Email the actionable kinds (assignment / approval / mention) when the
        # recipient hasn't opted out. Noisy kinds (message/system/status) stay
        # in-app/push only.
        if kind in EMAIL_KINDS and should_email(recipient, kind):
            _send_notification_email(recipient, title=title, body=body, url=url)
        return n
    except Exception:
        return None


# Kinds that warrant a direct email (not just in-app/push). Mentions stay
# in-app/push only — assigning via the Action Tracker also posts a mention
# comment, so emailing both would double up.
EMAIL_KINDS = {"task_assigned", "action_assigned", "approval"}


def _send_notification_email(recipient, *, title="", body="", url=""):
    """Best-effort branded notification email. Never raises."""
    try:
        from django.conf import settings
        from django.core.mail import EmailMultiAlternatives
        from django.template.loader import render_to_string
        to = getattr(recipient, "email", None)
        if not to:
            return
        base = getattr(settings, "FRONTEND_URL", "https://projextpal.com")
        link = f"{base}{url}" if url else ""
        html = render_to_string("emails/notification.html", {
            "title": title, "lead": body, "sections": [],
            "closing": (f'Open in ProjeXtPal: {link}' if link else "Open ProjeXtPal om te reageren."),
            "badge": "bell",
        })
        msg = EmailMultiAlternatives(
            subject=title or "ProjeXtPal", body=body or title,
            from_email=settings.DEFAULT_FROM_EMAIL, to=[to],
        )
        msg.attach_alternative(html, "text/html")
        msg.send()
    except Exception:
        pass
