"""Tests for the Inclufy-Best-Practice exception in
MethodologyMatchesProjectPermission.

Inclufy Best Practice "borrows" PRINCE2's Light Business Case + Charter, so
an Inclufy project (methodology='inclufy') must be allowed to hit the
prince2 business-case / project-brief endpoints — but NOT other prince2
stage-governance endpoints (stages, exceptions, …) which don't apply to
the lightweight method.
"""
import pytest
from unittest.mock import Mock

from rest_framework.exceptions import PermissionDenied

from projects.permissions import MethodologyMatchesProjectPermission
from projects.models import Project


@pytest.fixture
def inclufy_project(db, user, company):
    return Project.objects.create(
        name="BP",
        company=company,
        methodology="inclufy",
        created_by=user,
    )


@pytest.fixture
def prince2_project(db, user, company):
    return Project.objects.create(
        name="P2",
        company=company,
        methodology="prince2",
        created_by=user,
    )


def _req(path):
    r = Mock()
    r.path = path
    return r


def _view(project_id):
    v = Mock()
    v.kwargs = {"project_id": str(project_id)}
    return v


class TestInclufyPrince2BcException:
    def test_inclufy_can_hit_business_case(self, inclufy_project):
        p = MethodologyMatchesProjectPermission()
        allowed = p.has_permission(
            _req(f"/api/v1/projects/{inclufy_project.id}/prince2/business-case/"),
            _view(inclufy_project.id),
        )
        assert allowed is True

    def test_inclufy_can_hit_project_brief(self, inclufy_project):
        p = MethodologyMatchesProjectPermission()
        allowed = p.has_permission(
            _req(f"/api/v1/projects/{inclufy_project.id}/prince2/project-brief/"),
            _view(inclufy_project.id),
        )
        assert allowed is True

    def test_inclufy_can_hit_business_case_subresource(self, inclufy_project):
        p = MethodologyMatchesProjectPermission()
        allowed = p.has_permission(
            _req(f"/api/v1/projects/{inclufy_project.id}/prince2/business-case/benefits/"),
            _view(inclufy_project.id),
        )
        assert allowed is True

    def test_inclufy_cannot_hit_other_prince2_endpoints(self, inclufy_project):
        p = MethodologyMatchesProjectPermission()
        with pytest.raises(PermissionDenied):
            p.has_permission(
                _req(f"/api/v1/projects/{inclufy_project.id}/prince2/stages/"),
                _view(inclufy_project.id),
            )

    def test_inclufy_cannot_hit_exception_reports(self, inclufy_project):
        p = MethodologyMatchesProjectPermission()
        with pytest.raises(PermissionDenied):
            p.has_permission(
                _req(f"/api/v1/projects/{inclufy_project.id}/prince2/exception-reports/"),
                _view(inclufy_project.id),
            )

    def test_prince2_project_still_passes_all_prince2_routes(self, prince2_project):
        p = MethodologyMatchesProjectPermission()
        for tail in ("business-case", "stages", "exception-reports", "project-brief"):
            assert p.has_permission(
                _req(f"/api/v1/projects/{prince2_project.id}/prince2/{tail}/"),
                _view(prince2_project.id),
            ) is True

    def test_scrum_project_still_blocked_from_prince2(self, user, company):
        scrum = Project.objects.create(
            name="S", company=company, methodology="scrum", created_by=user,
        )
        p = MethodologyMatchesProjectPermission()
        with pytest.raises(PermissionDenied):
            p.has_permission(
                _req(f"/api/v1/projects/{scrum.id}/prince2/business-case/"),
                _view(scrum.id),
            )
