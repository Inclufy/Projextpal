"""
Cross-tenant / IDOR isolation regression tests
==============================================

Locks in the P0/P1 multi-tenant leak fixes tracked in
``tests/regression/known_issues.json`` as BUG-023 … BUG-026. Each class
reproduces the ORIGINAL leak and asserts it is now closed, plus (where
relevant) a positive check that the legitimate owner still has access — so the
fix cannot regress into over-blocking either.

Threat model per test:
  • cross-tenant  — a logged-in user of company B must never see / reach a row
                    that belongs to company A (BUG-023, BUG-024, BUG-026).
  • intra-tenant  — a logged-in user of company A who is NOT a member of
                    project X must not see project X's rows (BUG-025).

Run:  pytest backend/tests/security/test_cross_tenant_isolation.py -v
"""
import datetime

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from accounts.models import Company

User = get_user_model()


# ─────────────────────────────────────────────────────────────────────────────
# helpers
# ─────────────────────────────────────────────────────────────────────────────
def _user(company, username, role="member"):
    u = User.objects.create_user(
        username=username, email=f"{username}@example.com", password="pw12345!"
    )
    if hasattr(u, "company"):
        u.company = company
    if hasattr(u, "role"):
        u.role = role
    u.save()
    return u


def _client(user):
    c = APIClient()
    c.force_authenticate(user=user)
    return c


def _ids(resp):
    """Row ids from a list response, tolerant of DRF pagination (dict w/ results)
    vs a plain list."""
    data = resp.json()
    rows = data["results"] if isinstance(data, dict) and "results" in data else data
    return [r["id"] for r in rows]


@pytest.fixture(autouse=True)
def _relax_ssl(settings):
    """Prod forces https (SECURE_SSL_REDIRECT); the test client speaks http →
    would 301 before reaching the view. Disable it for the assertions."""
    settings.SECURE_SSL_REDIRECT = False


@pytest.fixture
def tenants(db):
    """Two isolated companies, each with a plain-member user."""
    a = Company.objects.create(name="Tenant A", is_subscribed=True)
    b = Company.objects.create(name="Tenant B", is_subscribed=True)
    return {
        "a": a,
        "b": b,
        "a_owner": _user(a, "alice_owner"),      # creates + owns project A
        "b_intruder": _user(b, "bob_intruder"),  # different tenant
    }


# ─────────────────────────────────────────────────────────────────────────────
# BUG-024 — P0 cross-tenant IDOR on the agile retro-items detail route
#           /api/v1/agile/retro-items/<pk>/  (no project_id in the URL)
# ─────────────────────────────────────────────────────────────────────────────
@pytest.mark.django_db
class TestAgileRetroItemIDOR:
    def _make_retro_item(self, owner, company):
        from projects.models import Project
        from agile.models import AgileIteration, AgileRetrospective, AgileRetroItem

        project = Project.objects.create(
            name="Secret A", company=company, methodology="agile", created_by=owner,
        )
        it = AgileIteration.objects.create(
            project=project, name="Iter 1",
            start_date=datetime.date(2026, 1, 1), end_date=datetime.date(2026, 1, 14),
        )
        retro = AgileRetrospective.objects.create(iteration=it, date=datetime.date(2026, 1, 14))
        return AgileRetroItem.objects.create(
            retrospective=retro, category="went_well", content="tenant-A only secret",
        )

    def test_other_tenant_cannot_read_retro_item(self, tenants):
        item = self._make_retro_item(tenants["a_owner"], tenants["a"])
        resp = _client(tenants["b_intruder"]).get(f"/api/v1/agile/retro-items/{item.pk}/")
        assert resp.status_code == 404, (
            f"IDOR: tenant-B read tenant-A retro item (got {resp.status_code}, expected 404)"
        )

    def test_other_tenant_cannot_vote_retro_item(self, tenants):
        item = self._make_retro_item(tenants["a_owner"], tenants["a"])
        resp = _client(tenants["b_intruder"]).post(f"/api/v1/agile/retro-items/{item.pk}/vote/")
        assert resp.status_code == 404, (
            f"IDOR: tenant-B voted on tenant-A retro item (got {resp.status_code})"
        )
        item.refresh_from_db()
        assert item.votes == 0, "tenant-B's vote mutated tenant-A data"

    def test_owner_still_has_access(self, tenants):
        """Fix must not over-block: the legitimate creator still reads the item."""
        item = self._make_retro_item(tenants["a_owner"], tenants["a"])
        resp = _client(tenants["a_owner"]).get(f"/api/v1/agile/retro-items/{item.pk}/")
        assert resp.status_code == 200, (
            f"over-block: legitimate owner denied (got {resp.status_code})"
        )


# ─────────────────────────────────────────────────────────────────────────────
# BUG-024 (waterfall half) — P0: WaterfallProjectMixin looked up the project by id
#           with no access filter, so any tenant could read another tenant's
#           /projects/<id>/waterfall/* artifacts. Now gated by _gated_project_lookup.
# ─────────────────────────────────────────────────────────────────────────────
@pytest.mark.django_db
class TestWaterfallProjectGate:
    def _project(self, owner, company):
        from projects.models import Project
        return Project.objects.create(
            name="WF secret", company=company, methodology="waterfall", created_by=owner,
        )

    def test_other_tenant_cannot_read_waterfall_phases(self, tenants):
        project = self._project(tenants["a_owner"], tenants["a"])
        resp = _client(tenants["b_intruder"]).get(
            f"/api/v1/projects/{project.id}/waterfall/phases/"
        )
        assert resp.status_code == 404, (
            f"IDOR: tenant-B reached tenant-A waterfall phases (got {resp.status_code})"
        )

    def test_owner_can_read_waterfall_phases(self, tenants):
        project = self._project(tenants["a_owner"], tenants["a"])
        resp = _client(tenants["a_owner"]).get(
            f"/api/v1/projects/{project.id}/waterfall/phases/"
        )
        assert resp.status_code == 200, (
            f"over-block: owner denied their own waterfall phases (got {resp.status_code})"
        )


# ─────────────────────────────────────────────────────────────────────────────
# BUG-023 — P0 cross-tenant leak on governance viewsets (boards / stakeholders),
#           scoped through portfolio.company
# ─────────────────────────────────────────────────────────────────────────────
@pytest.mark.django_db
class TestGovernanceScoping:
    def _portfolio(self, owner, company):
        from governance.models import Portfolio
        return Portfolio.objects.create(name="Port A", company=company, owner=owner)

    def test_other_tenant_cannot_list_stakeholder(self, tenants):
        from governance.models import GovernanceStakeholder
        port = self._portfolio(tenants["a_owner"], tenants["a"])
        sh = GovernanceStakeholder.objects.create(
            user=tenants["a_owner"], role="sponsor", portfolio=port,
        )
        resp = _client(tenants["b_intruder"]).get("/api/v1/governance/stakeholders/")
        assert resp.status_code == 200
        ids = _ids(resp)
        assert sh.id not in ids, "leak: tenant-B saw tenant-A governance stakeholder"

    def test_other_tenant_cannot_list_board(self, tenants):
        from governance.models import GovernanceBoard
        port = self._portfolio(tenants["a_owner"], tenants["a"])
        board = GovernanceBoard.objects.create(
            name="Board A", board_type="project_board", portfolio=port,
        )
        resp = _client(tenants["b_intruder"]).get("/api/v1/governance/boards/")
        assert resp.status_code == 200
        ids = _ids(resp)
        assert board.id not in ids, "leak: tenant-B saw tenant-A governance board"


# ─────────────────────────────────────────────────────────────────────────────
# BUG-026 — P1 leak: ProgramViewSet returned every program in the company
#           (here asserted at the stronger cross-tenant boundary)
# ─────────────────────────────────────────────────────────────────────────────
@pytest.mark.django_db
class TestProgramScoping:
    def test_other_tenant_cannot_list_program(self, tenants):
        from programs.models import Program
        owner = tenants["a_owner"]
        prog = Program.objects.create(
            name="Prog A", program_code="PA-1", company=tenants["a"],
            program_manager=owner, executive_sponsor=owner, created_by=owner,
        )
        resp = _client(tenants["b_intruder"]).get("/api/v1/programs/")
        assert resp.status_code == 200
        ids = _ids(resp)
        assert prog.id not in ids, "leak: tenant-B saw tenant-A program"


# ─────────────────────────────────────────────────────────────────────────────
# BUG-025 — P1 intra-tenant leak: CompanyScopedQuerysetMixin was company-only,
#           leaking rows to same-company users who are not project members.
#           Milestone is representative of the whole mixin family
#           (tasks/subtasks/expenses/risks/events/…).
# ─────────────────────────────────────────────────────────────────────────────
@pytest.mark.django_db
class TestProjectMembershipScoping:
    def test_non_member_same_tenant_cannot_list_milestone(self, tenants):
        from projects.models import Project, Milestone
        owner = tenants["a_owner"]
        # a second company-A user who is NOT a member of the project and not admin
        outsider = _user(tenants["a"], "carol_nonmember", role="member")
        project = Project.objects.create(
            name="Private A", company=tenants["a"], methodology="agile", created_by=owner,
        )
        ms = Milestone.objects.create(project=project, name="M1", description="hidden")

        resp = _client(outsider).get("/api/v1/projects/milestones/")
        assert resp.status_code == 200
        ids = _ids(resp)
        assert ms.id not in ids, (
            "intra-tenant leak: same-company non-member saw a project's milestone"
        )

    def test_project_member_can_list_milestone(self, tenants):
        """Positive: the project creator (a member) still sees the milestone."""
        from projects.models import Project, Milestone
        owner = tenants["a_owner"]
        project = Project.objects.create(
            name="Private A2", company=tenants["a"], methodology="agile", created_by=owner,
        )
        ms = Milestone.objects.create(project=project, name="M2", description="visible")

        resp = _client(owner).get("/api/v1/projects/milestones/")
        assert resp.status_code == 200
        ids = _ids(resp)
        assert ms.id in ids, "over-block: project owner cannot see their own milestone"
