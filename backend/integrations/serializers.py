from rest_framework import serializers
from accounts.models import Company
from .models import Integration, CrmKey, Webhook, AutomationRule, AutomationRun


class _BaseScaffoldSerializer(serializers.ModelSerializer):
    """Shared base — exposes the same flat shape used by admin UI."""

    class Meta:
        abstract = True
        fields = (
            'id', 'tenant', 'name', 'type', 'config',
            'is_active', 'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class IntegrationSerializer(_BaseScaffoldSerializer):
    class Meta(_BaseScaffoldSerializer.Meta):
        model = Integration


class CrmKeySerializer(_BaseScaffoldSerializer):
    class Meta(_BaseScaffoldSerializer.Meta):
        model = CrmKey


class WebhookSerializer(_BaseScaffoldSerializer):
    class Meta(_BaseScaffoldSerializer.Meta):
        model = Webhook


class AutomationRunSerializer(serializers.ModelSerializer):
    class Meta:
        model = AutomationRun
        fields = (
            'id', 'rule', 'trigger', 'payload', 'status', 'action_type',
            'action_result', 'error', 'created_at',
        )
        read_only_fields = fields


class AutomationRuleSerializer(serializers.ModelSerializer):
    trigger_display = serializers.CharField(source='get_trigger_display', read_only=True)
    action_type_display = serializers.CharField(source='get_action_type_display', read_only=True)
    run_count = serializers.IntegerField(source='runs.count', read_only=True)
    # Defaulted to the caller's company in the view when omitted.
    tenant = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(), required=False,
    )

    class Meta:
        model = AutomationRule
        fields = (
            'id', 'tenant', 'name', 'description', 'trigger', 'trigger_display',
            'condition', 'action_type', 'action_type_display', 'action_config',
            'is_active', 'trigger_count', 'last_triggered_at', 'run_count',
            'created_at', 'updated_at',
        )
        read_only_fields = (
            'id', 'trigger_count', 'last_triggered_at', 'run_count',
            'created_at', 'updated_at',
        )

    def validate_condition(self, value):
        if value in (None, ''):
            return {}
        if not isinstance(value, dict):
            raise serializers.ValidationError('condition must be an object.')
        match = value.get('match', 'all')
        if match not in ('all', 'any'):
            raise serializers.ValidationError("condition.match must be 'all' or 'any'.")
        clauses = value.get('clauses', [])
        if not isinstance(clauses, list):
            raise serializers.ValidationError('condition.clauses must be a list.')
        valid_ops = {'eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'contains', 'exists', 'changed_to'}
        for c in clauses:
            if not isinstance(c, dict) or 'field' not in c:
                raise serializers.ValidationError('Each clause needs at least a "field".')
            if c.get('op', 'eq') not in valid_ops:
                raise serializers.ValidationError(f"Unsupported op: {c.get('op')}")
        return value
