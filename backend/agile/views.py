from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Sum, Avg
from datetime import date

from projects.models import Project
from projects.permissions import MethodologyMatchesProjectPermission
from django.db.models import Q as _DjangoQ
from .models import (
    AgileTeamMember, AgileProductVision, AgileProductGoal,
    AgileUserPersona, AgileEpic, AgileBacklogItem, AgileIteration,
    AgileRelease, AgileDailyUpdate, AgileRetrospective, AgileRetroItem,
    AgileBudget, AgileBudgetItem, DefinitionOfDone
)
from .serializers import (
    DefinitionOfDoneSerializer,
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


def _gated_project_lookup(user, project_id):
    """P0 fix — Project lookup gated by membership / creator / superadmin."""
    if not user.is_authenticated:
        from rest_framework.exceptions import NotAuthenticated
        raise NotAuthenticated()
    if getattr(user, 'role', None) == 'superadmin' or getattr(user, 'is_superuser', False):
        return get_object_or_404(Project, id=project_id)
    return get_object_or_404(
        Project.objects.filter(
            _DjangoQ(team_members__user=user, team_members__is_active=True)
            | _DjangoQ(created_by=user)
        ).distinct(),
        id=project_id,
    )


class AgileProjectMixin:
    """Mixin to filter by project (membership-gated)."""
    def get_project(self):
        project_id = self.kwargs.get('project_id')
        return _gated_project_lookup(self.request.user, project_id)

    def get_queryset(self):
        return super().get_queryset().filter(project=self.get_project())


# ============================================
# DASHBOARD VIEW
# ============================================

class AgileDashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]
    
    def retrieve(self, request, project_id=None):
        project = _gated_project_lookup(request.user, project_id)
        
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
        project = _gated_project_lookup(request.user, project_id)
        
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
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]
    
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
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]
    
    def retrieve(self, request, project_id=None):
        project = _gated_project_lookup(request.user, project_id)
        vision, _ = AgileProductVision.objects.get_or_create(project=project)
        return Response(AgileProductVisionSerializer(vision).data)
    
    def update(self, request, project_id=None):
        project = _gated_project_lookup(request.user, project_id)
        vision, _ = AgileProductVision.objects.get_or_create(project=project)
        serializer = AgileProductVisionSerializer(vision, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class AgileProductGoalViewSet(AgileProjectMixin, viewsets.ModelViewSet):
    queryset = AgileProductGoal.objects.all()
    serializer_class = AgileProductGoalSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]
    
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
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]
    
    def perform_create(self, serializer):
        serializer.save(project=self.get_project())


# ============================================
# BACKLOG VIEWS
# ============================================

class AgileEpicViewSet(AgileProjectMixin, viewsets.ModelViewSet):
    queryset = AgileEpic.objects.all()
    serializer_class = AgileEpicSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]
    
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
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]
    
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
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]
    
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
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]
    
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
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]
    
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
        project = _gated_project_lookup(self.request.user, self.kwargs.get("project_id"))
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
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]
    
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
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]
    
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
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]
    
    def retrieve(self, request, project_id=None):
        project = _gated_project_lookup(request.user, project_id)
        budget, _ = AgileBudget.objects.get_or_create(project=project)
        return Response(AgileBudgetSerializer(budget).data)
    
    def update(self, request, project_id=None):
        project = _gated_project_lookup(request.user, project_id)
        budget, _ = AgileBudget.objects.get_or_create(project=project)
        serializer = AgileBudgetSerializer(budget, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class AgileBudgetItemViewSet(viewsets.ModelViewSet):
    queryset = AgileBudgetItem.objects.all()
    serializer_class = AgileBudgetItemSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]
    
    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        project = _gated_project_lookup(request.user, project_id)
        budget = AgileBudget.objects.filter(project=project).first()
        if budget:
            return AgileBudgetItem.objects.filter(budget=budget)
        return AgileBudgetItem.objects.none()
    
    def perform_create(self, serializer):
        project = _gated_project_lookup(self.request.user, self.kwargs.get("project_id"))
        budget, _ = AgileBudget.objects.get_or_create(project=project)
        serializer.save(budget=budget)

class DefinitionOfDoneViewSet(viewsets.ModelViewSet):
    serializer_class = DefinitionOfDoneSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return DefinitionOfDone.objects.filter(project_id=project_id)

    def perform_create(self, serializer):
        project_id = self.kwargs.get('project_id')
        from projects.models import Project
        serializer.save(project=Project.objects.get(id=project_id))


class AgileSeedDemoView(viewsets.ViewSet):
    """One-shot endpoint that pre-fills every Agile sub-tab with realistic
    demo data so an empty project becomes a working showcase. Idempotent —
    re-running on the same project skips tabs that already have data.

    Restricted to admins, project managers and program managers — content
    creators only.
    """
    from accounts.permissions import HasRole
    permission_classes = [HasRole("superadmin", "admin", "pm", "program_manager"), MethodologyMatchesProjectPermission]

    def create(self, request, project_id=None):
        from datetime import timedelta
        from django.db import transaction

        project = _gated_project_lookup(request.user, project_id)
        user = request.user
        company = getattr(user, 'company', None)
        team_pool = list(User.objects.filter(company=company)[:6]) if company else [user]
        if not team_pool:
            team_pool = [user]

        created = {}

        with transaction.atomic():
            # ---- Team ----
            roles = ['product_owner', 'tech_lead', 'developer', 'designer', 'qa', 'devops']
            skill_sets = [
                ['Roadmap', 'Stakeholder mgmt'],
                ['Architecture', 'Python', 'AWS'],
                ['React', 'TypeScript'],
                ['Figma', 'UX research'],
                ['Cypress', 'Playwright'],
                ['Docker', 'Kubernetes'],
            ]
            team_count = 0
            for idx, member in enumerate(team_pool):
                _, was_created = AgileTeamMember.objects.get_or_create(
                    project=project, user=member,
                    defaults={
                        'role': roles[idx % len(roles)],
                        'capacity_hours': 40,
                        'skills': skill_sets[idx % len(skill_sets)],
                    }
                )
                if was_created:
                    team_count += 1
            created['team'] = team_count

            # ---- Product Vision + Goals ----
            vision, vision_created = AgileProductVision.objects.get_or_create(
                project=project,
                defaults={
                    'vision_statement': f"Empower customers to achieve measurable outcomes through {project.name}.",
                    'target_audience': "Mid-market B2B teams (50-500 FTE) with hybrid workflows.",
                    'problem_statement': "Existing tools are siloed, hard to adopt, and produce no measurable insights.",
                    'unique_value_proposition': "AI-assisted workflows + integrated reporting in one collaborative workspace.",
                    'success_criteria': [
                        "20% lift in weekly active usage by Q2",
                        "NPS > 40 across pilot customers",
                        "<2 weeks time-to-first-value for new tenants",
                    ],
                }
            )
            goals_created = 0
            if vision_created or vision.goals.count() == 0:
                goals_seed = [
                    ('Launch MVP to 3 pilot customers', 'critical', 'in_progress', 30),
                    ('Reach 80% feature adoption', 'high', 'planned', 90),
                    ('Establish weekly release cadence', 'high', 'in_progress', 45),
                    ('Reduce onboarding to <2 weeks', 'medium', 'planned', 75),
                ]
                for order, (title, prio, st, days) in enumerate(goals_seed):
                    AgileProductGoal.objects.create(
                        vision=vision, title=title, priority=prio, status=st,
                        target_date=date.today() + timedelta(days=days), order=order,
                    )
                    goals_created += 1
            created['vision'] = 1 if vision_created else 0
            created['goals'] = goals_created

            # ---- User Personas ----
            personas_created = 0
            if not AgileUserPersona.objects.filter(project=project).exists():
                personas_seed = [
                    ('Sarah Chen', 'Product Manager', '32-40', 'blue',
                     "10y product experience in SaaS startups, currently scaling Series-B fintech.",
                     ['Ship faster', 'Align engineering + business', 'Data-driven decisions'],
                     ['Tooling fragmentation', 'Late visibility on risks'],
                     "I need one place to see everything that matters this sprint."),
                    ('Marcus Johnson', 'Engineering Lead', '35-45', 'purple',
                     "Tech lead managing 8 engineers across two squads.",
                     ['Reduce handoff friction', 'Protect deep-work time', 'Mentor team'],
                     ['Context-switching', 'Stand-ups eating focus time'],
                     "I want async-first updates and a clean backlog."),
                    ('Priya Patel', 'UX Researcher', '28-35', 'pink',
                     "Embedded researcher pairing with PMs and designers.",
                     ['Run quick discovery cycles', 'Share insights broadly'],
                     ['Insights getting lost', 'Slow stakeholder feedback'],
                     "Make research findings impossible to ignore."),
                ]
                for name, role, age, color, bg, goals, pains, quote in personas_seed:
                    AgileUserPersona.objects.create(
                        project=project, name=name, role=role, age_range=age,
                        avatar_color=color, background=bg,
                        goals=goals, pain_points=pains, quote=quote,
                    )
                    personas_created += 1
            created['personas'] = personas_created

            # ---- Epics ----
            epics = []
            if not AgileEpic.objects.filter(project=project).exists():
                epics_seed = [
                    ('Onboarding & Activation', 'Smooth first-run experience', 'must_have', 'emerald'),
                    ('Reporting Dashboard', 'KPIs and team performance views', 'should_have', 'blue'),
                    ('AI Assistant', 'Inline AI helpers across workflows', 'should_have', 'purple'),
                    ('Mobile Companion', 'iOS + Android read-mostly app', 'could_have', 'amber'),
                ]
                for order, (t, d, p, c) in enumerate(epics_seed):
                    epics.append(AgileEpic.objects.create(
                        project=project, title=t, description=d, priority=p, color=c, order=order,
                    ))
            else:
                epics = list(AgileEpic.objects.filter(project=project))
            created['epics'] = sum(1 for _ in epics) if not AgileEpic.objects.filter(project=project).count() else len(epics)

            # ---- Iterations ----
            iterations = list(AgileIteration.objects.filter(project=project))
            today = date.today()
            if len(iterations) < 2:
                # Sprint 1 — completed
                sp1 = AgileIteration.objects.create(
                    project=project, name='Sprint 1',
                    goal='Ship onboarding flow + auth hardening',
                    start_date=today - timedelta(days=21),
                    end_date=today - timedelta(days=7),
                    status='completed',
                    velocity_committed=24, velocity_completed=22,
                )
                # Sprint 2 — active
                sp2 = AgileIteration.objects.create(
                    project=project, name='Sprint 2',
                    goal='Reporting dashboard MVP + first AI helper',
                    start_date=today - timedelta(days=6),
                    end_date=today + timedelta(days=8),
                    status='active',
                    velocity_committed=28, velocity_completed=12,
                )
                iterations = [sp1, sp2]
                created['iterations'] = 2
            else:
                created['iterations'] = 0

            # ---- Backlog Items ----
            backlog_count = 0
            if not AgileBacklogItem.objects.filter(project=project).exists() and epics:
                stories_seed = [
                    (epics[0], 'As a new user I can complete signup in <2 min', 'must_have', 'done', 5, 'story'),
                    (epics[0], 'Email verification with magic link', 'must_have', 'done', 3, 'story'),
                    (epics[0], 'Welcome tour for first login', 'should_have', 'in_progress', 5, 'story'),
                    (epics[0], 'Bug: signup form rejects + symbol in email', 'must_have', 'done', 2, 'bug'),
                    (epics[1], 'Velocity widget on dashboard', 'should_have', 'in_progress', 8, 'story'),
                    (epics[1], 'Burndown chart per sprint', 'should_have', 'review', 5, 'story'),
                    (epics[1], 'Export reports to PDF', 'could_have', 'backlog', 8, 'story'),
                    (epics[2], 'Spike: evaluate GPT-4 vs Claude for ticket triage', 'should_have', 'done', 3, 'spike'),
                    (epics[2], 'AI: auto-summarize standup blockers', 'should_have', 'ready', 8, 'story'),
                    (epics[2], 'AI: suggest acceptance criteria from title', 'could_have', 'backlog', 5, 'story'),
                    (epics[3], 'Mobile read-only project list', 'could_have', 'backlog', 5, 'story'),
                    (epics[3], 'Push notifications for sprint events', 'could_have', 'backlog', 3, 'story'),
                ]
                for order, (epic, title, prio, status, points, kind) in enumerate(stories_seed):
                    iter_assigned = None
                    if status in ('done', 'review') and len(iterations) >= 1:
                        iter_assigned = iterations[0]
                    elif status in ('in_progress', 'ready') and len(iterations) >= 2:
                        iter_assigned = iterations[1]
                    AgileBacklogItem.objects.create(
                        project=project, epic=epic, title=title, priority=prio,
                        status=status, story_points=points, item_type=kind,
                        iteration=iter_assigned,
                        assignee=team_pool[order % len(team_pool)] if team_pool else None,
                        order=order,
                        acceptance_criteria="Given the user is logged in\nWhen they perform the action\nThen the result is observable.",
                    )
                    backlog_count += 1
            created['backlog'] = backlog_count

            # ---- Release ----
            release_count = 0
            if not AgileRelease.objects.filter(project=project).exists():
                rel = AgileRelease.objects.create(
                    project=project, name='v1.0 — Public Beta',
                    version='1.0.0',
                    description='First public-beta release covering onboarding, reporting and AI helper.',
                    target_date=today + timedelta(days=30),
                    status='in_progress',
                    features=['Onboarding flow', 'Reporting dashboard', 'AI standup summarizer'],
                )
                if iterations:
                    rel.iterations.set(iterations)
                release_count = 1
            created['releases'] = release_count

            # ---- Daily Updates (last 3 days for active sprint) ----
            daily_count = 0
            active_sprint = next((it for it in iterations if it.status == 'active'), None)
            if active_sprint and not AgileDailyUpdate.objects.filter(iteration=active_sprint).exists():
                yesterday_template = [
                    "Finished velocity widget data layer",
                    "Reviewed PR for burndown chart",
                    "Pairing on AI standup summarizer prompt",
                    "Bug-bash session — logged 4 issues",
                    "Sketched mobile nav, got feedback from Priya",
                    "Set up cypress runners on staging",
                ]
                today_template = [
                    "Wire widget into dashboard layout",
                    "Address review comments + ship",
                    "Continue AI prompt tuning",
                    "Triage and assign bugs from yesterday",
                    "Iterate on mobile nav v2",
                    "Validate cypress green on PR pipeline",
                ]
                blockers_template = ["", "Waiting on staging deploy", "", "", "Need design tokens", ""]
                for d_offset in range(3):
                    d = today - timedelta(days=d_offset)
                    if d < active_sprint.start_date or d > active_sprint.end_date:
                        continue
                    for idx, member in enumerate(team_pool):
                        AgileDailyUpdate.objects.create(
                            project=project, iteration=active_sprint, user=member, date=d,
                            yesterday=yesterday_template[idx % len(yesterday_template)],
                            today=today_template[idx % len(today_template)],
                            blockers=blockers_template[idx % len(blockers_template)],
                        )
                        daily_count += 1
            created['daily_updates'] = daily_count

            # ---- Retrospective for completed sprint ----
            retro_count = 0
            completed_sprint = next((it for it in iterations if it.status == 'completed'), None)
            if completed_sprint and not hasattr(completed_sprint, 'retrospective'):
                try:
                    retro = AgileRetrospective.objects.create(
                        iteration=completed_sprint, date=completed_sprint.end_date,
                        facilitator=team_pool[0] if team_pool else None,
                        notes="Solid sprint, on-time delivery. Picked up 2 unplanned bugs that ate into velocity.",
                    )
                    retro_items_seed = [
                        ('went_well', 'Onboarding flow shipped on day 12', 4),
                        ('went_well', 'Pairing sessions reduced review time', 3),
                        ('went_well', 'No production incidents', 2),
                        ('to_improve', 'Estimation was off on auth hardening', 5),
                        ('to_improve', 'Standups ran long on Monday/Wednesday', 3),
                        ('action_item', 'Time-box standups to 10 min', 6),
                        ('action_item', 'Add buffer for security work in next sprint', 4),
                    ]
                    for cat, content, votes in retro_items_seed:
                        AgileRetroItem.objects.create(
                            retrospective=retro, category=cat, content=content,
                            votes=votes, status='open' if cat == 'action_item' else 'done',
                            assignee=team_pool[0] if team_pool and cat == 'action_item' else None,
                            created_by=user,
                        )
                        retro_count += 1
                except Exception:
                    pass
            created['retro_items'] = retro_count

            # ---- Definition of Done ----
            dod_count = 0
            if not DefinitionOfDone.objects.filter(project=project).exists():
                dod_seed = [
                    ('Code reviewed by at least 1 peer', 'review'),
                    ('All unit tests pass on CI', 'testing'),
                    ('E2E happy-path test added or updated', 'testing'),
                    ('User-facing copy reviewed by PM', 'review'),
                    ('Updated docs in /docs or inline', 'documentation'),
                    ('No new ESLint or TS errors', 'quality'),
                    ('Demo recorded or shown in standup', 'acceptance'),
                    ('Security checklist (XSS, authz, PII) passed', 'security'),
                ]
                for order, (desc, cat) in enumerate(dod_seed):
                    DefinitionOfDone.objects.create(
                        project=project, description=desc, category=cat,
                        is_required=True, order=order,
                    )
                    dod_count += 1
            created['dod'] = dod_count

            # ---- Budget + Items ----
            budget, budget_created = AgileBudget.objects.get_or_create(
                project=project,
                defaults={'total_budget': 250000, 'currency': 'EUR'},
            )
            if budget_created or budget.total_budget == 0:
                budget.total_budget = 250000
                budget.save(update_fields=['total_budget'])
            budget_items_count = 0
            if not budget.items.exists():
                items_seed = [
                    ('development', 'Sprint 1 — engineering capacity', 60000, 58000, today - timedelta(days=7)),
                    ('design', 'Onboarding visual design + assets', 12000, 11500, today - timedelta(days=14)),
                    ('qa', 'Test automation setup (Cypress)', 9000, 8800, today - timedelta(days=10)),
                    ('infrastructure', 'AWS staging + production environments (Q1)', 18000, 6200, today - timedelta(days=2)),
                    ('tools', 'Annual licenses (Figma, Linear, Sentry)', 14000, 14000, today - timedelta(days=30)),
                    ('training', 'Agile + AI workshop for team', 6000, 0, today + timedelta(days=14)),
                ]
                for cat, desc, planned, actual, d in items_seed:
                    AgileBudgetItem.objects.create(
                        budget=budget, category=cat, description=desc,
                        planned_amount=planned, actual_amount=actual, date=d,
                    )
                    budget_items_count += 1
            created['budget_items'] = budget_items_count

        return Response({
            'success': True,
            'project_id': project.id,
            'created': created,
            'message': f"Demo data seeded for {project.name}",
        }, status=status.HTTP_200_OK)


class AgileClearDemoView(viewsets.ViewSet):
    """Wipe all Agile data for a project (team, backlog, iterations, etc.).

    Restricted to admins, project managers and program managers.
    """
    from accounts.permissions import HasRole
    permission_classes = [HasRole("superadmin", "admin", "pm", "program_manager"), MethodologyMatchesProjectPermission]

    def create(self, request, project_id=None):
        from django.db import transaction
        project = _gated_project_lookup(request.user, project_id)
        deleted = {}
        with transaction.atomic():
            deleted['team'] = AgileTeamMember.objects.filter(project=project).count()
            AgileTeamMember.objects.filter(project=project).delete()
            deleted['personas'] = AgileUserPersona.objects.filter(project=project).count()
            AgileUserPersona.objects.filter(project=project).delete()
            deleted['backlog_items'] = AgileBacklogItem.objects.filter(project=project).count()
            AgileBacklogItem.objects.filter(project=project).delete()
            deleted['epics'] = AgileEpic.objects.filter(project=project).count()
            AgileEpic.objects.filter(project=project).delete()
            deleted['iterations'] = AgileIteration.objects.filter(project=project).count()
            AgileIteration.objects.filter(project=project).delete()
            deleted['releases'] = AgileRelease.objects.filter(project=project).count()
            AgileRelease.objects.filter(project=project).delete()
            deleted['daily_updates'] = AgileDailyUpdate.objects.filter(project=project).count()
            AgileDailyUpdate.objects.filter(project=project).delete()
            deleted['dod'] = DefinitionOfDone.objects.filter(project=project).count()
            DefinitionOfDone.objects.filter(project=project).delete()
            try:
                deleted['vision'] = 1 if project.agile_vision else 0
                project.agile_vision.delete()
            except AgileProductVision.DoesNotExist:
                deleted['vision'] = 0
            try:
                budget = project.agile_budget
                deleted['budget_items'] = budget.items.count()
                budget.delete()
                deleted['budget'] = 1
            except AgileBudget.DoesNotExist:
                deleted['budget_items'] = 0
                deleted['budget'] = 0
        return Response({'success': True, 'deleted': deleted})
