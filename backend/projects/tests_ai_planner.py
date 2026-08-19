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

    def test_context_includes_project_charter_fields(self):
        p = _project(
            self.company,
            problem_impact="Handmatige rapportage kost te veel tijd",
            proposed_solution="IQ Helix implementeren",
            scope_in="Academy + assessments",
        )
        from projects.ai_planner import _project_context
        ctx = _project_context(p)
        self.assertEqual(ctx["charter_problem"], "Handmatige rapportage kost te veel tijd")
        self.assertEqual(ctx["charter_solution"], "IQ Helix implementeren")
        self.assertEqual(ctx["charter_scope"], "Academy + assessments")

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


class MethodologyPlannerTests(TestCase):
    """Methodiek-specifieke uitbreiding: fallback + apply per methodiek."""

    def setUp(self):
        self.company = Company.objects.create(name="Acme")
        User = get_user_model()
        self.user = User.objects.create_user(
            username="pm2", email="pm2@acme.test", password="x",
            company=self.company, role="pm",
        )

    def _plan(self, methodology):
        p = _project(self.company, methodology=methodology)
        result = plan_chat(p, self.user, [{"role": "user", "content": "Maak een plan"}])
        return p, result["proposal"]

    def test_scrum_fallback_and_apply(self):
        p, proposal = self._plan("scrum")
        self.assertEqual(proposal["methodology_plan"]["type"], "scrum")
        created = apply_plan(p, self.user, proposal)
        self.assertGreaterEqual(created["sprints"], 2)
        self.assertGreaterEqual(created["backlog_items"], 3)
        from scrum.models import BacklogItem, Sprint
        self.assertTrue(Sprint.objects.filter(project=p, status="planning").exists())
        # Item 1 is aan sprint 1 gekoppeld
        eerste = Sprint.objects.filter(project=p).order_by("number").first()
        self.assertTrue(BacklogItem.objects.filter(sprint=eerste).exists())

    def test_kanban_fallback_and_apply_idempotent_columns(self):
        p, proposal = self._plan("kanban")
        created = apply_plan(p, self.user, proposal)
        self.assertEqual(created["kanban_columns"], 5)
        self.assertGreaterEqual(created["kanban_cards"], 2)
        # Nogmaals toepassen: kolommen met dezelfde naam worden hergebruikt
        created2 = apply_plan(p, self.user, proposal)
        self.assertEqual(created2["kanban_columns"], 0)

    def test_prince2_fallback_and_apply(self):
        p, proposal = self._plan("prince2")
        created = apply_plan(p, self.user, proposal)
        self.assertEqual(created["work_packages"], 3)
        self.assertEqual(created["products"], 3)
        from prince2.models import Product
        self.assertTrue(Product.objects.filter(project=p, work_package__isnull=False).exists())

    def test_lss_green_fallback_and_apply(self):
        p, proposal = self._plan("lean_six_sigma_green")
        created = apply_plan(p, self.user, proposal)
        self.assertEqual(created["dmaic_phases"], 5)
        self.assertEqual(created["lss_tasks"], 5)
        from lss_green.models import DMAICPhase, LSSGreenTask
        self.assertEqual(DMAICPhase.objects.filter(project=p).count(), 5)
        self.assertTrue(LSSGreenTask.objects.filter(project=p, phase__phase="control").exists())

    def test_lss_black_uses_black_tasks(self):
        p, proposal = self._plan("lean_six_sigma_black")
        apply_plan(p, self.user, proposal)
        from lss_black.models import LSSBlackTask
        self.assertTrue(LSSBlackTask.objects.filter(project=p).exists())

    def test_waterfall_fallback_and_apply(self):
        p, proposal = self._plan("waterfall")
        created = apply_plan(p, self.user, proposal)
        self.assertEqual(created["waterfall_phases"], 5)
        from waterfall.models import WaterfallPhase
        self.assertTrue(WaterfallPhase.objects.filter(project=p, phase_type="testing").exists())

    def test_hybrid_fallback_and_apply(self):
        p, proposal = self._plan("hybrid")
        created = apply_plan(p, self.user, proposal)
        self.assertEqual(created["hybrid_phases"], 3)
        from hybrid.models import PhaseMethodology
        self.assertTrue(PhaseMethodology.objects.filter(project=p, methodology="scrum").exists())

    def test_generic_methodology_has_no_extension(self):
        p, proposal = self._plan("inclufy")
        self.assertNotIn("methodology_plan", proposal)


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
