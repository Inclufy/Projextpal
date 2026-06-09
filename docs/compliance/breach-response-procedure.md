# Data Breach Response Procedure — ProjeXtPal (Inclufy)

> **GDPR Art. 33 & 34.** DRAFT — assign the real names/roles and test this procedure (a tabletop exercise) before relying on it. A personal-data breach must be reported to the supervisory authority **within 72 hours** of becoming aware, where feasible.

**Owner:** [Security lead / CTO] · **Escalation:** security@inclufy.com · **Last updated:** 2026-06-09

---

## 0. What counts as a personal-data breach
Any breach of security leading to the accidental or unlawful **destruction, loss, alteration, unauthorized disclosure of, or access to** personal data. Examples: leaked credentials, a cross-tenant data leak, a lost/stolen device with access, a sub-processor incident, ransomware, a misconfigured database.

## 1. Roles
| Role | Responsibility | Who |
|---|---|---|
| **Incident Lead** | owns the response, decides severity, coordinates | [name] |
| **Technical Responder** | contains, investigates, fixes | [name / on-call] |
| **Privacy/DPO** | assesses notification duty, drafts notices | [name] |
| **Comms** | customer + authority communication | [name] |

## 2. The 72-hour clock — phases

### Phase 1 — Detect & report (0–1h)
- Anyone who suspects a breach reports immediately to **security@inclufy.com** (and the Incident Lead).
- Sources: Sentry alerts, monitoring, a customer report, a sub-processor notice, the in-product issue reporter.
- Incident Lead opens an incident record (time, what, who detected).

### Phase 2 — Contain (1–6h)
- Stop the bleeding: rotate compromised credentials/keys, revoke sessions/tokens, block the vector (Cloudflare WAF rule), isolate affected systems.
- **Do not** destroy evidence — snapshot logs first.
- Take a verified backup before any destructive remediation (data-guardian rule).

### Phase 3 — Assess (6–48h)
- Scope: what data, how many data subjects, which tenants, sensitivity.
- Risk to individuals: low / medium / high (likelihood × severity).
- Decide notification duties:
  - **Authority (Art. 33):** notify the Dutch DPA (Autoriteit Persoonsgegevens) within **72h** unless the breach is *unlikely to result in a risk* to individuals. Use the AP online breach form (datalekken.autoriteitpersoonsgegevens.nl).
  - **Affected individuals (Art. 34):** notify *without undue delay* if there is a **high risk** to them.
  - **Affected customer controllers:** if Inclufy is the *processor*, notify the customer controller **without undue delay** so they can meet their own duties.

### Phase 4 — Notify (within 72h of awareness)
- **To the AP**, include (even if partial): nature of the breach, categories & approximate number of subjects & records, DPO contact, likely consequences, measures taken/proposed. Supplement later if facts are still emerging.
- **To individuals** (if high risk): plain-language description, DPO contact, likely consequences, what they should do, what we've done.

### Phase 5 — Recover & learn (post-incident)
- Restore service from verified backups; confirm integrity.
- **Post-incident review** within 1 week: root cause, timeline, what worked, action items (assigned + dated).
- Update controls, this procedure, and the audit log.

## 3. Record-keeping (Art. 33(5))
Maintain an **internal breach register** of *all* breaches (even those not notified), with facts, effects, and remedial action. Template:

| Date detected | Description | Data & subjects affected | Risk | Notified AP? | Notified individuals? | Remediation | Owner |
|---|---|---|---|---|---|---|---|
| | | | | | | | |

## 4. Contacts
- Internal: security@inclufy.com · Incident Lead [phone]
- Supervisory authority: **Autoriteit Persoonsgegevens** — autoriteitpersoonsgegevens.nl, breach form: datalekken.autoriteitpersoonsgegevens.nl
- Sub-processor security contacts: see [sub-processors.md](./sub-processors.md).

## 5. Test
Run a **tabletop exercise** at least annually (simulate a cross-tenant leak) and record the outcome here.
