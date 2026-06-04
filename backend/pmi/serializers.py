from rest_framework import serializers
from .models import (
    PMIComponent, PMIGovernanceBoard, PMIGateDecision,
    PMIProgramCharter, PMIBenefit, PMIStakeholder, PMIRoadmapItem,
)


class PMIComponentSerializer(serializers.ModelSerializer):
    dependency_count = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = PMIComponent
        fields = '__all__'
        # `status` is read-only: a component changes status ONLY through a
        # recorded gate decision (the `decide` action), never a raw PATCH.
        read_only_fields = ['id', 'status', 'created_at', 'updated_at']

    def get_dependency_count(self, obj):
        return obj.depends_on.count()


class PMIGovernanceBoardSerializer(serializers.ModelSerializer):
    class Meta:
        model = PMIGovernanceBoard
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class PMIGateDecisionSerializer(serializers.ModelSerializer):
    outcome_display = serializers.CharField(source='get_outcome_display', read_only=True)
    component_name = serializers.CharField(source='component.name', read_only=True)
    decided_by_name = serializers.SerializerMethodField()

    class Meta:
        model = PMIGateDecision
        fields = '__all__'
        read_only_fields = ['id', 'previous_status', 'new_status', 'decided_at']

    def get_decided_by_name(self, obj):
        if obj.decided_by_id:
            return obj.decided_by.get_full_name() or obj.decided_by.email
        return None


class PMIProgramCharterSerializer(serializers.ModelSerializer):
    class Meta:
        model = PMIProgramCharter
        fields = '__all__'
        read_only_fields = ['id', 'program', 'created_at', 'updated_at']


class PMIBenefitSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    component_name = serializers.SerializerMethodField()

    class Meta:
        model = PMIBenefit
        fields = '__all__'
        read_only_fields = ['id', 'program', 'created_at', 'updated_at']

    def get_component_name(self, obj):
        return obj.component.name if obj.component_id else None


class PMIStakeholderSerializer(serializers.ModelSerializer):
    quadrant = serializers.CharField(read_only=True)

    class Meta:
        model = PMIStakeholder
        fields = '__all__'
        read_only_fields = ['id', 'program', 'created_at', 'updated_at']


class PMIRoadmapItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PMIRoadmapItem
        fields = '__all__'
        read_only_fields = ['id', 'program', 'created_at', 'updated_at']
