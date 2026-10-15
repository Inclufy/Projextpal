# Werkinstructie — Nieuwe aanbesteding of project aanmaken met documenten

**Versie:** 1.0 — 15 oktober 2026
**Doelgroep:** Elisa Postma (Recare) + overige Recare-gebruikers
**Context:** jij hebt een nieuwe aanbesteding, audit-set, of migratie-dossier als PDF/Word/… en wil daar in één keer een werkbaar project omheen opzetten in ProjeXtPal met AI die alle documenten als context gebruikt.

---

## 1. Wanneer gebruik je dit?

Elke keer dat je start met iets groters dan een losse taak en je bronmateriaal **al bestaat als documenten**. Denk aan:

- een nieuwe **aanbesteding** uit TenderNed / Negometrix (bijv. een Wmo- of jeugdhulpuitvraag van een gemeente),
- een lopende **audit** (HKZ-rondgang, interne control-audit, DPIA-review),
- een **migratie** (overgang naar nieuwe EPD / cliëntvolgsysteem / HR-pakket),
- een **implementatietraject** bij een klant (zoals Recare's eigen uitrol van ProjeXtPal).

In al deze gevallen levert dit stappenplan je **binnen 15 minuten** een project op met een door AI opgestelde Business Case die de kernvragen voor directie-besluit al beantwoord heeft.

> ⚠️ **Privacy vooraf** — Documenten die je uploadt worden **versleuteld opgeslagen** (AES-128 Fernet). Alleen jouw tenant (Recare) ziet ze. Jij kunt per document aan/uitzetten of de AI het mag inzien. Alle AI-raadplegingen worden gelogd (zie § 7). Zie ook `docs/compliance/dpia-ai-features.md` voor de DPIA-sjabloon richting Functionaris Gegevensbescherming.

---

## 2. Benodigdheden

| Nodig | Waar | Opmerking |
|---|---|---|
| Login | `https://projextpal.com/login` | je Recare-account (`elisa@re-care.org`) |
| Documenten als bestand of tekst | lokaal | PDF, DOCX, TXT, Markdown — alles mag. Nog niet de brondocumenten zelf; wel de **inhoud** (geëxtraheerde tekst of samenvatting). |
| Jouw rol in Recare | — | PM of hoger (Owner/Admin) om een project aan te maken + de Business Case te benaderen |
| ± 15 minuten | — | daadwerkelijke doorlooptijd van stap 1 t/m 5 |

---

## 3. Stap-voor-stap met levend voorbeeld

Als lopend voorbeeld gebruiken we de **marktconsultatie ELO Aeres (TN-601871)** die Inclufy op 15 juli 2026 beantwoord heeft. Jij volgt dezelfde stappen voor je eigen Recare-aanbesteding, -audit of -migratie.

### Stap 1 — Nieuw project aanmaken

1. Linksboven klik je op **Projects** in het sidepanel.
2. Rechtsboven klik je op de paarse knop **➕ New Project**.
3. Vul in:

   | Veld | Voorbeeld (Aeres) | Advies voor je eigen project |
   |---|---|---|
   | **Name** | `Aeres ELO — marktconsultatie (TN-601871)` | Houd 'em kort en herkenbaar. Begin met de klant- of dossiernaam, voeg kenmerk toe tussen haakjes. |
   | **Methodology** | `PRINCE2` | Voor aanbestedingen altijd **PRINCE2** — dan krijg je automatisch de **Business Case**-tab (zie stap 3). Voor audits mag ook `Waterfall` of `Hybrid`. |
   | **Description** | `Marktconsultatie ELO Aeres (MBO+HBO, later VMBO). Deadline reactie 25 aug 2026 16:00.` | Twee of drie regels. Noem **wie**, **wat**, **wanneer deadline**. |
   | **Start / End date** | 2 aug 2026 / 25 aug 2026 | De datums waarbinnen jullie de inschrijving / audit / migratie afronden. Deze landen op de Gantt. |

4. Klik **Create**. Je springt automatisch naar het project-detail scherm.

> 💡 **Tip** — Zie je bij "Methodology" ook `Inclufy Best Practice` staan? Dat is onze eigen methodologie, specifiek voor zorg-trajecten. Voor aanbestedingen is PRINCE2 nu alsnog beter omdat de Business Case-tab een harde eis is bij publieke opdrachten.

### Stap 2 — Documenten uploaden als AI-context

Dit is de belangrijkste stap. Zonder context "weet" de AI niets over jouw aanbesteding.

1. In het project-detail scherm, klik links in de secundaire navigatie op **AI Context** (soms genoemd **Documenten** of **Co-pilot context** afhankelijk van je taalinstelling).
2. Je ziet een leeg scherm met de knop **📄 Documenten toevoegen**.
3. Voeg per document toe:
   - **Naam** (verplicht): bv. `bijlage2-programma-van-eisen.pdf`
   - **Bestand** of **tekst**: upload de PDF, of plak de geëxtraheerde tekst
   - **Zichtbaar voor AI?** → standaard **AAN**. Zet 'em **UIT** voor documenten die wel bij het project horen maar die je privé wilt houden (bv. interne prijsstelling, concurrentieanalyse).
4. Herhaal voor elk document dat de AI mag lezen bij vragen/analyses.

**Voor Aeres hebben we 5 documenten geüpload:**

| Document | Pagina's | Zichtbaar voor AI |
|---|---|---|
| aankondiging-marktconsultatie.pdf | 3 | ✅ |
| marktconsultatiedocument-ELO.pdf | 11 | ✅ |
| bijlage2-programma-van-eisen.pdf (14 componenten, ±200 eisen) | 23 | ✅ |
| Bijlage1-Marktconsultatie-ELO-Aeres-Inclufy-ingevuld.pdf | 6 | ✅ |
| Reactie-marktconsultatie-ELO-Aeres-Inclufy.pdf | 8 | ✅ |

Na uploaden toont het scherm een telling: *"5 documenten · 2.907 tekens · bijgewerkt vandaag"*. Dat is je bewijs dat de AI-context daadwerkelijk is opgeslagen.

> 🔒 **Hoe werkt de encryptie technisch?** — De tekstinhoud wordt met Fernet (AES-128-CBC + HMAC) op schijf opgeslagen in de kolom `extracted_text`. De sleutel ligt in de prod-omgeving, niet in de app. Zelfs met database-toegang kan niemand de tekst lezen zonder die sleutel. Zie ook `docs/engineering/sprint-6-enterprise-ai.md`.

> 💡 **Variant voor audits** — Upload de audit-rapporten + eerdere auditplannen. De AI stelt dan op basis daarvan een realistisch actieplan + risicoparagraaf op (stap 3).

> 💡 **Variant voor migraties** — Upload het as-is datamodel + de to-be mapping + eventuele notulen van de business-owner. De AI stelt dan een migratie-roadmap met risico's en test-strategie op.

### Stap 3 — Business Case automatisch laten draften

Nu de AI-context staat, kan de ingebouwde Business Case AI 'em lezen en voor jou een gestructureerd stuk opstellen.

1. In het project-detail scherm, klik links op de tab **PRINCE2 → Business Case**.
2. Je ziet een leeg Business Case-formulier met 6 secties.
3. Rechtsboven zie je een paarse knop **✨ Auto-draft met AI**. Klik 'em.
4. Een paar seconden later worden alle 6 secties automatisch ingevuld. Elk veld blijft **bewerkbaar** — niets wordt automatisch opgeslagen zonder jouw bevestiging.
5. Klik door elk vak heen, pas aan waar nodig, en klik **Opslaan** onderaan.

**Voor Aeres leverde de auto-draft letterlijk op** (ingekort — zie Appendix A voor de volledige output):

> **Executive summary** — "Stichting Aeres Groep heeft op 15-07-2026 een marktconsultatie gepubliceerd (TN-601871, referentie MDAERELO) voor een integrale Elektronische Leeromgeving voor MBO en HBO, met mogelijke latere uitbreiding naar VMBO. De opdracht is één perceel met circa 200 eisen verdeeld over 14 componenten en overschrijdt de Europese drempelwaarde voor diensten. Inclufy positioneert zich bewust niet als integrale student-ELO, maar als specialist op het domein medewerkerleren…"

> **Major risks** — "Het grootste risico is dat Aeres de alles-of-niets-structuur en het enkele perceel handhaaft, waardoor Inclufy formeel niet kan inschrijven op een vervolgaanbesteding. Een tweede risico is dat concurrerende integrale ELO-leveranciers medewerkerleren meenemen als bijproduct, waardoor de niche onder druk komt…"

**Dat is de kern** — de AI heeft de showstoppers (ontbrekende volumes, alles-of-niets-clausule, perceelvermenging, migratieverplichting zonder exportspec) uit het Programma van Eisen gehaald en in Business Case-taal verwoord. Jij hoeft alleen nog maar te verfijnen.

### Stap 4 — Milestones en taken via Ask Co-pilot

De Business Case is klaar; nu moeten de concrete acties nog in het project landen.

1. Open rechts in het scherm de **AI Co-pilot** (paars sidepanel of de knop **💬 Ask Co-pilot** rechtsonder).
2. Typ: *"Maak een milestone voor de deadline reactie-indiening op 25 augustus 16:00 en splits dat op in 5 taken: (1) inhoudelijke review bijlage 1, (2) juridische check reactiebrief, (3) directie-akkoord, (4) upload TenderNed berichtenmodule, (5) ontvangstbevestiging archiveren."*
3. De Co-pilot stelt de 1 milestone + 5 taken voor met **datums en toewijzingen**. Klik **Toepassen** om ze aan te maken.
4. Open de **Gantt** of de **Task-board** om te verifiëren dat alles er staat.

> 💡 **Variant voor Recare-aanbestedingen** — Hergebruik deze zin maar vervang Aeres door jouw gemeente / aanbesteder en pas de taken aan op jouw interne proces (bv. "pre-bid meeting ondernemingsraad" ipv "directie-akkoord").

### Stap 5 — Documenten controle + alles live zetten

1. Terug naar **AI Context**. Loop de 5 documenten af; zet documenten die bij nader inzien niet door de AI gezien mogen worden (bv. verlopen offerte-templates, concurrent-info die achteraf opdook) op **UIT**.
2. Ga naar **Dashboard** op projectniveau. Controleer dat:
   - Business Case: ✅ (groen)
   - Milestone + taken: zichtbaar op de Gantt
   - Team-leden: toegewezen (zie § 5)
   - Documenten: 5 geregistreerd
3. Vanaf nu kan je **Ask Co-pilot** of **AI Coach** op elk moment vragen stellen zoals *"wat zijn de top-3 risico's uit het PvE?"* of *"welke eisen zijn M en welke S?"* — de AI pakt dat direct uit de geüploade documenten.

---

## 4. Team-leden toevoegen (optioneel maar aangeraden)

1. Project-detail → **Team** tab → **+ Teamlid toevoegen**.
2. Kies gebruiker (bv. je bid-collega of de inhoudelijke expert).
3. Beslis bij toevoegen:
   - **Timesheet verplicht?** (standaard aan bij PRINCE2)
   - **Begrote uren** (bv. 24 uur voor een inhoudelijke review-rol)
   - **Rol in dit project** (Reviewer, Approver, Doer)

De uren die het teamlid vervolgens boekt vullen automatisch de **Uren vs Begroting** widget op het project-dashboard. Overschrijdt iemand z'n budget, dan krijg je als Owner automatisch een email (zie werkinstructie-recare-v2.md § 11 en § 17).

---

## 5. Praktische varianten voor Recare

### 5.1 Audit (bv. HKZ-rondgang)

- **Project naam:** `HKZ-audit 2026 Q3 — Thuiszorg Noord`
- **Methodologie:** `Waterfall` (fasegewijs: voorbereiding → documentatie → audit → herstel)
- **Documenten upload:** audit-rapport vorige jaar, kwaliteitshandboek, procedures die wijzigden
- **AI-draft Business Case:** vervangen door **Project Brief** (zelfde knop, andere template bij Waterfall)
- **Ask Co-pilot vraag:** *"Welke non-conformiteiten uit de audit van 2025 zijn nog niet gesloten volgens het kwaliteitshandboek?"*

### 5.2 Migratie (bv. nieuw cliëntvolgsysteem)

- **Project naam:** `Migratie EPD VX-Zorg → PlanCare 2.0`
- **Methodologie:** `Hybrid` (watervalplanning + agile sprints voor data-cleaning)
- **Documenten upload:** oude data-exports, migratie-mapping, GDPR-reviews
- **AI-draft:** vraag Co-pilot *"Stel een migratie-roadmap op in 4 fases met per fase 3 risico's en de owner."*
- **Rapportage:** gebruik de **Status Report** generator in Reports & Analytics — die neemt de milestones + Business Case automatisch mee.

### 5.3 Klant-implementatie (bv. Recare's eigen ProjeXtPal-uitrol)

- **Project naam:** `Recare — Implementatie & Uitrol ProjeXtPal`
- **Methodologie:** `Inclufy Best Practice`
- **Documenten upload:** implementatie-plan, SLA, change-request-log
- **Business Case:** vraag Co-pilot *"Welke KPI's uit het implementatieplan hebben we na 90 dagen geleverd?"* en gebruik dat voor je stuurgroep-rapportage.

---

## 6. Resultaat zichtbaar maken

Op het project-dashboard verschijnt na stap 3:

- **AI-chip** onder elk AI-antwoord: *"gebruikte N documenten · M tekens"* — bewijs dat de AI daadwerkelijk uit jouw context haalde.
- **Business Case banner** bovenin: toont wie 'em moet goedkeuren en wanneer.
- **Milestones** op de Gantt met kleur per status.
- **Rapportage** onder Reports & Analytics: **Status Report** en **Risico-register** komen automatisch uit je Business Case + taken.

---

## 7. Privacy, GDPR en audit-trail (voor zorg)

Omdat Recare zorg-sector is gelden strengere eisen. ProjeXtPal is daarop ingericht:

| Vereiste | Hoe geregeld in ProjeXtPal |
|---|---|
| **Encryptie bij opslag** | Fernet (AES-128) op elk document in `AI Context`. Sleutel niet in de app, niet in de DB. |
| **Per-document toggle** | Je kunt zelf per document aan/uitzetten of de AI het mag lezen. UIT = AI ziet 'em niet, zelfs niet in context-prefix. |
| **GDPR delete** | Op elk document → **🗑 Verwijderen (GDPR)**. Dit cascadeert: tekst én alle audit-rijen die er alleen naar verwijzen, zijn weg. |
| **Audit log** | Via `https://projextpal.com/django-admin/ai_audit/` zie je **wie** welk project op **welk moment** op **welke AI-surface** heeft geraadpleegd. Nodig voor de AVG Art. 30 register. |
| **Rate limit** | 20 AI-calls per uur per gebruiker. Voorkomt stolen-JWT abuse. |
| **Audit-trail onuitzetbaar** | Zelfs als je het log-scherm nooit opent, elke call wordt gelogd. Compliance-eis uit DPIA. |
| **Hosting binnen EER** | Postgres staat op Hetzner Nürnberg (DE). Geen US-fallback. |

**Voor je FG (Functionaris Gegevensbescherming):** verwijs naar `docs/compliance/dpia-ai-features.md` — die noemt bronverwerker, rechtsgrondslag, bewaartermijn, en de 20 Art. 32 beveiligingsmaatregelen.

---

## 8. Tips en valkuilen

| ✅ Doe wel | ❌ Niet doen |
|---|---|
| Documenten als **tekstvorm** uploaden (geëxtraheerde PDF-tekst) | De originele PDF-pagina's naar de AI sturen — dat kan nog niet in dit scherm (volgt in sprint 13 OCR-upload) |
| Documenten **één voor één** uploaden, met logische naam | Alles plakken in 1 veld "notities" — dan verlies je filter + per-document toggle |
| **Varieer** je Ask Co-pilot vraag en kijk naar de chip hoeveel docs 'em gebruikt | Blind vertrouwen op 1 antwoord zonder te verifiëren met de bron |
| **Sla** de auto-draft Business Case op en verfijn daarna in jouw taal | Direct publiceren wat de AI schreef — altijd menselijke review voor directie-besluit |
| **Rate limit** (20/u) respecteren — plan grote analyses | Alle AI-vragen in 1 minuut afvuren — leidt tot 429 blokkade |

---

## 9. Snelstartcommando (als cheat-sheet)

```
1. Projects → + New Project → naam + PRINCE2 + datums → Create
2. AI Context → + Document → upload tender/audit/migratie-docs → zet AI-toegang per doc
3. PRINCE2 → Business Case → ✨ Auto-draft → verfijn → Opslaan
4. Ask Co-pilot → vraag milestones + taken → Toepassen
5. Team → + lid toevoegen → timesheet + begrote uren
6. Dashboard → check: BC ✅ · Milestones ✅ · Docs N ✅
```

---

## 10. Hulp nodig?

- **Vraag over een feature:** gebruik **Ask Co-pilot** rechtsonder in de app (reageert in NL).
- **Technisch probleem:** meld via **Issues**-tab in de Co-pilot — die opent een ProductIssue en Inclufy support krijgt direct een mail. Zie [werkinstructie-recare-v2.md](werkinstructie-recare-v2.md) § 23.
- **Vraag per email:** support@inclufy.com (reactie binnen 1 werkdag) of direct bij sami@inclufy.com.
- **Vraag over GDPR / audit:** [docs/compliance/dpia-ai-features.md](../compliance/dpia-ai-features.md) + je eigen FG.

---

## Appendix A — Volledige AI-draft Business Case voor Aeres (voorbeeld)

Dit is **letterlijk** wat de **✨ Auto-draft met AI** opleverde na stap 3, zonder enige menselijke bewerking. Gebruik als referentie om te zien wat je op jouw project kunt verwachten.

### Executive summary
Stichting Aeres Groep heeft op 15-07-2026 een marktconsultatie gepubliceerd (TN-601871, referentie MDAERELO) voor een integrale Elektronische Leeromgeving voor MBO en HBO, met mogelijke latere uitbreiding naar VMBO. De opdracht is één perceel met circa 200 eisen verdeeld over 14 componenten en overschrijdt de Europese drempelwaarde voor diensten. Inclufy positioneert zich bewust niet als integrale student-ELO, maar als specialist op het domein medewerkerleren, learning analytics (component 9), certificeringsbeheer, formatieve toetsing en portable credentials. Deze business case onderbouwt waarom Inclufy via een gerichte consultatiereactie uiterlijk 25 augustus 2026 16:00 wil bijdragen aan een werkbare uitvraag en een passende positionering voor een eventueel vervolg.

### Reasons
Aeres staat voor de keuze een nieuwe ELO te verwerven die studentleren én medewerkerleren moet ondersteunen binnen één perceel. De huidige uitvraag kent showstoppers die de slagingskans van de aanbesteding onder druk zetten: ontbrekende volumes in eis 39, een alles-of-niets-clausule op circa 190 M-eisen, vermenging van studentleren en medewerkerleren, en een migratieverplichting zonder exportspecificatie van de zittende leverancier. Door nu in de consultatiefase te reageren kan Inclufy bijdragen aan een realistischer bestek en tegelijkertijd zijn specialistische propositie zichtbaar maken. Niet reageren betekent dat de uitvraag mogelijk ongewijzigd op de markt komt, waardoor zowel Aeres als gespecialiseerde aanbieders op achterstand komen te staan.

### Business options
- **Optie 1 — Niets doen:** geen reactie indienen; Aeres mist specialistische input en Inclufy mist zichtbaarheid bij een strategische onderwijsinstelling.
- **Optie 2 — Minimale reactie:** alleen de ingevulde bijlage 1 indienen zonder adviserende begeleidingsbrief; dit geeft beperkte invloed op de scope.
- **Optie 3 (aanbevolen) — Volwaardige consultatiereactie** met advies tot perceelindeling (perceel 1 student-ELO VO/MBO/HBO, perceel 2 medewerkerleren) en een verplicht integratiebestek met SSO/SCIM, REST, LTI 1.3 en gedeelde skills- en rapportagedefinities als bijlage bij beide percelen, waarbij Inclufy zich positioneert op perceel 2.

### Expected benefits
Een heldere perceelindeling vergroot de kans op kwalitatief hoogwaardige aanbiedingen per domein en voorkomt dat de hele aanbesteding op één alles-of-niets-clausule strandt. Voor Aeres levert dit betere marktrespons, lagere migratierisico's en een toekomstvaste architectuur op basis van open standaarden (LTI 1.3, SURFconext, SCIM, xAPI, Open Badges 3.0, ESCO/CompetentNL/NLQF). Voor Inclufy ontstaat een realistische kans op perceel 2 medewerkerleren, met aantoonbare dekking op eisen 34-38, component 9 learning analytics, formatieve toetsing en Credly-credentials. Daarnaast versterkt deelname de positionering binnen de groene onderwijssector en bij SURF-federatiepartijen.

### Expected dis-benefits
Een gedegen consultatiereactie vraagt capaciteit van bid- en inhoudelijke experts in een korte doorlooptijd tot 25 augustus 2026. Door expliciet aan te geven niet aan de integrale student-ELO-eisen te voldoen, kan Inclufy door Aeres aanvankelijk als minder relevant worden gezien zolang de perceelindeling niet wordt overgenomen. Een advies tot splitsing kan door de penvoerder (BiC) worden ervaren als complicerend ten opzichte van de huidige planning. Tot slot kan transparantie over de nog lopende ISO 27001-certificering (gepland Q1 2027) en de aanvraag Aspirant-Keurmerk Arbeid als risico worden gewogen door de opdrachtgever.

### Major risks
Het grootste risico is dat Aeres de alles-of-niets-structuur en het enkele perceel handhaaft, waardoor Inclufy formeel niet kan inschrijven op een vervolgaanbesteding. Een tweede risico is dat concurrerende integrale ELO-leveranciers medewerkerleren meenemen als bijproduct, waardoor de niche onder druk komt. Verder bestaat een compliance-risico rond ISO 27001 (operationeel ISMS, ca. 50% controls met live monitoring, certificering pas Q1 2027) en het nog niet toegekende Blik op Werk-keurmerk. Ten slotte vormen de ontbrekende volumes in eis 39 en de onduidelijke exportspecificatie van de zittende leverancier een inschattings- en migratierisico dat ook na perceelindeling gemitigeerd moet worden via een helder integratiebestek.

---

*Deze draft is live gegenereerd op 15 oktober 2026 05:37 UTC uit de 5 opgeladen tender-documenten (2.907 tekens context) door de AI-Business-Case-generator op projextpal.com. Het resultaat is unredacteerd overgenomen om te laten zien wat de UI direct oplevert; de hierboven in § 3 beschreven menselijke review-stap is dus nog niet toegepast.*
