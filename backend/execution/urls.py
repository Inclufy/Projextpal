# Updated backend/execution/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    StakeholderViewSet,
    GovernanceViewSet,
    ChangeRequestViewSet,
)


router = DefaultRouter()
router.register(r"stakeholders", StakeholderViewSet, basename="stakeholder")
router.register(r"governance", GovernanceViewSet, basename="governance")
router.register(r"change-requests", ChangeRequestViewSet, basename="change-request")

urlpatterns = [
    path("", include(router.urls)),
]