"""
Provision a Yanmar evaluation proeftuin (sandbox), idempotent.

What it does:
  1. Ensures the Yanmar demo workspace + data exist (runs seed_yanmar_demo).
  2. Puts the Yanmar company in roomy EVAL mode (proeftuin banner + onboarding,
     but no hard project/user caps).
  3. Ensures the evaluator user exists in that company and gives them a
     time-limited trial Registration (default 14 days) so the proeftuin layer
     (banner + checklist + days-remaining) switches on.

It NEVER sets a password — send the evaluator a password-reset / invitation
after running. Safe to run repeatedly.

    python manage.py setup_yanmar_proeftuin --email piet@yanmar.com
    python manage.py setup_yanmar_proeftuin --email piet@yanmar.com --days 30
"""
from datetime import timedelta

from django.core.management.base import BaseCommand, CommandError
from django.core.management import call_command
from django.contrib.auth import get_user_model
from django.utils import timezone

COMPANY_NAME = "Yanmar Europe (Demo)"


class Command(BaseCommand):
    help = "Set up a time-limited Yanmar evaluation proeftuin (eval mode + trial + demo data)."

    def add_arguments(self, parser):
        parser.add_argument("--email", required=True, help="Evaluator login email (Yanmar contact).")
        parser.add_argument("--days", type=int, default=14, help="Trial length in days (default 14).")
        parser.add_argument("--first-name", default="Yanmar", help="Evaluator first name.")
        parser.add_argument("--last-name", default="Evaluator", help="Evaluator last name.")

    def handle(self, *args, **opts):
        from accounts.models import Company, Registration

        User = get_user_model()
        email = opts["email"].strip().lower()
        days = max(1, opts["days"])

        # 1) Ensure the Yanmar demo workspace + data exist.
        try:
            call_command("seed_yanmar_demo")
            self.stdout.write(self.style.SUCCESS("✓ seed_yanmar_demo ran"))
        except Exception as e:  # demo seed is best-effort; the proeftuin still works
            self.stdout.write(self.style.WARNING(f"! seed_yanmar_demo skipped/failed: {e}"))

        company = Company.objects.filter(name=COMPANY_NAME).first()
        if not company:
            company = Company.objects.create(name=COMPANY_NAME)
            self.stdout.write(self.style.SUCCESS(f"✓ created company '{COMPANY_NAME}'"))

        # 2) Roomy eval mode (banner stays, caps lifted).
        if not company.eval_mode:
            company.eval_mode = True
            company.save(update_fields=["eval_mode"])
        self.stdout.write(self.style.SUCCESS(f"✓ company '{company.name}' is in eval mode (no hard caps)"))

        # 3) Evaluator user + time-limited trial.
        user, created = User.objects.get_or_create(
            email=email,
            defaults=dict(username=email, first_name=opts["first_name"],
                          last_name=opts["last_name"], company=company,
                          role="admin", is_active=True),
        )
        if user.company_id != company.id:
            user.company = company
            user.save(update_fields=["company"])
        self.stdout.write(self.style.SUCCESS(
            f"✓ evaluator {'created' if created else 'exists'}: {email} (company {company.name})"))

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
        self.stdout.write(self.style.SUCCESS(
            f"✓ trial active: {days} days, ends {reg.trial_end_date:%Y-%m-%d}"))

        self.stdout.write("")
        self.stdout.write(self.style.MIGRATE_HEADING("Yanmar proeftuin ready."))
        self.stdout.write(f"  Login email : {email}")
        self.stdout.write(f"  Company     : {company.name} (eval mode, no caps)")
        self.stdout.write(f"  Trial ends  : {reg.trial_end_date:%Y-%m-%d} ({days} days)")
        self.stdout.write("")
        self.stdout.write(self.style.WARNING(
            "Next: send a password-reset / invitation to the evaluator — this command "
            "never sets a password. They'll see the proeftuin banner + onboarding on login."))
