"""
Generic sandbox / proeftuin provisioning — reusable by the admin portal and the
management commands. Sets up an isolated, time-limited evaluation workspace:

  * a Company in eval mode (sandbox banner/onboarding, no hard caps),
  * an evaluator user in that company,
  * a trial Registration (so the sandbox layer switches on),
  * optionally a branded sandbox invitation email.

Never sets a password — the invitation/reset link does that.
"""
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone


def provision_sandbox(*, email, company_name, days=14, inviter_name="Het ProjeXtPal-team",
                      first_name="", last_name="", send_invite=False):
    """Provision (idempotently) a sandbox evaluator. Returns a result dict."""
    from accounts.models import Company, Registration

    User = get_user_model()
    email = (email or "").strip().lower()
    company_name = (company_name or "").strip() or "Proeftuin"
    days = max(1, int(days or 14))

    company, _ = Company.objects.get_or_create(name=company_name)
    if not company.eval_mode:
        company.eval_mode = True
        company.save(update_fields=["eval_mode"])

    user, created = User.objects.get_or_create(
        email=email,
        defaults=dict(username=email, first_name=first_name, last_name=last_name,
                      company=company, role="admin", is_active=True),
    )
    if user.company_id != company.id:
        user.company = company
        user.save(update_fields=["company"])

    now = timezone.now()
    reg, _ = Registration.objects.update_or_create(
        user=user,
        defaults=dict(
            email=email, first_name=user.first_name, last_name=user.last_name,
            company_name=company.name, intent="14_day_trial",
            trial_days=days, trial_start_date=now,
            trial_end_date=now + timedelta(days=days), status="approved",
        ),
    )

    invited = False
    if send_invite:
        from accounts.sandbox_invite import send_sandbox_invitation
        invited = send_sandbox_invitation(
            user, days=days, inviter_name=inviter_name,
            trial_end=f"{reg.trial_end_date:%Y-%m-%d}",
        )

    return {
        "email": email,
        "company": company.name,
        "user_created": created,
        "trial_days": days,
        "trial_end": f"{reg.trial_end_date:%Y-%m-%d}",
        "invited": invited,
    }
