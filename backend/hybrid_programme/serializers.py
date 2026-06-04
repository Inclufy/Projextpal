from rest_framework import serializers
from .models import HybridGovernanceConfig, HybridAdaptation, ConstituentAuthorization


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


class ConstituentAuthorizationSerializer(serializers.ModelSerializer):
    project_name = serializers.SerializerMethodField()
    checkpoint_current = serializers.SerializerMethodField()

    class Meta:
        model = ConstituentAuthorization
        fields = '__all__'
        # status / stage_gate_passed / last_checkpoint_at / authorized_* change
        # ONLY through the stage_gate / checkpoint / authorize actions — never a
        # raw write — so the config-driven gate is actually enforced.
        read_only_fields = [
            'id', 'programme', 'status', 'stage_gate_passed', 'last_checkpoint_at',
            'authorized_by', 'authorized_at', 'created_at', 'updated_at',
        ]

    def get_project_name(self, obj):
        return getattr(obj.project, 'name', None)

    def get_checkpoint_current(self, obj):
        return obj.checkpoint_is_current()
