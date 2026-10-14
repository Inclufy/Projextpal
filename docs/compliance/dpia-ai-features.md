# DPIA — ProjeXtPal AI features

**Audience**: tenant admins and DPOs at customers in regulated sectors
(zorg, overheid, financial services) who must file a Data Protection
Impact Assessment (DPIA) under GDPR Art. 35 before enabling the AI
features of ProjeXtPal.

**Scope**: this document covers only the AI surfaces that read customer-
uploaded documents via the `ProjectAIContext` / `ProgramAIContext` /
`PortfolioAIContext` model and submit (parts of) their text to an LLM.
The rest of ProjeXtPal's processing is covered by the master RoPA at
`docs/compliance/ropa.md`.

**Status**: pre-filled template. Each customer completes the "Tenant
decision" boxes and signs off; Inclufy keeps the signed copy with the
customer's DPA.

---

## 1. Processing activity

### 1.1 Purpose and necessity
AI features (Plan with AI, Ask Co-pilot, project coach, methodology
auto-drafts, status reports, team recommender, risk mitigation, risk
forecast, compliance scan, dashboard narratives) use the content of
documents the tenant uploaded (tenders, charters, briefs, policy PDFs)
to produce project-management output grounded in those documents.

### 1.2 Lawful basis (Art. 6)
- Default: Art. 6(1)(b) — performance of the contract (the tenant
  subscribed to a product whose core deliverable is these AI features).
- Alternative: Art. 6(1)(f) — legitimate interest. The tenant's balancing
  test lives in their own file; Inclufy does not record it.

### 1.3 Special category data (Art. 9)
Not expected. ProjeXtPal is sold for project management, not for case-
management of individuals. The template below assumes **no Art. 9 data**
is uploaded; a tenant that intends to upload such data must either (a)
redact before upload, (b) rely on an explicit Art. 9(2) basis documented
in their own DPIA, or (c) disable `ai_context_enabled` in
`TenantAIFeatureFlags` so Project/Program/Portfolio documents never
reach the LLM.

### 1.4 Data categories
| Category | Source | Example |
|---|---|---|
| Project document text | uploaded by tenant users | tender PDF, charter, brief, policy memo |
| User identity | tenant SSO or Inclufy accounts | email, name, role |
| Audit metadata | ProjeXtPal | `AIContextAccessLog` row per AI call |

### 1.5 Recipients
| Recipient | Why | Where |
|---|---|---|
| OpenAI (and/or Anthropic) | LLM inference | sub-processors.md lists the live set |
| Hetzner (DE) | hosting (prod) | docs/compliance/sub-processors.md |
| Mac Studio (NL) | staging | tenant does not reach staging |

Tenants that configure a `CompanyAIKey` with their own OpenAI /
Anthropic key change the recipient relationship — their key reaches
their LLM provider directly under their own contract, not Inclufy's.

### 1.6 Transfers outside the EEA
LLM traffic reaches OpenAI (US) under SCCs (2021/914) + Inclufy's DPA.
A tenant that cannot accept the SCC-based transfer must configure a
`CompanyAIKey` pointing at an EU-resident endpoint (Azure OpenAI
EU region, or Anthropic Bedrock EU) **or** keep `ai_context_enabled =
False` to suppress the context-including features.

---

## 2. Processing details

### 2.1 Where the data is stored
| Store | Content | At rest |
|---|---|---|
| Postgres (Hetzner) | `extracted_text` of each AIContext row | **Fernet-encrypted** (symmetric, key in `FIELD_ENCRYPTION_KEY`, scope = ProjeXtPal production env). See `backend/core/secret_field.py`. |
| Postgres (Hetzner) | `source_files` metadata (name/size/pages/enabled) | plaintext JSONB (not sensitive on its own) |
| Postgres (Hetzner) | `AIContextAccessLog` rows | plaintext (metadata only; no document body) |
| LLM provider | prompt-time copy of up to 8 000 chars per call | out of our custody once sent; see `sub-processors.md` |

### 2.2 Retention
| Dataset | Retention | Mechanism |
|---|---|---|
| `extracted_text` | kept until the Project / Program / Portfolio is deleted, or the tenant presses "Delete AI context" | GDPR erasure cascade via `on_delete=CASCADE` + explicit `DELETE …/ai-context/ {confirm: true}` |
| `AIContextAccessLog` | **365 days** by default | per-tenant `TenantAIFeatureFlags.audit_log_retention_days`; `0` = keep forever |
| LLM provider logs | per provider policy (see sub-processors.md) | out of our custody |

### 2.3 Access
- The uploaded document body is only ever read:
  - by the AI endpoints listed in §1.1 (always in the user's own tenant),
  - by the `/api/v1/ai-audit/log/` compliance endpoint (admins only; tenant-scoped).
- Each read writes an `AIContextAccessLog` row (who, which document, which surface, how many chars, when). This is the Art. 30 record of processing operations for AI-reads.

### 2.4 Rate limiting
Every AI endpoint that reads an AIContext row is behind a
`DEFAULT_THROTTLE_RATES["ai_context"] = "20/hour"` per-user bucket. A
stolen JWT cannot drain the LLM budget or exfiltrate the context at
scale.

### 2.5 Per-document opt-out
Each entry in `source_files` carries an `enabled: bool` flag. A user can
hide a single document from the AI without deleting it (useful when a
confidential annex must be kept on file but not sent to the LLM).

### 2.6 Feature-flag off-switch
`TenantAIFeatureFlags` (one row per `Company`, auto-created on company
creation) holds per-feature switches:
- `ai_context_enabled` — master kill for AIContext injection
- `ai_autodrafts_enabled`, `team_match_enabled`, `compliance_scan_enabled`, `dashboard_narratives_enabled`
- `audit_log_retention_days`

Flipping these in Django admin at `/django-admin/accounts/tenantaifeatureflags/` takes effect immediately for the next AI call.

---

## 3. Risk assessment

### 3.1 Confidentiality
| Risk | Mitigation |
|---|---|
| Database leak exposes customer tender text | **Fernet at-rest encryption** on `extracted_text`. Attacker needs both the DB dump and the Fernet key (stored outside the DB, in `FIELD_ENCRYPTION_KEY` env). |
| Cross-tenant read (bug) | Tenant check in every helper (`accessible_project_ids`, company-match for Program/Portfolio). Covered by `backend/tests/test_ai_context_helpers.py::TestTenantIsolation`. |
| LLM returns verbatim content from another tenant's documents | Technically impossible: each prompt includes only the caller's own tenant's `extracted_text`; the LLM has no cross-tenant retrieval. |
| LLM hallucinates and attributes a false fact to the tenant | Every AI response that read the context carries `source: "ai"` or `"fallback"` metadata. The tenant's domain SME is the authoritative reviewer; the UI treats AI output as a draft, not a decision. |

### 3.2 Integrity
| Risk | Mitigation |
|---|---|
| Un-logged read | Hard: `core.ai_context_helpers` writes `AIContextAccessLog` on **every** non-empty prefix. The helper's catch-all logger logs the exception if the write fails but still returns the context — so the audit never silently drops a row from the only logger that exists. |
| Backdated audit row | `created_at = auto_now_add`, read-only in Django admin, write-once from the helper (admin cannot add or change rows). |

### 3.3 Availability
| Risk | Mitigation |
|---|---|
| Audit DB fills up | 365-day default retention; a nightly janitor (post-MVP) purges per-tenant per `audit_log_retention_days`. |
| LLM provider outage | Deterministic fallback is wired into every AI surface (Sprint 2+). AI remains available in degraded mode without the context. |

---

## 4. Data-subject rights

### 4.1 Access (Art. 15)
A tenant admin can call `GET /api/v1/ai-audit/log/?user_id=<id>` to list every AI access on that user's data. In the UI, the user export (`accounts.gdpr`) already covers the primary data subject export.

### 4.2 Erasure (Art. 17)
- A **project / program / portfolio delete** cascades to its AIContext row (model-level `on_delete=CASCADE`).
- A **"Delete AI context"** button on each upload UI calls `DELETE /api/v1/<entity>/<id>/ai-context/` with body `{"confirm": true}`. This removes only the AI context, not the surrounding entity.
- The `AIContextAccessLog` rows that referenced the deleted context are **kept** so the proof of erasure survives — this is the GDPR-compliant choice (prove the deletion happened; the audit itself holds no document body).

### 4.3 Rectification + portability (Art. 16 + 20)
No special handling — AI context is a text extract the tenant produced from their own documents, which they still hold. Rectification happens by re-uploading; portability is covered by the master export endpoint.

### 4.4 Object / restrict (Art. 21 + 18)
Flip `ai_context_enabled = False` in `TenantAIFeatureFlags` or toggle a single document's `enabled` flag in the AIContextUpload UI.

---

## 5. Residual risk and sign-off

**Overall residual risk**: **low**. The combination of (a) tenant-scope checks, (b) at-rest encryption on the only secret-bearing column, (c) per-call audit, (d) per-user rate limit, and (e) feature-flag off-switch covers the GDPR 35(1) prerequisites for a non-high-risk processing.

A tenant that nevertheless classifies this as **high-risk** (e.g. because uploaded documents may include Art. 9 data despite guidance against it) must:
1. Keep `TenantAIFeatureFlags.ai_context_enabled = False`, **or**
2. Document their own balancing + mitigation and record it against this template.

**Tenant decision (fill in before enabling)**:
- Tenant: ______________________________________________
- DPO / privacy owner: __________________________________
- Date: ________________________________________________
- Decision: [ ] enable `ai_context_enabled`   [ ] keep disabled
- Signed-off by: _______________________________________

---

## 6. References

- GDPR Articles 5, 6, 9, 15, 17, 25, 30, 32, 35
- ISO 27001 Annex A: 8.11 (data masking), 8.24 (crypto), 8.28 (secure coding), 5.14 (information transfer)
- Inclufy master RoPA — `docs/compliance/ropa.md`
- Inclufy sub-processors — `docs/compliance/sub-processors.md`
- Inclufy breach-response procedure — `docs/compliance/breach-response-procedure.md`
- ProjeXtPal implementation refs:
  - Encryption field: `backend/core/secret_field.py`
  - Audit log model: `backend/ai_audit/models.py`
  - Audit endpoint: `backend/ai_audit/views.py`
  - Tenant flags: `backend/accounts/models.py::TenantAIFeatureFlags`
  - Context helper (reads + logs + flag check): `backend/core/ai_context_helpers.py`
  - DELETE endpoints: `backend/{projects,programs,governance}/ai_context_views.py`

Last updated: 2026-10-13 (Sprint 6).
