from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from projects.models import Project
from projects.permissions import MethodologyMatchesProjectPermission

from .models import DMAICPhase, LSSGreenMetric, LSSGreenMeasurement, LSSGreenTask
from .serializers import (
    DMAICPhaseSerializer, LSSGreenMetricSerializer,
    LSSGreenMeasurementSerializer, LSSGreenTaskSerializer,
)


# Locally redefined to avoid potential circular imports with projects.views.
# Mirror of projects.views.COMPANY_WIDE_ROLES — keep in sync.
COMPANY_WIDE_ROLES = frozenset({"admin", "pm", "program_manager"})


def _get_company(user):
    return getattr(user, 'company', None)


def _accessible_project_ids(user):
    """P2 fix — projects the user is on (or all if superadmin).

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

    Sachin-regression fix: company-wide roles (admin/pm/program_manager) are
    allowed for any project within their own company.
    """
    from django.db.models import Q
    if getattr(user, 'role', None) == 'superadmin' or getattr(user, 'is_superuser', False):
        return
    if getattr(user, 'role', None) in COMPANY_WIDE_ROLES and getattr(user, 'company_id', None):
        if Project.objects.filter(id=project_id, company_id=user.company_id).exists():
            return
    if not Project.objects.filter(id=project_id).filter(
        Q(team_members__user=user, team_members__is_active=True)
        | Q(created_by=user)
    ).exists():
        raise PermissionDenied("You do not have access to this project.")


class DMAICPhaseViewSet(viewsets.ModelViewSet):
    serializer_class = DMAICPhaseSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['project', 'phase', 'status']
    ordering_fields = ['order', 'created_at']

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return DMAICPhase.objects.none()
        queryset = DMAICPhase.objects.select_related('project').filter(project_id__in=_accessible_project_ids(self.request.user))
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


class LSSGreenMetricViewSet(viewsets.ModelViewSet):
    serializer_class = LSSGreenMetricSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['project', 'metric_type']

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return LSSGreenMetric.objects.none()
        queryset = LSSGreenMetric.objects.select_related('project').filter(project_id__in=_accessible_project_ids(self.request.user))
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


class LSSGreenSeedDemoView(viewsets.ViewSet):
    from accounts.permissions import HasRole
    permission_classes = [HasRole("superadmin", "admin", "pm", "program_manager"), MethodologyMatchesProjectPermission]

    def create(self, request, project_id=None):
        from datetime import date, timedelta
        from django.db import transaction
        from rest_framework.response import Response as _Resp
        _verify_project_access(request.user, project_id)
        project = Project.objects.get(id=project_id)
        created = {}
        today = date.today()
        with transaction.atomic():
            ph_count = 0
            if not DMAICPhase.objects.filter(project=project).exists():
                phases_seed = [
                    ('define', 'Define problem, scope, charter and stakeholders.', 'completed', -75),
                    ('measure', 'Establish baseline and measurement system.', 'completed', -45),
                    ('analyze', 'Identify root causes through data analysis.', 'in_progress', -15),
                    ('improve', 'Generate, test and implement solutions.', 'not_started', 15),
                    ('control', 'Sustain improvements via control plan.', 'not_started', 45),
                ]
                from django.utils import timezone as tz
                for order, (phase, obj, status, off) in enumerate(phases_seed):
                    DMAICPhase.objects.create(
                        project=project, phase=phase, objective=obj, status=status, order=order,
                        started_at=tz.now() if status != 'not_started' else None,
                        completed_at=tz.now() if status == 'completed' else None,
                    )
                    ph_count += 1
            created['dmaic_phases'] = ph_count

            metric_count = 0
            if not LSSGreenMetric.objects.filter(project=project).exists():
                metrics_seed = [
                    ('process_capability', 1.15, 1.05, 1500, 4.5, 'Baseline Cp/Cpk; below 1.33 target.'),
                    ('defect_rate', None, None, 12000, 3.7, 'Baseline DPMO from initial sample.'),
                    ('cycle_time', None, None, None, 4.2, 'Average cycle 8.4 hours; target 5.5 hours.'),
                    ('yield_rate', None, None, None, 3.9, 'First-pass yield 72%; target 95%.'),
                ]
                for mtype, cp, cpk, dpm, sigma, notes in metrics_seed:
                    LSSGreenMetric.objects.create(
                        project=project, metric_type=mtype,
                        cp=cp, cpk=cpk, defects_per_million=dpm,
                        sigma_level=sigma, notes=notes,
                    )
                    metric_count += 1
            created['metrics'] = metric_count

            meas_count = 0
            if not LSSGreenMeasurement.objects.filter(project=project).exists():
                meas_seed = [
                    ('measure', 'Cycle time per ticket', 8.4, 5.5, 7.9, 'hours', -30),
                    ('measure', 'First-pass yield', 72, 95, 78, '%', -25),
                    ('measure', 'Defect rate', 1.2, 0.3, 0.95, '%', -20),
                    ('analyze', 'Rework hours per week', 24, 8, 18, 'hours', -10),
                    ('improve', 'Average wait time', 2.5, 1.0, None, 'hours', 5),
                ]
                for phase, metric, base, target, actual, unit, off in meas_seed:
                    LSSGreenMeasurement.objects.create(
                        project=project, phase=phase, metric=metric,
                        baseline_value=base, target_value=target, actual_value=actual,
                        unit=unit, measurement_date=today + timedelta(days=off),
                        notes=f"{metric} measurement during {phase} phase.",
                    )
                    meas_count += 1
            created['measurements'] = meas_count
        return _Resp({'success': True, 'project_id': project.id, 'created': created,
                      'message': f"LSS Green demo data seeded for {project.name}"})


class LSSGreenClearDemoView(viewsets.ViewSet):
    from accounts.permissions import HasRole
    permission_classes = [HasRole("superadmin", "admin", "pm", "program_manager"), MethodologyMatchesProjectPermission]

    def create(self, request, project_id=None):
        from rest_framework.response import Response as _Resp
        from django.db import transaction
        _verify_project_access(request.user, project_id)
        deleted = {}
        with transaction.atomic():
            for label, qs in [
                ('dmaic_phases', DMAICPhase.objects.filter(project_id=project_id)),
                ('metrics', LSSGreenMetric.objects.filter(project_id=project_id)),
                ('measurements', LSSGreenMeasurement.objects.filter(project_id=project_id)),
            ]:
                deleted[label] = qs.count()
                qs.delete()
        return _Resp({'success': True, 'deleted': deleted})


class LSSGreenMeasurementViewSet(viewsets.ModelViewSet):
    serializer_class = LSSGreenMeasurementSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['project', 'phase', 'metric']

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return LSSGreenMeasurement.objects.none()
        queryset = LSSGreenMeasurement.objects.select_related('project').filter(project_id__in=_accessible_project_ids(self.request.user))
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


class LSSGreenTaskViewSet(viewsets.ModelViewSet):
    serializer_class = LSSGreenTaskSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['project', 'phase', 'assignee', 'status', 'priority']
    ordering_fields = ['order', 'due_date', 'priority', 'created_at']
    search_fields = ['title', 'description']

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return LSSGreenTask.objects.none()
        queryset = LSSGreenTask.objects.select_related('project', 'phase', 'assignee').filter(
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
