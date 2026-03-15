from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from projects.models import Project

from .models import DMAICPhase, LSSGreenMetric, LSSGreenMeasurement
from .serializers import DMAICPhaseSerializer, LSSGreenMetricSerializer, LSSGreenMeasurementSerializer


def _get_company(user):
    return getattr(user, 'company', None)


def _verify_project_access(user, project_id):
    """Verify the user's company owns the target project."""
    company = _get_company(user)
    if not company or not Project.objects.filter(id=project_id, company=company).exists():
        raise PermissionDenied("You do not have access to this project.")


class DMAICPhaseViewSet(viewsets.ModelViewSet):
    serializer_class = DMAICPhaseSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['project', 'phase', 'status']
    ordering_fields = ['order', 'created_at']

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return DMAICPhase.objects.none()
        queryset = DMAICPhase.objects.select_related('project').filter(project__company=company)
        project_id = self.kwargs.get('project_id')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset

    def perform_create(self, serializer):
        project_id = self.kwargs.get('project_id')
        if project_id:
            _verify_project_access(self.request.user, project_id)
            serializer.save(project_id=project_id)
        else:
            serializer.save()


class LSSGreenMetricViewSet(viewsets.ModelViewSet):
    serializer_class = LSSGreenMetricSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['project', 'metric_type']

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return LSSGreenMetric.objects.none()
        queryset = LSSGreenMetric.objects.select_related('project').filter(project__company=company)
        project_id = self.kwargs.get('project_id')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset

    def perform_create(self, serializer):
        project_id = self.kwargs.get('project_id')
        if project_id:
            _verify_project_access(self.request.user, project_id)
            serializer.save(project_id=project_id)
        else:
            serializer.save()


class LSSGreenMeasurementViewSet(viewsets.ModelViewSet):
    serializer_class = LSSGreenMeasurementSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['project', 'phase', 'metric']

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return LSSGreenMeasurement.objects.none()
        queryset = LSSGreenMeasurement.objects.select_related('project').filter(project__company=company)
        project_id = self.kwargs.get('project_id')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset

    def perform_create(self, serializer):
        project_id = self.kwargs.get('project_id')
        if project_id:
            _verify_project_access(self.request.user, project_id)
            serializer.save(project_id=project_id)
        else:
            serializer.save()
