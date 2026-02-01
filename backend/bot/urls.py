from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views


router = DefaultRouter()
router.register(r"chats", views.ChatViewSet, basename="chat")
urlpatterns = [
    path("", include(router.urls)),
    path(
        "project-analysis/<int:project_id>/",
        views.ProjectAnalysisAPIView.as_view(),
        name="project-analysis",
    ),
]

# Form submission endpoint
from bot.form_views import submit_form
urlpatterns += [
    path('form/submit/', submit_form, name='submit_form'),
]

# Public chat endpoint (no auth required)
from .public_chat import public_chat
urlpatterns += [
    path('public/', public_chat, name='public-chat'),
]
