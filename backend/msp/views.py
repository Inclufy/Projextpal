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
        company = getattr(self.request.user, 'company', None)
        if not company:
            return MSPBenefit.objects.none()
        queryset = MSPBenefit.objects.filter(program__company=company)
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


class BenefitRealizationViewSet(viewsets.ModelViewSet):
    serializer_class = BenefitRealizationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]

    def get_queryset(self):
        company = getattr(self.request.user, 'company', None)
        if not company:
            return BenefitRealization.objects.none()
        queryset = BenefitRealization.objects.filter(benefit__program__company=company)
        benefit_pk = self.kwargs.get('pk') or self.kwargs.get('benefit_pk')
        if benefit_pk:
            queryset = queryset.filter(benefit_id=benefit_pk)
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
        company = getattr(self.request.user, 'company', None)
        if not company:
            return MSPTranche.objects.none()
        queryset = MSPTranche.objects.filter(program__company=company)
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
