from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q

from accounts.permissions import HasRole
from .models import TrainingMaterial, Project, Upload
from .serializers import TrainingMaterialSerializer, TrainingMaterialListSerializer
from .views import CompanyScopedQuerysetMixin


class TrainingMaterialViewSet(CompanyScopedQuerysetMixin, viewsets.ModelViewSet):
    """ViewSet for managing project training materials"""

    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated()]
        return [IsAuthenticated(), HasRole("admin", "pm", "team_member")()]

    def get_queryset(self):
        """Filter training materials by company and project"""
        base_qs = TrainingMaterial.objects.select_related(
            "project", "file", "created_by"
        )

        user = self.request.user
        if not user.is_authenticated or not getattr(user, "company", None):
            return TrainingMaterial.objects.none()

        # Filter by company
        base_qs = base_qs.filter(project__company=user.company)

        # Filter by project if specified
        project_id = self.request.query_params.get("project_id")
        if project_id:
            base_qs = base_qs.filter(project_id=project_id)

        # Filter by audience if specified
        audience = self.request.query_params.get("audience")
        if audience:
            base_qs = base_qs.filter(audience=audience)

        # Filter by format if specified
        format_type = self.request.query_params.get("format_type")
        if format_type:
            base_qs = base_qs.filter(format_type=format_type)

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
            return TrainingMaterialListSerializer
        return TrainingMaterialSerializer

    def perform_create(self, serializer):
        """Set the project and handle optional file reference"""
        project_id = self.request.data.get("project")
        if not project_id:
            raise ValueError("Project ID is required")

        project = get_object_or_404(
            Project, id=project_id, company=self.request.user.company
        )

        # Handle optional file reference (file should already be uploaded)
        file_id = self.request.data.get("file")
        upload = None
        if file_id:
            try:
                upload = Upload.objects.get(
                    id=file_id, company=self.request.user.company
                )
            except Upload.DoesNotExist:
                raise ValueError("File not found or access denied")

        # Save training material with optional upload reference
        serializer.save(project=project, file=upload)

    @action(detail=True, methods=["get"])
    def download(self, request, pk=None):
        """Download training material file"""
        training_material = self.get_object()

        if not training_material.file or not training_material.file.file:
            return Response(
                {"error": "No file associated with this training material"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Return file URL for frontend to handle download
        file_url = request.build_absolute_uri(training_material.file.file.url)
        return Response({"download_url": file_url})

    @action(detail=False, methods=["get"])
    def by_audience(self, request):
        """Get training materials by audience"""
        audience = request.query_params.get("audience")
        if not audience:
            return Response(
                {"error": "audience parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        materials = self.get_queryset().filter(audience=audience)
        serializer = TrainingMaterialListSerializer(
            materials, many=True, context={"request": request}
        )
        return Response(serializer.data)
