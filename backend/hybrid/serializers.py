from rest_framework import serializers
from .models import HybridArtifact, HybridConfiguration, PhaseMethodology


class HybridArtifactSerializer(serializers.ModelSerializer):
    class Meta:
        model = HybridArtifact
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class HybridConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = HybridConfiguration
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class PhaseMethodologySerializer(serializers.ModelSerializer):
    class Meta:
        model = PhaseMethodology
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
