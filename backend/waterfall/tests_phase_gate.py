"""Behavioural enforcement tests for the Waterfall phase gate (backlog #25, P1-3).

Proves the stage gate actually blocks progression rather than being an advisory
stamp:
  #1 start blocked while the predecessor phase is not completed.
  #2 start blocked while the (completed) predecessor is not signed off.
  #3 start allowed once the predecessor is completed AND signed off.
  #4 a Testing phase cannot complete while any test case is not passed.
  #5 a Testing phase completes once every test case is passed.
  #6 sign-off blocked until the phase is completed; allowed after.

Runs on the in-memory SQLite test DB — no Docker needed.
"""
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import Company
from projects.models import Project
from waterfall.models import WaterfallPhase, WaterfallTestCase


class WaterfallPhaseGateTests(TestCase):
    def setUp(self):
        self.company = Company.objects.create(name="WFCo")
        User = get_user_model()
        self.user = User.objects.create_user(
            email="wfpm@example.com", password="testpass123",
            username="wfpm", company=self.company, role="admin",
        )
        self.project = Project.objects.create(
            name="WF Project", company=self.company,
            methodology="waterfall", created_by=self.user,
        )
        self.p1 = WaterfallPhase.objects.create(
            project=self.project, name="Requirements", phase_type="requirements",
            order=1, status="in_progress",
        )
        self.p2 = WaterfallPhase.objects.create(
            project=self.project, name="Design", phase_type="design",
            order=2, status="not_started",
        )
        self.testing = WaterfallPhase.objects.create(
            project=self.project, name="Testing", phase_type="testing",
            order=3, status="in_progress",
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def _url(self, phase, action):
        return f"/api/v1/projects/{self.project.id}/waterfall/phases/{phase.id}/{action}/"

    # ---- #1 start blocked while predecessor not completed ----------------
    def test_start_blocked_when_prev_incomplete(self):
        resp = self.client.post(self._url(self.p2, "start"), {}, format="json")
        self.assertEqual(resp.status_code, 409, resp.content)
        self.assertEqual(resp.json().get("code"), "prev_phase_incomplete")
        self.p2.refresh_from_db()
        self.assertEqual(self.p2.status, "not_started")

    # ---- #2 start blocked while predecessor completed but unsigned -------
    def test_start_blocked_when_prev_unsigned(self):
        self.p1.status = "completed"
        self.p1.save()  # sign_off_required defaults True, signed_off_at is null
        resp = self.client.post(self._url(self.p2, "start"), {}, format="json")
        self.assertEqual(resp.status_code, 409, resp.content)
        self.assertEqual(resp.json().get("code"), "prev_phase_unsigned")

    # ---- #3 start allowed once predecessor completed + signed off -------
    def test_start_allowed_when_prev_signed_off(self):
        self.p1.status = "completed"
        self.p1.save()
        signed = self.client.post(self._url(self.p1, "sign-off"), {}, format="json")
        self.assertEqual(signed.status_code, 200, signed.content)

        resp = self.client.post(self._url(self.p2, "start"), {}, format="json")
        self.assertEqual(resp.status_code, 200, resp.content)
        self.p2.refresh_from_db()
        self.assertEqual(self.p2.status, "in_progress")

    # ---- #4 testing phase blocked while a test is not passed ------------
    def test_testing_complete_blocked_when_tests_not_passed(self):
        WaterfallTestCase.objects.create(
            project=self.project, test_id="TC-001", name="login", status="passed",
        )
        WaterfallTestCase.objects.create(
            project=self.project, test_id="TC-002", name="logout", status="failed",
        )
        resp = self.client.post(self._url(self.testing, "complete"), {}, format="json")
        self.assertEqual(resp.status_code, 409, resp.content)
        self.assertEqual(resp.json().get("code"), "tests_not_passed")
        self.assertIn("TC-002", resp.json().get("unpassed_tests"))
        self.testing.refresh_from_db()
        self.assertEqual(self.testing.status, "in_progress")

    # ---- #5 testing phase completes once all tests pass ----------------
    def test_testing_complete_allowed_when_all_pass(self):
        WaterfallTestCase.objects.create(
            project=self.project, test_id="TC-001", name="login", status="passed",
        )
        resp = self.client.post(self._url(self.testing, "complete"), {}, format="json")
        self.assertEqual(resp.status_code, 200, resp.content)
        self.testing.refresh_from_db()
        self.assertEqual(self.testing.status, "completed")

    # ---- #6 sign-off requires the phase be completed first -------------
    def test_sign_off_requires_completed(self):
        # p1 is in_progress → cannot sign off
        blocked = self.client.post(self._url(self.p1, "sign-off"), {}, format="json")
        self.assertEqual(blocked.status_code, 409, blocked.content)
        self.assertEqual(blocked.json().get("code"), "phase_not_completed")

        self.p1.status = "completed"
        self.p1.save()
        ok = self.client.post(self._url(self.p1, "sign-off"), {}, format="json")
        self.assertEqual(ok.status_code, 200, ok.content)
        self.p1.refresh_from_db()
        self.assertIsNotNone(self.p1.signed_off_at)
