"""Tests for the NLP auto-status synthesis engine (#66, IL-2).

Two layers:
  * Engine unit tests — gather_metrics reads real task/milestone/risk state;
    compute_rag turns those facts into a defensible RAG; the deterministic
    narrative is fully populated (no network).
  * API tests — `generate` runs the engine and persists a GeneratedStatusReport;
    history is company-scoped (cross-tenant invisible).

Runs on in-memory SQLite — no Docker, no Anthropic key (synthesis degrades to
the deterministic narrative).
"""
from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import Company
from projects.models import Project, Milestone, Task, Risk
from communication.models import GeneratedStatusReport
from communication.status_synthesis import gather_metrics, compute_rag, synthesize


def _project(company, **kw):
    defaults = dict(name="Apollo", company=company, status="in_progress",
                    methodology="scrum", currency="EUR")
    defaults.update(kw)
    return Project.objects.create(**defaults)


def _tasks(project, statuses, due=None):
    ms = Milestone.objects.create(project=project, name="M1")
    for i, st in enumerate(statuses):
        Task.objects.create(milestone=ms, title=f"T{i}", status=st, due_date=due)


class SynthesisEngineTests(TestCase):
    def setUp(self):
        self.company = Company.objects.create(name="Acme")

    def test_gather_metrics_counts_tasks_and_completion(self):
        p = _project(self.company)
        _tasks(p, ["done", "done", "in_progress", "blocked"])
        m = gather_metrics(p)
        self.assertEqual(m["tasks_total"], 4)
        self.assertEqual(m["tasks_done"], 2)
        self.assertEqual(m["tasks_blocked"], 1)
        self.assertEqual(m["completion_pct"], 50)

    def test_overdue_detection(self):
        p = _project(self.company)
        yesterday = date.today() - timedelta(days=1)
        _tasks(p, ["in_progress", "todo"], due=yesterday)
        m = gather_metrics(p)
        self.assertEqual(m["tasks_overdue"], 2)

    def test_open_risk_aggregation(self):
        p = _project(self.company)
        Risk.objects.create(project=p, name="R1", description="x", category="Technical",
                            impact="High", probability=80, level="High", status="Open")
        Risk.objects.create(project=p, name="R2", description="x", category="Schedule",
                            impact="Low", probability=10, level="Low", status="Closed")
        m = gather_metrics(p)
        self.assertEqual(m["open_risks_total"], 1)
        self.assertEqual(m["open_risks_by_level"]["High"], 1)
        self.assertGreater(m["risk_exposure"], 0)

    def test_rag_green_when_healthy(self):
        m = {"tasks_total": 10, "tasks_overdue": 0, "tasks_blocked": 0,
             "completion_pct": 60, "schedule_elapsed_pct": 60,
             "open_risks_by_level": {"High": 0, "Medium": 0, "Low": 1}}
        rag = compute_rag(m)
        self.assertEqual(rag["overall_rag"], "green")

    def test_rag_red_on_blocked_and_high_risk(self):
        m = {"tasks_total": 10, "tasks_overdue": 4, "tasks_blocked": 3,
             "completion_pct": 20, "schedule_elapsed_pct": 80,
             "open_risks_by_level": {"High": 2, "Medium": 0, "Low": 0}}
        rag = compute_rag(m)
        self.assertEqual(rag["rag_scope"], "red")
        self.assertEqual(rag["rag_schedule"], "red")
        self.assertEqual(rag["rag_risk"], "red")
        self.assertEqual(rag["overall_rag"], "red")

    def test_rag_amber_when_slightly_behind(self):
        m = {"tasks_total": 10, "tasks_overdue": 0, "tasks_blocked": 0,
             "completion_pct": 45, "schedule_elapsed_pct": 60,
             "open_risks_by_level": {"High": 0, "Medium": 0, "Low": 0}}
        rag = compute_rag(m)
        self.assertEqual(rag["rag_schedule"], "amber")
        self.assertEqual(rag["overall_rag"], "amber")

    def test_synthesize_deterministic_narrative_is_populated(self):
        p = _project(self.company)
        _tasks(p, ["done", "done", "blocked"])
        out = synthesize(p, use_llm=False)
        self.assertEqual(out["model_used"], "deterministic")
        self.assertTrue(out["executive_summary"])
        self.assertIsInstance(out["highlights"], list)
        self.assertTrue(any("blocked" in b.lower() for b in out["blockers"]))
        self.assertEqual(out["original_ai_response"], "")


class SynthesisApiTests(TestCase):
    def setUp(self):
        User = get_user_model()
        self.company = Company.objects.create(name="Acme")
        self.user = User.objects.create_user(
            email="pm@acme.com", password="pw12345678",
            username="pm", company=self.company, role="member",
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.base = "/api/v1/communication/generated-status-reports/"
        self.project = _project(self.company)
        _tasks(self.project, ["done", "in_progress", "blocked"])

    def test_generate_persists_report(self):
        res = self.client.post(f"{self.base}generate/",
                               {"project": self.project.id}, format="json")
        self.assertEqual(res.status_code, 201, res.content)
        body = res.json()
        self.assertIn(body["overall_rag"], ("green", "amber", "red"))
        self.assertTrue(body["executive_summary"])
        self.assertEqual(body["metrics"]["tasks_total"], 3)
        self.assertEqual(GeneratedStatusReport.objects.count(), 1)
        self.assertEqual(GeneratedStatusReport.objects.first().created_by, self.user)

    def test_generate_requires_project(self):
        res = self.client.post(f"{self.base}generate/", {}, format="json")
        self.assertEqual(res.status_code, 400)

    def test_history_listing_filtered_by_project(self):
        self.client.post(f"{self.base}generate/", {"project": self.project.id}, format="json")
        res = self.client.get(f"{self.base}?project={self.project.id}")
        self.assertEqual(res.status_code, 200)
        rows = res.json()
        rows = rows.get("results", rows) if isinstance(rows, dict) else rows
        self.assertEqual(len(rows), 1)

    def test_cross_tenant_isolation(self):
        other_co = Company.objects.create(name="Other")
        other_proj = _project(other_co, name="Zeus")
        GeneratedStatusReport.objects.create(project=other_proj, overall_rag="red")
        self.client.post(f"{self.base}generate/", {"project": self.project.id}, format="json")
        res = self.client.get(self.base)
        rows = res.json()
        rows = rows.get("results", rows) if isinstance(rows, dict) else rows
        self.assertEqual({r["project_name"] for r in rows}, {"Apollo"})

    def test_cannot_generate_for_other_tenant_project(self):
        other_co = Company.objects.create(name="Other")
        other_proj = _project(other_co, name="Zeus")
        res = self.client.post(f"{self.base}generate/",
                               {"project": other_proj.id}, format="json")
        self.assertEqual(res.status_code, 404)
