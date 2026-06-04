"""Regression tests for #35 — MSP benefits variance + tranche-close gate + Blueprint.

Asserts the acceptance criteria:
  * a benefit reports actual-vs-baseline variance,
  * a tranche cannot close without measurements (409 no_measurements),
  * a tranche cannot close without a boundary review (409 boundary_review_required),
  * a Blueprint (POTI + Vision) can be created per programme,
  * cross-tenant isolation holds.
"""
from rest_framework.test import APIClient
from django.test import TestCase

from accounts.models import Company
from django.contrib.auth import get_user_model
from programs.models import Program
from msp.models import MSPBenefit, BenefitRealization, MSPTranche, MSPBlueprint

User = get_user_model()


def _list(body):
    return body.get("results", body) if isinstance(body, dict) else body


class MSPLoopTests(TestCase):
    def setUp(self):
        self.company = Company.objects.create(name="Acme")
        self.user = User.objects.create_user(
            email="spm@acme.test", password="x", username="spm@acme.test",
            company=self.company, role="admin",
        )
        self.program = Program.objects.create(
            name="Transformation", company=self.company, methodology="msp",
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_benefit_variance(self):
        b = self.client.post(
            "/api/v1/msp/programs/%s/benefits/" % self.program.id,
            {"name": "Cycle time", "baseline_value": "100.00", "target_value": "60.00",
             "benefit_type": "non_financial"},
            format="json",
        )
        self.assertEqual(b.status_code, 201, b.content)
        bid = b.json()["id"]
        # No measurement yet → variance null
        self.assertIsNone(b.json()["variance"])

        # Record a measurement of 80 (improved 20 from baseline 100)
        r = self.client.post(
            "/api/v1/msp/programs/%s/benefits/%s/realizations/" % (self.program.id, bid),
            {"actual_value": "80.00", "measurement_date": "2026-06-01"},
            format="json",
        )
        self.assertEqual(r.status_code, 201, r.content)

        detail = self.client.get("/api/v1/msp/benefits/%s/" % bid).json()
        self.assertEqual(detail["latest_actual"], 80.0)
        self.assertEqual(detail["variance"], -20.0)        # 80 - 100
        # planned delta = 60 - 100 = -40; achieved = 80 - 100 = -20; 50%
        self.assertEqual(detail["variance_pct"], 50)

    def test_tranche_close_gate(self):
        t = MSPTranche.objects.create(program=self.program, name="Tranche 1", sequence=1)

        # (a) no measurements → blocked
        resp = self.client.post("/api/v1/msp/tranches/%s/close/" % t.id, {}, format="json")
        self.assertEqual(resp.status_code, 409, resp.content)
        self.assertEqual(resp.json()["code"], "no_measurements")
        t.refresh_from_db()
        self.assertNotEqual(t.status, "closed")

        # Add a benefit + measurement
        benefit = MSPBenefit.objects.create(program=self.program, name="Savings", baseline_value=0)
        BenefitRealization.objects.create(benefit=benefit, actual_value=10, measurement_date="2026-06-01")

        # (b) measurements exist but boundary review not done → blocked
        resp = self.client.post("/api/v1/msp/tranches/%s/close/" % t.id, {}, format="json")
        self.assertEqual(resp.status_code, 409, resp.content)
        self.assertEqual(resp.json()["code"], "boundary_review_required")
        t.refresh_from_db()
        self.assertNotEqual(t.status, "closed")

        # Mark boundary review done → can close
        self.client.patch("/api/v1/msp/tranches/%s/" % t.id,
                          {"boundary_review_done": True}, format="json")
        resp = self.client.post("/api/v1/msp/tranches/%s/close/" % t.id, {}, format="json")
        self.assertEqual(resp.status_code, 200, resp.content)
        t.refresh_from_db()
        self.assertEqual(t.status, "closed")
        self.assertIsNotNone(t.closed_at)

        # Closing again → already_closed
        resp = self.client.post("/api/v1/msp/tranches/%s/close/" % t.id, {}, format="json")
        self.assertEqual(resp.status_code, 409)
        self.assertEqual(resp.json()["code"], "already_closed")

    def test_blueprint_poti(self):
        bp = self.client.post(
            "/api/v1/msp/programs/%s/blueprints/" % self.program.id,
            {"vision": "World-class ops", "processes": "Lean flow",
             "organisation": "Pod model", "technology": "Cloud", "information": "Single CRM"},
            format="json",
        )
        self.assertEqual(bp.status_code, 201, bp.content)
        self.assertEqual(bp.json()["vision"], "World-class ops")
        self.assertTrue(MSPBlueprint.objects.filter(program=self.program).exists())

    def test_cross_tenant_isolation(self):
        other_co = Company.objects.create(name="Globex")
        other_prog = Program.objects.create(name="Secret", company=other_co, methodology="msp")
        MSPTranche.objects.create(program=other_prog, name="Hidden", sequence=1)

        rows = _list(self.client.get("/api/v1/msp/tranches/").json())
        self.assertNotIn("Hidden", [t["name"] for t in rows])
