"""Sprint 12 — Resend/email trigger on status→needs-decision.

The signals module threads the actual Resend call off to a daemon thread so
we patch ``_send_email_safe`` directly to assert what WOULD have been sent.
"""
from __future__ import annotations

from unittest.mock import patch

import pytest
from django.utils import timezone

from accounts.models import Company
from product_issues.models import ProductIssue


@pytest.fixture
def company(db) -> Company:
    return Company.objects.create(name="S12 Email Co")


@pytest.fixture
def issue(db, company) -> ProductIssue:
    return ProductIssue.objects.create(
        title="ai-plan takes 64s",
        description="latency",
        company=company,
        source="agent-scan",
        capture_method="auto_runtime",
        status="new",
    )


SAMPLE_QUESTIONS = [
    {
        "id": "latency_target",
        "text": "Acceptable p95 latency?",
        "type": "single_choice",
        "choices": ["<5s", "<30s", "<60s"],
    },
    {
        "id": "notes",
        "text": "Anything else we should know?",
        "type": "text",
        "help": "Free text, optional.",
    },
]


class TestNeedsDecisionEmail:
    def test_transition_fires_email(self, db, issue):
        issue.decision_questions = SAMPLE_QUESTIONS
        issue.decision_last_requested_at = timezone.now()
        with patch("product_issues.signals._send_email_safe") as send:
            with patch(
                "product_issues.signals._admin_emails",
                return_value=["admin@s12.test"],
            ):
                issue.status = "needs-decision"
                issue.save()
        assert send.called
        kwargs = send.call_args.kwargs
        assert "Beslissing nodig" in kwargs["subject"]
        assert "latency_target" in kwargs["text_body"]
        assert "<5s" in kwargs["text_body"]
        assert "admin@s12.test" in kwargs["to"]

    def test_no_questions_skips_email(self, db, issue):
        # Status moves to needs-decision but questions is still [] —
        # defensive branch must not call Resend.
        with patch("product_issues.signals._send_email_safe") as send:
            with patch(
                "product_issues.signals._admin_emails",
                return_value=["admin@s12.test"],
            ):
                issue.status = "needs-decision"
                issue.save()
        assert not send.called

    def test_no_recipients_skips_email(self, db, company):
        issue = ProductIssue.objects.create(
            title="anon reporter",
            company=company,
            source="agent-scan",
            capture_method="auto_runtime",
            status="new",
            decision_questions=SAMPLE_QUESTIONS,
            # No reporter, no admin emails → nothing to send.
        )
        with patch("product_issues.signals._send_email_safe") as send:
            with patch("product_issues.signals._admin_emails", return_value=[]):
                issue.status = "needs-decision"
                issue.save()
        assert not send.called

    def test_html_body_lists_all_questions_and_choices(self, db, issue):
        issue.decision_questions = SAMPLE_QUESTIONS
        with patch("product_issues.signals._send_email_safe") as send:
            with patch(
                "product_issues.signals._admin_emails",
                return_value=["admin@s12.test"],
            ):
                issue.status = "needs-decision"
                issue.save()
        html = send.call_args.kwargs["html_body"]
        assert "latency_target" in html
        assert "&lt;5s" in html or "<5s" in html  # escape or raw — either is fine
        assert "notes" in html
        assert "Vrij tekstantwoord" in html

    def test_resolved_still_uses_resolution_mail_not_decision_mail(self, db, issue):
        # Sanity: unrelated status transitions keep their own template.
        with patch("product_issues.signals._notify_reporter_needs_decision") as nd:
            with patch("product_issues.signals._notify_reporter_resolved") as rr:
                issue.status = "resolved"
                issue.save()
        assert not nd.called
        assert rr.called
