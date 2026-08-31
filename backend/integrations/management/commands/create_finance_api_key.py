"""Genereer een pxp_live-API-sleutel voor de Inclufy Finance-integratie.

Gebruik:
    python manage.py create_finance_api_key --company 1
    python manage.py create_finance_api_key --company 1 --name "Finance prod"

De volledige sleutel wordt EENMALIG geprint — alleen de sha256-hash wordt
opgeslagen. Zet de sleutel daarna als Supabase-secret aan de Finance-kant:
    supabase secrets set PROJEXTPAL_API_KEY='<sleutel>' --project-ref nruqfegrngpzoigflexn
"""

import hashlib
import secrets

from django.core.management.base import BaseCommand, CommandError

from accounts.models import Company
from integrations.models import FinanceIntegrationApiKey


class Command(BaseCommand):
    help = "Genereer een pxp_live-API-sleutel voor de Inclufy Finance-integratie."

    def add_arguments(self, parser):
        parser.add_argument("--company", type=int, required=True, help="Company.id")
        parser.add_argument("--name", type=str, default="Inclufy Finance")

    def handle(self, *args, **options):
        try:
            company = Company.objects.get(pk=options["company"])
        except Company.DoesNotExist:
            raise CommandError(f"Company {options['company']} bestaat niet")

        # 48 hex-tekens: gegarandeerd ASCII (header-safe) en 192 bits entropie.
        key = f"pxp_live_{secrets.token_hex(24)}"
        FinanceIntegrationApiKey.objects.create(
            company=company,
            name=options["name"],
            key_prefix=key[:16],
            key_hash=hashlib.sha256(key.encode("utf-8")).hexdigest(),
        )

        self.stdout.write(self.style.SUCCESS(
            f"API-sleutel aangemaakt voor {company.name} ({options['name']})."
        ))
        self.stdout.write("")
        self.stdout.write("Bewaar deze sleutel NU — hij wordt niet nog eens getoond:")
        self.stdout.write("")
        self.stdout.write(f"    {key}")
        self.stdout.write("")
        self.stdout.write(
            "Finance-kant: supabase secrets set "
            "PROJEXTPAL_API_KEY='<bovenstaande sleutel>' "
            "--project-ref nruqfegrngpzoigflexn"
        )
