# Werkinstructie ProjeXtPal

**Voor:** gebruikers van ProjeXtPal, projectleiders, programma-eigenaren, portfolio-managers en board-leden
**Versie:** oktober 2026
**Doel:** je bent binnen een uur zelfstandig productief in ProjeXtPal, van inloggen tot een werkend project met risico-register, mijlpalen en Business Case.

---

## 0. Voordat je begint

**Inloggen**

- Ga naar `https://projextpal.com`.
- Werk met je zakelijke e-mailadres. Nog geen account? Je beheerder nodigt je uit via het Admin Portal.
- Vergeten wachtwoord? Klik "Wachtwoord vergeten" op het inlogscherm, je krijgt een reset-link die één uur geldig is.

**Je rol**

Binnen jouw organisatie heb je één van drie rollen:

| Rol | Wat je kunt |
|---|---|
| **Admin** | Volledige rechten, gebruikers beheren, instellingen, AI-keys, factuur-inzicht. |
| **Member** | Projecten en programma's beheren, taken toewijzen, documenten uploaden, Co-pilot gebruiken. |
| **Guest** | Lezen en beperkt bijdragen, ideaal voor stakeholders die alleen willen volgen. |

**Taal en thema**

- Rechtsboven kun je wisselen tussen **Nederlands / English / Français**.
- Donker/licht thema via het zonnetje-icoon.
- De AI Co-pilot antwoordt automatisch in dezelfde taal als jouw voorkeur.

**Je werkruimte**

- Je komt binnen op het **Dashboard**, portfolio-overzicht van je organisatie.
- Linker sidebar: Projecten · Programma's · Governance · Rapportages · AI Chat · Tijdregistratie.
- Rechtsboven: **AI Co-pilot** (sparkle-knop), altijd beschikbaar, past zich aan waar je bent.

---

## 1. Centrale begrippen

Voor je in de tool duikt, de termen die bepalen hoe je werkt.

### 1.1 Project

Een **project** is afgebakend en tijdelijk. Het heeft een duidelijk begin, einde en resultaat.

- Eén eindverantwoordelijke (projectleider).
- Vaste scope, budget en einddatum.
- Levensduur meestal weken tot maanden.
- Voorbeelden: *"Implementatie nieuw CRM"*, *"Pilot energiebesparing locatie X"*, *"Aanbesteding Q2"*.

**Niet een project:** doorlopend lijnwerk zoals *"administratie bijhouden"* of *"klanten bedienen"*. Dat is operatie.

### 1.2 Programma

Een **programma** bundelt meerdere projecten die samen één strategisch doel realiseren.

- Looptijd typisch kwartalen tot jaren.
- Programma-manager stuurt op benefits, risico-balans en programma-governance.
- Voorbeelden: *"Digitale transformatie 2027"*, *"Compliance-programma GDPR + ISO 27001"*, *"Jaarplan 2027"*.

### 1.3 Portfolio

Een **portfolio** is de verzameling van alle lopende programma's en projecten binnen een organisatie-onderdeel.

- Portfolio-manager prioriteert, verdeelt budget en bewaakt strategische lijn.
- Portfolio heeft een eigen board (zie 1.4).

### 1.4 Governance board

Een **board** is het besluitvormings-orgaan: stuurgroep, programma-board, project-board, adviesraad of raad van bestuur.

- Een board neemt bindende besluiten over wat eronder valt.
- Boards hebben leden, een voorzitter, een vergaderfrequentie en vaak een quorum.
- Decisions (besluiten) en Meetings (vergaderingen) horen altijd bij een board.

### 1.5 Methodologie

Elk project kiest één methodologie die bepaalt welke tabbladen en artefacten zichtbaar zijn:

- **PRINCE2**, gestructureerd, met Business Case, Fasepoorten, Highlight Reports, Exception Reports.
- **Scrum**, iteratief, met Sprint Backlog, Sprint Planning, Sprint Review, Velocity.
- **Kanban**, flow-georiënteerd, met WIP-limieten, doorlooptijd, cumulatieve stroom.
- **Agile**, algemeen iteratief met iteraties, backlog en releaseplanning.
- **Waterfall**, fase-gebaseerd met fasepoorten en baselines.
- **Lean Six Sigma (Green / Black)**, DMAIC-cyclus met SIPOC, Cp/Cpk, DOE.
- **Hybrid**, mix van voorspellende en adaptieve fasen in één project.
- **Inclufy Best Practice**, een lichte, methodologie-neutrale default.

De AI Co-pilot biedt alleen suggesties die bij de gekozen methodologie passen.

---

## 2. Een nieuw project starten, in vijf minuten

### Stap 1, Nieuw project

Klik in de sidebar op **Projecten** → **Nieuw project**. Je ziet een wizard met vier stappen: Methodologie → Documenten → Details → Review.

### Stap 2, Kies methodologie

Kies de methodologie die bij je project past. Twijfel je? Kies dan **Inclufy Best Practice** en wijzig het later.

### Stap 3, Upload documenten (optioneel maar sterk aanbevolen)

Sleep hier je bronmateriaal in: scope-document, offerte-aanvraag, leidraad, PvE, projectplan, briefing of vergelijkbaar. Max 10 bestanden, 15 MB per bestand. Formaten: PDF, TXT, MD, CSV, DOCX.

**Waarom belangrijk:** als je iets uploadt, kan de AI Co-pilot straks:

- Alle projectvelden autofillen op basis van de inhoud.
- Een Business Case opstellen die écht over jouw project gaat.
- Risico's identificeren uit de scope.
- Mijlpalen afleiden uit genoemde deliverables.

De documenten worden versleuteld opgeslagen (Fernet-encryptie) en zijn alleen beschikbaar binnen jouw organisatie. Je kunt ze later per stuk weer uitzetten of verwijderen.

### Stap 4, Details

ProjeXtPal vult naam, beschrijving, start-/einddatum, budget en prioriteit automatisch in op basis van je uploads. Loop ze langs en pas aan waar nodig.

### Stap 5, Review en aanmaken

Zie je alles kloppen? Klik **Project aanmaken**. Je komt op het project-dashboard. Bovenaan verschijnt een gele banner: *"Project is uit documenten opgezet, menselijke review vereist voor activatie"*. Loop alle tabs na (Setup, Business Case, Team, Budget, Mijlpalen) en pas aan waar de AI iets heeft gemist. Klik dan **Ik heb gereviewd** om het project te activeren.

---

## 3. Werken met de AI Co-pilot

De AI Co-pilot (sparkle-knop rechtsboven) is je persoonlijke assistent. Hij past zich aan **waar je bent** in de app en wat jouw project nog nodig heeft.

### 3.1 Hij biedt zelf hulp aan

In plaats van wachten op jouw vraag, kijkt de Co-pilot naar jouw huidige scope en biedt direct concrete acties aan, in de stijl *"Zal ik dat voor je doen?"*. Zeg je ja, dan voert hij het ook écht uit (geen loze belofte, geen eindeloze dialoog).

### 3.2 "Ontbreekt nog, zal ik voor je invullen?"

Bovenaan het chatvenster, in oranje: concrete offer-to-fill knoppen voor velden en tabbladen die nog leeg zijn op jouw scope.

| Wat ontbreekt | Wat de Co-pilot aanbiedt |
|---|---|
| Business Case (PRINCE2) | *"Zal ik een Business Case opstellen uit de projectdocumenten?"* |
| Risico-register | *"Zal ik 4-8 realistische risico's identificeren?"* |
| Mijlpalen | *"Zal ik mijlpalen voorstellen binnen de projectperiode?"* |
| Budget-schatting | *"Zal ik een budgetinschatting maken?"* |
| Projectteam | *"Zal ik team-rollen voorstellen?"* |

Eén klik en binnen 15–30 seconden staat het resultaat als concept klaar op jouw project.

### 3.3 Scope-aware snelle acties

Afhankelijk van waar je staat, biedt de Co-pilot methodology-specifieke acties aan:

- **Op een PRINCE2-project**, Business Case opstellen, Exception Report openen, Fasepoort-review voorbereiden, Highlight Report genereren.
- **Op een Scrum-project**, Sprint plannen, Daily Standup samenvatten, Sprint Review opstellen, Velocity berekenen.
- **Op een Kanban-project**, Geblokkeerde items opvragen, doorlooptijd + throughput metrics, WIP-limiet-check.
- **Op een programma**, Programma-gezondheid, overkoepelende risico's, baatrealisatie.
- **Op een governance board**, Boardagenda voorbereiden, openstaande besluiten tonen, briefing voor voorzitter.
- **Op een portfolio**, Portfolio-review voorbereiden, componenten vergelijken, strategische update.

### 3.4 Hij antwoordt in jouw taal, kort en zakelijk

De Co-pilot schrijft in NL, EN of FR afhankelijk van je voorkeur. Hij spiegelt je toonzetting (schrijf je casual, dan reageert hij ook casual) en houdt het kort, één of twee zinnen voor normale vragen, uitgebreide rapporten alleen als je daar expliciet om vraagt.

### 3.5 Transparant: welke bronnen gebruikt hij?

Onder elk antwoord zie je een chip zoals *"gebruikte 3 documenten · 12.400 tekens context"*. Klik erop om precies te zien welke documenten de Co-pilot heeft geraadpleegd. Zo kun je verantwoorden welke bronnen de AI heeft gezien, ook naar een Functionaris Gegevensbescherming of een auditor.

---

## 4. Governance opbouwen

Voor serieuze besluitvorming heb je boards, besluiten en meetings nodig.

### 4.1 Een board aanmaken

**Governance → Besturen → Nieuw bestuur**. Kies het type (Stuurgroep / Programma-board / Project-board / Advisory / Executive), link aan het bijhorende project, programma of portfolio, en vul voorzitter + vergaderfrequentie in.

### 4.2 Board documenten (AI-context) uploaden

Op elke board-detailpagina staat een blok **Board documents (AI context)**. Upload hier het mandaat, de standing instructions, het dossier of andere permanente bronnen.

**Wat gebeurt er dan:**

- Elke decision (besluit) onder deze board gebruikt deze documenten automatisch als context.
- Elke meeting (vergadering) onder deze board gebruikt ze ook.
- Elk governance-rapport binnen deze board-scope stapelt deze context bovenop portfolio- en programma-context.

Dus: je upload één keer het stuurgroep-mandaat, en vanaf dat moment zijn alle besluit-write-ups, agenda-drafts en briefing notes van die stuurgroep automatisch in lijn met dat mandaat.

### 4.3 Decisions en meetings

- **Decisions** registreer je per board. Als er een quorum is ingesteld, kan een besluit alleen worden toegepast nadat genoeg leden ja hebben gestemd.
- **Meetings** horen bij een board, hebben een agenda, deelnemers en actiepunten. Actiepunten worden gevolgd tot ze zijn afgehandeld.

De Co-pilot kan vanuit een board-pagina direct een agenda voorbereiden of de notulen van de vorige meeting samenvatten.

---

## 5. Documenten als AI-context, hoe werkt het precies?

De centrale filosofie: **één upload, alle AI-features gebruiken 'em**.

### Op welke scopes kun je uploaden?

| Scope | Waar | Wat de AI ermee doet |
|---|---|---|
| **Project** | Project → Documents-tab | Alle AI-features op dat project |
| **Programma** | Programma → Documents | Alle AI-features op dat programma |
| **Portfolio** | Portfolio → Documents | Alle AI-features op dat portfolio |
| **Governance board** | Board → Board documents | Alle AI-features op die board + decisions + meetings eronder |

### Hoe wordt het veilig gehouden?

- **Encryptie at rest**, Fernet-encryptie met server-side sleutel die niet in de database staat.
- **Per-document privacy-toggle**, je kunt een document "zichtbaar bewaren" maar uitsluiten van AI-gebruik.
- **Delete met confirm**, permanent verwijderen met één klik; de bytes verdwijnen uit zowel opslag als database.
- **Audit-log**, elke AI-call wordt gelogd met wie, wanneer, welke documenten. Beheerders kunnen dit log inzien.
- **Tenant-isolatie**, jouw documenten en risico's zijn nooit zichtbaar voor andere klanten.

### Welke documentformaten?

PDF, TXT, Markdown, CSV, DOCX. Max 15 MB per bestand, max 10 bestanden per scope. Scanned PDF's zonder tekstlaag worden door AI-OCR (Claude Vision) alsnog gelezen, maximaal twee gescande PDF's per upload-sessie om de verwerkingstijd beheersbaar te houden.

---

## 6. Risico's beheren

### Risico-register in één klik

Bij een nieuw project: Co-pilot → *"Zal ik een risico-register opstellen?"*. Je krijgt vier tot acht project-specifieke risico's: naam, beschrijving, categorie, kans in procenten, impact en risiconiveau.

### Categorieën die je kunt kiezen

Technisch, Planning, Financieel, Operationeel, Strategisch, Compliance.

### Workflow per risico

1. Risico wordt aangemaakt als **Open**.
2. Jij wijst een eigenaar aan en voegt een mitigatie-strategie toe.
3. Als de mitigatie is uitgevoerd, zet je de status op **Gemitigeerd**.
4. Als het risico niet meer relevant is, **Gesloten**.

Je kunt ook per risico vastleggen welke mijlpaal of welk deliverable bedreigd wordt (impact area + affected milestone).

---

## 7. Tijdregistratie en budget

- Een teamlid krijgt bij toevoeging aan een project een optionele begroting (bijvoorbeeld 40 uur).
- Teamleden kunnen uren schrijven via het **Tijdregistratie-tabblad** of via een CSV-import.
- Zodra iemand over zijn begrote uren heen gaat, krijgt de projectleider automatisch een e-mail (in het Nederlands) met een voorstel om de begroting bij te stellen of de belasting te verlagen.
- Het budget-tabblad toont per project de bestede uren vs begrote uren, bestede euro's vs budget, en de projectie naar einde project.

**Board-leden en stakeholders** schrijven standaard geen uren. Een beheerder kan dit per persoon aanzetten (bijvoorbeeld voor een adviseur die wel declareert).

---

## 8. Statusrapportages en Highlight Reports

### Status Report in één klik

Op elk project: Co-pilot → *"Zal ik een statusrapport opstellen?"*. De Co-pilot verzamelt automatisch:

- Voortgang tegen plan.
- Open risico's en issues.
- Behaalde mijlpalen in de verslagperiode.
- Komende acties en beslispunten.

Resultaat: een highlight-rapport dat je direct kunt delen met je sponsor of board.

### Rapport-tabbladen

- **Highlight Reports**, per periode (bijvoorbeeld tweewekelijks), geschreven voor de board.
- **Exception Reports** (PRINCE2), alleen als een tolerantie dreigt te worden overschreden.
- **End Stage Reports**, bij elke fasepoort-overgang.
- **End Project Report + Lessons Learned**, bij projectafsluiting; de Co-pilot genereert hieruit automatisch leerpunten die bij vergelijkbare projecten als suggestie opduiken.

---

## 9. Co-pilot als probleem-meldpunt

Werkt iets niet zoals je verwacht? In plaats van een helpdesk-mail:

1. Open de Co-pilot.
2. Klik op het oranje **"Probleem melden"** blok.
3. Beschrijf wat er mis is. De Co-pilot vult automatisch wat context toe (jouw browser, jouw huidige pagina, welke knop je indrukte).
4. Je krijgt een ticket-nummer en een melding terug zodra het is opgepakt.

Dringende issues worden door een AI-triage direct geëscaleerd naar de ontwikkelteams.

---

## 10. AI-verbruik begrijpen

In de sidebar: **AI-verbruik**. Je ziet per maand:

- Totaal aantal tokens en calls.
- Verdeling per AI-provider.
- Verdeling per feature (welke AI-acties gebruikt je team het meest).
- Verdeling per gebruiker (top 10).
- Dagelijkse trend over 30 dagen.
- Verwachte kosten op de volgende Inclufy-factuur.

### Twee facturatie-tiers

Zonder eigen AI-key: Inclufy-pool, volledige lijstprijs. Met eigen AI-key: 15% service-fee bij Inclufy, raw tokens rechtstreeks bij jouw provider (~85% voordeel). Keuze gemaakt per organisatie, per **Instellingen → API Keys**.

### Per-gebruiker dagelijkse limiet

Default 100.000 tokens per gebruiker per dag, ongeveer zes zware auto-drafts of dertig Co-pilot gesprekken. Beheerder kan dit per tenant verhogen of verlagen.

---

## 11. GDPR, AVG en compliance

ProjeXtPal is gebouwd voor zorg-, overheids- en financiële klanten. Alle compliance-eisen zijn standaard:

| Vereiste | Implementatie |
|---|---|
| Doelbinding | Documenten gekoppeld aan projecten; AI-gebruik per document uit te zetten. |
| Dataminimalisatie | Privacy-switch per document; AI slaat uitgeschakelde documenten over. |
| Traceerbaarheid | Audit-log van elke AI-call. |
| Beveiliging | Fernet-encryptie at rest voor alle uploaded documenten. |
| Verwijderingsrecht | Delete-knop met confirm; cascade naar zowel opslag als database. |
| Toegangsrechten | Rolgebaseerd (Admin / Member / Guest) + volledige tenant-isolatie. |
| Verwerkersovereenkomst | DPA tussen Inclufy en jouw organisatie; DPIA-template beschikbaar. |

Voor vragen van een Functionaris Gegevensbescherming is het audit-log het eerste aanspreekpunt.

---

## 12. Snelle troubleshooting

| Probleem | Oplossing |
|---|---|
| Co-pilot reageert niet | Check de rate-limit (max 20 vragen per uur per gebruiker, max 100.000 tokens per dag). |
| Autofill vult de velden niet in | Zijn er documenten geüpload? Zonder context kan de AI geen specifieke voorstellen doen. |
| Scanned PDF wordt niet gelezen | Alleen de eerste twee gescande PDF's per upload worden door OCR verwerkt. Upload de rest in een tweede ronde. |
| Melding "AI-limiet bereikt" | Je zit boven de dagelijkse of uurlimiet. Wacht tot morgen (dag) of een uur (uur). Beheerder kan limiet verhogen. |
| Business Case verschijnt niet in de "Ontbreekt nog" lijst | Je project heeft geen PRINCE2 als methodologie. BC's horen bij PRINCE2. |
| Ik zie een leeg scherm na een update | Vernieuw de pagina (Cmd/Ctrl + R). Als het probleem blijft: Co-pilot → "Probleem melden". |

---

## 13. Hulp nodig

| Vraag | Waar? |
|---|---|
| Snelle vraag over een feature | AI Co-pilot (sparkle-knop rechtsboven) |
| Bug of iets werkt niet | AI Co-pilot → "Probleem melden" |
| Methodiek-vraag (PRINCE2 / Scrum / LSS / …) | AI Co-pilot of info@projextpal.com |
| AVG / GDPR of audit-log | info@projextpal.com, vermeld dat het compliance betreft |
| Account of nieuwe collega | Beheerder binnen jouw organisatie via Admin Portal |
| Factuur-vraag of AI-key setup | Beheerder → Instellingen → API Keys & Billing |

---

*Deze werkinstructie is bijgewerkt na de productie-release van 15 oktober 2026 (AI Co-pilot upgrade, Governance AI-context, two-tier billing). Voor vragen over deze instructie: info@projextpal.com. ProjeXtPal is een product van Inclufy.*
