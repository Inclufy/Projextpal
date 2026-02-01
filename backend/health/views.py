from django.http import JsonResponse
from django.db import connection
from django.core.cache import cache
import time
from datetime import datetime


def health_check(request):
    """
    Health check endpoint that verifies the application is running properly.
    Returns status of database, cache, and overall application health.
    """
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "checks": {},
    }

    # Check database connectivity
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            health_status["checks"]["database"] = {
                "status": "healthy",
                "response_time_ms": 0,
            }
    except Exception as e:
        health_status["checks"]["database"] = {"status": "unhealthy", "error": str(e)}
        health_status["status"] = "unhealthy"

    # Check cache connectivity
    try:
        start_time = time.time()
        cache.set("health_check", "test", 10)
        cache.get("health_check")
        response_time = round((time.time() - start_time) * 1000, 2)
        health_status["checks"]["cache"] = {
            "status": "healthy",
            "response_time_ms": response_time,
        }
    except Exception as e:
        health_status["checks"]["cache"] = {"status": "unhealthy", "error": str(e)}
        health_status["status"] = "unhealthy"

    # Return appropriate HTTP status code
    status_code = 200 if health_status["status"] == "healthy" else 503

    return JsonResponse(health_status, status=status_code)


def simple_health_check(request):
    """
    Simple health check endpoint that just returns a basic status.
    Useful for load balancers and basic monitoring.
    """
    return JsonResponse({"status": "ok", "timestamp": datetime.utcnow().isoformat()})
