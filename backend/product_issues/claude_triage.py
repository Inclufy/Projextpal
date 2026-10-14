"""
Claude Auto-Triage pipeline — Sprint 10 S10-02.

Automates the flow
    ProductIssue created (source=agent-scan, P1/P2, safe category)
        → external Claude fix-agent spawned (via webhook)
        → PR opened + merged (reported back via `/claude-callback/`)
        → ProductIssue status updated

This module is INTENTIONALLY DUMB about *where* the fix agent runs — it
POSTs a self-contained payload to a configurable webhook URL and lets the
external orchestrator (GitHub Actions / Lambda / a Desktop-Claude worker)
decide how to spawn a fix session. Keeping the pipeline out of a direct
`claude` subprocess call means prod never needs the Claude CLI installed
inside the container.

Opt-in: controlled by two settings
  * ``CLAUDE_AUTO_TRIAGE_ENABLED`` — global kill-switch (default off)
  * ``CLAUDE_FIX_AGENT_WEBHOOK``   — webhook URL (must be set, else disabled)

Both are read from env vars so tenants can be flipped on without a redeploy
once the external orchestrator is proven safe.

Security
--------
The outbound webhook is signed with ``CLAUDE_FIX_AGENT_WEBHOOK_SECRET`` via
an ``X-ProjeXtPal-Signature`` HMAC-SHA256 header so the receiver can verify
the request originated from us. The callback endpoint uses the same shared
secret (see views.ProductIssueClaudeCallbackView).
"""
from __future__ import annotations

import hashlib
import hmac
import json
import logging
import uuid
from datetime import datetime
from typing import Any, Optional

from django.conf import settings
from django.utils import timezone

from .models import ProductIssue

logger = logging.getLogger(__name__)


class TriageError(Exception):
    """Raised when the auto-triage pipeline cannot trigger a fix agent."""


# ---------------------------------------------------------------------------
# Category classification
# ---------------------------------------------------------------------------

# Categories known safe for auto-fix. Hand-picked: these are low-blast-radius
# code changes a Claude agent can usually land correctly in one shot without
# human review needed before the PR is opened. The list is explicitly short
# so we grow it only after we see success in production.
_AUTO_FIXABLE_CATEGORIES = frozenset(
    {
        "ui",            # UI copy / layout / typography fixes
        "documentation",  # markdown + docstring fixes
    }
)

# Keywords in the issue title/description that bump an issue into the
# auto-fixable bucket regardless of category — these are "narrow" fixes
# whose scope is already encoded in the issue text.
_AUTO_FIXABLE_HINTS = frozenset(
    {
        "i18n",
        "translation",
        "typo",
        "orphan",
        "dead code",
        "dead-code",
        "unused import",
        "missing translation",
    }
)


class ClaudeAutoTriage:
    """Core auto-triage engine.

    Stateless — safe to instantiate per request / per cron tick. All heavy
    lifting (webhook POST, DB write) goes through small helper methods so
    tests can mock them individually.
    """

    def __init__(
        self,
        *,
        webhook_url: Optional[str] = None,
        webhook_secret: Optional[str] = None,
        enabled: Optional[bool] = None,
    ) -> None:
        self.webhook_url = (
            webhook_url
            if webhook_url is not None
            else getattr(settings, "CLAUDE_FIX_AGENT_WEBHOOK", "")
        )
        self.webhook_secret = (
            webhook_secret
            if webhook_secret is not None
            else getattr(settings, "CLAUDE_FIX_AGENT_WEBHOOK_SECRET", "")
        )
        self.enabled = (
            enabled
            if enabled is not None
            else bool(getattr(settings, "CLAUDE_AUTO_TRIAGE_ENABLED", False))
        )

    # ------------------------------------------------------------------
    # Policy
    # ------------------------------------------------------------------

    def should_auto_triage(self, issue: ProductIssue) -> bool:
        """Only P1/P2 agent-scan issues on simple categories are auto-triaged.

        Covers the triggered-from-cron path. Signal-driven immediate triggers
        (see signals.py) call this too, so the gate stays consistent.
        """
        if not self.enabled:
            return False
        if not self.webhook_url:
            return False
        if issue.source != "agent-scan":
            return False
        if issue.priority not in ("P1", "P2"):
            return False
        if issue.status != "new":
            return False
        if not self._category_auto_fixable(issue):
            return False
        # Don't re-trigger an issue that already has a running agent — the
        # callback endpoint is the only way to move it forward.
        if issue.metadata and issue.metadata.get("claude_agent_id"):
            return False
        return True

    def _category_auto_fixable(self, issue: ProductIssue) -> bool:
        """Categories known to be safe for auto-fix.

        Rules:
          1. ``issue.category`` is in the hard-coded whitelist, OR
          2. the title/description contains a known-narrow-fix hint
             (i18n, typo, orphan-widget, dead-code-removal, …).
        """
        if issue.category in _AUTO_FIXABLE_CATEGORIES:
            return True
        text = f"{issue.title or ''} {issue.description or ''}".lower()
        return any(h in text for h in _AUTO_FIXABLE_HINTS)

    # ------------------------------------------------------------------
    # Trigger
    # ------------------------------------------------------------------

    def build_payload(self, issue: ProductIssue) -> dict[str, Any]:
        """Build the self-contained payload sent to the fix-agent webhook.

        The payload must survive the trip through an external orchestrator
        and give a fresh Claude session everything it needs to open a PR
        without further lookups.
        """
        files_hint: list[str] = []
        if issue.agent_triage_result and isinstance(
            issue.agent_triage_result, dict
        ):
            # Agents often record the suspected code reference under one of
            # these keys — pass whichever is present through to the fix agent.
            for key in ("code_references", "suggested_fix_area", "files"):
                val = issue.agent_triage_result.get(key)
                if isinstance(val, list):
                    files_hint.extend(str(v) for v in val if v)
                elif isinstance(val, str):
                    files_hint.append(val)

        return {
            "issue_id": issue.id,
            "title": issue.title,
            "description": issue.description,
            "category": issue.category,
            "priority": issue.priority,
            "classification": issue.classification,
            "reproduction_steps": issue.reproduction_steps,
            "error_trace": issue.error_trace,
            "files_hint": files_hint,
            # Repo + worktree hints — the external orchestrator picks these up
            # when it clones ProjeXtPal and spawns the fix session.
            "repo": "Inclufy/projextpal",
            "repo_branch": "master",
            "worktree_name": f"auto-fix-issue-{issue.id}",
            # Correlation + callback plumbing.
            "callback_url": self._callback_url(issue),
            "triggered_at": timezone.now().isoformat(),
        }

    def _callback_url(self, issue: ProductIssue) -> str:
        base = getattr(settings, "PROJEXTPAL_PUBLIC_URL", "") or ""
        base = base.rstrip("/")
        if base:
            return f"{base}/api/v1/product-issues/{issue.id}/claude-callback/"
        return f"/api/v1/product-issues/{issue.id}/claude-callback/"

    def _sign(self, payload_bytes: bytes) -> str:
        if not self.webhook_secret:
            return ""
        mac = hmac.new(
            self.webhook_secret.encode("utf-8"),
            payload_bytes,
            hashlib.sha256,
        )
        return f"sha256={mac.hexdigest()}"

    def _post_webhook(self, payload: dict[str, Any]) -> str:
        """POST the payload to the webhook; return the external tracking id.

        Isolated as a method so tests can mock it in one place.
        """
        if not self.webhook_url:
            raise TriageError("CLAUDE_FIX_AGENT_WEBHOOK is empty")
        try:
            import requests  # local import — mocked in tests
        except ImportError as exc:  # pragma: no cover
            raise TriageError(f"requests not installed: {exc}") from exc

        body = json.dumps(payload, default=str).encode("utf-8")
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "ProjeXtPal-ClaudeAutoTriage/1.0",
        }
        sig = self._sign(body)
        if sig:
            headers["X-ProjeXtPal-Signature"] = sig

        resp = requests.post(
            self.webhook_url, data=body, headers=headers, timeout=15
        )
        if resp.status_code >= 400:
            raise TriageError(
                f"webhook responded {resp.status_code}: {resp.text[:300]}"
            )
        # The receiver can return a tracking id so we can later match
        # a callback to the agent run; fall back to our own uuid otherwise.
        try:
            data = resp.json() or {}
        except ValueError:
            data = {}
        tracking_id = (
            data.get("agent_id")
            or data.get("tracking_id")
            or data.get("id")
            or f"local-{uuid.uuid4().hex[:12]}"
        )
        return str(tracking_id)

    def trigger_fix_agent(self, issue: ProductIssue) -> str:
        """Dispatch the fix request. Returns tracking id or raises TriageError."""
        payload = self.build_payload(issue)
        return self._post_webhook(payload)

    # ------------------------------------------------------------------
    # State transitions
    # ------------------------------------------------------------------

    def mark_in_progress(self, issue: ProductIssue, agent_id: str) -> None:
        """Transition an issue to ``in-progress`` after a successful trigger.

        Note the status choice is ``in-progress`` (with a hyphen) — the
        PRODUCT model's ``STATUS_CHOICES`` uses hyphenated keys. See
        product_issues/models.py.
        """
        meta = dict(issue.metadata or {})
        meta.update(
            {
                "claude_agent_id": agent_id,
                "claude_triggered_at": timezone.now().isoformat(),
                "claude_attempts": int(meta.get("claude_attempts", 0)) + 1,
            }
        )
        issue.metadata = meta
        issue.status = "in-progress"
        issue.triaged_at = timezone.now()
        issue.triaged_by = "agent:claude-auto-triage"
        # Suppress the per-issue email so the cron batch can send a digest.
        issue._suppress_email_on_save = True  # type: ignore[attr-defined]
        issue.save(
            update_fields=[
                "metadata",
                "status",
                "triaged_at",
                "triaged_by",
                "updated_at",
            ]
        )

    def mark_failed(self, issue: ProductIssue, error: str) -> None:
        """Record a failed trigger attempt on the issue."""
        meta = dict(issue.metadata or {})
        meta.update(
            {
                "claude_last_error": str(error)[:500],
                "claude_last_error_at": timezone.now().isoformat(),
                "claude_attempts": int(meta.get("claude_attempts", 0)) + 1,
            }
        )
        issue.metadata = meta
        issue._suppress_email_on_save = True  # type: ignore[attr-defined]
        issue.save(update_fields=["metadata", "updated_at"])
