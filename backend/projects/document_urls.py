from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .document_views import DocumentViewSet

router = DefaultRouter()
router.register(r"documents", DocumentViewSet, basename="document")

urlpatterns = [
    path("", include(router.urls)),
]
