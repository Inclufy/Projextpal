from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HypothesisTestViewSet, DesignOfExperimentViewSet, ControlPlanViewSet, SPCChartViewSet

app_name = 'lss-black'

router = DefaultRouter()
router.register(r'hypothesis-tests', HypothesisTestViewSet, basename='hypothesis-test')
router.register(r'doe', DesignOfExperimentViewSet, basename='doe')
router.register(r'control-plans', ControlPlanViewSet, basename='control-plan')
router.register(r'spc-charts', SPCChartViewSet, basename='spc-chart')

project_router = DefaultRouter()
project_router.register(r'hypothesis-tests', HypothesisTestViewSet, basename='hypothesis-test')
project_router.register(r'doe', DesignOfExperimentViewSet, basename='doe')
project_router.register(r'control-plans', ControlPlanViewSet, basename='control-plan')
project_router.register(r'spc-charts', SPCChartViewSet, basename='spc-chart')

urlpatterns = [
    path('', include(router.urls)),
    path('projects/<uuid:project_id>/', include(project_router.urls)),
]
