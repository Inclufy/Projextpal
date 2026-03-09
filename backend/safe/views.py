from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from projects.models import Project

from .models import AgileReleaseTrain, ARTSync, ProgramIncrement, PIObjective
from .serializers import (
    AgileReleaseTrainSerializer, ARTSyncSerializer,
    ProgramIncrementSerializer, PIObjectiveSerializer
)


def _get_company(user):
    return getattr(user, 'company', None)


def _verify_program_access(user, program_id):
    """Verify the user's company owns the target program."""
    company = _get_company(user)
    if not company or not Project.objects.filter(id=program_id, company=company).exists():
        raise PermissionDenied("You do not have access to this program.")


class AgileReleaseTrainViewSet(viewsets.ModelViewSet):
    serializer_class = AgileReleaseTrainSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['program', 'is_active']
    search_fields = ['name', 'description']

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return AgileReleaseTrain.objects.none()
        queryset = AgileReleaseTrain.objects.select_related('program', 'rte').prefetch_related('syncs').filter(program__company=company)
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


class ARTSyncViewSet(viewsets.ModelViewSet):
    serializer_class = ARTSyncSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return ARTSync.objects.none()
        queryset = ARTSync.objects.select_related('art', 'art__program').filter(art__program__company=company)
        program_id = self.kwargs.get('program_id')
        art_pk = self.kwargs.get('pk') or self.kwargs.get('art_pk')
        if program_id and art_pk:
            queryset = queryset.filter(art__program_id=program_id, art_id=art_pk)
        return queryset

    def perform_create(self, serializer):
        art_pk = self.kwargs.get('art_pk')
        if art_pk:
            serializer.save(art_id=art_pk)
        else:
            serializer.save()


class ProgramIncrementViewSet(viewsets.ModelViewSet):
    serializer_class = ProgramIncrementSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['program', 'status']
    ordering_fields = ['start_date', 'created_at']

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return ProgramIncrement.objects.none()
        queryset = ProgramIncrement.objects.select_related('program').prefetch_related('objectives').filter(program__company=company)
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


class PIObjectiveViewSet(viewsets.ModelViewSet):
    serializer_class = PIObjectiveSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['committed', 'achieved']

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return PIObjective.objects.none()
        queryset = PIObjective.objects.select_related('pi', 'pi__program').filter(pi__program__company=company)
        pi_id = self.kwargs.get('pi_id')
        if pi_id:
            queryset = queryset.filter(pi_id=pi_id)
        return queryset

    def perform_create(self, serializer):
        pi_id = self.kwargs.get('pi_id')
        if pi_id:
            serializer.save(pi_id=pi_id)
        else:
            serializer.save()
