# Record of Processing Activities (RoPA) — ProjeXtPal (Inclufy)

> **GDPR Art. 30.** DRAFT — review with your DPO/legal. This is the internal register of how ProjeXtPal processes personal data. Keep it updated when processing changes.

**Controller:** Inclufy [legal entity] · **Contact:** privacy@inclufy.com · **DPO:** [name / contact] · **Last updated:** 2026-06-09

For data belonging to customer workspaces, Inclufy acts as **processor**; the customer is the controller. The activities below describe Inclufy's own controller-role processing (its direct users) and its processor-role processing (customer data), as applicable.

---

## Processing activity 1 — User account & authentication
- **Purpose:** create and secure user accounts; sign-in; 2FA.
- **Categories of data subjects:** registered users (admins, project members, freelancers).
- **Categories of personal data:** name, email, hashed password, profile image, company, role, language/theme, login timestamps, 2FA/TOTP secret, session/refresh & device push tokens.
- **Lawful basis:** contract (6(1)(b)); security = legitimate interest/legal obligation.
- **Recipients / sub-processors:** Resend (verification/reset email), Cloudflare, Sentry, hosting (EU).
- **Transfers:** US sub-processors under SCCs/DPF.
- **Retention:** life of account; anonymized on closure, hard-deleted after 30 days.
- **Security measures:** TLS/HSTS, password hashing, 2FA, Fernet encryption of secrets, RBAC, rate limiting, audit logging.

## Processing activity 2 — Project & collaboration content
- **Purpose:** deliver the project-management service (tasks, comments, @mentions, messages, time tracking, files, custom fields).
- **Data subjects:** users and people referenced in project content.
- **Personal data:** names, emails, free-text content, uploaded files, activity/audit metadata.
- **Lawful basis:** contract (6(1)(b)); Inclufy processes on the customer's instruction (processor role).
- **Recipients:** hosting (EU); AI providers (OpenAI/Anthropic) only when AI features are used.
- **Retention:** for the life of the workspace; deleted/exported on customer request.
- **Security:** tenant isolation (queryset scoping), RBAC, encryption in transit.

## Processing activity 3 — Notifications (email + push)
- **Purpose:** notify users of assignments, mentions, messages, approvals, deadlines, status.
- **Data subjects:** users.
- **Personal data:** name, email, device push token, notification content.
- **Lawful basis:** contract / legitimate interest; **opt-out** per channel & category (Settings → Preferences). Essential transactional mail exempt.
- **Recipients:** Resend (email), Expo Push (push).
- **Retention:** notifications retained [window]; preferences retained for account life.

## Processing activity 4 — Billing & invoicing
- **Purpose:** subscriptions, payments, invoices.
- **Data subjects:** billing contacts / account owners.
- **Personal data:** company billing details, email, invoice records (no card numbers stored).
- **Lawful basis:** contract + legal obligation (tax retention).
- **Recipients / sub-processors:** Stripe.
- **Retention:** financial records 7 years (NL law).

## Processing activity 5 — Product analytics, error tracking & security
- **Purpose:** reliability, debugging, abuse prevention.
- **Data subjects:** users / visitors.
- **Personal data:** IP, user id, browser/device, error context (PII scrubbed before sending to Sentry).
- **Lawful basis:** legitimate interest (6(1)(f)).
- **Recipients:** Sentry, Cloudflare.
- **Retention:** [logs window, e.g. 90 days].

## Processing activity 6 — Support & GDPR requests
- **Purpose:** handle support and data-subject-rights requests (access, export, erasure).
- **Lawful basis:** legal obligation (6(1)(c)) + contract.
- **Retention:** request records [window]; export/erasure executed within one month.

---

### Sub-processor register
See **[sub-processors.md](./sub-processors.md)**.

### Review cadence
Review this RoPA at least **annually** and whenever a new processing activity or sub-processor is added.
