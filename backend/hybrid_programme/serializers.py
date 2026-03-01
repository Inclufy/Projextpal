from rest_framework import serializers
from .models import HybridGovernanceConfig, HybridAdaptation


class HybridGovernanceConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = HybridGovernanceConfig
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class HybridAdaptationSerializer(serializers.ModelSerializer):
    class Meta:
        model = HybridAdaptation
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
