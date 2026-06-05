from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    HybridArtifactViewSet,
    HybridConfigurationViewSet,
    HybridDashboardView,
    PhaseMethodologyViewSet,
    HybridTaskViewSet,
    HybridSeedDemoView,
    HybridClearDemoView,
)

app_name = 'hybrid'

router = DefaultRouter()
router.register(r'artifacts', HybridArtifactViewSet, basename='artifact')
router.register(r'configs', HybridConfigurationViewSet, basename='config')
router.register(r'phase-methodologies', PhaseMethodologyViewSet, basename='phase-methodology')
router.register(r'tasks', HybridTaskViewSet, basename='task')

project_router = DefaultRouter()
project_router.register(r'artifacts', HybridArtifactViewSet, basename='project-artifact')
project_router.register(r'configurations', HybridConfigurationViewSet, basename='project-config')
project_router.register(r'phase-methodologies', PhaseMethodologyViewSet, basename='project-phase-methodology')
project_router.register(r'tasks', HybridTaskViewSet, basename='project-task')

# Mounted at /api/v1/ (see core/urls.py) so project-scoped resources follow the
# project-first convention shared with agile/scrum/kanban:
#   /api/v1/projects/<id>/hybrid/<resource>/
urlpatterns = [
    # Non-project-scoped collection endpoints, kept at /api/v1/hybrid/<resource>/.
    path('hybrid/', include(router.urls)),
    # Specific project-scoped paths first, before the router include.
    path('projects/<int:project_id>/hybrid/dashboard/',
         HybridDashboardView.as_view(), name='hybrid-dashboard'),
    path('projects/<int:project_id>/hybrid/seed-demo/',
         HybridSeedDemoView.as_view({'post': 'create'}), name='hybrid-seed-demo'),
    path('projects/<int:project_id>/hybrid/clear-demo/',
         HybridClearDemoView.as_view({'post': 'create'}), name='hybrid-clear-demo'),
    path('projects/<int:project_id>/hybrid/', include(project_router.urls)),
]
