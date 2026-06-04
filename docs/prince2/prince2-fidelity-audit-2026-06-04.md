# PRINCE2 Alignment Report — 2026-06-04

Read-only fidelity audit of ProjeXtPal's in-app PRINCE2 implementation (branch `sprint-yanmar-fit`).
Scope: in-app methodology enforcement only. Academy course content OUT OF SCOPE.
Behavioural bar for ✅: the rule is applied in a flow (a gate blocks / a breach escalates / a doc is mandatory), not merely a nullable column.

## Fidelity by layer

| Layer | Score | Δ vs baseline (2026-06-04 known-state) |
|---|---|---|
| Principles            | 86% (6/7 enforced, 1 partial) | + Manage by Exception now enforced (was ⚠️) |
| Themes / Practices    | 89% (6 ✅, 1 ⚠️) | + Risk/Issue/Quality registers + Approaches landed |
| Processes (flow)      | 79% (4 ✅, 3 ⚠️) | + IP/SB/CS gates wired; CP still weak |
| Management products   | 81% (21/26 present, ~3 ⚠️) | + Exception Report/Plan, Daily Log, Quality Register, Product Status, Approaches |
| **Overall**           | **~84%** | Materially compliant; not yet "all PRINCE2" |

## Principles — behavioural verdict

| # | Principle | Verdict | Evidence |
|---|---|---|---|
| 1 | Continued business justification | ✅ enforced | PID baseline blocked without approved Business Case + Brief — `views.py:168-189`; test `tests_enforcement.py:89-105` |
| 2 | Learn from experience | ⚠️ partial | Lessons Log capturable + by-category (`views.py:736-754`); Daily Log from SU (`models.py:854`). BUT no prior-project lessons surfaced at start, and no dedicated **Lessons Report** product at closure. |
| 3 | Defined roles & responsibilities | ✅ enforced | Project Board + 7 roles incl. Executive/Senior User/Senior Supplier/Change Authority assignable to real users — `models.py:277-293`; add_member `views.py:597-604` |
| 4 | Manage by stages | ✅ enforced | Stage `start()` blocked until prior stage completed AND its gate approved — `views.py:207-234`; test `tests_enforcement.py:63-86` |
| 5 | Manage by exception | ✅ enforced | Tolerance breach (False→True) auto-raises Exception Report via signal — `signals.py:27-53`; auto cost-breach detection `views.py:797-867`; Board→Exception Plan→re-baseline loop `views.py:442-468`, `557-575`; test `tests_enforcement.py:40-60` |
| 6 | Focus on products | ✅ enforced | Product Descriptions w/ quality criteria/method/responsibility `models.py:591-622`; Quality Register links checks to products `models.py:811-851`; Product Status Account aggregates status+checks `views.py:1258-1300`; product-based Gantt (Stage→WP→Milestone→Task) `views.py:878+` |
| 7 | Tailor to suit the project | ⚠️ partial | `PID.tailoring` field exists `models.py:136` but nothing scales behaviour off it; demo seeds full method only. Stored, not enforced. |

**Principle violation (highest priority):** none are fully absent. The weakest is **Principle 2 (Learn from experience)** — no prior-lessons ingestion at SU and no Lessons Report at CP, so the loop is open at both ends.

## Themes / Practices

| Theme (6th) / Practice (7th) | Verdict | Evidence |
|---|---|---|
| Business Case | ✅ | BC + benefits + BC-risks, approve action, gates PID `models.py:49-115`, `views.py:104-127` |
| Organization / Organizing | ✅ | Board + roles `models.py:266-293` |
| Quality | ✅ | Quality Register w/ result lifecycle + Product Descriptions `models.py:811-851` |
| Plans | ✅ | Project/Stage/Team plans, dependencies (`WorkPackage.depends_on` `models.py:251`), multi-level Gantt |
| Risk | ✅ | `Prince2Risk` owner/response_type/status lifecycle `models.py:625-680` |
| Change / Issues | ⚠️ | `Prince2Issue` (RFC/off-spec/problem-concern) + Change Control Approach exist `models.py:683-727`. BUT **no Change Authority gate** on RFC approval and **no Configuration Item Records** — change control is recorded, not controlled. |
| Progress | ✅ | Tolerances, Highlight, Checkpoint, End Stage (via Stage Gate), Exception, Daily Log all present and flow-wired |

## Per-process flow matrix

| Process | Trigger | State transitions | Reports/products | Verdict |
|---|---|---|---|---|
| SU | Project created | Brief draft→approved drives `current_process` `views.py:931` | Brief, outline BC, Daily Log | ✅ |
| IP | Brief approved | PID baseline gated on BC+Brief `views.py:168-189` | PID, 4 Approaches, Project Plan | ✅ |
| DP | Board exists | Gate approve/reject `views.py:304-321`; Exception→Board decision `views.py:442-468` | Authorisations, Exception decisions | ✅ |
| CS | Stage active | WP authorize/start/complete `views.py:352-382`; risks/issues captured | Highlight, Risk/Issue reg | ⚠️ WP `authorize()` sets status with **no Board/stage gate check** `views.py:352-357` |
| MP | WP authorized | WP start/complete + Checkpoint Reports `views.py:691` | Checkpoint, Quality checks | ⚠️ No Team-Manager "accept WP" handshake; no dependency/`depends_on` enforcement on start |
| SB | Stage near end | Stage gate approve gates next stage `views.py:207-234`; Exception Plan re-baselines | Stage Plan, Gate, Product Status | ✅ |
| CP | All stages complete | `current_process='CP'` `views.py:935`; End Report approve `views.py:723-729` | End Project Report, Benefits Review | ⚠️ Closure **not gated** on product acceptance / Lessons Report / benefits handover; approve is a free status flip |

## Feature proposals (ranked)

| # | Gap | Theme/Practice | Doctrine cite | Proposed model/flow | Plugs into | Weight | Effort |
|---|---|---|---|---|---|---|---|
| 1 | Controlled project closure | Progress / CP | CP — confirm acceptance | Gate `EndProjectReport.approve` on all Products `approved` + Lessons Report present + benefits handover | Closure Checklist + Product Status | mandatory | S |
| 2 | Lessons Report + prior-lessons ingestion | Learn from experience | Principle 2 | `Prince2LessonsReport` (compiled at CP) + surface prior-project lessons in SU dashboard widget | Lessons Log + Dashboard | mandatory | M |
| 3 | Change Authority gate on RFCs | Change / Issues | Change theme | RFC (`issue_type=request_for_change`) requires Change Authority approval action before status→resolved | Issues page + Board roles | mandatory | M |
| 4 | Configuration Item Records | Change / Issues | §A.5 CIR | `Prince2ConfigItem` (item, version, status, owner, copy holder) linked to Product | Products + Product Status | recommended | M |
| 5 | WP authorize gate + MP accept handshake | Progress / MP | CS→MP | Block `WorkPackage.authorize()` unless owning stage active; add Team-Manager `accept()` transition; honour `depends_on` on `start()` | Work Packages | recommended | S |
| 6 | Benefits Management Approach as first-class product | Business Case | §A.1 | `ManagementApproach` 5th type or dedicated model + realisation tracking post-closure | Business Case + Benefits Review | recommended | S |
| 7 | Tailoring that scales behaviour | Tailor | Principle 7 | Project-level `tailoring_profile` (simple/full) that hides/relaxes gates | PID + all gates | recommended | L |

## Management products coverage (26 catalog)

Present & flow-wired (21): Project Brief, Project Product Description (via Product), Business Case, PID, Project Plan, Stage Plan, Team Plan, Exception Plan, Product Description, Change/Comms/Quality/Risk Approaches (via `ManagementApproach`), Daily Log, Lessons Log, Issue Register, Risk Register, Quality Register, Checkpoint, Highlight, End Stage (via Stage Gate), End Project Report, Exception Report, Product Status Account.

Missing / weak (5): **Benefits Management Approach** (folded into BC, not first-class), **Configuration Item Records** (absent), **Lessons Report** (Lessons Log only, no compiled report), **Issue Report** (register exists, no per-issue report product), dedicated **Project Product Description** (subsumed by generic Product).

## Drift since baseline
- + `Prince2ExceptionReport` (`models.py:891`) + auto-raise signal (`signals.py`)
- + `ExceptionPlan` + Board request/approve loop (`models.py:730`, `views.py:442/557`)
- + `QualityRegisterEntry` (`models.py:811`), `ManagementApproach` (`models.py:769`), `DailyLog` (`models.py:854`)
- + `ProductStatusAccountView` (`views.py:1258`)
- + Cost-tolerance auto-breach detector (`views.py:797`)
- + Behavioural enforcement test suite (`tests_enforcement.py`) covering 3 doctrine gates
- + `WorkPackage.depends_on` M2M (`models.py:251`); per-stage/WP planned dates

## Verdict

**Not yet fully compliant with "all PRINCE2 methodology" (~84%), but materially compliant and genuinely behavioural** — 6 of 7 principles are enforced by real gates with passing tests, and the high-weight Manage-by-Exception and Manage-by-Stages loops are wired end to end. The remaining gaps are concentrated in **Closing a Project** (closure is an ungated status flip), **change control** (no Change Authority gate, no Configuration Item Records), and **the learn-from-experience loop** (no prior-lessons ingestion, no Lessons Report). Closing proposals #1–#3 would lift it to substantive full-method compliance.
