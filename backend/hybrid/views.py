from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import models
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from projects.models import Project
from projects.permissions import MethodologyMatchesProjectPermission

from .models import HybridArtifact, HybridConfiguration, PhaseMethodology, HybridTask
from .serializers import (
    HybridArtifactSerializer, HybridConfigurationSerializer,
    PhaseMethodologySerializer, HybridTaskSerializer,
)


# Locally redefined to avoid potential circular imports with projects.views.
# Mirror of projects.views.COMPANY_WIDE_ROLES — keep in sync.
COMPANY_WIDE_ROLES = frozenset({"admin", "pm", "program_manager"})


def _get_company(user):
    return getattr(user, 'company', None)


def _accessible_project_ids(user):
    """P2 fix — projects the user is a member of (or creator), or all if superadmin).

    Sachin-regression fix: company-wide roles (admin/pm/program_manager) see
    all projects within their own company, mirroring projects.views behaviour.
    """
    from django.db.models import Q
    if not user.is_authenticated:
        return Project.objects.none().values_list('id', flat=True)
    if getattr(user, 'role', None) == 'superadmin' or getattr(user, 'is_superuser', False):
        return Project.objects.all().values_list('id', flat=True)
    if getattr(user, 'role', None) in COMPANY_WIDE_ROLES and getattr(user, 'company_id', None):
        return Project.objects.filter(company_id=user.company_id).values_list('id', flat=True)
    return Project.objects.filter(
        Q(team_members__user=user, team_members__is_active=True)
        | Q(created_by=user)
    ).values_list('id', flat=True).distinct()


def _verify_project_access(user, project_id):
    """Verify the user is a team_member / creator / superadmin on the project.

    P2 fix — was company-only, allowing any tenant member to read any project.
    Sachin-regression fix: company-wide roles (admin/pm/program_manager) are
    allowed for any project within their own company.
    """
    if getattr(user, 'role', None) == 'superadmin' or getattr(user, 'is_superuser', False):
        return
    if getattr(user, 'role', None) in COMPANY_WIDE_ROLES and getattr(user, 'company_id', None):
        if Project.objects.filter(id=project_id, company_id=user.company_id).exists():
            return
    if not Project.objects.filter(
        id=project_id
    ).filter(
        models.Q(team_members__user=user, team_members__is_active=True)
        | models.Q(created_by=user)
    ).exists():
        raise PermissionDenied("You do not have access to this project.")


class HybridArtifactViewSet(viewsets.ModelViewSet):
    serializer_class = HybridArtifactSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['project', 'source_methodology', 'status']
    search_fields = ['name', 'description']

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return HybridArtifact.objects.none()
        queryset = HybridArtifact.objects.select_related('project').filter(project_id__in=_accessible_project_ids(self.request.user))
        project_id = self.kwargs.get('project_id')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset

    def perform_create(self, serializer):
        project_id = self.kwargs.get('project_id')
        if project_id:
            _verify_project_access(self.request.user, project_id)
            serializer.save(project_id=project_id)
        else:
            serializer.save()


class HybridConfigurationViewSet(viewsets.ModelViewSet):
    serializer_class = HybridConfigurationSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['project', 'primary_methodology', 'is_active']

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return HybridConfiguration.objects.none()
        queryset = HybridConfiguration.objects.select_related('project').filter(project_id__in=_accessible_project_ids(self.request.user))
        project_id = self.kwargs.get('project_id')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset

    def perform_create(self, serializer):
        project_id = self.kwargs.get('project_id')
        if project_id:
            _verify_project_access(self.request.user, project_id)
            serializer.save(project_id=project_id)
        else:
            serializer.save()


class HybridDashboardView(APIView):
    """Aggregate dashboard for hybrid projects.

    Provides a hybrid-specific landing endpoint so frontends do not need to
    fall back to /agile/dashboard/ (which the methodology guard correctly
    rejects for hybrid projects).
    """

    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get(self, request, project_id):
        company = _get_company(request.user)
        if not company:
            raise PermissionDenied("You do not have access to this project.")

        project = get_object_or_404(Project, id=project_id, company=company)

        try:
            progress = project.compute_progress_from_work()
        except Exception:
            progress = 0

        return Response({
            'project_id': project.id,
            'project_name': project.name,
            'methodology': 'hybrid',
            'artifacts_count': HybridArtifact.objects.filter(project=project).count(),
            'configs': HybridConfiguration.objects.filter(project=project, is_active=True).count(),
            'phase_methodologies': list(
                PhaseMethodology.objects.filter(project=project)
                .order_by('order')
                .values('phase', 'methodology')
            ),
            'progress': progress or 0,
            'budget': project.budget or 0,
        })


class PhaseMethodologyViewSet(viewsets.ModelViewSet):
    serializer_class = PhaseMethodologySerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['project', 'methodology']
    ordering_fields = ['order']

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return PhaseMethodology.objects.none()
        queryset = PhaseMethodology.objects.select_related('project').filter(project_id__in=_accessible_project_ids(self.request.user))
        project_id = self.kwargs.get('project_id')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset

    def perform_create(self, serializer):
        project_id = self.kwargs.get('project_id')
        if project_id:
            _verify_project_access(self.request.user, project_id)
            serializer.save(project_id=project_id)
        else:
            serializer.save()

    # ---- Mixed-governance gates (backlog #38) -------------------------------
    # A phase completes under the governance STRATEGY its methodology maps to
    # (see constants.STRATEGY_BY_METHODOLOGY). These two actions are the ONLY
    # writers of gate_status / completed_at — a raw PATCH cannot advance a phase
    # (gate fields are read_only in the serializer; progress>=100 is rejected).

    @action(detail=True, methods=['post'])
    def signoff(self, request, pk=None, project_id=None):
        """Record a predictive gate review sign-off.

        Only predictive phases (waterfall / prince2 / lean_six_sigma_*) have a
        formal gate review. Signing off flips gate_status open -> signed_off,
        which is the precondition `complete` checks for a predictive phase.
        """
        phase = self.get_object()
        if phase.strategy != 'predictive':
            return Response(
                {
                    'detail': (
                        f"Phase '{phase.phase}' is governed by the "
                        f"{phase.strategy} strategy, which has no gate sign-off. "
                        "Complete it via its strategy's criteria instead."
                    ),
                    'code': 'signoff_not_applicable',
                    'strategy': phase.strategy,
                },
                status=409,
            )
        if phase.gate_status == 'complete':
            return Response(
                {'detail': 'Phase is already complete.', 'code': 'already_complete'},
                status=409,
            )
        phase.gate_status = 'signed_off'
        phase.signed_off_by = request.user
        phase.signed_off_at = timezone.now()
        phase.save(update_fields=['gate_status', 'signed_off_by', 'signed_off_at', 'updated_at'])
        return Response(self.get_serializer(phase).data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None, project_id=None):
        """Complete a phase under its methodology's governance strategy.

        predictive -> requires a recorded gate sign-off (409 signoff_required)
        adaptive   -> requires every DoD item checked + every phase task done
                      (409 dod_incomplete, with the open blockers listed)
        flow       -> requires every phase task pulled to done
                      (409 work_in_progress, with the not-done tasks listed)

        On success: progress=100, gate_status='complete', completed_at=now.
        """
        phase = self.get_object()
        if phase.gate_status == 'complete':
            return Response(
                {'detail': 'Phase is already complete.', 'code': 'already_complete'},
                status=409,
            )

        strategy = phase.strategy

        if strategy == 'predictive':
            if phase.gate_status != 'signed_off':
                return Response(
                    {
                        'detail': (
                            f"Predictive phase '{phase.phase}' needs a gate "
                            "review sign-off before it can complete."
                        ),
                        'code': 'signoff_required',
                        'strategy': strategy,
                    },
                    status=409,
                )

        elif strategy == 'adaptive':
            checklist = phase.dod_checklist or []
            open_dod = [
                item.get('text', '(unnamed)')
                for item in checklist
                if isinstance(item, dict) and not item.get('done')
            ]
            open_tasks = list(
                phase.tasks.exclude(status='done').values_list('title', flat=True)
            )
            if not checklist:
                open_dod = ['Definition of Done checklist is empty']
            if open_dod or open_tasks:
                return Response(
                    {
                        'detail': (
                            f"Adaptive phase '{phase.phase}' is not Done: its "
                            "Definition-of-Done checklist and all tasks must be "
                            "complete."
                        ),
                        'code': 'dod_incomplete',
                        'strategy': strategy,
                        'blockers': {
                            'open_dod_items': open_dod,
                            'open_tasks': open_tasks,
                        },
                    },
                    status=409,
                )

        else:  # flow
            open_tasks = list(
                phase.tasks.exclude(status='done').values_list('title', flat=True)
            )
            if open_tasks:
                return Response(
                    {
                        'detail': (
                            f"Flow phase '{phase.phase}' still has work in "
                            "progress; drain every task to Done first."
                        ),
                        'code': 'work_in_progress',
                        'strategy': strategy,
                        'blockers': {'open_tasks': open_tasks},
                    },
                    status=409,
                )

        phase.progress = 100
        phase.gate_status = 'complete'
        phase.completed_at = timezone.now()
        phase.save(update_fields=['progress', 'gate_status', 'completed_at', 'updated_at'])
        return Response(self.get_serializer(phase).data)


class HybridTaskViewSet(viewsets.ModelViewSet):
    serializer_class = HybridTaskSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['project', 'phase', 'assignee', 'status', 'priority']
    ordering_fields = ['order', 'due_date', 'priority', 'created_at']
    search_fields = ['title', 'description']

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return HybridTask.objects.none()
        queryset = HybridTask.objects.select_related('project', 'phase', 'assignee').filter(
            project_id__in=_accessible_project_ids(self.request.user)
        )
        project_id = self.kwargs.get('project_id')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset

    def perform_create(self, serializer):
        project_id = self.kwargs.get('project_id')
        if project_id:
            _verify_project_access(self.request.user, project_id)
            serializer.save(project_id=project_id, created_by=self.request.user)
        else:
            serializer.save(created_by=self.request.user)


class HybridSeedDemoView(viewsets.ViewSet):
    from accounts.permissions import HasRole
    permission_classes = [HasRole("superadmin", "admin", "pm", "program_manager"), MethodologyMatchesProjectPermission]

    def create(self, request, project_id=None):
        from django.db import transaction
        _verify_project_access(request.user, project_id)
        project = Project.objects.get(id=project_id)
        created = {}

        with transaction.atomic():
            cfg_count = 0
            if not HybridConfiguration.objects.filter(project=project).exists():
                HybridConfiguration.objects.create(
                    project=project,
                    primary_methodology='Scrum',
                    secondary_methodologies=['Waterfall', 'Kanban'],
                    approach_description='Discovery + Requirements done waterfall-style; build done in Scrum sprints; ops done kanban-style.',
                    rationale='Regulatory phases need formal sign-off; build benefits from iterative delivery; post-launch needs continuous flow.',
                    is_active=True,
                )
                cfg_count = 1
            created['configurations'] = cfg_count

            ph_count = 0
            if not PhaseMethodology.objects.filter(project=project).exists():
                phase_seed = [
                    ('Discovery', 'waterfall', 'Stakeholder interviews + requirements doc; signed-off baseline.'),
                    ('Design', 'waterfall', 'Architecture + UX/UI deliverables reviewed and approved.'),
                    ('Build', 'scrum', 'Sprints of 2 weeks delivering backlog increments.'),
                    ('Test & Validate', 'scrum', 'Test cases executed in-sprint; UAT at end of sprints.'),
                    ('Launch', 'waterfall', 'Go/no-go gate; production cutover; signed-off release.'),
                    ('Operate', 'kanban', 'Continuous flow of bug fixes + small enhancements.'),
                ]
                for order, (phase, method, desc) in enumerate(phase_seed):
                    PhaseMethodology.objects.create(
                        project=project, phase=phase, methodology=method,
                        description=desc, order=order,
                    )
                    ph_count += 1
            created['phase_methodologies'] = ph_count

            ar_count = 0
            if not HybridArtifact.objects.filter(project=project).exists():
                artifacts_seed = [
                    ('Project Charter', 'PMBOK', 'Formal project authorization with scope, objectives, stakeholders.',
                     {'sections': ['scope', 'objectives', 'stakeholders', 'budget'], 'approved_by': 'Sponsor'}),
                    ('Requirements Specification', 'Waterfall', 'Detailed requirements, signed off.',
                     {'requirements_count': 24, 'must_have': 16, 'should_have': 6, 'could_have': 2}),
                    ('Product Backlog', 'Scrum', 'Living list prioritised by Product Owner.',
                     {'items_count': 38, 'ready': 12, 'done': 14, 'sprint_velocity': 26}),
                    ('Sprint Plan', 'Scrum', 'Current sprint goal and committed items.',
                     {'sprint_number': 4, 'goal': 'Complete authentication module', 'committed_points': 28}),
                    ('Kanban Board', 'Kanban', 'Visual workflow for ongoing operations.',
                     {'columns': ['Backlog', 'In Progress', 'Review', 'Done'], 'wip_limits': {'In Progress': 4}}),
                    ('Risk Register', 'PMBOK', 'Identified risks with mitigation plans.',
                     {'risks_count': 8, 'high': 2, 'medium': 4, 'low': 2}),
                    ('Definition of Done', 'Scrum', 'Quality criteria all stories must satisfy.',
                     {'criteria': ['Code reviewed', 'Tests passing', 'Documented', 'Demo-ready']}),
                ]
                for name, src, desc, content in artifacts_seed:
                    HybridArtifact.objects.create(
                        project=project, name=name, source_methodology=src,
                        description=desc, content=content, status='active',
                    )
                    ar_count += 1
            created['artifacts'] = ar_count

        return Response({'success': True, 'project_id': project.id, 'created': created,
                         'message': f"Hybrid demo data seeded for {project.name}"})


class HybridClearDemoView(viewsets.ViewSet):
    from accounts.permissions import HasRole
    permission_classes = [HasRole("superadmin", "admin", "pm", "program_manager"), MethodologyMatchesProjectPermission]

    def create(self, request, project_id=None):
        from django.db import transaction
        _verify_project_access(request.user, project_id)
        deleted = {}
        with transaction.atomic():
            for label, qs in [
                ('artifacts', HybridArtifact.objects.filter(project_id=project_id)),
                ('configurations', HybridConfiguration.objects.filter(project_id=project_id)),
                ('phase_methodologies', PhaseMethodology.objects.filter(project_id=project_id)),
            ]:
                deleted[label] = qs.count()
                qs.delete()
        return Response({'success': True, 'deleted': deleted})
