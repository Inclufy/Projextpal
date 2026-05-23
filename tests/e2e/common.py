"""Shared helpers for ProjeXtPal E2E test scripts.

Lives in tests/e2e/ so the testing subagents can import it. Keeps each
agent script small (~200 lines) instead of repeating login/retry/report.

Usage (from an agent-specific script):

    from tests.e2e.common import Client, Report
    c = Client()
    c.login()
    r = Report()
    s, _ = c.get("/api/v1/projects/")
    r.record("projects_list", s)
    r.print()
"""
from __future__ import annotations

import json
import os
import ssl
import sys
import time
import urllib.error
import urllib.request
from collections import defaultdict
from typing import Any

BASE_URL = os.environ.get("BASE_URL", "https://projextpal.com")

# Cloudflare on projextpal.com rejects Python's default User-Agent with a
# 403 (error 1010). Any E2E script must impersonate a real browser UA.
UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_0) "
    "AppleWebKit/605.1.15 (KHTML, like Gecko) "
    "Version/17.0 Safari/605.1.15"
)

# TLS in dev/cert-pin environments is flaky; tests aren't meant to assert
# cert chain integrity, just API behavior. Use unverified context.
SSL_CTX = ssl._create_unverified_context()

EMAIL = os.environ.get("ADMIN_EMAIL", "sami@inclufy.com")
# Password MUST be supplied via the ADMIN_PASSWORD env var — never commit a
# literal. A prior default literal was leaked publicly via this file (repo is
# public) and has since been rotated. If ADMIN_PASSWORD is unset the tests
# fail at login() with a clear message rather than silently using a stale
# default.
PASSWORD = os.environ.get("ADMIN_PASSWORD", "")
if not PASSWORD:
    import warnings
    warnings.warn(
        "ADMIN_PASSWORD env var is not set; authenticated E2E tests will "
        "fail at login. Set ADMIN_PASSWORD before running.",
        RuntimeWarning,
        stacklevel=2,
    )


class Client:
    """Thin HTTP client for ProjeXtPal E2E tests.

    - Auto-attaches the browser UA (Cloudflare)
    - Stores the JWT after login() and attaches it to every request
    - Does NOT use requests/httpx to keep deps minimal — std-lib only
    """

    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url.rstrip("/")
        self.token: str | None = None

    # ------------------------------------------------------------
    def login(self, email: str = EMAIL, password: str = PASSWORD) -> None:
        s, body = self.post(
            "/api/v1/auth/login-2fa/",
            body={"email": email, "password": password},
            require_auth=False,
        )
        if s != 200:
            raise RuntimeError(f"login failed: {s} {body[:200]}")
        self.token = json.loads(body)["access"]

    # ------------------------------------------------------------
    def _request(
        self,
        method: str,
        path: str,
        body: Any | None = None,
        require_auth: bool = True,
        timeout: int = 30,
    ) -> tuple[int, str]:
        url = f"{self.base_url}{path}"
        data = json.dumps(body).encode() if body is not None else None
        headers = {
            "Accept": "application/json",
            "User-Agent": UA,
        }
        if data is not None:
            headers["Content-Type"] = "application/json"
        if require_auth and self.token:
            headers["Authorization"] = f"Bearer {self.token}"

        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        try:
            resp = urllib.request.urlopen(req, context=SSL_CTX, timeout=timeout)
            return resp.status, resp.read().decode(errors="replace")
        except urllib.error.HTTPError as e:
            return e.code, e.read().decode(errors="replace")
        except Exception as e:
            return -1, repr(e)

    def get(self, path: str, **kw) -> tuple[int, str]:
        return self._request("GET", path, **kw)

    def post(self, path: str, body: Any | None = None, **kw) -> tuple[int, str]:
        return self._request("POST", path, body=body, **kw)

    def patch(self, path: str, body: Any | None = None, **kw) -> tuple[int, str]:
        return self._request("PATCH", path, body=body, **kw)

    def put(self, path: str, body: Any | None = None, **kw) -> tuple[int, str]:
        return self._request("PUT", path, body=body, **kw)

    def delete(self, path: str, **kw) -> tuple[int, str]:
        return self._request("DELETE", path, **kw)

    # ------------------------------------------------------------
    def list_items(self, path: str) -> list[dict]:
        """GET a list endpoint and unwrap DRF pagination."""
        s, body = self.get(path)
        if s != 200:
            return []
        try:
            data = json.loads(body)
        except ValueError:
            return []
        if isinstance(data, list):
            return data
        if isinstance(data, dict):
            return data.get("results", [])
        return []

    def json_or_none(self, body: str) -> Any | None:
        try:
            return json.loads(body)
        except ValueError:
            return None


# ================================================================
# Reporting
# ================================================================
class Report:
    """Tallies test outcomes by area + prints a pass/fail matrix."""

    def __init__(self, title: str = "E2E TEST REPORT"):
        self.title = title
        self.rows: list[tuple[str, str, str, int, str]] = []
        # area, check_name, method, status_code, note

    def record(
        self,
        area: str,
        check_name: str,
        status: int,
        method: str = "GET",
        note: str = "",
    ) -> None:
        self.rows.append((area, check_name, method, status, note[:200]))

    def bucket(self, status: int) -> str:
        # Scripts record status=0 for an intentional skip (no data seeded,
        # admin-only flow, prerequisite not met, etc.). Don't fail CI on
        # those — bucket them as SKIP, info-only, excluded from the exit code.
        if status == 0:
            return "SKIP"
        if 200 <= status < 300:
            return "OK"
        if 400 <= status < 500:
            return "CLIENT"
        if 500 <= status < 600:
            return "SERVER"
        return "OTHER"

    def print(self) -> int:
        """Print the matrix. Returns the number of 5xx + networking errors
        (useful for a nonzero exit code in CI). SKIP rows are excluded."""
        print("=" * 90)
        print(self.title)
        print(f"base_url: {BASE_URL}")
        print("=" * 90)

        by_area: dict[str, list[int]] = defaultdict(lambda: [0, 0, 0, 0, 0])
        # [OK, CLIENT, SERVER, OTHER, SKIP]

        idx_for = {"OK": 0, "CLIENT": 1, "SERVER": 2, "OTHER": 3, "SKIP": 4}
        for area, name, method, status, note in self.rows:
            by_area[area][idx_for[self.bucket(status)]] += 1

        # Group rows by area for printing
        for area in sorted({r[0] for r in self.rows}):
            print(f"\n▶ {area.upper()}")
            for r in self.rows:
                if r[0] != area:
                    continue
                _, name, method, status, note = r
                tag = {
                    "OK": "✓",
                    "CLIENT": "?",
                    "SERVER": "✗",
                    "OTHER": "!",
                    "SKIP": "·",
                }[self.bucket(status)]
                print(
                    f"  {tag} {method:5s} {status:>4d}  {name:<50s}  "
                    f"{note[:80]}"
                )

        # Summary
        totals = [0, 0, 0, 0, 0]
        for cells in by_area.values():
            for i, v in enumerate(cells):
                totals[i] += v
        total = sum(totals)
        if total == 0:
            print("\nno checks recorded")
            return 0

        # Pass-rate excludes SKIPs from the denominator so a stack of "no
        # seed yet" skips doesn't tank a fundamentally green run.
        scored = total - totals[4]

        print("\n" + "=" * 90)
        print(
            f"SUMMARY: {totals[0]}/{scored} OK  |  "
            f"{totals[1]} 4xx  |  {totals[2]} 5xx  |  {totals[3]} other  |  "
            f"{totals[4]} skipped"
        )
        if scored > 0:
            print(f"Pass rate: {totals[0] * 100 / scored:.1f}%  (skips excluded)")

        # Per-area breakdown
        print("\nPer-area breakdown:")
        print(f"  {'area':<22s} {'OK':>5s} {'4xx':>5s} {'5xx':>5s} {'skip':>5s}")
        for area, cells in sorted(by_area.items()):
            print(
                f"  {area:<22s} {cells[0]:>5d} {cells[1]:>5d} {cells[2]:>5d} {cells[4]:>5d}"
            )

        # Highlight 5xx + OTHER as things to investigate (SKIPs are intentional)
        bugs = [r for r in self.rows if self.bucket(r[3]) in ("SERVER", "OTHER")]
        if bugs:
            print(f"\n{len(bugs)} items need investigation:")
            for area, name, method, status, note in bugs:
                print(f"  [{area}] {method} {status} {name}  {note[:100]}")

        return totals[2] + totals[3]


# ================================================================
# Small helpers
# ================================================================
def time_it(fn):
    """Wrap a function call and return (return_value, elapsed_seconds)."""
    t0 = time.time()
    out = fn()
    return out, time.time() - t0


if __name__ == "__main__":
    # Smoke test the common lib itself.
    c = Client()
    c.login()
    s, _ = c.get("/api/v1/projects/")
    print(f"smoke test: projects list -> {s}")
    sys.exit(0 if s == 200 else 1)
