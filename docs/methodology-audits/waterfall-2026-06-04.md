# Waterfall Alignment Report — 2026-06-04

Scope: `backend/waterfall/{models,serializers,views,urls}.py`, `frontend/src/pages/waterfall/*.tsx`, `AppSidebar.tsx` (`case 'waterfall':` L574-618). Read-only. ✅ behavioural/operable · ⚠️ stored-not-enforced · ❌ absent.

## Fidelity by layer
| Layer | Score | Δ |
|---|---|---|
| Phases + gates | 35% | — |
| Baselines + change control | 30% | — |
| EVM + milestones | 25% | — |
| Execution / delivery (phase-walk) | 60% | — |
| **Overall** | **~38%** | — |

## Control violations (highest priority) — gate-blocking + baseline-immutability first

1. ❌ **Phase gate does NOT block.** `WaterfallPhaseViewSet.complete` (`views.py:222-231`) sets `status='completed'`, `progress=100` with **no sign-off check, no exit criteria, no test-pass gate**. `sign_off` (`views.py:233-241`) only stamps `signed_off_by`/`signed_off_at` — it is decoupled from progression. `start` (`views.py:199-220`) checks the prior phase is `completed` but **not `signed_off`**, so a phase can start over an unsigned predecessor. The UI (`WaterfallPhaseGate.tsx:55-57`) offers Start→Complete→Sign Off as independent buttons; "Sign Off" is a post-hoc cosmetic stamp. **Verdict: gate is advisory, not enforcing.** This is the #1 doctrine breach for Waterfall.

2. ❌ **Baselines are mutable, not change-controlled.** `WaterfallBaselineViewSet` (`views.py:859-864`) is a plain `ModelViewSet`; `urls.py:112` exposes `PUT/PATCH/DELETE`; UI (`WaterfallBaselines.tsx:28-29`) shows Edit + Delete on every baseline. Nothing makes an approved baseline immutable, nothing increments `version` on change, and no ChangeRequest approval re-baselines. `WaterfallChangeRequest.approve` (`views.py:663-672`) flips status to `approved` but **never touches scope/schedule/cost baselines** — the impact fields (`schedule_impact`, `budget_impact`, `scope_impact`) are free-text strings, not deltas applied to anything. **Verdict: baseline is a mutable note, change control is a status label.**

3. ❌ **EVM is dead code — not computed, not exposed.** `WaterfallBudget` carries `planned_value/earned_value/actual_cost` + correct `cpi/spi/cost_variance/schedule_variance` properties (`models.py:457-479`), and an `EarnedValueRecord` time-series model exists (`models.py:482-528`, migration `0003`). **But** `WaterfallBudgetSerializer` (`serializers.py:250-264`) omits all five EVM fields; `EarnedValueRecord` has **no serializer, no viewset, no URL**; and the frontend has **zero** CPI/SPI/PV/EV/AC references (grep clean across all 17 pages). PV/EV/AC are only ever hand-set in the demo seeder (`views.py:1167-1172`). **Verdict: EVM stored (and only via demo), never derived from real cost+schedule, never displayed.**

4. ⚠️ **Approved requirements are not baselined.** `approve` (`views.py:368-375`) sets `status='approved'` but the requirement stays freely PATCH/DELETE-able (`WaterfallRequirements.tsx:55-56`); no Change Request is required to alter an approved requirement.

5. ⚠️ **Deployment checklist does not gate go-live.** `toggle` (`views.py:698-710`) flips booleans; `is_required` exists but nothing blocks the Deployment phase `complete` on incomplete required items (`WaterfallDeployment.tsx:36` is a cosmetic strike-through). Defects/failed tests do not block deployment readiness.

6. ⚠️ **Frontend↔model field drift (silent data loss).** Baselines form posts `name/description/version/baseline_date` but the model/serializer require `baseline_type/data/approved_by/approval_date` (`WaterfallBaselines.tsx:28` vs `models.py:681-704`). Budget-item form posts `name/amount/status` but model has `category/description/planned_amount/actual_amount/phase` (`WaterfallBudget.tsx:34` vs `models.py:531-545`). These create rows that don't round-trip cleanly.

## Per-phase gate matrix (Direction A)
| Phase | Entry criteria | Exit/gate | Blocks next? | Verdict |
|---|---|---|---|---|
| Requirements | none enforced | `complete`, optional `sign_off` | only prior=`completed`, not signed | ⚠️ |
| Design | none | same | same | ⚠️ |
| Development | none | same | same | ⚠️ |
| Testing | none | `complete` w/o test-pass gate | failed tests don't block | ❌ |
| Deployment | none | checklist cosmetic | required items don't block | ❌ |
| Maintenance | none | open-ended | n/a | ⚠️ |

Sign-off exists as data (`signed_off_by/at`, `sign_off_required`) but is never a precondition for `start`/`complete` of the successor → entire column is non-blocking.

## Phase execution-walk matrix (Direction B)
| Phase | Open | Author | Assign | Execute+verify | Roll-up | Gate-handover | Blocked role |
|---|---|---|---|---|---|---|---|
| Requirements | ✅ | ✅ create+approve | n/a | n/a | ⚠️ no baseline lock | ⚠️ sign-off cosmetic | PM (no baseline) |
| Design | ✅ | ✅ docs, M2M→reqs (`models.py:153`) | ✅ author/reviewer | ✅ approve | ⚠️ | ⚠️ | — |
| Development | ✅ | ✅ tasks | ✅ assignee + phase (`views.py:424`) | ✅ complete | ⚠️ task→milestone/EVM roll-up absent | ⚠️ | — |
| Testing | ✅ | ✅ test cases | ✅ | ✅ **req→test traceability + pass/fail execute** (`WaterfallTesting.tsx:88-103`, deep-link to req) | ⚠️ stats exist (`views.py:487`) but don't gate | ❌ fail doesn't block deploy | tester (no fail-gate) |
| Deployment | ✅ | ✅ checklist | ✅ | ⚠️ toggle only | ❌ no required-complete gate | ❌ | release mgr |
| Maintenance | ✅ | ✅ items | ✅ | ✅ resolve | ⚠️ | n/a | — |

Strongest operability: **Testing** (genuine requirement→test traceability + executable pass/fail, `WaterfallTestCase.requirement` FK + `stats` action + clickable cross-navigation). CPM critical-path recompute on Gantt list (`views.py:556-609`) is real and behavioural — a bright spot.

## Feature proposals + redesign (ranked — both directions)

1. **Enforce the phase gate (redesign, weight×value highest).** Add `WaterfallPhase.complete` precondition: block unless (a) all `is_required` deliverables for the phase are `approved`, (b) for Testing all linked test cases `passed`, and (c) require `sign_off` of phase N before `start` of N+1. Add exit-criteria text + checklist per phase. Surface blockers in `WaterfallPhaseGate.tsx`. *Files: `views.py:199-241`, page L55-57.*

2. **Immutable, change-controlled baselines (redesign).** Make `WaterfallBaselineViewSet` create-only for approved baselines (override `update`/`destroy` → 405 when `is_current` & approved); on a ChangeRequest `approve`, snapshot a new baseline `version+1`, flip old `is_current=False`, and apply schedule/cost deltas. Fix the UI form to model fields. *Files: `views.py:663-672, 859-864`, `WaterfallBaselines.tsx`.*

3. **Real EVM endpoint + dashboard.** Add `EarnedValueRecordSerializer` + viewset + URL; derive PV/EV/AC from `WaterfallBudgetItem.planned_amount/actual_amount` × task/phase progress instead of hand-entry; expose `cpi/spi/cv/sv` on `WaterfallBudgetSerializer`; add an EVM card/trend to Budget + Overview and a sidebar "Earned Value" entry. *Files: `serializers.py:250-264`, `urls.py`, `WaterfallBudget.tsx`, `AppSidebar.tsx:583`.*

4. **Baseline approved requirements.** Add `requirement.baseline` action that locks edits (require a CR to modify a `baselined` requirement). *Files: `views.py:368-375`, `WaterfallRequirements.tsx`.*

5. **Deployment go-live gate.** Compute `all required complete` and block Deployment-phase `complete` / show a Go/No-Go banner. *Files: `views.py:222-231, 698-710`, `WaterfallDeployment.tsx`.*

6. **Fix frontend↔model field drift** in Baselines + Budget-item forms (low effort, prevents silent bad rows).

## Drift since baseline
Matches the spec's "known implemented state": all ~18 models + pages present, ~17 actions, richest after PRINCE2. New since spec baseline: `EarnedValueRecord` (migration 0003) added but un-wired; CPM critical-path now computed on Gantt list (genuine). No regressions detected. Headline verdicts unchanged from doctrine expectation: **gate non-blocking, baseline mutable, EVM not real** — the three Waterfall headlines all fail.
