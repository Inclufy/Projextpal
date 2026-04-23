#!/usr/bin/env python3
"""Program Manager + Governance full-coverage E2E test.

Covers program methodologies (SAFe, MSP, PMI, P2-Programme, Hybrid-
Programme, PRINCE2 Programme), the tenant-wide governance layer
(portfolios, boards, stakeholders, meetings, decisions), and cross-
methodology program features (multi-project rollup, benefits, risks,
budget overview).

Run:
    python tests/e2e/program_manager_full.py
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from tests.e2e.common import Client, Report  # noqa: E402


def test_program_wide_tabs(c: Client, r: Report) -> None:
    """Every program, every tab."""
    programs = c.list_items("/api/v1/programs/")
    for p in programs:
        pid = p["id"]
        meth = p.get("methodology") or "unknown"
        area = f"program-{meth}"
        for tab, url in [
            ("benefits",        f"/api/v1/programs/{pid}/benefits/"),
            ("milestones",      f"/api/v1/programs/{pid}/milestones/"),
            ("risks",           f"/api/v1/programs/{pid}/risks/"),
            ("budget-overview", f"/api/v1/programs/{pid}/budget/overview/"),
            ("governance",      f"/api/v1/programs/{pid}/governance/"),
        ]:
            s, _ = c.get(url)
            r.record(area, f"p{pid} {tab}", s, note=p.get("name", "")[:40])


def test_safe_program(c: Client, r: Report) -> None:
    """SAFe-specific: ARTs, PIs, PI Objectives."""
    programs = [p for p in c.list_items("/api/v1/programs/") if p.get("methodology") == "safe"]
    for p in programs:
        pid = p["id"]
        # These previously 404'd because uuid vs int (fixed in 3d8c8de7)
        s, _ = c.get(f"/api/v1/safe/programs/{pid}/arts/")
        r.record("safe", f"p{pid} arts", s)
        s, _ = c.get(f"/api/v1/safe/programs/{pid}/pis/")
        r.record("safe", f"p{pid} pis", s)

    s, _ = c.get("/api/v1/safe/arts/")
    r.record("safe", "arts-global", s)
    s, _ = c.get("/api/v1/safe/pis/")
    r.record("safe", "pis-global", s)


def test_pmi_program(c: Client, r: Report) -> None:
    programs = [p for p in c.list_items("/api/v1/programs/") if p.get("methodology") == "pmi"]
    if not programs:
        r.record("pmi", "no-pmi-programs", 0, note="skip — no pmi programs seeded")
    for p in programs:
        pid = p["id"]
        s, _ = c.get(f"/api/v1/pmi/programs/{pid}/components/")
        r.record("pmi", f"p{pid} components", s)
        s, _ = c.get(f"/api/v1/pmi/programs/{pid}/governance-boards/")
        r.record("pmi", f"p{pid} gov-boards", s)

    for name, path in [
        ("components-global", "/api/v1/pmi/components/"),
        ("gov-boards-global", "/api/v1/pmi/governance-boards/"),
    ]:
        s, _ = c.get(path)
        r.record("pmi", name, s)


def test_msp_program(c: Client, r: Report) -> None:
    """MSP endpoints — may not exist yet; flag missing."""
    for path in [
        "/api/v1/msp/tranches/",
        "/api/v1/msp/blueprints/",
        "/api/v1/msp/benefits/",
    ]:
        s, _ = c.get(path)
        r.record("msp", path.rsplit("/", 2)[-2] if path.endswith("/") else path, s)


def test_p2_programme(c: Client, r: Report) -> None:
    for path in [
        "/api/v1/p2-programme/programmes/",
        "/api/v1/p2-programme/projects/",
    ]:
        s, _ = c.get(path)
        r.record("p2-programme", path.rsplit("/", 2)[-2], s)


def test_hybrid_programme(c: Client, r: Report) -> None:
    s, _ = c.get("/api/v1/hybrid-programme/governance-configs/")
    r.record("hybrid-programme", "governance-configs", s)
    progs = c.list_items("/api/v1/programs/")
    for p in progs:
        if p.get("methodology") != "hybrid":
            continue
        pid = p["id"]
        s, _ = c.get(f"/api/v1/hybrid-programme/programmes/{pid}/governance-configs/")
        r.record("hybrid-programme", f"p{pid} gov-configs", s)


def test_governance(c: Client, r: Report) -> None:
    """Tenant-wide governance endpoints."""
    for name, path in [
        ("portfolios",     "/api/v1/governance/portfolios/"),
        ("boards",         "/api/v1/governance/boards/"),
        ("board-members",  "/api/v1/governance/board-members/"),
        ("stakeholders",   "/api/v1/governance/stakeholders/"),
        ("meetings",       "/api/v1/governance/meetings/"),
        ("decisions",      "/api/v1/governance/decisions/"),
    ]:
        s, body = c.get(path)
        note = ""
        if 200 <= s < 300:
            d = c.json_or_none(body) or []
            if isinstance(d, dict):
                d = d.get("results", [])
            note = f"{len(d)} rows"
        r.record("governance", name, s, note=note)

    # AI generate (should return real text)
    s, body = c.post(
        "/api/v1/governance/ai/generate/",
        body={"prompt": "Draft a Q2 steering agenda for CRM."},
    )
    note = ""
    if 200 <= s < 300:
        d = c.json_or_none(body) or {}
        if isinstance(d, dict):
            text = d.get("response") or d.get("content") or d.get("text") or ""
            note = f"{len(text)} chars"
    r.record("governance", "ai/generate", s, "POST", note=note)


def test_portfolio_crud(c: Client, r: Report) -> None:
    """End-to-end portfolio create; leaves 1 test portfolio behind
    (tenant admins can clean up via UI)."""
    body = {"name": "E2E Test Portfolio", "description": "Created by program-manager-tester."}
    s, resp = c.post("/api/v1/governance/portfolios/", body=body)
    r.record("governance", "portfolio-create", s, "POST")
    # Don't cascade delete — leave the row so a human can inspect it.


def main() -> int:
    c = Client()
    c.login()
    r = Report("PROGRAM MANAGER + GOVERNANCE FULL-COVERAGE REPORT")

    test_program_wide_tabs(c, r)
    test_safe_program(c, r)
    test_pmi_program(c, r)
    test_msp_program(c, r)
    test_p2_programme(c, r)
    test_hybrid_programme(c, r)
    test_governance(c, r)
    test_portfolio_crud(c, r)

    return r.print()


if __name__ == "__main__":
    sys.exit(main())
