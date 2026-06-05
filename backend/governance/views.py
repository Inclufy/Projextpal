from rest_framework import viewsets, filters, status as drf_status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    Portfolio, GovernanceBoard, BoardMember, GovernanceStakeholder,
    Decision, Meeting, DecisionAuditLog, MeetingAction,
    DecisionVote, ComponentFunding,
)
from .serializers import (
    PortfolioSerializer, GovernanceBoardSerializer,
    BoardMemberSerializer, GovernanceStakeholderSerializer,
    DecisionSerializer, MeetingSerializer, DecisionAuditLogSerializer,
    MeetingActionSerializer, DecisionVoteSerializer, ComponentFundingSerializer,
)


class PortfolioViewSet(viewsets.ModelViewSet):
    queryset = Portfolio.objects.all()
    serializer_class = PortfolioSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'company']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    
    def get_queryset(self):
        user = self.request.user
        all_tenants = self.request.query_params.get('all_tenants') in ('1', 'true', 'yes')
        company = getattr(user, 'company', None)
        if user.role == 'superadmin':
            if all_tenants or not company:
                return Portfolio.objects.all()
            return Portfolio.objects.filter(company=company)
        if not company:
            return Portfolio.objects.none()
        return Portfolio.objects.filter(company=company)

    def perform_create(self, serializer):
        user = self.request.user
        company = getattr(user, 'company', None)
        # Always stamp the owner from the authenticated request so portfolios
        # aren't orphaned. Company is attached when available.
        if company:
            serializer.save(company=company, owner=user)
        else:
            serializer.save(owner=user)

    def perform_update(self, serializer):
        user = self.request.user
        company = getattr(user, 'company', None)
        if company:
            serializer.save(company=company)
        else:
            serializer.save()


class GovernanceBoardViewSet(viewsets.ModelViewSet):
    queryset = GovernanceBoard.objects.all()
    serializer_class = GovernanceBoardSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['board_type', 'is_active']
    search_fields = ['name', 'description']

    def get_queryset(self):
        # P0 fix — was returning all rows globally (cross-tenant leak).
        from django.db.models import Q
        user = self.request.user
        if not user.is_authenticated:
            return GovernanceBoard.objects.none()
        if getattr(user, 'role', None) == 'superadmin' or getattr(user, 'is_superuser', False):
            return GovernanceBoard.objects.all()
        company = getattr(user, 'company', None)
        if not company:
            return GovernanceBoard.objects.none()
        return GovernanceBoard.objects.filter(
            Q(portfolio__company=company)
            | Q(program__company=company)
            | Q(project__company=company)
        ).distinct()


class BoardMemberViewSet(viewsets.ModelViewSet):
    queryset = BoardMember.objects.all()
    serializer_class = BoardMemberSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['board', 'role', 'is_active']

    def get_queryset(self):
        # P0 fix — was returning all rows globally.
        from django.db.models import Q
        user = self.request.user
        if not user.is_authenticated:
            return BoardMember.objects.none()
        all_tenants = self.request.query_params.get('all_tenants') in ('1', 'true', 'yes')
        company = getattr(user, 'company', None)
        is_superadmin = getattr(user, 'role', None) == 'superadmin' or getattr(user, 'is_superuser', False)
        if is_superadmin and (all_tenants or not company):
            return BoardMember.objects.all()
        if not company:
            return BoardMember.objects.none()
        return BoardMember.objects.filter(
            Q(board__portfolio__company=company)
            | Q(board__program__company=company)
            | Q(board__project__company=company)
        ).distinct()


class GovernanceStakeholderViewSet(viewsets.ModelViewSet):
    queryset = GovernanceStakeholder.objects.all()
    serializer_class = GovernanceStakeholderSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['role', 'influence_level', 'interest_level', 'is_active']

    def get_queryset(self):
        # P0 fix — was returning all rows globally.
        user = self.request.user
        if not user.is_authenticated:
            return GovernanceStakeholder.objects.none()
        if getattr(user, 'role', None) == 'superadmin' or getattr(user, 'is_superuser', False):
            return GovernanceStakeholder.objects.all()
        company = getattr(user, 'company', None)
        if not company:
            return GovernanceStakeholder.objects.none()
        return GovernanceStakeholder.objects.filter(portfolio__company=company)


# AI Report Generation
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status as http_status

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_ai_report(request):
    """Generate an AI-powered report."""
    from .ai_reports import generate_report
    from .models import Portfolio, GovernanceBoard, GovernanceStakeholder
    from django.contrib.auth import get_user_model
    
    User = get_user_model()
    report_id = request.data.get('report_id')
    
    if not report_id:
        return Response({"error": "report_id is required"}, status=http_status.HTTP_400_BAD_REQUEST)
    
    user = request.user
    company = getattr(user, 'company', None)
    
    # Gather context data
    portfolios = Portfolio.objects.filter(company=company) if company else Portfolio.objects.none()
    portfolio_names = ", ".join([p.name for p in portfolios]) or "No portfolios"
    
    try:
        from projects.models import Project
        projects = Project.objects.filter(company=company) if company else Project.objects.none()
        project_count = projects.count()
        active_projects = projects.filter(status='active').count()
    except:
        project_count = 0
        active_projects = 0
    
    try:
        from programs.models import Program
        program_count = Program.objects.filter(company=company).count() if company else 0
    except:
        program_count = 0
    
    board_count = GovernanceBoard.objects.filter(portfolio__company=company).count() if company else 0
    stakeholder_count = GovernanceStakeholder.objects.filter(portfolio__company=company).count() if company else 0
    team_count = User.objects.filter(company=company).count() if company else 0
    
    context = {
        "portfolios": portfolio_names,
        "program_count": program_count,
        "project_count": project_count,
        "active_projects": active_projects,
        "company_name": company.name if company else "Unknown",
        "board_count": board_count,
        "stakeholder_count": stakeholder_count,
        "team_count": team_count,
        "user_name": user.get_full_name() or user.email,
        "user_role": user.role,
    }
    
    report = generate_report(report_id, context, company=company)
    return Response(report)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_generate_text(request):
    """
    AI text generation endpoint (governance / programs / projects helpers).

    Robustness rules to avoid Cloudflare 502s during live demos:
      * Always return HTTP 200 with a structured payload — never let an
        upstream LLM failure bubble up as a 502/504 to the edge. The frontend
        treats a missing `response` field as "no AI suggestion" and falls
        back to canned suggestions (see AISmartHelper.tsx).
      * Hard-cap the upstream call at 25s — well under Cloudflare's ~100s
        edge timeout, so the origin always answers in time even under jitter.
      * Cap output at 800 tokens. Demo prompts ("Draft a Q2 steering agenda")
        comfortably fit and finish well within the 25s budget.
    """
    import logging
    import os
    import requests as http_requests
    from django.conf import settings

    logger = logging.getLogger(__name__)

    prompt = request.data.get('prompt', '')
    if not prompt:
        return Response({"error": "prompt is required"}, status=http_status.HTTP_400_BAD_REQUEST)

    api_key = getattr(settings, 'OPENAI_API_KEY', None) or os.getenv('OPENAI_API_KEY')
    if not api_key or api_key.startswith('sk-test') or api_key.startswith('sk-your') or len(api_key) < 20:
        logger.warning(
            "ai_generate_text: OPENAI_API_KEY not configured or placeholder (%s...)",
            (api_key[:10] if api_key else 'None'),
        )
        # Return 200 with success:false so the frontend's graceful fallback
        # path runs (it checks `data.response` and falls back if missing).
        # This keeps Cloudflare green and the demo flowing.
        return Response({
            "success": False,
            "response": None,
            "error": "AI generation is temporarily unavailable. Manual entry available below.",
            "available": False,
        })

    try:
        api_response = http_requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json',
            },
            json={
                'model': 'gpt-4o-mini',
                'messages': [
                    {'role': 'system', 'content': 'You are a helpful project management expert. Respond concisely and professionally.'},
                    {'role': 'user', 'content': prompt},
                ],
                'temperature': 0.7,
                'max_tokens': 800,
            },
            # 25s keeps us comfortably under Cloudflare's ~100s edge cap and
            # under any reasonable gunicorn worker timeout.
            timeout=25,
        )
        api_response.raise_for_status()
        data = api_response.json()
        content = (data.get('choices') or [{}])[0].get('message', {}).get('content', '').strip()
        if not content:
            logger.warning("ai_generate_text: empty content from OpenAI")
            return Response({
                "success": False,
                "response": None,
                "error": "AI returned no content. Please try again or use a fallback suggestion.",
            })
        return Response({"success": True, "response": content})

    except http_requests.exceptions.Timeout:
        logger.warning("ai_generate_text: OpenAI API timeout (>25s)")
        return Response({
            "success": False,
            "response": None,
            "error": "AI generation timed out. Please try a shorter prompt or use a fallback suggestion.",
        })
    except http_requests.exceptions.RequestException as e:
        logger.error("ai_generate_text: OpenAI API error: %s", e)
        return Response({
            "success": False,
            "response": None,
            "error": "AI service is temporarily unreachable. Manual entry available below.",
        })
    except Exception as e:
        # Catch-all so the endpoint NEVER 5xx's to Cloudflare during a demo.
        logger.exception("ai_generate_text: unexpected failure: %s", type(e).__name__)
        return Response({
            "success": False,
            "response": None,
            "error": "AI generation failed unexpectedly. Manual entry available below.",
        })


# ---------------------------------------------------------------------------
# Decision + Meeting ViewSets
# Real implementations backed by governance.Decision and governance.Meeting
# models. Filterable by program so the admin portal Programme Board UI can
# scope its lists per-programme.
# ---------------------------------------------------------------------------
class DecisionViewSet(viewsets.ModelViewSet):
    serializer_class = DecisionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    # `board` and `meeting` are from governance migration 0005; `risk` is
    # from migration 0007. Adding them to filterset_fields lets the
    # Decisions.tsx page and BoardDetail.tsx filter via `?board=<id>` /
    # `?meeting=<id>` / `?risk=<id>` query strings.
    filterset_fields = ['program', 'board', 'meeting', 'risk', 'status', 'impact']
    search_fields = ['title', 'description']
    ordering_fields = ['decided_at', 'created_at']

    def get_queryset(self):
        # P0 cross-tenant fix — was returning Decision.objects.all() when the
        # requesting user had no company (cross-tenant leak). Superadmin
        # defaults to own-company; cross-tenant view via ?all_tenants=1.
        #
        # Tenant scoping now reaches across all three parent FKs (program /
        # board / meeting) because a Decision can live at any of those levels
        # (program is nullable; board-level and meeting-level decisions have
        # no program). The original `program__company` filter excluded those.
        from django.db.models import Q
        user = self.request.user
        if not user.is_authenticated:
            return Decision.objects.none()
        all_tenants = self.request.query_params.get('all_tenants') in ('1', 'true', 'yes')
        company = getattr(user, 'company', None)
        is_superadmin = getattr(user, 'role', None) == 'superadmin' or getattr(user, 'is_superuser', False)
        if is_superadmin and (all_tenants or not company):
            return Decision.objects.all()
        if not company:
            return Decision.objects.none()
        return Decision.objects.filter(
            Q(program__company=company)
            | Q(board__portfolio__company=company)
            | Q(board__program__company=company)
            | Q(board__project__company=company)
            | Q(meeting__program__company=company)
        ).distinct()

    def perform_create(self, serializer):
        # Default decided_by to the requester if absent so demo POSTs that
        # only carry program+title+description still create a valid record.
        if not serializer.validated_data.get('decided_by'):
            serializer.save(decided_by=self.request.user)
        else:
            serializer.save()

    def update(self, request, *args, **kwargs):
        """A Decision becomes append-only once its outcome has been applied —
        a governance audit invariant (P0-1). Block any edit after applied_at."""
        instance = self.get_object()
        if instance.applied_at is not None:
            return Response(
                {
                    'detail': 'This decision has been applied and is now append-only; it cannot be edited.',
                    'code': 'decision_applied',
                },
                status=drf_status.HTTP_409_CONFLICT,
            )
        return super().update(request, *args, **kwargs)

    def _target_in_company(self, target, user):
        if getattr(user, 'role', None) == 'superadmin' or getattr(user, 'is_superuser', False):
            return True
        company_id = getattr(user, 'company_id', None)
        return company_id is not None and getattr(target, 'company_id', None) == company_id

    @action(detail=True, methods=['post'])
    def apply(self, request, pk=None):
        """Approve the decision and enact its outcome on the linked component.

        authorize/continue → component active; hold → on_hold; stop → terminate.
        Writes an immutable audit row, stamps applied_at (making the decision
        append-only), and rejects re-application + cross-tenant targets.
        """
        decision = self.get_object()

        if decision.applied_at is not None:
            return Response(
                {'detail': 'This decision has already been applied.', 'code': 'already_applied'},
                status=drf_status.HTTP_409_CONFLICT,
            )

        # Allow the caller to set outcome at apply-time if not already on the record.
        outcome = request.data.get('outcome') or decision.outcome
        if outcome not in dict(Decision.OUTCOME_CHOICES):
            return Response(
                {'detail': 'A valid outcome (authorize/continue/hold/stop) is required to apply this decision.',
                 'code': 'outcome_required'},
                status=drf_status.HTTP_400_BAD_REQUEST,
            )

        kind, target = decision.get_target()
        if target is None:
            return Response(
                {'detail': 'This decision has no linked component to authorize.',
                 'code': 'target_required'},
                status=drf_status.HTTP_400_BAD_REQUEST,
            )

        if not self._target_in_company(target, request.user):
            return Response(
                {'detail': 'You do not have access to the target component.',
                 'code': 'cross_tenant_denied'},
                status=drf_status.HTTP_403_FORBIDDEN,
            )

        new_status = decision.target_status_for_outcome(kind)
        if new_status is None:
            return Response(
                {'detail': f"Outcome '{outcome}' cannot be applied to a {kind}.",
                 'code': 'invalid_outcome_for_target'},
                status=drf_status.HTTP_400_BAD_REQUEST,
            )

        # Binding-vote gate: a board-level decision can only be applied once the
        # board's quorum of approve votes is reached (P2-Governance #44).
        quorum_ok, quorum_blockers = decision.quorum_check()
        if not quorum_ok:
            return Response(
                {'detail': 'This board decision has not met its quorum and cannot be applied.',
                 'code': 'quorum_not_met',
                 'blockers': quorum_blockers,
                 'tally': decision.vote_tally()},
                status=drf_status.HTTP_409_CONFLICT,
            )

        previous_status = getattr(target, 'status', '')

        from django.db import transaction
        with transaction.atomic():
            # Mutate the component.
            target.status = new_status
            target.save(update_fields=['status', 'updated_at'] if _has_field(target, 'updated_at') else ['status'])

            # Stamp + approve the decision (now append-only).
            decision.outcome = outcome
            decision.status = 'approved'
            decision.applied_at = timezone.now()
            if not decision.decided_at:
                decision.decided_at = decision.applied_at
            if not decision.decided_by_id:
                decision.decided_by = request.user
            decision.save(update_fields=['outcome', 'status', 'applied_at', 'decided_at', 'decided_by', 'updated_at'])

            # Immutable audit row.
            DecisionAuditLog.objects.create(
                decision=decision,
                decision_title=decision.title,
                outcome=outcome,
                target_kind=kind,
                target_id=str(target.id),
                previous_status=previous_status or '',
                new_status=new_status,
                applied_by=request.user,
                note=request.data.get('note', ''),
            )

        return Response(DecisionSerializer(decision).data, status=drf_status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def audit(self, request, pk=None):
        """Return the immutable audit trail for this decision."""
        decision = self.get_object()
        logs = decision.audit_logs.all()
        return Response(DecisionAuditLogSerializer(logs, many=True).data)

    @action(detail=True, methods=['get', 'post'])
    def votes(self, request, pk=None):
        """GET the votes + tally; POST to cast/update the requester's vote.

        POST body: {vote: approve|reject|abstain, rationale?}. Votes can't be
        cast on an already-applied (append-only) decision."""
        decision = self.get_object()
        if request.method == 'POST':
            if decision.applied_at is not None:
                return Response(
                    {'detail': 'This decision has been applied and is append-only; votes are closed.',
                     'code': 'decision_applied'},
                    status=drf_status.HTTP_409_CONFLICT,
                )
            vote = request.data.get('vote')
            if vote not in dict(DecisionVote.VOTE_CHOICES):
                return Response(
                    {'detail': 'A valid vote (approve/reject/abstain) is required.',
                     'code': 'invalid_vote'},
                    status=drf_status.HTTP_400_BAD_REQUEST,
                )
            DecisionVote.objects.update_or_create(
                decision=decision, voter=request.user,
                defaults={'vote': vote, 'rationale': request.data.get('rationale', '')},
            )
        votes = decision.votes.select_related('voter').all()
        quorum_ok, blockers = decision.quorum_check()
        return Response({
            'votes': DecisionVoteSerializer(votes, many=True).data,
            'tally': decision.vote_tally(),
            'quorum': decision.board.quorum if decision.board else 0,
            'quorum_met': quorum_ok,
            'blockers': blockers,
        })


def _has_field(instance, field_name):
    return any(f.name == field_name for f in instance._meta.fields)


class MeetingViewSet(viewsets.ModelViewSet):
    serializer_class = MeetingSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    # `board` is new (governance migration 0006). Adding it to filterset_fields
    # lets BoardDetail.tsx query `?board=<id>` precisely instead of pulling all
    # program-scoped meetings and filtering client-side.
    filterset_fields = ['program', 'board', 'type', 'status']
    search_fields = ['title', 'agenda', 'minutes']
    ordering_fields = ['scheduled_at', 'created_at']

    def get_queryset(self):
        # P0 cross-tenant fix — was returning Meeting.objects.all() when the
        # requesting user had no company (cross-tenant leak). Superadmin
        # defaults to own-company; cross-tenant view via ?all_tenants=1.
        #
        # Tenant scoping reaches across both parent FKs (program / board)
        # because a Meeting can live at either level — board-level meetings
        # (e.g. Steering Committee) have no program. Mirrors DecisionViewSet.
        from django.db.models import Q
        user = self.request.user
        if not user.is_authenticated:
            return Meeting.objects.none()
        all_tenants = self.request.query_params.get('all_tenants') in ('1', 'true', 'yes')
        company = getattr(user, 'company', None)
        is_superadmin = getattr(user, 'role', None) == 'superadmin' or getattr(user, 'is_superuser', False)
        if is_superadmin and (all_tenants or not company):
            return Meeting.objects.all()
        if not company:
            return Meeting.objects.none()
        return Meeting.objects.filter(
            Q(program__company=company)
            | Q(board__portfolio__company=company)
            | Q(board__program__company=company)
            | Q(board__project__company=company)
        ).distinct()

    def perform_create(self, serializer):
        if not serializer.validated_data.get('facilitator'):
            serializer.save(facilitator=self.request.user)
        else:
            serializer.save()


class MeetingActionViewSet(viewsets.ModelViewSet):
    """Tracked follow-up actions from governance meetings (P0-2).

    Closing an action (status → done/cancelled) stamps closed_at; re-opening
    clears it. Tenant scoping reaches through the parent Meeting's program/board.
    """
    serializer_class = MeetingActionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['meeting', 'status', 'owner']
    search_fields = ['description']
    ordering_fields = ['due_date', 'created_at', 'status']

    def get_queryset(self):
        from django.db.models import Q
        user = self.request.user
        if not user.is_authenticated:
            return MeetingAction.objects.none()
        all_tenants = self.request.query_params.get('all_tenants') in ('1', 'true', 'yes')
        company = getattr(user, 'company', None)
        is_superadmin = getattr(user, 'role', None) == 'superadmin' or getattr(user, 'is_superuser', False)
        if is_superadmin and (all_tenants or not company):
            return MeetingAction.objects.all()
        if not company:
            return MeetingAction.objects.none()
        # Scope through the parent Meeting's program/board, same as MeetingViewSet.
        return MeetingAction.objects.filter(
            Q(meeting__program__company=company)
            | Q(meeting__board__portfolio__company=company)
            | Q(meeting__board__program__company=company)
            | Q(meeting__board__project__company=company)
        ).distinct()

    @staticmethod
    def _sync_closed_at(serializer):
        """Stamp/clear closed_at based on the resulting status. Terminal states
        (done/cancelled) get a timestamp on entry; re-opening clears it."""
        status_val = serializer.validated_data.get(
            'status',
            getattr(serializer.instance, 'status', 'open'),
        )
        if status_val in MeetingAction.CLOSED_STATUSES:
            # Only stamp on transition into closed (preserve an existing close time).
            existing = getattr(serializer.instance, 'closed_at', None)
            serializer.save(closed_at=existing or timezone.now())
        else:
            serializer.save(closed_at=None)

    def perform_create(self, serializer):
        self._sync_closed_at(serializer)

    def perform_update(self, serializer):
        self._sync_closed_at(serializer)


class ComponentFundingViewSet(viewsets.ModelViewSet):
    """Portfolio funding allocations to components (program/project), with an
    over-budget gate: the sum of APPROVED allocations can never exceed the
    portfolio's allocated budget (P2-Governance #44)."""
    serializer_class = ComponentFundingSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['portfolio', 'program', 'project', 'status', 'fiscal_period']
    search_fields = ['title', 'rationale']
    ordering_fields = ['created_at', 'amount']

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return ComponentFunding.objects.none()
        all_tenants = self.request.query_params.get('all_tenants') in ('1', 'true', 'yes')
        company = getattr(user, 'company', None)
        is_superadmin = getattr(user, 'role', None) == 'superadmin' or getattr(user, 'is_superuser', False)
        if is_superadmin and (all_tenants or not company):
            return ComponentFunding.objects.all()
        if not company:
            return ComponentFunding.objects.none()
        return ComponentFunding.objects.filter(portfolio__company=company)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a funding allocation. GATE: refuses if approving it would
        push the portfolio's total approved funding past its allocated budget."""
        funding = self.get_object()
        if funding.status == 'approved':
            return Response(
                {'detail': 'This funding allocation is already approved.', 'code': 'already_approved'},
                status=drf_status.HTTP_409_CONFLICT,
            )
        portfolio = funding.portfolio
        budget = portfolio.budget_allocated
        if budget is not None:
            projected = portfolio.total_funded + funding.amount
            if projected > budget:
                return Response(
                    {'detail': 'Approving this allocation would exceed the portfolio budget.',
                     'code': 'over_budget',
                     'budget_allocated': str(budget),
                     'already_approved': str(portfolio.total_funded),
                     'requested': str(funding.amount),
                     'would_total': str(projected)},
                    status=drf_status.HTTP_409_CONFLICT,
                )
        funding.status = 'approved'
        funding.approved_by = request.user
        funding.approved_at = timezone.now()
        funding.save(update_fields=['status', 'approved_by', 'approved_at', 'updated_at'])
        return Response(self.get_serializer(funding).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        funding = self.get_object()
        funding.status = 'rejected'
        funding.save(update_fields=['status', 'updated_at'])
        return Response(self.get_serializer(funding).data)
