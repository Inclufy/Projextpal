from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DMAICPhaseViewSet, LSSGreenMetricViewSet, LSSGreenMeasurementViewSet

app_name = 'lss-green'

router = DefaultRouter()
router.register(r'dmaic-phases', DMAICPhaseViewSet, basename='dmaic-phase')
router.register(r'metrics', LSSGreenMetricViewSet, basename='metric')
router.register(r'measurements', LSSGreenMeasurementViewSet, basename='measurement')

# Project-scoped URLs
project_router = DefaultRouter()
project_router.register(r'dmaic-phases', DMAICPhaseViewSet, basename='dmaic-phase')
project_router.register(r'metrics', LSSGreenMetricViewSet, basename='metric')
project_router.register(r'measurements', LSSGreenMeasurementViewSet, basename='measurement')

urlpatterns = [
    path('', include(router.urls)),
    path('projects/<uuid:project_id>/', include(project_router.urls)),
]
