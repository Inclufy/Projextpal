"""Tests for the AI Risk Copilot predictive engine (#67, IL-1).

Two layers:
  * Engine unit tests — gather_risk_signals reads the live RAID + schedule
    picture (exposure, velocity, slip); compute_forecast turns those signals
    into a deterministic trend + projected exposure + outlook; the deterministic
    narrative is fully populated (no network).
  * API tests — `generate` runs the engine and persists a RiskForecast;
    history is project/company-scoped (cross-tenant invisible).

Runs on in-memory SQLite — no Docker, no Anthropic key (degrades to the
deterministic narrative).
"""
from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from accounts.models import Company
from projects.models import Project, Milestone, Task, Risk, RiskForecast
from projects.risk_forecast import gather_risk_signals, compute_forecast, forecast


def _project(company, **kw):
    defaults = dict(name="Apollo", company=company, status="in_progress",
                    methodology="prince2", currency="EUR")
    defaults.update(kw)
    return Project.objects.create(**defaults)


def _risk(project, *, level="Medium", impact="Medium", prob=50, status="Open",
          created=None, name="R"):
    r = Risk.objects.create(
        project=project, name=name, description="x", category="Technical",
        impact=impact, probability=prob, level=level, status=status,
    )
    if created is not None:
        Risk.objects.filter(pk=r.pk).update(created_at=created, updated_at=created)
    return r


class ForecastEngineTests(TestCase):
    def setUp(self):
        self.company = Company.objects.create(name="Acme")

    def test_signals_exposure_and_open_counts(self):
        p = _project(self.company)
        _risk(p, level="High", impact="High", prob=80)   # 80*3 = 240
        _risk(p, level="Low", impact="Low", prob=10)      # 10*1 = 10
        _risk(p, status="Closed", prob=99, impact="High")  # excluded (closed)
        s = gather_risk_signals(p)
        self.assertEqual(s["open_risks"], 2)
        self.assertEqual(s["high_open"], 1)
        self.assertEqual(s["current_exposure"], 250)

    def test_velocity_positive_when_opening_faster(self):
        p = _project(self.company)
        # 3 opened in window, 1 closed in window → net +2 over ~4.3 weeks.
        recent = timezone.now() - timedelta(days=5)
        for i in range(3):
            _risk(p, created=recent, name=f"new{i}")
        old = timezone.now() - timedelta(days=5)
        r = _risk(p, status="Closed", name="closed1")
        Risk.objects.filter(pk=r.pk).update(updated_at=old, created_at=timezone.now() - timedelta(days=200))
        s = gather_risk_signals(p)
        self.assertGreater(s["risk_velocity"], 0)

    def test_compute_forecast_rising_on_growth(self):
        signals = {"current_exposure": 200, "risk_velocity": 1.0, "high_open": 1,
                   "open_risks": 4, "closed_total": 2, "schedule_gap": 5}
        fc = compute_forecast(signals)
        self.assertEqual(fc["exposure_trend"], "rising")
        self.assertGreater(fc["forecast_exposure"], 200)
        self.assertEqual(fc["outlook"], "amber")

    def test_compute_forecast_red_on_two_high_risks(self):
        signals = {"current_exposure": 400, "risk_velocity": 2.0, "high_open": 2,
                   "open_risks": 5, "closed_total": 1, "schedule_gap": 20}
        fc = compute_forecast(signals)
        self.assertEqual(fc["outlook"], "red")
        self.assertGreaterEqual(fc["predicted_high_risks"], 2)

    def test_compute_forecast_falling_when_closing(self):
        signals = {"current_exposure": 100, "risk_velocity": -1.0, "high_open": 0,
                   "open_risks": 2, "closed_total": 6, "schedule_gap": 0}
        fc = compute_forecast(signals)
        self.assertEqual(fc["exposure_trend"], "falling")
        self.assertEqual(fc["outlook"], "green")

    def test_confidence_scales_with_sample(self):
        small = compute_forecast({"open_risks": 1, "closed_total": 0,
                                  "current_exposure": 0, "risk_velocity": 0,
                                  "high_open": 0, "schedule_gap": None})
        big = compute_forecast({"open_risks": 6, "closed_total": 4,
                                "current_exposure": 100, "risk_velocity": 0,
                                "high_open": 0, "schedule_gap": None})
        self.assertEqual(small["confidence"], "low")
        self.assertEqual(big["confidence"], "high")

    def test_forecast_deterministic_narrative_populated(self):
        p = _project(self.company)
        _risk(p, level="High", impact="High", prob=70)
        out = forecast(p, use_llm=False)
        self.assertEqual(out["model_used"], "deterministic")
        self.assertTrue(out["narrative"])
        self.assertIsInstance(out["recommendations"], list)
        self.assertTrue(out["recommendations"])
        self.assertEqual(out["original_ai_response"], "")


class ForecastApiTests(TestCase):
    def setUp(self):
        User = get_user_model()
        self.company = Company.objects.create(name="Acme")
        self.user = User.objects.create_user(
            email="pm@acme.com", password="pw12345678",
            username="pm", company=self.company, role="pm",
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.base = "/api/v1/projects/risk-forecasts/"
        self.project = _project(self.company)
        _risk(self.project, level="High", impact="High", prob=80)

    def test_generate_persists_forecast(self):
        res = self.client.post(f"{self.base}generate/",
                               {"project": self.project.id}, format="json")
        self.assertEqual(res.status_code, 201, res.content)
        body = res.json()
        self.assertIn(body["outlook"], ("green", "amber", "red"))
        self.assertIn(body["exposure_trend"], ("rising", "stable", "falling"))
        self.assertTrue(body["narrative"])
        self.assertEqual(body["signals"]["high_open"], 1)
        self.assertEqual(RiskForecast.objects.count(), 1)
        self.assertEqual(RiskForecast.objects.first().created_by, self.user)

    def test_generate_requires_project(self):
        res = self.client.post(f"{self.base}generate/", {}, format="json")
        self.assertEqual(res.status_code, 400)

    def test_history_filtered_by_project(self):
        self.client.post(f"{self.base}generate/", {"project": self.project.id}, format="json")
        res = self.client.get(f"{self.base}?project={self.project.id}")
        self.assertEqual(res.status_code, 200)
        rows = res.json()
        rows = rows.get("results", rows) if isinstance(rows, dict) else rows
        self.assertEqual(len(rows), 1)

    def test_cross_tenant_isolation(self):
        other_co = Company.objects.create(name="Other")
        other_proj = _project(other_co, name="Zeus")
        RiskForecast.objects.create(project=other_proj, as_of=date.today(), outlook="red")
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
