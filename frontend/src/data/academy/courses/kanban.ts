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
  order: 0,
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
      keyTakeawaysEN: [
        'Kanban = visual signal, focus on flow and pull',
        'Start where you are - no major reorganization needed',
        '6 core practices: visualize, limit WIP, manage flow, etc.',
        'Kanban is complementary to Scrum, not a replacement',
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
      keyTakeawaysEN: [
        'Start by mapping your actual workflow',
        'Split columns into Doing/Done to reveal wait time',
        'Make blockers explicitly visible',
        'Start simple and evolve the board based on insights',
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
      keyTakeawaysEN: [
        'Little\'s Law: Lead Time = WIP / Throughput',
        'Context switching costs 15-20 minutes per switch',
        'Stop starting, start finishing!',
        'The pain of WIP limits reveals problems',
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
      keyTakeawaysEN: [
        'Lead Time = WIP / Throughput (Little\'s Law)',
        'CFD visualizes WIP, lead time, throughput, and bottlenecks',
        'Use the 85th percentile for reliable predictions',
        'Flow efficiency in knowledge work is typically 5-15%',
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
          questionEN: 'What does Kanban literally mean?',
          options: [
            'Agile methode',
            'Visueel signaal',
            'Workflow management',
            'Continue verbetering'
          ],
          optionsEN: [
            'Agile method',
            'Visual signal',
            'Workflow management',
            'Continuous improvement'
          ],
          correctAnswer: 1,
          explanation: 'Kanban (看板) is Japans voor "visueel signaal" of "kaart".',
          explanationEN: 'Kanban (看板) is Japanese for "visual signal" or "card".',
        },
        {
          id: 'kb-q2',
          question: 'Wat is Little\'s Law?',
          questionEN: 'What is Little\'s Law?',
          options: [
            'WIP = Lead Time × Throughput',
            'Lead Time = WIP / Throughput',
            'Throughput = Lead Time × WIP',
            'WIP = Throughput / Lead Time'
          ],
          optionsEN: [
            'WIP = Lead Time × Throughput',
            'Lead Time = WIP / Throughput',
            'Throughput = Lead Time × WIP',
            'WIP = Throughput / Lead Time'
          ],
          correctAnswer: 1,
          explanation: 'Little\'s Law stelt dat Lead Time = WIP / Throughput.',
          explanationEN: 'Little\'s Law states that Lead Time = WIP / Throughput. Reducing Work In Progress (WIP) directly reduces lead time when throughput is held constant.',
        },
        {
          id: 'kb-q3',
          question: 'Waarom zijn WIP limieten pijnlijk?',
          questionEN: 'Why are WIP limits painful?',
          options: [
            'Omdat ze te hoog zijn',
            'Omdat ze problemen onthullen die je moet oplossen',
            'Omdat niemand ze begrijpt',
            'Omdat ze de throughput verlagen'
          ],
          optionsEN: [
            'Because they are set too high',
            'Because they expose problems that need to be solved',
            'Because nobody understands them',
            'Because they reduce throughput'
          ],
          correctAnswer: 1,
          explanation: 'WIP limieten zijn bedoeld om pijnlijk te zijn - ze onthullen bottlenecks en problemen.',
          explanationEN: 'Work In Progress (WIP) limits are intentionally painful — the discomfort reveals bottlenecks, dependencies, and imbalances in capacity that must be addressed to improve flow.',
        },
        {
          id: 'kb-q4',
          question: 'Wat visualiseert een Cumulative Flow Diagram (CFD)?',
          questionEN: 'What does a Cumulative Flow Diagram (CFD) visualize?',
          options: [
            'Alleen throughput',
            'WIP, lead time, throughput en bottlenecks',
            'Alleen blokkades',
            'Team velocity'
          ],
          optionsEN: [
            'Throughput only',
            'WIP, lead time, throughput, and bottlenecks',
            'Blockers only',
            'Team velocity'
          ],
          correctAnswer: 1,
          explanation: 'De CFD toont WIP, lead time, throughput en bottlenecks in één visualisatie.',
          explanationEN: 'The cumulative flow diagram shows WIP, lead time, throughput, and bottlenecks all in one visualization.',
        },
        {
          id: 'kb-q5',
          question: 'Wat is typisch de flow efficiency in kenniswerk?',
          questionEN: 'What is the typical flow efficiency in knowledge work?',
          options: ['50-60%', '30-40%', '5-15%', '80-90%'],
          optionsEN: ['50-60%', '30-40%', '5-15%', '80-90%'],
          correctAnswer: 2,
          explanation: 'Flow efficiency in kenniswerk is typisch 5-15%, wat betekent dat 85-95% wachttijd is.',
          explanationEN: 'Flow efficiency in knowledge work is typically 5-15%, meaning 85-95% of lead time is waiting time rather than active work.',
        },
      ],
    },
  ],
};

// ============================================
// MODULE 2: KANBAN IN DE PRAKTIJK
// ============================================
const module2: Module = {
  order: 1,
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
Identificeer en bespreek risico\'s.
- Technische risico\'s
- Dependency risico\'s
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
      keyTakeawaysEN: [
        'Cadences are regular feedback moments',
        'Walk the board from right to left in standups',
        'Start with standup and replenishment, add more as needed',
        'Cadences are optional but strongly recommended',
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
      keyTakeawaysEN: [
        'Policies make agreements explicit and visible',
        'Definition of Ready determines when work may start',
        'Definition of Done determines when work is complete',
        'Service Level Expectations provide predictability',
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
      keyTakeawaysEN: [
        'PDCA cycle: Plan, Do, Check, Act',
        'Kaizen = continuous small improvements',
        '5 Whys helps find root causes',
        'Experiments require a hypothesis, measurement, and timebox',
      ],
    },
    {
      id: 'kb-l-assignment',
      title: 'Praktijkopdracht: Ontwerp een Kanban-bord',
      titleNL: 'Praktijkopdracht: Ontwerp een Kanban-bord',
      duration: '60:00',
      type: 'assignment',
      requires_admin_approval: true,
      assignment: {
        title: 'Ontwerp een WIP-gelimiteerd Kanban-bord voor een 6-koppig devteam',
        description: `Je bent Kanban-coach voor een softwareontwikkelteam van 6 personen dat vier typen werk beheert: nieuwe features, bug fixes, technische schuld, en urgente klantvragen (expedites). De huidige flow is onzichtbaar: niemand weet wat in behandeling is, wat geblokkeerd is, of wat de gemiddelde doorlooptijd is.

Jouw taak is een volledig Kanban-systeemontwerp opleveren dat direct bruikbaar is.`,
        deliverables: [
          'Kolomstructuur van het bord: alle kolommen en sub-kolommen met namen en beschrijving per kolom (minimaal 5 kolommen)',
          'WIP-limieten per kolom met onderbouwing (gebruik Little\'s Law of empirische redenering)',
          'Blokkeer-policy: wat geldt als "geblokkeerd", hoe wordt het gemarkeerd, wie lost het op en binnen welke termijn?',
          '1 Procesverbeteringsexperiment: hypothese, meetmethode, tijdbox, en succescriterium',
        ],
        rubric: [
          { criterion: 'Kolomstructuur realistisch en volledig (alle 4 werktypen zichtbaar)', points: 25 },
          { criterion: 'WIP-limieten onderbouwd met redenering', points: 25 },
          { criterion: 'Blokkeer-policy concreet en uitvoerbaar', points: 20 },
          { criterion: 'Experiment heeft duidelijke hypothese + meetmethode', points: 20 },
          { criterion: 'Professionele presentatie en Nederlandstalige beschrijving', points: 10 },
        ],
        submission_format: 'markdown',
      },
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
      quiz: [
        {
          id: 'kanban-exam-q1',
          question: 'Which of the following is one of the four foundational principles of the Kanban Method?',
          questionNL: 'Welk van de volgende is een van de vier fundamentele principes van de Kanban Methode?',
          options: [
            'Define sprint goals before every iteration',
            'Start with what you do now',
            'Assign dedicated roles to all team members',
            'Limit the number of team members per board'
          ],
          optionsNL: [
            'Definieer sprintdoelen vóór elke iteratie',
            'Begin met wat je nu doet',
            'Wijs vaste rollen toe aan alle teamleden',
            'Beperk het aantal teamleden per bord'
          ],
          correctAnswer: 1,
          explanation: '"Start with what you do now" is one of the four foundational Kanban principles (David J. Anderson). It means Kanban does not require you to change your existing process before starting — you visualize the current state first.',
          explanationNL: '"Begin met wat je nu doet" is een van de vier fundamentele Kanban-principes (David J. Anderson). Het betekent dat Kanban niet vereist dat je je bestaand proces verandert voordat je begint — je visualiseert eerst de huidige situatie.',
        },
        {
          id: 'kanban-exam-q2',
          question: 'Which statement best describes the Kanban principle "Agree to pursue incremental, evolutionary change"?',
          questionNL: 'Welke uitspraak beschrijft het Kanban-principe "Streef naar incrementele, evolutionaire verandering" het best?',
          options: [
            'Replace the entire process at once with the Kanban system',
            'Make small, continuous improvements rather than large disruptive changes',
            'Only change the process after a retrospective vote',
            'Incremental change applies only to software delivery'
          ],
          optionsNL: [
            'Vervang het volledige proces in één keer door het Kanban-systeem',
            'Maak kleine, continue verbeteringen in plaats van grote disruptieve wijzigingen',
            'Verander het proces alleen na een retrospectieve stemming',
            'Incrementele verandering geldt alleen voor softwareontwikkeling'
          ],
          correctAnswer: 1,
          explanation: 'The principle emphasizes evolutionary change — small improvements over time — to reduce organizational resistance and avoid the disruption caused by large-scale process overhauls.',
          explanationNL: 'Het principe benadrukt evolutionaire verandering — kleine verbeteringen over tijd — om organisatieweerstand te verminderen en de verstoring van grootschalige proceswijzigingen te vermijden.',
        },
        {
          id: 'kanban-exam-q3',
          question: 'What is the primary purpose of WIP limits in a Kanban system?',
          questionNL: 'Wat is het primaire doel van WIP-limieten in een Kanbansysteem?',
          options: [
            'To prevent the team from taking on too many projects per year',
            'To expose bottlenecks and improve flow by limiting work in process',
            'To assign a maximum number of tasks per person per sprint',
            'To restrict the number of columns on the Kanban board'
          ],
          optionsNL: [
            'Om het team te verhinderen te veel projecten per jaar op te nemen',
            'Om knelpunten bloot te leggen en de flow te verbeteren door werk in uitvoering te beperken',
            'Om een maximaal aantal taken per persoon per sprint toe te wijzen',
            'Om het aantal kolommen op het Kanbanbord te beperken'
          ],
          correctAnswer: 1,
          explanation: 'WIP limits constrain the number of items in active states, which causes bottlenecks to become visible (work piles up at the constrained stage) and creates pressure to resolve them, improving overall flow.',
          explanationNL: 'WIP-limieten beperken het aantal items in actieve statussen, waardoor knelpunten zichtbaar worden (werk stapelt zich op bij de beperkte fase) en er druk ontstaat om ze op te lossen, wat de algehele flow verbetert.',
        },
        {
          id: 'kanban-exam-q4',
          question: 'According to Little\'s Law, if a team\'s average throughput is 5 items per week and the average WIP is 20 items, what is the average lead time?',
          questionNL: 'Volgens de wet van Little, als de gemiddelde throughput van een team 5 items per week is en de gemiddelde WIP 20 items, wat is dan de gemiddelde doorlooptijd?',
          options: [
            '100 weeks',
            '4 weeks',
            '0.25 weeks',
            '15 weeks'
          ],
          optionsNL: [
            '100 weken',
            '4 weken',
            '0,25 weken',
            '15 weken'
          ],
          correctAnswer: 1,
          explanation: 'Little\'s Law: Lead Time = WIP / Throughput. So 20 / 5 = 4 weeks. Reducing WIP directly reduces lead time when throughput is held constant.',
          explanationNL: 'Wet van Little: Doorlooptijd = WIP / Throughput. Dus 20 / 5 = 4 weken. Het verlagen van WIP verlaagt direct de doorlooptijd als de throughput constant blijft.',
        },
        {
          id: 'kanban-exam-q5',
          question: 'What does a Cumulative Flow Diagram (CFD) primarily show?',
          questionNL: 'Wat toont een Cumulatief Stroomdiagram (CFD) primair?',
          options: [
            'The velocity of each team member over time',
            'The number of items in each workflow state over time, revealing flow health',
            'The total budget spent per sprint',
            'The burndown of remaining story points'
          ],
          optionsNL: [
            'De snelheid van elk teamlid over tijd',
            'Het aantal items in elke workflowstatus over tijd, wat de flowgezondheid onthult',
            'Het totale budget besteed per sprint',
            'De burndown van resterende storypunten'
          ],
          correctAnswer: 1,
          explanation: 'A CFD plots the cumulative count of items in each workflow state (columns) over time. Widening bands indicate growing WIP or bottlenecks; parallel bands with constant width indicate smooth flow.',
          explanationNL: 'Een CFD toont het cumulatieve aantal items in elke workflowstatus (kolommen) over tijd. Verbredende banden wijzen op groeiend WIP of knelpunten; parallelle banden met constante breedte wijzen op soepele flow.',
        },
        {
          id: 'kanban-exam-q6',
          question: 'What is the difference between lead time and cycle time in a Kanban system?',
          questionNL: 'Wat is het verschil tussen doorlooptijd en cyclustijd in een Kanbansysteem?',
          options: [
            'Lead time is measured in sprints; cycle time is measured in hours',
            'Lead time starts when a request is made; cycle time starts when work actively begins',
            'Cycle time includes customer waiting time; lead time does not',
            'They are synonyms for the same metric'
          ],
          optionsNL: [
            'Doorlooptijd wordt gemeten in sprints; cyclustijd wordt gemeten in uren',
            'Doorlooptijd begint wanneer een verzoek wordt ingediend; cyclustijd begint wanneer het werk actief begint',
            'Cyclustijd omvat wachttijd van de klant; doorlooptijd niet',
            'Ze zijn synoniemen voor dezelfde metric'
          ],
          correctAnswer: 1,
          explanation: 'Lead time is the total elapsed time from when a customer request enters the system to when it is delivered. Cycle time only counts the active working period (from "work started" to "done"), excluding queuing time.',
          explanationNL: 'Doorlooptijd is de totale verstreken tijd vanaf het moment dat een klantverzoek het systeem binnengaat tot het wordt geleverd. Cyclustijd telt alleen de actieve werkperiode (van "werk gestart" tot "klaar"), exclusief wachttijd.',
        },
        {
          id: 'kanban-exam-q7',
          question: 'Which of the six Kanban core practices directly addresses the need to surface and communicate agreed rules of the system?',
          questionNL: 'Welke van de zes Kanban-kernpraktijken pakt direct de noodzaak aan om overeengekomen regels van het systeem zichtbaar te maken en te communiceren?',
          options: [
            'Limit WIP',
            'Manage Flow',
            'Make Policies Explicit',
            'Implement Feedback Loops'
          ],
          optionsNL: [
            'Beperk WIP',
            'Beheer Flow',
            'Maak Beleid Expliciet',
            'Implementeer Feedbacklussen'
          ],
          correctAnswer: 2,
          explanation: '"Make Policies Explicit" means that the rules governing how work moves through the system (entry criteria, exit criteria, WIP limits, escalation paths) are visible and understood by everyone — reducing ambiguity and enabling self-organisation.',
          explanationNL: '"Maak Beleid Expliciet" betekent dat de regels die bepalen hoe werk door het systeem beweegt (ingangs- en uitgangscriteria, WIP-limieten, escalatiepaden) zichtbaar en begrepen zijn door iedereen — waardoor ambiguïteit wordt verminderd en zelforganisatie mogelijk wordt.',
        },
        {
          id: 'kanban-exam-q8',
          question: 'In the Theory of Constraints applied to Kanban, what is the correct approach when a bottleneck stage is identified?',
          questionNL: 'Wat is de juiste aanpak wanneer een knelpuntstap wordt geïdentificeerd in de Theorie van Beperkingen toegepast op Kanban?',
          options: [
            'Remove the bottleneck step from the board entirely',
            'Exploit the constraint first, then subordinate all other steps to it, and only then elevate it',
            'Immediately hire more staff for the bottleneck step',
            'Raise the WIP limit at the bottleneck stage to allow more work through'
          ],
          optionsNL: [
            'Verwijder de knelpuntstap volledig van het bord',
            'Benut de beperking eerst, laat vervolgens alle andere stappen eraan ondergeschikt zijn, en verhoog hem dan pas',
            'Neem onmiddellijk meer personeel aan voor de knelpuntstap',
            'Verhoog de WIP-limiet bij de knelpuntstap om meer werk door te laten'
          ],
          correctAnswer: 1,
          explanation: 'The Theory of Constraints (Goldratt) prescribes: (1) Identify the constraint, (2) Exploit it — get maximum output from it as-is, (3) Subordinate everything else to the constraint\'s pace, (4) Elevate — invest to increase capacity only if needed. Raising the WIP limit at the bottleneck worsens flow.',
          explanationNL: 'De Theorie van Beperkingen (Goldratt) schrijft voor: (1) Identificeer de beperking, (2) Benut hem — haal maximale output uit de huidige situatie, (3) Maak alles ondergeschikt aan het tempo van de beperking, (4) Verhoog — investeer om capaciteit te vergroten alleen indien nodig. Het verhogen van de WIP-limiet bij het knelpunt verslechtert de flow.',
        },
        {
          id: 'kanban-exam-q9',
          question: 'A Kanban pull system means that:',
          questionNL: 'Een Kanban pull-systeem betekent dat:',
          options: [
            'The manager pushes new work items to team members based on capacity',
            'Work is pulled into the next stage only when there is available capacity there',
            'Customer requests are pulled from the backlog every two weeks',
            'The team pulls work from upstream teams during stand-ups'
          ],
          optionsNL: [
            'De manager nieuwe werkitems naar teamleden pusht op basis van capaciteit',
            'Werk alleen naar de volgende fase wordt getrokken wanneer daar beschikbare capaciteit is',
            'Klantverzoeken elke twee weken uit de backlog worden getrokken',
            'Het team werk van upstream-teams trekt tijdens stand-ups'
          ],
          correctAnswer: 1,
          explanation: 'In a pull system, a downstream stage signals its capacity by pulling a work item from the upstream queue. This is the opposite of a push system where work is assigned regardless of downstream capacity, and it is fundamental to controlling WIP and flow.',
          explanationNL: 'In een pull-systeem signaleert een stroomafwaartse fase zijn capaciteit door een werkitem uit de stroomopwaartse wachtrij te trekken. Dit is het tegenovergestelde van een push-systeem waarbij werk wordt toegewezen ongeacht de stroomafwaartse capaciteit, en het is fundamenteel voor het beheersen van WIP en flow.',
        },
        {
          id: 'kanban-exam-q10',
          question: 'Which Kanban feedback cadence focuses specifically on understanding and improving the flow of work items through the system?',
          questionNL: 'Welke Kanban-feedbackcadans richt zich specifiek op het begrijpen en verbeteren van de doorstroom van werkitems door het systeem?',
          options: [
            'Strategy Review',
            'Operations Review',
            'Flow Review (Kanban Meeting / Standup)',
            'Service Delivery Review'
          ],
          optionsNL: [
            'Strategiereview',
            'Operationele review',
            'Flowreview (Kanban-meeting / stand-up)',
            'Serviceleveringsreview'
          ],
          correctAnswer: 2,
          explanation: 'The daily Kanban Meeting (standup / flow review) focuses on the board: blocked items, flow impediments, and items at risk. It is the most frequent cadence and directly manages day-to-day flow. The Service Delivery Review and Operations Review operate at longer intervals for different audiences.',
          explanationNL: 'De dagelijkse Kanban-meeting (stand-up / flowreview) richt zich op het bord: geblokkeerde items, stroombelemmeringen en items die risico lopen. Het is de meest frequente cadans en beheert direct de dagelijkse flow. De Serviceleveringsreview en Operationele review werken op langere intervallen voor andere doelgroepen.',
        },
        {
          id: 'kanban-exam-q11',
          question: 'What is a "Class of Service" in the Kanban Method?',
          questionNL: 'Wat is een "Klasse van Service" in de Kanban Methode?',
          options: [
            'A tier of subscription pricing offered to Kanban tool users',
            'A policy that assigns different priority, SLAs, and workflow rules to different types of work items',
            'A certification level for Kanban practitioners',
            'The category of the team (IT, HR, Marketing) that uses the Kanban board'
          ],
          optionsNL: [
            'Een abonnementsprijsniveau aangeboden aan gebruikers van Kanban-tools',
            'Een beleid dat verschillende prioriteit, SLA\'s en workflowregels toekent aan verschillende typen werkitems',
            'Een certificeringsniveau voor Kanban-beoefenaars',
            'De categorie van het team (IT, HR, Marketing) dat het Kanbanbord gebruikt'
          ],
          correctAnswer: 1,
          explanation: 'Classes of Service (e.g. Expedite, Fixed Date, Standard, Intangible) define how different work types are handled — including their WIP slots, scheduling policies, and acceptable lead-time ranges. They make differentiated service delivery explicit on the board.',
          explanationNL: 'Klassen van Service (bijv. Expedite, Vaste Datum, Standaard, Immaterieel) definiëren hoe verschillende werktypen worden behandeld — inclusief hun WIP-slots, planningsbeleid en acceptabele doorlooptijdranges. Ze maken gedifferentieerde servicelevering expliciet op het bord.',
        },
        {
          id: 'kanban-exam-q12',
          question: 'How does Kanban fundamentally differ from Scrum regarding iterations?',
          questionNL: 'Hoe verschilt Kanban fundamenteel van Scrum wat betreft iteraties?',
          options: [
            'Kanban uses two-week iterations; Scrum uses one-week sprints',
            'Kanban has no fixed-length iterations; work flows continuously based on pull',
            'Kanban requires a sprint review at the end of each month',
            'Scrum has no time-boxes; Kanban does'
          ],
          optionsNL: [
            'Kanban gebruikt iteraties van twee weken; Scrum gebruikt sprints van één week',
            'Kanban heeft geen vaste iteraties; werk stroomt continu op basis van pull',
            'Kanban vereist een sprintreview aan het einde van elke maand',
            'Scrum heeft geen timeboxen; Kanban wel'
          ],
          correctAnswer: 1,
          explanation: 'Scrum is built around fixed-length Sprints (1–4 weeks) with defined ceremonies. Kanban does not prescribe iterations — work items flow through the system on a continuous pull basis, and releases can happen at any time.',
          explanationNL: 'Scrum is gebouwd rondom sprints van vaste lengte (1–4 weken) met gedefinieerde ceremonies. Kanban schrijft geen iteraties voor — werkitems stromen op continue pull-basis door het systeem, en releases kunnen op elk moment plaatsvinden.',
        },
        {
          id: 'kanban-exam-q13',
          question: 'Which of the following is NOT a prescribed role in the Kanban Method?',
          questionNL: 'Welke van de volgende is GEEN voorgeschreven rol in de Kanban Methode?',
          options: [
            'Service Request Manager',
            'Service Delivery Manager',
            'Kanban Master',
            'Flow Manager'
          ],
          optionsNL: [
            'Service Request Manager',
            'Service Delivery Manager',
            'Kanban Master',
            'Flow Manager'
          ],
          correctAnswer: 2,
          explanation: 'The Kanban Method defines two optional roles: Service Request Manager (manages the upstream, customer-facing side) and Service Delivery Manager (manages flow through the system). "Kanban Master" is not a role in the Kanban Method — it is sometimes used informally or confused with Scrum Master.',
          explanationNL: 'De Kanban Methode definieert twee optionele rollen: Service Request Manager (beheert de stroomopwaartse, klantgerichte kant) en Service Delivery Manager (beheert de flow door het systeem). "Kanban Master" is geen rol in de Kanban Methode — het wordt soms informeel gebruikt of verward met Scrum Master.',
        },
        {
          id: 'kanban-exam-q14',
          question: 'What does "flow efficiency" measure in a Kanban system?',
          questionNL: 'Wat meet "flowefficiëntie" in een Kanbansysteem?',
          options: [
            'The percentage of work items delivered on time',
            'The ratio of active work time to total lead time (active + waiting)',
            'The number of items completed per week divided by team size',
            'The throughput of the bottleneck stage divided by total throughput'
          ],
          optionsNL: [
            'Het percentage werkitems dat op tijd is geleverd',
            'De verhouding van actieve werktijd tot totale doorlooptijd (actief + wachten)',
            'Het aantal items voltooid per week gedeeld door teamgrootte',
            'De throughput van de knelpuntstap gedeeld door de totale throughput'
          ],
          correctAnswer: 1,
          explanation: 'Flow efficiency = (active time / total lead time) × 100%. Most knowledge-work systems have flow efficiency of 5–15%, meaning 85–95% of lead time is waiting time. Improving flow efficiency means reducing handoff waits, queues, and blocked time.',
          explanationNL: 'Flowefficiëntie = (actieve tijd / totale doorlooptijd) × 100%. De meeste kenniswerksystemen hebben een flowefficiëntie van 5–15%, wat betekent dat 85–95% van de doorlooptijd wachttijd is. Flowefficiëntie verbeteren betekent handoff-wachttijden, wachtrijen en geblokkeerde tijd verminderen.',
        },
        {
          id: 'kanban-exam-q15',
          question: 'A team notices that work items consistently pile up in the "Code Review" column. According to Kanban thinking, what is the FIRST action?',
          questionNL: 'Een team merkt dat werkitems consistent ophopen in de kolom "Code Review". Wat is de EERSTE actie volgens Kanban-denken?',
          options: [
            'Delete the Code Review column and merge it with Development',
            'Raise the WIP limit for Code Review to allow more items',
            'Recognise Code Review as the current bottleneck and swarm resources to it',
            'Escalate to management to hire additional reviewers immediately'
          ],
          optionsNL: [
            'Verwijder de Code Review-kolom en voeg deze samen met Ontwikkeling',
            'Verhoog de WIP-limiet voor Code Review om meer items toe te staan',
            'Herken Code Review als het huidige knelpunt en concentreer resources erop',
            'Escaleer naar management om onmiddellijk extra reviewers aan te nemen'
          ],
          correctAnswer: 2,
          explanation: 'Per Theory of Constraints, the first step is to exploit the constraint — focus existing capacity on the bottleneck (swarming, pairing, reducing batch size of reviews). Raising the WIP limit at a bottleneck makes flow worse, not better.',
          explanationNL: 'Volgens de Theorie van Beperkingen is de eerste stap het benutten van de beperking — bestaande capaciteit concentreren op het knelpunt (swarmen, pairen, batchgrootte van reviews verkleinen). Het verhogen van de WIP-limiet bij een knelpunt maakt de flow slechter, niet beter.',
        },
        {
          id: 'kanban-exam-q16',
          question: 'Which Kanban practice states that the team should use empirical data and experiments to guide process improvements rather than prescribing a fixed method upfront?',
          questionNL: 'Welke Kanban-praktijk stelt dat het team empirische gegevens en experimenten moet gebruiken om procesverbeteringen te sturen in plaats van vooraf een vaste methode voor te schrijven?',
          options: [
            'Visualize the Workflow',
            'Limit WIP',
            'Implement Feedback Loops',
            'Improve Collaboratively, Evolve Experimentally (using models and the scientific method)'
          ],
          optionsNL: [
            'Visualiseer de Workflow',
            'Beperk WIP',
            'Implementeer Feedbacklussen',
            'Verbeter Samenwerkend, Evolueer Experimenteel (met modellen en de wetenschappelijke methode)'
          ],
          correctAnswer: 3,
          explanation: '"Improve Collaboratively, Evolve Experimentally" (the sixth Kanban practice) explicitly calls for using models (e.g., Theory of Constraints, Lean, Systems Thinking) and a scientific, hypothesis-driven approach to change — rather than copying a prescribed framework.',
          explanationNL: '"Verbeter Samenwerkend, Evolueer Experimenteel" (de zesde Kanban-praktijk) roept expliciet op tot het gebruik van modellen (bijv. Theorie van Beperkingen, Lean, Systeemdenken) en een wetenschappelijke, hypothese-gestuurde aanpak voor verandering — in plaats van een voorgeschreven raamwerk te kopiëren.',
        },
        {
          id: 'kanban-exam-q17',
          question: 'What is the "Replenishment Meeting" cadence used for in a Kanban system?',
          questionNL: 'Waarvoor wordt de "Aanvullingsmeeting"-cadans gebruikt in een Kanbansysteem?',
          options: [
            'To review completed work with stakeholders and gather feedback',
            'To pull new work items from the options pool into the commitment point based on capacity',
            'To assign story points to unestimated backlog items',
            'To present the quarterly roadmap to senior management'
          ],
          optionsNL: [
            'Om voltooid werk met belanghebbenden te reviewen en feedback te verzamelen',
            'Om nieuwe werkitems vanuit de optiepoel naar het toezeggingspunt te trekken op basis van capaciteit',
            'Om storypunten toe te wijzen aan niet-geschatte backlog-items',
            'Om de kwartaalroadmap te presenteren aan senior management'
          ],
          correctAnswer: 1,
          explanation: 'The Replenishment Meeting is a regular cadence (often weekly) at which the team reviews the options pool (upstream queue) and pulls the highest-priority items into the active workflow up to available WIP capacity — making it the Kanban equivalent of Sprint Planning.',
          explanationNL: 'De Aanvullingsmeeting is een reguliere cadans (vaak wekelijks) waarbij het team de optiepoel (stroomopwaartse wachtrij) beoordeelt en de hoogstgeprioriteerde items trekt naar de actieve workflow tot aan de beschikbare WIP-capaciteit — wat het maakt tot het Kanban-equivalent van Sprint Planning.',
        },
        {
          id: 'kanban-exam-q18',
          question: 'On a Kanban board, what is the difference between a "buffer" column and a "queue" column?',
          questionNL: 'Wat is het verschil tussen een "buffer"-kolom en een "wachtrij"-kolom op een Kanbanbord?',
          options: [
            'Buffer columns count toward WIP limits; queue columns do not',
            'Queue columns are placed before active stages and are decoupled from WIP limits; buffer columns absorb variability between stages',
            'They are identical concepts used interchangeably in the Kanban literature',
            'Buffer columns are only used in manufacturing Kanban, not knowledge-work Kanban'
          ],
          optionsNL: [
            'Bufferkolommen tellen mee voor WIP-limieten; wachtrij-kolommen niet',
            'Wachtrij-kolommen staan vóór actieve fasen en zijn losgekoppeld van WIP-limieten; bufferkolommen absorberen variabiliteit tussen fasen',
            'Het zijn identieke concepten die door elkaar worden gebruikt in de Kanban-literatuur',
            'Bufferkolommen worden alleen gebruikt in productie-Kanban, niet in kenniswerk-Kanban'
          ],
          correctAnswer: 1,
          explanation: 'In Kanban board design, queue (waiting) columns hold items not yet actively worked — they decouple stages and absorb variability. Buffer columns (sometimes called "Done" sub-columns) sit between two active stages. Critically, queue/buffer columns are often excluded from WIP limits so they act as shock absorbers without artificially blocking flow.',
          explanationNL: 'In Kanbanbordontwerp bevatten wachtrij-kolommen items die nog niet actief worden bewerkt — ze ontkoppelen fasen en absorberen variabiliteit. Bufferkolommen (soms "Klaar"-subkolommen) bevinden zich tussen twee actieve fasen. Cruciaal is dat wachtrij-/bufferkolommen vaak worden uitgesloten van WIP-limieten zodat ze als schokdempers werken zonder de flow kunstmatig te blokkeren.',
        },
        {
          id: 'kanban-exam-q19',
          question: 'A Service Level Expectation (SLE) in Kanban is BEST described as:',
          questionNL: 'Een Service Level Expectation (SLE) in Kanban wordt het BESTE omschreven als:',
          options: [
            'A legally binding contract between the team and its customers',
            'A forecast of how long a work item of a given class of service is likely to take, expressed as a probability statement',
            'The maximum number of items the team commits to deliver per sprint',
            'A target throughput rate defined by senior management'
          ],
          optionsNL: [
            'Een juridisch bindend contract tussen het team en zijn klanten',
            'Een voorspelling van hoe lang een werkitem van een bepaalde klasse van service waarschijnlijk duurt, uitgedrukt als een kansverklaring',
            'Het maximale aantal items dat het team per sprint toezegt te leveren',
            'Een doelthroughputsnelheid gedefinieerd door senior management'
          ],
          correctAnswer: 1,
          explanation: 'An SLE is a probabilistic statement — e.g. "85% of Standard items will be completed within 10 days" — derived from historical lead time data. It is not a contractual guarantee but a transparency tool that sets realistic expectations and triggers escalation when breached.',
          explanationNL: 'Een SLE is een probabilistische uitspraak — bijv. "85% van de Standaard-items wordt binnen 10 dagen voltooid" — afgeleid van historische doorlooptijdgegevens. Het is geen contractuele garantie maar een transparantietool die realistische verwachtingen stelt en escalatie triggert wanneer geschonden.',
        },
        {
          id: 'kanban-exam-q20',
          question: 'Which of the following correctly describes a "Kanban system" vs a "Kanban board"?',
          questionNL: 'Welke van de volgende beschrijft correct een "Kanbansysteem" versus een "Kanbanbord"?',
          options: [
            'They are the same thing; "Kanban system" is just a more formal term',
            'A Kanban board is one visual tool; a Kanban system encompasses the full set of policies, WIP limits, cadences, and roles that govern flow',
            'A Kanban system is a digital tool; a Kanban board is always physical',
            'A Kanban board is used in software teams; a Kanban system is used in manufacturing'
          ],
          optionsNL: [
            'Het zijn hetzelfde; "Kanbansysteem" is gewoon een meer formele term',
            'Een Kanbanbord is één visueel hulpmiddel; een Kanbansysteem omvat de volledige set beleidsregels, WIP-limieten, cadansen en rollen die de flow besturen',
            'Een Kanbansysteem is een digitaal hulpmiddel; een Kanbanbord is altijd fysiek',
            'Een Kanbanbord wordt gebruikt in softwareteams; een Kanbansysteem wordt gebruikt in de productie'
          ],
          correctAnswer: 1,
          explanation: 'A Kanban board is the primary visualisation artefact. A Kanban system is the broader sociotechnical system including the board, WIP limits, policies, feedback cadences, and the social agreements around them. You can have a board without a functioning Kanban system if the supporting elements are absent.',
          explanationNL: 'Een Kanbanbord is het primaire visualisatieartefact. Een Kanbansysteem is het bredere sociotechnische systeem inclusief het bord, WIP-limieten, beleidsregels, feedbackcadansen en de sociale afspraken eromheen. Je kunt een bord hebben zonder een functionerend Kanbansysteem als de ondersteunende elementen ontbreken.',
        },
        {
          id: 'kanban-exam-q21',
          question: 'What does the "Visualize" practice in Kanban require beyond simply drawing columns on a board?',
          questionNL: 'Wat vereist de "Visualiseer"-praktijk in Kanban naast het simpelweg tekenen van kolommen op een bord?',
          options: [
            'Using only digital tools so the board is accessible remotely',
            'Making work, workflow, business rules, blockers, and work item types visible so the system is understood by all',
            'Assigning a unique colour to every team member\'s tasks',
            'Displaying velocity charts next to the board at all times'
          ],
          optionsNL: [
            'Alleen digitale tools gebruiken zodat het bord op afstand toegankelijk is',
            'Werk, workflow, bedrijfsregels, blokkades en werkitemtypen zichtbaar maken zodat het systeem door iedereen wordt begrepen',
            'Een unieke kleur toewijzen aan de taken van elk teamlid',
            'Snelheidsgrafieken altijd naast het bord weergeven'
          ],
          correctAnswer: 1,
          explanation: 'Visualisation in Kanban means exposing not just the work items but the rules and policies of the system — WIP limits, blocked items, classes of service, aging work, and workflow definitions — so that the true state of the system is transparent and actionable for the whole team.',
          explanationNL: 'Visualisatie in Kanban betekent niet alleen werkitems blootleggen maar ook de regels en beleidsregels van het systeem — WIP-limieten, geblokkeerde items, klassen van service, verouderd werk en workflowdefinities — zodat de werkelijke toestand van het systeem transparant en bruikbaar is voor het hele team.',
        },
        {
          id: 'kanban-exam-q22',
          question: 'According to Little\'s Law, which of the following actions will MOST directly reduce average lead time, assuming throughput remains constant?',
          questionNL: 'Welke van de volgende acties zal de gemiddelde doorlooptijd het MEEST direct verminderen, ervan uitgaande dat de throughput constant blijft?',
          options: [
            'Adding more team members to increase capacity',
            'Reducing the amount of work in process (WIP)',
            'Holding a daily standup meeting',
            'Switching from a physical board to a digital tool'
          ],
          optionsNL: [
            'Meer teamleden toevoegen om capaciteit te vergroten',
            'De hoeveelheid werk in uitvoering (WIP) verminderen',
            'Een dagelijkse stand-up meeting houden',
            'Overstappen van een fysiek bord naar een digitale tool'
          ],
          correctAnswer: 1,
          explanation: 'Little\'s Law states Lead Time = WIP / Throughput. With throughput constant, lowering WIP directly and proportionally lowers lead time. This is the mathematical foundation for why WIP limits are the single most powerful lever in a Kanban system.',
          explanationNL: 'De wet van Little stelt: Doorlooptijd = WIP / Throughput. Met constante throughput verlaagt het verlagen van WIP direct en evenredig de doorlooptijd. Dit is de wiskundige basis voor waarom WIP-limieten de krachtigste hefboom in een Kanbansysteem zijn.',
        },
      ],
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