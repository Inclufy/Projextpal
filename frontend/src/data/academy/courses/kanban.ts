// ============================================
// COURSE: KANBAN FOR KNOWLEDGE WORK
// ============================================
// Optimize flow and deliver continuous value
// ============================================

import { Trello } from 'lucide-react';
import { Course, Module } from '../types';
import { BRAND } from '../brand';
import { instructors } from '../instructors';

// ============================================
// MODULE 1: KANBAN FUNDAMENTEN
// ============================================
const module1: Module = {
  id: 'kb-m1',
  title: 'Module 1: Kanban Fundamentals',
  titleNL: 'Module 1: Kanban Fundamenten',
  description: 'The foundation: principles, practices, and the Kanban board.',
  descriptionNL: 'De basis van Kanban: oorsprong, principes en het Kanban systeem.',
  lessons: [
    {
      id: 'kb-l1',
      title: 'What is Kanban?',
      titleNL: 'Wat is Kanban?',
      duration: '15:00',
      type: 'video',
      videoUrl: '',
      transcript: `Welkom bij de Kanban cursus! Kanban is een van de krachtigste maar 
vaak verkeerd begrepen methoden voor werkmanagement. Laten we beginnen bij de basis.

**De Oorsprong van Kanban**

Kanban (看板) is Japans voor "visueel signaal" of "kaart". Het ontstond bij Toyota 
in de jaren '40 als onderdeel van het Toyota Production System.

Taiichi Ohno observeerde Amerikaanse supermarkten waar klanten producten van 
schappen pakten en die dan werden aangevuld. Dit "pull" principe paste hij toe 
in productie: produceer alleen wat downstream nodig heeft.

**Van Manufacturing naar Kenniswerk**

In 2007 introduceerde David J. Anderson Kanban voor kenniswerk bij Microsoft. 
Hij paste de principes aan voor software development en andere kennisintensieve werk.

Het kernidee bleef: visualiseer werk, beperk work-in-progress, en optimaliseer flow.

**Wat Kanban NIET Is**

Laten we eerst misconcepties adresseren:

❌ Kanban is niet alleen een bord met kolommen
❌ Kanban is geen project management methodologie
❌ Kanban is geen alternatief voor Scrum (het kan samen)
❌ Kanban vereist geen grote reorganisatie

**Wat Kanban WEL Is**

✅ Een methode om werk te managen en te verbeteren
✅ Een evolutionaire veranderaanpak
✅ "Start where you are" - geen big bang transformatie
✅ Focus op flow en continue levering

**De Kanban Waarden**

Kanban kent 9 waarden:

1. **Transparantie**: Werk is zichtbaar voor iedereen
2. **Balance**: Balans tussen vraag en capaciteit
3. **Collaboration**: Samenwerking voor verbetering
4. **Customer Focus**: Waarde leveren aan klanten
5. **Flow**: Werk stroomt continu
6. **Leadership**: Op alle niveaus
7. **Understanding**: Begrijpen van het systeem
8. **Agreement**: Afspraken over werkwijze
9. **Respect**: Voor mensen en hun expertise

**De Kanban Principes**

**Change Management Principes:**
1. Start met wat je nu doet
2. Kom overeen om evolutionair te verbeteren
3. Moedig leiderschap aan op alle niveaus

**Service Delivery Principes:**
1. Begrijp en focus op klantbehoeften en verwachtingen
2. Manage het werk, niet de mensen
3. Evolueer beleid regelmatig om uitkomsten te verbeteren

**De Kanban Practices**

Kanban kent 6 core practices:

1. **Visualize** - Maak werk zichtbaar
2. **Limit WIP** - Beperk werk in uitvoering
3. **Manage Flow** - Monitor en optimaliseer de flow
4. **Make Policies Explicit** - Maak afspraken duidelijk
5. **Implement Feedback Loops** - Creëer feedback mechanismen
6. **Improve Collaboratively, Evolve Experimentally** - Verbeter samen

We gaan elk van deze practices in detail behandelen.

**Waarom Kanban Werkt**

Kanban adresseert veelvoorkomende problemen:

**Probleem**: Te veel werk tegelijk
**Oplossing**: WIP-limieten forceren focus

**Probleem**: Werk blijft hangen
**Oplossing**: Visualisatie maakt bottlenecks zichtbaar

**Probleem**: Onvoorspelbare levertijden
**Oplossing**: Flow metrics geven voorspelbaarheid

**Probleem**: Weerstand tegen verandering
**Oplossing**: Evolutionair, geen big bang

**Kanban vs. Scrum**

| Aspect | Kanban | Scrum |
|--------|--------|-------|
| Cadans | Continue flow | Fixed sprints |
| Rollen | Geen voorgeschreven rollen | PO, SM, Developers |
| Planning | Just-in-time | Sprint Planning |
| Verandering | Start waar je bent | Framework adoptie |
| WIP | Expliciete limieten | Impliciete Sprint scope |
| Metrics | Lead time, throughput | Velocity |

Ze kunnen ook gecombineerd worden - "Scrumban".

**Samenvatting**

Kanban:
- Is een evolutionaire methode voor werk management
- Focust op flow, WIP-limieten en visualisatie
- Vraagt geen reorganisatie - start waar je bent
- Werkt voor alle soorten kenniswerk
- Kan gecombineerd worden met andere methoden`,
      keyTakeaways: [
        'Kanban = visual signal, focus on flow and pull',
        'Start where you are - no major reorganization needed',
        '6 core practices: visualize, limit WIP, manage flow, etc.',
        'Kanban is complementary to Scrum, not a replacement',
      ],
      keyTakeawaysNL: [
        'Kanban = visueel signaal, focus op flow en pull',
        'Start waar je bent - geen grote reorganisatie nodig',
        '6 core practices: visualize, limit WIP, manage flow, etc.',
        'Kanban is complementair aan Scrum, niet een vervanging',
      ],
      resources: [
        {
          name: 'Kanban Principles Poster',
          type: 'PDF',
          size: '1.8 MB',
          description: 'Visueel overzicht van principes en practices',
        },
      ],
    },
    {
      id: 'kb-l2',
      title: 'Designing the Kanban Board',
      titleNL: 'Het Kanban Bord Ontwerpen',
      duration: '20:00',
      type: 'video',
      videoUrl: '',
      transcript: `Het Kanban bord is de kern van visualisatie. Een goed ontworpen bord 
maakt werk zichtbaar en onthult bottlenecks. Laten we leren hoe je een effectief bord ontwerpt.

**De Basis: Kolommen**

Een Kanban bord visualiseert de workflow als kolommen:

Simpel:
| Backlog | In Progress | Done |

Uitgebreider:
| Backlog | Analysis | Development | Review | Testing | Done |

**Van Workflow naar Bord**

Begin met je huidige proces te begrijpen:
1. Welke stappen doorloopt werk?
2. Waar zitten wachtrijen?
3. Wie werkt aan welke stap?

Map dit naar kolommen. Niet te veel - start simpel!

**Split Kolommen: Doing vs. Done**

Een krachtig patroon is het splitsen van kolommen:

| Dev (Doing) | Dev (Done) | Review (Doing) | Review (Done) |

Dit maakt wachttijd expliciet:
- Doing: Er wordt actief aan gewerkt
- Done: Klaar voor de volgende stap, wachtend

Als "Done" kolommen vol raken, is er een bottleneck downstream.

**Swimlanes**

Horizontale lanes segmenteren het bord:

Per type werk:
- Features
- Bug fixes
- Technical debt

Per team:
- Team A
- Team B

Per service level:
- Expedite (urgent)
- Standard
- Fixed date

**Kaarten (Tickets)**

Elke kaart vertegenwoordigt een werk item:

Essentiële informatie:
- Titel (wat)
- Wie werkt eraan (avatar/naam)
- Wanneer gestart (datum)
- Type (kleur/label)
- Blokkades (expliciet markeren!)

Optioneel:
- Service level
- Due date
- Size/effort

**Blokkades Visualiseren**

Geblokkeerd werk moet schreeuwen om aandacht:
- Rode rand
- Blokkade-marker
- Reden expliciet vermeld

Een blokkade is prioriteit #1 - het verstoort flow.

**WIP Limieten op het Bord**

Elke kolom (of swimlane) krijgt een WIP limiet:

| Analysis [3] | Dev [5] | Review [2] | Done |

Het getal is het maximum aantal items in die kolom.

**Expedite Lane**

Voor urgent werk kun je een "expedite" swimlane hebben:
- Beperkt tot 1-2 items
- Gaat voor al het andere
- Alleen voor echte urgentie!

Misbruik hiervan vernietigt je flow.

**Commitment Point en Delivery Point**

Identificeer twee cruciale punten:

**Commitment Point**: 
Waar committeren we ons aan het werk?
Dit is waar lead time begint te tellen.

**Delivery Point**:
Waar is het werk klaar voor de klant?
Dit is waar lead time eindigt.

| Backlog | Analysis | Dev | Test | Done |
           ^                        ^
           Commitment               Delivery

**Fysiek vs. Digitaal**

**Fysiek bord:**
✅ Zichtbaar voor iedereen in de ruimte
✅ Tactiele interactie
✅ Makkelijk te wijzigen
❌ Niet voor remote teams
❌ Geen metrics automatisch

**Digitaal bord (Jira, Trello, etc.):**
✅ Werkt voor remote teams
✅ Automatische metrics
✅ Integraties
❌ Minder zichtbaar
❌ Kan te complex worden

Tip: Start fysiek als je kunt, migreer later naar digitaal.

**Evolutie van het Bord**

Je bord zal evolueren:
1. Start simpel
2. Voeg detail toe als je bottlenecks ziet
3. Verwijder wat niet helpt
4. Pas aan op basis van metrics

Het perfecte bord bestaat niet - het evolueert mee met je begrip.

**Samenvatting**

Een goed Kanban bord:
- Visualiseert je werkelijke workflow
- Maakt wachttijd expliciet (doing/done splits)
- Heeft duidelijke WIP limieten
- Laat blokkades schreeuwen
- Evolueert met je inzichten`,
      keyTakeaways: [
        'Start by mapping your actual workflow',
        'Split columns into Doing/Done to reveal wait time',
        'Make blockers explicitly visible',
        'Start simple and evolve the board based on insights',
      ],
      keyTakeawaysNL: [
        'Begin met je werkelijke workflow te mappen',
        'Split kolommen in Doing/Done om wachttijd te onthullen',
        'Maak blokkades expliciet zichtbaar',
        'Start simpel en evolueer het bord op basis van inzichten',
      ],
      resources: [
        {
          name: 'Kanban Board Design Checklist',
          type: 'PDF',
          size: '420 KB',
          description: 'Checklist voor effectief bord ontwerp',
        },
      ],
    },
    {
      id: 'kb-l3',
      title: 'WIP Limits',
      titleNL: 'WIP Limieten',
      duration: '18:00',
      type: 'video',
      videoUrl: '',
      transcript: `WIP limieten zijn het hart van Kanban. Ze lijken simpel maar hebben 
een diepgaande impact op hoe teams werken.

**Wat is WIP?**

WIP = Work In Progress

Dit is werk dat is gestart maar nog niet afgerond. In Kanban beperken we dit bewust.

**Waarom WIP Beperken?**

**Little's Law** (wiskunde uit de jaren '60):

Lead Time = WIP / Throughput

Dit betekent:
- Bij gelijke throughput: minder WIP = kortere lead time
- Te veel WIP = langere levertijden

**Context Switching Kost**

Elke keer als je switcht tussen taken:
- Verlies je 15-20 minuten om weer "in" te komen
- Maak je meer fouten
- Daalt je productiviteit

Studies tonen: 2 gelijktijdige projecten = 20% verlies
5 gelijktijdige projecten = 75% verlies!

**Werk stapelt op**

Zonder WIP limieten:
- Start je steeds nieuw werk
- Oud werk blijft liggen
- Niets wordt echt afgemaakt
- Lead times exploderen

WIP limieten forceren: "Stop starting, start finishing!"

**WIP Limieten Bepalen**

Er is geen magische formule. Begin met:

**Methode 1: Huidige WIP / 2**
Kijk hoeveel werk er nu gemiddeld in een kolom zit.
Halveer dat als startpunt.

**Methode 2: Aantal mensen + 1**
Als 4 mensen aan development werken: WIP = 5
Dit staat enige slack toe zonder chaos.

**Methode 3: Experimenteer**
Start te laag, verhoog als het knelt.
Beter te strak dan te los.

**Per Kolom of Per Persoon?**

**Per kolom** (aanbevolen):
- Team verantwoordelijk
- Stimuleert samenwerking
- Makkelijker te handhaven

**Per persoon:**
- Individuele focus
- Kan silo's versterken
- Moeilijker bij wisselende rollen

**WIP Limieten Handhaven**

Wat als de limiet bereikt is?

"Stop starting, start finishing!"

Opties:
1. Help werk in de volste kolom afronden
2. Wacht tot er ruimte is
3. Onderzoek de blokkade

Niet: De limiet verhogen bij het eerste ongemak!

**De Pijn is het Punt**

WIP limieten voelen ongemakkelijk. Dat is intentioneel.

Ze onthullen:
- Bottlenecks
- Afhankelijkheden
- Onbalans in capaciteit
- Te grote werk items

Als het niet knelt, zijn je limieten te los.

**Kolom WIP vs. System WIP**

Je kunt WIP limieten zetten op:
- Individuele kolommen
- Groepen kolommen
- Het hele systeem

System WIP limiet:
"We hebben nooit meer dan 20 items in totaal in vlucht"

Dit voorkomt dat werk zich opstapelt aan het begin.

**Evolutie van WIP Limieten**

1. **Start zonder limieten**: Meet eerst je huidige WIP
2. **Introduceer ruime limieten**: Eerste bewustwording
3. **Verlaag geleidelijk**: Tot je pijn voelt
4. **Stabiliseer**: Vind de balans
5. **Pas aan**: Bij verandering in team/werk

**Speciale Situaties**

**Blokkades:**
Geblokkeerd werk telt mee voor WIP.
Dit dwingt actie: los de blokkade op!

**Expedite items:**
Aparte lane met eigen (lage) limiet.
Anders ondermijnt het je hele systeem.

**Pair working:**
Twee mensen op één item = één WIP.
Dit stimuleert pair/mob programming.

**Samenvatting**

WIP limieten:
- Verkorten lead time (Little's Law)
- Reduceren context switching
- Forceren focus en afronding
- Onthullen bottlenecks
- Moeten evolutionair worden bepaald
- Zijn bedoeld om te knellen`,
      keyTakeaways: [
        'Little\'s Law: Lead Time = WIP / Throughput',
        'Context switching costs 15-20 minutes per switch',
        'Stop starting, start finishing!',
        'The pain of WIP limits reveals problems',
      ],
      keyTakeawaysNL: [
        'Little\'s Law: Lead Time = WIP / Throughput',
        'Context switching kost 15-20 minuten per switch',
        'Stop starting, start finishing!',
        'De pijn van WIP limieten onthult problemen',
      ],
      resources: [
        {
          name: 'WIP Limits Calculator',
          type: 'XLSX',
          size: '95 KB',
          description: 'Spreadsheet voor WIP limiet berekening',
        },
      ],
    },
    {
      id: 'kb-l4',
      title: 'Flow Metrics',
      titleNL: 'Flow Metrics',
      duration: '22:00',
      type: 'video',
      videoUrl: '',
      transcript: `"You can't improve what you don't measure." Flow metrics zijn essentieel 
voor het begrijpen en verbeteren van je Kanban systeem.

**De Belangrijkste Metrics**

**1. Lead Time**
Tijd van commitment tot delivery.
"Hoe lang duurt het voordat werk klaar is?"

Commitment point → Delivery point

**2. Cycle Time**
Tijd in een specifieke fase of kolom.
"Hoe lang duurt development?"

Handig voor bottleneck analyse.

**3. Throughput**
Aantal items geleverd per tijdseenheid.
"Hoeveel leveren we per week?"

**4. WIP**
Hoeveelheid werk in uitvoering.
"Hoeveel hebben we tegelijk in vlucht?"

**Little's Law in de Praktijk**

Lead Time = WIP / Throughput

Als je weet:
- WIP = 10 items
- Throughput = 5 items/week

Dan: Lead Time = 10/5 = 2 weken

Dit is een gemiddelde - individuele items variëren.

**Lead Time Distribution**

Kijk niet alleen naar gemiddelde, maar naar de verdeling:

- **85e percentiel**: "85% van items binnen X dagen"
- Dit is betrouwbaarder dan gemiddelde
- Gebruik voor voorspellingen

"Wanneer is dit klaar?"
"85% kans binnen 10 dagen"

**Cumulative Flow Diagram (CFD)**

De CFD is de krachtigste Kanban visualisatie:

- X-as: Tijd
- Y-as: Aantal items
- Gebieden: Status (backlog, in progress, done)

De CFD toont:
- **WIP**: Verticale afstand tussen lijnen
- **Lead Time**: Horizontale afstand
- **Throughput**: Helling van "Done" lijn
- **Bottlenecks**: Gebieden die groeien

Als een gebied groeit, stapelt werk op. Actie nodig!

**Throughput Run Chart**

Simpele grafiek:
- X-as: Week/Sprint/Periode
- Y-as: Items afgerond

Kijk naar:
- Trend (stijgend, dalend, stabiel)
- Variabiliteit (consistent of wild)
- Outliers (waarom die piek/dip?)

**Cycle Time Scatterplot**

Per item:
- X-as: Afronddatum
- Y-as: Cycle time

Voeg percentiellijnen toe:
- 50e percentiel (mediaan)
- 85e percentiel
- 95e percentiel

Dit toont:
- Spreiding in cycle times
- Outliers (waarom duurde dat zo lang?)
- Trends over tijd

**Aging WIP**

Hoelang zit werk al in het systeem?

Items die langer dan 85e percentiel "in flight" zijn: 
- Rode vlag!
- Waarschijnlijk geblokkeerd
- Verstoren flow

Visualiseer dit op je bord met kleuren of markers.

**Blokkade Analyse**

Track blokkades:
- Aantal blokkades per periode
- Tijd geblokkeerd
- Reden van blokkade

Categoriseer redenen:
- Wacht op info
- Afhankelijkheid
- Technisch probleem
- etc.

Dit onthult systemische problemen.

**Flow Efficiency**

Flow Efficiency = Werktijd / Lead Time × 100%

Als een item 10 dagen lead time heeft, maar slechts 2 dagen actief bewerkt:
Flow Efficiency = 2/10 = 20%

Typisch voor kenniswerk: 5-15%!
Dat is 85-95% wachttijd!

Dit is waar je verbeterpotentieel zit.

**Metrics Gebruiken**

Metrics zijn voor:
- Voorspelbaarheid verbeteren
- Bottlenecks identificeren
- Experimenten evalueren
- Gesprekken faciliteren

NIET voor:
- Mensen beoordelen
- Teams vergelijken
- Micromanagement

**Samenvatting**

Flow metrics:
- Lead time, throughput, WIP en cycle time zijn de kern
- CFD is de krachtigste visualisatie
- Gebruik percentielverdelingen voor voorspellingen
- Track blokkades om systemische issues te vinden
- Flow efficiency toont waar waarde verloren gaat`,
      keyTakeaways: [
        'Lead Time = WIP / Throughput (Little\'s Law)',
        'CFD visualizes WIP, lead time, throughput, and bottlenecks',
        'Use the 85th percentile for reliable predictions',
        'Flow efficiency in knowledge work is typically 5-15%',
      ],
      keyTakeawaysNL: [
        'Lead Time = WIP / Throughput (Little\'s Law)',
        'CFD visualiseert WIP, lead time, throughput en bottlenecks',
        'Gebruik 85e percentiel voor betrouwbare voorspellingen',
        'Flow efficiency in kenniswerk is typisch 5-15%',
      ],
      resources: [
        {
          name: 'Flow Metrics Dashboard Template',
          type: 'XLSX',
          size: '245 KB',
          description: 'Excel template voor flow metrics',
        },
        {
          name: 'CFD Guide',
          type: 'PDF',
          size: '1.2 MB',
          description: 'Uitgebreide gids voor CFD interpretatie',
        },
      ],
    },
    {
      id: 'kb-l5',
      title: 'Quiz: Kanban Fundamentals',
      titleNL: 'Quiz: Kanban Fundamenten',
      duration: '15:00',
      type: 'quiz',
      quiz: [
        {
          id: 'kb-q1',
          question: 'Wat betekent Kanban letterlijk?',
          options: [
            'Agile methode',
            'Visueel signaal',
            'Workflow management',
            'Continue verbetering'
          ],
          correctAnswer: 1,
          explanation: 'Kanban (看板) is Japans voor "visueel signaal" of "kaart".',
        },
        {
          id: 'kb-q2',
          question: 'Wat is Little\'s Law?',
          options: [
            'WIP = Lead Time × Throughput',
            'Lead Time = WIP / Throughput',
            'Throughput = Lead Time × WIP',
            'WIP = Throughput / Lead Time'
          ],
          correctAnswer: 1,
          explanation: 'Little\'s Law stelt dat Lead Time = WIP / Throughput.',
        },
        {
          id: 'kb-q3',
          question: 'Waarom zijn WIP limieten pijnlijk?',
          options: [
            'Omdat ze te hoog zijn',
            'Omdat ze problemen onthullen die je moet oplossen',
            'Omdat niemand ze begrijpt',
            'Omdat ze de throughput verlagen'
          ],
          correctAnswer: 1,
          explanation: 'WIP limieten zijn bedoeld om pijnlijk te zijn - ze onthullen bottlenecks en problemen.',
        },
        {
          id: 'kb-q4',
          question: 'Wat visualiseert een Cumulative Flow Diagram (CFD)?',
          options: [
            'Alleen throughput',
            'WIP, lead time, throughput en bottlenecks',
            'Alleen blokkades',
            'Team velocity'
          ],
          correctAnswer: 1,
          explanation: 'De CFD toont WIP, lead time, throughput en bottlenecks in één visualisatie.',
        },
        {
          id: 'kb-q5',
          question: 'Wat is typisch de flow efficiency in kenniswerk?',
          options: ['50-60%', '30-40%', '5-15%', '80-90%'],
          correctAnswer: 2,
          explanation: 'Flow efficiency in kenniswerk is typisch 5-15%, wat betekent dat 85-95% wachttijd is.',
        },
      ],
    },
  ],
};

// ============================================
// MODULE 2: KANBAN IN DE PRAKTIJK
// ============================================
const module2: Module = {
  id: 'kb-m2',
  title: 'Module 2: Kanban in Practice',
  titleNL: 'Module 2: Kanban in de Praktijk',
  description: 'Practical application: cadences, policies, and continuous improvement.',
  descriptionNL: 'Praktische toepassing: cadansen, policies en continue verbetering.',
  lessons: [
    {
      id: 'kb-l6',
      title: 'Kanban Cadences',
      titleNL: 'Kanban Cadansen',
      duration: '18:00',
      type: 'video',
      videoUrl: '',
      transcript: `Kanban heeft geen verplichte meetings, maar kent wel cadansen - 
regelmatige feedbackmomenten die je systeem gezond houden.

**Wat zijn Cadansen?**

Cadansen zijn regelmatige events die feedback loops creëren. Ze zijn niet 
verplicht zoals in Scrum, maar sterk aanbevolen.

**De 7 Kanban Cadansen**

**1. Standup Meeting (dagelijks)**
Focus op het werk, niet de mensen.
"Walk the board" van rechts naar links:
- Wat is geblokkeerd?
- Wat is bijna klaar?
- Wat heeft hulp nodig?

**2. Replenishment Meeting (wekelijks/bi-weekly)**
Vul de backlog aan met nieuw werk.
- Review commitment point
- Prioriteer nieuwe items
- Balanceer vraag en capaciteit

**3. Delivery Planning (per release)**
Plan de delivery van klaar werk.
- Wat is ready to ship?
- Welke dependencies zijn er?
- Wat is de rollout strategie?

**4. Service Delivery Review (wekelijks)**
Review van metrics en performance.
- Lead time trends
- Throughput analyse
- Blokkades patterns

**5. Operations Review (maandelijks)**
Cross-team review.
- Afhankelijkheden tussen teams
- Systeembrede issues
- Resource balancering

**6. Risk Review (maandelijks)**
Identificeer en bespreek risico's.
- Technische risico's
- Dependency risico's
- Capaciteitsrisico's

**7. Strategy Review (kwartaal)**
Alignment met organisatiedoelen.
- Past onze aanpak nog?
- Moeten we bijsturen?
- Wat leren we?

**Cadansen zijn Optioneel**

Start met wat je nodig hebt:
- Minimum: Standup + Replenishment
- Voeg toe als je groeit
- Schrap wat niet werkt

**Samenvatting**

Kanban cadansen:
- Creëren feedback loops op verschillende niveaus
- Zijn niet verplicht maar sterk aanbevolen
- Beginnen met dagelijkse standup en replenishment
- Worden toegevoegd naar behoefte`,
      keyTakeaways: [
        'Cadences are regular feedback moments',
        'Walk the board from right to left in standups',
        'Start with standup and replenishment, add more as needed',
        'Cadences are optional but strongly recommended',
      ],
      keyTakeawaysNL: [
        'Cadansen zijn regelmatige feedbackmomenten',
        'Walk the board van rechts naar links in standups',
        'Start met standup en replenishment, voeg toe naar behoefte',
        'Cadansen zijn optioneel maar sterk aanbevolen',
      ],
    },
    {
      id: 'kb-l7',
      title: 'Policies and Service Level Expectations',
      titleNL: 'Policies en Service Level Expectations',
      duration: '16:00',
      type: 'video',
      videoUrl: '',
      transcript: `"Make policies explicit" is een van de 6 core practices. 
Expliciete policies zorgen voor duidelijkheid en voorspelbaarheid.

**Wat zijn Policies?**

Policies zijn afspraken over hoe werk door het systeem stroomt:
- Wanneer is werk klaar om te starten?
- Wanneer is werk "done"?
- Wie mag wat beslissen?
- Hoe gaan we om met urgentie?

**Definition of Ready**

Wanneer mag werk de commitment point passeren?

Voorbeeld:
- User story is geschreven
- Acceptatiecriteria zijn gedefinieerd
- Afhankelijkheden zijn geïdentificeerd
- Team heeft vragen kunnen stellen

**Definition of Done**

Wanneer is werk echt af?

Voorbeeld:
- Code is geschreven en gereviewed
- Tests zijn geschreven en passeren
- Documentatie is bijgewerkt
- Product Owner heeft geaccepteerd

**Service Level Expectations (SLE)**

SLE's geven voorspelbaarheid aan klanten:

"85% van features wordt binnen 10 werkdagen opgeleverd"

Dit is gebaseerd op historische data:
- Meet je lead times
- Bepaal het 85e percentiel
- Communiceer dit als expectation

**Classes of Service**

Niet al het werk is gelijk. Classes of Service differentiëren:

**Expedite (5%)**
- Echte noodgevallen
- Gaat voor alles
- Heeft eigen (lage) WIP limiet

**Fixed Date (15%)**
- Deadline-gedreven
- Regelgeving, events
- Plan backward

**Standard (70%)**
- Normaal werk
- FIFO binnen prioriteit
- Reguliere SLE

**Intangible (10%)**
- Technical debt
- Experimenten
- Belangrijk maar niet urgent

**Policies Visualiseren**

Maak policies zichtbaar op of bij het bord:
- DoR en DoD op het bord
- SLE's zichtbaar
- Class of Service indicatoren

**Samenvatting**

Expliciete policies:
- Creëren duidelijkheid en voorspelbaarheid
- Definiëren wanneer werk ready en done is
- Differentiëren werk met classes of service
- Communiceren expectations via SLE's`,
      keyTakeaways: [
        'Policies make agreements explicit and visible',
        'Definition of Ready determines when work may start',
        'Definition of Done determines when work is complete',
        'Service Level Expectations provide predictability',
      ],
      keyTakeawaysNL: [
        'Policies maken afspraken expliciet en zichtbaar',
        'Definition of Ready bepaalt wanneer werk mag starten',
        'Definition of Done bepaalt wanneer werk af is',
        'Service Level Expectations geven voorspelbaarheid',
      ],
    },
    {
      id: 'kb-l8',
      title: 'Continuous Improvement',
      titleNL: 'Continue Verbetering',
      duration: '18:00',
      type: 'video',
      videoUrl: '',
      transcript: `De zesde Kanban practice is "Improve Collaboratively, Evolve Experimentally". 
Kanban is geen eindstaat maar een pad van continue verbetering.

**De PDCA Cyclus**

Plan-Do-Check-Act is de basis:

**Plan**: Identificeer een verbetering
**Do**: Voer een klein experiment uit
**Check**: Meet het resultaat
**Act**: Adopteer, aanpas of stop

**Kaizen: Kleine Stapjes**

Kaizen = continue, kleine verbeteringen

Geen big bang veranderingen maar:
- Kleine experimenten
- Frequente evaluatie
- Geleidelijke evolutie

**Root Cause Analysis**

Als iets misgaat, vraag 5x "Waarom?"

Probleem: "Feature duurde 3 weken i.p.v. 1"
1. Waarom? Code review duurde lang
2. Waarom? Reviewer was druk
3. Waarom? Te veel WIP bij reviewer
4. Waarom? Geen WIP limiet op review
5. Waarom? Nooit over nagedacht

Root cause: WIP limiet op review kolom ontbreekt.

**Retrospectives in Kanban**

Hoewel niet verplicht, zijn retrospectives waardevol:
- Op vaste cadans (bi-weekly, monthly)
- Focus op systeem, niet individuen
- Data-driven discussie

**Experimenten Ontwerpen**

Elk experiment heeft:
- **Hypothese**: "Als we X doen, verwachten we Y"
- **Meting**: Hoe meten we succes?
- **Timebox**: Wanneer evalueren we?
- **Beslissing**: Adopteren, aanpassen of stoppen

**Samenvatting**

Continue verbetering:
- Gebruikt PDCA cyclus
- Focust op kleine, frequente verbeteringen (Kaizen)
- Analyseert root causes met 5 Whys
- Ontwerpt experimenten met duidelijke hypotheses`,
      keyTakeaways: [
        'PDCA cycle: Plan, Do, Check, Act',
        'Kaizen = continuous small improvements',
        '5 Whys helps find root causes',
        'Experiments need a hypothesis, measurement, and timebox',
      ],
      keyTakeawaysNL: [
        'PDCA cyclus: Plan, Do, Check, Act',
        'Kaizen = continue kleine verbeteringen',
        '5 Whys helpt root causes te vinden',
        'Experimenten hebben hypothese, meting en timebox',
      ],
    },
    {
      id: 'kb-l9',
      title: 'Final Exam',
      titleNL: 'Eindexamen',
      duration: '30:00',
      type: 'exam',
      videoUrl: '',
      transcript: `Dit is het eindexamen van de Kanban voor Kenniswerk cursus.

**Examen Informatie:**
- 25 multiple choice vragen
- 45 minuten tijd
- 70% score nodig om te slagen

**Onderwerpen:**
- Kanban principes en practices
- Kanban bord ontwerp
- WIP limieten en Little's Law
- Flow metrics (CFD, lead time, throughput)
- Cadansen
- Policies en Service Level Expectations
- Continue verbetering

Succes!`,
    },
    {
      id: 'kb-l10',
      title: 'Certificate',
      titleNL: 'Certificaat',
      duration: '5:00',
      type: 'certificate',
      videoUrl: '',
      transcript: `Gefeliciteerd met het afronden van de Kanban voor Kenniswerk cursus!

**Je Certificaat**

Je ontvangt een certificaat dat bevestigt:
- Cursus: Kanban for Knowledge Work
- Duur: 8 uur
- Onderwerpen: Kanban principles, WIP limits, Flow metrics, Cadences
- Datum van afronding

**Vervolgstappen**

1. **Praktijk**: Start met visualiseren van je werk
2. **WIP**: Introduceer WIP limieten
3. **Metrics**: Begin met meten
4. **Certificering**: Overweeg Kanban University certificering

Veel succes met je Kanban journey!`,
    },
  ],
};

// ============================================
// EXPORT MODULES
// ============================================
export const kanbanModules: Module[] = [
  module1,
  module2,
];

// ============================================
// COURSE DEFINITION
// ============================================
export const kanbanCourse: Course = {
  id: 'kanban-practitioner',
  title: 'Kanban for Knowledge Work',
  titleNL: 'Kanban voor Kenniswerk',
  description: 'Optimize flow and deliver continuous value. Learn WIP limits, flow metrics, and the Kanban method for knowledge work.',
  descriptionNL: 'Optimaliseer flow en lever continue waarde. Leer WIP-limieten, flow metrics en de Kanban methode voor kenniswerk.',
  icon: Trello,
  color: BRAND.pink,
  gradient: `linear-gradient(135deg, ${BRAND.pink}, #DB2777)`,
  category: 'agile',
  methodology: 'kanban',
  levels: 3,
  modules: kanbanModules.reduce((total, m) => total + m.lessons.length, 0),
  duration: 8,
  rating: 4.7,
  students: 3892,
  tags: ['Kanban', 'Flow', 'WIP', 'Visualization', 'Continuous Improvement', 'Little\'s Law'],
  tagsNL: ['Kanban', 'Flow', 'WIP', 'Visualisatie', 'Continue Verbetering', 'Little\'s Law'],
  instructor: instructors.anna,
  featured: false,
  bestseller: false,
  new: true,
  freeForCustomers: true,
  certificate: true,
  whatYouLearn: [
    'The Kanban principles and 6 core practices',
    'How to design effective Kanban boards',
    'WIP limits and Little\'s Law',
    'Flow metrics: Lead time, throughput, CFD',
    'Kanban cadences and feedback loops',
    'Service Level Expectations and Classes of Service',
    'Continuous improvement with PDCA and Kaizen',
  ],
  whatYouLearnNL: [
    'De Kanban principes en 6 core practices',
    'Hoe effectieve Kanban borden te ontwerpen',
    'WIP limieten en Little\'s Law',
    'Flow metrics: Lead time, throughput, CFD',
    'Kanban cadansen en feedback loops',
    'Service Level Expectations en Classes of Service',
    'Continue verbetering met PDCA en Kaizen',
  ],
  requirements: [
    'No prior knowledge required',
    'Experience with teamwork is useful',
  ],
  requirementsNL: [
    'Geen voorkennis vereist',
    'Ervaring met teamwork is nuttig',
  ],
  targetAudience: [
    'Teams wanting to improve their workflow',
    'Managers implementing Kanban',
    'Agile coaches and Scrum Masters',
    'Anyone struggling with too much work in progress',
  ],
  targetAudienceNL: [
    'Teams die hun workflow willen verbeteren',
    'Managers die Kanban willen implementeren',
    'Agile coaches en Scrum Masters',
    'Iedereen die worstelt met te veel werk in uitvoering',
  ],
  courseModules: kanbanModules,
};

export default kanbanCourse;