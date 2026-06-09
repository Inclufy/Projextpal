"""In-product compliance evidence surface.

Exposes ProjeXtPal's GDPR + ISO 27001 posture as read-only structured data so
it can be shown inside the product (admin Compliance page) as evidence for
enterprise / tender buyers. The control statuses mirror the evidence-based audit
in docs/compliance/COMPLIANCE_AUDIT_2026-06-09.md — update both together.

No model / no migration: this is a curated, versioned snapshot. Admin-gated.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

AUDIT_DATE = "2026-06-09"

# status ∈ pass | partial | fail ; kind ∈ engineering | documentation
GDPR = [
    {"id": "G1", "control": "Privacy policy + DPO + cookie notice", "status": "partial", "kind": "documentation", "evidence": "public page live at /privacy + footer link; still: fill KvK/address/DPO + cookie notice"},
    {"id": "G2", "control": "Lawful basis & consent capture", "status": "pass", "kind": "engineering", "evidence": "onboarding accept_tos/accept_dpa/accept_gdpr, logged"},
    {"id": "G3", "control": "Art. 15 — data export (reachable in UI)", "status": "pass", "kind": "engineering", "evidence": "Settings → Security → Download my data → /auth/me/export/"},
    {"id": "G4", "control": "Art. 17 — erasure (reachable in UI)", "status": "pass", "kind": "engineering", "evidence": "Settings → Security → Delete my account → /auth/me/delete/ (anonymize + 30d grace)"},
    {"id": "G5", "control": "Art. 16/21 — rectify & object / opt-out", "status": "pass", "kind": "engineering", "evidence": "profile edit + per-type notification opt-out"},
    {"id": "G6", "control": "Data minimization & retention", "status": "partial", "kind": "documentation", "evidence": "lean user schema; retention policy documented in RoPA, auto-purge job pending"},
    {"id": "G7", "control": "RoPA (Art. 30 processing register)", "status": "pass", "kind": "documentation", "evidence": "docs/compliance/ropa.md"},
    {"id": "G8", "control": "Sub-processors + DPAs (Art. 28)", "status": "pass", "kind": "documentation", "evidence": "docs/compliance/sub-processors.md"},
    {"id": "G9", "control": "Breach notification procedure (Art. 33/34)", "status": "pass", "kind": "documentation", "evidence": "docs/compliance/breach-response-procedure.md + Sentry"},
    {"id": "G10", "control": "International transfers (SCCs/DPF)", "status": "pass", "kind": "documentation", "evidence": "covered in privacy policy + sub-processor list"},
]

ISO = [
    {"id": "I1", "control": "Access control (RBAC + tenant isolation)", "status": "pass", "kind": "engineering", "evidence": "HasRole, accessible_project_ids, CompanyScopedQuerysetMixin"},
    {"id": "I2", "control": "MFA / 2FA", "status": "pass", "kind": "engineering", "evidence": "django_otp + TOTP + Settings → Security"},
    {"id": "I3", "control": "Encryption at rest + in transit", "status": "pass", "kind": "engineering", "evidence": "Fernet EncryptedTextField; HSTS + SSL redirect + secure cookies"},
    {"id": "I4", "control": "Rate limiting", "status": "pass", "kind": "engineering", "evidence": "DRF ScopedRateThrottle"},
    {"id": "I5", "control": "Secrets management", "status": "pass", "kind": "engineering", "evidence": ".env gitignored; Fernet for stored credentials"},
    {"id": "I6", "control": "Audit log (all sensitive writes)", "status": "pass", "kind": "engineering", "evidence": "audit() helper → AuditLog; emits on data.export, account.delete, task.bulk_update/delete/import, custom_field.*; admin viewer at /audit-log"},
    {"id": "I7", "control": "Vulnerability & change mgmt", "status": "partial", "kind": "engineering", "evidence": "add npm audit + pip-audit to CI; code review in place"},
    {"id": "I8", "control": "Backup & DR (off-site + tested restore)", "status": "partial", "kind": "engineering", "evidence": "pg_dump + runbook; verify cron paths + off-site + restore test"},
    {"id": "I9", "control": "Monitoring & error tracking", "status": "pass", "kind": "engineering", "evidence": "Sentry (backend + RN)"},
    {"id": "I10", "control": "ISMS / written policies + risk register", "status": "fail", "kind": "documentation", "evidence": "not yet authored — the core ISO 27001 work"},
]

DOCS = [
    {"title": "Compliance audit report", "path": "docs/compliance/COMPLIANCE_AUDIT_2026-06-09.md"},
    {"title": "Privacy policy", "path": "docs/compliance/privacy-policy.md"},
    {"title": "Record of Processing Activities (RoPA)", "path": "docs/compliance/ropa.md"},
    {"title": "Sub-processors", "path": "docs/compliance/sub-processors.md"},
    {"title": "Breach response procedure", "path": "docs/compliance/breach-response-procedure.md"},
]


def _pct(rows):
    if not rows:
        return 0
    score = sum(1.0 if r["status"] == "pass" else 0.5 if r["status"] == "partial" else 0.0 for r in rows)
    return round(score / len(rows) * 100)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def compliance_posture(request):
    """Admin-only read-only compliance posture (evidence surface)."""
    role = getattr(request.user, "role", None)
    if role not in ("admin", "superadmin") and not getattr(request.user, "is_superuser", False):
        return Response({"detail": "Admin only."}, status=403)
    return Response({
        "audit_date": AUDIT_DATE,
        "gdpr": {"controls": GDPR, "score": _pct(GDPR)},
        "iso27001": {"controls": ISO, "score": _pct(ISO)},
        "documents": DOCS,
        "note": "GDPR is complied-with (not certified). ISO 27001 score is readiness, not certification — only an accredited auditor certifies.",
    })
