from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q

from accounts.permissions import HasRole
from .models import Document, Project, Milestone, Upload
from .serializers import DocumentSerializer, DocumentListSerializer
from .views import CompanyScopedQuerysetMixin


class DocumentViewSet(CompanyScopedQuerysetMixin, viewsets.ModelViewSet):
    """ViewSet for managing project documents"""

    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated()]
        return [IsAuthenticated(), HasRole("admin", "pm", "team_member")()]

    def get_queryset(self):
        """Filter documents by company and project"""
        base_qs = Document.objects.select_related(
            "project", "file", "owner", "created_by"
        ).prefetch_related("linked_milestones")

        user = self.request.user
        if not user.is_authenticated or not getattr(user, "company", None):
            return Document.objects.none()

        # Filter by company
        base_qs = base_qs.filter(project__company=user.company)

        # Filter by project if specified
        project_id = self.request.query_params.get("project_id")
        if project_id:
            base_qs = base_qs.filter(project_id=project_id)

        # Filter by category if specified
        category = self.request.query_params.get("category")
        if category:
            base_qs = base_qs.filter(category=category)

        # Filter by status if specified
        status_filter = self.request.query_params.get("status")
        if status_filter:
            base_qs = base_qs.filter(status=status_filter)

        # Search by name or description
        search = self.request.query_params.get("search")
        if search:
            base_qs = base_qs.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )

        return base_qs

    def get_serializer_class(self):
        """Use list serializer for list actions"""
        if self.action == "list":
            return DocumentListSerializer
        return DocumentSerializer

    def perform_create(self, serializer):
        """Set the project and handle file reference"""
        project_id = self.request.data.get("project")
        if not project_id:
            raise ValueError("Project ID is required")

        project = get_object_or_404(
            Project, id=project_id, company=self.request.user.company
        )

        # Handle file reference (file should already be uploaded)
        file_id = self.request.data.get("file")
        if not file_id:
            raise ValueError("File ID is required")

        # Get the existing Upload instance
        try:
            upload = Upload.objects.get(id=file_id, company=self.request.user.company)
        except Upload.DoesNotExist:
            raise ValueError("File not found or access denied")

        # Save document with the upload reference
        serializer.save(project=project, file=upload)

    @action(detail=False, methods=["get"])
    def by_milestone(self, request):
        """Get documents linked to a specific milestone"""
        milestone_id = request.query_params.get("milestone_id")
        if not milestone_id:
            return Response(
                {"error": "milestone_id parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        milestone = get_object_or_404(
            Milestone, id=milestone_id, project__company=request.user.company
        )

        documents = self.get_queryset().filter(linked_milestones=milestone)
        serializer = DocumentListSerializer(
            documents, many=True, context={"request": request}
        )
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def by_stage(self, request):
        """Get documents linked to a specific stage"""
        stage_name = request.query_params.get("stage")
        if not stage_name:
            return Response(
                {"error": "stage parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        documents = self.get_queryset().filter(linked_stages__contains=[stage_name])
        serializer = DocumentListSerializer(
            documents, many=True, context={"request": request}
        )
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def link_milestone(self, request, pk=None):
        """Link document to a milestone"""
        document = self.get_object()
        milestone_id = request.data.get("milestone_id")

        if not milestone_id:
            return Response(
                {"error": "milestone_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        milestone = get_object_or_404(
            Milestone, id=milestone_id, project=document.project
        )

        document.linked_milestones.add(milestone)
        return Response({"message": "Milestone linked successfully"})

    @action(detail=True, methods=["post"])
    def unlink_milestone(self, request, pk=None):
        """Unlink document from a milestone"""
        document = self.get_object()
        milestone_id = request.data.get("milestone_id")

        if not milestone_id:
            return Response(
                {"error": "milestone_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        milestone = get_object_or_404(
            Milestone, id=milestone_id, project=document.project
        )

        document.linked_milestones.remove(milestone)
        return Response({"message": "Milestone unlinked successfully"})

    @action(detail=True, methods=["post"])
    def link_stage(self, request, pk=None):
        """Link document to a stage"""
        document = self.get_object()
        stage_name = request.data.get("stage_name")

        if not stage_name:
            return Response(
                {"error": "stage_name is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        if stage_name not in document.linked_stages:
            document.linked_stages.append(stage_name)
            document.save()

        return Response({"message": "Stage linked successfully"})

    @action(detail=True, methods=["post"])
    def unlink_stage(self, request, pk=None):
        """Unlink document from a stage"""
        document = self.get_object()
        stage_name = request.data.get("stage_name")

        if not stage_name:
            return Response(
                {"error": "stage_name is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        if stage_name in document.linked_stages:
            document.linked_stages.remove(stage_name)
            document.save()

        return Response({"message": "Stage unlinked successfully"})

    @action(detail=True, methods=["get"])
    def download(self, request, pk=None):
        """Download document file"""
        document = self.get_object()

        if not document.file or not document.file.file:
            return Response(
                {"error": "No file associated with this document"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Return file URL for frontend to handle download
        file_url = request.build_absolute_uri(document.file.file.url)
        return Response({"download_url": file_url})
