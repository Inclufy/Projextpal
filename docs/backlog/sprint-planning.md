# ProjeXtPal — Sprint planning backlog

**Owner:** sami@inclufy.com
**Scope:** levende backlog van kandidaten voor de eerstvolgende sprints van ProjeXtPal + de Inclufy Control Tower issue-pipeline.

Elke entry hieronder is een **kandidaat** — geprioriteerd op ROI en afhankelijk van live telemetrie en klantfeedback. Verfijning (story-points, acceptance criteria, UI-mock) gebeurt pas als een entry daadwerkelijk in een sprint wordt getrokken.

---

## Sprint 12 (kandidaat) — Decision-request flow in auto-fix pipeline

**Thema:** Voorkom "✓ klaar (geen wijziging)" sinkhole in sonar-fix-worker / issue-fix-pr ladder.

**Scope (~15-20 pt):**

1. Nieuwe ProductIssue status `needs_decision` + Supabase migratie in Control Tower
2. Worker extension: als AI-ladder (aider/deepseek/gemini/ollama) `final = "geen wijziging + reason starts with 'vereist beslissing'"` → nieuwe LLM-call "formulate 3 concrete yes/no or multi-choice questions"
3. UI: Issue hub + ProductIssue detail toont vragen + "Answer" button (form met per-vraag input)
4. Reply mechanism: antwoorden landen als `metadata.decisions` → trigger nieuwe worker-run met decision-context
5. Email thread: Resend email naar reporter met inline-reply ("Reply with: Q1=A, Q2=B, Q3=C") → mailbox parser → store answers → trigger re-run
6. Decision history: elke beslissing persisteerd per issue voor audit

**Rationale:** Bugs zoals `#38 ai-plan 64s latency` zijn geen one-shot fix — ze vereisen een architectuurkeus (streaming vs. async job vs. acceptable). Nu stopt de pipeline silently. Met decision-flow blijft de pipeline doorgaan zodra een mens 3 keuzes beantwoord heeft.

**Impact:** ROI meten eerst via productie-telemetrie: hoeveel issues per week krijgen `geen wijziging` label? Als >5/week dan is deze feature zinvol.

**Risks:** email-parsing is fragile; UI moet alle locales ondersteunen; cognitive load op reporter mag niet te hoog zijn (max 3-5 vragen per fix).
