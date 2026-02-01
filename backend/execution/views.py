from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from accounts.permissions import HasRole
from .models import Stakeholder, Governance, ChangeRequest
from .serializers import (
    StakeholderSerializer,
    GovernanceSerializer,
    ChangeRequestSerializer,
)


IsAdminOrPM = HasRole("admin", "pm")
IsAdminOrPMOrContributor = HasRole("admin", "pm", "contibuter")


class CompanyScopedQuerysetMixin:
    def get_queryset(self):
        base_qs = super().get_queryset()
        user = self.request.user
        if not user.is_authenticated:
            return base_qs.none()
        if getattr(user, "company", None) is None:
            return base_qs.none()
        if base_qs.model is Stakeholder:
            return base_qs.filter(company=user.company)
        if base_qs.model is Governance:
            return base_qs.filter(project__company=user.company)
        if base_qs.model is ChangeRequest:
            return base_qs.filter(project__company=user.company)
        if base_qs.model is TimeEntry:
            return base_qs.filter(project__company=user.company)
        return base_qs


class StakeholderViewSet(CompanyScopedQuerysetMixin, viewsets.ModelViewSet):
    queryset = Stakeholder.objects.all().select_related(
        "project", "company", "created_by"
    )
    serializer_class = StakeholderSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsAdminOrPMOrContributor()]

    def get_queryset(self):
        qs = super().get_queryset()
        project_id = self.request.query_params.get("project")
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company, created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(company=self.request.user.company)


class GovernanceViewSet(CompanyScopedQuerysetMixin, viewsets.ModelViewSet):
    queryset = Governance.objects.all().select_related(
        "project", "project__company", "created_by"
    )
    serializer_class = GovernanceSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsAdminOrPM()]

    def get_queryset(self):
        qs = super().get_queryset()
        project_id = self.request.query_params.get("project")
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ChangeRequestViewSet(CompanyScopedQuerysetMixin, viewsets.ModelViewSet):
    queryset = ChangeRequest.objects.all().select_related(
        "project", "project__company", "requested_by", "reviewed_by", "approval_stage"
    )
    serializer_class = ChangeRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated()]
        if self.action in ["create"]:
            return [IsAuthenticated(), IsAdminOrPMOrContributor()]
        if self.action in ["update", "partial_update"]:
            # Only reviewers/admins can update status, anyone can update their own request
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsAdminOrPM()]

    def get_queryset(self):
        qs = super().get_queryset()
        project_id = self.request.query_params.get("project")
        if project_id:
            qs = qs.filter(project_id=project_id)
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    def perform_create(self, serializer):
        serializer.save(requested_by=self.request.user)

    def perform_update(self, serializer):
        # If status is being changed, track who reviewed it
        instance = self.get_object()
        if 'status' in serializer.validated_data and instance.status != serializer.validated_data['status']:
            serializer.save(
                reviewed_by=self.request.user,
                reviewed_date=timezone.now()
            )
        else:
            serializer.save()

    @action(detail=True, methods=["post"], url_path="review")
    def review(self, request, pk=None):
        """Review and approve/reject a change request."""
        ReviewerOnly = HasRole("reviewer", "admin", "pm")
        if not ReviewerOnly().has_permission(request, self):
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        change_request = self.get_object()
        new_status = request.data.get("status")
        review_comments = request.data.get("review_comments", "")

        if new_status not in ["approved", "rejected", "under_review"]:
            return Response(
                {"detail": "Status must be approved, rejected, or under_review"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        change_request.status = new_status
        change_request.reviewed_by = request.user
        change_request.reviewed_date = timezone.now()
        change_request.review_comments = review_comments
        change_request.save()

        # Log activity if projects.ProjectActivity exists
        try:
            from projects.models import ProjectActivity
            ProjectActivity.objects.create(
                project=change_request.project,
                user=request.user,
                action="updated",
                message=f"Change request '{change_request.title}' {new_status}",
                target=change_request,
            )
        except Exception:
            pass

        return Response(
            ChangeRequestSerializer(change_request).data, status=status.HTTP_200_OK
        )