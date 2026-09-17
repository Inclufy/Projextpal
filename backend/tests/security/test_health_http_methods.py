"""
Health-endpoint HTTP-method allowlist regression tests
======================================================

Locks in the fix for sonar python:S3752 on ``backend/health/views.py``: both
health views were plain function views without a method allowlist, so Django
handed them every verb — a POST/PUT/PATCH/DELETE to ``/health/`` ran the full
probe (DB query, cache write, channel-layer lookup) and answered with the same
status report.

The endpoints are read-only probes. Everything that polls them — the Control
Tower, the GitLab deploy gate, the compose healthchecks, the load balancer —
uses GET, and a load balancer may use HEAD, so the allowlist is exactly
``["GET", "HEAD"]``.

SECURE_SSL_REDIRECT is forced off here: it defaults to True when DEBUG=False
(CI), and the 301 from SecurityMiddleware would mask the status code the view
layer actually returns.

Run:  pytest backend/tests/security/test_health_http_methods.py -v
"""
import pytest
from django.test import override_settings

# Both mount points of health.urls (core/urls.py keeps the legacy /health/
# next to the /api/v1/ prefix the mobile and web clients use).
FULL_HEALTH_PATHS = ["/health/", "/api/v1/health/"]
SIMPLE_HEALTH_PATHS = ["/health/simple/", "/api/v1/health/simple/"]
ALL_HEALTH_PATHS = FULL_HEALTH_PATHS + SIMPLE_HEALTH_PATHS

WRITE_METHODS = ["post", "put", "patch", "delete"]


@override_settings(SECURE_SSL_REDIRECT=False)
@pytest.mark.django_db
@pytest.mark.parametrize("path", ALL_HEALTH_PATHS)
@pytest.mark.parametrize("method", WRITE_METHODS)
def test_write_methods_are_rejected(client, path, method):
    """A write verb never reaches the probe body — 405, with an Allow header."""
    response = getattr(client, method)(path)

    assert response.status_code == 405, (
        f"{method.upper()} {path} returned {response.status_code}, expected 405"
    )
    allow = response.headers.get("Allow", "")
    assert set(allow.replace(" ", "").split(",")) == {"GET", "HEAD"}


@override_settings(SECURE_SSL_REDIRECT=False)
@pytest.mark.django_db
@pytest.mark.parametrize("path", SIMPLE_HEALTH_PATHS)
def test_simple_health_check_allows_get_and_head(client, path):
    """The load-balancer probe keeps working on both GET and HEAD."""
    assert client.get(path).status_code == 200
    assert client.head(path).status_code == 200


@override_settings(SECURE_SSL_REDIRECT=False)
@pytest.mark.django_db
@pytest.mark.parametrize("path", FULL_HEALTH_PATHS)
def test_full_health_check_allows_get_and_head(client, path):
    """
    The full probe still answers GET/HEAD. Its status code depends on the
    components it checks (200 healthy/degraded, 503 unhealthy — the channel
    layer is not wired in the test env), so only "not rejected" is asserted.
    """
    assert client.get(path).status_code in (200, 503)
    assert client.head(path).status_code in (200, 503)
