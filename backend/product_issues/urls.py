from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ProductIssueAutoCIView, ProductIssueViewSet

router = DefaultRouter()
router.register(r"product-issues", ProductIssueViewSet, basename="product-issue")

urlpatterns = [
    # Auto-CI POST endpoint (separate from the ViewSet to keep its own URL slug)
    path("product-issues/auto/ci/", ProductIssueAutoCIView.as_view(), name="product-issue-auto-ci"),
    path("", include(router.urls)),
]
