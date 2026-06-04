"""Behavioural tests for the shared DMAIC phase→tollgate gate (backlog #28, P1-6).

The DMAICPhaseViewSet is shared by LSS Green and LSS Black. Proves a phase
cannot be marked 'completed' until its sixsigma.TollgateReview has passed:
  #1 completing a phase is blocked (409) when no tollgate exists.
  #2 still blocked when the tollgate exists but is not approved.
  #3 allowed once the matching tollgate is approved/passed.
  #4 a non-status edit (objective) is never gated.

Runs on the in-memory SQLite test DB — no Docker needed.
"""
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import Company
from projects.models import Project
from lss_green.models import DMAICPhase
from sixsigma.models import TollgateReview


class DMAICPhaseGateTests(TestCase):
    def setUp(self):
        self.company = Company.objects.create(name="BBCo")
        User = get_user_model()
        self.user = User.objects.create_user(
            email="bb@example.com", password="testpass123",
            username="bb", company=self.company, role="admin",
        )
        self.project = Project.objects.create(
            name="BB Project", company=self.company,
            methodology="lean_six_sigma_black", created_by=self.user,
        )
        self.phase = DMAICPhase.objects.create(
            project=self.project, phase="analyze", status="in_progress", order=2,
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def _url(self):
        return f"/api/v1/lss-black/projects/{self.project.id}/dmaic-phases/{self.phase.id}/"

    # ---- #1 blocked when no tollgate exists -----------------------------
    def test_complete_blocked_without_tollgate(self):
        resp = self.client.patch(self._url(), {"status": "completed"}, format="json")
        self.assertEqual(resp.status_code, 409, resp.content)
        self.assertEqual(resp.json().get("code"), "tollgate_not_passed")
        self.phase.refresh_from_db()
        self.assertEqual(self.phase.status, "in_progress")

    # ---- #2 blocked when tollgate not approved --------------------------
    def test_complete_blocked_when_tollgate_unapproved(self):
        TollgateReview.objects.create(
            project=self.project, phase="analyze", status="upcoming",
        )
        resp = self.client.patch(self._url(), {"status": "completed"}, format="json")
        self.assertEqual(resp.status_code, 409, resp.content)
        self.phase.refresh_from_db()
        self.assertEqual(self.phase.status, "in_progress")

    # ---- #3 allowed once tollgate passed --------------------------------
    def test_complete_allowed_when_tollgate_passed(self):
        TollgateReview.objects.create(
            project=self.project, phase="analyze", status="passed", approved=True,
        )
        resp = self.client.patch(self._url(), {"status": "completed"}, format="json")
        self.assertEqual(resp.status_code, 200, resp.content)
        self.phase.refresh_from_db()
        self.assertEqual(self.phase.status, "completed")

    # ---- #4 non-status edit is never gated ------------------------------
    def test_objective_edit_not_gated(self):
        resp = self.client.patch(self._url(), {"objective": "Find root causes"}, format="json")
        self.assertEqual(resp.status_code, 200, resp.content)
        self.phase.refresh_from_db()
        self.assertEqual(self.phase.objective, "Find root causes")
        self.assertEqual(self.phase.status, "in_progress")
