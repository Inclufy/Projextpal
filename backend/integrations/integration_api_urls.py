"""URL's voor de Inclufy Finance integratie-API (/api/v1/integration/…).

Bewust zónder trailing slash: de Finance-client roept
`…/documents/time-expense` aan; een APPEND_SLASH-redirect zou een POST
naar een GET kunnen degraderen.
"""

from django.urls import path

from .finance_api import documents_view

urlpatterns = [
    path("documents/<str:entity_type>", documents_view, name="finance-integration-documents"),
    path("documents/<str:entity_type>/", documents_view, name="finance-integration-documents-slash"),
]
