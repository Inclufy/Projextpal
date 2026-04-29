from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Sum, Count, Q, Max, Min, Avg
from django.db import IntegrityError
from django.utils import timezone
from datetime import date

from projects.models import Project
from projects.permissions import MethodologyMatchesProjectPermission
from .models import (
    WaterfallPhase, WaterfallTeamMember, WaterfallRequirement,
    WaterfallDesignDocument, WaterfallTask, WaterfallTestCase,
    WaterfallMilestone, WaterfallGanttTask, WaterfallChangeRequest,
    WaterfallDeploymentChecklist, WaterfallMaintenanceItem,
    WaterfallBudget, WaterfallBudgetItem,
    WaterfallRisk, WaterfallIssue, WaterfallDeliverable, WaterfallBaseline
)
from .serializers import (
    WaterfallPhaseSerializer, WaterfallTeamMemberSerializer,
    WaterfallTeamMemberCreateSerializer, WaterfallRequirementSerializer,
    WaterfallDesignDocumentSerializer, WaterfallTaskSerializer,
    WaterfallTestCaseSerializer, WaterfallMilestoneSerializer,
    WaterfallGanttTaskSerializer, WaterfallChangeRequestSerializer,
    WaterfallDeploymentChecklistSerializer, WaterfallMaintenanceItemSerializer,
    WaterfallBudgetSerializer, WaterfallBudgetItemSerializer,
    WaterfallDashboardSerializer,
    WaterfallRiskSerializer, WaterfallIssueSerializer,
    WaterfallDeliverableSerializer, WaterfallBaselineSerializer
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
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]
    
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
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]
    
    def perform_create(self, serializer):
        project = self.get_project()
        max_order = WaterfallPhase.objects.filter(
            project=project
        ).aggregate(max=Max('order'))['max'] or 0
        # unique_together = ['project', 'phase_type']: raise clean 400
        # instead of bubbling IntegrityError → 500 when the same phase_type
        # already exists (e.g. after initialize/ seeded defaults).
        try:
            serializer.save(project=project, order=max_order + 1)
        except IntegrityError as e:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({
                'phase_type': [
                    f"A phase of this type already exists for this project."
                ]
            })

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
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return WaterfallTeamMemberCreateSerializer
        return WaterfallTeamMemberSerializer

    def list(self, request, project_id=None, *args, **kwargs):
        """Return Waterfall team rows; if none exist, fall back to the
        generic ProjectTeam so the methodology-specific tab isn't blank.
        """
        wf_qs = self.get_queryset()
        if wf_qs.exists():
            return Response(WaterfallTeamMemberSerializer(wf_qs, many=True).data)

        from projects.models import ProjectTeam
        generic = ProjectTeam.objects.filter(
            project_id=project_id, is_active=True
        ).select_related('user')
        payload = [
            {
                'id': None,
                'project': int(project_id) if project_id else None,
                'user': pt.user_id,
                'user_name': pt.user.get_full_name(),
                'user_email': pt.user.email,
                'role': 'developer',
                'role_display': 'Developer',
                'phase': None,
                'allocation_percentage': 100,
                'start_date': None,
                'end_date': None,
                '_source': 'generic_project_team',
            }
            for pt in generic
        ]
        return Response(payload)

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
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]
    
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
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]
    
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
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]
    
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
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]
    
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
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]
    
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
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def perform_create(self, serializer):
        serializer.save(project=self.get_project())

    def list(self, request, *args, **kwargs):
        """List Gantt tasks and (re)compute critical path before serializing.

        CPM (Critical Path Method) — PMBoK 7 schedule mgmt:
          forward pass for ES/EF, backward pass for LS/LF;
          total float = LS - ES; tasks with float == 0 are on the critical path.
        Topological sort via Kahn's algorithm; cycle-safe (bails out).
        """
        self._recompute_critical_path()
        return super().list(request, *args, **kwargs)

    def _recompute_critical_path(self):
        tasks = list(self.get_queryset().prefetch_related('dependencies'))
        if not tasks:
            return

        ids = {t.id for t in tasks}
        preds = {t.id: [d.id for d in t.dependencies.all() if d.id in ids] for t in tasks}
        succs = {tid: [] for tid in ids}
        for tid, plist in preds.items():
            for p in plist:
                succs[p].append(tid)

        durations = {}
        for t in tasks:
            if t.start_date and t.end_date:
                d = (t.end_date - t.start_date).days + 1
            else:
                d = 1
            durations[t.id] = max(1, d)

        in_deg = {tid: len(preds[tid]) for tid in ids}
        order = []
        queue = [tid for tid, d in in_deg.items() if d == 0]
        while queue:
            tid = queue.pop(0)
            order.append(tid)
            for s in succs[tid]:
                in_deg[s] -= 1
                if in_deg[s] == 0:
                    queue.append(s)
        if len(order) != len(ids):
            return  # cycle — abort silently

        es = {tid: 0 for tid in ids}
        ef = {tid: 0 for tid in ids}
        for tid in order:
            es[tid] = max((ef[p] for p in preds[tid]), default=0)
            ef[tid] = es[tid] + durations[tid]

        project_finish = max(ef.values()) if ef else 0
        lf = {tid: project_finish for tid in ids}
        ls = {tid: project_finish for tid in ids}
        for tid in reversed(order):
            lf[tid] = min((ls[s] for s in succs[tid]), default=project_finish)
            ls[tid] = lf[tid] - durations[tid]

        to_update = []
        for t in tasks:
            critical = (ls[t.id] - es[t.id]) == 0
            if t.is_critical != critical:
                t.is_critical = critical
                to_update.append(t)
        if to_update:
            WaterfallGanttTask.objects.bulk_update(to_update, ['is_critical'])

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
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]
    
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
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]
    
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
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]
    
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
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]
    
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
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]
    
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


# Risk ViewSet
class WaterfallRiskViewSet(WaterfallProjectMixin, viewsets.ModelViewSet):
    serializer_class = WaterfallRiskSerializer
    
    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return WaterfallRisk.objects.filter(project_id=project_id)


# Issue ViewSet
class WaterfallIssueViewSet(WaterfallProjectMixin, viewsets.ModelViewSet):
    serializer_class = WaterfallIssueSerializer
    
    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return WaterfallIssue.objects.filter(project_id=project_id)


# Deliverable ViewSet
class WaterfallDeliverableViewSet(WaterfallProjectMixin, viewsets.ModelViewSet):
    serializer_class = WaterfallDeliverableSerializer
    
    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return WaterfallDeliverable.objects.filter(project_id=project_id)


# Baseline ViewSet
class WaterfallBaselineViewSet(WaterfallProjectMixin, viewsets.ModelViewSet):
    serializer_class = WaterfallBaselineSerializer

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return WaterfallBaseline.objects.filter(project_id=project_id)


# =============================================================================
# DEMO SEED + CLEAR
# =============================================================================
from rest_framework.views import APIView
from accounts.permissions import HasRole

DEMO_ROLES = HasRole("superadmin", "admin", "pm", "program_manager")


class WaterfallSeedDemoView(APIView):
    permission_classes = [DEMO_ROLES, MethodologyMatchesProjectPermission]

    def post(self, request, project_id=None):
        from datetime import timedelta
        from django.db import transaction
        User = get_user_model()
        project = get_object_or_404(Project, id=project_id)
        team_pool = list(User.objects.filter(company=project.company)[:6]) or [request.user]
        created = {}
        today = date.today()

        with transaction.atomic():
            # ---- Phases ----
            phases_seed = [
                ('requirements', 'Requirements', -90, -60, 'completed', 100, True),
                ('design',       'Design',       -60, -30, 'completed', 100, True),
                ('development',  'Development',  -30,  20, 'in_progress', 60, False),
                ('testing',      'Testing',       10,  35, 'not_started', 0, False),
                ('deployment',   'Deployment',    35,  45, 'not_started', 0, False),
                ('maintenance',  'Maintenance',   45, 180, 'not_started', 0, False),
            ]
            phases = {}
            phases_created = 0
            for order, (ptype, name, s_off, e_off, status, prog, signed) in enumerate(phases_seed):
                phase, was_created = WaterfallPhase.objects.get_or_create(
                    project=project, phase_type=ptype,
                    defaults={
                        'name': name, 'order': order, 'status': status, 'progress': prog,
                        'start_date': today + timedelta(days=s_off),
                        'end_date': today + timedelta(days=e_off),
                        'actual_start_date': today + timedelta(days=s_off) if status != 'not_started' else None,
                        'actual_end_date': today + timedelta(days=e_off) if status == 'completed' else None,
                        'signed_off_by': team_pool[0] if signed else None,
                        'signed_off_at': timezone.now() if signed else None,
                        'description': f"{name} phase deliverables and exit criteria.",
                    },
                )
                phases[ptype] = phase
                if was_created:
                    phases_created += 1
            created['phases'] = phases_created

            # ---- Team ----
            team_count = 0
            roles = ['project_manager', 'business_analyst', 'architect', 'developer', 'qa_lead', 'devops']
            for idx, member in enumerate(team_pool):
                _, c = WaterfallTeamMember.objects.get_or_create(
                    project=project, user=member,
                    defaults={'role': roles[idx % len(roles)], 'allocation_percentage': 100,
                              'phase': phases['development'], 'start_date': today - timedelta(days=90)},
                )
                if c:
                    team_count += 1
            created['team'] = team_count

            # ---- Requirements ----
            req_count = 0
            if not WaterfallRequirement.objects.filter(project=project).exists():
                reqs_seed = [
                    ('REQ-001', 'User registration with email + password', 'functional', 'must_have', 'approved'),
                    ('REQ-002', 'Multi-factor authentication via TOTP', 'functional', 'must_have', 'approved'),
                    ('REQ-003', 'Role-based access control (admin/user/guest)', 'functional', 'must_have', 'approved'),
                    ('REQ-004', 'System uptime ≥99.9% over rolling 30 days', 'non_functional', 'must_have', 'approved'),
                    ('REQ-005', 'Audit log for sensitive actions retained 1 year', 'business', 'should_have', 'approved'),
                    ('REQ-006', 'REST API documented with OpenAPI 3', 'technical', 'must_have', 'approved'),
                    ('REQ-007', 'GDPR-compliant data export and erasure', 'business', 'must_have', 'review'),
                    ('REQ-008', 'Single sign-on with SAML 2.0', 'interface', 'should_have', 'draft'),
                    ('REQ-009', 'Localization (NL/EN/FR) for UI strings', 'functional', 'should_have', 'draft'),
                    ('REQ-010', 'Mobile-responsive at 320px+', 'non_functional', 'should_have', 'approved'),
                ]
                for rid, title, rtype, prio, status in reqs_seed:
                    WaterfallRequirement.objects.create(
                        project=project, requirement_id=rid, title=title,
                        description=f"Detailed specification for: {title}",
                        requirement_type=rtype, priority=prio, status=status,
                        source='Product Owner / Stakeholder workshop',
                        acceptance_criteria=f"Given the system\nWhen {title.lower()}\nThen the requirement is met.",
                        created_by=team_pool[0],
                        approved_by=team_pool[0] if status == 'approved' else None,
                    )
                    req_count += 1
            created['requirements'] = req_count

            # ---- Design Documents ----
            design_count = 0
            if not WaterfallDesignDocument.objects.filter(project=project).exists():
                from .models import WaterfallDesignDocument as _DD
                # Inspect fields safely
                try:
                    docs_seed = [
                        ('System Architecture v1', 'architecture', 'approved', '1.0'),
                        ('Database ERD + schema', 'database', 'approved', '1.0'),
                        ('UI/UX wireframes', 'ui_ux', 'approved', '1.1'),
                        ('REST API contract', 'api', 'review', '0.9'),
                        ('Security threat model', 'security', 'approved', '1.0'),
                    ]
                    for title, dtype, status, version in docs_seed:
                        kwargs = {
                            'project': project, 'title': title, 'document_type': dtype,
                            'version': version, 'status': status,
                            'description': f"{title} — main reference document for the {dtype} workstream.",
                            'created_by': team_pool[0] if hasattr(_DD, 'created_by') else None,
                        }
                        # filter to actual fields
                        valid = {k: v for k, v in kwargs.items() if k in [f.name for f in _DD._meta.get_fields()]}
                        _DD.objects.create(**valid)
                        design_count += 1
                except Exception:
                    pass
            created['design_docs'] = design_count

            # ---- Tasks ----
            task_count = 0
            if not WaterfallTask.objects.filter(project=project).exists() and phases:
                tasks_seed = [
                    ('Set up dev environment', 'development', 'high', 'completed', 8, 7),
                    ('Implement auth module', 'development', 'critical', 'in_progress', 24, 12),
                    ('Implement RBAC', 'development', 'high', 'in_progress', 16, 6),
                    ('Database migrations + seed', 'development', 'medium', 'completed', 6, 5),
                    ('Build admin dashboard UI', 'development', 'medium', 'todo', 20, 0),
                    ('Wireframe approval', 'design', 'medium', 'completed', 4, 4),
                    ('Architecture review', 'design', 'high', 'completed', 8, 9),
                    ('Stakeholder sign-off on requirements', 'requirements', 'high', 'completed', 4, 3),
                    ('Penetration test', 'testing', 'high', 'todo', 16, 0),
                    ('Performance load test', 'testing', 'medium', 'todo', 8, 0),
                ]
                for idx, (title, ptype, prio, status, est, act) in enumerate(tasks_seed):
                    phase = phases.get(ptype) or phases.get('development')
                    WaterfallTask.objects.create(
                        project=project, phase=phase, title=title,
                        description=f"Activity: {title}",
                        priority=prio, status=status,
                        assignee=team_pool[idx % len(team_pool)],
                        estimated_hours=est, actual_hours=act if status != 'todo' else None,
                        start_date=today - timedelta(days=14) if status != 'todo' else None,
                        due_date=today + timedelta(days=14 + idx),
                        completed_date=today - timedelta(days=2) if status == 'completed' else None,
                    )
                    task_count += 1
            created['tasks'] = task_count

            # ---- Test Cases ----
            test_count = 0
            if not WaterfallTestCase.objects.filter(project=project).exists():
                tests_seed = [
                    ('TC-001', 'User can sign up with valid email', 'unit', 'high', 'passed'),
                    ('TC-002', 'User cannot sign up with duplicate email', 'unit', 'high', 'passed'),
                    ('TC-003', 'TOTP code accepted within 30s window', 'integration', 'critical', 'passed'),
                    ('TC-004', 'TOTP code rejected after expiry', 'integration', 'high', 'failed'),
                    ('TC-005', 'Admin can promote user to manager', 'system', 'high', 'pending'),
                    ('TC-006', 'API responds in <200ms p95 under 100rps', 'performance', 'medium', 'pending'),
                    ('TC-007', 'GDPR export downloads valid JSON', 'acceptance', 'high', 'pending'),
                    ('TC-008', 'Mobile UI usable at 320px width', 'system', 'medium', 'pending'),
                ]
                for tid, name, ttype, prio, status in tests_seed:
                    WaterfallTestCase.objects.create(
                        project=project, test_id=tid, name=name,
                        description=f"Verifies {name.lower()}.",
                        test_type=ttype, priority=prio, status=status,
                        preconditions='User account exists; system is reachable.',
                        test_steps='1. Open page\n2. Perform action\n3. Verify outcome',
                        expected_result='Action completes successfully.',
                        actual_result='As expected.' if status == 'passed' else ('Code expired earlier than expected.' if status == 'failed' else ''),
                        executed_at=timezone.now() if status in ('passed', 'failed') else None,
                        executed_by=team_pool[0] if status in ('passed', 'failed') else None,
                    )
                    test_count += 1
            created['test_cases'] = test_count

            # ---- Milestones ----
            ms_count = 0
            if not WaterfallMilestone.objects.filter(project=project).exists():
                ms_seed = [
                    ('Requirements baseline approved', 'requirements', -60, 'completed'),
                    ('Architecture sign-off', 'design', -30, 'completed'),
                    ('Code freeze for v1.0', 'development', 25, 'in_progress'),
                    ('Test cycle complete', 'testing', 35, 'pending'),
                    ('Production go-live', 'deployment', 45, 'pending'),
                ]
                for name, ptype, off, status in ms_seed:
                    WaterfallMilestone.objects.create(
                        project=project, phase=phases.get(ptype),
                        name=name, description=f"Key project gate: {name}",
                        due_date=today + timedelta(days=off),
                        completed_date=today + timedelta(days=off) if status == 'completed' else None,
                        status=status,
                        deliverables=[f"{name} document", "Sign-off recorded"],
                        owner=team_pool[0],
                    )
                    ms_count += 1
            created['milestones'] = ms_count

            # ---- Gantt Tasks ----
            gantt_count = 0
            if not WaterfallGanttTask.objects.filter(project=project).exists():
                gantt_seed = [
                    ('Requirements gathering', 'requirements', -90, -60, 100, False, True),
                    ('Architecture design', 'design', -60, -40, 100, False, True),
                    ('Database design', 'design', -50, -30, 100, False, False),
                    ('Auth module dev', 'development', -25, 5, 60, False, True),
                    ('Dashboard dev', 'development', -10, 20, 30, False, False),
                    ('Test plan', 'testing', 5, 15, 0, False, False),
                    ('Test execution', 'testing', 15, 35, 0, False, True),
                    ('Production deploy', 'deployment', 35, 40, 0, True, True),
                ]
                for order, (name, ptype, s_off, e_off, prog, is_ms, is_crit) in enumerate(gantt_seed):
                    WaterfallGanttTask.objects.create(
                        project=project, phase=phases[ptype], name=name,
                        start_date=today + timedelta(days=s_off),
                        end_date=today + timedelta(days=e_off),
                        progress=prog, is_milestone=is_ms, is_critical=is_crit,
                        assignee=team_pool[order % len(team_pool)], order=order,
                    )
                    gantt_count += 1
            created['gantt_tasks'] = gantt_count

            # ---- Change Requests ----
            cr_count = 0
            if not WaterfallChangeRequest.objects.filter(project=project).exists():
                crs_seed = [
                    ('CR-001', 'Add SAML SSO to MVP scope', 'high', 'approved', '+10 days', '+€8,000', 'Adds enterprise auth.'),
                    ('CR-002', 'Defer mobile app to v1.1', 'medium', 'approved', '-15 days', '-€12,000', 'Trims scope to hit deadline.'),
                    ('CR-003', 'Upgrade DB from MySQL to PostgreSQL', 'high', 'under_review', '+5 days', '+€3,000', 'Better JSONB support.'),
                ]
                for cid, title, prio, status, sched, budget, scope in crs_seed:
                    WaterfallChangeRequest.objects.create(
                        project=project, change_id=cid, title=title,
                        description=f"Change proposal: {title}",
                        reason='Stakeholder request following design review.',
                        priority=prio, status=status,
                        affected_phase=phases.get('development'),
                        schedule_impact=sched, budget_impact=budget, scope_impact=scope,
                        requested_by=team_pool[0],
                        reviewed_by=team_pool[0] if status != 'submitted' else None,
                        approval_date=today - timedelta(days=5) if status == 'approved' else None,
                    )
                    cr_count += 1
            created['change_requests'] = cr_count

            # ---- Deployment Checklist ----
            dc_count = 0
            if not WaterfallDeploymentChecklist.objects.filter(project=project).exists():
                dc_seed = [
                    ('testing', 'All test cases passed', True, False),
                    ('testing', 'Performance tests under SLA', True, False),
                    ('testing', 'Security scan clean', True, False),
                    ('documentation', 'Release notes drafted', True, False),
                    ('documentation', 'Runbook updated', True, False),
                    ('infrastructure', 'Production servers provisioned', True, False),
                    ('infrastructure', 'DNS + SSL certificates ready', True, False),
                    ('approval', 'Steering committee sign-off', True, False),
                    ('backup', 'Pre-deploy database backup', True, False),
                    ('security', 'Pen test remediations applied', True, False),
                ]
                for order, (cat, item, req, done) in enumerate(dc_seed):
                    WaterfallDeploymentChecklist.objects.create(
                        project=project, category=cat, item=item,
                        is_required=req, is_completed=done,
                        assignee=team_pool[order % len(team_pool)],
                        order=order,
                    )
                    dc_count += 1
            created['deployment_checklist'] = dc_count

            # ---- Maintenance ----
            mi_count = 0
            if not WaterfallMaintenanceItem.objects.filter(project=project).exists():
                mi_seed = [
                    ('Bug: 500 on rapid double-click submit', 'bug_fix', 'high', 'open'),
                    ('Enhancement: dark mode toggle', 'enhancement', 'low', 'open'),
                    ('Security: rotate JWT signing keys', 'security', 'high', 'in_progress'),
                    ('Performance: slow query on /reports', 'performance', 'medium', 'resolved'),
                ]
                for title, t, prio, status in mi_seed:
                    WaterfallMaintenanceItem.objects.create(
                        project=project, title=title,
                        description=f"Reported during post-go-live operations.",
                        item_type=t, priority=prio, status=status,
                        reported_by=team_pool[0],
                        assignee=team_pool[1] if len(team_pool) > 1 else team_pool[0],
                        resolved_date=today - timedelta(days=2) if status == 'resolved' else None,
                        resolution='Optimized query with index.' if status == 'resolved' else '',
                    )
                    mi_count += 1
            created['maintenance'] = mi_count

            # ---- Budget + Items + EVM ----
            budget, _ = WaterfallBudget.objects.get_or_create(
                project=project,
                defaults={'total_budget': 500000, 'currency': 'EUR', 'contingency_percentage': 10,
                          'planned_value': 250000, 'earned_value': 230000, 'actual_cost': 245000},
            )
            if budget.total_budget == 0:
                budget.total_budget = 500000
                budget.planned_value = 250000
                budget.earned_value = 230000
                budget.actual_cost = 245000
                budget.save()
            bi_count = 0
            if not budget.items.exists():
                bi_seed = [
                    ('Personnel', 'Engineering team Q1+Q2', 'development', 250000, 245000),
                    ('Personnel', 'Design + UX', 'design', 60000, 58000),
                    ('Tools', 'Licenses (Figma, Linear, Sentry)', 'development', 18000, 18000),
                    ('Infrastructure', 'AWS staging + production', 35000, 12000),
                    ('Training', 'Team workshops', 'development', 8000, 4000),
                    ('External', 'Pen test vendor', 'testing', 15000, 0),
                    ('External', 'Architecture review consultancy', 'design', 25000, 25000),
                ]
                for entry in bi_seed:
                    cat, desc = entry[0], entry[1]
                    ptype = entry[2] if len(entry) == 5 else None
                    planned, actual = entry[-2], entry[-1]
                    WaterfallBudgetItem.objects.create(
                        budget=budget, phase=phases.get(ptype) if ptype else None,
                        category=cat, description=desc,
                        planned_amount=planned, actual_amount=actual,
                        date=today - timedelta(days=30),
                    )
                    bi_count += 1
            created['budget_items'] = bi_count

            # ---- Risks ----
            risk_count = 0
            if not WaterfallRisk.objects.filter(project=project).exists():
                risks_seed = [
                    ('Scope creep on auth module', 'business', 'medium', 'high', 'mitigating',
                     'Multiple stakeholders requesting feature additions.', 'Lock scope baseline; route additions through CR-003.'),
                    ('Key engineer retention', 'resource', 'low', 'high', 'analyzing',
                     'Senior architect could leave before code freeze.', 'Cross-training; documented architecture; retention bonus.'),
                    ('Vendor delay (pen test)', 'external', 'medium', 'medium', 'identified',
                     'External pen-test vendor backlog 2 weeks.', 'Engage backup vendor; reserve dates 4 weeks ahead.'),
                    ('Database migration data loss', 'technical', 'low', 'high', 'mitigating',
                     'Schema migration could corrupt data.', 'Full backup + dry run on staging.'),
                ]
                for title, cat, prob, impact, status, desc, mit in risks_seed:
                    WaterfallRisk.objects.create(
                        project=project, title=title, description=desc,
                        category=cat, probability=prob, impact=impact, status=status,
                        owner=team_pool[0].get_full_name() or team_pool[0].email,
                        mitigation=mit,
                        date_identified=today - timedelta(days=30),
                    )
                    risk_count += 1
            created['risks'] = risk_count

            # ---- Issues ----
            issue_count = 0
            if not WaterfallIssue.objects.filter(project=project).exists():
                issues_seed = [
                    ('Test environment unstable', 'technical', 'high', 'in-progress',
                     'Staging DB intermittently unavailable, blocking QA cycle.', 'Migrating to managed RDS.'),
                    ('Stakeholder availability for sign-off', 'process', 'medium', 'open',
                     'Steering committee delayed by 2 weeks.', ''),
                    ('Resource overallocation in development', 'resource', 'medium', 'resolved',
                     'Senior dev pulled into 3 projects simultaneously.', 'Reallocated; hired contractor.'),
                ]
                for title, cat, prio, status, desc, resolution in issues_seed:
                    WaterfallIssue.objects.create(
                        project=project, title=title, description=desc,
                        category=cat, priority=prio, status=status,
                        assignee=team_pool[0].get_full_name() or team_pool[0].email,
                        reporter=team_pool[1].get_full_name() if len(team_pool) > 1 else (team_pool[0].get_full_name() or team_pool[0].email),
                        date_reported=today - timedelta(days=14),
                        date_resolved=today - timedelta(days=3) if status == 'resolved' else None,
                        resolution=resolution,
                    )
                    issue_count += 1
            created['issues'] = issue_count

            # ---- Deliverables ----
            del_count = 0
            if not WaterfallDeliverable.objects.filter(project=project).exists():
                dels_seed = [
                    ('Requirements Specification', 'requirements', 'document', 'approved', -60),
                    ('System Architecture', 'design', 'document', 'approved', -30),
                    ('Auth Module Code', 'development', 'code', 'in-progress', 10),
                    ('UI/UX Mockups', 'design', 'design', 'approved', -20),
                    ('Test Report', 'testing', 'document', 'pending', 35),
                    ('Production Release', 'deployment', 'approval', 'pending', 45),
                    ('User Training', 'deployment', 'training', 'pending', 50),
                ]
                for name, phase, t, status, off in dels_seed:
                    WaterfallDeliverable.objects.create(
                        project=project, name=name,
                        description=f"Required deliverable: {name}",
                        phase=phase, type=t, status=status,
                        owner=team_pool[0].get_full_name() or team_pool[0].email,
                        approver=team_pool[0].get_full_name() or team_pool[0].email,
                        due_date=today + timedelta(days=off),
                        completed_date=today + timedelta(days=off) if status == 'approved' else None,
                        acceptance_criteria=[f"{name} reviewed", "Sign-off captured"],
                    )
                    del_count += 1
            created['deliverables'] = del_count

            # ---- Baselines ----
            bl_count = 0
            if not WaterfallBaseline.objects.filter(project=project).exists():
                bl_seed = [
                    ('scope', {'requirements_count': 10, 'features': ['auth', 'rbac', 'audit', 'gdpr']}),
                    ('schedule', {'start': str(today - timedelta(days=90)), 'end': str(today + timedelta(days=45)), 'phases': 6}),
                    ('cost', {'total_budget': 500000, 'contingency_pct': 10, 'currency': 'EUR'}),
                ]
                approver_name = team_pool[0].get_full_name() or team_pool[0].email
                for btype, data in bl_seed:
                    WaterfallBaseline.objects.create(
                        project=project, baseline_type=btype, version=1,
                        data=data, approved_by=approver_name,
                        approval_date=today - timedelta(days=60),
                        is_current=True,
                        notes=f"Initial {btype} baseline approved by Steering Committee.",
                    )
                    bl_count += 1
            created['baselines'] = bl_count

        return Response({'success': True, 'project_id': project.id, 'created': created,
                         'message': f"Waterfall demo data seeded for {project.name}"})


class WaterfallClearDemoView(APIView):
    permission_classes = [DEMO_ROLES, MethodologyMatchesProjectPermission]

    def post(self, request, project_id=None):
        from django.db import transaction
        project = get_object_or_404(Project, id=project_id)
        deleted = {}
        with transaction.atomic():
            for label, qs in [
                ('team', WaterfallTeamMember.objects.filter(project=project)),
                ('requirements', WaterfallRequirement.objects.filter(project=project)),
                ('design_docs', WaterfallDesignDocument.objects.filter(project=project)),
                ('tasks', WaterfallTask.objects.filter(project=project)),
                ('test_cases', WaterfallTestCase.objects.filter(project=project)),
                ('milestones', WaterfallMilestone.objects.filter(project=project)),
                ('gantt_tasks', WaterfallGanttTask.objects.filter(project=project)),
                ('change_requests', WaterfallChangeRequest.objects.filter(project=project)),
                ('deployment_checklist', WaterfallDeploymentChecklist.objects.filter(project=project)),
                ('maintenance', WaterfallMaintenanceItem.objects.filter(project=project)),
                ('risks', WaterfallRisk.objects.filter(project=project)),
                ('issues', WaterfallIssue.objects.filter(project=project)),
                ('deliverables', WaterfallDeliverable.objects.filter(project=project)),
                ('baselines', WaterfallBaseline.objects.filter(project=project)),
                ('phases', WaterfallPhase.objects.filter(project=project)),
            ]:
                deleted[label] = qs.count()
                qs.delete()
            try:
                budget = project.waterfall_budget
                deleted['budget_items'] = budget.items.count()
                budget.delete()
                deleted['budget'] = 1
            except WaterfallBudget.DoesNotExist:
                deleted['budget'] = 0
                deleted['budget_items'] = 0
        return Response({'success': True, 'deleted': deleted})
