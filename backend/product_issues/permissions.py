"""Permission helpers for the decision-request flow (Sprint 12).

Two distinct trust boundaries:

* ``IsAutoFixWorker`` — the Control-Tower sonar-fix-worker (or its orchestrator)
  posting newly generated questions. Authenticated via Django's standard JWT
  path as a dedicated service user, additionally pinned by the environment
  variable ``PRODUCT_ISSUE_WORKER_USER_IDS`` (comma-separated). Keeping the
  worker identity in env, not in the DB, means we can rotate it without a
  migration and the audit trail (triaged_by, decision_history.worker_run_id)
  still points at a single stable auth user id.

* ``CanAnswerDecision`` — a human on the tenant answering open questions.
  Accepts the original reporter and anyone with role in ``admin``/
  ``superadmin`` within the issue's company. Superuser bypass stays in place
  so Inclufy ops can resolve stuck issues cross-tenant.
"""
from __future__ import annotations

import os
from typing import Iterable

from rest_framework.permissions import BasePermission


def _worker_user_ids() -> set[int]:
    raw = os.environ.get("PRODUCT_ISSUE_WORKER_USER_IDS", "")
    out: set[int] = set()
    for chunk in raw.split(","):
        chunk = chunk.strip()
        if not chunk:
            continue
        try:
            out.add(int(chunk))
        except ValueError:
            continue
    return out


class IsAutoFixWorker(BasePermission):
    """Worker-only — service user id pinned by env var."""

    message = "Only the Control-Tower auto-fix worker may post questions here."

    def has_permission(self, request, view) -> bool:
        user = request.user
        if not getattr(user, "is_authenticated", False):
            return False
        if getattr(user, "is_superuser", False):
            return True
        allowed = _worker_user_ids()
        if not allowed:
            # Fail-closed: when the env var is not configured in a given
            # environment, no non-superuser identity may call this endpoint.
            return False
        return user.id in allowed


def _issue_company_id(issue) -> int | None:
    return getattr(issue, "company_id", None)


class CanAnswerDecision(BasePermission):
    """Reporter of the issue, or admin/superadmin within the issue's company."""

    message = "Only the reporter or a tenant admin may answer this decision."

    def has_object_permission(self, request, view, obj) -> bool:
        user = request.user
        if not getattr(user, "is_authenticated", False):
            return False
        if getattr(user, "is_superuser", False):
            return True
        if getattr(user, "role", None) == "superadmin":
            return True
        issue_company = _issue_company_id(obj)
        user_company = getattr(user, "company_id", None)
        if not issue_company or not user_company or issue_company != user_company:
            return False
        if obj.reporter_id and obj.reporter_id == user.id:
            return True
        return getattr(user, "role", None) == "admin"


def summarize_allowed_worker_ids() -> Iterable[int]:
    """Introspection helper for the Django admin / health page."""
    return sorted(_worker_user_ids())
