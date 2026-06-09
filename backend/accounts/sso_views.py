"""Azure / Entra ID Single Sign-On (OIDC). OFF unless fully configured via env
(see settings.AZURE_SSO_ENABLED). Token validation is delegated to Microsoft's
official `msal` library — we never hand-verify signatures. By default a login
only succeeds for a user that already exists (invite-first / B2B safe); set
AZURE_SSO_AUTO_CREATE=true to auto-provision.

Flow:
  GET /auth/sso/config/          → {azure_enabled}        (public; frontend gates the button)
  GET /auth/sso/azure/login/     → 302 to Microsoft       (public)
  GET /auth/sso/azure/callback/  → exchange code, issue our JWT, 302 to frontend
"""
from urllib.parse import urlencode

from django.conf import settings
from django.shortcuts import redirect
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

User = get_user_model()
SCOPES = ["User.Read"]


def _authority():
    return f"https://login.microsoftonline.com/{settings.AZURE_SSO_TENANT_ID}"


def _msal_app():
    import msal  # lazy — only imported when SSO is enabled
    return msal.ConfidentialClientApplication(
        client_id=settings.AZURE_SSO_CLIENT_ID,
        client_credential=settings.AZURE_SSO_CLIENT_SECRET,
        authority=_authority(),
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def sso_config(request):
    return Response({"azure_enabled": bool(getattr(settings, "AZURE_SSO_ENABLED", False))})


@api_view(["GET"])
@permission_classes([AllowAny])
def azure_login(request):
    if not getattr(settings, "AZURE_SSO_ENABLED", False):
        return Response({"detail": "SSO not configured"}, status=404)
    auth_url = _msal_app().get_authorization_request_url(
        SCOPES, redirect_uri=settings.AZURE_SSO_REDIRECT_URI,
        prompt="select_account",
    )
    return redirect(auth_url)


def _frontend_redirect(path):
    base = (getattr(settings, "FRONTEND_URL", "") or "").rstrip("/")
    return redirect(f"{base}{path}")


@api_view(["GET"])
@permission_classes([AllowAny])
def azure_callback(request):
    if not getattr(settings, "AZURE_SSO_ENABLED", False):
        return Response({"detail": "SSO not configured"}, status=404)
    code = request.GET.get("code")
    if not code:
        return _frontend_redirect("/login?sso_error=no_code")
    try:
        result = _msal_app().acquire_token_by_authorization_code(
            code, scopes=SCOPES, redirect_uri=settings.AZURE_SSO_REDIRECT_URI,
        )
    except Exception:
        return _frontend_redirect("/login?sso_error=exchange_failed")
    if "id_token_claims" not in result:
        return _frontend_redirect("/login?sso_error=invalid_token")

    claims = result["id_token_claims"]  # msal has already validated signature/iss/aud
    email = (claims.get("preferred_username") or claims.get("email") or "").lower().strip()
    if not email:
        return _frontend_redirect("/login?sso_error=no_email")

    user = User.objects.filter(email__iexact=email).first()
    if user is None:
        if not getattr(settings, "AZURE_SSO_AUTO_CREATE", False):
            return _frontend_redirect("/login?sso_error=not_invited")
        user = User.objects.create(
            email=email, username=email,
            first_name=(claims.get("given_name") or "")[:150],
            last_name=(claims.get("family_name") or "")[:150],
            is_active=True, role="guest",
        )
    if not user.is_active:
        return _frontend_redirect("/login?sso_error=inactive")

    try:
        from .models import audit
        audit(user, "auth.sso_login", summary=f"SSO login via Azure ({email})", request=request)
    except Exception:
        pass

    refresh = RefreshToken.for_user(user)
    qs = urlencode({"access": str(refresh.access_token), "refresh": str(refresh)})
    return _frontend_redirect(f"/sso/callback?{qs}")
