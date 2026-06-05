# ProjeXtPal — Next-Wave Backlog (post sprint-yanmar-fit)

Date: 2026-06-05 · Baseline HEAD: `41dc2666` · Source: agile-methodology-aligner + pm-feature-validator (read-only audits, 2026-06-05).

Three epics, ordered by strategic pull. Epic 0 is the headline USP. Epic 1 is the cross-cutting AI layer that lifts all 14 modules. Epic 2 finishes the Agile flow system.

> ⚠️ Any story that adds a Django model needs a migration. Per CLAUDE.md §9, a **data-guardian backup is mandatory** before applying on Mac Studio, and migrations must **never** be run against production from the MacBook. Local dev uses `USE_SQLITE=1` only.

---

## EPIC 0 — "Inclufy Best Practice" methodology (the USP)

**Thesis:** Every competitor (Jira/Asana/Monday/MS Project) makes the customer pick a framework before they can start. Inclufy ships a *curated, opinionated* default — the best-of-breed of all the methods we already implement — so a team that doesn't know PRINCE2 from Scrum gets a sensible, governed project on day one. The existing Foundation pages already are this structure; we elevate them from "generic fallback" to a first-class, branded method.

**Reframe (important):** it must be *opinionated*, not "none." It is the curated best-of: a light business case + charter (PRINCE2), a flow board with WIP (Kanban/Agile), a simple cadence + retro (Scrum), milestone/EVM health (Waterfall), a real closure + lessons gate (PRINCE2). Position as the **recommended default** in the create-project flow.

| ID | Story | Acceptance | Effort | Key files |
|---|---|---|---|---|
| BP-1 | Register `inclufy` (best-practice) as a methodology value | backend methodology choices + `METHODOLOGY_CONFIG` include it with icon/label/description "Inclufy Best Practice" | S | `backend/projects/models.py` (methodology choices), `frontend/src/pages/ProjectsOverview.tsx:143` (METHODOLOGY_CONFIG) |
| BP-2 | Sidebar case for `inclufy` | `getMethodologyPhases` has an explicit `case 'inclufy'` returning the curated Foundation tab set (today it falls through to `default`) | S | `frontend/src/components/AppSidebar.tsx:321` |
| BP-3 | Route mapping is intentional | `methodologyOverviewPath` returns `/foundation/overview` for `inclufy` (already the default branch — add the explicit case + comment so it's not mistaken for the unknown fallback) | XS | `frontend/src/lib/methodologyRoutes.ts` |
| BP-4 | Curate the best-practice surface | Foundation overview shows the opinionated best-of widgets: light business case, flow board link, milestone/EVM health, closure+lessons gate — not the raw generic page | M | `frontend/src/pages/.../FoundationOverview` |
| BP-5 | Make it the AI-recommended default | the methodology recommender offers "Inclufy Best Practice" as the first/featured option for unsure users | S | `frontend/src/pages/ProjectsOverview.tsx` (aiRecommendation block ~609) |
| BP-6 | Branding + USP copy | name, badge, one-line value prop, marketing blurb for landing page | S | website-landingpage-curator follow-up |

---

## EPIC 1 — Intelligence Layer (cross-cutting AI; touches all 14 modules)

The three top-ranked features (W×V = 25 each) are horizontal — build once, every methodology benefits. Existing assets are reusable foundations: `bot/Chat` + `ChatMessage`, `AIMitigation`, `integrations/Webhook`, and the `original_ai_response` field (hints at prior form-detection).

| ID | Story | Acceptance | Effort | Reuse / key files |
|---|---|---|---|---|
| IL-1 | **AI Risk Copilot** — predictive risk scoring | `RiskForecast` model: model-driven probability/impact + risk-velocity + exposure trend off RAID + schedule slip; surfaced on each method's risk tab | L | `backend/projects/models.py` Risk:600, AIMitigation:670 |
| IL-2 | **NLP auto-status synthesis** | `GeneratedStatusReport`: LLM rolls up tasks/burndown/EVM/blockers into an exec narrative + RAG health, on a schedule; today StatusReport is 100% manual | L | `backend/communication/models.py` StatusReport:6, reuse `original_ai_response` |
| IL-3 | **Automation rule engine (RPA)** | `AutomationRule`: trigger → condition → action (gate-transition, notify, field-update, webhook); only static webhooks exist today | L | extend `backend/integrations/models.py` Webhook:107 |

Build order: IL-3 (engine — unblocks notifications for everything) → IL-2 (status synthesis — biggest time-saver) → IL-1 (predictive risk — highest ceiling, most model work).

---

## EPIC 2 — Agile flow-system completion

#41 succeeded (Agile is a real flow system, 9 passing behavioural tests). Remaining gaps are on the governance + ship ends. Ranked by the aligner.

| ID | Story | Acceptance | Effort | Key files |
|---|---|---|---|---|
| AG-1 | Iteration→Release roll-up + ship action | on iteration `complete`, prompt to attach to a release; show done items per release; closes "deliver frequently" | S (backend `add_iteration` exists) | `backend/agile/views.py:515,549`, `frontend/src/pages/agile/AgileReleasePlanning.tsx:28` |
| AG-2 | **WIP definition bug** | the `current_wip` metric counts `in_progress + review` but the WIP *gate* counts only `in_progress` → users see "2/1 over limit" yet can still pull. Align both. | XS (correctness) | `backend/agile/views.py:366` vs `:760` |
| AG-3 | Stakeholder increment-feedback artifact | lightweight per-iteration review capturing stakeholder feedback on shipped work (fills "business+devs daily") | M | `backend/agile/` (new model + page) |
| AG-4 | Retro action-item closure tracking | surface open `AgileRetroItem` actions across iterations (carry-forward view) | S | `backend/agile/models.py:328`, new page |
| AG-5 | Pull-into-iteration on the Iteration Board | inline "pull from backlog" picker so users don't leave the board | S | `frontend/src/pages/agile/AgileIterationBoard.tsx:64` |

**Already shipped this session (not in backlog):** `AgileDailyProgress` empty-body `.json()` crash — fixed at `frontend/src/pages/agile/AgileDailyProgress.tsx:35`.

---

## Suggested sprint cut

- **Quick-win sprint (1–2 days):** AG-2 (bug), AG-1, AG-5, BP-1/BP-2/BP-3 (register the method + wire nav). Ships the USP shell + closes the Agile loop. No new models → no migration gate.
- **Then:** Epic 1 IL-3 (automation engine) as the first real model-adding work — triggers the data-guardian backup gate.
