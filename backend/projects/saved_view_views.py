"""Saved list views (filters + grouping) per surface. Company-scoped CRUD,
audience-based visibility — mirrors SavedAnalyticsDashboardViewSet."""
from django.db.models import Q
from rest_framework import serializers, viewsets
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated

from .models import SavedView
from .analytics_views import _company_of


class SavedViewSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = SavedView
        fields = [
            "id", "surface", "project_id_ref", "name", "config",
            "audience", "shared", "created_by", "created_by_name",
            "created_at", "updated_at",
        ]
        read_only_fields = ["created_by", "created_by_name", "created_at", "updated_at", "shared"]

    def get_created_by_name(self, obj):
        u = obj.created_by
        if not u:
            return None
        return (getattr(u, "get_full_name", lambda: "")() or getattr(u, "email", "")) or None


class SavedViewViewSet(viewsets.ModelViewSet):
    serializer_class = SavedViewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        company = _company_of(user)
        if not company:
            return SavedView.objects.none()
        qs = SavedView.objects.filter(company=company)
        surface = self.request.query_params.get("surface")
        project = self.request.query_params.get("project")
        if surface:
            qs = qs.filter(surface=surface)
        if project:
            qs = qs.filter(Q(project_id_ref=project) | Q(project_id_ref__isnull=True))
        role = getattr(user, "role", None)
        if role in ("admin", "superadmin") or getattr(user, "is_superuser", False):
            return qs
        visible = Q(created_by=user) | Q(audience="tenant") | Q(shared=True)
        if role in ("pm", "program_manager", "manager"):
            visible |= Q(audience="management")
        return qs.filter(visible)

    def perform_create(self, serializer):
        company = _company_of(self.request.user)
        if company is None:
            raise ValidationError("Your account has no associated company; cannot save a view.")
        audience = serializer.validated_data.get("audience", "private")
        serializer.save(company=company, created_by=self.request.user, shared=(audience != "private"))

    def _check_owner(self, instance):
        user = self.request.user
        is_admin = getattr(user, "role", None) in ("admin", "superadmin") or getattr(user, "is_superuser", False)
        if instance.created_by_id != getattr(user, "id", None) and not is_admin:
            raise PermissionDenied("Only the author or an admin can modify this view.")

    def perform_update(self, serializer):
        self._check_owner(serializer.instance)
        audience = serializer.validated_data.get("audience")
        if audience is not None:
            serializer.save(shared=(audience != "private"))
        else:
            serializer.save()

    def perform_destroy(self, instance):
        self._check_owner(instance)
        instance.delete()
