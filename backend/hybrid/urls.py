from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    HybridArtifactViewSet,
    HybridConfigurationViewSet,
    HybridDashboardView,
    PhaseMethodologyViewSet,
    HybridSeedDemoView,
    HybridClearDemoView,
)

app_name = 'hybrid'

router = DefaultRouter()
router.register(r'artifacts', HybridArtifactViewSet, basename='artifact')
router.register(r'configs', HybridConfigurationViewSet, basename='config')
router.register(r'phase-methodologies', PhaseMethodologyViewSet, basename='phase-methodology')

project_router = DefaultRouter()
project_router.register(r'artifacts', HybridArtifactViewSet, basename='project-artifact')
project_router.register(r'configs', HybridConfigurationViewSet, basename='project-config')
project_router.register(r'phase-methodologies', PhaseMethodologyViewSet, basename='project-phase-methodology')

urlpatterns = [
    path('', include(router.urls)),
    # Matches /api/v1/hybrid/projects/<id>/dashboard/ when mounted under api/v1/hybrid/.
    # Also exposed below as /projects/<id>/hybrid/dashboard/ for frontend compatibility.
    path(
        'projects/<int:project_id>/dashboard/',
        HybridDashboardView.as_view(),
        name='hybrid-dashboard',
    ),
    path(
        'projects/<int:project_id>/hybrid/dashboard/',
        HybridDashboardView.as_view(),
        name='hybrid-dashboard-alias',
    ),
    path('projects/<int:project_id>/', include(project_router.urls)),
    path('projects/<int:project_id>/hybrid/seed-demo/',
         HybridSeedDemoView.as_view({'post': 'create'}), name='hybrid-seed-demo'),
    path('projects/<int:project_id>/hybrid/clear-demo/',
         HybridClearDemoView.as_view({'post': 'create'}), name='hybrid-clear-demo'),
]
