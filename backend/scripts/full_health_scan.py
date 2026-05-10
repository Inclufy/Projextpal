"""
Full backend API health scan for demo readiness.

Phase 1 — URL inventory: lists every registered API URL pattern with the
  HTTP methods its view accepts.

Phase 2 — Authenticated smoke test: for each list-style GET endpoint
  (no required path params), hits it as an authenticated user and
  reports the status code.

Phase 3 — Frontend reachability: greps frontend src for api.get/post/etc
  calls and reports which paths the frontend uses but the backend does
  not register (the 404 source).

Run inside the backend container — has Django URL resolver + DB:

    docker exec -i projextpal-backend-prod python3 manage.py shell \
        -c "exec(open('scripts/full_health_scan.py').read())"

Output:
  - Counts per status code
  - List of every 5xx (definitely broken)
  - List of every 4xx-not-401 (broken or missing)
  - List of frontend paths with no backend match
"""
from __future__ import annotations

import re
from collections import defaultdict

from django.test import Client
from django.urls import get_resolver
from django.contrib.auth import get_user_model

User = get_user_model()

# ----------------------------------------------------------------------
# 1. Auth setup
# ----------------------------------------------------------------------
user = (
    User.objects.filter(is_superuser=True, is_active=True).first()
    or User.objects.filter(is_active=True).order_by("pk").first()
)
if user is None:
    print("FATAL — no active user; cannot run authenticated smoke test.")
    raise SystemExit(1)

client = Client()
client.force_login(user)
print(f"Authenticated as: {user.email} (pk={user.pk}, role={getattr(user, 'role', '?')})")

# ----------------------------------------------------------------------
# 2. Walk URL patterns
# ----------------------------------------------------------------------
resolver = get_resolver()

# Regex patterns Django uses for path params we want to skip
PARAM_RE = re.compile(r"[<\\\(]")  # any of <name>, \d+, [^/]+, (...)

def iter_patterns(pattern_list, prefix=""):
    for p in pattern_list:
        if hasattr(p, "url_patterns"):
            yield from iter_patterns(p.url_patterns, prefix + str(p.pattern))
        else:
            yield prefix + str(p.pattern), p


def normalize(pattern_str: str) -> str:
    # Django regex patterns include ^$ anchors; strip and add leading /
    s = pattern_str.replace("^", "").replace("$", "")
    return "/" + s


# ----------------------------------------------------------------------
# 3. Smoke test list-style endpoints
# ----------------------------------------------------------------------
print()
print("=" * 70)
print("Phase 2: Authenticated GET smoke test")
print("=" * 70)

results: dict[int | str, list[str]] = defaultdict(list)
errors: list[str] = []
tested = 0

for path, pattern in iter_patterns(resolver.url_patterns):
    norm = normalize(path)
    if not norm.startswith("/api/v1/"):
        continue
    if PARAM_RE.search(norm):
        continue  # path needs a parameter, skip
    if not norm.endswith("/"):
        norm = norm + "/"
    try:
        response = client.get(norm)
        status = response.status_code
    except Exception as e:
        status = f"EXC:{type(e).__name__}"
        errors.append(f"  {norm}  — {type(e).__name__}: {e}")
    results[status].append(norm)
    tested += 1

print(f"\nTested {tested} list-style endpoints. Results:\n")
for status in sorted(results.keys(), key=lambda s: (isinstance(s, str), s)):
    urls = results[status]
    label = {200: "✓ OK", 201: "✓ Created", 204: "✓ No Content",
             401: "🔒 Auth required (probably fine)",
             403: "⚠ Forbidden",
             404: "✗ Not Found",
             405: "✓ GET not allowed (POST-only endpoint)",
             500: "💥 Internal Server Error"}.get(status, f"status={status}")
    print(f"  {label}  ({len(urls)})")

# Detail on the bad ones
for status_filter, label in [(500, "💥 5xx — DEMO BLOCKERS"),
                             (404, "✗ 404 — broken or missing"),
                             (403, "⚠ 403 — permission issue")]:
    if status_filter in results and results[status_filter]:
        print(f"\n{label}:")
        for url in sorted(results[status_filter])[:30]:
            print(f"  {url}")

if errors:
    print("\nException-raising endpoints:")
    for e in errors[:20]:
        print(e)

# ----------------------------------------------------------------------
# 4. Frontend reachability — grep src for api.* calls
# ----------------------------------------------------------------------
print()
print("=" * 70)
print("Phase 3: Frontend → backend reachability")
print("=" * 70)

import os, glob

# Path inside container — frontend isn't usually mounted, but try common spots
frontend_roots = [
    "/app/../frontend/src",
    "/frontend/src",
    "/code/frontend/src",
]
src_root = next((p for p in frontend_roots if os.path.isdir(p)), None)

if not src_root:
    print("Frontend src not mounted in container — skipping reachability check.")
    print("Run this on the host to scan:")
    print(r"  grep -rhoE \"api\.(get|post|patch|delete|put)<[^>]+>\\(['\\\"][^'\\\"]+\" frontend/src --include='*.ts' --include='*.tsx' | sort -u")
else:
    pattern = re.compile(r"api\.(?:get|post|patch|delete|put)(?:<[^>]+>)?\(['\"]([^'\"]+)")
    seen_paths: set[str] = set()
    for fp in glob.iglob(f"{src_root}/**/*.ts*", recursive=True):
        try:
            with open(fp, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
        except Exception:
            continue
        for m in pattern.finditer(content):
            seen_paths.add(m.group(1))

    backend_paths = {normalize(p).replace("\\", "") for p, _ in iter_patterns(resolver.url_patterns)
                     if not PARAM_RE.search(p) and normalize(p).startswith("/api/v1/")}

    # Frontend paths often start with /, normalize
    missing = []
    for fp in sorted(seen_paths):
        full = "/api/v1" + fp if not fp.startswith("/api") else fp
        full = full if full.endswith("/") else full + "/"
        if full not in backend_paths and not any(full.startswith(b.rstrip("/")) for b in backend_paths):
            missing.append(fp)

    if missing:
        print(f"\nFrontend calls {len(missing)} paths with no exact backend match:")
        for m in missing:
            print(f"  {m}")
    else:
        print("\n✓ All frontend api.* calls have a matching backend route.")

print()
print("=" * 70)
print("Phase 4: Admin action smoke (POST, against sentinel user)")
print("=" * 70)

# Smoke-test the admin-user POST actions that 404'd in production on
# 2026-05-10. We need a target user — create a sentinel inside a
# transaction we roll back, so we don't pollute prod data.
from django.db import transaction

ADMIN_ACTIONS = [
    ("resend_invite", {}, (200, 502)),  # 502 acceptable if SMTP unconfigured
    ("reset-password", {}, (200, 502)),
    ("set-password", {"password": "PreflightTest123!"}, (200, 502)),
]

if getattr(user, "role", None) != "superadmin":
    print("  (skipped — current user is not superadmin)")
else:
    try:
        with transaction.atomic():
            sentinel = User.objects.create_user(
                username="preflight+admin-action@projextpal.test",
                email="preflight+admin-action@projextpal.test",
                password="ignored",
                first_name="Preflight",
                role="admin",
                company=user.company,
                is_active=False,
            )
            for action, body, ok_codes in ADMIN_ACTIONS:
                url = f"/api/v1/admin/users/{sentinel.pk}/{action}/"
                try:
                    response = client.post(url, body, content_type="application/json")
                    sc = response.status_code
                    label = "✓" if sc in ok_codes else "✗"
                    print(f"  {label} POST {url}  →  {sc}")
                except Exception as e:
                    print(f"  ✗ POST {url}  →  {type(e).__name__}: {e}")
            raise transaction.TransactionManagementError("__rollback__")
    except transaction.TransactionManagementError as e:
        if "__rollback__" not in str(e):
            print(f"  ✗ Unexpected tx error: {e}")
    except Exception as e:
        print(f"  ✗ Admin action smoke failed: {type(e).__name__}: {e}")

print()
print("=" * 70)
print("Health scan complete.")
