from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count
from django_filters.rest_framework import DjangoFilterBackend
from programs.models import Program

from .models import P2Blueprint, P2ProgrammeProject, P2ProgrammeBoardDecision
from .serializers import (
    P2BlueprintSerializer, P2ProgrammeProjectSerializer,
    P2ProgrammeBoardDecisionSerializer,
)


def _get_company(user):
    return getattr(user, 'company', None)


def _verify_programme_access(user, programme_id):
    """Verify the user's company owns the target programme.

    Previously queried projects.Project by id — but P2Blueprint/P2ProgrammeProject
    .programme is a FK to programs.Program. The mismatch denied every legitimate
    nested create and risked a cross-tenant false-allow when a Project of another
    tenant shared the id.
    """
    company = _get_company(user)
    if not company or not Program.objects.filter(id=programme_id, company=company).exists():
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
        # Accept either kwarg name during the transition from
        # `programme_id` (legacy) to `program_id` (canonical).
        programme_id = self.kwargs.get('program_id') or self.kwargs.get('programme_id')
        if programme_id:
            queryset = queryset.filter(programme_id=programme_id)
        return queryset

    def perform_create(self, serializer):
        # Accept either kwarg name during the transition from
        # `programme_id` (legacy) to `program_id` (canonical).
        programme_id = self.kwargs.get('program_id') or self.kwargs.get('programme_id')
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
        # Accept either kwarg name during the transition from
        # `programme_id` (legacy) to `program_id` (canonical).
        programme_id = self.kwargs.get('program_id') or self.kwargs.get('programme_id')
        if programme_id:
            queryset = queryset.filter(programme_id=programme_id)
        return queryset

    def perform_create(self, serializer):
        # Accept either kwarg name during the transition from
        # `programme_id` (legacy) to `program_id` (canonical).
        programme_id = self.kwargs.get('program_id') or self.kwargs.get('programme_id')
        if programme_id:
            _verify_programme_access(self.request.user, programme_id)
            serializer.save(programme_id=programme_id)
        else:
            serializer.save()

    @action(detail=True, methods=['post'], url_path='decide')
    def decide(self, request, *args, **kwargs):
        """Record a programme-board decision and apply it to the project status.

        Body: { decision: authorize|start|stop|defer, gate?, rationale? }
        This is the ONLY sanctioned path to change a constituent project's status
        (the status field is read-only on the serializer, so a raw PATCH cannot
        move it). `authorize` requires the project to reference a Blueprint — a
        project cannot be authorized outside the programme's target operating
        model (409 {code: blueprint_required}). Returns 400 {code: invalid_decision}
        if the decision is unknown.
        """
        project = self.get_object()
        decision = request.data.get('decision')
        valid = dict(P2ProgrammeBoardDecision.DECISION_CHOICES)
        if decision not in valid:
            return Response(
                {'detail': 'Unknown decision.', 'code': 'invalid_decision',
                 'allowed': list(valid.keys())},
                status=400,
            )

        # Blueprint enforcement: a project may only be authorized once it is
        # anchored to the operating-model Blueprint it contributes to.
        if decision == 'authorize' and project.blueprint_id is None:
            return Response(
                {'detail': 'Project must reference a Blueprint before it can be authorized.',
                 'code': 'blueprint_required',
                 'blockers': ['No Blueprint linked — set the operating-model Blueprint first.']},
                status=409,
            )

        previous = project.status
        new_status = P2ProgrammeBoardDecision.DECISION_TO_STATUS.get(decision, previous)  # defer = unchanged

        record = P2ProgrammeBoardDecision.objects.create(
            programme=project.programme,
            project=project,
            decision=decision,
            gate=request.data.get('gate', ''),
            rationale=request.data.get('rationale', ''),
            decided_by=request.user if request.user.is_authenticated else None,
            previous_status=previous,
            new_status=new_status,
        )

        if new_status != previous:
            project.status = new_status
            project.save(update_fields=['status', 'updated_at'])

        return Response({
            'decision': P2ProgrammeBoardDecisionSerializer(record).data,
            'project': P2ProgrammeProjectSerializer(project).data,
        }, status=201)

    @action(detail=False, methods=['get'], url_path='rollup')
    def rollup(self, request, *args, **kwargs):
        """Constituent-project status roll-up for the programme dashboard."""
        qs = self.filter_queryset(self.get_queryset())
        by_status = {row['status']: row['n'] for row in qs.values('status').annotate(n=Count('id'))}
        total = sum(by_status.values())
        authorized = by_status.get('approved', 0) + by_status.get('active', 0) + by_status.get('completed', 0)
        return Response({
            'total': total,
            'by_status': by_status,
            'authorized': authorized,
            'with_blueprint': qs.filter(blueprint__isnull=False).count(),
        })


class P2ProgrammeBoardDecisionViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only audit trail of programme-board decisions (writes go through project.decide)."""
    serializer_class = P2ProgrammeBoardDecisionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['programme', 'project', 'decision']

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return P2ProgrammeBoardDecision.objects.none()
        return P2ProgrammeBoardDecision.objects.select_related('programme', 'project', 'decided_by').filter(
            programme__company=company
        )
