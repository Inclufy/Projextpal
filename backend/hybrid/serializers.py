from rest_framework import serializers
from projects.models import Project
from .models import HybridArtifact, HybridConfiguration, PhaseMethodology, HybridTask
from .constants import HYBRID_METHODOLOGIES, HYBRID_METHODOLOGY_SET


# 'project' must be optional-but-writable, not read-only: the project-scoped
# routes inject it from the URL (so the body may omit it — BUG-038), while the
# flat /hybrid/<resource>/ routes take it from the body (read-only there meant
# it was silently dropped and the NOT NULL insert 500'd — BUG-038 follow-up).
# Presence and access are enforced in the views' perform_create.
def _optional_project_field():
    return serializers.PrimaryKeyRelatedField(
        queryset=Project.objects.all(), required=False
    )


class ProjectImmutableMixin:
    """Once created, an object stays on its project — a PATCH can't move it
    (and thereby escape the tenant/access checks done at create time)."""

    def validate_project(self, value):
        if self.instance is not None and self.instance.project_id != value.id:
            raise serializers.ValidationError(
                "project cannot be changed after creation."
            )
        return value


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


class HybridArtifactSerializer(ProjectImmutableMixin, serializers.ModelSerializer):
    project = _optional_project_field()

    class Meta:
        model = HybridArtifact
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_source_methodology(self, value):
        return _validate_methodology(value)


class HybridConfigurationSerializer(ProjectImmutableMixin, serializers.ModelSerializer):
    project = _optional_project_field()

    class Meta:
        model = HybridConfiguration
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_primary_methodology(self, value):
        return _validate_methodology(value)

    def validate_secondary_methodologies(self, value):
        for m in (value or []):
            _validate_methodology(m)
        return value


class PhaseMethodologySerializer(ProjectImmutableMixin, serializers.ModelSerializer):
    strategy = serializers.CharField(read_only=True)
    project = _optional_project_field()

    class Meta:
        model = PhaseMethodology
        fields = '__all__'
        # gate_status / sign-off / completed_at change ONLY through the signoff
        # and complete actions — never a raw write — so the methodology strategy
        # is actually enforced (a phase can't be "completed" by a PATCH).
        read_only_fields = [
            'id', 'gate_status', 'signed_off_by', 'signed_off_at',
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


class HybridTaskSerializer(ProjectImmutableMixin, serializers.ModelSerializer):
    project = _optional_project_field()
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
