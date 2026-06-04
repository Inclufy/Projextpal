"""Behavioural tests for Decision → component authorization (backlog #20, P0-1).

A governance Decision used to be an inert record. It now drives the lifecycle
of a linked component: applying an outcome flips the target's status, writes an
immutable audit row, and makes the decision append-only. These tests prove:
  #1 applying a 'hold' Decision flips the linked Program to on_hold + audit row.
  #2 the decision is append-only once applied (edit → 409).
  #3 re-applying is rejected (409).
  #4 rejecting a decision changes nothing on the target.
  #5 apply with no outcome / no target is a 400.
  #6 cross-tenant apply is denied (403) and the target is untouched.

Runs on the in-memory SQLite test DB — no Docker needed.
"""
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import Company
from programs.models import Program
from governance.models import Decision, DecisionAuditLog


class DecisionApplyTests(TestCase):
    def setUp(self):
        User = get_user_model()
        self.company = Company.objects.create(name="GovCo")
        self.user = User.objects.create_user(
            email="gov@example.com", password="testpass123",
            username="gov", company=self.company, role="admin",
        )
        self.program = Program.objects.create(
            company=self.company, name="Programme A", methodology="msp", status="planning",
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def _decision(self, **kw):
        defaults = dict(program=self.program, title="Steering call", status="pending")
        defaults.update(kw)
        return Decision.objects.create(**defaults)

    def _apply_url(self, decision):
        return f"/api/v1/governance/decisions/{decision.id}/apply/"

    def _detail_url(self, decision):
        return f"/api/v1/governance/decisions/{decision.id}/"

    # ---- #1 apply 'hold' flips the program + writes audit ---------------
    def test_apply_hold_flips_program_and_audits(self):
        d = self._decision(outcome="hold", authorized_program=self.program)
        resp = self.client.post(self._apply_url(d), {}, format="json")
        self.assertEqual(resp.status_code, 200, resp.content)
        self.program.refresh_from_db()
        self.assertEqual(self.program.status, "on_hold")
        d.refresh_from_db()
        self.assertEqual(d.status, "approved")
        self.assertIsNotNone(d.applied_at)
        log = DecisionAuditLog.objects.filter(decision=d).first()
        self.assertIsNotNone(log)
        self.assertEqual(log.previous_status, "planning")
        self.assertEqual(log.new_status, "on_hold")
        self.assertEqual(log.target_kind, "program")

    # ---- #2 append-only once applied -----------------------------------
    def test_decision_append_only_after_apply(self):
        d = self._decision(outcome="hold", authorized_program=self.program)
        self.client.post(self._apply_url(d), {}, format="json")
        resp = self.client.patch(self._detail_url(d), {"title": "Edited"}, format="json")
        self.assertEqual(resp.status_code, 409, resp.content)
        self.assertEqual(resp.json().get("code"), "decision_applied")
        d.refresh_from_db()
        self.assertEqual(d.title, "Steering call")

    # ---- #3 cannot re-apply --------------------------------------------
    def test_cannot_reapply(self):
        d = self._decision(outcome="hold", authorized_program=self.program)
        self.client.post(self._apply_url(d), {}, format="json")
        resp = self.client.post(self._apply_url(d), {}, format="json")
        self.assertEqual(resp.status_code, 409, resp.content)
        self.assertEqual(resp.json().get("code"), "already_applied")

    # ---- #4 reject changes nothing -------------------------------------
    def test_reject_changes_nothing(self):
        d = self._decision(outcome="hold", authorized_program=self.program)
        resp = self.client.patch(self._detail_url(d), {"status": "rejected"}, format="json")
        self.assertEqual(resp.status_code, 200, resp.content)
        self.program.refresh_from_db()
        self.assertEqual(self.program.status, "planning")
        self.assertFalse(DecisionAuditLog.objects.filter(decision=d).exists())

    # ---- #5 apply needs outcome + target -------------------------------
    def test_apply_requires_outcome(self):
        d = self._decision(authorized_program=self.program)  # no outcome
        resp = self.client.post(self._apply_url(d), {}, format="json")
        self.assertEqual(resp.status_code, 400, resp.content)
        self.assertEqual(resp.json().get("code"), "outcome_required")

    def test_apply_requires_target(self):
        d = self._decision(outcome="hold")  # no authorized_* target
        resp = self.client.post(self._apply_url(d), {}, format="json")
        self.assertEqual(resp.status_code, 400, resp.content)
        self.assertEqual(resp.json().get("code"), "target_required")

    # ---- #6 cross-tenant apply denied ----------------------------------
    def test_cross_tenant_apply_denied(self):
        other_company = Company.objects.create(name="RivalCo")
        other_program = Program.objects.create(
            company=other_company, name="Rival Programme", methodology="msp", status="planning",
        )
        # Decision lives in our company (program=A) but points at another tenant's program.
        d = self._decision(outcome="hold", authorized_program=other_program)
        resp = self.client.post(self._apply_url(d), {}, format="json")
        self.assertEqual(resp.status_code, 403, resp.content)
        other_program.refresh_from_db()
        self.assertEqual(other_program.status, "planning")
        self.assertFalse(DecisionAuditLog.objects.filter(decision=d).exists())
