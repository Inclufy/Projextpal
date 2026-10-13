"""Tests for the direct-create bot tools: create_milestone + create_task."""
import pytest
from unittest.mock import patch

# bot.ai/__init__.py imports langchain.agents.create_agent (langchain >=1.x
# API). On environments pinned to older langchain this import fails at module
# load; skip the whole suite rather than crashing the collection, since the
# tools themselves are what we're exercising, not the agent orchestrator.
pytest.importorskip("langchain.agents", reason="langchain.agents not installed")
try:
    from langchain.agents import create_agent  # noqa: F401
except ImportError:
    pytest.skip("langchain.agents.create_agent missing (langchain <1.x)", allow_module_level=True)

from projects.models import Project, Milestone, Task
from bot.ai.tools.milestone_tools import create_milestone
from bot.ai.tools.task_tools import create_task


@pytest.fixture
def project(db, user, company):
    return Project.objects.create(
        name="Recare Implementation",
        company=company,
        methodology="inclufy",
        start_date="2027-01-01",
        end_date="2027-06-30",
        created_by=user,
    )


@pytest.fixture
def milestone(db, project):
    return Milestone.objects.create(project=project, name="Fase 1 — kick-off")


def _session(user):
    return {"user": user, "chat": None}


class TestCreateMilestone:
    def test_rejects_missing_project(self, user):
        with patch("bot.ai.tools.milestone_tools.get_user_session", return_value=_session(user)):
            r = create_milestone(project_id="", name="m")
        assert "project_id" in r.get("error", "")

    def test_rejects_non_numeric_project_id(self, user):
        with patch("bot.ai.tools.milestone_tools.get_user_session", return_value=_session(user)):
            r = create_milestone(project_id="abc", name="m")
        assert "error" in r

    def test_rejects_empty_name(self, user, project):
        with patch("bot.ai.tools.milestone_tools.get_user_session", return_value=_session(user)):
            r = create_milestone(project_id=str(project.id), name="   ")
        assert "name" in r.get("error", "").lower()

    def test_rejects_end_before_start(self, user, project):
        with patch("bot.ai.tools.milestone_tools.get_user_session", return_value=_session(user)):
            r = create_milestone(
                project_id=str(project.id), name="x",
                start_date="2027-05-01", end_date="2027-04-01",
            )
        assert "end_date" in r.get("error", "")

    def test_happy_path_creates_row(self, user, project):
        with patch("bot.ai.tools.milestone_tools.get_user_session", return_value=_session(user)):
            r = create_milestone(
                project_id=str(project.id),
                name="Fase 2 — uitvoering",
                description="Verankeren",
                start_date="2027-02-01",
                end_date="2027-04-30",
                status="in_progress",
            )
        assert r["success"] is True
        assert r["data"]["id"]
        m = Milestone.objects.get(id=r["data"]["id"])
        assert m.name == "Fase 2 — uitvoering"
        assert m.status == "in_progress"
        assert m.project_id == project.id

    def test_tenant_isolation(self, user, second_company):
        other = Project.objects.create(
            name="Other", company=second_company, methodology="inclufy", created_by=user,
        )
        with patch("bot.ai.tools.milestone_tools.get_user_session", return_value=_session(user)):
            r = create_milestone(project_id=str(other.id), name="x")
        assert "not found" in r.get("error", "").lower()
        assert Milestone.objects.filter(project=other).count() == 0

    def test_invalid_status_falls_back_to_pending(self, user, project):
        with patch("bot.ai.tools.milestone_tools.get_user_session", return_value=_session(user)):
            r = create_milestone(project_id=str(project.id), name="x", status="banana")
        assert r["success"] is True
        assert Milestone.objects.get(id=r["data"]["id"]).status == "pending"


class TestCreateTask:
    def test_rejects_missing_milestone(self, user):
        with patch("bot.ai.tools.task_tools.get_user_session", return_value=_session(user)):
            r = create_task(milestone_id="", title="t")
        assert "milestone_id" in r.get("error", "")

    def test_rejects_empty_title(self, user, milestone):
        with patch("bot.ai.tools.task_tools.get_user_session", return_value=_session(user)):
            r = create_task(milestone_id=str(milestone.id), title="")
        assert "title" in r.get("error", "").lower()

    def test_happy_path_creates_task(self, user, milestone):
        with patch("bot.ai.tools.task_tools.get_user_session", return_value=_session(user)):
            r = create_task(
                milestone_id=str(milestone.id),
                title="Kick-off meeting plannen",
                priority="high",
                start_date="2027-01-05",
                due_date="2027-01-10",
            )
        assert r["success"] is True
        t = Task.objects.get(id=r["data"]["id"])
        assert t.title == "Kick-off meeting plannen"
        assert t.priority == "high"
        assert t.milestone_id == milestone.id

    def test_invalid_priority_falls_back_to_medium(self, user, milestone):
        with patch("bot.ai.tools.task_tools.get_user_session", return_value=_session(user)):
            r = create_task(milestone_id=str(milestone.id), title="x", priority="PANIC")
        assert r["success"] is True
        assert Task.objects.get(id=r["data"]["id"]).priority == "medium"

    def test_due_before_start_rejected(self, user, milestone):
        with patch("bot.ai.tools.task_tools.get_user_session", return_value=_session(user)):
            r = create_task(
                milestone_id=str(milestone.id), title="x",
                start_date="2027-03-01", due_date="2027-02-15",
            )
        assert "due_date" in r.get("error", "")

    def test_tenant_isolation(self, user, second_company):
        other_proj = Project.objects.create(
            name="O", company=second_company, methodology="inclufy", created_by=user,
        )
        other_ms = Milestone.objects.create(project=other_proj, name="m")
        with patch("bot.ai.tools.task_tools.get_user_session", return_value=_session(user)):
            r = create_task(milestone_id=str(other_ms.id), title="x")
        assert "not found" in r.get("error", "").lower()
        assert Task.objects.filter(milestone=other_ms).count() == 0
