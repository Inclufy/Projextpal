from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import date

from projects.models import Project
from .models import (
    WaterfallPhase, WaterfallTeamMember, WaterfallRequirement,
    WaterfallDesignDocument, WaterfallTask, WaterfallTestCase,
    WaterfallMilestone, WaterfallGanttTask, WaterfallChangeRequest,
    WaterfallDeploymentChecklist, WaterfallMaintenanceItem,
    WaterfallBudget, WaterfallBudgetItem
)
from .serializers import (
    WaterfallPhaseSerializer, WaterfallTeamMemberSerializer,
    WaterfallTeamMemberCreateSerializer, WaterfallRequirementSerializer,
    WaterfallDesignDocumentSerializer, WaterfallTaskSerializer,
    WaterfallTestCaseSerializer, WaterfallMilestoneSerializer,
    WaterfallGanttTaskSerializer, WaterfallChangeRequestSerializer,
    WaterfallDeploymentChecklistSerializer, WaterfallMaintenanceItemSerializer,
    WaterfallBudgetSerializer, WaterfallBudgetItemSerializer,
    WaterfallDashboardSerializer
)

User = get_user_model()


class WaterfallProjectMixin:
    """Mixin to filter by project"""
    def get_project(self):
        project_id = self.kwargs.get('project_id')
        return get_object_or_404(Project, id=project_id)
    
    def get_queryset(self):
        return super().get_queryset().filter(project=self.get_project())


# ============================================
# DASHBOARD VIEW
# ============================================

class WaterfallDashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    
    def retrieve(self, request, project_id=None):
        project = get_object_or_404(Project, id=project_id)
        
        # Check if initialized
        phases = WaterfallPhase.objects.filter(project=project).order_by('order')
        has_initialized = phases.exists()
        
        # Current phase
        current_phase = phases.filter(status='in_progress').first()
        
        # Overall progress
        if phases.exists():
            total_progress = phases.aggregate(avg=Sum('progress'))['avg'] or 0
            overall_progress = int(total_progress / phases.count())
        else:
            overall_progress = 0
        
        # Days remaining (from last phase end date)
        last_phase = phases.last()
        if last_phase and last_phase.end_date:
            days_remaining = (last_phase.end_date - date.today()).days
            days_remaining = max(0, days_remaining)
        else:
            days_remaining = 0
        
        # Milestones
        milestones = WaterfallMilestone.objects.filter(project=project)
        total_milestones = milestones.count()
        completed_milestones = milestones.filter(status='completed').count()
        at_risk_milestones = milestones.filter(status__in=['at_risk', 'overdue']).count()
        
        # Team size
        team_size = WaterfallTeamMember.objects.filter(project=project).count()
        
        # Pending change requests
        pending_cr = WaterfallChangeRequest.objects.filter(
            project=project,
            status__in=['submitted', 'under_review']
        ).count()
        
        # Budget utilization
        budget = WaterfallBudget.objects.filter(project=project).first()
        if budget and budget.total_budget > 0:
            budget_utilization = float((budget.total_spent / budget.total_budget) * 100)
        else:
            budget_utilization = 0
        
        data = {
            'has_initialized': has_initialized,
            'current_phase': WaterfallPhaseSerializer(current_phase).data if current_phase else None,
            'phases': WaterfallPhaseSerializer(phases, many=True).data,
            'overall_progress': overall_progress,
            'days_remaining': days_remaining,
            'total_milestones': total_milestones,
            'completed_milestones': completed_milestones,
            'at_risk_milestones': at_risk_milestones,
            'team_size': team_size,
            'pending_change_requests': pending_cr,
            'budget_utilization': budget_utilization,
        }
        
        return Response(data)
    
    @action(detail=False, methods=['post'])
    def initialize(self, request, project_id=None):
        """Initialize Waterfall methodology with default phases"""
        project = get_object_or_404(Project, id=project_id)
        
        # Create default phases if not exist
        default_phases = [
            ('requirements', 'Requirements'),
            ('design', 'Design'),
            ('development', 'Development'),
            ('testing', 'Testing'),
            ('deployment', 'Deployment'),
            ('maintenance', 'Maintenance'),
        ]
        
        for idx, (phase_type, name) in enumerate(default_phases):
            WaterfallPhase.objects.get_or_create(
                project=project,
                phase_type=phase_type,
                defaults={
                    'name': name,
                    'order': idx,
                }
            )
        
        # Create default budget
        WaterfallBudget.objects.get_or_create(project=project)
        
        return Response({'status': 'initialized'})


# ============================================
# PHASE VIEWS
# ============================================

class WaterfallPhaseViewSet(WaterfallProjectMixin, viewsets.ModelViewSet):
    queryset = WaterfallPhase.objects.all()
    serializer_class = WaterfallPhaseSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        max_order = WaterfallPhase.objects.filter(
            project=self.get_project()
        ).aggregate(max=models.Max('order'))['max'] or 0
        serializer.save(project=self.get_project(), order=max_order + 1)
    
    @action(detail=True, methods=['post'])
    def start(self, request, pk=None, project_id=None):
        """Start a phase"""
        phase = self.get_object()
        
        # Check previous phase is completed
        prev_phase = WaterfallPhase.objects.filter(
            project=self.get_project(),
            order__lt=phase.order
        ).order_by('-order').first()
        
        if prev_phase and prev_phase.status != 'completed':
            return Response(
                {'error': 'Previous phase must be completed first'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        phase.status = 'in_progress'
        phase.actual_start_date = date.today()
        phase.save()
        
        return Response(WaterfallPhaseSerializer(phase).data)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None, project_id=None):
        """Complete a phase"""
        phase = self.get_object()
        phase.status = 'completed'
        phase.progress = 100
        phase.actual_end_date = date.today()
        phase.save()
        
        return Response(WaterfallPhaseSerializer(phase).data)
    
    @action(detail=True, methods=['post'])
    def sign_off(self, request, pk=None, project_id=None):
        """Sign off on a phase"""
        phase = self.get_object()
        phase.signed_off_by = request.user
        phase.signed_off_at = timezone.now()
        phase.save()
        
        return Response(WaterfallPhaseSerializer(phase).data)


# ============================================
# TEAM VIEWS
# ============================================

class WaterfallTeamViewSet(WaterfallProjectMixin, viewsets.ModelViewSet):
    queryset = WaterfallTeamMember.objects.all()
    serializer_class = WaterfallTeamMemberSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return WaterfallTeamMemberCreateSerializer
        return WaterfallTeamMemberSerializer
    
    def create(self, request, project_id=None):
        project = self.get_project()
        serializer = WaterfallTeamMemberCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user_email = serializer.validated_data['user_email']
        user = User.objects.filter(email=user_email).first()
        if not user:
            return Response(
                {'error': f'User with email {user_email} not found'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if WaterfallTeamMember.objects.filter(project=project, user=user).exists():
            return Response(
                {'error': 'User is already a team member'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        phase_id = serializer.validated_data.get('phase')
        phase = None
        if phase_id:
            phase = get_object_or_404(WaterfallPhase, id=phase_id, project=project)
        
        member = WaterfallTeamMember.objects.create(
            project=project,
            user=user,
            role=serializer.validated_data['role'],
            phase=phase,
            allocation_percentage=serializer.validated_data.get('allocation_percentage', 100),
        )
        
        return Response(WaterfallTeamMemberSerializer(member).data, status=status.HTTP_201_CREATED)


# ============================================
# REQUIREMENTS VIEWS
# ============================================

class WaterfallRequirementViewSet(WaterfallProjectMixin, viewsets.ModelViewSet):
    queryset = WaterfallRequirement.objects.all()
    serializer_class = WaterfallRequirementSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by type
        req_type = self.request.query_params.get('type')
        if req_type:
            queryset = queryset.filter(requirement_type=req_type)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by priority
        priority = self.request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)
        
        return queryset
    
    def perform_create(self, serializer):
        # Auto-generate requirement_id
        project = self.get_project()
        last_req = WaterfallRequirement.objects.filter(project=project).order_by('-id').first()
        if last_req:
            try:
                num = int(last_req.requirement_id.split('-')[1]) + 1
            except:
                num = 1
        else:
            num = 1
        
        requirement_id = f"REQ-{num:03d}"
        serializer.save(project=project, requirement_id=requirement_id, created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None, project_id=None):
        """Approve a requirement"""
        requirement = self.get_object()
        requirement.status = 'approved'
        requirement.approved_by = request.user
        requirement.save()
        return Response(WaterfallRequirementSerializer(requirement).data)


# ============================================
# DESIGN VIEWS
# ============================================

class WaterfallDesignDocumentViewSet(WaterfallProjectMixin, viewsets.ModelViewSet):
    queryset = WaterfallDesignDocument.objects.all()
    serializer_class = WaterfallDesignDocumentSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(project=self.get_project(), author=self.request.user)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None, project_id=None):
        """Approve a design document"""
        doc = self.get_object()
        doc.status = 'approved'
        doc.reviewer = request.user
        doc.save()
        return Response(WaterfallDesignDocumentSerializer(doc).data)


# ============================================
# TASK VIEWS
# ============================================

class WaterfallTaskViewSet(WaterfallProjectMixin, viewsets.ModelViewSet):
    queryset = WaterfallTask.objects.all()
    serializer_class = WaterfallTaskSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by phase
        phase_id = self.request.query_params.get('phase')
        if phase_id:
            queryset = queryset.filter(phase_id=phase_id)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(project=self.get_project())
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None, project_id=None):
        """Mark task as completed"""
        task = self.get_object()
        task.status = 'completed'
        task.completed_date = date.today()
        task.save()
        return Response(WaterfallTaskSerializer(task).data)


# ============================================
# TEST CASE VIEWS
# ============================================

class WaterfallTestCaseViewSet(WaterfallProjectMixin, viewsets.ModelViewSet):
    queryset = WaterfallTestCase.objects.all()
    serializer_class = WaterfallTestCaseSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by type
        test_type = self.request.query_params.get('type')
        if test_type:
            queryset = queryset.filter(test_type=test_type)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset
    
    def perform_create(self, serializer):
        # Auto-generate test_id
        project = self.get_project()
        last_tc = WaterfallTestCase.objects.filter(project=project).order_by('-id').first()
        if last_tc:
            try:
                num = int(last_tc.test_id.split('-')[1]) + 1
            except:
                num = 1
        else:
            num = 1
        
        test_id = f"TC-{num:03d}"
        serializer.save(project=project, test_id=test_id)
    
    @action(detail=True, methods=['post'])
    def execute(self, request, pk=None, project_id=None):
        """Execute test case"""
        test = self.get_object()
        test.status = request.data.get('status', 'passed')
        test.actual_result = request.data.get('actual_result', '')
        test.executed_at = timezone.now()
        test.executed_by = request.user
        test.save()
        return Response(WaterfallTestCaseSerializer(test).data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request, project_id=None):
        """Get test statistics"""
        project = self.get_project()
        tests = WaterfallTestCase.objects.filter(project=project)
        
        stats = {
            'total': tests.count(),
            'passed': tests.filter(status='passed').count(),
            'failed': tests.filter(status='failed').count(),
            'pending': tests.filter(status='pending').count(),
            'blocked': tests.filter(status='blocked').count(),
        }
        
        if stats['passed'] + stats['failed'] > 0:
            stats['pass_rate'] = round(
                (stats['passed'] / (stats['passed'] + stats['failed'])) * 100, 1
            )
        else:
            stats['pass_rate'] = 0
        
        return Response(stats)


# ============================================
# MILESTONE VIEWS
# ============================================

class WaterfallMilestoneViewSet(WaterfallProjectMixin, viewsets.ModelViewSet):
    queryset = WaterfallMilestone.objects.all()
    serializer_class = WaterfallMilestoneSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(project=self.get_project())
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None, project_id=None):
        """Mark milestone as completed"""
        milestone = self.get_object()
        milestone.status = 'completed'
        milestone.completed_date = date.today()
        milestone.save()
        return Response(WaterfallMilestoneSerializer(milestone).data)


# ============================================
# GANTT CHART VIEWS
# ============================================

class WaterfallGanttTaskViewSet(WaterfallProjectMixin, viewsets.ModelViewSet):
    queryset = WaterfallGanttTask.objects.all()
    serializer_class = WaterfallGanttTaskSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(project=self.get_project())
    
    @action(detail=True, methods=['post'])
    def update_progress(self, request, pk=None, project_id=None):
        """Update task progress"""
        task = self.get_object()
        task.progress = request.data.get('progress', task.progress)
        task.save()
        return Response(WaterfallGanttTaskSerializer(task).data)
    
    @action(detail=True, methods=['post'])
    def update_dates(self, request, pk=None, project_id=None):
        """Update task dates"""
        task = self.get_object()
        task.start_date = request.data.get('start_date', task.start_date)
        task.end_date = request.data.get('end_date', task.end_date)
        task.save()
        return Response(WaterfallGanttTaskSerializer(task).data)


# ============================================
# CHANGE REQUEST VIEWS
# ============================================

class WaterfallChangeRequestViewSet(WaterfallProjectMixin, viewsets.ModelViewSet):
    queryset = WaterfallChangeRequest.objects.all()
    serializer_class = WaterfallChangeRequestSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset
    
    def perform_create(self, serializer):
        # Auto-generate change_id
        project = self.get_project()
        last_cr = WaterfallChangeRequest.objects.filter(project=project).order_by('-id').first()
        if last_cr:
            try:
                num = int(last_cr.change_id.split('-')[1]) + 1
            except:
                num = 1
        else:
            num = 1
        
        change_id = f"CR-{num:03d}"
        serializer.save(project=project, change_id=change_id, requested_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None, project_id=None):
        """Approve change request"""
        cr = self.get_object()
        cr.status = 'approved'
        cr.reviewed_by = request.user
        cr.approval_date = date.today()
        cr.notes = request.data.get('notes', cr.notes)
        cr.save()
        return Response(WaterfallChangeRequestSerializer(cr).data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None, project_id=None):
        """Reject change request"""
        cr = self.get_object()
        cr.status = 'rejected'
        cr.reviewed_by = request.user
        cr.approval_date = date.today()
        cr.notes = request.data.get('notes', cr.notes)
        cr.save()
        return Response(WaterfallChangeRequestSerializer(cr).data)


# ============================================
# DEPLOYMENT VIEWS
# ============================================

class WaterfallDeploymentChecklistViewSet(WaterfallProjectMixin, viewsets.ModelViewSet):
    queryset = WaterfallDeploymentChecklist.objects.all()
    serializer_class = WaterfallDeploymentChecklistSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(project=self.get_project())
    
    @action(detail=True, methods=['post'])
    def toggle(self, request, pk=None, project_id=None):
        """Toggle checklist item"""
        item = self.get_object()
        item.is_completed = not item.is_completed
        if item.is_completed:
            item.completed_by = request.user
            item.completed_at = timezone.now()
        else:
            item.completed_by = None
            item.completed_at = None
        item.save()
        return Response(WaterfallDeploymentChecklistSerializer(item).data)
    
    @action(detail=False, methods=['post'])
    def initialize_defaults(self, request, project_id=None):
        """Initialize default checklist items"""
        project = self.get_project()
        
        defaults = [
            ('testing', 'All test cases passed', True),
            ('testing', 'Performance tests completed', True),
            ('testing', 'Security scan completed', True),
            ('documentation', 'Release notes prepared', True),
            ('documentation', 'User manual updated', True),
            ('infrastructure', 'Production environment ready', True),
            ('infrastructure', 'Database backup completed', True),
            ('infrastructure', 'Rollback plan documented', True),
            ('approval', 'Stakeholder sign-off', True),
            ('approval', 'Change Advisory Board approval', True),
        ]
        
        for idx, (category, item, required) in enumerate(defaults):
            WaterfallDeploymentChecklist.objects.get_or_create(
                project=project,
                item=item,
                defaults={
                    'category': category,
                    'is_required': required,
                    'order': idx,
                }
            )
        
        return Response({'status': 'initialized'})


# ============================================
# MAINTENANCE VIEWS
# ============================================

class WaterfallMaintenanceItemViewSet(WaterfallProjectMixin, viewsets.ModelViewSet):
    queryset = WaterfallMaintenanceItem.objects.all()
    serializer_class = WaterfallMaintenanceItemSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by type
        item_type = self.request.query_params.get('type')
        if item_type:
            queryset = queryset.filter(item_type=item_type)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(project=self.get_project(), reported_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None, project_id=None):
        """Resolve maintenance item"""
        item = self.get_object()
        item.status = 'resolved'
        item.resolved_date = date.today()
        item.resolution = request.data.get('resolution', '')
        item.save()
        return Response(WaterfallMaintenanceItemSerializer(item).data)


# ============================================
# BUDGET VIEWS
# ============================================

class WaterfallBudgetViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    
    def retrieve(self, request, project_id=None):
        project = get_object_or_404(Project, id=project_id)
        budget, _ = WaterfallBudget.objects.get_or_create(project=project)
        return Response(WaterfallBudgetSerializer(budget).data)
    
    def update(self, request, project_id=None):
        project = get_object_or_404(Project, id=project_id)
        budget, _ = WaterfallBudget.objects.get_or_create(project=project)
        serializer = WaterfallBudgetSerializer(budget, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class WaterfallBudgetItemViewSet(viewsets.ModelViewSet):
    queryset = WaterfallBudgetItem.objects.all()
    serializer_class = WaterfallBudgetItemSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        project = get_object_or_404(Project, id=project_id)
        budget = WaterfallBudget.objects.filter(project=project).first()
        if budget:
            return WaterfallBudgetItem.objects.filter(budget=budget)
        return WaterfallBudgetItem.objects.none()
    
    def perform_create(self, serializer):
        project = get_object_or_404(Project, id=self.kwargs.get('project_id'))
        budget, _ = WaterfallBudget.objects.get_or_create(project=project)
        serializer.save(budget=budget)
