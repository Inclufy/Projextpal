from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DMAICPhaseViewSet, LSSGreenMetricViewSet, LSSGreenMeasurementViewSet,
    LSSGreenSeedDemoView, LSSGreenClearDemoView,
)

app_name = 'lss-green'

router = DefaultRouter()
router.register(r'dmaic-phases', DMAICPhaseViewSet, basename='dmaic-phase')
router.register(r'metrics', LSSGreenMetricViewSet, basename='metric')
router.register(r'measurements', LSSGreenMeasurementViewSet, basename='measurement')

project_router = DefaultRouter()
project_router.register(r'dmaic-phases', DMAICPhaseViewSet, basename='project-dmaic-phase')
project_router.register(r'metrics', LSSGreenMetricViewSet, basename='project-metric')
project_router.register(r'measurements', LSSGreenMeasurementViewSet, basename='project-measurement')

urlpatterns = [
    path('', include(router.urls)),
    path('projects/<int:project_id>/', include(project_router.urls)),
    path('projects/<int:project_id>/lss-green/seed-demo/',
         LSSGreenSeedDemoView.as_view({'post': 'create'}), name='lss-green-seed-demo'),
    path('projects/<int:project_id>/lss-green/clear-demo/',
         LSSGreenClearDemoView.as_view({'post': 'create'}), name='lss-green-clear-demo'),
]
