"""Tests for the GitHub ``repository_dispatch`` branch of _post_webhook.

Sprint 11 S11-01 — the orchestrator-detect tweak in claude_triage.py.
"""
from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest

from product_issues.claude_triage import ClaudeAutoTriage, TriageError


class _FakeResp:
    def __init__(self, status_code: int = 204, text: str = "", body=None):
        self.status_code = status_code
        self.text = text
        self._body = body if body is not None else {}

    def json(self):
        return self._body


# ---------------------------------------------------------------------------
# URL detection
# ---------------------------------------------------------------------------


def test_detects_github_dispatch_url():
    t = ClaudeAutoTriage(
        webhook_url="https://api.github.com/repos/Inclufy/Projextpal/dispatches",
        webhook_secret="s",
        enabled=False,
        webhook_auth="",
    )
    assert t._is_github_dispatch_url(t.webhook_url)
    # Trailing slash tolerated.
    assert t._is_github_dispatch_url(
        "https://api.github.com/repos/x/y/dispatches/"
    )


def test_detects_non_github_url():
    t = ClaudeAutoTriage(
        webhook_url="https://orchestrator.inclufy.com/webhook",
        webhook_secret="s",
        enabled=False,
        webhook_auth="",
    )
    assert not t._is_github_dispatch_url(t.webhook_url)
    assert not t._is_github_dispatch_url(
        "https://api.github.com/repos/x/y/issues"
    )
    assert not t._is_github_dispatch_url("not-a-url")


# ---------------------------------------------------------------------------
# POST body + headers for the GitHub path
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    "raw_auth,expected",
    [
        ("ghp_abc123", "Bearer ghp_abc123"),
        ("Bearer ghp_abc123", "Bearer ghp_abc123"),
        ("token ghp_abc123", "token ghp_abc123"),
    ],
)
def test_github_dispatch_wraps_payload_and_sets_auth(raw_auth, expected):
    t = ClaudeAutoTriage(
        webhook_url="https://api.github.com/repos/Inclufy/Projextpal/dispatches",
        webhook_secret="hmacsecret",
        enabled=False,
        webhook_auth=raw_auth,
    )
    payload = {"issue_id": 42, "title": "fix typo"}

    with patch("requests.post", return_value=_FakeResp(204)) as mock_post:
        tracking_id = t._post_webhook(payload)

    assert mock_post.call_count == 1
    _, kwargs = mock_post.call_args
    headers = kwargs["headers"]
    body = kwargs["data"]

    # Correct auth header, GitHub media type, HMAC signature preserved.
    assert headers["Authorization"] == expected
    assert headers["Accept"] == "application/vnd.github+json"
    assert headers["X-GitHub-Api-Version"] == "2022-11-28"
    assert headers["X-ProjeXtPal-Signature"].startswith("sha256=")

    # The outbound body wraps the ProjeXtPal payload into the
    # repository_dispatch shape ({event_type, client_payload}).
    import json as _json

    body_obj = _json.loads(body.decode("utf-8"))
    assert body_obj["event_type"] == "claude-auto-triage"
    assert body_obj["client_payload"] == payload

    # Tracking id placeholder is distinctively tagged.
    assert tracking_id.startswith("gh-dispatch-")


def test_generic_webhook_sends_raw_payload():
    t = ClaudeAutoTriage(
        webhook_url="https://orchestrator.inclufy.com/webhook",
        webhook_secret="hmacsecret",
        enabled=False,
        webhook_auth="ignored-for-generic",
    )
    payload = {"issue_id": 1, "title": "x"}

    with patch(
        "requests.post",
        return_value=_FakeResp(200, body={"agent_id": "run-99"}),
    ) as mock_post:
        tracking_id = t._post_webhook(payload)

    _, kwargs = mock_post.call_args
    headers = kwargs["headers"]
    import json as _json

    body_obj = _json.loads(kwargs["data"].decode("utf-8"))

    # Generic path: no wrapping, no Authorization header.
    assert "Authorization" not in headers
    assert body_obj == payload
    assert tracking_id == "run-99"


def test_github_dispatch_raises_on_error_status():
    t = ClaudeAutoTriage(
        webhook_url="https://api.github.com/repos/Inclufy/Projextpal/dispatches",
        webhook_secret="s",
        enabled=False,
        webhook_auth="ghp_x",
    )
    with patch(
        "requests.post",
        return_value=_FakeResp(422, text="Unprocessable Entity"),
    ):
        with pytest.raises(TriageError, match="422"):
            t._post_webhook({"issue_id": 1})
