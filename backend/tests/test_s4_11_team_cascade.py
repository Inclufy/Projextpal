"""S4-11 — Team-membership cascade for time registration.

Covers:
  * ``ProgramTeam.cascade_to_project_teams()``: happy-path, idempotent,
    ``project_ids=None`` → all linked projects, empty list = no-op.
  * ``POST /api/v1/programs/<pk>/team/<team_member_id>/cascade/``: 401
    unauthenticated, 403 non-admin, 200 happy-path with tenant isolation.
  * Model defaults: ``GovernanceStakeholder.can_log_time`` and
    ``BoardMember.can_log_time`` default False; ``Company.require_project_
    membership_for_time_entry`` defaults True.
  * TimeEntry picker filter: strict mode (ProjectTeam-only), loose mode
    (all company projects), governance role-holder with
    ``can_log_time=False`` is blocked.
  * Backward-compat: a historical ProjectTeam row + TimeEntry row from
    before the migration still works and still lets the owner log hours.

Run under SQLite:  USE_SQLITE=1 python -m pytest tests/test_s4_11_team_cascade.py -v
"""
from __future__ import annotations

# Shim: the dev environment has langchain>=0.3 where ``create_agent`` is no
# longer exported from ``langchain.agents`` — but ``bot/ai/__init__.py``
# still imports it at module import time, which breaks URL resolution for
# ANY test that calls an /api/v1/... endpoint. Stub it so URL conf loads;
# we never exercise bot in this test module.
try:
    from langchain.agents import create_agent  # noqa: F401
except ImportError:  # pragma: no cover — purely a test-env shim
    import langchain.agents as _la
    from unittest.mock import MagicMock

    def _stub_create_agent(*_a, **_kw):
        # bot.ai is never exercised by this test module — return a mock
        # so bot.views module-import does not crash.
        return MagicMock()

    _la.create_agent = _stub_create_agent  # type: ignore[attr-defined]

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from accounts.models import Company
from projects.models import Project, ProjectTeam, TimeEntry
from programs.models import Program, ProgramTeam
from governance.models import (
    BoardMember,
    GovernanceBoard,
    GovernanceStakeholder,
)

User = get_user_model()


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def tenant(db):
    return Company.objects.create(name="Tenant A")


@pytest.fixture
def tenant_other(db):
    return Company.objects.create(name="Tenant B")


@pytest.fixture
def admin_user(db, tenant):
    u = User.objects.create_user(
        username="admin_a", email="admin_a@example.com", password="pw",
    )
    u.company = tenant
    u.role = "admin"
    u.save()
    return u


@pytest.fixture
def pm_user(db, tenant):
    u = User.objects.create_user(
        username="pm_a", email="pm_a@example.com", password="pw",
    )
    u.company = tenant
    u.role = "pm"
    u.save()
    return u


@pytest.fixture
def regular_user(db, tenant):
    u = User.objects.create_user(
        username="reg_a", email="reg_a@example.com", password="pw",
    )
    u.company = tenant
    u.role = "guest"
    u.save()
    return u


@pytest.fixture
def program_manager_user(db, tenant):
    u = User.objects.create_user(
        username="pgm_a", email="pgm_a@example.com", password="pw",
    )
    u.company = tenant
    u.role = "program_manager"
    u.save()
    return u


@pytest.fixture
def program(db, tenant, admin_user):
    return Program.objects.create(
        company=tenant, name="Program One", created_by=admin_user,
    )


@pytest.fixture
def linked_projects(db, tenant, admin_user, program):
    projects = [
        Project.objects.create(
            company=tenant, name=f"Project {i}", created_by=admin_user,
        )
        for i in range(1, 4)
    ]
    for p in projects:
        program.projects.add(p)
    return projects


# ---------------------------------------------------------------------------
# 1. ProgramTeam.cascade_to_project_teams()
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_cascade_happy_path_creates_3_projectteam_rows(
    program, linked_projects, program_manager_user, admin_user,
):
    """Cascading a ProgramTeam row to 3 linked projects creates 3 rows."""
    member = ProgramTeam.objects.create(
        program=program, user=program_manager_user, added_by=admin_user,
        role="program_manager",
    )
    created, skipped = member.cascade_to_project_teams(
        project_ids=[p.id for p in linked_projects], added_by=admin_user,
    )
    assert len(created) == 3
    assert skipped == []
    rows = ProjectTeam.objects.filter(user=program_manager_user, is_active=True)
    assert rows.count() == 3
    first = rows.first()
    # Methodology choice: can_view_costs=True, hourly_rate=0, is_active=True.
    assert first.can_view_costs is True
    assert float(first.hourly_rate) == 0.0
    assert first.added_by == admin_user


@pytest.mark.django_db
def test_cascade_is_idempotent(
    program, linked_projects, program_manager_user, admin_user,
):
    """Calling cascade twice does not create duplicates."""
    member = ProgramTeam.objects.create(
        program=program, user=program_manager_user, added_by=admin_user,
    )
    member.cascade_to_project_teams(
        project_ids=[p.id for p in linked_projects], added_by=admin_user,
    )
    created2, skipped2 = member.cascade_to_project_teams(
        project_ids=[p.id for p in linked_projects], added_by=admin_user,
    )
    assert created2 == []
    assert set(skipped2) == {p.id for p in linked_projects}
    assert ProjectTeam.objects.filter(user=program_manager_user).count() == 3


@pytest.mark.django_db
def test_cascade_none_means_all_linked(
    program, linked_projects, program_manager_user, admin_user,
):
    """project_ids=None fans out to every project linked to the program."""
    member = ProgramTeam.objects.create(
        program=program, user=program_manager_user, added_by=admin_user,
    )
    created, _ = member.cascade_to_project_teams(
        project_ids=None, added_by=admin_user,
    )
    assert len(created) == 3


@pytest.mark.django_db
def test_cascade_empty_list_is_noop(
    program, linked_projects, program_manager_user, admin_user,
):
    """Passing an empty project_ids list creates no rows."""
    member = ProgramTeam.objects.create(
        program=program, user=program_manager_user, added_by=admin_user,
    )
    created, skipped = member.cascade_to_project_teams(
        project_ids=[], added_by=admin_user,
    )
    assert created == []
    assert skipped == []
    assert ProjectTeam.objects.filter(user=program_manager_user).count() == 0


@pytest.mark.django_db
def test_cascade_only_touches_linked_projects(
    program, linked_projects, program_manager_user, admin_user, tenant,
):
    """A caller cannot cascade into a project outside the program (even in
    the same tenant). Those ids are silently dropped — defence in depth."""
    orphan = Project.objects.create(
        company=tenant, name="Orphan", created_by=admin_user,
    )
    member = ProgramTeam.objects.create(
        program=program, user=program_manager_user, added_by=admin_user,
    )
    created, _ = member.cascade_to_project_teams(
        project_ids=[orphan.id] + [p.id for p in linked_projects],
        added_by=admin_user,
    )
    assert len(created) == 3
    assert not ProjectTeam.objects.filter(
        project=orphan, user=program_manager_user,
    ).exists()


# ---------------------------------------------------------------------------
# 2. HTTP endpoint — cascade
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_cascade_endpoint_401_unauthenticated(
    program, linked_projects, program_manager_user, admin_user,
):
    member = ProgramTeam.objects.create(
        program=program, user=program_manager_user, added_by=admin_user,
    )
    client = APIClient()
    r = client.post(
        f"/api/v1/programs/{program.id}/team/{member.id}/cascade/",
        {"project_ids": [linked_projects[0].id]},
        format="json",
    )
    assert r.status_code == 401


@pytest.mark.django_db
def test_cascade_endpoint_403_non_admin(
    program, linked_projects, program_manager_user, admin_user, regular_user,
):
    """A guest who can see the program but is not admin/pm/program-manager
    is refused — the ``get_object`` lookup succeeds (they are on the team)
    but the role gate inside the action returns 403."""
    member = ProgramTeam.objects.create(
        program=program, user=program_manager_user, added_by=admin_user,
    )
    # Make the guest a member so they can see the program (otherwise
    # ``get_object`` 404s on them, which is also a valid denial but masks
    # the role gate we want to prove here).
    ProgramTeam.objects.create(
        program=program, user=regular_user, added_by=admin_user,
    )
    client = APIClient()
    client.force_authenticate(regular_user)
    r = client.post(
        f"/api/v1/programs/{program.id}/team/{member.id}/cascade/",
        {"project_ids": [linked_projects[0].id]},
        format="json",
    )
    assert r.status_code == 403


@pytest.mark.django_db
def test_cascade_endpoint_200_admin_tenant_isolation(
    program, linked_projects, program_manager_user, admin_user, tenant_other,
):
    """Admin of tenant A gets 200; a project id from tenant B is silently
    dropped from the cascade (never created)."""
    foreign_project = Project.objects.create(
        company=tenant_other, name="B's project", created_by=admin_user,
    )
    member = ProgramTeam.objects.create(
        program=program, user=program_manager_user, added_by=admin_user,
    )
    client = APIClient()
    client.force_authenticate(admin_user)
    r = client.post(
        f"/api/v1/programs/{program.id}/team/{member.id}/cascade/",
        {
            "project_ids": (
                [p.id for p in linked_projects] + [foreign_project.id]
            )
        },
        format="json",
    )
    assert r.status_code == 200
    body = r.json()
    assert len(body["created_project_teams"]) == 3
    assert body["skipped_duplicates"] == []
    assert not ProjectTeam.objects.filter(
        project=foreign_project, user=program_manager_user,
    ).exists()


# ---------------------------------------------------------------------------
# 3. Model defaults
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_governance_stakeholder_can_log_time_defaults_false(
    tenant, admin_user, program,
):
    s = GovernanceStakeholder.objects.create(
        user=admin_user, role="executive_sponsor", program=program,
    )
    assert s.can_log_time is False


@pytest.mark.django_db
def test_board_member_can_log_time_defaults_false(
    tenant, admin_user, program,
):
    board = GovernanceBoard.objects.create(
        name="Program Board", board_type="program_board", program=program,
    )
    bm = BoardMember.objects.create(board=board, user=admin_user, role="chair")
    assert bm.can_log_time is False


@pytest.mark.django_db
def test_company_require_project_membership_for_time_entry_defaults_true(db):
    c = Company.objects.create(name="New tenant")
    assert c.require_project_membership_for_time_entry is True


# ---------------------------------------------------------------------------
# 4. TimeEntry project-select filter
# ---------------------------------------------------------------------------

def _available(client, user):
    client.force_authenticate(user)
    r = client.get("/api/v1/projects/time-entries/available-projects/")
    assert r.status_code == 200, r.content
    return {row["id"] for row in r.json()}


@pytest.mark.django_db
def test_timeentry_strict_mode_returns_only_projectteam_projects(
    tenant, admin_user, regular_user,
):
    """Default (strict) mode: a non-admin only sees projects they are an
    active ProjectTeam member on. Other company projects are hidden."""
    assert tenant.require_project_membership_for_time_entry is True
    p_in = Project.objects.create(
        company=tenant, name="On team", created_by=admin_user,
    )
    p_out = Project.objects.create(
        company=tenant, name="Not on team", created_by=admin_user,
    )
    ProjectTeam.objects.create(
        project=p_in, user=regular_user, is_active=True, added_by=admin_user,
    )
    client = APIClient()
    ids = _available(client, regular_user)
    assert p_in.id in ids
    assert p_out.id not in ids


@pytest.mark.django_db
def test_timeentry_loose_mode_returns_all_company_projects(
    tenant, admin_user, regular_user,
):
    """Loose mode (tenant turned the strict knob off): the picker shows
    every company project even when the user is on no ProjectTeam."""
    tenant.require_project_membership_for_time_entry = False
    tenant.save(update_fields=["require_project_membership_for_time_entry"])
    p1 = Project.objects.create(
        company=tenant, name="One", created_by=admin_user,
    )
    p2 = Project.objects.create(
        company=tenant, name="Two", created_by=admin_user,
    )
    client = APIClient()
    ids = _available(client, regular_user)
    assert {p1.id, p2.id}.issubset(ids)


@pytest.mark.django_db
def test_timeentry_governance_cannot_log_time_hides_all_projects(
    tenant, admin_user, regular_user, program,
):
    """A user who sits on a governance board / is a stakeholder, and every
    such row has can_log_time=False, gets an empty picker — even if they
    happen to also sit on a ProjectTeam somewhere."""
    board = GovernanceBoard.objects.create(
        name="Oversight", board_type="program_board", program=program,
    )
    BoardMember.objects.create(
        board=board, user=regular_user, role="observer", can_log_time=False,
    )
    # The user is ALSO on a project team — the governance veto wins.
    p = Project.objects.create(
        company=tenant, name="Side project", created_by=admin_user,
    )
    ProjectTeam.objects.create(
        project=p, user=regular_user, is_active=True, added_by=admin_user,
    )
    client = APIClient()
    ids = _available(client, regular_user)
    assert ids == set()


@pytest.mark.django_db
def test_timeentry_governance_with_can_log_time_true_unlocks_filter(
    tenant, admin_user, regular_user, program,
):
    """Working-chair pattern: a tenant can flip can_log_time=True on a
    governance row to let that person log hours; the strict filter still
    applies on top (so they only see their ProjectTeam projects)."""
    board = GovernanceBoard.objects.create(
        name="Working chair", board_type="program_board", program=program,
    )
    BoardMember.objects.create(
        board=board, user=regular_user, role="chair", can_log_time=True,
    )
    p = Project.objects.create(
        company=tenant, name="Delivery", created_by=admin_user,
    )
    ProjectTeam.objects.create(
        project=p, user=regular_user, is_active=True, added_by=admin_user,
    )
    client = APIClient()
    ids = _available(client, regular_user)
    assert ids == {p.id}


# ---------------------------------------------------------------------------
# 5. Backward compatibility
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_backward_compat_existing_projectteam_and_timeentry_unaffected(
    tenant, admin_user, regular_user,
):
    """A pre-S4-11 ProjectTeam row + TimeEntry row still works unchanged:
    the owner can still see the project in the picker and the historical
    time-entry row is still visible via the standard queryset."""
    from datetime import date
    p = Project.objects.create(
        company=tenant, name="Historical", created_by=admin_user,
    )
    ProjectTeam.objects.create(
        project=p, user=regular_user, is_active=True, added_by=admin_user,
    )
    entry = TimeEntry.objects.create(
        project=p, user=regular_user, hours=1, date=date.today(),
        description="legacy",
    )
    client = APIClient()
    ids = _available(client, regular_user)
    assert p.id in ids
    # Historical entry is still queryable via /api/v1/projects/time-entries/
    client.force_authenticate(regular_user)
    r = client.get("/api/v1/projects/time-entries/")
    assert r.status_code == 200
    returned = r.json()
    returned_rows = returned if isinstance(returned, list) else returned.get("results", [])
    assert any(row["id"] == entry.id for row in returned_rows)
