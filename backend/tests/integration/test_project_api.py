"""
Integration Tests for Project API
==================================

Comprehensive test coverage for all Project API endpoints under /api/v1/projects/.

Covers:
    1.  List projects (scoped to company + team membership)
    2.  Create project with each methodology type
    3.  Retrieve project detail
    4.  Update project status transitions
    5.  Partial update (PATCH)
    6.  Delete project
    7.  Project summary endpoint
    8.  Team management (add / remove members)
    9.  Company dashboard metrics
    10. Project-program linking
    11. Multi-company isolation (user cannot see other company's projects)
"""

import pytest
from decimal import Decimal
from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from projects.models import Project, ProjectTeam, Expense, Milestone, Task
from programs.models import Program
from accounts.models import Company

User = get_user_model()


# ---------------------------------------------------------------------------
# Local helper fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def second_user(db, second_company):
    """User belonging to a different company for isolation tests."""
    user = User.objects.create_user(
        username="seconduser",
        email="second@other.com",
        password="otherpass123",
    )
    user.first_name = "Second"
    user.last_name = "User"
    user.company = second_company
    user.role = "admin"
    user.save()
    return user


@pytest.fixture
def second_client(second_user):
    """Authenticated API client for the second company user."""
    client = APIClient()
    client.force_authenticate(user=second_user)
    return client


@pytest.fixture
def second_company_project(db, second_user, second_company):
    """Project belonging to the second company."""
    return Project.objects.create(
        name="Other Company Project",
        description="Project in a different company",
        methodology="kanban",
        company=second_company,
        created_by=second_user,
        budget=Decimal("5000.00"),
        status="in_progress",
        start_date=date.today(),
        end_date=date.today() + timedelta(days=60),
    )


@pytest.fixture
def pm_user(db, company):
    """A project-manager user for permission-guarded endpoints."""
    user = User.objects.create_user(
        username="pmtestuser",
        email="pmtest@projextpal.com",
        password="pmpass123",
    )
    user.first_name = "PM"
    user.last_name = "Tester"
    user.company = company
    user.role = "pm"
    user.save()
    return user


@pytest.fixture
def pm_client(pm_user):
    """Authenticated client with PM role."""
    client = APIClient()
    client.force_authenticate(user=pm_user)
    return client


@pytest.fixture
def admin_client_fresh(db, company):
    """Authenticated client with admin role (avoids name collision with conftest admin_user)."""
    user = User.objects.create_user(
        username="admintest",
        email="admintest@projextpal.com",
        password="adminpass123",
    )
    user.first_name = "Admin"
    user.last_name = "Tester"
    user.company = company
    user.role = "admin"
    user.save()
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def team_member(db, company):
    """Extra user to add/remove from project teams."""
    user = User.objects.create_user(
        username="extramember",
        email="extramember@projextpal.com",
        password="memberpass123",
    )
    user.first_name = "Extra"
    user.last_name = "Member"
    user.company = company
    user.role = "pm"
    user.save()
    return user


@pytest.fixture
def program_instance(db, company, pm_user):
    """A program to link projects to."""
    return Program.objects.create(
        name="Test Program",
        company=company,
        program_manager=pm_user,
        methodology="safe",
        status="active",
    )


@pytest.fixture
def project_with_budget(db, pm_user, company):
    """Project with a defined budget and expenses for dashboard/summary testing."""
    project = Project.objects.create(
        name="Budget Test Project",
        description="Project with budget data",
        methodology="waterfall",
        company=company,
        created_by=pm_user,
        budget=Decimal("100000.00"),
        status="in_progress",
        start_date=date.today() - timedelta(days=30),
        end_date=date.today() + timedelta(days=150),
    )
    # Add some expenses
    Expense.objects.create(
        project=project,
        description="Software License",
        category="Software",
        date=date.today() - timedelta(days=10),
        amount=Decimal("5000.00"),
        status="Paid",
        created_by=pm_user,
    )
    Expense.objects.create(
        project=project,
        description="Contractor",
        category="Labor Cost",
        date=date.today() - timedelta(days=5),
        amount=Decimal("15000.00"),
        status="Approved",
        created_by=pm_user,
    )
    return project


# ---------------------------------------------------------------------------
# Helper to build common project payloads
# ---------------------------------------------------------------------------

def _project_payload(methodology, **overrides):
    """Return a minimal valid project creation payload."""
    payload = {
        "name": f"Test {methodology.title()} Project",
        "description": f"Integration test for {methodology}",
        "methodology": methodology,
        "project_type": "software",
        "budget": "50000.00",
        "start_date": str(date.today()),
        "end_date": str(date.today() + timedelta(days=120)),
        "status": "planning",
    }
    payload.update(overrides)
    return payload


# ===========================================================================
# 1. LIST PROJECTS
# ===========================================================================

@pytest.mark.django_db
class TestListProjects:
    """GET /api/v1/projects/ -- list endpoint."""

    def test_list_returns_200(self, pm_client, company):
        """Authenticated user receives 200 OK."""
        url = reverse("project-list")
        response = pm_client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_list_contains_own_projects(self, pm_client, pm_user, company):
        """User sees projects they created."""
        Project.objects.create(
            name="My Project",
            company=company,
            created_by=pm_user,
            methodology="agile",
        )
        url = reverse("project-list")
        response = pm_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        names = [p["name"] for p in response.data]
        assert "My Project" in names

    def test_list_contains_team_member_projects(self, pm_client, pm_user, company):
        """User sees projects where they are a team member."""
        # Create a project by another user
        other_user = User.objects.create_user(
            username="creator",
            email="creator@projextpal.com",
            password="pass123",
        )
        other_user.company = company
        other_user.role = "admin"
        other_user.save()

        project = Project.objects.create(
            name="Team Project",
            company=company,
            created_by=other_user,
            methodology="kanban",
        )
        # Add pm_user as team member
        ProjectTeam.objects.create(project=project, user=pm_user, is_active=True)

        url = reverse("project-list")
        response = pm_client.get(url)
        names = [p["name"] for p in response.data]
        assert "Team Project" in names

    def test_list_unauthenticated_returns_401(self):
        """Unauthenticated request is rejected."""
        client = APIClient()
        url = reverse("project-list")
        response = client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_list_empty_for_new_user(self, db, company):
        """A user with no projects or team memberships sees an empty list."""
        user = User.objects.create_user(
            username="emptyuser",
            email="empty@projextpal.com",
            password="pass123",
        )
        user.company = company
        user.role = "pm"
        user.save()

        client = APIClient()
        client.force_authenticate(user=user)
        url = reverse("project-list")
        response = client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 0


# ===========================================================================
# 2. CREATE PROJECT WITH EACH METHODOLOGY TYPE
# ===========================================================================

@pytest.mark.django_db
class TestCreateProjectMethodologies:
    """POST /api/v1/projects/ -- test creation for every methodology."""

    METHODOLOGIES = [
        "prince2",
        "agile",
        "scrum",
        "kanban",
        "waterfall",
        "lean_six_sigma_green",
        "lean_six_sigma_black",
        "program",
        "hybrid",
    ]

    @pytest.mark.parametrize("methodology", METHODOLOGIES)
    def test_create_project_with_methodology(self, pm_client, company, methodology):
        """Creating a project with each valid methodology returns 201."""
        url = reverse("project-list")
        payload = _project_payload(methodology)
        response = pm_client.post(url, payload, format="json")
        assert response.status_code == status.HTTP_201_CREATED, (
            f"Failed for methodology={methodology}: {response.data}"
        )
        assert response.data["methodology"] == methodology
        assert response.data["name"] == payload["name"]

    def test_create_project_with_all_fields(self, pm_client, company):
        """Create a project specifying every writable field."""
        url = reverse("project-list")
        payload = {
            "name": "Full-Field Waterfall Project",
            "description": "All fields specified",
            "project_goal": "Deliver a production-ready system",
            "methodology": "waterfall",
            "project_type": "software",
            "budget": "200000.00",
            "start_date": str(date.today()),
            "end_date": str(date.today() + timedelta(days=365)),
            "status": "planning",
        }
        response = pm_client.post(url, payload, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        data = response.data
        assert data["description"] == "All fields specified"
        assert data["project_goal"] == "Deliver a production-ready system"
        assert data["project_type"] == "software"
        assert Decimal(str(data["budget"])) == Decimal("200000.00")

    def test_create_project_sets_created_by(self, pm_client, pm_user, company):
        """created_by is automatically set to the authenticated user."""
        url = reverse("project-list")
        payload = _project_payload("agile")
        response = pm_client.post(url, payload, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["created_by"] == pm_user.id

    def test_create_project_sets_company(self, pm_client, pm_user, company):
        """company is automatically set from the authenticated user."""
        url = reverse("project-list")
        payload = _project_payload("kanban")
        response = pm_client.post(url, payload, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["company"] == company.id

    def test_create_project_without_name_fails(self, pm_client, company):
        """Missing required name field returns 400."""
        url = reverse("project-list")
        payload = _project_payload("agile")
        del payload["name"]
        response = pm_client.post(url, payload, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_create_project_unauthenticated_returns_401(self):
        """Unauthenticated POST is rejected."""
        client = APIClient()
        url = reverse("project-list")
        response = client.post(url, _project_payload("agile"), format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


# ===========================================================================
# 3. RETRIEVE PROJECT DETAIL
# ===========================================================================

@pytest.mark.django_db
class TestRetrieveProject:
    """GET /api/v1/projects/{id}/ -- detail endpoint."""

    def test_retrieve_own_project(self, pm_client, pm_user, company):
        """Creator can retrieve their project."""
        project = Project.objects.create(
            name="Retrieve Me",
            company=company,
            created_by=pm_user,
            methodology="agile",
            budget=Decimal("10000.00"),
            start_date=date.today(),
        )
        url = reverse("project-detail", kwargs={"pk": project.pk})
        response = pm_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == project.id
        assert response.data["name"] == "Retrieve Me"
        assert response.data["methodology"] == "agile"

    def test_retrieve_returns_milestones(self, pm_client, pm_user, company):
        """Detail response includes nested milestones."""
        project = Project.objects.create(
            name="With Milestones",
            company=company,
            created_by=pm_user,
            methodology="waterfall",
        )
        Milestone.objects.create(project=project, name="Phase 1", order_index=0)
        Milestone.objects.create(project=project, name="Phase 2", order_index=1)

        url = reverse("project-detail", kwargs={"pk": project.pk})
        response = pm_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert "milestones" in response.data
        milestone_names = [m["name"] for m in response.data["milestones"]]
        assert "Phase 1" in milestone_names
        assert "Phase 2" in milestone_names

    def test_retrieve_returns_progress(self, pm_client, pm_user, company):
        """Detail response includes computed progress field."""
        project = Project.objects.create(
            name="Progress Project",
            company=company,
            created_by=pm_user,
            methodology="scrum",
        )
        url = reverse("project-detail", kwargs={"pk": project.pk})
        response = pm_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert "progress" in response.data

    def test_retrieve_nonexistent_returns_404(self, pm_client):
        """Requesting a non-existent project returns 404."""
        url = reverse("project-detail", kwargs={"pk": 999999})
        response = pm_client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_retrieve_returns_team_members_count(self, pm_client, pm_user, company):
        """Detail response includes team_members_count."""
        project = Project.objects.create(
            name="Team Count Project",
            company=company,
            created_by=pm_user,
            methodology="agile",
        )
        ProjectTeam.objects.create(project=project, user=pm_user, is_active=True)

        url = reverse("project-detail", kwargs={"pk": project.pk})
        response = pm_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["team_members_count"] == 1

    def test_retrieve_returns_expenses_total(self, pm_client, pm_user, company):
        """Detail response includes expenses_total."""
        project = Project.objects.create(
            name="Expense Total Project",
            company=company,
            created_by=pm_user,
            methodology="waterfall",
            budget=Decimal("50000.00"),
        )
        Expense.objects.create(
            project=project,
            description="Expense 1",
            category="Software",
            date=date.today(),
            amount=Decimal("1500.00"),
            status="Paid",
        )
        url = reverse("project-detail", kwargs={"pk": project.pk})
        response = pm_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert float(response.data["expenses_total"]) == 1500.00


# ===========================================================================
# 4. UPDATE PROJECT STATUS TRANSITIONS
# ===========================================================================

@pytest.mark.django_db
class TestUpdateProjectStatus:
    """PUT /api/v1/projects/{id}/ -- status transitions."""

    VALID_STATUSES = [
        "planning",
        "pending",
        "in_progress",
        "completed",
        "on_hold",
        "cancelled",
    ]

    @pytest.mark.parametrize("target_status", VALID_STATUSES)
    def test_update_status_to_valid_value(self, pm_client, pm_user, company, target_status):
        """Updating to each valid status returns 200."""
        project = Project.objects.create(
            name="Status Project",
            company=company,
            created_by=pm_user,
            methodology="agile",
            status="planning",
            budget=Decimal("10000.00"),
            start_date=date.today(),
            end_date=date.today() + timedelta(days=90),
        )
        url = reverse("project-detail", kwargs={"pk": project.pk})
        payload = {
            "name": project.name,
            "methodology": project.methodology,
            "status": target_status,
            "budget": str(project.budget),
            "start_date": str(project.start_date),
            "end_date": str(project.end_date),
        }
        response = pm_client.put(url, payload, format="json")
        assert response.status_code == status.HTTP_200_OK, (
            f"Failed for status={target_status}: {response.data}"
        )
        assert response.data["status"] == target_status

    def test_status_persists_after_update(self, pm_client, pm_user, company):
        """Status change is persisted in the database."""
        project = Project.objects.create(
            name="Persist Status",
            company=company,
            created_by=pm_user,
            methodology="waterfall",
            status="planning",
            budget=Decimal("0"),
        )
        url = reverse("project-detail", kwargs={"pk": project.pk})
        payload = {
            "name": project.name,
            "methodology": project.methodology,
            "status": "in_progress",
            "budget": "0",
        }
        pm_client.put(url, payload, format="json")
        project.refresh_from_db()
        assert project.status == "in_progress"

    def test_full_status_lifecycle(self, pm_client, pm_user, company):
        """Walk a project through planning -> in_progress -> completed."""
        project = Project.objects.create(
            name="Lifecycle Project",
            company=company,
            created_by=pm_user,
            methodology="prince2",
            status="planning",
            budget=Decimal("0"),
        )
        url = reverse("project-detail", kwargs={"pk": project.pk})

        for next_status in ["pending", "in_progress", "completed"]:
            payload = {
                "name": project.name,
                "methodology": project.methodology,
                "status": next_status,
                "budget": "0",
            }
            response = pm_client.put(url, payload, format="json")
            assert response.status_code == status.HTTP_200_OK
            assert response.data["status"] == next_status


# ===========================================================================
# 5. PARTIAL UPDATE (PATCH)
# ===========================================================================

@pytest.mark.django_db
class TestPartialUpdateProject:
    """PATCH /api/v1/projects/{id}/ -- partial update endpoint."""

    def test_patch_name(self, pm_client, pm_user, company):
        """PATCH to update only the name field."""
        project = Project.objects.create(
            name="Original Name",
            company=company,
            created_by=pm_user,
            methodology="kanban",
        )
        url = reverse("project-detail", kwargs={"pk": project.pk})
        response = pm_client.patch(url, {"name": "Updated Name"}, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["name"] == "Updated Name"

    def test_patch_budget(self, pm_client, pm_user, company):
        """PATCH to update only the budget."""
        project = Project.objects.create(
            name="Budget Patch",
            company=company,
            created_by=pm_user,
            methodology="agile",
            budget=Decimal("10000.00"),
        )
        url = reverse("project-detail", kwargs={"pk": project.pk})
        response = pm_client.patch(url, {"budget": "75000.00"}, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert Decimal(str(response.data["budget"])) == Decimal("75000.00")

    def test_patch_description(self, pm_client, pm_user, company):
        """PATCH to update description."""
        project = Project.objects.create(
            name="Desc Patch",
            company=company,
            created_by=pm_user,
            methodology="waterfall",
            description="Old description",
        )
        url = reverse("project-detail", kwargs={"pk": project.pk})
        response = pm_client.patch(
            url, {"description": "New description"}, format="json"
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data["description"] == "New description"

    def test_patch_status(self, pm_client, pm_user, company):
        """PATCH to update only the status."""
        project = Project.objects.create(
            name="Status Patch",
            company=company,
            created_by=pm_user,
            methodology="scrum",
            status="planning",
        )
        url = reverse("project-detail", kwargs={"pk": project.pk})
        response = pm_client.patch(url, {"status": "on_hold"}, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["status"] == "on_hold"

    def test_patch_dates(self, pm_client, pm_user, company):
        """PATCH to update start and end dates."""
        project = Project.objects.create(
            name="Date Patch",
            company=company,
            created_by=pm_user,
            methodology="agile",
            start_date=date.today(),
            end_date=date.today() + timedelta(days=30),
        )
        new_end = date.today() + timedelta(days=180)
        url = reverse("project-detail", kwargs={"pk": project.pk})
        response = pm_client.patch(url, {"end_date": str(new_end)}, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["end_date"] == str(new_end)

    def test_patch_project_goal(self, pm_client, pm_user, company):
        """PATCH to update project_goal."""
        project = Project.objects.create(
            name="Goal Patch",
            company=company,
            created_by=pm_user,
            methodology="prince2",
        )
        url = reverse("project-detail", kwargs={"pk": project.pk})
        response = pm_client.patch(
            url, {"project_goal": "Improve throughput by 30%"}, format="json"
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data["project_goal"] == "Improve throughput by 30%"

    def test_patch_methodology(self, pm_client, pm_user, company):
        """PATCH to change methodology."""
        project = Project.objects.create(
            name="Method Change",
            company=company,
            created_by=pm_user,
            methodology="agile",
        )
        url = reverse("project-detail", kwargs={"pk": project.pk})
        response = pm_client.patch(url, {"methodology": "hybrid"}, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["methodology"] == "hybrid"

    def test_patch_preserves_unmodified_fields(self, pm_client, pm_user, company):
        """PATCH does not overwrite fields not included in payload."""
        project = Project.objects.create(
            name="Preserve Fields",
            company=company,
            created_by=pm_user,
            methodology="waterfall",
            description="Keep this",
            budget=Decimal("9999.00"),
        )
        url = reverse("project-detail", kwargs={"pk": project.pk})
        response = pm_client.patch(url, {"name": "Changed Name"}, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["name"] == "Changed Name"
        assert response.data["description"] == "Keep this"
        assert Decimal(str(response.data["budget"])) == Decimal("9999.00")


# ===========================================================================
# 6. DELETE PROJECT
# ===========================================================================

@pytest.mark.django_db
class TestDeleteProject:
    """DELETE /api/v1/projects/{id}/ -- destroy endpoint."""

    def test_delete_project(self, pm_client, pm_user, company):
        """Deleting a project returns 204 and removes it from the database."""
        project = Project.objects.create(
            name="Delete Me",
            company=company,
            created_by=pm_user,
            methodology="kanban",
        )
        url = reverse("project-detail", kwargs={"pk": project.pk})
        response = pm_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Project.objects.filter(pk=project.pk).exists()

    def test_delete_project_with_milestones(self, pm_client, pm_user, company):
        """Deleting a project cascades to milestones and tasks."""
        project = Project.objects.create(
            name="Cascade Delete",
            company=company,
            created_by=pm_user,
            methodology="waterfall",
        )
        milestone = Milestone.objects.create(
            project=project, name="M1", order_index=0
        )
        Task.objects.create(milestone=milestone, title="T1")

        url = reverse("project-detail", kwargs={"pk": project.pk})
        response = pm_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Milestone.objects.filter(project=project).exists()
        assert not Task.objects.filter(milestone=milestone).exists()

    def test_delete_project_with_team_members(self, pm_client, pm_user, company, team_member):
        """Deleting a project removes team membership records."""
        project = Project.objects.create(
            name="Team Delete",
            company=company,
            created_by=pm_user,
            methodology="agile",
        )
        ProjectTeam.objects.create(project=project, user=team_member, is_active=True)

        url = reverse("project-detail", kwargs={"pk": project.pk})
        response = pm_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not ProjectTeam.objects.filter(project=project).exists()

    def test_delete_nonexistent_returns_404(self, pm_client):
        """Deleting a non-existent project returns 404."""
        url = reverse("project-detail", kwargs={"pk": 999999})
        response = pm_client.delete(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_delete_project_with_expenses(self, pm_client, pm_user, company):
        """Deleting a project removes related expenses."""
        project = Project.objects.create(
            name="Expense Delete",
            company=company,
            created_by=pm_user,
            methodology="waterfall",
        )
        Expense.objects.create(
            project=project,
            description="Expense 1",
            category="Software",
            date=date.today(),
            amount=Decimal("1000.00"),
        )
        url = reverse("project-detail", kwargs={"pk": project.pk})
        response = pm_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Expense.objects.filter(project=project).exists()


# ===========================================================================
# 7. PROJECT SUMMARY ENDPOINT
# ===========================================================================

@pytest.mark.django_db
class TestProjectSummary:
    """GET /api/v1/projects/{id}/summary/ -- summary action."""

    def test_summary_returns_200(self, pm_client, pm_user, company):
        """Summary endpoint returns 200 OK."""
        project = Project.objects.create(
            name="Summary Project",
            company=company,
            created_by=pm_user,
            methodology="agile",
            budget=Decimal("50000.00"),
            start_date=date.today(),
            end_date=date.today() + timedelta(days=90),
        )
        url = reverse("project-detail", kwargs={"pk": project.pk}) + "summary/"
        response = pm_client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_summary_contains_required_keys(self, pm_client, pm_user, company):
        """Summary response contains progress, budget, team, and timeline info."""
        project = Project.objects.create(
            name="Summary Keys",
            company=company,
            created_by=pm_user,
            methodology="waterfall",
            budget=Decimal("80000.00"),
            start_date=date.today() - timedelta(days=10),
            end_date=date.today() + timedelta(days=170),
        )
        url = reverse("project-detail", kwargs={"pk": project.pk}) + "summary/"
        response = pm_client.get(url)
        data = response.data
        assert "progress" in data
        assert "budget_total" in data
        assert "spent" in data
        assert "percent_used" in data
        assert "team_count" in data
        assert "team_members" in data
        assert "timeline" in data

    def test_summary_budget_calculation(self, pm_client, pm_user, company):
        """Summary correctly calculates budget and expense figures."""
        project = Project.objects.create(
            name="Budget Calc",
            company=company,
            created_by=pm_user,
            methodology="kanban",
            budget=Decimal("20000.00"),
            start_date=date.today(),
            end_date=date.today() + timedelta(days=60),
        )
        Expense.objects.create(
            project=project,
            description="Expense A",
            category="Software",
            date=date.today(),
            amount=Decimal("3000.00"),
            status="Paid",
        )
        Expense.objects.create(
            project=project,
            description="Expense B",
            category="Labor Cost",
            date=date.today(),
            amount=Decimal("7000.00"),
            status="Approved",
        )

        url = reverse("project-detail", kwargs={"pk": project.pk}) + "summary/"
        response = pm_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["budget_total"] == 20000.0
        assert response.data["spent"] == 10000.0
        assert response.data["percent_used"] == 50.0

    def test_summary_team_count(self, pm_client, pm_user, company, team_member):
        """Summary shows correct team_count including team members."""
        project = Project.objects.create(
            name="Team Count",
            company=company,
            created_by=pm_user,
            methodology="scrum",
            budget=Decimal("10000.00"),
            start_date=date.today(),
            end_date=date.today() + timedelta(days=90),
        )
        ProjectTeam.objects.create(project=project, user=pm_user, is_active=True)
        ProjectTeam.objects.create(project=project, user=team_member, is_active=True)

        url = reverse("project-detail", kwargs={"pk": project.pk}) + "summary/"
        response = pm_client.get(url)
        assert response.data["team_count"] == 2

    def test_summary_timeline_data(self, pm_client, pm_user, company):
        """Summary timeline includes start, end, days, and elapsed info."""
        start = date.today() - timedelta(days=30)
        end = date.today() + timedelta(days=60)
        project = Project.objects.create(
            name="Timeline Info",
            company=company,
            created_by=pm_user,
            methodology="prince2",
            budget=Decimal("10000.00"),
            start_date=start,
            end_date=end,
        )
        url = reverse("project-detail", kwargs={"pk": project.pk}) + "summary/"
        response = pm_client.get(url)
        timeline = response.data["timeline"]
        assert str(timeline["start_date"]) == str(start)
        assert str(timeline["end_date"]) == str(end)
        assert timeline["days"] == 90
        assert timeline["percent_elapsed"] > 0


# ===========================================================================
# 8. TEAM MANAGEMENT (ADD / REMOVE MEMBERS)
# ===========================================================================

@pytest.mark.django_db
class TestTeamManagement:
    """Team-related actions on projects."""

    def test_get_team_members(self, pm_client, pm_user, company, team_member):
        """GET /api/v1/projects/{id}/team/ returns team members."""
        project = Project.objects.create(
            name="Team Project",
            company=company,
            created_by=pm_user,
            methodology="agile",
        )
        ProjectTeam.objects.create(project=project, user=team_member, is_active=True)

        url = reverse("project-detail", kwargs={"pk": project.pk}) + "team/"
        response = pm_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["user"] == team_member.id

    def test_add_team_member(self, pm_client, pm_user, company, team_member):
        """POST /api/v1/projects/{id}/team/add/ adds a user to the team."""
        project = Project.objects.create(
            name="Add Team",
            company=company,
            created_by=pm_user,
            methodology="kanban",
        )
        url = reverse("project-detail", kwargs={"pk": project.pk}) + "team/add/"
        response = pm_client.post(url, {"user_id": team_member.id}, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert ProjectTeam.objects.filter(
            project=project, user=team_member, is_active=True
        ).exists()

    def test_add_team_member_duplicate_returns_400(self, pm_client, pm_user, company, team_member):
        """Adding the same user twice returns 400."""
        project = Project.objects.create(
            name="Dup Team",
            company=company,
            created_by=pm_user,
            methodology="agile",
        )
        ProjectTeam.objects.create(project=project, user=team_member, is_active=True)

        url = reverse("project-detail", kwargs={"pk": project.pk}) + "team/add/"
        response = pm_client.post(url, {"user_id": team_member.id}, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_add_team_member_without_user_id_returns_400(self, pm_client, pm_user, company):
        """Omitting user_id returns 400."""
        project = Project.objects.create(
            name="No User ID",
            company=company,
            created_by=pm_user,
            methodology="agile",
        )
        url = reverse("project-detail", kwargs={"pk": project.pk}) + "team/add/"
        response = pm_client.post(url, {}, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_add_team_member_wrong_company_returns_400(
        self, pm_client, pm_user, company, second_user
    ):
        """Adding a user from another company returns 400."""
        project = Project.objects.create(
            name="Wrong Co",
            company=company,
            created_by=pm_user,
            methodology="agile",
        )
        url = reverse("project-detail", kwargs={"pk": project.pk}) + "team/add/"
        response = pm_client.post(url, {"user_id": second_user.id}, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_remove_team_member(self, pm_client, pm_user, company, team_member):
        """DELETE /api/v1/projects/{id}/team/remove/{member_id}/ deactivates membership."""
        project = Project.objects.create(
            name="Remove Team",
            company=company,
            created_by=pm_user,
            methodology="waterfall",
        )
        membership = ProjectTeam.objects.create(
            project=project, user=team_member, is_active=True
        )
        url = (
            reverse("project-detail", kwargs={"pk": project.pk})
            + f"team/remove/{membership.id}/"
        )
        response = pm_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        membership.refresh_from_db()
        assert membership.is_active is False

    def test_remove_nonexistent_team_member_returns_404(self, pm_client, pm_user, company):
        """Removing a non-existent membership returns 404."""
        project = Project.objects.create(
            name="404 Remove",
            company=company,
            created_by=pm_user,
            methodology="agile",
        )
        url = (
            reverse("project-detail", kwargs={"pk": project.pk})
            + "team/remove/999999/"
        )
        response = pm_client.delete(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_reactivate_removed_team_member(self, pm_client, pm_user, company, team_member):
        """Re-adding a previously removed member reactivates them."""
        project = Project.objects.create(
            name="Reactivate Team",
            company=company,
            created_by=pm_user,
            methodology="scrum",
        )
        membership = ProjectTeam.objects.create(
            project=project, user=team_member, is_active=False
        )
        url = reverse("project-detail", kwargs={"pk": project.pk}) + "team/add/"
        response = pm_client.post(url, {"user_id": team_member.id}, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        membership.refresh_from_db()
        assert membership.is_active is True

    def test_get_team_excludes_inactive_members(self, pm_client, pm_user, company, team_member):
        """GET team/ does not return deactivated members."""
        project = Project.objects.create(
            name="Inactive Filter",
            company=company,
            created_by=pm_user,
            methodology="agile",
        )
        ProjectTeam.objects.create(project=project, user=team_member, is_active=False)

        url = reverse("project-detail", kwargs={"pk": project.pk}) + "team/"
        response = pm_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 0


# ===========================================================================
# 9. COMPANY DASHBOARD METRICS
# ===========================================================================

@pytest.mark.django_db
class TestCompanyDashboard:
    """GET /api/v1/projects/company-dashboard/ -- aggregated company metrics."""

    def test_dashboard_returns_200(self, pm_client, pm_user, company):
        """Dashboard endpoint returns 200 for authenticated user."""
        url = reverse("project-list") + "company-dashboard/"
        response = pm_client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_dashboard_contains_required_keys(self, pm_client, pm_user, company):
        """Dashboard response has program_metrics, phases, projects, etc."""
        # Create a project so we have data
        Project.objects.create(
            name="Dashboard Project",
            company=company,
            created_by=pm_user,
            methodology="agile",
            budget=Decimal("50000.00"),
            status="in_progress",
        )
        url = reverse("project-list") + "company-dashboard/"
        response = pm_client.get(url)
        data = response.data
        assert "program_metrics" in data
        assert "phases" in data
        assert "projects" in data
        assert "budget_vs_paid" in data
        assert "cash_flow" in data

    def test_dashboard_project_count(self, pm_client, pm_user, company):
        """Dashboard total_projects matches project count in company."""
        for i in range(3):
            Project.objects.create(
                name=f"Dash Proj {i}",
                company=company,
                created_by=pm_user,
                methodology="agile",
                budget=Decimal("10000.00"),
            )
        url = reverse("project-list") + "company-dashboard/"
        response = pm_client.get(url)
        assert response.data["program_metrics"]["total_projects"] == 3

    def test_dashboard_budget_aggregation(self, pm_client, pm_user, company):
        """Dashboard program_budget is sum of all project budgets."""
        Project.objects.create(
            name="B1",
            company=company,
            created_by=pm_user,
            methodology="agile",
            budget=Decimal("25000.00"),
        )
        Project.objects.create(
            name="B2",
            company=company,
            created_by=pm_user,
            methodology="kanban",
            budget=Decimal("75000.00"),
        )
        url = reverse("project-list") + "company-dashboard/"
        response = pm_client.get(url)
        assert response.data["program_metrics"]["program_budget"] == 100000.00

    def test_dashboard_status_distribution(self, pm_client, pm_user, company):
        """Dashboard phases counts match status distribution."""
        Project.objects.create(
            name="Planning",
            company=company,
            created_by=pm_user,
            methodology="agile",
            status="planning",
        )
        Project.objects.create(
            name="Active",
            company=company,
            created_by=pm_user,
            methodology="kanban",
            status="in_progress",
        )
        Project.objects.create(
            name="Done",
            company=company,
            created_by=pm_user,
            methodology="waterfall",
            status="completed",
        )
        url = reverse("project-list") + "company-dashboard/"
        response = pm_client.get(url)
        phases = response.data["phases"]
        assert phases.get("planning", 0) == 1
        assert phases.get("in_progress", 0) == 1
        assert phases.get("completed", 0) == 1

    def test_dashboard_paid_to_date(self, pm_client, project_with_budget, pm_user, company):
        """Dashboard paid_to_date reflects only Paid expenses."""
        url = reverse("project-list") + "company-dashboard/"
        response = pm_client.get(url)
        metrics = response.data["program_metrics"]
        # Paid expense = 5000, Approved = 15000
        assert metrics["paid_to_date"] == 5000.00

    def test_dashboard_project_health_colors(self, pm_client, pm_user, company):
        """Each project in dashboard includes health color metrics."""
        project = Project.objects.create(
            name="Health Colors",
            company=company,
            created_by=pm_user,
            methodology="agile",
            budget=Decimal("10000.00"),
            health_scope="#00FF00",
            health_time="#FF0000",
            health_cost="#FFFF00",
        )
        url = reverse("project-list") + "company-dashboard/"
        response = pm_client.get(url)
        project_row = next(
            (p for p in response.data["projects"] if p["id"] == project.id), None
        )
        assert project_row is not None
        assert project_row["health"]["scope"] == "#00FF00"
        assert project_row["health"]["time"] == "#FF0000"
        assert project_row["health"]["cost"] == "#FFFF00"

    def test_dashboard_only_shows_own_company(
        self, pm_client, pm_user, company, second_company_project
    ):
        """Dashboard only includes projects from the authenticated user's company."""
        Project.objects.create(
            name="Own Company Project",
            company=company,
            created_by=pm_user,
            methodology="agile",
            budget=Decimal("10000.00"),
        )
        url = reverse("project-list") + "company-dashboard/"
        response = pm_client.get(url)
        project_names = [p["name"] for p in response.data["projects"]]
        assert "Own Company Project" in project_names
        assert "Other Company Project" not in project_names

    def test_dashboard_unauthenticated_returns_401(self):
        """Unauthenticated requests to dashboard return 401."""
        client = APIClient()
        url = reverse("project-list") + "company-dashboard/"
        response = client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


# ===========================================================================
# 10. PROJECT-PROGRAM LINKING
# ===========================================================================

@pytest.mark.django_db
class TestProjectProgramLinking:
    """Test linking projects to programs."""

    def test_create_project_linked_to_program(self, pm_client, pm_user, company, program_instance):
        """Creating a project with a program FK associates them."""
        url = reverse("project-list")
        payload = _project_payload("agile", program=program_instance.id)
        response = pm_client.post(url, payload, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["program"] == program_instance.id

    def test_link_project_to_program_via_patch(self, pm_client, pm_user, company, program_instance):
        """Linking an existing project to a program via PATCH."""
        project = Project.objects.create(
            name="Unlinked Project",
            company=company,
            created_by=pm_user,
            methodology="kanban",
        )
        url = reverse("project-detail", kwargs={"pk": project.pk})
        response = pm_client.patch(
            url, {"program": program_instance.id}, format="json"
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data["program"] == program_instance.id

    def test_unlink_project_from_program(self, pm_client, pm_user, company, program_instance):
        """Setting program to null unlinks the project."""
        project = Project.objects.create(
            name="Linked Then Unlinked",
            company=company,
            created_by=pm_user,
            methodology="waterfall",
            program=program_instance,
        )
        url = reverse("project-detail", kwargs={"pk": project.pk})
        response = pm_client.patch(url, {"program": None}, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["program"] is None

    def test_filter_projects_by_program(self, pm_client, pm_user, company, program_instance):
        """GET /api/v1/projects/?program={id} filters by program."""
        Project.objects.create(
            name="In Program",
            company=company,
            created_by=pm_user,
            methodology="agile",
            program=program_instance,
        )
        Project.objects.create(
            name="Not In Program",
            company=company,
            created_by=pm_user,
            methodology="kanban",
        )
        url = reverse("project-list") + f"?program={program_instance.id}"
        response = pm_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        names = [p["name"] for p in response.data]
        assert "In Program" in names
        assert "Not In Program" not in names

    def test_multiple_projects_under_one_program(
        self, pm_client, pm_user, company, program_instance
    ):
        """Multiple projects can be linked to the same program."""
        for i in range(3):
            Project.objects.create(
                name=f"Program Project {i}",
                company=company,
                created_by=pm_user,
                methodology="agile",
                program=program_instance,
            )
        url = reverse("project-list") + f"?program={program_instance.id}"
        response = pm_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 3

    def test_project_without_program_is_valid(self, pm_client, pm_user, company):
        """Projects do not require a program (nullable FK)."""
        url = reverse("project-list")
        payload = _project_payload("scrum")
        # No program field
        response = pm_client.post(url, payload, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["program"] is None


# ===========================================================================
# 11. MULTI-COMPANY ISOLATION
# ===========================================================================

@pytest.mark.django_db
class TestMultiCompanyIsolation:
    """Verify users cannot access projects from other companies."""

    def test_user_cannot_list_other_company_projects(
        self, pm_client, pm_user, company, second_company_project
    ):
        """List endpoint does not return projects from other companies."""
        url = reverse("project-list")
        response = pm_client.get(url)
        project_ids = [p["id"] for p in response.data]
        assert second_company_project.id not in project_ids

    def test_user_cannot_retrieve_other_company_project(
        self, pm_client, second_company_project
    ):
        """Retrieve endpoint returns 404 for other company's project."""
        url = reverse("project-detail", kwargs={"pk": second_company_project.pk})
        response = pm_client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_user_cannot_update_other_company_project(
        self, pm_client, second_company_project
    ):
        """PUT on other company's project returns 404."""
        url = reverse("project-detail", kwargs={"pk": second_company_project.pk})
        payload = {
            "name": "Hacked Name",
            "methodology": "agile",
            "budget": "999999.00",
        }
        response = pm_client.put(url, payload, format="json")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_user_cannot_patch_other_company_project(
        self, pm_client, second_company_project
    ):
        """PATCH on other company's project returns 404."""
        url = reverse("project-detail", kwargs={"pk": second_company_project.pk})
        response = pm_client.patch(url, {"name": "Hacked"}, format="json")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_user_cannot_delete_other_company_project(
        self, pm_client, second_company_project
    ):
        """DELETE on other company's project returns 404."""
        url = reverse("project-detail", kwargs={"pk": second_company_project.pk})
        response = pm_client.delete(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND
        # Confirm project still exists
        assert Project.objects.filter(pk=second_company_project.pk).exists()

    def test_user_cannot_access_other_company_summary(
        self, pm_client, second_company_project
    ):
        """Summary of other company's project returns 404."""
        url = (
            reverse("project-detail", kwargs={"pk": second_company_project.pk})
            + "summary/"
        )
        response = pm_client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_user_cannot_add_team_to_other_company_project(
        self, pm_client, pm_user, second_company_project
    ):
        """Adding a team member to another company's project returns 404."""
        url = (
            reverse("project-detail", kwargs={"pk": second_company_project.pk})
            + "team/add/"
        )
        response = pm_client.post(url, {"user_id": pm_user.id}, format="json")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_dashboard_excludes_other_company_projects(
        self, pm_client, pm_user, company, second_company_project
    ):
        """Company dashboard only includes own company's data."""
        # Create a project in own company
        Project.objects.create(
            name="Own Project",
            company=company,
            created_by=pm_user,
            methodology="agile",
            budget=Decimal("10000.00"),
        )
        url = reverse("project-list") + "company-dashboard/"
        response = pm_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        project_ids = [p["id"] for p in response.data["projects"]]
        assert second_company_project.id not in project_ids

    def test_each_company_sees_only_own_projects(
        self, pm_client, second_client, pm_user, second_user, company, second_company
    ):
        """Both companies only see their own projects."""
        p1 = Project.objects.create(
            name="Company A Project",
            company=company,
            created_by=pm_user,
            methodology="agile",
        )
        p2 = Project.objects.create(
            name="Company B Project",
            company=second_company,
            created_by=second_user,
            methodology="kanban",
        )

        url = reverse("project-list")

        # Company A
        r1 = pm_client.get(url)
        ids_a = [p["id"] for p in r1.data]
        assert p1.id in ids_a
        assert p2.id not in ids_a

        # Company B
        r2 = second_client.get(url)
        ids_b = [p["id"] for p in r2.data]
        assert p2.id in ids_b
        assert p1.id not in ids_b


# ===========================================================================
# EXTRA: PERMISSION EDGE CASES
# ===========================================================================

@pytest.mark.django_db
class TestPermissionEdgeCases:
    """Additional permission and edge-case coverage."""

    def test_read_only_user_cannot_create_project(self, db, company):
        """A guest user cannot create projects (requires admin/pm role)."""
        guest = User.objects.create_user(
            username="guestuser",
            email="guest@projextpal.com",
            password="guestpass123",
        )
        guest.company = company
        guest.role = "guest"
        guest.save()

        client = APIClient()
        client.force_authenticate(user=guest)

        url = reverse("project-list")
        response = client.post(url, _project_payload("agile"), format="json")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_read_only_user_can_list_projects(self, db, company):
        """A guest user can still list projects (read is open to authenticated)."""
        guest = User.objects.create_user(
            username="guestreader",
            email="guestreader@projextpal.com",
            password="guestpass123",
        )
        guest.company = company
        guest.role = "guest"
        guest.save()

        client = APIClient()
        client.force_authenticate(user=guest)

        url = reverse("project-list")
        response = client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_read_only_user_can_retrieve_project(self, db, company):
        """A guest user can retrieve a project they are a team member of."""
        guest = User.objects.create_user(
            username="guestdetail",
            email="guestdetail@projextpal.com",
            password="guestpass123",
        )
        guest.company = company
        guest.role = "guest"
        guest.save()

        creator = User.objects.create_user(
            username="proj_creator",
            email="creator@projextpal.com",
            password="pass123",
        )
        creator.company = company
        creator.role = "admin"
        creator.save()

        project = Project.objects.create(
            name="Guest Viewable",
            company=company,
            created_by=creator,
            methodology="agile",
        )
        # Add guest as team member so they can see it
        ProjectTeam.objects.create(project=project, user=guest, is_active=True)

        client = APIClient()
        client.force_authenticate(user=guest)

        url = reverse("project-detail", kwargs={"pk": project.pk})
        response = client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_guest_cannot_delete_project(self, db, company):
        """A guest user cannot delete projects."""
        guest = User.objects.create_user(
            username="guestdel",
            email="guestdel@projextpal.com",
            password="guestpass123",
        )
        guest.company = company
        guest.role = "guest"
        guest.save()

        creator = User.objects.create_user(
            username="del_creator",
            email="delcreator@projextpal.com",
            password="pass123",
        )
        creator.company = company
        creator.role = "admin"
        creator.save()

        project = Project.objects.create(
            name="Guest Cannot Delete",
            company=company,
            created_by=creator,
            methodology="kanban",
        )
        ProjectTeam.objects.create(project=project, user=guest, is_active=True)

        client = APIClient()
        client.force_authenticate(user=guest)

        url = reverse("project-detail", kwargs={"pk": project.pk})
        response = client.delete(url)
        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert Project.objects.filter(pk=project.pk).exists()


# ===========================================================================
# EXTRA: PROJECT TYPE VARIATIONS
# ===========================================================================

@pytest.mark.django_db
class TestProjectTypeVariations:
    """Test creating projects with each project_type value."""

    PROJECT_TYPES = ["software", "design", "research", "other"]

    @pytest.mark.parametrize("project_type", PROJECT_TYPES)
    def test_create_with_project_type(self, pm_client, company, project_type):
        """Each project_type value is accepted on create."""
        url = reverse("project-list")
        payload = _project_payload("agile", project_type=project_type)
        response = pm_client.post(url, payload, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["project_type"] == project_type

    def test_create_without_project_type(self, pm_client, company):
        """project_type is optional (nullable)."""
        url = reverse("project-list")
        payload = _project_payload("kanban")
        del payload["project_type"]
        response = pm_client.post(url, payload, format="json")
        assert response.status_code == status.HTTP_201_CREATED
