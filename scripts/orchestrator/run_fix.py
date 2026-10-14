#!/usr/bin/env python3
"""Claude Auto-Triage external orchestrator.

Reads the ``ISSUE_PAYLOAD`` env var (same shape as the ProjeXtPal outbound
webhook body), asks Claude via the Anthropic Messages API for a minimal
patch, applies it, opens a PR, and reports back to the issue's
``/claude-callback/`` endpoint with an HMAC-SHA256 signature.

Design rules
------------
* No Django import — this runs in a plain Ubuntu runner.
* No state between runs — a fresh checkout per workflow invocation.
* Fail loud but ALWAYS attempt a `_callback(status="failed", error=...)`
  so the ProductIssue leaves the ``in-progress`` state when something
  blows up — otherwise the next cron tick won't retry.
* Path-safety and a forbidden-file blocklist are enforced here as a
  defence-in-depth layer: the model should not touch
  ``backend/projects/{permissions,views}.py`` or ``backend/execution/views.py``.

Entrypoint: ``python scripts/orchestrator/run_fix.py``.
"""
from __future__ import annotations

import hashlib
import hmac
import json
import os
import pathlib
import re
import subprocess
import sys
from typing import Any, Iterable

# anthropic + requests are only required at *runtime*; the unit test suite
# monkey-patches them in. Import lazily inside _ask_claude / _callback so
# `python -m py_compile` and the test module itself don't need them.

MODEL = "claude-sonnet-5-20260101"  # Claude 5 Sonnet — Jan 2026 release
MAX_TOKENS = 8000
MAX_FILES_READ = 10
MAX_FILE_CHARS = 5000  # per hinted file, to keep the prompt small

# Files the orchestrator must never rewrite. The permissions matrix and the
# project/execution ViewSets are the keystone of the cross-tenant isolation
# contract (see Sprint 10 S10-02 audit + feat/cross-tenant-confidential);
# a wrong edit here would be catastrophic. The humans own those files.
FORBIDDEN_FILES: frozenset[str] = frozenset(
    {
        "backend/projects/permissions.py",
        "backend/projects/views.py",
        "backend/execution/views.py",
    }
)

# Hard limit on how many files one PR may touch — guards against a Claude
# response that tries to rewrite half the repo.
MAX_PATCH_FILES = 15


# ---------------------------------------------------------------------------
# Payload
# ---------------------------------------------------------------------------


def _load_payload(env: dict[str, str] | None = None) -> dict[str, Any]:
    """Parse the ISSUE_PAYLOAD JSON (or the manual override) from env.

    Returns an empty dict only when both inputs are missing / blank — the
    orchestrator refuses to proceed on an empty payload.
    """
    env = env if env is not None else os.environ  # type: ignore[assignment]
    raw = env.get("ISSUE_PAYLOAD") or env.get("ISSUE_PAYLOAD_MANUAL") or ""
    raw = raw.strip()
    if not raw or raw in ("null", "{}"):
        return {}
    try:
        data = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ValueError(f"malformed ISSUE_PAYLOAD JSON: {exc}") from exc
    if not isinstance(data, dict):
        raise ValueError("ISSUE_PAYLOAD must decode to a JSON object")
    return data


# ---------------------------------------------------------------------------
# Patch application
# ---------------------------------------------------------------------------


def _is_safe_relpath(raw: str, root: pathlib.Path | None = None) -> bool:
    """Return True iff *raw* is a relative path that stays under *root*.

    Rejects absolute paths, ``..`` segments, and any path that resolves
    outside the repo root. This is the only defence against the model
    returning a file outside the working tree.
    """
    if not raw or raw != raw.strip():
        return False
    if os.path.isabs(raw) or raw.startswith(("/", "~")):
        return False
    # Reject symlinks + traversal segments textually first so we don't need
    # to touch the filesystem for a clean "unsafe path" verdict.
    parts = pathlib.PurePosixPath(raw).parts
    if any(p in ("..", "") for p in parts):
        return False
    root = (root or pathlib.Path.cwd()).resolve()
    try:
        resolved = (root / raw).resolve()
    except (OSError, RuntimeError):
        return False
    try:
        resolved.relative_to(root)
    except ValueError:
        return False
    return True


def _apply_patches(
    patches: Iterable[dict[str, Any]],
    root: pathlib.Path | None = None,
) -> list[str]:
    """Write each ``{file, new_content}`` entry, enforcing the safety rules.

    Returns the list of files that were actually written. Raises
    ``ValueError`` on the first unsafe path, forbidden file, or malformed
    entry — the whole batch is aborted (git `restore .` can roll back any
    partial writes).
    """
    root = (root or pathlib.Path.cwd()).resolve()
    patches = list(patches)
    if not patches:
        raise ValueError("no patches to apply")
    if len(patches) > MAX_PATCH_FILES:
        raise ValueError(
            f"too many files in one PR ({len(patches)} > {MAX_PATCH_FILES})"
        )

    written: list[str] = []
    for entry in patches:
        if not isinstance(entry, dict):
            raise ValueError(f"patch entry is not an object: {entry!r}")
        raw_path = entry.get("file")
        content = entry.get("new_content")
        if not isinstance(raw_path, str) or not isinstance(content, str):
            raise ValueError(
                "patch entries need string 'file' and 'new_content'"
            )
        if not _is_safe_relpath(raw_path, root=root):
            raise ValueError(f"unsafe path: {raw_path}")
        if raw_path in FORBIDDEN_FILES:
            raise ValueError(f"forbidden file: {raw_path}")

        dest = root / raw_path
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(content, encoding="utf-8")
        written.append(raw_path)
    return written


# ---------------------------------------------------------------------------
# Smoke tests
# ---------------------------------------------------------------------------


_SMOKE_SKIP_DIRS = (
    "/.git/",
    "/node_modules/",
    "/venv/",
    "/.venv/",
    "/dist/",
    "/build/",
    "/__pycache__/",
)


def _smoke_check(paths: Iterable[str] | None = None, root: pathlib.Path | None = None) -> None:
    """Fast ``ast.parse`` sweep of touched Python files.

    When ``paths`` is None, every .py in the repo is checked — that's the
    production path (any accidental global corruption would show up). Tests
    pass a narrow list so they can isolate single-file syntax failures.
    """
    import ast

    root = (root or pathlib.Path.cwd()).resolve()
    if paths is None:
        candidates: Iterable[pathlib.Path] = root.rglob("*.py")
    else:
        candidates = (root / p for p in paths if p.endswith(".py"))
    for p in candidates:
        s = f"/{p.as_posix()}/"
        if any(skip in s for skip in _SMOKE_SKIP_DIRS):
            continue
        try:
            text = p.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError):
            continue
        try:
            ast.parse(text, filename=str(p))
        except SyntaxError as exc:
            raise ValueError(f"syntax error in {p}: {exc}") from exc


# ---------------------------------------------------------------------------
# Claude call
# ---------------------------------------------------------------------------


_SYSTEM_PROMPT = (
    "You are a code-fix agent for the ProjeXtPal codebase. "
    "Given a bug report and the current content of relevant files, propose "
    "MINIMAL file-level patches that fix the issue. Return STRICT JSON on "
    "a single top-level object with a 'patches' array, where each entry is "
    '{"file": "<repo-relative path>", "new_content": "<the full new file>"}. '
    "Rules: (1) keep diffs small — do not refactor beyond the fix, "
    "(2) do not add tests unless the issue explicitly asks for them, "
    "(3) never touch backend/projects/permissions.py, backend/projects/views.py, "
    "or backend/execution/views.py (they govern cross-tenant isolation), "
    "(4) never invent files — only edit a file whose current content was given, "
    "or create a clearly new one that the issue requests. "
    "Return the JSON object only — no prose, no markdown fences."
)


def _resolve_files_hint(
    hints: Iterable[Any],
    root: pathlib.Path | None = None,
) -> dict[str, str]:
    """Read each hinted file into ``{relpath: content}`` with safety checks."""
    root = (root or pathlib.Path.cwd()).resolve()
    out: dict[str, str] = {}
    count = 0
    for h in hints or ():
        if count >= MAX_FILES_READ:
            break
        if not isinstance(h, str) or not _is_safe_relpath(h, root=root):
            continue
        p = root / h
        if not p.is_file():
            continue
        try:
            out[h] = p.read_text(encoding="utf-8")[:MAX_FILE_CHARS]
            count += 1
        except (OSError, UnicodeDecodeError):
            continue
    return out


def _extract_patches_json(text: str) -> list[dict[str, Any]]:
    """Pull the ``{"patches": [...]}`` object out of Claude's reply.

    Claude usually returns strict JSON when asked, but a stray ``\`\`\`json``
    fence or a leading sentence is common. We try json.loads() on the whole
    text first, then on the content between the first ``{`` and the last
    ``}``.
    """
    text = (text or "").strip()
    if not text:
        raise ValueError("empty Claude response")
    # Strip markdown fences if present.
    if text.startswith("```"):
        text = re.sub(r"^```[a-zA-Z]*\n?", "", text)
        text = re.sub(r"\n?```\s*$", "", text)
        text = text.strip()
    candidates = [text]
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end > start:
        candidates.append(text[start : end + 1])
    for candidate in candidates:
        try:
            data = json.loads(candidate)
        except json.JSONDecodeError:
            continue
        if isinstance(data, dict) and isinstance(data.get("patches"), list):
            return data["patches"]
    raise ValueError("Claude did not return a {'patches': [...]} JSON object")


def _ask_claude(
    payload: dict[str, Any],
    files: dict[str, str],
    *,
    client: Any | None = None,
) -> list[dict[str, Any]]:
    """Call the Anthropic Messages API and return the parsed patches list.

    ``client`` is injectable for tests. In production we lazy-import the SDK
    so that this module is importable in environments without ``anthropic``
    installed (CI unit tests).
    """
    if client is None:
        import anthropic  # type: ignore[import-not-found]

        client = anthropic.Anthropic()

    user_parts: list[str] = [
        f"ISSUE #{payload.get('issue_id', '?')}: {payload.get('title', '')}",
        "",
        "DESCRIPTION:",
        str(payload.get("description", "")),
    ]
    if payload.get("reproduction_steps"):
        user_parts += ["", "REPRODUCTION STEPS:", str(payload["reproduction_steps"])]
    if payload.get("error_trace"):
        user_parts += ["", "ERROR TRACE:", str(payload["error_trace"])[:2000]]
    if files:
        user_parts += ["", "HINTED FILES:"]
        for rel, content in files.items():
            user_parts += ["", f"--- {rel} ---", content]
    user_parts += [
        "",
        "Return STRICT JSON only: {\"patches\": [{\"file\": \"...\", \"new_content\": \"...\"}]}.",
    ]

    resp = client.messages.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        system=_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": "\n".join(user_parts)}],
    )
    text = _flatten_content(resp)
    return _extract_patches_json(text)


def _flatten_content(resp: Any) -> str:
    """Flatten the SDK ``content`` list / mocked string into plain text."""
    content = getattr(resp, "content", None)
    if content is None and isinstance(resp, dict):
        content = resp.get("content")
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        chunks: list[str] = []
        for block in content:
            text = getattr(block, "text", None)
            if text is None and isinstance(block, dict):
                text = block.get("text")
            if text:
                chunks.append(str(text))
        return "\n".join(chunks)
    return str(content or "")


# ---------------------------------------------------------------------------
# Git / PR
# ---------------------------------------------------------------------------


def _run(cmd: list[str], **kwargs: Any) -> str:
    """subprocess wrapper that raises with the captured output on error."""
    result = subprocess.run(
        cmd, check=False, capture_output=True, text=True, **kwargs
    )
    if result.returncode != 0:
        raise RuntimeError(
            f"{' '.join(cmd)!r} exited {result.returncode}: "
            f"{(result.stderr or result.stdout or '').strip()[:500]}"
        )
    return (result.stdout or "").strip()


def _sanitize_branch_fragment(raw: str, max_len: int = 20) -> str:
    """git-safe slug — letters, digits, dash, underscore, dot only."""
    cleaned = re.sub(r"[^A-Za-z0-9._-]+", "-", str(raw or ""))
    cleaned = cleaned.strip("-._")[:max_len]
    return cleaned or "fix"


def _create_branch(payload: dict[str, Any]) -> str:
    """Checkout a new branch for this issue; name is deterministic."""
    issue_id = payload.get("issue_id", "unknown")
    worktree = _sanitize_branch_fragment(payload.get("worktree_name", "fix"))
    branch = f"auto/claude-{issue_id}-{worktree}"
    _run(["git", "checkout", "-b", branch])
    return branch


def _commit_and_push(branch: str, payload: dict[str, Any]) -> str:
    _run(["git", "config", "user.email", "claude-auto-triage@inclufy.com"])
    _run(["git", "config", "user.name", "Claude Auto-Triage"])
    _run(["git", "add", "-A"])
    title = payload.get("title", f"ProductIssue {payload.get('issue_id', '?')}")
    msg = (
        f"fix(auto): {title}\n\n"
        f"ProductIssue #{payload.get('issue_id', '?')}\n"
        f"Generated by Claude Auto-Triage pipeline (Sprint 11 S11-01)."
    )
    _run(["git", "commit", "-m", msg])
    _run(["git", "push", "-u", "origin", branch])
    return _run(["git", "rev-parse", "HEAD"])


def _open_pr(branch: str, payload: dict[str, Any]) -> str:
    """Open the PR via `gh` and return the URL."""
    issue_id = payload.get("issue_id", "?")
    title = payload.get("title", f"ProductIssue #{issue_id}")
    body = (
        f"**Auto-generated fix for ProductIssue #{issue_id}**\n\n"
        f"{payload.get('description', '')}\n\n"
        "---\n"
        "_Generated by the Claude Auto-Triage pipeline (Sprint 11 S11-01). "
        "Review the diff before merging — the model is instructed to keep "
        "changes minimal, but humans still own the merge decision._\n"
    )
    base = payload.get("repo_branch") or "master"
    out = _run(
        [
            "gh",
            "pr",
            "create",
            "--title",
            f"fix(auto): {title}",
            "--body",
            body,
            "--base",
            base,
            "--head",
            branch,
        ]
    )
    # `gh pr create` prints the URL as the last line.
    for line in reversed(out.splitlines()):
        line = line.strip()
        if line.startswith("http"):
            return line
    return out


# ---------------------------------------------------------------------------
# Callback
# ---------------------------------------------------------------------------


def _sign_body(body: bytes, secret: str) -> str:
    """HMAC-SHA256, hex, with the ``sha256=`` prefix (matches ProjeXtPal)."""
    mac = hmac.new(secret.encode("utf-8"), body, hashlib.sha256)
    return f"sha256={mac.hexdigest()}"


def _build_callback_url(template: str, issue_id: Any) -> str:
    """Resolve ``<id>`` / ``{issue_id}`` placeholders in the callback URL."""
    url = str(template or "")
    url = url.replace("<id>", str(issue_id))
    url = url.replace("{issue_id}", str(issue_id))
    return url


def _callback(
    issue_id: Any,
    *,
    status: str,
    pr_url: str | None = None,
    commit_sha: str | None = None,
    error: str | None = None,
    env: dict[str, str] | None = None,
    http_post: Any | None = None,
) -> int:
    """POST the HMAC-signed callback to ProjeXtPal. Returns the HTTP status.

    ``env`` + ``http_post`` are injected for tests. In production we read
    from ``os.environ`` and use ``requests.post``.
    """
    env = env if env is not None else os.environ  # type: ignore[assignment]
    secret = env.get("PROJEXTPAL_WEBHOOK_SECRET", "")
    url = _build_callback_url(env.get("PROJEXTPAL_CALLBACK_URL", ""), issue_id)
    if not url or not secret:
        # Nothing to post to — don't blow up the orchestrator, but surface it.
        sys.stderr.write(
            "WARN: PROJEXTPAL_CALLBACK_URL / _WEBHOOK_SECRET not set; "
            "skipping callback\n"
        )
        return 0
    body_obj = {
        "status": status,
        "pr_url": pr_url,
        "commit_sha": commit_sha,
        "error": error,
    }
    body = json.dumps(body_obj, separators=(",", ":")).encode("utf-8")
    headers = {
        "Content-Type": "application/json",
        "X-ProjeXtPal-Signature": _sign_body(body, secret),
        "User-Agent": "ClaudeAutoTriage-Orchestrator/1.0",
    }
    if http_post is None:
        import requests  # type: ignore[import-not-found]

        http_post = requests.post
    resp = http_post(url, data=body, headers=headers, timeout=15)
    status_code = int(getattr(resp, "status_code", 0) or 0)
    sys.stdout.write(f"callback {url} -> {status_code}\n")
    return status_code


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main() -> int:
    payload = _load_payload()
    issue_id = payload.get("issue_id")
    if not issue_id:
        sys.stderr.write("ERROR: ISSUE_PAYLOAD is empty or lacks issue_id\n")
        return 2

    try:
        branch = _create_branch(payload)
        files = _resolve_files_hint(payload.get("files_hint", []))
        patches = _ask_claude(payload, files)
        written = _apply_patches(patches)
        _smoke_check(written)
        commit_sha = _commit_and_push(branch, payload)
        pr_url = _open_pr(branch, payload)
        _callback(
            issue_id, status="pr_opened", pr_url=pr_url, commit_sha=commit_sha
        )
    except Exception as exc:  # noqa: BLE001 — we must always callback
        err = f"{type(exc).__name__}: {exc}"
        sys.stderr.write(f"ERROR: {err}\n")
        try:
            _callback(issue_id, status="failed", error=err[:500])
        finally:
            raise

    return 0


if __name__ == "__main__":
    sys.exit(main())
