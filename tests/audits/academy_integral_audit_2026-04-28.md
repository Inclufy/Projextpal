# Academy Integral Learning-Journey Audit
**Date:** 2026-04-28
**Scope:** 12 production courses — full chain: lesson → quiz → exam → practice → simulation → certificate
**Auditor:** Academy Content Validator (Claude Sonnet 4.6)
**Prior audit referenced:** `/tmp/yanmar_deck/course_alignment_audit.md` (quiz-only pass)

---

## 0. Source of Truth Versions Used

| Methodology | Source |
|---|---|
| Scrum | Scrum Guide 2020 (Schwaber & Sutherland) |
| PRINCE2 | AXELOS PRINCE2 6th Edition (published 2017, minor update 2023) |
| SAFe | Scaled Agile Inc., SAFe 6.0 |
| Lean Six Sigma | ASQ LSSGB Body of Knowledge (2022) |
| Agile | Agile Manifesto 2001 + 12 Principles |
| PM Fundamentals / Program Mgmt | PMBOK 7 (PMI 2021) |
| Kanban | David J. Anderson — Kanban (2010); Essential Kanban Condensed |
| Leadership | General best-practice (Bennis, Hersey-Blanchard, Lencioni) |
| MS Project | Microsoft Project documentation (2021–2024) |
| AI Literacy | No single certification standard; EU AI Act (2024) referenced |

---

## 1. Per-Course Severity Matrix

Severity legend: CLEAN / MINOR / MAJOR / BROKEN

| Course | LESSON | QUIZ | EXAM | PRACTICE | SIMULATION | Cert reachable today? |
|---|---|---|---|---|---|---|
| **ai-literacy** | CLEAN | CLEAN | CLEAN | MINOR | BROKEN | PARTIALLY — practice stub |
| **pm-fundamentals** | CLEAN | CLEAN | CLEAN | MINOR | BROKEN | PARTIALLY — generic assignment |
| **prince2-foundation** | MINOR | CLEAN | MINOR | BROKEN | BROKEN | NO — no practice, exam text-only |
| **scrum-master** | MINOR | CLEAN | MINOR | BROKEN | BROKEN | NO — no practice, exam text-only |
| **safe-scaling-agile** | MAJOR | CLEAN | BROKEN | BROKEN | BROKEN | NO — 13 of 14 video lessons have no transcript; no exam |
| **lean-six-sigma** | MINOR | MINOR | MINOR | BROKEN | BROKEN | NO — each DMAIC phase = 1 lesson only; no practice |
| **agile-fundamentals** | CLEAN | CLEAN | MINOR | BROKEN | BROKEN | NO — no practice; exam text-only |
| **kanban-practitioner** | CLEAN | CLEAN | MINOR | BROKEN | BROKEN | NO — no practice; exam text-only |
| **waterfall-pm** | CLEAN | CLEAN | MINOR | BROKEN | BROKEN | NO — no practice; exam text-only |
| **program-management-pro** | MAJOR | CLEAN | BROKEN | BROKEN | BROKEN | NO — 11 of 16 video lessons are stubs; no exam |
| **leadership-pm** | CLEAN | CLEAN | BROKEN | BROKEN | BROKEN | NO — no exam before certificate; no practice |
| **ms-project-masterclass** | CLEAN | CLEAN | BROKEN | BROKEN | BROKEN | NO — "Quiz: Final" used as exam substitute; no practice |

**Note on stakeholder-management:** listed in brief but not in `coursesWithContent` in `index.ts`; `courseModules` is `// TODO - Add modules`. It is NOT a production course in the current build. Excluded from this audit.

---

## 2. Dimensional Findings Detail

### Dimension 1: Lesson Coherence

**ai-literacy** (4 modules, 16 lessons, 1574 lines)
- Progression is sound: Foundations → PM Use Cases → Governance/EU AI Act → Exam. Logic is clear.
- All 3 video lessons in Module 1 have full transcripts (>100 lines each). Module 2–3 content equally substantive.
- `ail-l7` (Practice: Draft a Risk Register) has `transcript: ''` and only a one-sentence `content` field. This is a stub that a learner hits mid-course with no guidance on how to structure the exercise.

**pm-fundamentals** (5 modules, 26 lessons, 3576 lines)
- Best-developed course. Modules cover initiation, project charter, planning, execution, monitoring/closure. Logical progression.
- Assignment `pm-l10` is well-structured with SMART criteria, rubric, scenario. However it is a generic WMS project charter that could appear in any PM course — not methodology-specific enough for a learner targeting PMP.
- All 26 lessons appear to have substantive transcripts.

**prince2-foundation** (4 modules, 20 lessons, 2373 lines)
- Excellent structural alignment: Module 1 = Intro + Principles, Module 2 = 7 Themes, Module 3 = 7 Processes, Module 4 = Tailoring + Exam.
- DOCTRINAL ISSUE: The course states "Vandaag: PRINCE2 6th Edition (2023)". There is no 2023 edition of PRINCE2. The 6th Edition was published in 2017. AXELOS released minor guidance updates post-2017 but the edition number did not change. This will confuse learners cross-referencing the manual.
- Risk, Change and Progress themes are collapsed into a single lesson (`p2-l9`). The official PRINCE2 manual treats Risk, Change, and Progress as three separate themes. This is architecturally acceptable for a Foundation course, but should be noted.
- All video lessons have substantive transcripts.

**scrum-master** (3 modules, 13 lessons, 1597 lines)
- Covers 3-5-3-5 Scrum Guide structure adequately: pillars/values → roles → events → artifacts.
- DOCTRINAL ISSUE (minor): lesson `scrum-l2` transcript line 199 reads: "verantwoordelijk voor het maximaliseren van de waarde van het product en het werk van het **Development Team**." The Scrum Guide 2020 formally retired the term "Development Team" and replaced it with "Developers." This is stale terminology from the pre-2020 guide. All quiz questions correctly use "Developers," creating an internal inconsistency.
- Scrum Guide 2020 also added Product Goal and Sprint Goal as commitments for their respective artifacts — neither is explicitly discussed as a commitment in the artifacts lesson.

**safe-scaling-agile** (3 modules, 17 lessons, 856 lines)
- CRITICAL ISSUE: Only `safe-l1` (Why Scale Agile) has a full transcript (~300 lines). Lessons `safe-l2` through `safe-l4` (SAFe Framework Overview, SAFe Configurations, Core Values) and `safe-l6` through `safe-l14` (ART, PI Planning, System Demo, Inspect & Adapt, Release on Demand, LPM, Value Streams, Large Solution SAFe, Metrics) all have `keyTakeaways: []`, `keyTakeawaysEN: []`, `resources: []`, and NO transcript field. This is 13 of 14 video lessons with no content.
- The quiz file has an inline comment: `// TODO: lesson transcripts in this module are stubs — questions are SAFe-canonical and ready for transcript expansion`. This acknowledges the gap.
- SAFe PI stated as "every 10 weeks" — technically correct as the most common cadence but SAFe 6.0 specifies 8–12 weeks. Minor.

**lean-six-sigma** (5 modules, 10 lessons, 1429 lines)
- STRUCTURAL ISSUE: Modules 2–4 each contain exactly 1 video lesson (Measure, Analyze, Improve = one lesson each). For a Green Belt course aligned to the ASQ LSSGB BOK, each DMAIC phase typically requires coverage of multiple tools. The Measure phase alone in the ASQ BOK covers process capability, MSA, data collection plan, and statistical distributions. One lesson at 28 minutes cannot do this justice.
- Module 1 has both the intro and the Define phase in 2 lessons + quiz. Module 5 covers Control + project closure + exam/cert.
- DOE (Design of Experiments) is mentioned nowhere, despite being an ASQ Green Belt BOK requirement.
- Hypothesis testing is mentioned only in the exam overview text and the Analyze transcript briefly, but receives no dedicated lesson.
- Good use of SIPOC, Fishbone, Pareto, 5 Whys, and SPC — these are present and substantive.

**agile-fundamentals** (2 modules, 10 lessons, 1245 lines)
- Module 1: Manifesto → 12 Principles → Agile vs Traditional → Frameworks Overview → Quiz. Clean.
- Module 2: User Stories → Agile Estimation → Agile Transformation → Exam → Certificate. Reasonable.
- Missing: no explicit Agile Retrospective or Sprint Review walkthrough. The frameworks overview lesson mentions Scrum, Kanban, XP, SAFe but at introductory depth only.
- All transcripts are substantive.

**kanban-practitioner** (2 modules, 10 lessons, 1193 lines)
- Module 1: What is Kanban, Board Design, WIP Limits, Flow Metrics, Quiz. Good.
- Module 2: Kanban Cadences, Policies/SLEs, Continuous Improvement, Exam, Certificate.
- Kanban's 6 practices are covered across the lessons; the Kanban Cadences lesson should cover the six replenishment meetings (Replenishment, Daily Standup, Service Delivery Review, Operations Review, Risk Review, Strategy Review) from the Essential Kanban Condensed guide. Worth verifying depth.
- All transcripts are substantive.

**waterfall-pm** (2 modules, 10 lessons, 1428 lines)
- Phases covered: Intro, Requirements, Design, Development/Testing/Deployment, Quiz, then Gate Reviews, Change Control, Hybrid Agile+Waterfall, Quiz, Exam, Cert.
- The inclusion of a "Combining Waterfall and Agile" lesson is valuable context.
- No mention of the original Winston Royce attribution nuance beyond the intro — minor.
- All transcripts appear substantive.

**program-management-pro** (3 modules, 16 lessons, 1775 lines)
- CRITICAL ISSUE: Module 2 (Strategic Alignment) and Module 3 (Execution & Benefits) video lessons — `pgm-l6` through `pgm-l10` and `pgm-l11` through `pgm-l15` — all have `keyTakeaways: []`, `keyTakeawaysEN: []`, `resources: []` and NO transcript field. This is 10 of 14 video lessons being empty stubs.
- Only Module 1 is fully developed (5 lessons with rich ASCII diagrams and detailed transcripts).
- The final quiz (`pgm-l16` type: quiz) acts as the course-ending lesson with no preceding exam lesson.

**leadership-pm** (3 modules, 16 lessons, 7958 lines)
- The largest file by far (7958 lines). All video transcripts are substantive and extensive. Well-developed.
- Module 1: Manager vs Leader, Leadership Styles, EQ, Self-awareness Assessment, Quiz.
- Module 2: High-Performance Teams, Tuckman, Conflict Resolution, Delegation, Motivation, Quiz.
- Module 3: Effective Communication, Stakeholder Management, Negotiation, Presenting with Impact, Certificate.
- MISSING: No exam lesson before certificate. The learner goes directly from Presenting with Impact → Certificate. A course on leadership for PMs should have at least a final assessment.
- MISSING: Module 3 has no quiz before the certificate. Module 2 ends with a quiz, but Module 3 (Communication & Influence) with 4 substantive lessons has zero assessment.

**ms-project-masterclass** (3 modules, 18–19 lessons, 3330 lines)
- Module 1: Interface, First Project, Calendar, Task Basics, Quiz.
- Module 2: Dependencies, Critical Path, Resource Assignment/Leveling, Baseline/Tracking, Cost Management, Quiz.
- Module 3: Gantt Customization, Views/Filters, Dashboards, Exporting, Tips, Quiz (titled "Quiz: Final/Eindexamen"), Certificate.
- The final lesson is typed `quiz` not `exam`. There is no lesson with `type: 'exam'`. The quiz serves as the terminal assessment. This is a structural gap — the cert flow expects exam → cert.
- Transcripts are well-developed with detailed ASCII visual representations of the MS Project UI. Good practical depth.

---

### Dimension 2: Quiz ↔ Lesson Alignment (Post-Fix Check)

All courses fixed in the prior round now have populated inline quiz arrays. Confirmed zero `quiz: []` in any course file. Key alignment observations:

- **ai-literacy**: All 4 quiz sets align directly with lesson content. Q-set 2 asks about the 4-part prompt recipe (Rol, Context, Taak, Output-format) — this exact framework is taught in `ail-l5`. CLEAN.
- **pm-fundamentals**: 15 questions cover triple constraint, scope creep, methodologies, EVM (CPI/SV), gate reviews, Tuckman stages. All traceable to lesson content. CLEAN.
- **prince2**: 10 questions (2 quiz sets). Q `p2-q6`–`p2-q8` test process sequencing and documents — covered in Module 3. CLEAN.
- **scrum**: 10 questions. Sprint length (max 4 weeks), accountabilities, artifacts. All aligned. CLEAN.
- **safe**: 19 questions across 3 quizzes. SAFe 6.0 core values, ART, PI Planning, LPM. All covered in at least the quizzes (even though many video transcripts are stubs). Questions are doctrinally sound per SAFe 6.0.
- **lss**: 3 questions (Define phase only). Alignment OK but coverage is minimal — only 3 questions for a Green Belt course. MINOR.
- **agile**: 5 questions. Manifesto values, principles, INVEST criteria. Aligned. CLEAN.
- **kanban**: 5 questions. Little's Law, WIP limits, flow metrics. Aligned. CLEAN.
- **waterfall**: 15 questions across 2 quizzes. Gate reviews, change control, earned value. CLEAN.
- **leadership**: 20 questions across 2 quizzes. Leadership styles (Hersey-Blanchard), EQ, Tuckman, motivation theories (Herzberg, Maslow). CLEAN.
- **ms-project**: 22 questions across 3 quizzes. Interface, dependencies, resource leveling, baselines, dashboards. CLEAN.
- **program-management**: 13 questions. Program vs project, benefits realization, program lifecycle. CLEAN.

---

### Dimension 3: Exam Coverage

| Course | Exam type | Exam questions inline? | All modules represented? |
|---|---|---|---|
| ai-literacy | type: 'exam' (+ final quiz) | NO — text description only | Broadly yes |
| pm-fundamentals | type: 'exam' | NO — text description only | Yes |
| prince2 | type: 'exam' | NO — text description only | Yes |
| scrum | type: 'exam' | NO — text description only | Yes |
| safe | type: 'quiz' (final) | YES — 7 questions inline | Partial |
| lss | type: 'exam' | NO — text description only | Yes |
| agile | type: 'exam' | NO — text description only | Yes |
| kanban | type: 'exam' | NO — text description only | Yes |
| waterfall | type: 'exam' | NO — text description only | Yes |
| program-management | type: 'quiz' (final) | YES — 6 questions inline | Partial |
| leadership | ABSENT | N/A | N/A |
| ms-project | type: 'quiz' (final) | YES — 7 questions inline | Partial |

Across all 12 courses: no exam has inline `quiz: []` question arrays. Every `type: 'exam'` lesson delivers a text transcript explaining exam logistics (duration, pass score, topic list) and relies on a backend exam service. This means cert readiness depends entirely on whether the backend has questions configured. If it does not, learners hit a dead end.

---

### Dimension 4: Practice Assignments

Only **2 of 12 courses** have practice lessons:

| Course | Lesson | Type | Quality |
|---|---|---|---|
| pm-fundamentals | `pm-l10` Practical assignment: Project Charter | `assignment` | Well-structured with scenario, deliverables, and a 6-criterion rubric. Generic (WMS implementation) — usable but not methodology-specific. |
| ai-literacy | `ail-l7` Practice: Draft a Risk Register with AI | `practice` | STUB — `transcript: ''`, one-sentence `content` field, no deliverables, no rubric, no admin sign-off gate. |

**10 of 12 courses have zero practice or assignment lessons.** This means learners in PRINCE2, Scrum, SAFe, LSS, Agile, Kanban, Waterfall, Leadership, MS Project, and Program Management have no hands-on application exercise anywhere in their learning journey.

Specific methodology-appropriate artefacts that are absent:
- PRINCE2: no Project Brief or PID writing exercise
- Scrum: no Sprint Planning facilitation exercise; no Sprint Retrospective format practice
- SAFe: no PI Planning board exercise
- LSS: no SIPOC, FMEA, or full DMAIC project execution
- Leadership: no 360-feedback or coaching scenario

---

### Dimension 5: Simulations

**Zero of 12 courses** have a lesson with `type: 'simulation'`. The `types.ts` Lesson interface only declares `type: 'video' | 'quiz' | 'exam' | 'assignment' | 'certificate' | 'reading'`. The schema does not support `simulation` or `practice` as official lesson types — yet `ai-literacy.ts` uses `type: 'practice'` which is outside the declared union type (a type-safety bug, though TypeScript may accept it if the file casts it).

---

## 3. Cross-Course Integrity Checks

### Coverage gaps (no practice AND no simulation)
10 of 12 courses. The cert flow (lesson → quiz → exam → **practice approved** → cert) is broken for these 10 courses because the "practice approved" gate has no content to trigger it. If the frontend enforces this gate, learners cannot reach their certificate. If the frontend skips the gate, the cert is hollow.

### Template reuse
The `type: 'certificate'` transcript text follows the same structure across all courses (congratulations paragraph, course name, duration, topics, "add to LinkedIn" note). This is fine for the cert lesson itself. More concerning: the `type: 'exam'` transcript pattern is identical across all 9 courses that use it — a list of topics with a tip and "succes!" It reads as copy-paste with course names swapped. Learners who take multiple courses will notice.

### Difficulty calibration
- LSS Green Belt (3 quiz questions) is harder conceptually to pass than Agile Fundamentals (5 questions) or Kanban (5 questions) — but the quiz question count is inversely proportional to course complexity.
- There is no Black Belt course in the catalog to create a tiered difficulty problem within the LSS track.
- SAFe has 19 questions across 3 quizzes, the highest count after MS Project (22) and Leadership (20) — this calibration seems reasonable.

### Methodology purity
- **pm-fundamentals quiz** question: "Welke methodologie is het meest geschikt voor een project met onzekere, veranderende requirements?" (correct: Agile). This is acceptable cross-reference context in a foundations course.
- **waterfall quiz** covers hybrid Agile+Waterfall in Module 2 — fine, that lesson explicitly teaches the hybrid topic.
- **agile-fundamentals** quiz Q5 references INVEST criteria (user story quality) — this is Agile-native, clean.
- No course bleeds inappropriate foreign methodology content. Purity is generally clean.

### Doctrinal accuracy findings
1. **prince2.ts line 45**: "Vandaag: PRINCE2 6th Edition (2023)" — INACCURATE. PRINCE2 6th Edition was published in 2017. There is no independently numbered 2023 edition. AXELOS released minor updates but the edition identifier is "PRINCE2 6th Edition (2017)". Using "2023" will confuse learners cross-referencing the manual.
2. **scrum.ts line 199**: "verantwoordelijk voor het maximaliseren van de waarde van het product en het werk van het **Development Team**" — STALE. The Scrum Guide 2020 replaced "Development Team" with "Developers" throughout. This is a single-line slip in an otherwise 2020-compliant course.
3. **lss** — DOE (Design of Experiments) absent. ASQ LSSGB BOK section II.B requires knowledge of full factorial and fractional factorial experiments. A learner completing this course and sitting the ASQ Green Belt exam would be unaware this topic exists.
4. **safe.ts line 116** and transcriptNL line 275: "Teams synchronized every 10 weeks (PI Planning)" — narrowly accurate (most common cadence) but SAFe 6.0 specifies 8–12 weeks. Minor nuance, not a hard error.
5. **scrum.ts** — Product Goal and Sprint Goal as "commitments" (Scrum Guide 2020 addition to each artifact) are not mentioned. The 2020 guide added a commitment to each artifact: Product Goal → Product Backlog, Sprint Goal → Sprint Backlog, Definition of Done → Increment. Only Sprint Goal appears incidentally; the commitment framing is missing.

### Certificate readiness summary
| Course | Cert reachable today? | Primary blocker(s) |
|---|---|---|
| ai-literacy | PARTIALLY | `ail-l7` practice is a stub with no rubric or admin gate; exam is backend-dependent |
| pm-fundamentals | PARTIALLY | Assignment is not methodology-gated; exam is backend-dependent |
| prince2-foundation | NO | No practice assignment; exam is backend-dependent |
| scrum-master | NO | No practice assignment; exam is backend-dependent |
| safe-scaling-agile | NO | 13 stub lessons; no exam lesson (type:quiz used instead); no practice |
| lean-six-sigma | NO | No practice; DOE gap; exam is backend-dependent |
| agile-fundamentals | NO | No practice; exam is backend-dependent |
| kanban-practitioner | NO | No practice; exam is backend-dependent |
| waterfall-pm | NO | No practice; exam is backend-dependent |
| program-management-pro | NO | 10 stub lessons; no exam lesson; no practice |
| leadership-pm | NO | No exam lesson at all; no practice |
| ms-project-masterclass | NO | Final is quiz not exam; no practice |

---

## 4. Top 10 Specific Findings

**Finding 1 — CRITICAL**
`safe.ts`, lessons `safe-l2` through `safe-l4` and `safe-l6` through `safe-l14`
13 of 14 video lessons have no transcript, empty `keyTakeaways`, and empty `resources`. A learner watches these lessons and sees nothing. The inline TODO comment confirms this is known. For the Yanmar demo, opening SAFe lesson 2 (SAFe Framework Overview) shows a blank content screen.
File: `/Users/samiloukile/Projects/projextpal/frontend/src/data/academy/courses/safe.ts`

**Finding 2 — CRITICAL**
`program-management.ts`, lessons `pgm-l6` through `pgm-l15`
10 of 14 video lessons in Modules 2 and 3 are empty stubs (no transcript, no takeaways, no resources). Module 1 is richly developed; clicking into Module 2 instantly exposes the gap. Program Management is listed as a core capability in Yanmar's context.
File: `/Users/samiloukile/Projects/projextpal/frontend/src/data/academy/courses/program-management.ts`

**Finding 3 — MAJOR**
`leadership.ts`: No exam lesson before certificate.
The learning journey goes: Module 3 lesson 4 (Presenting with Impact) → Certificate. There is no gated assessment for Module 3 and no final exam for the course. A learner with a leadership certificate from this platform has never been tested on the Module 3 content.
File: `/Users/samiloukile/Projects/projextpal/frontend/src/data/academy/courses/leadership.ts`

**Finding 4 — MAJOR**
10 of 12 courses have zero practice assignments.
The gated cert flow requires "practice approved" before cert issuance. In courses without a practice lesson this gate is either skipped (making the cert hollow) or permanently blocked (preventing cert issuance). The only courses with any practice content are `pm-fundamentals` and `ai-literacy`.
Files: all course files except `pm-fundamentals.ts` and `ai-literacy.ts`

**Finding 5 — MAJOR**
`ai-literacy.ts`, lesson `ail-l7` (Practice: Draft a Risk Register with AI)
`type: 'practice'`, `transcript: ''`, one-sentence `content` field, no `deliverables`, no `rubric`, no admin gate. The schema declares `assignment` not `practice` as the lesson type — making this a type-safety violation. The lesson is a placeholder that shows as active content in the LMS.
File: `/Users/samiloukile/Projects/projextpal/frontend/src/data/academy/courses/ai-literacy.ts`, line 590

**Finding 6 — MAJOR**
`ms-project.ts`, `leadership.ts`, `program-management.ts`, `safe.ts`: No `type: 'exam'` lesson.
These 4 courses use `type: 'quiz'` (ms-project, program-management, safe) or nothing (leadership) as their terminal assessment. The cert flow schema expects exam → cert. None of these courses have an exam type lesson. Certificates issued from these courses are unverified.
Files: ms-project.ts, leadership.ts, program-management.ts, safe.ts

**Finding 7 — MODERATE**
`prince2.ts` line 45: "Vandaag: PRINCE2 6th Edition (2023)"
This is factually incorrect. The 6th Edition was published in 2017. A Foundation candidate cross-checking against the official manual will find "PRINCE2® Managing Successful Projects, 6th Edition" with a 2017 publication date. This undermines course credibility for a cert-prep learner.
File: `/Users/samiloukile/Projects/projextpal/frontend/src/data/academy/courses/prince2.ts`, line 45
Recommended fix: change to "PRINCE2 6th Edition (2017, updated)" or "PRINCE2® Managing Successful Projects (AXELOS, 2017)"

**Finding 8 — MODERATE**
`scrum.ts` line 199: "product en het werk van het **Development Team**"
The Scrum Guide 2020 retired "Development Team" and replaced it with "Developers" throughout. All quiz questions in this course correctly use "Developers." This single transcript line contradicts the quiz and the Scrum Guide 2020.
File: `/Users/samiloukile/Projects/projextpal/frontend/src/data/academy/courses/scrum.ts`, line 199

**Finding 9 — MODERATE**
`lean-six-sigma.ts`: Modules 2–4 each contain exactly 1 video lesson (Measure, Analyze, Improve = 1 lesson each at 22–28 min). The ASQ LSSGB BOK has sub-sections within each DMAIC phase covering multiple distinct tool families. DOE is entirely absent. A learner completing this course who then sits the ASQ exam will encounter Measurement System Analysis, capability indices, and DOE questions with no preparation.
File: `/Users/samiloukile/Projects/projextpal/frontend/src/data/academy/courses/lean-six-sigma.ts`

**Finding 10 — MODERATE**
`scrum.ts`: Scrum Guide 2020 artifacts and their commitments (Product Goal → Product Backlog, Sprint Goal → Sprint Backlog, Definition of Done → Increment) are not explicitly taught as the artifact-commitment pairing. The Scrum Guide 2020 made these commitments a formal part of the framework. PSM exam questions test this directly. The course mentions Sprint Goal and Definition of Done but not in the 2020 commitment framing.
File: `/Users/samiloukile/Projects/projextpal/frontend/src/data/academy/courses/scrum.ts`

---

## 5. Remediation Roadmap

### P1 — Blocks Wednesday demo credibility (must fix today/tonight)

**P1.A: Write minimal transcripts for SAFe lessons safe-l2 through safe-l14**
Effort: M (13 lessons × ~50–80 line transcript = ~1000 lines of content)
Impact: Without this, clicking any SAFe lesson after the first shows a blank. SAFe is likely to come up in a Yanmar engineering demo given their enterprise scale.
Minimum viable: 2–3 sentences + 3–5 bullet keyTakeaways per lesson so the player renders something. Full transcripts as follow-up.

**P1.B: Write minimal transcripts for program-management lessons pgm-l6 through pgm-l15**
Effort: M (10 lessons)
Impact: Program Management Pro is name-checked as a core value prop. Any click into Module 2 or 3 hits a blank.

**P1.C: Add `type: 'exam'` lessons to safe, leadership, ms-project, and program-management**
Effort: S (copy the existing exam transcript pattern from a working course; add the lesson to the module)
Impact: Without an exam lesson before the certificate, the cert-flow chain is visibly broken for 4 courses. Leadership cert → cert with no exam is the most embarrassing case for a demo.

---

### P2 — Visible in any focused 1-course review

**P2.A: Flesh out `ail-l7` practice lesson (AI Literacy)**
Effort: S
Add a proper scenario description, deliverables list, rubric (3–5 criteria with point values), and change `type: 'practice'` to `type: 'assignment'` to match the schema.

**P2.B: Fix PRINCE2 edition date**
Effort: XS (one-line change)
Change "PRINCE2 6th Edition (2023)" to "PRINCE2 6th Edition (2017)" in `prince2.ts` line 45.

**P2.C: Fix Scrum Guide 2020 terminology slip**
Effort: XS (one-line change)
Change "het werk van het Development Team" to "het werk van de Developers" in `scrum.ts` line 199.

**P2.D: Add Scrum Guide 2020 artifact commitments to scrum.ts artifacts lesson**
Effort: S (add ~10 lines to the transcript of `scrum-l4`)
Add a section explaining that each artifact has a commitment: Product Backlog → Product Goal, Sprint Backlog → Sprint Goal, Increment → Definition of Done.

**P2.E: Add practice assignments to PRINCE2 and Scrum (the two cert-prep courses)**
Effort: M each
PRINCE2: write a "Draft a Project Brief" assignment with scenario, deliverables (Project Brief document), and a rubric referencing the 7 PRINCE2 themes. Scrum: write a "Facilitate a Sprint Planning" simulation assignment with a pre-provided backlog and a rubric checking Sprint Goal formulation, task breakdown, and team commitment.

---

### P3 — Nice-to-have polish

**P3.A: Expand LSS DMAIC phase coverage**
Each of Measure, Analyze, Improve should be expanded to 2–3 lessons. Add a DOE introduction lesson. This is a significant content development effort (L) but required before this course can credibly target ASQ LSSGB prep.

**P3.B: Add Module 3 quiz and final exam to leadership course**
Effort: S
A 5-question Module 3 quiz covering communication, negotiation, stakeholder management + a 15-question final exam would complete the assessment chain.

**P3.C: Standardize terminal assessment type**
Courses where `type: 'quiz'` serves as the final exam (ms-project, program-management, safe) should have their final lesson type changed to `type: 'exam'` or a new exam lesson inserted. This aligns the cert-flow gate with the schema intent.

**P3.D: Add methodology-specific practice assignments for Waterfall, LSS, Kanban, Agile**
Effort: M each
Waterfall: produce a full Requirements Specification for a provided scenario. LSS: complete a SIPOC + Project Charter for a defect-reduction scenario. Kanban: design a board with WIP limits and policies for a provided team context. Agile: write 5 user stories with acceptance criteria and prioritize a sprint backlog.

---

## 6. Cross-Course Patterns

**Pattern 1: 10/12 courses lack practice assignments**
The cert-flow promise ("lesson → quiz → exam → practice approved → cert") is a marketing claim for 10 of 12 courses. If Yanmar's engineers ask "how do I know I actually mastered this?" the answer for most courses is: you passed a text-only quiz. This is the single most structurally important gap across the catalog.

**Pattern 2: All exam lessons are backend-dependent text screens**
No course has inline exam questions. Every `type: 'exam'` lesson shows a logistics paragraph and relies on a backend exam service. If that service has no questions loaded, 9 courses block at the exam screen. The 3 courses that use `type: 'quiz'` as their final assessment avoid this risk — ironically making them more functional today than courses with a proper `type: 'exam'` lesson.

**Pattern 3: Module 1 is rich; later modules thin out**
Visible in SAFe (Module 1 = 1 full transcript; Modules 2–3 = stubs), Program Management (Module 1 = rich; 2–3 = stubs), and LSS (Module 1 = Define phase developed; Modules 2–4 = one lesson each). The pattern suggests iterative development stopped after the first module. For a demo, every course looks polished if you only view Module 1 — a false impression.

**Pattern 4: Certificate lessons are cosmetic, not gated**
Every `type: 'certificate'` transcript is a congratulatory paragraph ("add to LinkedIn"). None reference admin sign-off, a required practice approval score, or a minimum quiz percentage. If the platform does enforce gating logic, it is in backend code not visible here. If it does not, certificates are issued on lesson completion alone.

**Pattern 5: AI Literacy is the most complete course**
`ai-literacy` (the newest addition per the recent commit) has: full transcripts in all video lessons, 4 populated inline quizzes (20 questions total), 2 module exams plus a final exam structure, 1 practice lesson (stub but present), and a certificate. It is structurally the closest to the full cert-flow chain, despite `ail-l7` being a stub. This course is safe to demo end-to-end.

---

## 7. Files of Primary Concern

- `/Users/samiloukile/Projects/projextpal/frontend/src/data/academy/courses/safe.ts` — P1: 13 stub lessons
- `/Users/samiloukile/Projects/projextpal/frontend/src/data/academy/courses/program-management.ts` — P1: 10 stub lessons, no exam
- `/Users/samiloukile/Projects/projextpal/frontend/src/data/academy/courses/leadership.ts` — P1: no exam before cert
- `/Users/samiloukile/Projects/projextpal/frontend/src/data/academy/courses/ms-project.ts` — P1/P2: quiz used as exam
- `/Users/samiloukile/Projects/projextpal/frontend/src/data/academy/courses/ai-literacy.ts` — P2: practice lesson is stub
- `/Users/samiloukile/Projects/projextpal/frontend/src/data/academy/courses/prince2.ts` — P2: edition date error (line 45)
- `/Users/samiloukile/Projects/projextpal/frontend/src/data/academy/courses/scrum.ts` — P2: stale "Development Team" terminology (line 199)
- `/Users/samiloukile/Projects/projextpal/frontend/src/data/academy/courses/lean-six-sigma.ts` — P3: single-lesson DMAIC phases, DOE absent
- `/Users/samiloukile/Projects/projextpal/frontend/src/data/academy/courses/index.ts` — context: stakeholder-management has no courseModules and is correctly excluded from production

---

*End of audit. Read-only — no course files were modified.*
