"""Tests for the Claude Auto-Triage pipeline (Sprint 10 S10-02).

Covers:

  1. ``should_auto_triage`` returns True for P1 agent-scan on a safe
     category, and False for P3 / user-reported / wrong-category /
     already-in-progress issues.
  2. ``_category_auto_fixable`` heuristic — hard whitelist + hint-match.
  3. ``trigger_fix_agent`` POSTs to the webhook with the expected payload
     and returns the tracking id.
  4. ``mark_in_progress`` updates status + metadata correctly.
  5. The ``claude_auto_triage`` management command picks up new issues.
  6. ``POST /claude-callback/`` endpoint accepts status updates and
     flips the issue to ``resolved`` on ``status=merged``.
  7. The post_save signal fires an immediate trigger for P1 agent-scan
     issues (synchronously in the test; the production path uses a
     daemon thread).
  8. ``CLAUDE_AUTO_TRIAGE_ENABLED=false`` short-circuits the pipeline.
"""
from __future__ import annotations

import hashlib
import hmac
import json
from io import StringIO
from unittest.mock import MagicMock, patch

import pytest
from django.core.management import call_command
from django.test import override_settings
from django.urls import reverse

from product_issues.claude_triage import ClaudeAutoTriage, TriageError
from product_issues.models import ProductIssue


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

def _make_issue(company, **overrides) -> ProductIssue:
    defaults = dict(
        title="Dead link on dashboard — /old-url 404s",
        description="Dead-code link that still points at the old URL.",
        error_trace="",
        status="new",
        source="agent-scan",
        priority="P1",
        category="ui",
        capture_method="auto_ci",
        environment={"client": "web"},
        company=company,
    )
    defaults.update(overrides)
    return ProductIssue.objects.create(**defaults)


@pytest.fixture
def triage():
    """Enabled triage with a stub webhook URL + secret."""
    return ClaudeAutoTriage(
        webhook_url="https://example.test/claude-webhook",
        webhook_secret="unit-test-secret",
        enabled=True,
    )


# ---------------------------------------------------------------------------
# 1. should_auto_triage policy gate
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_should_auto_triage_true_for_p1_agent_scan_ui(company, triage):
    issue = _make_issue(company)
    assert triage.should_auto_triage(issue) is True


@pytest.mark.django_db
def test_should_auto_triage_false_for_user_report(company, triage):
    issue = _make_issue(company, source="user", priority="P3")
    assert triage.should_auto_triage(issue) is False


@pytest.mark.django_db
def test_should_auto_triage_false_when_disabled(company):
    disabled = ClaudeAutoTriage(
        webhook_url="https://example.test/x",
        webhook_secret="s",
        enabled=False,
    )
    issue = _make_issue(company)
    assert disabled.should_auto_triage(issue) is False


@pytest.mark.django_db
def test_should_auto_triage_false_when_already_in_progress(company, triage):
    issue = _make_issue(
        company,
        metadata={"claude_agent_id": "run_abc"},
    )
    assert triage.should_auto_triage(issue) is False


@pytest.mark.django_db
def test_should_auto_triage_false_for_unsafe_category(company, triage):
    """Security / auth categories are deliberately NOT auto-fixable."""
    issue = _make_issue(
        company,
        category="security",
        title="SQL injection in /x",
        description="Possible SQLi vulnerability in a query handler.",
    )
    # No hint keyword triggers either, so this must fall through.
    assert triage.should_auto_triage(issue) is False


# ---------------------------------------------------------------------------
# 2. _category_auto_fixable heuristic
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_category_auto_fixable_whitelist_and_hints(company, triage):
    # Override description so the default fixture's "dead-code" phrase
    # doesn't accidentally match the hint-set for every row.
    ui_issue = _make_issue(
        company, category="ui", title="Button copy wrong", description=""
    )
    doc_issue = _make_issue(
        company, category="documentation", title="Fix README", description=""
    )
    i18n_issue = _make_issue(
        company,
        category="other",
        title="Missing translation on login page",
        description="",
    )
    typo_issue = _make_issue(
        company, category="api", title="Typo in error message", description=""
    )
    perf_issue = _make_issue(
        company,
        category="performance",
        title="Slow query on /projects",
        description="Query is too slow under load",
    )
    assert triage._category_auto_fixable(ui_issue) is True
    assert triage._category_auto_fixable(doc_issue) is True
    assert triage._category_auto_fixable(i18n_issue) is True
    assert triage._category_auto_fixable(typo_issue) is True
    assert triage._category_auto_fixable(perf_issue) is False


# ---------------------------------------------------------------------------
# 3. trigger_fix_agent — webhook POST
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_trigger_fix_agent_posts_webhook_and_returns_id(company, triage):
    issue = _make_issue(company)

    fake_resp = MagicMock()
    fake_resp.status_code = 200
    fake_resp.json.return_value = {"agent_id": "run_xyz_42"}
    fake_resp.text = ""

    with patch("requests.post", return_value=fake_resp) as m_post:
        tracking = triage.trigger_fix_agent(issue)

    assert tracking == "run_xyz_42"
    assert m_post.called
    call = m_post.call_args
    assert call.args[0] == "https://example.test/claude-webhook"
    assert "X-ProjeXtPal-Signature" in call.kwargs["headers"]
    sig = call.kwargs["headers"]["X-ProjeXtPal-Signature"]
    assert sig.startswith("sha256=")
    # Signature validates against the POSTed body
    body = call.kwargs["data"]
    expected = hmac.new(
        b"unit-test-secret", body, hashlib.sha256
    ).hexdigest()
    assert sig == f"sha256={expected}"
    # Payload fields the external agent cares about
    payload = json.loads(body.decode("utf-8"))
    assert payload["issue_id"] == issue.id
    assert payload["title"] == issue.title
    assert payload["priority"] == "P1"
    assert "callback_url" in payload


@pytest.mark.django_db
def test_trigger_fix_agent_raises_on_http_error(company, triage):
    issue = _make_issue(company)
    fake_resp = MagicMock()
    fake_resp.status_code = 500
    fake_resp.text = "boom"
    with patch("requests.post", return_value=fake_resp):
        with pytest.raises(TriageError):
            triage.trigger_fix_agent(issue)


# ---------------------------------------------------------------------------
# 4. mark_in_progress — state transition
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_mark_in_progress_updates_status_and_metadata(company, triage):
    issue = _make_issue(company)
    triage.mark_in_progress(issue, "run_42")

    issue.refresh_from_db()
    assert issue.status == "in-progress"
    assert issue.triaged_by == "agent:claude-auto-triage"
    assert issue.triaged_at is not None
    assert issue.metadata["claude_agent_id"] == "run_42"
    assert issue.metadata["claude_attempts"] == 1
    assert "claude_triggered_at" in issue.metadata


# ---------------------------------------------------------------------------
# 5. Management command picks up new issues
# ---------------------------------------------------------------------------

@pytest.mark.django_db
@override_settings(
    CLAUDE_AUTO_TRIAGE_ENABLED=True,
    CLAUDE_FIX_AGENT_WEBHOOK="https://example.test/hook",
    CLAUDE_FIX_AGENT_WEBHOOK_SECRET="s",
)
def test_management_command_triggers_new_agent_scan_issues(company):
    _make_issue(company, title="Typo on sidebar")
    _make_issue(
        company,
        title="Not for auto",
        source="user",
        priority="P3",
        category="api",
    )

    fake_resp = MagicMock()
    fake_resp.status_code = 200
    fake_resp.json.return_value = {"agent_id": "run_cron"}

    out = StringIO()
    with patch("requests.post", return_value=fake_resp) as m_post:
        call_command("claude_auto_triage", "--limit", "10", stdout=out)

    # Exactly one issue should match the gate (the P1 agent-scan one).
    assert m_post.call_count == 1
    text = out.getvalue()
    assert "triggered run_cron" in text


@pytest.mark.django_db
@override_settings(
    CLAUDE_AUTO_TRIAGE_ENABLED=False,
    CLAUDE_FIX_AGENT_WEBHOOK="https://example.test/hook",
)
def test_management_command_noop_when_disabled(company):
    _make_issue(company)
    out = StringIO()
    with patch("requests.post") as m_post:
        call_command("claude_auto_triage", "--limit", "10", stdout=out)
    assert m_post.called is False
    assert "disabled" in out.getvalue().lower()


# ---------------------------------------------------------------------------
# 6. /claude-callback/ endpoint
# ---------------------------------------------------------------------------

def _signed_headers(body: bytes, secret: str) -> dict:
    sig = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
    return {"HTTP_X_PROJEXTPAL_SIGNATURE": f"sha256={sig}"}


@pytest.mark.django_db
@override_settings(CLAUDE_FIX_AGENT_WEBHOOK_SECRET="cb-secret")
def test_claude_callback_marks_resolved_on_merged(company, api_client):
    issue = _make_issue(company)
    url = reverse(
        "product-issue-claude-callback", kwargs={"pk": issue.pk}
    )
    body = {
        "status": "merged",
        "pr_url": "https://github.com/Inclufy/projextpal/pull/42",
        "commit_sha": "deadbeef",
        "agent_id": "run_cb_1",
    }
    raw = json.dumps(body).encode("utf-8")
    resp = api_client.post(
        url,
        data=raw,
        content_type="application/json",
        **_signed_headers(raw, "cb-secret"),
    )
    assert resp.status_code == 200, resp.content
    issue.refresh_from_db()
    assert issue.status == "resolved"
    assert issue.resolved_at is not None
    assert issue.linked_pr_url.endswith("/pull/42")
    assert issue.metadata["claude_pr_url"].endswith("/pull/42")
    assert issue.metadata["claude_commit_sha"] == "deadbeef"


@pytest.mark.django_db
@override_settings(CLAUDE_FIX_AGENT_WEBHOOK_SECRET="cb-secret")
def test_claude_callback_rejects_bad_signature(company, api_client):
    issue = _make_issue(company)
    url = reverse(
        "product-issue-claude-callback", kwargs={"pk": issue.pk}
    )
    resp = api_client.post(
        url,
        data=json.dumps({"status": "merged"}),
        content_type="application/json",
        HTTP_X_PROJEXTPAL_SIGNATURE="sha256=deadbeefdeadbeef",
    )
    assert resp.status_code == 401


@pytest.mark.django_db
@override_settings(CLAUDE_FIX_AGENT_WEBHOOK_SECRET="cb-secret")
def test_claude_callback_rejects_unknown_status(company, api_client):
    issue = _make_issue(company)
    url = reverse(
        "product-issue-claude-callback", kwargs={"pk": issue.pk}
    )
    body = {"status": "weird_state"}
    raw = json.dumps(body).encode()
    resp = api_client.post(
        url,
        data=raw,
        content_type="application/json",
        **_signed_headers(raw, "cb-secret"),
    )
    assert resp.status_code == 400


# ---------------------------------------------------------------------------
# 7. Signal — immediate trigger for P1 agent-scan
# ---------------------------------------------------------------------------

@pytest.mark.django_db
@override_settings(
    CLAUDE_AUTO_TRIAGE_ENABLED=True,
    CLAUDE_FIX_AGENT_WEBHOOK="https://example.test/hook",
    CLAUDE_FIX_AGENT_WEBHOOK_SECRET="s",
)
def test_signal_triggers_for_new_p1_agent_scan(company):
    """The signal spawns a daemon thread — patch Thread so the work runs
    synchronously in the test, which lets us assert on the webhook call."""

    def _inline_thread(target=None, daemon=None, **kw):
        class _Inline:
            def start(_self):  # noqa: ANN001
                if target:
                    target()

        return _Inline()

    fake_resp = MagicMock()
    fake_resp.status_code = 200
    fake_resp.json.return_value = {"agent_id": "run_signal"}

    with patch(
        "product_issues.signals.threading.Thread",
        side_effect=_inline_thread,
    ), patch("requests.post", return_value=fake_resp) as m_post:
        issue = _make_issue(company)
        # Give the inline "thread" a chance to finish writing back.
        issue.refresh_from_db()

    assert m_post.call_count == 1
    assert issue.metadata.get("claude_agent_id") == "run_signal"
    assert issue.status == "in-progress"


# ---------------------------------------------------------------------------
# 8. Opt-in default — pipeline off by default
# ---------------------------------------------------------------------------

@pytest.mark.django_db
@override_settings(
    CLAUDE_AUTO_TRIAGE_ENABLED=False,
    CLAUDE_FIX_AGENT_WEBHOOK="",
)
def test_signal_noop_when_disabled(company):
    """With both opt-in flags off, no webhook may be POSTed when a new
    agent-scan P1 is created."""

    def _inline_thread(target=None, daemon=None, **kw):
        class _Inline:
            def start(_self):  # noqa: ANN001
                if target:
                    target()

        return _Inline()

    with patch(
        "product_issues.signals.threading.Thread",
        side_effect=_inline_thread,
    ), patch("requests.post") as m_post:
        _make_issue(company)

    assert m_post.called is False
