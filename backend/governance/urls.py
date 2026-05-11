from django.urls import path

from .views import ai_generate_text

urlpatterns = [
    path("ai/generate/", ai_generate_text, name="ai-generate-text"),
]
