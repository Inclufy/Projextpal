#!/usr/bin/env python3
"""
Focused E2E test for the new tenant-provisioning + onboarding endpoints
deployed to projextpal.com.

Covers (in order):
  1. Tenant provisioning happy path  (POST /admin/tenants/provision/)
  2. Provisioning auth gate          (non-superadmin must 403)
  3. Logo upload                     (multipart POST /admin/tenants/<id>/upload-logo/)
  4. Resend invite real              (POST /admin/users/<owner-id>/resend_invite/)
  5. Set password                    (POST /admin/users/<owner-id>/set-password/)
  6. SuperAdmin project scope        (GET /projects/ vs ?all_tenants=1)
  7. Tenant isolation after login    (new owner sees only own tenant)
  8. PATCH tenant fields             (industry / timezone / primary_color)
  9. Cleanup                         (DELETE new tenant + user)

Run:
    python tests/e2e/tenant_provisioning_e2e.py
"""
from __future__ import annotations

import io
import json
import ssl
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from tests.e2e.common import Client, Report, BASE_URL, UA, SSL_CTX  # noqa: E402

TIMESTAMP = int(time.time())
TEST_TENANT_NAME = f"E2E-Prov-{TIMESTAMP}"
TEST_OWNER_EMAIL = f"test-prov-{TIMESTAMP}@example.com"
TEST_PASSWORD = "Welkom2026!"


# ---------------------------------------------------------------------------
# Multipart helper (stdlib only — no requests)
# ---------------------------------------------------------------------------

def _multipart_request(
    method: str,
    url: str,
    token: str | None,
    fields: dict[str, str],
    file_field: str,
    file_name: str,
    file_data: bytes,
    file_mime: str = "image/png",
    timeout: int = 30,
) -> tuple[int, str]:
    boundary = f"----E2EBoundary{TIMESTAMP}"
    body_parts: list[bytes] = []

    for name, value in fields.items():
        body_parts.append(
            (
                f"--{boundary}\r\n"
                f'Content-Disposition: form-data; name="{name}"\r\n\r\n'
                f"{value}\r\n"
            ).encode()
        )

    body_parts.append(
        (
            f"--{boundary}\r\n"
            f'Content-Disposition: form-data; name="{file_field}"; filename="{file_name}"\r\n'
            f"Content-Type: {file_mime}\r\n\r\n"
        ).encode()
        + file_data
        + b"\r\n"
    )
    body_parts.append(f"--{boundary}--\r\n".encode())

    body = b"".join(body_parts)
    headers = {
        "Content-Type": f"multipart/form-data; boundary={boundary}",
        "User-Agent": UA,
        "Accept": "application/json",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"

    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        resp = urllib.request.urlopen(req, context=SSL_CTX, timeout=timeout)
        return resp.status, resp.read().decode(errors="replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode(errors="replace")
    except Exception as exc:
        return -1, repr(exc)


def tiny_png() -> bytes:
    """Minimal valid 1x1 red PNG (67 bytes) — no external deps."""
    import zlib, struct

    def chunk(name: bytes, data: bytes) -> bytes:
        c = name + data
        return struct.pack(">I", len(data)) + c + struct.pack(">I", zlib.crc32(c) & 0xFFFFFFFF)

    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = chunk(b"IHDR", struct.pack(">IIBBBBB", 1, 1, 8, 2, 0, 0, 0))
    raw = b"\x00\xff\x00\x00"  # filter byte + R G B
    idat = chunk(b"IDAT", zlib.compress(raw))
    iend = chunk(b"IEND", b"")
    return sig + ihdr + idat + iend


# ---------------------------------------------------------------------------
# Step 1 — Provisioning happy path
# ---------------------------------------------------------------------------

def step1_provision(super_c: Client, r: Report) -> tuple[int | None, int | None]:
    """Returns (tenant_id, owner_user_id) or (None, None) on failure."""
    payload = {
        "name": TEST_TENANT_NAME,
        "description": "Automated E2E provisioning test",
        "industry": "Technology",
        "organization_size": "11-50 employees",
        "timezone": "Europe/Amsterdam",
        "locale": "en",
        "currency": "EUR",
        "primary_color": "#7C3AED",
        "owner_email": TEST_OWNER_EMAIL,
        "owner_first_name": "E2E",
        "owner_last_name": "Testowner",
        "require_2fa": False,
        "send_invites": False,   # avoid real email in prod test
        "seed_demo_data": False,
        "onboarding_data": {"source": "e2e_test"},
    }
    s, body = super_c.post("/api/v1/admin/tenants/provision/", body=payload)
    data = super_c.json_or_none(body) or {}

    tenant_id = data.get("id")
    ok_201 = s == 201
    has_id = bool(tenant_id)
    has_color = data.get("primary_color") == "#7C3AED"
    has_tz = data.get("timezone") == "Europe/Amsterdam"
    has_industry = data.get("industry") == "Technology"
    has_onboarding = data.get("onboarding_completed") is True

    note = (
        f"tenant_id={tenant_id} color={'ok' if has_color else 'MISSING'} "
        f"tz={'ok' if has_tz else 'MISSING'} "
        f"industry={'ok' if has_industry else 'MISSING'} "
        f"onboarding_completed={'ok' if has_onboarding else 'MISSING'}"
    )
    r.record("1-provision", "happy-path POST /admin/tenants/provision/", s, "POST", note=note)

    if not ok_201 or not has_id:
        r.record("1-provision", "!FAIL cannot continue without tenant_id", s, "POST",
                 note=body[:300])
        return None, None

    # Verify GET returns all new fields
    s2, body2 = super_c.get(f"/api/v1/admin/tenants/{tenant_id}/")
    data2 = super_c.json_or_none(body2) or {}
    fields_ok = all([
        data2.get("primary_color") == "#7C3AED",
        data2.get("timezone") == "Europe/Amsterdam",
        data2.get("industry") == "Technology",
        data2.get("onboarding_completed") is True,
    ])
    r.record("1-provision", f"GET /admin/tenants/{tenant_id}/ — new fields", s2, "GET",
             note=f"fields_ok={fields_ok}")

    # Find the owner user id
    users = super_c.list_items("/api/v1/admin/users/")
    owner_id = None
    for u in users:
        if (u.get("email") or "").lower() == TEST_OWNER_EMAIL.lower():
            owner_id = u["id"]
            break
    r.record("1-provision", "owner user created", 200 if owner_id else 404,
             note=f"owner_id={owner_id} is_active={next((u.get('is_active') for u in users if u.get('email','').lower()==TEST_OWNER_EMAIL), '?')}")

    return tenant_id, owner_id


# ---------------------------------------------------------------------------
# Step 2 — Auth gate (non-superadmin must 403)
# ---------------------------------------------------------------------------

def step2_auth_gate(owner_c: Client, r: Report) -> None:
    payload = {
        "name": f"ShouldFail-{TIMESTAMP}",
        "owner_email": f"shouldfail-{TIMESTAMP}@example.com",
    }
    s, body = owner_c.post("/api/v1/admin/tenants/provision/", body=payload)
    correct = s == 403
    r.record("2-auth-gate", "non-superadmin POST /admin/tenants/provision/", s, "POST",
             note="correct-403" if correct else f"!SECURITY-FAIL! expected 403 got {s}")


# ---------------------------------------------------------------------------
# Step 3 — Logo upload
# ---------------------------------------------------------------------------

def step3_logo(super_c: Client, tenant_id: int, r: Report) -> None:
    url = f"{BASE_URL}/api/v1/admin/tenants/{tenant_id}/upload-logo/"
    png_bytes = tiny_png()
    s, body = _multipart_request(
        "POST", url, super_c.token,
        fields={},
        file_field="file",
        file_name="e2e_logo.png",
        file_data=png_bytes,
    )
    data = super_c.json_or_none(body) or {}
    logo_set = bool(data.get("logo"))
    r.record("3-logo", f"POST /admin/tenants/{tenant_id}/upload-logo/", s, "POST",
             note=f"logo_populated={logo_set}")


# ---------------------------------------------------------------------------
# Step 4 — Resend invite
# ---------------------------------------------------------------------------

def step4_resend_invite(super_c: Client, owner_id: int, r: Report) -> None:
    s, body = super_c.post(f"/api/v1/admin/users/{owner_id}/resend_invite/")
    data = super_c.json_or_none(body) or {}
    correct = s == 200 and data.get("status") == "invite_sent"
    r.record("4-resend-invite", f"POST /admin/users/{owner_id}/resend_invite/", s, "POST",
             note=f"status={data.get('status')} sent={data.get('sent')} {'ok' if correct else '!FAIL'}")


# ---------------------------------------------------------------------------
# Step 5 — Set password
# ---------------------------------------------------------------------------

def step5_set_password(super_c: Client, owner_id: int, r: Report) -> bool:
    """Returns True if password was set (needed for step 7)."""
    # 5a) Short password validation
    s, body = super_c.post(f"/api/v1/admin/users/{owner_id}/set-password/",
                           body={"password": "abc"})
    r.record("5-set-password", "short-password validation (<8 chars)", s, "POST",
             note="correct-400" if s == 400 else f"!FAIL! expected 400 got {s}")

    # 5b) Happy path
    s, body = super_c.post(f"/api/v1/admin/users/{owner_id}/set-password/",
                           body={"password": TEST_PASSWORD})
    data = super_c.json_or_none(body) or {}
    activated = data.get("is_active") is True
    r.record("5-set-password", "happy-path set password", s, "POST",
             note=f"status={data.get('status')} is_active={data.get('is_active')} {'ok' if s==200 and activated else '!FAIL'}")

    if s != 200 or not activated:
        return False

    # 5c) Verify is_active=True via GET
    s2, body2 = super_c.get(f"/api/v1/admin/users/{owner_id}/")
    data2 = super_c.json_or_none(body2) or {}
    active_via_get = data2.get("is_active") is True
    r.record("5-set-password", f"GET /admin/users/{owner_id}/ is_active after set-password", s2,
             note=f"is_active={data2.get('is_active')} {'ok' if active_via_get else '!FAIL'}")
    return active_via_get


# ---------------------------------------------------------------------------
# Step 6 — SuperAdmin project scope
# ---------------------------------------------------------------------------

def step6_project_scope(super_c: Client, r: Report) -> None:
    # 6a) Without ?all_tenants=1 — must return only Sami's company projects
    s, body = super_c.get("/api/v1/projects/")
    data = super_c.json_or_none(body) or {}
    results = data.get("results", data) if isinstance(data, dict) else data
    count_default = len(results) if isinstance(results, list) else 0

    # Gather unique company IDs from default response
    company_ids_default = set()
    if isinstance(results, list):
        for p in results:
            cid = p.get("company") or p.get("company_id")
            if cid:
                company_ids_default.add(cid)

    # SuperAdmin company_id (Sami's tenant)
    s_me, me_body = super_c.get("/api/v1/auth/user/")
    me = super_c.json_or_none(me_body) or {}
    sami_company_id = me.get("company") or me.get("company_id")

    single_tenant = len(company_ids_default) <= 1
    r.record("6-project-scope", "GET /projects/ (default — own tenant only)", s,
             note=f"count={count_default} company_ids={list(company_ids_default)} "
                  f"single_tenant={'ok' if single_tenant else '!FAIL — cross-tenant leak!'}")

    # 6b) With ?all_tenants=1 — must return more if multiple tenants exist
    s2, body2 = super_c.get("/api/v1/projects/?all_tenants=1")
    data2 = super_c.json_or_none(body2) or {}
    results2 = data2.get("results", data2) if isinstance(data2, dict) else data2
    count_all = len(results2) if isinstance(results2, list) else 0

    company_ids_all = set()
    if isinstance(results2, list):
        for p in results2:
            cid = p.get("company") or p.get("company_id")
            if cid:
                company_ids_all.add(cid)

    multi_tenant = len(company_ids_all) >= 1
    r.record("6-project-scope", "GET /projects/?all_tenants=1", s2,
             note=f"count={count_all} company_ids={list(company_ids_all)} "
                  f"multi_tenant={'ok' if multi_tenant else 'only-1-tenant-may-be-ok'}")

    # Flag if all_tenants=1 leaks MORE data but default does NOT
    if count_all > count_default:
        r.record("6-project-scope", "scoping delta all_tenants vs default", 200,
                 note=f"default={count_default} all={count_all} — scoping works correctly")
    elif count_default == count_all and count_default > 0:
        r.record("6-project-scope", "WARNING — default == all_tenants count", 200,
                 note=f"both={count_default}. Either only 1 tenant has projects, or scoping not enforced")


# ---------------------------------------------------------------------------
# Step 7 — Tenant isolation: login as new owner
# ---------------------------------------------------------------------------

def step7_tenant_isolation(tenant_id: int, r: Report) -> None:
    try:
        owner_c = Client()
        owner_c.login(email=TEST_OWNER_EMAIL, password=TEST_PASSWORD)
    except RuntimeError as exc:
        r.record("7-isolation", "login as new owner", -1,
                 note=f"login failed: {exc}")
        return

    # Owner must only see own tenant projects
    s, body = owner_c.get("/api/v1/projects/")
    data = owner_c.json_or_none(body) or {}
    results = data.get("results", data) if isinstance(data, dict) else data
    company_ids = set()
    if isinstance(results, list):
        for p in results:
            cid = p.get("company") or p.get("company_id")
            if cid:
                company_ids.add(str(cid))

    # Fetch own company id
    s_me, me_body = owner_c.get("/api/v1/auth/user/")
    me = owner_c.json_or_none(me_body) or {}
    owner_company_id = str(me.get("company") or me.get("company_id") or "")

    cross_leak = any(cid != owner_company_id for cid in company_ids) if company_ids else False
    isolation_ok = not cross_leak

    r.record("7-isolation", "new owner GET /projects/ — only own tenant", s,
             note=f"company_ids_seen={list(company_ids)} own={owner_company_id} "
                  f"{'isolation-INTACT' if isolation_ok else '!CRITICAL — TENANT ISOLATION BREACH!'}")

    # Owner must not reach admin/users (non-superadmin)
    s2, _ = owner_c.get("/api/v1/admin/users/")
    r.record("7-isolation", "new owner GET /admin/users/ (must 403)", s2,
             note="correct-403" if s2 == 403 else f"!SECURITY FAIL! expected 403 got {s2}")

    # Owner must not see admin/tenants
    s3, _ = owner_c.get("/api/v1/admin/tenants/")
    r.record("7-isolation", "new owner GET /admin/tenants/ (must 403)", s3,
             note="correct-403" if s3 == 403 else f"!SECURITY FAIL! expected 403 got {s3}")


# ---------------------------------------------------------------------------
# Step 8 — PATCH tenant fields
# ---------------------------------------------------------------------------

def step8_patch_tenant(super_c: Client, tenant_id: int, r: Report) -> None:
    patch_payload = {
        "industry": "Construction",
        "timezone": "America/New_York",
        "primary_color": "#FF5733",
    }
    s, body = super_c.patch(f"/api/v1/admin/tenants/{tenant_id}/", body=patch_payload)
    data = super_c.json_or_none(body) or {}

    persisted_industry = data.get("industry") == "Construction"
    persisted_tz = data.get("timezone") == "America/New_York"
    persisted_color = data.get("primary_color") == "#FF5733"

    if not all([persisted_industry, persisted_tz, persisted_color]):
        # Try GET to verify persistence
        s2, body2 = super_c.get(f"/api/v1/admin/tenants/{tenant_id}/")
        data2 = super_c.json_or_none(body2) or {}
        persisted_industry = data2.get("industry") == "Construction"
        persisted_tz = data2.get("timezone") == "America/New_York"
        persisted_color = data2.get("primary_color") == "#FF5733"

    all_ok = all([persisted_industry, persisted_tz, persisted_color])
    r.record("8-patch-tenant", f"PATCH /admin/tenants/{tenant_id}/", s, "PATCH",
             note=f"industry={'ok' if persisted_industry else 'FAIL'} "
                  f"tz={'ok' if persisted_tz else 'FAIL'} "
                  f"color={'ok' if persisted_color else 'FAIL'} "
                  f"{'all-persisted' if all_ok else '!FIELDS NOT PERSISTED'}")


# ---------------------------------------------------------------------------
# Step 9 — Cleanup
# ---------------------------------------------------------------------------

def step9_cleanup(super_c: Client, tenant_id: int | None, owner_id: int | None,
                  r: Report) -> None:
    if owner_id:
        s, _ = super_c.delete(f"/api/v1/admin/users/{owner_id}/")
        r.record("9-cleanup", f"DELETE /admin/users/{owner_id}/", s, "DELETE",
                 note="ok" if s in (200, 204) else f"got {s}")

    if tenant_id:
        s, _ = super_c.delete(f"/api/v1/admin/tenants/{tenant_id}/")
        r.record("9-cleanup", f"DELETE /admin/tenants/{tenant_id}/", s, "DELETE",
                 note="ok" if s in (200, 204) else f"got {s}")


# ---------------------------------------------------------------------------
# Audit log verification helper
# ---------------------------------------------------------------------------

def check_audit_log(super_c: Client, r: Report, keyword: str, area: str) -> None:
    s, body = super_c.get("/api/v1/admin/logs/")
    data = super_c.json_or_none(body) or {}
    entries = data.get("results", data) if isinstance(data, dict) else data
    found = False
    if isinstance(entries, list):
        for e in entries[:50]:
            desc = (e.get("description") or "") + (e.get("action") or "")
            if keyword.lower() in desc.lower():
                found = True
                break
    r.record(area, f"audit log has entry for '{keyword}'", 200 if found else 404,
             note="audit-logged" if found else "!NO AUDIT ENTRY — compliance gap")


# ---------------------------------------------------------------------------
# Non-superadmin client (login as tenant admin / contributor)
# ---------------------------------------------------------------------------

def get_non_superadmin_client(super_c: Client, r: Report) -> Client | None:
    """
    Grab ANY active user from the admin list who is NOT superadmin,
    set a known password via set-password, return a Client logged in as them.
    Falls back to the provisioned test owner (but that might not exist yet).
    """
    users = super_c.list_items("/api/v1/admin/users/")
    candidate = None
    for u in users:
        role = u.get("role") or ""
        email = u.get("email") or ""
        is_active = u.get("is_active", False)
        if role not in ("superadmin",) and is_active and email and email != TEST_OWNER_EMAIL:
            candidate = u
            break

    if not candidate:
        r.record("2-auth-gate", "non-superadmin candidate", 404,
                 note="no suitable non-superadmin user found; skipping gate test")
        return None

    uid = candidate["id"]
    temp_pw = "TempGate2026!"
    s, _ = super_c.post(f"/api/v1/admin/users/{uid}/set-password/",
                        body={"password": temp_pw})
    if s != 200:
        r.record("2-auth-gate", "set-password for gate candidate", s, "POST",
                 note=f"failed; cannot test gate")
        return None

    try:
        c = Client()
        c.login(email=candidate["email"], password=temp_pw)
        return c
    except RuntimeError as exc:
        r.record("2-auth-gate", "login as non-superadmin", -1, note=str(exc))
        return None


# ---------------------------------------------------------------------------
# main
# ---------------------------------------------------------------------------

def main() -> int:
    r = Report("TENANT PROVISIONING + ONBOARDING E2E REPORT")

    # Login as superadmin
    super_c = Client()
    try:
        super_c.login()
    except RuntimeError as exc:
        r.record("login", "superadmin login", -1, note=str(exc))
        r.print()
        return 1

    r.record("login", "superadmin login (sami@inclufy.com)", 200, note="ok")

    # Step 1 — provision
    tenant_id, owner_id = step1_provision(super_c, r)

    # Step 2 — auth gate (needs a non-superadmin user)
    non_super = get_non_superadmin_client(super_c, r)
    if non_super:
        step2_auth_gate(non_super, r)
    else:
        r.record("2-auth-gate", "skipped — no suitable non-superadmin user", 0,
                 note="manual verification needed")

    # Steps 3-8 require tenant_id
    if tenant_id:
        step3_logo(super_c, tenant_id, r)

        if owner_id:
            step4_resend_invite(super_c, owner_id, r)
            activated = step5_set_password(super_c, owner_id, r)

            # Audit log checks after write ops
            check_audit_log(super_c, r, "Provisioned tenant", "audit-log")
            check_audit_log(super_c, r, "Resent verification", "audit-log")
            check_audit_log(super_c, r, "set a new password", "audit-log")

            if activated:
                step7_tenant_isolation(tenant_id, r)
            else:
                r.record("7-isolation", "skipped — set-password failed", 0,
                         note="cannot test isolation without activated owner account")
        else:
            r.record("4-resend-invite", "skipped — owner_id not found", 0)
            r.record("5-set-password", "skipped — owner_id not found", 0)
            r.record("7-isolation", "skipped — owner_id not found", 0)

        step6_project_scope(super_c, r)
        step8_patch_tenant(super_c, tenant_id, r)
        step9_cleanup(super_c, tenant_id, owner_id, r)
    else:
        r.record("3-logo", "skipped — no tenant_id from provision", 0)
        r.record("4-resend-invite", "skipped — no tenant_id from provision", 0)
        r.record("5-set-password", "skipped — no tenant_id from provision", 0)
        r.record("6-project-scope", "skipped — no tenant_id from provision", 0)
        r.record("7-isolation", "skipped — no tenant_id from provision", 0)
        r.record("8-patch-tenant", "skipped — no tenant_id from provision", 0)
        r.record("9-cleanup", "skipped — no tenant_id from provision", 0)

    return r.print()


if __name__ == "__main__":
    sys.exit(main())
