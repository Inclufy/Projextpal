from .views import PostProjectViewSet
from rest_framework.routers import DefaultRouter
from django.urls import path, include

router = DefaultRouter()
router.register(r'post-projects', PostProjectViewSet , basename='postproject')

urlpatterns = [
    path('', include(router.urls)),
]
