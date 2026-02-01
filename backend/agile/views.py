from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Sum, Avg
from datetime import date

from projects.models import Project
from .models import (
    AgileTeamMember, AgileProductVision, AgileProductGoal,
    AgileUserPersona, AgileEpic, AgileBacklogItem, AgileIteration,
    AgileRelease, AgileDailyUpdate, AgileRetrospective, AgileRetroItem,
    AgileBudget, AgileBudgetItem
)
from .serializers import (
    AgileTeamMemberSerializer, AgileTeamMemberCreateSerializer,
    AgileProductVisionSerializer, AgileProductGoalSerializer,
    AgileUserPersonaSerializer, AgileEpicSerializer,
    AgileBacklogItemSerializer, AgileIterationSerializer,
    AgileIterationDetailSerializer, AgileReleaseSerializer,
    AgileDailyUpdateSerializer, AgileRetrospectiveSerializer,
    AgileRetroItemSerializer, AgileBudgetSerializer,
    AgileBudgetItemSerializer, AgileDashboardSerializer
)

User = get_user_model()


class AgileProjectMixin:
    """Mixin to filter by project"""
    def get_project(self):
        project_id = self.kwargs.get('project_id')
        return get_object_or_404(Project, id=project_id)
    
    def get_queryset(self):
        return super().get_queryset().filter(project=self.get_project())


# ============================================
# DASHBOARD VIEW
# ============================================

class AgileDashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    
    def retrieve(self, request, project_id=None):
        project = get_object_or_404(Project, id=project_id)
        
        # Check if Agile is initialized
        has_initialized = AgileBacklogItem.objects.filter(project=project).exists()
        
        # Current iteration
        current_iteration = AgileIteration.objects.filter(
            project=project, status='active'
        ).first()
        
        # Backlog stats
        backlog_items = AgileBacklogItem.objects.filter(project=project)
        total_items = backlog_items.count()
        total_points = backlog_items.aggregate(total=Sum('story_points'))['total'] or 0
        completed_points = backlog_items.filter(status='done').aggregate(
            total=Sum('story_points')
        )['total'] or 0
        
        # Team size
        team_size = AgileTeamMember.objects.filter(project=project).count()
        
        # Velocity
        completed_iterations = AgileIteration.objects.filter(
            project=project, status='completed'
        ).order_by('-end_date')[:5]
        
        velocity_history = []
        for iteration in reversed(completed_iterations):
            velocity_history.append({
                'iteration': iteration.name,
                'committed': iteration.velocity_committed,
                'completed': iteration.velocity_completed,
            })
        
        average_velocity = None
        if completed_iterations:
            average_velocity = completed_iterations.aggregate(
                avg=Avg('velocity_completed')
            )['avg']
        
        # Upcoming releases
        upcoming_releases = AgileRelease.objects.filter(
            project=project,
            status__in=['planning', 'in_progress']
        ).order_by('target_date')[:3]
        
        # Recent activity (simplified)
        recent_activity = []
        recent_items = AgileBacklogItem.objects.filter(
            project=project
        ).order_by('-updated_at')[:10]
        for item in recent_items:
            recent_activity.append({
                'type': 'backlog_update',
                'item': item.title,
                'status': item.status,
                'date': item.updated_at.isoformat(),
            })
        
        data = {
            'has_initialized': has_initialized,
            'current_iteration': AgileIterationSerializer(current_iteration).data if current_iteration else None,
            'total_backlog_items': total_items,
            'total_story_points': total_points,
            'completed_story_points': completed_points,
            'team_size': team_size,
            'average_velocity': average_velocity,
            'velocity_history': velocity_history,
            'upcoming_releases': AgileReleaseSerializer(upcoming_releases, many=True).data,
            'recent_activity': recent_activity,
        }
        
        return Response(data)
    
    @action(detail=False, methods=['post'])
    def initialize(self, request, project_id=None):
        """Initialize Agile methodology for project"""
        project = get_object_or_404(Project, id=project_id)
        
        # Create default vision
        AgileProductVision.objects.get_or_create(project=project)
        
        # Create default budget
        AgileBudget.objects.get_or_create(project=project)
        
        return Response({'status': 'initialized'})


# ============================================
# TEAM VIEWS
# ============================================

class AgileTeamViewSet(AgileProjectMixin, viewsets.ModelViewSet):
    queryset = AgileTeamMember.objects.all()
    serializer_class = AgileTeamMemberSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return AgileTeamMemberCreateSerializer
        return AgileTeamMemberSerializer
    
    def create(self, request, project_id=None):
        project = self.get_project()
        serializer = AgileTeamMemberCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Find or create user
        user_email = serializer.validated_data['user_email']
        user = User.objects.filter(email=user_email).first()
        if not user:
            return Response(
                {'error': f'User with email {user_email} not found'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if already a member
        if AgileTeamMember.objects.filter(project=project, user=user).exists():
            return Response(
                {'error': 'User is already a team member'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        member = AgileTeamMember.objects.create(
            project=project,
            user=user,
            role=serializer.validated_data['role'],
            capacity_hours=serializer.validated_data.get('capacity_hours', 40),
            skills=serializer.validated_data.get('skills', []),
        )
        
        return Response(AgileTeamMemberSerializer(member).data, status=status.HTTP_201_CREATED)


# ============================================
# VISION & GOALS VIEWS
# ============================================

class AgileProductVisionViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    
    def retrieve(self, request, project_id=None):
        project = get_object_or_404(Project, id=project_id)
        vision, _ = AgileProductVision.objects.get_or_create(project=project)
        return Response(AgileProductVisionSerializer(vision).data)
    
    def update(self, request, project_id=None):
        project = get_object_or_404(Project, id=project_id)
        vision, _ = AgileProductVision.objects.get_or_create(project=project)
        serializer = AgileProductVisionSerializer(vision, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class AgileProductGoalViewSet(AgileProjectMixin, viewsets.ModelViewSet):
    queryset = AgileProductGoal.objects.all()
    serializer_class = AgileProductGoalSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        project = self.get_project()
        vision = AgileProductVision.objects.filter(project=project).first()
        if vision:
            return AgileProductGoal.objects.filter(vision=vision)
        return AgileProductGoal.objects.none()
    
    def create(self, request, project_id=None):
        project = self.get_project()
        vision, _ = AgileProductVision.objects.get_or_create(project=project)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(vision=vision)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ============================================
# PERSONAS VIEW
# ============================================

class AgileUserPersonaViewSet(AgileProjectMixin, viewsets.ModelViewSet):
    queryset = AgileUserPersona.objects.all()
    serializer_class = AgileUserPersonaSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(project=self.get_project())


# ============================================
# BACKLOG VIEWS
# ============================================

class AgileEpicViewSet(AgileProjectMixin, viewsets.ModelViewSet):
    queryset = AgileEpic.objects.all()
    serializer_class = AgileEpicSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(project=self.get_project())
    
    @action(detail=False, methods=['post'])
    def reorder(self, request, project_id=None):
        """Reorder epics"""
        order_data = request.data.get('order', [])
        for idx, epic_id in enumerate(order_data):
            AgileEpic.objects.filter(id=epic_id, project=self.get_project()).update(order=idx)
        return Response({'status': 'reordered'})


class AgileBacklogItemViewSet(AgileProjectMixin, viewsets.ModelViewSet):
    queryset = AgileBacklogItem.objects.all()
    serializer_class = AgileBacklogItemSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by epic
        epic_id = self.request.query_params.get('epic')
        if epic_id:
            queryset = queryset.filter(epic_id=epic_id)
        
        # Filter by iteration
        iteration_id = self.request.query_params.get('iteration')
        if iteration_id:
            queryset = queryset.filter(iteration_id=iteration_id)
        
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
        serializer.save(project=self.get_project())
    
    @action(detail=True, methods=['post'])
    def move_to_iteration(self, request, pk=None, project_id=None):
        """Move item to iteration"""
        item = self.get_object()
        iteration_id = request.data.get('iteration_id')
        
        if iteration_id:
            iteration = get_object_or_404(AgileIteration, id=iteration_id, project=self.get_project())
            item.iteration = iteration
        else:
            item.iteration = None
        
        item.save()
        return Response(AgileBacklogItemSerializer(item).data)
    
    @action(detail=False, methods=['post'])
    def reorder(self, request, project_id=None):
        """Reorder backlog items"""
        order_data = request.data.get('order', [])
        for idx, item_id in enumerate(order_data):
            AgileBacklogItem.objects.filter(id=item_id, project=self.get_project()).update(order=idx)
        return Response({'status': 'reordered'})


# ============================================
# ITERATION VIEWS
# ============================================

class AgileIterationViewSet(AgileProjectMixin, viewsets.ModelViewSet):
    queryset = AgileIteration.objects.all()
    serializer_class = AgileIterationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return AgileIterationDetailSerializer
        return AgileIterationSerializer
    
    def perform_create(self, serializer):
        serializer.save(project=self.get_project())
    
    @action(detail=True, methods=['post'])
    def start(self, request, pk=None, project_id=None):
        """Start iteration"""
        iteration = self.get_object()
        
        # Check no other active iteration
        active = AgileIteration.objects.filter(
            project=self.get_project(), status='active'
        ).exclude(id=iteration.id).exists()
        
        if active:
            return Response(
                {'error': 'Another iteration is already active'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        iteration.status = 'active'
        iteration.velocity_committed = iteration.total_points
        iteration.save()
        
        return Response(AgileIterationSerializer(iteration).data)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None, project_id=None):
        """Complete iteration"""
        iteration = self.get_object()
        iteration.status = 'completed'
        iteration.velocity_completed = iteration.completed_points
        iteration.save()
        
        return Response(AgileIterationSerializer(iteration).data)
    
    @action(detail=False, methods=['get'])
    def active(self, request, project_id=None):
        """Get active iteration"""
        iteration = AgileIteration.objects.filter(
            project=self.get_project(), status='active'
        ).first()
        
        if iteration:
            return Response(AgileIterationDetailSerializer(iteration).data)
        return Response(None)


# ============================================
# RELEASE VIEWS
# ============================================

class AgileReleaseViewSet(AgileProjectMixin, viewsets.ModelViewSet):
    queryset = AgileRelease.objects.all()
    serializer_class = AgileReleaseSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(project=self.get_project())
    
    @action(detail=True, methods=['post'])
    def add_iteration(self, request, pk=None, project_id=None):
        """Add iteration to release"""
        release = self.get_object()
        iteration_id = request.data.get('iteration_id')
        iteration = get_object_or_404(AgileIteration, id=iteration_id, project=self.get_project())
        release.iterations.add(iteration)
        return Response(AgileReleaseSerializer(release).data)


# ============================================
# DAILY PROGRESS VIEWS
# ============================================

class AgileDailyUpdateViewSet(viewsets.ModelViewSet):
    queryset = AgileDailyUpdate.objects.all()
    serializer_class = AgileDailyUpdateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        queryset = AgileDailyUpdate.objects.filter(project_id=project_id)
        
        # Filter by date
        date_filter = self.request.query_params.get('date')
        if date_filter:
            queryset = queryset.filter(date=date_filter)
        
        # Filter by iteration
        iteration_id = self.request.query_params.get('iteration')
        if iteration_id:
            queryset = queryset.filter(iteration_id=iteration_id)
        
        return queryset
    
    def perform_create(self, serializer):
        project = get_object_or_404(Project, id=self.kwargs.get('project_id'))
        iteration_id = self.request.data.get('iteration_id')
        iteration = get_object_or_404(AgileIteration, id=iteration_id) if iteration_id else None
        
        serializer.save(
            project=project,
            iteration=iteration,
            user=self.request.user,
            date=self.request.data.get('date', date.today())
        )


# ============================================
# RETROSPECTIVE VIEWS
# ============================================

class AgileRetrospectiveViewSet(viewsets.ModelViewSet):
    queryset = AgileRetrospective.objects.all()
    serializer_class = AgileRetrospectiveSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return AgileRetrospective.objects.filter(iteration__project_id=project_id)
    
    @action(detail=True, methods=['post'])
    def add_item(self, request, pk=None, project_id=None):
        """Add item to retrospective"""
        retro = self.get_object()
        item = AgileRetroItem.objects.create(
            retrospective=retro,
            category=request.data.get('category'),
            content=request.data.get('content'),
            created_by=request.user,
        )
        return Response(AgileRetroItemSerializer(item).data, status=status.HTTP_201_CREATED)


class AgileRetroItemViewSet(viewsets.ModelViewSet):
    queryset = AgileRetroItem.objects.all()
    serializer_class = AgileRetroItemSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=True, methods=['post'])
    def vote(self, request, pk=None):
        """Vote for item"""
        item = self.get_object()
        item.votes += 1
        item.save()
        return Response(AgileRetroItemSerializer(item).data)


# ============================================
# BUDGET VIEWS
# ============================================

class AgileBudgetViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    
    def retrieve(self, request, project_id=None):
        project = get_object_or_404(Project, id=project_id)
        budget, _ = AgileBudget.objects.get_or_create(project=project)
        return Response(AgileBudgetSerializer(budget).data)
    
    def update(self, request, project_id=None):
        project = get_object_or_404(Project, id=project_id)
        budget, _ = AgileBudget.objects.get_or_create(project=project)
        serializer = AgileBudgetSerializer(budget, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class AgileBudgetItemViewSet(viewsets.ModelViewSet):
    queryset = AgileBudgetItem.objects.all()
    serializer_class = AgileBudgetItemSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        project = get_object_or_404(Project, id=project_id)
        budget = AgileBudget.objects.filter(project=project).first()
        if budget:
            return AgileBudgetItem.objects.filter(budget=budget)
        return AgileBudgetItem.objects.none()
    
    def perform_create(self, serializer):
        project = get_object_or_404(Project, id=self.kwargs.get('project_id'))
        budget, _ = AgileBudget.objects.get_or_create(project=project)
        serializer.save(budget=budget)
