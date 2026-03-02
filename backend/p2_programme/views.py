from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import P2Blueprint, P2ProgrammeProject
from .serializers import P2BlueprintSerializer, P2ProgrammeProjectSerializer


class P2BlueprintViewSet(viewsets.ModelViewSet):
    serializer_class = P2BlueprintSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['programme', 'status', 'version']
    search_fields = ['name', 'description']

    def get_queryset(self):
        queryset = P2Blueprint.objects.all()
        programme_id = self.kwargs.get('programme_id')
        if programme_id:
            queryset = queryset.filter(programme_id=programme_id)
        company = getattr(self.request.user, 'company', None)
        if company:
            queryset = queryset.filter(programme__company=company)
        return queryset

    def perform_create(self, serializer):
        programme_id = self.kwargs.get('programme_id')
        if programme_id:
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
        queryset = P2ProgrammeProject.objects.all()
        programme_id = self.kwargs.get('programme_id')
        if programme_id:
            queryset = queryset.filter(programme_id=programme_id)
        company = getattr(self.request.user, 'company', None)
        if company:
            queryset = queryset.filter(programme__company=company)
        return queryset

    def perform_create(self, serializer):
        programme_id = self.kwargs.get('programme_id')
        if programme_id:
            serializer.save(programme_id=programme_id)
        else:
            serializer.save()
