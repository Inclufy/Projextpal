"""
Create a project draft from uploaded documents (tenders, briefs, specs).

Elisa (Re-care) heeft stapels aanbestedings-PDF's die alle eisen en wensen
bevatten. In plaats van die handmatig te vertalen naar project + milestones +
taken, kan ze straks de bestanden slepen → endpoint extraheert tekst → LLM
destilleert een project-concept (naam, beschrijving, scope, milestones) uit
de context → gebruiker bekijkt en bevestigt.

Endpoint:
  POST /api/v1/projects/plan-from-documents/
    multipart/form-data: files=<pdf>, files=<pdf>, …  (+ optional "hint")

Return:
  {
    "name": "…",
    "description": "…",
    "scope_in": "…",
    "scope_out": "…",
    "deliverables": [...],
    "suggested_milestones": [{name, description, due_offset_weeks}, ...],
    "extracted_pages": 42,
    "extracted_text_preview": "…1500 chars…",
    "source": "ai" | "fallback",
  }

Harde grenzen:
  - 10 bestanden per request
  - 15 MB per bestand
  - 50_000 karakters tekst doorgegeven aan LLM
"""
from __future__ import annotations

import io
import json
import logging
from typing import List, Tuple

from django.conf import settings
from rest_framework.decorators import api_view, parser_classes, permission_classes, throttle_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle

from core.i18n_ai import resolve_ui_language, prepend_language
from core.llm_keys import get_openai_client, get_anthropic_client

logger = logging.getLogger(__name__)

MAX_FILES = 10
MAX_BYTES_PER_FILE = 15 * 1024 * 1024
MAX_TEXT_CHARS = 50_000
PREVIEW_CHARS = 1500


class _AiThrottle(UserRateThrottle):
    scope = "ai"


def _extract_pdf_text(fobj) -> Tuple[str, int]:
    """Return (text, pages). Empty text if the PDF has no text layer."""
    try:
        import pdfplumber
    except Exception:
        logger.warning("pdfplumber not installed — plan-from-documents cannot extract text")
        return "", 0
    try:
        text_parts: List[str] = []
        with pdfplumber.open(fobj) as pdf:
            pages = len(pdf.pages)
            for p in pdf.pages:
                try:
                    t = p.extract_text() or ""
                except Exception:
                    t = ""
                if t.strip():
                    text_parts.append(t)
        return "\n\n".join(text_parts), pages
    except Exception as e:
        logger.warning("pdfplumber extract failed: %s", e)
        return "", 0


def _extract_text_any(filename: str, data: bytes) -> Tuple[str, int]:
    """Minimalistische text-extractor voor PDF / plain text. .docx-support
    kan later via python-docx worden toegevoegd."""
    lower = (filename or "").lower()
    if lower.endswith(".pdf"):
        return _extract_pdf_text(io.BytesIO(data))
    if lower.endswith((".txt", ".md", ".csv")):
        try:
            return data.decode("utf-8", errors="ignore"), 1
        except Exception:
            return "", 0
    return "", 0


_SYSTEM_PROMPT = (
    "Je destilleert uit aanbestedings- en projectdocumenten een beknopt "
    "projectconcept voor een project-management tool. Houd je strikt aan "
    "het JSON-contract hieronder — geen prose, geen uitleg, alleen JSON.\n\n"
    "Contract:\n"
    "{\n"
    "  \"name\": \"max 80 tekens — kernnaam van het project\",\n"
    "  \"description\": \"2-4 zinnen — doel + context\",\n"
    "  \"scope_in\": \"wat valt binnen de opdracht\",\n"
    "  \"scope_out\": \"wat valt expliciet buiten\",\n"
    "  \"deliverables\": [\"opleverprodukt 1\", \"opleverprodukt 2\", ...],\n"
    "  \"suggested_milestones\": [\n"
    "    {\"name\": \"...\", \"description\": \"...\", \"due_offset_weeks\": 4},\n"
    "    ...\n"
    "  ],\n"
    "  \"suggested_methodology\": \"EEN van: prince2, scrum, kanban, waterfall, agile, "
    "lean_six_sigma_green, lean_six_sigma_black, hybrid, inclufy\",\n"
    "  \"methodology_confidence\": 0-100 (integer, hoe zeker ben je op basis van de documenten),\n"
    "  \"methodology_reason\": \"1 zin — waarom deze methodologie bij deze documenten past\"\n"
    "}\n\n"
    "Als het document weinig concreets zegt: wees voorzichtig en laat velden "
    "leeg in plaats van verzinnen. Beperk tot max 6 milestones. Een aanbesteding/"
    "tender wijst doorgaans op PRINCE2 of waterfall; een MVP/sprint-tekst op scrum; "
    "support/ticket/flow-tekst op kanban; procesoptimalisatie met data op "
    "lean_six_sigma_green."
)

# Valid methodology slugs — mirror ``projects.tailoring.PROJECT_MODULES`` keys.
_VALID_METHODOLOGIES = {
    "prince2", "scrum", "kanban", "waterfall", "agile",
    "lean_six_sigma_green", "lean_six_sigma_black", "hybrid", "inclufy",
}


def _fallback_from_text(text: str) -> dict:
    """Deterministisch sjabloon als geen LLM-key: pak eerste regel als naam,
    eerste alinea als beschrijving, geen milestones."""
    stripped = (text or "").strip()
    first_line = stripped.splitlines()[0] if stripped else ""
    name = (first_line[:80] or "Nieuw project uit documenten").strip()
    paragraphs = [p.strip() for p in stripped.split("\n\n") if p.strip()]
    description = (paragraphs[0] if paragraphs else "")[:400]
    return {
        "name": name,
        "description": description,
        "scope_in": "",
        "scope_out": "",
        "deliverables": [],
        "suggested_milestones": [],
    }


def _call_llm(company, system: str, user_text: str) -> dict | None:
    """OpenAI eerst (snel + goedkoop), fallback naar Anthropic. Houdt
    verbruik bij via core.ai_usage."""
    from core import ai_usage

    # OpenAI
    try:
        oc = get_openai_client(company)
        if oc is not None:
            resp = oc.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user_text},
                ],
                temperature=0.2,
                max_tokens=2000,
                response_format={"type": "json_object"},
            )
            try:
                usage = getattr(resp, "usage", None)
                ai_usage.record(getattr(company, "id", None),
                                int(getattr(usage, "total_tokens", 0) or 0) if usage else 0,
                                provider="openai")
            except Exception:
                pass
            content = resp.choices[0].message.content or ""
            try:
                return json.loads(content)
            except Exception:
                pass
    except Exception as e:
        logger.info("plan-from-doc OpenAI call failed: %s", e)

    # Anthropic (als valide model-id beschikbaar is)
    try:
        ac = get_anthropic_client(company)
        if ac is not None:
            resp = ac.messages.create(
                model="claude-opus-4-7",
                max_tokens=2000,
                system=system,
                messages=[{"role": "user", "content": user_text}],
            )
            try:
                ai_usage.record(getattr(company, "id", None),
                                ai_usage.tokens_from_anthropic(resp), provider="anthropic")
            except Exception:
                pass
            raw = "".join(b.text for b in resp.content if getattr(b, "type", "") == "text")
            if raw.startswith("```"):
                raw = raw.split("```", 2)[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            try:
                return json.loads(raw)
            except Exception:
                pass
    except Exception as e:
        logger.info("plan-from-doc Anthropic call failed: %s", e)

    return None


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser])
@throttle_classes([_AiThrottle])
def plan_from_documents(request):
    """Zie module docstring voor contract."""
    files = request.FILES.getlist("files") or []
    if not files:
        return Response({"detail": "Minstens één bestand is vereist (field name: 'files')."}, status=400)
    if len(files) > MAX_FILES:
        return Response({"detail": f"Max {MAX_FILES} bestanden per keer."}, status=400)

    hint = (request.data.get("hint") or "").strip()

    combined_text_parts: List[str] = []
    total_pages = 0
    skipped: List[dict] = []
    for f in files:
        size = getattr(f, "size", 0) or 0
        name = getattr(f, "name", "")
        if size > MAX_BYTES_PER_FILE:
            skipped.append({"name": name, "reason": f"too large ({size} bytes)"})
            continue
        data = f.read()
        text, pages = _extract_text_any(name, data)
        if not text:
            skipped.append({"name": name, "reason": "no text extracted"})
            continue
        combined_text_parts.append(f"--- {name} ---\n{text}")
        total_pages += pages

    combined = "\n\n".join(combined_text_parts)
    truncated = combined[:MAX_TEXT_CHARS]

    if not truncated.strip():
        return Response({
            "detail": "Geen tekst gevonden in de uploads. Zijn het gescande PDF's zonder OCR?",
            "skipped": skipped,
        }, status=422)

    lang = resolve_ui_language(request)
    system = prepend_language(_SYSTEM_PROMPT, lang)
    user_block = (
        (f"Hint van gebruiker:\n{hint}\n\n" if hint else "")
        + "Documentatie-inhoud:\n"
        + truncated
    )

    company = getattr(request.user, "company", None)
    result = _call_llm(company, system, user_block)
    source = "ai"
    if not result:
        result = _fallback_from_text(truncated)
        source = "fallback"

    # Normalise + harden structure (never trust the LLM to produce valid shape).
    def _s(x, limit=400):
        return str(x or "")[:limit].strip()

    milestones = []
    for m in (result.get("suggested_milestones") or [])[:6]:
        if isinstance(m, dict) and m.get("name"):
            milestones.append({
                "name": _s(m.get("name"), 120),
                "description": _s(m.get("description"), 400),
                "due_offset_weeks": int(m.get("due_offset_weeks") or 0),
            })

    deliverables = [
        _s(d, 160) for d in (result.get("deliverables") or [])[:10]
        if _s(d)
    ]

    # S2-03: harden the methodology-suggestion fields so the frontend chip can
    # trust the shape. We only emit a suggestion when:
    #   - the LLM path ran (fallback would have no basis for an opinion), AND
    #   - the slug is one we actually surface, AND
    #   - the confidence is numeric 0..100.
    suggested_methodology = None
    methodology_confidence = 0
    methodology_reason = ""
    if source == "ai":
        raw_meth = result.get("suggested_methodology")
        if isinstance(raw_meth, str) and raw_meth.strip().lower() in _VALID_METHODOLOGIES:
            suggested_methodology = raw_meth.strip().lower()
            try:
                methodology_confidence = max(0, min(100, int(result.get("methodology_confidence") or 0)))
            except (TypeError, ValueError):
                methodology_confidence = 0
            methodology_reason = _s(result.get("methodology_reason"), 400)

    return Response({
        "name": _s(result.get("name"), 80) or "Nieuw project",
        "description": _s(result.get("description"), 1200),
        "scope_in": _s(result.get("scope_in"), 1000),
        "scope_out": _s(result.get("scope_out"), 1000),
        "deliverables": deliverables,
        "suggested_milestones": milestones,
        "suggested_methodology": suggested_methodology,
        "methodology_confidence": methodology_confidence,
        "methodology_reason": methodology_reason,
        "extracted_pages": total_pages,
        "extracted_text_preview": truncated[:PREVIEW_CHARS],
        "skipped": skipped,
        "source": source,
    })
