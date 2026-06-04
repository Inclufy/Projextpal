# Hybrid Programme Alignment Report — 2026-06-04

Scope: `backend/hybrid_programme/` (models/serializers/views/urls), `frontend/src/pages/Program*.tsx`, `frontend/src/components/AppSidebar.tsx` program case. Read-only audit. Tridirectional (A governance fidelity, B execution-walk, C gaps+redesign).

## Fidelity by layer
| Layer | Score | Δ |
|---|---|---|
| Config / tailoring (capture) | 55% | baseline |
| Config binding (drives behaviour) | 0% | baseline |
| Mixed governance (gate vs cadence enforced) | 0% | baseline |
| Execution / delivery (programme-walk) | 5% | baseline |
| **Overall** | **~13%** | baseline |

## Config-enforcement verdict (headline) — does HybridGovernanceConfig drive behaviour?
**❌ NO. The configuration is fully decorative.** `HybridGovernanceConfig` (`backend/hybrid_programme/models.py:6-25`) stores `primary_framework`, `secondary_frameworks`, `governance_structure` as plain JSON/char fields, but **no code path outside the module ever reads them**. A repo-wide grep for `hybrid_governance_configs`, `hybrid_adaptations`, `.primary_framework`, `.secondary_frameworks`, `.governance_structure` across `backend/` (excluding migrations and the module itself) returns **zero hits** — no consumer in `programs/`, `program_management/`, or `governance/`.

The serializer is bare `fields = '__all__'` (`serializers.py:5-16`); the viewsets are plain `ModelViewSet`s with **0 `@action`s** (`views.py:22-78`) doing only multi-tenant scoping + a `programme_id` URL kwarg bind. Nothing authorizes a constituent project, switches a gate vs cadence, or rolls anything up.

Frontend confirms it: **no React file references `governance-configs` or `hybrid-programme`** at all. `ProgramGovernance.tsx:13-20` reads a *different* endpoint (`/programs/{id}/governance/`), unrelated to this module. The sidebar hardcodes `programMethodology = 'hybrid'` (`AppSidebar.tsx:966`) and selects phases from a static `switch` (`getProgramPhases`, `AppSidebar.tsx:48-285`) — it never reads `Program.methodology` nor any config. So the chosen governance model changes **nothing** in the UI either.

Result: you can POST a config blending MSP+SAFe+PMI (exactly what `tests/test_strategy.py:10-20` asserts returns 201) and the programme behaves identically to having no config. Storage-only ⚠️ at best, behaviourally ❌.

## Config-enforcement matrix (Direction A)
| Element | Status | Evidence |
|---|---|---|
| Governance configuration captured | ⚠️ stored | `models.py:6-25`; CRUD via `views.py:22-48` |
| Config binding (changes authorization/reporting) | ❌ absent | no reader of config fields anywhere (`grep` empty) |
| Adaptation log alters a flow | ❌ absent | `HybridAdaptation` (`models.py:28-65`) is a flat note-log; `trigger`/`response` enums never consumed; `methodology_adjustment` is free text |
| Mixed governance (predictive gates + adaptive cadence reconciled) | ❌ absent | no gate or cadence construct exists in module |
| Constituent-project authorization under config | ❌ absent | no link from config to constituent `Project` lifecycle |
| Heterogeneous roll-up to one programme view | ❌ absent | no aggregation; `ProgramGovernance.tsx` pulls a sibling endpoint, not constituents |
| Programme board / benefits tied to config | ❌ absent | board is static placeholder in `ProgramGovernance.tsx:99-144`, no config link |

## Programme execution-walk matrix (Direction B)
Walked two contrasting configs (predictive-gated vs adaptive-cadence).
| Constituent | Configure | Authorize (gate/cadence) | Oversee | Adapt | Roll-up | Blocked role |
|---|---|---|---|---|---|---|
| Predictive constituent | ⚠️ POST config only (`views.py:40-48`) | ❌ no gate applied | ❌ reporting identical regardless of config | ❌ adaptation = note only | ❌ no aggregation | Programme Mgr |
| Adaptive constituent | ⚠️ POST config only | ❌ no cadence/DoD applied | ❌ identical | ❌ note only | ❌ none | Programme Mgr |

**Operability ≈ 5%** — only raw CRUD of two records works; no end-to-end programme governance runs. The two configs are indistinguishable at runtime. Both rows blocked for **Programme Manager**.

## Feature proposals + redesign (ranked — both directions)
1. **[FLAGSHIP redesign] Make `HybridGovernanceConfig` a real strategy that mounts authorization.** Add `governance_mode` per constituent (`gate` | `cadence` | `blend`) and a `ConstituentAuthorization` model (`hybrid_programme_constituent_authorization`, FK → `programs.Program` + FK → `projects.Project`) whose `@action authorize` branches on the active config: predictive constituents require a passed `stage_gate`; adaptive constituents require a met `cadence_checkpoint`/DoD. This is the structural top-priority gap (config-not-enforced). *weight×value×low-effort = highest.*
2. **Roll-up endpoint** — `@action(detail=True) rollup` on the config viewset that aggregates constituent status into one programme view, reconciling gate-based and cadence-based progress; wire a new `ProgramHybridGovernance.tsx` tab (currently nonexistent in frontend) to consume `hybrid-programme/programs/{id}/governance-configs/`. High value, medium effort.
3. **Make `HybridAdaptation` change a flow** — on create, `response` (`increase_control`/`increase_agility`/`rebalance`) should mutate the active config's `governance_mode` (e.g. flip a constituent gate↔cadence) and emit an audit entry, rather than logging free text (`models.py:53` `methodology_adjustment`). Medium value, low effort.
4. **Programme board tied to config** — bind the static board in `ProgramGovernance.tsx:99-144` to a config-driven board model so authorization decisions are attributable. Medium value, medium effort.
5. **Sidebar reads real methodology + config** — replace the hardcoded `programMethodology = 'hybrid'` (`AppSidebar.tsx:966`) with `Program.methodology` and surface config-derived gate/cadence tabs. Low effort, improves honesty of the UI.

*Scaffold not run (no `--scaffold`/approval). Any new model carries the CLAUDE.md §9 data-guardian backup requirement before migration; live customer data (zanjabil@inclufy.com) in production volume.*

## Drift since baseline
No drift from the spec's known baseline. Confirmed: **2 models** (`HybridGovernanceConfig`, `HybridAdaptation`), **0 `@action`s**, config decorative. Additions since baseline are cosmetic only: multi-tenant scoping + `program_id`/`programme_id` kwarg-compat in `views.py` (`28-78`) and a redirect-compat URL alias (`urls.py:21-22`) — neither adds behaviour binding. Migrations: `0001_initial`, `0002_fix_programme_fk` (FK target fix, not a binding). Frontend `hybrid/` pages are the **project-level** hybrid mirror, not programme-level — programme has no dedicated UI.
