"""
Tests for Reporting (StatusReport & ReportingItem)
====================================================

Covers CRUD operations for StatusReport and ReportingItem models,
including progress validation, frequency/type constraints, and
project-scoped filtering.

Endpoints under /api/v1/communication/:
    status-reports/       - CRUD (list / create / retrieve / update / partial_update / destroy)
    reporting-items/      - CRUD (list / create / retrieve / partial_update / destroy)
"""

import pytest
from datetime import date, timedelta

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

from projects.models import Project
from communication.models import StatusReport, ReportingItem

User = get_user_model()

# ------------------------------------------------------------------ helpers
STATUS_REPORTS_URL = "/api/v1/communication/status-reports/"
REPORTING_ITEMS_URL = "/api/v1/communication/reporting-items/"


def _extract_results(data):
    """Handle both paginated (dict with 'results') and non-paginated (list) responses."""
    if isinstance(data, dict):
        return data.get("results", [])
    return list(data)


def _status_report_detail(pk):
    return f"{STATUS_REPORTS_URL}{pk}/"


def _reporting_item_detail(pk):
    return f"{REPORTING_ITEMS_URL}{pk}/"


# ============================================================
# StatusReport - Create
# ============================================================

@pytest.mark.django_db
class TestCreateStatusReport:
    """POST /api/v1/communication/status-reports/"""

    def test_create_status_report(self, authenticated_admin_client, waterfall_project):
        """Create a status report with valid data."""
        data = {
            "project": waterfall_project.id,
            "status": "Not Started",
            "progress": 0,
            "last_updated": str(date.today()),
        }
        response = authenticated_admin_client.post(
            STATUS_REPORTS_URL, data, format="json"
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["status"] == "Not Started"
        assert response.data["progress"] == 0
        assert response.data["project"] == waterfall_project.id

    def test_create_report_in_progress(
        self, authenticated_admin_client, waterfall_project
    ):
        """Create a report with 'In Progress' status and partial progress."""
        data = {
            "project": waterfall_project.id,
            "status": "In Progress",
            "progress": 45,
            "last_updated": str(date.today()),
        }
        response = authenticated_admin_client.post(
            STATUS_REPORTS_URL, data, format="json"
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["status"] == "In Progress"
        assert response.data["progress"] == 45

    def test_create_completed_report(
        self, authenticated_admin_client, waterfall_project
    ):
        """Create a report with 'Completed' status and 100% progress."""
        data = {
            "project": waterfall_project.id,
            "status": "Completed",
            "progress": 100,
            "last_updated": str(date.today()),
        }
        response = authenticated_admin_client.post(
            STATUS_REPORTS_URL, data, format="json"
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["progress"] == 100

    def test_create_report_progress_negative_rejected(
        self, authenticated_admin_client, waterfall_project
    ):
        """Progress below 0 is rejected by the serializer validator."""
        data = {
            "project": waterfall_project.id,
            "status": "In Progress",
            "progress": -5,
            "last_updated": str(date.today()),
        }
        response = authenticated_admin_client.post(
            STATUS_REPORTS_URL, data, format="json"
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_create_report_progress_over_100_rejected(
        self, authenticated_admin_client, waterfall_project
    ):
        """Progress above 100 is rejected by the serializer validator."""
        data = {
            "project": waterfall_project.id,
            "status": "In Progress",
            "progress": 150,
            "last_updated": str(date.today()),
        }
        response = authenticated_admin_client.post(
            STATUS_REPORTS_URL, data, format="json"
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_create_report_invalid_status_rejected(
        self, authenticated_admin_client, waterfall_project
    ):
        """An invalid status choice is rejected."""
        data = {
            "project": waterfall_project.id,
            "status": "InvalidStatus",
            "progress": 10,
            "last_updated": str(date.today()),
        }
        response = authenticated_admin_client.post(
            STATUS_REPORTS_URL, data, format="json"
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_create_report_returns_string_id(
        self, authenticated_admin_client, waterfall_project
    ):
        """Serializer converts integer PK to string in the response."""
        data = {
            "project": waterfall_project.id,
            "status": "Not Started",
            "progress": 0,
            "last_updated": str(date.today()),
        }
        response = authenticated_admin_client.post(
            STATUS_REPORTS_URL, data, format="json"
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert isinstance(response.data["id"], str)


# ============================================================
# StatusReport - Update
# ============================================================

@pytest.mark.django_db
class TestUpdateStatusReport:
    """PUT / PATCH /api/v1/communication/status-reports/{id}/"""

    def _create_report(self, client, project, progress=0, report_status="Not Started"):
        """Helper: create a status report and return the response data."""
        data = {
            "project": project.id,
            "status": report_status,
            "progress": progress,
            "last_updated": str(date.today()),
        }
        resp = client.post(STATUS_REPORTS_URL, data, format="json")
        assert resp.status_code == status.HTTP_201_CREATED
        return resp.data

    def test_update_report_progress(
        self, authenticated_admin_client, waterfall_project
    ):
        """PATCH updates progress and preserves other fields."""
        report = self._create_report(authenticated_admin_client, waterfall_project)
        response = authenticated_admin_client.patch(
            _status_report_detail(report["id"]),
            {"progress": 60},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data["progress"] == 60

    def test_update_report_status_to_completed(
        self, authenticated_admin_client, waterfall_project
    ):
        """PATCH can change status to Completed."""
        report = self._create_report(
            authenticated_admin_client, waterfall_project, progress=80, report_status="In Progress"
        )
        response = authenticated_admin_client.patch(
            _status_report_detail(report["id"]),
            {"status": "Completed", "progress": 100},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data["status"] == "Completed"
        assert response.data["progress"] == 100

    def test_full_update_via_put(
        self, authenticated_admin_client, waterfall_project
    ):
        """PUT replaces all fields."""
        report = self._create_report(authenticated_admin_client, waterfall_project)
        updated = {
            "project": waterfall_project.id,
            "status": "In Progress",
            "progress": 50,
            "last_updated": str(date.today()),
        }
        response = authenticated_admin_client.put(
            _status_report_detail(report["id"]),
            updated,
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data["status"] == "In Progress"
        assert response.data["progress"] == 50

    def test_update_progress_beyond_100_rejected(
        self, authenticated_admin_client, waterfall_project
    ):
        """Updating progress above 100 is rejected."""
        report = self._create_report(authenticated_admin_client, waterfall_project)
        response = authenticated_admin_client.patch(
            _status_report_detail(report["id"]),
            {"progress": 120},
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST


# ============================================================
# StatusReport - List / Retrieve / Delete
# ============================================================

@pytest.mark.django_db
class TestStatusReportReadAndDelete:
    """GET / DELETE on status-reports."""

    def test_list_status_reports(
        self, authenticated_admin_client, waterfall_project
    ):
        """GET returns all status reports."""
        for i in range(3):
            StatusReport.objects.create(
                project=waterfall_project,
                status="In Progress",
                progress=i * 30,
                last_updated=date.today(),
            )
        response = authenticated_admin_client.get(STATUS_REPORTS_URL)
        assert response.status_code == status.HTTP_200_OK
        results = _extract_results(response.data)
        assert len(results) >= 3

    def test_list_filtered_by_project(
        self, authenticated_admin_client, waterfall_project, kanban_project
    ):
        """Filtering by project returns only that project's reports."""
        StatusReport.objects.create(
            project=waterfall_project,
            status="Not Started",
            progress=0,
            last_updated=date.today(),
        )
        StatusReport.objects.create(
            project=kanban_project,
            status="In Progress",
            progress=25,
            last_updated=date.today(),
        )

        response = authenticated_admin_client.get(
            STATUS_REPORTS_URL, {"project": waterfall_project.id}
        )
        assert response.status_code == status.HTTP_200_OK
        results = _extract_results(response.data)
        for r in results:
            assert r["project"] == waterfall_project.id

    def test_retrieve_single_report(
        self, authenticated_admin_client, waterfall_project
    ):
        """GET /status-reports/{id}/ returns a single report."""
        report = StatusReport.objects.create(
            project=waterfall_project,
            status="In Progress",
            progress=55,
            last_updated=date.today(),
        )
        response = authenticated_admin_client.get(
            _status_report_detail(report.id)
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data["progress"] == 55

    def test_delete_status_report(
        self, authenticated_admin_client, waterfall_project
    ):
        """DELETE removes the report."""
        report = StatusReport.objects.create(
            project=waterfall_project,
            status="Not Started",
            progress=0,
            last_updated=date.today(),
        )
        response = authenticated_admin_client.delete(
            _status_report_detail(report.id)
        )
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not StatusReport.objects.filter(id=report.id).exists()


# ============================================================
# StatusReport - Model-level tests
# ============================================================

@pytest.mark.django_db
class TestStatusReportModel:
    """Direct model tests for StatusReport."""

    def test_auto_last_updated(self, waterfall_project):
        """save() auto-fills last_updated if not provided."""
        report = StatusReport(
            project=waterfall_project,
            status="Not Started",
            progress=0,
        )
        report.save()
        assert report.last_updated is not None

    def test_ordering_by_created_at_desc(self, waterfall_project):
        """Reports are ordered most-recent-first."""
        r1 = StatusReport.objects.create(
            project=waterfall_project,
            status="Not Started",
            progress=0,
            last_updated=date.today(),
        )
        r2 = StatusReport.objects.create(
            project=waterfall_project,
            status="In Progress",
            progress=10,
            last_updated=date.today(),
        )
        qs = StatusReport.objects.filter(project=waterfall_project)
        assert list(qs) == [r2, r1]

    def test_str_representation(self, waterfall_project):
        """__str__ includes the project and status."""
        report = StatusReport.objects.create(
            project=waterfall_project,
            status="In Progress",
            progress=50,
            last_updated=date.today(),
        )
        text = str(report)
        assert "In Progress" in text


# ============================================================
# ReportingItem - Create
# ============================================================

@pytest.mark.django_db
class TestCreateReportingItem:
    """POST /api/v1/communication/reporting-items/"""

    def test_create_reporting_item(
        self, authenticated_admin_client, waterfall_project
    ):
        """Create a reporting item with all required fields."""
        data = {
            "project": waterfall_project.id,
            "name": "Weekly Steering Report",
            "frequency": "Weekly",
            "type": "Steering",
            "start_date": str(date.today()),
            "view": True,
        }
        response = authenticated_admin_client.post(
            REPORTING_ITEMS_URL, data, format="multipart"
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["name"] == "Weekly Steering Report"
        assert response.data["frequency"] == "Weekly"
        assert response.data["type"] == "Steering"

    def test_create_reporting_item_all_frequencies(
        self, authenticated_admin_client, waterfall_project
    ):
        """All five frequency choices are accepted."""
        frequencies = ["Weekly", "Bi-weekly", "Monthly", "Quarterly", "One-time"]
        for freq in frequencies:
            data = {
                "project": waterfall_project.id,
                "name": f"{freq} report",
                "frequency": freq,
                "type": "Team",
                "start_date": str(date.today()),
            }
            response = authenticated_admin_client.post(
                REPORTING_ITEMS_URL, data, format="multipart"
            )
            assert response.status_code == status.HTTP_201_CREATED, (
                f"Failed for frequency={freq}: {response.data}"
            )

    def test_create_reporting_item_all_types(
        self, authenticated_admin_client, waterfall_project
    ):
        """All five type choices are accepted."""
        types = ["Steering", "Program Board", "Team", "Milestone", "Stage"]
        for t in types:
            data = {
                "project": waterfall_project.id,
                "name": f"{t} item",
                "frequency": "Monthly",
                "type": t,
                "start_date": str(date.today()),
            }
            response = authenticated_admin_client.post(
                REPORTING_ITEMS_URL, data, format="multipart"
            )
            assert response.status_code == status.HTTP_201_CREATED, (
                f"Failed for type={t}: {response.data}"
            )

    def test_create_reporting_item_invalid_frequency_rejected(
        self, authenticated_admin_client, waterfall_project
    ):
        """An invalid frequency value is rejected."""
        data = {
            "project": waterfall_project.id,
            "name": "Bad Freq",
            "frequency": "Daily",
            "type": "Team",
            "start_date": str(date.today()),
        }
        response = authenticated_admin_client.post(
            REPORTING_ITEMS_URL, data, format="multipart"
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_create_reporting_item_invalid_type_rejected(
        self, authenticated_admin_client, waterfall_project
    ):
        """An invalid type value is rejected."""
        data = {
            "project": waterfall_project.id,
            "name": "Bad Type",
            "frequency": "Weekly",
            "type": "NonExistent",
            "start_date": str(date.today()),
        }
        response = authenticated_admin_client.post(
            REPORTING_ITEMS_URL, data, format="multipart"
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_create_reporting_item_returns_string_id(
        self, authenticated_admin_client, waterfall_project
    ):
        """Serializer converts PK to string in the response."""
        data = {
            "project": waterfall_project.id,
            "name": "String ID check",
            "frequency": "Monthly",
            "type": "Team",
            "start_date": str(date.today()),
        }
        response = authenticated_admin_client.post(
            REPORTING_ITEMS_URL, data, format="multipart"
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert isinstance(response.data["id"], str)

    def test_create_reporting_item_without_document(
        self, authenticated_admin_client, waterfall_project
    ):
        """Document field is optional."""
        data = {
            "project": waterfall_project.id,
            "name": "No doc",
            "frequency": "Weekly",
            "type": "Steering",
            "start_date": str(date.today()),
        }
        response = authenticated_admin_client.post(
            REPORTING_ITEMS_URL, data, format="multipart"
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data.get("document") in (None, "", None)


# ============================================================
# ReportingItem - List / Retrieve / Delete
# ============================================================

@pytest.mark.django_db
class TestReportingItemReadAndDelete:
    """GET / DELETE on reporting-items."""

    def test_list_reporting_items(
        self, authenticated_admin_client, waterfall_project
    ):
        """GET returns all reporting items."""
        for i in range(3):
            ReportingItem.objects.create(
                project=waterfall_project,
                name=f"Item {i}",
                frequency="Weekly",
                type="Team",
                start_date=date.today(),
            )
        response = authenticated_admin_client.get(REPORTING_ITEMS_URL)
        assert response.status_code == status.HTTP_200_OK
        results = _extract_results(response.data)
        assert len(results) >= 3

    def test_list_filtered_by_project(
        self, authenticated_admin_client, waterfall_project, kanban_project
    ):
        """Filtering by project returns only that project's items."""
        ReportingItem.objects.create(
            project=waterfall_project,
            name="WF Item",
            frequency="Monthly",
            type="Steering",
            start_date=date.today(),
        )
        ReportingItem.objects.create(
            project=kanban_project,
            name="KB Item",
            frequency="Weekly",
            type="Team",
            start_date=date.today(),
        )

        response = authenticated_admin_client.get(
            REPORTING_ITEMS_URL, {"project": waterfall_project.id}
        )
        assert response.status_code == status.HTTP_200_OK
        results = _extract_results(response.data)
        for item in results:
            assert item["project"] == waterfall_project.id

    def test_retrieve_single_reporting_item(
        self, authenticated_admin_client, waterfall_project
    ):
        """GET /reporting-items/{id}/ returns a single item."""
        item = ReportingItem.objects.create(
            project=waterfall_project,
            name="Single Item",
            frequency="Quarterly",
            type="Milestone",
            start_date=date.today(),
        )
        response = authenticated_admin_client.get(
            _reporting_item_detail(item.id)
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data["name"] == "Single Item"
        assert response.data["frequency"] == "Quarterly"
        assert response.data["type"] == "Milestone"

    def test_delete_reporting_item(
        self, authenticated_admin_client, waterfall_project
    ):
        """DELETE removes the item."""
        item = ReportingItem.objects.create(
            project=waterfall_project,
            name="To Delete",
            frequency="One-time",
            type="Stage",
            start_date=date.today(),
        )
        response = authenticated_admin_client.delete(
            _reporting_item_detail(item.id)
        )
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not ReportingItem.objects.filter(id=item.id).exists()

    def test_partial_update_reporting_item(
        self, authenticated_admin_client, waterfall_project
    ):
        """PATCH updates individual fields."""
        item = ReportingItem.objects.create(
            project=waterfall_project,
            name="Updateable",
            frequency="Weekly",
            type="Team",
            start_date=date.today(),
        )
        response = authenticated_admin_client.patch(
            _reporting_item_detail(item.id),
            {"name": "Updated Name", "frequency": "Monthly"},
            format="multipart",
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data["name"] == "Updated Name"
        assert response.data["frequency"] == "Monthly"


# ============================================================
# ReportingItem - Model-level tests
# ============================================================

@pytest.mark.django_db
class TestReportingItemModel:
    """Direct model tests for ReportingItem."""

    def test_str_representation(self, waterfall_project):
        """__str__ includes the name and project."""
        item = ReportingItem.objects.create(
            project=waterfall_project,
            name="Budget Review",
            frequency="Monthly",
            type="Steering",
            start_date=date.today(),
        )
        text = str(item)
        assert "Budget Review" in text

    def test_ordering_by_created_at_desc(self, waterfall_project):
        """Items are ordered most-recent-first."""
        i1 = ReportingItem.objects.create(
            project=waterfall_project,
            name="First",
            frequency="Weekly",
            type="Team",
            start_date=date.today(),
        )
        i2 = ReportingItem.objects.create(
            project=waterfall_project,
            name="Second",
            frequency="Monthly",
            type="Team",
            start_date=date.today(),
        )
        qs = ReportingItem.objects.filter(project=waterfall_project)
        assert list(qs) == [i2, i1]

    def test_document_field_nullable(self, waterfall_project):
        """Document can be left null."""
        item = ReportingItem.objects.create(
            project=waterfall_project,
            name="No Document",
            frequency="One-time",
            type="Stage",
            start_date=date.today(),
        )
        assert item.document.name in ("", None)

    def test_view_defaults_to_true(self, waterfall_project):
        """The view boolean defaults to True."""
        item = ReportingItem.objects.create(
            project=waterfall_project,
            name="View Default",
            frequency="Weekly",
            type="Team",
            start_date=date.today(),
        )
        assert item.view is True

    def test_multiple_items_per_project(self, waterfall_project):
        """A project can have many reporting items."""
        for i in range(5):
            ReportingItem.objects.create(
                project=waterfall_project,
                name=f"Item {i}",
                frequency="Weekly",
                type="Team",
                start_date=date.today() + timedelta(weeks=i),
            )
        assert ReportingItem.objects.filter(project=waterfall_project).count() == 5


# ============================================================
# Cross-model integration
# ============================================================

@pytest.mark.django_db
class TestReportingIntegration:
    """Integration: status reports + reporting items for the same project."""

    def test_project_has_both_reports_and_items(
        self, authenticated_admin_client, waterfall_project
    ):
        """Create both a status report and reporting items for the same project."""
        # Status report
        sr_resp = authenticated_admin_client.post(
            STATUS_REPORTS_URL,
            {
                "project": waterfall_project.id,
                "status": "In Progress",
                "progress": 30,
                "last_updated": str(date.today()),
            },
            format="json",
        )
        assert sr_resp.status_code == status.HTTP_201_CREATED

        # Reporting item
        ri_resp = authenticated_admin_client.post(
            REPORTING_ITEMS_URL,
            {
                "project": waterfall_project.id,
                "name": "Weekly Status",
                "frequency": "Weekly",
                "type": "Steering",
                "start_date": str(date.today()),
            },
            format="multipart",
        )
        assert ri_resp.status_code == status.HTTP_201_CREATED

        # Verify both show up filtered by project
        sr_list = authenticated_admin_client.get(
            STATUS_REPORTS_URL, {"project": waterfall_project.id}
        )
        ri_list = authenticated_admin_client.get(
            REPORTING_ITEMS_URL, {"project": waterfall_project.id}
        )
        sr_results = _extract_results(sr_list.data)
        ri_results = _extract_results(ri_list.data)
        assert len(sr_results) >= 1
        assert len(ri_results) >= 1

    def test_deleting_project_cascades(self, db, user, company):
        """Deleting a project cascades to its reports and items."""
        project = Project.objects.create(
            name="Cascade Project",
            company=company,
            methodology="waterfall",
            created_by=user,
        )
        StatusReport.objects.create(
            project=project,
            status="Not Started",
            progress=0,
            last_updated=date.today(),
        )
        ReportingItem.objects.create(
            project=project,
            name="Cascade Item",
            frequency="Monthly",
            type="Team",
            start_date=date.today(),
        )
        project_id = project.id
        project.delete()

        assert StatusReport.objects.filter(project_id=project_id).count() == 0
        assert ReportingItem.objects.filter(project_id=project_id).count() == 0
