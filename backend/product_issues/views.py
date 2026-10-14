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
    _scrub_untrusted,
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
            # Reporter-controlled text — flows into the fix-worker's LLM
            # prompt downstream. Scrub control / bidi chars + hard-cap
            # before persistence, same contract as free_text (see
            # AnswerDecisionSerializer._scrub_untrusted).
            cleaned[qid] = _scrub_untrusted(raw)[:4000]
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


class ResendInboundDecisionView(APIView):
    """POST /api/v1/webhooks/resend/inbound-decision/

    Accepts a Resend inbound-email payload (``{from, to, subject, text, ...}``)
    and, when the mail is a reply to a decision-request email we sent in
    S12-04, parses the answer lines (``q_id=value``) and applies them exactly
    like the UI's answer-decision endpoint. The parser lives in
    ``inbound_email.py``; this view wires auth + idempotency + the audit
    comment.

    No DRF authentication: Resend posts without a user JWT. The HMAC
    signature in ``X-Resend-Signature`` (verified against
    ``RESEND_INBOUND_SIGNING_SECRET``) IS the authentication; we fail
    closed when the secret is unset so a misconfigured environment cannot
    accept unverified mail by accident.
    """

    authentication_classes: list = []
    permission_classes: list = []

    def post(self, request):
        from .inbound_email import (
            parse_answers_from_body,
            parse_subject_issue_id,
            sender_matches_recipient_or_admin,
            verify_resend_signature,
        )
        from .signals import _admin_emails  # internal helper

        raw_body = request.body or b""
        sig = request.headers.get("X-Resend-Signature") or request.headers.get(
            "X-Signature"
        )
        ok, reason = verify_resend_signature(raw_body, sig)
        if not ok:
            logger.warning("resend inbound rejected: %s", reason)
            return Response(
                {"detail": f"signature check failed: {reason}"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        payload = request.data if isinstance(request.data, dict) else {}
        subject = payload.get("subject") or ""
        from_email = (
            payload.get("from_email")
            or (payload.get("from") or {}).get("email")
            if isinstance(payload.get("from"), dict)
            else payload.get("from")
        )
        body_text = payload.get("text") or payload.get("body") or ""

        issue_id = parse_subject_issue_id(subject)
        if issue_id is None:
            logger.info("resend inbound: no issue id in subject %r", subject[:120])
            return Response(
                {"detail": "no issue id in subject"}, status=status.HTTP_202_ACCEPTED
            )
        issue = ProductIssue.objects.filter(pk=issue_id).first()
        if issue is None:
            return Response(
                {"detail": "unknown issue"}, status=status.HTTP_202_ACCEPTED
            )
        if issue.status != "needs-decision":
            logger.info(
                "resend inbound: issue #%s not needs-decision (status=%s), dropped",
                issue.id, issue.status,
            )
            return Response(
                {"detail": "issue not awaiting decision"},
                status=status.HTTP_202_ACCEPTED,
            )

        allowed_senders = list(_admin_emails())
        if issue.reporter and issue.reporter.email:
            allowed_senders.insert(0, issue.reporter.email)
        if not sender_matches_recipient_or_admin(from_email, allowed_senders):
            logger.warning(
                "resend inbound: sender %r not allowed for issue #%s",
                from_email, issue.id,
            )
            return Response(
                {"detail": "sender not permitted"},
                status=status.HTTP_403_FORBIDDEN,
            )

        questions = list(issue.decision_questions or [])
        answers, matched_ids, leftover = parse_answers_from_body(
            body_text, questions,
        )
        required = {q.get("id") for q in questions if isinstance(q, dict)}
        if required - set(answers.keys()):
            # Partial answer — leave a comment with what we got + what is
            # still missing so the reporter sees it in the thread, but
            # don't mutate decision_answers (we only commit on complete
            # rounds, same as the UI endpoint).
            missing = ", ".join(sorted(required - set(answers.keys())))
            ProductIssueComment.objects.create(
                issue=issue,
                author=(from_email or "unknown"),
                body=(
                    "**Partial reply received by email** — nog niet alle "
                    f"vragen beantwoord. Ontbreekt: {missing}.\n\n"
                    + (leftover[:1500] if leftover else "")
                ),
                visibility=ProductIssueComment.VISIBILITY_PUBLIC,
            )
            return Response(
                {"status": "partial", "matched": matched_ids, "missing": sorted(required - set(answers.keys()))},
                status=status.HTTP_200_OK,
            )

        now = timezone.now()
        history = list(issue.decision_history or [])
        round_id = None
        for row in history:
            if row.get("outcome") == "awaiting_answer":
                row["answers"] = answers
                row["answered_at"] = now.isoformat()
                row["answered_by"] = from_email or "email"
                if leftover:
                    row["answered_free_text"] = leftover
                row["outcome"] = "awaiting_worker"
                round_id = row.get("round_id")
                break
        if round_id is None:
            import uuid

            round_id = uuid.uuid4().hex[:12]
            history.append(
                {
                    "round_id": round_id,
                    "questions": questions,
                    "answers": answers,
                    "requested_at": None,
                    "answered_at": now.isoformat(),
                    "answered_by": from_email or "email",
                    "answered_free_text": leftover or None,
                    "worker_run_id": "",
                    "outcome": "awaiting_worker",
                }
            )

        issue.decision_answers = answers
        issue.decision_history = history
        issue.status = "in-progress"
        issue.save(
            update_fields=[
                "decision_answers", "decision_history", "status", "updated_at",
            ]
        )
        summary = ["**Beslissing beantwoord per email.**"]
        for q in questions:
            qid = q.get("id")
            val = answers.get(qid)
            if isinstance(val, list):
                val = ", ".join(val)
            summary.append(f"- {q.get('text', qid)} → **{val}**")
        if leftover:
            summary.append("")
            summary.append(leftover)
        ProductIssueComment.objects.create(
            issue=issue,
            author=from_email or "email",
            body="\n".join(summary),
            visibility=ProductIssueComment.VISIBILITY_PUBLIC,
        )
        logger.info(
            "resend inbound: issue #%s answered via email by %s (round=%s)",
            issue.id, from_email, round_id,
        )
        return Response(
            {"status": "ok", "round_id": round_id, "answers": answers},
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
