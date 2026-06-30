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
    WorkPackage, Prince2Issue, EndProjectReport, Product,
    Prince2LessonsReport, LessonsLog, Prince2ConfigItem,
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

    # ---- #4 Change theme: Change Authority gate on RFCs ------------------
    def test_rfc_cannot_be_resolved_without_change_authority_approval(self):
        issue = Prince2Issue.objects.create(
            project=self.project, title="Add export feature",
            issue_type="request_for_change", status="open",
        )
        detail = f"/api/v1/projects/{self.project.id}/prince2/issues/{issue.id}/"

        # resolving an un-approved RFC is blocked
        resp = self.client.patch(detail, {"status": "resolved"}, format="json")
        self.assertEqual(resp.status_code, 400, resp.content)
        issue.refresh_from_db()
        self.assertEqual(issue.status, "open")

        # Change Authority approves it
        ca_url = f"{detail}change-authority-decision/"
        resp = self.client.post(ca_url, {"decision": "approved"}, format="json")
        self.assertEqual(resp.status_code, 200, resp.content)
        issue.refresh_from_db()
        self.assertEqual(issue.change_authority_decision, "approved")

        # now it can be resolved
        resp = self.client.patch(detail, {"status": "resolved"}, format="json")
        self.assertEqual(resp.status_code, 200, resp.content)
        issue.refresh_from_db()
        self.assertEqual(issue.status, "resolved")

    def test_problem_concern_resolves_without_change_authority(self):
        # Non-RFC issues are not change-controlled — they resolve freely.
        issue = Prince2Issue.objects.create(
            project=self.project, title="Server slow",
            issue_type="problem_concern", status="open",
        )
        detail = f"/api/v1/projects/{self.project.id}/prince2/issues/{issue.id}/"
        resp = self.client.patch(detail, {"status": "resolved"}, format="json")
        self.assertEqual(resp.status_code, 200, resp.content)

    # ---- #5 Controlled closure (Closing a Project) ----------------------
    def test_closure_blocked_until_products_lessons_and_benefits(self):
        ProjectInitiationDocument.objects.create(project=self.project, status="baselined")
        report = EndProjectReport.objects.create(project=self.project, status="draft")
        Product.objects.create(project=self.project, title="System", status="in_progress")
        url = f"/api/v1/projects/{self.project.id}/prince2/end-project-report/{report.id}/approve/"

        # product not accepted, no lessons report, no benefits -> blocked
        self.assertEqual(self.client.post(url).status_code, 400)

        # accept the product
        Product.objects.filter(project=self.project).update(status="approved")
        self.assertEqual(self.client.post(url).status_code, 400, "still missing lessons + benefits")

        # compile a lessons report
        Prince2LessonsReport.objects.create(project=self.project, title="LR")
        self.assertEqual(self.client.post(url).status_code, 400, "still missing benefits handover")

        # record benefits handover
        report.follow_on_actions = "Hand over benefits realisation to operations."
        report.save()
        resp = self.client.post(url)
        self.assertEqual(resp.status_code, 200, resp.content)
        report.refresh_from_db()
        self.assertEqual(report.status, "approved")

    def test_lessons_report_compiles_from_log(self):
        LessonsLog.objects.create(
            project=self.project, title="Daily standups worked",
            lesson_type="positive", recommendation="Keep them.",
        )
        LessonsLog.objects.create(
            project=self.project, title="Scope crept",
            lesson_type="negative", recommendation="Baseline scope earlier.",
        )
        url = f"/api/v1/projects/{self.project.id}/prince2/lessons/compile_report/"
        resp = self.client.post(url)
        self.assertEqual(resp.status_code, 201, resp.content)
        lr = Prince2LessonsReport.objects.get(project=self.project)
        self.assertEqual(lr.lessons_count, 2)

    # ---- #6 CS->MP: WP authorise gate + accept + depends_on -------------
    def test_wp_authorize_blocked_unless_owning_stage_active(self):
        stage = Stage.objects.create(project=self.project, name="S1", order=1, status="planned")
        wp = WorkPackage.objects.create(project=self.project, stage=stage, title="WP1", status="draft")
        url = f"/api/v1/projects/{self.project.id}/prince2/work-packages/{wp.id}/authorize/"

        # owning stage not active -> blocked
        self.assertEqual(self.client.post(url).status_code, 400)

        # activate the stage -> authorise allowed
        stage.status = "active"
        stage.save()
        resp = self.client.post(url)
        self.assertEqual(resp.status_code, 200, resp.content)
        wp.refresh_from_db()
        self.assertEqual(wp.status, "authorized")

    def test_wp_start_requires_accept_and_completed_dependencies(self):
        stage = Stage.objects.create(project=self.project, name="S1", order=1, status="active")
        dep = WorkPackage.objects.create(project=self.project, stage=stage, title="Dep", status="in_progress")
        wp = WorkPackage.objects.create(project=self.project, stage=stage, title="WP2", status="authorized")
        wp.depends_on.add(dep)
        start_url = f"/api/v1/projects/{self.project.id}/prince2/work-packages/{wp.id}/start/"

        # dependency not completed -> blocked
        self.assertEqual(self.client.post(start_url).status_code, 400)

        # complete the dependency, but TM has not accepted yet -> still blocked
        dep.status = "completed"
        dep.save()
        self.assertEqual(self.client.post(start_url).status_code, 400)

        # Team Manager accepts -> start allowed
        accept_url = f"/api/v1/projects/{self.project.id}/prince2/work-packages/{wp.id}/accept/"
        self.assertEqual(self.client.post(accept_url).status_code, 200)
        resp = self.client.post(start_url)
        self.assertEqual(resp.status_code, 200, resp.content)
        wp.refresh_from_db()
        self.assertEqual(wp.status, "in_progress")

    # ---- #7 Tailoring scales behaviour (Principle 7) --------------------
    def test_simple_tailoring_relaxes_wp_authorize_gate(self):
        ProjectInitiationDocument.objects.create(
            project=self.project, status="baselined", tailoring_profile="simple",
        )
        stage = Stage.objects.create(project=self.project, name="S1", order=1, status="planned")
        wp = WorkPackage.objects.create(project=self.project, stage=stage, title="WP1", status="draft")
        url = f"/api/v1/projects/{self.project.id}/prince2/work-packages/{wp.id}/authorize/"
        # simple profile: authorise allowed even though stage is not active
        resp = self.client.post(url)
        self.assertEqual(resp.status_code, 200, resp.content)

    # ---- #8 Configuration Item Records (Change theme §A.5) --------------
    def test_config_item_auto_numbers_and_persists(self):
        url = f"/api/v1/projects/{self.project.id}/prince2/config-items/"
        resp = self.client.post(url, {"title": "Source code"}, format="json")
        self.assertEqual(resp.status_code, 201, resp.content)
        ci = Prince2ConfigItem.objects.get(project=self.project)
        self.assertEqual(ci.identifier, "CI-001")
