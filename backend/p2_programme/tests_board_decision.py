"""Regression tests for #37 — PRINCE2 Programme board + Blueprint enforcement.

Acceptance criteria:
  * a constituent project's status changes ONLY through a recorded board decision
    (a raw PATCH of status is ignored),
  * the decide action records a P2ProgrammeBoardDecision and applies the outcome,
  * `authorize` is blocked (409 blueprint_required) until the project references
    a Blueprint — a project cannot be authorized outside the operating model,
  * the rollup action reports constituent-project status counts,
  * cross-tenant isolation holds.
"""
from rest_framework.test import APIClient
from django.test import TestCase

from accounts.models import Company
from django.contrib.auth import get_user_model
from programs.models import Program
from p2_programme.models import P2Blueprint, P2ProgrammeProject, P2ProgrammeBoardDecision

User = get_user_model()


def _list(body):
    return body.get("results", body) if isinstance(body, dict) else body


class P2BoardTests(TestCase):
    def setUp(self):
        self.company = Company.objects.create(name="Acme")
        self.user = User.objects.create_user(
            email="pm@acme.test", password="x", username="pm@acme.test",
            company=self.company, role="admin",
        )
        self.programme = Program.objects.create(name="Transformation", company=self.company)
        self.blueprint = P2Blueprint.objects.create(programme=self.programme, name="Target Operating Model")
        self.project = P2ProgrammeProject.objects.create(programme=self.programme, name="CRM rollout")
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_status_is_read_only_on_patch(self):
        resp = self.client.patch(
            "/api/v1/p2-programme/projects/%s/" % self.project.id,
            {"status": "active", "description": "edited"}, format="json",
        )
        self.assertEqual(resp.status_code, 200, resp.content)
        self.assertEqual(resp.json()["status"], "proposed")
        self.assertEqual(resp.json()["description"], "edited")
        self.project.refresh_from_db()
        self.assertEqual(self.project.status, "proposed")

    def test_authorize_requires_blueprint(self):
        # Project with no Blueprint cannot be authorized.
        bare = P2ProgrammeProject.objects.create(programme=self.programme, name="No-blueprint project")
        resp = self.client.post(
            "/api/v1/p2-programme/projects/%s/decide/" % bare.id,
            {"decision": "authorize"}, format="json",
        )
        self.assertEqual(resp.status_code, 409, resp.content)
        self.assertEqual(resp.json()["code"], "blueprint_required")
        bare.refresh_from_db()
        self.assertEqual(bare.status, "proposed")
        self.assertEqual(P2ProgrammeBoardDecision.objects.filter(project=bare).count(), 0)

    def test_decide_records_and_applies(self):
        # link the Blueprint, then authorize → approved
        self.project.blueprint = self.blueprint
        self.project.save(update_fields=["blueprint"])

        resp = self.client.post(
            "/api/v1/p2-programme/projects/%s/decide/" % self.project.id,
            {"decision": "authorize", "gate": "End of Tranche 1", "rationale": "Aligned to TOM"},
            format="json",
        )
        self.assertEqual(resp.status_code, 201, resp.content)
        self.assertEqual(resp.json()["project"]["status"], "approved")
        self.assertEqual(resp.json()["decision"]["decision"], "authorize")
        self.assertEqual(resp.json()["decision"]["previous_status"], "proposed")
        self.project.refresh_from_db()
        self.assertEqual(self.project.status, "approved")

        # start → active
        self.client.post(
            "/api/v1/p2-programme/projects/%s/decide/" % self.project.id,
            {"decision": "start"}, format="json",
        )
        self.project.refresh_from_db()
        self.assertEqual(self.project.status, "active")

        # stop → closed
        self.client.post(
            "/api/v1/p2-programme/projects/%s/decide/" % self.project.id,
            {"decision": "stop", "rationale": "Strategy changed"}, format="json",
        )
        self.project.refresh_from_db()
        self.assertEqual(self.project.status, "closed")

        rows = _list(self.client.get(
            "/api/v1/p2-programme/board-decisions/?project=%s" % self.project.id).json())
        self.assertEqual(len(rows), 3)

    def test_defer_leaves_status_unchanged(self):
        resp = self.client.post(
            "/api/v1/p2-programme/projects/%s/decide/" % self.project.id,
            {"decision": "defer"}, format="json",
        )
        self.assertEqual(resp.status_code, 201)
        self.project.refresh_from_db()
        self.assertEqual(self.project.status, "proposed")
        self.assertEqual(P2ProgrammeBoardDecision.objects.filter(project=self.project).count(), 1)

    def test_decide_rejects_unknown_decision(self):
        resp = self.client.post(
            "/api/v1/p2-programme/projects/%s/decide/" % self.project.id,
            {"decision": "frobnicate"}, format="json",
        )
        self.assertEqual(resp.status_code, 400)
        self.assertEqual(resp.json()["code"], "invalid_decision")

    def test_rollup(self):
        self.project.blueprint = self.blueprint
        self.project.save(update_fields=["blueprint"])
        self.client.post(
            "/api/v1/p2-programme/projects/%s/decide/" % self.project.id,
            {"decision": "authorize"}, format="json",
        )
        body = self.client.get(
            "/api/v1/p2-programme/programs/%s/projects/rollup/" % self.programme.id).json()
        self.assertEqual(body["total"], 1)
        self.assertEqual(body["authorized"], 1)
        self.assertEqual(body["with_blueprint"], 1)

    def test_cross_tenant_isolation(self):
        other_co = Company.objects.create(name="Globex")
        other_prog = Program.objects.create(name="Secret", company=other_co)
        P2ProgrammeProject.objects.create(programme=other_prog, name="Hidden project")

        rows = _list(self.client.get("/api/v1/p2-programme/projects/").json())
        self.assertNotIn("Hidden project", [p["name"] for p in rows])
