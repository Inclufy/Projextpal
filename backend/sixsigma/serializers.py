from rest_framework import serializers
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


# =============================================================================
# DEFINE PHASE SERIALIZERS
# =============================================================================

class SIPOCItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = SIPOCItem
        fields = ['id', 'category', 'description', 'order', 'created_at']
        read_only_fields = ['id', 'created_at']


class SIPOCDiagramSerializer(serializers.ModelSerializer):
    items = SIPOCItemSerializer(many=True, read_only=True)
    suppliers = serializers.SerializerMethodField()
    inputs = serializers.SerializerMethodField()
    process_steps = serializers.SerializerMethodField()
    outputs = serializers.SerializerMethodField()
    customers = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = SIPOCDiagram
        fields = [
            'id', 'project', 'process_name', 'process_description',
            'process_start', 'process_end',
            'items', 'suppliers', 'inputs', 'process_steps', 'outputs', 'customers',
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_suppliers(self, obj):
        items = obj.items.filter(category='suppliers')
        return SIPOCItemSerializer(items, many=True).data

    def get_inputs(self, obj):
        items = obj.items.filter(category='inputs')
        return SIPOCItemSerializer(items, many=True).data

    def get_process_steps(self, obj):
        items = obj.items.filter(category='process')
        return SIPOCItemSerializer(items, many=True).data

    def get_outputs(self, obj):
        items = obj.items.filter(category='outputs')
        return SIPOCItemSerializer(items, many=True).data

    def get_customers(self, obj):
        items = obj.items.filter(category='customers')
        return SIPOCItemSerializer(items, many=True).data


class SIPOCBulkUpdateSerializer(serializers.Serializer):
    """Serializer for bulk updating SIPOC items"""
    suppliers = serializers.ListField(child=serializers.CharField(), required=False, default=[])
    inputs = serializers.ListField(child=serializers.CharField(), required=False, default=[])
    process = serializers.ListField(child=serializers.CharField(), required=False, default=[])
    outputs = serializers.ListField(child=serializers.CharField(), required=False, default=[])
    customers = serializers.ListField(child=serializers.CharField(), required=False, default=[])


class VoiceOfCustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = VoiceOfCustomer
        fields = [
            'id', 'project', 'customer_segment', 'customer_need',
            'ctq_requirement', 'measurement', 'target_value',
            'lower_spec_limit', 'upper_spec_limit', 'priority',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProjectCharterSerializer(serializers.ModelSerializer):
    champion_name = serializers.CharField(source='champion.get_full_name', read_only=True)
    process_owner_name = serializers.CharField(source='process_owner.get_full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    
    class Meta:
        model = ProjectCharter
        fields = [
            'id', 'project', 'problem_statement', 'business_case',
            'goal_statement', 'project_scope', 'out_of_scope',
            'estimated_savings', 'estimated_cost', 'target_completion_date',
            'champion', 'champion_name', 'process_owner', 'process_owner_name',
            'approved', 'approved_date', 'approved_by', 'approved_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


# =============================================================================
# MEASURE PHASE SERIALIZERS
# =============================================================================

class DataCollectionMetricSerializer(serializers.ModelSerializer):
    progress_percentage = serializers.ReadOnlyField()
    responsible_person_name = serializers.CharField(
        source='responsible_person.get_full_name', read_only=True
    )
    
    class Meta:
        model = DataCollectionMetric
        fields = [
            'id', 'plan', 'name', 'data_type', 'operational_definition',
            'data_source', 'collection_frequency', 'responsible_person',
            'responsible_person_name', 'target_samples', 'collected_samples',
            'unit', 'progress_percentage', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class DataCollectionPlanSerializer(serializers.ModelSerializer):
    metrics = DataCollectionMetricSerializer(many=True, read_only=True)
    collection_progress = serializers.ReadOnlyField()
    
    class Meta:
        model = DataCollectionPlan
        fields = [
            'id', 'project', 'objective', 'data_collection_method',
            'sampling_strategy', 'target_sample_size',
            'start_date', 'end_date', 'status',
            'metrics', 'collection_progress',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class MSAResultSerializer(serializers.ModelSerializer):
    status = serializers.ReadOnlyField()
    status_display = serializers.ReadOnlyField()
    
    class Meta:
        model = MSAResult
        fields = [
            'id', 'project', 'study_name', 'measurement_system', 'study_date',
            'repeatability', 'reproducibility', 'gauge_rr', 'part_to_part', 'ndc',
            'status', 'status_display', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class BaselineMetricSerializer(serializers.ModelSerializer):
    improvement_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = BaselineMetric
        fields = [
            'id', 'project', 'metric_name', 'baseline_value', 'current_value',
            'target_value', 'unit', 'baseline_sigma', 'current_sigma', 'target_sigma',
            'measured_date', 'improvement_percentage', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


# =============================================================================
# ANALYZE PHASE SERIALIZERS
# =============================================================================

class FishboneCauseSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = FishboneCause
        fields = [
            'id', 'fishbone', 'category', 'category_display', 'cause', 'sub_cause',
            'votes', 'is_root_cause', 'verified', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class FishboneDiagramSerializer(serializers.ModelSerializer):
    causes = FishboneCauseSerializer(many=True, read_only=True)
    causes_by_category = serializers.SerializerMethodField()
    root_causes = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = FishboneDiagram
        fields = [
            'id', 'project', 'problem_statement',
            'causes', 'causes_by_category', 'root_causes',
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_causes_by_category(self, obj):
        result = {}
        for category, display in FishboneCause.CATEGORY_CHOICES:
            causes = obj.causes.filter(category=category)
            result[category] = FishboneCauseSerializer(causes, many=True).data
        return result

    def get_root_causes(self, obj):
        root_causes = obj.causes.filter(is_root_cause=True)
        return FishboneCauseSerializer(root_causes, many=True).data


class ParetoCategorySerializer(serializers.ModelSerializer):
    percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = ParetoCategory
        fields = ['id', 'analysis', 'name', 'count', 'order', 'percentage']
        read_only_fields = ['id']


class ParetoAnalysisSerializer(serializers.ModelSerializer):
    categories = ParetoCategorySerializer(many=True, read_only=True)
    total_count = serializers.ReadOnlyField()
    cumulative_data = serializers.SerializerMethodField()
    
    class Meta:
        model = ParetoAnalysis
        fields = [
            'id', 'project', 'name', 'description', 'analysis_date',
            'categories', 'total_count', 'cumulative_data',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_cumulative_data(self, obj):
        """Return categories with cumulative percentages for Pareto chart"""
        categories = obj.categories.order_by('-count')
        total = obj.total_count
        if total == 0:
            return []
        
        result = []
        cumulative = 0
        for cat in categories:
            pct = (cat.count / total) * 100
            cumulative += pct
            result.append({
                'name': cat.name,
                'count': cat.count,
                'percentage': round(pct, 1),
                'cumulative_percentage': round(cumulative, 1)
            })
        return result


class HypothesisTestSerializer(serializers.ModelSerializer):
    test_type_display = serializers.CharField(source='get_test_type_display', read_only=True)
    conclusion_display = serializers.CharField(source='get_conclusion_display', read_only=True)
    is_significant = serializers.ReadOnlyField()
    
    class Meta:
        model = HypothesisTest
        fields = [
            'id', 'project', 'name', 'test_type', 'test_type_display',
            'null_hypothesis', 'alt_hypothesis', 'alpha', 'sample_size',
            'test_statistic', 'p_value', 'confidence_interval_lower',
            'confidence_interval_upper', 'conclusion', 'conclusion_display',
            'interpretation', 'is_significant', 'test_date',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


# =============================================================================
# IMPROVE PHASE SERIALIZERS
# =============================================================================

class PilotPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = PilotPlan
        fields = [
            'id', 'solution', 'scope', 'duration', 'sample_size',
            'success_criteria', 'primary_metric', 'target_value',
            'start_date', 'end_date', 'baseline_value', 'pilot_value',
            'improvement_percentage', 'p_value', 'is_successful',
            'status', 'lessons_learned', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SolutionSerializer(serializers.ModelSerializer):
    pilot = PilotPlanSerializer(read_only=True)
    priority_score = serializers.ReadOnlyField()
    priority_quadrant = serializers.ReadOnlyField()
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    impact_display = serializers.CharField(source='get_impact_display', read_only=True)
    effort_display = serializers.CharField(source='get_effort_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    
    class Meta:
        model = Solution
        fields = [
            'id', 'project', 'name', 'description', 'category', 'category_display',
            'impact', 'impact_display', 'effort', 'effort_display',
            'expected_improvement', 'expected_savings', 'implementation_cost',
            'addresses_root_cause', 'status', 'status_display',
            'owner', 'owner_name', 'priority_score', 'priority_quadrant',
            'pilot', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class FMEASerializer(serializers.ModelSerializer):
    rpn = serializers.ReadOnlyField()
    new_rpn = serializers.ReadOnlyField()
    rpn_reduction = serializers.ReadOnlyField()
    action_owner_name = serializers.CharField(source='action_owner.get_full_name', read_only=True)
    
    class Meta:
        model = FMEA
        fields = [
            'id', 'project', 'process_step', 'potential_failure_mode',
            'potential_effect', 'potential_cause',
            'severity', 'occurrence', 'detection', 'rpn',
            'current_controls', 'recommended_action',
            'action_owner', 'action_owner_name', 'target_date',
            'action_taken', 'new_severity', 'new_occurrence', 'new_detection',
            'new_rpn', 'rpn_reduction', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ImplementationPlanSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    solution_name = serializers.CharField(source='solution.name', read_only=True)
    
    class Meta:
        model = ImplementationPlan
        fields = [
            'id', 'project', 'solution', 'solution_name', 'phase_name',
            'description', 'start_date', 'end_date',
            'owner', 'owner_name', 'status', 'status_display',
            'progress', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


# =============================================================================
# CONTROL PHASE SERIALIZERS
# =============================================================================

class ControlPlanItemSerializer(serializers.ModelSerializer):
    responsible_name = serializers.CharField(source='responsible.get_full_name', read_only=True)
    
    class Meta:
        model = ControlPlanItem
        fields = [
            'id', 'plan', 'process_step', 'characteristic', 'specification',
            'measurement_method', 'sample_size', 'frequency', 'control_method',
            'reaction_plan', 'responsible', 'responsible_name', 'order', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ControlPlanSerializer(serializers.ModelSerializer):
    items = ControlPlanItemSerializer(many=True, read_only=True)
    process_owner_name = serializers.CharField(source='process_owner.get_full_name', read_only=True)
    
    class Meta:
        model = ControlPlan
        fields = [
            'id', 'project', 'process_name', 'process_owner', 'process_owner_name',
            'effective_date', 'revision', 'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ControlChartDataSerializer(serializers.ModelSerializer):
    recorded_by_name = serializers.CharField(source='recorded_by.get_full_name', read_only=True)
    
    class Meta:
        model = ControlChartData
        fields = [
            'id', 'chart', 'date', 'value', 'subgroup_size',
            'is_violation', 'violation_rule', 'assignable_cause',
            'corrective_action', 'recorded_by', 'recorded_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ControlChartSerializer(serializers.ModelSerializer):
    data_points = ControlChartDataSerializer(many=True, read_only=True)
    chart_type_display = serializers.CharField(source='get_chart_type_display', read_only=True)
    total_violations = serializers.ReadOnlyField()
    is_in_control = serializers.ReadOnlyField()
    recent_data = serializers.SerializerMethodField()
    
    class Meta:
        model = ControlChart
        fields = [
            'id', 'project', 'name', 'chart_type', 'chart_type_display',
            'metric_name', 'unit', 'ucl', 'lcl', 'center_line',
            'usl', 'lsl', 'target', 'cp', 'cpk',
            'is_active', 'total_violations', 'is_in_control',
            'data_points', 'recent_data', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_recent_data(self, obj):
        """Return last 30 data points for chart rendering"""
        recent = obj.data_points.order_by('-date')[:30]
        return ControlChartDataSerializer(reversed(list(recent)), many=True).data


class ControlChartListSerializer(serializers.ModelSerializer):
    """Lighter serializer for list views"""
    chart_type_display = serializers.CharField(source='get_chart_type_display', read_only=True)
    total_violations = serializers.ReadOnlyField()
    is_in_control = serializers.ReadOnlyField()
    data_point_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ControlChart
        fields = [
            'id', 'project', 'name', 'chart_type', 'chart_type_display',
            'metric_name', 'unit', 'ucl', 'lcl', 'center_line',
            'cp', 'cpk', 'is_active', 'total_violations', 'is_in_control',
            'data_point_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_data_point_count(self, obj):
        return obj.data_points.count()


class TollgateReviewSerializer(serializers.ModelSerializer):
    phase_display = serializers.CharField(source='get_phase_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    reviewer_name = serializers.CharField(source='reviewer.get_full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    
    class Meta:
        model = TollgateReview
        fields = [
            'id', 'project', 'phase', 'phase_display',
            'scheduled_date', 'actual_date',
            'reviewer', 'reviewer_name', 'status', 'status_display',
            'checklist_completed', 'deliverables_reviewed',
            'findings', 'action_items',
            'approved', 'approved_by', 'approved_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProjectClosureSerializer(serializers.ModelSerializer):
    sigma_improvement = serializers.ReadOnlyField()
    defect_reduction_percentage = serializers.ReadOnlyField()
    roi = serializers.ReadOnlyField()
    process_owner_name = serializers.CharField(source='process_owner.get_full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    
    class Meta:
        model = ProjectClosure
        fields = [
            'id', 'project', 'initial_sigma', 'final_sigma', 'sigma_improvement',
            'initial_defect_rate', 'final_defect_rate', 'defect_reduction_percentage',
            'projected_savings', 'realized_savings', 'total_project_cost', 'roi',
            'lessons_learned', 'best_practices', 'recommendations',
            'process_owner', 'process_owner_name',
            'handover_completed', 'training_completed', 'documentation_completed',
            'closure_date', 'approved_by', 'approved_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


# =============================================================================
# DASHBOARD SERIALIZER
# =============================================================================

class SixSigmaDashboardSerializer(serializers.Serializer):
    """Aggregated dashboard data for a Six Sigma project"""
    project_id = serializers.IntegerField()
    project_name = serializers.CharField()
    methodology = serializers.CharField()
    
    # Phase progress
    current_phase = serializers.CharField()
    phase_progress = serializers.DictField()
    
    # Tollgates
    tollgates = TollgateReviewSerializer(many=True)
    
    # Key metrics
    baseline_sigma = serializers.DecimalField(max_digits=4, decimal_places=2, allow_null=True)
    current_sigma = serializers.DecimalField(max_digits=4, decimal_places=2, allow_null=True)
    target_sigma = serializers.DecimalField(max_digits=4, decimal_places=2, allow_null=True)
    
    # Financial
    estimated_savings = serializers.DecimalField(max_digits=12, decimal_places=2, allow_null=True)
    realized_savings = serializers.DecimalField(max_digits=12, decimal_places=2, allow_null=True)
    
    # Counts
    voc_count = serializers.IntegerField()
    root_causes_count = serializers.IntegerField()
    solutions_count = serializers.IntegerField()
    active_pilots = serializers.IntegerField()
    control_charts_count = serializers.IntegerField()
    violations_count = serializers.IntegerField()