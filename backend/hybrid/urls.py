from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HybridArtifactViewSet, HybridConfigurationViewSet, PhaseMethodologyViewSet

app_name = 'hybrid'

router = DefaultRouter()
router.register(r'artifacts', HybridArtifactViewSet, basename='artifact')
router.register(r'configs', HybridConfigurationViewSet, basename='config')
router.register(r'phase-methodologies', PhaseMethodologyViewSet, basename='phase-methodology')

project_router = DefaultRouter()
project_router.register(r'artifacts', HybridArtifactViewSet, basename='artifact')
project_router.register(r'configs', HybridConfigurationViewSet, basename='config')
project_router.register(r'phase-methodologies', PhaseMethodologyViewSet, basename='phase-methodology')

urlpatterns = [
    path('', include(router.urls)),
    path('projects/<uuid:project_id>/', include(project_router.urls)),
]
