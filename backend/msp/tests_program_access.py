"""Behavioural tests for MSP program-access scoping (backlog #31, P1-9).

`_verify_program_access` used to query projects.Project by id, but the MSP
benefit/tranche `program` FK points at programs.Program. That mismatch denied
every legitimate nested create and risked a cross-tenant false-allow when a
Project of another tenant happened to share the id. These tests prove:
  #1 nested benefit create succeeds for a valid program in the user's company.
  #2 nested tranche create succeeds likewise.
  #3 nested create against another tenant's program is denied (403).

Runs on the in-memory SQLite test DB — no Docker needed.
"""
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import Company
from programs.models import Program
from msp.models import MSPBenefit, MSPTranche


class MSPProgramAccessTests(TestCase):
    def setUp(self):
        User = get_user_model()
        self.company = Company.objects.create(name="OwnerCo")
        self.user = User.objects.create_user(
            email="owner@example.com", password="testpass123",
            username="owner", company=self.company, role="admin",
        )
        self.program = Program.objects.create(
            company=self.company, name="Transformation Programme", methodology="msp",
        )
        # A second tenant + its own program for the cross-tenant test.
        self.other_company = Company.objects.create(name="RivalCo")
        self.other_program = Program.objects.create(
            company=self.other_company, name="Rival Programme", methodology="msp",
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    # ---- #1 benefit create succeeds for a valid program -----------------
    def test_nested_benefit_create_succeeds(self):
        url = f"/api/v1/msp/programs/{self.program.id}/benefits/"
        resp = self.client.post(url, {"name": "Reduced cycle time"}, format="json")
        self.assertEqual(resp.status_code, 201, resp.content)
        self.assertTrue(MSPBenefit.objects.filter(program=self.program, name="Reduced cycle time").exists())

    # ---- #2 tranche create succeeds for a valid program -----------------
    def test_nested_tranche_create_succeeds(self):
        url = f"/api/v1/msp/programs/{self.program.id}/tranches/"
        resp = self.client.post(url, {"name": "Tranche 1", "sequence": 1}, format="json")
        self.assertEqual(resp.status_code, 201, resp.content)
        self.assertTrue(MSPTranche.objects.filter(program=self.program, name="Tranche 1").exists())

    # ---- #3 cross-tenant create is denied -------------------------------
    def test_cross_tenant_benefit_create_denied(self):
        url = f"/api/v1/msp/programs/{self.other_program.id}/benefits/"
        resp = self.client.post(url, {"name": "Sneaky benefit"}, format="json")
        self.assertEqual(resp.status_code, 403, resp.content)
        self.assertFalse(MSPBenefit.objects.filter(program=self.other_program).exists())
