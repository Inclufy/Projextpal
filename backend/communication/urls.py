from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .ai_minutes_views import AIMeetingMinutesView

router = DefaultRouter()
router.register(r'status-reports', views.StatusReportViewSet, basename='status-reports')
router.register(r'training-materials', views.TrainingMaterialViewSet, basename='training-materials')
router.register(r'reporting-items', views.ReportingItemViewSet, basename='reporting-items')
router.register(r'meetings', views.MeetingViewSet, basename='meetings')
router.register(r'generated-status-reports', views.GeneratedStatusReportViewSet, basename='generated-status-reports')
router.register(r'methodology-reports', views.MethodologyReportViewSet, basename='methodology-reports')

urlpatterns = [
    path('', include(router.urls)),
    path(
        'projects/<int:project_id>/meetings/ai-minutes/',
        AIMeetingMinutesView.as_view(),
        name='ai-meeting-minutes',
    ),
]