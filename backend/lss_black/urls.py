from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    HypothesisTestViewSet, DesignOfExperimentViewSet, ControlPlanViewSet, SPCChartViewSet,
    LSSBlackSeedDemoView, LSSBlackClearDemoView,
)
# Black Belt DMAIC phases share the Green Belt model — reuse the viewset so the
# /lss-black/projects/<id>/dmaic-phases/ surface is available (mirrors lss-green).
from lss_green.views import DMAICPhaseViewSet

app_name = 'lss-black'

router = DefaultRouter()
router.register(r'hypothesis-tests', HypothesisTestViewSet, basename='hypothesis-test')
router.register(r'doe', DesignOfExperimentViewSet, basename='doe')
router.register(r'control-plans', ControlPlanViewSet, basename='control-plan')
router.register(r'spc-charts', SPCChartViewSet, basename='spc-chart')
router.register(r'dmaic-phases', DMAICPhaseViewSet, basename='lss-black-dmaic-phase')

project_router = DefaultRouter()
project_router.register(r'hypothesis-tests', HypothesisTestViewSet, basename='project-hypothesis-test')
project_router.register(r'doe', DesignOfExperimentViewSet, basename='project-doe')
project_router.register(r'control-plans', ControlPlanViewSet, basename='project-control-plan')
project_router.register(r'spc-charts', SPCChartViewSet, basename='project-spc-chart')
project_router.register(r'dmaic-phases', DMAICPhaseViewSet, basename='project-lss-black-dmaic-phase')

urlpatterns = [
    path('', include(router.urls)),
    path('projects/<int:project_id>/', include(project_router.urls)),
    path('projects/<int:project_id>/lss-black/seed-demo/',
         LSSBlackSeedDemoView.as_view({'post': 'create'}), name='lss-black-seed-demo'),
    path('projects/<int:project_id>/lss-black/clear-demo/',
         LSSBlackClearDemoView.as_view({'post': 'create'}), name='lss-black-clear-demo'),
]
