"""Behavioural enforcement tests for the PRINCE2 alignment work (commit d7023ec3).

Proves three doctrine gates are enforced by behaviour, not just stored:
  #1 Manage by Exception  — tolerance breach auto-raises an Exception Report (signal)
  #2 Manage by Stages     — a stage cannot start until the prior stage is completed
                            AND its stage gate is approved (StageViewSet.start)
  #3 Continued business justification — PID cannot be baselined without an
                            approved Business Case + Project Brief (PID.baseline)

Runs on the in-memory SQLite test DB (see core/settings.py) — no Docker needed.
"""
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import Company
from projects.models import Project
from prince2.models import (
    Stage, StageGate, ProjectTolerance, Prince2ExceptionReport,
    BusinessCase, ProjectBrief, ProjectInitiationDocument,
)


class Prince2EnforcementTests(TestCase):
    def setUp(self):
        self.company = Company.objects.create(name="P2Co")
        User = get_user_model()
        self.user = User.objects.create_user(
            email="pm@example.com", password="testpass123",
            username="pm", company=self.company, role="admin",
        )
        self.project = Project.objects.create(
            name="P2 Project", company=self.company,
            methodology="prince2", created_by=self.user,
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    # ---- #1 Manage by Exception (signal) --------------------------------
    def test_tolerance_breach_auto_raises_exception_report(self):
        tol = ProjectTolerance.objects.create(
            project=self.project, tolerance_type="cost", is_exceeded=False,
        )
        self.assertEqual(
            Prince2ExceptionReport.objects.filter(project=self.project).count(), 0,
            "no report should exist before the breach",
        )
        tol.is_exceeded = True
        tol.save()
        reports = Prince2ExceptionReport.objects.filter(project=self.project)
        self.assertEqual(reports.count(), 1, "breach must auto-raise exactly one report")
        self.assertTrue(reports.first().auto_generated)
        self.assertEqual(reports.first().status, "open")
        # idempotent: re-saving the still-breached tolerance must not pile up reports
        tol.current_status = "still over budget"
        tol.save()
        self.assertEqual(
            Prince2ExceptionReport.objects.filter(project=self.project).count(), 1,
            "must not duplicate while a report is still open",
        )

    # ---- #2 Manage by Stages (gate guard) -------------------------------
    def test_stage_start_blocked_until_prior_stage_gate_approved(self):
        s1 = Stage.objects.create(project=self.project, name="Stage 1", order=1, status="active")
        s2 = Stage.objects.create(project=self.project, name="Stage 2", order=2, status="planned")
        url = f"/api/v1/projects/{self.project.id}/prince2/stages/{s2.id}/start/"

        # prior stage not completed -> blocked
        self.assertEqual(self.client.post(url).status_code, 400)

        # completed but no approved gate -> still blocked
        s1.status = "completed"
        s1.save()
        self.assertEqual(self.client.post(url).status_code, 400)

        # approved gate -> allowed
        StageGate.objects.create(stage=s1, outcome="approved")
        resp = self.client.post(url)
        self.assertEqual(resp.status_code, 200, resp.content)
        s2.refresh_from_db()
        self.assertEqual(s2.status, "active")

    def test_first_stage_starts_freely(self):
        s1 = Stage.objects.create(project=self.project, name="Stage 1", order=1, status="planned")
        url = f"/api/v1/projects/{self.project.id}/prince2/stages/{s1.id}/start/"
        self.assertEqual(self.client.post(url).status_code, 200)

    # ---- #3 Continued business justification (PID baseline) -------------
    def test_pid_baseline_requires_approved_bc_and_brief(self):
        pid = ProjectInitiationDocument.objects.create(project=self.project, status="draft")
        url = f"/api/v1/projects/{self.project.id}/prince2/pid/{pid.id}/baseline/"

        # nothing approved -> blocked
        self.assertEqual(self.client.post(url).status_code, 400)

        # approved BC only -> still blocked (brief missing)
        BusinessCase.objects.create(project=self.project, status="approved")
        self.assertEqual(self.client.post(url).status_code, 400)

        # approved BC + brief -> baselined
        ProjectBrief.objects.create(project=self.project, status="approved")
        resp = self.client.post(url)
        self.assertEqual(resp.status_code, 200, resp.content)
        pid.refresh_from_db()
        self.assertEqual(pid.status, "baselined")
