from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import MethodologyComparison, MethodologyMetrics
from .serializers import MethodologyComparisonSerializer, MethodologyMetricsSerializer


class MethodologyComparisonViewSet(viewsets.ModelViewSet):
    serializer_class = MethodologyComparisonSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['company']
    search_fields = ['name', 'recommendation']

    def get_queryset(self):
        user = self.request.user
        company = getattr(user, 'company', None)
        if company:
            return MethodologyComparison.objects.filter(company=company)
        return MethodologyComparison.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        company = getattr(user, 'company', None)
        serializer.save(company=company, created_by=user)


class MethodologyMetricsViewSet(viewsets.ModelViewSet):
    serializer_class = MethodologyMetricsSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['methodology', 'period']
    ordering_fields = ['period', 'methodology']

    def get_queryset(self):
        user = self.request.user
        company = getattr(user, 'company', None)
        if company:
            return MethodologyMetrics.objects.filter(company=company)
        return MethodologyMetrics.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        company = getattr(user, 'company', None)
        serializer.save(company=company)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get methodology metrics summary across all methodologies"""
        user = request.user
        company = getattr(user, 'company', None)
        if not company:
            return Response({'methodologies': []})

        from django.db.models import Avg, Sum, Count
        metrics = MethodologyMetrics.objects.filter(company=company).values('methodology').annotate(
            total_projects=Sum('project_count'),
            total_completed=Sum('completed_count'),
            avg_on_time=Avg('on_time_percentage'),
            avg_on_budget=Avg('on_budget_percentage'),
            avg_duration=Avg('average_duration_days'),
        ).order_by('methodology')

        return Response({'methodologies': list(metrics)})
