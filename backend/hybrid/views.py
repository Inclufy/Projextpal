from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from projects.models import Project

from .models import HybridArtifact, HybridConfiguration, PhaseMethodology
from .serializers import HybridArtifactSerializer, HybridConfigurationSerializer, PhaseMethodologySerializer


def _get_company(user):
    return getattr(user, 'company', None)


def _verify_project_access(user, project_id):
    """Verify the user's company owns the target project."""
    company = _get_company(user)
    if not company or not Project.objects.filter(id=project_id, company=company).exists():
        raise PermissionDenied("You do not have access to this project.")


class HybridArtifactViewSet(viewsets.ModelViewSet):
    serializer_class = HybridArtifactSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['project', 'source_methodology', 'status']
    search_fields = ['name', 'description']

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return HybridArtifact.objects.none()
        queryset = HybridArtifact.objects.select_related('project').filter(project__company=company)
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


class HybridConfigurationViewSet(viewsets.ModelViewSet):
    serializer_class = HybridConfigurationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['project', 'primary_methodology', 'is_active']

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return HybridConfiguration.objects.none()
        queryset = HybridConfiguration.objects.select_related('project').filter(project__company=company)
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


class PhaseMethodologyViewSet(viewsets.ModelViewSet):
    serializer_class = PhaseMethodologySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['project', 'methodology']
    ordering_fields = ['order']

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return PhaseMethodology.objects.none()
        queryset = PhaseMethodology.objects.select_related('project').filter(project__company=company)
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
