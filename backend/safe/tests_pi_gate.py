"""Behavioural tests for the SAFe PI gate work (backlog #56/#57).

Proves the SAFe PI loop actually gates rather than rubber-stamping:
  Commit state-machine
    #1 planning→active is blocked while the PI carries no committed objective
       with business value (PI Planning produced no commitment).
    #2 planning→active is blocked while a dependency is untriaged (no ROAM).
    #3 planning→active passes once a committed objective + triaged deps exist.
    #4 active→completed is blocked until a System Demo + I&A snapshot exist.
    #5 active→completed passes once both exist.
  Creation-order gates
    #6 a PI Objective cannot be created until pi_planning_date is set.
    #7 a Feature cannot be planned into a PI until pi_planning_date is set
       (but a funnel feature with no PI is unrestricted).
    #8 Inspect & Adapt (create + snapshot) is blocked while the PI is still
       in planning.

Runs on the in-memory SQLite test DB — no Docker needed.
"""
from datetime import date

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import Company
from programs.models import Program
from safe.models import (
    ProgramIncrement, PIObjective, Feature, Dependency, SystemDemo, InspectAdapt,
)


class _Base(TestCase):
    def setUp(self):
        self.company = Company.objects.create(name="SAFeCo")
        User = get_user_model()
        self.user = User.objects.create_user(
            email="rte@example.com", password="testpass123",
            username="rte", company=self.company, role="admin",
        )
        self.program = Program.objects.create(name="Train", company=self.company)
        self.pi = ProgramIncrement.objects.create(
            program=self.program, name="PI 2026.1", status="planning",
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def _commit_url(self):
        return f"/api/v1/safe/pis/{self.pi.id}/commit/"


class CommitStateMachineTests(_Base):
    def _planning_ready(self):
        """Give the PI a real commitment: one committed objective w/ BV + no
        untriaged dependencies."""
        PIObjective.objects.create(
            pi=self.pi, description="ship onboarding", business_value=8,
            committed=True,
        )

    # ---- #1 no committed objective ------------------------------------
    def test_commit_blocked_without_committed_objective(self):
        resp = self.client.post(self._commit_url(), {}, format="json")
        self.assertEqual(resp.status_code, 409, resp.content)
        body = resp.json()
        self.assertEqual(body.get("code"), "pi_commit_blocked")
        self.assertTrue(any("objective" in b.lower() for b in body.get("blockers", [])))
        self.pi.refresh_from_db()
        self.assertEqual(self.pi.status, "planning")

    # ---- #2 untriaged dependency --------------------------------------
    def test_commit_blocked_by_untriaged_dependency(self):
        self._planning_ready()
        f1 = Feature.objects.create(pi=self.pi, name="A")
        f2 = Feature.objects.create(pi=self.pi, name="B")
        Dependency.objects.create(pi=self.pi, source_feature=f1, target_feature=f2, roam="")
        resp = self.client.post(self._commit_url(), {}, format="json")
        self.assertEqual(resp.status_code, 409, resp.content)
        self.assertTrue(any("untriaged" in b.lower() or "roam" in b.lower()
                            for b in resp.json().get("blockers", [])))
        self.pi.refresh_from_db()
        self.assertEqual(self.pi.status, "planning")

    # ---- #3 happy path planning→active --------------------------------
    def test_commit_passes_with_commitment_and_triaged_deps(self):
        self._planning_ready()
        f1 = Feature.objects.create(pi=self.pi, name="A")
        f2 = Feature.objects.create(pi=self.pi, name="B")
        Dependency.objects.create(pi=self.pi, source_feature=f1, target_feature=f2, roam="owned")
        resp = self.client.post(self._commit_url(), {}, format="json")
        self.assertEqual(resp.status_code, 200, resp.content)
        self.pi.refresh_from_db()
        self.assertEqual(self.pi.status, "active")

    # ---- #4 active→completed blocked without demo + I&A ---------------
    def test_complete_blocked_without_demo_and_ia(self):
        self.pi.status = "active"
        self.pi.save(update_fields=["status"])
        resp = self.client.post(self._commit_url(), {}, format="json")
        self.assertEqual(resp.status_code, 409, resp.content)
        blockers = resp.json().get("blockers", [])
        self.assertTrue(any("system demo" in b.lower() for b in blockers))
        self.assertTrue(any("inspect" in b.lower() for b in blockers))
        self.pi.refresh_from_db()
        self.assertEqual(self.pi.status, "active")

    # ---- #5 active→completed passes -----------------------------------
    def test_complete_passes_with_demo_and_ia(self):
        self.pi.status = "active"
        self.pi.save(update_fields=["status"])
        SystemDemo.objects.create(pi=self.pi, iteration=5, demo_date=date.today())
        InspectAdapt.objects.create(pi=self.pi, predictability=92)
        resp = self.client.post(self._commit_url(), {}, format="json")
        self.assertEqual(resp.status_code, 200, resp.content)
        self.pi.refresh_from_db()
        self.assertEqual(self.pi.status, "completed")

    def test_commit_on_completed_is_noop_409(self):
        self.pi.status = "completed"
        self.pi.save(update_fields=["status"])
        resp = self.client.post(self._commit_url(), {}, format="json")
        self.assertEqual(resp.status_code, 409, resp.content)
        self.assertEqual(resp.json().get("code"), "pi_already_completed")


class CreationOrderGateTests(_Base):
    def _obj_url(self):
        return (f"/api/v1/safe/programs/{self.program.id}"
                f"/pis/{self.pi.id}/objectives/")

    def _feature_url(self):
        return f"/api/v1/safe/pis/{self.pi.id}/features/"

    def _ia_url(self):
        return f"/api/v1/safe/pis/{self.pi.id}/inspect-adapt/"

    def _ia_snapshot_url(self):
        return f"/api/v1/safe/pis/{self.pi.id}/inspect-adapt/snapshot/"

    # ---- #6 objective gated on PI Planning date -----------------------
    def test_objective_blocked_before_pi_planning(self):
        body = {"description": "x", "business_value": 5, "pi": str(self.pi.id)}
        resp = self.client.post(self._obj_url(), body, format="json")
        self.assertEqual(resp.status_code, 409, resp.content)
        self.assertEqual(resp.json().get("code"), "pi_planning_required")

        self.pi.pi_planning_date = date.today()
        self.pi.save(update_fields=["pi_planning_date"])
        ok = self.client.post(self._obj_url(), body, format="json")
        self.assertEqual(ok.status_code, 201, ok.content)

    # ---- #7 feature into PI gated; funnel feature free ----------------
    def test_feature_into_pi_blocked_before_planning(self):
        resp = self.client.post(self._feature_url(), {"name": "F"}, format="json")
        self.assertEqual(resp.status_code, 409, resp.content)
        self.assertEqual(resp.json().get("code"), "pi_planning_required")

        # A funnel feature (no PI) is always allowed.
        funnel = self.client.post("/api/v1/safe/features/", {"name": "Funnel"}, format="json")
        self.assertEqual(funnel.status_code, 201, funnel.content)

        self.pi.pi_planning_date = date.today()
        self.pi.save(update_fields=["pi_planning_date"])
        ok = self.client.post(self._feature_url(), {"name": "F"}, format="json")
        self.assertEqual(ok.status_code, 201, ok.content)

    # ---- #8 I&A blocked while PI still planning ------------------------
    def test_inspect_adapt_blocked_while_planning(self):
        create = self.client.post(self._ia_url(), {}, format="json")
        self.assertEqual(create.status_code, 409, create.content)
        self.assertEqual(create.json().get("code"), "pi_not_started")

        snap = self.client.post(self._ia_snapshot_url(), {}, format="json")
        self.assertEqual(snap.status_code, 409, snap.content)
        self.assertEqual(snap.json().get("code"), "pi_not_started")

        # Once active, the snapshot works.
        self.pi.status = "active"
        self.pi.save(update_fields=["status"])
        PIObjective.objects.create(
            pi=self.pi, description="o", business_value=10, actual_value=7, committed=True,
        )
        ok = self.client.post(self._ia_snapshot_url(), {}, format="json")
        self.assertEqual(ok.status_code, 200, ok.content)
        self.assertEqual(ok.json().get("predictability"), 70)
