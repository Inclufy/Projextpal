"""
Methodology company-wide access regression tests (P1)
=====================================================

Locks in the P1 fix where each per-methodology project gate only allowed
superadmin / active team member / creator, and was MISSING the company-wide
role bypass that the canonical ``projects.views.accessible_project_ids``
already had.

Effect of the bug: a company admin/pm/program_manager who did NOT create the
project and is not an active team member got a 404 on every
Agile/Waterfall/Kanban/Scrum/PRINCE2 subresource — blocking the paying
customer Recare and the App-Review demo account (a company-wide admin on demo
projects it did not create).

Tested directly at the gate functions/mixins (no HTTP/router/permission layer
in the way, so the assertions are unambiguous):
  • company-wide admin/pm (non-member, non-creator) → reaches the project
  • cross-tenant admin (other company)              → Http404 (isolation)
  • same-tenant plain member (non-member)           → Http404 (not too open)
"""
import pytest
from django.contrib.auth import get_user_model
from django.http import Http404

from accounts.models import Company

User = get_user_model()


def _user(company, username, role):
    u = User.objects.create_user(
        username=username, email=f"{username}@example.com", password="pw12345!"
    )
    if hasattr(u, "company"):
        u.company = company
    if hasattr(u, "role"):
        u.role = role
    u.save()
    return u


class _FakeRequest:
    def __init__(self, user):
        self.user = user


@pytest.fixture
def world(db):
    a = Company.objects.create(name="Tenant A", is_subscribed=True)
    b = Company.objects.create(name="Tenant B", is_subscribed=True)
    from projects.models import Project
    owner = _user(a, "alice_owner", role="member")
    project = Project.objects.create(
        name="Company A project", company=a, methodology="agile", created_by=owner,
    )
    return {
        "a": a,
        "b": b,
        "project": project,
        "a_admin": _user(a, "amir_admin", role="admin"),        # company-wide, non-member
        "a_pm": _user(a, "priya_pm", role="pm"),                # company-wide, non-member
        "a_prog": _user(a, "pam_prog", role="program_manager"), # company-wide, non-member
        "b_admin": _user(b, "bob_admin", role="admin"),         # other tenant
        "a_member": _user(a, "mo_member", role="member"),       # same tenant, non-member
    }


# ── the five gate call-sites, each reduced to `lookup(user, project_id) -> raises Http404?`
def _agile_lookup(user, pid):
    from agile.views import _gated_project_lookup
    return _gated_project_lookup(user, pid)


def _waterfall_lookup(user, pid):
    from waterfall.views import _gated_project_lookup
    return _gated_project_lookup(user, pid)


def _mixin_lookup(module_path, user, pid):
    import importlib
    mixin = importlib.import_module(module_path).ProjectFilterMixin()
    mixin.request = _FakeRequest(user)
    mixin.kwargs = {"project_id": pid}
    return mixin.get_project()


def _kanban_lookup(user, pid):
    return _mixin_lookup("kanban.views", user, pid)


def _scrum_lookup(user, pid):
    return _mixin_lookup("scrum.views", user, pid)


def _prince2_lookup(user, pid):
    return _mixin_lookup("prince2.views", user, pid)


GATES = {
    "agile": _agile_lookup,
    "waterfall": _waterfall_lookup,
    "kanban": _kanban_lookup,
    "scrum": _scrum_lookup,
    "prince2": _prince2_lookup,
}


@pytest.mark.django_db
@pytest.mark.parametrize("methodology,gate", list(GATES.items()))
class TestMethodologyCompanyWideAccess:
    def test_company_admin_non_member_reaches_project(self, world, methodology, gate):
        proj = gate(world["a_admin"], world["project"].id)
        assert proj.id == world["project"].id, (
            f"P1 regression: company admin (non-member) blocked on {methodology}"
        )

    def test_company_pm_non_member_reaches_project(self, world, methodology, gate):
        proj = gate(world["a_pm"], world["project"].id)
        assert proj.id == world["project"].id, (
            f"P1 regression: company pm (non-member) blocked on {methodology}"
        )

    def test_company_program_manager_reaches_project(self, world, methodology, gate):
        proj = gate(world["a_prog"], world["project"].id)
        assert proj.id == world["project"].id, (
            f"P1 regression: program_manager (non-member) blocked on {methodology}"
        )

    def test_cross_tenant_admin_blocked(self, world, methodology, gate):
        with pytest.raises(Http404):
            gate(world["b_admin"], world["project"].id)

    def test_same_tenant_plain_member_blocked(self, world, methodology, gate):
        with pytest.raises(Http404):
            gate(world["a_member"], world["project"].id)


# scrum also exposes a boolean helper used by its APIViews — cover it too.
@pytest.mark.django_db
class TestScrumBooleanHelper:
    def test_company_admin_can_access(self, world):
        from scrum.views import _user_can_access_project
        assert _user_can_access_project(world["a_admin"], world["project"].id) is True

    def test_cross_tenant_admin_cannot(self, world):
        from scrum.views import _user_can_access_project
        assert _user_can_access_project(world["b_admin"], world["project"].id) is False

    def test_same_tenant_member_cannot(self, world):
        from scrum.views import _user_can_access_project
        assert _user_can_access_project(world["a_member"], world["project"].id) is False
