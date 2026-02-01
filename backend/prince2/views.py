from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import (
    ProjectBrief, BusinessCase, BusinessCaseBenefit, BusinessCaseRisk,
    ProjectInitiationDocument, Stage, StagePlan, StageGate, WorkPackage,
    ProjectBoard, ProjectBoardMember, HighlightReport, EndProjectReport,
    LessonsLog, ProjectTolerance
)
from .serializers import (
    ProjectBriefSerializer, BusinessCaseSerializer, BusinessCaseBenefitSerializer,
    BusinessCaseRiskSerializer, ProjectInitiationDocumentSerializer,
    StageSerializer, StagePlanSerializer, StageGateSerializer, WorkPackageSerializer,
    ProjectBoardSerializer, ProjectBoardMemberSerializer, HighlightReportSerializer,
    EndProjectReportSerializer, LessonsLogSerializer, ProjectToleranceSerializer
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
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return BusinessCaseBenefit.objects.filter(
            business_case__project_id=project_id,
            business_case__project__company=self.request.user.company
        )


class BusinessCaseRiskViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = BusinessCaseRiskSerializer
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.get_project_queryset(HighlightReport)

    def perform_create(self, serializer):
        project = self.get_project()
        serializer.save(project=project)


class EndProjectReportViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = EndProjectReportSerializer
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.get_project_queryset(ProjectTolerance)

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
    permission_classes = [IsAuthenticated]

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
