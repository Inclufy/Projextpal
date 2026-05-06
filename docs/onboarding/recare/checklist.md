# Recare × ProjeXtPal — Implementatie Checklist tot Go-Live

> Werkdocument voor de onboarding van Recare op ProjeXtPal.
> Eigenaar: Elise (Recare PM) + ProjeXtPal CSM.
> Status: levend document — bijwerken na elke milestone.

---

## Legenda

- `[ ]` open
- `[~]` in uitvoering
- `[x]` afgerond
- **Owner**: `R` = Recare · `P` = ProjeXtPal · `R+P` = gezamenlijk

---

## Fase 0 — Vóór de kickoff (D-1)

### 0.1 Tenant & accounts
- [ ] Tenant "Recare" aangemaakt in Admin Portal — *P*
- [ ] Subscription plan geactiveerd — *P*
- [ ] Subdomein/branding gecontroleerd — *P*
- [x] Elise uitgenodigd als eerste tenant-admin — *P* · done 2026-05-06
- [ ] Welkomstmail + inloglink ontvangen en getest — *R*

### 0.2 Voorbereiding kickoff
- [ ] Agenda 90 min gedeeld met Elise — *P*
- [ ] 1-pager "Wat brengt ProjeXtPal" verstuurd — *P*
- [ ] Elise heeft 1–2 lopende projecten geselecteerd als pilot-case — *R*
- [ ] Recare-website getest in `/api/onboarding/analyze-company/` — *P*
- [ ] Handmatige fallback-data klaargezet voor analyse — *P*

---

## Fase 1 — Kickoff sessie (Dag 0)

### 1.1 Doelen vastleggen
- [ ] Drie succescriteria voor 90 dagen vastgelegd — *R+P*
- [ ] Sponsor binnen Recare benoemd — *R*
- [ ] Action log aangemaakt en gedeeld — *P*

### 1.2 Onboarding wizard doorlopen
- [ ] Fase 1 — Bedrijfsanalyse: AI-resultaat gevalideerd door Elise — *R+P*
- [ ] Fase 2 — Configuratie: methodologie gekozen (`prince2` / `agile` / `hybrid` / …) — *R*
- [ ] Fase 2 — Team-rollen gedefinieerd — *R*
- [ ] Fase 2 — Currency `EUR`, time tracking, risk, governance modules ingesteld — *R+P*
- [ ] Fase 3 — Setup-suggestie bevestigd (fasen, deliverables, governance, risks) — *R+P*
- [ ] Demo-data gegenereerd voor oefenproject — *P*

### 1.3 Pilot-project opzetten
- [ ] Echt Recare-project aangemaakt (geen demo) — *R+P*
- [ ] Scope, milestones, fasen ingericht — *R*
- [ ] Team toegevoegd — *R*
- [ ] Eerste 5–10 tasks aangemaakt — *R*
- [ ] Risico-register met minimaal 3 risks — *R*
- [ ] Budget ingevoerd — *R*

### 1.4 Vervolgafspraken
- [ ] Wekelijkse check-in 30 min ingepland eerste maand — *R+P*
- [ ] Discovery-sessie 2u in week 1 ingepland — *R+P*
- [ ] 30-dagen review met sponsor ingepland — *R+P*

---

## Fase 2 — Discovery & configuratie (Week 1)

### 2.1 Organisatie & tenant (compleet)
- [ ] Officiële naam, KvK, BTW, factuuradres ingevoerd — *R*
- [ ] Tijdzone `Europe/Amsterdam` bevestigd — *P*
- [ ] Voorkeurstaal per user-groep (NL/EN) afgestemd — *R*
- [ ] Eén tenant of meerdere business units besluit — *R+P*

### 2.2 Users & rollen
- [ ] Back-up tenant-admin aangewezen — *R*
- [ ] Rol-mapping gedefinieerd (PM, teamlid, viewer, sponsor, finance) — *R+P*
- [ ] Eventuele custom rollen aangemaakt (bv. Zorgcoördinator, Kwaliteitsfunctionaris) — *P*
- [ ] Permission matrix gedeeld en goedgekeurd — *R*
- [ ] Sleutelusers (3–5) uitgenodigd en ingelogd — *R+P*
- [ ] Aparte permissies finance-data ingesteld — *P*

### 2.3 Authenticatie & security
- [ ] 2FA-policy bepaald (verplicht admin / verplicht alle) — *R+P*
- [ ] 2FA voor admins geactiveerd — *R*
- [ ] SSO-besluit: ProjeXtPal-login of Microsoft Entra/Google — *R*
- [ ] SSO-tenant ID + claim mapping geleverd — *R*
- [ ] SSO ingericht en getest met testaccount — *P*
- [ ] Wachtwoordbeleid bevestigd — *P*
- [ ] Sessie-timeout ingesteld — *P*
- [ ] IP-whitelist (optioneel) ingericht — *P*
- [ ] Verwerkersovereenkomst (AVG) getekend — *R+P*
- [ ] Data-locatie EU bevestigd aan Recare — *P*

### 2.4 Methodiek & projectstructuur
- [ ] Standaard-methodologie bevestigd — *R*
- [ ] Per project-type evt. afwijkende methodiek vastgelegd — *R*
- [ ] Verplichte fases/stages gedefinieerd — *R+P*
- [ ] Standaard deliverables per fase ingericht (PID, business case, status report, lessons learned) — *P*
- [ ] Bestaande Recare-templates geïmporteerd — *P*

### 2.5 Governance & rapportage
- [ ] Governance boards aangemaakt (stuurgroep, change board, …) — *P*
- [ ] Stakeholders per board gekoppeld — *R*
- [ ] Rapportage-frequentie ingesteld — *R+P*
- [ ] KPI-set voor management dashboard bevestigd — *R*
- [ ] Escalatiepaden vastgelegd — *R*
- [ ] Audit-log retentie geconfigureerd — *P*

### 2.6 Financieel & tijdregistratie
- [ ] Tijdregistratie-modus (dagelijks/wekelijks) ingesteld — *R*
- [ ] Standaard uurtarieven per rol of persoon ingevoerd — *R*
- [ ] Budget-bewaking (hard stop / waarschuwing) ingesteld — *R*
- [ ] Boekhoudkoppeling besluit (Exact / AFAS / Twinfield / geen) — *R*
- [ ] Koppeling getest — *P*
- [ ] Facturatie-flow afgestemd — *R+P*

### 2.7 Risico, kwaliteit & compliance
- [ ] Risk-categorieën gedefinieerd — *R+P*
- [ ] Risk scoring matrix (3×3 / 5×5 / custom) ingesteld — *R*
- [ ] Compliance-frameworks gekoppeld (NEN 7510, ISO 27001, AVG, WTZa) — *R+P*
- [ ] Documentbeheer-strategie (alleen ProjeXtPal of SharePoint/Drive koppeling) — *R*

### 2.8 Portfolio & programma
- [ ] Programma's/portfolio's structuur opgezet — *R+P*
- [ ] Active projects geïnventariseerd — *R*
- [ ] Stakeholder-management niveau bepaald — *R*
- [ ] Benefits realisation tracking aan/uit — *R*

### 2.9 Integraties
- [ ] Mail/calendar gekoppeld (M365 / Google Workspace) — *P*
- [ ] Chat-integratie (Teams / Slack) — *P*
- [ ] Document storage gekoppeld (SharePoint / OneDrive / Drive) — *P*
- [ ] HR/IdP user provisioning ingericht — *P*
- [ ] BI-toegang (Power BI) via reporting-API — *P*
- [ ] CRM API keys aangemaakt en gedeeld — *P*

### 2.10 Academy & enablement
- [ ] Verplichte cursussen gedefinieerd (PRINCE2 Foundation, Agile basics, …) — *R*
- [ ] Eigen content-import besluit — *R+P*
- [ ] Certificeringseis voor PM-rol bevestigd — *R*
- [ ] Trainings-rollout plan opgesteld — *R+P*
- [ ] Eerste cursus toegewezen aan Elise + key users — *P*

---

## Fase 3 — Data & content (Week 2)

### 3.1 Data-migratie
- [ ] Importstrategie bevestigd (CSV / Excel / Jira-export / clean start) — *R+P*
- [ ] Peildatum cut-over vastgelegd — *R*
- [ ] Templates voor data-import aangeleverd — *P*
- [ ] Recare-export geleverd — *R*
- [ ] Test-import in staging — *P*
- [ ] Validatie-rapport gedeeld en goedgekeurd — *R+P*
- [ ] Productie-import uitgevoerd — *P*
- [ ] Steekproef-controle door Elise — *R*

### 3.2 Pilot uitbreiden
- [ ] Pilot draait stabiel met dagelijkse activiteit — *R*
- [ ] Eerste status report gegenereerd — *R*
- [ ] Status report gedeeld met sponsor — *R*
- [ ] Tweede project aangemaakt — *R*
- [ ] Lessons-learned uit week 1 verwerkt — *R+P*

### 3.3 Governance live
- [ ] Eerste governance board-meeting ingepland — *R*
- [ ] Decision log getest — *R*
- [ ] AI Coach gebruikt voor minimaal 1 vraag — *R*

---

## Fase 4 — User acceptance test (Week 3)

### 4.1 UAT scope
- [ ] UAT-scenario's opgesteld (login, project aanmaken, task, time entry, risk, status report) — *R+P*
- [ ] UAT-team van 3–5 users aangewezen — *R*
- [ ] UAT-window vastgelegd (3–5 werkdagen) — *R*

### 4.2 UAT uitvoering
- [ ] Login + 2FA/SSO — *R*
- [ ] Project CRUD — *R*
- [ ] Task management — *R*
- [ ] Time entries — *R*
- [ ] Risk register — *R*
- [ ] Budget tracking — *R*
- [ ] Status reports — *R*
- [ ] Governance board + decision — *R*
- [ ] Academy cursus + quiz — *R*
- [ ] AI Coach — *R*
- [ ] Mobile app (indien in scope) — *R*

### 4.3 UAT afronding
- [ ] Findings gelogd in issue-tracker — *R+P*
- [ ] Blocker-issues opgelost — *P*
- [ ] Non-blockers ingepland in roadmap — *P*
- [ ] UAT sign-off door Elise + sponsor — *R*

---

## Fase 5 — Go-live readiness (Week 4)

### 5.1 Productie-checks
- [ ] Backup & restore procedure getest — *P*
- [ ] Monitoring & alerting actief — *P*
- [ ] Performance baseline gemeten — *P*
- [ ] SLA-document getekend — *R+P*
- [ ] Supportkanaal (e-mail / in-app chat / dedicated CSM) actief — *P*
- [ ] Escalation contact-list compleet — *R+P*

### 5.2 Communicatie
- [ ] Interne aankondiging Recare opgesteld — *R*
- [ ] FAQ-document gedeeld — *P*
- [ ] Trainingsmaterialen gepubliceerd in Academy — *P*
- [ ] Live training-sessies ingepland (max 25 deelnemers per sessie) — *R+P*

### 5.3 Final sign-off
- [ ] Alle UAT-blockers gesloten — *P*
- [ ] Sponsor formele go-live goedkeuring — *R*
- [ ] Datum en tijdstip go-live afgesproken — *R+P*
- [ ] War-room (Teams/Slack) ingericht voor go-live dag — *R+P*

---

## Fase 6 — Go-Live (Dag G)

- [ ] War-room actief — *R+P*
- [ ] Productie-tenant final check (users, permissies, data) — *P*
- [ ] Aankondiging verstuurd naar gehele Recare-team — *R*
- [ ] Eerste login-wave gemonitord (eerste 2u) — *P*
- [ ] Support-tickets actief gevolgd — *P*
- [ ] Smoke-test 5 kernfuncties uitgevoerd — *P*
- [ ] Go-live status melding aan sponsor — *R*
- [ ] War-room afgesloten met retrospective — *R+P*

---

## Fase 7 — Hypercare (Week 1–2 na go-live)

- [ ] Dagelijkse stand-up tussen Elise en CSM — *R+P*
- [ ] Dashboard adoptie-metrics gemonitord — *P*
- [ ] Quick fixes uitgerold (binnen 24u) — *P*
- [ ] Support-tickets analyse en oplossing — *P*
- [ ] 7-dagen review met sponsor — *R+P*
- [ ] Hypercare-exit besluit — *R+P*

---

## Succescriteria — Go-live klaar als…

- [ ] Tenant en SSO werken stabiel
- [ ] Minimaal 1 pilot-project draait met dagelijkse activiteit
- [ ] Status report en governance board zijn aantoonbaar gebruikt
- [ ] UAT is afgetekend door Elise + sponsor
- [ ] SLA en verwerkersovereenkomst zijn getekend
- [ ] Hypercare-team en supportkanaal zijn paraat
- [ ] 30/60/90 dagen review-momenten staan in de agenda

---

## Adoptie-KPI's (eerste 30 dagen)

| KPI | Doel |
|---|---|
| Active users | ≥ 80% |
| Projecten met >5 tasks | ≥ 3 |
| PM's met afgeronde Academy-module | 100% |
| Support response tijd | < 24u |
| Status reports uitgegeven | ≥ 4 |
| Governance decisions vastgelegd | ≥ 2 |

---

## Risico's & mitigatie

| Risico | Mitigatie |
|---|---|
| Lage adoptie | Werken met echte projecten vanaf dag 1 + wekelijkse check-ins |
| Methodiek-mismatch | Hybrid-template als vangnet, herzien na 30 dagen |
| SSO/IT-blokkade | Start met standaard login + 2FA, SSO parallel inrichten |
| Data-migratie complexer dan gedacht | Clean start voor pilot, historische data later |
| Sponsor verliest interesse | 30-dagen review met tastbaar status report + KPI's |
| Compliance-vragen onverwacht | Verwerkersovereenkomst en NEN 7510 alignement vooraf afronden |

---

*Versie 1.0 · Eigenaar: ProjeXtPal CSM · Bijwerken na elke milestone-review.*
