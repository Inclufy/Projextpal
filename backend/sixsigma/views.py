from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Sum, Count, Avg
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
    TollgateReview, ProjectClosure,
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
    TollgateReviewSerializer, ProjectClosureSerializer,
    # Dashboard
    SixSigmaDashboardSerializer,
)


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
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return SIPOCItem.objects.filter(
            sipoc__project_id=project_id,
            sipoc__project__company=self.request.user.company
        )


class VoiceOfCustomerViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    """Voice of Customer (VOC) management"""
    serializer_class = VoiceOfCustomerSerializer
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.get_project_queryset(DataCollectionPlan)

    def perform_create(self, serializer):
        project = self.get_project()
        serializer.save(project=project)


class DataCollectionMetricViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    """Data Collection Metric management"""
    serializer_class = DataCollectionMetricSerializer
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.get_project_queryset(MSAResult)

    def perform_create(self, serializer):
        project = self.get_project()
        serializer.save(project=project)


class BaselineMetricViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    """Baseline Metrics management"""
    serializer_class = BaselineMetricSerializer
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.get_project_queryset(FishboneDiagram)

    def perform_create(self, serializer):
        project = self.get_project()
        serializer.save(project=project, created_by=self.request.user)


class FishboneCauseViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    """Fishbone Cause management"""
    serializer_class = FishboneCauseSerializer
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.get_project_queryset(ParetoAnalysis)

    def perform_create(self, serializer):
        project = self.get_project()
        serializer.save(project=project)


class ParetoCategoryViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    """Pareto Category management"""
    serializer_class = ParetoCategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return ParetoCategory.objects.filter(
            analysis__project_id=project_id,
            analysis__project__company=self.request.user.company
        )


class HypothesisTestViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    """Hypothesis Test management"""
    serializer_class = HypothesisTestSerializer
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return ControlPlanItem.objects.filter(
            plan__project_id=project_id,
            plan__project__company=self.request.user.company
        )


class ControlChartViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    """Control Chart management"""
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return ControlChartData.objects.filter(
            chart__project_id=project_id,
            chart__project__company=self.request.user.company
        )

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)


class TollgateReviewViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    """Tollgate Review management"""
    serializer_class = TollgateReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.get_project_queryset(TollgateReview)

    def perform_create(self, serializer):
        project = self.get_project()
        serializer.save(project=project)

    @action(detail=True, methods=['post'])
    def approve(self, request, project_id=None, pk=None):
        """Approve a tollgate"""
        tollgate = self.get_object()
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
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]

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