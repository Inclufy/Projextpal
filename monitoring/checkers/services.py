"""External service connectivity checker (Stripe, OpenAI, etc.)."""

import logging
import time
import requests

from monitoring.storage.db import record_health_check

logger = logging.getLogger("monitor.checkers.services")


def check_stripe(api_key=None):
    """Check Stripe API connectivity."""
    result = {
        "service": "Stripe",
        "status": "healthy",
        "response_time_ms": None,
        "details": None,
    }

    if not api_key:
        result["status"] = "skipped"
        result["details"] = "No Stripe API key configured"
        return result

    try:
        start = time.monotonic()
        resp = requests.get(
            "https://api.stripe.com/v1/balance",
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=10,
        )
        elapsed_ms = (time.monotonic() - start) * 1000
        result["response_time_ms"] = round(elapsed_ms, 1)

        if resp.status_code == 200:
            result["status"] = "healthy"
        elif resp.status_code == 401:
            result["status"] = "warning"
            result["details"] = "Stripe API key may be invalid"
        else:
            result["status"] = "degraded"
            result["details"] = f"Stripe returned HTTP {resp.status_code}"
    except requests.exceptions.ConnectionError:
        result["status"] = "down"
        result["details"] = "Cannot connect to Stripe API"
        logger.error("Stripe API connection failed")
    except requests.exceptions.Timeout:
        result["status"] = "timeout"
        result["details"] = "Stripe API request timed out"
    except Exception as e:
        result["status"] = "error"
        result["details"] = str(e)

    record_health_check("External:Stripe", "service", result["status"],
                        response_time_ms=result.get("response_time_ms"), details=result["details"])
    return result


def check_openai(api_key=None):
    """Check OpenAI API connectivity."""
    result = {
        "service": "OpenAI",
        "status": "healthy",
        "response_time_ms": None,
        "details": None,
    }

    if not api_key:
        result["status"] = "skipped"
        result["details"] = "No OpenAI API key configured"
        return result

    try:
        start = time.monotonic()
        resp = requests.get(
            "https://api.openai.com/v1/models",
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=10,
        )
        elapsed_ms = (time.monotonic() - start) * 1000
        result["response_time_ms"] = round(elapsed_ms, 1)

        if resp.status_code == 200:
            result["status"] = "healthy"
        elif resp.status_code == 401:
            result["status"] = "warning"
            result["details"] = "OpenAI API key may be invalid"
        elif resp.status_code == 429:
            result["status"] = "warning"
            result["details"] = "OpenAI rate limit reached"
        else:
            result["status"] = "degraded"
            result["details"] = f"OpenAI returned HTTP {resp.status_code}"
    except requests.exceptions.ConnectionError:
        result["status"] = "down"
        result["details"] = "Cannot connect to OpenAI API"
        logger.error("OpenAI API connection failed")
    except requests.exceptions.Timeout:
        result["status"] = "timeout"
        result["details"] = "OpenAI API request timed out"
    except Exception as e:
        result["status"] = "error"
        result["details"] = str(e)

    record_health_check("External:OpenAI", "service", result["status"],
                        response_time_ms=result.get("response_time_ms"), details=result["details"])
    return result


def check_all_services(config):
    """Check all configured external services."""
    results = []

    stripe_key = config.get("stripe_api_key")
    if stripe_key:
        results.append(check_stripe(stripe_key))

    openai_key = config.get("openai_api_key")
    if openai_key:
        results.append(check_openai(openai_key))

    return results
