from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HybridGovernanceConfigViewSet, HybridAdaptationViewSet

app_name = 'hybrid-programme'

router = DefaultRouter()
router.register(r'governance-configs', HybridGovernanceConfigViewSet, basename='governance-config')
router.register(r'adaptations', HybridAdaptationViewSet, basename='adaptation')

programme_router = DefaultRouter()
programme_router.register(r'governance-configs', HybridGovernanceConfigViewSet, basename='governance-config')
programme_router.register(r'adaptations', HybridAdaptationViewSet, basename='adaptation')

urlpatterns = [
    path('', include(router.urls)),
    path('programmes/<uuid:programme_id>/', include(programme_router.urls)),
]
