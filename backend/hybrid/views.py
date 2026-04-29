from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import models
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from projects.models import Project
from projects.permissions import MethodologyMatchesProjectPermission

from .models import HybridArtifact, HybridConfiguration, PhaseMethodology
from .serializers import HybridArtifactSerializer, HybridConfigurationSerializer, PhaseMethodologySerializer


def _get_company(user):
    return getattr(user, 'company', None)


def _accessible_project_ids(user):
    """P2 fix — projects the user is a member of (or creator), or all if superadmin."""
    from django.db.models import Q
    if not user.is_authenticated:
        return Project.objects.none().values_list('id', flat=True)
    if getattr(user, 'role', None) == 'superadmin' or getattr(user, 'is_superuser', False):
        return Project.objects.all().values_list('id', flat=True)
    return Project.objects.filter(
        Q(team_members__user=user, team_members__is_active=True)
        | Q(created_by=user)
    ).values_list('id', flat=True).distinct()


def _verify_project_access(user, project_id):
    """Verify the user is a team_member / creator / superadmin on the project.

    P2 fix — was company-only, allowing any tenant member to read any project.
    """
    if getattr(user, 'role', None) == 'superadmin' or getattr(user, 'is_superuser', False):
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
                    ('Discovery', 'Waterfall', 'Stakeholder interviews + requirements doc; signed-off baseline.'),
                    ('Design', 'Waterfall', 'Architecture + UX/UI deliverables reviewed and approved.'),
                    ('Build', 'Scrum', 'Sprints of 2 weeks delivering backlog increments.'),
                    ('Test & Validate', 'Scrum', 'Test cases executed in-sprint; UAT at end of sprints.'),
                    ('Launch', 'Waterfall', 'Go/no-go gate; production cutover; signed-off release.'),
                    ('Operate', 'Kanban', 'Continuous flow of bug fixes + small enhancements.'),
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
