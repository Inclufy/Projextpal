# Data Protection Impact Assessment (DPIA) — ProjeXtPal × Yanmar Europe

**Version:** 1.0 — pre-contract draft
**Date:** 2026-05
**Controller:** Yanmar Europe B.V. (YEU)
**Processor:** Inclufy B.V. (operator of ProjeXtPal)
**Sub-processor scope:** see §6
**Lawful basis (Art. 6 GDPR):** legitimate interest (project execution) + contractual necessity (employment-related project tasks).

---

## 1. Processing overview

| # | Processing activity | Personal data categories | Data subjects | Storage location |
|---|---|---|---|---|
| 1 | Project task assignment + RACI | Name, work e-mail, role, team membership | YEU employees + contractors | Postgres (EU AWS) |
| 2 | Time tracking (optional) | Name, e-mail, hourly rate, hours logged | YEU employees | Postgres |
| 3 | Risk & action ownership | Name, e-mail, free-text notes | YEU employees + suppliers | Postgres |
| 4 | Meeting Minutes generation | Transcript text, attendee names, role, contact info | Meeting participants | Anthropic API + Postgres |
| 5 | Audit log of changes | User id, IP, timestamp, action diff | All authenticated users | Postgres + structured logs |
| 6 | Authentication | E-mail, hashed password, optional MFA TOTP | YEU users with accounts | Postgres |

Categories of data — **no** special categories under Art. 9 are processed.
Categories of data subjects — **no** children, no criminal-conviction data.

---

## 2. Data minimisation by design

- **Field-level RBAC**: cost/rate fields are visible only to project roles with finance permission. PMs see headcount, not salaries.
- **Membership-based access**: a user can only see projects they are a member of (cross-tenant isolation enforced at the queryset layer in Django + DB-level row filters).
- **AI input scoping**: LLM calls (Meeting Minutes, risk mitigation) send only the active project context — never the full org tree.
- **No third-party analytics**: no Google Analytics, no Hotjar, no Segment. Optional in-app product analytics are opt-in per company.

---

## 3. Retention

| Data | Retention rule | Trigger |
|---|---|---|
| Active project records | Lifetime of project + 7 years (financial records minimum) | Project closure |
| Time entries | 7 years | Year-end |
| Audit log | 2 years (rolled) | Calendar quarter |
| Auth tokens (JWT/refresh) | 15 min / 30 days | Issue |
| Deleted-user soft-delete | Anonymised after 90 days; hard-deleted after 1 year | User deletion request |
| LLM-prompt transcripts | **Not stored** by default — only the structured JSON outputs are persisted. Raw transcripts are dropped after the API response. | Per request |

Yanmar can request shorter retention per data category via contract addendum.

---

## 4. Data subject rights (Art. 12–22)

| Right | Mechanism | SLA |
|---|---|---|
| Access | Self-service profile + DSAR endpoint `/api/v1/me/data-export/` (JSON) | 14 days |
| Rectification | Self-service profile + admin tooling | Immediate |
| Erasure | Per request to YEU DPO → propagated via admin tooling; soft-delete with audit | 30 days |
| Restriction | "Pause" flag on user; visible in admin | 7 days |
| Portability | DSAR export = JSON download | 14 days |
| Objection | Honored via account closure | 14 days |
| Automated decision-making | None — AI suggestions (risk mitigation, minutes) are never auto-applied without human review | n/a |

---

## 5. Security measures (Art. 32)

### 5.1 Technical
- **Encryption in transit**: TLS 1.3 (Cloudflare → origin), HSTS enforced.
- **Encryption at rest**: AWS RDS (Postgres) encrypted with customer-managed KMS key (option B in §1 of AWS topology doc). EBS volumes encrypted with same key.
- **Secrets**: env vars sourced from AWS Secrets Manager; no plaintext secrets in repo.
- **API keys (BYO LLM)**: stored in DB column `CompanyAIKey.openai_api_key` / `.anthropic_api_key`. Plain CharField in the schema, protected by DB encryption-at-rest and tightly-scoped IAM access. Encryption-at-application-level (Fernet) is on the roadmap (Q3 2026) — Yanmar can require it as contract clause.
- **Auth**: JWT short-lived (15 min) + refresh-token rotation. TOTP MFA available; can be enforced per company (`Company.require_2fa=True`).
- **RBAC**: every queryset is company-scoped via `CompanyScopedQuerysetMixin`. Cross-tenant data leak protection regression-tested via `data-leak-hunter` agent.
- **Audit log**: every write to Project/Task/Risk + every sign-off + every API-key access is logged (user, IP, before/after).

### 5.2 Organisational
- **Personnel**: only Inclufy engineering on call (3 ppl as of 2026-05) has prod access. Background checks completed.
- **Access reviews**: quarterly review of staff with prod read access.
- **Sub-processor changes**: 30-day notice + opt-out per Art. 28(2).
- **Breach notification**: Inclufy notifies Yanmar DPO within 24h of awareness. CSIRT runbook attached as appendix B.

### 5.3 Operational (Pillar 10 of Production Readiness)
- Automated nightly Postgres backups (Mac Studio dev) → off-site iCloud Drive; production = AWS RDS automated backups + cross-region snapshot.
- UptimeRobot HTTPS check on `/health/`; PagerDuty escalation.
- Sentry for application error tracking; sourcemaps uploaded.
- Per-user AI throttle (5 req/min) to prevent prompt-injection-driven DoS.

---

## 6. Sub-processors (Art. 28)

| Provider | Purpose | Location | Encryption | DPA in place |
|---|---|---|---|---|
| AWS (eu-central-1) | Hosting | Frankfurt | KMS-CMK | Yes (Mutual NDA + DPA) |
| Anthropic API | LLM for Meeting Minutes, AI risk mitigation | US (option for EU endpoint Q4 2026) | TLS in transit | Yes |
| OpenAI API (optional) | Alternative LLM provider | US / EU | TLS | Yes |
| Cloudflare | DDoS + WAF | EU edge | TLS | Yes |
| Sentry (sentry.io) | Error tracking | EU | TLS + at-rest | Yes |
| Stripe | Billing (Inclufy invoicing only — not customer data) | EU | PCI-DSS | Yes |

**BYO key option**: Yanmar can route LLM traffic via their own Anthropic/OpenAI account → Inclufy never sees the prompt content for those calls. This is the recommended path. See `aws-topology-yanmar.md` §3.

---

## 7. Risk assessment

| Risk | Likelihood | Impact | Mitigation | Residual |
|---|---|---|---|---|
| Cross-tenant data leak via misconfigured queryset | Low | High | `CompanyScopedQuerysetMixin` enforced on all viewsets; CI test `data-leak-hunter`; quarterly RBAC review | Very low |
| LLM provider sees confidential project content | Medium (without BYO key) | Medium | BYO LLM key (Yanmar own account); prompts contain project context only, not full org tree | Low |
| API key leak in admin UI | Low | Medium | Keys rendered as masked password fields; admin access restricted to ≤ 3 staff | Low |
| Stolen JWT replay | Low | Medium | 15-min TTL; refresh rotation; IP/UA fingerprint on refresh | Low |
| GDPR-relevant breach not detected | Low | High | Sentry + structured-log alerting; PagerDuty 24/7 escalation | Low |

Overall residual risk: **Low**. Recommended controls in place.

---

## 8. Approvals

- Yanmar DPO sign-off: _____________ Date: _____________
- Inclufy DPO sign-off: _____________ Date: _____________

---

*Appendices: A. RoPA (Record of Processing Activities) — separate file. B. CSIRT runbook — separate file. C. Sub-processor DPA list — see contract annex.*
