from dataclasses import asdict
from datetime import datetime
from django.shortcuts import get_object_or_404
from .methodology_service import apply_methodology_template

from rest_framework import viewsets
from core.ai_utils import RiskDetector, BudgetForecaster, ProjectHealthScorer
from rest_framework import serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status  # Keep this
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import HasRole
from django.db import models
from django.db.models import Sum, F
from django.utils import timezone
from .models import (
    Project,
    Milestone,
    Task,
    Subtask,
    Expense,
    ProjectActivity,
    ApprovalStage,
    Upload,
    Risk,
    Issue,
    LessonLearned,
    AIMitigation,
    ManualMitigation,
    ProjectTeam,
    ProjectEvent,
    Document,
    TrainingMaterial,
    TimeEntry,
    RiskForecast,
    ProjectMembership,
    PlanEvent,
)
from .forecasting import forecast_for_active_projects, forecast_project_budget
from .serializers import (
    ProjectSerializer,
    ProjectListSerializer,
    MilestoneSerializer,
    TaskSerializer,
    SubtaskSerializer,
    ExpenseSerializer,
    ProjectActivitySerializer,
    ApprovalStageSerializer,
    UploadSerializer,
    RiskSerializer,
    RiskListSerializer,
    AIMitigationSerializer,
    ManualMitigationSerializer,
    ProjectTeamSerializer,
    ProjectEventSerializer,
    DocumentSerializer,
    DocumentListSerializer,
    TrainingMaterialSerializer,
    TrainingMaterialListSerializer,
    TimeEntrySerializer,
    TimeEntrySummarySerializer,
    ProjectTeamWithRateSerializer,
    RiskForecastSerializer,
)

# Operationele rollen die per definitie de hele eigen company beheren.
# Voor deze rollen geldt company-wide toegang i.p.v. strikte project-membership;
# privacy van hourly rates / sub-objecten blijft separaat geregeld
# (ProjectTeamRate filter + per-veld permissions). De membership-scoping uit
# 9707b2ff blijft staan voor contributor / reviewer / guest.
COMPANY_WIDE_ROLES = frozenset({"admin", "pm", "program_manager"})


def accessible_project_ids(user):
    """Return the queryset of Project IDs the user is allowed to see.

    A user sees a project if:
      - they are a superadmin / is_superuser → all projects, OR
      - they have a company-wide role (admin/pm/program_manager) → all projects
        in their own company, OR
      - they are an active ProjectTeam member, OR
      - they are the creator (created_by).

    Cross-company collaboration: a freelancer (contributor/reviewer/guest)
    added to Project X of Company Y can see Project X via the membership path
    even if their own user.company differs.
    """
    from django.db.models import Q
    if not user.is_authenticated:
        return Project.objects.none().values_list('id', flat=True)
    if getattr(user, 'role', None) == 'superadmin' or getattr(user, 'is_superuser', False):
        return Project.objects.all().values_list('id', flat=True)
    if getattr(user, 'role', None) in COMPANY_WIDE_ROLES and getattr(user, 'company_id', None):
        return Project.objects.filter(company_id=user.company_id)\
            .values_list('id', flat=True)
    return Project.objects.filter(
        Q(team_members__user=user, team_members__is_active=True)
        | Q(created_by=user)
    ).values_list('id', flat=True).distinct()


class CompanyScopedQuerysetMixin:
    """Project-membership-scoped mixin (formerly company-scoped).

    P1 visibility fix — was filtering only by user.company, which leaked all
    tasks/milestones/time entries/expenses/etc. to every authenticated user
    in the tenant regardless of project membership. Now each model is filtered
    through the user's accessible projects.
    """

    def get_queryset(self):
        from django.db.models import Q
        base_qs = super().get_queryset()
        user = self.request.user
        if not user.is_authenticated:
            return base_qs.none()

        # SuperAdmin sees everything (tenant-spanning operational role).
        if getattr(user, 'role', None) == 'superadmin' or getattr(user, 'is_superuser', False):
            return base_qs

        accessible_ids = accessible_project_ids(user)

        # Lookup table: model class -> project FK path (str) used for filter.
        # Add a row here when a new project-scoped model gets a viewset.
        project_path_map = {
            Project: 'id__in',
            Milestone: 'project_id__in',
            Task: 'milestone__project_id__in',
            Subtask: 'task__milestone__project_id__in',
            Expense: 'project_id__in',
            ProjectActivity: 'project_id__in',
            ApprovalStage: 'project_id__in',
            Risk: 'project_id__in',
            ManualMitigation: 'risk__project_id__in',
            ProjectEvent: 'project_id__in',
            ProjectMembership: 'project_id__in',
            PlanEvent: 'plan__project_id__in',
        }
        if base_qs.model in project_path_map:
            return base_qs.filter(**{project_path_map[base_qs.model]: accessible_ids})

        # TimeEntry: project FK + always allow user's own rows (so contractors
        # keep seeing their own historical timesheets even if removed from
        # the team).
        if base_qs.model is TimeEntry:
            return base_qs.filter(
                Q(project_id__in=accessible_ids) | Q(user=user)
            ).distinct()

        # Newsletter/MailingList/ExternalSubscriber: tenant-wide is acceptable
        # because these are deliberately broadcast objects (not project-bound
        # workflow data). Keep the original company filter.
        if getattr(user, 'company', None) is None:
            return base_qs.none()
        if (
            hasattr(base_qs.model, "_meta")
            and base_qs.model._meta.label == "newsletters.Newsletter"
        ):
            return base_qs.filter(
                models.Q(project__company=user.company)
                | models.Q(project__isnull=True, created_by__company=user.company)
            )
        if (
            hasattr(base_qs.model, "_meta")
            and base_qs.model._meta.label in (
                "newsletters.MailingList", "newsletters.ExternalSubscriber",
            )
        ):
            return base_qs.filter(company=user.company)
        return base_qs


IsAdminOrPM = HasRole("admin", "pm", "program_manager", "superadmin")


IsAdminOrPMOrContributor = HasRole("admin", "pm", "superadmin", "contributor")


class ProjectViewSet(CompanyScopedQuerysetMixin, viewsets.ModelViewSet):
    queryset = (
        Project.objects.all()
        .select_related("company", "created_by")
        .prefetch_related("team_members")
    )
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "list":
            return ProjectListSerializer
        return ProjectSerializer

    def get_permissions(self):
        if self.action in [
            "list", "retrieve", "summary", "timeline", "team",
            "export_project_plan", "task_kpi",
        ]:
            return [IsAuthenticated()]
        if self.action == "closing_sign_off":
            return [IsAuthenticated(), IsAdminOrPM()]
        return [IsAuthenticated(), IsAdminOrPM()]

    @action(detail=True, methods=["get"], url_path="export/project-plan.docx")
    def export_project_plan(self, request, pk=None):
        """Project Plan DOCX (template selectable via ?template= or per-company default)."""
        from django.http import HttpResponse
        from django.utils.text import slugify
        from .export_templates import pick_template

        project = self.get_object()
        template_name = request.query_params.get("template", "")
        renderer = pick_template(project.company, template_name, kind="project_plan_docx")
        from .permissions import can_view_costs
        docx_bytes = renderer(project, show_costs=can_view_costs(request.user))
        filename = f"{slugify(project.name) or 'project'}-project-plan.docx"
        response = HttpResponse(
            docx_bytes,
            content_type=(
                "application/vnd.openxmlformats-officedocument."
                "wordprocessingml.document"
            ),
        )
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
        return response

    @action(detail=True, methods=["post", "get"], url_path="closing/sign-off")
    def closing_sign_off(self, request, pk=None):
        """
        GET  -> current sign-off (or 404 if none).
        POST -> create or update the sign-off for this project.
                body: {role, note, signature_image (file)}.
                Refuses if project.status != 'completed' unless ?force=1.
        """
        from django.utils import timezone
        from .models import ProjectSignOff

        project = self.get_object()
        if request.method == "GET":
            so = ProjectSignOff.objects.filter(project=project).first()
            if not so:
                return Response({"detail": "No sign-off yet."}, status=404)
            return Response({
                "project_id": project.id,
                "signed_off_by": getattr(so.signed_off_by, "email", None),
                "signed_off_role": so.signed_off_role,
                "signed_off_at": so.signed_off_at,
                "sign_off_note": so.sign_off_note,
                "signature_image_url": (
                    so.signature_image.url if so.signature_image else None
                ),
                "is_valid": so.is_valid,
            })

        # POST: enforce completed state unless explicit force.
        force = request.query_params.get("force") in {"1", "true", "yes"}
        if project.status != "completed" and not force:
            return Response(
                {"detail": (
                    f"Project status is '{project.status}'. Move to 'completed' "
                    "first, or pass ?force=1 to override."
                )},
                status=400,
            )

        defaults = {
            "signed_off_by": request.user,
            "signed_off_role": request.data.get("role", "")[:120],
            "signed_off_at": timezone.now(),
            "sign_off_note": request.data.get("note", ""),
            "is_valid": True,
        }
        sig = request.FILES.get("signature_image")
        if sig:
            defaults["signature_image"] = sig

        so, _created = ProjectSignOff.objects.update_or_create(
            project=project, defaults=defaults,
        )
        return Response({
            "project_id": project.id,
            "signed_off_by": getattr(so.signed_off_by, "email", None),
            "signed_off_role": so.signed_off_role,
            "signed_off_at": so.signed_off_at,
            "sign_off_note": so.sign_off_note,
            "signature_image_url": (
                so.signature_image.url if so.signature_image else None
            ),
            "is_valid": so.is_valid,
        }, status=200 if not _created else 201)

    @action(detail=True, methods=["get"], url_path="governance/decisions")
    def governance_decisions(self, request, pk=None):
        """Feedback loop: governance decisions taken on this project (incl. ones
        escalated up to a programme board / steering committee), with their status,
        outcome and whether they've been applied — so the board's verdict is
        visible back at project level."""
        project = self.get_object()
        from django.db.models import Q
        from governance.models import Decision
        from governance.serializers import DecisionSerializer

        qs = Decision.objects.filter(
            Q(authorized_project=project) | Q(board__project=project)
        ).select_related("board").order_by("-created_at")
        data = []
        for d in qs:
            row = DecisionSerializer(d).data
            row["board_type"] = getattr(d.board, "board_type", None)
            row["board_name"] = getattr(d.board, "name", None)
            row["applied"] = d.applied_at is not None
            data.append(row)
        return Response({"count": len(data), "decisions": data})

    @action(detail=True, methods=["post"], url_path="ai/signal-to-decision")
    def ai_signal_to_decision(self, request, pk=None):
        """Governance integration: escalate an AI compound signal to a board Decision.

        Gets/creates a project-level GovernanceBoard, then raises a pending Decision
        linked to it (visible in the Decisions board, where it can be voted on and
        its outcome applied). Connects the AI layer → governance.
        """
        project = self.get_object()
        from django.db.models import Q
        from governance.models import GovernanceBoard, Decision
        from governance.serializers import DecisionSerializer

        sev = request.data.get("severity")
        program = project.programs.first()

        # Escalation routing: critical -> steering committee (if any) -> programme
        # board; high -> programme board; else -> project board.
        board = None
        tier = "Project board"
        if sev == "critical":
            board = GovernanceBoard.objects.filter(
                board_type__in=["steering_committee", "executive_board"]
            ).filter(
                Q(project__company=project.company)
                | Q(program__company=project.company)
                | Q(portfolio__company=project.company)
            ).first()
            if board:
                tier = "Steering committee"
        if board is None and sev in ("critical", "high") and program:
            board = GovernanceBoard.objects.filter(program=program).first()
            if board is None:
                board = GovernanceBoard.objects.create(
                    program=program, name=f"{program.name} — Programme Board", board_type="program_board"
                )
            tier = "Programme board"
        if board is None:
            board = GovernanceBoard.objects.filter(project=project).first()
            if board is None:
                board = GovernanceBoard.objects.create(
                    project=project, name=f"{project.name} — Project Board", board_type="project_board"
                )
            tier = "Project board"

        sev_map = {"critical": "high", "high": "high", "medium": "medium"}
        title = (request.data.get("title") or "AI compound signal").strip()[:255]
        detail = request.data.get("detail") or ""
        decision = Decision.objects.create(
            board=board,
            program=program if board.program_id else None,
            authorized_project=project,
            title=title,
            description=(detail + f"\n\n[Escalated to governance ({tier}) from an AI compound signal.]").strip(),
            impact=sev_map.get(sev, "medium"),
            status="pending",
        )
        return Response(
            {**DecisionSerializer(decision).data, "escalation_tier": tier},
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"], url_path="ai/signal-to-issue")
    def ai_signal_to_issue(self, request, pk=None):
        """Cross-module automation: turn a compound signal into a tracked RAID issue.

        One click converts an AI-detected compound signal into an Issue in the
        register so it is owned, tracked and surfaced to governance. Severity is
        mapped from the signal's severity.
        """
        project = self.get_object()
        sev_map = {"critical": "Critical", "high": "Major", "medium": "Minor"}
        title = (request.data.get("title") or "AI compound signal").strip()[:255]
        detail = request.data.get("detail") or ""
        severity = sev_map.get(request.data.get("severity"), "Major")

        issue = Issue.objects.create(
            project=project,
            name=title,
            description=(detail + "\n\n[Auto-created from an AI compound signal.]").strip(),
            severity=severity,
            status="Open",
            created_by=request.user,
        )
        from .serializers import IssueSerializer

        return Response(IssueSerializer(issue).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get"], url_path="ai/draft-lessons")
    def ai_draft_lessons(self, request, pk=None):
        """AI auto-draft Lessons Learned from closed issues + resolved risks (draft only)."""
        from .ai_drafts import draft_lessons

        return Response({"drafts": draft_lessons(self.get_object())})

    @action(detail=True, methods=["get"], url_path="ai/draft-meeting")
    def ai_draft_meeting(self, request, pk=None):
        """AI auto-draft a meeting agenda from open actions, issues, signals, milestones."""
        from .ai_drafts import draft_meeting_agenda

        return Response(draft_meeting_agenda(self.get_object()))

    @action(detail=True, methods=["get"], url_path="ai/draft-comms")
    def ai_draft_comms(self, request, pk=None):
        """AI auto-draft a communication plan from milestones + stakeholders (draft only)."""
        from .ai_drafts import draft_comms_plan

        return Response({"drafts": draft_comms_plan(self.get_object())})

    @action(detail=True, methods=["get"], url_path="ai/compound-signals")
    def compound_signals(self, request, pk=None):
        """AI connective-tissue layer: cross-module compound-risk signals.

        Combines schedule × risk × cost × dependency × issue into signals no single
        module surfaces. Cost-derived signals are masked for users without
        cost-visibility (SC-05).
        """
        from .compound_signals import compute_compound_signals
        from .permissions import can_view_costs

        project = self.get_object()
        result = compute_compound_signals(project)

        if not can_view_costs(request.user):
            result["signals"] = [
                s for s in result["signals"] if "cost" not in s.get("areas", [])
            ]
            result["count"] = len(result["signals"])
            if isinstance(result.get("context"), dict):
                result["context"]["budget_pct"] = None
        return Response(result)

    @action(detail=True, methods=["get"], url_path="budget-rollup")
    def budget_rollup(self, request, pk=None):
        """
        Yanmar "one-view" budget rollup:
        Budget × Internal × External × Paid × Outstanding × ETC × Contingency × Variance.

        Internal spend  = SUM(TimeEntry.hours × ProjectTeam.hourly_rate)
        External spend  = SUM(Invoice.amount)             where vendor != null
        Paid            = SUM(Invoice.amount_paid)
        Outstanding     = External - Paid
        ETC + Contingency + Variance come from ProjectBudget.
        """
        from decimal import Decimal
        from django.db.models import F, Sum, Value, DecimalField
        from django.db.models.functions import Coalesce
        from .permissions import can_view_costs

        # Yanmar SC-05 — cost/rate roll-up is finance-roles only.
        if not can_view_costs(request.user):
            return Response(
                {"detail": "You do not have permission to view project costs."},
                status=status.HTTP_403_FORBIDDEN,
            )

        project = self.get_object()
        currency = getattr(project, "currency", "EUR") or "EUR"

        # Budget side
        budget = float(getattr(project, "budget", 0) or 0)
        etc = 0.0
        contingency = 0.0
        try:
            pb = project.project_budget
            etc = float(pb.etc or 0)
            contingency = float(pb.contingency or 0)
        except Exception:
            pass

        # Internal spend — TimeEntry × hourly_rate
        internal = 0.0
        try:
            from .models import TimeEntry
            te_qs = TimeEntry.objects.filter(project=project)
            # ProjectTeam.hourly_rate is per (project, user) -- join.
            rows = te_qs.values("user_id").annotate(hrs=Sum("hours"))
            from .models import ProjectTeam
            rates = {
                pt.user_id: float(pt.hourly_rate or 0)
                for pt in ProjectTeam.objects.filter(project=project)
            }
            for r in rows:
                rate = rates.get(r["user_id"], 0.0)
                internal += float(r["hrs"] or 0) * rate
        except Exception:
            pass

        # External spend — Invoice / Expense
        # External spend = vendor invoices (finance.Invoice, the real AP source)
        # + project Expenses. Paid = invoice paid_amount + paid expenses.
        external = 0.0
        paid = 0.0
        try:
            from finance.models import Invoice as VendorInvoice
            inv_qs = VendorInvoice.objects.filter(project=project)
            external += float(
                inv_qs.aggregate(s=Coalesce(Sum("total_amount"), Value(0, output_field=DecimalField())))["s"] or 0
            )
            paid += float(
                inv_qs.aggregate(s=Coalesce(Sum("paid_amount"), Value(0, output_field=DecimalField())))["s"] or 0
            )
        except Exception:
            pass
        try:
            from .models import Expense
            ex_qs = Expense.objects.filter(project=project)
            external += float(
                ex_qs.aggregate(s=Coalesce(Sum("amount"), Value(0, output_field=DecimalField())))["s"] or 0
            )
            paid += float(
                ex_qs.filter(status="paid").aggregate(
                    s=Coalesce(Sum("amount"), Value(0, output_field=DecimalField()))
                )["s"] or 0
            )
        except Exception:
            pass

        outstanding = max(0.0, external - paid)
        actuals = internal + external
        variance = budget - (actuals + etc)

        return Response({
            "currency": currency,
            "budget": budget,
            "etc": etc,
            "contingency": contingency,
            "internal": internal,
            "external": external,
            "paid": paid,
            "outstanding": outstanding,
            "actuals": actuals,
            "variance": variance,
            "budget_used_pct": (
                int(round((actuals / budget) * 100)) if budget else 0
            ),
            "as_of": __import__("datetime").date.today().isoformat(),
        })

    @action(detail=True, methods=["get"], url_path="task-kpi")
    def task_kpi(self, request, pk=None):
        """
        Yanmar Action Tracker KPI tiles for the project:
        today / tomorrow / this_week / next_week / overdue / total / completed.

        Uses Task.revised_due_date if set, else due_date.
        """
        from datetime import date, timedelta
        from django.db.models import Count, Q, F
        from django.db.models.functions import Coalesce

        project = self.get_object()
        today = date.today()
        # ISO week starts Monday; treat "this_week" as Mon..Sun.
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)
        next_week_start = week_end + timedelta(days=1)
        next_week_end = next_week_start + timedelta(days=6)
        tomorrow = today + timedelta(days=1)

        tasks = (
            project.milestones.values_list("id", flat=True)
        )
        from .models import Task
        qs = Task.objects.filter(milestone__project=project).annotate(
            eff_due=Coalesce("revised_due_date", "due_date"),
        )

        def count_on(d):
            return qs.filter(eff_due=d).count()

        def count_between(a, b):
            return qs.filter(eff_due__gte=a, eff_due__lte=b).count()

        return Response({
            "today":      count_on(today),
            "tomorrow":   count_on(tomorrow),
            "this_week":  count_between(week_start, week_end),
            "next_week":  count_between(next_week_start, next_week_end),
            "overdue":    qs.filter(eff_due__lt=today)
                            .exclude(status="done").count(),
            "total":      qs.count(),
            "completed":  qs.filter(status="done").count(),
            "as_of":      today.isoformat(),
        })

    def get_queryset(self):
        """Filter projects op rol + (membership of cross-company)."""
        from django.db.models import Q

        user = self.request.user

        if not user.is_authenticated:
            return Project.objects.none()

        base = Project.objects.select_related("company", "created_by")\
            .prefetch_related("team_members")

        # SuperAdmin behoudt cross-tenant visibility, maar alleen wanneer
        # ze er expliciet om vragen via ?all_tenants=1 (bijv. vanuit het
        # Admin Portal). Default scope is hun eigen company, anders zien ze
        # in hun gewone dashboard alle tenants door elkaar — wat verwarrend
        # is en lijkt op een data-leak.
        all_tenants = self.request.query_params.get("all_tenants") in ("1", "true", "yes")
        if user.role == "superadmin":
            if all_tenants or not getattr(user, "company_id", None):
                # Either explicitly requested, or a legacy SuperAdmin with no
                # company assigned — fall back to platform-wide visibility
                # rather than dropping into the membership branch which would
                # silently return a near-empty list.
                qs = base.all()
            else:
                qs = base.filter(company_id=user.company_id)
        elif user.role in COMPANY_WIDE_ROLES and getattr(user, "company_id", None):
            # admin/pm/program_manager — alle projecten van eigen company
            qs = base.filter(company_id=user.company_id)
        else:
            # contributor/reviewer/guest of geen company → membership-gebaseerd
            # (ondersteunt cross-company collaboration voor freelancers)
            qs = base.filter(
                Q(team_members__user=user, team_members__is_active=True)
                | Q(created_by=user)
            ).distinct()

        portfolio = self.request.query_params.get('portfolio')
        if portfolio:
            qs = qs.filter(portfolio_id=portfolio)

        program = self.request.query_params.get('program')
        if program:
            qs = qs.filter(program_id=program)

        return qs

    def perform_create(self, serializer):
        user = self.request.user
        if not getattr(user, "company", None):
            raise serializers.ValidationError(
                {"company": "Je account is niet gekoppeld aan een bedrijf. Neem contact op met je beheerder."}
            )
        project = serializer.save(company=user.company, created_by=user)
        # Apply methodology template if set
        if project.methodology:
            apply_methodology_template(project)
        # Sync Program M2M so program.projects.all() stays in sync with project.program FK
        if project.program_id:
            project.program.projects.add(project)

    def perform_update(self, serializer):
        user = self.request.user
        if not getattr(user, "company", None):
            raise serializers.ValidationError(
                {"company": "Je account is niet gekoppeld aan een bedrijf. Neem contact op met je beheerder."}
            )
        project = serializer.save(company=user.company)
        # Keep Program M2M aligned after FK changes
        if project.program_id:
            project.program.projects.add(project)

    def destroy(self, request, *args, **kwargs):
        """Delete a project with proper handling of related records."""
        from django.db import transaction
        from django.db.models import Q

        project = self.get_object()

        try:
            # Log the deletion before actually deleting
            try:
                ProjectActivity.objects.create(
                    project=project,
                    user=request.user,
                    action="deleted",
                    message=f"deleted project '{project.name}'",
                )
            except Exception:
                pass  # Don't fail deletion if logging fails

            # Manually delete related records first to handle database constraint issues
            with transaction.atomic():
                # Delete related records in the correct order to avoid constraint violations

                # Delete from other apps first (they might have different constraint setups)
                try:
                    from execution.models import Stakeholder, Governance, ChangeRequest

                    Stakeholder.objects.filter(project=project).delete()
                    Governance.objects.filter(project=project).delete()
                    ChangeRequest.objects.filter(project=project).delete()
                except Exception as e:
                    pass  # Continue even if some deletions fail

                try:
                    from surveys.models import Survey, ArchivedLesson

                    Survey.objects.filter(project=project).delete()
                    ArchivedLesson.objects.filter(project=project).delete()
                except Exception as e:
                    pass

                try:
                    from deploment.models import DeploymentPlan

                    DeploymentPlan.objects.filter(project=project).delete()
                except Exception as e:
                    pass

                try:
                    from charater.models import Dependency, ProgramCharter

                    Dependency.objects.filter(project=project).delete()
                    ProgramCharter.objects.filter(project=project).delete()
                except Exception as e:
                    pass

                try:
                    from newsletters.models import Newsletter

                    Newsletter.objects.filter(project=project).delete()
                except Exception as e:
                    pass

                try:
                    from communication.models import Meeting

                    Meeting.objects.filter(project=project).delete()
                except Exception as e:
                    pass

                try:
                    from workflow.models import WorkflowDiagram

                    WorkflowDiagram.objects.filter(project=project).delete()
                except Exception as e:
                    pass

                # Delete from projects app
                # Delete in reverse dependency order
                project.training_materials.all().delete()
                project.documents.all().delete()
                project.events.all().delete()
                project.team_members.all().delete()
                project.approval_stages.all().delete()
                project.risks.all().delete()
                project.activities.all().delete()
                project.expenses.all().delete()

                # Delete milestones and their related tasks/subtasks
                for milestone in project.milestones.all():
                    for task in milestone.tasks.all():
                        task.subtasks.all().delete()
                    milestone.tasks.all().delete()
                project.milestones.all().delete()

                # Finally delete the project itself
                project.delete()

            return Response(status=status.HTTP_204_NO_CONTENT)

        except Exception as e:
            # Log the error for debugging
            import logging

            logger = logging.getLogger(__name__)
            logger.error(f"Failed to delete project {project.id}: {str(e)}")

            return Response(
                {"error": f"Failed to delete project: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=True, methods=["post"], url_path="recalculate-progress")
    def recalculate_progress(self, request, pk=None):
        project = self.get_object()
        new_progress = project.update_progress_from_work(save=True)
        return Response(
            {"id": project.id, "progress": new_progress}, status=status.HTTP_200_OK
        )

    @action(detail=True, methods=["get"], url_path="summary")
    def summary(self, request, pk=None):
        """Compact summary for top cards: progress, budget, spent, percent, team, timeline."""
        from django.db.models import Sum, Min, Max
        from django.contrib.auth import get_user_model

        User = get_user_model()
        project = self.get_object()

        # Progress
        progress = project.compute_progress_from_work()

        # Budget and expenses
        budget_total = float(project.budget or 0)
        spent = (
            Expense.objects.filter(project=project)
            .aggregate(total=Sum("amount"))
            .get("total")
            or 0
        )
        spent = float(spent)
        percent_used = (
            float(min(100, (spent / budget_total) * 100)) if budget_total > 0 else 0.0
        )

        # Team derived from project team members, assignees and RACI participants with names
        team_ids = set()

        # First, add project team members
        project_team_ids = project.team_members.filter(is_active=True).values_list(
            "user_id", flat=True
        )
        team_ids.update(project_team_ids)

        # Then add task assignees and RACI participants
        task_qs = (
            Task.objects.filter(milestone__project=project)
            .select_related("assigned_to", "raci_responsible", "raci_accountable")
            .prefetch_related("raci_consulted", "raci_informed")
        )
        for t in task_qs:
            if t.assigned_to_id:
                team_ids.add(t.assigned_to_id)
            if t.raci_responsible_id:
                team_ids.add(t.raci_responsible_id)
            if t.raci_accountable_id:
                team_ids.add(t.raci_accountable_id)
            team_ids.update(list(t.raci_consulted.values_list("id", flat=True)))
            team_ids.update(list(t.raci_informed.values_list("id", flat=True)))

        # Get team member details
        team_members = []
        if team_ids:
            users = User.objects.filter(id__in=team_ids).values(
                "id", "first_name", "last_name", "email", "role"
            )
            for user in users:
                name = user.get("first_name") or user.get("email", "")
                if user.get("last_name"):
                    name = f"{user.get('first_name', '')} {user.get('last_name', '')}".strip()
                team_members.append(
                    {
                        "id": user["id"],
                        "name": name,
                        "email": user["email"],
                        "role": user["role"],
                    }
                )

        team_count = len(team_ids)

        # Timeline from project dates (prioritize project dates over milestone dates)
        start_date = project.start_date
        end_date = project.end_date

        # Fallback to milestone dates if project dates are not set
        if not start_date or not end_date:
            m_agg = Milestone.objects.filter(project=project).aggregate(
                min_start=Min("start_date"), max_end=Max("end_date")
            )
            start_date = start_date or m_agg.get("min_start")
            end_date = end_date or m_agg.get("max_end")

        timeline_days = 0
        percent_elapsed = 0
        is_overdue = False

        if start_date and end_date:
            timeline_days = (
                (end_date - start_date).days if end_date >= start_date else 0
            )
            if timeline_days > 0:
                from datetime import date

                today = date.today()
                if today <= start_date:
                    elapsed_days = 0
                    percent_elapsed = 0
                elif today >= end_date:
                    elapsed_days = timeline_days
                    # Calculate overage percentage
                    overage_days = (today - end_date).days
                    overage_percent = (overage_days / timeline_days) * 100
                    percent_elapsed = 100 + overage_percent
                    is_overdue = True
                else:
                    elapsed_days = (today - start_date).days
                    percent_elapsed = (elapsed_days / timeline_days) * 100

        data = {
            "id": project.id,
            "name": project.name,
            "progress": int(progress),
            "budget_total": budget_total,
            "spent": spent,
            "percent_used": round(percent_used, 2),
            "team_count": team_count,
            "team_members": team_members,
            "timeline": {
                "start_date": start_date,
                "end_date": end_date,
                "days": timeline_days,
                "percent_elapsed": round(percent_elapsed, 1),
                "is_overdue": is_overdue,
            },
        }
        # Yanmar SC-05 — hide budget figures from non-finance roles.
        from .permissions import can_view_costs
        if not can_view_costs(request.user):
            for k in ("budget_total", "spent", "percent_used"):
                data.pop(k, None)
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"], url_path="timeline")
    def timeline(self, request, pk=None):
        """Return timeline data for a project including milestones and tasks.

        Shape tailored for the frontend timeline component:
        {
          id: str,
          title: str,
          dateline: DD/MM/YYYY | "",
          milestones: [
            {
              name: str,
              completed: bool,
              details: {
                id: str,
                subject: str,
                type: "PHASE"|"MILESTONE"|"TASK",
                status: "not-started"|"in-progress"|"completed",
                priority: "Low"|"Normal"|"High",
                startDate: date | null,
                endDate: date | null,
                color: str,
                owner: { name: str, avatar: str, role: str },
              }
            }, ...
          ]
        }
        """
        from datetime import date

        project = self.get_object()

        # Helper mappers
        def map_milestone_status(s: str) -> str:
            return {
                "completed": "completed",
                "in_progress": "in-progress",
                "pending": "not-started",
                "on_hold": "not-started",
            }.get((s or "").lower(), "not-started")

        def map_task_status(s: str) -> str:
            return {
                "done": "completed",
                "in_progress": "in-progress",
                "todo": "not-started",
                "blocked": "not-started",
            }.get((s or "").lower(), "not-started")

        def map_priority(p: str) -> str:
            return {
                "low": "Low",
                "medium": "Normal",
                "high": "High",
                "urgent": "High",
            }.get((p or "").lower(), "Normal")

        def ddmmyyyy(d: date | None) -> str:
            if not d:
                return ""
            return d.strftime("%d/%m/%Y")

        milestones_qs = (
            Milestone.objects.filter(project=project)
            .select_related("project")
            .prefetch_related(
                "tasks",
                "tasks__assigned_to",
                "tasks__raci_responsible",
                "tasks__raci_accountable",
            )
            .order_by("order_index", "id")
        )

        timeline_items = []

        # Default owner fallback from project creator
        default_owner_name = (
            getattr(project.created_by, "first_name", None)
            or getattr(project.created_by, "email", "")
            if project.created_by_id
            else ""
        )
        default_owner_role = (
            getattr(project.created_by, "role", "") if project.created_by_id else ""
        )

        for m in milestones_qs:
            # Milestone marker entry (diamond)
            timeline_items.append(
                {
                    "name": m.name,
                    "completed": (m.status == "completed"),
                    "details": {
                        "id": f"m-{m.id}",
                        "subject": m.name,
                        "type": "MILESTONE",
                        "status": map_milestone_status(m.status),
                        "priority": "Normal",
                        "startDate": m.start_date,
                        "endDate": m.end_date,
                        "color": "#00308F",
                        "owner": {
                            "name": default_owner_name,
                            "avatar": "",
                            "role": default_owner_role,
                        },
                    },
                }
            )

            # Tasks as timeline bars under the milestone
            for t in m.tasks.all().order_by("order_index", "id"):
                owner_user = (
                    t.assigned_to or t.raci_responsible or t.raci_accountable or None
                )
                owner_name = (
                    getattr(owner_user, "first_name", None)
                    or getattr(owner_user, "email", None)
                    or default_owner_name
                    if owner_user
                    else default_owner_name
                )
                owner_role = (
                    getattr(owner_user, "role", default_owner_role)
                    if owner_user
                    else default_owner_role
                )

                timeline_items.append(
                    {
                        "name": t.title,
                        "completed": (t.status == "done" or t.progress == 100),
                        "details": {
                            "id": f"t-{t.id}",
                            "subject": t.title,
                            "type": "TASK",
                            "status": map_task_status(t.status),
                            "priority": map_priority(t.priority),
                            # Use task start_date, fallback to milestone start, then project start
                            "startDate": t.start_date
                            or m.start_date
                            or project.start_date,
                            # Use task due_date, fallback to milestone end
                            "endDate": t.due_date or m.end_date,
                            "color": "#406dc7",
                            "owner": {
                                "name": owner_name,
                                "avatar": "",
                                "role": owner_role,
                            },
                        },
                    }
                )

        data = {
            "id": str(project.id),
            "title": project.name,
            "dateline": ddmmyyyy(project.end_date),
            "milestones": timeline_items,
            "dependencies": [],
        }

        return Response(data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"], url_path="team")
    def get_team(self, request, pk=None):
        """Get project team members"""
        project = self.get_object()
        team_members = project.team_members.filter(is_active=True).select_related(
            "user", "added_by"
        )
        serializer = ProjectTeamSerializer(team_members, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="team/add")
    def add_team_member(self, request, pk=None):
        """Add a team member to the project"""
        project = self.get_object()
        user_id = request.data.get("user_id")

        if not user_id:
            return Response(
                {"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Check if user is in the same company
        from django.contrib.auth import get_user_model

        User = get_user_model()
        try:
            user = User.objects.get(id=user_id, company=request.user.company)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found or not in the same company"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if user is already in the team (active)
        if project.team_members.filter(user=user, is_active=True).exists():
            return Response(
                {"error": "User is already a team member"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if an inactive team member record exists and reactivate it
        try:
            team_member = project.team_members.get(user=user, is_active=False)
            team_member.is_active = True
            team_member.added_by = request.user
            team_member.save()
        except ProjectTeam.DoesNotExist:
            # Create new team member if no inactive record exists
            team_member = ProjectTeam.objects.create(
                project=project, user=user, added_by=request.user
            )

        serializer = ProjectTeamSerializer(team_member)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(
        detail=True,
        methods=["delete"],
        url_path="team/remove/(?P<team_member_id>[^/.]+)",
    )
    def remove_team_member(self, request, pk=None, team_member_id=None):
        """Remove a team member from the project"""
        project = self.get_object()

        try:
            team_member = project.team_members.get(id=team_member_id)
            team_member.is_active = False
            team_member.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProjectTeam.DoesNotExist:
            return Response(
                {"error": "Team member not found"}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=["get"], url_path="company-dashboard")
    def company_dashboard(self, request):
        """Aggregated company-level metrics for the Company Details page."""
        from django.db.models import Sum, F
        from django.db.models.functions import TruncMonth
        from collections import defaultdict
        import calendar

        user = request.user
        if not user.is_authenticated or getattr(user, "company", None) is None:
            return Response(
                {"detail": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED
            )

        projects = Project.objects.filter(company=user.company).select_related(
            "company"
        )

        total_projects = projects.count()
        program_budget = float(sum([p.budget or 0 for p in projects]))

        # Expenses aggregation
        expenses_qs = Expense.objects.filter(project__in=projects)

        paid_total = (
            expenses_qs.filter(status="Paid")
            .aggregate(total=Sum("amount"))
            .get("total")
            or 0
        )
        paid_total = float(paid_total)

        # Include all expenses in committed total (Pending, Approved, Paid)
        committed_total = expenses_qs.aggregate(total=Sum("amount")).get("total") or 0
        committed_total = float(committed_total)

        # Calculate variance: if committed > budget, show overage; if committed < budget, show underage
        # This gives a more meaningful variance that shows actual spending vs budget
        variance_to_budget = committed_total - program_budget

        # Project status distribution (no mapping - use actual statuses)
        phases_counter = defaultdict(int)
        for p in projects:
            phases_counter[p.status] += 1

        # Projects table and budget vs paid
        projects_rows = []
        budget_vs_paid = []
        for p in projects:
            # Use all expenses for total paid (including Pending, Approved, Paid)
            p_paid = (
                expenses_qs.filter(project=p)
                .aggregate(total=Sum("amount"))
                .get("total")
                or 0
            )
            p_paid = float(p_paid)
            budget_val = float(p.budget or 0)
            payment_progress = (
                int(round((p_paid / budget_val) * 100)) if budget_val > 0 else 0
            )

            # Calculate project variance (spent vs budget)
            project_variance = p_paid - budget_val

            projects_rows.append(
                {
                    "id": p.id,
                    "name": p.name,
                    "completion_date": p.end_date,
                    "budget": budget_val,
                    "total_paid": p_paid,
                    "payment_progress": payment_progress,
                    "variance": round(project_variance, 2),
                    "health": {
                        "scope": p.health_scope or "#808080",
                        "time": p.health_time or "#808080",
                        "cost": p.health_cost or "#808080",
                        "cash_flow": p.health_cash_flow or "#808080",
                        "safety": p.health_safety or "#808080",
                        "risk": p.health_risk or "#808080",
                        "quality": p.health_quality or "#808080",
                    },
                }
            )

            budget_vs_paid.append(
                {
                    "name": p.name,
                    "budget": budget_val,
                    "paid": p_paid,
                    "remaining": max(0.0, budget_val - p_paid),
                }
            )

        # Cash flow by month (using all expenses)
        monthly = (
            expenses_qs.annotate(month=TruncMonth("date"))
            .values("month", "project__name")
            .annotate(total=Sum("amount"))
            .order_by("month")
        )

        # Build months labels like Jan 'YY for the observed range
        months_labels = []
        per_project = defaultdict(lambda: defaultdict(float))
        observed_months = []
        for row in monthly:
            m = row["month"]
            if m not in observed_months:
                observed_months.append(m)
            per_project[row["project__name"]][m] = float(row["total"])

        # Format month labels
        for m in observed_months:
            label = f"{calendar.month_abbr[m.month]} '{str(m.year)[-2:]}"
            months_labels.append(label)

        cash_flow = {
            "months": months_labels,
            "projects": list(per_project.keys()),
            "values": {
                name: [per_project[name].get(m, 0.0) for m in observed_months]
                for name in per_project.keys()
            },
        }

        data = {
            "program_metrics": {
                "total_projects": total_projects,
                "program_budget": round(program_budget, 2),
                "committed_to_date": round(committed_total, 2),
                "final_forecast_cost": round(
                    committed_total, 2
                ),  # Use committed as forecast
                "variance_to_budget": round(variance_to_budget, 2),
                "paid_to_date": round(paid_total, 2),
            },
            "phases": phases_counter,
            "projects": projects_rows,
            "budget_vs_paid": budget_vs_paid,
            "cash_flow": cash_flow,
        }
        return Response(data, status=status.HTTP_200_OK)



    @action(detail=True, methods=['get'], url_path='ai-insights')
    def ai_insights(self, request, pk=None):
        """Generate AI-powered insights for this project"""
        from decimal import Decimal
        project = self.get_object()

        # Get metrics. project.budget is a Decimal — multiplying by a float
        # raises TypeError, so coerce to Decimal throughout.
        budget = project.budget or Decimal('0')
        # For now, assume 50% spent if in progress (we can enhance this later)
        spent = budget * Decimal('0.5') if project.status == 'in_progress' else Decimal('0')
        allocated = budget
        
        # Get computed progress
        from projects.serializers import ProjectSerializer
        serializer = ProjectSerializer(project)
        progress = serializer.data.get('progress', 0)
        team_size = project.team_members.filter(is_active=True).count() if hasattr(project, 'team_members') else 0
        
        # AI analysis
        budget_risk = RiskDetector.analyze_budget_risk(spent, allocated, progress)
        timeline_risk = RiskDetector.analyze_timeline_risk(project.start_date, project.end_date, progress)
        budget_forecast = BudgetForecaster.forecast_completion(spent, allocated, progress)
        health_score = ProjectHealthScorer.calculate_health_score(
            budget_risk['severity'],
            timeline_risk['severity'],
            progress,
            team_size
        )
        
        # Recommendations
        recommendations = []
        if budget_risk['risk_level'] == 'high':
            recommendations.append({
                'priority': 'high',
                'category': 'budget',
                'action': 'Review and reduce scope or request additional budget',
                'reason': budget_risk['message']
            })
        if timeline_risk['risk_level'] == 'high':
            recommendations.append({
                'priority': 'high',
                'category': 'timeline',
                'action': 'Accelerate critical path or adjust deadline',
                'reason': timeline_risk['message']
            })
        
        return Response({
            'project_id': project.id,
            'project_name': project.name,
            'analysis': {
                'budget_risk': budget_risk,
                'timeline_risk': timeline_risk,
                'budget_forecast': budget_forecast,
                'health_score': health_score
            },
            'recommendations': recommendations,
            'generated_at': datetime.now().isoformat()
        })

class MilestoneViewSet(CompanyScopedQuerysetMixin, viewsets.ModelViewSet):
    queryset = Milestone.objects.all().select_related("project", "project__company")
    serializer_class = MilestoneSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsAdminOrPM()]

    def get_queryset(self):
        qs = super().get_queryset()
        project_id = self.request.query_params.get("project")
        if project_id:
            qs = qs.filter(project_id=project_id)
        
        program_id = self.request.query_params.get("program")
        if program_id:
            qs = qs.filter(project__program_id=program_id)
        return qs


class TaskViewSet(CompanyScopedQuerysetMixin, viewsets.ModelViewSet):
    queryset = Task.objects.all().select_related(
        "milestone",
        "milestone__project",
        "milestone__project__company",
        "assigned_to",
        "work_package",
        "product",
    )
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated()]
        if self.action in ["create", "update", "partial_update"]:
            return [IsAuthenticated(), IsAdminOrPMOrContributor()]
        return [IsAuthenticated(), IsAdminOrPM()]

    def get_queryset(self):
        qs = super().get_queryset()
        project_id = self.request.query_params.get("project")
        if project_id:
            qs = qs.filter(milestone__project_id=project_id)
        milestone_id = self.request.query_params.get("milestone")
        if milestone_id:
            qs = qs.filter(milestone_id=milestone_id)
        work_package_id = self.request.query_params.get("work_package")
        if work_package_id:
            qs = qs.filter(work_package_id=work_package_id)
        product_id = self.request.query_params.get("product")
        if product_id:
            qs = qs.filter(product_id=product_id)
        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category=category)
        return qs

    def update(self, request, *args, **kwargs):
        """Surface a pending due-date change request via 202 + payload."""
        response = super().update(request, *args, **kwargs)
        instance = self.get_object()
        pending = getattr(instance, "_pending_due_request", None)
        if pending is not None:
            from rest_framework import status as _http
            from .serializers import TaskDueDateChangeRequestSerializer
            return Response(
                {
                    "detail": (
                        "Due-date change exceeds policy "
                        "(one push-back, max 14 days). "
                        "Request routed to Project Owner."
                    ),
                    "change_request": TaskDueDateChangeRequestSerializer(pending).data,
                    "task": response.data,
                },
                status=_http.HTTP_202_ACCEPTED,
            )
        return response

    def partial_update(self, request, *args, **kwargs):
        return self.update(request, *args, partial=True, **kwargs)

    @action(detail=False, methods=["get"], url_path="category-subtotals")
    def category_subtotals(self, request):
        """
        Per-category roll-up across the requesting user's queryset.

        Reproduces the Yanmar Action Tracker (PRJ LEGO) COUNTIFS formulas:
        for each category we return total / completed / in_progress / pending
        and a 0-100 progress percentage so the UI can render the same
        "section header with sub-progress" view as the spreadsheet.

        Requires ``?project=<id>`` (otherwise scoped to all visible tasks).
        """
        from django.db.models import Count, Q
        qs = self.get_queryset()
        rows = (
            qs.values("category")
            .annotate(
                total=Count("id"),
                completed=Count("id", filter=Q(status="done")),
                in_progress=Count("id", filter=Q(status="in_progress")),
                pending=Count("id", filter=Q(status__in=["todo", "blocked"])),
            )
            .order_by("category")
        )
        out = []
        grand_total = 0
        grand_completed = 0
        for r in rows:
            total = r["total"]
            completed = r["completed"]
            grand_total += total
            grand_completed += completed
            out.append({
                "category": r["category"] or "(no category)",
                "total": total,
                "completed": completed,
                "in_progress": r["in_progress"],
                "pending": r["pending"],
                "progress_pct": int(round((completed / total) * 100)) if total else 0,
            })
        return Response({
            "categories": out,
            "grand_total": grand_total,
            "grand_completed": grand_completed,
            "grand_progress_pct": (
                int(round((grand_completed / grand_total) * 100))
                if grand_total else 0
            ),
        })


class TaskDueDateChangeRequestViewSet(CompanyScopedQuerysetMixin, viewsets.ModelViewSet):
    """
    Approval endpoints for Yanmar push-back rule.

      GET    .../task-due-change-requests/                 list (filter ?status, ?project, ?task)
      GET    .../task-due-change-requests/<id>/            retrieve
      POST   .../task-due-change-requests/<id>/approve/    Project Owner approves -> applies new due_date
      POST   .../task-due-change-requests/<id>/reject/     Project Owner rejects

    Note: creation goes through TaskViewSet.update (when a user tries an
    out-of-policy due_date push-back) -- direct POST here is not the
    happy path but is allowed for admin tooling.
    """
    from .models import TaskDueDateChangeRequest
    from .serializers import TaskDueDateChangeRequestSerializer

    queryset = TaskDueDateChangeRequest.objects.select_related(
        "task", "task__milestone", "task__milestone__project",
        "task__milestone__project__company",
        "requested_by", "decided_by",
    )
    serializer_class = TaskDueDateChangeRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ["approve", "reject"]:
            return [IsAuthenticated(), IsAdminOrPM()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        status_f = self.request.query_params.get("status")
        if status_f:
            qs = qs.filter(status=status_f)
        project_id = self.request.query_params.get("project")
        if project_id:
            qs = qs.filter(task__milestone__project_id=project_id)
        task_id = self.request.query_params.get("task")
        if task_id:
            qs = qs.filter(task_id=task_id)
        return qs

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        from django.utils import timezone
        req = self.get_object()
        if req.status != "pending":
            return Response(
                {"detail": f"Request already {req.status}."},
                status=400,
            )
        task = req.task
        task.due_date = req.requested_date
        task.revision_count = (task.revision_count or 0) + 1
        task.save(update_fields=["due_date", "revision_count"])
        req.status = "approved"
        req.decided_by = request.user
        req.decided_at = timezone.now()
        req.decision_note = request.data.get("decision_note", "")
        req.save(update_fields=["status", "decided_by", "decided_at", "decision_note", "updated_at"])
        return Response(self.get_serializer(req).data)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        from django.utils import timezone
        req = self.get_object()
        if req.status != "pending":
            return Response(
                {"detail": f"Request already {req.status}."},
                status=400,
            )
        req.status = "rejected"
        req.decided_by = request.user
        req.decided_at = timezone.now()
        req.decision_note = request.data.get("decision_note", "")
        req.save(update_fields=["status", "decided_by", "decided_at", "decision_note", "updated_at"])
        return Response(self.get_serializer(req).data)


class SubtaskViewSet(CompanyScopedQuerysetMixin, viewsets.ModelViewSet):
    queryset = Subtask.objects.all().select_related(
        "task",
        "task__milestone",
        "task__milestone__project",
        "task__milestone__project__company",
    )
    serializer_class = SubtaskSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated()]
        if self.action in ["create", "update", "partial_update"]:
            return [IsAuthenticated(), IsAdminOrPMOrContributor()]
        return [IsAuthenticated(), IsAdminOrPM()]

    def get_queryset(self):
        qs = super().get_queryset()
        task_id = self.request.query_params.get("task")
        if task_id:
            qs = qs.filter(task_id=task_id)
        return qs

    def perform_create(self, serializer):
        subtask = serializer.save()
        # Update parent task progress
        if subtask.task:
            subtask.task.update_progress_from_subtasks(save=True)

    def perform_update(self, serializer):
        subtask = serializer.save()
        # Update parent task progress
        if subtask.task:
            subtask.task.update_progress_from_subtasks(save=True)

    def perform_destroy(self, instance):
        task = instance.task
        instance.delete()
        # Update parent task progress after deletion
        if task:
            task.update_progress_from_subtasks(save=True)


class ExpenseViewSet(CompanyScopedQuerysetMixin, viewsets.ModelViewSet):
    queryset = Expense.objects.all().select_related(
        "project",
        "project__company",
        "created_by",
    )
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated()]
        if self.action in ["create", "update", "partial_update"]:
            return [IsAuthenticated(), IsAdminOrPMOrContributor()]
        return [IsAuthenticated(), IsAdminOrPM()]

    def get_queryset(self):
        qs = super().get_queryset()
        project_id = self.request.query_params.get("project")
        if project_id:
            qs = qs.filter(project_id=project_id)
        
        program_id = self.request.query_params.get("program")
        if program_id:
            qs = qs.filter(project__program_id=program_id)
        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category=category)
        status = self.request.query_params.get("status")
        if status:
            qs = qs.filter(status=status)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ProjectActivityViewSet(CompanyScopedQuerysetMixin, viewsets.ReadOnlyModelViewSet):
    queryset = (
        ProjectActivity.objects.all()
        .select_related("project", "project__company", "user")
        .order_by("-created_at")
    )
    serializer_class = ProjectActivitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        project_id = self.request.query_params.get("project")
        if project_id:
            qs = qs.filter(project_id=project_id)
        
        program_id = self.request.query_params.get("program")
        if program_id:
            qs = qs.filter(project__program_id=program_id)
        return qs[:5]


class ProjectFinancialsViewSet(CompanyScopedQuerysetMixin, viewsets.ViewSet):
    permission_classes = [IsAuthenticated, IsAdminOrPM]

    def list(self, request):
        return Response(
            {"detail": "Specify a project id."}, status=status.HTTP_400_BAD_REQUEST
        )

    def retrieve(self, request, pk=None):
        # pk is project id
        from django.db.models import Sum
        from django.db.models.functions import TruncMonth
        import calendar

        try:
            project = Project.objects.get(id=pk, company=request.user.company)
        except Project.DoesNotExist:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        # Monthly totals for the project's expenses
        expenses_qs = Expense.objects.filter(project=project)
        monthly = (
            expenses_qs.annotate(month=TruncMonth("date"))
            .values("month")
            .annotate(total=Sum("amount"))
            .order_by("month")
        )

        months = []
        totals = []
        for row in monthly:
            m = row["month"]
            label = f"{calendar.month_abbr[m.month]} {m.year}"
            months.append(label)
            totals.append(float(row["total"]))

        # Budget vs spent summary
        budget_total = float(project.budget or 0)
        spent = float(expenses_qs.aggregate(total=Sum("amount")).get("total") or 0)
        percent_used = (
            float(min(100, (spent / budget_total) * 100)) if budget_total > 0 else 0.0
        )

        data = {
            "project": {"id": project.id, "name": project.name},
            "budget_total": budget_total,
            "spent_total": spent,
            "percent_used": round(percent_used, 2),
            "timeseries": {"labels": months, "values": totals},
        }
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"], url_path="forecast")
    def forecast(self, request, pk=None):
        """Return a budget forecast for a single project."""
        try:
            project = Project.objects.get(id=pk, company=request.user.company)
        except Project.DoesNotExist:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            window_months = int(request.query_params.get("window_months", 4))
        except (TypeError, ValueError):
            return Response(
                {"detail": "window_months must be an integer"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            horizon_months = int(request.query_params.get("horizon_months", 3))
        except (TypeError, ValueError):
            return Response(
                {"detail": "horizon_months must be an integer"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if window_months < 1 or horizon_months < 1:
            return Response(
                {"detail": "window_months and horizon_months must be >= 1"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        result = forecast_project_budget(
            project, window_months=window_months, horizon_months=horizon_months
        )
        return Response(asdict(result), status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="forecasts")
    def forecasts(self, request):
        """Return forecasts for all active projects within the user's company."""
        try:
            window_months = int(request.query_params.get("window_months", 4))
        except (TypeError, ValueError):
            return Response(
                {"detail": "window_months must be an integer"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            horizon_months = int(request.query_params.get("horizon_months", 3))
        except (TypeError, ValueError):
            return Response(
                {"detail": "horizon_months must be an integer"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if window_months < 1 or horizon_months < 1:
            return Response(
                {"detail": "window_months and horizon_months must be >= 1"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        forecasts = forecast_for_active_projects(
            window_months=window_months,
            horizon_months=horizon_months,
            company=request.user.company,
        )
        payload = [asdict(result) for result in forecasts]
        return Response(
            {"count": len(payload), "results": payload}, status=status.HTTP_200_OK
        )


class ApprovalStageViewSet(CompanyScopedQuerysetMixin, viewsets.ModelViewSet):
    queryset = ApprovalStage.objects.all().select_related(
        "project", "project__company", "created_by"
    )
    serializer_class = ApprovalStageSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated()]
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAuthenticated(), HasRole("admin", "pm")()]
        return super().get_permissions()

    def get_queryset(self):
        qs = super().get_queryset()
        project_id = self.request.query_params.get("project")
        if project_id:
            qs = qs.filter(project_id=project_id)
        
        program_id = self.request.query_params.get("program")
        if program_id:
            qs = qs.filter(project__program_id=program_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=["post"], url_path="default")
    def create_default(self, request):
        """Create a default 5-stage workflow for a project if none exist."""
        from django.db import transaction

        project_id = request.query_params.get("project") or request.data.get("project")
        if not project_id:
            return Response(
                {"detail": "project is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            project = Project.objects.get(id=project_id, company=request.user.company)
        except Project.DoesNotExist:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        if not HasRole("admin", "pm")().has_permission(request, self):
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        if ApprovalStage.objects.filter(project=project).exists():
            return Response(
                {"detail": "Stages already exist"}, status=status.HTTP_400_BAD_REQUEST
            )

        defaults = [
            (
                "STAGE 01",
                "Initial Review",
                "Project proposal is reviewed by department head",
            ),
            (
                "STAGE 02",
                "Technical Assessment",
                "Technical team evaluates feasibility and resource requirements",
            ),
            (
                "STAGE 03",
                "Budget Review",
                "Finance team reviews budget allocation and cost estimates",
            ),
            (
                "STAGE 04",
                "Executive Approval",
                "Executive committee reviews and provides final approval",
            ),
            (
                "STAGE 05",
                "Implementation",
                "Project is approved for implementation and resource allocation",
            ),
        ]

        with transaction.atomic():
            created = []
            for idx, (name, value, desc) in enumerate(defaults):
                created.append(
                    ApprovalStage.objects.create(
                        project=project,
                        name=name,
                        value=value,
                        description=desc,
                        order_index=idx,
                        created_by=request.user,
                    )
                )

        return Response(
            ApprovalStageSerializer(created, many=True).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"], url_path="approve")
    def approve(self, request, pk=None):
        ApproverOnly = HasRole("reviewer", "admin", "pm")
        if not ApproverOnly().has_permission(request, self):
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        stage = self.get_object()
        status_value = request.data.get("status")
        if status_value not in dict(ApprovalStage.STATUS_CHOICES).keys():
            return Response(
                {"detail": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST
            )

        stage.status = status_value
        # Set approver from authenticated user
        user = request.user
        stage.approver_name = (
            getattr(user, "first_name", None)
            or getattr(user, "email", None)
            or stage.approver_name
        )
        stage.approver_role = getattr(user, "role", stage.approver_role)
        stage.approver_comments = request.data.get("approver_comments", "")
        stage.reviewed_at = request.data.get("reviewed_at", stage.reviewed_at)
        # Optional evidence link
        evidence_id = request.data.get("evidence") or request.data.get("upload_id")
        if evidence_id:
            try:
                upload = Upload.objects.get(
                    id=evidence_id, company=request.user.company
                )
                stage.evidence = upload
            except Upload.DoesNotExist:
                return Response(
                    {"detail": "Invalid evidence"}, status=status.HTTP_400_BAD_REQUEST
                )
        stage.save()

        try:
            ProjectActivity.objects.create(
                project=stage.project,
                user=request.user,
                action="updated",
                message=f"Approval stage '{stage.name}' set to {stage.status}",
                target=stage,
            )
        except Exception:
            pass

        return Response(ApprovalStageSerializer(stage).data, status=status.HTTP_200_OK)


class UploadViewSet(CompanyScopedQuerysetMixin, viewsets.ModelViewSet):
    queryset = Upload.objects.all().select_related("uploaded_by", "company")
    serializer_class = UploadSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        return qs.filter(company=self.request.user.company)

    def create(self, request, *args, **kwargs):
        file_obj = request.FILES.get("file")
        if not file_obj:
            return Response(
                {"detail": "file is required"}, status=status.HTTP_400_BAD_REQUEST
            )
        upload = Upload.objects.create(
            file=file_obj, uploaded_by=request.user, company=request.user.company
        )
        return Response(UploadSerializer(upload).data, status=status.HTTP_201_CREATED)


# Risk Management Views
class RiskViewSet(CompanyScopedQuerysetMixin, viewsets.ModelViewSet):
    """Risk management for projects."""

    queryset = Risk.objects.all().select_related(
        "project", "owner", "created_by", "ai_mitigation", "manual_mitigation"
    )
    serializer_class = RiskSerializer
    permission_classes = [IsAuthenticated, IsAdminOrPM]

    def get_queryset(self):
        # Always scope to user's company and filter by optional project query param
        qs = (
            Risk.objects.all()
            .select_related(
                "project", "owner", "created_by", "ai_mitigation", "manual_mitigation"
            )
            .filter(project__company=self.request.user.company)
        )
        project_id = self.request.query_params.get("project") or self.kwargs.get(
            "project_id"
        )
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs

    def get_serializer_class(self):
        if self.action == "list":
            return RiskListSerializer
        return RiskSerializer

    def perform_create(self, serializer):
        project_id = self.kwargs.get("project_id")
        if project_id:
            from .models import Project

            try:
                project = Project.objects.get(
                    id=project_id, company=self.request.user.company
                )
                serializer.save(project=project)
            except Project.DoesNotExist:
                raise serializers.ValidationError("Project not found or access denied")
        else:
            serializer.save()

    def create(self, request, *args, **kwargs):
        """Create a new risk with AI-generated mitigation."""
        response = super().create(request, *args, **kwargs)

        if response.status_code == 201:
            risk = Risk.objects.get(id=response.data["id"])

            # Generate AI mitigation using GPT
            from .ai_risk_mitigation import generate_ai_mitigation

            try:
                # Prepare risk data for AI generation
                risk_data = {
                    "name": risk.name,
                    "description": risk.description,
                    "category": risk.category,
                    "impact": risk.impact,
                    "probability": risk.probability,
                    "level": risk.level,
                    "project_name": risk.project.name if risk.project else None,
                    "project_description": (
                        risk.project.description if risk.project else None
                    ),
                }

                # Generate AI mitigation — uses company's BYO key if configured.
                ai_plan = generate_ai_mitigation(
                    risk_data,
                    company=getattr(risk.project, "company", None) if risk.project else None,
                )

                # Create AI mitigation with generated data
                AIMitigation.objects.create(
                    risk=risk,
                    strategy=ai_plan["strategy"],
                    actions=ai_plan["actions"],
                    timeline=ai_plan["timeline"],
                    cost=ai_plan["cost"],
                    effectiveness=ai_plan["effectiveness"],
                )
            except Exception as e:
                # Fallback to placeholder if AI generation fails
                import logging

                logger = logging.getLogger(__name__)
                logger.error(f"Failed to generate AI mitigation: {e}")

                AIMitigation.objects.create(
                    risk=risk,
                    strategy="AI analysis pending...",
                    actions=[
                        "Analyzing risk factors...",
                        "Generating mitigation strategies...",
                    ],
                    timeline="TBD",
                    cost="Medium",
                    effectiveness="TBD",
                )

            # Create empty manual mitigation
            manual = ManualMitigation.objects.create(risk=risk, created_by=request.user)

            # Log activity
            try:
                ProjectActivity.objects.create(
                    project=risk.project,
                    user=request.user,
                    action="created",
                    message=f"Risk '{risk.name}' created",
                    target=risk,
                )
            except Exception:
                pass

        # Re-serialize to include nested mitigations
        if response.status_code == 201:
            data = RiskSerializer(risk, context={"request": request}).data
            return Response(data, status=status.HTTP_201_CREATED)
        return response

    def destroy(self, request, *args, **kwargs):
        """Delete a risk and log activity."""
        risk = self.get_object()
        risk_name = risk.name
        project = risk.project

        # Log activity before deletion
        try:
            ProjectActivity.objects.create(
                project=project,
                user=request.user,
                action="deleted",
                message=f"Risk '{risk_name}' deleted",
            )
        except Exception:
            pass

        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=["post"], url_path="regenerate-ai-mitigation")
    def regenerate_ai_mitigation(self, request, pk=None):
        """Regenerate AI mitigation plan for a risk."""
        from .ai_risk_mitigation import generate_ai_mitigation
        import logging

        logger = logging.getLogger(__name__)
        risk = self.get_object()

        try:
            # Prepare risk data for AI generation
            risk_data = {
                "name": risk.name,
                "description": risk.description,
                "category": risk.category,
                "impact": risk.impact,
                "probability": risk.probability,
                "level": risk.level,
                "project_name": risk.project.name if risk.project else None,
                "project_description": (
                    risk.project.description if risk.project else None
                ),
            }

            # Generate AI mitigation — uses company's BYO key if configured.
            ai_plan = generate_ai_mitigation(
                risk_data,
                company=getattr(risk.project, "company", None) if risk.project else None,
            )

            # Update or create AI mitigation
            ai_mitigation, created = AIMitigation.objects.update_or_create(
                risk=risk,
                defaults={
                    "strategy": ai_plan["strategy"],
                    "actions": ai_plan["actions"],
                    "timeline": ai_plan["timeline"],
                    "cost": ai_plan["cost"],
                    "effectiveness": ai_plan["effectiveness"],
                },
            )

            # Log activity
            try:
                ProjectActivity.objects.create(
                    project=risk.project,
                    user=request.user,
                    action="updated",
                    message=f"AI mitigation regenerated for risk '{risk.name}'",
                    target=risk,
                )
            except Exception:
                pass

            # Return updated risk with new AI mitigation
            serializer = RiskSerializer(risk, context={"request": request})
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Failed to regenerate AI mitigation: {e}", exc_info=True)
            return Response(
                {"error": f"Failed to regenerate AI mitigation: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class IssueViewSet(CompanyScopedQuerysetMixin, viewsets.ModelViewSet):
    """Methodology-agnostic RAID Issue register.

    Generic counterpart to RiskViewSet so every methodology (Scrum, Kanban,
    Waterfall, Agile, LSS, Hybrid) shares one Issue register, rather than the
    PRINCE2-namespaced one. Company-scoped + optional ?project= filter.
    """

    from .serializers import IssueSerializer as _IssueSerializer

    serializer_class = _IssueSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = (
            Issue.objects.all()
            .select_related("project", "owner", "created_by", "related_risk")
            .filter(project__company=self.request.user.company)
        )
        project_id = self.request.query_params.get("project") or self.kwargs.get(
            "project_id"
        )
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs

    def perform_create(self, serializer):
        kwargs = {"created_by": self.request.user}
        project_id = self.kwargs.get("project_id")
        if project_id:
            try:
                kwargs["project"] = Project.objects.get(
                    id=project_id, company=self.request.user.company
                )
            except Project.DoesNotExist:
                raise serializers.ValidationError("Project not found or access denied")
        serializer.save(**kwargs)


class LessonLearnedViewSet(CompanyScopedQuerysetMixin, viewsets.ModelViewSet):
    """Methodology-agnostic Lessons Learned register (PMBOK/PRINCE2/MSP).

    Generic counterpart to the PRINCE2-namespaced lessons log, so every
    methodology shares one register. Company-scoped + optional ?project= filter.
    """

    from .serializers import LessonLearnedSerializer as _LessonLearnedSerializer

    serializer_class = _LessonLearnedSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = (
            LessonLearned.objects.all()
            .select_related("project", "captured_by")
            .filter(project__company=self.request.user.company)
        )
        project_id = self.request.query_params.get("project") or self.kwargs.get(
            "project_id"
        )
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs

    def perform_create(self, serializer):
        kwargs = {"captured_by": self.request.user}
        project_id = self.kwargs.get("project_id")
        if project_id:
            try:
                kwargs["project"] = Project.objects.get(
                    id=project_id, company=self.request.user.company
                )
            except Project.DoesNotExist:
                raise serializers.ValidationError("Project not found or access denied")
        serializer.save(**kwargs)


class RiskForecastViewSet(viewsets.ReadOnlyModelViewSet):
    """AI Risk Copilot — predictive risk forecasts (IL-1).

    Read-only history + a `generate` action that runs the forecast engine for a
    project (model-driven exposure trend + risk velocity + schedule slip) and
    persists a snapshot. Company-scoped like the other project surfaces.
    """

    serializer_class = RiskForecastSerializer
    permission_classes = [IsAuthenticated, IsAdminOrPM]

    def _accessible_projects(self):
        user = self.request.user
        qs = Project.objects.all()
        if getattr(user, "role", None) == "superadmin" or getattr(user, "is_superuser", False):
            return qs
        return qs.filter(id__in=accessible_project_ids(user))

    def get_queryset(self):
        qs = RiskForecast.objects.select_related("project", "created_by").filter(
            project__in=self._accessible_projects()
        )
        project_id = self.request.query_params.get("project")
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs

    @action(detail=False, methods=["post"])
    def generate(self, request):
        """Body: {project: <id>}. Computes the forecast and stores a snapshot."""
        from .risk_forecast import forecast as run_forecast

        project_id = request.data.get("project")
        if not project_id:
            return Response({"detail": "project is required."},
                            status=status.HTTP_400_BAD_REQUEST)
        project = get_object_or_404(self._accessible_projects(), pk=project_id)
        result = run_forecast(project)
        snapshot = RiskForecast.objects.create(
            project=project,
            as_of=result["as_of"],
            signals=result["signals"],
            current_exposure=result["current_exposure"],
            forecast_exposure=result["forecast_exposure"],
            exposure_trend=result["exposure_trend"],
            risk_velocity=result["risk_velocity"],
            predicted_high_risks=result["predicted_high_risks"],
            outlook=result["outlook"],
            confidence=result["confidence"],
            drivers=result["drivers"],
            recommendations=result["recommendations"],
            narrative=result["narrative"],
            model_used=result["model_used"],
            original_ai_response=result["original_ai_response"],
            created_by=request.user,
        )
        return Response(self.get_serializer(snapshot).data,
                        status=status.HTTP_201_CREATED)


class ManualMitigationViewSet(CompanyScopedQuerysetMixin, viewsets.ModelViewSet):
    """Manual mitigation plan management."""

    queryset = ManualMitigation.objects.all().select_related(
        "risk__project", "created_by"
    )
    serializer_class = ManualMitigationSerializer
    permission_classes = [IsAuthenticated, IsAdminOrPMOrContributor]

    def get_queryset(self):
        qs = (
            ManualMitigation.objects.all()
            .select_related("risk__project", "created_by")
            .filter(risk__project__company=self.request.user.company)
        )
        project_id = self.request.query_params.get("project") or self.kwargs.get(
            "project_id"
        )
        if project_id:
            qs = qs.filter(risk__project_id=project_id)
        return qs

    def perform_create(self, serializer):
        risk_id = self.kwargs.get("risk_id")
        if risk_id:
            try:
                risk = Risk.objects.get(
                    id=risk_id, project__company=self.request.user.company
                )
                serializer.save(risk=risk)
            except Risk.DoesNotExist:
                raise serializers.ValidationError("Risk not found or access denied")
        else:
            serializer.save()

    def update(self, request, *args, **kwargs):
        """Update manual mitigation and log activity."""
        response = super().update(request, *args, **kwargs)

        if response.status_code == 200:
            mitigation = self.get_object()
            risk = mitigation.risk

            # Log activity
            try:
                ProjectActivity.objects.create(
                    project=risk.project,
                    user=request.user,
                    action="updated",
                    message=f"Manual mitigation plan for risk '{risk.name}' updated",
                    target=risk,
                )
            except Exception:
                pass

        return response


class ProjectEventViewSet(viewsets.ModelViewSet):
    """ViewSet for managing project calendar events."""

    queryset = ProjectEvent.objects.all().select_related(
        "project", "project__company", "created_by"
    )
    serializer_class = ProjectEventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter events by user's company and optionally by project."""
        user = self.request.user
        if not user.is_authenticated:
            return ProjectEvent.objects.none()
        if not getattr(user, "company", None):
            return ProjectEvent.objects.none()

        qs = self.queryset.filter(project__company=user.company)

        # Filter by project if provided
        project_id = self.request.query_params.get("project")
        if project_id:
            qs = qs.filter(project_id=project_id)

        program_id = self.request.query_params.get("program")
        if program_id:
            qs = qs.filter(project__program_id=program_id)    

        # Filter by date range if provided
        start_date = self.request.query_params.get("start_date")
        end_date = self.request.query_params.get("end_date")

        if start_date and end_date:
            # Events that overlap with the requested date range
            qs = qs.filter(
                start_date__lte=end_date,
                end_date__gte=start_date,
            )
        elif start_date:
            qs = qs.filter(end_date__gte=start_date)
        elif end_date:
            qs = qs.filter(start_date__lte=end_date)

        return qs

    def perform_create(self, serializer):
        """Create event and log activity."""
        event = serializer.save(created_by=self.request.user)

        # Log activity
        try:
            ProjectActivity.objects.create(
                project=event.project,
                user=self.request.user,
                action="created",
                message=f"Created calendar event '{event.title}'",
            )
        except Exception:
            pass

    def perform_update(self, serializer):
        """Update event and log activity."""
        event = serializer.save()

        # Log activity
        try:
            ProjectActivity.objects.create(
                project=event.project,
                user=self.request.user,
                action="updated",
                message=f"Updated calendar event '{event.title}'",
            )
        except Exception:
            pass

    def perform_destroy(self, instance):
        """Delete event and log activity."""
        project = instance.project
        event_title = instance.title

        instance.delete()

        # Log activity
        try:
            ProjectActivity.objects.create(
                project=project,
                user=self.request.user,
                action="deleted",
                message=f"Deleted calendar event '{event_title}'",
            )
        except Exception:
            pass


class TimeEntryViewSet(CompanyScopedQuerysetMixin, viewsets.ModelViewSet):
    """ViewSet for managing time entries"""
    
    queryset = TimeEntry.objects.all().select_related(
        "project",
        "project__company",
        "user",
        "task",
        "milestone",
        "approved_by",
    )
    serializer_class = TimeEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ["list", "retrieve", "summary", "my_entries"]:
            return [IsAuthenticated()]
        if self.action in ["create", "update", "partial_update"]:
            return [IsAuthenticated()]
        if self.action in ["approve", "reject"]:
            return [IsAuthenticated(), IsAdminOrPM()]
        return [IsAuthenticated(), IsAdminOrPM()]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        
        # Filter by project
        project_id = self.request.query_params.get("project")
        if project_id:
            qs = qs.filter(project_id=project_id)
        
        program_id = self.request.query_params.get("program")
        if program_id:
            qs = qs.filter(project__program_id=program_id)
        
        # Filter by user (only admins/PMs can view other users' entries)
        user_id = self.request.query_params.get("user")
        if user_id:
            if user.role in ["admin", "pm"]:
                qs = qs.filter(user_id=user_id)
            else:
                qs = qs.filter(user=user)
        
        # Filter by status
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        
        # Filter by date range
        start_date = self.request.query_params.get("start_date")
        if start_date:
            qs = qs.filter(date__gte=start_date)
        
        end_date = self.request.query_params.get("end_date")
        if end_date:
            qs = qs.filter(date__lte=end_date)
        
        # Filter by billable
        billable = self.request.query_params.get("billable")
        if billable is not None:
            qs = qs.filter(billable=billable.lower() == "true")
        
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        
        # Log activity
        try:
            entry = serializer.instance
            ProjectActivity.objects.create(
                project=entry.project,
                user=self.request.user,
                action="created",
                message=f"Logged {entry.hours} hours on {entry.date}",
            )
        except Exception:
            pass

    def perform_update(self, serializer):
        serializer.save()
        
        # Log activity
        try:
            entry = serializer.instance
            ProjectActivity.objects.create(
                project=entry.project,
                user=self.request.user,
                action="updated",
                message=f"Updated time entry for {entry.date}",
            )
        except Exception:
            pass

    @action(detail=False, methods=["get"])
    def my_entries(self, request):
        """Get current user's time entries"""
        qs = self.get_queryset().filter(user=request.user)
        
        # Apply date filters if provided
        start_date = request.query_params.get("start_date")
        if start_date:
            qs = qs.filter(date__gte=start_date)
        
        end_date = request.query_params.get("end_date")
        if end_date:
            qs = qs.filter(date__lte=end_date)
        
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def summary(self, request):
        """Get summary of time entries for a project"""
        from .permissions import can_view_costs
        project_id = request.query_params.get("project")
        if not project_id:
            return Response(
                {"detail": "Project ID is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        # Yanmar SC-05 — labour-cost summary is finance-roles only.
        if not can_view_costs(request.user):
            return Response(
                {"detail": "You do not have permission to view labour costs."},
                status=status.HTTP_403_FORBIDDEN,
            )

        qs = self.get_queryset().filter(project_id=project_id)
        
        # Apply date filters
        start_date = request.query_params.get("start_date")
        if start_date:
            qs = qs.filter(date__gte=start_date)
        
        end_date = request.query_params.get("end_date")
        if end_date:
            qs = qs.filter(date__lte=end_date)
        
        # Calculate totals
        total_hours = qs.aggregate(total=Sum("hours"))["total"] or 0
        total_labor_cost = qs.aggregate(
            total=Sum(F("hours") * F("hourly_rate_snapshot"))
        )["total"] or 0
        
        billable_qs = qs.filter(billable=True)
        billable_hours = billable_qs.aggregate(total=Sum("hours"))["total"] or 0
        billable_cost = billable_qs.aggregate(
            total=Sum(F("hours") * F("hourly_rate_snapshot"))
        )["total"] or 0
        
        # Group by user
        by_user = []
        user_groups = qs.values("user__id", "user__email", "user__first_name", "user__last_name")
        for user_data in user_groups.distinct():
            user_entries = qs.filter(user_id=user_data["user__id"])
            user_hours = user_entries.aggregate(total=Sum("hours"))["total"] or 0
            user_cost = user_entries.aggregate(
                total=Sum(F("hours") * F("hourly_rate_snapshot"))
            )["total"] or 0
            
            name = f"{user_data.get('user__first_name', '')} {user_data.get('user__last_name', '')}".strip()
            if not name:
                name = user_data.get("user__email", "Unknown")
            
            by_user.append({
                "user_id": user_data["user__id"],
                "user_name": name,
                "user_email": user_data.get("user__email"),
                "hours": float(user_hours),
                "cost": float(user_cost),
            })
        
        # Group by status
        by_status = {}
        for status_choice in TimeEntry.STATUS_CHOICES:
            status_key = status_choice[0]
            count = qs.filter(status=status_key).count()
            by_status[status_key] = count
        
        summary_data = {
            "total_hours": float(total_hours),
            "total_labor_cost": float(total_labor_cost),
            "billable_hours": float(billable_hours),
            "billable_cost": float(billable_cost),
            "entries_count": qs.count(),
            "by_user": by_user,
            "by_status": by_status,
        }
        
        return Response(summary_data)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        """Approve a time entry"""
        entry = self.get_object()
        
        if entry.status not in ["draft", "submitted"]:
            return Response(
                {"detail": "Only draft or submitted entries can be approved"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        entry.status = "approved"
        entry.approved_by = request.user
        entry.approved_at = timezone.now()
        entry.save()
        
        # Log activity
        try:
            ProjectActivity.objects.create(
                project=entry.project,
                user=request.user,
                action="status_changed",
                message=f"Approved time entry for {entry.user.get_full_name() or entry.user.email}",
            )
        except Exception:
            pass
        
        serializer = self.get_serializer(entry)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        """Reject a time entry"""
        entry = self.get_object()
        
        if entry.status not in ["draft", "submitted"]:
            return Response(
                {"detail": "Only draft or submitted entries can be rejected"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        entry.status = "rejected"
        entry.save()
        
        # Log activity
        try:
            ProjectActivity.objects.create(
                project=entry.project,
                user=request.user,
                action="status_changed",
                message=f"Rejected time entry for {entry.user.get_full_name() or entry.user.email}",
            )
        except Exception:
            pass
        
        serializer = self.get_serializer(entry)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def submit(self, request, pk=None):
        """Submit a time entry for approval"""
        entry = self.get_object()
        
        if entry.user != request.user:
            return Response(
                {"detail": "You can only submit your own time entries"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if entry.status != "draft":
            return Response(
                {"detail": "Only draft entries can be submitted"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        entry.status = "submitted"
        entry.save()
        
        serializer = self.get_serializer(entry)
        return Response(serializer.data)


class ProjectTeamRateViewSet(viewsets.ModelViewSet):
    """ViewSet for managing team member hourly rates.

    P1 fix — was company-scoped which exposed every employee's hourly rate
    to every admin/PM in the tenant. Now:
    - superadmin: see all
    - admin: see all rates in their company
    - pm / project_manager: see rates only for projects they are a member of
    - others: see only their own rate row
    """

    queryset = ProjectTeam.objects.all().select_related(
        "project", "project__company", "user", "added_by",
    )
    serializer_class = ProjectTeamWithRateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return ProjectTeam.objects.none()

        role = getattr(user, 'role', None)
        if role == 'superadmin' or getattr(user, 'is_superuser', False):
            qs = ProjectTeam.objects.all()
        elif role == 'admin' and getattr(user, 'company', None):
            qs = ProjectTeam.objects.filter(project__company=user.company)
        elif role in ('pm', 'project_manager', 'program_manager'):
            qs = ProjectTeam.objects.filter(project_id__in=accessible_project_ids(user))
        else:
            # team_member / contributor / reviewer / guest: see only your own rate
            qs = ProjectTeam.objects.filter(user=user)

        project_id = self.request.query_params.get("project")
        if project_id:
            qs = qs.filter(project_id=project_id)

        program_id = self.request.query_params.get("program")
        if program_id:
            qs = qs.filter(project__program_id=program_id)
        return qs.filter(is_active=True).select_related(
            "project", "project__company", "user", "added_by",
        )

    @action(detail=True, methods=["patch"])
    def update_rate(self, request, pk=None):
        """Update hourly rate for a team member"""
        team_member = self.get_object()
        hourly_rate = request.data.get("hourly_rate")
        
        if hourly_rate is None:
            return Response(
                {"detail": "hourly_rate is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            team_member.hourly_rate = hourly_rate
            team_member.save()
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(team_member)
        return Response(serializer.data)

from .methodology_service import apply_methodology_template
from core.ai_utils import RiskDetector, BudgetForecaster, ProjectHealthScorer
from .models import BudgetCategory, BudgetItem, ProjectBudget
from .serializers import (
    BudgetCategorySerializer,
    BudgetItemSerializer,
    ProjectBudgetSerializer,
    BudgetOverviewSerializer
)


class BudgetCategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for budget categories"""
    serializer_class = BudgetCategorySerializer
    permission_classes = [IsAuthenticated, IsAdminOrPM]  # Yanmar SC-05

    def get_queryset(self):
        return BudgetCategory.objects.filter(company=self.request.user.company)


class BudgetItemViewSet(viewsets.ModelViewSet):
    """ViewSet for budget items (P1 fix — membership-scoped)."""
    serializer_class = BudgetItemSerializer
    permission_classes = [IsAuthenticated, IsAdminOrPM]  # Yanmar SC-05

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return BudgetItem.objects.none()
        if getattr(user, 'role', None) == 'superadmin' or getattr(user, 'is_superuser', False):
            queryset = BudgetItem.objects.all()
        else:
            queryset = BudgetItem.objects.filter(project_id__in=accessible_project_ids(user))

        # Filters
        project_id = self.request.query_params.get('project_id')
        if project_id:
            queryset = queryset.filter(project_id=project_id)

        category_id = self.request.query_params.get('category_id')
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        return queryset

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a budget item"""
        item = self.get_object()
        item.status = 'approved'
        item.approved_by = request.user
        item.save()
        
        serializer = self.get_serializer(item)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a budget item"""
        item = self.get_object()
        item.status = 'rejected'
        item.rejection_reason = request.data.get('reason', '')
        item.save()
        
        serializer = self.get_serializer(item)
        return Response(serializer.data)


class BudgetOverviewViewSet(viewsets.ViewSet):
    """Budget overview for company"""
    permission_classes = [IsAuthenticated, IsAdminOrPM]  # Yanmar SC-05

    def list(self, request):
        """GET /budget/overview/"""
        company = request.user.company
        
        # Get all categories
        categories = BudgetCategory.objects.filter(company=company)
        
        # Calculate totals
        total_budget = sum(cat.allocated for cat in categories)
        total_spent = sum(cat.spent for cat in categories)
        total_remaining = total_budget - total_spent
        
        data = {
            'total_budget': total_budget,
            'total_spent': total_spent,
            'total_remaining': total_remaining,
            'currency': 'EUR',
            'categories': BudgetCategorySerializer(categories, many=True).data
        }
        
        serializer = BudgetOverviewSerializer(data)
        return Response(serializer.data)

# ============================================
# AI INSIGHTS
# ============================================

from rest_framework.decorators import api_view


# ============================================
# STATUS REPORT AUTO-DRAFT
# ============================================
from rest_framework.decorators import permission_classes as drf_permission_classes
from django.shortcuts import get_object_or_404 as _gobj


@api_view(['POST'])
@drf_permission_classes([IsAuthenticated])
def status_report_auto_draft(request, project_id):
    """POST /api/v1/projects/<id>/status-reports/auto-draft/

    Returns a *draft* status-report payload synthesised from live project
    signals. Not persisted — the frontend prepopulates the create-form with
    the returned dict so the user can review/edit before saving.
    """
    user = request.user
    company = getattr(user, 'company', None)
    qs = Project.objects.all()
    if company is not None:
        qs = qs.filter(company=company)
    project = _gobj(qs, pk=project_id)

    today = timezone.now().date()
    period_start = today - timezone.timedelta(days=7) if hasattr(timezone, 'timedelta') else today
    # timezone has no .timedelta on some Django versions — use datetime.timedelta
    from datetime import timedelta as _td
    period_start = today - _td(days=7)

    total_tasks = Task.objects.filter(milestone__project=project).count()
    done_tasks = Task.objects.filter(milestone__project=project, status='done').count()
    blocked_tasks = Task.objects.filter(milestone__project=project, status='blocked').count()
    in_progress = Task.objects.filter(milestone__project=project, status='in_progress').count()
    progress_pct = int((done_tasks / total_tasks) * 100) if total_tasks else 0

    open_risks = Risk.objects.filter(project=project, status='Open').count()
    high_risks = Risk.objects.filter(project=project, status='Open', level='High').count()

    recent_done = list(
        Task.objects.filter(
            milestone__project=project,
            status='done',
            updated_at__date__gte=period_start,
        ).order_by('-updated_at').values_list('title', flat=True)[:5]
    )
    upcoming_milestones = list(
        Milestone.objects.filter(project=project)
        .exclude(status='completed')
        .order_by('end_date')
        .values_list('name', flat=True)[:5]
    )

    if blocked_tasks > 0 or high_risks > 0:
        rag = 'amber' if (blocked_tasks <= 2 and high_risks <= 1) else 'red'
        narrative_status = 'In Progress'
    else:
        rag = 'green'
        narrative_status = 'In Progress' if in_progress else 'Not Started'

    summary_lines = [
        f"Period {period_start.isoformat()} → {today.isoformat()}.",
        f"Progress: {progress_pct}% ({done_tasks}/{total_tasks} tasks done).",
        f"In flight: {in_progress} task(s); blocked: {blocked_tasks}.",
        f"Open risks: {open_risks} (high: {high_risks}).",
    ]
    if recent_done:
        summary_lines.append("Recent wins: " + "; ".join(recent_done))
    if upcoming_milestones:
        summary_lines.append("Next up: " + "; ".join(upcoming_milestones))

    draft = {
        'project': project.id,
        'project_name': project.name,
        'status': narrative_status,
        'progress': progress_pct,
        'last_updated': today.isoformat(),
        'rag': rag,
        'period_start': period_start.isoformat(),
        'period_end': today.isoformat(),
        'summary': "\n".join(summary_lines),
        'recent_completed_tasks': recent_done,
        'upcoming_milestones': upcoming_milestones,
        'metrics': {
            'total_tasks': total_tasks,
            'done_tasks': done_tasks,
            'in_progress_tasks': in_progress,
            'blocked_tasks': blocked_tasks,
            'open_risks': open_risks,
            'high_risks': high_risks,
        },
        'is_draft': True,
        'persisted': False,
    }
    return Response(draft)


# ── Yanmar PP-01: six distinct project roles CRUD ────────────────────────
from .serializers import ProjectMembershipSerializer


class ProjectMembershipViewSet(CompanyScopedQuerysetMixin, viewsets.ModelViewSet):
    """CRUD for the six Yanmar project roles (Owner/PM/Leader/Facilitator/
    Outside Eyes/Stakeholder). Scoped through CompanyScopedQuerysetMixin."""
    queryset = ProjectMembership.objects.all().select_related("project", "user")
    serializer_class = ProjectMembershipSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        project_id = self.request.query_params.get("project")
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs


# ── Yanmar PP-08: Communication plan events CRUD ─────────────────────────
from .serializers import PlanEventSerializer


class PlanEventViewSet(CompanyScopedQuerysetMixin, viewsets.ModelViewSet):
    """CRUD for communication-plan events (kickoff/onboarding/regular/gate/
    closing). The CommunicationPlan is auto-created per project on first event."""
    queryset = PlanEvent.objects.all().select_related("plan", "plan__project")
    serializer_class = PlanEventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        project_id = self.request.query_params.get("project")
        if project_id:
            qs = qs.filter(plan__project_id=project_id)
        return qs
