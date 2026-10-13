"""
Shared helper that makes every AI endpoint aware of the project's
uploaded-documents context (ProjectAIContext).

Sprint 2 wired this into Plan with AI only. The follow-up (this module)
extends the same context to every other AI surface — Ask Co-pilot,
Governance AI generate, Risk Mitigation, Risk Forecast — so a tenant that
uploaded tender PDFs to a project sees that context echoed everywhere,
not just in the one place where it was built.

Design:
  - Single read-only helper, swallow-all on failure (tracking must never
    cause the LLM path to fail).
  - Tenant-safe: resolves the project only via the caller's accessible
    project queryset — a cross-tenant project_id yields an empty prefix.
  - Length-capped at 8 000 characters (same as ``ai_planner._project_context``)
    so we don't blow out prompt budgets.
"""
from __future__ import annotations

import logging
from typing import Optional

logger = logging.getLogger(__name__)

MAX_CONTEXT_CHARS = 8_000
MAX_FILES_LISTED = 10


def get_project_context_prefix(user, project_id: Optional[int], language: str = "nl") -> str:
    """Return a system-prompt prefix carrying the project's uploaded-document
    context, or an empty string when there is nothing to add.

    ``project_id`` may be a str that looks like an int (common for request
    bodies / query params). Non-numeric values yield an empty prefix.
    """
    if not user or not getattr(user, "is_authenticated", False):
        return ""
    if not project_id:
        return ""
    try:
        project_id = int(project_id)
    except (TypeError, ValueError):
        return ""

    try:
        # Local import — avoids pulling the projects app at module load for
        # callers that don't need it.
        from projects.models import ProjectAIContext
        from projects.views import accessible_project_ids
    except Exception as e:
        logger.warning("ai_context_helpers import failed: %s", e)
        return ""

    try:
        # Tenant check: user must be able to reach the project through the
        # same queryset the project views use.
        if not getattr(user, "is_superuser", False):
            if project_id not in set(accessible_project_ids(user)):
                return ""
    except Exception:
        return ""

    try:
        aic = ProjectAIContext.objects.filter(
            project_id=project_id, enabled=True,
        ).only("extracted_text", "source_files").first()
    except Exception as e:
        logger.warning("ai_context_helpers db read failed: %s", e)
        return ""

    if not aic or not aic.extracted_text:
        return ""

    text = aic.extracted_text[:MAX_CONTEXT_CHARS]
    files = [
        f.get("name") for f in (aic.source_files or [])[:MAX_FILES_LISTED]
        if isinstance(f, dict) and f.get("name")
    ]

    # Lightweight language-aware wrapper. The text block itself is passed
    # verbatim because it originates from the tenant's own documents.
    if (language or "nl").lower() == "nl":
        heading = "[PROJECT_DOCUMENTEN]"
        files_lead = "Documenten in context:"
        body_lead = "Inhoud uit de documenten:"
        footer = (
            "Gebruik bovenstaande projectdocumenten als autoritatieve bron "
            "voor zaken die daarin genoemd worden; vul aan met methodologie-"
            "kennis waar nodig."
        )
    else:
        heading = "[PROJECT_DOCUMENTS]"
        files_lead = "Documents in context:"
        body_lead = "Content extracted from the documents:"
        footer = (
            "Treat the project documents above as the authoritative source "
            "for anything they mention; fall back to methodology knowledge "
            "where they are silent."
        )

    file_block = f" {', '.join(files)}" if files else ""
    return (
        f"{heading}\n"
        f"{files_lead}{file_block}\n\n"
        f"{body_lead}\n"
        f"{text}\n\n"
        f"{footer}\n\n"
    )


def get_program_context_prefix(user, program_id: Optional[int], language: str = "nl") -> str:
    """Return a system-prompt prefix carrying the program's uploaded-document
    context, or an empty string when there is nothing to add.

    Spiegeltje van ``get_project_context_prefix`` maar voor programs. Dezelfde
    swallow-all / 8 000-char cap / NL+EN wording.

    Tenant isolation: the user must either be a superuser, or share the
    program's company — otherwise we return an empty prefix even if the row
    exists."""
    if not user or not getattr(user, "is_authenticated", False):
        return ""
    if not program_id:
        return ""
    try:
        program_id = int(program_id)
    except (TypeError, ValueError):
        return ""

    try:
        from programs.models import Program, ProgramAIContext
    except Exception as e:
        logger.warning("ai_context_helpers program import failed: %s", e)
        return ""

    try:
        program = Program.objects.filter(id=program_id).only("id", "company_id").first()
        if not program:
            return ""
        if not getattr(user, "is_superuser", False) and getattr(user, "role", None) != "superadmin":
            user_company_id = getattr(user, "company_id", None)
            if not user_company_id or user_company_id != program.company_id:
                return ""
    except Exception:
        return ""

    try:
        aic = ProgramAIContext.objects.filter(
            program_id=program_id, enabled=True,
        ).only("extracted_text", "source_files").first()
    except Exception as e:
        logger.warning("ai_context_helpers program db read failed: %s", e)
        return ""

    if not aic or not aic.extracted_text:
        return ""

    text = aic.extracted_text[:MAX_CONTEXT_CHARS]
    files = [
        f.get("name") for f in (aic.source_files or [])[:MAX_FILES_LISTED]
        if isinstance(f, dict) and f.get("name")
    ]

    if (language or "nl").lower() == "nl":
        heading = "[PROGRAMMA_DOCUMENTEN]"
        files_lead = "Documenten in context:"
        body_lead = "Inhoud uit de programmadocumenten:"
        footer = (
            "Gebruik bovenstaande programmadocumenten als autoritatieve bron "
            "voor zaken die daarin genoemd worden; vul aan met methodologie-"
            "kennis waar nodig."
        )
    else:
        heading = "[PROGRAM_DOCUMENTS]"
        files_lead = "Documents in context:"
        body_lead = "Content extracted from the program documents:"
        footer = (
            "Treat the program documents above as the authoritative source "
            "for anything they mention; fall back to methodology knowledge "
            "where they are silent."
        )

    file_block = f" {', '.join(files)}" if files else ""
    return (
        f"{heading}\n"
        f"{files_lead}{file_block}\n\n"
        f"{body_lead}\n"
        f"{text}\n\n"
        f"{footer}\n\n"
    )


def get_portfolio_context_prefix(user, portfolio_id, language: str = "nl") -> str:
    """Return a system-prompt prefix carrying the portfolio's uploaded-document
    context, or an empty string when there is nothing to add.

    ``portfolio_id`` is a UUID (string). Non-UUID values yield an empty prefix.

    Tenant isolation: superuser sees any; other users must share the
    portfolio's company."""
    if not user or not getattr(user, "is_authenticated", False):
        return ""
    if not portfolio_id:
        return ""

    # Accept both uuid.UUID and str; reject obvious garbage early.
    try:
        import uuid as _uuid
        portfolio_uuid = _uuid.UUID(str(portfolio_id))
    except (TypeError, ValueError):
        return ""

    try:
        from governance.models import Portfolio, PortfolioAIContext
    except Exception as e:
        logger.warning("ai_context_helpers portfolio import failed: %s", e)
        return ""

    try:
        portfolio = Portfolio.objects.filter(id=portfolio_uuid).only("id", "company_id").first()
        if not portfolio:
            return ""
        if not getattr(user, "is_superuser", False) and getattr(user, "role", None) != "superadmin":
            user_company_id = getattr(user, "company_id", None)
            if not user_company_id or user_company_id != portfolio.company_id:
                return ""
    except Exception:
        return ""

    try:
        aic = PortfolioAIContext.objects.filter(
            portfolio_id=portfolio_uuid, enabled=True,
        ).only("extracted_text", "source_files").first()
    except Exception as e:
        logger.warning("ai_context_helpers portfolio db read failed: %s", e)
        return ""

    if not aic or not aic.extracted_text:
        return ""

    text = aic.extracted_text[:MAX_CONTEXT_CHARS]
    files = [
        f.get("name") for f in (aic.source_files or [])[:MAX_FILES_LISTED]
        if isinstance(f, dict) and f.get("name")
    ]

    if (language or "nl").lower() == "nl":
        heading = "[PORTFOLIO_DOCUMENTEN]"
        files_lead = "Documenten in context:"
        body_lead = "Inhoud uit de portfoliodocumenten:"
        footer = (
            "Gebruik bovenstaande portfoliodocumenten als autoritatieve bron "
            "voor zaken die daarin genoemd worden; vul aan met methodologie-"
            "kennis waar nodig."
        )
    else:
        heading = "[PORTFOLIO_DOCUMENTS]"
        files_lead = "Documents in context:"
        body_lead = "Content extracted from the portfolio documents:"
        footer = (
            "Treat the portfolio documents above as the authoritative source "
            "for anything they mention; fall back to methodology knowledge "
            "where they are silent."
        )

    file_block = f" {', '.join(files)}" if files else ""
    return (
        f"{heading}\n"
        f"{files_lead}{file_block}\n\n"
        f"{body_lead}\n"
        f"{text}\n\n"
        f"{footer}\n\n"
    )
