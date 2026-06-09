"""Active-session management (ISO 27001 A.8 — session management). Lists the
caller's outstanding refresh tokens (= sessions) and lets them revoke one or all
by blacklisting. Uses SimpleJWT's token_blacklist app."""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken


def _serialize(tok, blacklisted_ids):
    return {
        "id": tok.id,
        "jti": tok.jti,
        "created_at": tok.created_at.isoformat() if tok.created_at else None,
        "expires_at": tok.expires_at.isoformat() if tok.expires_at else None,
        "revoked": tok.id in blacklisted_ids,
    }


class SessionsView(APIView):
    """GET → list the user's sessions (outstanding refresh tokens)."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        toks = OutstandingToken.objects.filter(user=request.user).order_by("-created_at")[:100]
        bl = set(BlacklistedToken.objects.filter(token__user=request.user).values_list("token_id", flat=True))
        rows = [_serialize(t, bl) for t in toks]
        active = [r for r in rows if not r["revoked"]]
        return Response({"sessions": rows, "active_count": len(active)})


class RevokeSessionView(APIView):
    """POST {id} → revoke (blacklist) one session. No id → revoke ALL of the
    user's sessions (log out everywhere)."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        sid = request.data.get("id")
        qs = OutstandingToken.objects.filter(user=request.user)
        if sid:
            qs = qs.filter(id=sid)
        n = 0
        for tok in qs:
            _, created = BlacklistedToken.objects.get_or_create(token=tok)
            if created:
                n += 1
        try:
            from .models import audit
            audit(request.user, "session.revoke",
                  summary=("Revoked one session" if sid else "Logged out of all sessions"),
                  request=request, severity="warning", revoked=n)
        except Exception:
            pass
        return Response({"revoked": n}, status=status.HTTP_200_OK)
