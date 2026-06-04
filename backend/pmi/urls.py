from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PMIComponentViewSet, PMIGovernanceBoardViewSet, PMIGateDecisionViewSet,
    PMIProgramCharterViewSet, PMIBenefitViewSet, PMIStakeholderViewSet,
    PMIRoadmapItemViewSet,
)

app_name = 'pmi'

router = DefaultRouter()
router.register(r'components', PMIComponentViewSet, basename='component')
router.register(r'governance-boards', PMIGovernanceBoardViewSet, basename='governance-board')
router.register(r'gate-decisions', PMIGateDecisionViewSet, basename='gate-decision')
router.register(r'charters', PMIProgramCharterViewSet, basename='charter')
router.register(r'benefits', PMIBenefitViewSet, basename='benefit')
router.register(r'stakeholders', PMIStakeholderViewSet, basename='stakeholder')
router.register(r'roadmap-items', PMIRoadmapItemViewSet, basename='roadmap-item')

program_router = DefaultRouter()
program_router.register(r'components', PMIComponentViewSet, basename='program-component')
program_router.register(r'governance-boards', PMIGovernanceBoardViewSet, basename='program-governance-board')
program_router.register(r'charters', PMIProgramCharterViewSet, basename='program-charter')
program_router.register(r'benefits', PMIBenefitViewSet, basename='program-benefit')
program_router.register(r'stakeholders', PMIStakeholderViewSet, basename='program-stakeholder')
program_router.register(r'roadmap-items', PMIRoadmapItemViewSet, basename='program-roadmap-item')

urlpatterns = [
    path('', include(router.urls)),
    path('programs/<int:program_id>/', include(program_router.urls)),
]
