"""Sprint 12 — inbound-email decision parser + webhook."""
from __future__ import annotations

import hashlib
import hmac
import json

import pytest
from rest_framework.test import APIClient

from accounts.models import Company
from product_issues.models import ProductIssue, ProductIssueComment
from product_issues.inbound_email import (
    parse_answers_from_body,
    parse_subject_issue_id,
    sender_matches_recipient_or_admin,
    strip_quoted_tail,
    verify_resend_signature,
)


SAMPLE_QUESTIONS = [
    {
        "id": "latency_target",
        "text": "Acceptable p95 latency?",
        "type": "single_choice",
        "choices": ["<5s", "<30s", "<60s"],
    },
    {
        "id": "approach",
        "text": "Rendering approach?",
        "type": "multi_choice",
        "choices": ["streaming", "async_job", "keep_blocking"],
    },
    {
        "id": "notes",
        "text": "Anything else?",
        "type": "text",
    },
]


# ------- parser units -----------------------------------------------------

class TestSubjectParsing:
    def test_extracts_issue_id(self):
        assert parse_subject_issue_id("[ProjeXtPal] #42 Beslissing nodig") == 42
        assert parse_subject_issue_id("Re: #7 — iets") == 7
        assert parse_subject_issue_id("[ProjeXtPal · Web] #123 anything") == 123

    def test_no_id_returns_none(self):
        assert parse_subject_issue_id("random subject") is None
        assert parse_subject_issue_id(None) is None


class TestQuotedTail:
    def test_strips_gmail_tail(self):
        body = "q1=A\n\nOn Mon, 14 Oct 2026 at 10:30, ProjeXtPal <no-reply@...> wrote:\n> original"
        assert strip_quoted_tail(body).strip() == "q1=A"

    def test_strips_outlook_header(self):
        body = "approach=streaming\n\n-------- Original Message --------\nFrom: ..."
        assert "Original Message" not in strip_quoted_tail(body)

    def test_strips_dutch_tail(self):
        body = "q1=A\n\nOp maandag 14 oktober schreef iemand:\n> old"
        assert strip_quoted_tail(body).strip() == "q1=A"


class TestAnswerParsing:
    def test_single_choice_match(self):
        a, m, left = parse_answers_from_body("latency_target=<30s", SAMPLE_QUESTIONS)
        assert a == {"latency_target": "<30s"}
        assert m == ["latency_target"]
        assert left == ""

    def test_separator_variants(self):
        body = "latency_target: <5s\napproach -> streaming\nnotes = kies snelste"
        a, _, _ = parse_answers_from_body(body, SAMPLE_QUESTIONS)
        assert a["latency_target"] == "<5s"
        assert a["approach"] == ["streaming"]
        assert a["notes"] == "kies snelste"

    def test_multi_choice_comma_and_pipe(self):
        a, _, _ = parse_answers_from_body(
            "approach = streaming, async_job", SAMPLE_QUESTIONS,
        )
        assert a["approach"] == ["streaming", "async_job"]
        a2, _, _ = parse_answers_from_body(
            "approach = streaming | keep_blocking", SAMPLE_QUESTIONS,
        )
        assert a2["approach"] == ["streaming", "keep_blocking"]

    def test_case_insensitive_single_choice(self):
        a, _, _ = parse_answers_from_body(
            "approach=STREAMING", SAMPLE_QUESTIONS,
        )
        assert a["approach"] == ["streaming"]

    def test_unknown_qid_ignored(self):
        a, _, left = parse_answers_from_body(
            "mystery=xyz\nlatency_target=<30s", SAMPLE_QUESTIONS,
        )
        assert a == {"latency_target": "<30s"}
        assert "mystery=xyz" in left

    def test_wrong_choice_dropped(self):
        a, _, _ = parse_answers_from_body(
            "latency_target=yesterday", SAMPLE_QUESTIONS,
        )
        assert a == {}

    def test_leftover_captured_as_free_text(self):
        body = "latency_target=<30s\n\nextra context about the fix"
        _, _, leftover = parse_answers_from_body(body, SAMPLE_QUESTIONS)
        assert "extra context" in leftover

    def test_ignores_quoted_history(self):
        body = (
            "latency_target=<5s\n"
            "On 14 Oct 2026 at 09:00 noreply wrote:\n"
            "> approach=streaming\n"
        )
        a, _, _ = parse_answers_from_body(body, SAMPLE_QUESTIONS)
        assert a == {"latency_target": "<5s"}


class TestSignature:
    def test_fails_closed_when_secret_missing(self, monkeypatch):
        monkeypatch.delenv("RESEND_INBOUND_SIGNING_SECRET", raising=False)
        ok, reason = verify_resend_signature(b"body", "sha256=abc")
        assert not ok and reason == "secret_not_configured"

    def test_missing_signature(self, monkeypatch):
        monkeypatch.setenv("RESEND_INBOUND_SIGNING_SECRET", "topsecret")
        ok, reason = verify_resend_signature(b"body", None)
        assert not ok and reason == "missing_signature"

    def test_valid_signature(self, monkeypatch):
        monkeypatch.setenv("RESEND_INBOUND_SIGNING_SECRET", "topsecret")
        body = b"hello"
        sig = hmac.new(b"topsecret", body, hashlib.sha256).hexdigest()
        ok, reason = verify_resend_signature(body, f"sha256={sig}")
        assert ok and reason == "ok"

    def test_mismatch(self, monkeypatch):
        monkeypatch.setenv("RESEND_INBOUND_SIGNING_SECRET", "topsecret")
        ok, reason = verify_resend_signature(b"hello", "sha256=0" * 32)
        assert not ok and reason == "mismatch"


class TestSenderMatch:
    def test_match_case_insensitive(self):
        assert sender_matches_recipient_or_admin(
            "Reporter@Example.com", ["reporter@example.com"]
        )

    def test_no_match(self):
        assert not sender_matches_recipient_or_admin(
            "spoof@evil.test", ["real@a.test", "ops@a.test"]
        )

    def test_empty_from(self):
        assert not sender_matches_recipient_or_admin(None, ["x@y.z"])


# ------- webhook end-to-end -----------------------------------------------

@pytest.fixture
def company(db) -> Company:
    return Company.objects.create(name="S12 Inbound Co")


@pytest.fixture
def issue(db, company):
    from django.contrib.auth import get_user_model
    U = get_user_model()
    rep = U.objects.create_user(
        email="elisa@re-care.org", password="x", username="elisa_s12",
    )
    for attr, val in (("company", company), ("company_id", company.id)):
        if hasattr(rep, attr):
            setattr(rep, attr, val)
    rep.save()
    i = ProductIssue.objects.create(
        title="ai-plan latency",
        company=company,
        reporter=rep,
        source="agent-scan",
        capture_method="auto_runtime",
        status="needs-decision",
        decision_questions=SAMPLE_QUESTIONS,
    )
    return i


def _signed_post(client, body: dict, secret: str) -> tuple[bytes, str]:
    raw = json.dumps(body).encode("utf-8")
    sig = hmac.new(secret.encode(), raw, hashlib.sha256).hexdigest()
    return raw, f"sha256={sig}"


class TestInboundWebhook:
    URL = "/api/v1/webhooks/resend/inbound-decision/"

    def test_full_answer_commits(self, db, issue, monkeypatch):
        monkeypatch.setenv("RESEND_INBOUND_SIGNING_SECRET", "s12-secret")
        body = {
            "from": "elisa@re-care.org",
            "subject": f"Re: [ProjeXtPal] #{issue.id} Beslissing nodig",
            "text": (
                "latency_target=<30s\n"
                "approach = streaming, async_job\n"
                "notes = graag streaming eerst\n"
                "\n"
                "Op maandag 14 oktober schreef ProjeXtPal:\n"
                "> --quoted body--"
            ),
        }
        raw, sig = _signed_post(None, body, "s12-secret")
        c = APIClient()
        res = c.post(
            self.URL, data=raw, content_type="application/json",
            HTTP_X_RESEND_SIGNATURE=sig,
        )
        assert res.status_code == 200, res.data
        issue.refresh_from_db()
        assert issue.status == "in-progress"
        assert issue.decision_answers["latency_target"] == "<30s"
        assert issue.decision_answers["approach"] == ["streaming", "async_job"]
        assert issue.decision_answers["notes"] == "graag streaming eerst"
        assert ProductIssueComment.objects.filter(issue=issue).count() == 1

    def test_partial_answer_leaves_comment_but_doesnt_commit(
        self, db, issue, monkeypatch,
    ):
        monkeypatch.setenv("RESEND_INBOUND_SIGNING_SECRET", "s12-secret")
        body = {
            "from": "elisa@re-care.org",
            "subject": f"Re: [ProjeXtPal] #{issue.id} Beslissing nodig",
            "text": "latency_target=<5s",  # missing approach + notes
        }
        raw, sig = _signed_post(None, body, "s12-secret")
        res = APIClient().post(
            self.URL, data=raw, content_type="application/json",
            HTTP_X_RESEND_SIGNATURE=sig,
        )
        assert res.status_code == 200
        assert res.data["status"] == "partial"
        issue.refresh_from_db()
        assert issue.status == "needs-decision"  # unchanged
        assert issue.decision_answers == {}
        # Partial-reply comment stored on the thread.
        assert ProductIssueComment.objects.filter(issue=issue).count() == 1

    def test_rejects_unverified_signature(self, db, issue, monkeypatch):
        monkeypatch.setenv("RESEND_INBOUND_SIGNING_SECRET", "s12-secret")
        res = APIClient().post(
            self.URL,
            data=json.dumps({"subject": f"#{issue.id}", "text": "x"}),
            content_type="application/json",
            HTTP_X_RESEND_SIGNATURE="sha256=" + "0" * 64,
        )
        assert res.status_code == 401

    def test_rejects_sender_mismatch(self, db, issue, monkeypatch):
        monkeypatch.setenv("RESEND_INBOUND_SIGNING_SECRET", "s12-secret")
        body = {
            "from": "spoof@evil.test",
            "subject": f"#{issue.id} Beslissing nodig",
            "text": "latency_target=<30s\napproach=streaming\nnotes=x",
        }
        raw, sig = _signed_post(None, body, "s12-secret")
        res = APIClient().post(
            self.URL, data=raw, content_type="application/json",
            HTTP_X_RESEND_SIGNATURE=sig,
        )
        assert res.status_code == 403

    def test_drops_reply_on_resolved_issue(self, db, issue, monkeypatch):
        monkeypatch.setenv("RESEND_INBOUND_SIGNING_SECRET", "s12-secret")
        issue.status = "resolved"
        issue.save(update_fields=["status"])
        body = {
            "from": "elisa@re-care.org",
            "subject": f"Re: #{issue.id}",
            "text": "latency_target=<30s\napproach=streaming\nnotes=x",
        }
        raw, sig = _signed_post(None, body, "s12-secret")
        res = APIClient().post(
            self.URL, data=raw, content_type="application/json",
            HTTP_X_RESEND_SIGNATURE=sig,
        )
        # 202 — we accepted the POST (don't retry) but didn't mutate.
        assert res.status_code == 202
        issue.refresh_from_db()
        assert issue.status == "resolved"
