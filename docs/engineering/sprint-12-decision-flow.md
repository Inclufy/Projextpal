# Sprint 12 — Decision-request flow

**Status:** delivered 2026-10-14 across two PRs:

- ProjeXtPal: `Inclufy/Projextpal#121` (branch `feat/sprint-12-decision-flow`)
- Control Tower: `Inclufy/inclufy-control-tower#203` (branch `feat/sprint-12-decision-flow`)

Both land as **draft** PRs. Deployment order and env requirements below.

## Why this exists

Before Sprint 12 the auto-fix pipeline (`sonar-fix-worker` → `issue-fix-pr`
ladder) had a silent failure mode: when the AI could not one-shot an
issue (common for architectural choices like "ai-plan 64s latency —
should we stream, run async, or accept the latency?") the worker marked
the issue "✓ klaar — geen wijziging" and the ticket sat there with no
next action. The human knew *something* was wrong; nobody told the human
*what to decide*.

The decision-request flow fixes this: when the ladder decides it can't
one-shot an issue, it opens a **decision round** with 2–5 concrete,
multiple-choice questions. The reporter answers (in-app form **or** by
replying to the email) and the pipeline continues with the answers in
prompt context.

## End-to-end flow

```
┌────────────────────────────────────────────────────────────────────┐
│  Control Tower (sonar-fix-worker → issue-fix-pr)                   │
│  1. ladder returns !changed with "vereist beslissing" marker       │
│       └── calls product-issue-decision-worker.mjs --issue <id>     │
│  2. decision-worker runs LLM ladder → produces ≤4 questions        │
│       └── POST PP /needs-decision/   (worker JWT auth)             │
└────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│  ProjeXtPal backend                                                │
│  3. ProductIssue.status → needs-decision                           │
│     decision_questions = [...]                                     │
│     decision_history += {outcome: awaiting_answer, round_id, ...}  │
│  4. post_save signal fires _notify_reporter_needs_decision         │
│       └── Resend email → reporter + tenant admins                  │
└────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│  Reporter answers — one of:                                        │
│  (A) in-app Copilot Issues tab → DecisionAnswerForm                │
│          POST PP /answer-decision/ (reporter or tenant admin JWT)  │
│  (B) email reply with "q_id=value" lines                           │
│          Resend inbound → PP /webhooks/resend/inbound-decision/    │
│          (HMAC verified via RESEND_INBOUND_SIGNING_SECRET)         │
└────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│  ProjeXtPal backend                                                │
│  5. decision_answers = {q_id: value}                               │
│     ProductIssue.status → in-progress                              │
│     decision_history[last].outcome = awaiting_worker               │
│     audit comment on the thread                                    │
└────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│  Control Tower cron-refresh (every 15 min)                         │
│  6. scans PP for in-progress + decision_history outcome=           │
│     awaiting_worker                                                │
│  7. enqueues control_tower_triggers: action=issue-fix-pr,          │
│     target=projextpal|issue-<id>|<round_id> (dedup key)            │
└────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│  sonar-fix-worker (follow-up S12-08b)                              │
│  8. reads decision_answers from the PP issue payload                │
│     and injects them into the prompt before running the ladder     │
│     again. On success → PR opened + outcome=pr_opened.             │
└────────────────────────────────────────────────────────────────────┘
```

## Data model (ProductIssue, migration 0004)

| Field | Type | Semantics |
|---|---|---|
| `status = "needs-decision"` | choice | 10th status alongside `needs-info`. Non-terminal. |
| `decision_questions` | `JSONField(default=list)` | Open questions. `[{id, text, type, choices?, help?}]` |
| `decision_answers` | `JSONField(default=dict)` | Current round's answers. Cleared on new round. |
| `decision_history` | `JSONField(default=list)` | Append-only audit. Each row: `{round_id, questions, answers, requested_at, answered_at, answered_by, worker_run_id, outcome}` |
| `decision_last_requested_at` | `DateTimeField(null)` | For reminder throttling + time-to-answer. |

Backend hard-caps: **1–5 questions**, question-id regex `^[A-Za-z0-9_-]{1,32}$`, choice count 2–8 per question, help ≤1000 chars, text answers ≤4000 chars.

## Endpoints (PP)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/v1/product-issues/{id}/needs-decision/` | `IsAutoFixWorker` (superuser OR id in `PRODUCT_ISSUE_WORKER_USER_IDS` env, fail-closed) | Worker opens a round. Supersedes any open round. |
| POST | `/api/v1/product-issues/{id}/answer-decision/` | reporter OR tenant admin (`CanAnswerDecision`) | User answers. All open questions required. Moves issue to `in-progress`. |
| POST | `/api/v1/webhooks/resend/inbound-decision/` | HMAC-SHA256 via `RESEND_INBOUND_SIGNING_SECRET` (fail-closed) + sender-match | Email-reply parser. Partial replies leave a comment, don't commit. |

Sender-match uses the same recipient list `_notify_reporter_needs_decision` sent to in S12-04 — spoofed senders are rejected.

## Permission model

- **Workers** are explicit user IDs (env-pinned, not role-based) so rotation is a config change, not a DB migration. Each environment pins its own worker IDs.
- **Answers** are allowed from the issue's reporter, admins of the issue's company, or Inclufy ops (`is_superuser` / `role=superadmin`). The ViewSet queryset already enforces tenant isolation; the `CanAnswerDecision` check layers on reporter/admin.
- **Inbound email** has NO DRF auth — the HMAC signature *is* the auth. Fail-closed when `RESEND_INBOUND_SIGNING_SECRET` is unset so a misconfigured env never accepts unverified mail.

## Required env (to deploy)

### ProjeXtPal backend (`.env`)
```
PRODUCT_ISSUE_WORKER_USER_IDS=<comma-separated user ids>
RESEND_INBOUND_SIGNING_SECRET=<hex secret, Resend inbound config>
```

### Inclufy Control Tower (`.env.refresh`)
```
PROJEXTPAL_API_URL=https://api.projextpal.com/api/v1
PROJEXTPAL_SERVICE_TOKEN=<JWT for a user listed in PRODUCT_ISSUE_WORKER_USER_IDS>
GEMINI_API_KEY=<...>          # preferred model, free-tier covers normal volume
DEEPSEEK_API_KEY=<...>        # fallback
# optional
DECISION_WORKER_MAX_Q=4
DECISION_WORKER_DRY_RUN=
```

Resend inbound domain / MX config is a one-time infra step; S12-07 code is forward-compatible with it staying disabled (the endpoint just never fires).

## Rollout order

1. **Merge PP #121 first.** The schema is additive-with-default; no backfill. Deploy via the normal Hetzner path (see `CLAUDE.md §3`). Backend rejects worker POSTs until `PRODUCT_ISSUE_WORKER_USER_IDS` is set, so the endpoint is live but inert.
2. **Set env.** Mint a long-lived JWT for a dedicated worker user, pin the user ID in `PRODUCT_ISSUE_WORKER_USER_IDS`, add it to CT's `.env.refresh` as `PROJEXTPAL_SERVICE_TOKEN`.
3. **Merge CT #203.** The orchestrator block in `cron-refresh.mjs` is a no-op until PP env is wired and an issue has `outcome=awaiting_worker`.
4. **Smoke-test with one manual issue.** `node product-issue-decision-worker.mjs --issue <id> --dry-run` → verify LLM output. Flip to live post.
5. **(Follow-up S12-05b)** Add the one-line hook in `sonar-fix-worker.mjs` after the `!lad.changed` branch so the worker auto-triggers the decision flow on classes of failures that match a "vereist beslissing" fingerprint.
6. **(Follow-up S12-08b)** Teach `sonar-fix-worker` to read `decision_answers` from the issue payload and inject them into its prompt when it fires with the round-scoped target slug.

## Test coverage

### PP backend (pytest)
- `tests/test_decision_flow_model.py` — field defaults, status choice, history round-trip
- `tests/test_decision_flow_endpoints.py` — worker auth matrix, reporter/admin auth, outsider rejected, terminal 409, missing/wrong-choice 400, round supersession
- `tests/test_decision_flow_email.py` — Resend trigger branches: send/skip-no-questions/skip-no-recipients/html-renders-choices + unrelated resolved transition unaffected
- `tests/test_decision_flow_inbound.py` — parser unit tests (subject id, quoted-tail strip, separator variants, case insensitivity, unknown id ignored, leftover captured) + HMAC verification + webhook end-to-end (full / partial / unverified / spoofed sender / resolved issue)

### CT scripts (node --test)
- `web/scripts/lib/decision-questions.test.mjs` — 12 tests on the LLM-output sanitizer (fence stripping, type/id validation, choice dedupe case-insensitive, max-Q cap, text/choice coupling)

Frontend typecheck runs on CI (no `node_modules` in the worktree where the branch was built).
