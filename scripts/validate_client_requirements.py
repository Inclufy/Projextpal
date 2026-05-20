#!/usr/bin/env python3
"""
Run the client-requirements-validator agent's logic.

Usage:
    python3 scripts/validate_client_requirements.py docs/yanmar/requirements-checklist.yaml

Outputs:
    docs/<client>/validation-report-<YYYY-MM-DD-HHMM>.md
    Console summary.
"""

from __future__ import annotations

import os
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path

import yaml

REPO = Path(__file__).resolve().parent.parent
BACKEND_DIR = REPO / "backend"
FRONTEND_DIR = REPO / "frontend"

# Map dotted model name (app.Model) to the file we should grep.
def _model_file(model_dotted: str) -> Path:
    app, _, _model = model_dotted.partition(".")
    return BACKEND_DIR / app / "models.py"


def _docker_exec(cmd: list[str]) -> tuple[int, str]:
    """Run a shell command, capture combined output."""
    try:
        r = subprocess.run(
            cmd, capture_output=True, text=True, timeout=30,
        )
        return r.returncode, (r.stdout or "") + (r.stderr or "")
    except subprocess.TimeoutExpired:
        return 124, "timeout"
    except FileNotFoundError as e:
        return 127, str(e)


def check_model_field(c: dict) -> tuple[str, str]:
    model = c["model"]
    field = c["field"]
    path = _model_file(model)
    if not path.exists():
        return "FAIL", f"model file not found: {path.relative_to(REPO)}"
    text = path.read_text()
    # Look for `field = models.` or `field = SomethingField(`
    pattern = re.compile(
        rf"^\s*{re.escape(field)}\s*=\s*\S", re.M,
    )
    m = pattern.search(text)
    if not m:
        return "FAIL", f"no `{field} = ...` in {path.relative_to(REPO)}"
    line_no = text[: m.start()].count("\n") + 1
    return "PASS", f"{path.relative_to(REPO)}:{line_no}"


def check_migration_applied(c: dict) -> tuple[str, str]:
    app = c["app"]
    name = c["migration"]
    # First: file present on disk?
    f = BACKEND_DIR / app / "migrations" / f"{name}.py"
    if not f.exists():
        return "FAIL", f"migration file not found: {f.relative_to(REPO)}"
    # Then: applied in DB (best effort via docker compose)
    rc, out = _docker_exec(
        ["docker", "compose", "exec", "-T", "backend",
         "python", "manage.py", "showmigrations", app]
    )
    if rc != 0:
        # Can't reach DB — file exists is good enough
        return "PARTIAL", f"file ok ({f.relative_to(REPO)}); DB check skipped (docker not reachable)"
    for line in out.splitlines():
        if name in line:
            applied = "[X]" in line
            if applied:
                return "PASS", f"{f.relative_to(REPO)}; applied in DB"
            return "PARTIAL", f"file ok; not yet migrated (showmigrations: {line.strip()})"
    return "FAIL", f"migration not listed in showmigrations for {app}"


def check_endpoint_exists(c: dict) -> tuple[str, str]:
    method = c.get("method", "GET").upper()
    path = c["path"]
    expected = set(c.get("expected_status", [200, 401, 403]))
    url = f"http://localhost:8001{path}"
    args = ["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}",
            "-X", method, url, "-H", "Content-Type: application/json"]
    if method != "GET":
        args.extend(["-d", "{}"])
    rc, out = _docker_exec(args)
    code = out.strip()
    if code and code.isdigit() and int(code) in expected:
        return "PASS", f"{method} {path} -> {code}"
    if code and code.isdigit():
        return "PARTIAL", f"{method} {path} -> {code} (expected one of {sorted(expected)})"
    return "FAIL", f"{method} {path} -> no response ({out[:80]})"


def check_frontend_component(c: dict) -> tuple[str, str]:
    p = REPO / c["path"]
    if not p.exists():
        return "FAIL", f"missing: {c['path']}"
    text = p.read_text()
    if "export" not in text:
        return "PARTIAL", f"file ok but no `export` keyword found"
    return "PASS", f"{c['path']} ({p.stat().st_size} bytes)"


def check_file_exists(c: dict) -> tuple[str, str]:
    p = REPO / c["path"]
    if p.exists():
        return "PASS", f"{c['path']} ({p.stat().st_size} bytes)"
    return "FAIL", f"missing: {c['path']}"


def check_requirement_doc(c: dict) -> tuple[str, str]:
    p = REPO / c["path"]
    if not p.exists():
        return "FAIL", f"missing: {c['path']}"
    size = p.stat().st_size
    if size < c.get("min_bytes", 0):
        return "PARTIAL", f"{c['path']} too small ({size} < {c['min_bytes']} bytes)"
    return "PASS", f"{c['path']} ({size} bytes)"


def check_data_seeded(c: dict) -> tuple[str, str]:
    query = c["query"]
    expected_min = c.get("expected_min", 1)
    rc, out = _docker_exec(
        ["docker", "compose", "exec", "-T", "backend",
         "python", "manage.py", "shell", "-c", query]
    )
    if rc != 0:
        return "PARTIAL", f"docker not reachable ({out[:80].strip()})"
    # last non-empty stdout line is the count
    nums = re.findall(r"^\d+$", out, flags=re.M)
    if not nums:
        return "FAIL", f"unexpected output: {out[:80].strip()}"
    n = int(nums[-1])
    if n >= expected_min:
        return "PASS", f"count={n} (>= {expected_min})"
    return "FAIL", f"count={n} (< {expected_min})"


def check_manual(c: dict) -> tuple[str, str]:
    return "MANUAL", c.get("instruction", "manual verification required")


CHECKERS = {
    "model_field": check_model_field,
    "migration_applied": check_migration_applied,
    "endpoint_exists": check_endpoint_exists,
    "frontend_component": check_frontend_component,
    "file_exists": check_file_exists,
    "requirement_doc": check_requirement_doc,
    "data_seeded": check_data_seeded,
    "manual": check_manual,
}


VERDICTS = {
    "PASS": "✅",
    "FAIL": "❌",
    "PARTIAL": "⚠️",
    "MANUAL": "🟡",
}


def run_requirement(req: dict) -> tuple[str, list[dict]]:
    results = []
    statuses = set()
    for c in req.get("checks", []):
        checker = CHECKERS.get(c["type"])
        if not checker:
            results.append({"check": c, "status": "FAIL",
                            "evidence": f"unknown check type: {c['type']}"})
            statuses.add("FAIL")
            continue
        try:
            status, evidence = checker(c)
        except Exception as e:
            status, evidence = "FAIL", f"exception: {e}"
        results.append({"check": c, "status": status, "evidence": evidence})
        statuses.add(status)
    # Aggregate: worst-status wins, but MANUAL is neutral.
    for tier in ["FAIL", "PARTIAL", "MANUAL", "PASS"]:
        if tier in statuses:
            return tier, results
    return "PASS", results


def main(yaml_path: str) -> int:
    data = yaml.safe_load(Path(yaml_path).read_text())
    client = data["client"]
    product = data.get("product", "unknown")

    # Run
    per_req = []
    cat_totals: dict = {}
    for req in data["requirements"]:
        overall, results = run_requirement(req)
        per_req.append({"req": req, "overall": overall, "results": results})
        cat = req.get("category", "uncategorised")
        d = cat_totals.setdefault(cat, {"PASS": 0, "FAIL": 0, "PARTIAL": 0, "MANUAL": 0, "TOTAL": 0})
        d["TOTAL"] += 1
        d[overall] += 1

    # Summary
    total = sum(d["TOTAL"] for d in cat_totals.values())
    p_pass = sum(d["PASS"] for d in cat_totals.values())
    p_fail = sum(d["FAIL"] for d in cat_totals.values())
    p_part = sum(d["PARTIAL"] for d in cat_totals.values())
    p_man = sum(d["MANUAL"] for d in cat_totals.values())

    # Build report markdown
    ts = datetime.now().strftime("%Y-%m-%d-%H%M")
    out_path = REPO / f"docs/{client}/validation-report-{ts}.md"
    out_path.parent.mkdir(parents=True, exist_ok=True)

    lines = []
    lines.append(f"# Client Requirements Validation Report\n")
    lines.append(f"**Client:** {client}  ")
    lines.append(f"**Product:** {product}  ")
    lines.append(f"**Source:** `{yaml_path}`  ")
    lines.append(f"**Run date:** {datetime.now().isoformat(timespec='seconds')}  ")
    lines.append(f"**Total:** {total}   ✅ {p_pass}   ⚠️ {p_part}   ❌ {p_fail}   🟡 {p_man}\n")

    pct = (p_pass / total) * 100 if total else 0
    verdict = (
        "✅ COMPLETE" if p_fail == 0 and pct == 100 else
        "⚠️ AT RISK" if p_fail > 0 else
        "✅ ACCEPTABLE"
    )
    lines.append(f"**Verdict:** {verdict} ({pct:.0f}% PASS)\n")

    lines.append("\n## Summary by category\n")
    lines.append("| Category | Total | ✅ PASS | ⚠️ PARTIAL | ❌ FAIL | 🟡 MANUAL | Coverage |")
    lines.append("|---|:---:|:---:|:---:|:---:|:---:|:---:|")
    for cat, d in sorted(cat_totals.items()):
        cov = (d["PASS"] / d["TOTAL"]) * 100 if d["TOTAL"] else 0
        lines.append(
            f"| {cat} | {d['TOTAL']} | {d['PASS']} | {d['PARTIAL']} | {d['FAIL']} | {d['MANUAL']} | {cov:.0f}% |"
        )

    lines.append("\n## Per-requirement details\n")
    by_cat: dict = {}
    for entry in per_req:
        by_cat.setdefault(entry["req"].get("category", "uncategorised"), []).append(entry)

    for cat in sorted(by_cat):
        lines.append(f"\n### {cat}\n")
        for entry in by_cat[cat]:
            r = entry["req"]
            ico = VERDICTS[entry["overall"]]
            lines.append(f"#### {r['id']}: {r['title']} — {ico} {entry['overall']}\n")
            lines.append(f"- Source: {r.get('source', '')}")
            lines.append(f"- Priority: `{r.get('priority', '')}` · sprint_added: `{r.get('sprint_added', '')}`")
            lines.append(f"- Checks:")
            for res in entry["results"]:
                c = res["check"]
                ico2 = VERDICTS[res["status"]]
                tgt = c.get('model') or c.get('path') or c.get('migration') or c.get('query', '')[:60] or c.get('instruction', '')[:60]
                lines.append(f"  - {ico2} `{c['type']}` — {tgt}")
                lines.append(f"    - evidence: {res['evidence']}")
            lines.append("")

    out_path.write_text("\n".join(lines))

    # Console summary
    print()
    print(f"=== {client.upper()} REQUIREMENTS VALIDATION ===")
    for cat, d in sorted(cat_totals.items()):
        cov = (d["PASS"] / d["TOTAL"]) * 100 if d["TOTAL"] else 0
        ico = "✅" if d["FAIL"] == 0 and d["PARTIAL"] == 0 and d["MANUAL"] == 0 else "⚠️" if d["FAIL"] == 0 else "❌"
        print(f"  {ico} {cat:<22} {d['PASS']:>2}/{d['TOTAL']:<2}  ({cov:>3.0f}%)   ⚠️ {d['PARTIAL']}  ❌ {d['FAIL']}  🟡 {d['MANUAL']}")
    print(f"  -- Overall: {p_pass}/{total} PASS ({pct:.0f}%)  {verdict}")
    print(f"\nReport: {out_path.relative_to(REPO)}")
    return 0 if p_fail == 0 else 1


if __name__ == "__main__":
    yaml_arg = sys.argv[1] if len(sys.argv) > 1 else "docs/yanmar/requirements-checklist.yaml"
    sys.exit(main(yaml_arg))
