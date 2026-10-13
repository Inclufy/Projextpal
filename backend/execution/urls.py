# Updated backend/execution/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    StakeholderViewSet,
    GovernanceViewSet,
    ChangeRequestViewSet,
)
from .s7_resource_planner_views import resource_allocation_detail


router = DefaultRouter()
router.register(r"stakeholders", StakeholderViewSet, basename="stakeholder")
router.register(r"governance", GovernanceViewSet, basename="governance")
router.register(r"change-requests", ChangeRequestViewSet, basename="change-request")

urlpatterns = [
    path("", include(router.urls)),
    # Sprint 7 — resource-plan allocation detail (list/create lives on the
    # project route in projects.urls so it stays grouped with other project
    # resources; detail is here because it is addressable by its own PK).
    path(
        "resource-plan/<int:pk>/",
        resource_allocation_detail,
        name="resource-allocation-detail",
    ),
]