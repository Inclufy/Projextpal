from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import P2BlueprintViewSet, P2ProgrammeProjectViewSet

app_name = 'p2'

router = DefaultRouter()
router.register(r'blueprints', P2BlueprintViewSet, basename='blueprint')
router.register(r'projects', P2ProgrammeProjectViewSet, basename='project')

programme_router = DefaultRouter()
programme_router.register(r'blueprints', P2BlueprintViewSet, basename='programme-blueprint')
programme_router.register(r'projects', P2ProgrammeProjectViewSet, basename='programme-project')

urlpatterns = [
    path('', include(router.urls)),
    # Canonical URL kwarg is `program_id` (singular, Django convention,
    # matches Program model PK). The legacy `programmes/<programme_id>/`
    # path is kept as a redirect-compat alias so existing clients keep
    # working until they migrate.
    path('programs/<int:program_id>/', include(programme_router.urls)),
    path('programmes/<int:program_id>/', include(programme_router.urls)),
]
