from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import MSPBenefit, BenefitRealization, MSPTranche
from .serializers import MSPBenefitSerializer, BenefitRealizationSerializer, MSPTrancheSerializer


class MSPBenefitViewSet(viewsets.ModelViewSet):
    serializer_class = MSPBenefitSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['program', 'status']
    search_fields = ['name', 'description']

    def get_queryset(self):
        queryset = MSPBenefit.objects.all()
        program_id = self.kwargs.get('program_id')
        if program_id:
            queryset = queryset.filter(program_id=program_id)
        company = getattr(self.request.user, 'company', None)
        if company:
            queryset = queryset.filter(program__company=company)
        return queryset

    def perform_create(self, serializer):
        program_id = self.kwargs.get('program_id')
        if program_id:
            serializer.save(program_id=program_id)
        else:
            serializer.save()


class BenefitRealizationViewSet(viewsets.ModelViewSet):
    serializer_class = BenefitRealizationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]

    def get_queryset(self):
        queryset = BenefitRealization.objects.all()
        benefit_pk = self.kwargs.get('pk') or self.kwargs.get('benefit_pk')
        if benefit_pk:
            queryset = queryset.filter(benefit_id=benefit_pk)
        company = getattr(self.request.user, 'company', None)
        if company:
            queryset = queryset.filter(benefit__program__company=company)
        return queryset

    def perform_create(self, serializer):
        benefit_pk = self.kwargs.get('benefit_pk')
        if benefit_pk:
            serializer.save(benefit_id=benefit_pk)
        else:
            serializer.save()


class MSPTrancheViewSet(viewsets.ModelViewSet):
    serializer_class = MSPTrancheSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['program', 'status']
    ordering_fields = ['sequence', 'start_date']

    def get_queryset(self):
        queryset = MSPTranche.objects.all()
        program_id = self.kwargs.get('program_id')
        if program_id:
            queryset = queryset.filter(program_id=program_id)
        company = getattr(self.request.user, 'company', None)
        if company:
            queryset = queryset.filter(program__company=company)
        return queryset

    def perform_create(self, serializer):
        program_id = self.kwargs.get('program_id')
        if program_id:
            serializer.save(program_id=program_id)
        else:
            serializer.save()
