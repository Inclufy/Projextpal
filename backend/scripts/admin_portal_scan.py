"""
Admin portal-specific health scan — hits every endpoint the admin UI
consumes and reports the full status code distribution + tracebacks
for any 5xx.

Endpoints scanned (cross-referenced with frontend/src/pages/admin-portal/*.tsx):

  Dashboard       /api/v1/admin/stats/
  Users           /api/v1/admin/users/, /tenants/
  Audit logs      /api/v1/admin/logs/
  Plans/Pricing   /api/v1/admin/plans/
  Invoices        /api/v1/admin/invoices/, /invoice-settings/
  Settings        /api/v1/admin/settings/
  Training        /api/v1/admin/training/{courses,enrollments,quotes,analytics}/
  Integrations    /api/v1/admin/integrations/  (placeholder)
  Demo requests   /api/v1/admin/demo-requests/  (placeholder)

Run via:
    docker exec -i projextpal-backend-prod python3 manage.py shell \
        -c "exec(open('scripts/admin_portal_scan.py').read())"

Read-only: only GET requests. Authenticates as the first superadmin.
"""
from __future__ import annotations

import traceback
from collections import defaultdict

from django.test import Client
from django.contrib.auth import get_user_model

User = get_user_model()

# ----------------------------------------------------------------------
# Authenticate as superadmin
# ----------------------------------------------------------------------
user = (
    User.objects.filter(role="superadmin", is_active=True).first()
    or User.objects.filter(is_superuser=True, is_active=True).first()
)
if user is None:
    print("FATAL — no superadmin / superuser found; cannot scan admin endpoints.")
    raise SystemExit(1)

client = Client()
client.force_login(user)
print(f"Scanning admin portal as: {user.email} (role={getattr(user, 'role', '?')})")
print()

# ----------------------------------------------------------------------
# Each tab → list of endpoints the page hits on mount
# (path → "Tab label" for human-readable grouping)
# ----------------------------------------------------------------------
ADMIN_ENDPOINTS: dict[str, list[str]] = {
    "Dashboard": [
        "/api/v1/admin/stats/",
        "/api/v1/admin/logs/",
    ],
    "Users": [
        "/api/v1/admin/users/",
        "/api/v1/auth/company-users/",
    ],
    "Organizations": [
        "/api/v1/admin/tenants/",
    ],
    "Plans & Pricing": [
        "/api/v1/admin/plans/",
        "/api/v1/subscriptions/plans/public/",
    ],
    "Audit Logs": [
        "/api/v1/admin/logs/",
    ],
    "Invoices": [
        "/api/v1/admin/invoices/",
        "/api/v1/admin/invoice-settings/",
    ],
    "Settings": [
        "/api/v1/admin/settings/",
    ],
    "Training — Courses": [
        "/api/v1/admin/training/courses/",
    ],
    "Training — Enrollments": [
        "/api/v1/admin/training/enrollments/",
    ],
    "Training — Quotes": [
        "/api/v1/admin/training/quotes/",
    ],
    "Training — Analytics": [
        "/api/v1/admin/training/analytics/",
    ],
}

results: dict[str, list[tuple[str, int | str]]] = defaultdict(list)
five_xx_details: list[str] = []

for tab, paths in ADMIN_ENDPOINTS.items():
    for path in paths:
        try:
            response = client.get(path)
            status = response.status_code
            if status >= 500:
                # Capture exception text from response.content for diagnosis
                snippet = response.content.decode("utf-8", errors="ignore")[:300]
                five_xx_details.append(f"\n{tab} → {path} → {status}\n  {snippet}")
        except Exception as e:
            status = f"EXC:{type(e).__name__}"
            five_xx_details.append(f"\n{tab} → {path} → {type(e).__name__}: {e}\n"
                                   f"  {traceback.format_exc()[:400]}")
        results[tab].append((path, status))

# ----------------------------------------------------------------------
# Print per-tab summary
# ----------------------------------------------------------------------
print("=" * 72)
print(f"{'TAB':<28} {'ENDPOINT':<36} STATUS")
print("=" * 72)
totals: dict[int | str, int] = defaultdict(int)
for tab, entries in ADMIN_ENDPOINTS.items():
    first = True
    for path, status in results[tab]:
        prefix = tab if first else ""
        first = False
        icon = ("✓" if isinstance(status, int) and status < 400 else
                "🔒" if status == 401 else
                "⚠" if isinstance(status, int) and 400 <= status < 500 and status != 404 else
                "✗" if status == 404 else
                "💥")
        print(f"{prefix:<28} {path:<36} {icon} {status}")
        totals[status] += 1
    print()

print("=" * 72)
print("STATUS DISTRIBUTION")
print("=" * 72)
for status in sorted(totals.keys(), key=lambda s: (isinstance(s, str), s)):
    print(f"  {status}: {totals[status]}")

# ----------------------------------------------------------------------
# 5xx details
# ----------------------------------------------------------------------
if five_xx_details:
    print()
    print("=" * 72)
    print("5xx DETAILS (demo blockers)")
    print("=" * 72)
    for d in five_xx_details:
        print(d)
else:
    print()
    print("=" * 72)
    print("PASS — no 5xx errors across admin portal endpoints.")
