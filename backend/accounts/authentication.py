"""JWT authentication with service-token (BI) scope enforcement."""
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import SAFE_METHODS
from rest_framework_simplejwt.authentication import JWTAuthentication

from .service_tokens import is_service_read_token


class ServiceScopedJWTAuthentication(JWTAuthentication):
    """Drop-in replacement for ``JWTAuthentication``.

    Regular (interactive) JWTs behave exactly as before. Tokens carrying
    the ``scope: "bi:read"`` claim (minted by the ``create_service_token``
    management command) are accepted for SAFE methods only; any write
    attempt is rejected with 403 *at the authentication layer*, so the
    restriction holds even for views that override ``permission_classes``.
    """

    def authenticate(self, request):
        result = super().authenticate(request)
        if result is None:
            return None
        _user, validated_token = result
        if (
            is_service_read_token(validated_token)
            and request.method not in SAFE_METHODS
        ):
            raise PermissionDenied(
                "This service token is read-only: only GET, HEAD and "
                "OPTIONS requests are allowed."
            )
        return result
