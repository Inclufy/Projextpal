"""Behavioural tests for the LSS DMAIC-spine work (backlog #43, P2-LSS).

Proves the four doctrinally-core deliverables actually behave, not just store:
  A  compute_capability produces real Cp/Cpk/Pp/Ppk/sigma/DPMO from data points,
     and the capability endpoint refuses with 400 insufficient_data when there
     are too few points or no spec limit.
  B  detect_special_causes flags Nelson/Western-Electric rule violations on the
     ordered series and persists is_violation + violation_rule per point.
  C  a HypothesisTest wired to a fishbone cause that rejects H0 VERIFIES that
     cause with data (analyze-phase loop closes).
  D  the SavingsValidation ledger refuses to validate a claim until the Champion
     has signed off (409 champion_signoff_required), then recognises the benefit.

Runs on the in-memory SQLite test DB — no Docker needed.
"""
from decimal import Decimal
from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from accounts.models import Company
from projects.models import Project
from sixsigma.models import (
    ControlChart, ControlChartData,
    FishboneDiagram, FishboneCause, HypothesisTest,
    Solution, SavingsValidation,
)
from sixsigma.views import compute_capability, detect_special_causes


def _list(body):
    return body.get("results", body) if isinstance(body, dict) else body


class CapabilityMathTests(TestCase):
    """A — pure-function capability math from real measurements."""

    def test_capability_centered_process_is_capable(self):
        # Tight spread around the centre of a wide spec → high, capable Cpk.
        vals = [10.0, 10.1, 9.9, 10.05, 9.95, 10.0, 10.02, 9.98, 10.03, 9.97]
        rep = compute_capability(vals, usl=11.0, lsl=9.0)
        self.assertIsNotNone(rep)
        self.assertEqual(rep["n"], 10)
        self.assertAlmostEqual(rep["mean"], 10.0, places=1)
        self.assertGreater(rep["cpk"], 1.33)
        self.assertTrue(rep["is_capable"])
        # Sigma level = cpk*3 + 1.5 shift.
        self.assertAlmostEqual(rep["sigma_level"], rep["cpk"] * 3 + 1.5, places=2)
        # DPMO is small for a capable, centred process.
        self.assertLess(rep["dpmo"], 1000)

    def test_capability_offcentre_lowers_cpk_below_cp(self):
        # Mean shifted toward USL → Cpk < Cp.
        vals = [10.7, 10.8, 10.6, 10.75, 10.65, 10.7, 10.72, 10.68]
        rep = compute_capability(vals, usl=11.0, lsl=9.0)
        self.assertIsNotNone(rep)
        self.assertIsNotNone(rep["cp"])
        self.assertLess(rep["cpk"], rep["cp"])  # off-centre penalised
        self.assertFalse(rep["is_capable"])

    def test_capability_returns_none_without_spec_or_data(self):
        self.assertIsNone(compute_capability([10.0, 10.1], usl=None, lsl=None))
        self.assertIsNone(compute_capability([10.0], usl=11.0, lsl=9.0))


class SpecialCauseRuleTests(TestCase):
    """B — Nelson rule engine."""

    def test_rule1_point_beyond_limits(self):
        vals = [5, 5.1, 4.9, 5.0, 12.0, 5.0]  # one point above UCL=10
        flags = detect_special_causes(vals, ucl=10, lcl=0, center=5)
        self.assertTrue(any(f["index"] == 4 and "Rule 1" in f["rule"] for f in flags))

    def test_rule2_nine_same_side(self):
        vals = [6, 6, 6, 6, 6, 6, 6, 6, 6]  # 9 above centre=5
        flags = detect_special_causes(vals, ucl=10, lcl=0, center=5)
        self.assertTrue(any("Rule 2" in f["rule"] for f in flags))

    def test_in_control_series_has_no_flags(self):
        vals = [5, 5.2, 4.8, 5.1, 4.9, 5.0]
        flags = detect_special_causes(vals, ucl=8, lcl=2, center=5)
        self.assertEqual(flags, [])


class ControlChartActionTests(TestCase):
    """B (endpoint) — capability + detect_special_causes persist/return."""

    def setUp(self):
        self.company = Company.objects.create(name="LSSCo")
        User = get_user_model()
        self.user = User.objects.create_user(
            email="bb@example.com", password="testpass123",
            username="bb", company=self.company, role="admin",
        )
        self.project = Project.objects.create(
            name="Cap Project", company=self.company,
            methodology="lean_six_sigma_black", created_by=self.user,
        )
        self.chart = ControlChart.objects.create(
            project=self.project, name="Diameter", chart_type="i_mr",
            metric_name="diameter", ucl=Decimal("10.5"), lcl=Decimal("9.5"),
            center_line=Decimal("10.0"), usl=Decimal("11.0"), lsl=Decimal("9.0"),
        )
        base = timezone.now()
        for i, v in enumerate([10.0, 10.1, 9.9, 10.05, 9.95, 12.5, 10.0, 9.98]):
            ControlChartData.objects.create(
                chart=self.chart, date=base + timedelta(hours=i), value=Decimal(str(v)),
            )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def _url(self, action):
        return (f"/api/v1/projects/{self.project.id}"
                f"/sixsigma/control-charts/{self.chart.id}/{action}/")

    def test_capability_post_persists_cp_cpk(self):
        resp = self.client.post(self._url("capability"), {}, format="json")
        self.assertEqual(resp.status_code, 200, resp.content)
        body = resp.json()
        self.assertIn("cpk", body)
        self.chart.refresh_from_db()
        self.assertIsNotNone(self.chart.cpk)

    def test_capability_insufficient_data_400(self):
        empty = ControlChart.objects.create(
            project=self.project, name="Empty", chart_type="i_mr",
            metric_name="x", ucl=Decimal("1"), lcl=Decimal("0"),
            center_line=Decimal("0.5"),  # no USL/LSL, no points
        )
        url = (f"/api/v1/projects/{self.project.id}"
               f"/sixsigma/control-charts/{empty.id}/capability/")
        resp = self.client.post(url, {}, format="json")
        self.assertEqual(resp.status_code, 400, resp.content)
        self.assertEqual(resp.json().get("code"), "insufficient_data")

    def test_detect_special_causes_persists_flag(self):
        resp = self.client.post(self._url("detect_special_causes"), {}, format="json")
        self.assertEqual(resp.status_code, 200, resp.content)
        body = resp.json()
        self.assertGreaterEqual(body["flagged_count"], 1)
        self.assertFalse(body["in_control"])
        # The 12.5 point (index 5) is beyond UCL and must be persisted as a violation.
        flagged = ControlChartData.objects.filter(chart=self.chart, is_violation=True)
        self.assertTrue(flagged.exists())


class HypothesisRootCauseLoopTests(TestCase):
    """C — reject H0 verifies the linked fishbone cause."""

    def setUp(self):
        self.company = Company.objects.create(name="LSSCo")
        User = get_user_model()
        self.user = User.objects.create_user(
            email="an@example.com", password="testpass123",
            username="an", company=self.company, role="admin",
        )
        self.project = Project.objects.create(
            name="Analyze Project", company=self.company,
            methodology="lean_six_sigma_black", created_by=self.user,
        )
        self.diagram = FishboneDiagram.objects.create(
            project=self.project, problem_statement="defects",
        )
        self.cause = FishboneCause.objects.create(
            fishbone=self.diagram, category="machine", cause="worn tool",
        )

    def test_reject_h0_verifies_cause(self):
        self.assertFalse(self.cause.verified)
        HypothesisTest.objects.create(
            project=self.project, name="tool wear t-test", test_type="2_sample_t",
            null_hypothesis="no diff", alt_hypothesis="diff",
            conclusion="reject", root_cause=self.cause,
        )
        self.cause.refresh_from_db()
        self.assertTrue(self.cause.verified)
        self.assertTrue(self.cause.is_root_cause)

    def test_fail_to_reject_does_not_verify(self):
        HypothesisTest.objects.create(
            project=self.project, name="t", test_type="2_sample_t",
            null_hypothesis="no diff", alt_hypothesis="diff",
            conclusion="fail_to_reject", root_cause=self.cause,
        )
        self.cause.refresh_from_db()
        self.assertFalse(self.cause.verified)


class SavingsValidationGateTests(TestCase):
    """D — Champion sign-off gate on the savings ledger."""

    def setUp(self):
        self.company = Company.objects.create(name="LSSCo")
        User = get_user_model()
        self.user = User.objects.create_user(
            email="champ@example.com", password="testpass123",
            username="champ", company=self.company, role="admin",
        )
        self.project = Project.objects.create(
            name="Savings Project", company=self.company,
            methodology="lean_six_sigma_black", created_by=self.user,
        )
        self.solution = Solution.objects.create(
            project=self.project, name="reduce scrap", description="d",
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.base = f"/api/v1/projects/{self.project.id}/sixsigma/savings-validations"

    def _create(self):
        resp = self.client.post(
            f"{self.base}/",
            {
                "title": "scrap reduction", "category": "hard",
                "claimed_amount": "50000.00", "solution": self.solution.id,
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 201, resp.content)
        return resp.json()["id"]

    def test_validate_blocked_without_champion_signoff(self):
        sid = self._create()
        resp = self.client.post(f"{self.base}/{sid}/validate/", {}, format="json")
        self.assertEqual(resp.status_code, 409, resp.content)
        self.assertEqual(resp.json().get("code"), "champion_signoff_required")
        rec = SavingsValidation.objects.get(id=sid)
        self.assertNotEqual(rec.status, "validated")
        self.assertEqual(rec.recognized_amount, 0)

    def test_signoff_then_validate_recognises_benefit(self):
        sid = self._create()
        so = self.client.post(
            f"{self.base}/{sid}/sign_off/",
            {"validated_amount": "45000.00"}, format="json",
        )
        self.assertEqual(so.status_code, 200, so.content)
        ok = self.client.post(f"{self.base}/{sid}/validate/", {}, format="json")
        self.assertEqual(ok.status_code, 200, ok.content)
        rec = SavingsValidation.objects.get(id=sid)
        self.assertEqual(rec.status, "validated")
        self.assertTrue(rec.champion_signed_off)
        self.assertEqual(rec.recognized_amount, Decimal("45000.00"))

    def test_recognized_amount_zero_until_validated(self):
        sid = self._create()
        rec = SavingsValidation.objects.get(id=sid)
        self.assertEqual(rec.recognized_amount, 0)

    def test_cross_tenant_savings_hidden(self):
        self._create()
        other_co = Company.objects.create(name="OtherCo")
        User = get_user_model()
        intruder = User.objects.create_user(
            email="x@other.com", password="testpass123",
            username="x", company=other_co, role="admin",
        )
        c = APIClient()
        c.force_authenticate(user=intruder)
        resp = c.get(f"{self.base}/")
        # Intruder is in a different company → project lookup yields nothing/forbidden.
        self.assertIn(resp.status_code, (200, 403, 404))
        if resp.status_code == 200:
            self.assertEqual(len(_list(resp.json())), 0)
