from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import AgileReleaseTrain, ARTSync, ProgramIncrement, PIObjective
from .serializers import (
    AgileReleaseTrainSerializer, ARTSyncSerializer,
    ProgramIncrementSerializer, PIObjectiveSerializer
)


class AgileReleaseTrainViewSet(viewsets.ModelViewSet):
    serializer_class = AgileReleaseTrainSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['program', 'is_active']
    search_fields = ['name', 'description']

    def get_queryset(self):
        queryset = AgileReleaseTrain.objects.all()
        program_id = self.kwargs.get('program_id')
        if program_id:
            queryset = queryset.filter(program_id=program_id)
        return queryset

    def perform_create(self, serializer):
        program_id = self.kwargs.get('program_id')
        if program_id:
            serializer.save(program_id=program_id)
        else:
            serializer.save()


class ARTSyncViewSet(viewsets.ModelViewSet):
    serializer_class = ARTSyncSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]

    def get_queryset(self):
        queryset = ARTSync.objects.all()
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
        queryset = ProgramIncrement.objects.all()
        program_id = self.kwargs.get('program_id')
        if program_id:
            queryset = queryset.filter(program_id=program_id)
        return queryset

    def perform_create(self, serializer):
        program_id = self.kwargs.get('program_id')
        if program_id:
            serializer.save(program_id=program_id)
        else:
            serializer.save()


class PIObjectiveViewSet(viewsets.ModelViewSet):
    serializer_class = PIObjectiveSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['committed', 'achieved']

    def get_queryset(self):
        queryset = PIObjective.objects.all()
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
