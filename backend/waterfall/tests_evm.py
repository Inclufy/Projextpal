"""Behavioural tests for Waterfall Earned Value Management (backlog #26, P1-4).

Proves EVM is derived from real data, not hand-entered, and is exposed:
  #1 recompute derives PV/EV/AC from budget items × phase progress.
  #2 the budget endpoint surfaces cpi/spi/cv/sv after recompute.
  #3 recompute with snapshot=true writes a historical EarnedValueRecord.
  #4 the EVM record series endpoint lists the recorded periods.
  #5 unphased items count fully as planned/earned when money was spent.

Runs on the in-memory SQLite test DB — no Docker needed.
"""
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import Company
from projects.models import Project
from waterfall.models import WaterfallBudget, WaterfallBudgetItem, WaterfallPhase, EarnedValueRecord


class WaterfallEVMTests(TestCase):
    def setUp(self):
        self.company = Company.objects.create(name="EVMCo")
        User = get_user_model()
        self.user = User.objects.create_user(
            email="evmpm@example.com", password="testpass123",
            username="evmpm", company=self.company, role="admin",
        )
        self.project = Project.objects.create(
            name="EVM Project", company=self.company,
            methodology="waterfall", created_by=self.user,
        )
        # Two phases at different progress / scheduling.
        self.p_done = WaterfallPhase.objects.create(
            project=self.project, name="Requirements", phase_type="requirements",
            order=1, status="completed", progress=100,
        )
        self.p_wip = WaterfallPhase.objects.create(
            project=self.project, name="Design", phase_type="design",
            order=2, status="in_progress", progress=50,
        )
        self.p_future = WaterfallPhase.objects.create(
            project=self.project, name="Build", phase_type="development",
            order=3, status="not_started", progress=0,
        )
        self.budget = WaterfallBudget.objects.create(
            project=self.project, total_budget=Decimal("10000"),
        )
        # Completed phase: planned 2000, spent 2100 (over budget on this phase).
        WaterfallBudgetItem.objects.create(
            budget=self.budget, phase=self.p_done, category="Labour",
            description="reqs", planned_amount=Decimal("2000"), actual_amount=Decimal("2100"),
        )
        # WIP phase at 50%: planned 4000, spent 1500.
        WaterfallBudgetItem.objects.create(
            budget=self.budget, phase=self.p_wip, category="Labour",
            description="design", planned_amount=Decimal("4000"), actual_amount=Decimal("1500"),
        )
        # Future phase not started: planned 4000, no spend.
        WaterfallBudgetItem.objects.create(
            budget=self.budget, phase=self.p_future, category="Labour",
            description="build", planned_amount=Decimal("4000"), actual_amount=Decimal("0"),
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def _url(self, suffix=""):
        return f"/api/v1/projects/{self.project.id}/waterfall/budget/{suffix}"

    # ---- #1 recompute derives PV/EV/AC ---------------------------------
    def test_recompute_derives_metrics(self):
        metrics = self.budget.recompute_evm(commit=True)
        # AC = 2100 + 1500 + 0
        self.assertEqual(metrics["actual_cost"], 3600.0)
        # EV = 2000*1.0 + 4000*0.5 + 4000*0.0 = 4000
        self.assertEqual(metrics["earned_value"], 4000.0)
        # PV = 2000 (completed) + 4000 (in_progress) = 6000; future not scheduled
        self.assertEqual(metrics["planned_value"], 6000.0)
        # CV = EV-AC = 400 ; SV = EV-PV = -2000
        self.assertEqual(metrics["cost_variance"], 400.0)
        self.assertEqual(metrics["schedule_variance"], -2000.0)

    # ---- #2 endpoint surfaces cpi/spi/cv/sv ----------------------------
    def test_budget_endpoint_exposes_evm(self):
        resp = self.client.post(self._url("recompute/"), {}, format="json")
        self.assertEqual(resp.status_code, 200, resp.content)
        d = resp.json()
        for key in ("planned_value", "earned_value", "actual_cost",
                    "cost_variance", "schedule_variance", "cpi", "spi"):
            self.assertIn(key, d)
        self.assertAlmostEqual(d["cpi"], 4000.0 / 3600.0, places=4)
        self.assertAlmostEqual(d["spi"], 4000.0 / 6000.0, places=4)

    # ---- #3 snapshot writes a historical record ------------------------
    def test_recompute_snapshot_persists_record(self):
        self.assertEqual(EarnedValueRecord.objects.filter(project=self.project).count(), 0)
        resp = self.client.post(self._url("recompute/"), {"snapshot": True}, format="json")
        self.assertEqual(resp.status_code, 200, resp.content)
        recs = EarnedValueRecord.objects.filter(project=self.project)
        self.assertEqual(recs.count(), 1)
        self.assertEqual(float(recs.first().earned_value), 4000.0)
        # idempotent for the same day (update_or_create on period_end)
        self.client.post(self._url("recompute/"), {"snapshot": True}, format="json")
        self.assertEqual(EarnedValueRecord.objects.filter(project=self.project).count(), 1)

    # ---- #4 series endpoint lists records ------------------------------
    def test_evm_series_endpoint(self):
        self.client.post(self._url("recompute/"), {"snapshot": True}, format="json")
        resp = self.client.get(f"/api/v1/projects/{self.project.id}/waterfall/evm-records/")
        self.assertEqual(resp.status_code, 200, resp.content)
        data = resp.json()
        rows = data if isinstance(data, list) else data.get("results", [])
        self.assertEqual(len(rows), 1)
        self.assertIn("cpi", rows[0])

    # ---- #5 unphased item counts fully when money spent ----------------
    def test_unphased_item(self):
        WaterfallBudgetItem.objects.create(
            budget=self.budget, phase=None, category="Misc",
            description="licences", planned_amount=Decimal("1000"), actual_amount=Decimal("1000"),
        )
        metrics = self.budget.recompute_evm(commit=True)
        # EV gains 1000 (spent>0), PV gains 1000, AC gains 1000
        self.assertEqual(metrics["earned_value"], 5000.0)
        self.assertEqual(metrics["planned_value"], 7000.0)
        self.assertEqual(metrics["actual_cost"], 4600.0)
