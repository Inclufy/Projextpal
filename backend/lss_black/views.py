from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from projects.models import Project
from projects.permissions import MethodologyMatchesProjectPermission

from .models import HypothesisTest, DesignOfExperiment, ControlPlan, SPCChart, LSSBlackTask
from .serializers import (
    HypothesisTestSerializer, DesignOfExperimentSerializer,
    ControlPlanSerializer, SPCChartSerializer, LSSBlackTaskSerializer,
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


class HypothesisTestViewSet(viewsets.ModelViewSet):
    serializer_class = HypothesisTestSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['project', 'test_type', 'reject_null']
    search_fields = ['null_hypothesis', 'alternative_hypothesis']

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return HypothesisTest.objects.none()
        queryset = HypothesisTest.objects.select_related('project').filter(project_id__in=_accessible_project_ids(self.request.user))
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


class DesignOfExperimentViewSet(viewsets.ModelViewSet):
    serializer_class = DesignOfExperimentSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['project', 'design_type']
    search_fields = ['experiment_name']

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return DesignOfExperiment.objects.none()
        queryset = DesignOfExperiment.objects.select_related('project').filter(project_id__in=_accessible_project_ids(self.request.user))
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


class ControlPlanViewSet(viewsets.ModelViewSet):
    serializer_class = ControlPlanSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['project', 'is_active']
    search_fields = ['process_step', 'control_method']

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return ControlPlan.objects.none()
        queryset = ControlPlan.objects.select_related('project', 'responsible').filter(project_id__in=_accessible_project_ids(self.request.user))
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


class SPCChartViewSet(viewsets.ModelViewSet):
    serializer_class = SPCChartSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['project', 'chart_type']

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return SPCChart.objects.none()
        queryset = SPCChart.objects.select_related('project').filter(project_id__in=_accessible_project_ids(self.request.user))
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


class LSSBlackTaskViewSet(viewsets.ModelViewSet):
    serializer_class = LSSBlackTaskSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['project', 'phase', 'assignee', 'status', 'priority']
    ordering_fields = ['order', 'due_date', 'priority', 'created_at']
    search_fields = ['title', 'description']

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return LSSBlackTask.objects.none()
        queryset = LSSBlackTask.objects.select_related('project', 'phase', 'assignee').filter(
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


class LSSBlackSeedDemoView(viewsets.ViewSet):
    from accounts.permissions import HasRole
    permission_classes = [HasRole("superadmin", "admin", "pm", "program_manager"), MethodologyMatchesProjectPermission]

    def create(self, request, project_id=None):
        from django.db import transaction
        from rest_framework.response import Response as _Resp
        from django.contrib.auth import get_user_model
        _verify_project_access(request.user, project_id)
        project = Project.objects.get(id=project_id)
        User = get_user_model()
        team_pool = list(User.objects.filter(company=project.company)[:5]) or [request.user]
        created = {}

        with transaction.atomic():
            ht_count = 0
            if not HypothesisTest.objects.filter(project=project).exists():
                tests_seed = [
                    ('t_test', 'Mean cycle time = 8 hours',
                     'Mean cycle time < 8 hours', 0.05, 0.012, 2.71, 142,
                     'Reject H0 — improvement initiative reduced mean cycle time below baseline.'),
                    ('chi_square', 'Defect distribution is uniform across 4 stations',
                     'Defect distribution differs across stations', 0.05, 0.003, 14.2, 200,
                     'Reject H0 — Station 3 produces disproportionate defects (concentrate efforts there).'),
                    ('anova', 'No difference in throughput between 3 shifts',
                     'At least one shift differs significantly', 0.05, 0.08, 2.6, 90,
                     'Fail to reject H0 — no statistically significant shift effect.'),
                ]
                for ttype, h0, h1, alpha, p, stat, n, conclusion in tests_seed:
                    HypothesisTest.objects.create(
                        project=project, test_type=ttype,
                        null_hypothesis=h0, alternative_hypothesis=h1,
                        alpha=alpha, p_value=p, test_statistic=stat,
                        sample_size=n, conclusion=conclusion,
                        notes='Statistical test performed in Analyze phase.',
                    )
                    ht_count += 1
            created['hypothesis_tests'] = ht_count

            doe_count = 0
            if not DesignOfExperiment.objects.filter(project=project).exists():
                doe_seed = [
                    ('Solder paste optimization', 'full_factorial',
                     [{'name': 'Temperature', 'levels': ['180C', '210C']},
                      {'name': 'Pressure', 'levels': ['Low', 'High']},
                      {'name': 'Time', 'levels': ['10s', '20s']}],
                     2, 'Defect rate (%)',
                     'Find combination that minimises solder defects.',
                     {'best_run': 6, 'best_settings': '210C, High, 20s', 'predicted_defects': 0.4},
                     'Optimal combination reduced defect rate from 1.8% to 0.4% (validated in confirmation run).'),
                    ('Workflow routing experiment', 'fractional_factorial',
                     [{'name': 'Routing', 'levels': ['A', 'B']},
                      {'name': 'Batch size', 'levels': ['Small', 'Large']},
                      {'name': 'Operator skill', 'levels': ['Junior', 'Senior']}],
                     2, 'Cycle time (hours)',
                     'Identify factors with biggest impact on cycle time.',
                     {'main_effects': {'Routing': -1.2, 'Operator': -0.8, 'Batch': 0.3}},
                     'Routing change to B is the dominant factor — adopt as default.'),
                ]
                for name, dtype, factors, levels, response, obj, results, conclusion in doe_seed:
                    DesignOfExperiment.objects.create(
                        project=project, experiment_name=name, design_type=dtype,
                        factors=factors, levels=levels, response_variable=response,
                        objective=obj, results=results, conclusion=conclusion,
                    )
                    doe_count += 1
            created['doe'] = doe_count

            cp_count = 0
            if not ControlPlan.objects.filter(project=project).exists():
                cps_seed = [
                    ('Solder paste apply', 'X-bar R chart on paste height', 'Hourly',
                     'Spec: 150-200 µm', 'If 2 consecutive points outside UCL/LCL, halt and recalibrate.', team_pool[0]),
                    ('Final inspection', 'P-chart on defect rate', 'Per shift',
                     'Spec: <0.5%', 'If defect rate exceeds 1% for 2 consecutive shifts, escalate to engineering.', team_pool[1] if len(team_pool) > 1 else team_pool[0]),
                    ('Customer ticket triage', 'Cycle-time SPC chart', 'Daily',
                     'Spec: <6h average', 'If average cycle time >7h for 3 consecutive days, trigger root-cause review.', team_pool[0]),
                    ('Onboarding completion', 'C-chart on incomplete records', 'Weekly',
                     'Spec: <3 incomplete/100', 'Investigate when count exceeds UCL.', team_pool[0]),
                ]
                for step, method, freq, spec, reaction, resp in cps_seed:
                    ControlPlan.objects.create(
                        project=project, process_step=step, control_method=method,
                        measurement_frequency=freq, specification_limits=spec,
                        reaction_plan=reaction, responsible=resp, is_active=True,
                    )
                    cp_count += 1
            created['control_plans'] = cp_count

            spc_count = 0
            if not SPCChart.objects.filter(project=project).exists():
                spc_seed = [
                    ('x_bar_r', 175, 165, 155, 200, 150, [162, 168, 165, 170, 163, 167, 166, 169, 164, 168]),
                    ('p_chart', 0.045, 0.025, 0.005, 0.05, 0, [0.02, 0.03, 0.025, 0.022, 0.028, 0.024, 0.026]),
                    ('i_mr', 8.5, 6.5, 4.5, 8, 5, [6.2, 6.7, 6.4, 6.5, 6.6, 6.5, 6.8, 6.4]),
                    ('c_chart', 8, 5, 2, None, None, [3, 5, 4, 6, 5, 4, 5, 6, 4]),
                ]
                for ctype, ucl, cl, lcl, usl, lsl, points in spc_seed:
                    SPCChart.objects.create(
                        project=project, chart_type=ctype,
                        ucl=ucl, center_line=cl, lcl=lcl, usl=usl, lsl=lsl,
                        data_points=points, subgroup_size=5,
                        notes=f"{ctype.upper()} chart for ongoing control monitoring.",
                    )
                    spc_count += 1
            created['spc_charts'] = spc_count

        return _Resp({'success': True, 'project_id': project.id, 'created': created,
                      'message': f"LSS Black demo data seeded for {project.name}"})


class LSSBlackClearDemoView(viewsets.ViewSet):
    from accounts.permissions import HasRole
    permission_classes = [HasRole("superadmin", "admin", "pm", "program_manager"), MethodologyMatchesProjectPermission]

    def create(self, request, project_id=None):
        from django.db import transaction
        from rest_framework.response import Response as _Resp
        _verify_project_access(request.user, project_id)
        deleted = {}
        with transaction.atomic():
            for label, qs in [
                ('hypothesis_tests', HypothesisTest.objects.filter(project_id=project_id)),
                ('doe', DesignOfExperiment.objects.filter(project_id=project_id)),
                ('control_plans', ControlPlan.objects.filter(project_id=project_id)),
                ('spc_charts', SPCChart.objects.filter(project_id=project_id)),
            ]:
                deleted[label] = qs.count()
                qs.delete()
        return _Resp({'success': True, 'deleted': deleted})
