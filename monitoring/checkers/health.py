"""HTTP health endpoint checker for web applications."""

import time
import logging
import requests

from monitoring.storage.db import record_health_check

logger = logging.getLogger("monitor.checkers.health")


def check_http_health(app_config):
    """
    Check an application's HTTP health endpoint.
    Returns a dict with status, response_time_ms, http_status, and details.
    """
    app_name = app_config["name"]
    url = app_config.get("url", "")
    health_endpoint = app_config.get("health_endpoint", "/health/")
    max_response_time = app_config.get("max_response_time", 2000)
    full_url = f"{url.rstrip('/')}{health_endpoint}"

    result = {
        "app_name": app_name,
        "check_type": "http",
        "status": "unhealthy",
        "response_time_ms": None,
        "http_status": None,
        "details": None,
    }

    try:
        start = time.monotonic()
        response = requests.get(full_url, timeout=10)
        elapsed_ms = (time.monotonic() - start) * 1000

        result["response_time_ms"] = round(elapsed_ms, 1)
        result["http_status"] = response.status_code

        if response.status_code == 200:
            if elapsed_ms > max_response_time:
                result["status"] = "slow"
                result["details"] = f"Response time {elapsed_ms:.0f}ms exceeds threshold {max_response_time}ms"
                logger.warning("%s: slow response (%dms)", app_name, elapsed_ms)
            else:
                result["status"] = "healthy"
        elif response.status_code >= 500:
            result["status"] = "unhealthy"
            result["details"] = f"Server error: HTTP {response.status_code}"
            logger.error("%s: server error HTTP %d", app_name, response.status_code)
        else:
            result["status"] = "degraded"
            result["details"] = f"Unexpected status: HTTP {response.status_code}"
            logger.warning("%s: unexpected HTTP %d", app_name, response.status_code)

    except requests.exceptions.ConnectionError:
        result["status"] = "down"
        result["details"] = "Connection refused — service may be down"
        logger.error("%s: connection refused at %s", app_name, full_url)
    except requests.exceptions.Timeout:
        result["status"] = "timeout"
        result["details"] = "Health check timed out after 10s"
        logger.error("%s: health check timeout", app_name)
    except requests.exceptions.RequestException as e:
        result["status"] = "error"
        result["details"] = f"Request error: {str(e)}"
        logger.error("%s: request error: %s", app_name, e)

    record_health_check(
        app_name=result["app_name"],
        check_type=result["check_type"],
        status=result["status"],
        response_time_ms=result["response_time_ms"],
        details=result["details"],
        http_status=result["http_status"],
    )

    return result


def check_redis_health(app_config):
    """Check Redis connectivity via a simple socket connection."""
    import socket

    app_name = app_config["name"]
    url = app_config.get("url", "redis://localhost:6379")

    # Parse host and port from redis:// URL
    host = url.replace("redis://", "").split(":")[0]
    try:
        port = int(url.replace("redis://", "").split(":")[1].split("/")[0])
    except (IndexError, ValueError):
        port = 6379

    result = {
        "app_name": app_name,
        "check_type": "redis",
        "status": "unhealthy",
        "response_time_ms": None,
        "details": None,
    }

    try:
        start = time.monotonic()
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        sock.connect((host, port))
        sock.sendall(b"PING\r\n")
        response = sock.recv(64)
        elapsed_ms = (time.monotonic() - start) * 1000
        sock.close()

        result["response_time_ms"] = round(elapsed_ms, 1)
        if b"PONG" in response or b"NOAUTH" in response:
            # PONG = healthy, NOAUTH = Redis is running but requires auth (still healthy)
            result["status"] = "healthy"
        else:
            result["status"] = "degraded"
            result["details"] = f"Unexpected Redis response: {response.decode(errors='replace')}"
    except socket.timeout:
        result["status"] = "timeout"
        result["details"] = "Redis connection timed out"
        logger.error("%s: Redis timeout", app_name)
    except ConnectionRefusedError:
        result["status"] = "down"
        result["details"] = "Redis connection refused"
        logger.error("%s: Redis connection refused", app_name)
    except Exception as e:
        result["status"] = "error"
        result["details"] = str(e)
        logger.error("%s: Redis error: %s", app_name, e)

    record_health_check(
        app_name=result["app_name"],
        check_type=result["check_type"],
        status=result["status"],
        response_time_ms=result["response_time_ms"],
        details=result["details"],
    )

    return result
