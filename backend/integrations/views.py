from rest_framework import viewsets, mixins, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from admin_portal.permissions import IsAdminOrSuperAdmin

from .models import Integration, CrmKey, Webhook, AutomationRule
from .serializers import (
    IntegrationSerializer, CrmKeySerializer, WebhookSerializer,
    AutomationRuleSerializer, AutomationRunSerializer,
)
from .engine import evaluate_event, evaluate_rule


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


class AutomationRuleViewSet(viewsets.ModelViewSet):
    """Full CRUD for automation rules + evaluation endpoints (IL-3).

    Tenant-scoped like the other integrations surfaces. Beyond storage, this
    exposes the engine: `dry-run` evaluates a sample payload without side effects,
    `trigger` fires a real event for the tenant (records AutomationRuns), and
    `runs` lists the audit trail for a rule.
    """
    queryset = AutomationRule.objects.all().order_by('-created_at')
    serializer_class = AutomationRuleSerializer
    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]
    filterset_fields = ['tenant', 'trigger', 'action_type', 'is_active']

    def get_queryset(self):
        return _scoped(super().get_queryset(), self.request.user)

    def _default_tenant(self):
        """Non-superadmins always write into their own company."""
        user = self.request.user
        if getattr(user, 'role', None) == 'superadmin' or getattr(user, 'is_superuser', False):
            return None
        return getattr(user, 'company_id', None)

    def perform_create(self, serializer):
        tenant_id = self._default_tenant()
        kwargs = {'created_by': self.request.user}
        if tenant_id and not serializer.validated_data.get('tenant'):
            kwargs['tenant_id'] = tenant_id
        serializer.save(**kwargs)

    @action(detail=True, methods=['post'], url_path='dry-run')
    def dry_run(self, request, pk=None):
        """Evaluate this rule against a sample payload — no side effects."""
        rule = self.get_object()
        payload = request.data.get('payload', {})
        if not isinstance(payload, dict):
            return Response({'detail': 'payload must be an object.'},
                            status=status.HTTP_400_BAD_REQUEST)
        matched, resolved = evaluate_rule(rule, payload)
        return Response({
            'matched': matched,
            'status': 'matched' if matched else 'skipped',
            'action': resolved,
        })

    @action(detail=False, methods=['post'])
    def trigger(self, request):
        """Fire an event for the caller's tenant: evaluate every active rule on
        that trigger and record runs. Body: {trigger, payload}."""
        trig = request.data.get('trigger')
        payload = request.data.get('payload', {})
        if not trig:
            return Response({'detail': 'trigger is required.'},
                            status=status.HTTP_400_BAD_REQUEST)
        if not isinstance(payload, dict):
            return Response({'detail': 'payload must be an object.'},
                            status=status.HTTP_400_BAD_REQUEST)
        tenant_id = getattr(request.user, 'company_id', None)
        from accounts.models import Company
        tenant = Company.objects.filter(id=tenant_id).first()
        if tenant is None:
            return Response({'detail': 'No tenant for this user.'},
                            status=status.HTTP_400_BAD_REQUEST)
        results = evaluate_event(tenant, trig, payload)
        return Response({'trigger': trig, 'evaluated': len(results), 'results': results})

    @action(detail=True, methods=['get'])
    def runs(self, request, pk=None):
        rule = self.get_object()
        qs = rule.runs.all()[:100]
        return Response(AutomationRunSerializer(qs, many=True).data)
