from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from projects.models import Project

from .models import P2Blueprint, P2ProgrammeProject
from .serializers import P2BlueprintSerializer, P2ProgrammeProjectSerializer


def _get_company(user):
    return getattr(user, 'company', None)


def _verify_programme_access(user, programme_id):
    """Verify the user's company owns the target programme."""
    company = _get_company(user)
    if not company or not Project.objects.filter(id=programme_id, company=company).exists():
        raise PermissionDenied("You do not have access to this programme.")


class P2BlueprintViewSet(viewsets.ModelViewSet):
    serializer_class = P2BlueprintSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['programme', 'status', 'version']
    search_fields = ['name', 'description']

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return P2Blueprint.objects.none()
        queryset = P2Blueprint.objects.select_related('programme', 'created_by').filter(programme__company=company)
        programme_id = self.kwargs.get('programme_id')
        if programme_id:
            queryset = queryset.filter(programme_id=programme_id)
        return queryset

    def perform_create(self, serializer):
        programme_id = self.kwargs.get('programme_id')
        if programme_id:
            _verify_programme_access(self.request.user, programme_id)
            serializer.save(programme_id=programme_id, created_by=self.request.user)
        else:
            serializer.save(created_by=self.request.user)


class P2ProgrammeProjectViewSet(viewsets.ModelViewSet):
    serializer_class = P2ProgrammeProjectSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['programme', 'methodology', 'status']
    search_fields = ['name', 'description']
    ordering_fields = ['start_date', 'name']

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return P2ProgrammeProject.objects.none()
        queryset = P2ProgrammeProject.objects.select_related('programme', 'project_manager', 'blueprint').filter(programme__company=company)
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
