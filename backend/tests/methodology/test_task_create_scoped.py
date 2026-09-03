"""FEAT-003 regression: task creation in Hybrid / LSS-Green / LSS-Black.

The task serializers required a body `project` that the frontends never
send on the project-scoped routes (the URL carries the project), so every
in-app task create returned 400. Pattern mirrors BUG-038: project is
writable-but-optional; the scoped URL wins; the flat route requires the
body project and access-checks it (that check used to be skipped).
"""
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from accounts.models import Company
from hybrid.models import PhaseMethodology
from lss_green.models import DMAICPhase
from projects.models import Project

pytestmark = pytest.mark.django_db

CASES = [
    ("hybrid", "/api/v1/projects/{pid}/hybrid/tasks/", "/api/v1/hybrid/tasks/"),
    ("lean_six_sigma_green", "/api/v1/lss-green/projects/{pid}/tasks/", "/api/v1/lss-green/tasks/"),
    ("lean_six_sigma_black", "/api/v1/lss-black/projects/{pid}/tasks/", "/api/v1/lss-black/tasks/"),
]


@pytest.fixture
def env(db):
    company = Company.objects.create(name="TaskCo")
    other_company = Company.objects.create(name="OtherCo")
    User = get_user_model()
    user = User.objects.create_user(
        email="tasker@example.com", password="x", username="tasker",
        company=company, role="admin",
    )
    client = APIClient()
    client.force_authenticate(user=user)
    return company, other_company, client


def _project(company, methodology):
    return Project.objects.create(
        name=f"P-{methodology}", company=company,
        status="in_progress", methodology=methodology,
    )


def _phase(project, methodology):
    """Tasks in all three modules require a phase FK — build the right one."""
    if methodology == "hybrid":
        return PhaseMethodology.objects.create(
            project=project, phase="Realisatie", methodology="scrum", order=1
        )
    return DMAICPhase.objects.create(project=project, phase="define")


@pytest.mark.parametrize("methodology,scoped,flat", CASES)
def test_scoped_create_without_body_project_is_201(env, methodology, scoped, flat):
    company, _, client = env
    project = _project(company, methodology)
    phase = _phase(project, methodology)
    resp = client.post(
        scoped.format(pid=project.id),
        {"title": "[regression] scoped create", "phase": str(phase.id)},
        format="json",
    )
    assert resp.status_code == 201, resp.content
    assert str(resp.json().get("project")) == str(project.id)


@pytest.mark.parametrize("methodology,scoped,flat", CASES)
def test_flat_create_without_project_is_400_not_500(env, methodology, scoped, flat):
    company, _, client = env
    project = _project(company, methodology)
    phase = _phase(project, methodology)
    resp = client.post(
        flat,
        {"title": "[regression] flat no project", "phase": str(phase.id)},
        format="json",
    )
    assert resp.status_code == 400, resp.content
    assert "project" in resp.json()


@pytest.mark.parametrize("methodology,scoped,flat", CASES)
def test_flat_create_with_project_is_201(env, methodology, scoped, flat):
    company, _, client = env
    project = _project(company, methodology)
    phase = _phase(project, methodology)
    resp = client.post(
        flat,
        {"title": "[regression] flat with project", "project": project.id,
         "phase": str(phase.id)},
        format="json",
    )
    assert resp.status_code == 201, resp.content


@pytest.mark.parametrize("methodology,scoped,flat", CASES)
def test_flat_create_foreign_project_is_denied(env, methodology, scoped, flat):
    _, other_company, client = env
    foreign = _project(other_company, methodology)
    phase = _phase(foreign, methodology)
    resp = client.post(
        flat,
        {"title": "[regression] foreign project", "project": foreign.id,
         "phase": str(phase.id)},
        format="json",
    )
    assert resp.status_code in (400, 403, 404), resp.content
    assert resp.status_code != 201
