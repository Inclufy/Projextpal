#!/usr/bin/env python3
"""Mobile API parity check.

Reads `src/services/api.ts` ENDPOINTS constants and probes each URL
against the backend. Any 404 = the mobile app references an endpoint
that doesn't exist = broken mobile feature.

Run:
    python tests/e2e/mobile_api_parity.py
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from tests.e2e.common import Client, Report  # noqa: E402


REPO_ROOT = Path(__file__).resolve().parents[2]
API_TS = REPO_ROOT / "src" / "services" / "api.ts"


def extract_endpoints() -> dict[str, str]:
    """Parse ENDPOINTS = { ... } out of api.ts. Returns {name: url}.

    Supports both plain strings and (id) => template literal functions.
    For functions, we substitute a placeholder `1` or a sample UUID to
    make the URL probeable.
    """
    if not API_TS.exists():
        return {}

    src = API_TS.read_text()

    # Crude: match `    NAME: '/api/v1/...',`
    plain = dict(re.findall(
        r"^\s+([A-Z_][A-Z0-9_]+):\s*'(/api/[^']+)'",
        src,
        flags=re.MULTILINE,
    ))

    # Match `    NAME: (x) => `/api/v1/.../${x}/`,`
    # Replace ${var} with 1 for probing
    funcs = {}
    for m in re.finditer(
        r"^\s+([A-Z_][A-Z0-9_]+):\s*\([^)]*\)\s*=>\s*`([^`]+)`",
        src,
        flags=re.MULTILINE,
    ):
        name, tmpl = m.group(1), m.group(2)
        url = re.sub(r"\$\{[^}]+\}", "1", tmpl)
        funcs[name] = url

    return {**plain, **funcs}


def main() -> int:
    endpoints = extract_endpoints()
    if not endpoints:
        print(f"No endpoints found. Check {API_TS}.")
        return 1

    print(f"Found {len(endpoints)} mobile endpoints in api.ts")

    c = Client()
    c.login()
    r = Report("MOBILE API PARITY REPORT")

    for name, url in endpoints.items():
        # For POST-style endpoints (auth), probe that the route exists
        # (any non-404 = wired). For GETs, 200 is ideal but 400/401/403 still
        # means the endpoint resolved.
        if any(k in name for k in ("LOGIN", "REGISTER", "REFRESH")):
            # Probe POST with empty body — expect 400/401/403, not 404
            s, _ = c.post(url, body={}, require_auth=False)
            note = "endpoint-wired" if s != 404 else "!MISSING!"
            r.record("auth-endpoints", f"{name} -> {url}", s, "POST", note=note)
        else:
            s, _ = c.get(url)
            note = "" if 200 <= s < 300 else (
                "!BROKEN! endpoint-wired-but-err" if s != 404 else "!MISSING!"
            )
            r.record("data-endpoints", f"{name} -> {url}", s, "GET", note=note)

    return r.print()


if __name__ == "__main__":
    sys.exit(main())
