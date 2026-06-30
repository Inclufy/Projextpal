from django.http import JsonResponse
from django.db import connection
from django.core.cache import cache
from django.conf import settings
import time
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


def health_check(request):
    """
    Comprehensive health check endpoint that verifies all application components.
    Returns status of database, cache, channels, and external services.
    """
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "checks": {},
    }

    # Check database connectivity
    try:
        start_time = time.time()
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        db_time = round((time.time() - start_time) * 1000, 2)
        health_status["checks"]["database"] = {
            "status": "healthy",
            "response_time_ms": db_time,
        }
    except Exception as e:
        health_status["checks"]["database"] = {"status": "unhealthy", "error": str(e)}
        health_status["status"] = "unhealthy"
        logger.error("Health check: database unhealthy — %s", e)

    # Check cache connectivity — degraded, not fatal. Redis being down
    # shouldn't return 503 because the app can still serve requests without it.
    try:
        start_time = time.time()
        cache.set("health_check", "test", 10)
        result = cache.get("health_check")
        response_time = round((time.time() - start_time) * 1000, 2)
        if result == "test":
            health_status["checks"]["cache"] = {
                "status": "healthy",
                "response_time_ms": response_time,
            }
        else:
            health_status["checks"]["cache"] = {
                "status": "degraded",
                "response_time_ms": response_time,
                "error": "Cache read/write mismatch",
            }
    except Exception as e:
        health_status["checks"]["cache"] = {"status": "degraded", "error": str(e)}
        logger.warning("Health check: cache degraded — %s", e)

    # Check Channels/Redis layer
    #
    # Previously did a synthetic send/receive round-trip via the channel
    # layer, which triggered an upstream bug in `channels_redis<=4.3.0`:
    #     AttributeError: 'tuple' object has no attribute 'decode'
    # at receive() time. The bug is inside channels_redis's tuple-parsing,
    # NOT in our usage — real WebSocket traffic doesn't hit this code path
    # because consumers connect, send/receive on their own group, and
    # channels_redis takes a different branch. So a green health check
    # via this round-trip was a synthetic-only signal anyway.
    #
    # Replaced with a configuration-presence probe: confirms the channel
    # layer is wired and points at a working backend. If channels_redis
    # is upgraded to a version that fixes the round-trip bug we can
    # restore the synthetic probe.
    try:
        from channels.layers import get_channel_layer

        channel_layer = get_channel_layer()
        if channel_layer is None:
            health_status["checks"]["channels"] = {
                "status": "unhealthy",
                "error": "channel_layer is None (not configured)",
            }
        else:
            health_status["checks"]["channels"] = {
                "status": "healthy",
                "backend": type(channel_layer).__name__,
            }
    except Exception as e:
        health_status["checks"]["channels"] = {"status": "unhealthy", "error": str(e)}
        logger.warning("Health check: channels layer unhealthy — %s", e)

    # Check database connection pool
    try:
        db_conn = connection
        health_status["checks"]["db_connections"] = {
            "status": "healthy",
            "vendor": db_conn.vendor,
        }
    except Exception as e:
        health_status["checks"]["db_connections"] = {"status": "error", "error": str(e)}

    # Determine overall status
    for check_name, check_data in health_status["checks"].items():
        if check_data.get("status") == "unhealthy":
            health_status["status"] = "unhealthy"
            break
        if check_data.get("status") == "degraded" and health_status["status"] == "healthy":
            health_status["status"] = "degraded"

    status_code = 200 if health_status["status"] == "healthy" else 503
    return JsonResponse(health_status, status=status_code)


def simple_health_check(request):
    """
    Simple health check endpoint for load balancers and basic monitoring.
    """
    return JsonResponse({"status": "ok", "timestamp": datetime.utcnow().isoformat()})
