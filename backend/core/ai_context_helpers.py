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

Sprint 6 additions:
  - Every call that produces a non-empty prefix is logged to
    ``ai_audit.AIContextAccessLog`` (``surface`` identifies the caller).
  - Per-document ``enabled`` flag on ``source_files`` entries filters which
    documents the extracted text window represents (backward-compatible:
    missing flag defaults to True).
  - Per-tenant feature flag ``ai_context_enabled`` can disable the whole
    context-injection path from the admin side.
  - A ``details`` return mode gives callers the structured
    ``ai_context_used`` block they echo back to the frontend.
"""
from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

MAX_CONTEXT_CHARS = 8_000
MAX_FILES_LISTED = 10


def _tenant_feature_enabled(company, feature_name: str) -> bool:
    """Return False only if the tenant has an explicit flag row disabling
    the feature. Missing row / import failure / no company → True (fail-open
    on configuration gaps, so a half-migrated tenant still sees context)."""
    if company is None:
        return True
    try:
        from accounts.models import TenantAIFeatureFlags
        return TenantAIFeatureFlags.is_enabled(company, feature_name)
    except Exception as e:
        logger.warning("ai_context_helpers tenant flag read failed: %s", e)
        return True


def _enabled_source_files(raw: Optional[List[Any]]) -> List[Dict[str, Any]]:
    """Backward-compatible filter: entries without an ``enabled`` key are
    treated as enabled (True)."""
    out: List[Dict[str, Any]] = []
    for item in raw or []:
        if not isinstance(item, dict):
            continue
        if item.get("enabled", True) is False:
            continue
        out.append(item)
    return out


def _log_access(
    *,
    user,
    context_type: str,
    context_id,
    surface: str,
    chars_used: int,
    company=None,
) -> None:
    """Thin indirection so unit tests can monkey-patch audit logging and so
    an import failure of the audit app can never bubble up."""
    try:
        from ai_audit.models import log_access as _log
    except Exception as e:
        logger.warning("ai_audit import failed: %s", e)
        return
    _log(
        user=user,
        context_type=context_type,
        context_id=context_id,
        surface=surface,
        chars_used=chars_used,
        company=company,
    )


def _build_prefix(
    *,
    text: str,
    files: List[Dict[str, Any]],
    language: str,
    heading_nl: str,
    heading_en: str,
    body_lead_nl: str,
    body_lead_en: str,
    footer_nl: str,
    footer_en: str,
) -> str:
    if (language or "nl").lower() == "nl":
        heading = heading_nl
        files_lead = "Documenten in context:"
        body_lead = body_lead_nl
        footer = footer_nl
    else:
        heading = heading_en
        files_lead = "Documents in context:"
        body_lead = body_lead_en
        footer = footer_en
    names = [f.get("name") for f in files[:MAX_FILES_LISTED] if isinstance(f, dict) and f.get("name")]
    file_block = f" {', '.join(names)}" if names else ""
    return (
        f"{heading}\n"
        f"{files_lead}{file_block}\n\n"
        f"{body_lead}\n"
        f"{text}\n\n"
        f"{footer}\n\n"
    )


def _usage_details(prefix: str, files: List[Dict[str, Any]], surface: str) -> Dict[str, Any]:
    """Build the ``ai_context_used`` block the frontend renders under each
    AI response (Sprint 6 — S6-07)."""
    doc_block = []
    for f in files[:MAX_FILES_LISTED]:
        if not isinstance(f, dict):
            continue
        doc_block.append({
            "name": f.get("name"),
            "bytes_used": int(f.get("size") or 0),
            "pages": int(f.get("pages") or 0),
        })
    return {
        "chars": len(prefix or ""),
        "documents": doc_block,
        "surfaces": [surface] if surface else [],
    }


# --------------------------------------------------------------------------
# PROJECT
# --------------------------------------------------------------------------
def get_project_context_prefix(
    user,
    project_id: Optional[int],
    language: str = "nl",
    surface: str = "unknown",
) -> str:
    """Return a system-prompt prefix carrying the project's uploaded-document
    context, or an empty string when there is nothing to add.

    ``project_id`` may be a str that looks like an int (common for request
    bodies / query params). Non-numeric values yield an empty prefix.
    """
    out = _project_prefix_impl(user, project_id, language, surface, log=True)
    return out["prefix"]


def get_project_context_details(
    user,
    project_id: Optional[int],
    language: str = "nl",
    surface: str = "unknown",
    log: bool = True,
) -> Dict[str, Any]:
    """Structured variant used by endpoints that return ``ai_context_used``
    to the frontend. Returns ``{prefix, used}``. Pass ``log=False`` when
    the same context has already been consumed and audit-logged elsewhere
    in the same request so the view-layer visualisation does not double-log."""
    return _project_prefix_impl(user, project_id, language, surface, log=log)


def _project_prefix_impl(user, project_id, language, surface, log=True):
    empty = {"prefix": "", "used": None}
    if not user or not getattr(user, "is_authenticated", False):
        return empty
    if not project_id:
        return empty
    try:
        project_id = int(project_id)
    except (TypeError, ValueError):
        return empty

    try:
        from projects.models import ProjectAIContext
        from projects.views import accessible_project_ids
    except Exception as e:
        logger.warning("ai_context_helpers import failed: %s", e)
        return empty

    try:
        if not getattr(user, "is_superuser", False):
            if project_id not in set(accessible_project_ids(user)):
                return empty
    except Exception:
        return empty

    try:
        aic = ProjectAIContext.objects.filter(
            project_id=project_id, enabled=True,
        ).select_related("project").first()
    except Exception as e:
        logger.warning("ai_context_helpers db read failed: %s", e)
        return empty

    if not aic:
        return empty

    company = getattr(getattr(aic, "project", None), "company", None)
    if not _tenant_feature_enabled(company, "ai_context_enabled"):
        return empty

    files = _enabled_source_files(aic.source_files)
    text = (aic.extracted_text or "")[:MAX_CONTEXT_CHARS]
    if not text:
        return empty

    prefix = _build_prefix(
        text=text, files=files, language=language,
        heading_nl="[PROJECT_DOCUMENTEN]",
        heading_en="[PROJECT_DOCUMENTS]",
        body_lead_nl="Inhoud uit de documenten:",
        body_lead_en="Content extracted from the documents:",
        footer_nl=(
            "Gebruik bovenstaande projectdocumenten als autoritatieve bron "
            "voor zaken die daarin genoemd worden; vul aan met methodologie-"
            "kennis waar nodig."
        ),
        footer_en=(
            "Treat the project documents above as the authoritative source "
            "for anything they mention; fall back to methodology knowledge "
            "where they are silent."
        ),
    )
    if log:
        _log_access(
            user=user,
            context_type="project",
            context_id=project_id,
            surface=surface,
            chars_used=len(prefix),
            company=company,
        )
    return {"prefix": prefix, "used": _usage_details(prefix, files, surface)}


# --------------------------------------------------------------------------
# PROGRAM
# --------------------------------------------------------------------------
def get_program_context_prefix(
    user,
    program_id: Optional[int],
    language: str = "nl",
    surface: str = "unknown",
) -> str:
    return _program_prefix_impl(user, program_id, language, surface, log=True)["prefix"]


def get_program_context_details(
    user,
    program_id: Optional[int],
    language: str = "nl",
    surface: str = "unknown",
    log: bool = True,
) -> Dict[str, Any]:
    return _program_prefix_impl(user, program_id, language, surface, log=log)


def _program_prefix_impl(user, program_id, language, surface, log=True):
    empty = {"prefix": "", "used": None}
    if not user or not getattr(user, "is_authenticated", False):
        return empty
    if not program_id:
        return empty
    try:
        program_id = int(program_id)
    except (TypeError, ValueError):
        return empty

    try:
        from programs.models import Program, ProgramAIContext
    except Exception as e:
        logger.warning("ai_context_helpers program import failed: %s", e)
        return empty

    try:
        program = Program.objects.filter(id=program_id).only("id", "company_id").first()
        if not program:
            return empty
        if not getattr(user, "is_superuser", False) and getattr(user, "role", None) != "superadmin":
            user_company_id = getattr(user, "company_id", None)
            if not user_company_id or user_company_id != program.company_id:
                return empty
    except Exception:
        return empty

    try:
        aic = ProgramAIContext.objects.filter(
            program_id=program_id, enabled=True,
        ).first()
    except Exception as e:
        logger.warning("ai_context_helpers program db read failed: %s", e)
        return empty

    if not aic:
        return empty

    try:
        from accounts.models import Company
        company = Company.objects.filter(id=program.company_id).first()
    except Exception:
        company = None

    if not _tenant_feature_enabled(company, "ai_context_enabled"):
        return empty

    files = _enabled_source_files(aic.source_files)
    text = (aic.extracted_text or "")[:MAX_CONTEXT_CHARS]
    if not text:
        return empty

    prefix = _build_prefix(
        text=text, files=files, language=language,
        heading_nl="[PROGRAMMA_DOCUMENTEN]",
        heading_en="[PROGRAM_DOCUMENTS]",
        body_lead_nl="Inhoud uit de programmadocumenten:",
        body_lead_en="Content extracted from the program documents:",
        footer_nl=(
            "Gebruik bovenstaande programmadocumenten als autoritatieve bron "
            "voor zaken die daarin genoemd worden; vul aan met methodologie-"
            "kennis waar nodig."
        ),
        footer_en=(
            "Treat the program documents above as the authoritative source "
            "for anything they mention; fall back to methodology knowledge "
            "where they are silent."
        ),
    )
    if log:
        _log_access(
            user=user,
            context_type="program",
            context_id=program_id,
            surface=surface,
            chars_used=len(prefix),
            company=company,
        )
    return {"prefix": prefix, "used": _usage_details(prefix, files, surface)}


# --------------------------------------------------------------------------
# PORTFOLIO
# --------------------------------------------------------------------------
def get_portfolio_context_prefix(
    user,
    portfolio_id,
    language: str = "nl",
    surface: str = "unknown",
) -> str:
    return _portfolio_prefix_impl(user, portfolio_id, language, surface, log=True)["prefix"]


def get_portfolio_context_details(
    user,
    portfolio_id,
    language: str = "nl",
    surface: str = "unknown",
    log: bool = True,
) -> Dict[str, Any]:
    return _portfolio_prefix_impl(user, portfolio_id, language, surface, log=log)


def _portfolio_prefix_impl(user, portfolio_id, language, surface, log=True):
    empty = {"prefix": "", "used": None}
    if not user or not getattr(user, "is_authenticated", False):
        return empty
    if not portfolio_id:
        return empty

    try:
        import uuid as _uuid
        portfolio_uuid = _uuid.UUID(str(portfolio_id))
    except (TypeError, ValueError):
        return empty

    try:
        from governance.models import Portfolio, PortfolioAIContext
    except Exception as e:
        logger.warning("ai_context_helpers portfolio import failed: %s", e)
        return empty

    try:
        portfolio = Portfolio.objects.filter(id=portfolio_uuid).only("id", "company_id").first()
        if not portfolio:
            return empty
        if not getattr(user, "is_superuser", False) and getattr(user, "role", None) != "superadmin":
            user_company_id = getattr(user, "company_id", None)
            if not user_company_id or user_company_id != portfolio.company_id:
                return empty
    except Exception:
        return empty

    try:
        aic = PortfolioAIContext.objects.filter(
            portfolio_id=portfolio_uuid, enabled=True,
        ).first()
    except Exception as e:
        logger.warning("ai_context_helpers portfolio db read failed: %s", e)
        return empty

    if not aic:
        return empty

    try:
        from accounts.models import Company
        company = Company.objects.filter(id=portfolio.company_id).first()
    except Exception:
        company = None

    if not _tenant_feature_enabled(company, "ai_context_enabled"):
        return empty

    files = _enabled_source_files(aic.source_files)
    text = (aic.extracted_text or "")[:MAX_CONTEXT_CHARS]
    if not text:
        return empty

    prefix = _build_prefix(
        text=text, files=files, language=language,
        heading_nl="[PORTFOLIO_DOCUMENTEN]",
        heading_en="[PORTFOLIO_DOCUMENTS]",
        body_lead_nl="Inhoud uit de portfoliodocumenten:",
        body_lead_en="Content extracted from the portfolio documents:",
        footer_nl=(
            "Gebruik bovenstaande portfoliodocumenten als autoritatieve bron "
            "voor zaken die daarin genoemd worden; vul aan met methodologie-"
            "kennis waar nodig."
        ),
        footer_en=(
            "Treat the portfolio documents above as the authoritative source "
            "for anything they mention; fall back to methodology knowledge "
            "where they are silent."
        ),
    )
    if log:
        _log_access(
            user=user,
            context_type="portfolio",
            context_id=str(portfolio_uuid),
            surface=surface,
            chars_used=len(prefix),
            company=company,
        )
    return {"prefix": prefix, "used": _usage_details(prefix, files, surface)}
