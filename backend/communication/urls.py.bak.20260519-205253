from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'status-reports', views.StatusReportViewSet, basename='status-reports')
router.register(r'training-materials', views.TrainingMaterialViewSet, basename='training-materials')
router.register(r'reporting-items', views.ReportingItemViewSet, basename='reporting-items')
router.register(r'meetings', views.MeetingViewSet, basename='meetings')

urlpatterns = [
    path('', include(router.urls)),
]