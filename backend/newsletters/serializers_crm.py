from rest_framework import serializers
from .models import TenantAPIKey, CRMUser


class TenantAPIKeySerializer(serializers.ModelSerializer):
    """Serializer for TenantAPIKey model"""
    
    created_by_name = serializers.SerializerMethodField()
    crm_user_count = serializers.SerializerMethodField()
    
    class Meta:
        model = TenantAPIKey
        fields = [
            "id",
            "name",
            "api_key",
            "api_endpoint",
            "company",
            "is_active",
            "last_synced_at",
            "last_sync_status",
            "last_sync_error",
            "created_by",
            "created_by_name",
            "crm_user_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "created_by",
            "last_synced_at",
            "last_sync_status",
            "last_sync_error",
            "created_at",
            "updated_at",
        ]
    
    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.email
        return None
    
    def get_crm_user_count(self, obj):
        return obj.crm_users.filter(is_active=True).count()


class CRMUserSerializer(serializers.ModelSerializer):
    """Serializer for CRMUser model"""
    
    full_name = serializers.CharField(source="get_full_name", read_only=True)
    api_key_name = serializers.ReadOnlyField(source="tenant_api_key.name")
    
    class Meta:
        model = CRMUser
        fields = [
            "id",
            "tenant_api_key",
            "api_key_name",
            "external_id",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "raw_data",
            "is_active",
            "last_synced_at",
            "created_at",
        ]
        read_only_fields = [
            "last_synced_at",
            "created_at",
        ]


class CRMUserListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing CRM users"""
    
    full_name = serializers.CharField(source="get_full_name", read_only=True)
    
    class Meta:
        model = CRMUser
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "is_active",
        ]

