from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from projects.models import Project
from programs.models import Program

from .models import HybridGovernanceConfig, HybridAdaptation, ConstituentAuthorization
from .serializers import (
    HybridGovernanceConfigSerializer, HybridAdaptationSerializer,
    ConstituentAuthorizationSerializer,
)


def _get_company(user):
    return getattr(user, 'company', None)


def _verify_programme_access(user, programme_id):
    """Verify the user's company owns the target programme."""
    company = _get_company(user)
    if not company or not Project.objects.filter(id=programme_id, company=company).exists():
        raise PermissionDenied("You do not have access to this programme.")


def _verify_program_access(user, program_id):
    """Verify the user's company owns the target Program (programs.Program).

    The constituent-authorization surfaces hang off programs.Program (not the
    legacy Project-as-programme path), so they verify against Program.
    """
    company = _get_company(user)
    if not company or not Program.objects.filter(id=program_id, company=company).exists():
        raise PermissionDenied("You do not have access to this programme.")


class HybridGovernanceConfigViewSet(viewsets.ModelViewSet):
    serializer_class = HybridGovernanceConfigSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['programme', 'primary_framework', 'is_active']

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return HybridGovernanceConfig.objects.none()
        queryset = HybridGovernanceConfig.objects.select_related('programme').filter(programme__company=company)
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
            _verify_program_access(self.request.user, programme_id)
            serializer.save(programme_id=programme_id)
        else:
            serializer.save()


class HybridAdaptationViewSet(viewsets.ModelViewSet):
    serializer_class = HybridAdaptationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['programme', 'trigger', 'response']
    ordering_fields = ['effective_date', 'created_at']

    # How each adaptive RESPONSE shifts the programme's control_level
    # (0 = fully adaptive/agile, 100 = fully predictive/controlled). This is
    # what makes a HybridAdaptation behaviour-changing instead of free text:
    # applying it mutates the active config's governance_structure.
    RESPONSE_CONTROL_DELTA = {
        'increase_agility': -20,
        'increase_control': +20,
        'scale_up': +10,
        'scale_down': -10,
        'pivot': -15,
        # rebalance is handled specially (snap to 50)
    }

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return HybridAdaptation.objects.none()
        queryset = HybridAdaptation.objects.select_related('programme', 'approved_by').filter(programme__company=company)
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
            _verify_program_access(self.request.user, programme_id)
            serializer.save(programme_id=programme_id)
        else:
            serializer.save()

    @action(detail=True, methods=['post'])
    def apply(self, request, pk=None, program_id=None, programme_id=None):
        """Apply this adaptation to the programme's ACTIVE governance config.

        Instead of being a free-text note, applying an adaptation mutates the
        active HybridGovernanceConfig.governance_structure['control_level']
        according to the response — moving the whole programme towards more
        control (predictive) or more agility (adaptive). Returns the new level.
        """
        adaptation = self.get_object()
        config = (
            HybridGovernanceConfig.objects
            .filter(programme=adaptation.programme, is_active=True)
            .order_by('-created_at')
            .first()
        )
        if not config:
            return Response(
                {'detail': 'No active governance config to adapt.', 'code': 'no_active_config'},
                status=409,
            )

        structure = dict(config.governance_structure or {})
        current = structure.get('control_level', 50)
        try:
            current = int(current)
        except (TypeError, ValueError):
            current = 50

        if adaptation.response == 'rebalance':
            new_level = 50
        else:
            new_level = current + self.RESPONSE_CONTROL_DELTA.get(adaptation.response, 0)
        new_level = max(0, min(100, new_level))

        structure['control_level'] = new_level
        structure.setdefault('history', [])
        structure['history'].append({
            'adaptation_id': str(adaptation.id),
            'trigger': adaptation.trigger,
            'response': adaptation.response,
            'from': current,
            'to': new_level,
            'at': timezone.now().isoformat(),
        })
        config.governance_structure = structure
        config.save(update_fields=['governance_structure', 'updated_at'])

        if not adaptation.approved_by_id:
            adaptation.approved_by = request.user
            adaptation.save(update_fields=['approved_by', 'updated_at'])

        return Response({
            'config_id': str(config.id),
            'control_level': new_level,
            'previous_level': current,
            'response': adaptation.response,
        })


class ConstituentAuthorizationViewSet(viewsets.ModelViewSet):
    """Constituent projects authorized under their config-assigned governance
    mode (backlog #39). The `authorize` gate branches on `governance_mode`."""

    serializer_class = ConstituentAuthorizationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['programme', 'project', 'governance_mode', 'status']
    ordering_fields = ['created_at', 'status']

    def get_queryset(self):
        company = _get_company(self.request.user)
        if not company:
            return ConstituentAuthorization.objects.none()
        queryset = (
            ConstituentAuthorization.objects
            .select_related('programme', 'project', 'authorized_by')
            .filter(programme__company=company)
        )
        program_id = self.kwargs.get('program_id') or self.kwargs.get('programme_id')
        if program_id:
            queryset = queryset.filter(programme_id=program_id)
        return queryset

    def perform_create(self, serializer):
        program_id = self.kwargs.get('program_id') or self.kwargs.get('programme_id')
        if program_id:
            _verify_program_access(self.request.user, program_id)
            serializer.save(programme_id=program_id)
        else:
            serializer.save()

    @action(detail=True, methods=['post'])
    def stage_gate(self, request, pk=None, program_id=None, programme_id=None):
        """Record a stage-gate review PASS (predictive precondition).

        Only meaningful for predictive / blend constituents; adaptive
        constituents use checkpoints, not stage gates.
        """
        ca = self.get_object()
        if ca.governance_mode == 'adaptive':
            return Response(
                {
                    'detail': (
                        'Adaptive constituents are governed by cadence '
                        'checkpoints, not stage gates.'
                    ),
                    'code': 'stage_gate_not_applicable',
                    'governance_mode': ca.governance_mode,
                },
                status=409,
            )
        ca.stage_gate_passed = True
        ca.stage_gate_notes = request.data.get('notes', ca.stage_gate_notes)
        ca.save(update_fields=['stage_gate_passed', 'stage_gate_notes', 'updated_at'])
        return Response(self.get_serializer(ca).data)

    @action(detail=True, methods=['post'])
    def checkpoint(self, request, pk=None, program_id=None, programme_id=None):
        """Log a cadence checkpoint (adaptive precondition).

        Only meaningful for adaptive / blend constituents; predictive
        constituents advance through stage gates, not checkpoints.
        """
        ca = self.get_object()
        if ca.governance_mode == 'predictive':
            return Response(
                {
                    'detail': (
                        'Predictive constituents advance through stage gates, '
                        'not cadence checkpoints.'
                    ),
                    'code': 'checkpoint_not_applicable',
                    'governance_mode': ca.governance_mode,
                },
                status=409,
            )
        ca.last_checkpoint_at = timezone.now()
        ca.save(update_fields=['last_checkpoint_at', 'updated_at'])
        return Response(self.get_serializer(ca).data)

    @action(detail=True, methods=['post'])
    def authorize(self, request, pk=None, program_id=None, programme_id=None):
        """Authorize the constituent under its config-assigned governance mode.

        predictive -> a stage-gate review must have PASSED (409 stage_gate_required)
        adaptive   -> a checkpoint within cadence_days (409 cadence_checkpoint_required)
        blend      -> BOTH (409 lists whichever is missing)

        On success: status='authorized', authorized_by/at recorded.
        """
        ca = self.get_object()
        if ca.status == 'authorized':
            return Response(
                {'detail': 'Constituent is already authorized.', 'code': 'already_authorized'},
                status=409,
            )

        mode = ca.governance_mode
        missing = []
        if mode in ('predictive', 'blend') and not ca.stage_gate_passed:
            missing.append('stage_gate')
        if mode in ('adaptive', 'blend') and not ca.checkpoint_is_current():
            missing.append('cadence_checkpoint')

        if missing:
            # one canonical code per single-mode gate; blend reports both blockers
            code = (
                'stage_gate_required' if missing == ['stage_gate']
                else 'cadence_checkpoint_required' if missing == ['cadence_checkpoint']
                else 'governance_gates_unmet'
            )
            return Response(
                {
                    'detail': (
                        f"Constituent governed as '{mode}' cannot be authorized "
                        f"until: {', '.join(missing)}."
                    ),
                    'code': code,
                    'governance_mode': mode,
                    'blockers': missing,
                },
                status=409,
            )

        ca.status = 'authorized'
        ca.authorized_by = request.user
        ca.authorized_at = timezone.now()
        ca.save(update_fields=['status', 'authorized_by', 'authorized_at', 'updated_at'])
        return Response(self.get_serializer(ca).data)

    @action(detail=False, methods=['get'])
    def rollup(self, request, program_id=None, programme_id=None):
        """Programme-level roll-up: constituents grouped by status + mode."""
        qs = self.get_queryset()
        by_status = {row['status']: row['n'] for row in qs.values('status').annotate(n=Count('id'))}
        by_mode = {row['governance_mode']: row['n'] for row in qs.values('governance_mode').annotate(n=Count('id'))}
        return Response({
            'total': qs.count(),
            'authorized': by_status.get('authorized', 0),
            'by_status': by_status,
            'by_governance_mode': by_mode,
        })
