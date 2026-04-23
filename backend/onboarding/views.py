import json
import re
import requests
from datetime import datetime

from django.conf import settings
from django.utils import timezone
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import OnboardingProfile
from .serializers import (
    AnalyzeCompanySerializer,
    SuggestSetupSerializer,
    OnboardingCompleteSerializer,
    OnboardingProfileSerializer,
)
from .demo_data import generate_demo_projects


def call_openai(messages, temperature=0.7, max_tokens=4000):
    """Call OpenAI API for AI-powered analysis."""
    api_key = getattr(settings, 'OPENAI_API_KEY', None)
    if not api_key:
        raise ValueError("OPENAI_API_KEY not configured")

    response = requests.post(
        'https://api.openai.com/v1/chat/completions',
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
        },
        json={
            'model': 'gpt-4o-mini',
            'messages': messages,
            'temperature': temperature,
            'max_tokens': max_tokens,
            'response_format': {'type': 'json_object'},
        },
        timeout=30,
    )

    if response.status_code != 200:
        raise Exception(f"OpenAI API error: {response.status_code} - {response.text}")

    data = response.json()
    content = data['choices'][0]['message']['content']
    return json.loads(content)


class AnalyzeCompanyView(APIView):
    """POST: Analyze company website and extract profile data."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AnalyzeCompanySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        url = serializer.validated_data['url']
        language = serializer.validated_data['language']

        try:
            # Fetch website content
            headers = {
                'User-Agent': 'Mozilla/5.0 (compatible; ProjeXtPalBot/1.0)',
            }
            resp = requests.get(url, headers=headers, timeout=10)
            resp.raise_for_status()
            html = resp.text[:15000]

            # Strip HTML tags
            text = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL)
            text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL)
            text = re.sub(r'<[^>]+>', ' ', text)
            text = re.sub(r'\s+', ' ', text).strip()[:5000]

            nl = language == 'nl'
            lang_instruction = "Antwoord in het Nederlands." if nl else "Answer in English."

            messages = [
                {
                    'role': 'system',
                    'content': f"""You are a company analysis AI. {lang_instruction}
Analyze the website text below and extract company information.
Return a JSON object with these fields:
- company_name: string
- description: string (short company description, 1-2 sentences)
- industry: string (e.g., "IT & Software", "Bouw & Constructie", "Zorg & Welzijn", "Financiële Dienstverlening", "Onderwijs", "Retail & E-commerce", "Productie & Manufacturing", "Consultancy", "Media & Communicatie", "Transport & Logistiek", "Overheid")
- project_types: array of strings (what kind of projects this company likely does: "software", "design", "research", "construction", "consulting", "other")
- suggested_methodology: string ("agile", "scrum", "kanban", "prince2", "waterfall", "hybrid")
- suggested_company_size: string ("solo", "small", "medium", "large", "enterprise")
- suggested_team_roles: array of objects with "title" and "description" fields
- contact_email: string or null
- contact_phone: string or null
- address: string or null
- kvk_number: string or null (Dutch Chamber of Commerce number, pattern: 8 digits)
- products_services: array of strings (main products or services)"""
                },
                {
                    'role': 'user',
                    'content': f"Website URL: {url}\n\nWebsite text:\n{text}"
                }
            ]

            analysis = call_openai(messages, temperature=0.3)
            return Response(analysis, status=status.HTTP_200_OK)

        except requests.RequestException as e:
            return Response(
                {'error': f'Could not fetch website: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return Response(
                {'error': f'Analysis failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class SuggestSetupView(APIView):
    """POST: Generate AI-powered setup suggestions based on company profile."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SuggestSetupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        nl = data['language'] == 'nl'
        lang_instruction = "Antwoord in het Nederlands." if nl else "Answer in English."

        messages = [
            {
                'role': 'system',
                'content': f"""You are a project management setup advisor for ProjeXtPal. {lang_instruction}
Based on the company profile, generate a complete project management setup recommendation.

Return a JSON object with:
1. "methodology_template": object with:
   - "name": methodology name
   - "description": why this methodology fits
   - "phases": array of objects with "name", "description", "typical_duration_weeks"
   - "deliverables": array of strings (key deliverables per phase)
   - "milestones": array of objects with "name", "phase", "description"

2. "default_roles": array of objects with "title", "description", "permissions" (array of strings)

3. "project_templates": array of 1-2 template objects with:
   - "name": template name
   - "description": what it's for
   - "tasks": array of objects with "name", "phase", "priority" ("high"/"medium"/"low"), "estimated_hours"
   - "milestones": array of objects with "name", "phase"

4. "governance": object with:
   - "approval_stages": array of objects with "name", "required_role", "description"
   - "escalation_paths": array of objects with "trigger", "action", "responsible_role"
   - "reporting_frequency": string

5. "risk_categories": array of objects with "name", "description", "typical_risks" (array of strings)

6. "settings": object with:
   - "time_tracking_mode": "daily" or "weekly"
   - "budget_tracking": boolean
   - "stakeholder_communication": "weekly" or "biweekly" or "monthly"
   - "document_templates": array of strings (recommended document types)

Tailor everything to the company's industry ({data['industry']}), size ({data['company_size']}), and preferred methodology ({data['default_methodology']})."""
            },
            {
                'role': 'user',
                'content': f"""Company: {data['company_name']}
Industry: {data['industry']}
Size: {data['company_size']}
Project types: {', '.join(data['project_types'])}
Preferred methodology: {data['default_methodology']}
Country: {data['country']}"""
            }
        ]

        try:
            suggestion = call_openai(messages, temperature=0.5, max_tokens=6000)
            return Response(suggestion, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': f'Setup suggestion failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class SaveOnboardingView(APIView):
    """POST: Save all onboarding data and mark as completed."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = OnboardingCompleteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        user = request.user
        company = user.company

        if not company:
            return Response(
                {'error': 'User has no company associated'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Update company name
        company.name = data['company_name']
        company.save()

        # Create or update OnboardingProfile
        profile, created = OnboardingProfile.objects.update_or_create(
            company=company,
            defaults={
                'created_by': user,
                'company_name': data['company_name'],
                'website': data.get('website', ''),
                'industry': data.get('industry', ''),
                'country': data.get('country', 'NL'),
                'description': data.get('description', ''),
                'default_methodology': data.get('default_methodology', 'agile'),
                'project_types': data.get('project_types', ['software']),
                'team_roles': data.get('team_roles', []),
                'company_size': data.get('company_size', 'small'),
                'currency': data.get('currency', 'EUR'),
                'time_tracking_enabled': data.get('time_tracking_enabled', True),
                'risk_management_enabled': data.get('risk_management_enabled', True),
                'governance_enabled': data.get('governance_enabled', True),
                'setup_suggestion': data.get('setup_suggestion'),
                'methodology_confirmed': True,
                'roles_confirmed': True,
                'templates_confirmed': True,
                'onboarding_completed': True,
                'completed_at': timezone.now(),
            },
        )

        # Generate demo data if requested
        if data.get('generate_demo_data', False):
            demo_industry = data.get('demo_industry', '') or data.get('industry', '')
            generate_demo_projects(
                company=company,
                user=user,
                industry=demo_industry,
                methodology=data.get('default_methodology', 'agile'),
            )

        return Response(
            {
                'message': 'Onboarding completed successfully',
                'onboarding_completed': True,
                'profile_id': profile.id,
            },
            status=status.HTTP_200_OK,
        )


class OnboardingStatusView(APIView):
    """GET: Check if onboarding is completed for current user's company."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        company = getattr(user, 'company', None)

        if not company:
            return Response({
                'onboarding_completed': False,
                'has_company': False,
            })

        # We previously only caught DoesNotExist, so anything else
        # (MultipleObjectsReturned from a bad migration, corrupt JSON field,
        # serializer error) bubbled out as a bare Django 500 HTML page.
        # Degrade gracefully — log, return "has company, not onboarded".
        try:
            profile = OnboardingProfile.objects.filter(company=company).first()
            if profile is None:
                return Response({
                    'onboarding_completed': False,
                    'has_company': True,
                })
            return Response({
                'onboarding_completed': profile.onboarding_completed,
                'has_company': True,
                'profile': OnboardingProfileSerializer(profile).data,
            })
        except Exception:
            import logging
            logging.exception("OnboardingStatusView failed for user=%s company=%s",
                              getattr(user, 'id', None), getattr(company, 'id', None))
            return Response({
                'onboarding_completed': False,
                'has_company': True,
                'error': 'profile_read_failed',
            })
