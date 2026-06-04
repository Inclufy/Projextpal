"""Behavioural tests for P2-Programme programme-access scoping (backlog #32, P1-10).

`_verify_programme_access` used to query projects.Project by id, but the
P2Blueprint/P2ProgrammeProject `programme` FK points at programs.Program. That
mismatch denied every legitimate nested create and risked a cross-tenant
false-allow when a Project of another tenant shared the id. These tests prove:
  #1 nested blueprint create succeeds for a programme in the user's company.
  #2 nested programme-project create succeeds likewise.
  #3 nested create against another tenant's programme is denied (403).

Runs on the in-memory SQLite test DB — no Docker needed.
"""
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import Company
from programs.models import Program
from p2_programme.models import P2Blueprint, P2ProgrammeProject


class P2ProgrammeAccessTests(TestCase):
    def setUp(self):
        User = get_user_model()
        self.company = Company.objects.create(name="OwnerCo")
        self.user = User.objects.create_user(
            email="owner@example.com", password="testpass123",
            username="owner", company=self.company, role="admin",
        )
        self.programme = Program.objects.create(
            company=self.company, name="P2 Programme", methodology="p2_programme",
        )
        self.other_company = Company.objects.create(name="RivalCo")
        self.other_programme = Program.objects.create(
            company=self.other_company, name="Rival Programme", methodology="p2_programme",
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    # ---- #1 blueprint create succeeds for a valid programme -------------
    def test_nested_blueprint_create_succeeds(self):
        url = f"/api/v1/p2-programme/programs/{self.programme.id}/blueprints/"
        resp = self.client.post(url, {"name": "Target Operating Model"}, format="json")
        self.assertEqual(resp.status_code, 201, resp.content)
        self.assertTrue(P2Blueprint.objects.filter(programme=self.programme, name="Target Operating Model").exists())

    # ---- #2 programme-project create succeeds for a valid programme -----
    def test_nested_project_create_succeeds(self):
        url = f"/api/v1/p2-programme/programs/{self.programme.id}/projects/"
        resp = self.client.post(url, {"name": "Workstream A"}, format="json")
        self.assertEqual(resp.status_code, 201, resp.content)
        self.assertTrue(P2ProgrammeProject.objects.filter(programme=self.programme, name="Workstream A").exists())

    # ---- #3 cross-tenant create is denied -------------------------------
    def test_cross_tenant_blueprint_create_denied(self):
        url = f"/api/v1/p2-programme/programs/{self.other_programme.id}/blueprints/"
        resp = self.client.post(url, {"name": "Sneaky blueprint"}, format="json")
        self.assertEqual(resp.status_code, 403, resp.content)
        self.assertFalse(P2Blueprint.objects.filter(programme=self.other_programme).exists())
