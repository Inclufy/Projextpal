"""
Sandbox / proeftuin invitation email.

Sends a clearly-branded "evaluation environment" invitation (like Credly's
sandbox emails) with an Accept-Invitation CTA that lets the evaluator set their
password via the normal password-reset flow. Reuses Resend (the configured email
backend) + the existing PasswordResetToken.
"""
import logging

from django.conf import settings
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)


def send_sandbox_invitation(user, days=14, inviter_name="Het ProjeXtPal-team", trial_end=None):
    """Email a sandbox/proeftuin invitation to `user`. Returns True on send.
    Never raises — logs and returns False on any failure."""
    from django.core.mail import EmailMultiAlternatives
    from django.template.loader import render_to_string
    from accounts.models import PasswordResetToken

    try:
        token = PasswordResetToken.objects.create(user=user)
        frontend = getattr(settings, "FRONTEND_URL", "https://projextpal.com").rstrip("/")
        accept_url = f"{frontend}/reset-password/{token.token}"
        company_name = str(getattr(user, "company", "") or "je werkruimte")

        html = render_to_string("emails/sandbox_invite.html", {
            "user": user,
            "inviter_name": inviter_name,
            "company_name": company_name,
            "days": days,
            "trial_end": trial_end or "",
            "accept_url": accept_url,
        })
        msg = EmailMultiAlternatives(
            subject="[Proeftuin] Je uitnodiging voor ProjeXtPal",
            body=strip_tags(html),
            from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@inclufy.com"),
            to=[user.email],
        )
        msg.attach_alternative(html, "text/html")
        msg.send(fail_silently=False)
        return True
    except Exception as exc:
        logger.exception("Sandbox invitation failed for %s: %s", getattr(user, "email", "?"), exc)
        return False
