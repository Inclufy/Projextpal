from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import PMIComponent, PMIGovernanceBoard
from .serializers import PMIComponentSerializer, PMIGovernanceBoardSerializer


class PMIComponentViewSet(viewsets.ModelViewSet):
    serializer_class = PMIComponentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['program', 'type', 'status']
    search_fields = ['name', 'description']

    def get_queryset(self):
        queryset = PMIComponent.objects.all()
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


class PMIGovernanceBoardViewSet(viewsets.ModelViewSet):
    serializer_class = PMIGovernanceBoardSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['program', 'meeting_type']
    ordering_fields = ['meeting_date']

    def get_queryset(self):
        queryset = PMIGovernanceBoard.objects.all()
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
