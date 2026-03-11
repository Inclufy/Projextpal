from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PMIComponentViewSet, PMIGovernanceBoardViewSet

app_name = 'pmi'

router = DefaultRouter()
router.register(r'components', PMIComponentViewSet, basename='component')
router.register(r'governance-boards', PMIGovernanceBoardViewSet, basename='governance-board')

program_router = DefaultRouter()
program_router.register(r'components', PMIComponentViewSet, basename='program-component')
program_router.register(r'governance-boards', PMIGovernanceBoardViewSet, basename='program-governance-board')

urlpatterns = [
    path('', include(router.urls)),
    path('programs/<uuid:program_id>/', include(program_router.urls)),
]
