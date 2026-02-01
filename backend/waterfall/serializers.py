from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    WaterfallPhase, WaterfallTeamMember, WaterfallRequirement,
    WaterfallDesignDocument, WaterfallTask, WaterfallTestCase,
    WaterfallMilestone, WaterfallGanttTask, WaterfallChangeRequest,
    WaterfallDeploymentChecklist, WaterfallMaintenanceItem,
    WaterfallBudget, WaterfallBudgetItem
)

User = get_user_model()


class WaterfallPhaseSerializer(serializers.ModelSerializer):
    phase_type_display = serializers.CharField(source='get_phase_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    signed_off_by_name = serializers.CharField(source='signed_off_by.get_full_name', read_only=True, allow_null=True)
    task_count = serializers.SerializerMethodField()
    
    class Meta:
        model = WaterfallPhase
        fields = [
            'id', 'phase_type', 'phase_type_display', 'name', 'description',
            'status', 'status_display', 'start_date', 'end_date',
            'actual_start_date', 'actual_end_date', 'progress', 'order',
            'sign_off_required', 'signed_off_by', 'signed_off_by_name', 'signed_off_at',
            'task_count'
        ]
    
    def get_task_count(self, obj):
        return obj.tasks.count() if hasattr(obj, 'tasks') else 0


class WaterfallTeamMemberSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    phase_name = serializers.CharField(source='phase.name', read_only=True, allow_null=True)
    
    class Meta:
        model = WaterfallTeamMember
        fields = [
            'id', 'user', 'user_name', 'user_email', 'role', 'role_display',
            'phase', 'phase_name', 'allocation_percentage', 'start_date', 'end_date'
        ]


class WaterfallTeamMemberCreateSerializer(serializers.Serializer):
    user_email = serializers.EmailField()
    role = serializers.CharField()
    phase = serializers.IntegerField(required=False, allow_null=True)
    allocation_percentage = serializers.IntegerField(default=100)


class WaterfallRequirementSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_requirement_type_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True, allow_null=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True, allow_null=True)
    test_case_count = serializers.SerializerMethodField()
    
    class Meta:
        model = WaterfallRequirement
        fields = [
            'id', 'requirement_id', 'title', 'description', 'requirement_type',
            'type_display', 'priority', 'priority_display', 'status', 'status_display',
            'source', 'acceptance_criteria', 'dependencies', 'created_by',
            'created_by_name', 'approved_by', 'approved_by_name', 'test_case_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'created_by']
    
    def get_test_case_count(self, obj):
        return obj.test_cases.count()


class WaterfallDesignDocumentSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_document_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    author_name = serializers.CharField(source='author.get_full_name', read_only=True, allow_null=True)
    reviewer_name = serializers.CharField(source='reviewer.get_full_name', read_only=True, allow_null=True)
    requirement_ids = serializers.SerializerMethodField()
    
    class Meta:
        model = WaterfallDesignDocument
        fields = [
            'id', 'title', 'document_type', 'type_display', 'version',
            'description', 'content', 'status', 'status_display',
            'author', 'author_name', 'reviewer', 'reviewer_name',
            'requirements', 'requirement_ids', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_requirement_ids(self, obj):
        return [r.requirement_id for r in obj.requirements.all()]


class WaterfallTaskSerializer(serializers.ModelSerializer):
    phase_name = serializers.CharField(source='phase.name', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    assignee_name = serializers.CharField(source='assignee.get_full_name', read_only=True, allow_null=True)
    requirement_ids = serializers.SerializerMethodField()
    
    class Meta:
        model = WaterfallTask
        fields = [
            'id', 'phase', 'phase_name', 'title', 'description',
            'priority', 'priority_display', 'status', 'status_display',
            'assignee', 'assignee_name', 'estimated_hours', 'actual_hours',
            'start_date', 'due_date', 'completed_date', 'requirements',
            'requirement_ids', 'created_at'
        ]
        read_only_fields = ['created_at']
    
    def get_requirement_ids(self, obj):
        return [r.requirement_id for r in obj.requirements.all()]


class WaterfallTestCaseSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_test_type_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    assignee_name = serializers.CharField(source='assignee.get_full_name', read_only=True, allow_null=True)
    executed_by_name = serializers.CharField(source='executed_by.get_full_name', read_only=True, allow_null=True)
    requirement_id_ref = serializers.CharField(source='requirement.requirement_id', read_only=True, allow_null=True)
    
    class Meta:
        model = WaterfallTestCase
        fields = [
            'id', 'test_id', 'name', 'description', 'test_type', 'type_display',
            'priority', 'priority_display', 'status', 'status_display',
            'preconditions', 'test_steps', 'expected_result', 'actual_result',
            'requirement', 'requirement_id_ref', 'assignee', 'assignee_name',
            'executed_at', 'executed_by', 'executed_by_name', 'created_at'
        ]
        read_only_fields = ['created_at']


class WaterfallMilestoneSerializer(serializers.ModelSerializer):
    phase_name = serializers.CharField(source='phase.name', read_only=True, allow_null=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True, allow_null=True)
    days_remaining = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = WaterfallMilestone
        fields = [
            'id', 'phase', 'phase_name', 'name', 'description',
            'due_date', 'completed_date', 'status', 'status_display',
            'deliverables', 'owner', 'owner_name', 'days_remaining', 'created_at'
        ]
        read_only_fields = ['created_at']


class WaterfallGanttTaskSerializer(serializers.ModelSerializer):
    phase_name = serializers.CharField(source='phase.name', read_only=True)
    assignee_name = serializers.CharField(source='assignee.get_full_name', read_only=True, allow_null=True)
    dependency_ids = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    
    class Meta:
        model = WaterfallGanttTask
        fields = [
            'id', 'phase', 'phase_name', 'name', 'start_date', 'end_date',
            'progress', 'dependencies', 'dependency_ids', 'assignee', 'assignee_name',
            'is_milestone', 'order', 'status'
        ]
    
    def get_dependency_ids(self, obj):
        return list(obj.dependencies.values_list('id', flat=True))
    
    def get_status(self, obj):
        if obj.progress >= 100:
            return 'completed'
        elif obj.progress > 0:
            return 'in_progress'
        return 'not_started'


class WaterfallChangeRequestSerializer(serializers.ModelSerializer):
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    affected_phase_name = serializers.CharField(source='affected_phase.name', read_only=True, allow_null=True)
    requested_by_name = serializers.CharField(source='requested_by.get_full_name', read_only=True, allow_null=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.get_full_name', read_only=True, allow_null=True)
    
    class Meta:
        model = WaterfallChangeRequest
        fields = [
            'id', 'change_id', 'title', 'description', 'reason',
            'priority', 'priority_display', 'status', 'status_display',
            'affected_phase', 'affected_phase_name', 'schedule_impact',
            'budget_impact', 'scope_impact', 'requested_by', 'requested_by_name',
            'reviewed_by', 'reviewed_by_name', 'approval_date', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'requested_by']


class WaterfallDeploymentChecklistSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    completed_by_name = serializers.CharField(source='completed_by.get_full_name', read_only=True, allow_null=True)
    assignee_name = serializers.CharField(source='assignee.get_full_name', read_only=True, allow_null=True)
    
    class Meta:
        model = WaterfallDeploymentChecklist
        fields = [
            'id', 'category', 'category_display', 'item', 'is_required',
            'is_completed', 'completed_by', 'completed_by_name', 'completed_at',
            'assignee', 'assignee_name', 'order'
        ]


class WaterfallMaintenanceItemSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_item_type_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    reported_by_name = serializers.CharField(source='reported_by.get_full_name', read_only=True, allow_null=True)
    assignee_name = serializers.CharField(source='assignee.get_full_name', read_only=True, allow_null=True)
    
    class Meta:
        model = WaterfallMaintenanceItem
        fields = [
            'id', 'title', 'description', 'item_type', 'type_display',
            'priority', 'priority_display', 'status', 'status_display',
            'reported_by', 'reported_by_name', 'assignee', 'assignee_name',
            'reported_date', 'resolved_date', 'resolution'
        ]
        read_only_fields = ['reported_by', 'reported_date']


class WaterfallBudgetItemSerializer(serializers.ModelSerializer):
    phase_name = serializers.CharField(source='phase.name', read_only=True, allow_null=True)
    variance = serializers.SerializerMethodField()
    
    class Meta:
        model = WaterfallBudgetItem
        fields = [
            'id', 'phase', 'phase_name', 'category', 'description',
            'planned_amount', 'actual_amount', 'variance', 'date'
        ]
    
    def get_variance(self, obj):
        return float(obj.planned_amount - obj.actual_amount)


class WaterfallBudgetSerializer(serializers.ModelSerializer):
    items = WaterfallBudgetItemSerializer(many=True, read_only=True)
    total_spent = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    remaining = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    utilization_percentage = serializers.SerializerMethodField()
    by_phase = serializers.SerializerMethodField()
    
    class Meta:
        model = WaterfallBudget
        fields = [
            'id', 'total_budget', 'currency', 'contingency_percentage',
            'total_spent', 'remaining', 'utilization_percentage',
            'by_phase', 'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_utilization_percentage(self, obj):
        if obj.total_budget == 0:
            return 0
        return round((obj.total_spent / obj.total_budget) * 100, 1)
    
    def get_by_phase(self, obj):
        from django.db.models import Sum
        return list(obj.items.values('phase__name').annotate(
            planned=Sum('planned_amount'),
            actual=Sum('actual_amount')
        ))


# Dashboard Serializer
class WaterfallDashboardSerializer(serializers.Serializer):
    has_initialized = serializers.BooleanField()
    current_phase = WaterfallPhaseSerializer(allow_null=True)
    phases = WaterfallPhaseSerializer(many=True)
    overall_progress = serializers.IntegerField()
    days_remaining = serializers.IntegerField()
    total_milestones = serializers.IntegerField()
    completed_milestones = serializers.IntegerField()
    at_risk_milestones = serializers.IntegerField()
    team_size = serializers.IntegerField()
    pending_change_requests = serializers.IntegerField()
    budget_utilization = serializers.FloatField()
