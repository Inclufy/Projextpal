from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from accounts.permissions import HasRole
from .models import (
    ProgramCharter,
    ScopeCapability,
    CriticalInterdependency,
    KeyRisk,
    KeyDeliverable,
    Resource,
    Dependency,
)
from .serializers import (
    ProgramCharterSerializer,
    ScopeCapabilitySerializer,
    CriticalInterdependencySerializer,
    KeyRiskSerializer,
    KeyDeliverableSerializer,
    ResourceSerializer,
    DependencySerializer,
)

# Permission classes
IsAdminOrPM = HasRole("admin", "pm")
IsAdminOrPMOrContributor = HasRole("admin", "pm", "contibuter")
IsAdminOrPMOrContributorOrReviewer = HasRole("admin", "pm", "contibuter", "reviewer")


class ProgramCharterViewSet(viewsets.ModelViewSet):
    serializer_class = ProgramCharterSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsAdminOrPMOrContributor()]

    def get_queryset(self):
        # Filter by company to ensure users only see their company's charters
        user = self.request.user
        if not user.is_authenticated or not hasattr(user, 'company') or not user.company:
            return ProgramCharter.objects.none()
        
        queryset = ProgramCharter.objects.filter(project__company=user.company)
        project = self.request.query_params.get("project")
        latest = self.request.query_params.get("latest")

        if project:
            queryset = queryset.filter(project_id=project)

        if latest and latest.lower() == "true":
            return queryset.order_by("-version")[:1]

        return queryset

    def update(self, request, *args, **kwargs):
        """
        Override update to create new version instead of updating existing one
        """
        partial = kwargs.pop("partial", False)
        instance = self.get_object()

        # Check if client wants to create new version (default behavior)
        create_new_version = request.data.get("create_new_version", True)

        if create_new_version:
            # Create new version with updated data
            updated_fields = {}
            for field, value in request.data.items():
                if field != "create_new_version" and hasattr(instance, field):
                    updated_fields[field] = value

            try:
                new_instance = instance.create_new_version(**updated_fields)
                serializer = self.get_serializer(new_instance)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response(
                    {"error": f"Failed to create new version: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            # Standard update behavior (updates existing record)
            return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        """Handle PATCH requests with versioning"""
        kwargs["partial"] = True
        return self.update(request, *args, **kwargs)

    @action(detail=True, methods=["post"])
    def create_version(self, request, pk=None):
        """
        Create a new version of an existing charter
        POST /api/charters/{id}/create_version/
        """
        instance = self.get_object()

        # Get updated fields from request
        updated_fields = {}
        for field, value in request.data.items():
            if hasattr(instance, field):
                updated_fields[field] = value

        try:
            new_instance = instance.create_new_version(**updated_fields)
            serializer = self.get_serializer(new_instance)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {"error": f"Failed to create new version: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=True, methods=["get"])
    def versions(self, request, pk=None):
        """
        Get all versions of a charter
        GET /api/charters/{id}/versions/
        """
        instance = self.get_object()
        all_versions = instance.get_all_versions()
        serializer = self.get_serializer(all_versions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def latest(self, request, pk=None):
        """
        Get the latest version of a charter
        GET /api/charters/{id}/latest/
        """
        instance = self.get_object()
        latest_version = instance.get_latest_version()
        if latest_version:
            serializer = self.get_serializer(latest_version)
            return Response(serializer.data)
        else:
            return Response(
                {"error": "No versions found"}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=["get"])
    def by_project(self, request):
        """
        Get charters by project with optional latest filter
        GET /api/charters/by_project/?project_id=1&latest=true
        """
        project_id = request.query_params.get("project_id")
        latest_only = request.query_params.get("latest", "false").lower() == "true"

        if not project_id:
            return Response(
                {"error": "project_id parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        queryset = ProgramCharter.objects.filter(project_id=project_id)

        if latest_only:
            # Get only the latest version for each project
            queryset = queryset.order_by("-version")[:1]

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def lock(self, request, pk=None):
        """Lock a charter version to prevent editing"""
        instance = self.get_object()
        instance.locked = True
        instance.save()
        return Response({"message": "Charter version locked successfully"})

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.locked:
            return Response(
                {"error": "This charter version is locked and cannot be deleted."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().destroy(request, *args, **kwargs)


class ScopeCapabilityViewSet(viewsets.ModelViewSet):
    queryset = ScopeCapability.objects.all()
    serializer_class = ScopeCapabilitySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["charter"]
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsAdminOrPMOrContributor()]

    def get_queryset(self):
        # Filter by company through charter
        user = self.request.user
        if not user.is_authenticated or not hasattr(user, 'company') or not user.company:
            return ScopeCapability.objects.none()
        
        return ScopeCapability.objects.filter(charter__project__company=user.company)


class CriticalInterdependencyViewSet(viewsets.ModelViewSet):
    queryset = CriticalInterdependency.objects.all()
    serializer_class = CriticalInterdependencySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["charter"]
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsAdminOrPMOrContributor()]

    def get_queryset(self):
        # Filter by company through charter
        user = self.request.user
        if not user.is_authenticated or not hasattr(user, 'company') or not user.company:
            return CriticalInterdependency.objects.none()
        
        return CriticalInterdependency.objects.filter(charter__project__company=user.company)


class KeyRiskViewSet(viewsets.ModelViewSet):
    queryset = KeyRisk.objects.all()
    serializer_class = KeyRiskSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["charter"]
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsAdminOrPMOrContributor()]

    def get_queryset(self):
        # Filter by company through charter
        user = self.request.user
        if not user.is_authenticated or not hasattr(user, 'company') or not user.company:
            return KeyRisk.objects.none()
        
        return KeyRisk.objects.filter(charter__project__company=user.company)


class KeyDeliverableViewSet(viewsets.ModelViewSet):
    queryset = KeyDeliverable.objects.all()
    serializer_class = KeyDeliverableSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["charter"]
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsAdminOrPMOrContributor()]

    def get_queryset(self):
        # Filter by company through charter
        user = self.request.user
        if not user.is_authenticated or not hasattr(user, 'company') or not user.company:
            return KeyDeliverable.objects.none()
        
        return KeyDeliverable.objects.filter(charter__project__company=user.company)


class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["charter"]
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsAdminOrPMOrContributor()]

    def get_queryset(self):
        # Filter by company through charter
        user = self.request.user
        if not user.is_authenticated or not hasattr(user, 'company') or not user.company:
            return Resource.objects.none()
        
        return Resource.objects.filter(charter__project__company=user.company)


# views.py
class DependencyViewSet(viewsets.ModelViewSet):
    queryset = Dependency.objects.all()
    serializer_class = DependencySerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsAdminOrPMOrContributor()]

    def get_queryset(self):
        # Filter by company through project (Dependency has direct project relationship)
        user = self.request.user
        if not user.is_authenticated or not hasattr(user, 'company') or not user.company:
            return Dependency.objects.none()
        
        queryset = Dependency.objects.filter(project__company=user.company)
        project_id = self.request.query_params.get("project")
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset

    def perform_create(self, serializer):
        project_id = self.kwargs.get("project_id")
        if project_id:
            serializer.save(project_id=project_id)
        else:
            serializer.save()
