from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Sum, Avg
from .models import (
    ProductBacklog, BacklogItem, Sprint, SprintBurndown,
    DailyStandup, StandupUpdate, SprintReview, SprintRetrospective,
    Velocity, DefinitionOfDone, ScrumTeam
)
from .serializers import (
    ProductBacklogSerializer, BacklogItemSerializer, SprintSerializer,
    SprintDetailSerializer, SprintBurndownSerializer, DailyStandupSerializer,
    StandupUpdateSerializer, SprintReviewSerializer, SprintRetrospectiveSerializer,
    VelocitySerializer, DefinitionOfDoneSerializer, ScrumTeamSerializer
)


class ProjectFilterMixin:
    """Mixin to filter by project and company"""
    
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
# PRODUCT BACKLOG
# =============================================================================

class ProductBacklogViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = ProductBacklogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return ProductBacklog.objects.filter(
            project_id=project_id,
            project__company=self.request.user.company
        )

    def perform_create(self, serializer):
        project = self.get_project()
        serializer.save(project=project)

    @action(detail=False, methods=['post'])
    def initialize(self, request, project_id=None):
        """Initialize product backlog for project"""
        project = self.get_project()
        backlog, created = ProductBacklog.objects.get_or_create(project=project)
        return Response(ProductBacklogSerializer(backlog).data)


class BacklogItemViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = BacklogItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        queryset = BacklogItem.objects.filter(
            backlog__project_id=project_id,
            backlog__project__company=self.request.user.company
        )
        # Filters
        sprint = self.request.query_params.get('sprint')
        status_filter = self.request.query_params.get('status')
        item_type = self.request.query_params.get('type')
        
        if sprint:
            queryset = queryset.filter(sprint_id=sprint)
        if sprint == 'null':
            queryset = queryset.filter(sprint__isnull=True)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if item_type:
            queryset = queryset.filter(item_type=item_type)
            
        return queryset

    def perform_create(self, serializer):
        project = self.get_project()
        backlog, _ = ProductBacklog.objects.get_or_create(project=project)
        serializer.save(backlog=backlog, reporter=self.request.user)

    @action(detail=True, methods=['post'])
    def assign_to_sprint(self, request, project_id=None, pk=None):
        """Assign item to sprint"""
        item = self.get_object()
        sprint_id = request.data.get('sprint_id')
        if sprint_id:
            sprint = get_object_or_404(Sprint, id=sprint_id, project_id=project_id)
            item.sprint = sprint
        else:
            item.sprint = None  # Move back to backlog
        item.save()
        return Response(BacklogItemSerializer(item).data)

    @action(detail=True, methods=['post'])
    def update_status(self, request, project_id=None, pk=None):
        """Update item status"""
        item = self.get_object()
        new_status = request.data.get('status')
        if new_status in dict(BacklogItem.STATUS_CHOICES):
            item.status = new_status
            item.save()
        return Response(BacklogItemSerializer(item).data)

    @action(detail=False, methods=['post'])
    def reorder(self, request, project_id=None):
        """Reorder backlog items"""
        items = request.data.get('items', [])
        for item_data in items:
            BacklogItem.objects.filter(id=item_data['id']).update(order=item_data['order'])
        return Response({'status': 'reordered'})


# =============================================================================
# SPRINT
# =============================================================================

class SprintViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = SprintSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.get_project_queryset(Sprint)

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return SprintDetailSerializer
        return SprintSerializer

    def perform_create(self, serializer):
        project = self.get_project()
        # Auto-increment sprint number
        last_sprint = Sprint.objects.filter(project=project).order_by('-number').first()
        number = (last_sprint.number + 1) if last_sprint else 1
        name = f"Sprint {number}"
        serializer.save(project=project, number=number, name=name)

    @action(detail=True, methods=['post'])
    def start(self, request, project_id=None, pk=None):
        """Start the sprint"""
        sprint = self.get_object()
        sprint.status = 'active'
        if not sprint.start_date:
            sprint.start_date = timezone.now().date()
        sprint.save()
        return Response(SprintSerializer(sprint).data)

    @action(detail=True, methods=['post'])
    def complete(self, request, project_id=None, pk=None):
        """Complete the sprint"""
        sprint = self.get_object()
        sprint.status = 'completed'
        sprint.end_date = timezone.now().date()
        sprint.save()
        
        # Record velocity
        Velocity.objects.update_or_create(
            project_id=project_id,
            sprint=sprint,
            defaults={
                'committed_points': sprint.total_story_points,
                'completed_points': sprint.completed_story_points,
            }
        )
        
        # Move incomplete items back to backlog
        incomplete_items = sprint.items.exclude(status='done')
        incomplete_items.update(sprint=None)
        
        return Response(SprintSerializer(sprint).data)

    @action(detail=True, methods=['post'])
    def record_burndown(self, request, project_id=None, pk=None):
        """Record daily burndown data"""
        sprint = self.get_object()
        date = request.data.get('date', timezone.now().date())
        
        remaining = sprint.items.exclude(status='done').aggregate(
            total=Sum('story_points'))['total'] or 0
        completed = sprint.completed_story_points
        
        burndown, _ = SprintBurndown.objects.update_or_create(
            sprint=sprint,
            date=date,
            defaults={
                'remaining_points': remaining,
                'completed_points': completed,
            }
        )
        return Response(SprintBurndownSerializer(burndown).data)

    @action(detail=False, methods=['get'])
    def active(self, request, project_id=None):
        """Get active sprint"""
        sprint = self.get_queryset().filter(status='active').first()
        if sprint:
            return Response(SprintDetailSerializer(sprint).data)
        return Response({'detail': 'No active sprint'}, status=404)


# =============================================================================
# DAILY STANDUP
# =============================================================================

class DailyStandupViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = DailyStandupSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return DailyStandup.objects.filter(
            sprint__project_id=project_id,
            sprint__project__company=self.request.user.company
        )

    def perform_create(self, serializer):
        sprint_id = self.request.data.get('sprint')
        sprint = get_object_or_404(Sprint, id=sprint_id)
        serializer.save(sprint=sprint)

    @action(detail=True, methods=['post'])
    def add_update(self, request, project_id=None, pk=None):
        """Add individual standup update"""
        standup = self.get_object()
        serializer = StandupUpdateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(standup=standup, user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# =============================================================================
# SPRINT REVIEW & RETROSPECTIVE
# =============================================================================

class SprintReviewViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = SprintReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return SprintReview.objects.filter(
            sprint__project_id=project_id,
            sprint__project__company=self.request.user.company
        )


class SprintRetrospectiveViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = SprintRetrospectiveSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return SprintRetrospective.objects.filter(
            sprint__project_id=project_id,
            sprint__project__company=self.request.user.company
        )


# =============================================================================
# VELOCITY & DOD
# =============================================================================

class VelocityViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = VelocitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.get_project_queryset(Velocity)

    @action(detail=False, methods=['get'])
    def average(self, request, project_id=None):
        """Get average velocity"""
        velocities = self.get_queryset()
        avg = velocities.aggregate(avg=Avg('completed_points'))['avg'] or 0
        return Response({
            'average_velocity': round(avg, 1),
            'sprint_count': velocities.count()
        })


class DefinitionOfDoneViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = DefinitionOfDoneSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.get_project_queryset(DefinitionOfDone)

    def perform_create(self, serializer):
        project = self.get_project()
        serializer.save(project=project)

    @action(detail=False, methods=['post'])
    def initialize_defaults(self, request, project_id=None):
        """Initialize default DoD items"""
        project = self.get_project()
        defaults = [
            'Code reviewed and approved',
            'Unit tests written and passing',
            'Integration tests passing',
            'Documentation updated',
            'Acceptance criteria met',
            'No known bugs',
            'Product Owner approved',
        ]
        items = []
        for i, item in enumerate(defaults):
            dod, _ = DefinitionOfDone.objects.get_or_create(
                project=project,
                item=item,
                defaults={'order': i}
            )
            items.append(dod)
        return Response(DefinitionOfDoneSerializer(items, many=True).data)


# =============================================================================
# SCRUM TEAM
# =============================================================================

class ScrumTeamViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = ScrumTeamSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.get_project_queryset(ScrumTeam)

    def perform_create(self, serializer):
        project = self.get_project()
        serializer.save(project=project)


# =============================================================================
# DASHBOARD
# =============================================================================

class ScrumDashboardView(APIView):
    """Scrum Dashboard for a project"""
    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):
        from projects.models import Project
        
        project = get_object_or_404(
            Project,
            id=project_id,
            company=request.user.company
        )
        
        # Get active sprint
        active_sprint = Sprint.objects.filter(project=project, status='active').first()
        
        # Get backlog stats
        backlog = ProductBacklog.objects.filter(project=project).first()
        backlog_items = BacklogItem.objects.filter(backlog__project=project) if backlog else []
        
        # Velocity
        velocities = Velocity.objects.filter(project=project).order_by('-sprint__number')[:5]
        avg_velocity = velocities.aggregate(avg=Avg('completed_points'))['avg'] or 0
        
        # Team
        team = ScrumTeam.objects.filter(project=project)
        
        dashboard_data = {
            'project_id': project.id,
            'project_name': project.name,
            
            # Active Sprint
            'active_sprint': SprintSerializer(active_sprint).data if active_sprint else None,
            'sprint_progress': active_sprint.completed_story_points if active_sprint else 0,
            'sprint_total': active_sprint.total_story_points if active_sprint else 0,
            
            # Backlog
            'backlog_items_count': backlog_items.count() if backlog_items else 0,
            'backlog_ready_count': backlog_items.filter(status='ready').count() if backlog_items else 0,
            'total_story_points': backlog_items.aggregate(total=Sum('story_points'))['total'] or 0,
            
            # Velocity
            'average_velocity': round(avg_velocity, 1),
            'recent_velocities': VelocitySerializer(velocities, many=True).data,
            
            # Team
            'team_size': team.count(),
            'team': ScrumTeamSerializer(team, many=True).data,
        }
        
        return Response(dashboard_data)
