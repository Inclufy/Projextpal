from rest_framework import serializers
from .models import HybridArtifact, HybridConfiguration, PhaseMethodology, HybridTask


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


class HybridTaskSerializer(serializers.ModelSerializer):
    assignee_name = serializers.SerializerMethodField()

    class Meta:
        model = HybridTask
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'assignee_name']

    def get_assignee_name(self, obj):
        user = obj.assignee
        if not user:
            return None
        full = (getattr(user, 'get_full_name', lambda: '')() or '').strip()
        return full or getattr(user, 'username', None) or getattr(user, 'email', None)
