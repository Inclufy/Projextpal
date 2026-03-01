from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AgileReleaseTrainViewSet, ARTSyncViewSet, ProgramIncrementViewSet, PIObjectiveViewSet

app_name = 'safe'

router = DefaultRouter()
router.register(r'arts', AgileReleaseTrainViewSet, basename='art')
router.register(r'pis', ProgramIncrementViewSet, basename='pi')

program_art_router = DefaultRouter()
program_art_router.register(r'arts', AgileReleaseTrainViewSet, basename='art')
program_art_router.register(r'pis', ProgramIncrementViewSet, basename='pi')

urlpatterns = [
    path('', include(router.urls)),
    path('programs/<uuid:program_id>/', include(program_art_router.urls)),
    path('programs/<uuid:program_id>/arts/<uuid:art_pk>/syncs/', ARTSyncViewSet.as_view({'get': 'list', 'post': 'create'}), name='art-sync'),
    path('programs/<uuid:program_id>/pis/<uuid:pi_id>/objectives/', PIObjectiveViewSet.as_view({'get': 'list', 'post': 'create'}), name='pi-objective-list'),
    path('programs/<uuid:program_id>/pis/<uuid:pi_id>/objectives/<uuid:pk>/', PIObjectiveViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='pi-objective-detail'),
]
