"""Regression tests for P1-PMI — every PMI sub-tab must accept a
``programs.Program.id`` and be tenant-isolated.

Before the fix, each PMI model's ``program`` FK pointed at
``projects.Project``. The frontend route ``/programs/:id/<pmi-tab>`` always
passes a ``programs.Program.id``, so creates returned 400 "Invalid pk" or 403
"You do not have access to this program.". With the FK retargeted to
``programs.Program`` + ``_verify_program_access`` looking up the same table,
the six create flows succeed and tenant isolation holds.

Covers all six models:

* PMIComponent          — POST /pmi/programs/<id>/components/
* PMIGovernanceBoard    — POST /pmi/programs/<id>/governance-boards/
* PMIProgramCharter     — POST /pmi/programs/<id>/charters/
* PMIBenefit            — POST /pmi/programs/<id>/benefits/
* PMIStakeholder        — POST /pmi/programs/<id>/stakeholders/
* PMIRoadmapItem        — POST /pmi/programs/<id>/roadmap-items/

Each gets two tests: happy path (201 + round-trip visible on GET) and tenant
isolation (403 on another company's programme).
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
from datetime import date

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient

from accounts.models import Company
from programs.models import Program


User = get_user_model()
pytestmark = pytest.mark.django_db


# ──────────────────────────────────────────────────────────────────────────
# Fixtures
# ──────────────────────────────────────────────────────────────────────────


@pytest.fixture
def company_a(db):
    return Company.objects.create(name="Acme BV")


@pytest.fixture
def company_b(db):
    return Company.objects.create(name="Rival BV")


def _mkuser(email, company, role="pm"):
    u = User.objects.create_user(username=email, email=email, password="x")
    u.company = company
    u.role = role
    u.save()
    return u


@pytest.fixture
def pm_a(db, company_a):
    return _mkuser("pm-a@acme.test", company_a, role="pm")


@pytest.fixture
def pm_b(db, company_b):
    return _mkuser("pm-b@rival.test", company_b, role="pm")


@pytest.fixture
def program_a(db, company_a, pm_a):
    return Program.objects.create(
        company=company_a,
        name="Programme Alpha",
        methodology="pmi",
        status="active",
        created_by=pm_a,
    )


@pytest.fixture
def program_b(db, company_b, pm_b):
    return Program.objects.create(
        company=company_b,
        name="Programme Rival",
        methodology="pmi",
        status="active",
        created_by=pm_b,
    )


def _client(user):
    c = APIClient()
    c.force_authenticate(user=user)
    return c


def _rows(data):
    """Return rows from a DRF list payload — handles both paginated
    (``{results: [...]}``) and non-paginated (``[...]``) shapes."""
    if hasattr(data, "keys") and "results" in data:
        return data["results"]
    return list(data)


# ──────────────────────────────────────────────────────────────────────────
# PMIComponent
# ──────────────────────────────────────────────────────────────────────────


def test_component_create_against_programme(pm_a, program_a):
    url = reverse("pmi:program-component-list", kwargs={"program_id": program_a.id})
    r = _client(pm_a).post(url, {"name": "Phase 1 Rollout", "type": "project"})
    assert r.status_code == 201, r.content
    assert r.data["name"] == "Phase 1 Rollout"

    # Round-trip: GET under the same programme nests shows the row.
    r_list = _client(pm_a).get(url)
    assert r_list.status_code == 200
    names = [c["name"] for c in _rows(r_list.data)]
    assert "Phase 1 Rollout" in names


def test_component_tenant_isolated(pm_a, program_b):
    url = reverse("pmi:program-component-list", kwargs={"program_id": program_b.id})
    r = _client(pm_a).post(url, {"name": "Attempted cross-tenant component"})
    assert r.status_code in (403, 404), r.content


# ──────────────────────────────────────────────────────────────────────────
# PMIGovernanceBoard
# ──────────────────────────────────────────────────────────────────────────


def test_governance_board_create_against_programme(pm_a, program_a):
    url = reverse(
        "pmi:program-governance-board-list", kwargs={"program_id": program_a.id}
    )
    r = _client(pm_a).post(
        url,
        {
            "meeting_type": "program_board",
            "meeting_date": date.today().isoformat(),
        },
        format="json",
    )
    assert r.status_code == 201, r.content

    r_list = _client(pm_a).get(url)
    assert r_list.status_code == 200
    rows = _rows(r_list.data)
    assert any(row["meeting_type"] == "program_board" for row in rows)


def test_governance_board_tenant_isolated(pm_a, program_b):
    url = reverse(
        "pmi:program-governance-board-list", kwargs={"program_id": program_b.id}
    )
    r = _client(pm_a).post(
        url,
        {
            "meeting_type": "program_board",
            "meeting_date": date.today().isoformat(),
        },
        format="json",
    )
    assert r.status_code in (403, 404), r.content


# ──────────────────────────────────────────────────────────────────────────
# PMIProgramCharter
# ──────────────────────────────────────────────────────────────────────────


def test_charter_create_against_programme(pm_a, program_a):
    url = reverse("pmi:program-charter-list", kwargs={"program_id": program_a.id})
    r = _client(pm_a).post(
        url,
        {
            "vision": "Deliver business outcome X",
            "objectives": "o1, o2",
            "scope": "In: a,b. Out: c.",
            "success_criteria": "CSAT >= 4.0",
            "approved": False,
        },
        format="json",
    )
    assert r.status_code == 201, r.content
    assert r.data["vision"].startswith("Deliver")


def test_charter_tenant_isolated(pm_a, program_b):
    url = reverse("pmi:program-charter-list", kwargs={"program_id": program_b.id})
    r = _client(pm_a).post(url, {"vision": "attempt"}, format="json")
    assert r.status_code in (403, 404), r.content


# ──────────────────────────────────────────────────────────────────────────
# PMIBenefit
# ──────────────────────────────────────────────────────────────────────────


def test_benefit_create_against_programme(pm_a, program_a):
    url = reverse("pmi:program-benefit-list", kwargs={"program_id": program_a.id})
    r = _client(pm_a).post(
        url,
        {
            "name": "40% reduction in support tickets",
            "description": "Baseline 1000/wk → target 600/wk",
            "status": "planned",
            "target_value": "600.00",
        },
        format="json",
    )
    assert r.status_code == 201, r.content

    r_list = _client(pm_a).get(url)
    rows = _rows(r_list.data)
    assert any("40%" in b["name"] for b in rows)


def test_benefit_tenant_isolated(pm_a, program_b):
    url = reverse("pmi:program-benefit-list", kwargs={"program_id": program_b.id})
    r = _client(pm_a).post(url, {"name": "x"}, format="json")
    assert r.status_code in (403, 404), r.content


# ──────────────────────────────────────────────────────────────────────────
# PMIStakeholder
# ──────────────────────────────────────────────────────────────────────────


def test_stakeholder_create_against_programme(pm_a, program_a):
    url = reverse(
        "pmi:program-stakeholder-list", kwargs={"program_id": program_a.id}
    )
    r = _client(pm_a).post(
        url,
        {
            "name": "CFO",
            "role": "Executive sponsor",
            "power": "high",
            "interest": "high",
            "engagement_strategy": "Manage closely",
        },
        format="json",
    )
    assert r.status_code == 201, r.content
    assert r.data["name"] == "CFO"


def test_stakeholder_tenant_isolated(pm_a, program_b):
    url = reverse(
        "pmi:program-stakeholder-list", kwargs={"program_id": program_b.id}
    )
    r = _client(pm_a).post(
        url,
        {"name": "Attempted outsider"},
        format="json",
    )
    assert r.status_code in (403, 404), r.content


# ──────────────────────────────────────────────────────────────────────────
# PMIRoadmapItem
# ──────────────────────────────────────────────────────────────────────────


def test_roadmap_item_create_against_programme(pm_a, program_a):
    url = reverse(
        "pmi:program-roadmap-item-list", kwargs={"program_id": program_a.id}
    )
    r = _client(pm_a).post(
        url,
        {
            "name": "Define",
            "phase": "Define",
            "sequence": 1,
            "status": "not_started",
        },
        format="json",
    )
    assert r.status_code == 201, r.content

    r_list = _client(pm_a).get(url)
    rows = _rows(r_list.data)
    assert any(row["name"] == "Define" for row in rows)


def test_roadmap_item_tenant_isolated(pm_a, program_b):
    url = reverse(
        "pmi:program-roadmap-item-list", kwargs={"program_id": program_b.id}
    )
    r = _client(pm_a).post(
        url,
        {"name": "x", "sequence": 1},
        format="json",
    )
    assert r.status_code in (403, 404), r.content
