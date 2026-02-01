from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WorkflowDiagramViewSet, WorkflowNodeViewSet, WorkflowEdgeViewSet

router = DefaultRouter()
router.register(r"diagrams", WorkflowDiagramViewSet, basename="workflow-diagram")
router.register(r"nodes", WorkflowNodeViewSet, basename="workflow-node")
router.register(r"edges", WorkflowEdgeViewSet, basename="workflow-edge")

urlpatterns = [
    path("", include(router.urls)),
]
