from rest_framework import serializers
from .models import HypothesisTest, DesignOfExperiment, ControlPlan, SPCChart


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
