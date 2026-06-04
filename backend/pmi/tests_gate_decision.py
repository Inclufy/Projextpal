"""Regression tests for #36 — PMI gate decisions over components + charter/benefit/stakeholder.

Acceptance criteria:
  * a component's status changes ONLY through a recorded gate decision
    (a raw PATCH of status is ignored),
  * the decide action records a PMIGateDecision and applies the outcome,
  * charter/benefit/stakeholder endpoints under /api/v1/pmi/ work,
  * cross-tenant isolation holds.
"""
from rest_framework.test import APIClient
from django.test import TestCase

from accounts.models import Company
from django.contrib.auth import get_user_model
from projects.models import Project
from pmi.models import PMIComponent, PMIGateDecision

User = get_user_model()


def _list(body):
    return body.get("results", body) if isinstance(body, dict) else body


class PMIGateTests(TestCase):
    def setUp(self):
        self.company = Company.objects.create(name="Acme")
        self.user = User.objects.create_user(
            email="pm@acme.test", password="x", username="pm@acme.test",
            company=self.company, role="admin",
        )
        # PMIComponent.program is a FK to projects.Project
        self.program = Project.objects.create(name="Transformation", company=self.company)
        self.component = PMIComponent.objects.create(program=self.program, name="CRM rollout")
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_status_is_read_only_on_patch(self):
        # A raw PATCH must NOT change status (proposed stays proposed).
        resp = self.client.patch(
            "/api/v1/pmi/components/%s/" % self.component.id,
            {"status": "active", "description": "edited"}, format="json",
        )
        self.assertEqual(resp.status_code, 200, resp.content)
        self.assertEqual(resp.json()["status"], "proposed")
        self.assertEqual(resp.json()["description"], "edited")
        self.component.refresh_from_db()
        self.assertEqual(self.component.status, "proposed")

    def test_decide_records_and_applies(self):
        # authorize → approved, with a recorded decision
        resp = self.client.post(
            "/api/v1/pmi/components/%s/decide/" % self.component.id,
            {"outcome": "authorize", "gate": "Gate 1", "rationale": "Business case sound"},
            format="json",
        )
        self.assertEqual(resp.status_code, 201, resp.content)
        self.assertEqual(resp.json()["component"]["status"], "approved")
        self.assertEqual(resp.json()["decision"]["outcome"], "authorize")
        self.assertEqual(resp.json()["decision"]["previous_status"], "proposed")
        self.component.refresh_from_db()
        self.assertEqual(self.component.status, "approved")
        self.assertEqual(PMIGateDecision.objects.filter(component=self.component).count(), 1)

        # continue → active
        self.client.post(
            "/api/v1/pmi/components/%s/decide/" % self.component.id,
            {"outcome": "continue"}, format="json",
        )
        self.component.refresh_from_db()
        self.assertEqual(self.component.status, "active")

        # stop → cancelled
        self.client.post(
            "/api/v1/pmi/components/%s/decide/" % self.component.id,
            {"outcome": "stop", "rationale": "Strategy changed"}, format="json",
        )
        self.component.refresh_from_db()
        self.assertEqual(self.component.status, "cancelled")

        # Audit trail shows 3 decisions
        rows = _list(self.client.get("/api/v1/pmi/gate-decisions/?component=%s" % self.component.id).json())
        self.assertEqual(len(rows), 3)

    def test_decide_rejects_unknown_outcome(self):
        resp = self.client.post(
            "/api/v1/pmi/components/%s/decide/" % self.component.id,
            {"outcome": "frobnicate"}, format="json",
        )
        self.assertEqual(resp.status_code, 400)
        self.assertEqual(resp.json()["code"], "invalid_outcome")

    def test_decide_hold_leaves_status_unchanged(self):
        resp = self.client.post(
            "/api/v1/pmi/components/%s/decide/" % self.component.id,
            {"outcome": "hold"}, format="json",
        )
        self.assertEqual(resp.status_code, 201)
        self.component.refresh_from_db()
        self.assertEqual(self.component.status, "proposed")  # unchanged
        self.assertEqual(PMIGateDecision.objects.filter(component=self.component).count(), 1)

    def test_charter_benefit_stakeholder_endpoints(self):
        ch = self.client.post(
            "/api/v1/pmi/programs/%s/charters/" % self.program.id,
            {"vision": "Be #1", "objectives": "Grow"}, format="json",
        )
        self.assertEqual(ch.status_code, 201, ch.content)

        be = self.client.post(
            "/api/v1/pmi/programs/%s/benefits/" % self.program.id,
            {"name": "Revenue uplift", "status": "identified",
             "component": str(self.component.id)}, format="json",
        )
        self.assertEqual(be.status_code, 201, be.content)
        self.assertEqual(be.json()["component_name"], "CRM rollout")

        sh = self.client.post(
            "/api/v1/pmi/programs/%s/stakeholders/" % self.program.id,
            {"name": "CFO", "power": "high", "interest": "high"}, format="json",
        )
        self.assertEqual(sh.status_code, 201, sh.content)
        self.assertEqual(sh.json()["quadrant"], "manage_closely")

    def test_cross_tenant_isolation(self):
        other_co = Company.objects.create(name="Globex")
        other_proj = Project.objects.create(name="Secret", company=other_co)
        PMIComponent.objects.create(program=other_proj, name="Hidden component")

        rows = _list(self.client.get("/api/v1/pmi/components/").json())
        self.assertNotIn("Hidden component", [c["name"] for c in rows])
