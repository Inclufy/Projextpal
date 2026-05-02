from rest_framework import viewsets, mixins
from rest_framework.permissions import IsAuthenticated

from admin_portal.permissions import IsAdminOrSuperAdmin

from .models import Integration, CrmKey, Webhook
from .serializers import IntegrationSerializer, CrmKeySerializer, WebhookSerializer


def _scoped(qs, user):
    """P0 cross-tenant fix — was returning every tenant's rows.

    Each integration model has a `tenant` FK to accounts.Company. Restrict
    by the requesting user's company. Superadmin/superuser sees everything.
    """
    if not user.is_authenticated:
        return qs.none()
    if getattr(user, "role", None) == "superadmin" or getattr(user, "is_superuser", False):
        return qs
    company_id = getattr(user, "company_id", None)
    if not company_id:
        return qs.none()
    return qs.filter(tenant_id=company_id)


class _ScaffoldViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """List + create + retrieve + delete only — Phase 1 scaffold."""
    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]

    def get_queryset(self):
        return _scoped(super().get_queryset(), self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class IntegrationViewSet(_ScaffoldViewSet):
    queryset = Integration.objects.all().order_by('-created_at')
    serializer_class = IntegrationSerializer
    filterset_fields = ['tenant', 'type', 'is_active']


class CrmKeyViewSet(_ScaffoldViewSet):
    queryset = CrmKey.objects.all().order_by('-created_at')
    serializer_class = CrmKeySerializer
    filterset_fields = ['tenant', 'type', 'is_active']


class WebhookViewSet(_ScaffoldViewSet):
    queryset = Webhook.objects.all().order_by('-created_at')
    serializer_class = WebhookSerializer
    filterset_fields = ['tenant', 'type', 'is_active']
