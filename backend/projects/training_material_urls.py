from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .training_material_views import TrainingMaterialViewSet

router = DefaultRouter()
router.register(
    r"training-materials", TrainingMaterialViewSet, basename="trainingmaterial"
)

urlpatterns = [
    path("", include(router.urls)),
]
