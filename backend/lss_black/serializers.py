from rest_framework import serializers
from .models import HypothesisTest, DesignOfExperiment, ControlPlan, SPCChart, LSSBlackTask


class HypothesisTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = HypothesisTest
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'reject_null']


class DesignOfExperimentSerializer(serializers.ModelSerializer):
    class Meta:
        model = DesignOfExperiment
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class ControlPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = ControlPlan
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class SPCChartSerializer(serializers.ModelSerializer):
    class Meta:
        model = SPCChart
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class LSSBlackTaskSerializer(serializers.ModelSerializer):
    assignee_name = serializers.SerializerMethodField()

    class Meta:
        model = LSSBlackTask
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'assignee_name']

    def get_assignee_name(self, obj):
        user = obj.assignee
        if not user:
            return None
        full = (getattr(user, 'get_full_name', lambda: '')() or '').strip()
        return full or getattr(user, 'username', None) or getattr(user, 'email', None)
