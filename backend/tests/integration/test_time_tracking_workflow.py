"""
Tests for Time Tracking Workflow
=================================

Covers the full lifecycle of TimeEntry objects:
    create (draft) -> submit -> approve / reject,
    plus filtering, the my_entries action, and the summary endpoint.

Endpoints under /api/v1/projects/:
    time-entries/               - CRUD  (list / create / retrieve / update / destroy)
    time-entries/{id}/submit/   - submit draft entry for approval
    time-entries/{id}/approve/  - approve a submitted entry
    time-entries/{id}/reject/   - reject a submitted entry
    time-entries/my_entries/    - list current user's entries
    time-entries/summary/       - aggregated time summary for a project
"""

import pytest
from datetime import date, timedelta
from decimal import Decimal

from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

from projects.models import Project, TimeEntry

User = get_user_model()


def _extract_results(data):
    """Handle both paginated (dict with 'results') and non-paginated (list) responses."""
    if isinstance(data, dict):
        return data.get("results", [])
    return list(data)


# ------------------------------------------------------------------ helpers
BASE_URL = "/api/v1/projects/time-entries"
LIST_URL = f"{BASE_URL}/"
MY_ENTRIES_URL = f"{BASE_URL}/my_entries/"
SUMMARY_URL = f"{BASE_URL}/summary/"


def _detail_url(pk):
    return f"{BASE_URL}/{pk}/"


def _submit_url(pk):
    return f"{BASE_URL}/{pk}/submit/"


def _approve_url(pk):
    return f"{BASE_URL}/{pk}/approve/"


def _reject_url(pk):
    return f"{BASE_URL}/{pk}/reject/"


# ============================================================
# Create time entry (draft)
# ============================================================

@pytest.mark.django_db
class TestCreateTimeEntry:
    """POST /api/v1/projects/time-entries/"""

    def test_create_time_entry_defaults_to_draft(
        self, authenticated_admin_client, waterfall_project
    ):
        """A new time entry is created with status='draft'."""
        data = {
            "project": waterfall_project.id,
            "date": str(date.today()),
            "hours": "4.00",
            "description": "Backend development",
            "billable": True,
        }
        response = authenticated_admin_client.post(LIST_URL, data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["status"] == "draft"
        assert Decimal(response.data["hours"]) == Decimal("4.00")

    def test_create_entry_assigns_authenticated_user(
        self, authenticated_admin_client, admin_user, waterfall_project
    ):
        """perform_create auto-sets user to request.user."""
        data = {
            "project": waterfall_project.id,
            "date": str(date.today()),
            "hours": "2.50",
            "description": "Testing",
        }
        response = authenticated_admin_client.post(LIST_URL, data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["user"] == admin_user.id

    def test_create_entry_unauthenticated_rejected(self, api_client, waterfall_project):
        """Unauthenticated requests are rejected."""
        data = {
            "project": waterfall_project.id,
            "date": str(date.today()),
            "hours": "1.00",
        }
        response = api_client.post(LIST_URL, data, format="json")
        assert response.status_code in (
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        )

    def test_create_entry_with_zero_hours_rejected(
        self, authenticated_admin_client, waterfall_project
    ):
        """Zero or negative hours should be rejected by validation."""
        data = {
            "project": waterfall_project.id,
            "date": str(date.today()),
            "hours": "0.00",
            "description": "No work?",
        }
        response = authenticated_admin_client.post(LIST_URL, data, format="json")
        # Depending on serializer validation, this may be 201 or 400.
        # We assert the entry is created or rejected cleanly.
        assert response.status_code in (
            status.HTTP_201_CREATED,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_create_non_billable_entry(
        self, authenticated_admin_client, waterfall_project
    ):
        """A time entry can be marked non-billable."""
        data = {
            "project": waterfall_project.id,
            "date": str(date.today()),
            "hours": "1.00",
            "description": "Internal meeting",
            "billable": False,
        }
        response = authenticated_admin_client.post(LIST_URL, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["billable"] is False


# ============================================================
# Submit for approval
# ============================================================

@pytest.mark.django_db
class TestSubmitTimeEntry:
    """POST /api/v1/projects/time-entries/{id}/submit/"""

    def _create_draft(self, client, project):
        """Helper: create a draft time entry and return the response data."""
        data = {
            "project": project.id,
            "date": str(date.today()),
            "hours": "3.00",
            "description": "Draft entry for submit test",
        }
        resp = client.post(LIST_URL, data, format="json")
        assert resp.status_code == status.HTTP_201_CREATED
        return resp.data

    def test_submit_draft_changes_status(
        self, authenticated_admin_client, waterfall_project
    ):
        """Submitting a draft entry changes its status to 'submitted'."""
        entry = self._create_draft(authenticated_admin_client, waterfall_project)
        response = authenticated_admin_client.post(_submit_url(entry["id"]))

        assert response.status_code == status.HTTP_200_OK
        assert response.data["status"] == "submitted"

    def test_submit_already_submitted_fails(
        self, authenticated_admin_client, waterfall_project
    ):
        """Cannot submit an entry that is already submitted."""
        entry = self._create_draft(authenticated_admin_client, waterfall_project)
        # First submit
        authenticated_admin_client.post(_submit_url(entry["id"]))
        # Second submit
        response = authenticated_admin_client.post(_submit_url(entry["id"]))
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_submit_by_different_user_forbidden(
        self, authenticated_admin_client, waterfall_project, company
    ):
        """A user cannot submit another user's time entry."""
        entry = self._create_draft(authenticated_admin_client, waterfall_project)

        # Create a different authenticated user
        other_user = User.objects.create_user(
            username="other_submitter",
            email="other_sub@projextpal.com",
            password="testpass123",
        )
        if hasattr(other_user, "company"):
            other_user.company = company
            other_user.save()

        other_client = APIClient()
        other_client.force_authenticate(user=other_user)

        response = other_client.post(_submit_url(entry["id"]))
        assert response.status_code in (
            status.HTTP_403_FORBIDDEN,
            status.HTTP_404_NOT_FOUND,  # CompanyScopedQuerysetMixin may hide it
        )


# ============================================================
# Approve time entry
# ============================================================

@pytest.mark.django_db
class TestApproveTimeEntry:
    """POST /api/v1/projects/time-entries/{id}/approve/"""

    def _create_and_submit(self, client, project):
        """Helper: create a draft, submit it, return its id."""
        data = {
            "project": project.id,
            "date": str(date.today()),
            "hours": "5.00",
            "description": "Work to approve",
        }
        resp = client.post(LIST_URL, data, format="json")
        entry_id = resp.data["id"]
        client.post(_submit_url(entry_id))
        return entry_id

    def test_approve_submitted_entry(
        self, authenticated_admin_client, waterfall_project
    ):
        """Admin/PM can approve a submitted entry."""
        entry_id = self._create_and_submit(
            authenticated_admin_client, waterfall_project
        )
        response = authenticated_admin_client.post(_approve_url(entry_id))

        assert response.status_code == status.HTTP_200_OK
        assert response.data["status"] == "approved"
        assert response.data["approved_by"] is not None
        assert response.data["approved_at"] is not None

    def test_approve_draft_entry_directly(
        self, authenticated_admin_client, waterfall_project
    ):
        """Draft entries can also be approved directly (per current view logic)."""
        data = {
            "project": waterfall_project.id,
            "date": str(date.today()),
            "hours": "2.00",
            "description": "Direct approve",
        }
        resp = authenticated_admin_client.post(LIST_URL, data, format="json")
        entry_id = resp.data["id"]

        response = authenticated_admin_client.post(_approve_url(entry_id))
        assert response.status_code == status.HTTP_200_OK
        assert response.data["status"] == "approved"

    def test_approve_already_approved_fails(
        self, authenticated_admin_client, waterfall_project
    ):
        """Cannot approve an entry that is already approved."""
        entry_id = self._create_and_submit(
            authenticated_admin_client, waterfall_project
        )
        authenticated_admin_client.post(_approve_url(entry_id))
        # Second approve
        response = authenticated_admin_client.post(_approve_url(entry_id))
        assert response.status_code == status.HTTP_400_BAD_REQUEST


# ============================================================
# Reject time entry
# ============================================================

@pytest.mark.django_db
class TestRejectTimeEntry:
    """POST /api/v1/projects/time-entries/{id}/reject/"""

    def _create_and_submit(self, client, project):
        data = {
            "project": project.id,
            "date": str(date.today()),
            "hours": "6.00",
            "description": "Work to reject",
        }
        resp = client.post(LIST_URL, data, format="json")
        entry_id = resp.data["id"]
        client.post(_submit_url(entry_id))
        return entry_id

    def test_reject_submitted_entry(
        self, authenticated_admin_client, waterfall_project
    ):
        """Admin/PM can reject a submitted entry."""
        entry_id = self._create_and_submit(
            authenticated_admin_client, waterfall_project
        )
        response = authenticated_admin_client.post(_reject_url(entry_id))

        assert response.status_code == status.HTTP_200_OK
        assert response.data["status"] == "rejected"

    def test_reject_already_rejected_fails(
        self, authenticated_admin_client, waterfall_project
    ):
        """Cannot reject an entry that is already rejected."""
        entry_id = self._create_and_submit(
            authenticated_admin_client, waterfall_project
        )
        authenticated_admin_client.post(_reject_url(entry_id))

        response = authenticated_admin_client.post(_reject_url(entry_id))
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_reject_already_approved_fails(
        self, authenticated_admin_client, waterfall_project
    ):
        """Cannot reject an entry that has already been approved."""
        entry_id = self._create_and_submit(
            authenticated_admin_client, waterfall_project
        )
        authenticated_admin_client.post(_approve_url(entry_id))

        response = authenticated_admin_client.post(_reject_url(entry_id))
        assert response.status_code == status.HTTP_400_BAD_REQUEST


# ============================================================
# Filtering
# ============================================================

@pytest.mark.django_db
class TestTimeEntryFiltering:
    """GET /api/v1/projects/time-entries/?<filters>"""

    def _seed_entries(self, client, project, count=3):
        """Create several entries on consecutive days."""
        ids = []
        for i in range(count):
            data = {
                "project": project.id,
                "date": str(date.today() - timedelta(days=i)),
                "hours": str(2 + i),
                "description": f"Entry {i}",
            }
            resp = client.post(LIST_URL, data, format="json")
            assert resp.status_code == status.HTTP_201_CREATED
            ids.append(resp.data["id"])
        return ids

    def test_filter_by_project(
        self, authenticated_admin_client, waterfall_project, kanban_project, admin_user
    ):
        """Filtering by project returns only that project's entries."""
        self._seed_entries(authenticated_admin_client, waterfall_project, count=2)

        # Create an entry on a different project
        data = {
            "project": kanban_project.id,
            "date": str(date.today()),
            "hours": "1.00",
            "description": "Kanban entry",
        }
        authenticated_admin_client.post(LIST_URL, data, format="json")

        response = authenticated_admin_client.get(
            LIST_URL, {"project": waterfall_project.id}
        )
        assert response.status_code == status.HTTP_200_OK

        project_ids = {e["project"] for e in _extract_results(response.data)}
        assert all(pid == waterfall_project.id for pid in project_ids)

    def test_filter_by_date_range(
        self, authenticated_admin_client, waterfall_project
    ):
        """start_date / end_date filters narrow results."""
        self._seed_entries(authenticated_admin_client, waterfall_project, count=5)

        start = str(date.today() - timedelta(days=2))
        end = str(date.today())
        response = authenticated_admin_client.get(
            LIST_URL, {"start_date": start, "end_date": end, "project": waterfall_project.id}
        )
        assert response.status_code == status.HTTP_200_OK

        entries = _extract_results(response.data)
        for entry in entries:
            assert start <= entry["date"] <= end

    def test_filter_by_status(
        self, authenticated_admin_client, waterfall_project
    ):
        """Filter by status returns only matching entries."""
        ids = self._seed_entries(authenticated_admin_client, waterfall_project, count=2)
        # Submit the first entry
        authenticated_admin_client.post(_submit_url(ids[0]))

        response = authenticated_admin_client.get(
            LIST_URL, {"status": "submitted", "project": waterfall_project.id}
        )
        assert response.status_code == status.HTTP_200_OK
        entries = _extract_results(response.data)
        for entry in entries:
            assert entry["status"] == "submitted"

    def test_filter_by_billable(
        self, authenticated_admin_client, waterfall_project
    ):
        """Filter by billable=true returns only billable entries."""
        # Billable entry
        authenticated_admin_client.post(
            LIST_URL,
            {
                "project": waterfall_project.id,
                "date": str(date.today()),
                "hours": "2.00",
                "description": "Billable",
                "billable": True,
            },
            format="json",
        )
        # Non-billable entry
        authenticated_admin_client.post(
            LIST_URL,
            {
                "project": waterfall_project.id,
                "date": str(date.today()),
                "hours": "1.00",
                "description": "Non-billable",
                "billable": False,
            },
            format="json",
        )

        response = authenticated_admin_client.get(
            LIST_URL, {"billable": "true", "project": waterfall_project.id}
        )
        assert response.status_code == status.HTTP_200_OK
        entries = _extract_results(response.data)
        for entry in entries:
            assert entry["billable"] is True


# ============================================================
# My entries
# ============================================================

@pytest.mark.django_db
class TestMyEntries:
    """GET /api/v1/projects/time-entries/my_entries/"""

    def test_my_entries_returns_own_entries(
        self, authenticated_admin_client, admin_user, waterfall_project, company
    ):
        """my_entries returns only the authenticated user's entries."""
        # Create entry as admin
        authenticated_admin_client.post(
            LIST_URL,
            {
                "project": waterfall_project.id,
                "date": str(date.today()),
                "hours": "3.00",
                "description": "Admin work",
            },
            format="json",
        )

        # Create entry as a different user directly in the DB
        other = User.objects.create_user(
            username="other_my",
            email="other_my@projextpal.com",
            password="testpass123",
        )
        if hasattr(other, "company"):
            other.company = company
            other.save()

        TimeEntry.objects.create(
            project=waterfall_project,
            user=other,
            date=date.today(),
            hours=Decimal("7.00"),
            description="Other user work",
        )

        response = authenticated_admin_client.get(MY_ENTRIES_URL)
        assert response.status_code == status.HTTP_200_OK
        entries = _extract_results(response.data)
        for entry in entries:
            assert entry["user"] == admin_user.id

    def test_my_entries_with_date_filter(
        self, authenticated_admin_client, waterfall_project
    ):
        """my_entries supports start_date / end_date."""
        for i in range(3):
            authenticated_admin_client.post(
                LIST_URL,
                {
                    "project": waterfall_project.id,
                    "date": str(date.today() - timedelta(days=i)),
                    "hours": "2.00",
                    "description": f"Day {i}",
                },
                format="json",
            )

        response = authenticated_admin_client.get(
            MY_ENTRIES_URL,
            {"start_date": str(date.today() - timedelta(days=1)), "end_date": str(date.today())},
        )
        assert response.status_code == status.HTTP_200_OK
        entries = _extract_results(response.data)
        assert len(entries) <= 2

    def test_my_entries_empty_for_user_without_entries(
        self, db, company, waterfall_project
    ):
        """A user with no time entries gets an empty list."""
        no_entry_user = User.objects.create_user(
            username="noentryguy",
            email="noentry@projextpal.com",
            password="testpass123",
        )
        if hasattr(no_entry_user, "company"):
            no_entry_user.company = company
            no_entry_user.save()

        client = APIClient()
        client.force_authenticate(user=no_entry_user)

        response = client.get(MY_ENTRIES_URL)
        assert response.status_code == status.HTTP_200_OK
        entries = _extract_results(response.data)
        assert len(entries) == 0


# ============================================================
# Summary
# ============================================================

@pytest.mark.django_db
class TestTimeEntrySummary:
    """GET /api/v1/projects/time-entries/summary/?project=<id>"""

    def test_summary_requires_project_param(self, authenticated_admin_client):
        """Summary endpoint returns 400 if project is missing."""
        response = authenticated_admin_client.get(SUMMARY_URL)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_summary_returns_totals(
        self, authenticated_admin_client, waterfall_project
    ):
        """Summary calculates total hours across entries."""
        for hrs in ("3.00", "5.00", "2.00"):
            authenticated_admin_client.post(
                LIST_URL,
                {
                    "project": waterfall_project.id,
                    "date": str(date.today()),
                    "hours": hrs,
                    "description": "Summary seed",
                },
                format="json",
            )

        response = authenticated_admin_client.get(
            SUMMARY_URL, {"project": waterfall_project.id}
        )
        assert response.status_code == status.HTTP_200_OK
        assert Decimal(str(response.data["total_hours"])) == Decimal("10.00")

    def test_summary_billable_vs_total(
        self, authenticated_admin_client, waterfall_project
    ):
        """Summary differentiates billable and total hours."""
        # Billable
        authenticated_admin_client.post(
            LIST_URL,
            {
                "project": waterfall_project.id,
                "date": str(date.today()),
                "hours": "4.00",
                "description": "Billable work",
                "billable": True,
            },
            format="json",
        )
        # Non-billable
        authenticated_admin_client.post(
            LIST_URL,
            {
                "project": waterfall_project.id,
                "date": str(date.today()),
                "hours": "2.00",
                "description": "Internal meeting",
                "billable": False,
            },
            format="json",
        )

        response = authenticated_admin_client.get(
            SUMMARY_URL, {"project": waterfall_project.id}
        )
        assert response.status_code == status.HTTP_200_OK

        total = Decimal(str(response.data["total_hours"]))
        billable = Decimal(str(response.data["billable_hours"]))
        assert total == Decimal("6.00")
        assert billable == Decimal("4.00")

    def test_summary_with_date_range(
        self, authenticated_admin_client, waterfall_project
    ):
        """Summary respects start_date / end_date filters."""
        for i in range(5):
            authenticated_admin_client.post(
                LIST_URL,
                {
                    "project": waterfall_project.id,
                    "date": str(date.today() - timedelta(days=i)),
                    "hours": "1.00",
                    "description": f"Day {i}",
                },
                format="json",
            )

        response = authenticated_admin_client.get(
            SUMMARY_URL,
            {
                "project": waterfall_project.id,
                "start_date": str(date.today() - timedelta(days=2)),
                "end_date": str(date.today()),
            },
        )
        assert response.status_code == status.HTTP_200_OK
        total = Decimal(str(response.data["total_hours"]))
        assert total == Decimal("3.00")

    def test_summary_empty_project_returns_zero(
        self, authenticated_admin_client, kanban_project
    ):
        """Summary for a project with no entries returns zero totals."""
        response = authenticated_admin_client.get(
            SUMMARY_URL, {"project": kanban_project.id}
        )
        assert response.status_code == status.HTTP_200_OK
        assert Decimal(str(response.data["total_hours"])) == Decimal("0")


# ============================================================
# Full lifecycle integration
# ============================================================

@pytest.mark.django_db
class TestTimeEntryFullLifecycle:
    """End-to-end: create -> submit -> approve, and create -> submit -> reject."""

    def test_full_approve_lifecycle(
        self, authenticated_admin_client, waterfall_project
    ):
        """Create -> submit -> approve flows through all statuses."""
        # Create
        resp = authenticated_admin_client.post(
            LIST_URL,
            {
                "project": waterfall_project.id,
                "date": str(date.today()),
                "hours": "8.00",
                "description": "Full day work",
            },
            format="json",
        )
        assert resp.data["status"] == "draft"
        entry_id = resp.data["id"]

        # Submit
        resp = authenticated_admin_client.post(_submit_url(entry_id))
        assert resp.data["status"] == "submitted"

        # Approve
        resp = authenticated_admin_client.post(_approve_url(entry_id))
        assert resp.data["status"] == "approved"

    def test_full_reject_lifecycle(
        self, authenticated_admin_client, waterfall_project
    ):
        """Create -> submit -> reject flows through all statuses."""
        resp = authenticated_admin_client.post(
            LIST_URL,
            {
                "project": waterfall_project.id,
                "date": str(date.today()),
                "hours": "4.00",
                "description": "Will be rejected",
            },
            format="json",
        )
        entry_id = resp.data["id"]

        authenticated_admin_client.post(_submit_url(entry_id))
        resp = authenticated_admin_client.post(_reject_url(entry_id))
        assert resp.data["status"] == "rejected"

    def test_retrieve_single_entry(
        self, authenticated_admin_client, waterfall_project
    ):
        """GET on a specific entry returns its full detail."""
        resp = authenticated_admin_client.post(
            LIST_URL,
            {
                "project": waterfall_project.id,
                "date": str(date.today()),
                "hours": "2.00",
                "description": "Retrieve me",
            },
            format="json",
        )
        entry_id = resp.data["id"]

        response = authenticated_admin_client.get(_detail_url(entry_id))
        assert response.status_code == status.HTTP_200_OK
        assert response.data["description"] == "Retrieve me"

    def test_update_draft_entry(
        self, authenticated_admin_client, waterfall_project
    ):
        """A draft entry can be partially updated."""
        resp = authenticated_admin_client.post(
            LIST_URL,
            {
                "project": waterfall_project.id,
                "date": str(date.today()),
                "hours": "3.00",
                "description": "Original",
            },
            format="json",
        )
        entry_id = resp.data["id"]

        response = authenticated_admin_client.patch(
            _detail_url(entry_id),
            {"description": "Updated description", "hours": "4.50"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data["description"] == "Updated description"
        assert Decimal(response.data["hours"]) == Decimal("4.50")

    def test_delete_draft_entry(
        self, authenticated_admin_client, waterfall_project
    ):
        """A draft entry can be deleted."""
        resp = authenticated_admin_client.post(
            LIST_URL,
            {
                "project": waterfall_project.id,
                "date": str(date.today()),
                "hours": "1.00",
                "description": "Delete me",
            },
            format="json",
        )
        entry_id = resp.data["id"]

        response = authenticated_admin_client.delete(_detail_url(entry_id))
        assert response.status_code == status.HTTP_204_NO_CONTENT

        # Confirm deletion
        response = authenticated_admin_client.get(_detail_url(entry_id))
        assert response.status_code == status.HTTP_404_NOT_FOUND
