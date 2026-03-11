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
      keyTakeaways: [],
      resources: [],
    },
    {
      id: 'safe-l3',
      title: 'SAFe Configurations',
      titleNL: 'SAFe Configuraties',
      type: 'video',
      duration: '14:00',
      videoUrl: '',
      keyTakeaways: [],
      resources: [],
    },
    {
      id: 'safe-l4',
      title: 'Core Values and Principles',
      titleNL: 'Kernwaarden en Principes',
      type: 'video',
      duration: '12:00',
      videoUrl: '',
      keyTakeaways: [],
      resources: [],
    },
    {
      id: 'safe-l5',
      title: 'Quiz: SAFe Basics',
      titleNL: 'Quiz: SAFe Basis',
      type: 'quiz',
      duration: '10:00',
      quiz: [],
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
      keyTakeaways: [],
      resources: [],
    },
    {
      id: 'safe-l7',
      title: 'PI Planning',
      titleNL: 'PI Planning',
      type: 'video',
      duration: '18:00',
      videoUrl: '',
      keyTakeaways: [],
      resources: [],
    },
    {
      id: 'safe-l8',
      title: 'System Demo',
      titleNL: 'System Demo',
      type: 'video',
      duration: '10:00',
      videoUrl: '',
      keyTakeaways: [],
      resources: [],
    },
    {
      id: 'safe-l9',
      title: 'Inspect & Adapt',
      titleNL: 'Inspect & Adapt',
      type: 'video',
      duration: '12:00',
      videoUrl: '',
      keyTakeaways: [],
      resources: [],
    },
    {
      id: 'safe-l10',
      title: 'Release on Demand',
      titleNL: 'Release on Demand',
      type: 'video',
      duration: '10:00',
      videoUrl: '',
      keyTakeaways: [],
      resources: [],
    },
    {
      id: 'safe-l11',
      title: 'Quiz: ART',
      titleNL: 'Quiz: ART',
      type: 'quiz',
      duration: '12:00',
      quiz: [],
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
      keyTakeaways: [],
      resources: [],
    },
    {
      id: 'safe-l13',
      title: 'Value Streams',
      titleNL: 'Value Streams',
      type: 'video',
      duration: '14:00',
      videoUrl: '',
      keyTakeaways: [],
      resources: [],
    },
    {
      id: 'safe-l14',
      title: 'Large Solution SAFe',
      titleNL: 'Large Solution SAFe',
      type: 'video',
      duration: '12:00',
      videoUrl: '',
      keyTakeaways: [],
      resources: [],
    },
    {
      id: 'safe-l15',
      title: 'Metrics and Measurement',
      titleNL: 'Metrics en Meting',
      type: 'video',
      duration: '10:00',
      videoUrl: '',
      keyTakeaways: [],
      resources: [],
    },
    {
      id: 'safe-l16',
      title: 'Quiz: Final',
      titleNL: 'Quiz: Eindexamen',
      type: 'quiz',
      duration: '15:00',
      quiz: [],
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