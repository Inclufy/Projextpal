"""Sprint 9 S9-02 — Lessons-learned budget vs actual rollup.

Covers:
  * Happy path — rollup returns per-member variance + top-level totals
    and surfaces an "overvraagd" insight for the member > +15%.
  * Tenant isolation — a user from another company cannot read this
    project's rollup (403).

Run under SQLite:
    USE_SQLITE=1 SECRET_KEY=test python -m pytest tests/test_s9_02_lessons_budget.py -v
"""
from __future__ import annotations

# Same langchain shim as the s7/s9-01 modules.
try:
    from langchain.agents import create_agent  # noqa: F401
except ImportError:  # pragma: no cover
    import langchain.agents as _la
    from unittest.mock import MagicMock

    def _stub_create_agent(*_a, **_kw):
        return MagicMock()

    _la.create_agent = _stub_create_agent  # type: ignore[attr-defined]

from datetime import date
from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from accounts.models import Company
from projects.models import Project, ProjectTeam, TimeEntry

User = get_user_model()


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def tenant(db):
    return Company.objects.create(name="S9 Lessons Tenant")


@pytest.fixture
def tenant_other(db):
    return Company.objects.create(name="S9 Lessons Other")


@pytest.fixture
def admin_user(db, tenant):
    u = User.objects.create_user(
        username="s9l_admin", email="s9l_admin@example.com", password="pw",
    )
    u.company = tenant
    u.role = "admin"
    u.save()
    return u


@pytest.fixture
def admin_other(db, tenant_other):
    u = User.objects.create_user(
        username="s9l_other", email="s9l_other@example.com", password="pw",
    )
    u.company = tenant_other
    u.role = "admin"
    u.save()
    return u


@pytest.fixture
def jan(db, tenant):
    u = User.objects.create_user(
        username="s9l_jan",
        email="jan@example.com",
        password="pw",
        first_name="Jan",
        last_name="Jansen",
    )
    u.company = tenant
    u.role = "contributor"
    u.save()
    return u


@pytest.fixture
def piet(db, tenant):
    u = User.objects.create_user(
        username="s9l_piet",
        email="piet@example.com",
        password="pw",
        first_name="Piet",
        last_name="Pietersen",
    )
    u.company = tenant
    u.role = "contributor"
    u.save()
    return u


@pytest.fixture
def project(db, tenant, admin_user):
    return Project.objects.create(
        company=tenant, name="S9 Lessons Project", created_by=admin_user,
    )


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_budget_comparison_happy_path(project, admin_user, jan, piet):
    """Jan is 20% overvraagd (240/200), Piet is on track (200/200)."""
    ProjectTeam.objects.create(
        project=project, user=jan, added_by=admin_user,
        budgeted_hours=Decimal("200.00"),
    )
    ProjectTeam.objects.create(
        project=project, user=piet, added_by=admin_user,
        budgeted_hours=Decimal("200.00"),
    )
    # Jan logs 240 across two entries, Piet logs 200.
    TimeEntry.objects.create(
        project=project, user=jan, date=date.today(),
        hours=Decimal("140.00"), description="phase 1",
    )
    TimeEntry.objects.create(
        project=project, user=jan, date=date.today(),
        hours=Decimal("100.00"), description="phase 2",
    )
    TimeEntry.objects.create(
        project=project, user=piet, date=date.today(),
        hours=Decimal("200.00"), description="all phases",
    )

    client = APIClient()
    client.force_authenticate(admin_user)
    r = client.get(f"/api/v1/projects/{project.id}/lessons/budget-comparison/")
    assert r.status_code == 200, r.content
    body = r.json()

    assert body["project_id"] == project.id
    assert body["budgeted_hours_total"] == 400.0
    assert body["actual_hours_total"] == 440.0
    # (440 - 400) / 400 = 10%
    assert body["variance_pct"] == 10.0

    by_user = {m["user_id"]: m for m in body["per_member"]}
    assert by_user[jan.id]["budgeted_hours"] == 200.0
    assert by_user[jan.id]["actual_hours"] == 240.0
    assert by_user[jan.id]["variance_pct"] == 20.0
    assert by_user[piet.id]["variance_pct"] == 0.0

    # Insight line surfaces Jan (> +15%) with an actionable sentence.
    joined = " || ".join(body["insights"])
    assert "Jan" in joined
    assert "20" in joined
    assert "FTE" in joined


@pytest.mark.django_db
def test_budget_comparison_tenant_isolation(project, admin_user, admin_other):
    """A user outside the project's company gets 403."""
    client = APIClient()
    client.force_authenticate(admin_other)
    r = client.get(f"/api/v1/projects/{project.id}/lessons/budget-comparison/")
    assert r.status_code == 403, r.content


@pytest.mark.django_db
def test_budget_comparison_requires_auth(project):
    """Anonymous → 401."""
    client = APIClient()
    r = client.get(f"/api/v1/projects/{project.id}/lessons/budget-comparison/")
    assert r.status_code == 401
