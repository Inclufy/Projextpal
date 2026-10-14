"""
AIContextAccessLog — one row per AI call that consulted an AI-context prefix.

Written by ``core.ai_context_helpers`` on every ``get_*_context_prefix()``
invocation that actually returned bytes. Allows compliance reviewers (and
tenant admins under the "data processing register" GDPR Art. 30 duty) to
answer: who read which project's uploaded documents, through which AI
surface, when, and how many characters did the LLM see.

Fields are deliberately denormalised (no FK to the project/program/portfolio
model, only ``context_type`` + ``context_id``) because the project may be
deleted (GDPR right-to-erasure cascade) while the audit log must survive to
prove the erasure happened.

Logging is best-effort: ``log_access`` swallows every exception so a DB blip
cannot break the LLM path. The per-tenant retention policy lives in
``accounts.TenantAIFeatureFlags.audit_log_retention_days`` (default 365).
"""
from __future__ import annotations

import logging
from django.conf import settings
from django.db import models

logger = logging.getLogger(__name__)


class AIContextAccessLog(models.Model):
    """One AI call that read an uploaded-document context prefix."""

    CONTEXT_TYPE_CHOICES = [
        ("project", "Project"),
        ("program", "Programme"),
        ("portfolio", "Portfolio"),
    ]

    # Open-ended CharField, not choices — the set of AI surfaces grows every
    # sprint and we don't want a migration every time a new one is wired in.
    # Known values at Sprint 6 cut:
    #   "copilot"            (Ask Co-pilot send_message)
    #   "coach"              (project coach)
    #   "project_ai_plan"    (Plan with AI)
    #   "risk_mitigation"    (AI risk mitigation suggestion)
    #   "risk_forecast"      (horizon-scanning risk forecast)
    #   "governance_ai"      (board/portfolio AI advisor)
    #   "autodraft"          (methodology auto-drafts, status reports, …)
    #   "team_match"         (sprint5 team recommender)
    #   "narrative"          (sprint5 dashboard narrative)
    #   "compliance_rescan"  (sprint5 compliance-rescan)
    #   "tailoring"          (methodology tailoring advisor)
    SURFACE_MAX_LEN = 64

    company = models.ForeignKey(
        "accounts.Company",
        on_delete=models.CASCADE,
        related_name="ai_access_logs",
        null=True,
        blank=True,
        help_text=(
            "Owning tenant. Nullable because superadmin reads across tenants "
            "may not resolve to a single company; the log row is still kept."
        ),
    )
    context_type = models.CharField(
        max_length=16, choices=CONTEXT_TYPE_CHOICES, db_index=True,
    )
    context_id = models.CharField(
        max_length=64, db_index=True,
        help_text=(
            "Project/program id (int) or portfolio id (UUID), stored as "
            "string so one column covers all three."
        ),
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="ai_access_logs",
        null=True, blank=True,
    )
    surface = models.CharField(
        max_length=SURFACE_MAX_LEN,
        help_text=(
            "AI surface that consumed the context, e.g. "
            "'copilot', 'coach', 'autodraft'."
        ),
    )
    chars_used = models.PositiveIntegerField(
        default=0,
        help_text="Length of the context prefix the LLM saw.",
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        verbose_name = "AI Context Access Log"
        indexes = [
            models.Index(fields=["company", "created_at"]),
            models.Index(fields=["context_type", "context_id"]),
            models.Index(fields=["user", "created_at"]),
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return (
            f"AIAccess<{self.context_type}:{self.context_id} "
            f"by user={self.user_id} surface={self.surface}>"
        )


def log_access(
    *,
    user,
    context_type: str,
    context_id,
    surface: str,
    chars_used: int,
    company=None,
) -> None:
    """Swallow-all helper used by ``core.ai_context_helpers``.

    ``company`` is resolved from the user when not supplied. The whole call
    is wrapped in a broad ``except`` so a DB outage, migration lag, or
    permission issue cannot bubble up into the LLM path.
    """
    # chars_used==0 is a valid "access attempt without context" record for
    # GDPR-grade audit: tenants need to see WHO invoked AI on WHICH surface
    # even when no document context was pulled in. Only skip when the whole
    # payload is void (no surface + no context_id).
    if not chars_used and not (surface or context_id):
        return
    try:
        if company is None:
            company = getattr(user, "company", None) or getattr(
                getattr(user, "profile", None), "company", None
            )
        AIContextAccessLog.objects.create(
            company=company,
            context_type=(context_type or "")[:16],
            context_id=str(context_id)[:64],
            user=user if user and getattr(user, "is_authenticated", False) else None,
            surface=(surface or "unknown")[: AIContextAccessLog.SURFACE_MAX_LEN],
            chars_used=max(0, int(chars_used)),
        )
    except Exception as e:  # noqa: BLE001 - audit must never raise
        logger.warning("ai_audit log_access failed: %s", e)
