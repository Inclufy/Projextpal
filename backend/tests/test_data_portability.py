"""Data-portability quick wins (Apeldoorn D2/D4).

Covers:
1. ``?modified_since=<ISO8601>`` incremental-refresh filter on the core
   list endpoints (with param / without param / invalid value -> 400).
2. Long-lived read-only service tokens for BI access (GET allowed,
   writes rejected with 403, management command output).
"""
import io
from datetime import timedelta

import pytest
from django.core.management import call_command
from django.core.management.base import CommandError
from django.utils import timezone

from accounts.service_tokens import (
    SERVICE_READ_SCOPE,
    build_service_token,
)
from projects.models import Project

PROJECTS_URL = "/api/v1/projects/"


@pytest.fixture
def two_projects(db, company, admin_user):
    """One recently-modified and one stale project (updated_at backdated)."""
    old = Project.objects.create(
        name="Old project", company=company, created_by=admin_user
    )
    new = Project.objects.create(
        name="New project", company=company, created_by=admin_user
    )
    # updated_at is auto_now; bypass it with a queryset update.
    Project.objects.filter(pk=old.pk).update(
        updated_at=timezone.now() - timedelta(days=30)
    )
    return old, new


def _ids(response):
    data = response.json()
    results = data["results"] if isinstance(data, dict) and "results" in data else data
    return {row["id"] for row in results}


@pytest.mark.django_db
class TestModifiedSinceFilter:
    def test_list_without_param_returns_everything(
        self, authenticated_admin_client, two_projects
    ):
        old, new = two_projects
        response = authenticated_admin_client.get(PROJECTS_URL)
        assert response.status_code == 200
        assert {old.id, new.id} <= _ids(response)

    def test_list_with_param_returns_only_modified_rows(
        self, authenticated_admin_client, two_projects
    ):
        old, new = two_projects
        cutoff = (timezone.now() - timedelta(days=1)).isoformat()
        response = authenticated_admin_client.get(
            PROJECTS_URL, {"modified_since": cutoff}
        )
        assert response.status_code == 200
        ids = _ids(response)
        assert new.id in ids
        assert old.id not in ids

    def test_date_only_value_is_accepted(
        self, authenticated_admin_client, two_projects
    ):
        old, new = two_projects
        cutoff = (timezone.now() - timedelta(days=1)).date().isoformat()
        response = authenticated_admin_client.get(
            PROJECTS_URL, {"modified_since": cutoff}
        )
        assert response.status_code == 200
        ids = _ids(response)
        assert new.id in ids
        assert old.id not in ids

    def test_invalid_value_returns_400_with_clear_error(
        self, authenticated_admin_client, two_projects
    ):
        response = authenticated_admin_client.get(
            PROJECTS_URL, {"modified_since": "not-a-date"}
        )
        assert response.status_code == 400
        assert "modified_since" in response.json()

    def test_detail_route_is_not_affected_by_filter(
        self, authenticated_admin_client, two_projects
    ):
        old, _new = two_projects
        cutoff = (timezone.now() - timedelta(days=1)).isoformat()
        response = authenticated_admin_client.get(
            f"{PROJECTS_URL}{old.id}/", {"modified_since": cutoff}
        )
        # The stale project is filtered from lists but must stay
        # retrievable by PK (BI merges on stable primary keys).
        assert response.status_code == 200

    @pytest.mark.parametrize(
        "path",
        [
            "tasks/",
            "time-entries/",
            "risks/",
            "budget-items/",
            "budget-categories/",
            "milestones/",
            "issues/",
            "expenses/",
        ],
    )
    def test_filter_is_wired_on_all_core_list_endpoints(
        self, authenticated_admin_client, company, path
    ):
        url = f"{PROJECTS_URL}{path}"
        ok = authenticated_admin_client.get(
            url, {"modified_since": "2026-01-01T00:00:00Z"}
        )
        assert ok.status_code == 200
        bad = authenticated_admin_client.get(url, {"modified_since": "nope"})
        assert bad.status_code == 400


@pytest.mark.django_db
class TestServiceToken:
    @pytest.fixture
    def service_client(self, api_client, admin_user):
        token = build_service_token(admin_user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        return api_client

    def test_token_carries_read_scope_and_long_lifetime(self, admin_user):
        token = build_service_token(admin_user, days=180)
        assert token["scope"] == SERVICE_READ_SCOPE
        assert token["service"] is True
        lifetime = token["exp"] - token["iat"]
        assert lifetime >= 179 * 24 * 3600

    def test_service_token_get_is_allowed(self, service_client, two_projects):
        response = service_client.get(PROJECTS_URL)
        assert response.status_code == 200
        assert len(_ids(response)) >= 2

    def test_service_token_post_is_rejected(self, service_client, company):
        before = Project.objects.count()
        response = service_client.post(
            PROJECTS_URL, {"name": "Should not exist"}, format="json"
        )
        assert response.status_code == 403
        assert Project.objects.count() == before

    def test_service_token_put_patch_delete_are_rejected(
        self, service_client, two_projects
    ):
        old, _ = two_projects
        detail = f"{PROJECTS_URL}{old.id}/"
        assert service_client.put(detail, {"name": "x"}, format="json").status_code == 403
        assert service_client.patch(detail, {"name": "x"}, format="json").status_code == 403
        assert service_client.delete(detail).status_code == 403
        assert Project.objects.filter(pk=old.pk).exists()

    def test_regular_jwt_is_not_read_restricted(self, api_client, admin_user):
        """A normal (non-service) JWT must keep full write access."""
        from rest_framework_simplejwt.tokens import AccessToken

        token = AccessToken.for_user(admin_user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        response = api_client.post(
            PROJECTS_URL, {"name": "Writable"}, format="json"
        )
        # Whatever serializer validation says, the read-only gate (403)
        # must not fire for regular tokens.
        assert response.status_code != 403

    def test_management_command_prints_token(self, admin_user):
        out = io.StringIO()
        call_command(
            "create_service_token", "--email", admin_user.email, "--days", "30",
            stdout=out,
        )
        output = out.getvalue()
        assert "Service token created." in output
        assert admin_user.email in output
        assert SERVICE_READ_SCOPE in output

    def test_management_command_rejects_unknown_email(self, db):
        with pytest.raises(CommandError):
            call_command(
                "create_service_token", "--email", "nobody@example.com"
            )
