"""
Tests for the Governance App
=============================

Comprehensive test coverage for:
1. Portfolio CRUD operations and company-based filtering
2. Portfolio status transitions
3. GovernanceBoard CRUD and board type validation
4. BoardMember CRUD and unique constraint enforcement
5. GovernanceStakeholder CRUD operations
6. Stakeholder quadrant (Power/Interest matrix) calculation
"""

import pytest
from decimal import Decimal
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status

from governance.models import (
    Portfolio,
    GovernanceBoard,
    BoardMember,
    GovernanceStakeholder,
)

User = get_user_model()


# ============================================================
# Fixtures specific to governance tests
# ============================================================

@pytest.fixture
def portfolio(db, company, user):
    """Create a test portfolio."""
    return Portfolio.objects.create(
        name="Strategic Portfolio Alpha",
        description="Primary portfolio for strategic initiatives",
        company=company,
        owner=user,
        status="active",
        strategic_objectives="Increase revenue by 20%",
        budget_allocated=Decimal("500000.00"),
    )


@pytest.fixture
def second_portfolio(db, company, user):
    """Create a second portfolio in the same company."""
    return Portfolio.objects.create(
        name="Innovation Portfolio",
        description="Portfolio for innovation projects",
        company=company,
        owner=user,
        status="planning",
        budget_allocated=Decimal("250000.00"),
    )


@pytest.fixture
def other_company_portfolio(db, second_company):
    """Create a portfolio belonging to a different company."""
    other_user = User.objects.create_user(
        username="othercompanyuser",
        email="other@othercompany.com",
        password="testpass123",
    )
    other_user.company = second_company
    other_user.role = "admin"
    other_user.save()

    return Portfolio.objects.create(
        name="Other Company Portfolio",
        description="Should not be visible to first company users",
        company=second_company,
        owner=other_user,
        status="active",
        budget_allocated=Decimal("100000.00"),
    )


@pytest.fixture
def governance_board(db, portfolio, user):
    """Create a test governance board."""
    return GovernanceBoard.objects.create(
        name="Strategic Steering Committee",
        board_type="steering_committee",
        description="Main steering committee for portfolio oversight",
        portfolio=portfolio,
        meeting_frequency="Monthly",
        chair=user,
        is_active=True,
    )


@pytest.fixture
def second_board(db, portfolio):
    """Create a second governance board."""
    return GovernanceBoard.objects.create(
        name="Advisory Board",
        board_type="advisory_board",
        description="Advisory board for expert guidance",
        portfolio=portfolio,
        meeting_frequency="Quarterly",
        is_active=True,
    )


@pytest.fixture
def inactive_board(db, portfolio):
    """Create an inactive governance board."""
    return GovernanceBoard.objects.create(
        name="Defunct Project Board",
        board_type="project_board",
        description="No longer active",
        portfolio=portfolio,
        is_active=False,
    )


@pytest.fixture
def board_member(db, governance_board, user):
    """Create a board member."""
    return BoardMember.objects.create(
        board=governance_board,
        user=user,
        role="chair",
        is_active=True,
    )


@pytest.fixture
def stakeholder(db, user, portfolio):
    """Create a governance stakeholder."""
    return GovernanceStakeholder.objects.create(
        user=user,
        role="executive_sponsor",
        influence_level="high",
        interest_level="high",
        portfolio=portfolio,
        communication_plan="Weekly status updates via email",
        notes="Key decision maker for the portfolio",
        is_active=True,
    )


@pytest.fixture
def non_superadmin_user(db, company):
    """Create a regular (non-superadmin) user with role 'pm'."""
    u = User.objects.create_user(
        username="regularpm",
        email="regularpm@projextpal.com",
        password="testpass123",
    )
    u.company = company
    u.role = "pm"
    u.save()
    return u


@pytest.fixture
def authenticated_non_superadmin_client(api_client, non_superadmin_user):
    """API client authenticated as a non-superadmin user."""
    api_client.force_authenticate(user=non_superadmin_user)
    return api_client


@pytest.fixture
def superadmin_user(db, company):
    """Create a superadmin user."""
    u = User.objects.create_user(
        username="superadminuser",
        email="superadmin@projextpal.com",
        password="testpass123",
    )
    u.company = company
    u.role = "superadmin"
    u.save()
    return u


@pytest.fixture
def authenticated_superadmin_client(api_client, superadmin_user):
    """API client authenticated as a superadmin user."""
    api_client.force_authenticate(user=superadmin_user)
    return api_client


# ============================================================
# 1. Portfolio CRUD Tests
# ============================================================

@pytest.mark.django_db
class TestPortfolioCRUD:
    """Test Portfolio create, list, retrieve, update, and delete operations."""

    def test_create_portfolio(self, authenticated_client, company, user):
        """Test creating a new portfolio via the API."""
        url = reverse("portfolio-list")
        data = {
            "name": "New Portfolio",
            "description": "A brand new portfolio",
            "company": company.pk,
            "owner": user.pk,
            "status": "planning",
            "strategic_objectives": "Reduce costs by 15%",
            "budget_allocated": "750000.00",
        }
        response = authenticated_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["name"] == "New Portfolio"
        assert response.data["status"] == "planning"
        assert response.data["strategic_objectives"] == "Reduce costs by 15%"
        assert Decimal(response.data["budget_allocated"]) == Decimal("750000.00")

    def test_create_portfolio_minimal_fields(self, authenticated_client, company):
        """Test creating a portfolio with only required fields."""
        url = reverse("portfolio-list")
        data = {
            "name": "Minimal Portfolio",
            "company": company.pk,
        }
        response = authenticated_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["name"] == "Minimal Portfolio"
        assert response.data["status"] == "active"  # default status

    def test_create_portfolio_without_name_fails(self, authenticated_client, company):
        """Test that creating a portfolio without a name returns 400."""
        url = reverse("portfolio-list")
        data = {
            "description": "Missing name",
            "company": company.pk,
        }
        response = authenticated_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_list_portfolios(self, authenticated_client, portfolio, second_portfolio):
        """Test listing all portfolios returns the expected count."""
        url = reverse("portfolio-list")
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        # The authenticated_client's user has role 'superadmin' (the default),
        # so it sees all portfolios regardless of company filtering.
        names = [p["name"] for p in response.data]
        assert "Strategic Portfolio Alpha" in names
        assert "Innovation Portfolio" in names

    def test_retrieve_portfolio(self, authenticated_client, portfolio):
        """Test retrieving a single portfolio by its UUID."""
        url = reverse("portfolio-detail", kwargs={"pk": portfolio.pk})
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["name"] == "Strategic Portfolio Alpha"
        assert response.data["description"] == "Primary portfolio for strategic initiatives"
        assert response.data["owner_name"] == "Test User"
        assert "total_boards" in response.data

    def test_update_portfolio_full(self, authenticated_client, portfolio, company, user):
        """Test full update (PUT) of a portfolio."""
        url = reverse("portfolio-detail", kwargs={"pk": portfolio.pk})
        data = {
            "name": "Updated Portfolio Name",
            "description": "Updated description",
            "company": company.pk,
            "owner": user.pk,
            "status": "on_hold",
            "strategic_objectives": "Revised objectives",
            "budget_allocated": "600000.00",
        }
        response = authenticated_client.put(url, data, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["name"] == "Updated Portfolio Name"
        assert response.data["status"] == "on_hold"
        assert Decimal(response.data["budget_allocated"]) == Decimal("600000.00")

    def test_partial_update_portfolio(self, authenticated_client, portfolio):
        """Test partial update (PATCH) of a portfolio."""
        url = reverse("portfolio-detail", kwargs={"pk": portfolio.pk})
        data = {"name": "Patched Portfolio Name"}
        response = authenticated_client.patch(url, data, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["name"] == "Patched Portfolio Name"
        # Other fields should remain unchanged
        assert response.data["description"] == "Primary portfolio for strategic initiatives"

    def test_delete_portfolio(self, authenticated_client, portfolio):
        """Test deleting a portfolio."""
        url = reverse("portfolio-detail", kwargs={"pk": portfolio.pk})
        response = authenticated_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Portfolio.objects.filter(pk=portfolio.pk).exists()

    def test_delete_portfolio_returns_404_for_nonexistent(self, authenticated_client):
        """Test deleting a portfolio that does not exist returns 404."""
        import uuid
        url = reverse("portfolio-detail", kwargs={"pk": uuid.uuid4()})
        response = authenticated_client.delete(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_portfolio_read_only_fields(self, authenticated_client, portfolio):
        """Test that id, created_at, updated_at are read-only."""
        url = reverse("portfolio-detail", kwargs={"pk": portfolio.pk})
        response = authenticated_client.get(url)
        assert "id" in response.data
        assert "created_at" in response.data
        assert "updated_at" in response.data

    def test_unauthenticated_access_denied(self, api_client):
        """Test that unauthenticated requests are rejected."""
        url = reverse("portfolio-list")
        response = api_client.get(url)
        assert response.status_code in (
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        )


# ============================================================
# 2. Portfolio Company Filtering Tests
# ============================================================

@pytest.mark.django_db
class TestPortfolioCompanyFiltering:
    """Test that non-superadmin users only see portfolios from their own company."""

    def test_non_superadmin_sees_only_own_company_portfolios(
        self,
        authenticated_non_superadmin_client,
        portfolio,
        other_company_portfolio,
    ):
        """A non-superadmin user should only see portfolios for their own company."""
        url = reverse("portfolio-list")
        response = authenticated_non_superadmin_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        portfolio_ids = [p["id"] for p in response.data]
        assert str(portfolio.pk) in portfolio_ids
        assert str(other_company_portfolio.pk) not in portfolio_ids

    def test_superadmin_sees_all_portfolios(
        self,
        authenticated_superadmin_client,
        portfolio,
        other_company_portfolio,
    ):
        """A superadmin user should see all portfolios across companies."""
        url = reverse("portfolio-list")
        response = authenticated_superadmin_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        portfolio_ids = [p["id"] for p in response.data]
        assert str(portfolio.pk) in portfolio_ids
        assert str(other_company_portfolio.pk) in portfolio_ids

    def test_non_superadmin_cannot_see_other_company_portfolio_detail(
        self,
        authenticated_non_superadmin_client,
        other_company_portfolio,
    ):
        """A non-superadmin should get 404 when trying to access another company's portfolio."""
        url = reverse("portfolio-detail", kwargs={"pk": other_company_portfolio.pk})
        response = authenticated_non_superadmin_client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_filter_portfolios_by_status(self, authenticated_client, portfolio, second_portfolio):
        """Test filtering portfolios by status query parameter."""
        url = reverse("portfolio-list")
        response = authenticated_client.get(url, {"status": "active"})
        assert response.status_code == status.HTTP_200_OK
        for p in response.data:
            assert p["status"] == "active"

    def test_search_portfolios_by_name(self, authenticated_client, portfolio, second_portfolio):
        """Test searching portfolios by name."""
        url = reverse("portfolio-list")
        response = authenticated_client.get(url, {"search": "Innovation"})
        assert response.status_code == status.HTTP_200_OK
        names = [p["name"] for p in response.data]
        assert "Innovation Portfolio" in names


# ============================================================
# 3. Portfolio Status Transition Tests
# ============================================================

@pytest.mark.django_db
class TestPortfolioStatusTransitions:
    """Test that portfolio status can be transitioned through all valid states."""

    def test_transition_planning_to_active(self, authenticated_client, company, user):
        """Test transitioning from planning to active."""
        portfolio = Portfolio.objects.create(
            name="Planning Portfolio",
            company=company,
            owner=user,
            status="planning",
        )
        url = reverse("portfolio-detail", kwargs={"pk": portfolio.pk})
        response = authenticated_client.patch(url, {"status": "active"}, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["status"] == "active"

    def test_transition_active_to_on_hold(self, authenticated_client, portfolio):
        """Test transitioning from active to on_hold."""
        url = reverse("portfolio-detail", kwargs={"pk": portfolio.pk})
        response = authenticated_client.patch(url, {"status": "on_hold"}, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["status"] == "on_hold"

    def test_transition_on_hold_to_active(self, authenticated_client, company, user):
        """Test transitioning from on_hold back to active."""
        portfolio = Portfolio.objects.create(
            name="On Hold Portfolio",
            company=company,
            owner=user,
            status="on_hold",
        )
        url = reverse("portfolio-detail", kwargs={"pk": portfolio.pk})
        response = authenticated_client.patch(url, {"status": "active"}, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["status"] == "active"

    def test_transition_active_to_closed(self, authenticated_client, portfolio):
        """Test transitioning from active to closed."""
        url = reverse("portfolio-detail", kwargs={"pk": portfolio.pk})
        response = authenticated_client.patch(url, {"status": "closed"}, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["status"] == "closed"

    def test_transition_planning_to_closed(self, authenticated_client, company, user):
        """Test transitioning from planning directly to closed."""
        portfolio = Portfolio.objects.create(
            name="Skip-to-close Portfolio",
            company=company,
            owner=user,
            status="planning",
        )
        url = reverse("portfolio-detail", kwargs={"pk": portfolio.pk})
        response = authenticated_client.patch(url, {"status": "closed"}, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["status"] == "closed"

    def test_all_valid_status_values(self, authenticated_client, company, user):
        """Test that all defined status values are accepted."""
        valid_statuses = ["planning", "active", "on_hold", "closed"]
        for s in valid_statuses:
            portfolio = Portfolio.objects.create(
                name=f"Portfolio {s}",
                company=company,
                owner=user,
                status="planning",
            )
            url = reverse("portfolio-detail", kwargs={"pk": portfolio.pk})
            response = authenticated_client.patch(url, {"status": s}, format="json")
            assert response.status_code == status.HTTP_200_OK
            assert response.data["status"] == s

    def test_invalid_status_rejected(self, authenticated_client, portfolio):
        """Test that an invalid status value is rejected."""
        url = reverse("portfolio-detail", kwargs={"pk": portfolio.pk})
        response = authenticated_client.patch(
            url, {"status": "nonexistent_status"}, format="json"
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_status_persists_after_update(self, authenticated_client, portfolio):
        """Test that status change is persisted to the database."""
        url = reverse("portfolio-detail", kwargs={"pk": portfolio.pk})
        authenticated_client.patch(url, {"status": "closed"}, format="json")
        portfolio.refresh_from_db()
        assert portfolio.status == "closed"


# ============================================================
# 4. GovernanceBoard CRUD Tests
# ============================================================

@pytest.mark.django_db
class TestGovernanceBoardCRUD:
    """Test GovernanceBoard create, list, retrieve, update, and delete operations."""

    def test_create_board(self, authenticated_client, portfolio, user):
        """Test creating a governance board."""
        url = reverse("governance-board-list")
        data = {
            "name": "New Steering Committee",
            "board_type": "steering_committee",
            "description": "A new committee for oversight",
            "portfolio": str(portfolio.pk),
            "meeting_frequency": "Bi-weekly",
            "chair": user.pk,
            "is_active": True,
        }
        response = authenticated_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["name"] == "New Steering Committee"
        assert response.data["board_type"] == "steering_committee"
        assert response.data["meeting_frequency"] == "Bi-weekly"

    def test_create_board_without_portfolio(self, authenticated_client):
        """Test creating a board not linked to any portfolio, program, or project."""
        url = reverse("governance-board-list")
        data = {
            "name": "Standalone Executive Board",
            "board_type": "executive_board",
            "description": "Top-level board",
        }
        response = authenticated_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["portfolio"] is None

    def test_create_board_linked_to_project(
        self, authenticated_client, waterfall_project
    ):
        """Test creating a board linked to a project."""
        url = reverse("governance-board-list")
        data = {
            "name": "Project Board",
            "board_type": "project_board",
            "project": str(waterfall_project.pk),
        }
        response = authenticated_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["board_type"] == "project_board"
        assert response.data["project"] is not None

    def test_list_boards(self, authenticated_client, governance_board, second_board):
        """Test listing all boards."""
        url = reverse("governance-board-list")
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 2

    def test_retrieve_board(self, authenticated_client, governance_board):
        """Test retrieving a single board by its UUID."""
        url = reverse("governance-board-detail", kwargs={"pk": governance_board.pk})
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["name"] == "Strategic Steering Committee"
        assert response.data["board_type"] == "steering_committee"
        assert "member_count" in response.data
        assert "members" in response.data

    def test_update_board(self, authenticated_client, governance_board):
        """Test updating a governance board."""
        url = reverse("governance-board-detail", kwargs={"pk": governance_board.pk})
        response = authenticated_client.patch(
            url,
            {"name": "Renamed Committee", "meeting_frequency": "Weekly"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data["name"] == "Renamed Committee"
        assert response.data["meeting_frequency"] == "Weekly"

    def test_delete_board(self, authenticated_client, governance_board):
        """Test deleting a governance board."""
        url = reverse("governance-board-detail", kwargs={"pk": governance_board.pk})
        response = authenticated_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not GovernanceBoard.objects.filter(pk=governance_board.pk).exists()

    def test_filter_boards_by_type(
        self, authenticated_client, governance_board, second_board
    ):
        """Test filtering boards by board_type."""
        url = reverse("governance-board-list")
        response = authenticated_client.get(url, {"board_type": "steering_committee"})
        assert response.status_code == status.HTTP_200_OK
        for board in response.data:
            assert board["board_type"] == "steering_committee"

    def test_filter_boards_by_is_active(
        self, authenticated_client, governance_board, inactive_board
    ):
        """Test filtering boards by is_active status."""
        url = reverse("governance-board-list")

        # Only active
        response = authenticated_client.get(url, {"is_active": "true"})
        assert response.status_code == status.HTTP_200_OK
        for board in response.data:
            assert board["is_active"] is True

        # Only inactive
        response = authenticated_client.get(url, {"is_active": "false"})
        assert response.status_code == status.HTTP_200_OK
        for board in response.data:
            assert board["is_active"] is False

    def test_deactivate_board(self, authenticated_client, governance_board):
        """Test deactivating a board through PATCH."""
        url = reverse("governance-board-detail", kwargs={"pk": governance_board.pk})
        response = authenticated_client.patch(url, {"is_active": False}, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["is_active"] is False

    def test_board_chair_info_in_response(self, authenticated_client, governance_board):
        """Test that chair name and email appear in the serialized response."""
        url = reverse("governance-board-detail", kwargs={"pk": governance_board.pk})
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert "chair_name" in response.data
        assert "chair_email" in response.data

    def test_unauthenticated_board_access_denied(self, api_client):
        """Test that unauthenticated requests to boards are rejected."""
        url = reverse("governance-board-list")
        response = api_client.get(url)
        assert response.status_code in (
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        )


# ============================================================
# 5. GovernanceBoard Type Validation Tests
# ============================================================

@pytest.mark.django_db
class TestGovernanceBoardTypeValidation:
    """Test that only valid board types are accepted."""

    @pytest.mark.parametrize(
        "board_type",
        [
            "steering_committee",
            "program_board",
            "project_board",
            "advisory_board",
            "executive_board",
        ],
    )
    def test_valid_board_types_accepted(self, authenticated_client, board_type):
        """Test that each valid board type is accepted."""
        url = reverse("governance-board-list")
        data = {
            "name": f"Board {board_type}",
            "board_type": board_type,
        }
        response = authenticated_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["board_type"] == board_type

    def test_invalid_board_type_rejected(self, authenticated_client):
        """Test that an invalid board type is rejected."""
        url = reverse("governance-board-list")
        data = {
            "name": "Invalid Board",
            "board_type": "invalid_type",
        }
        response = authenticated_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_empty_board_type_rejected(self, authenticated_client):
        """Test that an empty board type is rejected."""
        url = reverse("governance-board-list")
        data = {
            "name": "No Type Board",
            "board_type": "",
        }
        response = authenticated_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_missing_board_type_rejected(self, authenticated_client):
        """Test that a board without board_type is rejected."""
        url = reverse("governance-board-list")
        data = {
            "name": "Missing Type Board",
        }
        response = authenticated_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST


# ============================================================
# 6. BoardMember CRUD + Unique Constraint Tests
# ============================================================

@pytest.mark.django_db
class TestBoardMemberCRUD:
    """Test BoardMember create, list, retrieve, update, delete, and unique constraint."""

    def test_create_board_member(self, authenticated_client, governance_board, user):
        """Test adding a member to a board."""
        url = reverse("board-member-list")
        data = {
            "board": str(governance_board.pk),
            "user": user.pk,
            "role": "member",
            "is_active": True,
        }
        response = authenticated_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["role"] == "member"
        assert response.data["is_active"] is True

    def test_create_board_member_as_chair(
        self, authenticated_client, governance_board, admin_user
    ):
        """Test adding a member with the chair role."""
        url = reverse("board-member-list")
        data = {
            "board": str(governance_board.pk),
            "user": admin_user.pk,
            "role": "chair",
        }
        response = authenticated_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["role"] == "chair"

    def test_create_board_member_as_secretary(
        self, authenticated_client, governance_board, admin_user
    ):
        """Test adding a member with the secretary role."""
        url = reverse("board-member-list")
        data = {
            "board": str(governance_board.pk),
            "user": admin_user.pk,
            "role": "secretary",
        }
        response = authenticated_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["role"] == "secretary"

    def test_create_board_member_as_observer(
        self, authenticated_client, governance_board, admin_user
    ):
        """Test adding a member with the observer role."""
        url = reverse("board-member-list")
        data = {
            "board": str(governance_board.pk),
            "user": admin_user.pk,
            "role": "observer",
        }
        response = authenticated_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["role"] == "observer"

    def test_list_board_members(
        self, authenticated_client, governance_board, board_member
    ):
        """Test listing board members."""
        url = reverse("board-member-list")
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1

    def test_retrieve_board_member(self, authenticated_client, board_member):
        """Test retrieving a single board member."""
        url = reverse("board-member-detail", kwargs={"pk": board_member.pk})
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["role"] == "chair"
        assert "user_name" in response.data
        assert "user_email" in response.data

    def test_update_board_member_role(self, authenticated_client, board_member):
        """Test updating a board member's role."""
        url = reverse("board-member-detail", kwargs={"pk": board_member.pk})
        response = authenticated_client.patch(url, {"role": "secretary"}, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["role"] == "secretary"

    def test_deactivate_board_member(self, authenticated_client, board_member):
        """Test deactivating a board member."""
        url = reverse("board-member-detail", kwargs={"pk": board_member.pk})
        response = authenticated_client.patch(url, {"is_active": False}, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["is_active"] is False

    def test_delete_board_member(self, authenticated_client, board_member):
        """Test removing a board member."""
        url = reverse("board-member-detail", kwargs={"pk": board_member.pk})
        response = authenticated_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not BoardMember.objects.filter(pk=board_member.pk).exists()

    def test_filter_board_members_by_board(
        self, authenticated_client, governance_board, board_member
    ):
        """Test filtering board members by board UUID."""
        url = reverse("board-member-list")
        response = authenticated_client.get(url, {"board": str(governance_board.pk)})
        assert response.status_code == status.HTTP_200_OK
        for member in response.data:
            assert str(member["board"]) == str(governance_board.pk)

    def test_filter_board_members_by_role(
        self, authenticated_client, board_member
    ):
        """Test filtering board members by role."""
        url = reverse("board-member-list")
        response = authenticated_client.get(url, {"role": "chair"})
        assert response.status_code == status.HTTP_200_OK
        for member in response.data:
            assert member["role"] == "chair"

    def test_filter_board_members_by_is_active(
        self, authenticated_client, board_member
    ):
        """Test filtering board members by active status."""
        url = reverse("board-member-list")
        response = authenticated_client.get(url, {"is_active": "true"})
        assert response.status_code == status.HTTP_200_OK
        for member in response.data:
            assert member["is_active"] is True

    def test_unique_constraint_board_user(
        self, authenticated_client, governance_board, user
    ):
        """Test that adding the same user to the same board twice is rejected."""
        url = reverse("board-member-list")
        data = {
            "board": str(governance_board.pk),
            "user": user.pk,
            "role": "member",
        }
        # First creation should succeed
        response1 = authenticated_client.post(url, data, format="json")
        assert response1.status_code == status.HTTP_201_CREATED

        # Second creation with same board+user should fail
        data["role"] = "observer"  # Different role, same board+user
        response2 = authenticated_client.post(url, data, format="json")
        assert response2.status_code == status.HTTP_400_BAD_REQUEST

    def test_same_user_different_boards(
        self, authenticated_client, governance_board, second_board, user
    ):
        """Test that the same user can be a member of different boards."""
        url = reverse("board-member-list")

        # Add user to first board
        data1 = {
            "board": str(governance_board.pk),
            "user": user.pk,
            "role": "chair",
        }
        response1 = authenticated_client.post(url, data1, format="json")
        assert response1.status_code == status.HTTP_201_CREATED

        # Add same user to second board
        data2 = {
            "board": str(second_board.pk),
            "user": user.pk,
            "role": "member",
        }
        response2 = authenticated_client.post(url, data2, format="json")
        assert response2.status_code == status.HTTP_201_CREATED

    def test_different_users_same_board(
        self, authenticated_client, governance_board, user, admin_user
    ):
        """Test that different users can be added to the same board."""
        url = reverse("board-member-list")

        data1 = {
            "board": str(governance_board.pk),
            "user": user.pk,
            "role": "chair",
        }
        response1 = authenticated_client.post(url, data1, format="json")
        assert response1.status_code == status.HTTP_201_CREATED

        data2 = {
            "board": str(governance_board.pk),
            "user": admin_user.pk,
            "role": "member",
        }
        response2 = authenticated_client.post(url, data2, format="json")
        assert response2.status_code == status.HTTP_201_CREATED

    def test_invalid_member_role_rejected(
        self, authenticated_client, governance_board, user
    ):
        """Test that an invalid member role is rejected."""
        url = reverse("board-member-list")
        data = {
            "board": str(governance_board.pk),
            "user": user.pk,
            "role": "president",
        }
        response = authenticated_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST


# ============================================================
# 7. GovernanceStakeholder CRUD Tests
# ============================================================

@pytest.mark.django_db
class TestGovernanceStakeholderCRUD:
    """Test GovernanceStakeholder create, list, retrieve, update, and delete operations."""

    def test_create_stakeholder_with_user(
        self, authenticated_client, user, portfolio
    ):
        """Test creating a stakeholder linked to an existing user."""
        url = reverse("governance-stakeholder-list")
        data = {
            "user": user.pk,
            "role": "executive_sponsor",
            "influence_level": "high",
            "interest_level": "high",
            "portfolio": str(portfolio.pk),
            "communication_plan": "Weekly briefings",
            "notes": "Primary sponsor",
            "is_active": True,
        }
        response = authenticated_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["role"] == "executive_sponsor"
        assert response.data["influence_level"] == "high"
        assert response.data["interest_level"] == "high"

    def test_create_stakeholder_with_email(self, authenticated_client, portfolio):
        """Test creating a stakeholder using email (user gets auto-created)."""
        url = reverse("governance-stakeholder-list")
        data = {
            "email": "newstakeholder@example.com",
            "name": "Jane Doe",
            "role": "key_stakeholder",
            "influence_level": "medium",
            "interest_level": "high",
            "portfolio": str(portfolio.pk),
        }
        response = authenticated_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["role"] == "key_stakeholder"
        # Verify the user was created
        assert User.objects.filter(email="newstakeholder@example.com").exists()

    def test_create_stakeholder_without_user_or_email_fails(
        self, authenticated_client, portfolio
    ):
        """Test that creating a stakeholder without user or email fails validation."""
        url = reverse("governance-stakeholder-list")
        data = {
            "role": "key_stakeholder",
            "influence_level": "medium",
            "interest_level": "low",
            "portfolio": str(portfolio.pk),
        }
        response = authenticated_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_list_stakeholders(self, authenticated_client, stakeholder):
        """Test listing all stakeholders."""
        url = reverse("governance-stakeholder-list")
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1

    def test_retrieve_stakeholder(self, authenticated_client, stakeholder):
        """Test retrieving a single stakeholder by its UUID."""
        url = reverse("governance-stakeholder-detail", kwargs={"pk": stakeholder.pk})
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["role"] == "executive_sponsor"
        assert "user_name" in response.data
        assert "user_email" in response.data
        assert "quadrant" in response.data

    def test_update_stakeholder(self, authenticated_client, stakeholder):
        """Test updating a stakeholder's fields."""
        url = reverse("governance-stakeholder-detail", kwargs={"pk": stakeholder.pk})
        response = authenticated_client.patch(
            url,
            {
                "user": stakeholder.user.pk,
                "influence_level": "low",
                "interest_level": "low",
                "notes": "Demoted in influence",
            },
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data["influence_level"] == "low"
        assert response.data["interest_level"] == "low"
        assert response.data["notes"] == "Demoted in influence"

    def test_delete_stakeholder(self, authenticated_client, stakeholder):
        """Test deleting a stakeholder."""
        url = reverse("governance-stakeholder-detail", kwargs={"pk": stakeholder.pk})
        response = authenticated_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not GovernanceStakeholder.objects.filter(pk=stakeholder.pk).exists()

    def test_filter_stakeholders_by_role(self, authenticated_client, stakeholder):
        """Test filtering stakeholders by role."""
        url = reverse("governance-stakeholder-list")
        response = authenticated_client.get(url, {"role": "executive_sponsor"})
        assert response.status_code == status.HTTP_200_OK
        for s in response.data:
            assert s["role"] == "executive_sponsor"

    def test_filter_stakeholders_by_influence_level(
        self, authenticated_client, stakeholder
    ):
        """Test filtering stakeholders by influence level."""
        url = reverse("governance-stakeholder-list")
        response = authenticated_client.get(url, {"influence_level": "high"})
        assert response.status_code == status.HTTP_200_OK
        for s in response.data:
            assert s["influence_level"] == "high"

    def test_filter_stakeholders_by_interest_level(
        self, authenticated_client, stakeholder
    ):
        """Test filtering stakeholders by interest level."""
        url = reverse("governance-stakeholder-list")
        response = authenticated_client.get(url, {"interest_level": "high"})
        assert response.status_code == status.HTTP_200_OK
        for s in response.data:
            assert s["interest_level"] == "high"

    def test_filter_stakeholders_by_is_active(
        self, authenticated_client, stakeholder
    ):
        """Test filtering stakeholders by active status."""
        url = reverse("governance-stakeholder-list")
        response = authenticated_client.get(url, {"is_active": "true"})
        assert response.status_code == status.HTTP_200_OK
        for s in response.data:
            assert s["is_active"] is True

    @pytest.mark.parametrize(
        "role",
        [
            "executive_sponsor",
            "senior_responsible_owner",
            "business_change_manager",
            "project_executive",
            "key_stakeholder",
        ],
    )
    def test_valid_stakeholder_roles_accepted(
        self, authenticated_client, user, portfolio, role
    ):
        """Test that each valid stakeholder role is accepted."""
        url = reverse("governance-stakeholder-list")
        data = {
            "user": user.pk,
            "role": role,
            "influence_level": "medium",
            "interest_level": "medium",
            "portfolio": str(portfolio.pk),
        }
        response = authenticated_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["role"] == role

    def test_invalid_stakeholder_role_rejected(
        self, authenticated_client, user, portfolio
    ):
        """Test that an invalid stakeholder role is rejected."""
        url = reverse("governance-stakeholder-list")
        data = {
            "user": user.pk,
            "role": "ceo",
            "influence_level": "high",
            "interest_level": "high",
            "portfolio": str(portfolio.pk),
        }
        response = authenticated_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_invalid_influence_level_rejected(
        self, authenticated_client, user, portfolio
    ):
        """Test that an invalid influence level is rejected."""
        url = reverse("governance-stakeholder-list")
        data = {
            "user": user.pk,
            "role": "key_stakeholder",
            "influence_level": "extreme",
            "interest_level": "high",
            "portfolio": str(portfolio.pk),
        }
        response = authenticated_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_invalid_interest_level_rejected(
        self, authenticated_client, user, portfolio
    ):
        """Test that an invalid interest level is rejected."""
        url = reverse("governance-stakeholder-list")
        data = {
            "user": user.pk,
            "role": "key_stakeholder",
            "influence_level": "high",
            "interest_level": "extreme",
            "portfolio": str(portfolio.pk),
        }
        response = authenticated_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_stakeholder_linked_to_project(
        self, authenticated_client, user, waterfall_project
    ):
        """Test creating a stakeholder linked to a project."""
        url = reverse("governance-stakeholder-list")
        data = {
            "user": user.pk,
            "role": "project_executive",
            "influence_level": "high",
            "interest_level": "high",
            "project": str(waterfall_project.pk),
        }
        response = authenticated_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["project"] is not None

    def test_deactivate_stakeholder(self, authenticated_client, stakeholder):
        """Test deactivating a stakeholder."""
        url = reverse("governance-stakeholder-detail", kwargs={"pk": stakeholder.pk})
        response = authenticated_client.patch(
            url, {"user": stakeholder.user.pk, "is_active": False}, format="json"
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data["is_active"] is False

    def test_unauthenticated_stakeholder_access_denied(self, api_client):
        """Test that unauthenticated requests to stakeholders are rejected."""
        url = reverse("governance-stakeholder-list")
        response = api_client.get(url)
        assert response.status_code in (
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        )


# ============================================================
# 8. Stakeholder Quadrant Calculation Tests
# ============================================================

@pytest.mark.django_db
class TestStakeholderQuadrant:
    """Test the stakeholder_quadrant property (Power/Interest Matrix).

    Matrix:
      - high influence + high interest   -> manage_closely
      - high influence + medium interest  -> keep_satisfied
      - high influence + low interest     -> keep_satisfied
      - medium influence + high interest  -> keep_informed
      - low influence + high interest     -> keep_informed
      - medium influence + medium interest -> monitor
      - medium influence + low interest   -> monitor
      - low influence + medium interest   -> monitor
      - low influence + low interest      -> monitor
    """

    def test_high_influence_high_interest_manage_closely(self, db, user, portfolio):
        """High influence + high interest = manage_closely (Key Players)."""
        s = GovernanceStakeholder.objects.create(
            user=user,
            role="executive_sponsor",
            influence_level="high",
            interest_level="high",
            portfolio=portfolio,
        )
        assert s.stakeholder_quadrant == "manage_closely"

    def test_high_influence_medium_interest_keep_satisfied(self, db, user, portfolio):
        """High influence + medium interest = keep_satisfied."""
        s = GovernanceStakeholder.objects.create(
            user=user,
            role="executive_sponsor",
            influence_level="high",
            interest_level="medium",
            portfolio=portfolio,
        )
        assert s.stakeholder_quadrant == "keep_satisfied"

    def test_high_influence_low_interest_keep_satisfied(self, db, user, portfolio):
        """High influence + low interest = keep_satisfied."""
        s = GovernanceStakeholder.objects.create(
            user=user,
            role="executive_sponsor",
            influence_level="high",
            interest_level="low",
            portfolio=portfolio,
        )
        assert s.stakeholder_quadrant == "keep_satisfied"

    def test_medium_influence_high_interest_keep_informed(self, db, user, portfolio):
        """Medium influence + high interest = keep_informed."""
        s = GovernanceStakeholder.objects.create(
            user=user,
            role="key_stakeholder",
            influence_level="medium",
            interest_level="high",
            portfolio=portfolio,
        )
        assert s.stakeholder_quadrant == "keep_informed"

    def test_low_influence_high_interest_keep_informed(self, db, user, portfolio):
        """Low influence + high interest = keep_informed."""
        s = GovernanceStakeholder.objects.create(
            user=user,
            role="key_stakeholder",
            influence_level="low",
            interest_level="high",
            portfolio=portfolio,
        )
        assert s.stakeholder_quadrant == "keep_informed"

    def test_low_influence_low_interest_monitor(self, db, user, portfolio):
        """Low influence + low interest = monitor."""
        s = GovernanceStakeholder.objects.create(
            user=user,
            role="key_stakeholder",
            influence_level="low",
            interest_level="low",
            portfolio=portfolio,
        )
        assert s.stakeholder_quadrant == "monitor"

    def test_medium_influence_medium_interest_monitor(self, db, user, portfolio):
        """Medium influence + medium interest = monitor."""
        s = GovernanceStakeholder.objects.create(
            user=user,
            role="key_stakeholder",
            influence_level="medium",
            interest_level="medium",
            portfolio=portfolio,
        )
        assert s.stakeholder_quadrant == "monitor"

    def test_medium_influence_low_interest_monitor(self, db, user, portfolio):
        """Medium influence + low interest = monitor."""
        s = GovernanceStakeholder.objects.create(
            user=user,
            role="key_stakeholder",
            influence_level="medium",
            interest_level="low",
            portfolio=portfolio,
        )
        assert s.stakeholder_quadrant == "monitor"

    def test_low_influence_medium_interest_monitor(self, db, user, portfolio):
        """Low influence + medium interest = monitor."""
        s = GovernanceStakeholder.objects.create(
            user=user,
            role="key_stakeholder",
            influence_level="low",
            interest_level="medium",
            portfolio=portfolio,
        )
        assert s.stakeholder_quadrant == "monitor"

    def test_quadrant_exposed_in_api_response(self, authenticated_client, stakeholder):
        """Test that the quadrant field is present in the API response."""
        url = reverse("governance-stakeholder-detail", kwargs={"pk": stakeholder.pk})
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert "quadrant" in response.data
        assert response.data["quadrant"] == "manage_closely"

    def test_quadrant_changes_after_update(self, authenticated_client, stakeholder):
        """Test that quadrant updates when influence/interest levels change."""
        url = reverse("governance-stakeholder-detail", kwargs={"pk": stakeholder.pk})

        # Initially high/high = manage_closely
        response = authenticated_client.get(url)
        assert response.data["quadrant"] == "manage_closely"

        # Change to low/low = monitor
        response = authenticated_client.patch(
            url,
            {"user": stakeholder.user.pk, "influence_level": "low", "interest_level": "low"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data["quadrant"] == "monitor"

    @pytest.mark.parametrize(
        "influence,interest,expected_quadrant",
        [
            ("high", "high", "manage_closely"),
            ("high", "medium", "keep_satisfied"),
            ("high", "low", "keep_satisfied"),
            ("medium", "high", "keep_informed"),
            ("low", "high", "keep_informed"),
            ("medium", "medium", "monitor"),
            ("medium", "low", "monitor"),
            ("low", "medium", "monitor"),
            ("low", "low", "monitor"),
        ],
    )
    def test_all_quadrant_combinations(
        self,
        db,
        user,
        portfolio,
        influence,
        interest,
        expected_quadrant,
    ):
        """Parametrized test covering all influence/interest combinations."""
        s = GovernanceStakeholder.objects.create(
            user=user,
            role="key_stakeholder",
            influence_level=influence,
            interest_level=interest,
            portfolio=portfolio,
        )
        assert s.stakeholder_quadrant == expected_quadrant
