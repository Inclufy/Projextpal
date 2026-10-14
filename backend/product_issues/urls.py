from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ProductIssueAutoCIView,
    ProductIssueViewSet,
    ResendInboundDecisionView,
)

router = DefaultRouter()
router.register(r"product-issues", ProductIssueViewSet, basename="product-issue")

urlpatterns = [
    # Auto-CI POST endpoint (separate from the ViewSet to keep its own URL slug)
    path("product-issues/auto/ci/", ProductIssueAutoCIView.as_view(), name="product-issue-auto-ci"),
    # Sprint 12 — Resend inbound email webhook for decision-reply parsing.
    # Authenticated via HMAC signature (RESEND_INBOUND_SIGNING_SECRET).
    path(
        "webhooks/resend/inbound-decision/",
        ResendInboundDecisionView.as_view(),
        name="resend-inbound-decision",
    ),
    path("", include(router.urls)),
]
