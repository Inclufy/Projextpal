"""Throttling for read-only service (BI) tokens."""
from rest_framework.throttling import SimpleRateThrottle

from .service_tokens import is_service_read_token


class ServiceTokenRateThrottle(SimpleRateThrottle):
    """Rate-limit requests authenticated with a ``bi:read`` service token.

    No-op (no cache key) for every other request, so interactive users are
    unaffected. Rate is configured under
    ``REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"]["service_token"]``.
    """

    scope = "service_token"

    def get_cache_key(self, request, view):
        auth = getattr(request, "auth", None)
        if not is_service_read_token(auth):
            return None  # not a service token -> this throttle does not apply
        ident = auth.get("jti") or auth.get("user_id") or "anonymous"
        return self.cache_format % {"scope": self.scope, "ident": ident}
