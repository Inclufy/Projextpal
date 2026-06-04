from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AgileReleaseTrainViewSet, ARTSyncViewSet, ProgramIncrementViewSet, PIObjectiveViewSet,
    FeatureViewSet, StoryViewSet, DependencyViewSet, SystemDemoViewSet, InspectAdaptViewSet,
)

app_name = 'safe'

router = DefaultRouter()
router.register(r'arts', AgileReleaseTrainViewSet, basename='art')
router.register(r'pis', ProgramIncrementViewSet, basename='pi')
router.register(r'features', FeatureViewSet, basename='feature')
router.register(r'stories', StoryViewSet, basename='story')
router.register(r'dependencies', DependencyViewSet, basename='dependency')
router.register(r'system-demos', SystemDemoViewSet, basename='system-demo')
router.register(r'inspect-adapt', InspectAdaptViewSet, basename='inspect-adapt')

program_router = DefaultRouter()
program_router.register(r'arts', AgileReleaseTrainViewSet, basename='program-art')
program_router.register(r'pis', ProgramIncrementViewSet, basename='program-pi')
program_router.register(r'features', FeatureViewSet, basename='program-feature')

urlpatterns = [
    path('', include(router.urls)),
    path('programs/<int:program_id>/', include(program_router.urls)),
    path('programs/<int:program_id>/arts/<uuid:art_pk>/syncs/', ARTSyncViewSet.as_view({'get': 'list', 'post': 'create'}), name='art-sync'),
    path('programs/<int:program_id>/pis/<uuid:pi_id>/objectives/', PIObjectiveViewSet.as_view({'get': 'list', 'post': 'create'}), name='pi-objective-list'),
    path('programs/<int:program_id>/pis/<uuid:pi_id>/objectives/<uuid:pk>/', PIObjectiveViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='pi-objective-detail'),
    # Nested PI sub-resources
    path('pis/<uuid:pi_id>/features/', FeatureViewSet.as_view({'get': 'list', 'post': 'create'}), name='pi-feature-list'),
    path('pis/<uuid:pi_id>/dependencies/', DependencyViewSet.as_view({'get': 'list', 'post': 'create'}), name='pi-dependency-list'),
    path('pis/<uuid:pi_id>/system-demos/', SystemDemoViewSet.as_view({'get': 'list', 'post': 'create'}), name='pi-demo-list'),
    path('pis/<uuid:pi_id>/inspect-adapt/', InspectAdaptViewSet.as_view({'get': 'list', 'post': 'create'}), name='pi-ia-list'),
    path('pis/<uuid:pi_id>/inspect-adapt/snapshot/', InspectAdaptViewSet.as_view({'post': 'snapshot'}), name='pi-ia-snapshot'),
    path('features/<uuid:feature_id>/stories/', StoryViewSet.as_view({'get': 'list', 'post': 'create'}), name='feature-story-list'),
]
