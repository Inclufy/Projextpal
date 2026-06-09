# Sub-processors — ProjeXtPal (Inclufy)

> **Status: DRAFT — verify each DPA link + transfer mechanism before publishing.** This list is derived from the services actually integrated in the codebase (`requirements.txt`, `core/settings.py`, deploy topology). Keep it current: notify customers ≥30 days before adding a new sub-processor that processes their personal data.

**Last updated:** 2026-06-09

A *sub-processor* is a third party we use to process personal data on behalf of our customers. Each operates under a Data Processing Agreement (DPA) with appropriate safeguards.

| # | Sub-processor | Purpose | Personal data | Location | Transfer safeguard | DPA |
|---|---|---|---|---|---|---|
| 1 | **Resend** | Transactional & notification email delivery | name, email, message content | USA | SCCs / DPF | resend.com/legal/dpa |
| 2 | **Stripe** | Payments & invoicing | billing details, email (no card data stored by us) | USA/EU | SCCs / DPF | stripe.com/legal/dpa |
| 3 | **Cloudflare** | CDN, WAF, DDoS protection, secure tunnel | IP address, request metadata | Global (EU edge) | SCCs / DPF | cloudflare.com/cloudflare-customer-dpa |
| 4 | **Sentry** | Error tracking & performance monitoring | IP, user id, diagnostic context (PII scrubbed) | USA/EU | SCCs / DPF | sentry.io/legal/dpa |
| 5 | **OpenAI** | AI features (summaries, suggestions, copilot) | content submitted to AI features | USA | SCCs; no-training on API data | openai.com/policies/data-processing-addendum |
| 6 | **Anthropic** | AI features (summaries, analysis) | content submitted to AI features | USA | SCCs; no-training on API data | anthropic.com/legal/commercial-terms (DPA) |
| 7 | **[Hosting / infrastructure]** | Application + database hosting | all categories in §2 of the privacy policy | **EU (Netherlands)** | N/A (within EEA) | [own infrastructure — Mac Studio, NL] |

## Notes
- We do **not** use third-party analytics that profile users for advertising.
- Push notifications (mobile) are delivered via **Expo Push** (exp.host) using anonymous device tokens — add as #8 if classed as a processor.
- Email is sent over Resend's SMTP/API; the `EMAIL_HOST` is configured per environment.
- Self-hosted Postgres + Redis run on EU infrastructure (no US database transfer).

## Change log
| Date | Change |
|---|---|
| 2026-06-09 | Initial list drafted from the codebase. |
