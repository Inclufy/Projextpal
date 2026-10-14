import logging
import uuid

from django.utils import timezone
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .claude_triage import ClaudeAutoTriage, TriageError
from .models import ProductIssue, ProductIssueComment
from .permissions import CanAnswerDecision, IsAutoFixWorker
from .serializers import (
    AnswerDecisionSerializer,
    NeedsDecisionRequestSerializer,
    ProductIssueAutoCISerializer,
    ProductIssueCommentSerializer,
    ProductIssueSerializer,
    ProductIssueTriageUpdateSerializer,
)

logger = logging.getLogger(__name__)


# Terminal statuses a decision cannot be re-opened on — attempting a worker
# POST or an answer POST on one of these returns 409 instead of mutating the
# archived audit trail.
_TERMINAL_STATUSES = {"resolved", "wont-fix", "duplicate", "closed"}


def _validate_answers(questions: list[dict], answers: dict) -> dict:
    """Shape-check answers against the open question set.

    Returns the cleaned answers dict. Raises ``ValueError`` with a dict of
    per-question errors (same shape the view echoes back as 400) so the
    caller can wrap it in a Response.
    """
    by_id: dict[str, dict] = {q["id"]: q for q in questions if isinstance(q, dict)}
    cleaned: dict[str, object] = {}
    errors: dict[str, str] = {}
    for qid, raw in answers.items():
        q = by_id.get(qid)
        if q is None:
            errors[qid] = "unknown question id"
            continue
        qtype = q.get("type")
        if qtype == "single_choice":
            if not isinstance(raw, str) or raw not in (q.get("choices") or []):
                errors[qid] = "answer must be one of the listed choices"
                continue
            cleaned[qid] = raw
        elif qtype == "multi_choice":
            allowed = set(q.get("choices") or [])
            if not isinstance(raw, list) or not raw:
                errors[qid] = "answer must be a non-empty list of choices"
                continue
            bad = [c for c in raw if not isinstance(c, str) or c not in allowed]
            if bad:
                errors[qid] = "unknown choice(s): " + ", ".join(bad[:3])
                continue
            # Dedupe while preserving order, cap at the question's choice count.
            seen: list[str] = []
            for c in raw:
                if c not in seen:
                    seen.append(c)
            cleaned[qid] = seen
        elif qtype == "text":
            if not isinstance(raw, str) or not raw.strip():
                errors[qid] = "answer must be non-empty text"
                continue
            cleaned[qid] = raw.strip()[:4000]
        else:
            errors[qid] = f"question type {qtype!r} is not answerable"
    missing = [qid for qid in by_id if qid not in cleaned and qid not in errors]
    for qid in missing:
        errors[qid] = "answer is required"
    if errors:
        raise ValueError(errors)
    return cleaned


class ProductIssueViewSet(viewsets.ModelViewSet):
    """
    GET    /api/v1/product-issues/                -- list (org-scoped)
    POST   /api/v1/product-issues/                -- user creates issue from Copilot
    GET    /api/v1/product-issues/{id}/           -- detail incl. comments
    PATCH  /api/v1/product-issues/{id}/           -- update lifecycle (assign, status)
    POST   /api/v1/product-issues/{id}/triage/    -- agent posts triage result
    POST   /api/v1/product-issues/{id}/comment/   -- add comment
    """

    serializer_class = ProductIssueSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Tenant scoping: org-members see their company's issues. Superadmin
        # sees all (operational role across tenants).
        qs = ProductIssue.objects.select_related(
            "reporter", "company", "project", "assigned_to", "duplicate_of"
        ).prefetch_related("attachments", "reproduction_evidence", "comments")

        if not user.is_authenticated:
            return qs.none()
        if getattr(user, "role", None) == "superadmin" or user.is_superuser:
            return qs
        company_id = getattr(user, "company_id", None)
        if not company_id:
            return qs.none()
        return qs.filter(company_id=company_id)

    def perform_create(self, serializer):
        # Auto-fill reporter + company from request context if not provided.
        user = self.request.user
        company = getattr(user, "company", None)
        serializer.save(
            reporter=user,
            company=serializer.validated_data.get("company") or company,
        )

    @action(detail=True, methods=["post"], url_path="triage")
    def triage(self, request, pk=None):
        """Agent posts triage result here.

        Body matches ProductIssueTriageUpdateSerializer fields. Sets
        triaged_at automatically and transitions status from `new`/`triaging`
        to whatever the agent decides (typically `accepted` or `wont-fix`).
        """
        issue = self.get_object()
        ser = ProductIssueTriageUpdateSerializer(
            issue, data=request.data, partial=True
        )
        ser.is_valid(raise_exception=True)
        ser.save(triaged_at=timezone.now())
        return Response(ProductIssueSerializer(issue).data)

    @action(
        detail=True,
        methods=["post"],
        url_path="needs-decision",
        permission_classes=[IsAutoFixWorker],
    )
    def needs_decision(self, request, pk=None):
        """Worker opens a decision round on this issue.

        Body: ``{questions: [...], worker_run_id?: str, reason?: str}``.
        Side effects: status → ``needs-decision``, questions replace any
        previously-open round (prior round is closed-out in history with
        outcome ``superseded``), an audit row is appended with the new
        round id + requested_at + worker_run_id. The post-save signal in
        ``signals.py`` picks up the status change and fires the Resend
        email (wired in S12-04).
        """
        # Bypass tenant scoping for the worker: get the raw row by pk so a
        # cross-tenant superuser worker can post on any company's issue.
        issue = ProductIssue.objects.filter(pk=pk).first()
        if issue is None:
            return Response(
                {"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND
            )
        if issue.status in _TERMINAL_STATUSES:
            return Response(
                {
                    "detail": (
                        f"Issue is {issue.status}; reopen it before requesting "
                        "another decision."
                    )
                },
                status=status.HTTP_409_CONFLICT,
            )

        ser = NeedsDecisionRequestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        payload = ser.validated_data
        questions = [dict(q) for q in payload["questions"]]
        worker_run_id = payload.get("worker_run_id") or ""
        reason = payload.get("reason") or ""
        now = timezone.now()
        round_id = uuid.uuid4().hex[:12]

        history = list(issue.decision_history or [])
        # Supersede any currently-open round so history always makes sense.
        for row in history:
            if row.get("outcome") == "awaiting_answer":
                row["outcome"] = "superseded"
                row["superseded_at"] = now.isoformat()
        history.append(
            {
                "round_id": round_id,
                "questions": questions,
                "answers": {},
                "requested_at": now.isoformat(),
                "answered_at": None,
                "answered_by": None,
                "worker_run_id": worker_run_id,
                "reason": reason,
                "outcome": "awaiting_answer",
            }
        )

        issue.decision_questions = questions
        issue.decision_answers = {}
        issue.decision_history = history
        issue.decision_last_requested_at = now
        issue.status = "needs-decision"
        issue.save(
            update_fields=[
                "decision_questions",
                "decision_answers",
                "decision_history",
                "decision_last_requested_at",
                "status",
                "updated_at",
            ]
        )
        logger.info(
            "product_issue %s moved to needs-decision (round=%s, worker=%s, q=%s)",
            issue.id, round_id, worker_run_id, len(questions),
        )
        return Response(
            {
                "status": issue.status,
                "round_id": round_id,
                "questions": questions,
                "decision_last_requested_at": issue.decision_last_requested_at,
            },
            status=status.HTTP_200_OK,
        )

    @action(
        detail=True,
        methods=["post"],
        url_path="answer-decision",
        permission_classes=[permissions.IsAuthenticated, CanAnswerDecision],
    )
    def answer_decision(self, request, pk=None):
        """Reporter / tenant admin answers the open decision round.

        Body: ``{answers: {q_id: value, ...}, free_text?: str}``. All open
        questions must be answered in a single POST (we don't want half-
        answered rounds re-triggering the worker). On success the issue
        moves to status ``in-progress``, decision_answers is stored, the
        history row for the open round is closed with outcome
        ``awaiting_worker``, and a comment is attached for the audit trail.
        The orchestrator (S12-08) picks this up and re-queues the worker.
        """
        issue = self.get_object()
        if issue.status != "needs-decision":
            return Response(
                {"detail": f"Issue is not awaiting a decision (status={issue.status})."},
                status=status.HTTP_409_CONFLICT,
            )
        questions = list(issue.decision_questions or [])
        if not questions:
            return Response(
                {"detail": "No open questions to answer."},
                status=status.HTTP_409_CONFLICT,
            )
        ser = AnswerDecisionSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        try:
            cleaned = _validate_answers(questions, ser.validated_data["answers"])
        except ValueError as exc:
            return Response(
                {"answers": exc.args[0]}, status=status.HTTP_400_BAD_REQUEST,
            )

        now = timezone.now()
        free_text = (ser.validated_data.get("free_text") or "").strip()
        answered_by = getattr(request.user, "email", None) or str(request.user.id)

        history = list(issue.decision_history or [])
        updated_row = None
        for row in history:
            if row.get("outcome") == "awaiting_answer":
                row["answers"] = cleaned
                row["answered_at"] = now.isoformat()
                row["answered_by"] = answered_by
                if free_text:
                    row["answered_free_text"] = free_text[:4000]
                row["outcome"] = "awaiting_worker"
                updated_row = row
                break
        if updated_row is None:
            # Shouldn't happen given status == needs-decision, but be
            # defensive: append a synthetic row rather than lose the input.
            updated_row = {
                "round_id": uuid.uuid4().hex[:12],
                "questions": questions,
                "answers": cleaned,
                "requested_at": None,
                "answered_at": now.isoformat(),
                "answered_by": answered_by,
                "answered_free_text": free_text[:4000] if free_text else None,
                "worker_run_id": "",
                "outcome": "awaiting_worker",
            }
            history.append(updated_row)

        issue.decision_answers = cleaned
        issue.decision_history = history
        issue.status = "in-progress"
        issue.save(
            update_fields=[
                "decision_answers",
                "decision_history",
                "status",
                "updated_at",
            ]
        )

        # Audit comment so the thread shows the answer alongside other
        # events. Internal-visibility so the reporter sees it on their own
        # issue, same as needs-info replies.
        summary_lines = ["**Decision answered.**"]
        for q in questions:
            qid = q.get("id")
            val = cleaned.get(qid)
            if isinstance(val, list):
                val = ", ".join(val)
            summary_lines.append(f"- {q.get('text', qid)} → **{val}**")
        if free_text:
            summary_lines.append("")
            summary_lines.append(free_text)
        ProductIssueComment.objects.create(
            issue=issue,
            author=answered_by,
            body="\n".join(summary_lines),
            is_triage_step=False,
            visibility=ProductIssueComment.VISIBILITY_PUBLIC,
        )

        logger.info(
            "product_issue %s decision answered by %s (round=%s)",
            issue.id, answered_by, updated_row.get("round_id"),
        )
        return Response(
            {
                "status": issue.status,
                "round_id": updated_row.get("round_id"),
                "answers": cleaned,
                "answered_at": updated_row.get("answered_at"),
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"], url_path="comment")
    def comment(self, request, pk=None):
        """Add a comment to an issue thread.

        Accepts:
          - body (string, required unless attachments present)
          - attachments (list of {name, mime_type, size_bytes, data_url}, optional)
          - is_triage_step (bool, optional)
          - author (string, optional — defaults to request.user.id)

        Either body OR attachments must be non-empty so we don't accept
        completely blank rows. The frontend uses this endpoint to let
        reporters reply to needs-info follow-ups with text + screenshot
        attachments in the same comment.
        """
        issue = self.get_object()
        body = (request.data.get("body") or "").strip()
        attachments = request.data.get("attachments") or []

        # Defensive shape + size validation. Each attachment must be a
        # dict and the total payload is capped at ~25MB so a malicious
        # client can't blow up the JSON column.
        if not isinstance(attachments, list):
            return Response(
                {"error": "attachments must be a list"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        clean_attachments = []
        total_bytes = 0
        for a in attachments:
            if not isinstance(a, dict):
                continue
            data_url = str(a.get("data_url") or "")[:30_000_000]  # 30MB hard cap
            clean_attachments.append({
                "name": str(a.get("name") or "attachment")[:255],
                "mime_type": str(a.get("mime_type") or "application/octet-stream")[:128],
                "size_bytes": int(a.get("size_bytes") or 0),
                "data_url": data_url,
            })
            total_bytes += len(data_url)
            if total_bytes > 25 * 1024 * 1024:
                return Response(
                    {"error": "attachments payload too large (max 25MB total)"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if not body and not clean_attachments:
            return Response(
                {"error": "body or attachments is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        author = request.data.get("author") or str(request.user.id)
        is_triage_step = bool(request.data.get("is_triage_step", False))
        comment = ProductIssueComment.objects.create(
            issue=issue,
            author=author,
            body=body,
            is_triage_step=is_triage_step,
            attachments=clean_attachments,
        )
        return Response(
            ProductIssueCommentSerializer(comment).data,
            status=status.HTTP_201_CREATED,
        )


class ProductIssueClaudeCallbackView(APIView):
    """
    POST /api/v1/product-issues/<id>/claude-callback/

    Called by the external Claude fix-agent orchestrator once it has
    opened / merged a PR for an auto-triaged issue, or when the fix
    attempt failed. Body:

        {
          "status": "pr_opened" | "merged" | "failed",
          "pr_url": "https://...",        # optional
          "commit_sha": "abc123",         # optional
          "agent_id": "run_abc123",       # optional — correlation hint
          "error": "..."                  # optional, for status=failed
        }

    Authentication: shared-secret HMAC over the request body in the
    ``X-ProjeXtPal-Signature`` header (``sha256=<hex>``). The secret is
    ``CLAUDE_FIX_AGENT_WEBHOOK_SECRET``. If no secret is configured on
    the server the endpoint falls back to IsAuthenticated (dev only).
    """

    permission_classes = [permissions.AllowAny]
    authentication_classes: list = []

    _ALLOWED_STATUSES = {"pr_opened", "merged", "failed"}

    def _verify_signature(self, request) -> bool:
        secret = getattr(settings, "CLAUDE_FIX_AGENT_WEBHOOK_SECRET", "") or ""
        if not secret:
            # Dev / local: require an authenticated user instead.
            return bool(request.user and request.user.is_authenticated)
        header = request.META.get("HTTP_X_PROJEXTPAL_SIGNATURE", "")
        if not header or "=" not in header:
            return False
        algo, _, provided = header.partition("=")
        if algo != "sha256":
            return False
        expected = hmac.new(
            secret.encode("utf-8"), request.body, hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(expected, provided)

    def post(self, request, pk=None):
        if not self._verify_signature(request):
            return Response(
                {"error": "invalid signature"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        issue = get_object_or_404(ProductIssue, pk=pk)

        new_status = (request.data.get("status") or "").strip()
        if new_status not in self._ALLOWED_STATUSES:
            return Response(
                {"error": f"status must be one of {sorted(self._ALLOWED_STATUSES)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        pr_url = (request.data.get("pr_url") or "").strip()
        commit_sha = (request.data.get("commit_sha") or "").strip()
        agent_id = (request.data.get("agent_id") or "").strip()
        error_msg = (request.data.get("error") or "").strip()

        meta = dict(issue.metadata or {})
        meta["claude_callback_at"] = timezone.now().isoformat()
        meta["claude_callback_status"] = new_status
        if pr_url:
            meta["claude_pr_url"] = pr_url
        if commit_sha:
            meta["claude_commit_sha"] = commit_sha
        if agent_id:
            meta["claude_agent_id"] = agent_id
        if error_msg:
            meta["claude_last_error"] = error_msg[:500]
        issue.metadata = meta

        if new_status == "pr_opened":
            issue.status = "in-progress"
            if pr_url:
                issue.linked_pr_url = pr_url
        elif new_status == "merged":
            issue.status = "resolved"
            issue.resolved_at = timezone.now()
            if pr_url:
                issue.linked_pr_url = pr_url
            if not issue.resolution_summary:
                issue.resolution_summary = (
                    f"Auto-resolved by Claude fix agent"
                    f"{' — ' + pr_url if pr_url else ''}"
                )
        elif new_status == "failed":
            # Hand back to human triage.
            issue.status = "new"

        issue.save()

        return Response(
            {"ok": True, "id": issue.id, "status": issue.status},
            status=status.HTTP_200_OK,
        )


class ProductIssueTriggerClaudeView(APIView):
    """
    POST /api/v1/product-issues/<id>/trigger-claude/

    Admin-only manual trigger — bypasses the ``should_auto_triage``
    heuristics and forces a fix-agent dispatch for one issue. Used by
    the "Trigger Claude" admin button to pick up issues the automatic
    policy would otherwise skip (wrong category, P3, etc.).
    """

    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk=None):
        issue = get_object_or_404(ProductIssue, pk=pk)
        triage = ClaudeAutoTriage()
        if not triage.webhook_url:
            return Response(
                {"error": "CLAUDE_FIX_AGENT_WEBHOOK not configured"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        try:
            agent_id = triage.trigger_fix_agent(issue)
        except TriageError as exc:
            triage.mark_failed(issue, str(exc))
            return Response(
                {"error": str(exc)}, status=status.HTTP_502_BAD_GATEWAY
            )
        triage.mark_in_progress(issue, agent_id)
        return Response(
            {"ok": True, "agent_id": agent_id, "status": issue.status},
            status=status.HTTP_200_OK,
        )


class ProductIssueAutoCIView(APIView):
    """
    POST /api/v1/product-issues/auto/ci/
    Body: { title, description, category, error_trace, environment, company }

    Used by GitHub Actions / GitLab CI / Playwright runner to post test
    failures directly. Auth via long-lived API token (not user JWT).

    For now we accept any authenticated request — token gating happens at
    the URL-routing level (see urls.py token-auth class). Tighten when CI-
    specific service-account tokens are issued.
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        ser = ProductIssueAutoCISerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        issue = ser.save()
        return Response(
            ProductIssueSerializer(issue).data,
            status=status.HTTP_201_CREATED,
        )
