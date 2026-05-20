"""
Re-encrypt all api_key fields with the current FIELD_ENCRYPTION_KEY.

Use after rotating the encryption key, or after first deploying the
Fernet upgrade (existing rows are plaintext until rewritten).

Usage:
    python manage.py re_encrypt_api_keys
    python manage.py re_encrypt_api_keys --dry-run
"""

from __future__ import annotations

from django.core.management.base import BaseCommand
from django.db import transaction


class Command(BaseCommand):
    help = "Re-encrypt all API key fields with the current FIELD_ENCRYPTION_KEY."

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true")

    @transaction.atomic
    def handle(self, *args, **opts):
        dry = opts["dry_run"]
        from accounts.models import CompanyAIKey
        from admin_portal.models import ClientApiKey

        n_company = 0
        for k in CompanyAIKey.objects.all():
            updates = []
            for field in ("openai_api_key", "anthropic_api_key"):
                value = getattr(k, field) or ""
                if value:
                    if dry:
                        updates.append(field)
                    else:
                        # Just re-save -- the EncryptedField will (re)encrypt.
                        setattr(k, field, value)
                        updates.append(field)
            if updates and not dry:
                k.save(update_fields=updates)
                n_company += 1

        n_client = 0
        for k in ClientApiKey.objects.all():
            if k.api_key:
                if not dry:
                    k.save(update_fields=["api_key"])
                n_client += 1

        verb = "would re-encrypt" if dry else "re-encrypted"
        self.stdout.write(self.style.SUCCESS(
            f"{verb}: {n_company} CompanyAIKey rows, {n_client} ClientApiKey rows."
        ))
