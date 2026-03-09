from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import DMAICPhase, LSSGreenMetric, LSSGreenMeasurement
from .serializers import DMAICPhaseSerializer, LSSGreenMetricSerializer, LSSGreenMeasurementSerializer


class DMAICPhaseViewSet(viewsets.ModelViewSet):
    serializer_class = DMAICPhaseSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['project', 'phase', 'status']
    ordering_fields = ['order', 'created_at']

    def get_queryset(self):
        company = getattr(self.request.user, 'company', None)
        if not company:
            return DMAICPhase.objects.none()
        queryset = DMAICPhase.objects.filter(project__company=company)
        project_id = self.kwargs.get('project_id')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset

    def perform_create(self, serializer):
        project_id = self.kwargs.get('project_id')
        if project_id:
            serializer.save(project_id=project_id)
        else:
            serializer.save()


class LSSGreenMetricViewSet(viewsets.ModelViewSet):
    serializer_class = LSSGreenMetricSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['project', 'metric_type']

    def get_queryset(self):
        company = getattr(self.request.user, 'company', None)
        if not company:
            return LSSGreenMetric.objects.none()
        queryset = LSSGreenMetric.objects.filter(project__company=company)
        project_id = self.kwargs.get('project_id')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset

    def perform_create(self, serializer):
        project_id = self.kwargs.get('project_id')
        if project_id:
            serializer.save(project_id=project_id)
        else:
            serializer.save()


class LSSGreenMeasurementViewSet(viewsets.ModelViewSet):
    serializer_class = LSSGreenMeasurementSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['project', 'phase', 'metric']

    def get_queryset(self):
        company = getattr(self.request.user, 'company', None)
        if not company:
            return LSSGreenMeasurement.objects.none()
        queryset = LSSGreenMeasurement.objects.filter(project__company=company)
        project_id = self.kwargs.get('project_id')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset

    def perform_create(self, serializer):
        project_id = self.kwargs.get('project_id')
        if project_id:
            serializer.save(project_id=project_id)
        else:
            serializer.save()
