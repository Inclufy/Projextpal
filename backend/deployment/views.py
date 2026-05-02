from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import DeploymentPlan, StrategyItem, RolloutPhase, PhaseTask
from .serializers import (
    DeploymentPlanSerializer,
    StrategyItemCreateUpdateSerializer,
    RolloutPhaseCreateUpdateSerializer,
    PhaseTaskCreateUpdateSerializer,
)


def _is_superadmin(user):
    return getattr(user, "role", None) == "superadmin" or getattr(user, "is_superuser", False)


class DeploymentPlanViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Deployment Plan CRUD operations.
    """
    queryset = DeploymentPlan.objects.all()
    serializer_class = DeploymentPlanSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter by project if provided."""
        # P0 cross-tenant fix — previously when the user had no company, the
        # company-scope clause was silently skipped and the queryset returned
        # every tenant's deployment plans. Now: superadmin sees all, no-company
        # users see nothing, everyone else is scoped to their company.
        user = self.request.user
        queryset = super().get_queryset()
        if not _is_superadmin(user):
            company = getattr(user, "company", None)
            if not company:
                return queryset.none()
            queryset = queryset.filter(project__company=company)

        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset

    def perform_create(self, serializer):
        """Set created_by on creation."""
        serializer.save(created_by=self.request.user)


class StrategyItemViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Strategy Item CRUD operations.
    """
    queryset = StrategyItem.objects.all()
    serializer_class = StrategyItemCreateUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter by deployment_plan if provided."""
        # P0 cross-tenant fix — see DeploymentPlanViewSet.
        user = self.request.user
        queryset = super().get_queryset()
        if not _is_superadmin(user):
            company = getattr(user, "company", None)
            if not company:
                return queryset.none()
            queryset = queryset.filter(deployment_plan__project__company=company)

        deployment_plan_id = self.request.query_params.get('deployment_plan')
        if deployment_plan_id:
            queryset = queryset.filter(deployment_plan_id=deployment_plan_id)
        return queryset


class RolloutPhaseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Rollout Phase CRUD operations.
    """
    queryset = RolloutPhase.objects.all()
    serializer_class = RolloutPhaseCreateUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter by deployment_plan if provided."""
        # P0 cross-tenant fix — see DeploymentPlanViewSet.
        user = self.request.user
        queryset = super().get_queryset()
        if not _is_superadmin(user):
            company = getattr(user, "company", None)
            if not company:
                return queryset.none()
            queryset = queryset.filter(deployment_plan__project__company=company)

        deployment_plan_id = self.request.query_params.get('deployment_plan')
        if deployment_plan_id:
            queryset = queryset.filter(deployment_plan_id=deployment_plan_id)
        return queryset


class PhaseTaskViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Phase Task CRUD operations.
    """
    queryset = PhaseTask.objects.all()
    serializer_class = PhaseTaskCreateUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter by rollout_phase if provided."""
        # P0 cross-tenant fix — see DeploymentPlanViewSet.
        user = self.request.user
        queryset = super().get_queryset()
        if not _is_superadmin(user):
            company = getattr(user, "company", None)
            if not company:
                return queryset.none()
            queryset = queryset.filter(
                rollout_phase__deployment_plan__project__company=company
            )

        rollout_phase_id = self.request.query_params.get('rollout_phase')
        if rollout_phase_id:
            queryset = queryset.filter(rollout_phase_id=rollout_phase_id)
        return queryset