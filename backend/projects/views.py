from dataclasses import asdict
from .methodology_service import apply_methodology_template
from .methodology_service import apply_methodology_template

from rest_framework import viewsets
from rest_framework import serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
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
    AIMitigation,
    ManualMitigation,
    ProjectTeam,
    ProjectEvent,
    Document,
    TrainingMaterial,
    TimeEntry,
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
)

class CompanyScopedQuerysetMixin:
    def get_queryset(self):
        base_qs = super().get_queryset()
        user = self.request.user
        if not user.is_authenticated:
            return base_qs.none()
        if getattr(user, "company", None) is None:
            return base_qs.none()
        if base_qs.model is Project:
            return base_qs.filter(company=user.company)
        if base_qs.model is Milestone:
            return base_qs.filter(project__company=user.company)
        if base_qs.model is Task:
            return base_qs.filter(milestone__project__company=user.company)
        # ADD THIS:
        if base_qs.model is TimeEntry:
            return base_qs.filter(project__company=user.company)
        # Handle Newsletter model - filter by company through project or created_by
        if (
            hasattr(base_qs.model, "_meta")
            and base_qs.model._meta.label == "newsletters.Newsletter"
        ):
            return base_qs.filter(
                models.Q(project__company=user.company)
                | models.Q(project__isnull=True, created_by__company=user.company)
            )
        # Handle MailingList model - filter by company
        if (
            hasattr(base_qs.model, "_meta")
            and base_qs.model._meta.label == "newsletters.MailingList"
        ):
            return base_qs.filter(company=user.company)
        # Handle ExternalSubscriber model - filter by company
        if (
            hasattr(base_qs.model, "_meta")
            and base_qs.model._meta.label == "newsletters.ExternalSubscriber"
        ):
            return base_qs.filter(company=user.company)
        return base_qs


IsAdminOrPM = HasRole("admin", "pm", "superadmin")


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
        if self.action in ["list", "retrieve", "summary", "timeline", "team"]:
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsAdminOrPM()]

    def get_queryset(self):
        """Filter projects based on user role and team membership."""
        from django.db.models import Q

        # Get the base queryset from CompanyScopedQuerysetMixin
        qs = super().get_queryset()
        user = self.request.user

        # If user is admin or PM, show all company projects
        if user.role in ["admin", "pm"]:
            return qs

        # For other roles (contributor, reviewer, guest), filter by team membership
        return qs.filter(
            Q(team_members__user=user, team_members__is_active=True)
            | Q(created_by=user)  # Include projects created by the user
        ).distinct()

    def perform_create(self, serializer):
        project = serializer.save(company=self.request.user.company, created_by=self.request.user)
        # Apply methodology template if set
        if project.methodology:
            apply_methodology_template(project)

    def perform_update(self, serializer):
        serializer.save(company=self.request.user.company)

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
        return qs


class TaskViewSet(CompanyScopedQuerysetMixin, viewsets.ModelViewSet):
    queryset = Task.objects.all().select_related(
        "milestone",
        "milestone__project",
        "milestone__project__company",
        "assigned_to",
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
        return qs


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

                # Generate AI mitigation
                ai_plan = generate_ai_mitigation(risk_data)

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

            # Generate AI mitigation
            ai_plan = generate_ai_mitigation(risk_data)

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

    # ADD THIS METHOD:
    def list(self, request, *args, **kwargs):
        print("🎯 TimeEntryViewSet.list() CALLED!")
        print(f"User: {request.user}")
        print(f"Company: {getattr(request.user, 'company', None)}")
        print(f"Query params: {request.query_params}")
        return super().list(request, *args, **kwargs)
    
    # ADD THIS:
    def create(self, request, *args, **kwargs):
        print("🎯 TimeEntryViewSet.create() CALLED!")
        print(f"User: {request.user}")
        print(f"Company: {getattr(request.user, 'company', None)}")
        print(f"Data: {request.data}")
        return super().create(request, *args, **kwargs)

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
        project_id = request.query_params.get("project")
        if not project_id:
            return Response(
                {"detail": "Project ID is required"},
                status=status.HTTP_400_BAD_REQUEST
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


class ProjectTeamRateViewSet(CompanyScopedQuerysetMixin, viewsets.ModelViewSet):
    """ViewSet for managing team member hourly rates"""
    
    queryset = ProjectTeam.objects.all().select_related(
        "project",
        "project__company",
        "user",
        "added_by",
    )
    serializer_class = ProjectTeamWithRateSerializer
    permission_classes = [IsAuthenticated, IsAdminOrPM]

    def get_queryset(self):
        qs = super().get_queryset()
        project_id = self.request.query_params.get("project")
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs.filter(is_active=True)

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

# Add to imports at top of file
from .methodology_service import apply_methodology_template

# ========================================
# ADD THESE TO projects/views.py
# ========================================

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
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
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return BudgetCategory.objects.filter(company=self.request.user.company)


class BudgetItemViewSet(viewsets.ModelViewSet):
    """ViewSet for budget items"""
    serializer_class = BudgetItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = BudgetItem.objects.filter(
            project__company=self.request.user.company
        )
        
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
    permission_classes = [IsAuthenticated]

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