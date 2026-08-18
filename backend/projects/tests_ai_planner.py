"""Tests voor Plan met AI (chatgestuurde conceptplanning, IL-2).

Twee lagen, allebei zonder netwerk of AI-sleutel (de flow degradeert naar het
deterministische sjabloonplan):
  * Engine — plan_chat geeft altijd een bruikbaar voorstel terug; apply_plan
    maakt echte Milestone/Task/Risk-rijen met validatie en limieten.
  * API — /ai-plan/ en /ai-plan/apply/ zijn auth- en tenant-gescoped.
"""
from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import Company
from projects.models import Project, Milestone, Task, Risk
from projects.ai_planner import plan_chat, apply_plan, _fallback_plan


def _project(company, **kw):
    defaults = dict(name="Implementatie IQ Helix", company=company,
                    status="in_progress", methodology="inclufy", currency="EUR",
                    start_date=date.today(), end_date=date.today() + timedelta(days=56))
    defaults.update(kw)
    return Project.objects.create(**defaults)


class PlannerEngineTests(TestCase):
    def setUp(self):
        self.company = Company.objects.create(name="Acme")
        User = get_user_model()
        self.user = User.objects.create_user(
            username="pm", email="pm@acme.test", password="x",
            company=self.company, role="pm",
        )

    def test_fallback_plan_covers_project_window(self):
        p = _project(self.company)
        plan = _fallback_plan(p)
        self.assertEqual(len(plan["milestones"]), 4)
        self.assertTrue(all(m["tasks"] for m in plan["milestones"]))
        self.assertGreaterEqual(len(plan["risks"]), 3)
        self.assertEqual(plan["milestones"][0]["start_date"], p.start_date.isoformat())
        self.assertEqual(plan["milestones"][-1]["end_date"], p.end_date.isoformat())

    def test_plan_chat_without_key_returns_proposal(self):
        p = _project(self.company)
        result = plan_chat(p, self.user, [{"role": "user", "content": "Maak een plan"}])
        self.assertEqual(result["action"], "propose")
        self.assertEqual(result["source"], "fallback")
        self.assertTrue(result["proposal"]["milestones"])

    def test_apply_plan_creates_rows_and_validates(self):
        p = _project(self.company)
        proposal = {
            "milestones": [{
                "name": "Fase 1", "start_date": "2026-09-01", "end_date": "2026-09-15",
                "tasks": [
                    {"title": "Kick-off", "priority": "high", "due_date": "2026-09-02"},
                    {"title": "", "priority": "medium"},              # leeg → geskipt
                    {"title": "Inrichting", "priority": "onzin"},     # prio → medium
                ],
            }],
            "risks": [
                {"name": "Vertraging aanlevering", "description": "d", "category": "Schedule",
                 "impact": "High", "probability": 140, "level": "Medium", "mitigation": "wekelijks bewaken"},
                {"name": "", "description": "leeg"},                   # leeg → geskipt
            ],
        }
        created = apply_plan(p, self.user, proposal)
        self.assertEqual(created["milestones"], 1)
        self.assertEqual(created["tasks"], 2)
        self.assertEqual(created["risks"], 1)
        self.assertEqual(created["skipped"], 2)

        ms = Milestone.objects.get(project=p, name="Fase 1")
        self.assertEqual(ms.start_date.isoformat(), "2026-09-01")
        t = Task.objects.get(milestone=ms, title="Inrichting")
        self.assertEqual(t.priority, "medium")
        self.assertEqual(t.status, "todo")
        r = Risk.objects.get(project=p)
        self.assertEqual(r.probability, 100)          # begrensd op 0-100
        self.assertIn("Mitigatie:", r.description)
        self.assertEqual(r.status, "Open")

    def test_apply_plan_orders_after_existing_milestones(self):
        p = _project(self.company)
        Milestone.objects.create(project=p, name="Bestaand", order_index=5)
        apply_plan(p, self.user, {"milestones": [{"name": "Nieuw", "tasks": []}]})
        self.assertEqual(Milestone.objects.get(project=p, name="Nieuw").order_index, 6)


class PlannerApiTests(TestCase):
    def setUp(self):
        self.company = Company.objects.create(name="Acme")
        User = get_user_model()
        self.user = User.objects.create_user(
            username="pm", email="pm@acme.test", password="x",
            company=self.company, role="pm",
        )
        self.project = _project(self.company)
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_chat_endpoint_returns_fallback_proposal(self):
        r = self.client.post(
            f"/api/v1/projects/{self.project.id}/ai-plan/",
            {"messages": [{"role": "user", "content": "Maak een conceptplanning"}]},
            format="json",
        )
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data["action"], "propose")
        self.assertTrue(r.data["proposal"]["milestones"])

    def test_apply_endpoint_creates_rows(self):
        r = self.client.post(
            f"/api/v1/projects/{self.project.id}/ai-plan/apply/",
            {"proposal": {"milestones": [{"name": "Fase 1", "tasks": [{"title": "Taak A"}]}]}},
            format="json",
        )
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data["created"]["milestones"], 1)
        self.assertEqual(r.data["created"]["tasks"], 1)
        self.assertTrue(Task.objects.filter(milestone__project=self.project, title="Taak A").exists())

    def test_cross_tenant_project_is_invisible(self):
        other = Company.objects.create(name="Other")
        foreign = _project(other)
        r = self.client.post(
            f"/api/v1/projects/{foreign.id}/ai-plan/", {"messages": []}, format="json",
        )
        self.assertEqual(r.status_code, 404)

    def test_apply_requires_proposal(self):
        r = self.client.post(
            f"/api/v1/projects/{self.project.id}/ai-plan/apply/", {}, format="json",
        )
        self.assertEqual(r.status_code, 400)

    def test_anonymous_is_rejected(self):
        r = APIClient().post(
            f"/api/v1/projects/{self.project.id}/ai-plan/", {"messages": []}, format="json",
        )
        self.assertIn(r.status_code, (401, 403))
