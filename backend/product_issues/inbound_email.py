"""Sprint 12 — reply-by-email parser for decision-request flow.

Resend's inbound hook POSTs a plain-JSON payload for every reply that lands
on an address we configured for inbound delivery. The frontend-driven flow
in S12-03 already works end-to-end without this; the inbound path is the
convenience layer that lets a reporter answer from their mail client — a
single reply with ``q_id=value`` lines — without opening the app.

Design notes:

* Issue identity is read from the subject line (``[ProjeXtPal #<id>]`` prefix
  that signals.py already emits), not the ``to:`` header, because the mail
  may have been forwarded through a shared inbox.
* We only accept replies to an issue that is currently ``needs-decision`` —
  stale replies on resolved issues are logged and dropped so a copy-paste on
  an old thread cannot reopen a closed ticket.
* The parser is intentionally forgiving on whitespace / casing / separators:
  ``Q1=A``, ``q1 = A``, ``q1 : A``, ``q1 -> A`` all match. Multi-choice
  answers accept comma- or pipe-separated values. Everything else gets
  surfaced in ``answered_free_text`` so the pipeline still has it.
* HMAC verification sits behind ``RESEND_INBOUND_SIGNING_SECRET``; when
  that env is unset we LOG and reject rather than letting unsigned mail in.
"""
from __future__ import annotations

import hashlib
import hmac
import logging
import os
import re
from typing import Any

logger = logging.getLogger(__name__)


SUBJECT_ID_RE = re.compile(r"#\s*(\d{1,10})", re.IGNORECASE)
# Primary line pattern. Captures: question id, separator, raw answer text.
# The id is restricted to the same character set S12-02 enforces at write
# time so an id in the body cannot be a path-trick or whitespace soup.
_ANSWER_LINE_RE = re.compile(
    r"^\s*(?P<qid>[A-Za-z0-9_\-]{1,32})\s*(?:=|:|->|→)\s*(?P<val>.+?)\s*$",
    re.MULTILINE,
)
# Lines we strip BEFORE parsing — reply chrome from Gmail / Outlook / Apple
# Mail. Everything after the first match is dropped.
_QUOTED_SPLIT_RE = re.compile(
    r"(^On .+ wrote:$|^Op .+ schreef .+:$|^-{2,} ?Original Message ?-{2,}$|"
    r"^From: .+$|^Van: .+$|^Begin forwarded message:$|^> )",
    re.MULTILINE,
)


def parse_subject_issue_id(subject: str | None) -> int | None:
    """Extract the ProductIssue id the reply refers to from the subject."""
    if not subject:
        return None
    m = SUBJECT_ID_RE.search(subject)
    if not m:
        return None
    try:
        return int(m.group(1))
    except ValueError:
        return None


def strip_quoted_tail(text: str) -> str:
    """Keep only the text ABOVE the first quoted-reply marker.

    Mail clients indent prior messages with ``>`` or glue a header on
    like ``On ... wrote:``. We parse the top-posted part only — the
    reporter's actual answer — and ignore quoted mail history so a
    ``q1=A`` line inside a prior message doesn't re-trigger an answer.
    """
    if not text:
        return ""
    m = _QUOTED_SPLIT_RE.search(text)
    if m:
        return text[: m.start()].rstrip()
    return text


def _split_multi(value: str) -> list[str]:
    parts = re.split(r"\s*[,|]\s*", value)
    return [p for p in (p.strip() for p in parts) if p]


def parse_answers_from_body(
    body: str,
    questions: list[dict[str, Any]],
) -> tuple[dict[str, Any], list[str], str]:
    """Match free-form reply lines against the open question set.

    Returns ``(answers, matched_qids, leftover_text)``. ``leftover_text``
    is whatever remained after we pulled out the recognised answer lines
    — it is handed to the orchestrator as ``answered_free_text`` so the
    worker has the reporter's extra context on its next run.
    """
    if not body:
        return {}, [], ""
    cleaned = strip_quoted_tail(body)
    questions_by_id = {q.get("id"): q for q in questions if isinstance(q, dict)}
    answers: dict[str, Any] = {}
    matched: list[str] = []
    consumed_spans: list[tuple[int, int]] = []

    for m in _ANSWER_LINE_RE.finditer(cleaned):
        qid = m.group("qid")
        q = questions_by_id.get(qid)
        if q is None:
            continue
        raw = (m.group("val") or "").strip()
        if not raw:
            continue
        qtype = q.get("type")
        allowed = q.get("choices") or []
        if qtype == "single_choice":
            if raw not in allowed:
                # Try case-insensitive match before giving up.
                case = {c.lower(): c for c in allowed}
                picked = case.get(raw.lower())
                if picked is None:
                    continue
                raw = picked
            answers[qid] = raw
            matched.append(qid)
            consumed_spans.append(m.span())
        elif qtype == "multi_choice":
            parts = _split_multi(raw)
            if not parts:
                continue
            resolved: list[str] = []
            case = {c.lower(): c for c in allowed}
            for p in parts:
                if p in allowed:
                    resolved.append(p)
                elif p.lower() in case:
                    resolved.append(case[p.lower()])
            if not resolved:
                continue
            # Dedupe preserving order.
            seen: list[str] = []
            for r in resolved:
                if r not in seen:
                    seen.append(r)
            answers[qid] = seen
            matched.append(qid)
            consumed_spans.append(m.span())
        elif qtype == "text":
            answers[qid] = raw[:4000]
            matched.append(qid)
            consumed_spans.append(m.span())

    # Leftover = cleaned body minus the matched spans.
    if not consumed_spans:
        leftover = cleaned.strip()
    else:
        pieces: list[str] = []
        prev = 0
        for a, b in sorted(consumed_spans):
            pieces.append(cleaned[prev:a])
            prev = b
        pieces.append(cleaned[prev:])
        leftover = "\n".join(p.strip() for p in pieces if p.strip())
    return answers, matched, leftover[:4000]


def verify_resend_signature(
    raw_body: bytes, signature_header: str | None
) -> tuple[bool, str]:
    """Verify the Resend inbound HMAC signature.

    Returns ``(ok, reason)``. ``reason`` is a short slug suitable for the
    audit log so an unverified payload can be refused at the view with a
    legible message. Fails CLOSED when the secret is not configured.
    """
    secret = os.environ.get("RESEND_INBOUND_SIGNING_SECRET", "").strip()
    if not secret:
        return False, "secret_not_configured"
    if not signature_header:
        return False, "missing_signature"
    try:
        algo, provided = signature_header.split("=", 1)
    except ValueError:
        algo, provided = "sha256", signature_header
    if algo.lower() not in {"sha256", "hmac-sha256"}:
        return False, "unsupported_algo"
    expected = hmac.new(secret.encode("utf-8"), raw_body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, provided.strip()):
        return False, "mismatch"
    return True, "ok"


def sender_matches_recipient_or_admin(
    from_email: str | None,
    allowed_emails: list[str],
) -> bool:
    """A reply is only honored when it comes from the mailbox we sent to.

    This stops a spoofed sender from answering someone else's decision —
    the inbound mail must come from the reporter's or an admin's address,
    exactly what we put in the outbound ``to:`` list in S12-04.
    """
    if not from_email:
        return False
    lower = from_email.strip().lower()
    return any(lower == a.strip().lower() for a in allowed_emails if a)
