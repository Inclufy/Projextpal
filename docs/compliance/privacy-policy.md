# Privacy Policy — ProjeXtPal (Inclufy)

> **Status: DRAFT — requires legal review before publication.** Replace every `[…]` placeholder with your real company details. This is a working draft prepared from the actual data-processing in the product; it is not legal advice.

**Last updated:** 2026-06-09 · **Version:** 1.0-draft

---

## 1. Who we are (the controller)

ProjeXtPal is a project-management SaaS operated by **Inclufy**.

- **Controller:** Inclufy [legal entity name B.V.]
- **Address:** [WTC Almere, …]
- **KvK (Chamber of Commerce):** [number]
- **Contact / privacy questions:** privacy@inclufy.com
- **Data Protection Officer (DPO) / privacy contact:** [name / "not appointed — privacy@inclufy.com is the contact point"]

For users invited into a customer's workspace, **that customer is the controller** of their project data and Inclufy acts as **processor** on their behalf (see our Data Processing Agreement, DPA).

## 2. What personal data we process

| Category | Examples | Source |
|---|---|---|
| Account data | name, email address, password (hashed), profile image, company, role, language/theme preference | you, at registration / your admin |
| Authentication | login timestamps, 2FA/TOTP secrets, session/refresh tokens, device push tokens | you, on use |
| Project content | tasks, comments, @mentions, messages, time entries, files you upload | you and your team |
| Billing data | company billing details, invoices (payment is handled by Stripe — we do **not** store card numbers) | you / Stripe |
| Usage & technical | IP address, browser/device, error diagnostics | automatically, on use |
| Communications | support messages, notification preferences | you |

We practise **data minimization** — we only collect what the service needs.

## 3. Why we process it (purposes & lawful basis)

| Purpose | Lawful basis (GDPR Art. 6) |
|---|---|
| Provide the service (accounts, projects, collaboration) | Performance of a contract (6(1)(b)) |
| Security, fraud prevention, 2FA, audit logging | Legitimate interest / legal obligation (6(1)(f)/(c)) |
| Transactional email (verify, reset, invitations, deadline digests) | Contract / legitimate interest (6(1)(b)/(f)) |
| Billing & invoicing | Contract + legal obligation (6(1)(b)/(c)) |
| Product analytics & error tracking | Legitimate interest (6(1)(f)) |
| Optional marketing / non-essential notifications | Consent (6(1)(a)) — opt-out any time in Settings → Preferences |

## 4. AI features

Some features use third-party AI models (OpenAI, Anthropic) to generate summaries, status reports and suggestions. Content you send to these features may be processed by those providers **as our sub-processors** under their data-processing terms. We do not use your content to train third-party models, and the providers are contractually barred from doing so on API traffic.

## 5. Who we share data with (sub-processors)

We use vetted sub-processors under GDPR-compliant data-processing agreements. The current list (provider, purpose, location, DPA) is maintained in **[sub-processors.md](./sub-processors.md)** and on our public sub-processor page. Summary: Resend (email), Stripe (billing), Cloudflare (edge/security), Sentry (error tracking), OpenAI & Anthropic (AI features), plus our own hosting infrastructure in the EU.

We do **not** sell personal data.

## 6. International transfers

Where a sub-processor processes data outside the EEA (e.g. OpenAI, Anthropic, Stripe in the US), transfers are covered by **EU Standard Contractual Clauses (SCCs)** and/or the EU–US Data Privacy Framework. Details per provider in the sub-processor list.

## 7. How long we keep it (retention)

- **Account & project data:** for the life of the account, then deleted/anonymized after account closure (see §8).
- **Deleted accounts:** PII is anonymized immediately and hard-deleted after a **30-day grace period**.
- **Invoices/financial records:** retained as required by law (NL: 7 years).
- **Logs & diagnostics:** [retention window, e.g. 90 days].

## 8. Your rights (GDPR Art. 15–22)

You can exercise these in-product (**Settings → Security → Privacy & your data**) or by emailing privacy@inclufy.com:

- **Access / portability (Art. 15/20)** — download a complete JSON export of your data.
- **Erasure (Art. 17)** — delete your account (anonymized immediately, hard-deleted after 30 days).
- **Rectification (Art. 16)** — edit your profile.
- **Object / restrict (Art. 18/21)** — opt out of non-essential notifications per channel and category.
- **Right to lodge a complaint** — with the Dutch DPA (Autoriteit Persoonsgegevens, autoriteitpersoonsgegevens.nl).

We respond within **one month**.

## 9. Security

We protect your data with 2FA, encryption in transit (TLS/HSTS) and at rest for secrets, role-based access control, tenant isolation, rate limiting, audit logging and monitored error tracking. See our security overview / ISO 27001 readiness for detail.

## 10. Cookies

ProjeXtPal uses strictly-necessary storage (authentication tokens in browser localStorage) to keep you signed in. We [do / do not] use non-essential analytics or marketing cookies. [If any: a consent banner is shown and you can decline.]

## 11. Changes

We may update this policy; material changes are notified by email and/or in-app. The "Last updated" date reflects the current version.

## 12. Contact

privacy@inclufy.com · Inclufy, [address].
