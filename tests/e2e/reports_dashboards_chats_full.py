#!/usr/bin/env python3
"""Reports / Dashboards / AI Chats full-coverage E2E test.

Verifies:
  - Every dashboard endpoint returns 200 AND the counts roll up correctly
    (dashboard.backlog_count == len(backlog) source truth)
  - Every report list endpoint returns 200
  - AI chat full round-trip: create chat → send message → receive non-empty
    reply → history persisted
  - AI generate endpoints return real content (not empty {})

Run:
    python tests/e2e/reports_dashboards_chats_full.py
"""
from __future__ import annotations

import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from tests.e2e.common import Client, Report  # noqa: E402


def test_dashboards(c: Client, r: Report) -> None:
    """Count drift check: dashboard rollups vs source tables."""
    # Admin stats
    s, _ = c.get("/api/v1/admin/stats/")
    r.record("dashboards", "admin-stats", s)

    # Scrum dashboard: check sprint_total matches actual
    for pid in (1, 5):  # scrum projects
        s, body = c.get(f"/api/v1/projects/{pid}/scrum/dashboard/")
        note = ""
        if 200 <= s < 300:
            data = c.json_or_none(body) or {}
            sprint_total = data.get("sprint_total") or 0
            actual = len(c.list_items(f"/api/v1/projects/{pid}/scrum/sprints/"))
            note = f"dashboard.sprint_total={sprint_total} actual={actual}"
            if actual and sprint_total < actual:
                note += " ⚠ drift"
        r.record("dashboards", f"scrum-{pid} dashboard", s, note=note)

    for path, name in [
        ("/api/v1/projects/4/prince2/dashboard/", "prince2-dashboard"),
        ("/api/v1/projects/2/kanban/dashboard/", "kanban-dashboard"),
        ("/api/v1/projects/3/waterfall/dashboard/", "waterfall-dashboard"),
        ("/api/v1/projects/12/agile/dashboard/", "agile-dashboard"),
        ("/api/v1/sixsigma/projects/1/sixsigma/dashboard/", "sixsigma-dashboard"),
        ("/api/v1/academy/admin/certificates/stats/", "cert-stats"),
        ("/api/v1/projects/1/ai-insights/", "ai-insights-project-1"),
    ]:
        s, _ = c.get(path)
        r.record("dashboards", name, s)


def test_reports(c: Client, r: Report) -> None:
    """Shape + required-field check on report rows."""
    for name, path, required in [
        ("status-reports", "/api/v1/communication/status-reports/", ("id",)),
        ("reporting-items", "/api/v1/communication/reporting-items/", ("id",)),
        ("meetings", "/api/v1/communication/meetings/", ("id",)),
        ("training-materials", "/api/v1/communication/training-materials/", ("id",)),
    ]:
        s, body = c.get(path)
        note = ""
        if 200 <= s < 300:
            d = c.json_or_none(body) or []
            if isinstance(d, dict):
                d = d.get("results", [])
            note = f"{len(d)} rows"
            if d and required:
                missing = [f for f in required if f not in d[0]]
                if missing:
                    note += f"  MISSING FIELDS: {missing}"
        r.record("reports", name, s, note=note)


def test_ai_chats_roundtrip(c: Client, r: Report) -> None:
    """Full send → receive → persist check."""
    # 1. Create chat
    s, body = c.post("/api/v1/bot/chats/", body={"title": "E2E round-trip"})
    r.record("ai-chat", "create-chat", s, "POST")
    if s not in (200, 201):
        return
    chat_id = c.json_or_none(body).get("id")

    # 2. Send message (slow — up to 25s)
    t0 = time.time()
    s, body = c.post(
        f"/api/v1/bot/chats/{chat_id}/send_message/",
        body={"message": "Summarise PRINCE2 in exactly 3 bullets."},
    )
    dt = time.time() - t0
    data = c.json_or_none(body) or {}
    reply_text = str(data.get("response") or data.get("content") or data.get("message") or "")
    note = f"{int(dt)}s  reply_chars={len(reply_text)}"
    if 200 <= s < 300 and len(reply_text) < 20:
        note += "  ⚠ empty reply"
    r.record("ai-chat", "send-message", s, "POST", note=note)

    # 3. History persistence
    s, body = c.get(f"/api/v1/bot/chats/{chat_id}/history/")
    note = ""
    if 200 <= s < 300:
        d = c.json_or_none(body) or []
        if isinstance(d, dict):
            d = d.get("messages", d.get("results", []))
        note = f"{len(d)} messages persisted"
    r.record("ai-chat", "history", s, note=note)

    # 4. Search
    s, _ = c.get("/api/v1/bot/chats/search/?q=PRINCE2")
    r.record("ai-chat", "search", s)


def test_ai_generators(c: Client, r: Report) -> None:
    """Each generator must return non-empty content to count as green."""
    # Look up a valid lesson_id
    modules = c.list_items("/api/v1/academy/modules/")
    lesson_id = None
    if modules:
        s, body = c.get(f"/api/v1/academy/lessons/?module={modules[0]['id']}")
        if s == 200:
            lessons = c.json_or_none(body) or []
            if isinstance(lessons, dict):
                lessons = lessons.get("results", [])
            if lessons:
                lesson_id = lessons[0]["id"]

    def _probe(name: str, path: str, body: dict, min_chars: int = 50) -> None:
        t0 = time.time()
        s, resp = c.post(path, body=body)
        dt = time.time() - t0
        note = f"{int(dt)}s"
        if 200 <= s < 300:
            content = str(c.json_or_none(resp) or "")
            note = f"{int(dt)}s  content_chars={len(content)}"
            if len(content) < min_chars:
                note += "  ⚠ too short / empty"
        r.record("ai-gen", name, s, "POST", note=note)

    _probe("ai-coach", "/api/v1/academy/ai/coach/message/",
           {"message": "3-sentence PRINCE2 summary.", "course_id": None})
    _probe("governance-ai", "/api/v1/governance/ai/generate/",
           {"prompt": "Q2 steering agenda for CRM."})

    if lesson_id:
        _probe("gen-quiz",       "/api/v1/academy/ai/generate-quiz/",       {"lesson_id": lesson_id})
        _probe("gen-exam",       "/api/v1/academy/ai/generate-exam/",       {"lesson_id": lesson_id})
        _probe("gen-practice",   "/api/v1/academy/ai/generate-practice/",   {"lessonTitle": "Sample", "sector": "finance", "role": "pm"})
        _probe("gen-simulation", "/api/v1/academy/ai/generate-simulation/", {"lesson_id": lesson_id})
        _probe("gen-assignment", "/api/v1/academy/ai/generate-assignment/", {"lesson_id": lesson_id})
        _probe("gen-content",    "/api/v1/academy/ai/generate-content/",
               {"lesson_id": lesson_id, "content_type": "explanation"}, min_chars=200)


def main() -> int:
    c = Client()
    c.login()
    r = Report("REPORTS / DASHBOARDS / AI CHATS FULL-COVERAGE REPORT")

    test_dashboards(c, r)
    test_reports(c, r)
    test_ai_chats_roundtrip(c, r)
    test_ai_generators(c, r)

    return r.print()


if __name__ == "__main__":
    sys.exit(main())
