"""Long-lived, read-only service tokens for machine/BI access.

Data portability (Apeldoorn D2/D4): BI tools such as Power BI need
non-interactive API access with a stable credential. Instead of adding a
second auth system (DRF TokenAuth would require a new database table and
migration), we mint long-lived SimpleJWT access tokens carrying a
``scope: "bi:read"`` claim:

- issued only via the ``create_service_token`` management command
  (operator-controlled; the secret is never stored server-side beyond the
  normal JWT signing key),
- accepted by the existing ``JWTAuthentication`` stack via
  :class:`accounts.authentication.ServiceScopedJWTAuthentication`, which
  rejects any non-safe method (POST/PUT/PATCH/DELETE) for these tokens,
- rate-limited by :class:`accounts.throttling.ServiceTokenRateThrottle`.

No model changes, no migrations, no hardcoded secrets.
"""
from datetime import timedelta

from rest_framework_simplejwt.tokens import AccessToken

#: Claim value marking a token as a read-only service (BI) token.
SERVICE_READ_SCOPE = "bi:read"

#: Claim key used for the scope.
SCOPE_CLAIM = "scope"

#: Default validity of a service token, in days.
DEFAULT_LIFETIME_DAYS = 365


def build_service_token(user, days=DEFAULT_LIFETIME_DAYS):
    """Return a long-lived read-only ``AccessToken`` for ``user``.

    The token authenticates as ``user`` (so all existing tenant/membership
    queryset scoping applies unchanged) but is restricted to safe HTTP
    methods by ``ServiceScopedJWTAuthentication``.
    """
    token = AccessToken.for_user(user)
    token.set_exp(lifetime=timedelta(days=days))
    token[SCOPE_CLAIM] = SERVICE_READ_SCOPE
    token["service"] = True
    return token


def is_service_read_token(auth):
    """True when ``request.auth`` is a validated read-only service token."""
    try:
        return auth is not None and auth.get(SCOPE_CLAIM) == SERVICE_READ_SCOPE
    except (AttributeError, TypeError):
        return False
