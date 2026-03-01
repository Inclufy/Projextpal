from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import HybridArtifact, HybridConfiguration, PhaseMethodology
from .serializers import HybridArtifactSerializer, HybridConfigurationSerializer, PhaseMethodologySerializer


class HybridArtifactViewSet(viewsets.ModelViewSet):
    serializer_class = HybridArtifactSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['project', 'source_methodology', 'status']
    search_fields = ['name', 'description']

    def get_queryset(self):
        queryset = HybridArtifact.objects.all()
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


class HybridConfigurationViewSet(viewsets.ModelViewSet):
    serializer_class = HybridConfigurationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['project', 'primary_methodology', 'is_active']

    def get_queryset(self):
        queryset = HybridConfiguration.objects.all()
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


class PhaseMethodologyViewSet(viewsets.ModelViewSet):
    serializer_class = PhaseMethodologySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['project', 'methodology']
    ordering_fields = ['order']

    def get_queryset(self):
        queryset = PhaseMethodology.objects.all()
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
