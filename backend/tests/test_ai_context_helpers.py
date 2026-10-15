"""Tests for backend/core/ai_context_helpers.get_project_context_prefix."""
import pytest
from unittest.mock import Mock

from projects.models import Project, ProjectAIContext
from core.ai_context_helpers import get_project_context_prefix


@pytest.fixture
def project(db, user, company):
    return Project.objects.create(
        name="Tender Jeugdzorg 2027",
        company=company,
        methodology="prince2",
        created_by=user,
    )


@pytest.fixture
def project_with_context(db, project):
    ProjectAIContext.objects.create(
        project=project,
        enabled=True,
        extracted_text="Dit is de ingewonnen aanbestedingsinhoud over Wmo-trajecten in Heerenveen.",
        source_files=[{"name": "Tender_RFP.pdf", "size": 1234, "pages": 42}],
    )
    return project


class TestResolution:
    def test_returns_empty_for_anonymous_user(self):
        anon = Mock(is_authenticated=False)
        assert get_project_context_prefix(anon, 1) == ""

    def test_returns_empty_for_missing_user(self):
        assert get_project_context_prefix(None, 1) == ""

    def test_returns_empty_without_project_id(self, user):
        assert get_project_context_prefix(user, None) == ""
        assert get_project_context_prefix(user, 0) == ""
        assert get_project_context_prefix(user, "") == ""

    def test_returns_empty_for_non_numeric_project_id(self, user):
        assert get_project_context_prefix(user, "abc") == ""
        assert get_project_context_prefix(user, "123x") == ""

    def test_returns_empty_when_no_context_row(self, user, project):
        # Project exists, but no ProjectAIContext — nothing to inject.
        assert get_project_context_prefix(user, project.id) == ""


class TestContent:
    def test_returns_text_when_enabled(self, user, project_with_context):
        out = get_project_context_prefix(user, project_with_context.id)
        assert "aanbestedingsinhoud" in out
        assert "Wmo-trajecten" in out

    def test_includes_source_file_names(self, user, project_with_context):
        out = get_project_context_prefix(user, project_with_context.id)
        assert "Tender_RFP.pdf" in out

    def test_nl_header_wording(self, user, project_with_context):
        out = get_project_context_prefix(user, project_with_context.id, language="nl")
        assert "[PROJECT_DOCUMENTEN]" in out
        assert "autoritatieve bron" in out

    def test_en_header_wording(self, user, project_with_context):
        out = get_project_context_prefix(user, project_with_context.id, language="en")
        assert "[PROJECT_DOCUMENTS]" in out
        assert "authoritative source" in out

    def test_empty_text_returns_empty_prefix(self, user, project):
        ProjectAIContext.objects.create(project=project, enabled=True, extracted_text="")
        assert get_project_context_prefix(user, project.id) == ""

    def test_disabled_toggle_returns_empty(self, user, project):
        ProjectAIContext.objects.create(
            project=project, enabled=False, extracted_text="should not appear",
        )
        assert get_project_context_prefix(user, project.id) == ""

    def test_clips_text_at_8000_chars(self, user, project):
        huge = "X" * 20_000
        ProjectAIContext.objects.create(project=project, enabled=True, extracted_text=huge)
        out = get_project_context_prefix(user, project.id)
        # The prefix wraps the text with heading + footer; the body itself is clipped.
        # Count only the X-run to verify the cap.
        x_run = max(len(seg) for seg in out.split("X") if seg == "") if "X" in out else 0
        # Simpler: ensure not all 20k Xs survived.
        assert out.count("X") == 8000


class TestTenantIsolation:
    def test_cross_tenant_user_gets_empty(self, second_company, project_with_context):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        other = User.objects.create_user(
            username="otheruser",
            email="other@elsewhere.com",
            password="pw",
        )
        other.role = "pm"
        if hasattr(other, "company"):
            other.company = second_company
        other.save()

        # Other user from different company must not see the context.
        assert get_project_context_prefix(other, project_with_context.id) == ""

    def test_superuser_sees_any_project(self, admin_user, project_with_context):
        out = get_project_context_prefix(admin_user, project_with_context.id)
        assert "aanbestedingsinhoud" in out
