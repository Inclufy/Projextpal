"""
Management command to link a user to a company.
Usage: python manage.py link_user_company sami@inclufy.com "Inclufy"
"""
from django.core.management.base import BaseCommand
from accounts.models import CustomUser, Company


class Command(BaseCommand):
    help = "Link a user to a company (creates company if it doesn't exist)"

    def add_arguments(self, parser):
        parser.add_argument("email", type=str, help="User email address")
        parser.add_argument("company_name", type=str, help="Company name")

    def handle(self, *args, **options):
        email = options["email"]
        company_name = options["company_name"]

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            self.stderr.write(self.style.ERROR(f"User '{email}' not found."))
            return

        company, created = Company.objects.get_or_create(
            name=company_name.lower(),
            defaults={"description": f"Company: {company_name}"},
        )

        if created:
            self.stdout.write(self.style.SUCCESS(f"Created company '{company.name}'"))
        else:
            self.stdout.write(f"Found existing company '{company.name}'")

        old_company = user.company
        user.company = company
        user.save(update_fields=["company"])

        self.stdout.write(
            self.style.SUCCESS(
                f"Linked user '{email}' to company '{company.name}' "
                f"(was: {old_company or 'None'})"
            )
        )
