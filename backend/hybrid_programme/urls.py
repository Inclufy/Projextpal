from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    HybridGovernanceConfigViewSet,
    HybridAdaptationViewSet,
    ConstituentAuthorizationViewSet,
)

app_name = 'hybrid-programme'

router = DefaultRouter()
router.register(r'governance-configs', HybridGovernanceConfigViewSet, basename='governance-config')
router.register(r'adaptations', HybridAdaptationViewSet, basename='adaptation')
router.register(r'constituents', ConstituentAuthorizationViewSet, basename='constituent')

programme_router = DefaultRouter()
programme_router.register(r'governance-configs', HybridGovernanceConfigViewSet, basename='programme-governance-config')
programme_router.register(r'adaptations', HybridAdaptationViewSet, basename='programme-adaptation')
programme_router.register(r'constituents', ConstituentAuthorizationViewSet, basename='programme-constituent')

urlpatterns = [
    path('', include(router.urls)),
    # Canonical URL kwarg is `program_id` (singular, Django convention,
    # matches Program model PK). The legacy `programmes/<programme_id>/`
    # path is kept as a redirect-compat alias so existing clients keep
    # working until they migrate.
    path('programs/<int:program_id>/', include(programme_router.urls)),
    path('programmes/<int:program_id>/', include(programme_router.urls)),
]
