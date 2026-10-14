# Werkinstructie ProjeXtPal

**Voor:** Alle Re-care gebruikers
**Organisatie:** Re-care, Heerenveen
**Onderwerp:** Projecten, Programma's & Governance opvoeren
**Versie:** 1.0 · 6 oktober 2026

---

## 0. Voordat je begint

**Inloggen**
- URL: `https://projextpal.com`
- Werk met je Re-care e-mailadres (`voornaam@re-care.org`).
- Rol: binnen Recare krijgt elke gebruiker een rol — **Admin** (volledige rechten), **Member** (projecten + programma's beheren), **Guest** (lezen + beperkt bijdragen).
- Wachtwoord vergeten? Klik "Forgot password?" op het inlogscherm; je krijgt een reset-link die 1 uur geldig is.
- Nieuwe collega toevoegen? Een Admin regelt dit via het Admin Portal.

**Taal & interface**
- Linksboven kun je taal wisselen (NL / EN). Standaard voor Recare: NL.
- Donker/licht thema via het zonnetje-icoon rechtsboven.

**Je werkruimte**
- Je komt binnen op het **Dashboard** — portfolio-overzicht van Recare.
- Linker sidebar: Projects · Programs · Governance · Reports · AI Chat · Time Tracking.
- Rechtsonder: **AI Copilot** floating button (voor vragen in context én issues melden).

![Dashboard — met 'Aan de slag in 5 stappen' onboarding die nieuwe gebruikers door hun eerste project begeleidt.](../../tmp/screenshots/01-dashboard.png)

---

## 1. Begrippen & concepten

Voordat je in de tool duikt — de drie belangrijkste termen die bepalen hoe je werkt.

### 1.1 Wat is een project?

Een **project** is een **afgebakend, tijdelijk** stuk werk met een helder einde en een concreet resultaat.

**Kenmerken:**
- Eén duidelijke uitkomst (deliverable, product, verandering)
- Vaste scope, budget, team en einddatum
- Levensduur meestal weken tot maanden
- Eén projectleider is eindverantwoordelijk

**Voorbeelden binnen Re-care:**
- *"Pilot medicatietoezicht locatie X"* — concrete pilot, 4 maanden, 1 team, meetbaar resultaat
- *"Implementatie nieuw cliëntvolgsysteem"* — eenmalige transitie
- *"Audit-voorbereiding IGJ Q2 2027"* — tijdelijk, duidelijke datum

**Niet een project:** doorlopend lijnwerk zoals *"roosters maken"* of *"cliëntendossier bijhouden"*. Dat is dagelijkse operatie.

### 1.2 Wat is een programma?

Een **programma** is een **paraplu over meerdere projecten** die samen één strategisch doel realiseren.

**Kenmerken:**
- Bundel van 3+ gerelateerde projecten
- Gericht op het realiseren van **benefits** (meetbare baten) — niet alleen opleveren van iets
- Levensduur maanden tot meerdere jaren
- Programma-eigenaar bewaakt het geheel, projectleiders doen de uitvoering per project

**Voorbeeld Re-care:** *"Programma Kwaliteitsverbetering 2027"* met daaronder bijvoorbeeld:
- Project 1: Medicatieveiligheid locatie A
- Project 2: Medicatieveiligheid locatie B
- Project 3: Cliënttevredenheids-onderzoek
- Project 4: Scholingstraject medewerkers
- Project 5: Dashboard kwaliteitsindicatoren

Al deze projecten dragen bij aan één benefit: *"meetbaar hogere kwaliteit van zorg in 2027"*.

**Verschil in één zin:**
- Een **project** levert een **output** (iets concreets dat af is).
- Een **programma** realiseert een **outcome + benefits** (verandering met waarde voor de organisatie).

### 1.3 Wat is governance?

**Governance** is de **structuur voor besluitvorming en verantwoording**. Niet één project of programma — het is de **laag die eroverheen ligt**.

**Governance beantwoordt vragen als:**
- Wie mag een project of programma goedkeuren?
- Waar worden besluiten formeel vastgelegd?
- Hoe wordt escalatie geregeld bij een exception (buiten tolerantie)?
- Welke risico's bedreigen niet één project, maar heel Recare?
- Wie zijn de stakeholders en wat is hun belang?

**Bouwstenen van governance:**
- **Boards** (stuurgroepen, programmaboard, MT) — vast besluitvormingsorgaan
- **Decisions** (besluiten) — formeel vastgelegd, met wie-wat-wanneer
- **Meetings** (vergaderingen) — ritme en agenda van een board
- **Stakeholders** — belanghebbenden, hun invloed en houding
- **Portfolio RAID** — risico's op organisatie-niveau

**Waarom het voor zorg extra belangrijk is:**
Zorginstellingen hebben een traceerbare besluitvormingsketen nodig richting IGJ, Raad van Toezicht en bestuur. Zonder goede governance "verdwijnen" besluiten, is onduidelijk wie wat heeft goedgekeurd, en komen risico's te laat op tafel. ProjeXtPal zorgt dat alles vindbaar en koppelbaar blijft.

### 1.4 Hoe verhouden ze zich tot elkaar?

Van strategisch naar operationeel:

```
PORTFOLIO                 (hele Recare — jaarplan, MT)
    │
    ├── PROGRAMMA         (strategisch doel, 2-3 jaar)
    │       │
    │       ├── Project A
    │       ├── Project B
    │       └── Project C
    │
    └── PROGRAMMA
            │
            └── Project D
```

**Governance ligt dwars over dit hele plaatje heen:**
elk project heeft een eigen board (stuurgroep), elk programma een programmaboard, en Recare als geheel heeft portfolio-governance (MT / bestuur). Dezelfde besluiten-logica, drie niveaus.

### 1.5 Wanneer gebruik je wat?

Snelle beslissingsboom:

| Vraag | Antwoord |
|---|---|
| Eén concreet resultaat, afgebakend in tijd? | **Project** |
| 3+ gerelateerde initiatieven voor één gezamenlijke verandering/benefit? | **Programma** (met projecten eronder) |
| Structuur voor sturen, besluiten vastleggen, risico's bewaken op organisatie-niveau? | **Governance** |
| Doorlopend lijnwerk zonder einde? | Geen van drie — hoort niet in ProjeXtPal thuis |

---

## 2. Project opvoeren

Een **project** is een afgebakend traject met een helder einde: zorgverbetering, pilot, implementatie van een nieuwe werkwijze, aanbesteding, inhuurtraject (zie hoofdstuk 1.1 voor de definitie).

### 2.1 Welke methodiek kies je?

| Soort traject bij Re-care | Methodiek |
|---|---|
| Zorginhoudelijk verbetertraject met stuurgroep & formele business case | **PRINCE2** |
| Innovatiepilot, nieuwe aanpak uitproberen, snel leren | **Agile** of **Scrum** |
| Beleidsproject met vaste stappen (bv. compliance-traject) | **Waterfall** |
| Combinatie — eerst analyse (Waterfall), dan uitvoering (Agile) | **Hybrid** |
| Procesverbetering op basis van data | **Lean Six Sigma (Green Belt)** |

**Vuistregel voor Re-care:** PRINCE2 voor alles met een stuurgroep / verantwoording naar bestuur. Agile voor pilots zonder zware governance. Bij twijfel → PRINCE2.

### 2.2 Stappen

![Projects — overzicht van je projecten. Rechtsboven: '+ New Project' om een nieuw project aan te maken, en 'Generate with AI' voor een AI-ondersteunde opzet.](../../tmp/screenshots/02-projects.png)

1. Linker sidebar → **Projects** → knop rechtsboven **+ Nieuw project**.
2. **Methodologie** kiezen uit de keuzelijst (zie tabel 2.1).
3. **Basisgegevens** invullen:
   - Projectnaam (kort, herkenbaar: *"Pilot medicatietoezicht locatie X"*)
   - Beschrijving / scope (3-5 zinnen)
   - Startdatum & einddatum (verwacht)
   - Projectleider (jij of een collega)
4. **Team** toevoegen — klik op "Team" tab binnen het project; voeg leden toe per e-mail.
5. **Business case** (PRINCE2) of **Product Vision** (Agile) invullen — eerste tab in de editor.
6. **Mijlpalen / sprints** toevoegen onder "Planning".
7. **Risico's & assumpties** vastleggen in de **RAID-log**.
8. **Opslaan** — status staat op "Draft" tot je 'em formeel start.

### 2.3 Veelgemaakte fouten

- **Geen methodiek kiezen** → project blijft generiek, templates werken niet. Kies altijd.
- **Direct in Agile beginnen** voor een traject met stuurgroep → je mist de governance-haakjes. Begin dan in PRINCE2.
- **Projectleider leeg laten** → notificaties over mijlpalen landen nergens.
- **RAID pas achteraf invullen** → risico's komen te laat op tafel. Vul vanaf dag 1 bij.

### 2.4 Projectleider wisselen

Soms draag je een project over aan een collega. Werkwijze:
1. Open het project.
2. Ga naar **Settings** → "Verander projectleider".
3. Selecteer de nieuwe projectleider uit de lijst.
4. Opslaan — de nieuwe leider krijgt automatisch een notificatie.
5. Informeer je collega ook even persoonlijk zodat de overdracht compleet is.

---

## 3. Programma opvoeren

Een **programma** is een paraplu over **meerdere samenhangende projecten** die samen één strategisch doel realiseren. Pas gebruiken als er écht 3+ projecten één gezamenlijke uitkomst hebben.

### 3.1 Wanneer een programma, geen project?

| Scenario | Programma of project? |
|---|---|
| 1 verbetertraject op 1 locatie | Project |
| Dezelfde verbetering uitrollen op 5 locaties | **Programma** (5 projecten eronder) |
| Jaarplan 2027 met strategische doelen | **Programma** |
| Audit-voorbereiding met 1 team | Project |
| Bundel van zorginnovaties richting bestuur | **Programma** |

### 3.2 Welke programma-methodiek?

| Scenario | Methodiek |
|---|---|
| Transformatie met benefits-realisatie, blueprint toekomstbeeld | **MSP** |
| Formele programma-governance aansluitend op PRINCE2-projecten | **PRINCE2 Programme** |
| Mix van voorspelbare en adaptieve componenten | **Hybrid Programme** |
| Grote tech-portfolio met release-ritme | **SAFe** (voor Re-care zelden van toepassing) |

**Vuistregel voor Re-care:** **MSP** als het om benefits & transformatie gaat (meeste zorg-trajecten). **PRINCE2 Programme** als het strak formeel moet via het bestuur.

### 3.3 Stappen

![Programs — overzicht van programma's. Rechtsboven: '+ New Program' voor handmatig aanmaken, of 'Generate with AI' om een programma te laten voorstellen op basis van je context.](../../tmp/screenshots/03-programs.png)

1. Linker sidebar → **Programs** → **+ Nieuw programma**.
2. Methodiek kiezen (zie tabel 3.2).
3. **Programma-charter** invullen: naam, doel, beoogde benefits, tijdlijn.
4. **Vision / Blueprint** schrijven (eerste tab) — het toekomstbeeld in 1 pagina.
5. **Benefits map** (MSP) — welke concrete baten worden gerealiseerd, door wie meetbaar, wanneer.
6. **Projecten koppelen** — tab "Projecten": bestaande projecten toevoegen aan het programma.
7. **Governance board** aanmaken voor het programma (zie hoofdstuk 4).
8. Opslaan.

### 3.4 Fout die vaak gemaakt wordt

**Een programma aanmaken voor 1 project** — dan is het gewoon een project met extra overhead. Als het niet 3+ gerelateerde projecten zijn: project is genoeg.

---

## 4. Governance inrichten

Governance = **structuur voor besluitvorming**: wie beslist, hoe worden besluiten vastgelegd, waar wordt verantwoording afgelegd, wat gebeurt er met risico's op organisatieniveau.

Bij Re-care relevant voor: stuurgroepen van zorgverbetertrajecten, portfolio-overleg MT, besluitenlogboek voor compliance / IGJ-trajecten.

![Governance Dashboard — org-brede boards, beslissingen en escalatie-queue. Submenu links: Dashboard · Portfolios · Boards · Stakeholders · Decisions.](../../tmp/screenshots/04-governance.png)

### 4.1 Wat er onder Governance valt

| Entity | Waarvoor |
|---|---|
| **Portfolio** | Overkoepelende bundel van programma's + projecten op strategisch niveau (bv. jaarplan). |
| **Board** | Vast besluitvormingsorgaan: stuurgroep, programmaboard, MT. |
| **Board member** | Deelnemer aan een board met rol (voorzitter, lid, adviseur). |
| **Stakeholder** | Belanghebbende bij een project/programma (niet per se in een board). |
| **Meeting** | Vergadering van een board. |
| **Decision** | Formeel besluit — vastgelegd, geautoriseerd, met vervolgacties. |
| **RAID** | Risks, Assumptions, Issues, Dependencies op portfolio-niveau. |

### 4.2 Stuurgroep opzetten (meest voorkomend)

1. Linker sidebar → **Governance** → **Boards**.
2. **+ Nieuwe board** → type "Stuurgroep".
3. Naam: *"Stuurgroep [naam project/programma]"*.
4. **Leden toevoegen** — voorzitter, uitvoerende, senior gebruiker, senior leverancier (PRINCE2-rollen).
5. **Vergaderritme** instellen (bv. maandelijks eerste maandag).
6. **Koppelen** aan het project of programma waarvoor de board bestaat.

### 4.3 Vergadering + besluit vastleggen

1. **Governance** → **Meetings** → **+ Nieuwe meeting**.
2. Kies board, datum, agenda.
3. Tijdens / na de vergadering: notulen in de meeting-detail.
4. Per besluit: klik **+ Decision** → omschrijving, besluit, verantwoordelijke, deadline.
5. Status: *draft → voorgesteld → aangenomen / verworpen*.
6. **Aangenomen** besluit → wordt automatisch zichtbaar op het bijbehorende project/programma dashboard.

### 4.4 RAID-log op portfolio-niveau

Projecten hebben hun eigen RAID. Governance-RAID gaat over **risico's die het hele Re-care portfolio raken** — denk aan: regelgeving, personeelsmarkt, locatiesluiting, grote compliance-trajecten.

1. **Governance** → **Portfolio RAID**.
2. Nieuwe regel: type (R/A/I/D), beschrijving, kans, impact, eigenaar, mitigatiemaatregel.
3. Review tenminste maandelijks in MT-overleg.

### 4.5 Stakeholder mapping

Voor elk zorgverbetertraject: wie zijn de stakeholders en wat is hun belang + macht?

1. **Governance** → **Stakeholders** → **+ Nieuwe stakeholder**.
2. Vul naam, rol, organisatie, invloed (laag/middel/hoog), houding (voor/neutraal/tegen).
3. Koppel aan project(en).
4. Dashboard toont een power/interest matrix — gebruik dit in je communicatieplan.

---

## 5. Dagelijks ritme

**Elke ochtend (5 minuten):**
1. Dashboard openen → check "Open items" en "Deadlines deze week".
2. **My Work** sidebar-item → actiepunten die aan jou zijn toegewezen.
3. Nieuwe board-besluiten of RAID-updates sinds gisteren langslopen.

**Wekelijks (30 minuten):**
- Elk lopend project: statusupdate schrijven (via AI Copilot kun je dit laten voorstellen → je redigeert).
- RAID-log doorlopen: nog actueel? Nieuwe risico's?

**Maandelijks:**
- Portfolio-rapportage genereren via **Reports & Analytics**.
- Stuurgroepvergaderingen plannen en voorbereiden.

---

## 6. AI Copilot gebruiken

Rechtsonder altijd zichtbaar als floating button.

**Waar het goed in is:**
- "Schrijf een statusupdate voor dit project op basis van de laatste week."
- "Welke risico's heb ik mogelijk gemist in dit RAID-log?"
- "Vat de laatste 3 stuurgroepbesluiten samen."
- "Maak een eerste opzet voor de business case van [project]."

**Waar het niet voor is:**
- Vervangen van jouw oordeel — altijd zelf redigeren voor je opslaat.
- Zorgvertrouwelijke beslissingen — AI mag helpen formuleren, besluit blijft bij mens.

**Issue melden** via dezelfde floating button → "Probleem melden": e-mail naar `info@projextpal.com` + admin wordt automatisch getriggered.

---

## 7. Rollen & verantwoordelijkheden binnen Re-care

ProjeXtPal werkt met drie rolniveaus binnen Recare. Welke rol je hebt bepaalt wat je kunt zien en wijzigen.

| Rol | Mag | Mag niet |
|---|---|---|
| **Admin** | Alles: projecten, programma's, governance, gebruikersbeheer, instellingen, facturatie-info bekijken. | — |
| **Member** | Eigen projecten + programma's aanmaken en beheren; governance-items voorstellen; RAID bijwerken. | Gebruikers toevoegen/verwijderen; facturatie-instellingen aanpassen. |
| **Guest** | Lezen van projecten waar men aan deelneemt; opmerkingen plaatsen; eigen taken afhandelen. | Nieuwe projecten/programma's aanmaken; governance-items aanmaken. |

**Praktisch — wie doet wat:**
- **Projectleider van een traject:** verantwoordelijk voor dat ene project (projectleider-rol binnen het project, los van platform-rol).
- **Programma-eigenaar:** verantwoordelijk voor de programma-dossier, benefits map, roll-up naar bestuur.
- **Admin(s) van Re-care:** platform-beheer, user-management, templates, standaarden.
- **Alle gebruikers:** actiepunten binnen een werkdag oppakken, RAID bijhouden, statusupdates leveren.

Als rollen onduidelijk zijn in een project of programma: leg het vast op de **Team**-tab van dat project — rol per persoon.

---

## 8. Hulp & support

| Vraag | Waar? |
|---|---|
| Snelle vraag over functionaliteit | AI Copilot (floating button) |
| Bug of iets werkt niet | AI Copilot → "Probleem melden" |
| Methodiek-vraag (PRINCE2 / Agile / MSP) | AI Copilot of `info@projextpal.com` |
| Dringend / strategisch | Sami Loukile — `sami@inclufy.com` |
| Account / toegang / nieuwe gebruiker | Een Admin binnen Recare regelt dit via het Admin Portal |

---

## 9. Checklist eerste project

Loop deze af voor elk nieuw project in ProjeXtPal:

- [ ] Methodiek gekozen (PRINCE2 / Agile / Waterfall / Hybrid / LSS)
- [ ] Naam + beschrijving + scope (3-5 zinnen) ingevuld
- [ ] Start- en einddatum
- [ ] Projectleider toegewezen
- [ ] Team toegevoegd
- [ ] Business case / Product Vision geschreven (eerste tab)
- [ ] 3-5 mijlpalen gepland
- [ ] Minstens 3 risico's in RAID
- [ ] Stakeholders gemapt (als relevant)
- [ ] Stuurgroep (board) opgezet en gekoppeld (bij PRINCE2)
- [ ] Eerste statusupdate geschreven

---

*Opgesteld voor Re-care Heerenveen · 6 oktober 2026 · voor vragen over deze instructie: sami@inclufy.com*
