from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import HasRole
from django.shortcuts import get_object_or_404

from .models import WorkflowDiagram, WorkflowNode, WorkflowEdge
from .serializers import (
    WorkflowDiagramSerializer,
    WorkflowDiagramCreateUpdateSerializer,
    WorkflowNodeSerializer,
    WorkflowEdgeSerializer,
)
from projects.models import Project


class CompanyScopedQuerysetMixin:
    """Mixin to filter querysets by user's company"""

    def get_queryset(self):
        base_qs = super().get_queryset()
        user = self.request.user
        if not user.is_authenticated:
            return base_qs.none()
        if getattr(user, "company", None) is None:
            return base_qs.none()
        # Filter workflows by project's company
        return base_qs.filter(project__company=user.company)


# Permission classes
IsAdminOrPM = HasRole("admin", "pm")
IsAdminOrPMOrContributor = HasRole("admin", "pm", "contibuter")


class WorkflowDiagramViewSet(CompanyScopedQuerysetMixin, viewsets.ModelViewSet):
    """
    ViewSet for WorkflowDiagram

    Endpoints:
    - GET /api/workflow/diagrams/ - List all workflow diagrams
    - GET /api/workflow/diagrams/{id}/ - Get a specific workflow diagram
    - POST /api/workflow/diagrams/ - Create a new workflow diagram
    - PUT /api/workflow/diagrams/{id}/ - Update a workflow diagram
    - PATCH /api/workflow/diagrams/{id}/ - Partial update
    - DELETE /api/workflow/diagrams/{id}/ - Delete a workflow diagram
    - GET /api/workflow/diagrams/by-project/{project_id}/ - Get workflow by project ID
    """

    queryset = (
        WorkflowDiagram.objects.all()
        .select_related("project", "created_by")
        .prefetch_related("nodes", "edges")
    )
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return WorkflowDiagramCreateUpdateSerializer
        return WorkflowDiagramSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve", "by_project"]:
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsAdminOrPMOrContributor()]

    def perform_create(self, serializer):
        """Set the created_by field on creation"""
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=["get"], url_path="by-project/(?P<project_id>[^/.]+)")
    def by_project(self, request, project_id=None):
        """
        Get or create workflow diagram for a specific project
        GET /api/workflow/diagrams/by-project/{project_id}/
        """
        # Verify project exists and user has access
        project = get_object_or_404(
            Project.objects.filter(company=request.user.company), pk=project_id
        )

        # Get or create workflow diagram
        workflow, created = WorkflowDiagram.objects.get_or_create(
            project=project,
            defaults={"name": f"{project.name} Workflow", "created_by": request.user},
        )

        serializer = WorkflowDiagramSerializer(workflow)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="save-workflow")
    def save_workflow(self, request, pk=None):
        """
        Save/update complete workflow (nodes and edges)
        POST /api/workflow/diagrams/{id}/save-workflow/

        Expected payload:
        {
            "nodes": [...],
            "edges": [...]
        }
        """
        workflow = self.get_object()

        nodes_data = request.data.get("nodes", [])
        edges_data = request.data.get("edges", [])

        # Delete existing nodes and edges
        workflow.nodes.all().delete()
        workflow.edges.all().delete()

        # Create new nodes
        for idx, node_data in enumerate(nodes_data):
            position = node_data.get("position", {})
            data = node_data.get("data", {})

            WorkflowNode.objects.create(
                workflow=workflow,
                node_id=node_data.get("id"),
                node_type=node_data.get("type", "rectangle"),
                label=data.get("label", ""),
                position_x=position.get("x", 0),
                position_y=position.get("y", 0),
                color=data.get("color", "#1e40af"),
                text_color=data.get("textColor", "#ffffff"),
                font_size=data.get("fontSize", 12),
                order_index=idx,
            )

        # Create new edges
        for edge_data in edges_data:
            style = edge_data.get("style", {})
            marker_end = edge_data.get("markerEnd", {})

            WorkflowEdge.objects.create(
                workflow=workflow,
                edge_id=edge_data.get("id"),
                source_node_id=edge_data.get("source"),
                target_node_id=edge_data.get("target"),
                source_handle=edge_data.get("sourceHandle"),
                target_handle=edge_data.get("targetHandle"),
                label=edge_data.get("label", ""),
                animated=edge_data.get("animated", False),
                stroke_color=style.get("stroke", "#374151"),
                stroke_width=style.get("strokeWidth", 2),
                marker_type=marker_end.get("type", "arrowclosed"),
                marker_color=marker_end.get("color", "#374151"),
            )

        # Refresh the workflow to get updated nodes and edges
        workflow.refresh_from_db()
        serializer = WorkflowDiagramSerializer(workflow)

        return Response(serializer.data, status=status.HTTP_200_OK)


class WorkflowNodeViewSet(CompanyScopedQuerysetMixin, viewsets.ModelViewSet):
    """
    ViewSet for individual WorkflowNode operations
    Usually you'll use the WorkflowDiagram save-workflow endpoint instead
    """

    queryset = WorkflowNode.objects.all().select_related("workflow")
    serializer_class = WorkflowNodeSerializer
    permission_classes = [IsAuthenticated, IsAdminOrPMOrContributor]

    def get_queryset(self):
        base_qs = WorkflowNode.objects.all().select_related("workflow__project")
        user = self.request.user
        if not user.is_authenticated:
            return base_qs.none()
        if getattr(user, "company", None) is None:
            return base_qs.none()
        return base_qs.filter(workflow__project__company=user.company)


class WorkflowEdgeViewSet(CompanyScopedQuerysetMixin, viewsets.ModelViewSet):
    """
    ViewSet for individual WorkflowEdge operations
    Usually you'll use the WorkflowDiagram save-workflow endpoint instead
    """

    queryset = WorkflowEdge.objects.all().select_related("workflow")
    serializer_class = WorkflowEdgeSerializer
    permission_classes = [IsAuthenticated, IsAdminOrPMOrContributor]

    def get_queryset(self):
        base_qs = WorkflowEdge.objects.all().select_related("workflow__project")
        user = self.request.user
        if not user.is_authenticated:
            return base_qs.none()
        if getattr(user, "company", None) is None:
            return base_qs.none()
        return base_qs.filter(workflow__project__company=user.company)
