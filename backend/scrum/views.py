from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Sum, Avg, Max
from django.db import IntegrityError
from projects.permissions import MethodologyMatchesProjectPermission
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


def _user_can_access_project(user, project_id):
    """P2 visibility — superadmin / team_member / creator may access."""
    from django.db.models import Q
    from projects.models import Project
    if not user.is_authenticated:
        return False
    if getattr(user, 'role', None) == 'superadmin' or getattr(user, 'is_superuser', False):
        return Project.objects.filter(id=project_id).exists()
    return Project.objects.filter(
        Q(id=project_id) & (
            Q(team_members__user=user, team_members__is_active=True)
            | Q(created_by=user)
        )
    ).exists()


class ProjectFilterMixin:
    """Mixin to filter by project membership (P2 fix — was company-only)."""

    def get_project_queryset(self, model):
        from django.db.models import Q
        from projects.models import Project
        user = self.request.user
        project_id = self.kwargs.get('project_id')
        if getattr(user, 'role', None) == 'superadmin' or getattr(user, 'is_superuser', False):
            return model.objects.filter(project_id=project_id)
        return model.objects.filter(
            project_id=project_id,
            project__in=Project.objects.filter(
                Q(team_members__user=user, team_members__is_active=True)
                | Q(created_by=user)
            ).distinct(),
        )

    def get_project(self):
        from django.db.models import Q
        from projects.models import Project
        user = self.request.user
        project_id = self.kwargs.get('project_id')
        if getattr(user, 'role', None) == 'superadmin' or getattr(user, 'is_superuser', False):
            return get_object_or_404(Project, id=project_id)
        return get_object_or_404(
            Project.objects.filter(
                Q(team_members__user=user, team_members__is_active=True)
                | Q(created_by=user)
            ).distinct(),
            id=project_id,
        )


# =============================================================================
# PRODUCT BACKLOG
# =============================================================================

class ProductBacklogViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = ProductBacklogSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return ProductBacklog.objects.filter(
            project_id=project_id,
            project__company=self.request.user.company
        )

    def perform_create(self, serializer):
        project = self.get_project()
        # ProductBacklog.project is a OneToOneField: a second create for the
        # same project would raise IntegrityError → 500. Make the endpoint
        # idempotent by returning the existing backlog if one already exists.
        existing = ProductBacklog.objects.filter(project=project).first()
        if existing is not None:
            serializer.instance = existing
            return
        try:
            serializer.save(project=project)
        except IntegrityError:
            # Race with a parallel create — reload the now-existing row.
            serializer.instance = ProductBacklog.objects.get(project=project)

    def create(self, request, *args, **kwargs):
        # Override so we return 200 OK with the existing backlog payload
        # instead of 201, avoiding misleading "created" semantics when the
        # backlog was already there.
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        existed_before = ProductBacklog.objects.filter(
            project_id=self.kwargs.get('project_id')
        ).exists()
        self.perform_create(serializer)
        response_status = status.HTTP_200_OK if existed_before else status.HTTP_201_CREATED
        return Response(serializer.data, status=response_status)

    @action(detail=False, methods=['post'])
    def initialize(self, request, project_id=None):
        """Initialize product backlog for project"""
        project = self.get_project()
        backlog, created = ProductBacklog.objects.get_or_create(project=project)
        return Response(ProductBacklogSerializer(backlog).data)


class BacklogItemViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = BacklogItemSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

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
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

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
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

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
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return SprintReview.objects.filter(
            sprint__project_id=project_id,
            sprint__project__company=self.request.user.company
        )


class SprintRetrospectiveViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = SprintRetrospectiveSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

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
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

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
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

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
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        return self.get_project_queryset(ScrumTeam)

    def perform_create(self, serializer):
        project = self.get_project()
        serializer.save(project=project)

    def list(self, request, project_id=None, *args, **kwargs):
        """Return Scrum-specific team rows; if none exist, fall back to the
        generic ProjectTeam so methodology-specific tabs aren't empty when
        only the unified team is populated.
        """
        scrum_qs = self.get_queryset()
        if scrum_qs.exists():
            return Response(ScrumTeamSerializer(scrum_qs, many=True).data)

        # Fallback: synthesise read-only rows from the generic ProjectTeam
        # so the Scrum team tab matches the unified team. Default role is
        # "developer" (Scrum Guide 2020 — Developers is the catch-all
        # accountability when no explicit role mapping exists).
        from projects.models import ProjectTeam
        generic = ProjectTeam.objects.filter(
            project_id=project_id,
            project__company=request.user.company,
            is_active=True,
        ).select_related('user')
        payload = [
            {
                'id': None,
                'project': int(project_id) if project_id else None,
                'user': pt.user_id,
                'user_name': pt.user.get_full_name(),
                'user_email': pt.user.email,
                'role': 'developer',
                'capacity_per_sprint': None,
                'created_at': pt.added_at,
                '_source': 'generic_project_team',
            }
            for pt in generic
        ]
        return Response(payload)

# =============================================================================
# SPRINT GOAL, PLANNING, INCREMENT (NEW)
# =============================================================================

class SprintGoalViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    serializer_class = SprintGoalSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

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
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

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
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

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
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

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
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

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
            'sprint_total': 0,                # total COUNT of sprints (frontend reads this)
            'active_sprint_story_points': 0,  # story points of the active sprint
            'sprints_total': 0,               # kept for backward compatibility (== sprint_total)
            'backlog_items_count': 0,
            'backlog_ready_count': 0,
            'total_story_points': 0,
            'average_velocity': 0,
            'recent_velocities': [],
            'team_size': 0,
            'team': [],
        }

        try:
            # Sprint Guide 2020 — distinct concepts:
            #   sprint_progress              -> story-point progress for the
            #     currently active sprint (completed)
            #   active_sprint_story_points   -> total story points of the
            #     currently active sprint
            #   sprint_total / sprints_total -> total COUNT of sprints across
            #     the project's life (for the dashboard "X sprints" tile).
            #     Frontend reads `sprint_total` and expects the count.
            project_sprints = Sprint.objects.filter(project_id=project_id)
            dashboard_data['sprint_total'] = project_sprints.count()
            dashboard_data['sprints_total'] = project_sprints.count()

            active_sprint = project_sprints.filter(status='active').first()
            if active_sprint:
                dashboard_data['active_sprint'] = SprintSerializer(active_sprint).data
                dashboard_data['sprint_progress'] = active_sprint.completed_story_points or 0
                dashboard_data['active_sprint_story_points'] = active_sprint.total_story_points or 0
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
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

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


class ScrumSeedDemoView(APIView):
    """One-shot demo seeder for every Scrum sub-tab. Idempotent.

    Restricted to admins, project managers and program managers.
    """
    from accounts.permissions import HasRole
    permission_classes = [HasRole("superadmin", "admin", "pm", "program_manager"), MethodologyMatchesProjectPermission]

    def post(self, request, project_id=None):
        from datetime import date, timedelta
        from django.contrib.auth import get_user_model
        from django.db import transaction
        from projects.models import Project

        User = get_user_model()
        project = get_object_or_404(Project, id=project_id, company=request.user.company)
        company = request.user.company
        team_pool = list(User.objects.filter(company=company)[:6]) or [request.user]
        created = {}
        today = date.today()

        with transaction.atomic():
            # ---- Team ----
            roles = ['product_owner', 'scrum_master', 'developer', 'developer', 'developer', 'stakeholder']
            team_count = 0
            for idx, member in enumerate(team_pool):
                _, was_created = ScrumTeam.objects.get_or_create(
                    project=project, user=member,
                    defaults={'role': roles[idx % len(roles)], 'capacity_per_sprint': 8 if roles[idx % len(roles)] == 'developer' else 0},
                )
                if was_created:
                    team_count += 1
            created['team'] = team_count

            # ---- Product Backlog + Sprints + Items ----
            backlog, _ = ProductBacklog.objects.get_or_create(
                project=project,
                defaults={
                    'vision': f"Deliver measurable outcomes for {project.name} customers within two quarters.",
                    'description': "Product backlog covering MVP scope and the first post-launch enhancements.",
                },
            )

            sprints = list(Sprint.objects.filter(project=project).order_by('number'))
            if len(sprints) < 2:
                sp1 = Sprint.objects.create(
                    project=project, name='Sprint 1', number=1,
                    goal='Ship onboarding + auth hardening',
                    start_date=today - timedelta(days=21),
                    end_date=today - timedelta(days=7),
                    status='completed', team_capacity=24,
                    went_well='Onboarding shipped early. No prod incidents.',
                    to_improve='Estimation off on auth tasks.',
                    action_items='Add buffer for security work.',
                )
                sp2 = Sprint.objects.create(
                    project=project, name='Sprint 2', number=2,
                    goal='Reporting dashboard MVP + first AI helper',
                    start_date=today - timedelta(days=6),
                    end_date=today + timedelta(days=8),
                    status='active', team_capacity=28,
                )
                sprints = [sp1, sp2]
                created['sprints'] = 2
            else:
                created['sprints'] = 0

            # ---- Backlog items ----
            backlog_count = 0
            if not BacklogItem.objects.filter(backlog=backlog).exists():
                items_seed = [
                    ('Onboarding flow — happy path', 'user_story', 'high', 'done', 5, sprints[0]),
                    ('Email magic-link verification', 'user_story', 'high', 'done', 3, sprints[0]),
                    ('Bug: signup rejects + symbol in email', 'bug', 'critical', 'done', 2, sprints[0]),
                    ('First-login welcome tour', 'user_story', 'medium', 'in_progress', 5, sprints[1]),
                    ('Velocity widget on dashboard', 'user_story', 'high', 'in_progress', 8, sprints[1]),
                    ('Burndown chart per sprint', 'user_story', 'high', 'ready', 5, sprints[1]),
                    ('Spike: GPT-4 vs Claude for triage', 'spike', 'medium', 'done', 3, sprints[0]),
                    ('Auto-summarize standup blockers', 'user_story', 'medium', 'ready', 8, sprints[1]),
                    ('Suggest acceptance criteria from title', 'user_story', 'low', 'new', 5, None),
                    ('Mobile read-only project list', 'user_story', 'low', 'new', 5, None),
                    ('Push notifications for sprint events', 'user_story', 'low', 'new', 3, None),
                    ('Export reports to PDF', 'user_story', 'medium', 'new', 8, None),
                ]
                for order, (title, kind, prio, status, points, sprint) in enumerate(items_seed):
                    BacklogItem.objects.create(
                        backlog=backlog, item_type=kind, title=title,
                        description=f"As a user I want {title.lower()} so I can deliver value.",
                        acceptance_criteria="Given X\nWhen Y\nThen Z",
                        story_points=points, priority=prio, status=status,
                        order=order, sprint=sprint,
                        assignee=team_pool[order % len(team_pool)],
                        reporter=team_pool[0],
                    )
                    backlog_count += 1
            created['backlog_items'] = backlog_count

            # ---- Sprint Goals ----
            goals_count = 0
            for sp in sprints:
                if not hasattr(sp, 'sprint_goal'):
                    SprintGoal.objects.create(
                        sprint=sp, description=sp.goal or 'Deliver sprint commitments',
                        success_criteria=['All committed stories Done', 'No critical bugs in demo', 'Sprint review held with stakeholders'],
                        is_achieved=(sp.status == 'completed'),
                        created_by=team_pool[0],
                    )
                    goals_count += 1
            created['sprint_goals'] = goals_count

            # ---- Sprint Planning ----
            planning_count = 0
            for sp in sprints:
                if not hasattr(sp, 'planning_meeting') and sp.start_date:
                    SprintPlanning.objects.create(
                        sprint=sp,
                        scheduled_date=timezone.make_aware(timezone.datetime.combine(sp.start_date, timezone.datetime.min.time().replace(hour=10))),
                        duration_minutes=120,
                        status='completed' if sp.status in ('active', 'completed') else 'scheduled',
                        team_capacity=sp.team_capacity, committed_story_points=sp.team_capacity or 0,
                        facilitator=team_pool[1] if len(team_pool) > 1 else team_pool[0],
                    )
                    planning_count += 1
            created['planning_meetings'] = planning_count

            # ---- Daily Standups for active sprint ----
            standup_count = 0
            active_sprint = next((s for s in sprints if s.status == 'active'), None)
            if active_sprint and not DailyStandup.objects.filter(sprint=active_sprint).exists():
                yesterdays = ['Velocity widget data layer', 'Reviewed PR for burndown', 'Pairing on AI prompt', 'Bug bash — 4 found', 'Mobile nav sketch', 'Cypress runners on staging']
                todays = ['Wire widget into dashboard', 'Address PR comments', 'Continue prompt tuning', 'Triage and assign bugs', 'Mobile nav v2', 'Validate cypress green']
                blockers = ['', 'Waiting on staging deploy', '', '', 'Need design tokens', '']
                for d_offset in range(3):
                    d = today - timedelta(days=d_offset)
                    if active_sprint.start_date and d < active_sprint.start_date:
                        continue
                    su = DailyStandup.objects.create(
                        sprint=active_sprint, date=d,
                        notes='Team focused, on-track for sprint goal.',
                        blockers='See individual updates.',
                    )
                    for idx, member in enumerate(team_pool):
                        StandupUpdate.objects.create(
                            standup=su, user=member,
                            yesterday=yesterdays[idx % len(yesterdays)],
                            today=todays[idx % len(todays)],
                            blockers=blockers[idx % len(blockers)],
                        )
                    standup_count += 1
            created['standups'] = standup_count

            # ---- Sprint Review + Retrospective for completed sprint ----
            review_count = 0
            retro_count = 0
            completed_sprint = next((s for s in sprints if s.status == 'completed'), None)
            if completed_sprint:
                if not SprintReview.objects.filter(sprint=completed_sprint).exists():
                    SprintReview.objects.create(
                        sprint=completed_sprint, date=completed_sprint.end_date,
                        completed_story_points=completed_sprint.completed_story_points,
                        sprint_goal_achieved=True,
                        demo_notes='Demoed onboarding flow + magic-link auth. All scenarios passed live.',
                        stakeholder_feedback='Positive — request to extend tour to settings page.',
                        action_items=[
                            {'item': 'Add settings tour follow-up story', 'owner': 'PO'},
                            {'item': 'Schedule security review', 'owner': 'Tech Lead'},
                        ],
                        facilitator=team_pool[0],
                    )
                    review_count = 1

                if not SprintRetrospective.objects.filter(sprint=completed_sprint).exists():
                    SprintRetrospective.objects.create(
                        sprint=completed_sprint, date=completed_sprint.end_date,
                        went_well='Onboarding shipped on day 12.\nPairing reduced review time.\nNo prod incidents.',
                        to_improve='Estimation was off on auth hardening.\nStandups ran long Mon/Wed.',
                        action_items='Time-box standups to 10 min.\nAdd buffer for security work next sprint.',
                        team_morale=4,
                    )
                    retro_count = 1
            created['reviews'] = review_count
            created['retros'] = retro_count

            # ---- Velocity ----
            velocity_count = 0
            for sp in sprints:
                if not hasattr(sp, 'velocity'):
                    Velocity.objects.create(
                        project=project, sprint=sp,
                        committed_points=sp.team_capacity or 0,
                        completed_points=22 if sp.status == 'completed' else (sp.completed_story_points or 0),
                    )
                    velocity_count += 1
            created['velocity'] = velocity_count

            # ---- Definition of Done ----
            dod_count = 0
            if not DefinitionOfDone.objects.filter(project=project).exists():
                dod_seed = [
                    ('Code reviewed by at least 1 peer', 'project'),
                    ('All unit tests pass on CI', 'project'),
                    ('E2E happy-path test added or updated', 'project'),
                    ('User-facing copy reviewed by PO', 'sprint'),
                    ('Updated docs in /docs or inline', 'project'),
                    ('No new ESLint or TS errors', 'project'),
                    ('Demo recorded or shown in standup', 'sprint'),
                    ('Security checklist (XSS, authz, PII) passed', 'project'),
                ]
                for order, (item, scope) in enumerate(dod_seed):
                    DefinitionOfDone.objects.create(
                        project=project, item=item, scope=scope,
                        name='Project DoD', order=order, is_active=True,
                    )
                    dod_count += 1
            created['dod'] = dod_count

        return Response({
            'success': True,
            'project_id': project.id,
            'created': created,
            'message': f"Scrum demo data seeded for {project.name}",
        })


class ScrumClearDemoView(APIView):
    """Wipe all Scrum data for a project.

    Restricted to admins, project managers and program managers.
    """
    from accounts.permissions import HasRole
    permission_classes = [HasRole("superadmin", "admin", "pm", "program_manager"), MethodologyMatchesProjectPermission]

    def post(self, request, project_id=None):
        from django.db import transaction
        from projects.models import Project

        project = get_object_or_404(Project, id=project_id, company=request.user.company)
        deleted = {}
        with transaction.atomic():
            deleted['team'] = ScrumTeam.objects.filter(project=project).count()
            ScrumTeam.objects.filter(project=project).delete()
            deleted['sprints'] = Sprint.objects.filter(project=project).count()
            Sprint.objects.filter(project=project).delete()  # cascades to items, planning, reviews, retros, standups, velocity, goals
            try:
                backlog = project.scrum_backlog
                deleted['backlog_items'] = backlog.items.count()
                backlog.delete()
                deleted['backlog'] = 1
            except ProductBacklog.DoesNotExist:
                deleted['backlog'] = 0
                deleted['backlog_items'] = 0
            deleted['dod'] = DefinitionOfDone.objects.filter(project=project).count()
            DefinitionOfDone.objects.filter(project=project).delete()
        return Response({'success': True, 'deleted': deleted})
