from django.urls import path

from .views import ai_audit_log


urlpatterns = [
    path("log/", ai_audit_log, name="ai-audit-log"),
]
