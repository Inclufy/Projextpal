from rest_framework import serializers
from .models import MethodologyComparison, MethodologyMetrics


class MethodologyComparisonSerializer(serializers.ModelSerializer):
    class Meta:
        model = MethodologyComparison
        fields = '__all__'
        read_only_fields = ['id', 'company', 'created_by', 'created_at', 'updated_at']


class MethodologyMetricsSerializer(serializers.ModelSerializer):
    class Meta:
        model = MethodologyMetrics
        fields = '__all__'
        read_only_fields = ['id', 'company', 'created_at', 'updated_at']
