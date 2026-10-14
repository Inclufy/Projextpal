"""Sprint 12 — ProductIssue decision-flow model fields.

Covers the storage layer: the schema additions in migration 0004 that back
the needs-decision pipeline. Endpoint + UI + email coverage lives in the
S12-02 / S12-03 / S12-04 test modules.
"""
from __future__ import annotations

import pytest
from django.utils import timezone

from accounts.models import Company
from product_issues.models import ProductIssue


@pytest.fixture
def company(db) -> Company:
    return Company.objects.create(name="S12 Decision Co")


@pytest.fixture
def issue(db, company) -> ProductIssue:
    return ProductIssue.objects.create(
        title="ai-plan latency",
        description="takes 64s to render",
        company=company,
        source="agent-scan",
        capture_method="auto_runtime",
        status="new",
    )


class TestDecisionStatusChoice:
    def test_needs_decision_is_a_valid_status(self, db, issue):
        issue.status = "needs-decision"
        issue.full_clean()
        issue.save(update_fields=["status"])
        issue.refresh_from_db()
        assert issue.status == "needs-decision"

    def test_needs_decision_appears_in_choices(self, db):
        values = {code for code, _ in ProductIssue.STATUS_CHOICES}
        assert "needs-decision" in values


class TestDecisionFieldDefaults:
    def test_decision_questions_defaults_to_empty_list(self, db, issue):
        assert issue.decision_questions == []

    def test_decision_answers_defaults_to_empty_dict(self, db, issue):
        assert issue.decision_answers == {}

    def test_decision_history_defaults_to_empty_list(self, db, issue):
        assert issue.decision_history == []

    def test_decision_last_requested_at_defaults_to_none(self, db, issue):
        assert issue.decision_last_requested_at is None


class TestDecisionFieldRoundTrip:
    def test_questions_persist_as_structured_json(self, db, issue):
        issue.decision_questions = [
            {
                "id": "q1",
                "text": "Should ai-plan stream tokens or return a job id?",
                "type": "single_choice",
                "choices": ["streaming", "async_job", "keep_blocking"],
            },
            {
                "id": "q2",
                "text": "Acceptable p95 latency target?",
                "type": "single_choice",
                "choices": ["<5s", "<30s", "<60s"],
            },
        ]
        issue.decision_last_requested_at = timezone.now()
        issue.save(
            update_fields=["decision_questions", "decision_last_requested_at"]
        )
        issue.refresh_from_db()
        assert len(issue.decision_questions) == 2
        assert issue.decision_questions[0]["id"] == "q1"
        assert issue.decision_questions[1]["choices"] == ["<5s", "<30s", "<60s"]
        assert issue.decision_last_requested_at is not None

    def test_history_appends_without_losing_prior_rounds(self, db, issue):
        issue.decision_history = [
            {
                "round": 1,
                "questions": [{"id": "q1", "text": "..."}],
                "answers": {"q1": "streaming"},
                "requested_at": "2026-10-14T10:00:00Z",
                "answered_at": "2026-10-14T10:30:00Z",
                "answered_by": "elisa@re-care.org",
                "worker_run_id": "wf_s12_01",
                "outcome": "no_fix_still_needs_decision",
            }
        ]
        issue.save(update_fields=["decision_history"])
        issue.refresh_from_db()
        issue.decision_history = issue.decision_history + [
            {
                "round": 2,
                "questions": [{"id": "q1", "text": "clarifying q"}],
                "answers": {"q1": "<30s"},
                "requested_at": "2026-10-14T11:00:00Z",
                "answered_at": "2026-10-14T11:15:00Z",
                "answered_by": "sami@inclufy.com",
                "worker_run_id": "wf_s12_02",
                "outcome": "pr_opened",
            }
        ]
        issue.save(update_fields=["decision_history"])
        issue.refresh_from_db()
        assert len(issue.decision_history) == 2
        assert [row["round"] for row in issue.decision_history] == [1, 2]
        assert issue.decision_history[-1]["outcome"] == "pr_opened"
