from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Portfolio, GovernanceBoard, BoardMember, GovernanceStakeholder
from .serializers import (
    PortfolioSerializer, GovernanceBoardSerializer, 
    BoardMemberSerializer, GovernanceStakeholderSerializer
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
        if company:
            serializer.save(company=company)
        else:
            serializer.save()

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


class BoardMemberViewSet(viewsets.ModelViewSet):
    queryset = BoardMember.objects.all()
    serializer_class = BoardMemberSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['board', 'role', 'is_active']


class GovernanceStakeholderViewSet(viewsets.ModelViewSet):
    queryset = GovernanceStakeholder.objects.all()
    serializer_class = GovernanceStakeholderSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['role', 'influence_level', 'interest_level', 'is_active']


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
    """Simple AI text generation endpoint."""
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
        logger.warning(f"OPENAI_API_KEY is not configured or is a test/placeholder key: {api_key[:10] if api_key else 'None'}...")
        return Response(
            {"error": "AI service is not configured. Please set a valid OPENAI_API_KEY."},
            status=http_status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    try:
        # Use direct OpenAI API call for reliability
        api_response = http_requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'gpt-4o-mini',
                'messages': [
                    {'role': 'system', 'content': 'You are a helpful project management expert. Respond concisely and professionally.'},
                    {'role': 'user', 'content': prompt}
                ],
                'temperature': 0.7,
                'max_tokens': 1500
            },
            timeout=60
        )

        api_response.raise_for_status()
        data = api_response.json()
        content = data['choices'][0]['message']['content'].strip()
        return Response({"response": content})
    except http_requests.exceptions.Timeout:
        logger.error("OpenAI API timeout")
        return Response({"error": "AI service timeout, please try again"}, status=http_status.HTTP_504_GATEWAY_TIMEOUT)
    except http_requests.exceptions.RequestException as e:
        logger.error(f"OpenAI API error: {e}")
        return Response({"error": f"AI service error: {str(e)}"}, status=http_status.HTTP_502_BAD_GATEWAY)
    except Exception as e:
        logger.error(f"AI generate failed: {type(e).__name__}: {e}")
        return Response(
            {"error": f"AI service unavailable: {type(e).__name__}"},
            status=http_status.HTTP_503_SERVICE_UNAVAILABLE,
        )
