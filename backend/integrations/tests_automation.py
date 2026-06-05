"""Tests for the automation rule engine (#65, IL-3).

Two layers:
  * Engine unit tests — condition matching (all/any, every operator, changed_to,
    dotted paths) and {{path}} action templating are real logic, tested directly.
  * API tests — admin can CRUD rules (tenant-scoped); dry-run evaluates without
    side effects; trigger fires a real event and records AutomationRuns + bumps
    the rule counters; cross-tenant rules are invisible.

Runs on the in-memory SQLite test DB — no Docker needed.
"""
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import Company
from integrations.models import AutomationRule, AutomationRun
from integrations.engine import condition_matches, evaluate_rule, evaluate_event, _render


class EngineUnitTests(TestCase):
    def test_empty_condition_always_matches(self):
        self.assertTrue(condition_matches({}, {"anything": 1}))
        self.assertTrue(condition_matches({"clauses": []}, {}))

    def test_eq_and_ne(self):
        cond = {"clauses": [{"field": "status", "op": "eq", "value": "done"}]}
        self.assertTrue(condition_matches(cond, {"status": "done"}))
        self.assertFalse(condition_matches(cond, {"status": "open"}))

    def test_numeric_operators(self):
        cond = {"clauses": [{"field": "exposure", "op": "gte", "value": 12}]}
        self.assertTrue(condition_matches(cond, {"exposure": 12}))
        self.assertTrue(condition_matches(cond, {"exposure": 20}))
        self.assertFalse(condition_matches(cond, {"exposure": 5}))

    def test_in_and_contains(self):
        c_in = {"clauses": [{"field": "p", "op": "in", "value": ["P0", "P1"]}]}
        self.assertTrue(condition_matches(c_in, {"p": "P1"}))
        self.assertFalse(condition_matches(c_in, {"p": "P2"}))
        c_con = {"clauses": [{"field": "tags", "op": "contains", "value": "urgent"}]}
        self.assertTrue(condition_matches(c_con, {"tags": ["urgent", "x"]}))

    def test_match_all_vs_any(self):
        clauses = [
            {"field": "a", "op": "eq", "value": 1},
            {"field": "b", "op": "eq", "value": 2},
        ]
        all_c = {"match": "all", "clauses": clauses}
        any_c = {"match": "any", "clauses": clauses}
        self.assertTrue(condition_matches(all_c, {"a": 1, "b": 2}))
        self.assertFalse(condition_matches(all_c, {"a": 1, "b": 9}))
        self.assertTrue(condition_matches(any_c, {"a": 1, "b": 9}))
        self.assertFalse(condition_matches(any_c, {"a": 8, "b": 9}))

    def test_changed_to(self):
        cond = {"clauses": [{"field": "status", "op": "changed_to", "value": "done"}]}
        payload = {"changes": {"status": {"from": "in_progress", "to": "done"}}}
        self.assertTrue(condition_matches(cond, payload))
        self.assertFalse(condition_matches(cond, {"changes": {"status": {"to": "open"}}}))

    def test_dotted_path_and_exists(self):
        cond = {"clauses": [{"field": "item.assignee", "op": "exists", "value": True}]}
        self.assertTrue(condition_matches(cond, {"item": {"assignee": 5}}))
        self.assertFalse(condition_matches(cond, {"item": {}}))

    def test_action_templating(self):
        config = {"message": "Item {{item.title}} is {{status}}", "to": "{{owner}}"}
        out = _render(config, {"item": {"title": "Login"}, "status": "done", "owner": "ann"})
        self.assertEqual(out["message"], "Item Login is done")
        self.assertEqual(out["to"], "ann")


class AutomationApiTests(TestCase):
    def setUp(self):
        User = get_user_model()
        self.company = Company.objects.create(name="Acme")
        self.admin = User.objects.create_user(
            email="admin@acme.com", password="pw12345678",
            username="admin", company=self.company, role="admin",
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.admin)
        self.base = "/api/v1/admin/automation-rules/"

    def _make_rule(self, **kw):
        defaults = dict(
            tenant=self.company, name="Notify on done",
            trigger="backlog_item.status_changed",
            condition={"clauses": [{"field": "status", "op": "changed_to", "value": "done"}]},
            action_type="notify",
            action_config={"message": "{{title}} shipped"},
        )
        defaults.update(kw)
        return AutomationRule.objects.create(**defaults)

    def test_create_rule_defaults_tenant_to_company(self):
        res = self.client.post(self.base, {
            "name": "Escalate P0 risk",
            "trigger": "risk.created",
            "condition": {"clauses": [{"field": "priority", "op": "eq", "value": "P0"}]},
            "action_type": "notify",
            "action_config": {"message": "New P0 risk"},
        }, format="json")
        self.assertEqual(res.status_code, 201, res.content)
        rule = AutomationRule.objects.get(id=res.json()["id"])
        self.assertEqual(rule.tenant_id, self.company.id)
        self.assertEqual(rule.created_by, self.admin)

    def test_invalid_condition_rejected(self):
        res = self.client.post(self.base, {
            "name": "Bad",
            "trigger": "custom",
            "condition": {"clauses": [{"field": "x", "op": "wat"}]},
            "action_type": "notify",
        }, format="json")
        self.assertEqual(res.status_code, 400)

    def test_dry_run_no_side_effects(self):
        rule = self._make_rule()
        res = self.client.post(f"{self.base}{rule.id}/dry-run/", {
            "payload": {"changes": {"status": {"to": "done"}}, "title": "Cart"},
        }, format="json")
        self.assertEqual(res.status_code, 200)
        body = res.json()
        self.assertTrue(body["matched"])
        self.assertEqual(body["action"]["config"]["message"], "Cart shipped")
        self.assertEqual(AutomationRun.objects.count(), 0)  # dry-run records nothing

    def test_trigger_records_runs_and_bumps_counters(self):
        rule = self._make_rule()
        res = self.client.post(f"{self.base}trigger/", {
            "trigger": "backlog_item.status_changed",
            "payload": {"changes": {"status": {"to": "done"}}, "title": "Cart"},
        }, format="json")
        self.assertEqual(res.status_code, 200, res.content)
        self.assertEqual(res.json()["evaluated"], 1)
        self.assertEqual(res.json()["results"][0]["status"], "matched")
        rule.refresh_from_db()
        self.assertEqual(rule.trigger_count, 1)
        self.assertIsNotNone(rule.last_triggered_at)
        run = AutomationRun.objects.get(rule=rule)
        self.assertEqual(run.status, "matched")
        self.assertEqual(run.action_result["config"]["message"], "Cart shipped")

    def test_trigger_skips_non_matching(self):
        self._make_rule()
        res = self.client.post(f"{self.base}trigger/", {
            "trigger": "backlog_item.status_changed",
            "payload": {"changes": {"status": {"to": "in_progress"}}, "title": "Cart"},
        }, format="json")
        self.assertEqual(res.json()["results"][0]["status"], "skipped")
        self.assertEqual(AutomationRun.objects.filter(status="matched").count(), 0)

    def test_runs_listing(self):
        rule = self._make_rule()
        evaluate_event(self.company, "backlog_item.status_changed",
                       {"changes": {"status": {"to": "done"}}, "title": "X"})
        res = self.client.get(f"{self.base}{rule.id}/runs/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.json()), 1)

    def test_cross_tenant_isolation(self):
        other = Company.objects.create(name="Other")
        self._make_rule(tenant=other, name="Other rule")
        self._make_rule(name="Mine")
        rows = self.client.get(self.base).json()
        rows = rows.get("results", rows) if isinstance(rows, dict) else rows
        self.assertEqual({r["name"] for r in rows}, {"Mine"})
