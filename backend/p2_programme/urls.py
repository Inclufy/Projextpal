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
    path('programmes/<uuid:programme_id>/', include(programme_router.urls)),
]
