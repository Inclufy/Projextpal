"""Tenant-defined custom fields. Admins (admin/superadmin/pm/program_manager)
manage the definitions; everyone in the company can read them so task forms
and tables can render the extra fields. Values live in Task.custom_fields."""
import re

from rest_framework import serializers, viewsets
from rest_framework.permissions import IsAuthenticated

from .models import CustomFieldDefinition
from .analytics_views import _company_of

MANAGER_ROLES = ("admin", "superadmin", "pm", "program_manager")


def _is_manager(user):
    return getattr(user, "role", None) in MANAGER_ROLES or getattr(user, "is_superuser", False)


class CustomFieldDefinitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomFieldDefinition
        fields = [
            "id", "entity", "key", "label", "field_type", "options",
            "required", "show_in_table", "order_index", "active",
            "created_at", "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def validate_key(self, value):
        slug = re.sub(r"[^a-z0-9_]+", "_", (value or "").strip().lower()).strip("_")
        if not slug:
            raise serializers.ValidationError("Provide a valid key (letters, numbers, underscore).")
        return slug

    def validate(self, attrs):
        # Auto-derive a key from the label if the client did not send one.
        if not attrs.get("key") and attrs.get("label"):
            attrs["key"] = re.sub(r"[^a-z0-9_]+", "_", attrs["label"].strip().lower()).strip("_")
        return attrs


class CustomFieldDefinitionViewSet(viewsets.ModelViewSet):
    serializer_class = CustomFieldDefinitionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        company = _company_of(self.request.user)
        if not company:
            return CustomFieldDefinition.objects.none()
        qs = CustomFieldDefinition.objects.filter(company=company)
        entity = self.request.query_params.get("entity")
        if entity:
            qs = qs.filter(entity=entity)
        if self.request.query_params.get("active") == "1":
            qs = qs.filter(active=True)
        return qs

    def _guard_manager(self):
        if not _is_manager(self.request.user):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only an admin or manager can manage custom fields.")

    def perform_create(self, serializer):
        self._guard_manager()
        company = _company_of(self.request.user)
        if company is None:
            raise serializers.ValidationError("Your account has no associated company.")
        serializer.save(company=company, created_by=self.request.user)

    def perform_update(self, serializer):
        self._guard_manager()
        serializer.save()

    def perform_destroy(self, instance):
        self._guard_manager()
        instance.delete()
