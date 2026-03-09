from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import HypothesisTest, DesignOfExperiment, ControlPlan, SPCChart
from .serializers import (
    HypothesisTestSerializer, DesignOfExperimentSerializer,
    ControlPlanSerializer, SPCChartSerializer
)


class HypothesisTestViewSet(viewsets.ModelViewSet):
    serializer_class = HypothesisTestSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['project', 'test_type', 'reject_null']
    search_fields = ['null_hypothesis', 'alternative_hypothesis']

    def get_queryset(self):
        company = getattr(self.request.user, 'company', None)
        if not company:
            return HypothesisTest.objects.none()
        queryset = HypothesisTest.objects.filter(project__company=company)
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


class DesignOfExperimentViewSet(viewsets.ModelViewSet):
    serializer_class = DesignOfExperimentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['project', 'design_type']
    search_fields = ['experiment_name']

    def get_queryset(self):
        company = getattr(self.request.user, 'company', None)
        if not company:
            return DesignOfExperiment.objects.none()
        queryset = DesignOfExperiment.objects.filter(project__company=company)
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


class ControlPlanViewSet(viewsets.ModelViewSet):
    serializer_class = ControlPlanSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['project', 'is_active']
    search_fields = ['process_step', 'control_method']

    def get_queryset(self):
        company = getattr(self.request.user, 'company', None)
        if not company:
            return ControlPlan.objects.none()
        queryset = ControlPlan.objects.filter(project__company=company)
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


class SPCChartViewSet(viewsets.ModelViewSet):
    serializer_class = SPCChartSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['project', 'chart_type']

    def get_queryset(self):
        company = getattr(self.request.user, 'company', None)
        if not company:
            return SPCChart.objects.none()
        queryset = SPCChart.objects.filter(project__company=company)
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
