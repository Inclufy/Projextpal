from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from projects.models import Project

from .models import PMIComponent, PMIGovernanceBoard
from .serializers import PMIComponentSerializer, PMIGovernanceBoardSerializer


def _get_company(user):
    return getattr(user, 'company', None)


def _verify_program_access(user, program_id):
    """Verify the user's company owns the target program."""
    company = _get_company(user)
    if not company or not Project.objects.filter(id=program_id, company=company).exists():
        raise PermissionDenied("You do not have access to this program.")


class PMIComponentViewSet(viewsets.ModelViewSet):
    serializer_class = PMIComponentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['program', 'type', 'status']
    search_fields = ['name', 'description']

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return PMIComponent.objects.none()
        queryset = PMIComponent.objects.select_related('program', 'manager').filter(program__company=company)
        program_id = self.kwargs.get('program_id')
        if program_id:
            queryset = queryset.filter(program_id=program_id)
        return queryset

    def perform_create(self, serializer):
        program_id = self.kwargs.get('program_id')
        if program_id:
            _verify_program_access(self.request.user, program_id)
            serializer.save(program_id=program_id)
        else:
            serializer.save()


class PMIGovernanceBoardViewSet(viewsets.ModelViewSet):
    serializer_class = PMIGovernanceBoardSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['program', 'meeting_type']
    ordering_fields = ['meeting_date']

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return PMIGovernanceBoard.objects.none()
        queryset = PMIGovernanceBoard.objects.select_related('program').filter(program__company=company)
        program_id = self.kwargs.get('program_id')
        if program_id:
            queryset = queryset.filter(program_id=program_id)
        return queryset

    def perform_create(self, serializer):
        program_id = self.kwargs.get('program_id')
        if program_id:
            _verify_program_access(self.request.user, program_id)
            serializer.save(program_id=program_id)
        else:
            serializer.save()
