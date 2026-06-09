"""Public system status endpoint for a /status page. Checks core components
(database, cache) and reports operational/degraded/down. No auth — a status
page is meant to be public so customers can self-serve during an incident."""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


def _check_db():
    try:
        from django.db import connection
        with connection.cursor() as c:
            c.execute("SELECT 1")
            c.fetchone()
        return True
    except Exception:
        return False


def _check_cache():
    try:
        from django.core.cache import cache
        cache.set("_status_ping", "1", 5)
        return cache.get("_status_ping") == "1"
    except Exception:
        return None  # cache optional → unknown, not down


@api_view(["GET"])
@permission_classes([AllowAny])
def system_status(request):
    db = _check_db()
    cache_ok = _check_cache()
    components = [
        {"name": "API", "status": "operational"},  # if this responds, the API is up
        {"name": "Database", "status": "operational" if db else "down"},
        {"name": "Cache / Realtime", "status": "operational" if cache_ok else ("degraded" if cache_ok is None else "down")},
    ]
    overall = "operational"
    if any(c["status"] == "down" for c in components):
        overall = "major_outage"
    elif any(c["status"] == "degraded" for c in components):
        overall = "degraded"
    from django.utils import timezone
    return Response({"status": overall, "components": components, "checked_at": timezone.now().isoformat()})
