from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MSPBenefitViewSet, BenefitRealizationViewSet, MSPTrancheViewSet,
    MSPBlueprintViewSet, MSPTransitionViewSet,
)

app_name = 'msp'

router = DefaultRouter()
router.register(r'benefits', MSPBenefitViewSet, basename='benefit')
router.register(r'tranches', MSPTrancheViewSet, basename='tranche')
router.register(r'blueprints', MSPBlueprintViewSet, basename='blueprint')
router.register(r'transitions', MSPTransitionViewSet, basename='transition')

program_router = DefaultRouter()
program_router.register(r'benefits', MSPBenefitViewSet, basename='program-benefit')
program_router.register(r'tranches', MSPTrancheViewSet, basename='program-tranche')
program_router.register(r'blueprints', MSPBlueprintViewSet, basename='program-blueprint')
program_router.register(r'transitions', MSPTransitionViewSet, basename='program-transition')

urlpatterns = [
    path('', include(router.urls)),
    path('programs/<int:program_id>/', include(program_router.urls)),
    path('programs/<int:program_id>/benefits/<uuid:benefit_pk>/realizations/', BenefitRealizationViewSet.as_view({'get': 'list', 'post': 'create'}), name='benefit-realization'),
]
