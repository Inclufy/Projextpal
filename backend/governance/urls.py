from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PortfolioViewSet,
    GovernanceBoardViewSet,
    BoardMemberViewSet,
    GovernanceStakeholderViewSet,
    DecisionViewSet,
    MeetingViewSet,
    MeetingActionViewSet,
    ComponentFundingViewSet,
)

router = DefaultRouter()
router.register(r'portfolios', PortfolioViewSet, basename='portfolio')
router.register(r'boards', GovernanceBoardViewSet, basename='governance-board')
router.register(r'board-members', BoardMemberViewSet, basename='board-member')
router.register(r'stakeholders', GovernanceStakeholderViewSet, basename='governance-stakeholder')
# Real Decision + Meeting endpoints (replaces the previous Q3-2026 stubs).
router.register(r'decisions', DecisionViewSet, basename='governance-decision')
router.register(r'meetings', MeetingViewSet, basename='governance-meeting')
router.register(r'meeting-actions', MeetingActionViewSet, basename='governance-meeting-action')
router.register(r'component-fundings', ComponentFundingViewSet, basename='component-funding')

urlpatterns = [
    path('', include(router.urls)),
]

from .views import generate_ai_report
urlpatterns += [
    path('reports/generate/', generate_ai_report, name='generate-ai-report'),
]

from .views import ai_generate_text
urlpatterns += [
    path('ai/generate/', ai_generate_text, name='ai-generate-text'),
]
