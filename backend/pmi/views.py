from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from projects.models import Project

from .models import (
    PMIComponent, PMIGovernanceBoard, PMIGateDecision,
    PMIProgramCharter, PMIBenefit, PMIStakeholder, PMIRoadmapItem,
)
from .serializers import (
    PMIComponentSerializer, PMIGovernanceBoardSerializer, PMIGateDecisionSerializer,
    PMIProgramCharterSerializer, PMIBenefitSerializer, PMIStakeholderSerializer,
    PMIRoadmapItemSerializer,
)


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

    @action(detail=True, methods=['post'], url_path='decide')
    def decide(self, request, *args, **kwargs):
        """Record a governance gate decision and apply it to the component status.

        Body: { outcome: authorize|continue|hold|stop, gate?, rationale?, board? }
        This is the ONLY sanctioned path to change a component's status — the
        status field is read-only on the serializer, so a raw PATCH cannot move
        it. Returns 400 {code:invalid_outcome} if the outcome is unknown.
        """
        component = self.get_object()
        outcome = request.data.get('outcome')
        valid = dict(PMIGateDecision.OUTCOME_CHOICES)
        if outcome not in valid:
            return Response(
                {'detail': 'Unknown outcome.', 'code': 'invalid_outcome',
                 'allowed': list(valid.keys())},
                status=400,
            )

        previous = component.status
        new_status = PMIGateDecision.OUTCOME_TO_STATUS.get(outcome, previous)  # hold = unchanged

        decision = PMIGateDecision.objects.create(
            component=component,
            board_id=request.data.get('board') or None,
            outcome=outcome,
            gate=request.data.get('gate', ''),
            rationale=request.data.get('rationale', ''),
            decided_by=request.user if request.user.is_authenticated else None,
            previous_status=previous,
            new_status=new_status,
        )

        if new_status != previous:
            component.status = new_status
            component.save(update_fields=['status', 'updated_at'])

        return Response({
            'decision': PMIGateDecisionSerializer(decision).data,
            'component': PMIComponentSerializer(component).data,
        }, status=201)


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


class PMIGateDecisionViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only audit trail of gate decisions (writes go through component.decide)."""
    serializer_class = PMIGateDecisionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['component', 'outcome']

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return PMIGateDecision.objects.none()
        return PMIGateDecision.objects.select_related('component', 'board', 'decided_by').filter(
            component__program__company=company
        )


class PMIProgramCharterViewSet(viewsets.ModelViewSet):
    serializer_class = PMIProgramCharterSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['program']

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return PMIProgramCharter.objects.none()
        qs = PMIProgramCharter.objects.select_related('program').filter(program__company=company)
        program_id = self.kwargs.get('program_id')
        if program_id:
            qs = qs.filter(program_id=program_id)
        return qs

    def perform_create(self, serializer):
        program_id = self.kwargs.get('program_id') or self.request.data.get('program')
        _verify_program_access(self.request.user, program_id)
        serializer.save(program_id=program_id)


class PMIBenefitViewSet(viewsets.ModelViewSet):
    serializer_class = PMIBenefitSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['program', 'status', 'component']
    search_fields = ['name', 'description']

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return PMIBenefit.objects.none()
        qs = PMIBenefit.objects.select_related('program', 'component', 'owner').filter(program__company=company)
        program_id = self.kwargs.get('program_id')
        if program_id:
            qs = qs.filter(program_id=program_id)
        return qs

    def perform_create(self, serializer):
        program_id = self.kwargs.get('program_id') or self.request.data.get('program')
        _verify_program_access(self.request.user, program_id)
        serializer.save(program_id=program_id)


class PMIStakeholderViewSet(viewsets.ModelViewSet):
    serializer_class = PMIStakeholderSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['program', 'power', 'interest']

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return PMIStakeholder.objects.none()
        qs = PMIStakeholder.objects.select_related('program').filter(program__company=company)
        program_id = self.kwargs.get('program_id')
        if program_id:
            qs = qs.filter(program_id=program_id)
        return qs

    def perform_create(self, serializer):
        program_id = self.kwargs.get('program_id') or self.request.data.get('program')
        _verify_program_access(self.request.user, program_id)
        serializer.save(program_id=program_id)


class PMIRoadmapItemViewSet(viewsets.ModelViewSet):
    serializer_class = PMIRoadmapItemSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['program', 'status']
    ordering_fields = ['sequence', 'start_date']

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return PMIRoadmapItem.objects.none()
        qs = PMIRoadmapItem.objects.select_related('program').filter(program__company=company)
        program_id = self.kwargs.get('program_id')
        if program_id:
            qs = qs.filter(program_id=program_id)
        return qs

    def perform_create(self, serializer):
        program_id = self.kwargs.get('program_id') or self.request.data.get('program')
        _verify_program_access(self.request.user, program_id)
        serializer.save(program_id=program_id)
