from rest_framework import serializers
from .models import DMAICPhase, LSSGreenMetric, LSSGreenMeasurement


class DMAICPhaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = DMAICPhase
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class LSSGreenMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = LSSGreenMetric
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class LSSGreenMeasurementSerializer(serializers.ModelSerializer):
    class Meta:
        model = LSSGreenMeasurement
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
