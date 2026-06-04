"""Behavioural tests for Hybrid mixed-governance phase gates (backlog #38, P2).

A `PhaseMethodology.methodology` is no longer decorative: it selects the
GOVERNANCE STRATEGY under which the phase completes (constants.strategy_for):

  predictive (waterfall / prince2 / lean_six_sigma_*) -> needs a gate sign-off
  adaptive   (scrum / agile)                          -> needs DoD + tasks done
  flow       (kanban)                                 -> needs all tasks done

These tests prove the gate is enforced BEFORE the state change (HTTP 409 with a
machine-readable `code`), and that gate fields can't be moved by a raw PATCH:

  #1  raw PATCH of gate_status is ignored (read_only)
  #2  raw PATCH of progress to 100 is rejected (400)
  #3  predictive complete without sign-off -> 409 signoff_required
  #4  predictive signoff -> complete succeeds (progress 100, gate complete)
  #5  signoff on a non-predictive phase -> 409 signoff_not_applicable
  #6  adaptive complete with open DoD / open tasks -> 409 dod_incomplete (+blockers)
  #7  adaptive complete when DoD checked + tasks done -> succeeds
  #8  flow complete with WIP -> 409 work_in_progress (+blockers); then drained -> succeeds
  #9  completing an already-complete phase -> 409 already_complete

Runs on the in-memory SQLite test DB — no Docker needed.
"""
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import Company
from projects.models import Project
from hybrid.models import PhaseMethodology, HybridTask


class HybridPhaseStrategyTests(TestCase):
    def setUp(self):
        User = get_user_model()
        self.company = Company.objects.create(name="HybridGov")
        self.user = User.objects.create_user(
            email="gov@example.com", password="testpass123",
            username="gov", company=self.company, role="admin",
        )
        self.project = Project.objects.create(
            name="Hybrid Gov Project", company=self.company,
            methodology="hybrid", created_by=self.user,
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def _phase(self, methodology, **kwargs):
        return PhaseMethodology.objects.create(
            project=self.project, phase=kwargs.pop("phase", "P"),
            methodology=methodology, **kwargs,
        )

    def _url(self, phase, suffix=""):
        return (
            f"/api/v1/hybrid/projects/{self.project.id}/"
            f"phase-methodologies/{phase.id}/{suffix}"
        )

    # ---- #1 gate_status is read-only on a raw PATCH ----------------------
    def test_raw_patch_cannot_set_gate_status(self):
        phase = self._phase("waterfall")
        resp = self.client.patch(self._url(phase), {"gate_status": "complete"}, format="json")
        self.assertEqual(resp.status_code, 200, resp.content)
        phase.refresh_from_db()
        self.assertEqual(phase.gate_status, "open")

    # ---- #2 raw PATCH of progress to 100 rejected ------------------------
    def test_raw_patch_progress_100_rejected(self):
        phase = self._phase("waterfall")
        resp = self.client.patch(self._url(phase), {"progress": 100}, format="json")
        self.assertEqual(resp.status_code, 400, resp.content)
        phase.refresh_from_db()
        self.assertEqual(phase.progress, 0)

    # ---- #3 predictive complete without sign-off -> 409 ------------------
    def test_predictive_complete_without_signoff_blocked(self):
        phase = self._phase("waterfall")
        resp = self.client.post(self._url(phase, "complete/"), {}, format="json")
        self.assertEqual(resp.status_code, 409, resp.content)
        self.assertEqual(resp.json().get("code"), "signoff_required")
        phase.refresh_from_db()
        self.assertEqual(phase.gate_status, "open")
        self.assertEqual(phase.progress, 0)

    # ---- #4 predictive signoff then complete succeeds --------------------
    def test_predictive_signoff_then_complete(self):
        phase = self._phase("prince2")
        s = self.client.post(self._url(phase, "signoff/"), {}, format="json")
        self.assertEqual(s.status_code, 200, s.content)
        phase.refresh_from_db()
        self.assertEqual(phase.gate_status, "signed_off")
        self.assertEqual(phase.signed_off_by_id, self.user.id)
        self.assertIsNotNone(phase.signed_off_at)

        c = self.client.post(self._url(phase, "complete/"), {}, format="json")
        self.assertEqual(c.status_code, 200, c.content)
        phase.refresh_from_db()
        self.assertEqual(phase.gate_status, "complete")
        self.assertEqual(phase.progress, 100)
        self.assertIsNotNone(phase.completed_at)

    # ---- #5 signoff not applicable on non-predictive phase ---------------
    def test_signoff_not_applicable_for_adaptive(self):
        phase = self._phase("scrum")
        resp = self.client.post(self._url(phase, "signoff/"), {}, format="json")
        self.assertEqual(resp.status_code, 409, resp.content)
        self.assertEqual(resp.json().get("code"), "signoff_not_applicable")

    # ---- #6 adaptive complete with open DoD / tasks -> 409 ---------------
    def test_adaptive_complete_with_open_items_blocked(self):
        phase = self._phase("scrum", dod_checklist=[
            {"text": "Code reviewed", "done": True},
            {"text": "Tests passing", "done": False},
        ])
        HybridTask.objects.create(
            project=self.project, phase=phase, title="Open story", status="in_progress",
        )
        resp = self.client.post(self._url(phase, "complete/"), {}, format="json")
        self.assertEqual(resp.status_code, 409, resp.content)
        body = resp.json()
        self.assertEqual(body.get("code"), "dod_incomplete")
        self.assertIn("Tests passing", body["blockers"]["open_dod_items"])
        self.assertIn("Open story", body["blockers"]["open_tasks"])
        phase.refresh_from_db()
        self.assertNotEqual(phase.gate_status, "complete")

    # ---- #7 adaptive complete when DoD + tasks done ----------------------
    def test_adaptive_complete_when_done(self):
        phase = self._phase("scrum", dod_checklist=[
            {"text": "Code reviewed", "done": True},
            {"text": "Tests passing", "done": True},
        ])
        HybridTask.objects.create(
            project=self.project, phase=phase, title="Done story", status="done",
        )
        resp = self.client.post(self._url(phase, "complete/"), {}, format="json")
        self.assertEqual(resp.status_code, 200, resp.content)
        phase.refresh_from_db()
        self.assertEqual(phase.gate_status, "complete")
        self.assertEqual(phase.progress, 100)

    # ---- #8 flow complete blocked by WIP, then drained -------------------
    def test_flow_complete_blocked_then_drained(self):
        phase = self._phase("kanban")
        t = HybridTask.objects.create(
            project=self.project, phase=phase, title="Flow card", status="in_progress",
        )
        resp = self.client.post(self._url(phase, "complete/"), {}, format="json")
        self.assertEqual(resp.status_code, 409, resp.content)
        self.assertEqual(resp.json().get("code"), "work_in_progress")

        t.status = "done"
        t.save(update_fields=["status"])
        resp2 = self.client.post(self._url(phase, "complete/"), {}, format="json")
        self.assertEqual(resp2.status_code, 200, resp2.content)
        phase.refresh_from_db()
        self.assertEqual(phase.gate_status, "complete")
        self.assertEqual(phase.progress, 100)

    # ---- #9 already-complete phase cannot complete again -----------------
    def test_already_complete_rejected(self):
        phase = self._phase("kanban")
        # no tasks -> flow phase completes immediately
        first = self.client.post(self._url(phase, "complete/"), {}, format="json")
        self.assertEqual(first.status_code, 200, first.content)
        again = self.client.post(self._url(phase, "complete/"), {}, format="json")
        self.assertEqual(again.status_code, 409, again.content)
        self.assertEqual(again.json().get("code"), "already_complete")
