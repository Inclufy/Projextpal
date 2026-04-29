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
)
from .serializers import (
    ProductSerializer,
    ProjectBriefSerializer, BusinessCaseSerializer, BusinessCaseBenefitSerializer,
    BusinessCaseRiskSerializer, ProjectInitiationDocumentSerializer,
    StageSerializer, StagePlanSerializer, StageGateSerializer, WorkPackageSerializer,
    ProjectBoardSerializer, ProjectBoardMemberSerializer, HighlightReportSerializer,
    CheckpointReportSerializer,
    EndProjectReportSerializer, LessonsLogSerializer, ProjectToleranceSerializer,
)


class ProjectFilterMixin:
    """Mixin to filter by project and company - same as sixsigma"""
    
    def get_project_queryset(self, model):
        project_id = self.kwargs.get('project_id')
        return model.objects.filter(
            project_id=project_id,
            project__company=self.request.user.company
        )

    def get_project(self):
        from projects.models import Project
        project_id = self.kwargs.get('project_id')
        return get_object_or_404(
            Project,
            id=project_id,
            company=self.request.user.company
        )


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
        status_filter = self.request.query_params.get('status')
        if stage:
            queryset = queryset.filter(stage_id=stage)
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
        wp = self.get_object()
        wp.status = 'authorized'
        wp.save()
        return Response(WorkPackageSerializer(wp).data)

    @action(detail=True, methods=['post'])
    def start(self, request, project_id=None, pk=None):
        wp = self.get_object()
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
        serializer.save(project=project)

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
        report = self.get_object()
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


class ProductViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        return self.get_project_queryset(Product)

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
