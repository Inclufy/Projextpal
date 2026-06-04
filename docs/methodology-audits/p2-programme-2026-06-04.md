# PRINCE2 Programme Alignment Report — 2026-06-04

Module: `backend/p2_programme/` + `frontend/src/pages/Program*.tsx` + `AppSidebar.tsx` (`prince2_programme` case).
Scope: PRINCE2 projects governed under an MSP-style programme shell. **Read-only audit.** Both directions run.
**Headline verdict:** The Blueprint drives **nothing** (free-text POTI fields, no enforcement) and **no programme board authorizes** constituent projects. The module is a 2-model CRUD island with **0 enforced actions** and **0 frontend consumers** — it is effectively unwired.

## Fidelity by layer
| Layer | Score | Δ |
|---|---|---|
| Blueprint (POTI operating model) | 15% | new baseline |
| Board + authorization | 0% | new baseline |
| Benefits + dossier/tranches | 0% (in this module) | new baseline |
| Execution / delivery (programme-project-walk) | 5% | new baseline |
| **Overall** | **~8%** | |

## Construct violations (highest priority)
1. ❌ **No programme board / authorization flow.** `P2ProgrammeProject.status` has a `proposed→approved→active` choice list (`models.py:47-53`) but **no `@action`** transitions it and **no board entity** records a continue/stop decision. `views.py` has **0 `@action`s** (grep `@action` = 0). A "proposed" project can be PATCHed straight to "active" by any authenticated company user with no gate. This is the single biggest gap — authorization is the defining P2-Programme governance act.
2. ⚠️→❌ **Blueprint stores POTI but drives nothing.** `target_operating_model`, `capabilities`, `outcomes` are free-text/JSON fields (`models.py:22-24`) with no validation, no link to benefits, and no mechanism by which a project's outputs are checked against the Blueprint. `P2ProgrammeProject.blueprint` FK is `null=True` (`models.py:65`) — projects need not reference a Blueprint at all. Stored-not-enforced.
3. ❌ **Tenant-scope bug in access check.** `_verify_programme_access` (`views.py:15-19`) verifies ownership against **`projects.models.Project`** (`from projects.models import Project`, `views.py:5,18`) while the FK target is **`programs.Program`** (`models.py:17,56`; migration `0002_fix_programme_fk.py:19,28`). A `program_id` is validated as if it were a Project PK. Where Project and Program PK spaces collide this mis-authorizes; otherwise it spuriously 403s. The model FK was corrected in migration 0002 but the view was never updated to match — flag for the `governance`/data-leak-hunter owners.
4. ❌ **Module is orphaned from the UI.** The `prince2_programme` sidebar (`AppSidebar.tsx:194-236`) links only generic routes (`/programs/${programId}/business-case`, `/projects`, `/tranches`, `/governance` "Programme Board", `/benefits`). **None** call `/api/v1/p2-programme/` (`core/urls.py:65`). Program pages consume the generic `programs` API (`ProgramBenefits.tsx`, `ProgramGovernance.tsx`). So `P2Blueprint`/`P2ProgrammeProject` are write-only-by-admin data with no reader. The visible "Programme Board" / "Benefits" features are served by the generic `programs` app, NOT this module.
5. ❌ **No mandate/brief, no dossier, no tranches, no benefits in-module.** Benefits exist only as generic `programs.ProgramBenefit` (`programs/models.py:164`), not tied to the Blueprint or to constituent-project outputs.

## Construct matrix (Direction A — management/governance)
| Construct | State | Evidence |
|---|---|---|
| Programme mandate / brief | ❌ absent | no model/field |
| Blueprint (POTI operating model) | ⚠️ stored, drives nothing | `models.py:22-24`; no enforcement |
| Programme board | ❌ absent | no entity; "Board" link → generic governance `AppSidebar.tsx:221` |
| Authorize constituent project | ❌ absent | 0 `@action`; free PATCH `views.py:72-80` |
| Constituent projects (PID/board, report up) | ⚠️ flat list | `P2ProgrammeProject` is a record; no PID, no report-up |
| Benefits (baseline/owner/measure, in-module) | ❌ absent | only generic `ProgramBenefit programs/models.py:164` |
| Dossier / tranches | ❌ absent | no model |
| Roll-up | ⚠️ count only | `project_count` serializer (`serializers.py:13-14`); no status/benefit roll-up |

## Programme-project execution-walk matrix (Direction B — operability)
| Project | Authorize | Oversee | Integrate | Transition | Roll-up | Blocked role |
|---|---|---|---|---|---|---|
| Any `P2ProgrammeProject` | ❌ no board decision, free status PATCH (`views.py:72-80`) | ⚠️ status field exists, no programme dashboard reads it | ❌ no Blueprint/benefit integration check | ❌ no benefit transition entity | ⚠️ count only, no status roll-up | Programme Mgr / SRO |

Operability ≈ **5%**: a constituent project cannot be *authorized* (no decision record), cannot be *integrated* toward the Blueprint, and its state does not *roll up* beyond a bare `project_count`. Every governance step a Programme Manager/SRO needs is missing.

## Feature proposals + redesign (ranked — both directions)
1. **[FLAGSHIP] Programme board + authorization gate** (weight↑ value↑ effort-med). New `P2ProgrammeBoardDecision` (FK `programs.Program`, FK `P2ProgrammeProject`, `decision` continue/stop/defer, `decided_by`, `decided_at`, `rationale`). Add `@action authorize` / `@action stop` on `P2ProgrammeProjectViewSet` that are the *only* paths to set `status=approved/active`; lock direct status PATCH. Screen: `/programs/:id/governance` "Authorize Project" action wired to the new endpoint. Closes violations 1 + 4(partial).
2. **Blueprint-as-operating-model enforcement** (weight↑ value↑ effort-med). Make `P2ProgrammeProject.blueprint` required on authorize; add `P2BlueprintCapability` sub-records with realizing-project links so outputs map to capabilities/outcomes; expose Blueprint POTI on a `/programs/:id/blueprint` page. Coordinate with `msp-methodology-aligner` (shared Blueprint concept — do NOT duplicate MSP's Blueprint model).
3. **Status + benefit roll-up view** (weight-med value↑ effort-low). `@action rollup` returning constituent-project status counts + benefit realization; render on `ProgramDashboard.tsx`. Reuse generic `programs.ProgramBenefit` rather than a parallel benefit model — coordinate ownership.
4. **Mandate/brief + tranche/dossier** (weight-med value-med effort-med). `P2ProgrammeMandate` + `P2Tranche` with end-of-tranche review gate. **Heavy MSP overlap** — recommend a single tranche/dossier implementation shared with MSP, surfaced per-methodology, not two parallel modules.
5. **Fix tenant-scope bug** (weight↑ value↑ effort-trivial). Repoint `_verify_programme_access` from `projects.Project` to `programs.Program` (`views.py:5,18`). Pre-req for any of the above; hand to data-leak-hunter.

## Drift since baseline
First audit of this module — establishes the baseline. Confirms the spec's strong prior exactly: 2 models (`P2Blueprint`, `P2ProgrammeProject`), **0 `@action`s**, Blueprint is free-text (not enforced), projects are a flat list with no authorization or roll-up. **Net-new findings beyond prior:** (a) the module has **zero frontend consumers** — the `prince2_programme` sidebar serves generic `programs` routes, so this module is an unwired data island; (b) a **tenant-scope bug** in `_verify_programme_access` (checks `Project`, not `Program`). Recommend coordinating the redesign (Blueprint, benefits, tranches) with `msp-methodology-aligner` to avoid building a second copy of MSP. No code written; `--scaffold` not run.
