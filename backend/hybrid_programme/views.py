from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from projects.models import Project

from .models import HybridGovernanceConfig, HybridAdaptation
from .serializers import HybridGovernanceConfigSerializer, HybridAdaptationSerializer


def _get_company(user):
    return getattr(user, 'company', None)


def _verify_programme_access(user, programme_id):
    """Verify the user's company owns the target programme."""
    company = _get_company(user)
    if not company or not Project.objects.filter(id=programme_id, company=company).exists():
        raise PermissionDenied("You do not have access to this programme.")


class HybridGovernanceConfigViewSet(viewsets.ModelViewSet):
    serializer_class = HybridGovernanceConfigSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['programme', 'primary_framework', 'is_active']

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return HybridGovernanceConfig.objects.none()
        queryset = HybridGovernanceConfig.objects.select_related('programme').filter(programme__company=company)
        programme_id = self.kwargs.get('programme_id')
        if programme_id:
            queryset = queryset.filter(programme_id=programme_id)
        return queryset

    def perform_create(self, serializer):
        programme_id = self.kwargs.get('programme_id')
        if programme_id:
            _verify_programme_access(self.request.user, programme_id)
            serializer.save(programme_id=programme_id)
        else:
            serializer.save()


class HybridAdaptationViewSet(viewsets.ModelViewSet):
    serializer_class = HybridAdaptationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['programme', 'trigger', 'response']
    ordering_fields = ['effective_date', 'created_at']

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return HybridAdaptation.objects.none()
        queryset = HybridAdaptation.objects.select_related('programme', 'approved_by').filter(programme__company=company)
        programme_id = self.kwargs.get('programme_id')
        if programme_id:
            queryset = queryset.filter(programme_id=programme_id)
        return queryset

    def perform_create(self, serializer):
        programme_id = self.kwargs.get('programme_id')
        if programme_id:
            _verify_programme_access(self.request.user, programme_id)
            serializer.save(programme_id=programme_id)
        else:
            serializer.save()
