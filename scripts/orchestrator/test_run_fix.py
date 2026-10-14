"""Unit tests for the Claude Auto-Triage orchestrator (Sprint 11 S11-01).

Pure-Python, no Django and no network. Each test exercises one slice of
run_fix.py so a regression surfaces as a focused failure.

Run with: ``python3 -m pytest scripts/orchestrator/test_run_fix.py``
"""
from __future__ import annotations

import hashlib
import hmac
import io
import json
import os
import pathlib
import sys

import pytest

# scripts/ isn't on sys.path by default — add this file's parent dir.
HERE = pathlib.Path(__file__).resolve().parent
if str(HERE) not in sys.path:
    sys.path.insert(0, str(HERE))

import run_fix  # noqa: E402  (sys.path hack above)


# ---------------------------------------------------------------------------
# _load_payload
# ---------------------------------------------------------------------------


def test_load_payload_prefers_repository_dispatch_over_manual():
    env = {
        "ISSUE_PAYLOAD": json.dumps({"issue_id": 7, "title": "fix typo"}),
        "ISSUE_PAYLOAD_MANUAL": json.dumps({"issue_id": 9999}),
    }
    assert run_fix._load_payload(env) == {"issue_id": 7, "title": "fix typo"}


def test_load_payload_falls_back_to_manual_dispatch():
    env = {
        "ISSUE_PAYLOAD": "",  # workflow_dispatch leaves this empty
        "ISSUE_PAYLOAD_MANUAL": json.dumps({"issue_id": 42}),
    }
    assert run_fix._load_payload(env) == {"issue_id": 42}


def test_load_payload_rejects_malformed_json():
    with pytest.raises(ValueError, match="malformed"):
        run_fix._load_payload({"ISSUE_PAYLOAD": "{not-json"})


def test_load_payload_rejects_non_object():
    with pytest.raises(ValueError, match="JSON object"):
        run_fix._load_payload({"ISSUE_PAYLOAD": "[1, 2, 3]"})


def test_load_payload_blank_returns_empty_dict():
    assert run_fix._load_payload({}) == {}
    assert run_fix._load_payload({"ISSUE_PAYLOAD": "   "}) == {}
    assert run_fix._load_payload({"ISSUE_PAYLOAD": "null"}) == {}


# ---------------------------------------------------------------------------
# _is_safe_relpath
# ---------------------------------------------------------------------------


def test_is_safe_relpath_accepts_simple_relative(tmp_path: pathlib.Path):
    assert run_fix._is_safe_relpath("backend/x.py", root=tmp_path)
    assert run_fix._is_safe_relpath("a/b/c.ts", root=tmp_path)


def test_is_safe_relpath_rejects_traversal(tmp_path: pathlib.Path):
    assert not run_fix._is_safe_relpath("../etc/passwd", root=tmp_path)
    assert not run_fix._is_safe_relpath("a/../../b", root=tmp_path)


def test_is_safe_relpath_rejects_absolute(tmp_path: pathlib.Path):
    assert not run_fix._is_safe_relpath("/etc/passwd", root=tmp_path)
    assert not run_fix._is_safe_relpath("~/.ssh/id_rsa", root=tmp_path)


# ---------------------------------------------------------------------------
# _apply_patches
# ---------------------------------------------------------------------------


def test_apply_patches_writes_files(tmp_path: pathlib.Path):
    patches = [
        {"file": "a.py", "new_content": "x = 1\n"},
        {"file": "sub/b.py", "new_content": "y = 2\n"},
    ]
    written = run_fix._apply_patches(patches, root=tmp_path)
    assert set(written) == {"a.py", "sub/b.py"}
    assert (tmp_path / "a.py").read_text() == "x = 1\n"
    assert (tmp_path / "sub/b.py").read_text() == "y = 2\n"


def test_apply_patches_rejects_forbidden_file(tmp_path: pathlib.Path):
    forbidden = next(iter(run_fix.FORBIDDEN_FILES))
    patches = [{"file": forbidden, "new_content": "evil\n"}]
    with pytest.raises(ValueError, match="forbidden file"):
        run_fix._apply_patches(patches, root=tmp_path)
    # Nothing was written.
    assert not (tmp_path / forbidden).exists()


def test_apply_patches_rejects_path_traversal(tmp_path: pathlib.Path):
    patches = [{"file": "../outside.py", "new_content": "bad\n"}]
    with pytest.raises(ValueError, match="unsafe path"):
        run_fix._apply_patches(patches, root=tmp_path)


def test_apply_patches_rejects_absolute_path(tmp_path: pathlib.Path):
    patches = [{"file": "/tmp/evil.py", "new_content": "bad\n"}]
    with pytest.raises(ValueError, match="unsafe path"):
        run_fix._apply_patches(patches, root=tmp_path)


def test_apply_patches_rejects_empty_batch(tmp_path: pathlib.Path):
    with pytest.raises(ValueError, match="no patches"):
        run_fix._apply_patches([], root=tmp_path)


def test_apply_patches_rejects_too_many_files(tmp_path: pathlib.Path):
    patches = [
        {"file": f"f{i}.py", "new_content": "x = 1\n"}
        for i in range(run_fix.MAX_PATCH_FILES + 1)
    ]
    with pytest.raises(ValueError, match="too many files"):
        run_fix._apply_patches(patches, root=tmp_path)


def test_apply_patches_rejects_malformed_entry(tmp_path: pathlib.Path):
    with pytest.raises(ValueError, match="string 'file'"):
        run_fix._apply_patches(
            [{"file": "a.py"}],  # missing new_content
            root=tmp_path,
        )


# ---------------------------------------------------------------------------
# _smoke_check
# ---------------------------------------------------------------------------


def test_smoke_check_detects_syntax_error(tmp_path: pathlib.Path):
    bad = tmp_path / "broken.py"
    bad.write_text("def oops(:\n    pass\n")
    with pytest.raises(ValueError, match="syntax error"):
        run_fix._smoke_check(["broken.py"], root=tmp_path)


def test_smoke_check_passes_on_valid_python(tmp_path: pathlib.Path):
    (tmp_path / "ok.py").write_text("def ok():\n    return 1\n")
    # Should not raise.
    run_fix._smoke_check(["ok.py"], root=tmp_path)


def test_smoke_check_skips_non_python_paths(tmp_path: pathlib.Path):
    # A .ts/.md file in the patch list must not be ast.parse'd.
    (tmp_path / "a.ts").write_text("const x = 1;\n")
    run_fix._smoke_check(["a.ts", "notes.md"], root=tmp_path)


# ---------------------------------------------------------------------------
# _extract_patches_json
# ---------------------------------------------------------------------------


def test_extract_patches_json_from_strict_json():
    text = json.dumps({"patches": [{"file": "a.py", "new_content": "x=1"}]})
    patches = run_fix._extract_patches_json(text)
    assert patches == [{"file": "a.py", "new_content": "x=1"}]


def test_extract_patches_json_from_markdown_fence():
    text = (
        "```json\n"
        '{"patches": [{"file": "a.py", "new_content": "x=1"}]}\n'
        "```"
    )
    assert run_fix._extract_patches_json(text) == [
        {"file": "a.py", "new_content": "x=1"}
    ]


def test_extract_patches_json_from_prefixed_prose():
    text = (
        "Sure! Here is the patch:\n"
        '{"patches": [{"file": "a.py", "new_content": "x=1"}]}'
    )
    assert run_fix._extract_patches_json(text) == [
        {"file": "a.py", "new_content": "x=1"}
    ]


def test_extract_patches_json_raises_on_bad_shape():
    with pytest.raises(ValueError, match="patches"):
        run_fix._extract_patches_json('{"not_patches": []}')


def test_extract_patches_json_raises_on_empty():
    with pytest.raises(ValueError, match="empty"):
        run_fix._extract_patches_json("")


# ---------------------------------------------------------------------------
# _callback (HMAC signing)
# ---------------------------------------------------------------------------


class _FakeResponse:
    def __init__(self, status_code: int = 200) -> None:
        self.status_code = status_code


def test_callback_signs_body_with_hmac_sha256():
    captured: dict[str, object] = {}

    def fake_post(url, data=None, headers=None, timeout=None):
        captured["url"] = url
        captured["body"] = data
        captured["headers"] = headers
        return _FakeResponse(200)

    env = {
        "PROJEXTPAL_WEBHOOK_SECRET": "topsecret",
        "PROJEXTPAL_CALLBACK_URL": "https://projextpal.com/api/v1/product-issues/<id>/claude-callback/",
    }
    code = run_fix._callback(
        42,
        status="pr_opened",
        pr_url="https://github.com/x/y/pull/1",
        commit_sha="deadbeef",
        env=env,
        http_post=fake_post,
    )
    assert code == 200
    # URL placeholder <id> was substituted.
    assert captured["url"] == (
        "https://projextpal.com/api/v1/product-issues/42/claude-callback/"
    )
    body = captured["body"]
    assert isinstance(body, (bytes, bytearray))
    # Signature matches a fresh HMAC-SHA256 over the same body.
    expected = (
        "sha256="
        + hmac.new(b"topsecret", bytes(body), hashlib.sha256).hexdigest()
    )
    headers = captured["headers"] or {}
    assert headers["X-ProjeXtPal-Signature"] == expected
    assert headers["Content-Type"] == "application/json"
    # Body round-trips to the expected JSON.
    parsed = json.loads(bytes(body).decode("utf-8"))
    assert parsed == {
        "status": "pr_opened",
        "pr_url": "https://github.com/x/y/pull/1",
        "commit_sha": "deadbeef",
        "error": None,
    }


def test_callback_handles_failed_status_with_error():
    captured: dict[str, object] = {}

    def fake_post(url, data=None, headers=None, timeout=None):
        captured["body"] = data
        return _FakeResponse(202)

    env = {
        "PROJEXTPAL_WEBHOOK_SECRET": "s",
        "PROJEXTPAL_CALLBACK_URL": "https://x/api/v1/product-issues/{issue_id}/claude-callback/",
    }
    code = run_fix._callback(
        7, status="failed", error="boom", env=env, http_post=fake_post
    )
    assert code == 202
    body = json.loads(bytes(captured["body"]).decode("utf-8"))
    assert body == {
        "status": "failed",
        "pr_url": None,
        "commit_sha": None,
        "error": "boom",
    }


def test_callback_noops_when_env_not_configured(capsys):
    # No secret / URL → return 0 and warn, do NOT raise.
    def fake_post(*a, **kw):  # pragma: no cover — must not be called
        raise AssertionError("http should not be called")

    assert (
        run_fix._callback(
            1,
            status="failed",
            error="x",
            env={},
            http_post=fake_post,
        )
        == 0
    )
    err = capsys.readouterr().err
    assert "skipping callback" in err


# ---------------------------------------------------------------------------
# _ask_claude (mocked Anthropic client)
# ---------------------------------------------------------------------------


class _FakeContentBlock:
    def __init__(self, text: str) -> None:
        self.text = text


class _FakeMessagesAPI:
    def __init__(self, reply: str) -> None:
        self._reply = reply
        self.last_kwargs: dict[str, object] = {}

    def create(self, **kwargs):
        self.last_kwargs = kwargs

        class _Resp:
            content = [_FakeContentBlock(self._reply)]

        resp = _Resp()
        resp.content = [_FakeContentBlock(self._reply)]
        return resp


class _FakeAnthropicClient:
    def __init__(self, reply: str) -> None:
        self.messages = _FakeMessagesAPI(reply)


def test_ask_claude_parses_patches_from_mock_client(tmp_path: pathlib.Path):
    reply = json.dumps({"patches": [{"file": "a.py", "new_content": "x=1\n"}]})
    client = _FakeAnthropicClient(reply)
    patches = run_fix._ask_claude(
        {"issue_id": 1, "title": "t", "description": "d"},
        files={"a.py": "x=0\n"},
        client=client,
    )
    assert patches == [{"file": "a.py", "new_content": "x=1\n"}]
    # Model + system prompt wiring.
    assert client.messages.last_kwargs["model"] == run_fix.MODEL
    assert "ProjeXtPal" in str(client.messages.last_kwargs["system"])


def test_ask_claude_includes_hinted_files_in_prompt():
    reply = json.dumps({"patches": [{"file": "a.py", "new_content": "x=1\n"}]})
    client = _FakeAnthropicClient(reply)
    run_fix._ask_claude(
        {"issue_id": 1, "title": "t", "description": "d"},
        files={"path/to/a.py": "ORIGINAL_CONTENT_SENTINEL\n"},
        client=client,
    )
    user_msg = client.messages.last_kwargs["messages"][0]["content"]
    assert "--- path/to/a.py ---" in user_msg
    assert "ORIGINAL_CONTENT_SENTINEL" in user_msg


# ---------------------------------------------------------------------------
# _build_callback_url + _sanitize_branch_fragment
# ---------------------------------------------------------------------------


def test_build_callback_url_substitutes_placeholders():
    tmpl = "https://x/api/v1/product-issues/<id>/claude-callback/"
    assert (
        run_fix._build_callback_url(tmpl, 123)
        == "https://x/api/v1/product-issues/123/claude-callback/"
    )
    tmpl2 = "https://x/api/v1/product-issues/{issue_id}/claude-callback/"
    assert (
        run_fix._build_callback_url(tmpl2, 7)
        == "https://x/api/v1/product-issues/7/claude-callback/"
    )


def test_sanitize_branch_fragment_strips_unsafe_chars():
    assert run_fix._sanitize_branch_fragment("auto fix/42!") == "auto-fix-42"
    # Caps at MAX, strips edges.
    assert run_fix._sanitize_branch_fragment("x" * 50, max_len=10) == "xxxxxxxxxx"
    # Empty / all-garbage falls back to "fix".
    assert run_fix._sanitize_branch_fragment("///") == "fix"
    assert run_fix._sanitize_branch_fragment("") == "fix"
