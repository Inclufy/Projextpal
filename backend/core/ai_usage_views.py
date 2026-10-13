"""
AI-usage endpoint — leest de rolling verbruikscounters uit `core.ai_usage`.

`GET /api/v1/ai/usage/` → verbruik per company van de ingelogde user.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .ai_usage import get_summary


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def ai_usage_summary(request):
    user = request.user
    company_id = getattr(user, "company_id", None) or getattr(getattr(user, "company", None), "id", None)
    return Response(get_summary(company_id))
