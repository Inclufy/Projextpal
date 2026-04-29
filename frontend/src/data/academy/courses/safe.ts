// ============================================
// COURSE: SAFe & SCALING AGILE
// ============================================
// Complete course structure with key lessons fully developed
// ============================================

import { Rocket } from 'lucide-react';
import { Course, Module } from '../types';
import { BRAND } from '../brand';
import { instructors } from '../instructors';

// Module definitions
const module1: Module = {
  id: 'safe-m1',
  title: 'SAFe Overview',
  titleNL: 'SAFe Overzicht',
  order: 0,
  icon: 'Eye',
  color: '#EC4899',
  gradient: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
  lessons: [
    {
      id: 'safe-l1',
      title: 'Why Scale Agile?',
      titleNL: 'Waarom Agile Schalen?',
      type: 'video',
      duration: '10:00',
      free: true,
      videoUrl: '',
      transcript: `Agile works great for small teams. But what happens when you have 50, 100, or 1000 people working together? That's where scaling frameworks like SAFe come in.

**The Challenge**

Agile was designed for small, co-located teams (5-9 people). But modern enterprises need to coordinate:
- Multiple teams
- Distributed locations
- Shared resources
- Dependencies
- Strategic alignment

**The Scaling Problem**

As organizations grow, they face:
- **Coordination**: How do teams stay aligned?
- **Dependencies**: How do we manage inter-team dependencies?
- **Prioritization**: Who decides what to build?
- **Architecture**: How do we keep systems coherent?
- **Governance**: How do we maintain control?

**Typical Symptoms**

Organizations struggle with:
- Teams working in silos
- Duplicated effort
- Integration nightmares
- Slow delivery
- Misalignment with business goals
- Resource conflicts

**What is SAFe?**

Scaled Agile Framework (SAFe) is a set of organizational and workflow patterns for implementing agile practices at enterprise scale.

Created by Dean Leffingwell, now used by thousands of organizations worldwide.

**Core Values**

SAFe is built on four core values:

**1. Alignment**
Everyone works toward shared objectives

**2. Built-In Quality**
Quality is not negotiable

**3. Transparency**
Trust requires visibility

**4. Program Execution**
Working software is the measure

**The SAFe House**

SAFe is visualized as a house with:
- **Roof**: Value (the goal)
- **Pillars**: Team and Technical Agility, Agile Product Delivery, Enterprise Solution Delivery, Lean Portfolio Management
- **Foundation**: Leadership and Lean-Agile Culture

**Benefits of SAFe**

Organizations report:
- 20-50% increase in productivity
- 25-75% faster time to market
- 30-75% increase in quality
- 10-50% improvement in employee engagement

**Why Teams Need SAFe**

- Maintain agility at scale
- Align with business strategy
- Improve predictability
- Coordinate dependencies
- Share learning across teams
- Reduce waste

**Real World Example**

Imagine: Your company has 20 Scrum teams building a complex product. Without SAFe:
- Each team has different practices
- No shared vision
- Integration happens late
- Dependencies discovered too late
- Business can't plan releases

With SAFe:
- Teams synchronized every 10 weeks (PI Planning)
- Shared roadmap and objectives
- Dependencies identified upfront
- Regular integration
- Predictable delivery

**Who Uses SAFe?**

From startups to Fortune 500:
- Software companies
- Financial services
- Healthcare
- Government
- Manufacturing
- Retail

**SAFe vs Other Frameworks**

**SAFe vs Scrum@Scale**
SAFe: Prescriptive, detailed guidance
Scrum@Scale: Lightweight, flexible

**SAFe vs LeSS**
SAFe: Full enterprise solution
LeSS: Simpler, fewer roles

**SAFe vs Spotify Model**
SAFe: Structured approach
Spotify: Organic evolution

**Is SAFe Right for You?**

Consider SAFe when:
- Multiple teams (50+ people)
- Complex products/systems
- Need for coordination
- Regulatory requirements
- Distributed teams
- Enterprise scale

Not needed for:
- Single teams
- Simple products
- Startups (usually)

**Common Misconceptions**

"SAFe is too prescriptive"
→ It provides guidance, adapt to your context

"SAFe isn't really Agile"
→ It scales Agile principles, not every practice

"SAFe is only for software"
→ Used across industries

**The Journey**

Implementing SAFe is a journey:
1. **Train leaders** in Lean-Agile thinking
2. **Launch** first Agile Release Train
3. **Scale** to additional ARTs
4. **Extend** to portfolio
5. **Sustain** and improve

**Summary**

Scaling Agile is necessary for large organizations to:
- Maintain agility
- Coordinate at scale
- Deliver value predictably

SAFe provides a proven framework for this challenge.`,
      transcriptNL: `Agile werkt geweldig voor kleine teams. Maar wat gebeurt er als je 50, 100 of 1000 mensen hebt die samenwerken? Daar komen scaling frameworks zoals SAFe om de hoek.

**De Uitdaging**

Agile was ontworpen voor kleine, co-located teams (5-9 mensen). Maar moderne enterprises moeten coördineren:
- Meerdere teams
- Verspreide locaties
- Gedeelde resources
- Afhankelijkheden
- Strategische afstemming

**Het Schaalprobleem**

Naarmate organisaties groeien, worden ze geconfronteerd met:
- **Coördinatie**: Hoe blijven teams afgestemd?
- **Afhankelijkheden**: Hoe managen we inter-team afhankelijkheden?
- **Prioritering**: Wie beslist wat te bouwen?
- **Architectuur**: Hoe houden we systemen coherent?
- **Governance**: Hoe behouden we controle?

**Typische Symptomen**

Organisaties worstelen met:
- Teams werken in silo's
- Gedupliceerde inspanning
- Integratie nachtmerries
- Langzame oplevering
- Misalignment met bedrijfsdoelen
- Resource conflicten

**Wat is SAFe?**

Scaled Agile Framework (SAFe) is een set van organisatie- en workflowpatronen voor het implementeren van agile praktijken op enterprise schaal.

Gemaakt door Dean Leffingwell, nu gebruikt door duizenden organisaties wereldwijd.

**Kernwaarden**

SAFe is gebouwd op vier kernwaarden:

**1. Alignment (Afstemming)**
Iedereen werkt naar gedeelde doelstellingen

**2. Built-In Quality (Ingebouwde Kwaliteit)**
Kwaliteit is niet onderhandelbaar

**3. Transparency (Transparantie)**
Vertrouwen vereist zichtbaarheid

**4. Program Execution (Programma Uitvoering)**
Werkende software is de maatstaf

**Het SAFe Huis**

SAFe wordt gevisualiseerd als een huis met:
- **Dak**: Value (het doel)
- **Pilaren**: Team en Technical Agility, Agile Product Delivery, Enterprise Solution Delivery, Lean Portfolio Management
- **Fundament**: Leadership en Lean-Agile Culture

**Benefits van SAFe**

Organisaties rapporteren:
- 20-50% toename in productiviteit
- 25-75% snellere time to market
- 30-75% toename in kwaliteit
- 10-50% verbetering in medewerkersbetrokkenheid

**Waarom Teams SAFe Nodig Hebben**

- Agility behouden op schaal
- Afstemmen met bedrijfsstrategie
- Voorspelbaarheid verbeteren
- Afhankelijkheden coördineren
- Leren delen over teams
- Waste verminderen

**Real World Voorbeeld**

Stel je voor: Je bedrijf heeft 20 Scrum teams die een complex product bouwen. Zonder SAFe:
- Elk team heeft verschillende praktijken
- Geen gedeelde visie
- Integratie gebeurt laat
- Afhankelijkheden ontdekt te laat
- Business kan releases niet plannen

Met SAFe:
- Teams gesynchroniseerd elke 10 weken (PI Planning)
- Gedeelde roadmap en doelstellingen
- Afhankelijkheden vooraf geïdentificeerd
- Regelmatige integratie
- Voorspelbare oplevering

**Wie Gebruikt SAFe?**

Van startups tot Fortune 500:
- Software bedrijven
- Financiële diensten
- Gezondheidszorg
- Overheid
- Productie
- Retail

**SAFe vs Andere Frameworks**

**SAFe vs Scrum@Scale**
SAFe: Voorschrijvend, gedetailleerde guidance
Scrum@Scale: Lightweight, flexibel

**SAFe vs LeSS**
SAFe: Volledige enterprise oplossing
LeSS: Simpeler, minder rollen

**SAFe vs Spotify Model**
SAFe: Gestructureerde aanpak
Spotify: Organische evolutie

**Is SAFe Goed Voor Jou?**

Overweeg SAFe wanneer:
- Meerdere teams (50+ mensen)
- Complexe producten/systemen
- Behoefte aan coördinatie
- Regelgevende vereisten
- Verspreide teams
- Enterprise schaal

Niet nodig voor:
- Enkele teams
- Simpele producten
- Startups (meestal)

**Veelvoorkomende Misvattingen**

"SAFe is te voorschrijvend"
→ Het biedt guidance, pas aan aan je context

"SAFe is niet echt Agile"
→ Het schaalt Agile principes, niet elke praktijk

"SAFe is alleen voor software"
→ Gebruikt over industrieën heen

**De Reis**

SAFe implementeren is een reis:
1. **Train leiders** in Lean-Agile denken
2. **Launch** eerste Agile Release Train
3. **Schaal** naar extra ARTs
4. **Breid uit** naar portfolio
5. **Sustain** en verbeter

**Samenvatting**

Agile schalen is noodzakelijk voor grote organisaties om:
- Agility te behouden
- Op schaal te coördineren
- Voorspelbaar waarde te leveren

SAFe biedt een bewezen framework voor deze uitdaging.`,
      keyTakeaways: [
        'SAFe scales Agile practices for 50+ people working on complex products',
        'Four core values: Alignment, Built-In Quality, Transparency, Program Execution',
        'Organizations report 20-50% productivity gains with SAFe',
        'Use SAFe when you need to coordinate multiple teams on shared objectives',
      ],
      keyTakeawaysEN: [
        'SAFe scales Agile practices for 50+ people working on complex products',
        'Four core values: Alignment, Built-In Quality, Transparency, Program Execution',
        'Organizations report 20-50% productivity gains with SAFe',
        'Use SAFe when you need to coordinate multiple teams on shared objectives',
      ],
      keyTakeawaysNL: [
        'SAFe schaalt Agile praktijken voor 50+ mensen die aan complexe producten werken',
        'Vier kernwaarden: Alignment, Built-In Quality, Transparency, Program Execution',
        'Organisaties rapporteren 20-50% productiviteitswinst met SAFe',
        'Gebruik SAFe wanneer je meerdere teams moet coördineren op gedeelde doelstellingen',
      ],
      resources: [
        {
          name: 'SAFe Overview Poster',
          nameNL: 'SAFe Overzicht Poster',
          type: 'PDF',
          size: '3.2 MB',
          description: 'Visual overview of the SAFe framework',
          descriptionNL: 'Visueel overzicht van het SAFe framework',
        },
      ],
    },
    // Remaining lessons
    {
      id: 'safe-l2',
      title: 'SAFe Framework Overview',
      titleNL: 'SAFe Framework Overzicht',
      type: 'video',
      duration: '16:00',
      free: true,
      videoUrl: '',
      transcript: `SAFe Framework Overview — what does the framework actually look like, en waarom is de opbouw zo gekozen?

**Het SAFe Big Picture**

SAFe wordt visueel weergegeven als het zogenoemde "Big Picture" — een gelaagd diagram dat laat zien hoe strategie doorvertaald wordt naar dagelijks teamwerk. Het Big Picture kent vier niveaus: Team, Program, Large Solution en Portfolio. Niet iedere organisatie gebruikt alle vier niveaus; welk subset je kiest hangt af van de omvang en complexiteit van je situatie.

**Team-niveau**

Op het laagste niveau werken Agile teams van 5 tot 11 mensen. Elk team volgt een iteratiecyclus van twee weken en levert werkende software op. Teams kunnen Scrum of Kanban hanteren, mits ze binnen de SAFe-cadans blijven. Het team heeft een Product Owner (PO) en een Scrum Master (SM).

**Program-niveau — de kern van SAFe**

Het Program-niveau is waar de meeste organisaties het meest van SAFe ervaren. Hier leven de Agile Release Train (ART) en het Program Increment (PI). De ART bundelt 5 tot 12 teams (50–125 mensen) die samen werken aan een gedeelde waardestroom. Ze plannen gezamenlijk tijdens PI Planning, leveren samen en leren samen via System Demo en Inspect & Adapt.

**Large Solution-niveau**

Wanneer één ART niet groot genoeg is om de oplossing te bouwen — denk aan defensiesystemen of industriële besturingssoftware — voeg je het Large Solution-niveau toe. Hier coördineert een Solution Train meerdere ARTs en externe leveranciers via de Solution Train Engineer (STE).

**Portfolio-niveau**

Het hoogste niveau verbindt bedrijfsstrategie met uitvoering. Lean Portfolio Management (LPM) stelt strategische thema\'s vast, beheert de Epic Backlog en verdeelt budgetten via Lean Budget Guardrails.

**Het SAFe House of Lean**

Onder het Big Picture ligt het House of Lean als filosofisch fundament. Het doel — Value voor de klant — staat bovenaan als dakstructuur. De vier pilaren zijn: Team en Technical Agility, Agile Product Delivery, Enterprise Solution Delivery en Lean Portfolio Management. Het fundament is Lean-Agile Leiderschap: zonder leiders die het goede voorbeeld geven, bezwijken alle pilaren.

**Praktijkvoorbeeld**

Een Nederlandse bank heeft drie ARTs: één voor mobiel bankieren, één voor hypotheekverwerking en één voor intern risicobeheer. De drie ARTs opereren elk op Program-niveau. Het Portfolio-niveau bewaakt de strategische thema\'s en verdeelt het IT-budget over de drie waardestromen. De bank gebruikt géén Large Solution-niveau, omdat de ARTs voldoende onafhankelijk zijn.

**Key Takeaways**
- SAFe kent vier niveaus: Team, Program, Large Solution en Portfolio — gebruik alleen wat je nodig hebt.
- Het Program-niveau met de ART is de kern; hier vindt de meeste waardecreatie plaats.
- Het House of Lean benadrukt dat Lean-Agile Leiderschap het fundament is van een succesvolle SAFe-implementatie.
- De configuratiekeuze (Essential, Large Solution, Portfolio of Full) bepaalt welke niveaus actief zijn.`,
      transcriptNL: `SAFe Framework Overzicht — hoe ziet het framework er daadwerkelijk uit, en waarom is de opbouw zo gekozen?

**Het SAFe Big Picture**

SAFe wordt visueel weergegeven als het zogenoemde "Big Picture" — een gelaagd diagram dat laat zien hoe strategie doorvertaald wordt naar dagelijks teamwerk. Het Big Picture kent vier niveaus: Team, Program, Large Solution en Portfolio. Niet iedere organisatie gebruikt alle vier niveaus; welk subset je kiest hangt af van de omvang en complexiteit van je situatie.

**Team-niveau**

Op het laagste niveau werken Agile teams van 5 tot 11 mensen. Elk team volgt een iteratiecyclus van twee weken en levert werkende software op. Teams kunnen Scrum of Kanban hanteren, mits ze binnen de SAFe-cadans blijven. Het team heeft een Product Owner (PO) en een Scrum Master (SM).

**Program-niveau — de kern van SAFe**

Het Program-niveau is waar de meeste organisaties het meest van SAFe ervaren. Hier leven de Agile Release Train (ART) en het Program Increment (PI). De ART bundelt 5 tot 12 teams (50–125 mensen) die samen werken aan een gedeelde waardestroom. Ze plannen gezamenlijk tijdens PI Planning, leveren samen en leren samen via System Demo en Inspect & Adapt.

**Large Solution-niveau**

Wanneer één ART niet groot genoeg is om de oplossing te bouwen — denk aan defensiesystemen of industriële besturingssoftware — voeg je het Large Solution-niveau toe. Hier coördineert een Solution Train meerdere ARTs en externe leveranciers via de Solution Train Engineer (STE).

**Portfolio-niveau**

Het hoogste niveau verbindt bedrijfsstrategie met uitvoering. Lean Portfolio Management (LPM) stelt strategische thema\'s vast, beheert de Epic Backlog en verdeelt budgetten via Lean Budget Guardrails.

**Het SAFe House of Lean**

Onder het Big Picture ligt het House of Lean als filosofisch fundament. Het doel — Value voor de klant — staat bovenaan als dakstructuur. De vier pilaren zijn: Team en Technical Agility, Agile Product Delivery, Enterprise Solution Delivery en Lean Portfolio Management. Het fundament is Lean-Agile Leiderschap: zonder leiders die het goede voorbeeld geven, bezwijken alle pilaren.

**Praktijkvoorbeeld**

Een Nederlandse bank heeft drie ARTs: één voor mobiel bankieren, één voor hypotheekverwerking en één voor intern risicobeheer. De drie ARTs opereren elk op Program-niveau. Het Portfolio-niveau bewaakt de strategische thema\'s en verdeelt het IT-budget over de drie waardestromen. De bank gebruikt géén Large Solution-niveau, omdat de ARTs voldoende onafhankelijk zijn.

**Key Takeaways**
- SAFe kent vier niveaus: Team, Program, Large Solution en Portfolio — gebruik alleen wat je nodig hebt.
- Het Program-niveau met de ART is de kern; hier vindt de meeste waardecreatie plaats.
- Het House of Lean benadrukt dat Lean-Agile Leiderschap het fundament is van een succesvolle SAFe-implementatie.
- De configuratiekeuze (Essential, Large Solution, Portfolio of Full) bepaalt welke niveaus actief zijn.`,
      keyTakeaways: [
        'SAFe kent vier niveaus: Team, Program, Large Solution en Portfolio — gebruik alleen wat je nodig hebt.',
        'Het Program-niveau met de ART is de kern van SAFe; hier vindt de meeste waardecreatie plaats.',
        'Het House of Lean benadrukt Lean-Agile Leiderschap als onmisbaar fundament.',
        'De configuratiekeuze bepaalt welke niveaus actief zijn in jouw organisatie.',
      ],
      keyTakeawaysEN: [
        'SAFe has four levels: Team, Program, Large Solution and Portfolio — activate only what you need.',
        'The Program level with the ART is the core of SAFe; most value creation happens here.',
        'The House of Lean emphasises Lean-Agile Leadership as the indispensable foundation.',
        'Your configuration choice determines which levels are active in your organisation.',
      ],
      keyTakeawaysNL: [
        'SAFe kent vier niveaus: Team, Program, Large Solution en Portfolio — gebruik alleen wat je nodig hebt.',
        'Het Program-niveau met de ART is de kern van SAFe; hier vindt de meeste waardecreatie plaats.',
        'Het House of Lean benadrukt Lean-Agile Leiderschap als onmisbaar fundament.',
        'De configuratiekeuze bepaalt welke niveaus actief zijn in jouw organisatie.',
      ],
      resources: [],
    },
    {
      id: 'safe-l3',
      title: 'SAFe Configurations',
      titleNL: 'SAFe Configuraties',
      type: 'video',
      duration: '14:00',
      videoUrl: '',
      transcript: `SAFe Configuraties — één framework, vier smaken. Welke past bij jouw organisatie?

**Waarom configuraties?**

Niet elke organisatie is even groot of even complex. Een scale-up met drie Agile teams heeft andere behoeften dan een multinational met twintig ARTs en externe leveranciers. SAFe lost dit op door vier officiële configuraties aan te bieden, elk voortbouwend op de vorige.

**Essential SAFe**

Essential SAFe is de instapvariant en de kleinste configuratie die nog steeds de volledige waarde van SAFe levert. Het bevat twee niveaus: Team en Program. Teams werken in iteraties van twee weken; de ART synchroniseert op PI-cadans (8–12 weken). Essential SAFe is het aanbevolen startpunt voor organisaties die voor het eerst met SAFe beginnen.

**Large Solution SAFe**

Wanneer een product zo complex is dat meerdere ARTs moeten samenwerken, voeg je het Large Solution-niveau toe. Een Solution Train coördineert twee of meer ARTs plus externe leveranciers. Typische voorbeelden zijn luchtvaartelectronica, medische apparatuur of defensiesystemen. De Solution Train Engineer (STE) speelt hier dezelfde rol als de RTE op ART-niveau.

**Portfolio SAFe**

Portfolio SAFe voegt het Portfolio-niveau toe aan Essential SAFe. Het gaat over strategie en financiering: welke initiatieven (Epics) krijgen groen licht, en hoeveel budget krijgt elke Value Stream? Lean Budget Guardrails en het Portfolio Kanban zijn de centrale gereedschappen.

**Full SAFe**

Full SAFe combineert alle vier niveaus: Team, Program, Large Solution en Portfolio. Deze configuratie is bedoeld voor de grootste en meest complexe organisaties — denk aan grote financiële instellingen of overheidsorganisaties die tegelijk meerdere zeer complexe producten bouwen.

**Hoe kies je?**

De keuze hangt af van drie vragen:
1. Hoeveel teams moeten samenwerken aan één product? → Essential of Large Solution
2. Moet je portfoliofinanciering en -strategie structureren? → voeg Portfolio toe
3. Heb je zowel zeer complexe producten als portfoliobeheer nodig? → Full SAFe

**Praktijkvoorbeeld**

Een telecombedrijf begint met Essential SAFe voor het team dat hun klantportaal bouwt (één ART, 8 teams). Na twee jaar voegen ze Portfolio SAFe toe om hun vijf ARTs strategisch te sturen. Het Large Solution-niveau blijft buiten scope omdat de ARTs onafhankelijk genoeg zijn.

**Key Takeaways**
- SAFe heeft vier configuraties: Essential, Large Solution, Portfolio en Full SAFe.
- Essential SAFe is het aanbevolen startpunt — Team- en Program-niveau zijn voldoende voor de meeste organisaties.
- Large Solution voegt coördinatie toe voor meerdere ARTs bij zeer complexe producten.
- Full SAFe omvat alle vier niveaus en is bedoeld voor de grootste en meest complexe enterprises.`,
      transcriptNL: `SAFe Configuraties — één framework, vier smaken. Welke past bij jouw organisatie?

**Waarom configuraties?**

Niet elke organisatie is even groot of even complex. Een scale-up met drie Agile teams heeft andere behoeften dan een multinational met twintig ARTs en externe leveranciers. SAFe lost dit op door vier officiële configuraties aan te bieden, elk voortbouwend op de vorige.

**Essential SAFe**

Essential SAFe is de instapvariant en de kleinste configuratie die nog steeds de volledige waarde van SAFe levert. Het bevat twee niveaus: Team en Program. Teams werken in iteraties van twee weken; de ART synchroniseert op PI-cadans (8–12 weken). Essential SAFe is het aanbevolen startpunt voor organisaties die voor het eerst met SAFe beginnen.

**Large Solution SAFe**

Wanneer een product zo complex is dat meerdere ARTs moeten samenwerken, voeg je het Large Solution-niveau toe. Een Solution Train coördineert twee of meer ARTs plus externe leveranciers. Typische voorbeelden zijn luchtvaartelectronica, medische apparatuur of defensiesystemen. De Solution Train Engineer (STE) speelt hier dezelfde rol als de RTE op ART-niveau.

**Portfolio SAFe**

Portfolio SAFe voegt het Portfolio-niveau toe aan Essential SAFe. Het gaat over strategie en financiering: welke initiatieven (Epics) krijgen groen licht, en hoeveel budget krijgt elke Value Stream? Lean Budget Guardrails en het Portfolio Kanban zijn de centrale gereedschappen.

**Full SAFe**

Full SAFe combineert alle vier niveaus: Team, Program, Large Solution en Portfolio. Deze configuratie is bedoeld voor de grootste en meest complexe organisaties — denk aan grote financiële instellingen of overheidsorganisaties die tegelijk meerdere zeer complexe producten bouwen.

**Hoe kies je?**

De keuze hangt af van drie vragen:
1. Hoeveel teams moeten samenwerken aan één product? → Essential of Large Solution
2. Moet je portfoliofinanciering en -strategie structureren? → voeg Portfolio toe
3. Heb je zowel zeer complexe producten als portfoliobeheer nodig? → Full SAFe

**Praktijkvoorbeeld**

Een telecombedrijf begint met Essential SAFe voor het team dat hun klantportaal bouwt (één ART, 8 teams). Na twee jaar voegen ze Portfolio SAFe toe om hun vijf ARTs strategisch te sturen. Het Large Solution-niveau blijft buiten scope omdat de ARTs onafhankelijk genoeg zijn.

**Key Takeaways**
- SAFe heeft vier configuraties: Essential, Large Solution, Portfolio en Full SAFe.
- Essential SAFe is het aanbevolen startpunt — Team- en Program-niveau zijn voldoende voor de meeste organisaties.
- Large Solution voegt coördinatie toe voor meerdere ARTs bij zeer complexe producten.
- Full SAFe omvat alle vier niveaus en is bedoeld voor de grootste en meest complexe enterprises.`,
      keyTakeaways: [
        'SAFe heeft vier configuraties: Essential, Large Solution, Portfolio en Full SAFe.',
        'Essential SAFe is het aanbevolen startpunt — Team- en Program-niveau zijn voldoende voor de meeste organisaties.',
        'Large Solution voegt coördinatie toe voor meerdere ARTs bij zeer complexe producten.',
        'Full SAFe omvat alle vier niveaus en is bedoeld voor de grootste enterprises.',
      ],
      keyTakeawaysEN: [
        'SAFe has four configurations: Essential, Large Solution, Portfolio and Full SAFe.',
        'Essential SAFe is the recommended starting point — Team and Program levels suffice for most organisations.',
        'Large Solution adds coordination for multiple ARTs on very complex products.',
        'Full SAFe spans all four levels and is intended for the largest enterprises.',
      ],
      keyTakeawaysNL: [
        'SAFe heeft vier configuraties: Essential, Large Solution, Portfolio en Full SAFe.',
        'Essential SAFe is het aanbevolen startpunt — Team- en Program-niveau zijn voldoende voor de meeste organisaties.',
        'Large Solution voegt coördinatie toe voor meerdere ARTs bij zeer complexe producten.',
        'Full SAFe omvat alle vier niveaus en is bedoeld voor de grootste enterprises.',
      ],
      resources: [],
    },
    {
      id: 'safe-l4',
      title: 'Core Values and Principles',
      titleNL: 'Kernwaarden en Principes',
      type: 'video',
      duration: '12:00',
      videoUrl: '',
      transcript: `Kernwaarden en Principes — de filosofische motor achter SAFe.

**Waarom waarden en principes?**

Praktijken en ceremonies zijn zichtbaar, maar ze zijn slechts de oppervlakte. Duurzame verandering vereist dat mensen de onderliggende waarden en principes begrijpen. Zonder dat fundament degenereren SAFe-teams snel naar "we doen ceremonies maar niets verandert echt."

**De vier kernwaarden van SAFe**

SAFe 6.0 definieert vier kernwaarden die het gedrag van iedereen in de organisatie moeten sturen:

**1. Alignment (Afstemming)**
Grote organisaties falen niet door gebrek aan intelligentie, maar door gebrek aan afstemming. Alignment betekent dat strategie, portfolio-doelstellingen, PI-doelstellingen en teamtaken allemaal naar hetzelfde doel wijzen.

**2. Built-In Quality (Ingebouwde kwaliteit)**
Kwaliteit is geen fase aan het einde van het proces — het is een verantwoordelijkheid van elk team, elke dag. SAFe definieert vijf kwaliteitsdimensies: Flow, Architectuur en ontwerp, Codekwaliteit, Systeemkwaliteit en Releasekwaliteit.

**3. Transparency (Transparantie)**
Vertrouwen vereist zichtbaarheid. Teams publiceren hun plannen, voortgang en impediments openlijk. Leiders reageren op slecht nieuws met probleemoplossing, niet met bestraffing.

**4. Program Execution (Programma-uitvoering)**
Werkende software boven uitgebreide documentatie — maar dan op ART-niveau. Regelmatig werkende, geïntegreerde software is de primaire maatstaf voor voortgang.

**De 10 Lean-Agile Principes**

SAFe is ook gefundeerd op tien principes die zijn afgeleid van Lean-productiesystemen, systeemdenken en Agile-ontwikkeling. Dit zijn géén de twaalf principes van het Agile Manifesto — verwar ze niet.

De tien principes zijn:
1. Neem een economisch perspectief
2. Pas systeemdenken toe
3. Ga uit van variabiliteit; bewaar opties
4. Bouw incrementeel met snelle, geïntegreerde leercycli
5. Baseer mijlpalen op objectieve evaluatie van werkende systemen
6. Visualiseer en beperk WIP, verklein batches en beheer wachtrijen
7. Pas cadans toe; synchroniseer met cross-domein planning
8. Ontsluit de intrinsieke motivatie van kenniswerkers
9. Decentraliseer besluitvorming
10. Organiseer rondom waarde

**Principe 9 in de praktijk**

Decentraliseer besluitvorming betekent niet dat iedereen alles mag beslissen. Het gaat erom dat beslissingen die frequent, tijdgevoelig en lokaal zijn, laag in de organisatie worden genomen. Strategische, zeldzame beslissingen worden centraal gehouden. Dit principe vermindert bottlenecks bij het leiderschap.

**Key Takeaways**
- SAFe\'s vier kernwaarden — Alignment, Built-In Quality, Transparency, Program Execution — sturen het dagelijks gedrag van teams en leiders.
- De 10 Lean-Agile Principes zijn het filosofisch fundament van SAFe; ze zijn afgeleid van Lean en Agile, maar zijn niet identiek aan de 12 Agile Manifesto-principes.
- Built-In Quality heeft vijf dimensies: Flow, Architectuur, Code, Systeem en Release.
- Decentraliseer besluitvorming voor frequente, lokale besluiten — behoud centrale sturing voor strategische keuzes.`,
      transcriptNL: `Kernwaarden en Principes — de filosofische motor achter SAFe.

**Waarom waarden en principes?**

Praktijken en ceremonies zijn zichtbaar, maar ze zijn slechts de oppervlakte. Duurzame verandering vereist dat mensen de onderliggende waarden en principes begrijpen. Zonder dat fundament degenereren SAFe-teams snel naar "we doen ceremonies maar niets verandert echt."

**De vier kernwaarden van SAFe**

SAFe 6.0 definieert vier kernwaarden die het gedrag van iedereen in de organisatie moeten sturen:

**1. Alignment (Afstemming)**
Grote organisaties falen niet door gebrek aan intelligentie, maar door gebrek aan afstemming. Alignment betekent dat strategie, portfolio-doelstellingen, PI-doelstellingen en teamtaken allemaal naar hetzelfde doel wijzen.

**2. Built-In Quality (Ingebouwde kwaliteit)**
Kwaliteit is geen fase aan het einde van het proces — het is een verantwoordelijkheid van elk team, elke dag. SAFe definieert vijf kwaliteitsdimensies: Flow, Architectuur en ontwerp, Codekwaliteit, Systeemkwaliteit en Releasekwaliteit.

**3. Transparency (Transparantie)**
Vertrouwen vereist zichtbaarheid. Teams publiceren hun plannen, voortgang en impediments openlijk. Leiders reageren op slecht nieuws met probleemoplossing, niet met bestraffing.

**4. Program Execution (Programma-uitvoering)**
Werkende software boven uitgebreide documentatie — maar dan op ART-niveau. Regelmatig werkende, geïntegreerde software is de primaire maatstaf voor voortgang.

**De 10 Lean-Agile Principes**

SAFe is ook gefundeerd op tien principes die zijn afgeleid van Lean-productiesystemen, systeemdenken en Agile-ontwikkeling. Dit zijn géén de twaalf principes van het Agile Manifesto — verwar ze niet.

De tien principes zijn:
1. Neem een economisch perspectief
2. Pas systeemdenken toe
3. Ga uit van variabiliteit; bewaar opties
4. Bouw incrementeel met snelle, geïntegreerde leercycli
5. Baseer mijlpalen op objectieve evaluatie van werkende systemen
6. Visualiseer en beperk WIP, verklein batches en beheer wachtrijen
7. Pas cadans toe; synchroniseer met cross-domein planning
8. Ontsluit de intrinsieke motivatie van kenniswerkers
9. Decentraliseer besluitvorming
10. Organiseer rondom waarde

**Principe 9 in de praktijk**

Decentraliseer besluitvorming betekent niet dat iedereen alles mag beslissen. Het gaat erom dat beslissingen die frequent, tijdgevoelig en lokaal zijn, laag in de organisatie worden genomen. Strategische, zeldzame beslissingen worden centraal gehouden. Dit principe vermindert bottlenecks bij het leiderschap.

**Key Takeaways**
- SAFe\'s vier kernwaarden — Alignment, Built-In Quality, Transparency, Program Execution — sturen het dagelijks gedrag van teams en leiders.
- De 10 Lean-Agile Principes zijn het filosofisch fundament van SAFe; ze zijn afgeleid van Lean en Agile, maar zijn niet identiek aan de 12 Agile Manifesto-principes.
- Built-In Quality heeft vijf dimensies: Flow, Architectuur, Code, Systeem en Release.
- Decentraliseer besluitvorming voor frequente, lokale besluiten — behoud centrale sturing voor strategische keuzes.`,
      keyTakeaways: [
        "SAFe\'s vier kernwaarden — Alignment, Built-In Quality, Transparency, Program Execution — sturen het dagelijks gedrag.",
        'De 10 Lean-Agile Principes zijn het filosofisch fundament van SAFe en zijn niet identiek aan de 12 Agile Manifesto-principes.',
        'Built-In Quality heeft vijf dimensies: Flow, Architectuur, Code, Systeem en Release.',
        'Decentraliseer frequente, lokale beslissingen — behoud centrale sturing voor strategische keuzes.',
      ],
      keyTakeawaysEN: [
        "SAFe\'s four core values — Alignment, Built-In Quality, Transparency, Program Execution — guide daily behaviour.",
        'The 10 Lean-Agile Principles are the philosophical foundation of SAFe and are distinct from the 12 Agile Manifesto principles.',
        'Built-In Quality has five dimensions: Flow, Architecture, Code, System and Release.',
        'Decentralise frequent, local decisions — retain central control for strategic choices.',
      ],
      keyTakeawaysNL: [
        "SAFe\'s vier kernwaarden — Alignment, Built-In Quality, Transparency, Program Execution — sturen het dagelijks gedrag.",
        'De 10 Lean-Agile Principes zijn het filosofisch fundament van SAFe en zijn niet identiek aan de 12 Agile Manifesto-principes.',
        'Built-In Quality heeft vijf dimensies: Flow, Architectuur, Code, Systeem en Release.',
        'Decentraliseer frequente, lokale beslissingen — behoud centrale sturing voor strategische keuzes.',
      ],
      resources: [],
    },
    {
      id: 'safe-l5',
      title: 'Quiz: SAFe Basics',
      titleNL: 'Quiz: SAFe Basis',
      type: 'quiz',
      duration: '10:00',
      // TODO: lesson transcripts in this module are stubs — questions are SAFe-canonical and ready for transcript expansion
      quiz: [
        {
          id: 'safe-q1',
          question: 'Welke vier kernwaarden vormen de basis van SAFe?',
          options: [
            'Transparantie, Inspectie, Adaptatie, Commitment',
            'Alignment, Built-In Quality, Transparency, Program Execution',
            'Lean, Agile, DevOps, Flow',
            'Visie, Strategie, Uitvoering, Meting',
          ],
          correctAnswer: 1,
          explanation: 'SAFe 6.0 is gebouwd op vier kernwaarden: Alignment (iedereen werkt naar gedeelde doelstellingen), Built-In Quality (kwaliteit is niet onderhandelbaar), Transparency (vertrouwen vereist zichtbaarheid) en Program Execution (werkende software is de maatstaf).',
        },
        {
          id: 'safe-q2',
          question: 'Welke SAFe-configuratie omvat alle vier niveaus: Team, Program, Large Solution én Portfolio?',
          options: [
            'Essential SAFe',
            'Large Solution SAFe',
            'Portfolio SAFe',
            'Full SAFe',
          ],
          correctAnswer: 3,
          explanation: 'Full SAFe is de meest uitgebreide configuratie en omvat alle vier niveaus. Essential SAFe bevat alleen Team en Program. Large Solution voegt het Large Solution-niveau toe. Portfolio SAFe voegt het Portfolio-niveau toe aan Essential.',
        },
        {
          id: 'safe-q3',
          question: 'Welk SAFe-principe stelt dat je de kleinst mogelijke batch moet gebruiken om doorlooptijd te verkorten?',
          options: [
            'Principe 1 – Neem een economisch perspectief',
            'Principe 6 – Visualiseer en beperk WIP, verminder batch-groottes en beheer wachtrijen',
            'Principe 4 – Bouw incrementeel met snelle, geïntegreerde leercycli',
            'Principe 9 – Decentraliseer besluitvorming',
          ],
          correctAnswer: 1,
          explanation: 'SAFe Lean-Agile Principe 6 richt zich expliciet op het visualiseren en beperken van work-in-progress (WIP), het verkleinen van batch-groottes en het beheren van wachtrijen om de doorlooptijd te verminderen.',
        },
        {
          id: 'safe-q4',
          question: 'Wat is het fundament van het SAFe House of Lean?',
          options: [
            'Lean Portfolio Management',
            'Agile Product Delivery',
            'Leiderschap (Leadership)',
            'Team en Technische Wendbaarheid',
          ],
          correctAnswer: 2,
          explanation: 'In het SAFe House of Lean vormt Leiderschap (Leadership) het fundament. Lean-Agile leiders moeten het denken en gedrag modelleren dat nodig is voor een succesvolle transformatie — alle andere pilaren rusten op dit fundament.',
        },
        {
          id: 'safe-q5',
          question: 'Welke uitspraak over Essential SAFe is correct?',
          options: [
            'Essential SAFe omvat een apart Large Solution-niveau voor complexe systemen',
            'Essential SAFe is de minimale configuratie met het Team- en Program-niveau',
            'Essential SAFe vereist ten minste drie Agile Release Trains',
            'Essential SAFe is alleen toepasbaar voor organisaties met meer dan 500 medewerkers',
          ],
          correctAnswer: 1,
          explanation: 'Essential SAFe is de kleinste en meest toegankelijke SAFe-configuratie. Het bevat het Team-niveau (Agile teams) en het Program-niveau (ART) en vormt de kern waarop alle andere configuraties voortbouwen.',
        },
        {
          id: 'safe-q6',
          question: 'Welke van de volgende dimensies hoort NIET bij Built-In Quality in SAFe 6.0?',
          options: [
            'Flow',
            'Architectuur en ontwerp',
            'Budgetbeheer',
            'Release-kwaliteit',
          ],
          correctAnswer: 2,
          explanation: 'Built-In Quality in SAFe 6.0 heeft vijf dimensies: Flow, Architectuur en ontwerp (Architecture & Design Quality), Code-kwaliteit (Code Quality), Systeemkwaliteit (System Quality) en Release-kwaliteit (Release Quality). Budgetbeheer valt onder Lean Portfolio Management, niet onder Built-In Quality.',
        },
        {
          id: 'safe-q7',
          question: 'Wie heeft SAFe oorspronkelijk ontwikkeld?',
          options: [
            'Ken Schwaber en Jeff Sutherland',
            'Dean Leffingwell',
            'Mike Cohn',
            'Dave Thomas en Andy Hunt',
          ],
          correctAnswer: 1,
          explanation: 'SAFe (Scaled Agile Framework) is ontwikkeld door Dean Leffingwell, gebaseerd op zijn werk rondom feature-driven development en agile requirements. Scaled Agile Inc. beheert en publiceert het framework.',
        },
      ],
    },
  ],
};

const module2: Module = {
  id: 'safe-m2',
  title: 'Agile Release Train',
  titleNL: 'Agile Release Train',
  order: 1,
  icon: 'Train',
  color: '#F472B6',
  gradient: 'linear-gradient(135deg, #F472B6 0%, #EC4899 100%)',
  lessons: [
    {
      id: 'safe-l6',
      title: 'What is an ART?',
      titleNL: 'Wat is een ART?',
      type: 'video',
      duration: '14:00',
      videoUrl: '',
      transcript: `Wat is een Agile Release Train? — de organisatorische ruggengraat van SAFe.

**Het probleem dat de ART oplost**

Stel: je hebt tien Scrum teams die aan hetzelfde product werken. Elk team heeft zijn eigen Sprint, eigen Definition of Done en eigen prioriteiten. Aan het einde van elk kwartaal blijkt dat de stukken niet op elkaar passen — integraties mislukken, afhankelijkheden zijn te laat ontdekt en de business wacht alweer. De Agile Release Train lost dit op door alle teams in één gedeeld ritme te brengen.

**Definitie**

Een Agile Release Train (ART) is een langdurig, zelfsturend team van Agile teams. Een ART telt 50 tot 125 mensen, verdeeld over 5 tot 12 Agile teams. Ze plannen samen, leveren samen en leren samen op een vaste cadans van 8 tot 12 weken — het Program Increment (PI).

**Rollen op ART-niveau**

De ART kent vijf sleutelrollen naast de bestaande teamrollen:

- **Release Train Engineer (RTE)**: de Scrum Master van de ART. Faciliteert PI Planning, coacht teams en verwijdert impediments op ART-niveau.
- **Product Manager**: beheert de Program Backlog met Features. Werkt samen met Business Owners en klanten om prioriteiten te stellen.
- **System Architect/Engineer**: bewaakt de technische visie en architecturale integriteit van de ART.
- **Business Owners**: sleutelstakeholders die PI-doelstellingen beoordelen en waarde valideren.
- **Product Owner (per team)**: verantwoordelijk voor de Team Backlog met Stories.

**Werking in de praktijk**

Elke twee weken levert elk team een werkend, geïntegreerd increment op. Aan het einde van elke iteratie wordt de gecombineerde output gepresenteerd in de System Demo. Elke 10 weken (vier iteraties plus één Innovatie & Planning-iteratie) vindt PI Planning plaats om het volgende kwartaal te plannen.

**Praktijkvoorbeeld**

Een verzekeraar richt een ART op voor hun digitale klantplatform. De ART bestaat uit acht teams: twee voor de mobiele app, twee voor de backendservices, één voor data en analytics, één voor integraties met externe partijen, en twee voor compliance en testing. De RTE coördineert de onderlinge afhankelijkheden wekelijks via de ART Sync.

**Key Takeaways**
- Een ART bundelt 50–125 mensen in 5–12 Agile teams rondom één gedeelde waardestroom.
- De vijf ART-rollen zijn RTE, Product Manager, System Architect/Engineer, Business Owners en Product Owners per team.
- Alle ART-teams werken op dezelfde iteratiecadans (2 weken) en PI-cadans (8–12 weken).
- De ART synchroniseert via vaste ceremonies: PI Planning, System Demo, Inspect & Adapt en ART Sync.`,
      transcriptNL: `Wat is een Agile Release Train? — de organisatorische ruggengraat van SAFe.

**Het probleem dat de ART oplost**

Stel: je hebt tien Scrum teams die aan hetzelfde product werken. Elk team heeft zijn eigen Sprint, eigen Definition of Done en eigen prioriteiten. Aan het einde van elk kwartaal blijkt dat de stukken niet op elkaar passen — integraties mislukken, afhankelijkheden zijn te laat ontdekt en de business wacht alweer. De Agile Release Train lost dit op door alle teams in één gedeeld ritme te brengen.

**Definitie**

Een Agile Release Train (ART) is een langdurig, zelfsturend team van Agile teams. Een ART telt 50 tot 125 mensen, verdeeld over 5 tot 12 Agile teams. Ze plannen samen, leveren samen en leren samen op een vaste cadans van 8 tot 12 weken — het Program Increment (PI).

**Rollen op ART-niveau**

De ART kent vijf sleutelrollen naast de bestaande teamrollen:

- **Release Train Engineer (RTE)**: de Scrum Master van de ART. Faciliteert PI Planning, coacht teams en verwijdert impediments op ART-niveau.
- **Product Manager**: beheert de Program Backlog met Features. Werkt samen met Business Owners en klanten om prioriteiten te stellen.
- **System Architect/Engineer**: bewaakt de technische visie en architecturale integriteit van de ART.
- **Business Owners**: sleutelstakeholders die PI-doelstellingen beoordelen en waarde valideren.
- **Product Owner (per team)**: verantwoordelijk voor de Team Backlog met Stories.

**Werking in de praktijk**

Elke twee weken levert elk team een werkend, geïntegreerd increment op. Aan het einde van elke iteratie wordt de gecombineerde output gepresenteerd in de System Demo. Elke 10 weken (vier iteraties plus één Innovatie & Planning-iteratie) vindt PI Planning plaats om het volgende kwartaal te plannen.

**Praktijkvoorbeeld**

Een verzekeraar richt een ART op voor hun digitale klantplatform. De ART bestaat uit acht teams: twee voor de mobiele app, twee voor de backendservices, één voor data en analytics, één voor integraties met externe partijen, en twee voor compliance en testing. De RTE coördineert de onderlinge afhankelijkheden wekelijks via de ART Sync.

**Key Takeaways**
- Een ART bundelt 50–125 mensen in 5–12 Agile teams rondom één gedeelde waardestroom.
- De vijf ART-rollen zijn RTE, Product Manager, System Architect/Engineer, Business Owners en Product Owners per team.
- Alle ART-teams werken op dezelfde iteratiecadans (2 weken) en PI-cadans (8–12 weken).
- De ART synchroniseert via vaste ceremonies: PI Planning, System Demo, Inspect & Adapt en ART Sync.`,
      keyTakeaways: [
        'Een ART bundelt 50–125 mensen in 5–12 Agile teams rondom één gedeelde waardestroom.',
        'De vijf ART-rollen zijn RTE, Product Manager, System Architect/Engineer, Business Owners en Product Owners.',
        'Alle ART-teams werken op dezelfde iteratiecadans (2 weken) en PI-cadans (8–12 weken).',
        'De ART synchroniseert via PI Planning, System Demo, Inspect & Adapt en ART Sync.',
      ],
      keyTakeawaysEN: [
        'An ART brings together 50–125 people across 5–12 Agile teams around a shared value stream.',
        'The five ART roles are RTE, Product Manager, System Architect/Engineer, Business Owners and Product Owners.',
        'All ART teams operate on the same iteration cadence (2 weeks) and PI cadence (8–12 weeks).',
        'The ART synchronises via PI Planning, System Demo, Inspect & Adapt and ART Sync.',
      ],
      keyTakeawaysNL: [
        'Een ART bundelt 50–125 mensen in 5–12 Agile teams rondom één gedeelde waardestroom.',
        'De vijf ART-rollen zijn RTE, Product Manager, System Architect/Engineer, Business Owners en Product Owners.',
        'Alle ART-teams werken op dezelfde iteratiecadans (2 weken) en PI-cadans (8–12 weken).',
        'De ART synchroniseert via PI Planning, System Demo, Inspect & Adapt en ART Sync.',
      ],
      resources: [],
    },
    {
      id: 'safe-l7',
      title: 'PI Planning',
      titleNL: 'PI Planning',
      type: 'video',
      duration: '18:00',
      videoUrl: '',
      transcript: `PI Planning — het hart van de Agile Release Train.

**Waarom PI Planning?**

Grote organisaties verliezen tijd en geld doordat teams in isolement werken en afhankelijkheden pas laat ontdekken. PI Planning is het antwoord: een face-to-face evenement van twee dagen waarbij alle teams van de ART tegelijkertijd plannen, afhankelijkheden in kaart brengen en heldere doelstellingen formuleren voor het komende Program Increment.

**Wat is een Program Increment?**

Een Program Increment (PI) duurt 8 tot 12 weken en bestaat typisch uit vier iteraties van twee weken plus één Innovatie & Planning (IP) iteratie. De IP-iteratie is gereserveerd voor innovatie, technische schuld aflossen en de voorbereiding van de volgende PI Planning.

**Het tweelaagsagendastructuur**

PI Planning duurt twee volle dagen en volgt een vaste agenda:

**Dag 1 — Visie en eerste teamplannen**
- Zakelijke context: management presenteert de strategie en de uitdagingen.
- Product Management presenteert de Productvision en de top-tien Features uit de Program Backlog.
- Architecturale visie: de System Architect licht technische richtingen toe.
- Teams plannen hun iteraties en identificeren afhankelijkheden op een fysiek of digitaal programmaboard.

**Dag 2 — Verfijnen en committeren**
- Teams verfijnen hun plannen op basis van feedback.
- Afhankelijkheden worden besproken en risico\'s worden beoordeeld (ROAM: Resolved, Owned, Accepted, Mitigated).
- Elk team presenteert zijn teamplan en PI-doelstellingen aan de Business Owners.
- Business Owners geven een vertrouwenstemming (confidence vote) op een schaal van 1–5.
- Definitieve PI-doelstellingen worden vastgesteld.

**PI-doelstellingen**

Elk team stelt drie tot vijf PI-doelstellingen (PI Objectives) op: beknopte, zakelijke uitspraken over wat het team in het komende PI wil bereiken. Doelstellingen worden gelabeld als "gecommitteerd" of "uitgerekt" (stretch). De Business Value Score van de Business Owners geeft aan hoe relevant elke doelstelling is.

**Programmaboard**

Het programmaboard visualiseert alle teamplannen, afhankelijkheden (als draad of pijl tussen teams) en mijlpalen. Het is het enige artefact dat de hele ART in één oogopslag laat zien wie wat wanneer levert.

**Praktijkvoorbeeld**

Een energiebedrijf houdt PI Planning voor een ART van negen teams. In dag 1 ontdekken teams A en D dat ze allebei een API-integratie verwachten die niemand heeft gepland. Via het programmaboard maken ze de afhankelijkheid zichtbaar. In dag 2 committeert team C zich om de API in iteratie 2 gereed te hebben. Het risico wordt als "Owned" geroamd aan team C. Zonder PI Planning zou dit conflict pas in iteratie 3 zijn ontdekt.

**Key Takeaways**
- PI Planning is een verplicht tweeedaags evenement voor de gehele ART, bij voorkeur face-to-face.
- Een PI duurt 8–12 weken (typisch 4 iteraties × 2 weken + 1 IP-iteratie).
- Het programmaboard maakt afhankelijkheden en teamcommitments zichtbaar voor de hele ART.
- Risico's worden geroamd (Resolved, Owned, Accepted, Mitigated) en PI-doelstellingen worden gescoord door Business Owners.`,
      transcriptNL: `PI Planning — het hart van de Agile Release Train.

**Waarom PI Planning?**

Grote organisaties verliezen tijd en geld doordat teams in isolement werken en afhankelijkheden pas laat ontdekken. PI Planning is het antwoord: een face-to-face evenement van twee dagen waarbij alle teams van de ART tegelijkertijd plannen, afhankelijkheden in kaart brengen en heldere doelstellingen formuleren voor het komende Program Increment.

**Wat is een Program Increment?**

Een Program Increment (PI) duurt 8 tot 12 weken en bestaat typisch uit vier iteraties van twee weken plus één Innovatie & Planning (IP) iteratie. De IP-iteratie is gereserveerd voor innovatie, technische schuld aflossen en de voorbereiding van de volgende PI Planning.

**Het tweelaagsagendastructuur**

PI Planning duurt twee volle dagen en volgt een vaste agenda:

**Dag 1 — Visie en eerste teamplannen**
- Zakelijke context: management presenteert de strategie en de uitdagingen.
- Product Management presenteert de Productvision en de top-tien Features uit de Program Backlog.
- Architecturale visie: de System Architect licht technische richtingen toe.
- Teams plannen hun iteraties en identificeren afhankelijkheden op een fysiek of digitaal programmaboard.

**Dag 2 — Verfijnen en committeren**
- Teams verfijnen hun plannen op basis van feedback.
- Afhankelijkheden worden besproken en risico\'s worden beoordeeld (ROAM: Resolved, Owned, Accepted, Mitigated).
- Elk team presenteert zijn teamplan en PI-doelstellingen aan de Business Owners.
- Business Owners geven een vertrouwenstemming (confidence vote) op een schaal van 1–5.
- Definitieve PI-doelstellingen worden vastgesteld.

**PI-doelstellingen**

Elk team stelt drie tot vijf PI-doelstellingen (PI Objectives) op: beknopte, zakelijke uitspraken over wat het team in het komende PI wil bereiken. Doelstellingen worden gelabeld als "gecommitteerd" of "uitgerekt" (stretch). De Business Value Score van de Business Owners geeft aan hoe relevant elke doelstelling is.

**Programmaboard**

Het programmaboard visualiseert alle teamplannen, afhankelijkheden (als draad of pijl tussen teams) en mijlpalen. Het is het enige artefact dat de hele ART in één oogopslag laat zien wie wat wanneer levert.

**Praktijkvoorbeeld**

Een energiebedrijf houdt PI Planning voor een ART van negen teams. In dag 1 ontdekken teams A en D dat ze allebei een API-integratie verwachten die niemand heeft gepland. Via het programmaboard maken ze de afhankelijkheid zichtbaar. In dag 2 committeert team C zich om de API in iteratie 2 gereed te hebben. Het risico wordt als "Owned" geroamd aan team C. Zonder PI Planning zou dit conflict pas in iteratie 3 zijn ontdekt.

**Key Takeaways**
- PI Planning is een verplicht tweeedaags evenement voor de gehele ART, bij voorkeur face-to-face.
- Een PI duurt 8–12 weken (typisch 4 iteraties × 2 weken + 1 IP-iteratie).
- Het programmaboard maakt afhankelijkheden en teamcommitments zichtbaar voor de hele ART.
- Risico's worden geroamd (Resolved, Owned, Accepted, Mitigated) en PI-doelstellingen worden gescoord door Business Owners.`,
      keyTakeaways: [
        'PI Planning is een verplicht tweeedaags evenement voor de gehele ART, bij voorkeur face-to-face.',
        'Een PI duurt 8–12 weken (typisch 4 iteraties × 2 weken + 1 IP-iteratie).',
        'Het programmaboard maakt afhankelijkheden en teamcommitments zichtbaar voor de hele ART.',
        'Risico\'s worden geroamd (Resolved, Owned, Accepted, Mitigated); PI-doelstellingen worden gescoord door Business Owners.',
      ],
      keyTakeawaysEN: [
        'PI Planning is a mandatory two-day event for the entire ART, preferably face-to-face.',
        'A PI lasts 8–12 weeks (typically 4 iterations × 2 weeks + 1 IP iteration).',
        'The program board makes dependencies and team commitments visible to the entire ART.',
        'Risks are ROAMed (Resolved, Owned, Accepted, Mitigated); PI Objectives are scored by Business Owners.',
      ],
      keyTakeawaysNL: [
        'PI Planning is een verplicht tweeedaags evenement voor de gehele ART, bij voorkeur face-to-face.',
        'Een PI duurt 8–12 weken (typisch 4 iteraties × 2 weken + 1 IP-iteratie).',
        'Het programmaboard maakt afhankelijkheden en teamcommitments zichtbaar voor de hele ART.',
        'Risico\'s worden geroamd (Resolved, Owned, Accepted, Mitigated); PI-doelstellingen worden gescoord door Business Owners.',
      ],
      resources: [],
    },
    {
      id: 'safe-l8',
      title: 'System Demo',
      titleNL: 'System Demo',
      type: 'video',
      duration: '10:00',
      videoUrl: '',
      transcript: `System Demo — geïntegreerd bewijs dat de ART vooruitgang boekt.

**Waarom de System Demo bestaat**

In traditionele projecten presenteert elk team afzonderlijk wat ze hebben gebouwd — en de integratieproblemen komen pas aan het licht als het te laat is. De System Demo lost dit op door aan het einde van elke iteratie alle teamincrementen te combineren tot één geïntegreerde demonstratie voor stakeholders.

**Definitie en cadans**

De System Demo is een ART-level evenement dat aan het einde van elke iteratie (elke twee weken) plaatsvindt. Alle teams van de ART demonstreren gezamenlijk het geïntegreerde, werkende systeem aan Business Owners en andere stakeholders. Het is geen PowerPoint-presentatie — het is werkende software.

**Verschil met de Sprint Review**

Teams houden ook een eigen Sprint Review (iteratiereview) aan het einde van elke iteratie, maar die toont alleen het werk van dat specifieke team. De System Demo gaat een niveau hoger: het toont het gecombineerde resultaat van de hele ART. Een team dat zijn eigen increment succesvol demonstreert, maar wiens code niet integreert met de rest, zal dat zien in de System Demo.

**Wie neemt deel?**

- Alle Agile teams van de ART (of vertegenwoordigers)
- Business Owners
- Product Management
- System Architect/Engineer
- Relevante externe stakeholders
- De RTE faciliteert het evenement

**Wat wordt gedemonstreerd?**

De System Demo toont de gecumuleerde, geïntegreerde voortgang van de ART. Als de ART vier iteraties heeft doorlopen, toont de vierde System Demo alles wat in die vier iteraties is gebouwd — niet alleen de nieuwe Features van die iteratie.

**Feedback en aanpassing**

Business Owners en stakeholders geven directe feedback. Die feedback stroomt terug naar Product Management en de teams als input voor de volgende iteratieplannen. Dit is een concreet mechanisme voor continue verbetering en alignment op waarde.

**Praktijkvoorbeeld**

Een retailer bouwt een nieuw loyaliteitsprogramma via een ART van zeven teams. Na iteratie 2 laat de System Demo zien dat de puntenregistratie van team A correct werkt, maar de koppeling met de mobiele app van team C mislukt. Business Owners ontdekken dit in week 4, niet in week 20. Het Product Management past de prioriteiten aan en team C lost de integratie op in de volgende iteratie.

**Key Takeaways**
- De System Demo toont de geïntegreerde output van de gehele ART aan het einde van elke iteratie (elke twee weken).
- Het is werkende software, geen presentatie — integratieproblemen worden vroeg zichtbaar.
- Business Owners geven directe feedback die terugspoelt naar de volgende iteratieplanning.
- De System Demo verschilt van de Sprint Review: die laatste toont alleen het werk van één team.`,
      transcriptNL: `System Demo — geïntegreerd bewijs dat de ART vooruitgang boekt.

**Waarom de System Demo bestaat**

In traditionele projecten presenteert elk team afzonderlijk wat ze hebben gebouwd — en de integratieproblemen komen pas aan het licht als het te laat is. De System Demo lost dit op door aan het einde van elke iteratie alle teamincrementen te combineren tot één geïntegreerde demonstratie voor stakeholders.

**Definitie en cadans**

De System Demo is een ART-level evenement dat aan het einde van elke iteratie (elke twee weken) plaatsvindt. Alle teams van de ART demonstreren gezamenlijk het geïntegreerde, werkende systeem aan Business Owners en andere stakeholders. Het is geen PowerPoint-presentatie — het is werkende software.

**Verschil met de Sprint Review**

Teams houden ook een eigen Sprint Review (iteratiereview) aan het einde van elke iteratie, maar die toont alleen het werk van dat specifieke team. De System Demo gaat een niveau hoger: het toont het gecombineerde resultaat van de hele ART. Een team dat zijn eigen increment succesvol demonstreert, maar wiens code niet integreert met de rest, zal dat zien in de System Demo.

**Wie neemt deel?**

- Alle Agile teams van de ART (of vertegenwoordigers)
- Business Owners
- Product Management
- System Architect/Engineer
- Relevante externe stakeholders
- De RTE faciliteert het evenement

**Wat wordt gedemonstreerd?**

De System Demo toont de gecumuleerde, geïntegreerde voortgang van de ART. Als de ART vier iteraties heeft doorlopen, toont de vierde System Demo alles wat in die vier iteraties is gebouwd — niet alleen de nieuwe Features van die iteratie.

**Feedback en aanpassing**

Business Owners en stakeholders geven directe feedback. Die feedback stroomt terug naar Product Management en de teams als input voor de volgende iteratieplannen. Dit is een concreet mechanisme voor continue verbetering en alignment op waarde.

**Praktijkvoorbeeld**

Een retailer bouwt een nieuw loyaliteitsprogramma via een ART van zeven teams. Na iteratie 2 laat de System Demo zien dat de puntenregistratie van team A correct werkt, maar de koppeling met de mobiele app van team C mislukt. Business Owners ontdekken dit in week 4, niet in week 20. Het Product Management past de prioriteiten aan en team C lost de integratie op in de volgende iteratie.

**Key Takeaways**
- De System Demo toont de geïntegreerde output van de gehele ART aan het einde van elke iteratie.
- Het is werkende software — integratieproblemen worden vroeg zichtbaar.
- Business Owners geven directe feedback die terugspoelt naar de volgende iteratieplanning.
- De System Demo verschilt van de Sprint Review: die laatste toont alleen het werk van één team.`,
      keyTakeaways: [
        'De System Demo toont de geïntegreerde output van de gehele ART aan het einde van elke iteratie (elke 2 weken).',
        'Het is werkende software, geen presentatie — integratieproblemen worden vroeg zichtbaar.',
        'Business Owners geven directe feedback die terugspoelt naar de volgende iteratieplanning.',
        'De System Demo verschilt van de Sprint Review: die toont alleen het werk van één team.',
      ],
      keyTakeawaysEN: [
        'The System Demo shows the integrated output of the entire ART at the end of every iteration (every 2 weeks).',
        'It is working software, not a presentation — integration issues become visible early.',
        'Business Owners provide direct feedback that feeds back into the next iteration planning.',
        'The System Demo differs from the Sprint Review, which shows only one team\'s work.',
      ],
      keyTakeawaysNL: [
        'De System Demo toont de geïntegreerde output van de gehele ART aan het einde van elke iteratie (elke 2 weken).',
        'Het is werkende software, geen presentatie — integratieproblemen worden vroeg zichtbaar.',
        'Business Owners geven directe feedback die terugspoelt naar de volgende iteratieplanning.',
        'De System Demo verschilt van de Sprint Review: die toont alleen het werk van één team.',
      ],
      resources: [],
    },
    {
      id: 'safe-l9',
      title: 'Inspect & Adapt',
      titleNL: 'Inspect & Adapt',
      type: 'video',
      duration: '12:00',
      videoUrl: '',
      transcript: `Inspect & Adapt — het SAFe-equivalent van een grote retrospectief, maar met tanden.

**Waarom Inspect & Adapt?**

Aan het einde van elk Program Increment heeft de ART niet alleen software opgeleverd — ze hebben ook geleerd. Wat ging goed? Wat blokkeert de flow? Welke problemen komen telkens terug? Inspect & Adapt (I&A) is het formele SAFe-evenement om die lessen te verwerken en concrete verbeteracties te committeren.

**Drie onderdelen van I&A**

Inspect & Adapt bestaat uit drie duidelijk gescheiden onderdelen:

**1. PI System Demo**
De allerlaatste System Demo van het PI: een geïntegreerde demonstratie van alles wat de ART in het gehele PI heeft gebouwd. Dit is voor Business Owners en andere stakeholders de gelegenheid om de eindresultaten te beoordelen.

**2. Kwantitatieve meting**
Teams en de ART meten hun PI-prestaties tegen de PI-doelstellingen. Welke doelstellingen zijn bereikt? Met welke Business Value Score? Wat was de geplande versus gerealiseerde velocity? Deze data geeft een objectief beeld en vormt de basis voor het gesprek.

**3. Probleemoplossings-workshop**
Dit is het meest krachtige onderdeel. De ART identificeert de grootste systemische problemen (niet teamspecifieke issues — die zijn al opgelost in individuele retrospectives). Vervolgens gebruikt de ART een gestructureerde root-cause analysetechniek, zoals visgraatanalyse of de 5 Why\'s, om de grondoorzaken te vinden. Elk probleem resulteert in concrete verbeteracties die worden opgenomen in de volgende PI als items in de backlog.

**Verschil met een gewone retrospectief**

Een teamretrospectief gaat over de processen en samenwerking binnen één team. I&A gaat over systemische problemen die de hele ART of organisatie raken — problemen die buiten de controle van één team vallen. Denk aan: gedeelde tooling die traag is, afhankelijkheden met een extern team dat buiten SAFe werkt, of een deploymentpijplijn die elke ART vertraagt.

**Praktijkvoorbeeld**

Na PI-3 ontdekt de ART dat de gemiddelde deployment-lead time is gestegen van 3 naar 8 dagen. De probleemoplossings-workshop onthult via de 5 Why\'s dat de testomgeving te weinig capaciteit heeft. De verbeteractie: DevOps team krijgt een Feature in PI-4 om de testinfrastructuur te moderniseren. Dat is I&A in actie — data leidt tot analyse, analyse leidt tot actie.

**Key Takeaways**
- Inspect & Adapt sluit elk PI af en bestaat uit drie delen: PI System Demo, kwantitatieve meting en een probleemoplossings-workshop.
- Het richt zich op systemische problemen op ART-niveau, niet op teamspecifieke issues.
- Root-cause analyse (visgraatanalyse, 5 Why\'s) levert concrete verbeteracties op die in de volgende PI-backlog komen.
- I&A verankert continu leren als een formeel en terugkerend SAFe-evenement.`,
      transcriptNL: `Inspect & Adapt — het SAFe-equivalent van een grote retrospectief, maar met tanden.

**Waarom Inspect & Adapt?**

Aan het einde van elk Program Increment heeft de ART niet alleen software opgeleverd — ze hebben ook geleerd. Wat ging goed? Wat blokkeert de flow? Welke problemen komen telkens terug? Inspect & Adapt (I&A) is het formele SAFe-evenement om die lessen te verwerken en concrete verbeteracties te committeren.

**Drie onderdelen van I&A**

Inspect & Adapt bestaat uit drie duidelijk gescheiden onderdelen:

**1. PI System Demo**
De allerlaatste System Demo van het PI: een geïntegreerde demonstratie van alles wat de ART in het gehele PI heeft gebouwd. Dit is voor Business Owners en andere stakeholders de gelegenheid om de eindresultaten te beoordelen.

**2. Kwantitatieve meting**
Teams en de ART meten hun PI-prestaties tegen de PI-doelstellingen. Welke doelstellingen zijn bereikt? Met welke Business Value Score? Wat was de geplande versus gerealiseerde velocity? Deze data geeft een objectief beeld en vormt de basis voor het gesprek.

**3. Probleemoplossings-workshop**
Dit is het meest krachtige onderdeel. De ART identificeert de grootste systemische problemen. Vervolgens gebruikt de ART een gestructureerde root-cause analysetechniek, zoals visgraatanalyse of de 5 Why\'s, om de grondoorzaken te vinden. Elk probleem resulteert in concrete verbeteracties die worden opgenomen in de volgende PI als items in de backlog.

**Verschil met een gewone retrospectief**

Een teamretrospectief gaat over de processen en samenwerking binnen één team. I&A gaat over systemische problemen die de hele ART of organisatie raken — problemen die buiten de controle van één team vallen.

**Praktijkvoorbeeld**

Na PI-3 ontdekt de ART dat de gemiddelde deployment-lead time is gestegen van 3 naar 8 dagen. De probleemoplossings-workshop onthult via de 5 Why\'s dat de testomgeving te weinig capaciteit heeft. De verbeteractie: het DevOps team krijgt een Feature in PI-4 om de testinfrastructuur te moderniseren.

**Key Takeaways**
- Inspect & Adapt sluit elk PI af en bestaat uit drie delen: PI System Demo, kwantitatieve meting en een probleemoplossings-workshop.
- Het richt zich op systemische problemen op ART-niveau, niet op teamspecifieke issues.
- Root-cause analyse (visgraatanalyse, 5 Why\'s) levert concrete verbeteracties op die in de volgende PI-backlog komen.
- I&A verankert continu leren als een formeel en terugkerend SAFe-evenement.`,
      keyTakeaways: [
        'Inspect & Adapt sluit elk PI af: PI System Demo, kwantitatieve meting en een probleemoplossings-workshop.',
        'Het richt zich op systemische problemen op ART-niveau, niet op teamspecifieke issues.',
        'Root-cause analyse (visgraatanalyse, 5 Why\'s) levert concrete verbeteracties op voor de volgende PI.',
        'I&A verankert continu leren als een formeel en terugkerend SAFe-evenement.',
      ],
      keyTakeawaysEN: [
        'Inspect & Adapt closes every PI: PI System Demo, quantitative measurement and a problem-solving workshop.',
        'It focuses on systemic ART-level problems, not team-specific issues.',
        'Root-cause analysis (fishbone, 5 Whys) produces concrete improvement actions for the next PI.',
        'I&A embeds continuous learning as a formal, recurring SAFe event.',
      ],
      keyTakeawaysNL: [
        'Inspect & Adapt sluit elk PI af: PI System Demo, kwantitatieve meting en een probleemoplossings-workshop.',
        'Het richt zich op systemische problemen op ART-niveau, niet op teamspecifieke issues.',
        'Root-cause analyse (visgraatanalyse, 5 Why\'s) levert concrete verbeteracties op voor de volgende PI.',
        'I&A verankert continu leren als een formeel en terugkerend SAFe-evenement.',
      ],
      resources: [],
    },
    {
      id: 'safe-l10',
      title: 'Release on Demand',
      titleNL: 'Release on Demand',
      type: 'video',
      duration: '10:00',
      videoUrl: '',
      transcript: `Release on Demand — ontkoppel release van development, lever wanneer de business het nodig heeft.

**Het kernprobleem**

In veel organisaties zijn releases risicovolle, zeldzame gebeurtenissen. Teams bouwen weken of maanden, en dan is er een grote, stressvolle release waarbij alles tegelijk live gaat. Als er iets misgaat, is het bijna onmogelijk te bepalen wat de oorzaak is. SAFe lost dit op met het concept Release on Demand.

**Wat is Release on Demand?**

Release on Demand is de SAFe-competentie die organisaties in staat stelt om software continu te bouwen maar selectief en op het juiste moment vrij te geven — afgestemd op zakelijke behoeften, niet op een vaste deploymentkalender. Het gaat om het ontkoppelen van "gebouwd en getest" van "live voor gebruikers".

**De vier aspecten van Continuous Delivery Pipeline**

Release on Demand is onderdeel van de bredere Agile Product Delivery-competentie. De Continuous Delivery Pipeline heeft vier aspecten:

1. **Continuous Exploration**: teams ontdekken wat klanten nodig hebben via hypothesen en feedback.
2. **Continuous Integration**: code wordt continu geïntegreerd, getest en in een release-kandidaatstate gehouden.
3. **Continuous Deployment**: de software wordt doorlopend naar een productie-achtige omgeving gedeployed.
4. **Release on Demand**: de business bepaalt wanneer welke Feature live gaat — via feature flags, canary releases of geplande activeringsmomenten.

**Feature Toggles als praktisch gereedschap**

Feature toggles (ook wel feature flags of feature flippers) zijn de technische ruggengraat van Release on Demand. Een Feature wordt gebouwd en gedeployed, maar blijft inactief voor gebruikers totdat de business besluit het in te schakelen. Dit geeft de organisatie de controle: marketing kan de lancering koppelen aan een campagne, compliance kan wachten tot een audit is afgerond.

**Praktijkvoorbeeld**

Een bank bouwt een nieuwe hypotheekrekentool. De code is klaar na iteratie 3 van het PI, maar de juridische afdeling heeft nog twee weken nodig voor goedkeuring. Dankzij een feature toggle staat de tool al live in productie, maar is hij alleen zichtbaar voor een interne testgroep. Op de dag van juridische goedkeuring wordt de toggle omgezet — de tool is onmiddellijk live voor alle klanten, zonder extra deployment.

**Key Takeaways**
- Release on Demand ontkoppelt "gebouwd en getest" van "live voor gebruikers" — de business bepaalt het releasemoment.
- De Continuous Delivery Pipeline bestaat uit vier aspecten: Continuous Exploration, Integration, Deployment en Release on Demand.
- Feature toggles zijn het praktische gereedschap om features selectief en risicovrij te activeren.
- Dit vermindert het risico van grote releases en geeft de business strategische controle over lanceringen.`,
      transcriptNL: `Release on Demand — ontkoppel release van development, lever wanneer de business het nodig heeft.

**Het kernprobleem**

In veel organisaties zijn releases risicovolle, zeldzame gebeurtenissen. Teams bouwen weken of maanden, en dan is er een grote, stressvolle release waarbij alles tegelijk live gaat. Als er iets misgaat, is het bijna onmogelijk te bepalen wat de oorzaak is. SAFe lost dit op met het concept Release on Demand.

**Wat is Release on Demand?**

Release on Demand is de SAFe-competentie die organisaties in staat stelt om software continu te bouwen maar selectief en op het juiste moment vrij te geven — afgestemd op zakelijke behoeften, niet op een vaste deploymentkalender. Het gaat om het ontkoppelen van "gebouwd en getest" van "live voor gebruikers".

**De vier aspecten van Continuous Delivery Pipeline**

Release on Demand is onderdeel van de bredere Agile Product Delivery-competentie. De Continuous Delivery Pipeline heeft vier aspecten:

1. **Continuous Exploration**: teams ontdekken wat klanten nodig hebben via hypothesen en feedback.
2. **Continuous Integration**: code wordt continu geïntegreerd, getest en in een release-kandidaatstate gehouden.
3. **Continuous Deployment**: de software wordt doorlopend naar een productie-achtige omgeving gedeployed.
4. **Release on Demand**: de business bepaalt wanneer welke Feature live gaat — via feature flags, canary releases of geplande activeringsmomenten.

**Feature Toggles als praktisch gereedschap**

Feature toggles zijn de technische ruggengraat van Release on Demand. Een Feature wordt gebouwd en gedeployed, maar blijft inactief voor gebruikers totdat de business besluit het in te schakelen. Dit geeft de organisatie de controle: marketing kan de lancering koppelen aan een campagne, compliance kan wachten tot een audit is afgerond.

**Praktijkvoorbeeld**

Een bank bouwt een nieuwe hypotheekrekentool. De code is klaar na iteratie 3, maar de juridische afdeling heeft nog twee weken nodig. Dankzij een feature toggle staat de tool al live in productie maar is hij alleen zichtbaar voor een interne testgroep. Op de dag van goedkeuring wordt de toggle omgezet — onmiddellijk live voor alle klanten, zonder extra deployment.

**Key Takeaways**
- Release on Demand ontkoppelt "gebouwd en getest" van "live voor gebruikers" — de business bepaalt het releasemoment.
- De Continuous Delivery Pipeline heeft vier aspecten: Continuous Exploration, Integration, Deployment en Release on Demand.
- Feature toggles maken het mogelijk om features selectief en risicovrij te activeren.
- Dit vermindert het risico van grote releases en geeft de business strategische controle over lanceringen.`,
      keyTakeaways: [
        'Release on Demand ontkoppelt "gebouwd en getest" van "live voor gebruikers" — de business bepaalt het releasemoment.',
        'De Continuous Delivery Pipeline heeft vier aspecten: Continuous Exploration, Integration, Deployment en Release on Demand.',
        'Feature toggles maken selectieve, risicovrije activering van features mogelijk.',
        'Dit vermindert het risico van grote releases en geeft de business strategische controle.',
      ],
      keyTakeawaysEN: [
        'Release on Demand decouples "built and tested" from "live for users" — the business decides the release moment.',
        'The Continuous Delivery Pipeline has four aspects: Continuous Exploration, Integration, Deployment and Release on Demand.',
        'Feature toggles enable selective, low-risk activation of features.',
        'This reduces big-bang release risk and gives the business strategic control over launches.',
      ],
      keyTakeawaysNL: [
        'Release on Demand ontkoppelt "gebouwd en getest" van "live voor gebruikers" — de business bepaalt het releasemoment.',
        'De Continuous Delivery Pipeline heeft vier aspecten: Continuous Exploration, Integration, Deployment en Release on Demand.',
        'Feature toggles maken selectieve, risicovrije activering van features mogelijk.',
        'Dit vermindert het risico van grote releases en geeft de business strategische controle.',
      ],
      resources: [],
    },
    {
      id: 'safe-l11',
      title: 'Quiz: ART',
      titleNL: 'Quiz: ART',
      type: 'quiz',
      duration: '12:00',
      // TODO: lesson transcripts in this module are stubs — questions are SAFe-canonical and ready for transcript expansion
      quiz: [
        {
          id: 'safe-q8',
          question: 'Hoeveel mensen telt een typische Agile Release Train (ART) in SAFe?',
          options: [
            '5 tot 25 mensen',
            '50 tot 125 mensen',
            '100 tot 500 mensen',
            '200 tot 1000 mensen',
          ],
          correctAnswer: 1,
          explanation: 'Een ART bestaat typisch uit 50 tot 125 mensen, verdeeld over 5 tot 12 Agile teams. Dit is klein genoeg voor sociale cohesie en groot genoeg om een significante waardestroom te bedienen.',
        },
        {
          id: 'safe-q9',
          question: 'Hoe lang duurt een standaard Program Increment (PI) in SAFe?',
          options: [
            '2 tot 4 weken',
            '6 tot 8 weken',
            '8 tot 12 weken',
            '12 tot 24 weken',
          ],
          correctAnswer: 2,
          explanation: 'Een Program Increment duurt standaard 8 tot 12 weken, verdeeld in 4 iteraties van 2 weken plus één Innovatie & Planning (IP) iteratie. De meest gebruikte cadans is 10 weken (4 × 2 weken + 2 weken IP).',
        },
        {
          id: 'safe-q10',
          question: 'Wat is het primaire doel van PI Planning?',
          options: [
            'Het opstellen van een gedetailleerd projectplan voor de komende 12 maanden',
            'Alle ART-teams afstemmen op een gemeenschappelijke visie, doelstellingen en afhankelijkheden voor het komende PI',
            'Het toewijzen van budgetten aan individuele teams voor het komende kwartaal',
            'Het beoordelen van de prestaties van teams uit het vorige PI',
          ],
          correctAnswer: 1,
          explanation: 'PI Planning is een face-to-face (bij voorkeur) evenement van twee dagen waarbij alle teams van de ART samenkomen om te plannen, afhankelijkheden te identificeren en PI-doelstellingen (PI Objectives) op te stellen die zijn afgestemd op de visie van Product Management.',
        },
        {
          id: 'safe-q11',
          question: 'Welke rol is verantwoordelijk voor het coachen van de ART, het faciliteren van ART-evenementen en het wegnemen van impediments op ART-niveau?',
          options: [
            'Product Manager',
            'Solution Train Engineer (STE)',
            'Release Train Engineer (RTE)',
            'System Architect',
          ],
          correctAnswer: 2,
          explanation: 'De Release Train Engineer (RTE) is de "Scrum Master van de ART". De RTE coacht teams, faciliteert ART-evenementen zoals PI Planning en System Demo, en helpt impediments op te lossen die buiten het vermogen van individuele teams vallen.',
        },
        {
          id: 'safe-q12',
          question: 'Wat is het System Demo in SAFe?',
          options: [
            'Een demo die uitsluitend voor interne ontwikkelteams wordt gehouden aan het einde van elke iteratie',
            'Een geïntegreerde demo van alle teamincrementen van de ART, gehouden aan het einde van elke iteratie voor stakeholders',
            'Een jaarlijkse presentatie van het gehele product aan de raad van bestuur',
            'Een technische demonstratie van de systeemarchitectuur voor het architectuurteam',
          ],
          correctAnswer: 1,
          explanation: 'De System Demo is een ART-level evenement aan het einde van elke iteratie waarbij alle teams hun gecombineerde, geïntegreerde werkende software demonstreren aan stakeholders en Business Owners. Dit geeft realtime feedback over de voortgang.',
        },
        {
          id: 'safe-q13',
          question: 'Welk evenement sluit het Program Increment af en combineert een kwantitatieve probleemoplossings-workshop met een retrospectief op ART-niveau?',
          options: [
            'PI Planning',
            'System Demo',
            'Inspect & Adapt (I&A)',
            'Scrum of Scrums',
          ],
          correctAnswer: 2,
          explanation: 'Inspect & Adapt (I&A) is het afsluitende evenement van elk PI. Het bestaat uit drie delen: de PI System Demo, een kwantitatieve meting (PI-doelstellingen vs. werkelijkheid) en een probleemoplossings-workshop (root-cause analyse en verbeteracties). Dit is het SAFe-equivalent van een grote retrospectief.',
        },
      ],
    },
  ],
};

const module3: Module = {
  id: 'safe-m3',
  title: 'Portfolio & Large Solution',
  titleNL: 'Portfolio & Large Solution',
  order: 2,
  icon: 'Building2',
  color: '#FBCFE8',
  gradient: 'linear-gradient(135deg, #FBCFE8 0%, #F472B6 100%)',
  lessons: [
    {
      id: 'safe-l12',
      title: 'Lean Portfolio Management',
      titleNL: 'Lean Portfolio Management',
      type: 'video',
      duration: '16:00',
      videoUrl: '',
      transcript: `Lean Portfolio Management — verbind bedrijfsstrategie met uitvoering zonder de Agile teams te verstikken.

**Waarom LPM?**

De meeste SAFe-implementaties beginnen op het Program-niveau met de ART. Maar na verloop van tijd stelt de organisatie de vraag: hoe beslissen we welke ARTs worden gefinancierd? Hoe sturen we op strategie? Hoe voorkomen we dat elke ART zijn eigen koers vaart? Lean Portfolio Management (LPM) geeft het antwoord.

**De drie verantwoordelijkheden van LPM**

SAFe 6.0 definieert drie kernverantwoordelijkheden voor LPM:

**1. Portfoliostrategie en -visie**
LPM stelt de strategische thema\'s (Strategic Themes) vast die richting geven aan de portfoliobeslissingen. Strategic Themes zijn de differentierende zakelijke doelstellingen die de verbinding vormen tussen de bedrijfsstrategie en het portfolio. Ze beantwoorden de vraag: "Waar investeren we de komende jaren in?"

**2. Agile portfolio-operations**
LPM coördineert de ARTs en Value Streams, bewaakt de voortgang via OKRs of PI-doelstellingen, en zorgt voor operationele afstemming. De LPM-functie houdt ook toezicht op de Epic Backlog via het Portfolio Kanban.

**3. Lean Governance**
In plaats van traditioneel projectmanagement met aparte goedkeuringsrondes per project, gebruikt SAFe Lean Budget Guardrails. Budgetten worden toegewezen aan Value Streams (niet aan projecten) en kunnen dynamisch worden bijgesteld — doorgaans twee keer per jaar. Audits, compliance en financiële rapportage vallen ook onder Lean Governance.

**Het Portfolio Kanban**

Het Portfolio Kanban visualiseert de flow van Epics door het besluitvormingsproces: van idee via analyse naar goedkeuring en uiteindelijk implementatie. Een Epic krijgt pas groen licht als er een Lean Business Case is opgesteld en goedgekeurd. Dit voorkomt dat grote investeringen worden gedaan op basis van slechts een idee.

**Epic Owners en de Lean Business Case**

De Epic Owner is verantwoordelijk voor het schrijven van de Lean Business Case en het begeleiden van de Epic door het Portfolio Kanban. Een Lean Business Case is bondig — typisch één pagina — maar bevat de essentiële zakelijke rechtvaardiging, de verwachte investering en het verwachte resultaat.

**Praktijkvoorbeeld**

Een logistiek bedrijf heeft drie ARTs. LPM beheert een Strategic Theme: "Klantinzicht verbeteren via data". Het Portfolio Kanban toont vier actieve Epics. Twee Epics zijn goedgekeurd en in uitvoering bij ART 1 en ART 2. Twee nieuwe Epics wachten op een Lean Business Case. LPM vergadert elk kwartaal om budgetten bij te stellen op basis van de realiseerde waarde.

**Key Takeaways**
- LPM heeft drie verantwoordelijkheden: portfoliostrategie en -visie, Agile portfolio-operations en Lean Governance.
- Budgetten worden toegewezen aan Value Streams via Lean Budget Guardrails — niet per project.
- Het Portfolio Kanban bewaakt de flow van Epics van idee tot implementatie.
- De Epic Owner schrijft de Lean Business Case en begeleidt de Epic door het goedkeuringsproces.`,
      transcriptNL: `Lean Portfolio Management — verbind bedrijfsstrategie met uitvoering zonder de Agile teams te verstikken.

**Waarom LPM?**

De meeste SAFe-implementaties beginnen op het Program-niveau met de ART. Maar na verloop van tijd stelt de organisatie de vraag: hoe beslissen we welke ARTs worden gefinancierd? Hoe sturen we op strategie? Hoe voorkomen we dat elke ART zijn eigen koers vaart? Lean Portfolio Management (LPM) geeft het antwoord.

**De drie verantwoordelijkheden van LPM**

SAFe 6.0 definieert drie kernverantwoordelijkheden voor LPM:

**1. Portfoliostrategie en -visie**
LPM stelt de strategische thema\'s (Strategic Themes) vast die richting geven aan de portfoliobeslissingen. Strategic Themes zijn de differentierende zakelijke doelstellingen die de verbinding vormen tussen de bedrijfsstrategie en het portfolio.

**2. Agile portfolio-operations**
LPM coördineert de ARTs en Value Streams, bewaakt de voortgang via OKRs of PI-doelstellingen, en zorgt voor operationele afstemming. De LPM-functie houdt ook toezicht op de Epic Backlog via het Portfolio Kanban.

**3. Lean Governance**
In plaats van traditioneel projectmanagement met aparte goedkeuringsrondes per project, gebruikt SAFe Lean Budget Guardrails. Budgetten worden toegewezen aan Value Streams (niet aan projecten) en kunnen dynamisch worden bijgesteld — doorgaans twee keer per jaar.

**Het Portfolio Kanban**

Het Portfolio Kanban visualiseert de flow van Epics van idee via analyse naar goedkeuring en implementatie. Een Epic krijgt pas groen licht als er een Lean Business Case is opgesteld en goedgekeurd.

**Epic Owners en de Lean Business Case**

De Epic Owner is verantwoordelijk voor het schrijven van de Lean Business Case en het begeleiden van de Epic door het Portfolio Kanban. Een Lean Business Case is bondig — typisch één pagina — maar bevat de essentiële zakelijke rechtvaardiging, de verwachte investering en het verwachte resultaat.

**Praktijkvoorbeeld**

Een logistiek bedrijf heeft drie ARTs. LPM beheert een Strategic Theme: "Klantinzicht verbeteren via data". Het Portfolio Kanban toont vier actieve Epics. LPM vergadert elk kwartaal om budgetten bij te stellen op basis van gerealiseerde waarde.

**Key Takeaways**
- LPM heeft drie verantwoordelijkheden: portfoliostrategie en -visie, Agile portfolio-operations en Lean Governance.
- Budgetten worden toegewezen aan Value Streams via Lean Budget Guardrails — niet per project.
- Het Portfolio Kanban bewaakt de flow van Epics van idee tot implementatie.
- De Epic Owner schrijft de Lean Business Case en begeleidt de Epic door het goedkeuringsproces.`,
      keyTakeaways: [
        'LPM heeft drie verantwoordelijkheden: portfoliostrategie en -visie, Agile portfolio-operations en Lean Governance.',
        'Budgetten worden toegewezen aan Value Streams via Lean Budget Guardrails — niet per project.',
        'Het Portfolio Kanban bewaakt de flow van Epics van idee tot goedgekeurde implementatie.',
        'De Epic Owner schrijft de Lean Business Case en begeleidt de Epic door het goedkeuringsproces.',
      ],
      keyTakeawaysEN: [
        'LPM has three responsibilities: portfolio strategy and vision, Agile portfolio operations and Lean Governance.',
        'Budgets are allocated to Value Streams via Lean Budget Guardrails — not per project.',
        'The Portfolio Kanban tracks the flow of Epics from idea through to approved implementation.',
        'The Epic Owner writes the Lean Business Case and guides the Epic through the approval process.',
      ],
      keyTakeawaysNL: [
        'LPM heeft drie verantwoordelijkheden: portfoliostrategie en -visie, Agile portfolio-operations en Lean Governance.',
        'Budgetten worden toegewezen aan Value Streams via Lean Budget Guardrails — niet per project.',
        'Het Portfolio Kanban bewaakt de flow van Epics van idee tot goedgekeurde implementatie.',
        'De Epic Owner schrijft de Lean Business Case en begeleidt de Epic door het goedkeuringsproces.',
      ],
      resources: [],
    },
    {
      id: 'safe-l13',
      title: 'Value Streams',
      titleNL: 'Value Streams',
      type: 'video',
      duration: '14:00',
      videoUrl: '',
      transcript: `Value Streams — de fundamentele bouwsteen voor het organiseren van een SAFe-enterprise.

**Waarom Value Streams centraal staan**

Traditionele organisaties zijn ingericht rondom functies: een IT-afdeling, een marketingafdeling, een financiële afdeling. Het probleem: waarde voor de klant stroomt dwars door die afdelingen heen. SAFe pakt dit aan door de organisatie te structureren rondom Value Streams — de reeksen stappen die waarde creëren voor de eindklant.

**Twee soorten Value Streams**

SAFe maakt een duidelijk onderscheid tussen twee typen:

**Operational Value Streams**
Dit zijn de stappen die directe waarde leveren aan externe klanten. Voorbeelden: "het verwerken van een verzekeringsaanvraag", "het leveren van een pakket aan een consument", "het uitvoeren van een bankoverschrijving". Operational Value Streams zijn het resultaat — ze leveren de waarde.

**Development Value Streams**
Dit zijn de stappen om de systemen, software en producten te bouwen en te onderhouden die de Operational Value Streams mogelijk maken. Een Development Value Stream voor de bank kan zijn: "het bouwen en onderhouden van het internetbankierenplatform". ARTs worden georganiseerd rondom Development Value Streams.

**Hoe identificeer je een Value Stream?**

Een praktische aanpak in drie stappen:
1. Begin bij de eindklant: welke behoefte wordt vervuld?
2. Trace de stappen terug: welke activiteiten zijn nodig om die behoefte te vervullen?
3. Identificeer de Development Value Stream: welke systemen ondersteunen die stappen, en wie bouwt ze?

**Value Stream Mapping**

Value Stream Mapping is een Lean-techniek om de huidige stroom van activiteiten te visualiseren, inclusief de wachttijden (queue times) tussen stappen. In SAFe wordt het gebruikt om de effectiviteit van de development flow te verbeteren — het onthult waar waarde vastloopt en hoe de flow kan worden versneld.

**Flow-metrics**

SAFe 6.0 introduceert acht Flow-metrics om de gezondheid van een Value Stream te meten:
- Flow Velocity, Flow Time, Flow Efficiency, Flow Load, Flow Distribution, Flow Predictability, Flow Quality en Flow Happiness.

**Praktijkvoorbeeld**

Een retailer identificeert twee Operational Value Streams: "klantorder verwerken" en "retourzending afhandelen". Voor elk wordt een Development Value Stream bepaald. De Development Value Stream "e-commerce platform" ondersteunt beide operational value streams. Er wordt één ART opgericht rondom deze Development Value Stream, met vijf teams die elk een deel van het platform beheren.

**Key Takeaways**
- SAFe onderscheidt Operational Value Streams (waarde voor klanten) en Development Value Streams (systemen die dat mogelijk maken).
- ARTs worden georganiseerd rondom Development Value Streams, niet rondom functionele afdelingen.
- Value Stream Mapping maakt wachttijden en inefficiënties zichtbaar zodat de flow kan worden verbeterd.
- SAFe 6.0 meet de gezondheid van een Value Stream via acht Flow-metrics.`,
      transcriptNL: `Value Streams — de fundamentele bouwsteen voor het organiseren van een SAFe-enterprise.

**Waarom Value Streams centraal staan**

Traditionele organisaties zijn ingericht rondom functies: een IT-afdeling, een marketingafdeling, een financiële afdeling. Het probleem: waarde voor de klant stroomt dwars door die afdelingen heen. SAFe pakt dit aan door de organisatie te structureren rondom Value Streams.

**Twee soorten Value Streams**

SAFe maakt een duidelijk onderscheid tussen twee typen:

**Operational Value Streams**
De stappen die directe waarde leveren aan externe klanten. Voorbeelden: "het verwerken van een verzekeringsaanvraag", "het leveren van een pakket", "het uitvoeren van een bankoverschrijving".

**Development Value Streams**
De stappen om de systemen en software te bouwen die de Operational Value Streams mogelijk maken. ARTs worden georganiseerd rondom Development Value Streams.

**Hoe identificeer je een Value Stream?**

1. Begin bij de eindklant: welke behoefte wordt vervuld?
2. Trace de stappen terug: welke activiteiten zijn nodig?
3. Identificeer de Development Value Stream: welke systemen ondersteunen die stappen?

**Value Stream Mapping**

Value Stream Mapping is een Lean-techniek om de huidige stroom te visualiseren, inclusief wachttijden. In SAFe wordt het gebruikt om de development flow te verbeteren.

**Flow-metrics**

SAFe 6.0 introduceert acht Flow-metrics: Flow Velocity, Flow Time, Flow Efficiency, Flow Load, Flow Distribution, Flow Predictability, Flow Quality en Flow Happiness.

**Praktijkvoorbeeld**

Een retailer heeft een Development Value Stream "e-commerce platform" die twee Operational Value Streams ondersteunt. Er wordt één ART opgericht met vijf teams die elk een deel van het platform beheren.

**Key Takeaways**
- SAFe onderscheidt Operational Value Streams (waarde voor klanten) en Development Value Streams (systemen die dat mogelijk maken).
- ARTs worden georganiseerd rondom Development Value Streams, niet rondom functionele afdelingen.
- Value Stream Mapping maakt wachttijden en inefficiënties zichtbaar.
- SAFe 6.0 meet de gezondheid van een Value Stream via acht Flow-metrics.`,
      keyTakeaways: [
        'SAFe onderscheidt Operational Value Streams (waarde voor klanten) en Development Value Streams (systemen die dat mogelijk maken).',
        'ARTs worden georganiseerd rondom Development Value Streams, niet rondom functionele afdelingen.',
        'Value Stream Mapping maakt wachttijden en inefficiënties in de flow zichtbaar.',
        'SAFe 6.0 meet de gezondheid van een Value Stream via acht Flow-metrics.',
      ],
      keyTakeawaysEN: [
        'SAFe distinguishes Operational Value Streams (value to customers) from Development Value Streams (systems enabling that value).',
        'ARTs are organised around Development Value Streams, not functional departments.',
        'Value Stream Mapping surfaces wait times and inefficiencies in the flow.',
        'SAFe 6.0 measures Value Stream health via eight Flow metrics.',
      ],
      keyTakeawaysNL: [
        'SAFe onderscheidt Operational Value Streams (waarde voor klanten) en Development Value Streams (systemen die dat mogelijk maken).',
        'ARTs worden georganiseerd rondom Development Value Streams, niet rondom functionele afdelingen.',
        'Value Stream Mapping maakt wachttijden en inefficiënties in de flow zichtbaar.',
        'SAFe 6.0 meet de gezondheid van een Value Stream via acht Flow-metrics.',
      ],
      resources: [],
    },
    {
      id: 'safe-l14',
      title: 'Large Solution SAFe',
      titleNL: 'Large Solution SAFe',
      type: 'video',
      duration: '12:00',
      videoUrl: '',
      transcript: `Large Solution SAFe — wanneer één ART niet genoeg is voor de complexiteit van het systeem.

**Wanneer heb je Large Solution nodig?**

De meeste organisaties zijn goed geholpen met Essential SAFe — één ART, één cadans, één PI Planning. Maar sommige systemen zijn zo groot en complex dat zelfs 125 mensen in één ART niet volstaan. Denk aan een nationaal betalingssysteem, een luchtverkeersbeheersysteem of militaire communicatiesystemen. Voor die situaties introduceert SAFe het Large Solution-niveau.

**De Solution Train**

Het equivalent van de ART op Large Solution-niveau is de Solution Train. Een Solution Train bestaat uit meerdere ARTs plus externe leveranciers die samenwerken aan één Very Large Solution (VLS). Waar de ART 5 tot 12 teams omvat, kan een Solution Train meerdere tientallen teams en leveranciers bevatten.

**Nieuwe rollen op Large Solution-niveau**

Het Large Solution-niveau introduceert vier nieuwe rollen:

- **Solution Train Engineer (STE)**: de RTE van de Solution Train. Faciliteert Pre- en Post-PI Planning, coacht de ARTs en verwijdert impediments op Solution Train-niveau.
- **Solution Management**: beheert de Solution Backlog met Capabilities (vergelijkbaar met Features maar op Solution-niveau). Bepaalt samen met klanten en Business Owners de prioriteiten.
- **Solution Architect/Engineer**: bewaakt de architectuur en technische integriteit van de gehele oplossing over alle ARTs heen.
- **Customer**: de Solution Train werkt nauw samen met de klant, die bij Very Large Solutions vaak een overheidsorganisatie of zakelijke partner is.

**Pre- en Post-PI Planning**

De Solution Train synchroniseert via een uitgebreid planningsproces:
- **Pre-PI Planning**: vóór de individuele PI Plannings van de ARTs, stelt de Solution Train de gezamenlijke visie en de top-prioriteiten vast zodat elke ART weet in welke richting ze moeten plannen.
- **Post-PI Planning**: na de afzonderlijke PI Plannings van de ARTs komen alle plannen samen op het Solution Train-niveau om afhankelijkheden tussen ARTs te coördineren.

**Solution Backlog en Capabilities**

De Solution Backlog bevat Capabilities: grote functionaliteiten die te groot zijn voor één Feature maar te klein voor een Epic. Een Capability wordt opgesplitst in Features die door de afzonderlijke ARTs worden opgepakt.

**Praktijkvoorbeeld**

Een defensiebedrijf bouwt een nieuw commandosysteem. De Solution Train bestaat uit drie ARTs: één voor communicatiesoftware, één voor sensor-integratie en één voor de gebruikersinterface. De STE organiseert Pre-PI Planning waarbij de strategische vereisten worden vastgesteld. Elke ART houdt daarna zijn eigen PI Planning binnen de kaders die Pre-PI Planning heeft bepaald.

**Key Takeaways**
- Large Solution SAFe voegt het Solution Train-niveau toe voor de bouw van Very Large Solutions met meerdere ARTs.
- De vier nieuwe rollen zijn: Solution Train Engineer, Solution Management, Solution Architect/Engineer en Customer.
- Pre-PI Planning stelt de gezamenlijke visie vast vóór de afzonderlijke ARTs plannen; Post-PI Planning integreert de plannen daarna.
- De Solution Backlog bevat Capabilities die worden opgesplitst in Features voor de ARTs.`,
      transcriptNL: `Large Solution SAFe — wanneer één ART niet genoeg is voor de complexiteit van het systeem.

**Wanneer heb je Large Solution nodig?**

De meeste organisaties zijn goed geholpen met Essential SAFe — één ART, één cadans. Maar sommige systemen zijn zo groot en complex dat zelfs 125 mensen in één ART niet volstaan. Denk aan een nationaal betalingssysteem, een luchtverkeersbeheersysteem of militaire communicatiesystemen.

**De Solution Train**

Een Solution Train bestaat uit meerdere ARTs plus externe leveranciers die samenwerken aan één Very Large Solution (VLS). Waar de ART 5 tot 12 teams omvat, kan een Solution Train meerdere tientallen teams en leveranciers bevatten.

**Nieuwe rollen op Large Solution-niveau**

- **Solution Train Engineer (STE)**: de RTE van de Solution Train.
- **Solution Management**: beheert de Solution Backlog met Capabilities.
- **Solution Architect/Engineer**: bewaakt architectuur en technische integriteit over alle ARTs.
- **Customer**: werkt nauw samen met de Solution Train.

**Pre- en Post-PI Planning**

- **Pre-PI Planning**: stelt de gezamenlijke visie en top-prioriteiten vast vóór de ARTs individueel plannen.
- **Post-PI Planning**: integreert de plannen van alle ARTs en coördineert afhankelijkheden op Solution Train-niveau.

**Solution Backlog en Capabilities**

De Solution Backlog bevat Capabilities: functionaliteiten die te groot zijn voor één Feature maar kleiner dan een Epic. Een Capability wordt opgesplitst in Features voor de ARTs.

**Praktijkvoorbeeld**

Een defensiebedrijf bouwt een commandosysteem met drie ARTs. De STE organiseert Pre-PI Planning om strategische vereisten vast te stellen. Elke ART plant daarna binnen die kaders.

**Key Takeaways**
- Large Solution voegt het Solution Train-niveau toe voor Very Large Solutions met meerdere ARTs.
- De vier nieuwe rollen zijn: STE, Solution Management, Solution Architect/Engineer en Customer.
- Pre-PI Planning stelt de visie vast vóór de ARTs plannen; Post-PI Planning integreert de plannen daarna.
- De Solution Backlog bevat Capabilities die worden opgesplitst in Features voor de ARTs.`,
      keyTakeaways: [
        'Large Solution voegt het Solution Train-niveau toe voor Very Large Solutions die meerdere ARTs vereisen.',
        'De vier nieuwe rollen zijn: Solution Train Engineer, Solution Management, Solution Architect/Engineer en Customer.',
        'Pre-PI Planning stelt de gezamenlijke visie vast; Post-PI Planning integreert de ARTs-plannen.',
        'De Solution Backlog bevat Capabilities die worden opgesplitst in Features voor de afzonderlijke ARTs.',
      ],
      keyTakeawaysEN: [
        'Large Solution adds the Solution Train level for Very Large Solutions requiring multiple ARTs.',
        'The four new roles are: Solution Train Engineer, Solution Management, Solution Architect/Engineer and Customer.',
        'Pre-PI Planning sets shared vision before ARTs plan; Post-PI Planning integrates the resulting plans.',
        'The Solution Backlog contains Capabilities that are split into Features for the individual ARTs.',
      ],
      keyTakeawaysNL: [
        'Large Solution voegt het Solution Train-niveau toe voor Very Large Solutions die meerdere ARTs vereisen.',
        'De vier nieuwe rollen zijn: Solution Train Engineer, Solution Management, Solution Architect/Engineer en Customer.',
        'Pre-PI Planning stelt de gezamenlijke visie vast; Post-PI Planning integreert de ARTs-plannen.',
        'De Solution Backlog bevat Capabilities die worden opgesplitst in Features voor de afzonderlijke ARTs.',
      ],
      resources: [],
    },
    {
      id: 'safe-l15',
      title: 'Metrics and Measurement',
      titleNL: 'Metrics en Meting',
      type: 'video',
      duration: '10:00',
      videoUrl: '',
      transcript: `Metrics en Meting in SAFe — meet wat telt, niet wat makkelijk te meten is.

**Waarom meten in SAFe?**

SAFe stelt vertrouwen in teams — maar vertrouwen vereist zichtbaarheid. Metrics geven teams, ARTs en portfolios de informatie die ze nodig hebben om te leren en te verbeteren. Het gevaar is metrics gebruiken als controlemiddel in plaats van als leermiddel. SAFe kiest voor outcome-gebaseerde metrics boven activiteitenmetrics.

**De SAFe Measurement Framework**

SAFe structureert metrics op drie niveaus:

**Team-niveau**
- **Velocity**: het aantal story points dat een team per iteratie realiseert. Nuttig voor capaciteitsplanning, niet voor het vergelijken van teams.
- **Quality**: defectdichtheid, geautomatiseerde testdekking, technische schuld.
- **Flow**: cycle time per story, blokkades.

**ART-niveau (Program-niveau)**
- **PI Predictability**: het percentage geplande PI-doelstellingen dat daadwerkelijk is gerealiseerd. Gezonde ARTs halen 80–100%.
- **Feature Cycle Time**: de tijd van Feature-acceptatie tot Feature-oplevering.
- **Program Board Completeness**: hoeveel geplande afhankelijkheden tijdig zijn opgelost.

**Portfolio-niveau**
- **Epic Throughput**: het aantal Epics dat per kwartaal door het Portfolio Kanban stroomt.
- **Business Outcomes**: strategische OKRs (Objectives and Key Results) die de verwachte businesswaarde meten.
- **Lean Budgets**: geplande versus bestede budgetten per Value Stream.

**De acht Flow-metrics**

SAFe 6.0 introduceert acht Flow-metrics voor de gezondheid van een Value Stream:
1. Flow Velocity — hoeveel waarde-eenheden de Value Stream per tijdsperiode verwerkt
2. Flow Time — de totale doorlooptijd van een werkitem van begin tot eind
3. Flow Efficiency — het percentage actieve werktijd versus wachttijd
4. Flow Load — het aantal actieve werkitems (WIP)
5. Flow Distribution — de mix van werktypen (features, defects, risico, schuld)
6. Flow Predictability — in hoeverre de geplande waarde overeenkomt met de gerealiseerde waarde
7. Flow Quality — het percentage defectvrije incrementen
8. Flow Happiness — een subjectieve meting van teamwelzijn

**Valkuilen**

- Gebruik velocity nooit om teams te vergelijken — elk team heeft zijn eigen kalibratiesysteem.
- Meet nooit louter activiteit (aantal vergaderingen, regels code) zonder de uitkomst te meten.
- Gebruik metrics om gesprekken te starten, niet om oordelen te vellen.

**Praktijkvoorbeeld**

Na PI-4 ziet de RTE dat de PI Predictability van de ART is gedaald van 87% naar 71%. De I&A-workshop onthult dat twee teams structureel te optimistisch plannen. De verbeteractie: teams passen hun capaciteitsberekening aan door 20% marge aan te houden voor ongepland werk. Na twee PIs stijgt de predictability terug naar 84%.

**Key Takeaways**
- SAFe meet op drie niveaus: team, ART (program) en portfolio — elk met eigen metrics.
- PI Predictability (80–100% is gezond) is de kernmeting op ART-niveau.
- De acht Flow-metrics geven een volledig beeld van de gezondheid van een Value Stream.
- Gebruik metrics als leermiddel, niet als controlemiddel — velocity vergelijken tussen teams is een antipatroon.`,
      transcriptNL: `Metrics en Meting in SAFe — meet wat telt, niet wat makkelijk te meten is.

**Waarom meten in SAFe?**

Metrics geven teams, ARTs en portfolios de informatie om te leren en te verbeteren. SAFe kiest voor outcome-gebaseerde metrics boven activiteitenmetrics.

**Drie meetniveaus**

**Team-niveau**: Velocity (story points per iteratie), kwaliteitsmetrics (defectdichtheid, testdekking) en flow-metrics (cycle time).

**ART-niveau**: PI Predictability (percentage gerealiseerde PI-doelstellingen — gezond is 80–100%), Feature Cycle Time en Program Board Completeness.

**Portfolio-niveau**: Epic Throughput, strategische OKRs en Lean Budget-realisatie per Value Stream.

**De acht Flow-metrics van SAFe 6.0**

1. Flow Velocity — waarde-eenheden per tijdsperiode
2. Flow Time — totale doorlooptijd van begin tot eind
3. Flow Efficiency — actieve werktijd versus wachttijd
4. Flow Load — hoeveelheid WIP
5. Flow Distribution — mix van werktypen
6. Flow Predictability — geplande versus gerealiseerde waarde
7. Flow Quality — percentage defectvrije incrementen
8. Flow Happiness — subjectieve meting van teamwelzijn

**Valkuilen**

- Gebruik velocity nooit om teams te vergelijken.
- Meet nooit louter activiteit zonder de uitkomst te meten.
- Gebruik metrics als gespreksstarter, niet als oordeel.

**Praktijkvoorbeeld**

Na PI-4 daalt de PI Predictability van 87% naar 71%. De I&A-workshop onthult dat teams te optimistisch plannen. Verbeteractie: 20% marge aanhouden voor ongepland werk. Na twee PIs stijgt de predictability terug naar 84%.

**Key Takeaways**
- SAFe meet op drie niveaus: team, ART en portfolio — elk met eigen metrics.
- PI Predictability (80–100% is gezond) is de kernmeting op ART-niveau.
- De acht Flow-metrics geven een volledig beeld van de gezondheid van een Value Stream.
- Gebruik metrics als leermiddel, niet als controlemiddel.`,
      keyTakeaways: [
        'SAFe meet op drie niveaus: team, ART en portfolio — elk met eigen metrics.',
        'PI Predictability (80–100% is gezond) is de centrale meting op ART-niveau.',
        'De acht Flow-metrics geven een volledig beeld van de gezondheid van een Value Stream.',
        'Gebruik metrics als leermiddel, niet als controlemiddel — velocity vergelijken tussen teams is een antipatroon.',
      ],
      keyTakeawaysEN: [
        'SAFe measures at three levels: team, ART and portfolio — each with its own metrics.',
        'PI Predictability (80–100% is healthy) is the central measure at ART level.',
        'The eight Flow metrics give a complete picture of Value Stream health.',
        'Use metrics as a learning tool, not a control tool — comparing velocity across teams is an anti-pattern.',
      ],
      keyTakeawaysNL: [
        'SAFe meet op drie niveaus: team, ART en portfolio — elk met eigen metrics.',
        'PI Predictability (80–100% is gezond) is de centrale meting op ART-niveau.',
        'De acht Flow-metrics geven een volledig beeld van de gezondheid van een Value Stream.',
        'Gebruik metrics als leermiddel, niet als controlemiddel — velocity vergelijken tussen teams is een antipatroon.',
      ],
      resources: [],
    },
    {
      id: 'safe-l16',
      title: 'Quiz: Final',
      titleNL: 'Quiz: Eindexamen',
      type: 'quiz',
      duration: '15:00',
      // TODO: lesson transcripts in this module are stubs — questions are SAFe-canonical and ready for transcript expansion
      quiz: [
        {
          id: 'safe-q14',
          question: 'Wat is de primaire functie van Lean Portfolio Management (LPM) in SAFe?',
          options: [
            'Het dagelijks beheer van Agile teams en hun Sprint-backlogs',
            'Het afstemmen van strategie en uitvoering door portfolio-visie, -financiering en -governance toe te passen',
            'Het plannen van PI Planning-evenementen voor alle ARTs in de organisatie',
            'Het beoordelen van individuele medewerkersdoelstellingen op jaarbasis',
          ],
          correctAnswer: 1,
          explanation: 'Lean Portfolio Management (LPM) verbindt strategie met uitvoering. LPM is verantwoordelijk voor portfoliostrategie en -visie, Agile portfolio-operations en Lean Governance — inclusief het toewijzen van budgetten via Lean Budget Guardrails.',
        },
        {
          id: 'safe-q15',
          question: 'Wat zijn Lean Budget Guardrails in SAFe?',
          options: [
            'Vaste projectbudgetten die per sprint worden goedgekeurd door de CFO',
            'Beleidslijnen die parameters stellen voor hoe budgetten worden toegewezen en besteed binnen een portfolio, zonder traditioneel projectfinanciering',
            'Limieten op het aantal features dat een team per kwartaal mag bouwen',
            'Financiële controles die vereisen dat elk team maandelijks rapporteert aan een stuurgroep',
          ],
          correctAnswer: 1,
          explanation: 'Lean Budget Guardrails zijn beleidsrichtlijnen die bepalen hoe portfoliobudgetten worden verdeeld en bewaakt — bijvoorbeeld de balans tussen run-the-business en grow-the-business activiteiten. Ze vervangen traditioneel projectfinanciering door het financieren van Value Streams.',
        },
        {
          id: 'safe-q16',
          question: 'Wat is het verschil tussen een Operationele Waardestroom (Operational Value Stream) en een Ontwikkelwaardestroom (Development Value Stream) in SAFe?',
          options: [
            'Operationele waardestromen leveren producten aan klanten; ontwikkelwaardestromen bouwen de systemen die dat mogelijk maken',
            'Operationele waardestromen zijn voor IT-teams; ontwikkelwaardestromen zijn voor businessteams',
            'Er is geen verschil — SAFe gebruikt beide termen door elkaar',
            'Operationele waardestromen horen bij Large Solution SAFe; ontwikkelwaardestromen bij Essential SAFe',
          ],
          correctAnswer: 0,
          explanation: 'In SAFe zijn Operational Value Streams de stappen die waarde leveren aan eindklanten (bijv. "verwerking van een verzekeringsaanvraag"). Development Value Streams zijn de stappen om de systemen te bouwen en te onderhouden die Operational Value Streams ondersteunen. ARTs worden georganiseerd rondom Development Value Streams.',
        },
        {
          id: 'safe-q17',
          question: 'Wie is de Epic Owner in SAFe en wat is diens primaire verantwoordelijkheid?',
          options: [
            'De Product Owner op teamniveau die verantwoordelijk is voor de Sprint Backlog',
            'De persoon die een portfolio-epic of solution-epic door de Kanban-funnel begeleidt van definitie tot implementatie en voltooiing',
            'De Release Train Engineer die ART-evenementen faciliteert',
            'De Business Owner die budget goedkeurt voor een nieuw product',
          ],
          correctAnswer: 1,
          explanation: 'De Epic Owner is verantwoordelijk voor het definiëren, het verkrijgen van goedkeuring voor (via Lean Business Case) en het coördineren van de implementatie van een Epic. De Epic Owner werkt samen met Product Management en architecten om de epic door het Portfolio Kanban te leiden.',
        },
        {
          id: 'safe-q18',
          question: 'Hoe worden budgetten in SAFe typisch toegewezen in plaats van via traditioneel projectfinanciering?',
          options: [
            'Per team, op basis van Sprint-snelheid (velocity)',
            'Per jaar, goedgekeurd door een stuurgroep op basis van businesscases',
            'Per Value Stream, via Lean Budget Guardrails die doorlopend worden beoordeeld',
            'Per epic, alleen nadat een MVP is gevalideerd',
          ],
          correctAnswer: 2,
          explanation: 'SAFe verlaat het traditionele project-gebaseerde financieringsmodel. In plaats daarvan worden budgetten toegewezen aan Value Streams via Lean Budget Guardrails. Dit vermindert overhead, maakt snellere besluitvorming mogelijk en ondersteunt langdurige teams.',
        },
        {
          id: 'safe-q19',
          question: 'Welke SAFe-configuratie voegt het Solution Train-niveau toe boven het ART-niveau, bedoeld voor de bouw van zeer grote en complexe oplossingen?',
          options: [
            'Portfolio SAFe',
            'Full SAFe',
            'Large Solution SAFe',
            'Essential SAFe',
          ],
          correctAnswer: 2,
          explanation: 'Large Solution SAFe voegt het Large Solution-niveau toe aan Essential SAFe. Het introduceert de Solution Train (meerdere ARTs plus leveranciers), de Solution Train Engineer (STE), Solution Management en de Solution Architect/Engineer voor het bouwen van zeer complexe systemen zoals defensiesystemen of vliegtuigen.',
        },
      ],
    },
    {
      id: 'safe-l-assignment',
      title: 'Praktijkopdracht: PI Planning voor een ART van 75 personen',
      titleNL: 'Praktijkopdracht: PI Planning voor een ART van 75 personen',
      duration: '120:00',
      type: 'assignment',
      requires_admin_approval: true,
      assignment: {
        title: 'Plan een Program Increment voor een Agile Release Train van 75 personen verdeeld over 6 teams',
        description: `Jouw organisatie heeft een Agile Release Train (ART) samengesteld van 75 personen verdeeld over 6 Agile-teams. De eerste PI Planning staat over 3 weken gepland. Als Release Train Engineer (RTE) ben jij verantwoordelijk voor de voorbereiding en uitvoering.

Lever een compleet PI Planning-pakket in.`,
        deliverables: [
          'ART Roster: een overzicht van de 6 teams met per team minimaal 5 SAFe-rollen (Product Owner, Scrum Master, Developers, Architect, UX) en namen (fictief is toegestaan)',
          'PI Planning Agenda (2 dagen): tijdschema voor dag 1 en dag 2 met activiteiten, eigenaars, tijdboxen en locaties (digitaal/fysiek)',
          '5 PI Objectives met Business Value (BV): per team 1 PI Objective in het format "Wij leveren [wat] zodat [wie] [waarde] bereikt", met een BV-score 1-10 toegewezen door de Business Owner',
          'Inspect & Adapt-structuur: beschrijving van de I&A-sessie aan het einde van het PI — agenda, deelnemers, PI System Demo-format, en Problem-Solving Workshop-opzet',
        ],
        rubric: [
          { criterion: 'ART Roster alle 5 SAFe-rollen per team aanwezig en consistent', points: 20 },
          { criterion: 'PI Planning Agenda realistisch en tijdgebonden voor 2 dagen', points: 25 },
          { criterion: 'PI Objectives in correct format met BV-score en businessrelevantie', points: 25 },
          { criterion: 'I&A-structuur compleet: System Demo + Problem-Solving Workshop', points: 20 },
          { criterion: 'Juist gebruik van SAFe 6.0-terminologie', points: 10 },
        ],
        submission_format: 'markdown',
      },
    },
    {
      id: 'safe-l-exam',
      title: 'Final Exam — SAFe & Scaling Agile',
      titleNL: 'Eindexamen — SAFe & Agile Schalen',
      type: 'exam',
      duration: '45:00',
      videoUrl: '',
      transcript: `Dit is het eindexamen van de SAFe & Agile Schalen cursus.

**Examen Informatie:**
- 18 multiple choice vragen
- 45 minuten tijd
- 80% score nodig om te slagen (15 van 18 correct)
- Gesloten boek examen

**Onderwerpen:**
- SAFe kernwaarden en principes (Module 1 — 6 vragen)
- Agile Release Train: rollen, evenementen en cadans (Module 2 — 6 vragen)
- Lean Portfolio Management en Value Streams (Module 3 — 6 vragen)

**Tips:**
- Lees elke vraag volledig voordat je een antwoord kiest
- Let op SAFe 6.0-specifieke terminologie
- Bij twijfel: kies het antwoord dat het beste overeenkomt met de SAFe 6.0 documentatie

Succes!`,
      quiz: [
        {
          id: 'safe-exam-q1',
          question: 'Welke vier kernwaarden vormen samen de basis van SAFe 6.0?',
          options: [
            'Respect, Moed, Focus, Openheid',
            'Alignment, Built-In Quality, Transparency, Program Execution',
            'Lean Thinking, Agile Development, Systems Thinking, DevOps',
            'Strategie, Uitvoering, Meting, Verbetering',
          ],
          correctAnswer: 1,
          explanation: 'SAFe 6.0 is expliciet gebouwd op de vier kernwaarden Alignment, Built-In Quality, Transparency en Program Execution. Deze waarden sturen het gedrag van iedereen in de SAFe-organisatie en wijken bewust af van Scrum-waarden zoals Respect en Moed.',
        },
        {
          id: 'safe-exam-q2',
          question: 'Welk SAFe Lean-Agile Principe benadrukt het bewaren van ontwerpopties totdat de laatste verantwoordelijke keuze op basis van empirische data kan worden gemaakt?',
          options: [
            'Principe 2 – Pas systeemdenken toe',
            'Principe 3 – Neem variabiliteit aan; bewaar opties',
            'Principe 7 – Pas cadans toe; synchroniseer met cross-domein planning',
            'Principe 9 – Decentraliseer besluitvorming',
          ],
          correctAnswer: 1,
          explanation: 'SAFe Lean-Agile Principe 3 "Assume variability; preserve options" stelt dat je meerdere oplossingsalternatieven open moet houden totdat de beste keuze duidelijk wordt. Dit is gebaseerd op set-based design en reduceert het risico van vroegtijdige lock-in.',
        },
        {
          id: 'safe-exam-q3',
          question: 'Een organisatie met drie ARTs wil portfolio-governance toevoegen maar bouwt geen uitzonderlijk complexe systemen. Welke SAFe-configuratie past het best?',
          options: [
            'Essential SAFe',
            'Large Solution SAFe',
            'Portfolio SAFe',
            'Full SAFe',
          ],
          correctAnswer: 2,
          explanation: 'Portfolio SAFe breidt Essential SAFe uit met het Portfolio-niveau (LPM, Epics, Value Streams) zonder het Large Solution-niveau. Het is geschikt voor organisaties die meerdere ARTs willen aligneren op strategie en budget maar geen Solution Train nodig hebben.',
        },
        {
          id: 'safe-exam-q4',
          question: 'Wie heeft SAFe oorspronkelijk ontwikkeld en welke organisatie beheert het framework?',
          options: [
            'Ken Schwaber — Scrum.org',
            'Dean Leffingwell — Scaled Agile Inc.',
            'Mike Cohn — Mountain Goat Software',
            'Jeff Sutherland — Scrum Inc.',
          ],
          correctAnswer: 1,
          explanation: 'SAFe is ontwikkeld door Dean Leffingwell op basis van zijn werk rondom feature-driven development en agile requirements. Scaled Agile Inc. beheert, publiceert en update het framework. SAFe 6.0 is de meest recente major release.',
        },
        {
          id: 'safe-exam-q5',
          question: 'Wat is het fundament van het SAFe House of Lean?',
          options: [
            'Lean Portfolio Management — omdat budget de basis van iedere organisatie vormt',
            'Leiderschap (Leadership) — omdat Lean-Agile leiders het denken en gedrag modelleren dat de transformatie mogelijk maakt',
            'Team en Technical Agility — omdat teams de primaire waardecreators zijn',
            'Agile Product Delivery — omdat klantwaarde de kern van agility is',
          ],
          correctAnswer: 1,
          explanation: 'In het SAFe House of Lean vormt Leiderschap het fundament. Alle andere competenties en pilaren zijn afhankelijk van leiders die Lean-Agile denken en gedrag actief modelleren en ondersteunen. Zonder dit fundament is duurzame transformatie niet haalbaar.',
        },
        {
          id: 'safe-exam-q6',
          question: 'Welke SAFe-configuratie omvat ALLE vier niveaus: Team, Program, Large Solution EN Portfolio?',
          options: [
            'Essential SAFe',
            'Large Solution SAFe',
            'Portfolio SAFe',
            'Full SAFe',
          ],
          correctAnswer: 3,
          explanation: 'Full SAFe is de meest uitgebreide configuratie en omvat alle vier niveaus. Essential SAFe bevat alleen Team en Program. Large Solution voegt het Large Solution-niveau toe. Portfolio SAFe voegt het Portfolio-niveau toe aan Essential. Alleen Full SAFe combineert alle vier niveaus.',
        },
        {
          id: 'safe-exam-q7',
          question: 'Hoeveel teams telt een typische ART en wat is de bijbehorende bandbreedte in personen?',
          options: [
            '2 tot 5 teams, 10 tot 50 personen',
            '5 tot 12 teams, 50 tot 125 personen',
            '10 tot 20 teams, 100 tot 300 personen',
            '15 tot 30 teams, 150 tot 500 personen',
          ],
          correctAnswer: 1,
          explanation: 'SAFe 6.0 specificeert dat een ART bestaat uit 5 tot 12 Agile teams met in totaal 50 tot 125 personen inclusief ondersteunende rollen. Deze omvang is groot genoeg om een significante waardestroom te bedienen maar klein genoeg voor sociale cohesie.',
        },
        {
          id: 'safe-exam-q8',
          question: 'Wat is de standaard duur van een Program Increment en hoeveel iteraties bevat het?',
          options: [
            '4 tot 6 weken met 2 ontwikkeliteraties plus 1 IP-iteratie',
            '8 tot 12 weken met 4 ontwikkeliteraties plus 1 Innovatie & Planning-iteratie',
            '12 tot 16 weken met 6 iteraties van 2 weken',
            '6 weken met 3 iteraties van 2 weken',
          ],
          correctAnswer: 1,
          explanation: 'Een standaard PI duurt 8 tot 12 weken en bestaat uit 4 ontwikkeliteraties plus een IP-iteratie. De meest toegepaste cadans is 10 weken. De IP-iteratie biedt ruimte voor Inspect & Adapt, PI Planning voorbereiding en innovatiewerk.',
        },
        {
          id: 'safe-exam-q9',
          question: 'Welke rol heeft primaire verantwoordelijkheid voor het coachen van de ART en het wegnemen van obstakels op ART-niveau?',
          options: [
            'Product Manager',
            'System Architect',
            'Business Owner',
            'Release Train Engineer (RTE)',
          ],
          correctAnswer: 3,
          explanation: 'De Release Train Engineer (RTE) is de Scrum Master van de ART. De RTE faciliteert PI Planning, System Demo en Inspect & Adapt, coacht in Lean-Agile praktijken en ruimt impediments op die buiten het bereik van individuele teams vallen.',
        },
        {
          id: 'safe-exam-q10',
          question: 'Welk PI-afsluitend evenement bestaat uit een PI System Demo, kwantitatieve meting van PI-doelstellingen, en een probleemoplossings-workshop?',
          options: [
            'Sprint Review',
            'Scrum of Scrums',
            'Inspect & Adapt (I&A)',
            'Release on Demand',
          ],
          correctAnswer: 2,
          explanation: 'Inspect & Adapt (I&A) sluit elk PI af met drie onderdelen: (1) de PI System Demo, (2) een kwantitatieve meting van PI-scores versus gecommitteerde PI Objectives, en (3) een probleemoplossings-workshop met root-cause analyse en verbeteracties voor het volgende PI.',
        },
        {
          id: 'safe-exam-q11',
          question: 'Welk van de volgende uitkomsten is het MEEST directe doel van PI Planning?',
          options: [
            'Het opstellen van een gedetailleerd sprint-per-sprint plan voor alle teams voor het komende jaar',
            'Het afstemmen van alle ART-teams op een gemeenschappelijke visie, het identificeren van afhankelijkheden en het vaststellen van gecommitteerde PI Objectives',
            'Het toewijzen van individuele taken aan elke medewerker voor het komende kwartaal',
            'Het beoordelen van codekwaliteit uit het vorige PI',
          ],
          correctAnswer: 1,
          explanation: 'PI Planning brengt alle teams gedurende twee dagen bijeen. De primaire uitkomsten zijn: gedeeld begrip van de visie, gedraftte iteratieplannen per team, geïdentificeerde afhankelijkheden en risico\'s, en gecommitteerde PI Objectives per team en voor de ART als geheel.',
        },
        {
          id: 'safe-exam-q12',
          question: 'Wat is het onderscheid tussen een Operational Value Stream en een Development Value Stream?',
          options: [
            'Operational Value Streams zijn alleen voor productiebedrijven; Development Value Streams zijn voor IT-organisaties',
            'Operational Value Streams leveren waarde aan externe klanten via bedrijfsprocessen; Development Value Streams bouwen de systemen die die processen ondersteunen',
            'Beide termen zijn synoniemen in SAFe 6.0',
            'Development Value Streams zijn alleen actief tijdens PI Planning',
          ],
          correctAnswer: 1,
          explanation: 'Een Operational Value Stream levert waarde rechtstreeks aan klanten via aaneengeschakelde bedrijfsstappen. Een Development Value Stream omvat de stappen om de IT-systemen te bouwen die de OVS mogelijk maken. ARTs worden georganiseerd rondom Development Value Streams.',
        },
        {
          id: 'safe-exam-q13',
          question: 'Lean Portfolio Management (LPM) heeft drie primaire competenties. Welke combinatie is correct?',
          options: [
            'Strategieplanning, Projectbeheer en Kwaliteitsborging',
            'Portfoliostrategie & -visie, Agile portfolio-operations en Lean Governance',
            'PI Planning, System Demo en Inspect & Adapt',
            'Productontwikkeling, Resourcebeheer en Risicobeheer',
          ],
          correctAnswer: 1,
          explanation: 'De drie LPM-competenties in SAFe 6.0 zijn: (1) Portfoliostrategie & -visie, (2) Agile portfolio-operations en (3) Lean Governance via Lean Budget Guardrails. PI Planning, System Demo en I&A zijn ART-evenementen, geen LPM-competenties.',
        },
        {
          id: 'safe-exam-q14',
          question: 'Hoe wijst SAFe budgetten toe, in afwijking van traditioneel projectfinanciering?',
          options: [
            'Door elk team een vast jaarbudget te geven dat alleen herzienbaar is via een formele stuurgroepbeslissing',
            'Door budgetten toe te wijzen aan Value Streams via Lean Budget Guardrails die periodiek worden herijkt',
            'Door Epics te financieren op basis van story points die teams committeren in PI Planning',
            'Door een centrale PMO elk kwartaal individuele projecten te laten beoordelen en goedkeuren',
          ],
          correctAnswer: 1,
          explanation: 'SAFe financiert Value Streams via Lean Budget Guardrails. Dit elimineert de overhead van projectfinanciering, houdt langdurige teams stabiel en maakt snelle strategische herprioritering mogelijk zonder telkens een volledige businesscase door een stuurgroep te leiden.',
        },
        {
          id: 'safe-exam-q15',
          question: 'Welke van de volgende is GEEN dimensie van Built-In Quality in SAFe 6.0?',
          options: [
            'Code Quality (Codekwaliteit)',
            'System Quality (Systeemkwaliteit)',
            'Release Quality (Release-kwaliteit)',
            'Team Velocity (Teamsnelheid)',
          ],
          correctAnswer: 3,
          explanation: 'De vijf dimensies van Built-In Quality in SAFe 6.0 zijn: Flow, Architecture & Design Quality, Code Quality, System Quality en Release Quality. Team Velocity is een planningsinstrument maar is geen kwaliteitsdimensie. Kwaliteit wordt ingebakken in het bouwproces, niet achteraf toegevoegd.',
        },
        {
          id: 'safe-exam-q16',
          question: 'Wat is de primaire taak van de Epic Owner in het SAFe Portfolio Kanban-systeem?',
          options: [
            'De Epic Owner prioriteert de team-backlog tijdens Sprint Planning',
            'De Epic Owner begeleidt een portfolio-epic van definitie via een Lean Business Case tot voltooiing van de implementatie',
            'De Epic Owner is synoniem voor de Release Train Engineer',
            'De Epic Owner keurt alle Story-schattingen van het team goed',
          ],
          correctAnswer: 1,
          explanation: 'De Epic Owner leidt een Epic door het Portfolio Kanban: van identificatie en Lean Business Case tot LPM-goedkeuring, coördinatie van de implementatie door betrokken ARTs en afsluiting. De Epic Owner werkt nauw samen met Product Management en Enterprise Architects.',
        },
        {
          id: 'safe-exam-q17',
          question: 'Welke SAFe-configuratie voegt het Large Solution-niveau toe voor uitzonderlijk grote en complexe systemen?',
          options: [
            'Portfolio SAFe',
            'Full SAFe',
            'Large Solution SAFe',
            'Essential SAFe uitgebreid met een extra ART',
          ],
          correctAnswer: 2,
          explanation: 'Large Solution SAFe introduceert het Large Solution-niveau boven Essential SAFe met de Solution Train, de Solution Train Engineer (STE), Solution Management en Solution Architect/Engineer. Full SAFe voegt hieraan ook het Portfolio-niveau toe.',
        },
        {
          id: 'safe-exam-q18',
          question: 'Welk kenmerk onderscheidt SAFe het meest van LeSS (Large-Scale Scrum) bij de keuze voor een grote enterprise?',
          options: [
            'SAFe ondersteunt alleen software-ontwikkeling; LeSS is breder toepasbaar',
            'SAFe biedt meer prescriptieve guidance met gedefinieerde rollen, evenementen en artefacten op meerdere niveaus; LeSS is principieel lichter met minder voorgeschreven structuur',
            'LeSS vereist meer trainingen en certificeringen dan SAFe',
            'SAFe en LeSS zijn functioneel identiek — het enige verschil is de auteur',
          ],
          correctAnswer: 1,
          explanation: 'SAFe is bewust prescriptief: het definieert rollen (RTE, Product Manager, System Architect), evenementen (PI Planning, System Demo, I&A) en artefacten op meerdere niveaus. LeSS minimaliseert extra rollen en vertrouwt op organisch opgeschaalde Scrum-principes. Organisaties die meer guidance nodig hebben kiezen doorgaans voor SAFe.',
        },
      ],
    },
    {
      id: 'safe-l17',
      title: 'Certificate',
      titleNL: 'Certificaat',
      type: 'certificate',
      duration: '0:00',
      videoUrl: '',
    },
  ],
};

export const safeModules: Module[] = [module1, module2, module3];

export const safeCourse: Course = {
  id: 'safe-scaling-agile',
  title: 'SAFe & Scaling Agile',
  titleNL: 'SAFe & Agile Schalen',
  description: 'Learn the Scaled Agile Framework (SAFe) to implement Agile at enterprise scale with ARTs, PI Planning, and Value Streams.',
  descriptionNL: 'Leer het Scaled Agile Framework (SAFe) om Agile op enterprise-schaal te implementeren met ARTs, PI Planning en Value Streams.',
  icon: Rocket,
  color: BRAND.pink,
  gradient: `linear-gradient(135deg, ${BRAND.pink}, ${BRAND.pinkLight})`,
  category: 'agile',
  methodology: 'safe',
  levels: 4,
  modules: safeModules.reduce((total, m) => total + m.lessons.length, 0),
  duration: 28,
  rating: 4.6,
  students: 5678,
  tags: ['SAFe', 'Scaling', 'ART', 'PI Planning', 'Value Streams', 'DevOps'],
  tagsNL: ['SAFe', 'Schalen', 'ART', 'PI Planning', 'Waardestromen', 'DevOps'],
  instructor: instructors.martijn,
  featured: true,
  bestseller: false,
  new: true,
  freeForCustomers: true,
  certificate: true,
  whatYouLearn: [
    'Implement SAFe in your organization',
    'Run PI Planning events',
    'Manage Agile Release Trains',
    'Apply Lean Portfolio Management',
  ],
  whatYouLearnNL: [
    'SAFe implementeren in je organisatie',
    'PI Planning events uitvoeren',
    'Agile Release Trains managen',
    'Lean Portfolio Management toepassen',
  ],
  requirements: ['Agile/Scrum experience', 'Understanding of enterprise context'],
  requirementsNL: ['Agile/Scrum ervaring', 'Begrip van enterprise context'],
  targetAudience: [
    'Agile Coaches scaling beyond team level',
    'Release Train Engineers',
    'Enterprise leaders driving Agile transformation',
  ],
  targetAudienceNL: [
    'Agile Coaches die voorbij teamniveau schalen',
    'Release Train Engineers',
    'Enterprise leiders die Agile transformatie aansturen',
  ],
  courseModules: safeModules,
};

export default safeCourse;