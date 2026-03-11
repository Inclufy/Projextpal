from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PortfolioViewSet,
    GovernanceBoardViewSet,
    BoardMemberViewSet,
    GovernanceStakeholderViewSet
)

router = DefaultRouter()
router.register(r'portfolios', PortfolioViewSet, basename='portfolio')
router.register(r'boards', GovernanceBoardViewSet, basename='governance-board')
router.register(r'board-members', BoardMemberViewSet, basename='board-member')
router.register(r'stakeholders', GovernanceStakeholderViewSet, basename='governance-stakeholder')

urlpatterns = [
    path('', include(router.urls)),
]

from .views import generate_ai_report
urlpatterns += [
    path('reports/generate/', generate_ai_report, name='generate-ai-report'),
<<<<<<< HEAD
]

from .views import ai_generate_text
urlpatterns += [
=======
>>>>>>> claude/create-test-agent-uat-KR36j
    path('ai/generate/', ai_generate_text, name='ai-generate-text'),
]
