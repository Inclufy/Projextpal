from django.utils import timezone
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ProductIssue, ProductIssueComment
from .serializers import (
    ProductIssueAutoCISerializer,
    ProductIssueCommentSerializer,
    ProductIssueSerializer,
    ProductIssueTriageUpdateSerializer,
)


class ProductIssueViewSet(viewsets.ModelViewSet):
    """
    GET    /api/v1/product-issues/                -- list (org-scoped)
    POST   /api/v1/product-issues/                -- user creates issue from Copilot
    GET    /api/v1/product-issues/{id}/           -- detail incl. comments
    PATCH  /api/v1/product-issues/{id}/           -- update lifecycle (assign, status)
    POST   /api/v1/product-issues/{id}/triage/    -- agent posts triage result
    POST   /api/v1/product-issues/{id}/comment/   -- add comment
    """

    serializer_class = ProductIssueSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Tenant scoping: org-members see their company's issues. Superadmin
        # sees all (operational role across tenants).
        qs = ProductIssue.objects.select_related(
            "reporter", "company", "project", "assigned_to", "duplicate_of"
        ).prefetch_related("attachments", "reproduction_evidence", "comments")

        if not user.is_authenticated:
            return qs.none()
        if getattr(user, "role", None) == "superadmin" or user.is_superuser:
            return qs
        company_id = getattr(user, "company_id", None)
        if not company_id:
            return qs.none()
        return qs.filter(company_id=company_id)

    def perform_create(self, serializer):
        # Auto-fill reporter + company from request context if not provided.
        user = self.request.user
        company = getattr(user, "company", None)
        serializer.save(
            reporter=user,
            company=serializer.validated_data.get("company") or company,
        )

    @action(detail=True, methods=["post"], url_path="triage")
    def triage(self, request, pk=None):
        """Agent posts triage result here.

        Body matches ProductIssueTriageUpdateSerializer fields. Sets
        triaged_at automatically and transitions status from `new`/`triaging`
        to whatever the agent decides (typically `accepted` or `wont-fix`).
        """
        issue = self.get_object()
        ser = ProductIssueTriageUpdateSerializer(
            issue, data=request.data, partial=True
        )
        ser.is_valid(raise_exception=True)
        ser.save(triaged_at=timezone.now())
        return Response(ProductIssueSerializer(issue).data)

    @action(detail=True, methods=["post"], url_path="comment")
    def comment(self, request, pk=None):
        """Add a comment to an issue thread."""
        issue = self.get_object()
        body = request.data.get("body", "").strip()
        if not body:
            return Response(
                {"error": "body is required"}, status=status.HTTP_400_BAD_REQUEST
            )
        author = request.data.get("author") or str(request.user.id)
        is_triage_step = bool(request.data.get("is_triage_step", False))
        comment = ProductIssueComment.objects.create(
            issue=issue,
            author=author,
            body=body,
            is_triage_step=is_triage_step,
        )
        return Response(
            ProductIssueCommentSerializer(comment).data,
            status=status.HTTP_201_CREATED,
        )


class ProductIssueAutoCIView(APIView):
    """
    POST /api/v1/product-issues/auto/ci/
    Body: { title, description, category, error_trace, environment, company }

    Used by GitHub Actions / GitLab CI / Playwright runner to post test
    failures directly. Auth via long-lived API token (not user JWT).

    For now we accept any authenticated request — token gating happens at
    the URL-routing level (see urls.py token-auth class). Tighten when CI-
    specific service-account tokens are issued.
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        ser = ProductIssueAutoCISerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        issue = ser.save()
        return Response(
            ProductIssueSerializer(issue).data,
            status=status.HTTP_201_CREATED,
        )
