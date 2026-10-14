from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ProductIssueAutoCIView,
    ProductIssueClaudeCallbackView,
    ProductIssueTriggerClaudeView,
    ProductIssueViewSet,
)

router = DefaultRouter()
router.register(r"product-issues", ProductIssueViewSet, basename="product-issue")

urlpatterns = [
    # Auto-CI POST endpoint (separate from the ViewSet to keep its own URL slug)
    path(
        "product-issues/auto/ci/",
        ProductIssueAutoCIView.as_view(),
        name="product-issue-auto-ci",
    ),
    # Claude auto-triage callback (external orchestrator → us, signed with
    # CLAUDE_FIX_AGENT_WEBHOOK_SECRET HMAC).
    path(
        "product-issues/<int:pk>/claude-callback/",
        ProductIssueClaudeCallbackView.as_view(),
        name="product-issue-claude-callback",
    ),
    # Admin-only manual trigger button for the auto-triage pipeline.
    path(
        "product-issues/<int:pk>/trigger-claude/",
        ProductIssueTriggerClaudeView.as_view(),
        name="product-issue-trigger-claude",
    ),
    path("", include(router.urls)),
]
