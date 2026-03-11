from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PortfolioViewSet,
    GovernanceBoardViewSet,
    BoardMemberViewSet,
    GovernanceStakeholderViewSet,
    generate_ai_report,
    ai_generate_text,
)

router = DefaultRouter()
router.register(r'portfolios', PortfolioViewSet, basename='portfolio')
router.register(r'boards', GovernanceBoardViewSet, basename='governance-board')
router.register(r'board-members', BoardMemberViewSet, basename='board-member')
router.register(r'stakeholders', GovernanceStakeholderViewSet, basename='governance-stakeholder')

urlpatterns = [
    path('', include(router.urls)),
    path('reports/generate/', generate_ai_report, name='generate-ai-report'),
    path('ai/generate/', ai_generate_text, name='ai-generate-text'),
]
