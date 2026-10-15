# ProjeXtPal productie-release 14 oktober 2026

**Versie:** 2026.10.14
**Doelgroep:** gebruikers, projectleiders, programma-eigenaren en admins van alle Inclufy-klanten op ProjeXtPal
**Status:** live op productie

---

## Highlights

Een intensieve release met de nadruk op **enterprise-readiness, resource management en AI met privacy by default**. De zeven belangrijkste wins:

- **Documenten uploaden voor AI-context — nu met encryptie, een privacy-switch per document, een rate-limit en een volledig audit-log.** Je ziet onder elk Copilot-antwoord welke documenten de AI heeft gebruikt.
- **Resource planning in één pakket**: begrote uren per teamlid, uren-vs-budget widget, Gantt-planner met drag/resize, en een capaciteitsdashboard dat over alle projecten heen rekent.
- **Automatische email als iemand over zijn begrote uren heen gaat** — de projectleider krijgt direct een signaal, in het Nederlands.
- **Projectsidebar is nu context-afhankelijk**: zodra je een project opent, zie je alleen de secties die bij dat project horen. Geen eindeloze scroll meer.
- **Member Skills DB** — vind binnen je tenant precies de collega met de juiste skills voor een taak (22 default skills zoals PRINCE2, Agile, Scrum, LSS).
- **Lessons learned met budget-vergelijking**: automatisch inzicht uit afgesloten projecten (“Jan werd 20% overvraagd — plan 1 FTE extra bij vergelijkbaar project”).
- **Academy** heeft een echte eligibility-count voor certificaat-afgifte, een bulk-generate endpoint voor content, en een nieuw Practice Reviews admin-tabblad.

---

## AI & Privacy

De AI Copilot kan sinds deze release met context van documenten die je zelf uploadt, en voldoet daarmee aan onze eisen voor zorg- en overheidsklanten.

- **Encryptie at rest** — alle uploaded documenten worden met Fernet versleuteld opgeslagen; de sleutel staat in een server-side secret, niet in de database.
- **GDPR delete** — elke uploader (en elke tenant-admin) heeft een harde delete-knop met confirm; de daadwerkelijke bytes verdwijnen uit de opslag en de database.
- **Per-document privacy-toggle** — je bepaalt zelf of een document wel of niet door AI gebruikt mag worden. Als de toggle uit staat, slaat de AI dat document over.
- **Rate limit** — maximaal 20 AI-calls per uur per gebruiker, met een nette NL-foutmelding (“Je hebt het AI-limiet bereikt. Probeer het over N seconden opnieuw.”). Dit beschermt tegen misbruik van gestolen tokens.
- **“Gebruikte N documenten”-chip** — onder elk AI-antwoord zie je precies hoeveel en welke documenten zijn geraadpleegd. Daarmee is traceerbaar wat de AI heeft gezien.
- **Volledig audit-log** — elke AI-call (zowel chat als automatische acties zoals plangeneratie of statusreport-samenvatting) wordt gelogd. Tenant-admins kunnen het log inzien via `/django-admin/ai_audit/`. Dit sluit een compliance-gat dat eerder was gesignaleerd.

---

## Resource Management

Vijftien jaar aan praktijkervaring met resource planning samengebracht in één coherente laag:

- **Timesheet-afspraak per teamlid** — bij toevoegen aan een project of programma leg je vast of iemand verplicht uren moet registreren, en hoeveel uur hij of zij begroot krijgt. Programma-leden kunnen in één klik gecascadeerd worden naar alle onderliggende projecten.
- **Governance board-leden en stakeholders uitgezonderd** — een voorzitter van een stuurgroep is geen delivery-rol en hoeft dus standaard geen uren te registreren. Een tenant-admin kan dit per rol aanzetten.
- **Hourly rate override per project-member** — als een freelancer op projectbasis een afwijkend uurtarief heeft, leg je dat vast op het project zelf; het standaardtarief van de gebruiker blijft intact.
- **Uren vs budget widget** — op elk project een tabel: begrote uren, actuele uren, percentage gebruikt, kleur-chip groen/geel/rood. Zelfde widget op programma-niveau.
- **Cost dashboard in euro’s** — gated op de rechten om kosten te zien. Managers zien geld, teamleden zien uren.
- **Resource planner (Gantt)** — per persoon een tijdlijn met zijn allocaties over projecten. Drag een blok om te verschuiven, pak een rand om te verlengen. Snapt naar hele dagen. Non-blocking: je ziet de wijziging direct, de server bevestigt op de achtergrond.
- **Capaciteit dashboard** — per medewerker over alle projecten gecombineerd, met date-range picker. Overcommit-banner als totaal boven 100% FTE komt.
- **Automatische email bij budget-overschrijding** — zodra een time-entry iemand over zijn begrote uren tilt, krijgt de projectleider plus admin een NL-email via Resend. De entry wordt gewoon opgeslagen, de email is een extra signaal.
- **Lessons-learned budget-vergelijking** — bij project-afsluiting rolt het systeem automatisch inzichten uit over wie overvraagd of ondervraagd was, zodat de volgende planning realistischer wordt.
- **Member Skills DB** — centrale skills-catalogus met 22 default-skills, en per gebruiker een eigen skill-profiel (optioneel met verified-badge). In het project-team tabblad zit nu “Find skilled member”: selecteer required skills, krijg een ranked lijst van matchende collega’s binnen jouw tenant.

---

## Navigatie & UX

- **Contextuele sidebar** — zodra je een project opent, verbergt de sidebar de globale items (Dashboard, Projects-lijst, Programs) en toont alleen de secties die bij dit project horen. Links bovenaan staat “Terug naar Projecten”. Dit komt rechtstreeks voort uit UAT-feedback over de “scroll-pijn” van de oude sidebar.
- **Dubbele “Best Practice”-chip in de sidebar is opgelost** — hij verscheen tweemaal in sommige methodiek-configuraties.
- **Tenant-badge voor superadmin** — als je als Inclufy-superadmin door klant-data navigeert, zie je een duidelijke tenant-badge zodat het nooit misgaat tussen klanten.
- **External collaborator badge** — gastgebruikers (externe deelnemers die niet in jouw tenant zitten) zijn direct herkenbaar in deelnemerslijsten.
- **i18n polish** — vijf resterende Engelse strings in de UI zijn vertaald naar het Nederlands, en de sidebar-footer en MyWork-pagina zijn nu volledig NL.
- **Rename “contibuter” → “contributor”** — de typefout in een rol-label is doorgetrokken naar de database. Bij uitnodigingen is een edge-case opgelost waarbij een invitation stilletjes gedowngrade werd naar een lagere rol.

---

## Academy

- **Exam submit-flow unblocked** — een 500-fout bij exam-submit die de certificaatroute blokkeerde, geeft nu een nette 422 met een duidelijke uitleg wat er mist.
- **Echte eligibility counts** — in het admin-overzicht van certificaten zie je het werkelijke aantal cursisten dat recht heeft op afgifte, niet een geschatte prognose.
- **Bulk content-generate endpoint** — admins kunnen in één keer quizzes, lessen of practice-opdrachten voor een module laten voorstellen door de AI (nog steeds met handmatig review voor publicatie).
- **Practice-submit flow intact** — een regressie in de serializer waardoor practice-opdrachten niet goed werden ingestuurd, is gefixt.
- **Nieuw admin-tabblad “Practice Reviews”** — reviewers zien in één overzicht alle wachtende practice-inzendingen per cursus.
- **Admin-tabs bereikbaar voor tenant-admins** — eerder was een deel van het academy-admin alleen zichtbaar voor superadmin; dat is nu correct opengezet voor tenant-admins binnen hun eigen tenant.

---

## Programma & Governance

- **PMI programma-FK refactor** — zes PMI-modellen zijn omgezet naar de nieuwe foreign-key structuur, waardoor zes tabbladen (die eerder deels dood waren) nu werkende data tonen.
- **SAFe PI Objectives create** — PI Objectives kunnen weer worden aangemaakt na een serializer-regressie.
- **Hybrid Governance Config** — de serializer voor configurable programma-governance werkt weer correct.
- **Governance Stakeholder PATCH** — stakeholders kunnen weer worden bijgewerkt in plaats van alleen gelezen.
- **PRINCE2 brief-alias** — een alias op het Project Brief endpoint zodat de frontend de oude én de nieuwe route beide netjes vindt.
- **Admin invoices permission** — admins kunnen weer bij facturen, een permission-regressie is weg.
- **Governance AI gebruikt echte datum** — governance-AI genereerde eerder een datum uit 2024; die haalt nu `date.today()` op zodat gegenereerde documenten correct dateren.
- **Status report titel** — statusreports zonder expliciete titel laten weer een nette default-titel zien.
- **MyWork priority-sortering** — taken worden weer op prioriteit gesorteerd in MyWork.

---

## Infrastructure

- **Claude auto-triage pipeline** — nieuwe backend-pipeline waarin een inkomend productissue automatisch wordt getrieerd, gereproduceerd en geclassificeerd (prioriteit, methodiek, affected surface), zodat het sneller bij de juiste engineer landt.
- **GitHub Actions orchestrator** — een AI-worker ladder (Aider → DeepSeek → Gemini → lokaal Ollama) die bugs met een eenduidige fix automatisch oplost en als draft-PR aanbiedt.
- **Control Tower — ProductIssues Inbox** — ProjeXtPal-issues verschijnen nu in de centrale Inclufy Control Tower (naast Finance, Marketing en IQ Helix) met directe knoppen `issue-fix-pr` (laat de AI-ladder een fix proberen) en `issue-triage-validator` (laat triage opnieuw lopen).
- **Member Skills seed op productie** — 22 default skills (PRINCE2, Agile, Scrum, LSS, …) uitgerold op productie zodat de Skills DB direct bruikbaar is.
- **ProductIssues flow van ProjeXtPal → Control Tower** — issues die eindgebruikers via de Copilot melden, landen direct in het centrale issue-hub en zijn zichtbaar voor het hele Inclufy delivery-team.

---

## Bug fixes

- Botformulier gaf 500 bij het aanmaken van een nieuwe taak (TimeVsBudget- en CostVsBudget-widgets zijn nu live gewired).
- SAFe PI serializers gaven 400 op valide payloads.
- Kanban-board initialisatie faalde bij nieuwe projecten zonder swimlanes.
- Statusreport-serializer liet een lege `title` toe.
- MyWork gaf een dict terug waar de frontend een string verwachtte voor `priority`.
- Governance stakeholder PATCH gaf 405 Method Not Allowed.
- SAFe URL-pattern voor PI Objectives detail-view miste.
- Hybrid Governance Config serializer gaf 500 bij lege payload.
- Governance AI-gegenereerde documenten dateerden in 2024 in plaats van vandaag.
- Business Case werd niet automatisch aangemaakt bij toevoegen van de eerste benefit of risk.
- Project Edit-modal miste de startdatum- en einddatum-velden.
- Fase-kolom in tasks-overzicht liep tekstueel over; nu truncated met tooltip.
- Cross-tenant confidential-filter was te breed op enkele queries (verholpen in deze release).
- Invitation-flow downgrade in de contributor-rol zorgde voor onverwachte permissies bij nieuwe gebruikers.
- Admin practice-reviews bleef leeg door een queryset-fout.
- Admin-tabs waren onbereikbaar voor sommige tenant-admins door een gate op superadmin-rol.
- Practice-submit faalde door een serializer-mismatch.
- AI-calls werden niet consequent gelogd (compliance-vereiste); opgelost in audit-log-fix.
- Dubbele Best Practice chip in de sidebar is weg.
- Cert-gate blokkeerde cursisten die wel voldeden door een onjuiste eligibility-check.

---

## Komende verbeteringen (Sprint 12 roadmap)

- **Decision-request flow in auto-fix pipeline** — als de AI-worker een issue niet one-shot kan oplossen (bijvoorbeeld omdat het een architectuurkeuze vereist: streaming vs. synchronous? target < 5s of < 30s?), formuleert hij drie concrete keuzes als vragen aan de reporter via email en de Control Tower UI. De reporter antwoordt, de worker krijgt die decision-context mee en probeert opnieuw. Dit elimineert de huidige “✓ klaar (geen wijziging)”-sinkhole voor issues die een menselijk besluit vereisen.
- **Mobiele parity voor Member Skills DB** — de mobiele app krijgt het find-skilled-member dialog zodat ook onderweg een project-manager zijn team kan aanvullen.
- **AI copilot streaming** — de ervaring van langere AI-antwoorden wordt directer: tokens stromen binnen in plaats van te wachten op het volledige antwoord.
- **Capacity dashboard: verlof-integratie** — vakantie en ziekte uit het personeelsplanningssysteem komen binnen op de capaciteit-grafiek, zodat “100%” ook rekening houdt met afwezigheid.
- **Governance-decisions downstream enforcement** — een bindend board-besluit dat een project `on-hold` zet moet daadwerkelijk nieuwe time-entries weigeren, niet alleen in de UI een vlaggetje tonen.
- **Sentry sourcemaps op productie** — stacktraces zijn nu nog deels geminificeerd; sourcemap-upload naar Sentry gaat dat oplossen zodat bugs sneller lokaliseerbaar zijn.

---

## Dank

- **Elisa Postma (Recare)** — de UAT-feedback over de overvolle sidebar heeft Sprint 8 contextual sidebar direct getriggerd, en de GDPR-eisen op AI-context-documenten vanuit het zorgdomein hebben de encryptie-, audit- en delete-flow strakker gemaakt dan het oorspronkelijke ontwerp.
- **Alle Inclufy-tenants** die in oktober actief bugs hebben gemeld via de Copilot — jullie meldingen vormden de helft van de bug-fixes in deze release.
- Het Inclufy delivery-team voor achttien productie-deploys op één dag zonder volume-verlies.

---

*Vragen over deze release of over een specifieke feature: `info@projextpal.com` of direct `sami@inclufy.com`.*
