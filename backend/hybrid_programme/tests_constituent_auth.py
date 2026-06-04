"""Behavioural tests for Hybrid-Programme config-driven authorization (#39, P2).

A hybrid programme blends frameworks across constituent projects. Each
constituent carries a `governance_mode` (predictive / adaptive / blend) and the
`authorize` action enforces a DIFFERENT gate depending on it, so two
contrasting configs produce different authorization behaviour at runtime:

  predictive -> a stage-gate review must be PASSED  (409 stage_gate_required)
  adaptive   -> a checkpoint within cadence_days     (409 cadence_checkpoint_required)
  blend      -> BOTH

These tests prove the gate is enforced BEFORE the state change (409 + code),
that `status` is read_only on a raw PATCH, the roll-up aggregates constituents,
and that applying a HybridAdaptation mutates the active config's control_level.

Runs on the in-memory SQLite test DB — no Docker needed.
"""
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient

from accounts.models import Company
from projects.models import Project
from programs.models import Program
from hybrid_programme.models import (
    ConstituentAuthorization, HybridGovernanceConfig, HybridAdaptation,
)


class HybridProgrammeAuthTests(TestCase):
    def setUp(self):
        User = get_user_model()
        self.company = Company.objects.create(name="HybridProgCo")
        self.user = User.objects.create_user(
            email="hp@example.com", password="testpass123",
            username="hp", company=self.company, role="admin",
        )
        self.programme = Program.objects.create(
            name="Transformation Programme", company=self.company,
            methodology="hybrid_programme",
        )
        self.proj = Project.objects.create(
            name="Constituent A", company=self.company,
            methodology="waterfall", created_by=self.user,
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def _base(self):
        return f"/api/v1/hybrid-programme/programs/{self.programme.id}/constituents/"

    def _make(self, mode, **kwargs):
        return ConstituentAuthorization.objects.create(
            programme=self.programme, project=self.proj,
            governance_mode=mode, **kwargs,
        )

    def _url(self, ca, suffix=""):
        return f"{self._base()}{ca.id}/{suffix}"

    # ---- status is read-only on a raw PATCH -----------------------------
    def test_status_read_only_on_patch(self):
        ca = self._make("predictive")
        resp = self.client.patch(self._url(ca), {"status": "authorized"}, format="json")
        self.assertEqual(resp.status_code, 200, resp.content)
        ca.refresh_from_db()
        self.assertEqual(ca.status, "proposed")

    # ---- predictive authorize without stage gate -> 409 -----------------
    def test_predictive_authorize_requires_stage_gate(self):
        ca = self._make("predictive")
        resp = self.client.post(self._url(ca, "authorize/"), {}, format="json")
        self.assertEqual(resp.status_code, 409, resp.content)
        self.assertEqual(resp.json().get("code"), "stage_gate_required")
        ca.refresh_from_db()
        self.assertEqual(ca.status, "proposed")

    # ---- predictive: pass stage gate then authorize ---------------------
    def test_predictive_stage_gate_then_authorize(self):
        ca = self._make("predictive")
        g = self.client.post(self._url(ca, "stage_gate/"), {"notes": "Gate 2 passed"}, format="json")
        self.assertEqual(g.status_code, 200, g.content)
        ca.refresh_from_db()
        self.assertTrue(ca.stage_gate_passed)
        a = self.client.post(self._url(ca, "authorize/"), {}, format="json")
        self.assertEqual(a.status_code, 200, a.content)
        ca.refresh_from_db()
        self.assertEqual(ca.status, "authorized")
        self.assertEqual(ca.authorized_by_id, self.user.id)

    # ---- adaptive authorize without checkpoint -> 409 -------------------
    def test_adaptive_authorize_requires_checkpoint(self):
        ca = self._make("adaptive")
        resp = self.client.post(self._url(ca, "authorize/"), {}, format="json")
        self.assertEqual(resp.status_code, 409, resp.content)
        self.assertEqual(resp.json().get("code"), "cadence_checkpoint_required")

    # ---- adaptive: a STALE checkpoint still fails the cadence window -----
    def test_adaptive_stale_checkpoint_fails(self):
        ca = self._make("adaptive", cadence_days=14)
        ca.last_checkpoint_at = timezone.now() - timedelta(days=30)
        ca.save(update_fields=["last_checkpoint_at"])
        resp = self.client.post(self._url(ca, "authorize/"), {}, format="json")
        self.assertEqual(resp.status_code, 409, resp.content)
        self.assertEqual(resp.json().get("code"), "cadence_checkpoint_required")

    # ---- adaptive: checkpoint then authorize ----------------------------
    def test_adaptive_checkpoint_then_authorize(self):
        ca = self._make("adaptive")
        c = self.client.post(self._url(ca, "checkpoint/"), {}, format="json")
        self.assertEqual(c.status_code, 200, c.content)
        a = self.client.post(self._url(ca, "authorize/"), {}, format="json")
        self.assertEqual(a.status_code, 200, a.content)
        ca.refresh_from_db()
        self.assertEqual(ca.status, "authorized")

    # ---- stage gate not applicable to adaptive; checkpoint not to predictive
    def test_gate_applicability_guards(self):
        adaptive = self._make("adaptive")
        r1 = self.client.post(self._url(adaptive, "stage_gate/"), {}, format="json")
        self.assertEqual(r1.status_code, 409, r1.content)
        self.assertEqual(r1.json().get("code"), "stage_gate_not_applicable")

        predictive = self._make("predictive")
        r2 = self.client.post(self._url(predictive, "checkpoint/"), {}, format="json")
        self.assertEqual(r2.status_code, 409, r2.content)
        self.assertEqual(r2.json().get("code"), "checkpoint_not_applicable")

    # ---- blend requires BOTH gates --------------------------------------
    def test_blend_requires_both_gates(self):
        ca = self._make("blend")
        # neither gate -> both listed
        r0 = self.client.post(self._url(ca, "authorize/"), {}, format="json")
        self.assertEqual(r0.status_code, 409, r0.content)
        self.assertEqual(r0.json().get("code"), "governance_gates_unmet")
        self.assertIn("stage_gate", r0.json()["blockers"])
        self.assertIn("cadence_checkpoint", r0.json()["blockers"])
        # pass stage gate only -> still blocked on checkpoint
        self.client.post(self._url(ca, "stage_gate/"), {}, format="json")
        r1 = self.client.post(self._url(ca, "authorize/"), {}, format="json")
        self.assertEqual(r1.status_code, 409, r1.content)
        self.assertEqual(r1.json().get("code"), "cadence_checkpoint_required")
        # add checkpoint -> authorized
        self.client.post(self._url(ca, "checkpoint/"), {}, format="json")
        r2 = self.client.post(self._url(ca, "authorize/"), {}, format="json")
        self.assertEqual(r2.status_code, 200, r2.content)

    # ---- AC: two contrasting configs -> different runtime behaviour ------
    def test_contrasting_modes_diverge(self):
        """Same action, opposite required gate — proves config drives behaviour."""
        predictive = self._make("predictive")
        adaptive = self._make("adaptive")
        # predictive needs stage gate (checkpoint does nothing for it)
        rp = self.client.post(self._url(predictive, "authorize/"), {}, format="json")
        self.assertEqual(rp.json().get("code"), "stage_gate_required")
        # adaptive needs checkpoint (stage gate does nothing for it)
        ra = self.client.post(self._url(adaptive, "authorize/"), {}, format="json")
        self.assertEqual(ra.json().get("code"), "cadence_checkpoint_required")

    # ---- roll-up aggregates constituents into one programme view --------
    def test_rollup(self):
        self._make("predictive", stage_gate_passed=True, status="authorized")
        self._make("adaptive")
        resp = self.client.get(f"{self._base()}rollup/")
        self.assertEqual(resp.status_code, 200, resp.content)
        body = resp.json()
        self.assertEqual(body["total"], 2)
        self.assertEqual(body["authorized"], 1)
        self.assertIn("predictive", body["by_governance_mode"])
        self.assertIn("adaptive", body["by_governance_mode"])

    # ---- applying an adaptation mutates the active config control_level --
    def test_adaptation_apply_mutates_config(self):
        config = HybridGovernanceConfig.objects.create(
            programme=self.programme, primary_framework="prince2",
            governance_structure={"control_level": 50}, is_active=True,
        )
        adaptation = HybridAdaptation.objects.create(
            programme=self.programme, trigger="market_change", response="increase_agility",
        )
        url = (
            f"/api/v1/hybrid-programme/programs/{self.programme.id}/"
            f"adaptations/{adaptation.id}/apply/"
        )
        resp = self.client.post(url, {}, format="json")
        self.assertEqual(resp.status_code, 200, resp.content)
        self.assertEqual(resp.json()["control_level"], 30)  # 50 - 20
        config.refresh_from_db()
        self.assertEqual(config.governance_structure["control_level"], 30)
        self.assertEqual(len(config.governance_structure["history"]), 1)

    # ---- cross-tenant isolation -----------------------------------------
    def test_cross_tenant_hidden(self):
        other_co = Company.objects.create(name="OtherCo")
        other_prog = Program.objects.create(name="Other", company=other_co, methodology="hybrid_programme")
        other_proj = Project.objects.create(name="OP", company=other_co, methodology="agile")
        ConstituentAuthorization.objects.create(
            programme=other_prog, project=other_proj, governance_mode="adaptive",
        )
        resp = self.client.get(
            f"/api/v1/hybrid-programme/programs/{other_prog.id}/constituents/"
        )
        body = resp.json()
        results = body.get("results", body) if isinstance(body, dict) else body
        self.assertEqual(len(results), 0)
