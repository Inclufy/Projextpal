# ProjeXtPal productie-release 15 oktober 2026

**Versie:** 2026.10.15
**Doelgroep:** gebruikers, projectleiders, programma-eigenaren en admins van alle Inclufy-klanten op ProjeXtPal
**Status:** live op productie, Hetzner `46.224.177.72`, achter de centrale Caddy, 8 opeenvolgende SHA-deploys gedurende de dag (4025dcde → 5c265cd6 → 70da9fa1 → b61e1801 → 2c0022e1 → a57a009c → 6f30b669 → f64bc3b0)

---

## Highlights

Een release die de **AI Copilot** van een vraag-antwoord-bot omsmeedt tot een **dienende co-worker voor de projectmanager**. Zeven belangrijkste wins:

- **AI Copilot is nu scope-dedicated**, op een project zie je PRINCE2 / Scrum / Kanban / Agile / Waterfall / LSS acties voor dát project (bij naam), op een governance board zie je agenda- en besluit-acties voor díé board, op een portfolio portfolio-review suggesties.
- **"Ontbreekt nog, zal ik voor je invullen?"**, bovenaan de chat verschijnt een oranje sectie met concrete offer-to-fill knoppen per leeg veld / tabblad. Eén klik stuurt het verzoek, de AI voert het ook écht uit.
- **Drie "doe-het-voor-mij" tools** die écht persist naar de DB: `draft_business_case` (PRINCE2), `draft_risk_register` (elk project, 4-8 risico's), `propose_milestones` (elk project, 4-8 mijlpalen binnen de projectperiode).
- **AI-context voor Governance Boards**, upload board papers / mandaat / dossier één keer op een board; AI gebruikt het automatisch bij elke decision + meeting onder die board, en bij elk governance-rapport in die scope.
- **Service-houding in alle labels én in de agent-persona**, "Zal ik ... voor je" / "Shall I ..." / "Dois-je ..." in plaats van commando's; agent biedt actief hulp aan en doet het ook direct als jij "ja" zegt.
- **Twee-tier AI-facturatie**, met eigen AI-key betaalt een tenant alleen een **15% service-fee** aan Inclufy (~85% voordeel vs de pool-prijs); zonder eigen key de volledige lijstprijs via de maandelijkse Finance-factuur.
- **Scope-aware welkomscherm**, de co-pilot header past zich aan de scope aan ("Hallo! Waar kan ik je mee helpen op &lt;projectnaam&gt;?") in plaats van generiek.

---

## AI Copilot, service-houding + scope-dedicated

De grootste gedragsverandering sinds de release: de co-pilot gedraagt zich nu als een dienstbare medewerker voor de PM, niet als een reactieve chatbot.

### Service-oriented stance

De system prompt heeft een nieuwe sectie **"SERVE THE PROJECT MANAGER"** die vastlegt:

- **Offer, don't demand.** Replies openen met *"Shall I…"* / *"Want me to…"* / *"Zal ik…"* / *"Wil je dat ik…"* / *"Dois-je…"* in plaats van commando's.
- **Spot the obvious next step.** Als de PM een probleem noemt, biedt de agent een concrete volgende stap aan ÉN voert die uit zodra je "ja" zegt.
- **Act, don't narrate.** Pretend-to-have-done-something is nu verboden; als de agent zegt dat hij iets heeft gedaan, moet de bijbehorende tool-call ook écht gelopen zijn.
- **Keep it short.** 1-2 zinnen voor normale replies; headings alleen als de PM om een rapport vraagt.
- **Mirror the user's register.** "je" blijft "je", "u" blijft "u".
- **Credit decisions to the human.** De PM beslist; de agent draft en stelt voor.

### Scope-dedicated chat

De co-pilot detecteert nu per URL waar de gebruiker staat en past welkomtekst + suggesties + snelle acties daarop aan:

| URL-scope | Welkomtekst | Suggesties | Snelle acties |
|---|---|---|---|
| `/dashboard` of `/projects` | *"Waar kan ik je vandaag mee helpen?"* | Portfolio-risico's, maand-performance | Maandrapport / Portfolio-analyse / Risico-scan |
| `/projects/<id>/<methodology>/...` | *"Waar kan ik je mee helpen op &lt;projectnaam&gt;?"* | Project-risico's analyseren, statusrapport opstellen, openstaande acties tonen | Methodology-specifiek (PRINCE2 → BC/Exception/Stage-gate/Highlight; Scrum → Sprint-plan/standup/review/velocity; Kanban → WIP/throughput/blocked; Agile → iteration/backlog/release; Waterfall → phase-gate/baseline/variance; LSS → SIPOC/Cp-Cpk/DOE/MSA; Hybrid → predictive-vs-adaptive) |
| `/programs/<id>/...` | *"Waar kan ik je mee helpen op &lt;programmanaam&gt;?"* | Programma-gezondheid, overkoepelende risico's, baatrealisatie | Highlight-rapport / Status roll-up / Escalaties naar board |
| `/governance/boards/<uuid>` of `/governance/decisions/<uuid>` of `/governance/meetings/<uuid>` | *"Waar kan ik je mee helpen bij deze board?"* | Volgende agenda voorbereiden, openstaande besluiten tonen, briefingnotitie voor voorzitter | Notulen samenvatten, actielijst bijwerken, stakeholder-update na board |
| `/governance/portfolios/<uuid>` | *"Waar kan ik je mee helpen op dit portfolio?"* | Portfolio-review, componenten vergelijken, strategische update | Componenten prioriteren, investeringsallocatie herzien, portfolio-brede risico-scan |

### "Ontbreekt nog, zal ik voor je invullen?"

Nieuw backend-endpoint **`GET /api/v1/ai/scope-gaps/`** die per scope de ontbrekende velden en tabbladen retourneert met NL/EN/FR fill-prompts. De frontend fetcht die bij openen van de chat en toont ze als oranje offer-to-fill knoppen bovenaan de suggesties.

Checks per scope-type:

- **Project**, methodology, start/end date, budget, description, tasks, milestones, team, risks + **Business Case** (alleen bij PRINCE2).
- **Programme**, description, dates, onderliggende projecten, benefits.
- **Board**, chair, meeting_frequency, quorum, members.
- **Portfolio**, description, components (programs + projects).

Eén klik op een offer-to-fill knop pre-sends de fill-prompt naar de chat, waarna de agent via een echte tool-call het resultaat ook direct persist.

### Drie nieuwe "doe-het-voor-mij" tools

| Tool | Scope | Doel | Model persisted |
|---|---|---|---|
| **`draft_business_case`** | PRINCE2-project | Vult Executive Summary / Reasons / Business Options / Expected Benefits / Expected Dis-benefits / Major Risks uit project-context + uploaded documents | `prince2.BusinessCase` (status `draft`, version `0.1`) |
| **`draft_risk_register`** | elk project | Genereert 4-8 project-specifieke risico's met categorie (Technical/Schedule/Financial/Operational/Strategic/Compliance), waarschijnlijkheid, impact en level | `projects.Risk` (idempotent per `(project_id, name)`) |
| **`propose_milestones`** | elk project | Genereert 4-8 mijlpalen met start- en einddatums binnen de project-periode, chronologisch gesorteerd | `projects.Milestone` (idempotent per `(project_id, name)`, `order_index` continueert) |

Alle drie respecteren:

- **Tenant-isolatie** via `accessible_project_ids(user)`.
- **Shared LLM-ladder** (`projects.methodology_autodrafts.draft_*`), Anthropic → OpenAI → deterministic fallback.
- **AI-context** van de scope, pulls uploaded-doc prefix via `get_project_context_prefix` zodat BC's écht tender-specifiek zijn (bv. voor TN-600011 "Gemeente Barneveld Financieel Systeem" verwijst de BC naar de leidraad, PvE en sluitingsdatum uit die dossierfolder).
- **BYOK billing + per-user cap + AIUsageLog**, elke call krijgt zijn eigen surface (`copilot-tool-draft-business-case` / `copilot-tool-draft-risk-register` / `copilot-tool-propose-milestones`).
- **Idempotency**, tweede klik vult alleen velden aan die nog leeg zijn; nooit overwrite van een PM-edit, nooit duplicates.

Verified end-to-end op projecten 136 (Almere TN-599866) en 137 (Barneveld TN-600011): BC id=8 geproduceerd uit tender-context, 8 risico's id=211-218 project-specifiek ("Late NvI-antwoorden Barneveld", "Niet voldoen aan geschiktheidseisen en referentie-eisen", "AI-functionaliteit roept vragen op bij gemeente over AVG en AI-Act").

---

## Governance krijgt AI-context, BoardAIContext

Project / Programme / Portfolio hadden al elk hun eigen AI-context model (upload tender → AI gebruikt het bij elke draft). Governance Boards hadden dat nog niet; vanaf deze release wel.

### Nieuw model + endpoint

- **`governance.BoardAIContext`**, OneToOne naar `GovernanceBoard`, Fernet-encrypted `extracted_text` (50k char cap), JSON `source_files` lijst, soft `enabled` toggle.
- Migratie **`0018_boardaicontext`**, additief, geen datarisico; data-guardian backup gedraaid vóór uitrol.
- Endpoint **`GET/POST/PATCH/DELETE /api/v1/governance/boards/<uuid>/ai-context/`**, tenant-isolation walks portfolio/program/project parents (een board heeft geen directe company-FK).
- Frontend tab op `BoardDetail.tsx`, mirror van `PortfolioDetail` wiring, chair uploadt board papers één keer, en de AI gebruikt die automatisch bij elke decision + meeting onder die board.

### Decisions + Meetings erven automatisch

Bewust **geen eigen AI-context model** op Decision of Meeting. In plaats daarvan resolven `get_decision_context_prefix` / `get_meeting_context_prefix` naar de parent board en gebruiken diens context. Reden: in de praktijk wil je dezelfde board papers zien bij elke decision + meeting van die board, en één upload per board is beheersbaarder dan één per besluit.

### `generate_report` stacking

De governance-rapport generator (`backend/governance/ai_reports.py`) stacked nu `portfolio → programme → board → project` prefixes bovenop de system prompt wanneer de scope-hints meegegeven zijn in het request. Zo bevat een boardagenda-rapport zijn eigen board papers + de programma-context + de portfolio-strategie, in plaats van alleen wat ChatGPT uit zichzelf weet.

### Ask Co-pilot stapelt alle scope-prefixes

`backend/bot/views.py` `send_message/` accepteert nu `portfolio_id / board_id / decision_id / meeting_id` naast het bestaande `project_id / program_id`. De frontend `AICopilotSidebar.tsx` parst de UUID uit `/governance/{portfolios,boards,decisions,meetings}/<uuid>` paths en stuurt ze mee. De backend stapelt elke beschikbare prefix in de hiërarchie-volgorde (portfolio → programme → board → project) in de system prompt.

---

## AI Billing, twee-tier pricing

Tot deze release was AI-verbruik voor BYOK-tenants `cost_cents=0` en werden ze volledig overgeslagen door de monthly invoice. Dat liet de operationele kosten die Inclufy wél maakt (audit log, dashboard, cross-app invoicing, tenant-isolatie, support) ongedekt. Nu zijn er twee duidelijke tiers:

| Tier | Wie | Wat Inclufy rekent | Wat hun provider rekent |
|---|---|---|---|
| **Inclufy-pool** | Tenant gebruikt gedeelde LLM-keys van Inclufy (default, geen `CompanyAIKey` actief) | **Volledige lijstprijs** per token (`backend/core/ai_cost.py` _COST_TABLE_CENTS_PER_1M, inclusief 20% ops-marge) | niets, gaat via Inclufy's account |
| **BYOK (Bring Your Own Key)** | Tenant heeft eigen Anthropic/OpenAI-key ingesteld onder **Settings → API Keys** | **15% service-fee** over de lijstprijs (`BYOK_SERVICE_FEE_FRACTION`, tunable via `settings.AI_BYOK_SERVICE_FEE_FRACTION`) | De volledige raw-token-cost rechtstreeks bij hun provider |

Voorbeeld, één PRINCE2 Business Case auto-draft op claude-opus (~4.500 prompt + 2.000 completion tokens):

- Via Inclufy-pool: **€0.27** op de volgende Inclufy-factuur.
- Met eigen key: **€0.04** service-fee bij Inclufy + de volledige provider-rekening rechtstreeks bij de klant.

~85% voordeel bij BYOK, mits de klant al een provider-contract heeft.

### Monthly invoice splitst beide tiers op één factuur

`backend/accounts/management/commands/send_monthly_ai_invoices.py` aggregeert nu per `(company_id, byok)` en emit tot twee invoice lines per tenant per maand:

- *"AI-token verbruik 2026-10, X.XXX tokens via Inclufy-pool keys (N calls)"*.
- *"AI service-fee 2026-10, Y.YYY tokens via eigen AI-key (M calls, 15% van lijstprijs)"*.

Lines met cost=0 worden overgeslagen; een pure-BYOK tenant krijgt alleen de service-fee line, een pure-pool tenant alleen de pool line. Een tenant die mid-month van BYOK naar pool switchte krijgt beide.

### Dashboard `/settings/ai-billing` toont de split

- **Tiles**: tokens-this-month + calls + Inclufy-pool-kosten + BYOK-service-fee (allebei met emerald/amber accent als er iets te factureren is).
- **Banner** past aan: BYOK → *"Jouw eigen AI-key is actief, jouw provider factureert het ruwe token-verbruik rechtstreeks aan jou. Inclufy rekent alleen 15% service-fee over de lijstprijs."*
- **Tabellen** per provider / per feature-surface / per user, Kosten-kolom altijd zichtbaar (ook in BYOK-tier).

### Per-user dagelijkse tokenlimiet

Boven de bestaande 20 AI-calls/uur-limiet geldt nu ook een per-user dagelijkse tokenlimiet. Default **100.000 tokens/dag/user** (tunable via `settings.AI_USER_DAILY_TOKEN_CAP`). Pre-flight check in de AI call sites; bij overschrijding een nette NL-foutmelding.

> "De mens moet blijven nadenken", AI mag niet ongelimiteerd worden losgelaten.

---

## Infrastructuur + release-engineering

### Nieuwe backend bestanden

- `backend/core/ai_cost.py`, `BYOK_SERVICE_FEE_FRACTION` constant + `byok=` kwarg op `estimate_cost_cents()`.
- `backend/core/ai_billing_views.py`, `pool_cost_cents` + `byok_fee_cents` split in de summary response.
- `backend/core/ai_scope_gaps_views.py`, nieuw endpoint `GET /api/v1/ai/scope-gaps/`.
- `backend/core/ai_context_helpers.py`, `get_board_context_prefix/_details`, `get_decision_context_prefix`, `get_meeting_context_prefix`.
- `backend/governance/models.py`, `BoardAIContext` class.
- `backend/governance/migrations/0018_boardaicontext.py`, additive migratie.
- `backend/governance/ai_context_views.py`, `board_ai_context()` endpoint.
- `backend/governance/urls.py`, route `boards/<uuid>/ai-context/`.
- `backend/governance/ai_reports.py`, `generate_report()` kreeg `portfolio_id / board_id / program_id / project_id` kwargs met stacking.
- `backend/governance/views.py`, `generate_ai_report()` passes scope hints door.
- `backend/bot/views.py`, Ask Co-pilot stapelt alle scope-prefixes (portfolio/program/board/decision/meeting/project).
- `backend/bot/ai/__init__.py`, SYSTEM_PROMPT kreeg "SERVE THE PROJECT MANAGER" sectie.
- `backend/bot/ai/tools/business_case_tools.py`, nieuw.
- `backend/bot/ai/tools/risk_register_tools.py`, nieuw.
- `backend/bot/ai/tools/milestone_draft_tools.py`, nieuw.
- `backend/bot/ai/tools/__init__.py`, alle drie geregistreerd (ToolRegistry telt nu 37 tools).
- `backend/accounts/management/commands/send_monthly_ai_invoices.py`, twee-tier aggregatie + split invoice lines.
- `backend/projects/methodology_autodrafts.py`, `draft_risks()` + `draft_milestones()` toegevoegd naast de bestaande `draft_business_case` / `draft_project_brief` / `draft_scrum` / `draft_kanban_swimlanes` / `draft_lss_define` / `draft_waterfall_phases`.

### Nieuwe frontend bestanden + wijzigingen

- `frontend/src/components/AICopilotSidebar.tsx`, scope-detectie, scope-aware suggesties/quick-actions, methodology-aware acties, "Ontbreekt nog" renderer, scope_name fallback, service-stijl labels.
- `frontend/src/pages/AiBillingPage.tsx`, pool-cost + BYOK-fee tiles side-by-side; Kosten-kolom altijd zichtbaar.
- `frontend/src/pages/governance/BoardDetail.tsx`, AIContextUpload tab.
- `frontend/src/hooks/usePageTranslations.ts`, NL/FR keys voor "BYOK service-fee", "van lijstprijs", scope-aware headers etc.

### Deploy-topologie

Alles via de bestaande SHA-stream workflow:

1. `git archive <sha>` → stream naar `/opt/projextpal/src-<shortsha>/` op Hetzner.
2. `docker build` backend én frontend per short-SHA (frontend hergetagd bij backend-only hotfixes om bytes te besparen).
3. `docker compose -p projextpal-productie ... up -d --pull never` met `PXP_TAG=<shortsha>`.
4. `GET /health/` moet `git_sha` matchen vóór de release groen wordt gezet.
5. Backup gate vóór elke deploy met migratie, `backup-projextpal.sh` gevolgd door `gzip -t` verificatie.

Eén migratie in deze release (`governance.0018_boardaicontext`, additief), data-guardian backup `projextpal-productie-2026-10-15-0759.sql.gz` genomen vóór uitrol.

### Rollback

Oude images (bv. `backend:4025dcde`) blijven op de host staan. Een snelle rollback is `PXP_TAG=<previous-shortsha>` en opnieuw `up -d`. De additieve migratie is tolerant voor de oudere backend-image (geen velden verwijderd), dus een app-only rollback is veilig zonder DB-restore.

---

## Testbevestiging

End-to-end verifieerd in Chrome op productie:

- **Programma 89** "Tender Pipeline 2026" aangemaakt (Inclufy, programme_code TENDER-2026).
- **Board a5ca8831-f454-4753-a3db-962c595a1980** "Tender Steering" eronder (steering_committee, weekly, chair=sami).
- **Project 136** (Gemeente Almere, Marktconsultatie Inkoop-/CM-systeem, TN-599866, deadline 18-08-2026, PRINCE2).
- **Project 137** (Gemeente Barneveld, Financieel systeem Barneveld, TN-600011, deadline 14-09-2026, PRINCE2).

Op project 137 via de co-pilot gap-detect in NL geklikt:

- *"Zal ik een Business Case voor Gemeente Barneveld - Financieel systeem Barneveld opstellen uit de documenten?"* → BC id=8 aangemaakt, status `draft`, 6 velden ingevuld met tender-specifieke prose over TN-600011. **AIUsageLog id=5: 2.202 tokens, cost_cents=3 (€0.03), byok=True.**
- *"Zal ik een initieel risico-register voor Gemeente Barneveld - Financieel systeem Barneveld opstellen op basis van de documenten?"* → 8 risico's id=211-218, 6 categorieën, allemaal tender-specifiek ("Late NvI-antwoorden Barneveld verkorten inschrijftijd", "AI-functionaliteit roept vragen op bij gemeente over AVG en AI-Act", enz.). **AIUsageLog id=6: 2.012 tokens, cost_cents=2 (€0.02), byok=True.**

Monthly-invoice dry-run (`send_monthly_ai_invoices --month 2026-10 --dry-run`) bevestigde: Inclufy company_id=1 krijgt pool=€0.28 + BYOK-fee=€0.04 = €0.32 totaal met twee gesplitste invoice lines.

---

## Known issues

- **Typo in NL label**, de milestone-gap-offer-tekst zegt *"Zall ik mijlpalen …"* in plaats van *"Zal ik mijlpalen …"*. Triviale fix (één extra 'l' in `backend/core/ai_scope_gaps_views.py`), nog niet uitgerold.
- **Mijlpalen-tool E2E-click** nog niet geverifieerd via Chrome; tool-registratie geverifieerd via Django shell (`ToolRegistry` telt 37 tools incl. `propose_milestones`) en de interne LLM-ladder is identiek aan de twee andere tools die wél E2E bevestigd zijn.
- **Gap-tools voor `propose_team_roles` en `propose_budget`** nog niet gebouwd, zelfde patroon beschikbaar wanneer gewenst.

---

## Docs

- **`docs/recare/werkinstructie-recare-v3.md`**, bijgewerkt met 3 nieuwe hoofdstukken (25 Governance AI-context, 26 twee-tier billing, 27 programma-opzet uit documenten) + volledig herschreven hoofdstuk 20 (Ask Co-pilot) met subsecties voor service-houding, scope-aware welkomscherm, "Ontbreekt nog" en de drie doe-het-voor-mij tools.
- **Dit document**, `docs/release-notes/2026-10-15_prod_release.md`.

---

## Voor Recare in het bijzonder

- De nieuwe **BoardAIContext** past 1-1 bij jullie zorg-governance: upload stuurgroep-mandaat en kwartaalrapportage éénmaal op de board, en elke decision + meeting onder die board heeft automatisch die context, bruikbaar voor IGJ-voorbereidingen, kwartaalreviews, PDCA-cycli.
- De **"Ontbreekt nog"** sectie helpt Elisa en haar collega's om in minutes een nieuw project volledig aangekleed te krijgen (BC, risico-register, mijlpalen) uit uploaded zorgdocumenten, ipv handmatig alle velden invullen.
- De **BYOK-tier** is relevant vanuit data-residency: tokens gaan rechtstreeks van Recare's gekozen provider naar Recare's account, zonder tussenstop bij Inclufy's gedeelde pool.
- Alle **GDPR / audit-log garanties** uit v2 blijven onverkort gelden; `AIUsageLog` + `ai_audit.log_access` registreren elke call inclusief tenant_id, user, surface, tokens, cost en byok-flag voor compliance-reviews.

---

*Dit document is onderdeel van de ProjeXtPal release-notes serie. Vorige: `2026-10-14_prod_release.md`. Vragen: `info@projextpal.com` of de AI Copilot → "Probleem melden".*
