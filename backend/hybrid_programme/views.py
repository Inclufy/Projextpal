from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import HybridGovernanceConfig, HybridAdaptation
from .serializers import HybridGovernanceConfigSerializer, HybridAdaptationSerializer


class HybridGovernanceConfigViewSet(viewsets.ModelViewSet):
    serializer_class = HybridGovernanceConfigSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['programme', 'primary_framework', 'is_active']

    def get_queryset(self):
        queryset = HybridGovernanceConfig.objects.all()
        programme_id = self.kwargs.get('programme_id')
        if programme_id:
            queryset = queryset.filter(programme_id=programme_id)
        return queryset

    def perform_create(self, serializer):
        programme_id = self.kwargs.get('programme_id')
        if programme_id:
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
        queryset = HybridAdaptation.objects.all()
        programme_id = self.kwargs.get('programme_id')
        if programme_id:
            queryset = queryset.filter(programme_id=programme_id)
        return queryset

    def perform_create(self, serializer):
        programme_id = self.kwargs.get('programme_id')
        if programme_id:
            serializer.save(programme_id=programme_id)
        else:
            serializer.save()
