from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from projects.models import Project

from .models import MSPBenefit, BenefitRealization, MSPTranche
from .serializers import MSPBenefitSerializer, BenefitRealizationSerializer, MSPTrancheSerializer


def _get_company(user):
    return getattr(user, 'company', None)


def _verify_program_access(user, program_id):
    """Verify the user's company owns the target program."""
    company = _get_company(user)
    if not company or not Project.objects.filter(id=program_id, company=company).exists():
        raise PermissionDenied("You do not have access to this program.")


class MSPBenefitViewSet(viewsets.ModelViewSet):
    serializer_class = MSPBenefitSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['program', 'status']
    search_fields = ['name', 'description']

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return MSPBenefit.objects.none()
        queryset = MSPBenefit.objects.select_related('program', 'owner').prefetch_related('realizations').filter(program__company=company)
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


class BenefitRealizationViewSet(viewsets.ModelViewSet):
    serializer_class = BenefitRealizationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return BenefitRealization.objects.none()
        queryset = BenefitRealization.objects.select_related('benefit', 'benefit__program').filter(benefit__program__company=company)
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
        company = _get_company(self.request.user)
        if not company:
            return MSPTranche.objects.none()
        queryset = MSPTranche.objects.select_related('program').filter(program__company=company)
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
