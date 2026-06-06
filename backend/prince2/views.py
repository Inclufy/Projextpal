from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from projects.permissions import MethodologyMatchesProjectPermission
from .models import (
    Product,
    ProjectBrief, BusinessCase, BusinessCaseBenefit, BusinessCaseRisk,
    ProjectInitiationDocument, Stage, StagePlan, StageGate, WorkPackage,
    ProjectBoard, ProjectBoardMember, HighlightReport, CheckpointReport,
    EndProjectReport, LessonsLog, ProjectTolerance,
    Prince2Risk, Prince2Issue, Prince2ExceptionReport,
    ManagementApproach, QualityRegisterEntry, DailyLog, ExceptionPlan,
    Prince2LessonsReport, Prince2ConfigItem,
)
from .serializers import (
    ProductSerializer,
    ProjectBriefSerializer, BusinessCaseSerializer, BusinessCaseBenefitSerializer,
    BusinessCaseRiskSerializer, ProjectInitiationDocumentSerializer,
    StageSerializer, StagePlanSerializer, StageGateSerializer, WorkPackageSerializer,
    ProjectBoardSerializer, ProjectBoardMemberSerializer, HighlightReportSerializer,
    CheckpointReportSerializer,
    EndProjectReportSerializer, LessonsLogSerializer, ProjectToleranceSerializer,
    Prince2RiskSerializer, Prince2IssueSerializer, Prince2ExceptionReportSerializer,
    ManagementApproachSerializer, QualityRegisterEntrySerializer,
    DailyLogSerializer, ExceptionPlanSerializer,
    Prince2LessonsReportSerializer, Prince2ConfigItemSerializer,
)


def prince2_tailoring_profile(project):
    """Resolve the project's PRINCE2 tailoring profile ('full' | 'simple').

    Reads the most recent PID; defaults to 'full' (enforce every gate) when no
    PID exists yet, so integrity is the safe default. A 'simple' profile relaxes
    the lighter-ceremony gates (Principle 7 — Tailor to suit the project).
    """
    pid = (
        ProjectInitiationDocument.objects.filter(project=project)
        .order_by('-created_at')
        .first()
    )
    return (getattr(pid, 'tailoring_profile', None) or 'full') if pid else 'full'


class ProjectFilterMixin:
    """Mixin to filter by project membership (P2 fix — was company-only)."""

    def _accessible_project_qs(self):
        from django.db.models import Q
        from projects.models import Project
        user = self.request.user
        if getattr(user, 'role', None) == 'superadmin' or getattr(user, 'is_superuser', False):
            return Project.objects.all()
        return Project.objects.filter(
            Q(team_members__user=user, team_members__is_active=True)
            | Q(created_by=user)
        ).distinct()

    def get_project_queryset(self, model):
        project_id = self.kwargs.get('project_id')
        return model.objects.filter(
            project_id=project_id,
            project__in=self._accessible_project_qs(),
        )

    def get_project(self):
        project_id = self.kwargs.get('project_id')
        return get_object_or_404(self._accessible_project_qs(), id=project_id)


# =============================================================================
# PROJECT BRIEF
# =============================================================================

class ProjectBriefViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = ProjectBriefSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        return self.get_project_queryset(ProjectBrief)

    def perform_create(self, serializer):
        project = self.get_project()
        serializer.save(project=project)

    @action(detail=True, methods=['post'])
    def submit_for_review(self, request, project_id=None, pk=None):
        brief = self.get_object()
        brief.status = 'submitted'
        brief.save()
        return Response(ProjectBriefSerializer(brief).data)

    @action(detail=True, methods=['post'])
    def approve(self, request, project_id=None, pk=None):
        brief = self.get_object()
        brief.status = 'approved'
        brief.save()
        return Response(ProjectBriefSerializer(brief).data)


# =============================================================================
# BUSINESS CASE
# =============================================================================

class BusinessCaseViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = BusinessCaseSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        return self.get_project_queryset(BusinessCase)

    def perform_create(self, serializer):
        project = self.get_project()
        serializer.save(project=project)

    @action(detail=True, methods=['post'])
    def approve(self, request, project_id=None, pk=None):
        bc = self.get_object()
        bc.status = 'approved'
        bc.save()
        return Response(BusinessCaseSerializer(bc).data)

    @action(detail=True, methods=['post'])
    def add_benefit(self, request, project_id=None, pk=None):
        bc = self.get_object()
        serializer = BusinessCaseBenefitSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(business_case=bc)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def add_risk(self, request, project_id=None, pk=None):
        bc = self.get_object()
        serializer = BusinessCaseRiskSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(business_case=bc)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BusinessCaseBenefitViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = BusinessCaseBenefitSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return BusinessCaseBenefit.objects.filter(
            business_case__project_id=project_id,
            business_case__project__company=self.request.user.company
        )


class BusinessCaseRiskViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = BusinessCaseRiskSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return BusinessCaseRisk.objects.filter(
            business_case__project_id=project_id,
            business_case__project__company=self.request.user.company
        )


# =============================================================================
# PID
# =============================================================================

class ProjectInitiationDocumentViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = ProjectInitiationDocumentSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        return self.get_project_queryset(ProjectInitiationDocument)

    def perform_create(self, serializer):
        project = self.get_project()
        serializer.save(project=project)

    @action(detail=True, methods=['post'])
    def baseline(self, request, project_id=None, pk=None):
        pid = self.get_object()
        # PRINCE2 principle: Ensure continued business justification.
        # A PID cannot be baselined without an approved Business Case (and Brief
        # from the Starting-up process). This gate makes the principle behavioural
        # rather than a documented intention.
        project = pid.project
        if not BusinessCase.objects.filter(project=project, status='approved').exists():
            return Response(
                {'error': 'Cannot baseline the PID without an approved Business Case (PRINCE2: ensure continued business justification).'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not ProjectBrief.objects.filter(project=project, status='approved').exists():
            return Response(
                {'error': 'Cannot baseline the PID without an approved Project Brief.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        pid.status = 'baselined'
        pid.baseline_date = timezone.now().date()
        pid.save()
        return Response(ProjectInitiationDocumentSerializer(pid).data)


# =============================================================================
# STAGES
# =============================================================================

class StageViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = StageSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        return self.get_project_queryset(Stage)

    def perform_create(self, serializer):
        project = self.get_project()
        serializer.save(project=project)

    @action(detail=True, methods=['post'])
    def start(self, request, project_id=None, pk=None):
        stage = self.get_object()
        # PRINCE2 principle: Manage by stages. A management stage may only start
        # once the preceding stage is completed AND its stage-boundary gate has
        # been approved by the Project Board (the SB -> DP authorisation). The
        # first stage (lowest order) has no predecessor and is always allowed.
        prev = (
            Stage.objects.filter(project=stage.project, order__lt=stage.order)
            .order_by('-order')
            .first()
        )
        if prev is not None:
            if prev.status != 'completed':
                return Response(
                    {'error': f"Cannot start '{stage.name}': previous stage '{prev.name}' must be completed first (PRINCE2: manage by stages)."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            latest_gate = prev.gates.order_by('-review_date', '-created_at').first()
            if latest_gate is None or latest_gate.outcome not in ('approved', 'conditional'):
                return Response(
                    {'error': f"Cannot start '{stage.name}': the stage gate for '{prev.name}' must be approved by the Project Board first."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        stage.status = 'active'
        stage.actual_start_date = timezone.now().date()
        stage.save()
        return Response(StageSerializer(stage).data)

    @action(detail=True, methods=['post'])
    def complete(self, request, project_id=None, pk=None):
        stage = self.get_object()
        stage.status = 'completed'
        stage.actual_end_date = timezone.now().date()
        stage.progress_percentage = 100
        stage.save()
        return Response(StageSerializer(stage).data)

    @action(detail=True, methods=['post'])
    def update_progress(self, request, project_id=None, pk=None):
        stage = self.get_object()
        progress = request.data.get('progress_percentage', 0)
        stage.progress_percentage = min(100, max(0, int(progress)))
        stage.save()
        return Response(StageSerializer(stage).data)

    @action(detail=False, methods=['post'])
    def initialize_stages(self, request, project_id=None):
        """Initialize default PRINCE2 stages"""
        project = self.get_project()
        default_stages = [
            ('Initiation Stage', 'Initial planning and setup'),
            ('Stage 1', 'First delivery stage'),
            ('Stage 2', 'Second delivery stage'),
            ('Final Stage', 'Project completion and handover'),
        ]
        stages = []
        for i, (name, desc) in enumerate(default_stages, 1):
            stage, created = Stage.objects.get_or_create(
                project=project,
                order=i,
                defaults={'name': name, 'description': desc}
            )
            stages.append(stage)
        return Response(StageSerializer(stages, many=True).data)


class StagePlanViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = StagePlanSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return StagePlan.objects.filter(
            stage__project_id=project_id,
            stage__project__company=self.request.user.company
        )

    @action(detail=True, methods=['post'])
    def approve(self, request, project_id=None, pk=None):
        plan = self.get_object()
        plan.status = 'approved'
        plan.save()
        return Response(StagePlanSerializer(plan).data)


class StageGateViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = StageGateSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return StageGate.objects.filter(
            stage__project_id=project_id,
            stage__project__company=self.request.user.company
        )

    @action(detail=True, methods=['post'])
    def approve(self, request, project_id=None, pk=None):
        gate = self.get_object()
        gate.outcome = 'approved'
        gate.review_date = timezone.now().date()
        gate.reviewer = request.user
        gate.save()
        return Response(StageGateSerializer(gate).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, project_id=None, pk=None):
        gate = self.get_object()
        gate.outcome = 'rejected'
        gate.review_date = timezone.now().date()
        gate.reviewer = request.user
        gate.decision_notes = request.data.get('decision_notes', '')
        gate.save()
        return Response(StageGateSerializer(gate).data)


# =============================================================================
# WORK PACKAGES
# =============================================================================

class WorkPackageViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = WorkPackageSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        queryset = self.get_project_queryset(WorkPackage)
        stage = self.request.query_params.get('stage')
        stage_plan = self.request.query_params.get('stage_plan')
        status_filter = self.request.query_params.get('status')
        if stage:
            queryset = queryset.filter(stage_id=stage)
        if stage_plan:
            queryset = queryset.filter(stage_plan_id=stage_plan)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset

    def perform_create(self, serializer):
        project = self.get_project()
        # Auto-generate reference
        count = WorkPackage.objects.filter(project=project).count()
        reference = f"WP-{count + 1:03d}"
        serializer.save(project=project, reference=reference)

    @action(detail=True, methods=['post'])
    def authorize(self, request, project_id=None, pk=None):
        """CS — Authorise a Work Package. PRINCE2 only lets work be authorised
        within an *active* management stage (Manage by Stages). The 'simple'
        tailoring profile relaxes this for lightweight projects."""
        wp = self.get_object()
        profile = prince2_tailoring_profile(self.get_project())
        if profile == 'full':
            if wp.stage is None:
                return Response(
                    {'detail': 'Work Package must belong to a management stage before it can be authorised.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if wp.stage.status != 'active':
                return Response(
                    {'detail': f"Cannot authorise — owning stage '{wp.stage.name}' is not active "
                               f"(status: {wp.stage.status}). Start the stage first."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        wp.status = 'authorized'
        wp.save()
        return Response(WorkPackageSerializer(wp).data)

    @action(detail=True, methods=['post'])
    def accept(self, request, project_id=None, pk=None):
        """MP — the Team Manager accepts an authorised Work Package before
        beginning delivery (the CS->MP handshake)."""
        wp = self.get_object()
        if wp.status not in ('authorized', 'in_progress'):
            return Response(
                {'detail': 'Only an authorised Work Package can be accepted by the Team Manager.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        wp.accepted_by_tm = True
        wp.accepted_at = timezone.now()
        if not wp.team_manager_id:
            wp.team_manager = request.user
        wp.save()
        return Response(WorkPackageSerializer(wp).data)

    @action(detail=True, methods=['post'])
    def start(self, request, project_id=None, pk=None):
        """MP — start delivery. Doctrine guards: the WP must be authorised,
        all its dependencies (depends_on) must be completed, and (full profile)
        the Team Manager must have accepted it."""
        wp = self.get_object()
        profile = prince2_tailoring_profile(self.get_project())

        if wp.status not in ('authorized', 'in_progress'):
            return Response(
                {'detail': 'Work Package must be authorised before work can start.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        blocking = [
            dep for dep in wp.depends_on.all()
            if dep.status not in ('completed', 'closed')
        ]
        if blocking:
            titles = ', '.join(d.title or d.reference for d in blocking)
            return Response(
                {'detail': f'Cannot start — dependencies not completed: {titles}.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if profile == 'full' and not wp.accepted_by_tm:
            return Response(
                {'detail': 'Work Package must be accepted by the Team Manager before work can start.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        wp.status = 'in_progress'
        wp.actual_start_date = timezone.now().date()
        wp.save()
        return Response(WorkPackageSerializer(wp).data)

    @action(detail=True, methods=['post'])
    def complete(self, request, project_id=None, pk=None):
        wp = self.get_object()
        wp.status = 'completed'
        wp.actual_end_date = timezone.now().date()
        wp.progress_percentage = 100
        wp.save()
        return Response(WorkPackageSerializer(wp).data)

    @action(detail=True, methods=['post'])
    def update_progress(self, request, project_id=None, pk=None):
        wp = self.get_object()
        progress = request.data.get('progress_percentage', 0)
        wp.progress_percentage = min(100, max(0, int(progress)))
        wp.save()
        return Response(WorkPackageSerializer(wp).data)


# =============================================================================
# RISK & ISSUE REGISTERS
# =============================================================================

class Prince2RiskViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = Prince2RiskSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        queryset = self.get_project_queryset(Prince2Risk)
        status_filter = self.request.query_params.get('status')
        work_package = self.request.query_params.get('work_package')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if work_package:
            queryset = queryset.filter(work_package_id=work_package)
        return queryset

    def perform_create(self, serializer):
        serializer.save(project=self.get_project())


class Prince2IssueViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = Prince2IssueSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        queryset = self.get_project_queryset(Prince2Issue)
        status_filter = self.request.query_params.get('status')
        issue_type = self.request.query_params.get('issue_type')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if issue_type:
            queryset = queryset.filter(issue_type=issue_type)
        return queryset

    def perform_create(self, serializer):
        serializer.save(project=self.get_project())

    # Issue types that require a Change Authority verdict before resolution.
    CA_GATED_TYPES = ('request_for_change', 'off_specification')

    def perform_update(self, serializer):
        """Change control gate: an RFC / Off-Specification cannot transition to
        'resolved' or 'closed' until the Change Authority has *approved* it.
        Change control becomes controlled, not merely recorded."""
        from rest_framework.exceptions import ValidationError
        instance = self.get_object()
        new_status = serializer.validated_data.get('status', instance.status)
        new_type = serializer.validated_data.get('issue_type', instance.issue_type)
        ca_decision = instance.change_authority_decision
        if (
            new_type in self.CA_GATED_TYPES
            and new_status in ('resolved', 'closed')
            and ca_decision != 'approved'
        ):
            raise ValidationError({
                'status': (
                    'This request for change / off-specification must be approved '
                    'by the Change Authority before it can be resolved or closed.'
                )
            })
        serializer.save()

    @action(detail=True, methods=['post'], url_path='change-authority-decision')
    def change_authority_decision(self, request, project_id=None, pk=None):
        """Change Authority records a verdict on an RFC / Off-Specification
        (Change theme). Only after an 'approved' verdict may the issue be
        resolved or closed."""
        issue = self.get_object()
        if issue.issue_type not in self.CA_GATED_TYPES:
            return Response(
                {'detail': 'Only a request for change or off-specification needs a Change Authority decision.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        decision = request.data.get('decision')
        if decision not in ('approved', 'rejected', 'deferred'):
            return Response(
                {'detail': "decision must be one of: approved, rejected, deferred."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        issue.change_authority_decision = decision
        issue.change_authority = request.user
        issue.change_authority_date = timezone.now().date()
        issue.change_authority_rationale = request.data.get('rationale', '')
        issue.save()
        return Response(Prince2IssueSerializer(issue).data)


class Prince2ExceptionReportViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = Prince2ExceptionReportSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        queryset = self.get_project_queryset(Prince2ExceptionReport)
        status_filter = self.request.query_params.get('status')
        stage = self.request.query_params.get('stage')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if stage:
            queryset = queryset.filter(stage_id=stage)
        return queryset

    def perform_create(self, serializer):
        serializer.save(project=self.get_project(), raised_by=self.request.user)

    @action(detail=True, methods=['post'])
    def request_exception_plan(self, request, project_id=None, pk=None):
        """Project Board direction: request an Exception Plan in response to this
        Exception Report. Records the board decision and spins up a draft
        Exception Plan — closing the Manage-by-Exception loop."""
        report = self.get_object()
        report.status = 'board_decision'
        report.board_decision = request.data.get(
            'board_decision',
            'Project Board requests an Exception Plan for the remainder of the stage.',
        )
        report.save()
        plan = ExceptionPlan.objects.create(
            project=report.project,
            exception_report=report,
            stage=report.stage,
            title=f"Exception Plan — {report.title}",
            rationale=report.cause,
            status='draft',
        )
        return Response(
            {
                'exception_report': Prince2ExceptionReportSerializer(report).data,
                'exception_plan': ExceptionPlanSerializer(plan).data,
            },
            status=status.HTTP_201_CREATED,
        )


class ManagementApproachViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = ManagementApproachSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        queryset = self.get_project_queryset(ManagementApproach)
        approach_type = self.request.query_params.get('approach_type')
        if approach_type:
            queryset = queryset.filter(approach_type=approach_type)
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        if self.kwargs.get('project_id') and self.request is not None:
            try:
                context['project'] = self.get_project()
            except Exception:
                pass
        return context

    def perform_create(self, serializer):
        serializer.save(project=self.get_project())

    @action(detail=False, methods=['post'])
    def initialize(self, request, project_id=None):
        """Create the 4 standard management approaches as drafts."""
        project = self.get_project()
        approaches = []
        for atype, _ in ManagementApproach.APPROACH_CHOICES:
            obj, _created = ManagementApproach.objects.get_or_create(
                project=project, approach_type=atype,
            )
            approaches.append(obj)
        return Response(ManagementApproachSerializer(approaches, many=True).data)


class QualityRegisterViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = QualityRegisterEntrySerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        queryset = self.get_project_queryset(QualityRegisterEntry)
        result = self.request.query_params.get('result')
        product = self.request.query_params.get('product')
        if result:
            queryset = queryset.filter(result=result)
        if product:
            queryset = queryset.filter(product_id=product)
        return queryset

    def perform_create(self, serializer):
        serializer.save(project=self.get_project())


class DailyLogViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = DailyLogSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        queryset = self.get_project_queryset(DailyLog)
        entry_type = self.request.query_params.get('entry_type')
        status_filter = self.request.query_params.get('status')
        if entry_type:
            queryset = queryset.filter(entry_type=entry_type)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset

    def perform_create(self, serializer):
        serializer.save(project=self.get_project())


class ExceptionPlanViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = ExceptionPlanSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        queryset = self.get_project_queryset(ExceptionPlan)
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset

    def perform_create(self, serializer):
        serializer.save(project=self.get_project())

    @action(detail=True, methods=['post'])
    def approve(self, request, project_id=None, pk=None):
        """Board approves the Exception Plan -> it becomes the new baseline and
        the originating Exception Report is closed."""
        plan = self.get_object()
        plan.status = 'approved'
        plan.approved_by = request.user
        plan.save()
        if plan.exception_report_id:
            report = plan.exception_report
            report.status = 'closed'
            report.date_closed = timezone.now().date()
            report.save()
        # Re-baseline the stage forecast where provided.
        if plan.stage_id and plan.revised_end_date:
            stage = plan.stage
            stage.planned_end_date = plan.revised_end_date
            stage.save()
        return Response(ExceptionPlanSerializer(plan).data)


# =============================================================================
# PROJECT BOARD
# =============================================================================

class ProjectBoardViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = ProjectBoardSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return ProjectBoard.objects.filter(
            project_id=project_id,
            project__company=self.request.user.company
        )

    def perform_create(self, serializer):
        project = self.get_project()
        serializer.save(project=project)

    @action(detail=True, methods=['post'])
    def add_member(self, request, project_id=None, pk=None):
        board = self.get_object()
        serializer = ProjectBoardMemberSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(board=board)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProjectBoardMemberViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = ProjectBoardMemberSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return ProjectBoardMember.objects.filter(
            board__project_id=project_id,
            board__project__company=self.request.user.company
        )


# =============================================================================
# REPORTS
# =============================================================================

class HighlightReportViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = HighlightReportSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        return self.get_project_queryset(HighlightReport)

    def perform_create(self, serializer):
        project = self.get_project()
        # Auto-default the cover header (Sponsor/PM/Senior Supplier) from the
        # PRINCE2 Project Board so governance roles are defined once, not retyped
        # per report. Caller-supplied values always win.
        defaults = self._board_header_defaults(project)
        extra = {k: v for k, v in defaults.items()
                 if v and not (serializer.validated_data.get(k) or "").strip()}
        serializer.save(project=project, **extra)

    @staticmethod
    def _board_header_defaults(project):
        """Map Project Board roles → highlight header fields."""
        out = {"sponsor": "", "project_manager": "", "senior_supplier": ""}
        board = getattr(project, "prince2_board", None)
        if not board:
            return out
        role_to_field = {
            "executive": "sponsor",
            "project_manager": "project_manager",
            "senior_supplier": "senior_supplier",
        }
        for m in board.members.select_related("user").all():
            field = role_to_field.get(m.role)
            if field and not out[field] and m.user:
                full = m.user.get_full_name() if hasattr(m.user, "get_full_name") else ""
                out[field] = (full or getattr(m.user, "username", "") or getattr(m.user, "email", "")).strip()
        return out

    @action(detail=True, methods=['post'])
    def generate(self, request, project_id=None, pk=None):
        """Re-synthesise content for an existing highlight report from live signals."""
        report = self.get_object()
        report.auto_draft_content(save=True)
        return Response(HighlightReportSerializer(report).data)

    @action(detail=False, methods=['post'])
    def auto_draft(self, request, project_id=None):
        """Create a new highlight report and auto-draft its content from live signals."""
        from datetime import date, timedelta
        project = self.get_project()
        today = date.today()
        report = HighlightReport.objects.create(
            project=project,
            report_date=today,
            period_start=today - timedelta(days=7),
            period_end=today,
        )
        report.auto_draft_content(save=True)
        return Response(
            HighlightReportSerializer(report).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["get"], url_path="export/pptx")
    def export_pptx(self, request, project_id=None, pk=None):
        """Render the Highlight Report as a PPTX (template selectable)."""
        from django.http import HttpResponse
        from django.utils.text import slugify
        from django.utils import timezone
        from .exports import highlight_report_to_data
        from projects.export_templates import pick_template

        report = self.get_object()
        company = getattr(report.project, "company", None)
        template_name = request.query_params.get("template", "")
        renderer = pick_template(company, template_name, kind="highlight_pptx")

        data = highlight_report_to_data(report)
        pptx_bytes = renderer(data)

        filename = "{}-highlight-{}.pptx".format(
            slugify(report.project.name) or "project",
            (report.report_date or timezone.now().date()).isoformat(),
        )
        response = HttpResponse(
            pptx_bytes,
            content_type=(
                "application/vnd.openxmlformats-officedocument."
                "presentationml.presentation"
            ),
        )
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
        return response


class CheckpointReportViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    """PRINCE2 Checkpoint Report endpoint (PRINCE2 6th Ed §A.3).

    Team Manager -> Project Manager reporting product, distinct from
    Highlight Report (PM -> Project Board).
    """
    serializer_class = CheckpointReportSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        return self.get_project_queryset(CheckpointReport)

    def perform_create(self, serializer):
        project = self.get_project()
        # Default the team_manager to the requesting user if not provided.
        if 'team_manager' in serializer.validated_data:
            serializer.save(project=project)
        else:
            serializer.save(project=project, team_manager=self.request.user)


class EndProjectReportViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = EndProjectReportSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        return self.get_project_queryset(EndProjectReport)

    def perform_create(self, serializer):
        project = self.get_project()
        serializer.save(project=project)

    @action(detail=True, methods=['post'])
    def approve(self, request, project_id=None, pk=None):
        """Closing a Project — controlled closure. The End Project Report cannot
        be approved (project closed) until:
          1. every Product has been accepted (status 'approved'),
          2. a Lessons Report has been compiled (full profile), and
          3. benefits handover / follow-on actions are recorded.
        Closure is a confirmed acceptance, not a free status flip."""
        report = self.get_object()
        project = self.get_project()
        profile = prince2_tailoring_profile(project)

        blocking = []

        products = Product.objects.filter(project=project)
        if products.exists() and products.exclude(status='approved').exists():
            unaccepted = products.exclude(status='approved').count()
            blocking.append(
                f'{unaccepted} product(s) have not been accepted — all products must be approved before closure.'
            )

        if profile == 'full' and not Prince2LessonsReport.objects.filter(project=project).exists():
            blocking.append('A Lessons Report must be compiled before the project can be closed.')

        if not (report.follow_on_actions or '').strip() and not (report.benefits_achieved or '').strip():
            blocking.append('Record benefits handover / follow-on actions before closure.')

        if blocking:
            return Response(
                {'detail': ' '.join(blocking), 'blocking': blocking},
                status=status.HTTP_400_BAD_REQUEST,
            )

        report.status = 'approved'
        report.report_date = timezone.now().date()
        report.save()
        return Response(EndProjectReportSerializer(report).data)


# =============================================================================
# LESSONS & TOLERANCES
# =============================================================================

class LessonsLogViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = LessonsLogSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        return self.get_project_queryset(LessonsLog)

    def perform_create(self, serializer):
        project = self.get_project()
        serializer.save(project=project, logged_by=self.request.user)

    @action(detail=False, methods=['get'])
    def by_category(self, request, project_id=None):
        queryset = self.get_queryset()
        result = {}
        for category, _ in LessonsLog.CATEGORY_CHOICES:
            items = queryset.filter(category=category)
            result[category] = LessonsLogSerializer(items, many=True).data
        return Response(result)

    @action(detail=False, methods=['post'])
    def compile_report(self, request, project_id=None):
        """Closing a Project — compile a Lessons Report from the Lessons Log.

        Aggregates the running log into a point-in-time management product
        (what went well / badly + recommendations), which the closure gate
        then requires before the project can be closed. Idempotent: re-running
        refreshes the single report for the project."""
        project = self.get_project()
        lessons = list(self.get_queryset())
        positives = [l for l in lessons if l.lesson_type == 'positive']
        negatives = [l for l in lessons if l.lesson_type == 'negative']

        # Ingest lessons captured via the project's lessons-learned Survey
        # (surveys.ArchivedLesson) so the survey feeds the PRINCE2 Lessons
        # Report rather than living in a separate silo.
        survey_insights = []
        try:
            from surveys.models import ArchivedLesson
            for al in ArchivedLesson.objects.filter(project=project).select_related('survey'):
                for insight in al.insights_list():
                    src = al.survey.name if al.survey_id else 'Lessons-learned survey'
                    survey_insights.append(f'- {insight} (from: {src})')
        except Exception:
            survey_insights = []

        def _join(items):
            return '\n'.join(
                f'- {l.title}: {l.recommendation or l.description or ""}'.rstrip(': ').strip()
                for l in items
            )

        report, _ = Prince2LessonsReport.objects.get_or_create(
            project=project,
            defaults={'title': f'Lessons Report — {project.name}'},
        )
        report.title = report.title or f'Lessons Report — {project.name}'
        report.summary = (
            f'{len(lessons)} lesson(s) from the Lessons Log '
            f'({len(positives)} positive, {len(negatives)} negative) '
            f'plus {len(survey_insights)} insight(s) from the lessons-learned survey.'
        )
        well = _join(positives)
        if survey_insights:
            well = (well + '\n' if well else '') + '\n'.join(survey_insights)
        report.what_went_well = well
        report.what_went_badly = _join(negatives)
        report.recommendations = _join(
            [l for l in lessons if (l.recommendation or '').strip()]
        )
        report.lessons_count = len(lessons) + len(survey_insights)
        report.compiled_by = request.user
        report.report_date = timezone.now().date()
        report.save()
        return Response(
            Prince2LessonsReportSerializer(report).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=['get'])
    def prior_lessons(self, request, project_id=None):
        """Starting up a Project — *Learn from experience* at the front end.

        Surfaces lessons captured on the company's OTHER projects so the team
        can apply them before this project starts. Scoped to projects the user
        can access; excludes the current project."""
        project = self.get_project()
        accessible = self._accessible_project_qs()
        prior = (
            LessonsLog.objects.filter(project__in=accessible)
            .exclude(project_id=project.id)
            .select_related('project')
            .order_by('-date_logged', '-created_at')[:25]
        )
        data = []
        for l in prior:
            row = LessonsLogSerializer(l).data
            row['project_name'] = l.project.name
            row['source'] = 'lessons_log'
            data.append(row)

        # Also surface lessons captured via lessons-learned Surveys on other
        # projects (surveys.ArchivedLesson), so the team learns from experience
        # at Starting up a Project regardless of where the lesson was recorded.
        try:
            from surveys.models import ArchivedLesson
            archived = (
                ArchivedLesson.objects.filter(project__in=accessible)
                .exclude(project_id=project.id)
                .select_related('project', 'survey')
                .order_by('-date', '-created_at')[:25]
            )
            for al in archived:
                for insight in al.insights_list():
                    data.append({
                        'title': insight,
                        'description': '',
                        'lesson_type': 'positive',
                        'category': None,
                        'recommendation': '',
                        'project_name': al.project.name,
                        'date_logged': al.date.isoformat() if al.date else None,
                        'source': 'survey',
                        'survey_name': al.survey.name if al.survey_id else None,
                    })
        except Exception:
            pass

        return Response(data)


class ProjectToleranceViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = ProjectToleranceSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        return self.get_project_queryset(ProjectTolerance)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        # Provide the resolved project so the serializer can validate
        # (project, tolerance_type) uniqueness and return a clean 400
        # instead of letting the DB raise an IntegrityError -> 500.
        if self.kwargs.get('project_id') and self.request is not None:
            try:
                context['project'] = self.get_project()
            except Exception:
                pass
        return context

    def perform_create(self, serializer):
        project = self.get_project()
        serializer.save(project=project)

    @action(detail=False, methods=['post'])
    def initialize(self, request, project_id=None):
        """Initialize all 6 tolerance types"""
        project = self.get_project()
        tolerances = []
        for tol_type, _ in ProjectTolerance.TYPE_CHOICES:
            tolerance, created = ProjectTolerance.objects.get_or_create(
                project=project,
                tolerance_type=tol_type,
                defaults={
                    'plus_tolerance': '+10%',
                    'minus_tolerance': '-10%',
                }
            )
            tolerances.append(tolerance)
        return Response(ProjectToleranceSerializer(tolerances, many=True).data)

    @action(detail=False, methods=['post'], url_path='check-cost-tolerance')
    def check_cost_tolerance(self, request, project_id=None):
        """Auto-detect a cost-tolerance breach on the active stage.

        Compares approved expense actuals (by date window) against the active
        stage's planned budget. When actuals exceed planned budget + margin,
        flips the project's cost ProjectTolerance to is_exceeded=True, which
        fires the tolerance-breach signal and raises a Prince2ExceptionReport —
        closing the *Manage by Exception* loop automatically.
        """
        from projects.models import BudgetItem
        from datetime import date as _date

        project = self.get_project()
        active = Stage.objects.filter(project=project, status='active').order_by('order').first()
        if not active:
            return Response(
                {'breach': False, 'detail': 'No active stage to evaluate.'},
                status=status.HTTP_200_OK,
            )

        sp = StagePlan.objects.filter(stage=active).order_by('-created_at').first()
        planned = float(sp.budget) if (sp and sp.budget is not None) else 0.0

        start = active.actual_start_date or active.planned_start_date
        end = active.actual_end_date or active.planned_end_date or _date.max
        actuals = BudgetItem.objects.filter(
            project=project, status='approved', type='expense',
        )
        if start:
            actuals = actuals.filter(date__gte=start, date__lte=end)
        actual = float(sum((bi.amount or 0) for bi in actuals))

        # Margin from the cost tolerance's plus_tolerance (e.g. "+10%"); default 10%.
        cost_tol = ProjectTolerance.objects.filter(project=project, tolerance_type='cost').first()
        margin_pct = 10.0
        if cost_tol and cost_tol.plus_tolerance:
            import re
            m = re.search(r'(\d+(?:\.\d+)?)', cost_tol.plus_tolerance)
            if m:
                margin_pct = float(m.group(1))
        threshold = planned * (1 + margin_pct / 100.0) if planned else 0.0
        breach = planned > 0 and actual > threshold

        result = {
            'breach': breach,
            'stage_id': active.id,
            'stage_name': active.name,
            'planned': round(planned, 2),
            'actual': round(actual, 2),
            'margin_pct': margin_pct,
            'threshold': round(threshold, 2),
        }

        if breach:
            if not cost_tol:
                cost_tol = ProjectTolerance.objects.create(
                    project=project, tolerance_type='cost',
                    plus_tolerance=f'+{margin_pct:g}%', minus_tolerance=f'-{margin_pct:g}%',
                )
            cost_tol.current_status = (
                f'Actuals {result["actual"]} exceed planned budget {result["planned"]} '
                f'+{margin_pct:g}% on stage "{active.name}"'
            )
            already = cost_tol.is_exceeded
            cost_tol.is_exceeded = True
            cost_tol.save()  # signal raises the Exception Report on the False->True edge
            result['tolerance_id'] = cost_tol.id
            result['exception_raised'] = not already

        return Response(result, status=status.HTTP_200_OK)


# =============================================================================
# DASHBOARD
# =============================================================================

class Prince2DashboardView(APIView):
    """PRINCE2 Dashboard for a project"""
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get(self, request, project_id):
        from projects.models import Project
        
        project = get_object_or_404(
            Project,
            id=project_id,
            company=request.user.company
        )
        
        # Get stages
        stages = Stage.objects.filter(project=project).order_by('order')
        completed_stages = stages.filter(status='completed').count()
        total_stages = stages.count()
        
        # Calculate progress
        if total_stages > 0:
            overall_progress = sum(s.progress_percentage for s in stages) // total_stages
        else:
            overall_progress = 0
        
        # Get documents status
        brief = ProjectBrief.objects.filter(project=project).first()
        bc = BusinessCase.objects.filter(project=project).first()
        pid = ProjectInitiationDocument.objects.filter(project=project).first()
        
        # Get tolerances
        tolerances_exceeded = ProjectTolerance.objects.filter(project=project, is_exceeded=True).count()

        # Get recent reports
        recent_reports = HighlightReport.objects.filter(project=project).order_by('-report_date')[:5]

        # Risk widget — open risks, severity counts, top 5 by impact
        risks_qs = Prince2Risk.objects.filter(project=project).exclude(status='closed')
        risk_rank = {'high': 0, 'medium': 1, 'low': 2}
        top_risks = sorted(
            risks_qs,
            key=lambda r: (risk_rank.get(r.impact, 3), risk_rank.get(r.probability, 3)),
        )[:5]
        risk_counts = {
            'high': risks_qs.filter(impact='high').count(),
            'medium': risks_qs.filter(impact='medium').count(),
            'low': risks_qs.filter(impact='low').count(),
        }

        # Issue widget — open issues
        open_issues = Prince2Issue.objects.filter(project=project).exclude(status='closed')

        # Exception widget — open exception reports
        open_exceptions = Prince2ExceptionReport.objects.filter(
            project=project,
        ).exclude(status='closed').count()

        # Determine the "current PRINCE2 process" for the flow diagram.
        if not (brief and brief.status == 'approved'):
            current_process = 'SU'   # Starting up a Project
        elif not (pid and pid.status == 'baselined'):
            current_process = 'IP'   # Initiating a Project
        elif completed_stages >= total_stages and total_stages > 0:
            current_process = 'CP'   # Closing a Project
        else:
            current_process = 'CS'   # Controlling a Stage

        # ------------------------------------------------------------------
        # Per-process progress for the interactive Process Flow component.
        # Each process exposes a checklist of concrete activities; pct is the
        # share of those activities satisfied by real project data.
        # ------------------------------------------------------------------
        approaches_count = ManagementApproach.objects.filter(project=project).count()
        wp_qs = WorkPackage.objects.filter(project=project)
        wp_count = wp_qs.count()
        wp_authorized = wp_qs.exclude(status='draft').count()
        wp_done = wp_qs.filter(status__in=['completed', 'accepted']).count()
        highlight_count = HighlightReport.objects.filter(project=project).count()
        checkpoint_count = CheckpointReport.objects.filter(project=project).count()
        quality_qs = QualityRegisterEntry.objects.filter(project=project)
        quality_done = quality_qs.exclude(result='pending').count()
        lessons_count = LessonsLog.objects.filter(project=project).count()
        end_report = EndProjectReport.objects.filter(project=project).first()
        exception_plans_count = ExceptionPlan.objects.filter(project=project).count()
        stage_gates_done = StageGate.objects.filter(stage__project=project, outcome='approved').count()
        stage_plans_count = StagePlan.objects.filter(stage__project=project).count()
        board = ProjectBoard.objects.filter(project=project).first()
        board_member_count = ProjectBoardMember.objects.filter(board=board).count() if board else 0
        risks_total = risks_qs.count()
        issues_total = open_issues.count()

        def _pp(activities):
            done = sum(1 for a in activities if a['done'])
            total = len(activities)
            return {
                'pct': round(done / total * 100) if total else 0,
                'done': done, 'total': total, 'activities': activities,
            }

        process_progress = {
            'SU': _pp([
                {'label': 'Project Brief created', 'done': brief is not None},
                {'label': 'Project Brief approved', 'done': bool(brief and brief.status == 'approved')},
                {'label': 'Outline Business Case created', 'done': bc is not None},
                {'label': 'Initiation stage planned', 'done': total_stages > 0},
            ]),
            'DP': _pp([
                {'label': 'Project Board appointed', 'done': board_member_count > 0},
                {'label': 'Initiation authorised (Brief approved)', 'done': bool(brief and brief.status == 'approved')},
                {'label': 'Project authorised (PID baselined)', 'done': bool(pid and pid.status == 'baselined')},
                {'label': 'No open exceptions', 'done': open_exceptions == 0},
            ]),
            'IP': _pp([
                {'label': 'Detailed Business Case', 'done': bool(bc and bc.status in ('approved', 'baselined'))},
                {'label': 'Four Management Approaches defined', 'done': approaches_count >= 4},
                {'label': 'Project Plan / stages defined', 'done': total_stages > 0},
                {'label': 'PID baselined', 'done': bool(pid and pid.status == 'baselined')},
            ]),
            'CS': _pp([
                {'label': 'Work Packages created', 'done': wp_count > 0},
                {'label': 'Work Packages authorised', 'done': wp_authorized > 0},
                {'label': 'Highlight Reports issued', 'done': highlight_count > 0},
                {'label': 'Risks & Issues being managed', 'done': (risks_total + issues_total) > 0},
            ]),
            'MP': _pp([
                {'label': 'Work Packages authorised', 'done': wp_authorized > 0},
                {'label': 'Checkpoint Reports produced', 'done': checkpoint_count > 0},
                {'label': 'Quality checks performed', 'done': quality_done > 0},
                {'label': 'Work Packages delivered', 'done': wp_done > 0},
            ]),
            'SB': _pp([
                {'label': 'Stage Gate reviews approved', 'done': stage_gates_done > 0},
                {'label': 'A stage completed', 'done': completed_stages > 0},
                {'label': 'Stage Plans prepared', 'done': stage_plans_count > 0},
                {'label': 'Exception Plans where needed', 'done': open_exceptions == 0 or exception_plans_count > 0},
            ]),
            'CP': _pp([
                {'label': 'All stages completed', 'done': total_stages > 0 and completed_stages >= total_stages},
                {'label': 'End Project Report', 'done': end_report is not None},
                {'label': 'Lessons captured', 'done': lessons_count > 0},
                {'label': 'Products accepted', 'done': wp_done > 0},
            ]),
        }

        # ------------------------------------------------------------------
        # Budget governance — planned vs actual vs remaining, per stage + total.
        # Read-only aggregation (no schema change). "Actual" = approved expense
        # BudgetItems; per-stage allocation is by the item date falling inside
        # the stage's (actual|planned) date window. PRINCE2 "Manage by Stages"
        # means each stage carries its own cost tolerance.
        # ------------------------------------------------------------------
        from projects.models import BudgetItem, ProjectBudget
        from datetime import date as _date

        pb = ProjectBudget.objects.filter(project=project).first()
        currency = (pb.currency if pb else None) or 'EUR'

        approved_expenses = list(
            BudgetItem.objects.filter(project=project, status='approved', type='expense')
            .values('amount', 'date')
        )
        total_actual = float(sum((bi['amount'] or 0) for bi in approved_expenses))

        # Planned total: ProjectBudget.total_budget → project.budget → Σ StagePlan.budget.
        stage_plans = StagePlan.objects.filter(stage__project=project).select_related('stage')
        stage_plan_budget = {sp.stage_id: float(sp.budget or 0) for sp in stage_plans}
        sum_stage_budgets = float(sum(stage_plan_budget.values()))
        if pb and pb.total_budget:
            total_planned = float(pb.total_budget)
        elif getattr(project, 'budget', None):
            total_planned = float(project.budget)
        else:
            total_planned = sum_stage_budgets

        def _stage_window(s):
            start = s.actual_start_date or s.planned_start_date
            end = s.actual_end_date or s.planned_end_date or _date.max
            return start, end

        stage_budgets = []
        active_cost_breach = None
        for s in stages:
            planned = stage_plan_budget.get(s.id, 0.0)
            start, end = _stage_window(s)
            if start:
                actual = float(sum(
                    (bi['amount'] or 0) for bi in approved_expenses
                    if bi['date'] and start <= bi['date'] <= end
                ))
            else:
                actual = 0.0
            remaining = planned - actual
            over = planned > 0 and actual > planned
            row = {
                'stage_id': s.id, 'stage_name': s.name, 'status': s.status,
                'planned': round(planned, 2), 'actual': round(actual, 2),
                'remaining': round(remaining, 2),
                'variance_pct': round((remaining / planned * 100), 1) if planned else None,
                'over_budget': over,
            }
            stage_budgets.append(row)
            if s.status == 'active' and over:
                active_cost_breach = row

        total_remaining = total_planned - total_actual
        budget_governance = {
            'currency': currency,
            'total_planned': round(total_planned, 2),
            'total_actual': round(total_actual, 2),
            'total_remaining': round(total_remaining, 2),
            'variance': round(total_remaining, 2),
            'variance_pct': round((total_remaining / total_planned * 100), 1) if total_planned else None,
            'over_budget': total_planned > 0 and total_actual > total_planned,
            'has_budget_data': bool(total_planned or total_actual),
            'stages': stage_budgets,
            'active_cost_breach': active_cost_breach,
        }

        # ------------------------------------------------------------------
        # Board approvals inbox — items awaiting Project Board sign-off.
        # Surfaces the "Manage by Exception" governance flow on the dashboard.
        # ------------------------------------------------------------------
        pending_gates = StageGate.objects.filter(
            stage__project=project, outcome='pending'
        ).select_related('stage').order_by('stage__order')
        pending_stage_plans = StagePlan.objects.filter(
            stage__project=project, status='draft'
        ).select_related('stage').order_by('stage__order')
        pending_exception_plans = ExceptionPlan.objects.filter(
            project=project
        ).exclude(status__in=['approved', 'baselined', 'rejected']).order_by('-created_at')

        approvals_inbox = []
        for g in pending_gates:
            approvals_inbox.append({
                'kind': 'stage_gate', 'id': g.id, 'stage_id': g.stage_id,
                'title': f"Stage Gate — {g.stage.name}",
                'subtitle': 'Awaiting Project Board decision to authorise the next stage',
                'review_date': g.review_date.isoformat() if g.review_date else None,
            })
        for sp in pending_stage_plans:
            approvals_inbox.append({
                'kind': 'stage_plan', 'id': sp.id, 'stage_id': sp.stage_id,
                'title': f"Stage Plan — {sp.stage.name}",
                'subtitle': 'Draft Stage Plan awaiting approval',
                'budget': float(sp.budget) if sp.budget is not None else None,
            })
        for ep in pending_exception_plans:
            approvals_inbox.append({
                'kind': 'exception_plan', 'id': ep.id,
                'stage_id': getattr(ep, 'stage_id', None),
                'title': f"Exception Plan — {getattr(ep, 'title', '') or ep.id}",
                'subtitle': 'Exception Plan awaiting Project Board approval',
                'revised_budget': float(ep.revised_budget) if getattr(ep, 'revised_budget', None) is not None else None,
            })

        dashboard_data = {
            'project_id': project.id,
            'project_name': project.name,
            'overall_progress': overall_progress,
            'total_stages': total_stages,
            'completed_stages': completed_stages,
            'has_brief': brief is not None,
            'brief_status': brief.status if brief else None,
            'has_business_case': bc is not None,
            'business_case_status': bc.status if bc else None,
            'has_pid': pid is not None,
            'pid_status': pid.status if pid else None,
            'tolerances_exceeded': tolerances_exceeded,
            'current_process': current_process,
            'process_progress': process_progress,
            'budget_governance': budget_governance,
            'approvals_inbox': approvals_inbox,
            'approvals_count': len(approvals_inbox),
            'open_exceptions': open_exceptions,
            'risk_counts': risk_counts,
            'open_risks_total': risks_qs.count(),
            'top_risks': Prince2RiskSerializer(top_risks, many=True).data,
            'open_issues_total': open_issues.count(),
            'stages': StageSerializer(stages, many=True).data,
            'recent_highlight_reports': HighlightReportSerializer(recent_reports, many=True).data,
        }

        return Response(dashboard_data)


class ProjectBriefComputedView(APIView):
    """
    Read-only computed Project Brief derived from existing models.
    Mirrors the PRINCE2 Project Brief shape without introducing a new model.
    """
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get(self, request, project_id):
        from projects.models import Project, ProjectTeam
        project = get_object_or_404(
            Project, id=project_id, company=request.user.company
        )
        bc = BusinessCase.objects.filter(project=project).order_by('-created_at').first()

        team_structure = []
        for member in ProjectTeam.objects.filter(project=project, is_active=True).select_related('user'):
            user = member.user
            role_display = ''
            try:
                role_display = user.get_role_display()
            except Exception:
                role_display = getattr(user, 'role', '') or ''
            full_name = ''
            try:
                full_name = user.get_full_name()
            except Exception:
                full_name = getattr(user, 'email', '') or ''
            team_structure.append({
                'user_id': user.id,
                'name': full_name or getattr(user, 'email', ''),
                'email': getattr(user, 'email', ''),
                'role': role_display,
            })

        stages = list(
            Stage.objects.filter(project=project)
            .order_by('order')
            .values('id', 'name', 'order', 'status', 'progress_percentage')
        )

        background_text = project.description or ''
        return Response({
            'project_id': project.id,
            'project_name': project.name,
            # Both keys exposed: `background` is the canonical PRINCE2 label,
            # `project_definition` is kept for backward-compat clients.
            'background': background_text,
            'project_definition': background_text,
            'outline_business_case': (bc.executive_summary if bc else '') or '',
            'project_approach': getattr(project, 'methodology', '') or '',
            'project_management_team_structure': team_structure,
            'stages': stages,
        })


class ProjectClosureComputedView(APIView):
    """
    Read-only computed Project Closure payload derived from
    EndProjectReport, Lessons, and BusinessCase benefits.
    """
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get(self, request, project_id):
        from projects.models import Project
        project = get_object_or_404(
            Project, id=project_id, company=request.user.company
        )
        end_report = EndProjectReport.objects.filter(project=project).order_by('-created_at').first()
        bc = BusinessCase.objects.filter(project=project).order_by('-created_at').first()
        lessons_qs = LessonsLog.objects.filter(project=project)

        # "summary" field doesn't exist on EndProjectReport; fall back to
        # achievements_summary if present, else ''.
        summary_results = ''
        follow_on_actions = ''
        if end_report is not None:
            summary_results = (
                getattr(end_report, 'summary', None)
                or getattr(end_report, 'achievements_summary', '')
                or ''
            )
            follow_on_actions = getattr(end_report, 'follow_on_actions', '') or ''

        outcomes_achieved = ''
        if bc is not None:
            outcomes_achieved = bc.expected_benefits or ''

        return Response({
            'project_id': project.id,
            'project_name': project.name,
            'summary_results': summary_results,
            'lessons_learned_count': lessons_qs.count(),
            'outcomes_achieved': outcomes_achieved,
            'follow_on_actions': follow_on_actions,
            'has_end_project_report': end_report is not None,
            'end_project_report_status': end_report.status if end_report else None,
        })


class ProductStatusAccountView(APIView):
    """PRINCE2 Product Status Account (6th Ed §A.18).

    A read-only report giving the status of every product across the project
    (or a stage), derived from the Product register + linked Quality checks.
    Used by the Project Manager when planning, reporting and at stage boundaries.
    """
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get(self, request, project_id):
        from projects.models import Project
        project = get_object_or_404(Project, id=project_id, company=request.user.company)

        stage_id = request.query_params.get('stage')
        products = Product.objects.filter(project=project)
        if stage_id:
            products = products.filter(work_package__stage_id=stage_id)

        rows = []
        status_tally = {}
        for p in products.select_related('work_package', 'owner'):
            checks = QualityRegisterEntry.objects.filter(product=p)
            config_items = Prince2ConfigItem.objects.filter(product=p)
            rows.append({
                'id': p.id,
                'title': p.title,
                'product_type': p.product_type,
                'status': p.status,
                'work_package': p.work_package.title if p.work_package_id else None,
                'owner': p.owner.get_full_name() if p.owner_id else None,
                'quality_checks_total': checks.count(),
                'quality_checks_passed': checks.filter(result='pass').count(),
                'quality_checks_failed': checks.filter(result='fail').count(),
                'quality_checks_pending': checks.filter(result='pending').count(),
                'config_items': [
                    {'id': c.id, 'identifier': c.identifier, 'version': c.version, 'status': c.status}
                    for c in config_items
                ],
            })
            status_tally[p.status] = status_tally.get(p.status, 0) + 1

        return Response({
            'project_id': project.id,
            'project_name': project.name,
            'total_products': products.count(),
            'status_summary': status_tally,
            'products': rows,
            'config_items_total': Prince2ConfigItem.objects.filter(project=project).count(),
        })


class ProductViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        queryset = self.get_project_queryset(Product)
        work_package = self.request.query_params.get('work_package')
        if work_package:
            queryset = queryset.filter(work_package_id=work_package)
        return queryset

    def perform_create(self, serializer):
        project = self.get_project()
        serializer.save(project=project)

    @action(detail=True, methods=['post'])
    def approve(self, request, project_id=None, pk=None):
        product = self.get_object()
        product.status = 'approved'
        product.save()
        return Response(ProductSerializer(product).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, project_id=None, pk=None):
        product = self.get_object()
        product.status = 'rejected'
        product.save()
        return Response(ProductSerializer(product).data)


# =============================================================================
# LESSONS REPORT (compiled product) + CONFIGURATION ITEM RECORDS
# =============================================================================

class Prince2LessonsReportViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    """PRINCE2 Lessons Report (6th Ed §A.15). Compiled from the Lessons Log via
    LessonsLogViewSet.compile_report; also directly CRUD-able."""
    serializer_class = Prince2LessonsReportSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        return self.get_project_queryset(Prince2LessonsReport)

    def perform_create(self, serializer):
        serializer.save(project=self.get_project(), compiled_by=self.request.user)


class Prince2ConfigItemViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    """PRINCE2 Configuration Item Records (6th Ed §A.5) — change control."""
    serializer_class = Prince2ConfigItemSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        queryset = self.get_project_queryset(Prince2ConfigItem)
        product = self.request.query_params.get('product')
        status_filter = self.request.query_params.get('status')
        if product:
            queryset = queryset.filter(product_id=product)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset

    def perform_create(self, serializer):
        project = self.get_project()
        if not serializer.validated_data.get('identifier'):
            count = Prince2ConfigItem.objects.filter(project=project).count()
            serializer.save(project=project, identifier=f'CI-{count + 1:03d}')
        else:
            serializer.save(project=project)


# =============================================================================
# DEMO SEED + CLEAR
# =============================================================================
from accounts.permissions import HasRole
from django.contrib.auth import get_user_model

PRINCE2_DEMO_ROLES = HasRole("superadmin", "admin", "pm", "program_manager")


class Prince2SeedDemoView(APIView):
    permission_classes = [PRINCE2_DEMO_ROLES, MethodologyMatchesProjectPermission]

    def post(self, request, project_id=None):
        from datetime import date, timedelta
        from django.db import transaction
        from projects.models import Project
        User = get_user_model()
        project = get_object_or_404(Project, id=project_id)
        team_pool = list(User.objects.filter(company=project.company)[:7]) or [request.user]
        created = {}
        today = date.today()

        with transaction.atomic():
            # ---- Project Brief ----
            brief, brief_created = ProjectBrief.objects.get_or_create(
                project=project,
                defaults={
                    'background': f"{project.name} responds to a regulatory + market need to modernise core capabilities.",
                    'project_approach': 'Phased delivery with stage gates after each management stage.',
                    'outline_business_case': 'Strategic investment with positive NPV over 24 months.',
                    'project_objectives': '1. Compliance with new regulation by Q4\n2. 20% efficiency gain\n3. Reduce TCO by 15%',
                    'project_scope': 'In: core platform + reporting. Out: legacy migrations beyond data export.',
                    'project_team_structure': 'Project board + Project Manager + 3 Team Managers + delivery teams.',
                    'constraints': 'Fixed regulatory deadline; budget cap €750k.',
                    'assumptions': 'Stable scope post-PID; vendor SLAs honoured.',
                    'status': 'approved', 'version': '1.0',
                },
            )
            created['brief'] = 1 if brief_created else 0

            # ---- Business Case ----
            bc, bc_created = BusinessCase.objects.get_or_create(
                project=project,
                defaults={
                    'executive_summary': 'Investment in modernisation to meet compliance and efficiency targets.',
                    'reasons': 'Regulatory mandate; competitive pressure; aging tech stack.',
                    'business_options': 'Option 1: do nothing. Option 2: outsource. Option 3 (chosen): build internally with vendor.',
                    'expected_benefits': 'Compliance achieved; 20% process efficiency; improved CSAT.',
                    'expected_dis_benefits': 'Short-term productivity dip during transition.',
                    'timescale': '12 months end-to-end.',
                    'costs': 'Dev €500k + ongoing €120k/yr.',
                    'investment_appraisal': 'NPV positive at +€280k over 36 months.',
                    'major_risks': 'Vendor dependency; resource availability.',
                    'development_costs': 500000, 'ongoing_costs': 120000,
                    'roi_percentage': 35, 'net_present_value': 280000, 'payback_period_months': 18,
                    'status': 'approved', 'version': '1.0',
                },
            )
            bc_count = 1 if bc_created else 0
            created['business_case'] = bc_count
            ben_count = 0
            if not bc.benefits.exists():
                for desc, btype, val, timing, meas in [
                    ('Regulatory compliance achieved', 'non_financial', 'Required', 'Q4 go-live', True),
                    ('Operational cost savings', 'financial', '€180k/yr', '12 months post-go-live', True),
                    ('Improved customer satisfaction', 'intangible', '+10 NPS pts', '18 months post-go-live', False),
                ]:
                    BusinessCaseBenefit.objects.create(
                        business_case=bc, description=desc, benefit_type=btype,
                        value=val, timing=timing, measurable=meas,
                    )
                    ben_count += 1
            created['benefits'] = ben_count
            risk_count = 0
            if not bc.risks.exists():
                for desc, prob, impact, mit in [
                    ('Vendor delivers late', 'medium', 'high', 'Penalty clauses; backup vendor identified.'),
                    ('Key staff attrition', 'low', 'high', 'Retention bonuses + cross-training.'),
                    ('Regulatory scope change', 'medium', 'medium', 'Quarterly regulator engagement.'),
                ]:
                    BusinessCaseRisk.objects.create(
                        business_case=bc, description=desc, probability=prob, impact=impact, mitigation=mit,
                    )
                    risk_count += 1
            created['business_case_risks'] = risk_count

            # ---- PID ----
            _, pid_created = ProjectInitiationDocument.objects.get_or_create(
                project=project,
                defaults={
                    'project_definition': brief.background,
                    'project_approach': 'Phased waterfall with PRINCE2 stage gates.',
                    'project_objectives': brief.project_objectives,
                    'success_criteria': 'Compliance pass; 20% efficiency; on-budget delivery.',
                    'quality_management_approach': 'Stage-gate quality reviews; product-based QA.',
                    'risk_management_approach': 'Risk register with monthly board review; tolerances on time/cost/scope.',
                    'change_control_approach': 'Change Authority delegated up to €25k; above goes to Board.',
                    'communication_management_approach': 'Highlight Reports bi-weekly; ad-hoc Exception Reports.',
                    'project_controls': 'Stage gates, tolerances, board approvals.',
                    'tailoring': 'Tailored for medium-complexity, regulated environment.',
                    'status': 'baselined', 'version': '1.0',
                    'baseline_date': today - timedelta(days=60),
                },
            )
            created['pid'] = 1 if pid_created else 0

            # ---- Stages ----
            stages = list(Stage.objects.filter(project=project).order_by('order'))
            stage_count = 0
            if not stages:
                stages_seed = [
                    ('Initiation', 1, -90, -60, 'completed', 100),
                    ('Stage 1: Foundation', 2, -60, -20, 'completed', 100),
                    ('Stage 2: Build', 3, -20, 30, 'active', 55),
                    ('Stage 3: Deliver', 4, 30, 75, 'planned', 0),
                    ('Closure', 5, 75, 90, 'planned', 0),
                ]
                for name, order, s_off, e_off, status, prog in stages_seed:
                    s = Stage.objects.create(
                        project=project, name=name, order=order,
                        description=f"{name} stage of the project.",
                        objectives=f"Complete {name.lower()} deliverables and pass stage gate.",
                        planned_start_date=today + timedelta(days=s_off),
                        planned_end_date=today + timedelta(days=e_off),
                        actual_start_date=today + timedelta(days=s_off) if status != 'planned' else None,
                        actual_end_date=today + timedelta(days=e_off) if status == 'completed' else None,
                        time_tolerance='+5 days', cost_tolerance='+5%', scope_tolerance='Must-haves only',
                        status=status, progress_percentage=prog,
                    )
                    stages.append(s)
                    stage_count += 1
            created['stages'] = stage_count

            # Stage plans + gates
            sp_count = 0
            sg_count = 0
            for s in stages:
                if not s.plans.exists():
                    StagePlan.objects.create(
                        stage=s,
                        plan_description=f"Detailed plan for {s.name}.",
                        budget=125000,
                        resource_requirements='Project team + 2 contractors during build.',
                        quality_approach='Product-based QA; stage-end review.',
                        dependencies='Vendor delivery; sign-off from Senior User.',
                        assumptions='Stable scope; team availability.',
                        status='approved', version='1.0',
                    )
                    sp_count += 1
                if not s.gates.exists() and s.status == 'completed':
                    StageGate.objects.create(
                        stage=s, review_date=s.actual_end_date or today,
                        outcome='approved',
                        decision_notes='Stage products delivered; business case still valid; next stage authorised.',
                        stage_performance_summary=f"{s.name} delivered on plan with minor schedule slip absorbed by tolerance.",
                        products_completed='All planned management + specialist products.',
                        products_pending='None.',
                        lessons_learned='Engage QA earlier in the stage.',
                        business_case_still_valid=True, next_stage_plan_approved=True,
                        reviewer=team_pool[0],
                    )
                    sg_count += 1
            created['stage_plans'] = sp_count
            created['stage_gates'] = sg_count

            # ---- Work Packages ----
            wp_count = 0
            if not WorkPackage.objects.filter(project=project).exists() and stages:
                active_stage = next((s for s in stages if s.status == 'active'), stages[0])
                wp_seed = [
                    ('WP-001', 'Authentication module', 'in_progress', 'high', 60),
                    ('WP-002', 'Reporting engine', 'authorized', 'medium', 0),
                    ('WP-003', 'API gateway hardening', 'in_progress', 'high', 30),
                    ('WP-004', 'Compliance reporting', 'draft', 'high', 0),
                    ('WP-005', 'User management UI', 'completed', 'medium', 100),
                ]
                for ref, title, status, prio, prog in wp_seed:
                    WorkPackage.objects.create(
                        project=project, stage=active_stage, reference=ref, title=title,
                        description=f"Work package: {title}",
                        product_descriptions=f"Tested + documented {title.lower()}.",
                        techniques='Pair programming; TDD; weekly QA review.',
                        tolerances='Time +3d / Cost +5%',
                        constraints='Compliance deadline immovable.',
                        reporting_requirements='Weekly checkpoint to PM.',
                        team_manager=team_pool[1] if len(team_pool) > 1 else team_pool[0],
                        planned_start_date=today - timedelta(days=10),
                        planned_end_date=today + timedelta(days=20),
                        actual_start_date=today - timedelta(days=10) if status != 'draft' else None,
                        actual_end_date=today - timedelta(days=2) if status == 'completed' else None,
                        status=status, priority=prio, progress_percentage=prog,
                    )
                    wp_count += 1
            created['work_packages'] = wp_count

            # ---- Project Board ----
            board, board_created = ProjectBoard.objects.get_or_create(
                project=project,
                defaults={
                    'meeting_frequency': 'Bi-weekly',
                    'next_meeting_date': today + timedelta(days=10),
                    'governance_notes': 'Board reviews highlight reports and exceptions.',
                    'budget_authority': 750000,
                },
            )
            created['board'] = 1 if board_created else 0
            board_member_count = 0
            if not board.members.exists():
                board_roles = ['executive', 'senior_user', 'senior_supplier', 'project_manager']
                for idx, role in enumerate(board_roles):
                    if idx < len(team_pool):
                        ProjectBoardMember.objects.create(
                            board=board, user=team_pool[idx], role=role,
                            responsibilities=f"PRINCE2 {role.replace('_', ' ').title()} responsibilities.",
                        )
                        board_member_count += 1
            created['board_members'] = board_member_count

            # ---- Checkpoint Reports ----
            cp_count = 0
            if not CheckpointReport.objects.filter(project=project).exists():
                wps = list(WorkPackage.objects.filter(project=project)[:3])
                for idx, wp in enumerate(wps):
                    CheckpointReport.objects.create(
                        project=project, work_package=wp,
                        period_start=today - timedelta(days=14 - idx * 4),
                        period_end=today - timedelta(days=7 - idx * 4),
                        status=['green', 'amber', 'green'][idx % 3],
                        products_completed=f"Tasks 1-3 of {wp.title}",
                        products_planned=f"Tasks 4-6 of {wp.title}",
                        risks_issues_summary='No new risks; one issue resolved.',
                        team_manager=team_pool[1] if len(team_pool) > 1 else team_pool[0],
                    )
                    cp_count += 1
            created['checkpoint_reports'] = cp_count

            # ---- Highlight Reports ----
            hr_count = 0
            if not HighlightReport.objects.filter(project=project).exists():
                for idx, status in enumerate(['green', 'green', 'amber']):
                    HighlightReport.objects.create(
                        project=project, stage=stages[2] if len(stages) > 2 else stages[0],
                        report_date=today - timedelta(days=14 - idx * 7),
                        period_start=today - timedelta(days=21 - idx * 7),
                        period_end=today - timedelta(days=14 - idx * 7),
                        overall_status=status,
                        status_summary='Stage progressing on plan; tolerances within bounds.',
                        work_completed='WP-001 and WP-005 progressing; WP-005 closed.',
                        work_planned_next_period='Continue WP-001; start WP-003.',
                        issues_summary='1 vendor delay being managed.',
                        risks_summary='3 medium risks open; mitigations in place.',
                        budget_spent=250000 + idx * 50000, budget_forecast=520000,
                    )
                    hr_count += 1
            created['highlight_reports'] = hr_count

            # ---- Lessons Log ----
            ll_count = 0
            if not LessonsLog.objects.filter(project=project).exists():
                lessons_seed = [
                    ('Daily 15-min PM/TM sync caught risks early', 'positive', 'process'),
                    ('Late vendor onboarding cost 2 weeks', 'negative', 'supplier'),
                    ('Pair programming improved code quality', 'positive', 'people'),
                    ('Insufficient stakeholder availability for sign-off', 'negative', 'communication'),
                ]
                for title, ltype, cat in lessons_seed:
                    LessonsLog.objects.create(
                        project=project, title=title, lesson_type=ltype, category=cat,
                        description=f"Observation: {title}",
                        recommendation=('Continue this practice.' if ltype == 'positive' else 'Add explicit mitigation in next stage.'),
                        stage=stages[1] if len(stages) > 1 else stages[0],
                        logged_by=team_pool[0],
                    )
                    ll_count += 1
            created['lessons_log'] = ll_count

            # ---- Tolerances ----
            tol_count = 0
            if not ProjectTolerance.objects.filter(project=project).exists():
                tols_seed = [
                    ('time', 'Schedule tolerance', '+10 days', '-5 days'),
                    ('cost', 'Budget tolerance', '+5%', '-3%'),
                    ('scope', 'Scope tolerance', 'Must-haves only', 'No reduction below MVP'),
                    ('quality', 'Quality tolerance', 'Defect rate <2%', '0% critical defects'),
                ]
                for ttype, desc, plus, minus in tols_seed:
                    ProjectTolerance.objects.create(
                        project=project, tolerance_type=ttype, description=desc,
                        plus_tolerance=plus, minus_tolerance=minus,
                        current_status='Within bounds.', is_exceeded=False,
                    )
                    tol_count += 1
            created['tolerances'] = tol_count

            # ---- Products ----
            pr_count = 0
            if not Product.objects.filter(project=project).exists():
                prods_seed = [
                    ('Project Brief', 'management', 'PDF', 'approved'),
                    ('PID', 'management', 'PDF', 'approved'),
                    ('Authentication module', 'specialist', 'Software', 'in_progress'),
                    ('Reporting engine', 'specialist', 'Software', 'planned'),
                    ('User documentation', 'specialist', 'PDF', 'planned'),
                    ('End Project Report', 'management', 'PDF', 'planned'),
                ]
                for title, ptype, fmt, status in prods_seed:
                    Product.objects.create(
                        project=project, title=title,
                        description=f"{title} — required PRINCE2 product.",
                        product_type=ptype, format=fmt,
                        quality_criteria='Reviewed and signed off by Senior User.',
                        quality_tolerance='Minor formatting issues acceptable.',
                        quality_method='Document review; demo to stakeholders.',
                        quality_responsibility=team_pool[0],
                        derivation='Project Brief → PID → Stage Plans',
                        status=status, owner=team_pool[0],
                    )
                    pr_count += 1
            created['products'] = pr_count

        return Response({'success': True, 'project_id': project.id, 'created': created,
                         'message': f"PRINCE2 demo data seeded for {project.name}"})


class Prince2ClearDemoView(APIView):
    permission_classes = [PRINCE2_DEMO_ROLES, MethodologyMatchesProjectPermission]

    def post(self, request, project_id=None):
        from django.db import transaction
        from projects.models import Project
        project = get_object_or_404(Project, id=project_id)
        deleted = {}
        with transaction.atomic():
            for label, qs in [
                ('briefs', ProjectBrief.objects.filter(project=project)),
                ('business_cases', BusinessCase.objects.filter(project=project)),  # cascades benefits + risks
                ('pids', ProjectInitiationDocument.objects.filter(project=project)),
                ('stages', Stage.objects.filter(project=project)),  # cascades plans + gates
                ('work_packages', WorkPackage.objects.filter(project=project)),
                ('boards', ProjectBoard.objects.filter(project=project)),  # cascades members
                ('checkpoint_reports', CheckpointReport.objects.filter(project=project)),
                ('highlight_reports', HighlightReport.objects.filter(project=project)),
                ('end_reports', EndProjectReport.objects.filter(project=project)),
                ('lessons', LessonsLog.objects.filter(project=project)),
                ('tolerances', ProjectTolerance.objects.filter(project=project)),
                ('products', Product.objects.filter(project=project)),
            ]:
                deleted[label] = qs.count()
                qs.delete()
        return Response({'success': True, 'deleted': deleted})
