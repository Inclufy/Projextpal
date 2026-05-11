"""
Minimal governance app — AI generate endpoint only.

This is a stripped hotfix shipped to `github/main` so the production frontend's
`POST /api/v1/governance/ai/generate/` stops 404-ing. The full governance models
(Portfolio, Boards, Decisions, Meetings) live on `master` and will arrive via
the regular merge train; this hotfix only restores the single endpoint that the
AI Project Assistant on /projects depends on.
"""
import logging
import os

import requests as http_requests
from django.conf import settings
from rest_framework import status as http_status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

logger = logging.getLogger(__name__)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def ai_generate_text(request):
    """
    AI text generation endpoint used by the Generate-with-AI flow on /projects
    (and the program / charter helpers reusing the same callAI helper).

    Robustness rules to avoid Cloudflare 502s during live demos:
      * Always return HTTP 200 with a structured payload — never let an
        upstream LLM failure bubble up as a 502/504 to the edge. The frontend
        treats a missing `response` field as "no AI suggestion" and falls
        back to canned suggestions.
      * Hard-cap the upstream call at 25s — well under Cloudflare's ~100s
        edge timeout.
      * Cap output at 800 tokens.
    """
    prompt = request.data.get("prompt", "")
    if not prompt:
        return Response(
            {"error": "prompt is required"},
            status=http_status.HTTP_400_BAD_REQUEST,
        )

    api_key = getattr(settings, "OPENAI_API_KEY", None) or os.getenv("OPENAI_API_KEY")
    if not api_key or api_key.startswith("sk-test") or api_key.startswith("sk-your") or len(api_key) < 20:
        logger.warning(
            "ai_generate_text: OPENAI_API_KEY not configured or placeholder (%s...)",
            (api_key[:10] if api_key else "None"),
        )
        return Response({
            "success": False,
            "response": None,
            "error": "AI generation is temporarily unavailable. Manual entry available below.",
            "available": False,
        })

    try:
        api_response = http_requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": "You are a helpful project management expert. Respond concisely and professionally."},
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.7,
                "max_tokens": 800,
            },
            timeout=25,
        )
        api_response.raise_for_status()
        data = api_response.json()
        content = (data.get("choices") or [{}])[0].get("message", {}).get("content", "").strip()
        if not content:
            logger.warning("ai_generate_text: empty content from OpenAI")
            return Response({
                "success": False,
                "response": None,
                "error": "AI returned no content. Please try again or use a fallback suggestion.",
            })
        return Response({"success": True, "response": content})

    except http_requests.exceptions.Timeout:
        logger.warning("ai_generate_text: OpenAI API timeout (>25s)")
        return Response({
            "success": False,
            "response": None,
            "error": "AI generation timed out. Please try a shorter prompt or use a fallback suggestion.",
        })
    except http_requests.exceptions.RequestException as e:
        logger.error("ai_generate_text: OpenAI API error: %s", e)
        return Response({
            "success": False,
            "response": None,
            "error": "AI service is temporarily unreachable. Manual entry available below.",
        })
    except Exception as e:
        logger.exception("ai_generate_text: unexpected failure: %s", type(e).__name__)
        return Response({
            "success": False,
            "response": None,
            "error": "AI generation failed unexpectedly. Manual entry available below.",
        })
