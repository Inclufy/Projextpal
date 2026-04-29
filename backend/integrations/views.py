from rest_framework import viewsets, mixins
from rest_framework.permissions import IsAuthenticated

from admin_portal.permissions import IsAdminOrSuperAdmin

from .models import Integration, CrmKey, Webhook
from .serializers import IntegrationSerializer, CrmKeySerializer, WebhookSerializer


class _ScaffoldViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """List + create + retrieve + delete only — Phase 1 scaffold."""
    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]

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
