"""SSL certificate expiry checker."""

import ssl
import socket
import logging
from datetime import datetime

from monitoring.storage.db import record_health_check

logger = logging.getLogger("monitor.checkers.ssl")


def check_ssl_certificate(app_config):
    """
    Check SSL certificate expiry for an HTTPS endpoint.
    Returns dict with expiry date, days remaining, and status.
    """
    app_name = app_config["name"]
    url = app_config.get("url", "")

    result = {
        "app_name": app_name,
        "check_type": "ssl",
        "status": "healthy",
        "days_remaining": None,
        "expiry_date": None,
        "issuer": None,
        "details": None,
    }

    # Only check HTTPS URLs
    if not url.startswith("https://"):
        result["status"] = "skipped"
        result["details"] = "Not an HTTPS endpoint"
        return result

    hostname = url.replace("https://", "").split("/")[0].split(":")[0]

    try:
        context = ssl.create_default_context()
        with socket.create_connection((hostname, 443), timeout=10) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()

        expiry_str = cert.get("notAfter", "")
        if expiry_str:
            expiry_date = datetime.strptime(expiry_str, "%b %d %H:%M:%S %Y %Z")
            days_remaining = (expiry_date - datetime.utcnow()).days
            result["expiry_date"] = expiry_date.isoformat()
            result["days_remaining"] = days_remaining

            issuer = dict(x[0] for x in cert.get("issuer", []))
            result["issuer"] = issuer.get("organizationName", "Unknown")

            if days_remaining <= 7:
                result["status"] = "critical"
                result["details"] = f"SSL certificate expires in {days_remaining} days!"
                logger.error("%s: SSL cert expires in %d days", app_name, days_remaining)
            elif days_remaining <= 30:
                result["status"] = "warning"
                result["details"] = f"SSL certificate expires in {days_remaining} days"
                logger.warning("%s: SSL cert expires in %d days", app_name, days_remaining)
            else:
                result["details"] = f"SSL certificate valid for {days_remaining} days"

    except ssl.SSLCertVerificationError as e:
        result["status"] = "critical"
        result["details"] = f"SSL verification failed: {e}"
        logger.error("%s: SSL verification failed: %s", app_name, e)
    except (socket.timeout, ConnectionRefusedError):
        result["status"] = "error"
        result["details"] = f"Cannot connect to {hostname}:443"
    except Exception as e:
        result["status"] = "error"
        result["details"] = f"SSL check error: {e}"
        logger.error("%s: SSL check error: %s", app_name, e)

    record_health_check(app_name, "ssl", result["status"], details=result["details"])
    return result
