from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    Portfolio, GovernanceBoard, BoardMember, GovernanceStakeholder,
    Decision, Meeting,
)
from .serializers import (
    PortfolioSerializer, GovernanceBoardSerializer,
    BoardMemberSerializer, GovernanceStakeholderSerializer,
    DecisionSerializer, MeetingSerializer,
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
        if user.role == 'superadmin':
            return Portfolio.objects.all()
        company = getattr(user, 'company', None)
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
        if getattr(user, 'role', None) == 'superadmin' or getattr(user, 'is_superuser', False):
            return BoardMember.objects.all()
        company = getattr(user, 'company', None)
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
    
    report = generate_report(report_id, context)
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
    filterset_fields = ['program', 'status', 'impact']
    search_fields = ['title', 'description']
    ordering_fields = ['decided_at', 'created_at']

    def get_queryset(self):
        # P0 cross-tenant fix — was returning Decision.objects.all() when the
        # requesting user had no company (cross-tenant leak). Superadmin keeps
        # tenant-spanning visibility; everyone else MUST be company-scoped.
        user = self.request.user
        if not user.is_authenticated:
            return Decision.objects.none()
        if getattr(user, 'role', None) == 'superadmin' or getattr(user, 'is_superuser', False):
            return Decision.objects.all()
        company = getattr(user, 'company', None)
        if not company:
            return Decision.objects.none()
        return Decision.objects.filter(program__company=company)

    def perform_create(self, serializer):
        # Default decided_by to the requester if absent so demo POSTs that
        # only carry program+title+description still create a valid record.
        if not serializer.validated_data.get('decided_by'):
            serializer.save(decided_by=self.request.user)
        else:
            serializer.save()


class MeetingViewSet(viewsets.ModelViewSet):
    serializer_class = MeetingSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['program', 'type', 'status']
    search_fields = ['title', 'agenda', 'minutes']
    ordering_fields = ['scheduled_at', 'created_at']

    def get_queryset(self):
        # P0 cross-tenant fix — was returning Meeting.objects.all() when the
        # requesting user had no company (cross-tenant leak). Superadmin keeps
        # tenant-spanning visibility; everyone else MUST be company-scoped.
        user = self.request.user
        if not user.is_authenticated:
            return Meeting.objects.none()
        if getattr(user, 'role', None) == 'superadmin' or getattr(user, 'is_superuser', False):
            return Meeting.objects.all()
        company = getattr(user, 'company', None)
        if not company:
            return Meeting.objects.none()
        return Meeting.objects.filter(program__company=company)

    def perform_create(self, serializer):
        if not serializer.validated_data.get('facilitator'):
            serializer.save(facilitator=self.request.user)
        else:
            serializer.save()
