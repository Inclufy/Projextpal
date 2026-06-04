from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Sum, Count, Avg
from projects.permissions import MethodologyMatchesProjectPermission
from .models import (
    # Define
    SIPOCDiagram, SIPOCItem, VoiceOfCustomer, ProjectCharter,
    # Measure
    DataCollectionPlan, DataCollectionMetric, MSAResult, BaselineMetric,
    # Analyze
    FishboneDiagram, FishboneCause, ParetoAnalysis, ParetoCategory, HypothesisTest,
    # Improve
    Solution, PilotPlan, FMEA, ImplementationPlan,
    # Control
    ControlPlan, ControlPlanItem, ControlChart, ControlChartData,
    TollgateReview, ProjectClosure, SavingsValidation,
)
from .serializers import (
    # Define
    SIPOCDiagramSerializer, SIPOCItemSerializer, SIPOCBulkUpdateSerializer,
    VoiceOfCustomerSerializer, ProjectCharterSerializer,
    # Measure
    DataCollectionPlanSerializer, DataCollectionMetricSerializer,
    MSAResultSerializer, BaselineMetricSerializer,
    # Analyze
    FishboneDiagramSerializer, FishboneCauseSerializer,
    ParetoAnalysisSerializer, ParetoCategorySerializer, HypothesisTestSerializer,
    # Improve
    SolutionSerializer, PilotPlanSerializer, FMEASerializer, ImplementationPlanSerializer,
    # Control
    ControlPlanSerializer, ControlPlanItemSerializer,
    ControlChartSerializer, ControlChartListSerializer, ControlChartDataSerializer,
    TollgateReviewSerializer, ProjectClosureSerializer, SavingsValidationSerializer,
    # Dashboard
    SixSigmaDashboardSerializer,
)


# =============================================================================
# PROCESS-CAPABILITY + SPC RULE-ENGINE HELPERS (#43)
# =============================================================================

def _normal_sf(z):
    """Upper-tail probability of the standard normal (1 - CDF), via erfc."""
    import math
    return 0.5 * math.erfc(z / math.sqrt(2))


def compute_capability(values, usl, lsl, target=None):
    """Compute process capability (Cp/Cpk/Pp/Ppk), sigma level, DPMO and yield
    from real measurements against spec limits. Returns None if not computable.

    Cp/Cpk use a short-term sigma estimate from the average moving range
    (d2=1.128 for n=2); Pp/Ppk use the overall sample stdev. With one-sided
    specs only the relevant index is reported.
    """
    import statistics
    vals = [float(v) for v in values if v is not None]
    n = len(vals)
    if n < 2 or (usl is None and lsl is None):
        return None
    usl = float(usl) if usl is not None else None
    lsl = float(lsl) if lsl is not None else None

    mean = statistics.mean(vals)
    sigma_overall = statistics.stdev(vals)  # long-term / Pp,Ppk
    # Short-term sigma from average moving range (within-subgroup proxy).
    moving_ranges = [abs(vals[i] - vals[i - 1]) for i in range(1, n)]
    mr_bar = (sum(moving_ranges) / len(moving_ranges)) if moving_ranges else 0
    sigma_within = (mr_bar / 1.128) if mr_bar > 0 else sigma_overall

    def _indices(sigma):
        if sigma <= 0:
            return None, None
        if usl is not None and lsl is not None:
            cp = (usl - lsl) / (6 * sigma)
            cpu = (usl - mean) / (3 * sigma)
            cpl = (mean - lsl) / (3 * sigma)
            cpk = min(cpu, cpl)
        elif usl is not None:
            cp = None
            cpk = (usl - mean) / (3 * sigma)
        else:
            cp = None
            cpk = (mean - lsl) / (3 * sigma)
        return cp, cpk

    cp, cpk = _indices(sigma_within)
    pp, ppk = _indices(sigma_overall)

    # Defect proportion outside the spec window (normal approximation).
    p_out = 0.0
    if sigma_overall > 0:
        if usl is not None:
            p_out += _normal_sf((usl - mean) / sigma_overall)
        if lsl is not None:
            p_out += _normal_sf((mean - lsl) / sigma_overall)
    dpmo = round(p_out * 1_000_000, 1)
    yield_pct = round((1 - p_out) * 100, 4)
    # Sigma level (long-term Z plus the conventional 1.5σ shift).
    sigma_level = None
    if cpk is not None:
        sigma_level = round(cpk * 3 + 1.5, 2)

    return {
        'n': n,
        'mean': round(mean, 4),
        'sigma_overall': round(sigma_overall, 4),
        'sigma_within': round(sigma_within, 4),
        'usl': usl, 'lsl': lsl, 'target': float(target) if target is not None else None,
        'cp': round(cp, 3) if cp is not None else None,
        'cpk': round(cpk, 3) if cpk is not None else None,
        'pp': round(pp, 3) if pp is not None else None,
        'ppk': round(ppk, 3) if ppk is not None else None,
        'dpmo': dpmo,
        'yield_pct': yield_pct,
        'sigma_level': sigma_level,
        'is_capable': bool(cpk is not None and cpk >= 1.33),
    }


def detect_special_causes(values, ucl, lcl, center):
    """Western Electric / Nelson special-cause rules over an ordered series.

    Returns a list of {index, value, rule} flags. Implements the four most
    common rules:
      1  any point beyond the 3σ control limits
      2  nine points in a row on the same side of the centre line
      3  six points in a row steadily increasing or decreasing
      4  two of three consecutive points beyond 2σ (same side)
    """
    vals = [float(v) for v in values]
    n = len(vals)
    if n == 0:
        return []
    ucl = float(ucl); lcl = float(lcl); center = float(center)
    sigma = (ucl - center) / 3 if ucl > center else 0
    flags = []

    # Rule 1 — outside control limits
    for i, v in enumerate(vals):
        if v > ucl or v < lcl:
            flags.append({'index': i, 'value': v, 'rule': 'Rule 1: beyond 3σ control limit'})

    # Rule 2 — 9 in a row same side of centre
    run, run_sign = 0, 0
    for i, v in enumerate(vals):
        sign = 1 if v > center else (-1 if v < center else 0)
        if sign != 0 and sign == run_sign:
            run += 1
        else:
            run, run_sign = 1, sign
        if run >= 9:
            flags.append({'index': i, 'value': v, 'rule': 'Rule 2: 9 points same side of centre'})

    # Rule 3 — 6 in a row trending
    inc = dec = 1
    for i in range(1, n):
        inc = inc + 1 if vals[i] > vals[i - 1] else 1
        dec = dec + 1 if vals[i] < vals[i - 1] else 1
        if inc >= 6 or dec >= 6:
            flags.append({'index': i, 'value': vals[i], 'rule': 'Rule 3: 6 points trending'})

    # Rule 4 — 2 of 3 beyond 2σ on the same side
    if sigma > 0:
        upper2 = center + 2 * sigma
        lower2 = center - 2 * sigma
        for i in range(2, n):
            window = vals[i - 2:i + 1]
            if sum(1 for w in window if w > upper2) >= 2:
                flags.append({'index': i, 'value': vals[i], 'rule': 'Rule 4: 2 of 3 beyond 2σ (high)'})
            elif sum(1 for w in window if w < lower2) >= 2:
                flags.append({'index': i, 'value': vals[i], 'rule': 'Rule 4: 2 of 3 beyond 2σ (low)'})

    return flags


class ProjectFilterMixin:
    """Mixin to filter by project and company"""
    
    def get_project_queryset(self, model):
        """Filter queryset by project_id from URL and user's company"""
        project_id = self.kwargs.get('project_id')
        return model.objects.filter(
            project_id=project_id,
            project__company=self.request.user.company
        )

    def get_project(self):
        """Get the project object"""
        from projects.models import Project
        project_id = self.kwargs.get('project_id')
        return get_object_or_404(
            Project,
            id=project_id,
            company=self.request.user.company
        )


# =============================================================================
# DEFINE PHASE VIEWS
# =============================================================================

class SIPOCDiagramViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    """SIPOC Diagram management"""
    serializer_class = SIPOCDiagramSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        return self.get_project_queryset(SIPOCDiagram)

    def perform_create(self, serializer):
        project = self.get_project()
        serializer.save(project=project, created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def add_item(self, request, project_id=None, pk=None):
        """Add a single item to SIPOC"""
        sipoc = self.get_object()
        serializer = SIPOCItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(sipoc=sipoc)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def bulk_update_items(self, request, project_id=None, pk=None):
        """Bulk update all SIPOC items by category"""
        sipoc = self.get_object()
        serializer = SIPOCBulkUpdateSerializer(data=request.data)
        
        if serializer.is_valid():
            # Delete existing items
            sipoc.items.all().delete()
            
            # Create new items for each category
            for category in ['suppliers', 'inputs', 'process', 'outputs', 'customers']:
                items = serializer.validated_data.get(category, [])
                for i, description in enumerate(items):
                    if description.strip():
                        SIPOCItem.objects.create(
                            sipoc=sipoc,
                            category=category,
                            description=description.strip(),
                            order=i
                        )
            
            # Return updated SIPOC
            return Response(SIPOCDiagramSerializer(sipoc).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SIPOCItemViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    """SIPOC Item management"""
    serializer_class = SIPOCItemSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return SIPOCItem.objects.filter(
            sipoc__project_id=project_id,
            sipoc__project__company=self.request.user.company
        )


class VoiceOfCustomerViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    """Voice of Customer (VOC) management"""
    serializer_class = VoiceOfCustomerSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        return self.get_project_queryset(VoiceOfCustomer)

    def perform_create(self, serializer):
        project = self.get_project()
        serializer.save(project=project)

    @action(detail=False, methods=['get'])
    def by_priority(self, request, project_id=None):
        """Get VOC items grouped by priority"""
        queryset = self.get_queryset()
        result = {}
        for priority, _ in VoiceOfCustomer.PRIORITY_CHOICES:
            items = queryset.filter(priority=priority)
            result[priority] = VoiceOfCustomerSerializer(items, many=True).data
        return Response(result)


class ProjectCharterViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    """Six Sigma Project Charter management"""
    serializer_class = ProjectCharterSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        return self.get_project_queryset(ProjectCharter)

    def perform_create(self, serializer):
        project = self.get_project()
        serializer.save(project=project)

    @action(detail=True, methods=['post'])
    def approve(self, request, project_id=None, pk=None):
        """Approve the charter"""
        charter = self.get_object()
        charter.approved = True
        charter.approved_by = request.user
        from django.utils import timezone
        charter.approved_date = timezone.now().date()
        charter.save()
        return Response(ProjectCharterSerializer(charter).data)


# =============================================================================
# MEASURE PHASE VIEWS
# =============================================================================

class DataCollectionPlanViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    """Data Collection Plan management"""
    serializer_class = DataCollectionPlanSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        return self.get_project_queryset(DataCollectionPlan)

    def perform_create(self, serializer):
        project = self.get_project()
        serializer.save(project=project)


class DataCollectionMetricViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    """Data Collection Metric management"""
    serializer_class = DataCollectionMetricSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return DataCollectionMetric.objects.filter(
            plan__project_id=project_id,
            plan__project__company=self.request.user.company
        )

    @action(detail=True, methods=['post'])
    def update_collected(self, request, project_id=None, pk=None):
        """Update the collected samples count"""
        metric = self.get_object()
        collected = request.data.get('collected_samples')
        if collected is not None:
            metric.collected_samples = collected
            metric.save()
            return Response(DataCollectionMetricSerializer(metric).data)
        return Response(
            {'error': 'collected_samples is required'},
            status=status.HTTP_400_BAD_REQUEST
        )


class MSAResultViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    """MSA (Measurement System Analysis) Results management"""
    serializer_class = MSAResultSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        return self.get_project_queryset(MSAResult)

    def perform_create(self, serializer):
        project = self.get_project()
        serializer.save(project=project)


class BaselineMetricViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    """Baseline Metrics management"""
    serializer_class = BaselineMetricSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        return self.get_project_queryset(BaselineMetric)

    def perform_create(self, serializer):
        project = self.get_project()
        serializer.save(project=project)

    @action(detail=True, methods=['post'])
    def update_current(self, request, project_id=None, pk=None):
        """Update the current value of a metric"""
        metric = self.get_object()
        current_value = request.data.get('current_value')
        current_sigma = request.data.get('current_sigma')
        
        if current_value is not None:
            metric.current_value = current_value
        if current_sigma is not None:
            metric.current_sigma = current_sigma
        
        from django.utils import timezone
        metric.measured_date = timezone.now().date()
        metric.save()
        return Response(BaselineMetricSerializer(metric).data)


# =============================================================================
# ANALYZE PHASE VIEWS
# =============================================================================

class FishboneDiagramViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    """Fishbone (Ishikawa) Diagram management"""
    serializer_class = FishboneDiagramSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        return self.get_project_queryset(FishboneDiagram)

    def perform_create(self, serializer):
        project = self.get_project()
        serializer.save(project=project, created_by=self.request.user)


class FishboneCauseViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    """Fishbone Cause management"""
    serializer_class = FishboneCauseSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return FishboneCause.objects.filter(
            fishbone__project_id=project_id,
            fishbone__project__company=self.request.user.company
        )

    @action(detail=True, methods=['post'])
    def vote(self, request, project_id=None, pk=None):
        """Add a vote to a cause"""
        cause = self.get_object()
        cause.votes += 1
        cause.save()
        return Response(FishboneCauseSerializer(cause).data)

    @action(detail=True, methods=['post'])
    def toggle_root_cause(self, request, project_id=None, pk=None):
        """Toggle root cause status"""
        cause = self.get_object()
        cause.is_root_cause = not cause.is_root_cause
        cause.save()
        return Response(FishboneCauseSerializer(cause).data)

    @action(detail=True, methods=['post'])
    def verify(self, request, project_id=None, pk=None):
        """Mark cause as verified with data"""
        cause = self.get_object()
        cause.verified = True
        cause.save()
        return Response(FishboneCauseSerializer(cause).data)


class ParetoAnalysisViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    """Pareto Analysis management"""
    serializer_class = ParetoAnalysisSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        return self.get_project_queryset(ParetoAnalysis)

    def perform_create(self, serializer):
        project = self.get_project()
        serializer.save(project=project)


class ParetoCategoryViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    """Pareto Category management"""
    serializer_class = ParetoCategorySerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return ParetoCategory.objects.filter(
            analysis__project_id=project_id,
            analysis__project__company=self.request.user.company
        )


class HypothesisTestViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    """Hypothesis Test management"""
    serializer_class = HypothesisTestSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        return self.get_project_queryset(HypothesisTest)

    def perform_create(self, serializer):
        project = self.get_project()
        serializer.save(project=project)

    @action(detail=True, methods=['post'])
    def record_results(self, request, project_id=None, pk=None):
        """Record test results"""
        test = self.get_object()
        
        test.test_statistic = request.data.get('test_statistic')
        test.p_value = request.data.get('p_value')
        test.confidence_interval_lower = request.data.get('ci_lower')
        test.confidence_interval_upper = request.data.get('ci_upper')
        test.interpretation = request.data.get('interpretation', '')
        
        # Auto-determine conclusion
        if test.p_value is not None and test.alpha:
            if test.p_value < test.alpha:
                test.conclusion = 'reject'
            else:
                test.conclusion = 'fail_to_reject'
        
        from django.utils import timezone
        test.test_date = timezone.now().date()
        test.save()
        
        return Response(HypothesisTestSerializer(test).data)


# =============================================================================
# IMPROVE PHASE VIEWS
# =============================================================================

class SolutionViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    """Solution management"""
    serializer_class = SolutionSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        return self.get_project_queryset(Solution)

    def perform_create(self, serializer):
        project = self.get_project()
        serializer.save(project=project)

    @action(detail=False, methods=['get'])
    def priority_matrix(self, request, project_id=None):
        """Get solutions organized by priority quadrant"""
        queryset = self.get_queryset()
        result = {
            'quick_win': [],
            'major_project': [],
            'fill_in': [],
            'thankless': [],
        }
        for solution in queryset:
            quadrant = solution.priority_quadrant
            result[quadrant].append(SolutionSerializer(solution).data)
        return Response(result)

    @action(detail=True, methods=['post'])
    def update_status(self, request, project_id=None, pk=None):
        """Update solution status"""
        solution = self.get_object()
        new_status = request.data.get('status')
        if new_status in dict(Solution.STATUS_CHOICES):
            solution.status = new_status
            solution.save()
            return Response(SolutionSerializer(solution).data)
        return Response(
            {'error': 'Invalid status'},
            status=status.HTTP_400_BAD_REQUEST
        )


class PilotPlanViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    """Pilot Plan management"""
    serializer_class = PilotPlanSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return PilotPlan.objects.filter(
            solution__project_id=project_id,
            solution__project__company=self.request.user.company
        )

    @action(detail=True, methods=['post'])
    def record_results(self, request, project_id=None, pk=None):
        """Record pilot results"""
        pilot = self.get_object()
        
        pilot.baseline_value = request.data.get('baseline_value')
        pilot.pilot_value = request.data.get('pilot_value')
        pilot.p_value = request.data.get('p_value')
        pilot.lessons_learned = request.data.get('lessons_learned', '')
        
        # Calculate improvement
        if pilot.baseline_value and pilot.pilot_value:
            if pilot.baseline_value != 0:
                improvement = ((pilot.baseline_value - pilot.pilot_value) / pilot.baseline_value) * 100
                pilot.improvement_percentage = round(improvement, 2)
        
        # Determine success
        if pilot.p_value is not None:
            pilot.is_successful = pilot.p_value < 0.05  # Using standard alpha
        
        pilot.status = 'completed'
        pilot.save()
        
        return Response(PilotPlanSerializer(pilot).data)


class FMEAViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    """FMEA management"""
    serializer_class = FMEASerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        return self.get_project_queryset(FMEA).order_by('-severity', '-occurrence')

    def perform_create(self, serializer):
        project = self.get_project()
        serializer.save(project=project)

    @action(detail=False, methods=['get'])
    def high_rpn(self, request, project_id=None):
        """Get items with RPN > 100"""
        queryset = self.get_queryset()
        high_rpn = [item for item in queryset if item.rpn > 100]
        return Response(FMEASerializer(high_rpn, many=True).data)

    @action(detail=True, methods=['post'])
    def record_action(self, request, project_id=None, pk=None):
        """Record action taken and new ratings"""
        fmea = self.get_object()
        
        fmea.action_taken = request.data.get('action_taken', '')
        fmea.new_severity = request.data.get('new_severity')
        fmea.new_occurrence = request.data.get('new_occurrence')
        fmea.new_detection = request.data.get('new_detection')
        fmea.save()
        
        return Response(FMEASerializer(fmea).data)


class ImplementationPlanViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    """Implementation Plan management"""
    serializer_class = ImplementationPlanSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        return self.get_project_queryset(ImplementationPlan)

    def perform_create(self, serializer):
        project = self.get_project()
        serializer.save(project=project)

    @action(detail=True, methods=['post'])
    def update_progress(self, request, project_id=None, pk=None):
        """Update implementation progress"""
        plan = self.get_object()
        progress = request.data.get('progress')
        if progress is not None and 0 <= progress <= 100:
            plan.progress = progress
            if progress == 100:
                plan.status = 'completed'
            elif progress > 0:
                plan.status = 'in_progress'
            plan.save()
            return Response(ImplementationPlanSerializer(plan).data)
        return Response(
            {'error': 'Progress must be between 0 and 100'},
            status=status.HTTP_400_BAD_REQUEST
        )


# =============================================================================
# CONTROL PHASE VIEWS
# =============================================================================

class ControlPlanViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    """Control Plan management"""
    serializer_class = ControlPlanSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        return self.get_project_queryset(ControlPlan)

    def perform_create(self, serializer):
        project = self.get_project()
        serializer.save(project=project)

    @action(detail=True, methods=['post'])
    def new_revision(self, request, project_id=None, pk=None):
        """Create a new revision of the control plan"""
        plan = self.get_object()
        plan.revision += 1
        plan.save()
        return Response(ControlPlanSerializer(plan).data)


class ControlPlanItemViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    """Control Plan Item management"""
    serializer_class = ControlPlanItemSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return ControlPlanItem.objects.filter(
            plan__project_id=project_id,
            plan__project__company=self.request.user.company
        )


class ControlChartViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    """Control Chart management"""
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        return self.get_project_queryset(ControlChart)

    def get_serializer_class(self):
        if self.action == 'list':
            return ControlChartListSerializer
        return ControlChartSerializer

    def perform_create(self, serializer):
        project = self.get_project()
        serializer.save(project=project)

    @action(detail=True, methods=['post'])
    def add_data_point(self, request, project_id=None, pk=None):
        """Add a data point to the control chart"""
        chart = self.get_object()
        
        data = {
            'chart': chart.id,
            'date': request.data.get('date'),
            'value': request.data.get('value'),
            'subgroup_size': request.data.get('subgroup_size', 1),
            'assignable_cause': request.data.get('assignable_cause', ''),
            'corrective_action': request.data.get('corrective_action', ''),
        }
        
        serializer = ControlChartDataSerializer(data=data)
        if serializer.is_valid():
            serializer.save(recorded_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def violations(self, request, project_id=None, pk=None):
        """Get all violations for this chart"""
        chart = self.get_object()
        violations = chart.data_points.filter(is_violation=True)
        return Response(ControlChartDataSerializer(violations, many=True).data)

    @action(detail=True, methods=['get', 'post'])
    def capability(self, request, project_id=None, pk=None):
        """Compute process capability (Cp/Cpk/Pp/Ppk + sigma level + DPMO +
        yield) from the chart's real data points against its spec limits.

        POST persists the computed cp/cpk onto the chart; GET is read-only.
        Returns 400 insufficient_data when there are <2 points or no spec limit.
        """
        chart = self.get_object()
        values = [dp.value for dp in chart.data_points.order_by('date')]
        report = compute_capability(values, chart.usl, chart.lsl, chart.target)
        if report is None:
            return Response(
                {
                    'detail': 'Capability needs at least 2 data points and at least one specification limit (USL/LSL).',
                    'code': 'insufficient_data',
                    'data_points': len(values),
                    'has_spec_limits': bool(chart.usl is not None or chart.lsl is not None),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        if request.method == 'POST':
            chart.cp = report['cp']
            chart.cpk = report['cpk']
            chart.save(update_fields=['cp', 'cpk', 'updated_at'])
        return Response(report)

    @action(detail=True, methods=['post'])
    def detect_special_causes(self, request, project_id=None, pk=None):
        """Run the Nelson / Western Electric special-cause rules across the
        chart's ordered data points and persist the flags onto each point
        (is_violation + violation_rule). Returns the list of flagged points.
        """
        chart = self.get_object()
        points = list(chart.data_points.order_by('date'))
        values = [dp.value for dp in points]
        flags = detect_special_causes(values, chart.ucl, chart.lcl, chart.center_line)
        flagged_by_index = {}
        for f in flags:
            flagged_by_index.setdefault(f['index'], f['rule'])
        # Persist: a point is a violation if any rule flagged it.
        for i, dp in enumerate(points):
            should = i in flagged_by_index
            rule = flagged_by_index.get(i, '')
            if dp.is_violation != should or (should and dp.violation_rule != rule):
                dp.is_violation = should
                if should:
                    dp.violation_rule = rule
                dp.save(update_fields=['is_violation', 'violation_rule'])
        return Response({
            'total_points': len(points),
            'flagged_count': len(flagged_by_index),
            'flags': flags,
            'in_control': len(flagged_by_index) == 0,
        })

    @action(detail=True, methods=['post'])
    def recalculate_limits(self, request, project_id=None, pk=None):
        """Recalculate control limits based on data"""
        chart = self.get_object()
        data_points = chart.data_points.all()
        
        if data_points.count() < 20:
            return Response(
                {'error': 'Need at least 20 data points to recalculate'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        values = [float(dp.value) for dp in data_points]
        import statistics
        mean = statistics.mean(values)
        std_dev = statistics.stdev(values)
        
        chart.center_line = mean
        chart.ucl = mean + (3 * std_dev)
        chart.lcl = mean - (3 * std_dev)
        chart.save()
        
        # Re-check violations
        for dp in data_points:
            dp.is_violation = dp.value > chart.ucl or dp.value < chart.lcl
            dp.save()
        
        return Response(ControlChartSerializer(chart).data)


class ControlChartDataViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    """Control Chart Data management"""
    serializer_class = ControlChartDataSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return ControlChartData.objects.filter(
            chart__project_id=project_id,
            chart__project__company=self.request.user.company
        )

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)


class SavingsValidationViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    """Claimed-savings ledger with a Champion sign-off gate.

    A claimed saving only becomes a recognised benefit once the Champion signs
    off. `validate` refuses to set status='validated' until that has happened
    (409 champion_signoff_required), so the realised-savings number on the
    project closure can never be inflated by an unsigned claim.
    """
    serializer_class = SavingsValidationSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        return self.get_project_queryset(SavingsValidation)

    def perform_create(self, serializer):
        project = self.get_project()
        serializer.save(project=project, claimed_by=self.request.user)

    @action(detail=True, methods=['post'])
    def sign_off(self, request, project_id=None, pk=None):
        """Champion signs off the claim. Records who signed and when, and may
        set the validated_amount (defaults to the claimed amount)."""
        from django.utils import timezone
        record = self.get_object()
        record.champion = request.user
        record.champion_signed_off = True
        record.champion_signed_off_at = timezone.now()
        validated_amount = request.data.get('validated_amount')
        if validated_amount is not None:
            record.validated_amount = validated_amount
        if record.status == 'claimed':
            record.status = 'under_review'
        record.save(update_fields=[
            'champion', 'champion_signed_off', 'champion_signed_off_at',
            'validated_amount', 'status', 'updated_at',
        ])
        return Response(self.get_serializer(record).data)

    @action(detail=True, methods=['post'])
    def validate(self, request, project_id=None, pk=None):
        """Promote a claim to a recognised benefit. GATE: refuses if the
        Champion has not signed off yet."""
        record = self.get_object()
        if not record.champion_signed_off:
            return Response(
                {
                    'detail': 'This saving cannot be validated until the Champion has signed it off.',
                    'code': 'champion_signoff_required',
                    'champion_signed_off': False,
                },
                status=status.HTTP_409_CONFLICT,
            )
        if record.validated_amount is None:
            record.validated_amount = record.claimed_amount
        record.finance_validated = bool(request.data.get('finance_validated', record.finance_validated))
        record.status = 'validated'
        record.save(update_fields=[
            'validated_amount', 'finance_validated', 'status', 'updated_at',
        ])
        return Response(self.get_serializer(record).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, project_id=None, pk=None):
        """Reject a claim with a reason."""
        record = self.get_object()
        record.status = 'rejected'
        record.rejection_reason = request.data.get('rejection_reason', '')
        record.save(update_fields=['status', 'rejection_reason', 'updated_at'])
        return Response(self.get_serializer(record).data)


class TollgateReviewViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    """Tollgate Review management"""
    serializer_class = TollgateReviewSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        return self.get_project_queryset(TollgateReview)

    def perform_create(self, serializer):
        project = self.get_project()
        serializer.save(project=project)

    @action(detail=True, methods=['post'])
    def approve(self, request, project_id=None, pk=None):
        """Approve a tollgate.

        Real gate (LSS audit #1): refuses to pass unless the phase's required
        DMAIC deliverables exist/are approved AND the prior phase tollgate has
        already passed. Returns 409 with the list of blockers otherwise.
        """
        tollgate = self.get_object()
        ok, blockers = tollgate.can_pass()
        if not ok:
            return Response(
                {
                    'detail': 'Tollgate cannot pass: required deliverables incomplete.',
                    'code': 'tollgate_blocked',
                    'blockers': blockers,
                },
                status=status.HTTP_409_CONFLICT,
            )
        tollgate.approved = True
        tollgate.approved_by = request.user
        tollgate.status = 'passed'
        from django.utils import timezone
        tollgate.actual_date = timezone.now().date()
        tollgate.save()
        return Response(TollgateReviewSerializer(tollgate).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, project_id=None, pk=None):
        """Reject a tollgate (require rework)"""
        tollgate = self.get_object()
        tollgate.status = 'rework'
        tollgate.findings = request.data.get('findings', '')
        tollgate.action_items = request.data.get('action_items', '')
        tollgate.save()
        return Response(TollgateReviewSerializer(tollgate).data)

    @action(detail=False, methods=['post'])
    def initialize(self, request, project_id=None):
        """Initialize all 5 DMAIC tollgates for a project"""
        project = self.get_project()
        tollgates = []
        
        for phase, _ in TollgateReview.PHASE_CHOICES:
            tollgate, created = TollgateReview.objects.get_or_create(
                project=project,
                phase=phase,
                defaults={'status': 'upcoming'}
            )
            tollgates.append(tollgate)
        
        return Response(TollgateReviewSerializer(tollgates, many=True).data)


class ProjectClosureViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    """Project Closure management"""
    serializer_class = ProjectClosureSerializer
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get_queryset(self):
        return self.get_project_queryset(ProjectClosure)

    def perform_create(self, serializer):
        project = self.get_project()
        serializer.save(project=project)

    @action(detail=True, methods=['post'])
    def approve(self, request, project_id=None, pk=None):
        """Approve project closure"""
        closure = self.get_object()
        closure.approved_by = request.user
        closure.save()
        return Response(ProjectClosureSerializer(closure).data)


# =============================================================================
# DASHBOARD VIEW
# =============================================================================

class SixSigmaDashboardView(APIView):
    """Aggregated Six Sigma Dashboard for a project"""
    permission_classes = [IsAuthenticated, MethodologyMatchesProjectPermission]

    def get(self, request, project_id):
        from projects.models import Project
        
        project = get_object_or_404(
            Project,
            id=project_id,
            company=request.user.company
        )
        
        # Get phase progress based on tollgates
        tollgates = TollgateReview.objects.filter(project=project)
        phase_progress = {}
        current_phase = 'define'
        
        for phase, display in TollgateReview.PHASE_CHOICES:
            tollgate = tollgates.filter(phase=phase).first()
            if tollgate:
                phase_progress[phase] = {
                    'status': tollgate.status,
                    'approved': tollgate.approved,
                    'scheduled_date': tollgate.scheduled_date,
                    'actual_date': tollgate.actual_date,
                }
                if tollgate.status in ['upcoming', 'scheduled', 'in_review']:
                    current_phase = phase
            else:
                phase_progress[phase] = {
                    'status': 'upcoming',
                    'approved': False,
                    'scheduled_date': None,
                    'actual_date': None,
                }
        
        # Get baseline metrics
        baseline_metrics = BaselineMetric.objects.filter(project=project)
        baseline_sigma = baseline_metrics.aggregate(avg=Avg('baseline_sigma'))['avg']
        current_sigma = baseline_metrics.aggregate(avg=Avg('current_sigma'))['avg']
        target_sigma = baseline_metrics.aggregate(avg=Avg('target_sigma'))['avg']
        
        # Get financial data
        charter = ProjectCharter.objects.filter(project=project).first()
        closure = ProjectClosure.objects.filter(project=project).first()
        
        estimated_savings = charter.estimated_savings if charter else None
        realized_savings = closure.realized_savings if closure else None
        
        # Get counts
        voc_count = VoiceOfCustomer.objects.filter(project=project).count()
        
        fishbone = FishboneDiagram.objects.filter(project=project).first()
        root_causes_count = FishboneCause.objects.filter(
            fishbone__project=project,
            is_root_cause=True
        ).count() if fishbone else 0
        
        solutions_count = Solution.objects.filter(project=project).count()
        active_pilots = PilotPlan.objects.filter(
            solution__project=project,
            status='active'
        ).count()
        
        control_charts = ControlChart.objects.filter(project=project, is_active=True)
        control_charts_count = control_charts.count()
        violations_count = sum(chart.total_violations for chart in control_charts)
        
        dashboard_data = {
            'project_id': project.id,
            'project_name': project.name,
            'methodology': project.methodology,
            'current_phase': current_phase,
            'phase_progress': phase_progress,
            'tollgates': TollgateReviewSerializer(tollgates, many=True).data,
            'baseline_sigma': baseline_sigma,
            'current_sigma': current_sigma,
            'target_sigma': target_sigma,
            'estimated_savings': estimated_savings,
            'realized_savings': realized_savings,
            'voc_count': voc_count,
            'root_causes_count': root_causes_count,
            'solutions_count': solutions_count,
            'active_pilots': active_pilots,
            'control_charts_count': control_charts_count,
            'violations_count': violations_count,
        }
        
        return Response(dashboard_data)