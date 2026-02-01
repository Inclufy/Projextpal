from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import HasRole
from .models import PostProject
from .serializers import PostProjectSerializer

# Permission classes
IsAdminOrPM = HasRole("admin", "pm")

class PostProjectViewSet(viewsets.ModelViewSet):
    queryset = PostProject.objects.all()
    serializer_class = PostProjectSerializer
    permission_classes = [IsAuthenticated, IsAdminOrPM]

    def perform_create(self, serializer):
        """
        When creating a PostProject, automatically assign the company
        from the logged-in user's company.
        """
        serializer.save(company=self.request.user.company)

    def get_queryset(self):
        """
        Only return PostProjects for the logged-in user's company.
        """
        user = self.request.user
        if user.is_authenticated and hasattr(user, "company"):
            return PostProject.objects.filter(company=user.company)
        return PostProject.objects.none()
