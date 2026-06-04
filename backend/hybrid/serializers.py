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
    strategy = serializers.CharField(read_only=True)

    class Meta:
        model = PhaseMethodology
        fields = '__all__'
        # gate_status / sign-off / completed_at change ONLY through the signoff
        # and complete actions — never a raw write — so the methodology strategy
        # is actually enforced (a phase can't be "completed" by a PATCH).
        read_only_fields = [
            'id', 'project', 'gate_status', 'signed_off_by', 'signed_off_at',
            'completed_at', 'created_at', 'updated_at',
        ]

    def validate_methodology(self, value):
        return _validate_methodology(value)

    def validate_progress(self, value):
        # 100% means "phase complete" — only the strategy-enforcing `complete`
        # action may set that, so a raw PATCH to 100 is rejected.
        if value is not None and value >= 100:
            raise serializers.ValidationError(
                "A phase is completed via the `complete` action (which enforces "
                "its methodology gate), not by setting progress to 100."
            )
        return value


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
