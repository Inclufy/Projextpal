"""Create (idempotently) a Re-care TEST company + user to exercise cross-tenant
project collaboration.

The user is placed in a SEPARATE company (not Inclufy), so when you invite them
to an Inclufy project they become an *external* (cross-tenant) collaborator —
letting you verify that they see the shared project but NOT the host company's
budgets, hourly rates or internal tasks, and cannot change its lifecycle.

Role defaults to ``pm`` on purpose: a PM normally may see costs, so it proves the
financial masking is driven by cross-tenant status, not just role.

Run on the host, e.g.:
    python manage.py create_recare_test_user --password '<kies-een-wachtwoord>'

The password is taken from --password (you choose it); it is never printed.
"""
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError

User = get_user_model()


class Command(BaseCommand):
    help = "Create/refresh a Re-care test company + user for cross-tenant testing."

    def add_arguments(self, parser):
        parser.add_argument("--email", default="recare.tester@re-care.test")
        parser.add_argument("--password", required=True,
                            help="Password to set (you choose it; not printed).")
        parser.add_argument("--company", default="Re-care (test)")
        parser.add_argument("--role", default="pm")
        parser.add_argument("--first-name", default="Re-care")
        parser.add_argument("--last-name", default="Tester")

    def handle(self, *args, **opts):
        from accounts.models import Company

        role = opts["role"]
        valid_roles = dict(getattr(User, "ROLE_CHOICES", []))
        if valid_roles and role not in valid_roles:
            raise CommandError(
                f"Invalid role '{role}'. Choose one of: {', '.join(valid_roles)}"
            )
        if len(opts["password"]) < 8:
            raise CommandError("Password must be at least 8 characters.")

        company, c_created = Company.objects.get_or_create(name=opts["company"])

        email = opts["email"].strip().lower()
        user, u_created = User.objects.get_or_create(
            email=email,
            defaults={
                "username": email,
                "first_name": opts["first_name"],
                "last_name": opts["last_name"],
                "company": company,
                "role": role,
                "is_active": True,
            },
        )
        # Refresh so re-runs keep the test user external + active with the role.
        changed = []
        if user.company_id != company.id:
            user.company = company
            changed.append("company")
        if user.role != role:
            user.role = role
            changed.append("role")
        if not user.is_active:
            user.is_active = True
            changed.append("is_active")
        user.set_password(opts["password"])
        user.save()

        self.stdout.write(self.style.SUCCESS("Re-care test user ready."))
        self.stdout.write(f"  email      : {user.email}")
        self.stdout.write(f"  company    : {company.name} (id {company.id})  "
                          f"[{'created' if c_created else 'existing'}]")
        self.stdout.write(f"  role       : {user.role}")
        self.stdout.write(f"  user       : id {user.id}  "
                          f"[{'created' if u_created else ('updated: ' + ','.join(changed) if changed else 'unchanged')}]")
        self.stdout.write("")
        self.stdout.write("Next: in the Inclufy project, use 'Uitnodigen (e-mail)' to invite "
                          f"{user.email} (role guest/reviewer). Because this account already "
                          "exists in another company, it stays external — then log in as this "
                          "user and verify budgets/rates/internal tasks are hidden and the "
                          "lifecycle controls are blocked.")
