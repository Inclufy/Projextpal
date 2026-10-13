"""Sprint 7 — S7-06..S7-09 backend tests (10 cases).

Run under: USE_SQLITE=1 pytest backend/tests/test_s7_cost_planner.py -v

Covers:

* S7-06 — ``Company.default_hourly_rate`` + ``ProgramTeam.hourly_rate`` fields.
* S7-07 — ``/projects/<pk>/time-vs-budget-cost/`` happy path, 403 without
  ``can_view_costs``, tenant isolation, and ``/programs/<pk>/.../`` roll-up.
* S7-08 — ``ProjectResourceAllocation`` CRUD, constraint ``end_date >=
  start_date``, tenant isolation, grouped-by-member endpoint shape.
* S7-09 — ``/users/<pk>/capacity/`` happy path, date-range filter,
  overcommit flag, and tenant isolation.
"""

# Shim langchain.agents.create_agent for dev envs that ship langchain>=0.3
# without that symbol. Mirrors backend/conftest.py — the collection order is
# different when running this file in isolation, so keep it defensive.
try:  # pragma: no cover
    from langchain.agents import create_agent  # noqa: F401
except ImportError:  # pragma: no cover
    import langchain.agents as _la

    def _stub_create_agent(*_a, **_kw):
        class _StubAgent:
            def invoke(self, *_a, **_kw):
                return {"output": "stub"}

        return _StubAgent()

    _la.create_agent = _stub_create_agent  # type: ignore[attr-defined]


import pytest
from datetime import date, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from accounts.models import Company
from execution.models import ProjectResourceAllocation
from programs.models import Program, ProgramTeam
from projects.models import Project, ProjectTeam, TimeEntry

User = get_user_model()

pytestmark = pytest.mark.django_db


# ──────────────────────────────────────────────────────────────────────────
# Local fixtures — kept small and self-contained so the test file is
# readable without jumping into tests/conftest.py.
# ──────────────────────────────────────────────────────────────────────────


@pytest.fixture
def company_a(db):
    return Company.objects.create(name="Acme BV", default_hourly_rate=Decimal("90.00"))


@pytest.fixture
def company_b(db):
    return Company.objects.create(name="Rival BV", default_hourly_rate=Decimal("50.00"))


def _mkuser(email, company, role="pm"):
    u = User.objects.create_user(username=email, email=email, password="x")
    u.company = company
    u.role = role
    u.first_name = email.split("@")[0].capitalize()
    u.save()
    return u


@pytest.fixture
def pm_a(db, company_a):
    return _mkuser("pm-a@acme.test", company_a, role="pm")


@pytest.fixture
def contributor_a(db, company_a):
    return _mkuser("contrib-a@acme.test", company_a, role="contibuter")


@pytest.fixture
def pm_b(db, company_b):
    return _mkuser("pm-b@rival.test", company_b, role="pm")


@pytest.fixture
def superadmin(db, company_a):
    u = User.objects.create_user(
        username="super", email="super@acme.test", password="x",
        is_staff=True, is_superuser=True,
    )
    u.company = company_a
    u.role = "superadmin"
    u.save()
    return u


@pytest.fixture
def project_a(db, company_a, pm_a):
    p = Project.objects.create(
        company=company_a, name="Project Alpha", status="in_progress",
        created_by=pm_a,
    )
    return p


@pytest.fixture
def project_b(db, company_b, pm_b):
    return Project.objects.create(
        company=company_b, name="Project Rival", status="in_progress",
        created_by=pm_b,
    )


def _client(user):
    c = APIClient()
    c.force_authenticate(user=user)
    return c


# ──────────────────────────────────────────────────────────────────────────
# S7-06 — field + default-rate fallback.
# ──────────────────────────────────────────────────────────────────────────


def test_s7_06_company_default_hourly_rate_field_exists(company_a):
    # Field default behaves as expected when the row was built with it set.
    assert company_a.default_hourly_rate == Decimal("90.00")
    fresh = Company.objects.create(name="New One")
    assert fresh.default_hourly_rate == Decimal("0")


def test_s7_06_program_team_hourly_rate_field_defaults(company_a, pm_a):
    program = Program.objects.create(company=company_a, name="Alpha Program")
    pt = ProgramTeam.objects.create(program=program, user=pm_a)
    # Field exists and defaults to 0 (= "no override, use company default").
    assert hasattr(pt, "hourly_rate")
    assert (pt.hourly_rate or 0) == 0


# ──────────────────────────────────────────────────────────────────────────
# S7-07 — cost dashboard.
# ──────────────────────────────────────────────────────────────────────────


def test_s7_07_project_cost_endpoint_happy_path(company_a, pm_a, project_a):
    pt = ProjectTeam.objects.create(
        project=project_a, user=pm_a, hourly_rate=Decimal("120.00"),
        can_view_costs=True,
    )
    # Give pt budgeted hours only if the field exists post-rebase; else
    # the endpoint still returns 0 and status "on_track" — the structure is
    # what matters.
    if hasattr(pt, "budgeted_hours"):
        pt.budgeted_hours = Decimal("40")
        pt.save()
    TimeEntry.objects.create(
        project=project_a, user=pm_a, date=date.today(), hours=Decimal("10"),
    )

    resp = _client(pm_a).get(f"/api/v1/projects/{project_a.id}/time-vs-budget-cost/")
    assert resp.status_code == 200, resp.content
    body = resp.json()
    assert body["project_id"] == project_a.id
    assert len(body["rows"]) == 1
    row = body["rows"][0]
    assert row["user_id"] == pm_a.id
    # Rate is the explicit override — 120 regardless of whether S7-01..05 landed.
    assert row["hourly_rate"] == 120.0
    assert row["actual_hours"] == 10.0
    assert row["actual_cost"] == 1200.0
    assert "overall_pct" in body
    assert "totals" in body


def test_s7_07_project_cost_endpoint_rejects_without_can_view_costs(
    company_a, project_a, contributor_a,
):
    """A contributor (role not in COST_VIEWER_ROLES) must get 403, not an
    empty list — the dashboard refuses to silently withhold data."""
    ProjectTeam.objects.create(
        project=project_a, user=contributor_a, hourly_rate=Decimal("0"),
    )
    resp = _client(contributor_a).get(
        f"/api/v1/projects/{project_a.id}/time-vs-budget-cost/"
    )
    assert resp.status_code == 403, resp.content


def test_s7_07_project_cost_endpoint_tenant_isolation(
    project_a, pm_b,
):
    """A PM from company_b must not see company_a's project costs — 404
    (project not in their accessible set), never 200."""
    resp = _client(pm_b).get(f"/api/v1/projects/{project_a.id}/time-vs-budget-cost/")
    assert resp.status_code == 404


def test_s7_07_program_cost_endpoint_aggregates_across_projects(
    company_a, pm_a, project_a,
):
    program = Program.objects.create(company=company_a, name="Alpha Program")
    program.projects.add(project_a)
    ProjectTeam.objects.create(
        project=project_a, user=pm_a, hourly_rate=Decimal("100.00"),
    )
    TimeEntry.objects.create(
        project=project_a, user=pm_a, date=date.today(), hours=Decimal("5"),
    )
    resp = _client(pm_a).get(f"/api/v1/programs/{program.id}/time-vs-budget-cost/")
    assert resp.status_code == 200, resp.content
    body = resp.json()
    assert body["program_id"] == program.id
    assert body["project_count"] == 1
    assert len(body["rows"]) == 1
    assert body["rows"][0]["actual_cost"] == 500.0


# ──────────────────────────────────────────────────────────────────────────
# S7-08 — Resource planner CRUD + Gantt payload shape.
# ──────────────────────────────────────────────────────────────────────────


def test_s7_08_create_allocation_happy_path(company_a, pm_a, project_a):
    pt = ProjectTeam.objects.create(project=project_a, user=pm_a)
    today = date.today()
    resp = _client(pm_a).post(
        f"/api/v1/projects/{project_a.id}/resource-plan/",
        {
            "project_team_id": pt.id,
            "start_date": today.isoformat(),
            "end_date": (today + timedelta(days=4)).isoformat(),
            "allocated_hours": "20",
            "note": "ontwerp fase",
        },
        format="json",
    )
    assert resp.status_code == 201, resp.content
    body = resp.json()
    assert body["project_team_id"] == pt.id
    assert body["allocated_hours"] == 20.0
    assert body["note"] == "ontwerp fase"
    assert ProjectResourceAllocation.objects.filter(pk=body["id"]).exists()


def test_s7_08_allocation_crud_update_and_delete(company_a, pm_a, project_a):
    pt = ProjectTeam.objects.create(project=project_a, user=pm_a)
    today = date.today()
    a = ProjectResourceAllocation.objects.create(
        project_team=pt, start_date=today, end_date=today + timedelta(days=3),
        allocated_hours=Decimal("15"), created_by=pm_a,
    )
    client = _client(pm_a)
    patch = client.patch(
        f"/api/v1/execution/resource-plan/{a.id}/",
        {"allocated_hours": "25", "note": "revised"},
        format="json",
    )
    assert patch.status_code == 200, patch.content
    assert patch.json()["allocated_hours"] == 25.0
    assert patch.json()["note"] == "revised"
    delete = client.delete(f"/api/v1/execution/resource-plan/{a.id}/")
    assert delete.status_code == 204
    assert not ProjectResourceAllocation.objects.filter(pk=a.id).exists()


def test_s7_08_allocation_rejects_end_before_start(company_a, pm_a, project_a):
    pt = ProjectTeam.objects.create(project=project_a, user=pm_a)
    today = date.today()
    resp = _client(pm_a).post(
        f"/api/v1/projects/{project_a.id}/resource-plan/",
        {
            "project_team_id": pt.id,
            "start_date": today.isoformat(),
            "end_date": (today - timedelta(days=1)).isoformat(),
            "allocated_hours": "4",
        },
        format="json",
    )
    assert resp.status_code == 400, resp.content


def test_s7_08_resource_plan_endpoint_groups_by_member(company_a, pm_a, project_a):
    pt = ProjectTeam.objects.create(project=project_a, user=pm_a)
    today = date.today()
    ProjectResourceAllocation.objects.create(
        project_team=pt, start_date=today, end_date=today + timedelta(days=2),
        allocated_hours=Decimal("8"),
    )
    ProjectResourceAllocation.objects.create(
        project_team=pt, start_date=today + timedelta(days=5),
        end_date=today + timedelta(days=10), allocated_hours=Decimal("12"),
    )
    resp = _client(pm_a).get(f"/api/v1/projects/{project_a.id}/resource-plan/")
    assert resp.status_code == 200
    body = resp.json()
    assert body["member_count"] == 1
    assert body["total_allocated_hours"] == 20.0
    (row,) = body["rows"]
    assert row["project_team_id"] == pt.id
    assert len(row["allocations"]) == 2


def test_s7_08_allocation_tenant_isolation(project_a, pm_a, pm_b):
    """A PM from company_b must get 404 when accessing company_a's
    resource plan — the project is not in their accessible set."""
    ProjectTeam.objects.create(project=project_a, user=pm_a)
    resp = _client(pm_b).get(f"/api/v1/projects/{project_a.id}/resource-plan/")
    assert resp.status_code == 404


# ──────────────────────────────────────────────────────────────────────────
# S7-09 — Capacity dashboard.
# ──────────────────────────────────────────────────────────────────────────


def test_s7_09_user_capacity_happy_path(company_a, pm_a, project_a):
    pt = ProjectTeam.objects.create(project=project_a, user=pm_a)
    today = date.today()
    ProjectResourceAllocation.objects.create(
        project_team=pt, start_date=today, end_date=today + timedelta(days=9),
        allocated_hours=Decimal("40"),
    )
    TimeEntry.objects.create(
        project=project_a, user=pm_a, date=today, hours=Decimal("8"),
    )
    resp = _client(pm_a).get(
        f"/api/v1/users/{pm_a.id}/capacity/"
        f"?from={today.isoformat()}&to={(today + timedelta(days=9)).isoformat()}"
    )
    assert resp.status_code == 200, resp.content
    body = resp.json()
    assert body["user_id"] == pm_a.id
    assert body["working_days_in_range"] >= 1
    assert body["fte_hours_in_range"] == body["working_days_in_range"] * 8
    assert len(body["projects"]) == 1
    assert body["projects"][0]["allocated_hours"] == 40.0
    assert body["total_actual"] == 8.0
    assert "total_fte_pct" in body
    assert "is_overcommitted" in body


def test_s7_09_user_capacity_overcommit_flag(company_a, pm_a, project_a):
    """Allocate way more hours than fit the window — total_fte_pct>100 and
    is_overcommitted True."""
    pt = ProjectTeam.objects.create(project=project_a, user=pm_a)
    today = date.today()
    # 5-day window = 40 FTE hours. Allocate 100 hours over it → ~250%.
    ProjectResourceAllocation.objects.create(
        project_team=pt, start_date=today, end_date=today + timedelta(days=4),
        allocated_hours=Decimal("100"),
    )
    resp = _client(pm_a).get(
        f"/api/v1/users/{pm_a.id}/capacity/"
        f"?from={today.isoformat()}&to={(today + timedelta(days=4)).isoformat()}"
    )
    assert resp.status_code == 200, resp.content
    body = resp.json()
    assert body["total_fte_pct"] > 100.0
    assert body["is_overcommitted"] is True


def test_s7_09_user_capacity_tenant_isolation(company_a, company_b, pm_a, pm_b):
    """A PM in company_b must not see pm_a's capacity (same role, other
    company) — 404, not an empty payload."""
    resp = _client(pm_b).get(f"/api/v1/users/{pm_a.id}/capacity/")
    assert resp.status_code == 404


def test_s7_09_user_capacity_superadmin_can_cross_tenant(superadmin, pm_b):
    """Superadmin is tenant-spanning — they CAN read any user's capacity."""
    resp = _client(superadmin).get(f"/api/v1/users/{pm_b.id}/capacity/")
    assert resp.status_code == 200
    body = resp.json()
    assert body["user_id"] == pm_b.id
