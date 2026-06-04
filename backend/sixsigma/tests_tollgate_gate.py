"""Behavioural tests for the DMAIC tollgate gate (backlog #27, P1-5).

Proves the tollgate actually gates rather than rubber-stamping:
  #1 a Define tollgate cannot pass while its deliverables are missing.
  #2 a Define tollgate passes once charter(approved)+SIPOC+VOC exist.
  #3 a Measure tollgate is blocked until the Define tollgate has passed
     (sequential ordering), even with its own deliverables present.
  #4 model-level can_pass() for Control requires plan + chart.

Runs on the in-memory SQLite test DB — no Docker needed.
"""
from decimal import Decimal
from datetime import date

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import Company
from projects.models import Project
from sixsigma.models import (
    TollgateReview, ProjectCharter, SIPOCDiagram, VoiceOfCustomer,
    BaselineMetric, DataCollectionPlan, ControlPlan, ControlChart,
)


class TollgateGateTests(TestCase):
    def setUp(self):
        self.company = Company.objects.create(name="LSSCo")
        User = get_user_model()
        self.user = User.objects.create_user(
            email="gb@example.com", password="testpass123",
            username="gb", company=self.company, role="admin",
        )
        self.project = Project.objects.create(
            name="DMAIC Project", company=self.company,
            methodology="lean_six_sigma_green", created_by=self.user,
        )
        # Initialize all 5 tollgates upcoming.
        self.gates = {}
        for phase, _ in TollgateReview.PHASE_CHOICES:
            self.gates[phase] = TollgateReview.objects.create(
                project=self.project, phase=phase, status="upcoming",
            )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def _approve_url(self, phase):
        gid = self.gates[phase].id
        return f"/api/v1/sixsigma/projects/{self.project.id}/sixsigma/tollgates/{gid}/approve/"

    def _make_define_deliverables(self, approved=True):
        ProjectCharter.objects.create(
            project=self.project, problem_statement="p", business_case="b",
            goal_statement="g", project_scope="s", approved=approved,
        )
        SIPOCDiagram.objects.create(
            project=self.project, process_name="proc",
            process_start="start", process_end="end",
        )
        VoiceOfCustomer.objects.create(
            project=self.project, customer_segment="seg", customer_need="need",
            ctq_requirement="ctq", measurement="m", target_value="10",
        )

    def _make_measure_deliverables(self):
        BaselineMetric.objects.create(
            project=self.project, metric_name="cycle time",
            baseline_value=Decimal("10"), current_value=Decimal("9"),
            target_value=Decimal("5"), unit="min",
        )
        DataCollectionPlan.objects.create(project=self.project, objective="measure it")

    # ---- #1 Define tollgate blocked without deliverables ----------------
    def test_define_blocked_without_deliverables(self):
        resp = self.client.post(self._approve_url("define"), {}, format="json")
        self.assertEqual(resp.status_code, 409, resp.content)
        body = resp.json()
        self.assertEqual(body.get("code"), "tollgate_blocked")
        self.assertTrue(any("charter" in b.lower() for b in body.get("blockers", [])))
        self.gates["define"].refresh_from_db()
        self.assertNotEqual(self.gates["define"].status, "passed")
        self.assertFalse(self.gates["define"].approved)

    # ---- #2 Define tollgate passes with deliverables --------------------
    def test_define_passes_with_deliverables(self):
        self._make_define_deliverables(approved=True)
        resp = self.client.post(self._approve_url("define"), {}, format="json")
        self.assertEqual(resp.status_code, 200, resp.content)
        self.gates["define"].refresh_from_db()
        self.assertEqual(self.gates["define"].status, "passed")
        self.assertTrue(self.gates["define"].approved)

    # ---- #2b unapproved charter still blocks ----------------------------
    def test_define_blocked_when_charter_unapproved(self):
        self._make_define_deliverables(approved=False)
        resp = self.client.post(self._approve_url("define"), {}, format="json")
        self.assertEqual(resp.status_code, 409, resp.content)
        self.assertTrue(any("approved" in b.lower() for b in resp.json().get("blockers", [])))

    # ---- #3 Measure blocked until Define passed -------------------------
    def test_measure_blocked_until_define_passed(self):
        self._make_measure_deliverables()  # measure deliverables present
        resp = self.client.post(self._approve_url("measure"), {}, format="json")
        self.assertEqual(resp.status_code, 409, resp.content)
        self.assertTrue(any("define" in b.lower() for b in resp.json().get("blockers", [])))

        # Now pass Define, then Measure approval succeeds.
        self._make_define_deliverables(approved=True)
        self.assertEqual(self.client.post(self._approve_url("define"), {}, format="json").status_code, 200)
        ok = self.client.post(self._approve_url("measure"), {}, format="json")
        self.assertEqual(ok.status_code, 200, ok.content)

    # ---- #4 model-level Control gate ------------------------------------
    def test_control_can_pass_requires_plan_and_chart(self):
        gate = self.gates["control"]
        ok, blockers = gate.can_pass()
        self.assertFalse(ok)
        self.assertTrue(any("control plan" in b.lower() for b in blockers))
        # Provide control plan + chart; prior gates still unpassed → still blocked on ordering
        ControlPlan.objects.create(
            project=self.project, process_name="proc", effective_date=date.today(),
        )
        ControlChart.objects.create(
            project=self.project, name="c", chart_type="i_mr", metric_name="m",
            ucl=Decimal("10"), lcl=Decimal("2"), center_line=Decimal("6"),
        )
        ok2, blockers2 = gate.can_pass()
        self.assertFalse(ok2)  # prior 'improve' tollgate not passed
        self.assertFalse(any("control plan" in b.lower() for b in blockers2))
        self.assertTrue(any("improve" in b.lower() for b in blockers2))
