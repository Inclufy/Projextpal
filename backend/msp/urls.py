from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MSPBenefitViewSet, BenefitRealizationViewSet, MSPTrancheViewSet

app_name = 'msp'

router = DefaultRouter()
router.register(r'benefits', MSPBenefitViewSet, basename='benefit')
router.register(r'tranches', MSPTrancheViewSet, basename='tranche')

program_router = DefaultRouter()
program_router.register(r'benefits', MSPBenefitViewSet, basename='benefit')
program_router.register(r'tranches', MSPTrancheViewSet, basename='tranche')

urlpatterns = [
    path('', include(router.urls)),
    path('programs/<uuid:program_id>/', include(program_router.urls)),
    path('programs/<uuid:program_id>/benefits/<uuid:benefit_pk>/realizations/', BenefitRealizationViewSet.as_view({'get': 'list', 'post': 'create'}), name='benefit-realization'),
]
