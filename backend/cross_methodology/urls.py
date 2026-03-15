from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MethodologyComparisonViewSet, MethodologyMetricsViewSet

app_name = 'cross-methodology'

router = DefaultRouter()
router.register(r'comparisons', MethodologyComparisonViewSet, basename='comparison')
router.register(r'metrics', MethodologyMetricsViewSet, basename='methodology-metrics')

urlpatterns = [
    path('', include(router.urls)),
]
