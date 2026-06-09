# Realisatieplan — AI-projectintake & adaptieve tailoring

Status: voorstel (pre-build). Mockup: `docs/mockups/ux-ai-intake-mockup.html`.
Doel: bij projectaanmaak bepaalt AI uit één beschrijving de **methodiek + projecttype + projectvorm (Light/Medium/Heavy)**, stemt de **schermweergave** af op PM-ervaring en het **opleidingspad** op methodiek-kennis — zónder bestaande functionaliteit te verbergen (alles blijft bereikbaar onder "Meer").

---

## 1. Datamodel

### 1a. `UserMethodologyProfile` (1-op-1 met CustomUser) — herbruikbaar over projecten
| Veld | Type | Doel |
|---|---|---|
| `user` | OneToOne(CustomUser) | eigenaar |
| `pm_experience` | char(beginner/gevorderd/pro) | → schermweergave (density/begeleiding) |
| `methodology_competence` | JSON `{prince2:"none|basis|ervaren|expert", scrum:…}` | per methodiek; voedt opleiding/coach + toekomstige aanbeveling |
| `preferred_methodology` | char, null | optionele voorkeur |
| `updated_at` | datetime | recentheid → "opfris?"-trigger |

> Reden voor profiel i.p.v. per-project: kennis verandert niet per project. Eén keer invullen, AI hergebruikt het ("je kent Scrum al → aanbevolen, geen cursus").

### 1b. `ProjectTailoring` (1-op-1 met Project)
| Veld | Type | Doel |
|---|---|---|
| `project` | OneToOne(Project) | — |
| `project_type` | char (klant/intern/gereguleerd/strategisch/product) | template-archetype |
| `dim_scope/budget/duur/politiek/risico/regel` | int 1–3 | de 6 dimensies |
| `team_size` | char (s/m/l) | projectfeit → voedt scope |
| `departments` | int | projectfeit → voedt scope/politiek |
| `shape` | char (light/medium/heavy) | berekende vorm |
| `recommended_modules` | JSON list | welke tabs "Aanbevolen" |
| `ai_rationale` | text | onderbouwing (ook naar PID) |
| `source` | char (ai/manual) | herkomst |

`Project.methodology` (bestaat al) + `Project.pm_can_authorize` (bestaat al) blijven leidend; tailoring is een aanvulling, geen vervanging.

### 1c. Academy-koppeling
- `methodology → course_slug` mapping (config in `academy/` of een kleine `MethodologyCourse`-tabel).
- Bij "plan de cursus": maak een Academy-enrollment (bestaande enroll-flow).
- `coach_mode` → bool op `ProjectTailoring` (inline uitleg in de methodiek-pagina's).

Migraties: 3 modellen → `makemigrations` + idempotent maken (drift-patroon) → **data-guardian backup verplicht** vóór deploy (live klanten zanjabil + recare).

---

## 2. AI-intake endpoint

`POST /api/v1/projects/intake/analyze` — body `{description}` → response:
```json
{ "methodology":"prince2","methodology_confidence":"hoog",
  "project_type":"gereguleerd",
  "dimensions":{"scope":2,"budget":2,"duur":2,"politiek":3,"risico":3,"regel":3},
  "shape":"heavy",
  "rationale":"…",
  "recommended_modules":["Overview","Business Case",…] }
```
- LLM via bestaande `core/llm_keys.get_openai_client(company)` / `get_anthropic_client` (per-tenant key, al aanwezig).
- **Deterministische fallback** (de keyword-heuristiek uit de mockup) als er geen key is of de call faalt → feature werkt altijd, ook offline/zonder AI-budget.
- Classificatie tegen de echte `METHODOLOGY_CHOICES` (inclufy/prince2/agile/scrum/kanban/waterfall/lss-green/lss-black/hybrid). Bij lage zekerheid → `inclufy` (gecureerde default = USP).
- Rate-limit + audit (`accounts.audit("project.ai_intake")`).

---

## 3. Module-aanbevelingsengine (server-side config)
Eén bron van waarheid: per methodiek een lijst `(module, base_level 1-3, optional trigger_dim)`.
- `recommended = base_level <= shape_level` OF `trigger_dim hoog`.
- Drijft zowel de wizard-preview als de echte sidebar (geen dubbele logica).
- Sidebar rendert **alles**, gesplitst in "Aanbevolen voor dit project" + "Meer" (collapsible). Niets verdwijnt.

---

## 4. Frontend — wizard bij projectaanmaak (5 stappen, zoals mockup)
1. **Beschrijf** (vrije tekst + voorbeelden) → `intake/analyze`.
2. **AI-voorstel** (methodiek + type, beide overschrijfbaar).
3. **Kennis & opleiding**: (a) PM-ervaring → weergave; (b) methodiek-kennis → opleiding/coach; (c) kennis overige methodieken → profiel; Academy-nudges.
4. **Verfijn**: projectfeiten (teamgrootte, afdelingen) + 6 dimensies (AI voor-ingevuld).
5. **Vorm & tabs**: shape + aanbevolen tabs + leer-blok + PID-onderbouwing → **Project aanmaken**.

Hergebruik bestaande `MethodologyFlow`-stepper-component waar mogelijk. Opslaan: `UserMethodologyProfile` (upsert) + `ProjectTailoring` + `Project.methodology`.

---

## 5. Fasering
| Fase | Inhoud | Risico |
|---|---|---|
| **F1** | Modellen + migraties + recommendation-engine + "Aanbevolen/Meer"-sidebar (statisch, zonder AI) | laag — geen AI-afhankelijkheid |
| **F2** | `intake/analyze` met deterministische fallback + wizard stap 1–2 | laag |
| **F3** | Stap 3 kennis/opleiding + Academy-enroll + coach-mode | midden (raakt Academy) |
| **F4** | LLM-classificatie aanzetten (boven de fallback) + telemetrie | midden |

Elke fase los deploybaar. F1 levert al waarde (rustigere sidebar) zonder AI.

---

## 6. Te bevestigen vóór build
- Akkoord op 3 nieuwe modellen (→ migratie → data-guardian backup).
- Wizard verplicht of overslaanbaar ("Sla over, ik kies zelf")? (advies: overslaanbaar)
- Mag de AI-intend de methodiek **automatisch zetten**, of altijd alleen **voorstellen** (mens bevestigt)? (advies: altijd voorstellen)
