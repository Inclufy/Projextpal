# Yanmar deep-dive — afvinklijst (8 juni)

> Demo-project: **Renovation Phase 2** (Yanmar Europe Demo) — gebruik dit project voor alle stappen.
> Status per item: ✅ live & demobaar · 🟡 deels (infra/contract) · 🔴 uitgesteld (Phase-2).
> Vink af tijdens de meeting. Bron: `requirements-checklist.yaml` + `yanmar-realisation-audit.md` (30/34 PASS).

---

## 0. Opening (1 min)
- [ ] Login + open project **Renovation Phase 2**
- [ ] One-liner: *"Alle vier Yanmar-templates 100% met live data; 30/34 PASS, 97% dekking. Openstaand = alleen infra/contract."*

---

## 1. Action Tracker — ✅ 5/5
| ✓ | ID | Toon | Waar |
|---|---|---|---|
| [ ] | ATR-01 | Category-kolom + sub-totalen | PRINCE2 dashboard → **TaskCategorySubtotals** |
| [ ] | ATR-02 | RACI (R/A/C/I los toewijsbaar) | **Planning → RACI** |
| [ ] | ATR-03 | Revised due / Completed / Delay | Activity List / RACI (delay_days) |
| [ ] | ATR-04 | 5-staps voortgang ○◔◑◕● | RACI-matrix **ProgressDots** (klik-to-set) |
| [ ] | ATR-05 | KPI Today/Tomorrow/Week/Next | PRINCE2 dashboard **TaskKpiTiles** |
| [ ] | **Bonus** | **Action Tracker** als eigen scherm (Nr·Action·Owner·Raised·Due·Priority·Status) | **Action Tracker** subtab |

## 2. Project Plan — ✅ 9/9
| ✓ | ID | Toon | Waar |
|---|---|---|---|
| [ ] | PP-01 | 6 rollen (Owner/PM/Leader/Facilitator/Outside Eyes/Stakeholders) | RACI-pagina rol-toewijzing |
| [ ] | PP-02 | Scope IN / OUT apart | **Project Charter** / project edit |
| [ ] | PP-03 | Impact / Solution / ROI | Project Charter "Project Plan Details" |
| [ ] | PP-04 | Start / Target Impl / Target End | Project Charter datums |
| [ ] | PP-05 | Push-back-regel (1×, max 14 dgn, dan akkoord) | due-date wijzigen → **DueDateChangeRequest** queue |
| [ ] | PP-06 | RAID (Risks/Assumptions/Issues/Dependencies) | de 4 registers |
| [ ] | PP-07 | Senior Manager sign-off (handtekening) | PRINCE2 closure → **ProjectSignOffDialog** |
| [ ] | PP-08 | Communicatieplan (kickoff/onboarding/regular/closing) | **FoundationCommunicationPlan** |
| [ ] | PP-09 | Generieke afsluit-workflow | Foundation overview → **Close project** |
| [ ] | PP-export | Project Plan **DOCX-export** = Yanmar-template | export-knop → project-plan.docx |

## 3. Highlight Report — ✅ 6/6
| ✓ | ID | Toon | Waar |
|---|---|---|---|
| [ ] | HR-01 | Sponsor / PM / Senior Supplier / Objectives | Highlight Report header |
| [ ] | HR-02 | Maand-fasetijdlijn (Prepare/Renovations/Run) | phase-timeline pills |
| [ ] | HR-03 | 4-assige RAG (Budget/Planning/Resources/Overall) | RAG-blok |
| [ ] | HR-04 | Financials incl. ETC + Variance | **BudgetOneView** op Highlight Report |
| [ ] | HR-05 | 5×5 Risk Map | **RiskHeatmap** op risicoregister |
| [ ] | HR-06 | Highlights / Lowlights + Issues + Risks | narrative-blokken |
| [ ] | HR-export | **PPTX-export** = Yanmar-template | export-knop → highlight-report.pptx |

## 4. Meeting Minutes — ✅ 5/5
| ✓ | ID | Toon | Waar |
|---|---|---|---|
| [ ] | MM-01 | Invited / Attended / Absent | **ExecutionMeeting** attendees |
| [ ] | MM-02 | Actiepunten met PIC + due + status | meeting action-items tabel |
| [ ] | MM-03 | Vorige acties carry-forward | **carry-forward**-knop + previous-meeting selector |
| [ ] | MM-04 | Customer/Supplier ↔ YEU + meeting room | meeting header |
| [ ] | MM-05 | Agenda / Discussion / Conclusions | meeting body |
| [ ] | MM-bonus | **AI-minutes uit transcript** + **PDF-download met logo** + **e-mail/.ics** | meeting → AI minutes / download / share |

## 5. Sales / Contract — 5 ✅ / 3 🟡 / 1 🔴
| ✓ | ID | Toon / Zeg | Status |
|---|---|---|---|
| [ ] | SC-02 | BYO LLM-key (Yanmar's eigen key, encrypted at rest) | ✅ |
| [ ] | SC-04 | Project-level isolatie (multi-tenant) | ✅ |
| [ ] | SC-05 | Role-based cost/rate-zichtbaarheid (P0, geverifieerd) | ✅ |
| [ ] | SC-06 | Geen 3rd-party analytics (alleen Sentry) | ✅ |
| [ ] | SC-08 | Multi-methodologie in één programma | ✅ |
| [ ] | SC-01 | AWS single-tenant hosting | 🟡 *infra-beslissing — zie aws-topology + estimate* |
| [ ] | SC-03 | GDPR: EU-compute + audit-trail | 🟡 *audit-trail done; EU-compute = hosting* |
| [ ] | SC-09 | Live/streaming dashboards (WebSocket) | 🟡 *deferred — vereist ASGI-switch* |
| [ ] | SC-07 | SAP S/4HANA system of record | 🔴 *bewust Phase-2 SOW — zie estimate* |

---

## 6. Afsluiting (2 min)
- [ ] Samenvatten: **alle templates 100% live**, alleen infra/contract open
- [ ] **AWS + SAP estimate** tonen (`docs/sales/aws-sap-sales-overview.md`) → vervolgafspraak
- [ ] Pilot voorstellen (hosting PoC + SAP push-only) → go/no-go
- [ ] Actiepunten vastleggen (in de demo zelf: maak een meeting + action items → laat de loop zien)

---

### Caveats vooraf (eerlijk benoemen)
- **SC-01 / SC-03**: EU-compute + single-tenant AWS = hostingkeuze, niet een productgat → estimate ligt klaar.
- **SC-09**: dashboards zijn current-on-fetch (geen live push) — voldoende voor demo; WebSocket is een latere infra-stap.
- **SC-07 SAP**: bewust uitgesteld naar Phase-2 SOW (afgesproken).
