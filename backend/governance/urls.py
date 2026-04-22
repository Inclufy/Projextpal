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
]

# Stub endpoints for UI tabs that expect Meeting/Decision data.
# No Meeting/Decision models exist yet — return empty list on GET so the UI
# doesn't 404, and 501 Not Implemented on POST pointing at the future endpoint.
from .views import meetings_stub, decisions_stub
urlpatterns += [
    path('meetings/', meetings_stub, name='governance-meetings-stub'),
    path('decisions/', decisions_stub, name='governance-decisions-stub'),
]

from .views import ai_generate_text
urlpatterns += [
    path('ai/generate/', ai_generate_text, name='ai-generate-text'),
]
