"""Sprint 7 — timesheet-required + budgeted-hours.

Covers:
  * Model defaults on new ProjectTeam / ProgramTeam rows.
  * PATCH .../team/<id>/budget/ endpoints — happy path, auth, tenant.
  * GET  .../time-vs-budget/ endpoints — happy path, empty, exceeded status,
    tenant isolation. Program variant aggregates over child projects.
  * TimeEntry POST — budget_warning surfaces only when crossed, is absent
    when the member has no budget set, and is absent when under budget.
  * Backward-compat: a historical ProjectTeam row without a budget still
    allows logging hours and the endpoints behave sanely.

Run under SQLite:
    USE_SQLITE=1 python -m pytest tests/test_s7_timesheet_budget.py -v
"""
from __future__ import annotations

# Shim: the dev env has langchain>=0.3 where ``create_agent`` is no
# longer exported from ``langchain.agents``, but ``bot/ai/__init__.py``
# still imports it at module-load, which breaks URL resolution for ANY
# test that calls an /api/v1/... endpoint. Stub it so URL conf loads;
# we never exercise bot in this module.
try:
    from langchain.agents import create_agent  # noqa: F401
except ImportError:  # pragma: no cover — purely a test-env shim
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
from programs.models import Program, ProgramTeam

User = get_user_model()


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def tenant(db):
    return Company.objects.create(name="S7 Tenant")


@pytest.fixture
def tenant_other(db):
    return Company.objects.create(name="S7 Other")


@pytest.fixture
def admin_user(db, tenant):
    u = User.objects.create_user(
        username="s7_admin", email="s7_admin@example.com", password="pw",
    )
    u.company = tenant
    u.role = "admin"
    u.save()
    return u


@pytest.fixture
def admin_other(db, tenant_other):
    u = User.objects.create_user(
        username="s7_admin_b", email="s7_admin_b@example.com", password="pw",
    )
    u.company = tenant_other
    u.role = "admin"
    u.save()
    return u


@pytest.fixture
def pm_user(db, tenant):
    u = User.objects.create_user(
        username="s7_pm", email="s7_pm@example.com", password="pw",
    )
    u.company = tenant
    u.role = "pm"
    u.save()
    return u


@pytest.fixture
def regular_user(db, tenant):
    u = User.objects.create_user(
        username="s7_reg", email="s7_reg@example.com", password="pw",
    )
    u.company = tenant
    u.role = "guest"
    u.save()
    return u


@pytest.fixture
def project(db, tenant, admin_user):
    return Project.objects.create(
        company=tenant, name="S7 Project", created_by=admin_user,
    )


@pytest.fixture
def program(db, tenant, admin_user):
    return Program.objects.create(
        company=tenant, name="S7 Program", created_by=admin_user,
    )


# ---------------------------------------------------------------------------
# 1. Model defaults
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_projectteam_defaults(project, regular_user, admin_user):
    pt = ProjectTeam.objects.create(
        project=project, user=regular_user, added_by=admin_user,
    )
    assert pt.timesheet_required is True
    assert pt.budgeted_hours is None


@pytest.mark.django_db
def test_programteam_defaults(program, regular_user, admin_user):
    pt = ProgramTeam.objects.create(
        program=program, user=regular_user, added_by=admin_user,
    )
    assert pt.timesheet_required is True
    assert pt.budgeted_hours is None


# ---------------------------------------------------------------------------
# 2. PATCH project team budget endpoint
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_project_set_budget_happy_path(project, regular_user, admin_user):
    pt = ProjectTeam.objects.create(
        project=project, user=regular_user, added_by=admin_user,
    )
    client = APIClient()
    client.force_authenticate(admin_user)
    r = client.patch(
        f"/api/v1/projects/{project.id}/team/{pt.id}/budget/",
        {"timesheet_required": False, "budgeted_hours": "40.00"},
        format="json",
    )
    assert r.status_code == 200, r.content
    pt.refresh_from_db()
    assert pt.timesheet_required is False
    assert pt.budgeted_hours == Decimal("40.00")


@pytest.mark.django_db
def test_project_set_budget_null_clears(project, regular_user, admin_user):
    pt = ProjectTeam.objects.create(
        project=project, user=regular_user, added_by=admin_user,
        budgeted_hours=Decimal("20.00"),
    )
    client = APIClient()
    client.force_authenticate(admin_user)
    r = client.patch(
        f"/api/v1/projects/{project.id}/team/{pt.id}/budget/",
        {"budgeted_hours": None},
        format="json",
    )
    assert r.status_code == 200
    pt.refresh_from_db()
    assert pt.budgeted_hours is None


@pytest.mark.django_db
def test_project_set_budget_401(project, regular_user, admin_user):
    pt = ProjectTeam.objects.create(
        project=project, user=regular_user, added_by=admin_user,
    )
    client = APIClient()
    r = client.patch(
        f"/api/v1/projects/{project.id}/team/{pt.id}/budget/",
        {"budgeted_hours": "10"}, format="json",
    )
    assert r.status_code == 401


@pytest.mark.django_db
def test_project_set_budget_403_guest(project, regular_user, admin_user):
    pt = ProjectTeam.objects.create(
        project=project, user=regular_user, added_by=admin_user,
    )
    client = APIClient()
    client.force_authenticate(regular_user)  # guest — not admin/pm
    r = client.patch(
        f"/api/v1/projects/{project.id}/team/{pt.id}/budget/",
        {"budgeted_hours": "5"}, format="json",
    )
    assert r.status_code == 403


@pytest.mark.django_db
def test_project_set_budget_tenant_isolation(
    project, regular_user, admin_user, admin_other,
):
    pt = ProjectTeam.objects.create(
        project=project, user=regular_user, added_by=admin_user,
    )
    client = APIClient()
    client.force_authenticate(admin_other)  # admin of tenant B
    r = client.patch(
        f"/api/v1/projects/{project.id}/team/{pt.id}/budget/",
        {"budgeted_hours": "99"}, format="json",
    )
    assert r.status_code == 403
    pt.refresh_from_db()
    assert pt.budgeted_hours is None


@pytest.mark.django_db
def test_project_set_budget_rejects_negative(project, regular_user, admin_user):
    pt = ProjectTeam.objects.create(
        project=project, user=regular_user, added_by=admin_user,
    )
    client = APIClient()
    client.force_authenticate(admin_user)
    r = client.patch(
        f"/api/v1/projects/{project.id}/team/{pt.id}/budget/",
        {"budgeted_hours": "-1"}, format="json",
    )
    assert r.status_code == 400


# ---------------------------------------------------------------------------
# 3. GET project time-vs-budget
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_project_time_vs_budget_empty(project, admin_user):
    client = APIClient()
    client.force_authenticate(admin_user)
    r = client.get(f"/api/v1/projects/{project.id}/time-vs-budget/")
    assert r.status_code == 200
    assert r.json() == []


@pytest.mark.django_db
def test_project_time_vs_budget_happy_and_status_buckets(
    project, admin_user, regular_user, pm_user,
):
    # Member 1 — on_track (50%)
    pt1 = ProjectTeam.objects.create(
        project=project, user=regular_user, added_by=admin_user,
        budgeted_hours=Decimal("20.00"),
    )
    TimeEntry.objects.create(
        project=project, user=regular_user, date=date.today(),
        hours=Decimal("10.00"),
    )
    # Member 2 — exceeded (>100%)
    pt2 = ProjectTeam.objects.create(
        project=project, user=pm_user, added_by=admin_user,
        budgeted_hours=Decimal("8.00"),
    )
    TimeEntry.objects.create(
        project=project, user=pm_user, date=date.today(),
        hours=Decimal("10.00"),
    )
    # Member 3 — no budget (NULL) → OMITTED
    other = User.objects.create_user(
        username="s7_other", email="s7_other@example.com", password="pw",
    )
    other.company = project.company
    other.save()
    ProjectTeam.objects.create(
        project=project, user=other, added_by=admin_user,
    )

    client = APIClient()
    client.force_authenticate(admin_user)
    r = client.get(f"/api/v1/projects/{project.id}/time-vs-budget/")
    assert r.status_code == 200
    rows = r.json()
    assert len(rows) == 2
    by_user = {row["user_id"]: row for row in rows}
    assert by_user[regular_user.id]["status"] == "on_track"
    assert by_user[regular_user.id]["pct"] == 50.0
    assert by_user[pm_user.id]["status"] == "exceeded"
    assert by_user[pm_user.id]["pct"] == 125.0


@pytest.mark.django_db
def test_project_time_vs_budget_approaching_bucket(
    project, admin_user, regular_user,
):
    ProjectTeam.objects.create(
        project=project, user=regular_user, added_by=admin_user,
        budgeted_hours=Decimal("10.00"),
    )
    TimeEntry.objects.create(
        project=project, user=regular_user, date=date.today(),
        hours=Decimal("9.00"),  # 90% exact — approaching
    )
    client = APIClient()
    client.force_authenticate(admin_user)
    r = client.get(f"/api/v1/projects/{project.id}/time-vs-budget/")
    rows = r.json()
    assert rows[0]["status"] == "approaching"
    assert rows[0]["pct"] == 90.0


@pytest.mark.django_db
def test_project_time_vs_budget_401(project):
    client = APIClient()
    r = client.get(f"/api/v1/projects/{project.id}/time-vs-budget/")
    assert r.status_code == 401


@pytest.mark.django_db
def test_project_time_vs_budget_403_other_tenant(project, admin_other):
    client = APIClient()
    client.force_authenticate(admin_other)
    r = client.get(f"/api/v1/projects/{project.id}/time-vs-budget/")
    assert r.status_code == 403


# ---------------------------------------------------------------------------
# 4. Program time-vs-budget aggregates over child projects
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_program_time_vs_budget_aggregates_child_projects(
    program, admin_user, pm_user,
):
    # Two child projects for the program; each gets some TimeEntry rows
    # for the same user. We expect the program widget to show the sum.
    p1 = Project.objects.create(
        company=program.company, name="S7 P1", created_by=admin_user,
    )
    p2 = Project.objects.create(
        company=program.company, name="S7 P2", created_by=admin_user,
    )
    program.projects.add(p1, p2)

    ProgramTeam.objects.create(
        program=program, user=pm_user, added_by=admin_user,
        budgeted_hours=Decimal("20.00"),
    )
    TimeEntry.objects.create(
        project=p1, user=pm_user, date=date.today(), hours=Decimal("8.00"),
    )
    TimeEntry.objects.create(
        project=p2, user=pm_user, date=date.today(), hours=Decimal("4.00"),
    )

    client = APIClient()
    client.force_authenticate(admin_user)
    r = client.get(f"/api/v1/programs/{program.id}/time-vs-budget/")
    assert r.status_code == 200
    rows = r.json()
    assert len(rows) == 1
    assert rows[0]["user_id"] == pm_user.id
    assert rows[0]["actual_hours"] == 12.0  # 8 + 4
    assert rows[0]["budgeted_hours"] == 20.0
    assert rows[0]["pct"] == 60.0
    assert rows[0]["status"] == "on_track"


@pytest.mark.django_db
def test_program_time_vs_budget_401(program):
    client = APIClient()
    r = client.get(f"/api/v1/programs/{program.id}/time-vs-budget/")
    assert r.status_code == 401


@pytest.mark.django_db
def test_program_time_vs_budget_403_other_tenant(program, admin_other):
    client = APIClient()
    client.force_authenticate(admin_other)
    r = client.get(f"/api/v1/programs/{program.id}/time-vs-budget/")
    assert r.status_code == 403


@pytest.mark.django_db
def test_program_time_vs_budget_omits_rows_without_budget(
    program, admin_user, regular_user, pm_user,
):
    p1 = Project.objects.create(
        company=program.company, name="S7 P-ONE", created_by=admin_user,
    )
    program.projects.add(p1)
    # One row has a budget, the other does not.
    ProgramTeam.objects.create(
        program=program, user=pm_user, added_by=admin_user,
        budgeted_hours=Decimal("10.00"),
    )
    ProgramTeam.objects.create(
        program=program, user=regular_user, added_by=admin_user,
    )
    TimeEntry.objects.create(
        project=p1, user=regular_user, date=date.today(),
        hours=Decimal("5.00"),
    )

    client = APIClient()
    client.force_authenticate(admin_user)
    r = client.get(f"/api/v1/programs/{program.id}/time-vs-budget/")
    assert r.status_code == 200
    rows = r.json()
    assert len(rows) == 1
    assert rows[0]["user_id"] == pm_user.id


# ---------------------------------------------------------------------------
# 5. Program team add — fields pass through
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_program_team_add_sets_timesheet_and_budget(
    program, admin_user, pm_user,
):
    client = APIClient()
    client.force_authenticate(admin_user)
    r = client.post(
        f"/api/v1/programs/{program.id}/team/add/",
        {
            "user_id": pm_user.id,
            "role": "program_manager",
            "timesheet_required": False,
            "budgeted_hours": "80.00",
        },
        format="json",
    )
    assert r.status_code == 201, r.content
    body = r.json()
    assert body["timesheet_required"] is False
    # DRF may serialize as string — tolerate both.
    assert float(body["budgeted_hours"]) == 80.0


@pytest.mark.django_db
def test_program_team_add_cascade_inherits_timesheet_required(
    program, admin_user, pm_user,
):
    """Cascading a ProgramTeam with timesheet_required=False should mint
    ProjectTeam rows that also have timesheet_required=False, and should
    leave budgeted_hours NULL on every project row (program budget is NOT
    automatically split)."""
    p1 = Project.objects.create(
        company=program.company, name="S7 CP-1", created_by=admin_user,
    )
    p2 = Project.objects.create(
        company=program.company, name="S7 CP-2", created_by=admin_user,
    )
    program.projects.add(p1, p2)
    member = ProgramTeam.objects.create(
        program=program, user=pm_user, added_by=admin_user,
        timesheet_required=False,
        budgeted_hours=Decimal("80.00"),
    )
    created, _ = member.cascade_to_project_teams(
        project_ids=[p1.id, p2.id], added_by=admin_user,
    )
    assert len(created) == 2
    for pt in created:
        assert pt.timesheet_required is False
        assert pt.budgeted_hours is None


# ---------------------------------------------------------------------------
# 6. TimeEntry save surfaces budget_warning when over
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_time_entry_create_adds_budget_warning_when_over(
    project, admin_user, pm_user,
):
    ProjectTeam.objects.create(
        project=project, user=pm_user, added_by=admin_user,
        budgeted_hours=Decimal("5.00"),
    )
    client = APIClient()
    client.force_authenticate(pm_user)
    # Over the budget right away (6 > 5).
    r = client.post(
        "/api/v1/projects/time-entries/",
        {
            "project": project.id,
            "date": str(date.today()),
            "hours": "6.00",
            "description": "worked over",
        },
        format="json",
    )
    assert r.status_code == 201, r.content
    body = r.json()
    assert body.get("budget_warning") is not None
    assert body["budget_warning"]["budgeted_hours"] == 5.0
    assert body["budget_warning"]["actual_hours_after_save"] == 6.0
    assert body["budget_warning"]["pct"] == 120.0


@pytest.mark.django_db
def test_time_entry_create_no_warning_when_under_budget(
    project, admin_user, pm_user,
):
    ProjectTeam.objects.create(
        project=project, user=pm_user, added_by=admin_user,
        budgeted_hours=Decimal("40.00"),
    )
    client = APIClient()
    client.force_authenticate(pm_user)
    r = client.post(
        "/api/v1/projects/time-entries/",
        {
            "project": project.id,
            "date": str(date.today()),
            "hours": "2.00",
            "description": "normal day",
        },
        format="json",
    )
    assert r.status_code == 201
    body = r.json()
    assert body.get("budget_warning") is None


@pytest.mark.django_db
def test_time_entry_create_no_warning_when_budget_is_null(
    project, admin_user, pm_user,
):
    ProjectTeam.objects.create(
        project=project, user=pm_user, added_by=admin_user,
        budgeted_hours=None,
    )
    client = APIClient()
    client.force_authenticate(pm_user)
    r = client.post(
        "/api/v1/projects/time-entries/",
        {
            "project": project.id,
            "date": str(date.today()),
            "hours": "99.00",
            "description": "no cap",
        },
        format="json",
    )
    assert r.status_code == 201
    body = r.json()
    assert body.get("budget_warning") is None


# ---------------------------------------------------------------------------
# 7. Backward-compat — pre-S7 ProjectTeam rows still work
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_backward_compat_old_projectteam_row(project, admin_user, pm_user):
    """A ProjectTeam row that pre-dates S7 — i.e. created with no S7 fields
    — must still be able to log time without crashing, and the warning
    must stay None."""
    ProjectTeam.objects.create(
        project=project, user=pm_user, added_by=admin_user,
    )
    client = APIClient()
    client.force_authenticate(pm_user)
    r = client.post(
        "/api/v1/projects/time-entries/",
        {
            "project": project.id,
            "date": str(date.today()),
            "hours": "4.00",
            "description": "legacy row",
        },
        format="json",
    )
    assert r.status_code == 201
    body = r.json()
    assert body.get("budget_warning") is None
