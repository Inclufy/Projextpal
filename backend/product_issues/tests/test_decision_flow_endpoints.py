"""Sprint 12 — decision-request endpoints.

Covers:
  * POST /api/v1/product-issues/{id}/needs-decision/       (worker only)
  * POST /api/v1/product-issues/{id}/answer-decision/       (reporter / tenant admin)
"""
from __future__ import annotations

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient

from accounts.models import Company
from product_issues.models import ProductIssue, ProductIssueComment

User = get_user_model()


@pytest.fixture
def company(db) -> Company:
    return Company.objects.create(name="S12 Endpoint Co")


@pytest.fixture
def other_company(db) -> Company:
    return Company.objects.create(name="S12 Other Co")


@pytest.fixture
def reporter(db, company) -> User:
    u = User.objects.create_user(
        email="reporter@s12.test", password="x", username="reporter_s12",
    )
    # Model fields vary across projects — set what exists so filtering works.
    for attr, val in (("company", company), ("company_id", company.id),
                       ("role", "member")):
        if hasattr(u, attr):
            setattr(u, attr, val)
    u.save()
    return u


@pytest.fixture
def tenant_admin(db, company) -> User:
    u = User.objects.create_user(
        email="admin@s12.test", password="x", username="admin_s12",
    )
    for attr, val in (("company", company), ("company_id", company.id),
                       ("role", "admin")):
        if hasattr(u, attr):
            setattr(u, attr, val)
    u.save()
    return u


@pytest.fixture
def outsider(db, other_company) -> User:
    u = User.objects.create_user(
        email="outsider@s12.test", password="x", username="outsider_s12",
    )
    for attr, val in (("company", other_company),
                       ("company_id", other_company.id),
                       ("role", "member")):
        if hasattr(u, attr):
            setattr(u, attr, val)
    u.save()
    return u


@pytest.fixture
def worker(db, settings, monkeypatch) -> User:
    u = User.objects.create_user(
        email="worker@s12.test", password="x", username="worker_s12",
    )
    monkeypatch.setenv("PRODUCT_ISSUE_WORKER_USER_IDS", str(u.id))
    return u


@pytest.fixture
def issue(db, company, reporter) -> ProductIssue:
    return ProductIssue.objects.create(
        title="ai-plan takes 64s",
        description="latency on /ai-plan",
        company=company,
        reporter=reporter,
        source="agent-scan",
        capture_method="auto_runtime",
        status="new",
    )


# -------- helpers ---------------------------------------------------------

def _api(user: User) -> APIClient:
    c = APIClient()
    c.force_authenticate(user=user)
    return c


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
        "type": "single_choice",
        "choices": ["streaming", "async_job", "keep_blocking"],
    },
]


# -------- /needs-decision/ -----------------------------------------------

class TestNeedsDecisionEndpoint:
    def test_worker_can_open_decision_round(self, db, worker, issue):
        res = _api(worker).post(
            f"/api/v1/product-issues/{issue.id}/needs-decision/",
            {"questions": SAMPLE_QUESTIONS, "worker_run_id": "wf_42",
             "reason": "architecture choice"},
            format="json",
        )
        assert res.status_code == 200, res.data
        issue.refresh_from_db()
        assert issue.status == "needs-decision"
        assert len(issue.decision_questions) == 2
        assert issue.decision_answers == {}
        assert issue.decision_last_requested_at is not None
        assert len(issue.decision_history) == 1
        assert issue.decision_history[0]["outcome"] == "awaiting_answer"
        assert issue.decision_history[0]["worker_run_id"] == "wf_42"

    def test_non_worker_is_rejected(self, db, reporter, issue):
        res = _api(reporter).post(
            f"/api/v1/product-issues/{issue.id}/needs-decision/",
            {"questions": SAMPLE_QUESTIONS}, format="json",
        )
        assert res.status_code == 403, res.data

    def test_terminal_issue_returns_409(self, db, worker, issue):
        issue.status = "resolved"
        issue.save(update_fields=["status"])
        res = _api(worker).post(
            f"/api/v1/product-issues/{issue.id}/needs-decision/",
            {"questions": SAMPLE_QUESTIONS}, format="json",
        )
        assert res.status_code == 409, res.data

    def test_empty_questions_rejected(self, db, worker, issue):
        res = _api(worker).post(
            f"/api/v1/product-issues/{issue.id}/needs-decision/",
            {"questions": []}, format="json",
        )
        assert res.status_code == 400

    def test_too_many_questions_rejected(self, db, worker, issue):
        res = _api(worker).post(
            f"/api/v1/product-issues/{issue.id}/needs-decision/",
            {"questions": [
                {"id": f"q{i}", "text": "x" * 10, "type": "text"}
                for i in range(6)
            ]},
            format="json",
        )
        assert res.status_code == 400

    def test_duplicate_question_ids_rejected(self, db, worker, issue):
        qs = [
            {"id": "same", "text": "a", "type": "text"},
            {"id": "same", "text": "b", "type": "text"},
        ]
        res = _api(worker).post(
            f"/api/v1/product-issues/{issue.id}/needs-decision/",
            {"questions": qs}, format="json",
        )
        assert res.status_code == 400

    def test_second_round_supersedes_first(self, db, worker, issue):
        c = _api(worker)
        c.post(f"/api/v1/product-issues/{issue.id}/needs-decision/",
               {"questions": SAMPLE_QUESTIONS}, format="json")
        c.post(f"/api/v1/product-issues/{issue.id}/needs-decision/",
               {"questions": [
                   {"id": "q", "text": "clarify", "type": "text"}
               ]}, format="json")
        issue.refresh_from_db()
        assert len(issue.decision_history) == 2
        # Oldest round superseded, newest awaits answer.
        assert issue.decision_history[0]["outcome"] == "superseded"
        assert issue.decision_history[1]["outcome"] == "awaiting_answer"


# -------- /answer-decision/ -----------------------------------------------

def _open_decision(worker: User, issue: ProductIssue) -> None:
    _api(worker).post(
        f"/api/v1/product-issues/{issue.id}/needs-decision/",
        {"questions": SAMPLE_QUESTIONS, "worker_run_id": "wf_42"},
        format="json",
    )
    issue.refresh_from_db()


class TestAnswerDecisionEndpoint:
    def test_reporter_can_answer(self, db, worker, reporter, issue):
        _open_decision(worker, issue)
        res = _api(reporter).post(
            f"/api/v1/product-issues/{issue.id}/answer-decision/",
            {"answers": {"latency_target": "<30s", "approach": "streaming"},
             "free_text": "kies de snelste optie"},
            format="json",
        )
        assert res.status_code == 200, res.data
        issue.refresh_from_db()
        assert issue.status == "in-progress"
        assert issue.decision_answers == {
            "latency_target": "<30s", "approach": "streaming"
        }
        # History row closed.
        last = issue.decision_history[-1]
        assert last["outcome"] == "awaiting_worker"
        assert last["answers"]["approach"] == "streaming"
        assert last["answered_by"] == "reporter@s12.test"
        # Audit comment created.
        assert ProductIssueComment.objects.filter(issue=issue).count() == 1

    def test_tenant_admin_can_answer(self, db, worker, tenant_admin, issue):
        _open_decision(worker, issue)
        res = _api(tenant_admin).post(
            f"/api/v1/product-issues/{issue.id}/answer-decision/",
            {"answers": {"latency_target": "<5s", "approach": "async_job"}},
            format="json",
        )
        assert res.status_code == 200, res.data

    def test_outsider_is_rejected(self, db, worker, outsider, issue):
        _open_decision(worker, issue)
        res = _api(outsider).post(
            f"/api/v1/product-issues/{issue.id}/answer-decision/",
            {"answers": {"latency_target": "<5s", "approach": "streaming"}},
            format="json",
        )
        # Outsider's company filter hides the row → 404 before permission check,
        # OR permission denies → 403. Either way they must not succeed.
        assert res.status_code in (403, 404), res.data

    def test_wrong_choice_rejected(self, db, worker, reporter, issue):
        _open_decision(worker, issue)
        res = _api(reporter).post(
            f"/api/v1/product-issues/{issue.id}/answer-decision/",
            {"answers": {"latency_target": "yesterday",
                           "approach": "streaming"}},
            format="json",
        )
        assert res.status_code == 400
        assert "latency_target" in res.data.get("answers", {})

    def test_missing_answer_rejected(self, db, worker, reporter, issue):
        _open_decision(worker, issue)
        res = _api(reporter).post(
            f"/api/v1/product-issues/{issue.id}/answer-decision/",
            {"answers": {"approach": "streaming"}},
            format="json",
        )
        assert res.status_code == 400
        assert "latency_target" in res.data.get("answers", {})

    def test_cannot_answer_without_open_decision(self, db, reporter, issue):
        res = _api(reporter).post(
            f"/api/v1/product-issues/{issue.id}/answer-decision/",
            {"answers": {"x": "y"}}, format="json",
        )
        assert res.status_code == 409
