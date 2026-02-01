from rest_framework import serializers
from .models import (
    Program, 
    ProgramBenefit, 
    ProgramRisk, 
    ProgramMilestone,
    ProgramBudget,
    ProgramBudgetCategory,
    ProgramBudgetItem
)


class ProgramBenefitSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)

    class Meta:
        model = ProgramBenefit
        fields = [
            'id', 'program', 'name', 'description', 'category', 'status',
            'target_value', 'actual_value', 'measurement_unit',
            'expected_date', 'realized_date', 'owner', 'owner_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class ProgramRiskSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)

    class Meta:
        model = ProgramRisk
        fields = [
            'id', 'program', 'name', 'description', 'impact', 'probability',
            'status', 'mitigation_plan', 'owner', 'owner_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class ProgramMilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgramMilestone
        fields = [
            'id', 'program', 'name', 'description', 'target_date',
            'actual_date', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class ProgramListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    program_manager_name = serializers.SerializerMethodField()
    progress = serializers.IntegerField(read_only=True)
    project_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Program
        fields = [
            'id', 'name', 'description', 'methodology', 'status', 'health_status',
            'start_date', 'target_end_date', 'total_budget', 'spent_budget', 'currency',
            'program_manager', 'program_manager_name', 'progress', 'project_count',
            'created_at', 'updated_at'
        ]

    def get_program_manager_name(self, obj):
        if obj.program_manager:
            return obj.program_manager.get_full_name() or obj.program_manager.email
        return None


class ProgramDetailSerializer(serializers.ModelSerializer):
    """Full serializer for detail views."""
    program_manager_name = serializers.SerializerMethodField()
    executive_sponsor_name = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    progress = serializers.IntegerField(read_only=True)
    project_count = serializers.IntegerField(read_only=True)
    budget_variance = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    
    # Nested data
    benefits = ProgramBenefitSerializer(many=True, read_only=True)
    risks = ProgramRiskSerializer(many=True, read_only=True)
    milestones = ProgramMilestoneSerializer(many=True, read_only=True)

    class Meta:
        model = Program
        fields = [
            'id', 'name', 'description', 'strategic_objective',
            'methodology', 'status', 'health_status',
            'start_date', 'target_end_date', 'actual_end_date',
            'total_budget', 'spent_budget', 'currency', 'budget_variance',
            'program_manager', 'program_manager_name',
            'executive_sponsor', 'executive_sponsor_name',
            'progress', 'project_count',
            'benefits', 'risks', 'milestones',
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def get_program_manager_name(self, obj):
        if obj.program_manager:
            return obj.program_manager.get_full_name() or obj.program_manager.email
        return None

    def get_executive_sponsor_name(self, obj):
        if obj.executive_sponsor:
            return obj.executive_sponsor.get_full_name() or obj.executive_sponsor.email
        return None

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.email
        return None


class ProgramCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating programs."""
    project_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        help_text="List of project IDs to link to this program"
    )

    class Meta:
        model = Program
        fields = [
            'id', 'name', 'description', 'strategic_objective',
            'methodology', 'status', 'health_status',
            'start_date', 'target_end_date',
            'total_budget', 'currency',
            'program_manager', 'executive_sponsor',
            'project_ids'
        ]

    def create(self, validated_data):
        project_ids = validated_data.pop('project_ids', [])
        program = Program.objects.create(**validated_data)
        
        if project_ids:
            from projects.models import Project
            projects = Project.objects.filter(id__in=project_ids, company=program.company)
            program.projects.set(projects)
        
        return program

    def update(self, instance, validated_data):
        project_ids = validated_data.pop('project_ids', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if project_ids is not None:
            from projects.models import Project
            projects = Project.objects.filter(id__in=project_ids, company=instance.company)
            instance.projects.set(projects)
        
        return instance


# Budget Serializers
class ProgramBudgetSerializer(serializers.ModelSerializer):
    total_spent = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    total_remaining = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    projects_budget = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    program_name = serializers.CharField(source='program.name', read_only=True)

    class Meta:
        model = ProgramBudget
        fields = [
            'id', 'program', 'program_name', 'total_budget',
            'total_spent', 'total_remaining', 'projects_budget',
            'currency', 'period_start', 'period_end', 'updated_at'
        ]
        read_only_fields = ['id', 'updated_at']


class ProgramBudgetCategorySerializer(serializers.ModelSerializer):
    spent = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    remaining = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = ProgramBudgetCategory
        fields = [
            'id', 'name', 'allocated', 'spent', 'remaining',
            'color', 'icon', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProgramBudgetItemSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    program_name = serializers.CharField(source='program.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = ProgramBudgetItem
        fields = [
            'id', 'program', 'program_name', 'category', 'category_name',
            'description', 'amount', 'date', 'type', 'status',
            'created_by', 'created_by_name', 'approved_by', 'approved_by_name',
            'receipt_url', 'notes', 'rejection_reason',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'approved_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class ProgramBudgetOverviewSerializer(serializers.Serializer):
    """Complete budget overview for a program"""
    program_id = serializers.IntegerField()
    program_name = serializers.CharField()
    total_budget = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_spent = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_remaining = serializers.DecimalField(max_digits=15, decimal_places=2)
    projects_budget = serializers.DecimalField(max_digits=15, decimal_places=2)
    currency = serializers.CharField()
    categories = ProgramBudgetCategorySerializer(many=True)