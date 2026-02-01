from decimal import Decimal
from datetime import date

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APIClient

from accounts.models import Company
from .forecasting import forecast_for_active_projects, forecast_project_budget
from .models import Expense, Project


@override_settings(OPENAI_API_KEY="")
class ForecastingTests(TestCase):
    def setUp(self):
        self.company = Company.objects.create(name="ForecastCo")
        self.other_company = Company.objects.create(name="OtherCo")
        User = get_user_model()
        self.user = User.objects.create_user(
            email="owner@example.com",
            password="testpass123",
            username="owner",
            company=self.company,
            role="admin",
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        self.project = Project.objects.create(
            name="Forecast Ready Project",
            company=self.company,
            budget=Decimal("20000.00"),
            status="in_progress",
        )

        Expense.objects.create(
            project=self.project,
            description="January spend",
            category="Software",
            date=date(2024, 1, 31),
            amount=Decimal("4200.00"),
        )
        Expense.objects.create(
            project=self.project,
            description="February spend",
            category="Labor Cost",
            date=date(2024, 2, 29),
            amount=Decimal("4800.00"),
        )
        Expense.objects.create(
            project=self.project,
            description="March spend",
            category="Material Cost",
            date=date(2024, 3, 31),
            amount=Decimal("3900.00"),
        )
        Expense.objects.create(
            project=self.project,
            description="April spend",
            category="Software",
            date=date(2024, 4, 30),
            amount=Decimal("4100.00"),
        )

        # Additional projects to verify bulk behaviour
        self.pending_project = Project.objects.create(
            name="Pending Project",
            company=self.company,
            budget=Decimal("15000.00"),
            status="pending",
        )
        Project.objects.create(
            name="Other Company Project",
            company=self.other_company,
            budget=Decimal("25000.00"),
            status="in_progress",
        )

    def test_forecast_project_budget_uses_default_window(self):
        result = forecast_project_budget(self.project)
        self.assertEqual(result.window_months, 4)
        self.assertEqual(len(result.actuals), 4)
        self.assertEqual(result.actuals[0]["month"], "2024-01")
        self.assertEqual(result.actuals[-1]["month"], "2024-04")
        self.assertEqual(result.forecast[0]["month"], "2024-05")

    def test_forecast_for_active_projects_filters_by_company(self):
        results = forecast_for_active_projects(company=self.company)
        project_ids = {res.project_id for res in results}
        self.assertIn(self.project.id, project_ids)
        self.assertIn(self.pending_project.id, project_ids)
        self.assertNotIn(
            Project.objects.get(name="Other Company Project").id, project_ids
        )

    def test_forecast_detail_endpoint_default_window(self):
        url = reverse("project-financials-forecast", kwargs={"pk": self.project.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["window_months"], 4)
        self.assertEqual(len(data["actuals"]), 4)

    def test_bulk_forecasts_endpoint(self):
        url = reverse("project-financials-forecasts")
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        returned_ids = {item["project_id"] for item in data["results"]}
        self.assertIn(self.project.id, returned_ids)
        self.assertIn(self.pending_project.id, returned_ids)
        self.assertEqual(data["count"], len(data["results"]))
