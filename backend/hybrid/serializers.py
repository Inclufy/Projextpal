from rest_framework import serializers
from .models import HybridArtifact, HybridConfiguration, PhaseMethodology, HybridTask
from .constants import HYBRID_METHODOLOGIES, HYBRID_METHODOLOGY_SET


def _validate_methodology(value):
    """Reject any methodology outside the canonical Hybrid vocabulary.

    Empty values are left to the model's own required/blank rules.
    """
    if value and value not in HYBRID_METHODOLOGY_SET:
        raise serializers.ValidationError(
            f"'{value}' is not a valid methodology. Choose one of: "
            f"{', '.join(HYBRID_METHODOLOGIES)}."
        )
    return value


class HybridArtifactSerializer(serializers.ModelSerializer):
    class Meta:
        model = HybridArtifact
        fields = '__all__'
        read_only_fields = ['id', 'project', 'created_at', 'updated_at']

    def validate_source_methodology(self, value):
        return _validate_methodology(value)


class HybridConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = HybridConfiguration
        fields = '__all__'
        read_only_fields = ['id', 'project', 'created_at', 'updated_at']

    def validate_primary_methodology(self, value):
        return _validate_methodology(value)

    def validate_secondary_methodologies(self, value):
        for m in (value or []):
            _validate_methodology(m)
        return value


class PhaseMethodologySerializer(serializers.ModelSerializer):
    class Meta:
        model = PhaseMethodology
        fields = '__all__'
        read_only_fields = ['id', 'project', 'created_at', 'updated_at']

    def validate_methodology(self, value):
        return _validate_methodology(value)


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
