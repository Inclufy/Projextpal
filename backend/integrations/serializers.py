from rest_framework import serializers
from .models import Integration, CrmKey, Webhook


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
