# Compliance — ProjeXtPal (Inclufy)

GDPR/AVG + ISO 27001 working documents. These cover the **documentation layer** of compliance — the engineering controls (data export/erasure UI, 2FA, encryption, opt-out, throttling, audit basics) are implemented in the product (see the audit report).

## Documents
| File | Standard | Status | Owner action needed |
|---|---|---|---|
| [COMPLIANCE_AUDIT_2026-06-09.md](./COMPLIANCE_AUDIT_2026-06-09.md) | GDPR + ISO 27001 | ✅ evidence-based audit | review |
| [privacy-policy.md](./privacy-policy.md) | GDPR Art. 13/14 | 🟡 draft | fill `[…]` (KvK, address, DPO), legal review, **publish on inclufy.com** |
| [sub-processors.md](./sub-processors.md) | GDPR Art. 28 | 🟡 draft | verify DPA links, publish a public page |
| [ropa.md](./ropa.md) | GDPR Art. 30 | 🟡 draft | DPO review, keep current |
| [breach-response-procedure.md](./breach-response-procedure.md) | GDPR Art. 33/34 | 🟡 draft | assign names/roles, run a tabletop test |

## What's still engineering (from the audit, tracked in the next-wave backlog)
- C-5 Unified immutable audit log for all sensitive writes (custom-fields/bulk-edit/import/role-change).
- C-6 CI security gates: `npm audit` + `pip-audit`.
- C-7 Backup verification: confirm cron paths, off-site copy, scheduled restore test.

## GDPR vs ISO 27001 (one line)
GDPR is a **law** you *comply with* (don't get fined); ISO 27001 is a **standard** you get *certified* against by an external auditor. These docs satisfy GDPR's documentation duties and form the starting evidence set an ISO 27001 ISMS also requires.

> ⚠️ These are **drafts prepared from the product's actual processing**, not legal advice. Have a privacy lawyer review before relying on them externally.

_Last updated: 2026-06-09_
