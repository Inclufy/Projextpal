from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProgramCharterViewSet,
    ScopeCapabilityViewSet,
    CriticalInterdependencyViewSet,
    KeyRiskViewSet,
    KeyDeliverableViewSet,
    ResourceViewSet, DependencyViewSet,
)

router = DefaultRouter()
router.register(r'charters', ProgramCharterViewSet, basename='programcharter')  # Keep basename because of custom get_queryset
router.register(r'scopes', ScopeCapabilityViewSet)  # Remove basename - has queryset
router.register(r'interdependencies', CriticalInterdependencyViewSet)  # Remove basename - has queryset
router.register(r'risks', KeyRiskViewSet)  # Remove basename - has queryset
router.register(r'deliverables', KeyDeliverableViewSet)  # Remove basename - has queryset
router.register(r'resources', ResourceViewSet)  # Remove basename - has queryset
router.register(r"dependencies", DependencyViewSet, basename="dependency")  # Remove basename - has queryset



urlpatterns = [
    path('', include(router.urls)),
]