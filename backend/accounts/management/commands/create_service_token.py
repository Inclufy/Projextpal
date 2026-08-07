"""Mint a long-lived, read-only service token for BI/machine access.

Usage:
    python manage.py create_service_token --email bi-reader@example.com
    python manage.py create_service_token --email bi-reader@example.com --days 180

The token is printed once and never stored; treat it as a secret. It
authenticates as the given user (all tenant/membership scoping applies)
but is restricted to GET/HEAD/OPTIONS by ServiceScopedJWTAuthentication.

Recommended practice: create a dedicated, least-privilege "BI reader"
user per tenant and mint the token for that account, so revocation is as
simple as deactivating the user (inactive users fail JWT authentication).
"""
from datetime import datetime, timezone as dt_timezone

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError

from accounts.service_tokens import DEFAULT_LIFETIME_DAYS, build_service_token


class Command(BaseCommand):
    help = (
        "Create a long-lived READ-ONLY service token (JWT with scope "
        "'bi:read') for machine/BI access, e.g. Power BI incremental "
        "refresh."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--email",
            required=True,
            help="Email of the (preferably dedicated, read-only) user the "
            "token authenticates as.",
        )
        parser.add_argument(
            "--days",
            type=int,
            default=DEFAULT_LIFETIME_DAYS,
            help=f"Token lifetime in days (default: {DEFAULT_LIFETIME_DAYS}).",
        )

    def handle(self, *args, **options):
        email = options["email"]
        days = options["days"]
        if days < 1:
            raise CommandError("--days must be a positive integer.")

        User = get_user_model()
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise CommandError(f"No user found with email {email!r}.")
        except User.MultipleObjectsReturned:
            raise CommandError(
                f"Multiple users found with email {email!r}; fix the "
                "duplicates first."
            )
        if not user.is_active:
            raise CommandError(
                f"User {email!r} is inactive; tokens for inactive users are "
                "rejected at authentication time."
            )

        token = build_service_token(user, days=days)
        expires = datetime.fromtimestamp(token["exp"], tz=dt_timezone.utc)

        self.stdout.write(self.style.SUCCESS("Service token created."))
        self.stdout.write(f"  User:    {user.email} (id={user.pk})")
        self.stdout.write(f"  Scope:   {token['scope']} (read-only, GET/HEAD/OPTIONS)")
        self.stdout.write(f"  Expires: {expires.isoformat()}")
        self.stdout.write("")
        self.stdout.write(str(token))
        self.stdout.write("")
        self.stdout.write(
            self.style.WARNING(
                "Store this token in the BI tool's secret store; it will "
                "not be shown again. Revoke by deactivating the user."
            )
        )
