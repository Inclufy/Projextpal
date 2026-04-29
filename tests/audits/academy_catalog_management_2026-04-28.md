# Academy Catalog Management Audit
**Date:** 2026-04-28
**Auditor:** Academy Content Manager (claude-sonnet-4-6)
**Scope:** CMS / editorial / catalog-management view across all 12 production courses
**References:** `academy_integral_audit_2026-04-28.md`, `course_alignment_audit.md`
**Backend API:** Offline during this audit (Connection refused on all ports); analysis is TS-source-only

---

## 0. Catalog Inventory

### 0.1 Production Courses (12 active in `coursesWithContent`)

| # | Course ID | TS File | Last Git Touch | Lines | Lessons | Questions |
|---|---|---|---|---|---|---|
| 1 | `pm-fundamentals` | pm-fundamentals.ts | 2026-02-26 | 3576 | 26 | 15 |
| 2 | `prince2-foundation` | prince2.ts | 2026-02-25 | 2431 | 21 | 10 |
| 3 | `scrum-master` | scrum.ts | 2026-02-25 | 1666 | 14 | 10 |
| 4 | `waterfall-pm` | waterfall.ts | 2026-02-25 | 1428 | 11 | 14 |
| 5 | `kanban-practitioner` | kanban.ts | 2026-02-25 | 1193 | 10 | 5 |
| 6 | `agile-fundamentals` | agile.ts | 2026-02-25 | 1245 | 10 | 5 |
| 7 | `lean-six-sigma` | lean-six-sigma.ts | 2026-02-25 | 1429 | 10 | 3 |
| 8 | `leadership-pm` | leadership.ts | 2026-03-01 | 8203 | 17 | 38 |
| 9 | `program-management-pro` | program-management.ts | 2026-03-01 | 2337 | 17 | 31 |
| 10 | `safe-scaling-agile` | safe.ts | 2026-03-01 | 2212 | 18 | 37 |
| 11 | `ms-project-masterclass` | ms-project.ts | 2026-03-01 | 3330 | 20 | 40 |
| 12 | `ai-literacy` | ai-literacy.ts | 2026-04-23 | 1574 | 17 | 40 |
| — | `stakeholder-management` | other-courses.ts | — | — | 0 | 0 |

**Total across 12 production courses:** 191 lessons, 248 inline questions
(Note: `stakeholder-management` is `other-courses.ts` metadata stub only — no modules. Excluded from all metrics.)

### 0.2 Legacy / Stub Status
- `other-courses.ts` defines 7 additional metadata-only stubs: stakeholder-management, risk-management, safe-fundamentals, hybrid-pm, msp-foundation, pmi-pmp, pm-leadership. None has `courseModules`. None is in `coursesWithContent`. None counts toward the catalog until modules are authored.

---

## 1. Catalog Freshness Matrix

### 1.1 Methodology Edition Alignment

| Course | Edition in Course | Current Authoritative Edition | Gap? |
|---|---|---|---|
| `prince2-foundation` | PRINCE2 6th Edition (2017) | PRINCE2 7th Edition (PeopleCert, 2023) | YES — 1 major edition behind |
| `scrum-master` | Scrum Guide 2020 | Scrum Guide 2020 (unchanged) | None |
| `safe-scaling-agile` | SAFe 6.0 | SAFe 6.0 | None |
| `lean-six-sigma` | ASQ LSSGB BOK (implied) | ASQ LSSGB BOK + ISO 13053 (stable) | None |
| `agile-fundamentals` | Agile Manifesto 2001 + 12 Principles | Manifesto unchanged | None |
| `kanban-practitioner` | Anderson Kanban / Essential Kanban Condensed | Unchanged | None |
| `waterfall-pm` | General sequential PM | N/A (no certification standard) | Low risk |
| `leadership-pm` | Goleman, Hersey-Blanchard, Lencioni, Tuckman, Pink | All stable | None |
| `ms-project-masterclass` | MS Project 2021–2024 | MS Project (365 continuously updated) | Monitor |
| `pm-fundamentals` | PMBOK 7 implied (generic PM) | PMBOK 7 (2021) | None |
| `program-management-pro` | Generic program management / PMI MSP principles | MSP 5th Ed (2020) stable | Low risk |
| `ai-literacy` | EU AI Act (2024) + general LLM literacy | EU AI Act enforcement began Aug 2024 | Monitor |

### 1.2 PRINCE2 7th Edition Gap — Priority Escalation

This is the single highest-urgency doctrine gap in the catalog. The evidence:

1. **`prince2.ts` teaches 6th Ed (2017).** The transcript at line 44–45 now correctly states "PRINCE2 6th Edition (2017)" after the integral audit fix was applied. The assignment rubric (`prince2.ts` line 2267) also references "PRINCE2 6th Edition."

2. **PRINCE2 7th Edition was published by PeopleCert/AXELOS in 2023.** ProjeXtPal's own product codebase already references the 7th edition: `visualLibrary.ts` has "PRINCE2 7 Processes/Themes/Principles" visual nodes; `methodology_compliance_projects_2026-04-28.md` audits the product against PRINCE2 7th Ed management strategies.

3. **Internal inconsistency.** The product tooling models PRINCE2 7th Ed behaviour (6 management strategies in PID, sustainability considerations), but the Academy course teaches a different version. A learner who completes the course and then uses the ProjeXtPal PRINCE2 board will encounter terminology and document structures that don't match what they studied.

4. **Exam risk.** Candidates preparing for the PeopleCert PRINCE2 Foundation exam using our Academy will be studying 6th Ed content for a 7th Ed exam. This is a potential support liability.

**Key structural differences PRINCE2 6th → 7th:**
- "Project Support" role retired; replaced by informal project assurance support.
- "Sustainability" introduced as a theme-level consideration across all 7 themes.
- "People" considerations explicitly foregrounded (was implicit in Organisation theme).
- Exam format redesigned: scenario-based questions (Practitioner), dropped "closed book" at Foundation level.
- Document names largely unchanged; "Project Brief → PID → Lessons Log" chain intact.

**Recommended update scope:** Delegate to `course-content` for a targeted pass on prince2.ts — update the intro history section, the themes overview lesson (`p2-l5` area), and the tailoring lesson. The 7 principles, 7 themes (names), and 7 processes (names) are unchanged in 7th Ed, so quizzes do not need full rewrites — only the explanatory content around sustainability and people needs additions.

### 1.3 SAFe and Scrum: Confirmed Current
- SAFe 6.0: 26 explicit "SAFe 6.0" references in `safe.ts`. The four core values (Alignment, Built-In Quality, Transparency, Program Execution), eight Flow Metrics, and LPM structure are all 6.0-accurate.
- Scrum Guide 2020: all quiz questions use "Developers" (not "Development Team"). The transcript at `scrum-l2` still uses the deprecated term "Development Team" internally — a minor residual inconsistency flagged in the integral audit.

### 1.4 Staleness by Last Touch
- 9 of 12 courses last touched February–March 2026 (translation pass / standardisation). No doctrine-level content was changed in those commits — they were i18n and instructor-field updates.
- `ai-literacy` is the only course with a content-originating commit in 2026 (April 23).
- All 12 courses are under 12 months old by last-touch date. No stale flag by the 12-month rule.
- By doctrine freshness: PRINCE2 is the only course whose methodology has advanced a major edition since the course content was authored.

---

## 2. Skills Taxonomy Alignment

### 2.1 Skill Schema (Backend)

The backend defines:
- **6 SkillCategory rows:** planning, stakeholder, risk, leadership, financial, tools
- **25 Skill rows** across those categories (4+4+4+4+4+5)
- **LessonSkillMapping** model links `lesson_id` (string) to a `Skill` with point values

### 2.2 Seed Coverage vs Catalog

The `seed_skills.py` command creates only **10 LessonSkillMappings** total:
- pm-fund-l1 → project-planning
- pm-fund-l2 → stakeholder-engagement
- pm-fund-l3 → communication
- pm-fund-l4 → risk-assessment
- pm-fund-l5 → budgeting
- l1/l2/l3/l4/l5 → same 5 skills (short-alias duplicates for backward compatibility)

**Coverage:** 5 distinct lessons mapped out of 191 total lessons across 12 courses. That is **2.6% lesson coverage** for skill mappings.

### 2.3 Orphaned Skills (Skills with No Lesson Mappings)

All 25 skills except {project-planning, stakeholder-engagement, communication, risk-assessment, budgeting} have zero lesson mappings. That is **20 orphaned skills** (80%).

In the `tools` category: `agile-scrum`, `waterfall`, `prince2`, `gantt-charts`, `kanban` are all orphaned — no lesson in any course is mapped to these skills despite entire courses existing for each.

### 2.4 Untagged Lessons (Lessons with No Skills)

186 of 191 lessons (97.4%) have no LessonSkillMapping. This means:
- Zero gamification points are awarded for completing any lesson in PRINCE2, Scrum, SAFe, LSS, Agile, Kanban, Waterfall, Leadership, MS Project, or Program Management.
- The `SkillsTab` component (`SkillsTab.tsx`) will show an empty or near-empty skills profile for any learner who has not touched pm-fundamentals.
- `UserSkill` records are therefore nearly absent from the live DB (no user progress to orphan — but this also means the skills gamification system is essentially non-functional).

### 2.5 Skill Category Gaps

The 6 categories (planning, stakeholder, risk, leadership, financial, tools) do not cover:
- **Technology / Digital Literacy** — no category for skills taught in `ai-literacy` (prompt engineering, AI governance, LLM literacy).
- **Process Improvement** — no category for skills taught in `lean-six-sigma` (DMAIC, statistical analysis, CTQ).
- **Scaled Delivery** — no category for skills taught in `safe-scaling-agile` (ART management, PI Planning, LPM).

### 2.6 Cross-Course Skill Naming Consistency

Because no cross-course mappings exist beyond pm-fundamentals, there are no duplicate skill name variants in the DB. However, the `tools` category contains a generic `prince2` skill and a generic `agile-scrum` skill — when mappings are eventually built, the risk is that content teams create "PRINCE2 Stage Management" as one skill and "Stage Boundary Management" as another for the same concept. A canonical skill-name governance policy does not exist in the codebase (no `SkillCategory.description` or naming convention doc).

---

## 3. EN ↔ NL Translation Coverage

### 3.1 Course-Level Fields (title, description)

All 12 production courses have both `title`/`titleNL` and `description`/`descriptionNL` populated. 100% coverage at course-level metadata.

### 3.2 Module-Level Fields (title, description)

All modules have `titleNL` present. `descriptionNL` is defined in the `Module` interface as optional and is populated in SAFe and leadership (which have full bilingual modules); other courses use `titleNL` only. This is adequate.

### 3.3 Lesson-Level Transcripts

This is the largest translation gap in the catalog:

| Course | Transcript (EN) | TranscriptNL (NL) | Coverage Model | EN learner can read? | NL learner can read? |
|---|---|---|---|---|---|
| pm-fundamentals | 23 | 0 | NL transcript field (content is NL) | NO | YES |
| prince2-foundation | 18 | 0 | NL transcript field | NO | YES |
| scrum-master | 11 | 0 | NL transcript field | NO | YES |
| safe-scaling-agile | 14 | 13 | Both fields present | YES (1 lesson) | YES |
| lean-six-sigma | 9 | 0 | NL transcript field | NO | YES |
| agile-fundamentals | 9 | 0 | NL transcript field | NO | YES |
| kanban-practitioner | 9 | 0 | NL transcript field | NO | YES |
| waterfall-pm | 9 | 0 | NL transcript field | NO | YES |
| leadership-pm | 14 | 13 | Both fields present | YES | YES |
| ms-project-masterclass | 7 | 6 | Partial bilingual | PARTIAL (7 EN) | PARTIAL (6 NL) |
| program-management-pro | 3 | 13 | NL-primary, EN partial | PARTIAL (3 EN) | YES |
| ai-literacy | 17 | 0 | NL transcript field | NO | YES |

**Interpretation note:** Courses with `transcript:` count > `transcriptNL:` count AND no explicit `transcriptNL:` fields (e.g. pm-fundamentals, prince2, scrum) are effectively NL-only courses — the `transcript:` field holds Dutch content despite the field name. The `transcriptNL:` field is only used when a course has been explicitly bilingual-authored (SAFe, leadership).

**Result:** The Academy is effectively a **Dutch-native catalog**. Only 2 courses (SAFe, leadership) have genuine EN-parallel transcripts. MS Project has partial EN transcripts (7 of 15 video lessons). All others are NL-only at the lesson body level.

### 3.4 Quiz Question Translation

| Course | Quiz Questions | Has `questionNL`/`optionsNL` | Language of `question:` field |
|---|---|---|---|
| prince2-foundation | 10 | No | NL |
| scrum-master | 10 | No | NL |
| safe-scaling-agile | 37 | No | NL |
| lean-six-sigma | 3 | No | NL |
| agile-fundamentals | 5 | No | NL |
| kanban-practitioner | 5 | No | NL |
| waterfall-pm | 14 | No | NL |
| leadership-pm | 38 | **YES** | EN (primary), NL via `questionNL` |
| ms-project-masterclass | 40 | **YES** | EN (primary), NL via `questionNL` |
| pm-fundamentals | 15 | No | NL |
| program-management-pro | 31 | No | NL (quiz1/quiz2), mix in exam |
| ai-literacy | 40 | No | NL |

**Finding:** `questionNL`/`optionsNL`/`explanationNL` fields are used in `leadership.ts` and `ms-project.ts` only. These two courses have EN-primary quiz questions with NL translations attached. The `QuizEngine.tsx` at line 133–140 consumes these NL fields when `language === 'nl'`. However, the `QuizQuestion` interface in `types.ts` does not declare `questionNL`, `optionsNL`, or `explanationNL` — these are informal property extensions. TypeScript strict mode would not catch a misspelling.

**Intentional vs accidental:** The pattern is inconsistent. Most courses have NL-only quiz questions (no NL field needed because the base field is already NL). Leadership and MS Project have EN-primary questions and added NL fields. This is an ad-hoc divergence, not a documented editorial policy.

**Recommendation for `types.ts`:** The `QuizQuestion` interface should be extended with optional `questionNL`, `optionsNL`, `explanationNL` to make the pattern explicit and type-safe.

### 3.5 KeyTakeaways Bilingual Coverage

| Course | `keyTakeaways` | `keyTakeawaysEN` | Pattern |
|---|---|---|---|
| pm-fundamentals | EN bullets | EN (redundant) | Both EN |
| prince2-foundation | NL bullets | EN bullets | Bilingual |
| scrum-master | NL bullets | EN bullets | Bilingual |
| safe-scaling-agile | NL bullets | EN bullets | Bilingual |
| lean-six-sigma | NL bullets | EN bullets | Bilingual |
| agile-fundamentals | NL bullets | EN bullets | Bilingual |
| kanban-practitioner | NL bullets | EN bullets | Bilingual |
| waterfall-pm | NL bullets | EN bullets | Bilingual |
| leadership-pm | NL bullets | EN bullets | Bilingual |
| ms-project-masterclass | EN bullets | EN bullets | Both EN |
| program-management-pro | NL bullets | EN bullets | Bilingual |
| ai-literacy | NL bullets | **MISSING** | NL-only |

`ai-literacy` is the only course missing `keyTakeawaysEN`. Since it was authored NL-native, the EN takeaway bullets were never added. This means the `keyTakeawaysEN` array renders empty for EN-language users on AI Literacy lessons.

### 3.6 Backend NL Fields (QuizQuestion, QuizAnswer)

The backend `QuizQuestion` model has `question_text_nl` and `QuizAnswer` has `answer_text_nl`. These are populated to empty string by default. The `import_frontend_courses` management command does **not** import quiz questions at all — it only imports modules and lessons. Therefore:
- All `question_text_nl` fields in the DB are empty strings.
- Backend quiz NL translation is 0% regardless of what's in the TS source files.
- This gap is only meaningful once the bulk-generate pipeline runs and populates `QuizQuestion` rows, at which point the NL fields need separate population (not wired in `bulk_generate.py` either).

---

## 4. Question Bank Quality and Balance

### 4.1 Total Inline Question Count

**248 total inline questions** across 12 production courses.

The integral audit estimated ~163. The discrepancy is explained by:
1. Exam blocks with inline `quiz:` arrays (ai-literacy exams have 8+20 questions; program-management exam has 9; program-management quizzes have 7+6=13 vs the 13 the integral audit counted).
2. Post-alignment-audit quiz additions to courses that previously had `quiz: []` stubs.

Breakdown by lesson type:
- Quiz lessons: ~162 questions (6+6 ai-literacy quiz, 10+10 prince2/scrum, 37 safe, 3 lss, 5 agile, 5 kanban, 14 waterfall, 38 leadership, 40 ms-project, 15 pm-fundamentals, 13 pgm-mgmt)
- Exam/inline blocks: ~86 questions (ai-literacy 28, pgm-mgmt 9, others negligible)

### 4.2 Questions Per Quiz Lesson

| Course | Quiz Lessons | Total Q's | Avg per Quiz |
|---|---|---|---|
| `prince2-foundation` | 2 | 10 | 5 |
| `scrum-master` | 2 | 10 | 5 |
| `safe-scaling-agile` | 3 | 37 | 12 |
| `lean-six-sigma` | 1 | 3 | 3 |
| `agile-fundamentals` | 1 | 5 | 5 |
| `kanban-practitioner` | 1 | 5 | 5 |
| `waterfall-pm` | 2 | 14 | 7 |
| `leadership-pm` | 2 | 38 | 19 |
| `ms-project-masterclass` | 3 | 40 | 13 |
| `pm-fundamentals` | 2 | 15 | 7 |
| `program-management-pro` | 2 | 13 | 6.5 |
| `ai-literacy` | 2 | 12 (quiz only) | 6 |

The target per the catalog health check policy is 5 minimum per quiz lesson. `lean-six-sigma` at 3 is the only course below the 3-question floor (it meets the floor exactly). No course is critically under-questioned at the quiz level.

**Outliers to examine:**
- `leadership-pm` (19 per quiz) and `ms-project` (13 per quiz) have significantly more questions than the others. This is not a problem — more depth is better for learner assessment — but it makes those courses feel asymmetrically deep relative to peers.
- `safe-scaling-agile` (12 per quiz average) reflects the course's breadth (17 lessons across 3 quizzes covering 13 SAFe topics).

### 4.3 Difficulty Distribution — No Explicit Tagging

**Zero courses have a `difficulty:` field on any quiz question.** The `QuizQuestion` interface does not define a `difficulty` property. There is no mechanism for 30%/50%/20% easy/medium/hard calibration at the data layer.

Bloom's taxonomy distribution was assessed qualitatively by sampling question stems:

| Course | Recall (Bloom L1-2) | Application (Bloom L3-4) | Evaluation (Bloom L5-6) | Assessment |
|---|---|---|---|---|
| `prince2-foundation` | 80% ("Hoeveel principes heeft PRINCE2?") | 20% ("Wanneer wordt Exception Report gemaakt?") | 0% | Recall-heavy |
| `scrum-master` | 70% ("Wat is max Sprint lengte?") | 30% ("Welk probleem beschrijft X?") | 0% | Recall-heavy |
| `safe-scaling-agile` | 60% ("Wie heeft SAFe ontwikkeld?") | 35% ("Welke dimensie hoort NIET bij Built-In Quality?") | 5% ("Verschil Operational vs Development Value Stream?") | Acceptable |
| `lean-six-sigma` | 67% ("Wat betekent DMAIC?") | 33% ("Wat hoort NIET in een problem statement?") | 0% | Recall-heavy |
| `leadership-pm` | 30% | 50% ("Welke situatie is BEST voor Coercive stijl?") | 20% ("According to Lencioni...") | Best mix |
| `ms-project-masterclass` | 40% | 50% ("What happens when duration = 0?") | 10% | Good mix |
| `agile-fundamentals` | 60% | 40% | 0% | Acceptable |
| `kanban-practitioner` | 60% | 40% | 0% | Acceptable |
| `waterfall-pm` | 60% | 35% | 5% | Acceptable |
| `pm-fundamentals` | 60% | 35% | 5% | Acceptable |
| `program-management-pro` | 55% | 35% | 10% | Acceptable |
| `ai-literacy` | 30% | 55% | 15% | Good mix |

**Summary:** Leadership and AI Literacy have the best Bloom-level distribution. PRINCE2, Scrum, and LSS are the most recall-heavy (this mirrors the certification exam style for Foundation-level exams, which are recall-dominant, so this is defensible). No course has been explicitly designed with Bloom calibration.

### 4.4 Coverage: Lessons With No Associated Question

A lesson is "tested" if a quiz lesson immediately follows the video lesson(s) in the same module. Courses with a single quiz per module test ~4–8 video lessons with one 5-question quiz set. Untested lessons exist in every course:

- `ai-literacy`: Module 4 (2 video lessons: "Bouwen van een Persoonlijke Prompt Bibliotheek", "AI-First Projectmanager") has no quiz before the certificate. Flagged in the integral audit.
- `leadership-pm`: Module 3 (4 lessons: Communication, Stakeholder Management, Negotiation, Presenting with Impact) has no quiz before the certificate.
- `program-management-pro`: Module 1 (5 video lessons) has its own quiz; Module 2+3 content is assessed by quiz2, but 10 of 13 video lessons in Modules 2–3 are stubs with no transcript.
- `safe-scaling-agile`: Each of 3 modules has a quiz; 13 of 14 video lessons remain transcript stubs (content shells only).

---

## 5. Quiz and Exam Difficulty Calibration

### 5.1 Intra-Methodology Comparison

There is only one LSS course (`lean-six-sigma` = Green Belt). No Black Belt course exists yet. The 7 stubs in `other-courses.ts` do not include an LSS Black Belt entry. The question of "is Black Belt harder than Green Belt" is moot — there is no Black Belt course to compare.

For PRINCE2: there is one course (`prince2-foundation`) titled "PRINCE2 Foundation & Practitioner." It covers both levels in a single 21-lesson course. Quiz questions test Foundation-level concepts only (7 principles/themes/processes, report types). There are no Practitioner-level scenario questions (which would require learners to apply PRINCE2 to a case study and justify tailoring decisions). This means the course underprepares Practitioner candidates despite the title.

### 5.2 SAFe vs Agile Calibration

`safe-scaling-agile` (SAFe 6.0) has 37 questions across 3 quizzes vs `agile-fundamentals` (5 questions, 1 quiz). SAFe questions have meaningful depth (e.g. "Wat is het verschil tussen een Operationele en Ontwikkelwaardestroom?" and "Welke SAFe-configuratie voegt het Solution Train-niveau toe?"). Agile Fundamentals questions are appropriately introductory. The calibration hierarchy is coherent.

### 5.3 The "Harder = More Questions" Fallacy

Question count per quiz (5 vs 37) does not equate to difficulty. A 37-question SAFe quiz with 60% recall questions is not harder than a 5-question exam requiring scenario analysis. Difficulty is currently implicit in the question text, not enforced by the data model. Until `difficulty:` is added to `QuizQuestion`, the catalog cannot produce meaningful difficulty reports.

---

## 6. Deploy Pipeline Check

### 6.1 `import_frontend_courses` Status

The backend API is not running (Connection refused on all checked ports). Direct DB state cannot be verified. The following assessment is based on TS-source analysis.

**What the importer does:** The `import_frontend_courses.py` command extracts course metadata + module + lesson rows using a Node.js extractor regex. It does NOT import:
- Quiz questions (`QuizQuestion` / `QuizAnswer` rows)
- Skill mappings (`LessonSkillMapping`)
- Exam definitions (`Exam`)
- Practice assignments

**What needs to land post-import:** After `manage.py import_frontend_courses` runs:
- 12 Course rows (by slug match — DB rows must pre-exist from migration 0014)
- ~39 CourseModule rows
- ~191 CourseLesson rows

### 6.2 ai-literacy Module Map Bug

`ai-literacy` is imported into `coursesWithContent` (line 87 of `index.ts`) and exported from the module. However, it is **not registered in `courseModulesMap`** (lines 99–111). The comment at line 5 still reads "11 courses, 35 modules, 166 lessons" (stale) while line 73 correctly says "12 courses, 39 modules, 182 lessons."

**Impact:** `getModulesByCourseId('ai-literacy')` returns `[]` at runtime. Any component that calls this function to render the course curriculum will show an empty module list. The course appears in the marketplace but its lesson tree is invisible to frontend helper functions. The `courseHasContent('ai-literacy')` function returns `false` as a direct consequence.

This is a **P1 bug** — the newest course in the catalog is invisible to the `getModulesByCourseId` API.

**Fix required:** Add `'ai-literacy': aiLiteracyModules` to `courseModulesMap` in `index.ts` lines 99–111.

### 6.3 Import Command Limitation: Module Extraction Regex

The extractor JS in `import_frontend_courses.py` uses:
```
const\s+\w*[Cc]ourse\s*:\s*Course\s*=\s*\{([\s\S]+?)^};$
```
and:
```
const\s+module\w*\s*:\s*Module\s*=\s*\{([\s\S]+?)^};$
```

This regex pattern works for `ai-literacy.ts` (which uses `const module1: Module = {...}` — confirmed at lines 17, 375, 688, 1071). However, courses that use inline array literals `const fooModules: Module[] = [{ ... }]` would not be matched. All 12 TS files use the named-const-per-module pattern, so this is not a current problem — but it is a fragility risk for future course authoring.

### 6.4 Bulk Generate Pipeline Dependencies

Post-import, the following bulk operations are needed to bring each course to cert-readiness:

| Operation | Endpoint | Needed For |
|---|---|---|
| Quiz generation | `POST /bulk/quizzes/?course=<slug>` | All 12 courses (inline questions not imported) |
| Exam generation | `POST /bulk/exams/?course=<slug>` | All 12 courses (no Exam rows exist) |
| Skills generation | `POST /bulk/skills/?course=<slug>` | All 12 courses (only 5 pm-fund lessons mapped) |
| Practice generation | `POST /bulk/practice/?course=<slug>` | 10 courses (no assignment lessons) |
| Simulation generation | `POST /bulk/simulations/?course=<slug>` | All 12 courses |

Run order matters: quizzes first (lessons must exist), then exams, then skills, then practice, then simulations. Never run in a loop; sample each course's output before proceeding to the next.

---

## 7. Pre-Release Checklist Status (Per Course)

| Course | Backend Course row | NL cover ≥80% | Quiz ≥3/lesson | Final Exam 20Q | Practice ≥30% | 5-10 Skills | Publishable? |
|---|---|---|---|---|---|---|---|
| pm-fundamentals | UNKNOWN (API offline) | Lesson: NL-only | YES (7.5/quiz) | NOT inline | YES (1/21) | PARTIAL (5 mapped) | NO |
| prince2-foundation | UNKNOWN | Lesson: NL-only | YES (5/quiz) | NOT inline | NO | NO | NO |
| scrum-master | UNKNOWN | Lesson: NL-only | YES (5/quiz) | NOT inline | YES (1/9) | NO | NO |
| safe-scaling-agile | UNKNOWN | YES (bilingual) | YES (12/quiz) | NOT inline | NO | NO | NO |
| lean-six-sigma | UNKNOWN | Lesson: NL-only | BORDERLINE (3/quiz) | NOT inline | NO | NO | NO |
| agile-fundamentals | UNKNOWN | Lesson: NL-only | YES (5/quiz) | NOT inline | NO | NO | NO |
| kanban-practitioner | UNKNOWN | Lesson: NL-only | YES (5/quiz) | NOT inline | NO | NO | NO |
| waterfall-pm | UNKNOWN | Lesson: NL-only | YES (7/quiz) | NOT inline | NO | NO | NO |
| leadership-pm | UNKNOWN | YES (bilingual) | YES (19/quiz) | NOT inline | NO | NO | NO |
| program-management-pro | UNKNOWN | NL-primary | YES (6.5/quiz) | NOT inline (9Q exam) | NO | NO | NO |
| ms-project-masterclass | UNKNOWN | PARTIAL (7EN/6NL) | YES (13/quiz) | NOT inline | NO | NO | NO |
| ai-literacy | UNKNOWN | Lesson: NL-only | YES (6/quiz) | 28Q inline (exam1+2) | YES (1/11) | NO | CLOSEST |

**Zero courses are publishable today** under the full pre-release checklist. The most significant blockers are:
1. Backend API offline — Course row status unknown.
2. No inline exam questions for 11 of 12 courses (ai-literacy is the exception with 28Q across 2 exam blocks).
3. Skill mappings absent for 186 of 191 lessons.
4. Practice assignments exist for only 3 courses (prince2, scrum, pm-fundamentals each have 1 assignment lesson).

---

## 8. Three-Priority Editorial Roadmap

### P1 — Before Any Production Deploy

**P1.A: Fix `courseModulesMap` for `ai-literacy`**
File: `frontend/src/data/academy/courses/index.ts`, line 111.
Add: `'ai-literacy': aiLiteracyModules,`
Without this, `ai-literacy` renders as an empty course in the app and `courseHasContent('ai-literacy')` returns `false`.

**P1.B: Run `import_frontend_courses` on Mac Studio after ai-literacy fix**
The newest course (committed April 23) has not been imported since then. Expected: 4 new CourseModule rows + 17 new CourseLesson rows for ai-literacy. Command: `python manage.py import_frontend_courses` from `backend/`.

**P1.C: Bulk-generate quizzes for all 12 courses**
`POST /api/v1/academy/admin/bulk/quizzes/?course=<slug>` for each slug. The inline quiz questions in TS files are NOT in the DB — QuizEngine fetches from the DB API at `academy/quiz/<lessonId>/`. Without DB questions, every quiz falls back to `generateSampleQuestions()` (the generic PM questions). This is the root cause of the "generic PM question on AI Literacy quiz" bug reported in the alignment audit.
Sample output for 3 random questions per course before committing to the full batch.

**P1.D: Bulk-generate final exams for all 12 courses**
`POST /api/v1/academy/admin/bulk/exams/?course=<slug>`. Target: 20 questions, passing_score=80, time_limit=45. Without exam rows, cert gate cannot open for any course.

**P1.E: Add `difficulty` and `questionNL` fields to `QuizQuestion` type**
File: `frontend/src/data/academy/types.ts`. Extend `QuizQuestion` with:
- `difficulty?: 'easy' | 'medium' | 'hard'`
- `questionNL?: string`
- `optionsNL?: string[]`
- `explanationNL?: string`
This makes the existing leadership/ms-project NL fields type-safe and enables future difficulty calibration.

---

### P2 — Next Sprint (Before Learner Rollout)

**P2.A: Commission PRINCE2 7th Edition content update**
Delegate to `course-content`: update `prince2.ts` intro history section, themes overview, and tailoring lesson to reflect PRINCE2 7th Ed (PeopleCert 2023). Additions needed: sustainability theme, people considerations, updated exam format notes. The 7 principles, 7 themes, and 7 processes are structurally unchanged — quiz questions do not require rewrite, only contextual updates in transcripts. Estimated effort: 3–4 lessons, ~400 lines.

**P2.B: Add 2 missing SkillCategory rows and extend skill mappings**
Add categories: `technology` (for AI Literacy, digital tools) and `process-improvement` (for LSS, lean methods). Then add LessonSkillMappings for at minimum 2–3 skills per course × key lessons. Use `POST /bulk/skills/?course=<slug>` after categories exist. Target: 40% lesson coverage (≥76 lessons mapped) across the 12 courses.

**P2.C: Fix `ai-literacy` missing `keyTakeawaysEN` arrays**
Delegate to `course-content`: add EN bullet equivalents for all 10 NL-only `keyTakeaways` arrays in `ai-literacy.ts`. Low effort (~80 lines). Unblocks EN-language learners from seeing empty takeaway panels.

**P2.D: Formalize quiz question language policy**
Add to `QuizQuestion` type and document in a code comment: the canonical policy is NL-primary questions for NL-native courses (no `questionNL` needed), EN-primary questions with `questionNL` field for bilingual courses. Audit leadership.ts and ms-project.ts to confirm this pattern is correct and not accidental.

**P2.E: Add exam lessons to `leadership-pm` and `ms-project-masterclass`**
Both courses currently use a `type: 'quiz'` lesson as their terminal assessment. The cert-gate logic expects `type: 'exam'`. Without an exam lesson, certificate eligibility cannot be computed. Delegate to `course-content` to convert the final quiz block in each course to `type: 'exam'` and ensure it has ≥20 inline questions.

**P2.F: Module 4 of `ai-literacy` and Module 3 of `leadership-pm` need assessments**
Both have substantive video lessons in the final module with no quiz before the certificate. Delegate to `course-content` for a 5-question quiz lesson in each. This closes the "untested final module" gap that allows a learner to bypass all assessment before reaching the cert.

---

### P3 — Backlog

**P3.A: PRINCE2 "Foundation & Practitioner" title accuracy**
The course `prince2-foundation` is titled "PRINCE2 Foundation & Practitioner" but all quiz content is Foundation-level (recall). Either add Practitioner-level scenario questions (5–10 case-based questions requiring tailoring justification) or rename the course to "PRINCE2 Foundation." The current title creates a false expectation.

**P3.B: LSS Green Belt question depth**
`lean-six-sigma` has 3 questions for a Green Belt course — the minimum floor. The Measure, Analyze, and Improve phases each have a single video lesson with no dedicated quiz. Delegate to `course-content` for additional quiz questions in Modules 2–4 (Design of Experiments, hypothesis testing, measurement system analysis). Target: 15+ questions minimum across 5 modules.

**P3.C: `safe-scaling-agile` transcript stubs**
13 of 14 video lessons in SAFe are transcript stubs (empty body). The quizzes are SAFe-canonical and ready. Delegate to `course-content` for transcript expansion — the quizzes can be used as the content outline. This is the second-largest content gap after the PRINCE2 edition issue.

**P3.D: Add `difficulty` tagging to all existing quiz questions**
Once the `QuizQuestion` type is extended (P1.E), delegate to `course-content` for a tagging pass across all 248 inline questions. Use the qualitative Bloom assessment in Section 4.3 as a starting guide. Target distribution: 30/50/20 easy/medium/hard per course.

**P3.E: Commission LSS Black Belt course**
The only progression path in the LSS catalog is Green Belt → nothing. The `other-courses.ts` stub list does not include Black Belt. Recommend adding a `lean-six-sigma-black-belt.ts` stub to the roadmap and beginning content authoring. Pre-requisite: LSS Green Belt content depth must be improved first (P3.B).

**P3.F: `stakeholder-management` course development**
This is the one stub in `other-courses.ts` that has a clear demand signal (stakeholder management is in the skill taxonomy as `stakeholder-engagement`). Commission modules and lessons. Estimated scope: 3 modules, 12 lessons, 20 questions.

**P3.G: NL translation quality gate for bulk-generated content**
When bulk-generate runs for quizzes, the resulting `question_text_nl` fields will be AI-generated Dutch. Per the editorial anti-patterns, do not commit bulk-translated NL content without a human sampling pass. Define a sampling policy: review 10% of generated NL questions per course for fluency and accuracy before publishing.

---

## 9. Summary Scorecard

| Dimension | Score | Status |
|---|---|---|
| Catalog completeness (12 courses, modules, lessons) | 11/12 (ai-literacy moduleMap broken) | FAIL on 1 |
| Methodology freshness | 11/12 (PRINCE2 6th vs 7th) | FLAG |
| Question bank total | 248 inline | PASS |
| Quiz depth (≥3 per quiz lesson) | 11/12 (LSS at exact minimum) | MARGINAL |
| Bloom distribution | 2/12 excellent, 7/12 adequate, 3/12 recall-heavy | PARTIAL |
| Skills taxonomy coverage | 5/191 lessons mapped (2.6%) | FAIL |
| EN/NL lesson coverage | 2/12 bilingual, 10/12 NL-only | NL-first, EN gap |
| EN/NL quiz coverage | 2/12 bilingual, 10/12 NL-only | NL-first, EN gap |
| Course-level EN/NL | 12/12 | PASS |
| Exam readiness (20Q, inline or backend) | 1/12 (ai-literacy partial) | FAIL |
| Practice assignment coverage | 3/12 | FAIL |
| Backend import status | Unknown (API offline) | UNVERIFIED |
| `ai-literacy` moduleMap registration | NOT registered | BUG (P1) |

**Catalog health score: 4/13 checks passing.** The catalog is content-rich at the lesson/quiz level but operationally not cert-gate-ready. The critical path to a deployable state runs through: (1) the ai-literacy moduleMap fix, (2) `import_frontend_courses`, (3) bulk-generate quizzes + exams for all 12 courses, and (4) verifying the cert chain end-to-end via `academy-tester`.
