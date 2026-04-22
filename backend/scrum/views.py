from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Sum, Avg, Max
from django.db import IntegrityError
# NEW (CORRECT):
from .models import (
    ProductBacklog, BacklogItem, Sprint, SprintBurndown,
    DailyStandup, StandupUpdate, SprintReview, SprintRetrospective,
    Velocity, DefinitionOfDone, ScrumTeam,
    SprintGoal, SprintPlanning, Increment, DoDChecklistCompletion
)
from .serializers import (
    ProductBacklogSerializer, BacklogItemSerializer, SprintSerializer,
    SprintDetailSerializer, SprintBurndownSerializer, DailyStandupSerializer,
    StandupUpdateSerializer, SprintReviewSerializer, SprintRetrospectiveSerializer,
    VelocitySerializer, DefinitionOfDoneSerializer, ScrumTeamSerializer,
    SprintGoalSerializer, SprintPlanningSerializer, IncrementSerializer,
    DoDChecklistCompletionSerializer
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
        # Auto-compute next order if not explicitly provided, to avoid
        # collisions from multiple items sharing the default order=0.
        order = serializer.validated_data.get('order')
        if order is None or order == 0:
            max_order = BacklogItem.objects.filter(
                backlog__project=project
            ).aggregate(m=Max('order'))['m'] or 0
            serializer.validated_data['order'] = max_order + 1
        try:
            serializer.save(backlog=backlog, reporter=self.request.user)
        except IntegrityError as e:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'detail': f'Could not create backlog item: {str(e)}'})

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

    @action(detail=True, methods=['post'])
    def create_subtask(self, request, project_id=None, pk=None):
        """Create a subtask for this backlog item"""
        parent_item = self.get_object()
        
        # Auto-generate title if not provided
        if not request.data.get('title'):
            subtask_count = parent_item.children.count() + 1
            title = f"Subtask {subtask_count} for {parent_item.title}"
        else:
            title = request.data.get('title')
        
        # Create data dict WITHOUT backlog (will be set in save)
        data = {
            'title': title,
            'item_type': 'task',
            'parent': parent_item.id,
        }
        
        # Add sprint if parent has one
        if parent_item.sprint:
            data['sprint'] = parent_item.sprint.id
        
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            # Pass backlog directly to save() method
            subtask = serializer.save(
                reporter=request.user,
                backlog=parent_item.backlog
            )
            return Response(
                self.get_serializer(subtask).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
   
   
        """Create a subtask for this backlog item"""
        parent_item = self.get_object()
        
        data = request.data.copy()
        data['parent'] = parent_item.id
        data['backlog'] = parent_item.backlog.id
        data['sprint'] = parent_item.sprint.id if parent_item.sprint else None
        data['item_type'] = 'task'
        
        if not data.get('title'):
            subtask_count = parent_item.children.count() + 1
            data['title'] = f"Subtask {subtask_count} for {parent_item.title}"
        
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            subtask = serializer.save(reporter=request.user)
            return Response(
                self.get_serializer(subtask).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        """Create a subtask for this backlog item"""
        parent_item = self.get_object()
        
        data = request.data.copy()
        data['parent'] = parent_item.id
        data['backlog'] = parent_item.backlog.id
        data['sprint'] = parent_item.sprint.id if parent_item.sprint else None
        data['item_type'] = 'task'
        
        if not data.get('title'):
            subtask_count = parent_item.children.count() + 1
            data['title'] = f"Subtask {subtask_count} for {parent_item.title}"
        
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            subtask = serializer.save(reporter=request.user)
            return Response(
                self.get_serializer(subtask).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        """Create a subtask for this backlog item"""
        parent_item = self.get_object()
        
        data = request.data.copy()
        data['parent'] = parent_item.id
        data['backlog'] = parent_item.backlog.id
        data['sprint'] = parent_item.sprint.id if parent_item.sprint else None
        data['item_type'] = 'task'
        
        if not data.get('title'):
            subtask_count = parent_item.children.count() + 1
            data['title'] = f"Subtask {subtask_count} for {parent_item.title}"
        
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            subtask = serializer.save(reporter=request.user)
            return Response(
                self.get_serializer(subtask).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        """Create a subtask for this backlog item"""
        parent_item = self.get_object()
        
        data = request.data.copy()
        data['parent'] = parent_item.id
        data['backlog'] = parent_item.backlog.id
        data['sprint'] = parent_item.sprint.id if parent_item.sprint else None
        data['item_type'] = 'task'  # Subtasks are always tasks
        
        # Auto-generate title if not provided
        if not data.get('title'):
            subtask_count = parent_item.children.count() + 1
            data['title'] = f"Subtask {subtask_count} for {parent_item.title}"
        
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            subtask = serializer.save(reporter=request.user)
            return Response(
                self.get_serializer(subtask).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
        """Initialize default DoD items with proper names and checklists"""
        project = self.get_project()
        
        defaults = [
            {
                'name': 'Code Quality',
                'item': 'Code reviewed and approved',
                'scope': 'task',
                'order': 1,
                'checklist': [
                    {'item': 'Code review completed', 'required': True},
                    {'item': 'No critical bugs', 'required': True},
                    {'item': 'Follows coding standards', 'required': True},
                ]
            },
            {
                'name': 'Testing',
                'item': 'All tests passing',
                'scope': 'task',
                'order': 2,
                'checklist': [
                    {'item': 'Unit tests written', 'required': True},
                    {'item': 'Integration tests pass', 'required': True},
                    {'item': 'Manual testing completed', 'required': False},
                ]
            },
            {
                'name': 'Documentation',
                'item': 'Documentation updated',
                'scope': 'task',
                'order': 3,
                'checklist': [
                    {'item': 'README updated', 'required': False},
                    {'item': 'API docs updated', 'required': False},
                    {'item': 'User guide updated', 'required': False},
                ]
            },
            {
                'name': 'Deployment Ready',
                'item': 'Ready for production',
                'scope': 'sprint',
                'order': 4,
                'checklist': [
                    {'item': 'Product Owner approved', 'required': True},
                    {'item': 'Acceptance criteria met', 'required': True},
                    {'item': 'No blocking issues', 'required': True},
                ]
            },
        ]
        
        items = []
        for default_data in defaults:
            dod, created = DefinitionOfDone.objects.get_or_create(
                project=project,
                item=default_data['item'],
                defaults={
                    'name': default_data['name'],
                    'scope': default_data.get('scope', 'project'),
                    'order': default_data['order'],
                    'checklist': default_data.get('checklist', []),
                    'created_by': request.user,
                }
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
# SPRINT GOAL, PLANNING, INCREMENT (NEW)
# =============================================================================

class SprintGoalViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = SprintGoalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return SprintGoal.objects.filter(
            sprint__project_id=project_id,
            sprint__project__company=self.request.user.company
        )
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class SprintPlanningViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = SprintPlanningSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return SprintPlanning.objects.filter(
            sprint__project_id=project_id,
            sprint__project__company=self.request.user.company
        )
    
    @action(detail=True, methods=['post'])
    def start_meeting(self, request, project_id=None, pk=None):
        """Start the planning meeting"""
        planning = self.get_object()
        planning.status = 'in_progress'
        planning.save()
        return Response(SprintPlanningSerializer(planning).data)
    
    @action(detail=True, methods=['post'])
    def complete_meeting(self, request, project_id=None, pk=None):
        """Complete the planning meeting"""
        planning = self.get_object()
        planning.status = 'completed'
        planning.save()
        return Response(SprintPlanningSerializer(planning).data)


class IncrementViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = IncrementSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return Increment.objects.filter(
            project_id=project_id,
            project__company=self.request.user.company
        ).order_by('-created_at')
    
    def perform_create(self, serializer):
        project = self.get_project()
        serializer.save(project=project, created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def release(self, request, project_id=None, pk=None):
        """Release increment to production"""
        increment = self.get_object()
        increment.is_released = True
        increment.release_date = timezone.now()
        increment.save()
        return Response(IncrementSerializer(increment).data)


class DoDChecklistCompletionViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = DoDChecklistCompletionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return DoDChecklistCompletion.objects.filter(
            definition_of_done__project_id=project_id,
            definition_of_done__project__company=self.request.user.company
        )

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

        # Empty/zero-filled defaults so a brand-new project with no
        # sprints/backlog/velocity returns a valid payload instead of 500.
        dashboard_data = {
            'project_id': project.id,
            'project_name': project.name,
            'active_sprint': None,
            'sprint_progress': 0,
            'sprint_total': 0,
            'backlog_items_count': 0,
            'backlog_ready_count': 0,
            'total_story_points': 0,
            'average_velocity': 0,
            'recent_velocities': [],
            'team_size': 0,
            'team': [],
        }

        try:
            active_sprint = Sprint.objects.filter(project=project, status='active').first()
            if active_sprint:
                dashboard_data['active_sprint'] = SprintSerializer(active_sprint).data
                dashboard_data['sprint_progress'] = active_sprint.completed_story_points or 0
                dashboard_data['sprint_total'] = active_sprint.total_story_points or 0
        except Exception:
            pass

        try:
            # Always use a queryset (never a list) so .count()/.filter()/.aggregate() work.
            backlog_items = BacklogItem.objects.filter(backlog__project=project)
            dashboard_data['backlog_items_count'] = backlog_items.count()
            dashboard_data['backlog_ready_count'] = backlog_items.filter(status='ready').count()
            dashboard_data['total_story_points'] = (
                backlog_items.aggregate(total=Sum('story_points'))['total'] or 0
            )
        except Exception:
            pass

        try:
            velocities = Velocity.objects.filter(project=project).order_by('-sprint__number')[:5]
            avg_velocity = velocities.aggregate(avg=Avg('completed_points'))['avg'] or 0
            dashboard_data['average_velocity'] = round(avg_velocity, 1)
            dashboard_data['recent_velocities'] = VelocitySerializer(velocities, many=True).data
        except Exception:
            pass

        try:
            team = ScrumTeam.objects.filter(project=project)
            dashboard_data['team_size'] = team.count()
            dashboard_data['team'] = ScrumTeamSerializer(team, many=True).data
        except Exception:
            pass

        return Response(dashboard_data)


# =============================================================================
# SCRUM BOARD (read-only kanban view)
# =============================================================================

class ScrumBoardView(APIView):
    """Read-only Scrum board: backlog grouped by status + active sprint."""
    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):
        from projects.models import Project

        project = get_object_or_404(
            Project,
            id=project_id,
            company=request.user.company
        )

        active_sprint = Sprint.objects.filter(
            project=project, status='active'
        ).first()

        # Prefer active-sprint items for the board; fall back to the full
        # project backlog when no sprint is active.
        if active_sprint:
            items_qs = BacklogItem.objects.filter(sprint=active_sprint)
        else:
            items_qs = BacklogItem.objects.filter(backlog__project=project)

        def serialize(status_value):
            qs = items_qs.filter(status=status_value)
            return BacklogItemSerializer(qs, many=True).data

        backlog_by_status = {
            'todo': serialize('new') + serialize('ready'),
            'in_progress': serialize('in_progress'),
            'done': serialize('done'),
            'blocked': serialize('removed'),
        }

        return Response({
            'active_sprint': SprintSerializer(active_sprint).data if active_sprint else None,
            'backlog_by_status': backlog_by_status,
        })
