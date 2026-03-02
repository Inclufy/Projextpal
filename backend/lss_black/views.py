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
        queryset = HypothesisTest.objects.all()
        project_id = self.kwargs.get('project_id')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        company = getattr(self.request.user, 'company', None)
        if company:
            queryset = queryset.filter(project__company=company)
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
        queryset = DesignOfExperiment.objects.all()
        project_id = self.kwargs.get('project_id')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        company = getattr(self.request.user, 'company', None)
        if company:
            queryset = queryset.filter(project__company=company)
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
        queryset = ControlPlan.objects.all()
        project_id = self.kwargs.get('project_id')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        company = getattr(self.request.user, 'company', None)
        if company:
            queryset = queryset.filter(project__company=company)
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
        queryset = SPCChart.objects.all()
        project_id = self.kwargs.get('project_id')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        company = getattr(self.request.user, 'company', None)
        if company:
            queryset = queryset.filter(project__company=company)
        return queryset

    def perform_create(self, serializer):
        project_id = self.kwargs.get('project_id')
        if project_id:
            serializer.save(project_id=project_id)
        else:
            serializer.save()
