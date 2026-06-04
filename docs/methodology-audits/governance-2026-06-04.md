# Governance Alignment Report — 2026-06-04

Scope: cross-cutting governance layer (`backend/governance/` + `frontend/src/pages/governance/*` + `ProgramGovernance.tsx` + `AppSidebar.tsx`). Tridirectional audit (A=governance fidelity, B=decision execution-walk, C=gaps+redesign). 6 models, **0 `@action`s** (`views.py` — verified `grep @action` = 0).

## Fidelity by layer
| Layer | Score | Δ |
|---|---|---|
| Portfolio | 35% | baseline |
| Board + decisions | 45% | baseline |
| Stakeholders + meetings | 55% | baseline |
| Execution / delivery (decision-walk) | 15% | baseline |

**Overall weighted fidelity ≈ 38%.**

## Construct violations (highest priority) — does a decision do anything downstream?

**❌ NO. A board Decision is an inert record. This is the headline failure.**
- `Decision` (`models.py:157-220`) has `status` (pending/approved/rejected), `impact`, `evidence` (free text), and FKs *up* to `program`/`board`/`meeting`/`risk` — but **zero FK or method that authorizes / holds / stops the linked component**. Approving a Decision does not change any Project/Program/Portfolio `status`. No `save()` override, no signal, no `@action`, no `outcome`/`directive` field (verified: `grep authoriz|downstream|def save|outcome` = none in `models.py`). A "rejected" Decision on a programme leaves that programme `active`. **Governance is theatre.**
- **❌ Meetings produce no tracked actions.** `Meeting` (`models.py:223-275`) has `agenda` + `minutes` as free text only. There is **no MeetingAction model** — no owner, no due date, no closure state. `Decisions.tsx` empty-state even advertises "auditable trail" (`Decisions.tsx:405`) but the trail has no consequence.
- **⚠️ Decision log is recorded, not binding.** `decided_by` defaults to requester (`views.py:339-345`); there is no quorum check, no vote tally, no immutability/append-only guarantee — a decision is freely editable/deletable (`Decisions.tsx:228-290`).
- **⚠️ Portfolio does not prioritize or fund.** `Portfolio` has a single `budget_allocated` decimal (`models.py:24`) with no allocation-to-component, no priority/rank, no capacity. `PortfolioDetail.tsx` lists child programs/projects but cannot rank or fund them.
- **⚠️ No board quorum / voting.** `BoardMember` (`models.py:72-95`) stores role + `is_active` but no voting rights, and no quorum rule is enforced anywhere when a decision is recorded.

## Construct matrix (Direction A)
| Construct | State | Evidence | Verdict |
|---|---|---|---|
| Portfolio | Groups components; single budget field; no prioritization/funding/capacity | `models.py:6-34`; `PortfolioDetail.tsx:124-176` | ⚠️ stored, not strategic |
| Governance board | Standing board, members, chair, type, parent FK; **no quorum** | `models.py:37-69`; `BoardDetail.tsx` | ⚠️ |
| Board member | People + roles (chair/member/secretary/observer); **no voting rights** | `models.py:72-95`; `BoardDetail.tsx:210-224` | ⚠️ |
| Stakeholder | Power/Interest matrix **present** (`stakeholder_quadrant` property + 4-quadrant UI); **no engagement-plan lifecycle/tracking** | `models.py:144-154`; `Stakeholders.tsx:132-160` | ✅ matrix / ⚠️ engagement |
| Decision | Record with status/impact/evidence + parent FKs; **authorizes nothing**, freely mutable, no quorum/vote | `models.py:157-220`; `Decisions.tsx` | ❌ |
| Meeting | Agenda + minutes text, attendees, status; **no action items, no owners/due dates** | `models.py:223-275`; `ProgramGovernance.tsx:146-186` | ❌ |
| Downstream effect | **Absent** — no decision→component state change exists | (none) | ❌ |

## Decision execution-walk matrix (Direction B)
| Decision | Convene | Raise | Decide | Flow downstream | Track actions | Blocked role |
|---|---|---|---|---|---|---|
| Authorize a programme at a gate | ⚠️ Meeting can be created (`MeetingViewSet`) but no agenda-item/quorum model | ⚠️ raised only as a free-text Decision title; no gate/item construct | ⚠️ status set to `approved`, editable, no quorum/vote | ❌ **programme status unchanged — no link** | ❌ no action lifecycle | Board / PMO |
| Hold/stop a project on risk | ⚠️ | ⚠️ `risk` FK links the Decision to a Risk (`models.py:194-197`) | ⚠️ records `rejected` | ❌ **project keeps running; risk unchanged** | ❌ | Board |
| Steering committee minutes → follow-ups | ⚠️ meeting + minutes text | ❌ no agenda items | n/a | n/a | ❌ **minutes are dead text; no owned/dated actions** | Secretary / PMO |

**Operability ≈ 15%.** Convene/raise/decide are weakly supported as record-stores; **Flow downstream and Track actions are entirely absent** — the two steps that make governance real.

## Feature proposals + redesign (ranked — both directions)

1. **🚩 REDESIGN — Decision → component authorization (weight × value × low-effort = top).** Add to `Decision`: `target_content_type`/`target_object_id` (generic FK) **or** explicit nullable `authorized_project`/`authorized_program`/`authorized_portfolio` FKs, plus `outcome` (`authorize`/`continue`/`hold`/`stop`) and `applied_at`. On a transition to `approved`, a `@action def apply` (or `save()`/signal) sets the target component's `status` (`active`/`on_hold`/`closed`) and writes an immutable audit row. *This is the single change that converts the module from theatre to governance.* (Direction B Flow.)

2. **MeetingAction model + lifecycle.** New `MeetingAction(meeting FK, description, owner FK, due_date, status[open/in_progress/done/cancelled], closed_at)`, `related_name='governance_*'`, `Meta.ordering`. Surface as a tracked-actions panel on `BoardDetail.tsx`/`ProgramGovernance.tsx` with overdue badges. Closes the Direction-B "Track actions" ❌. (high value, low effort)

3. **Binding decision log + quorum/vote.** `DecisionVote(decision, member, vote)`, a `quorum` int on `GovernanceBoard`, and make a recorded Decision append-only (block edits once `approved`). Enforce quorum before `apply`. (medium effort)

4. **Portfolio prioritization + funding.** Add `priority`/`rank` and a `ComponentFunding(portfolio, program/project, amount, fiscal_period)` join so `PortfolioDetail.tsx` can rank + allocate budget against capacity, not just display a lump sum. (medium)

5. **Stakeholder engagement tracking.** Promote `communication_plan` text to engagement records (planned vs. last-engaged dates, RAG) so the existing power/interest matrix drives action. (low)

> ⚠️ Proposals 1–4 add models requiring `makemigrations governance` → carry the **data-guardian backup gate (CLAUDE.md §9)** before any migration. Live tenant `zanjabil@inclufy.com` + Yanmar seed data present. No `--scaffold` performed (read-only run).

## Drift since baseline
Matches the spec's strong prior closely, with two positive deltas: (a) the **stakeholder power/interest matrix is implemented** (`stakeholder_quadrant` + 4-quadrant UI) — better than "no matrix"; (b) Decision gained richer **parent linkage** (`board`/`meeting`/`risk` FKs, migrations 0005/0007) and cross-tenant `get_queryset` P0 fixes. But the core verdict is unchanged and confirmed: **Decisions authorize nothing downstream and Meetings track no actions.** 6 models, still 0 enforced actions.
