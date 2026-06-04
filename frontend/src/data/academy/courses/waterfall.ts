// ============================================
// COURSE: WATERFALL PROJECT MANAGEMENT
// ============================================
// Classical project management for predictable projects
// ============================================

import { Layers } from 'lucide-react';
import { Course, Module } from '../types';
import { BRAND } from '../brand';
import { instructors } from '../instructors';

// ============================================
// MODULE 1: WATERFALL FUNDAMENTALS
// ============================================
const module1: Module = {
  order: 0,
  id: 'wf-m1',
  title: 'Module 1: Waterfall Fundamentals',
  titleNL: 'Module 1: Waterfall Fundamenten',
  description: 'The foundation of Waterfall: phases, when to use, and trade-offs.',
  descriptionNL: 'De basis van Waterfall: oorsprong, principes en wanneer te gebruiken.',
  lessons: [
    {
      id: 'wf-l1',
      title: 'What is Waterfall?',
      titleNL: 'Wat is Waterfall?',
      duration: '15:00',
      type: 'video',
      videoUrl: '',
      transcript: `Welkom bij de Waterfall cursus! In deze eerste les leren we wat de 
Waterfall methodologie inhoudt en wanneer het de juiste keuze is.

**De Oorsprong van Waterfall**

De Waterfall methodologie vindt zijn oorsprong in de manufacturing en constructie-industrie 
waar je niet halverwege kunt veranderen - je kunt geen fundament aanpassen als het 
gebouw al staat.

Winston Royce beschreef het model in 1970 in zijn paper "Managing the Development of 
Large Software Systems". Ironisch genoeg waarschuwde hij ook voor de risico\'s - maar 
dat deel werd vaak genegeerd.

**Het Waterfall Model**

Waterfall is een sequentiële, lineaire aanpak:

Requirements → Design → Development → Testing → Deployment → Maintenance
     ↓           ↓          ↓           ↓          ↓           ↓
  [Gate]      [Gate]     [Gate]      [Gate]     [Gate]      [Gate]

Elke fase moet volledig worden afgerond voordat de volgende begint. 
De output van elke fase is input voor de volgende.

**De Waterfall Fasen**

**1. Requirements (Analyse)**
- Verzamel alle requirements
- Documenteer in detail
- Krijg formele goedkeuring
- Output: Requirements Specification

**2. Design (Ontwerp)**
- System design (architectuur)
- Detailed design (componenten)
- Output: Design Specification

**3. Development (Bouw)**
- Bouwen volgens specs
- Code of constructie
- Output: Werkend systeem/product

**4. Testing (Testen)**
- Verificatie tegen requirements
- Validatie met gebruikers
- Output: Testrapportages, bugfixes

**5. Deployment (Implementatie)**
- Uitrol naar productie
- Training gebruikers
- Output: Operationeel systeem

**6. Maintenance (Beheer)**
- Bug fixes
- Minor enhancements
- Ongoing support

**Wanneer Waterfall Gebruiken?**

Waterfall is ideaal wanneer:

✅ **Requirements zijn stabiel en bekend**
- Klant weet precies wat hij wil
- Geen grote veranderingen verwacht
- Gebaseerd op bewezen specs

✅ **Strikte compliance of regulering**
- Audit trails vereist
- Formele documentatie nodig
- Goedkeuringsprocessen verplicht

✅ **Lineaire afhankelijkheden**
- Fundament moet af voor de muren
- Database moet bestaan voor de applicatie

✅ **Vaste prijs contracten**
- Scope moet vooraf vast staan
- Budget is gelocked
- Wijzigingen zijn duur

✅ **Grote, gedistribueerde teams**
- Gedetailleerde specs als communicatie
- Minder behoefte aan dagelijkse interactie

**Wanneer NIET Waterfall?**

❌ **Onzekere of veranderende requirements**
- Innovatieve producten
- Snel veranderende markten
- Experimenten

❌ **Behoefte aan snelle feedback**
- Nieuwe concepten valideren
- Klant weet niet precies wat hij wil

❌ **Complexe, onvoorspelbare projecten**
- Veel onbekenden
- Nieuwe technologie

**Voordelen van Waterfall**

1. **Duidelijke structuur**: Iedereen weet waar we zijn
2. **Gedegen documentatie**: Alles is vastgelegd
3. **Voorspelbaar**: Planning en budget staan vast
4. **Easy to manage**: Duidelijke mijlpalen en gates
5. **Geschikt voor outsourcing**: Specs kunnen worden overgedragen

**Nadelen van Waterfall**

1. **Inflexibel**: Wijzigingen zijn duur en lastig
2. **Late feedback**: Werkend product pas aan het einde
3. **Risico**: Fouten vroeg gemaakt, laat ontdekt
4. **Documentatie overhead**: Veel tijd aan papierwerk
5. **Kloof klant-team**: Klant ziet pas laat resultaat

**Waterfall in de Praktijk**

Ondanks de opkomst van Agile wordt Waterfall nog steeds veel gebruikt:

- **Bouw en constructie**: Je kunt niet iteratief bouwen
- **Hardware ontwikkeling**: Fysieke producten zijn lastig te wijzigen
- **Enterprise IT**: SAP implementaties, ERP systemen
- **Overheid**: Compliance en aanbestedingen
- **Luchtvaart en defensie**: Strikte certificering
- **Medische apparatuur**: FDA/CE regelgeving

**Samenvatting**

Waterfall:
- Is een sequentiële, fase-gebaseerde aanpak
- Werkt het beste bij stabiele requirements en strikte compliance
- Biedt voorspelbaarheid en duidelijke structuur
- Is minder geschikt voor innovatieve of onzekere projecten
- Wordt nog steeds breed toegepast in specifieke industrieën`,
      keyTakeaways: [
        'Waterfall is sequential: each phase must be completed before the next one starts',
        'Ideal for stable requirements and compliance-intensive projects',
        'Offers predictability but is inflexible for changes',
        'Still relevant in construction, hardware, enterprise IT, and regulated industries',
      ],
      keyTakeawaysNL: [
        'Waterfall is sequentieel: elke fase moet af voor de volgende start',
        'Ideaal voor stabiele requirements en compliance-intensieve projecten',
        'Biedt voorspelbaarheid maar is inflexibel voor wijzigingen',
        'Nog steeds relevant in bouw, hardware, enterprise IT en gereguleerde sectoren',
      ],
      keyTakeawaysEN: [
        'Waterfall is sequential: each phase must be completed before the next one begins',
        'Ideal for stable requirements and compliance-intensive projects',
        'Offers predictability but is inflexible when it comes to changes',
        'Still relevant in construction, hardware, enterprise IT, and regulated sectors',
      ],
      resources: [
        {
          name: 'Waterfall vs Agile Comparison',
          type: 'PDF',
          size: '1.2 MB',
          description: 'Gedetailleerde vergelijking van beide aanpakken',
        },
      ],
    },
    {
      id: 'wf-l2',
      title: 'Requirements Phase',
      titleNL: 'Requirements Fase',
      duration: '22:00',
      type: 'video',
      videoUrl: '',
      transcript: `De Requirements fase is de fundering van elk Waterfall project. 
Fouten hier planten zich voort door het hele project - en worden steeds duurder om te fixen.

**Het Belang van Goede Requirements**

Statistieken tonen aan:
- 60% van projectfouten ontstaan in requirements
- Fixing een requirement fout in productie kost 100x meer dan in requirements fase
- Onduidelijke requirements zijn de #1 oorzaak van projectfalen

Investeer dus tijd in deze fase!

**Types Requirements**

**Functionele Requirements**
Wat het systeem moet DOEN:
- "Het systeem moet orders kunnen registreren"
- "Gebruikers moeten kunnen inloggen met 2FA"
- "Rapporten moeten exporteerbaar zijn naar Excel"

**Non-Functionele Requirements (Quality Attributes)**
Hoe het systeem moet PRESTEREN:
- Performance: "Pagina's laden binnen 2 seconden"
- Security: "Alle data is encrypted met AES-256"
- Availability: "99.9% uptime"
- Scalability: "Ondersteunt 10.000 concurrent users"

**Constraints**
Beperkingen waarbinnen we moeten werken:
- "Moet draaien op bestaande Oracle database"
- "Budget maximaal €500.000"
- "Live voor 1 januari 2025"

**Requirements Gathering Technieken**

**1. Interviews**
Een-op-een gesprekken met stakeholders.

Tips:
- Bereid vragen voor
- Vraag naar het "waarom" achter wensen
- Documenteer direct
- Bevestig begrip

**2. Workshops**
Groepssessies met meerdere stakeholders.

Voordelen:
- Verschillende perspectieven samen
- Conflicten direct boven tafel
- Sneller dan individuele interviews

**3. Document Analyse**
Bestaande documentatie bestuderen:
- Huidige systeemspecificaties
- Procesbeschrijvingen
- Wet- en regelgeving
- Concurrentieanalyse

**4. Observation**
Gebruikers observeren in hun werk.

Mensen doen vaak anders dan ze zeggen. Observatie onthult de werkelijke workflow.

**5. Prototyping**
Vroege mockups maken om requirements te valideren.

"Ah, zo bedoel je het!" - Prototypes voorkomen misverstanden.

**De Requirements Specification**

Het hoofddocument van deze fase. Structuur:

1. **Inleiding**
   - Doel van het document
   - Scope
   - Definities en afkortingen

2. **Overall Description**
   - Productperspectief
   - Gebruikerskarakteristieken
   - Aannames en afhankelijkheden

3. **Functionele Requirements**
   - Per feature/module gegroepeerd
   - Gedetailleerde beschrijvingen

4. **Non-Functionele Requirements**
   - Performance
   - Security
   - Reliability
   - etc.

5. **Constraints**

6. **Appendices**
   - Use cases
   - UI mockups
   - Data dictionary

**Goede Requirements Schrijven**

Gebruik het SMART principe:
- **S**pecific: Duidelijk en ondubbelzinnig
- **M**easurable: Toetsbaar of het werkt
- **A**chievable: Technisch haalbaar
- **R**elevant: Draagt bij aan projectdoelen
- **T**raceable: Te herleiden naar business need

Voorbeeld:

Slecht: "Het systeem moet snel zijn"
Goed: "Het systeem moet zoekresultaten tonen binnen 500ms voor 95% van de queries 
bij een load van 100 concurrent users"

**Requirements Traceability**

Houd bij waar elke requirement vandaan komt en waar hij naartoe gaat:

Business Need → Requirement → Design → Code → Test Case

Dit heet een Traceability Matrix. Het helpt bij:
- Impact analysis bij wijzigingen
- Verificatie dat alles is gebouwd
- Validatie dat alles is getest

**Requirements Review en Sign-off**

Voordat je door mag naar Design:
- Formele review met stakeholders
- Controle op compleetheid en consistentie
- Bevestiging van prioriteiten
- Formele sign-off (handtekeningen!)

Deze sign-off is cruciaal - het is de baseline waartegen je bouwt.

**Change Control vanaf hier**

Na sign-off is elke wijziging een "change request":
1. Wijziging documenteren
2. Impact analyseren (tijd, kosten, risico)
3. Goedkeuring door change board
4. Baseline updaten
5. Plan aanpassen

**Samenvatting**

De Requirements fase:
- Is de fundering - fouten hier zijn duur
- Gebruikt diverse technieken om requirements te verzamelen
- Documenteert in een formele Requirements Specification
- Eindigt met formele review en sign-off
- Activeert change control voor alle toekomstige wijzigingen`,
      keyTakeaways: [
        'Requirements errors are the most expensive to fix',
        'Use multiple techniques: interviews, workshops, observation',
        'Good requirements are SMART and testable',
        'Formal sign-off activates change control',
      ],
      keyTakeawaysNL: [
        'Requirements fouten zijn de duurste om te fixen',
        'Gebruik meerdere technieken: interviews, workshops, observatie',
        'Goede requirements zijn SMART en toetsbaar',
        'Formele sign-off activeert change control',
      ],
      keyTakeawaysEN: [
        'Requirements errors are the most expensive to fix',
        'Use multiple techniques: interviews, workshops, observation',
        'Good requirements are SMART and testable',
        'Formal sign-off activates change control',
      ],
      resources: [
        {
          name: 'Requirements Specification Template',
          type: 'DOCX',
          size: '245 KB',
          description: 'Uitgebreid template voor requirements documentatie',
        },
        {
          name: 'Traceability Matrix Template',
          type: 'XLSX',
          size: '125 KB',
          description: 'Template voor requirements traceability',
        },
      ],
    },
    {
      id: 'wf-l3',
      title: 'Design Phase',
      titleNL: 'Design Fase',
      duration: '20:00',
      type: 'video',
      videoUrl: '',
      transcript: `In de Design fase vertaal je requirements naar een technisch ontwerp. 
Dit is de blauwdruk voor wat gebouwd gaat worden.

**Van Requirements naar Design**

Requirements zeggen WAT, Design zegt HOE:
- Requirement: "Gebruikers moeten kunnen inloggen"
- Design: OAuth 2.0 met Azure AD, JWT tokens, 15 min session timeout

**Niveaus van Design**

**High-Level Design (System Design)**
- Systeemarchitectuur
- Hoofdcomponenten en hun interacties
- Technologiekeuzes
- Data flow
- Integraties

Dit is het "big picture" - begrijpelijk voor alle stakeholders.

**Low-Level Design (Detailed Design)**
- Specifieke componenten en modules
- Database schema's
- API specificaties
- Algoritmes
- UI designs

Dit is het detail - input voor developers.

**Design Documenten**

**1. System Architecture Document**
- Overzichtsdiagrammen
- Component beschrijvingen
- Deployment architectuur
- Technology stack

**2. Database Design**
- Entity Relationship Diagrams (ERD)
- Table definitions
- Indexing strategy
- Data dictionary

**3. Interface Specifications**
- API contracts
- Message formats
- Protocol keuzes
- Error handling

**4. UI/UX Design**
- Wireframes
- Screen flows
- Style guide
- Responsive design specs

**Design Principes**

Goede designs volgen principes:

**Modularity**: Opdelen in onafhankelijke modules
**Cohesion**: Gerelateerde functionaliteit bij elkaar
**Coupling**: Minimale afhankelijkheden tussen modules
**Abstraction**: Complexiteit verbergen achter interfaces
**Reusability**: Componenten hergebruiken

**Design Reviews**

Formele reviews zijn cruciaal:
- Peer reviews door andere designers/architecten
- Technical reviews met development team
- Stakeholder review voor business alignment

Checkpunten:
- Alle requirements gedekt?
- Technisch haalbaar?
- Performance acceptabel?
- Security adequate?
- Maintainable en testbaar?

**De Design Gate**

Voordat development mag starten:
- Design documenten compleet
- Reviews uitgevoerd en issues opgelost
- Technical feasibility bevestigd
- Resources beschikbaar
- Formele goedkeuring

**Common Design Fouten**

- **Over-engineering**: Te complex voor de requirements
- **Under-engineering**: Geen rekening met toekomstige groei
- **Technology chasing**: Nieuwste tech zonder goede reden
- **Ignoring NFRs**: Focus alleen op functionaliteit
- **No design at all**: Direct beginnen met bouwen

**Samenvatting**

De Design fase:
- Vertaalt requirements naar technische specificaties
- Werkt van high-level architectuur naar detailed design
- Produceert documenten die developers kunnen implementeren
- Eindigt met formele review en goedkeuring`,
      keyTakeaways: [
        'Design translates WHAT (requirements) into HOW (technical)',
        'High-level design for the big picture, low-level for detail',
        'Design reviews prevent costly errors in development',
        'Avoid both over-engineering and under-engineering',
      ],
      keyTakeawaysNL: [
        'Design vertaalt WAT (requirements) naar HOE (technisch)',
        'High-level design voor het big picture, low-level voor detail',
        'Design reviews voorkomen dure fouten in development',
        'Vermijd over-engineering én under-engineering',
      ],
      keyTakeawaysEN: [
        'Design translates WHAT (requirements) into HOW (technical)',
        'High-level design for the big picture, low-level for detail',
        'Design reviews prevent costly errors in development',
        'Avoid both over-engineering and under-engineering',
      ],
      resources: [
        {
          name: 'System Design Template',
          type: 'DOCX',
          size: '320 KB',
          description: 'Template voor system architecture documentatie',
        },
      ],
    },
    {
      id: 'wf-l4',
      title: 'Development, Testing & Deployment',
      titleNL: 'Development, Testing & Deployment',
      duration: '25:00',
      type: 'video',
      videoUrl: '',
      transcript: `In deze les behandelen we de uitvoerende fasen van Waterfall: 
Development, Testing en Deployment.

**Development Fase**

In de Development fase wordt het ontwerp gerealiseerd.

**Input:**
- Approved design documents
- Coding standards
- Development environment

**Activiteiten:**
- Code schrijven volgens specs
- Unit testing door developers
- Code reviews
- Integratie van componenten
- Technische documentatie

**Best Practices:**
- Volg de design specs nauwgezet
- Documenteer afwijkingen en waarom
- Regelmatige code reviews
- Continue integratie (CI) waar mogelijk
- Version control voor alles

**Output:**
- Werkende code/product
- Unit test results
- Technical documentation
- Updated design docs (as-built)

**De Development Gate:**
- Code complete
- Unit tests passed
- Code reviews done
- Ready for formal testing

**Testing Fase**

Testing verifieert dat wat gebouwd is voldoet aan de requirements.

**Test Levels:**

**1. Unit Testing** (tijdens development)
- Test individuele componenten
- Door developers
- Geautomatiseerd

**2. Integration Testing**
- Test interactie tussen componenten
- Interfaces en data flow
- Door test team

**3. System Testing**
- Test het complete systeem
- Functionele en non-functionele tests
- Door test team

**4. User Acceptance Testing (UAT)**
- Test door eindgebruikers
- Validatie tegen business requirements
- Go/no-go voor productie

**Test Documentation:**

- **Test Plan**: Strategie, scope, resources, schedule
- **Test Cases**: Specifieke tests met expected results
- **Test Scripts**: Geautomatiseerde test procedures
- **Traceability Matrix**: Requirement → Test case mapping
- **Test Reports**: Resultaten en defect summary

**Defect Management:**

1. Log defect met details en steps to reproduce
2. Prioritize (Critical, High, Medium, Low)
3. Assign to developer
4. Fix and retest
5. Close or reopen

**Exit Criteria voor Testing:**
- Alle test cases executed
- Critical/High defects fixed
- Agreed defect threshold met
- UAT sign-off obtained

**Deployment Fase**

Deployment brengt het systeem naar productie.

**Deployment Planning:**
- Deployment procedure (step-by-step)
- Rollback procedure (if it fails)
- Go-live checklist
- Communication plan
- Support plan for first days

**Deployment Approaches:**

**Big Bang:**
- Alles in één keer live
- Risicovol maar simpel
- Geschikt voor kleinere systemen

**Phased:**
- Module voor module
- Minder risico
- Langere doorlooptijd

**Parallel:**
- Oud en nieuw naast elkaar
- Laag risico
- Hoge kosten (twee systemen)

**Pilot:**
- Eerst kleine groep users
- Validatie voor brede uitrol
- Geschikt voor grote user base

**Go-Live Activiteiten:**
1. Final data migration
2. System cutover
3. Smoke testing in production
4. User communication
5. Hypercare support
6. Monitor performance

**Post-Go-Live:**
- Defect tracking
- Performance monitoring
- User support
- Lessons learned

**Maintenance Fase**

Na go-live begint maintenance:

**Types Maintenance:**
- **Corrective**: Bug fixes
- **Adaptive**: Aanpassen aan omgeving
- **Perfective**: Verbeteringen
- **Preventive**: Voorkomen van problemen

**Handover:**
- Overdracht aan operations/support team
- Documentatie compleet
- Training support medewerkers
- Escalatieprocedures

**Samenvatting**

De uitvoerende fasen:
- **Development**: Bouwen volgens specs, met quality gates
- **Testing**: Verificatie op alle niveaus, van unit tot UAT
- **Deployment**: Zorgvuldige uitrol met rollback plan
- **Maintenance**: Ongoing support en doorontwikkeling`,
      keyTakeaways: [
        'Development follows the design specs meticulously',
        'Testing occurs at multiple levels with formal UAT sign-off',
        'Deployment requires planning, procedures, and a rollback plan',
        'Maintenance includes corrective, adaptive, perfective, and preventive',
      ],
      keyTakeawaysNL: [
        'Development volgt de design specs nauwgezet',
        'Testing gebeurt op meerdere niveaus met formele UAT sign-off',
        'Deployment vereist planning, procedures en rollback plan',
        'Maintenance omvat corrective, adaptive, perfective en preventive',
      ],
      keyTakeawaysEN: [
        'Development follows the design specs meticulously',
        'Testing occurs at multiple levels with formal UAT sign-off',
        'Deployment requires planning, procedures, and a rollback plan',
        'Maintenance encompasses corrective, adaptive, perfective, and preventive',
      ],
      resources: [
        {
          name: 'Test Plan Template',
          type: 'DOCX',
          size: '280 KB',
          description: 'Uitgebreid test plan template',
        },
        {
          name: 'Deployment Checklist',
          type: 'XLSX',
          size: '145 KB',
          description: 'Checklist voor go-live activiteiten',
        },
      ],
    },
    {
      id: 'wf-l5',
      title: 'Quiz: Waterfall Fundamentals',
      titleNL: 'Quiz: Waterfall Fundamenten',
      duration: '15:00',
      type: 'quiz',
      quiz: [
        {
          id: 'wf-q1',
          question: 'Winston Royce beschreef het Waterfall model in 1970. Wat was ironisch aan zijn paper?',
          options: [
            'Hij pleitte juist voor Agile werken',
            'Hij waarschuwde zelf ook voor de risico\'s van het model',
            'Hij beweerde dat requirements nooit veranderen',
            'Hij verbood het gebruik van gates tussen fasen'
          ],
          correctAnswer: 1,
          explanation: 'Royce beschreef het sequentiële model maar waarschuwde ook voor de risico\'s ervan. Dat deel van zijn paper werd door velen genegeerd.',
        },
        {
          id: 'wf-q2',
          question: 'Wat is de juiste volgorde van de zes Waterfall fasen?',
          options: [
            'Design → Requirements → Development → Testing → Deployment → Maintenance',
            'Requirements → Design → Development → Testing → Deployment → Maintenance',
            'Requirements → Development → Design → Testing → Deployment → Maintenance',
            'Design → Development → Requirements → Deployment → Testing → Maintenance'
          ],
          correctAnswer: 1,
          explanation: 'De canonieke volgorde is: Requirements → Design → Development → Testing → Deployment → Maintenance. Elke fase levert output die input is voor de volgende.',
        },
        {
          id: 'wf-q3',
          question: 'Statistieken uit de Requirements les tonen dat het fixen van een requirements fout in productie hoeveel keer duurder is dan in de requirements fase?',
          options: [
            '10x duurder',
            '25x duurder',
            '100x duurder',
            '50x duurder'
          ],
          correctAnswer: 2,
          explanation: 'Een requirements fout die pas in productie wordt ontdekt kost tot 100x meer om te fixen dan wanneer hij in de requirements fase was gecorrigeerd.',
        },
        {
          id: 'wf-q4',
          question: 'Welk principe beschrijft goede requirements als Specific, Measurable, Achievable, Relevant en Traceable?',
          options: [
            'MoSCoW prioritering',
            'SMART principe',
            'IEEE 830 standaard',
            'INVEST criteria'
          ],
          correctAnswer: 1,
          explanation: 'Het SMART principe wordt in de Requirements les gebruikt om goede requirements te schrijven: Specific, Measurable, Achievable, Relevant en Traceable.',
        },
        {
          id: 'wf-q5',
          question: 'Wat documenteert een Traceability Matrix precies?',
          options: [
            'De communicatiestructuur tussen stakeholders',
            'De afhankelijkheden op het kritieke pad',
            'De koppeling van elke requirement naar design, code en testcases',
            'De risico\'s per projectfase'
          ],
          correctAnswer: 2,
          explanation: 'Een Traceability Matrix houdt bij waar elke requirement vandaan komt en waar hij naartoe gaat: Business Need → Requirement → Design → Code → Test Case. Dit helpt bij impact analysis en verificatie.',
        },
        {
          id: 'wf-q6',
          question: 'In de Design fase spreek je over High-Level Design en Low-Level Design. Wat is het verschil?',
          options: [
            'High-level is voor developers, low-level voor managers',
            'High-level beschrijft systeemarchitectuur en technologiekeuzes; low-level beschrijft componenten, database schema\'s en API specificaties',
            'High-level wordt pas na development gemaakt; low-level is de blauwdruk vooraf',
            'Er is geen functioneel verschil; het zijn synoniemen'
          ],
          correctAnswer: 1,
          explanation: 'High-Level Design (System Design) geeft het "big picture": architectuur, hoofdcomponenten en technologiekeuzes. Low-Level Design (Detailed Design) geeft het detail voor developers: database schema\'s, API specs en algoritmes.',
        },
        {
          id: 'wf-q7',
          question: 'Welk type testing wordt uitgevoerd door eindgebruikers om te valideren dat het systeem voldoet aan de business requirements?',
          options: [
            'Integration Testing',
            'System Testing',
            'Regression Testing',
            'User Acceptance Testing (UAT)'
          ],
          correctAnswer: 3,
          explanation: 'UAT (User Acceptance Testing) wordt uitgevoerd door eindgebruikers en is de formele go/no-go validatie voordat het systeem naar productie gaat.',
        },
      ],
    },
  ],
};

// ============================================
// MODULE 2: WATERFALL IN PRACTICE
// ============================================
const module2: Module = {
  order: 1,
  id: 'wf-m2',
  title: 'Module 2: Waterfall in Practice',
  titleNL: 'Module 2: Waterfall in de Praktijk',
  description: 'Practical application of Waterfall: gate reviews, change control, and hybrid approaches.',
  descriptionNL: 'Praktische toepassing van Waterfall: gate reviews, change control en hybride aanpakken.',
  lessons: [
    {
      id: 'wf-l6',
      title: 'Gate Reviews and Quality Gates',
      titleNL: 'Gate Reviews en Quality Gates',
      duration: '18:00',
      type: 'video',
      videoUrl: '',
      transcript: `Gate Reviews zijn formele beslismomenten tussen Waterfall fasen. 
Ze zorgen voor kwaliteitsborging en go/no-go beslissingen.

**Wat is een Gate Review?**

Een Gate Review is:
- Een formeel checkpoint tussen fasen
- Een beslismoment: doorgaan, bijsturen of stoppen
- Een kwaliteitscontrole
- Een moment voor stakeholder alignment

**Typische Gates in Waterfall**

**Gate 0: Project Approval**
- Business case goedgekeurd
- Budget toegewezen
- Sponsor committed

**Gate 1: Requirements Complete**
- Requirements Specification compleet
- Stakeholder sign-off
- Ready for Design

**Gate 2: Design Complete**
- Design documenten compleet
- Technical review passed
- Ready for Development

**Gate 3: Development Complete**
- Code complete
- Unit tests passed
- Ready for Testing

**Gate 4: Test Complete**
- All tests executed
- UAT sign-off
- Ready for Deployment

**Gate 5: Go-Live Approval**
- Deployment plan approved
- Rollback procedure ready
- Support team ready

**Gate Review Structuur**

Elke gate review bevat:

1. **Entrance Criteria Check**
   - Zijn alle prerequisites voldaan?
   - Is de documentatie compleet?

2. **Deliverables Review**
   - Review van opgeleverde producten
   - Quality check

3. **Risk Assessment**
   - Nieuwe risico\'s geïdentificeerd?
   - Mitigatie acties gedefinieerd?

4. **Issues en Concerns**
   - Open issues besproken
   - Actions assigned

5. **Go/No-Go Decision**
   - Go: Doorgaan naar volgende fase
   - Conditional Go: Doorgaan met voorwaarden
   - No-Go: Terug naar huidige fase

**Gate Review Rollen**

- **Gate Owner**: Beslist over go/no-go (vaak sponsor of steering committee)
- **Presenter**: Presenteert status en deliverables (PM)
- **Reviewers**: Evalueren de kwaliteit (SMEs, architects)
- **Stakeholders**: Geven input vanuit hun perspectief

**Quality Gates vs. Gate Reviews**

Quality Gates zijn meer technisch gefocust:
- Code quality metrics
- Test coverage thresholds
- Security scan results
- Performance benchmarks

Gate Reviews zijn breder:
- Business alignment
- Resource availability
- Risk acceptance
- Stakeholder approval

**Best Practices**

1. **Definieer criteria vooraf**
   - Entrance criteria helder
   - Exit criteria meetbaar
   - Geen verrassingen

2. **Wees objectief**
   - Data-driven beslissingen
   - Geen politieke games
   - Issues eerlijk bespreken

3. **Documenteer beslissingen**
   - Gate review minutes
   - Action items met owners
   - Beslissing en rationale

4. **Escaleer tijdig**
   - Issues niet verzwijgen
   - Hulp vragen waar nodig
   - Management informeren

**Samenvatting**

Gate Reviews:
- Zijn formele beslismomenten tussen fasen
- Zorgen voor kwaliteitsborging en alignment
- Vereisen duidelijke criteria en objectieve evaluatie
- Resulteren in go/no-go beslissingen`,
      keyTakeaways: [
        'Gate Reviews are formal checkpoints between phases',
        'Each gate has entrance and exit criteria',
        'Go/No-Go/Conditional Go are the possible outcomes',
        'Quality Gates focus on technical metrics',
      ],
      keyTakeawaysNL: [
        'Gate Reviews zijn formele checkpoints tussen fasen',
        'Elke gate heeft entrance en exit criteria',
        'Go/No-Go/Conditional Go zijn de mogelijke uitkomsten',
        'Quality Gates focussen op technische metrics',
      ],
      keyTakeawaysEN: [
        'Gate Reviews are formal checkpoints between phases',
        'Each gate has entrance and exit criteria',
        'Go/No-Go/Conditional Go are the possible outcomes',
        'Quality Gates focus on technical metrics',
      ],
    },
    {
      id: 'wf-l7',
      title: 'Change Control in Waterfall',
      titleNL: 'Change Control in Waterfall',
      duration: '16:00',
      type: 'video',
      videoUrl: '',
      transcript: `In Waterfall is Change Control essentieel. Wijzigingen na sign-off 
hebben grote impact op tijd, kosten en risico.

**Waarom Change Control?**

Na requirements sign-off is de baseline vastgesteld. Elke wijziging:
- Verstoort de planning
- Kost extra resources
- Introduceert risico\'s
- Kan cascade-effecten hebben

Change Control zorgt dat wijzigingen bewust worden gemaakt.

**Het Change Control Proces**

**1. Change Request Indienen**
Iedereen kan een wijziging aanvragen:
- Wat is de gewenste wijziging?
- Waarom is het nodig?
- Wie vraagt het aan?

**2. Impact Assessment**
De PM analyseert de impact:
- Impact op scope
- Impact op planning
- Impact op budget
- Impact op risico\'s
- Impact op kwaliteit
- Impact op andere requirements

**3. Change Control Board (CCB) Review**
De CCB beoordeelt de aanvraag:
- Is de wijziging noodzakelijk?
- Zijn de kosten acceptabel?
- Zijn de risico\'s aanvaardbaar?

**4. Beslissing**
Mogelijke uitkomsten:
- Approved: Wijziging wordt doorgevoerd
- Rejected: Wijziging wordt niet doorgevoerd
- Deferred: Uitgesteld naar latere fase/release
- More info needed: Aanvullende analyse nodig

**5. Implementatie**
Bij goedkeuring:
- Baseline documenten updaten
- Planning aanpassen
- Team informeren
- Wijziging doorvoeren

**6. Verificatie**
Na implementatie:
- Is de wijziging correct doorgevoerd?
- Zijn alle documenten bijgewerkt?
- Zijn alle betrokkenen geïnformeerd?

**Het Change Control Board**

De CCB is de autoriteit voor wijzigingen:
- PM (voorzitter)
- Sponsor of business representative
- Technical lead
- Test lead
- Andere key stakeholders

**Decision criteria:**
- Business priority
- Technical feasibility
- Cost vs. benefit
- Risk level
- Schedule impact

**Change Categories**

**Minor Changes:**
- Weinig impact
- Binnen toleranties
- PM kan beslissen

**Major Changes:**
- Significante impact
- Buiten toleranties
- CCB moet beslissen

**Critical Changes:**
- Fundamentele impact
- Sponsor/Steering Committee moet beslissen

**Best Practices**

1. **Start change control na requirements sign-off**
2. **Alle wijzigingen door het proces**
3. **Document alles**
4. **Communiceer beslissingen breed**
5. **Maintain traceability**

**Samenvatting**

Change Control:
- Is essentieel in Waterfall na baseline sign-off
- Volgt een gestructureerd proces
- Wordt beslist door het Change Control Board
- Zorgt dat wijzigingen bewust en gecontroleerd worden doorgevoerd`,
      keyTakeaways: [
        'Change Control starts after requirements sign-off',
        'Every change goes through a formal process',
        'The CCB decides on significant changes',
        'Documentation and traceability are crucial',
      ],
      keyTakeawaysNL: [
        'Change Control start na requirements sign-off',
        'Elke wijziging doorloopt een formeel proces',
        'De CCB beslist over significante wijzigingen',
        'Documentatie en traceability zijn cruciaal',
      ],
      keyTakeawaysEN: [
        'Change Control starts after requirements sign-off',
        'Every change goes through a formal process',
        'The CCB decides on significant changes',
        'Documentation and traceability are crucial',
      ],
    },
    {
      id: 'wf-l8',
      title: 'Combining Waterfall and Agile',
      titleNL: 'Waterfall en Agile Combineren',
      duration: '18:00',
      type: 'video',
      videoUrl: '',
      transcript: `In de praktijk zijn zuivere Waterfall of Agile projecten zeldzaam. 
Veel organisaties combineren elementen van beide - dit heet een hybride aanpak.

**Waarom Hybride?**

- Waterfall biedt structuur en voorspelbaarheid
- Agile biedt flexibiliteit en snelle feedback
- Verschillende projectfasen hebben verschillende behoeften
- Organisatie is in transitie naar Agile

**Hybride Aanpakken**

**1. Water-Scrum-Fall**

Waterfall: Requirements en Design
Agile: Development (in Sprints)
Waterfall: Testing en Deployment

Voordelen:
- Gedegen requirements en design vooraf
- Flexibiliteit in development
- Structured testing en release

**2. Agile binnen Gates**

Waterfall gates blijven bestaan
Binnen elke fase: Agile sprints
Gate reviews op key milestones

Voordelen:
- Governance blijft intact
- Iteratief werken binnen fasen
- Stakeholders krijgen regelmatig zicht

**3. Incremental Waterfall**

Meerdere Waterfall cycli achter elkaar
Elke cyclus levert werkende software
Feedback wordt meegenomen in volgende cyclus

Voordelen:
- Snellere time-to-market voor delen
- Feedback loops
- Minder risico

**Praktische Tips**

**Voor Requirements:**
- User Stories kunnen naast formele specs bestaan
- Refinement voor detail, specs voor overzicht
- Acceptatiecriteria = testbaar

**Voor Design:**
- High-level design vooraf
- Detailed design iteratief
- Architecture decision records

**Voor Testing:**
- Test early, test often (continuous testing)
- Automated testing waar mogelijk
- UAT blijft formeel

**Wanneer Welke Aanpak?**

**Meer Waterfall wanneer:**
- Strikte compliance eisen
- Vaste scope en budget
- Externe leveranciers
- Gedistribueerde teams

**Meer Agile wanneer:**
- Veranderende requirements
- Innovatie en experimenten
- Co-located teams
- Frequente releases gewenst

**Samenvatting**

Hybride aanpakken:
- Combineren het beste van beide werelden
- Zijn in de praktijk zeer gebruikelijk
- Vereisen bewuste keuzes per fase/context
- Moeten consistent worden toegepast`,
      keyTakeaways: [
        'Pure Waterfall or Agile is rare - hybrid is the norm',
        'Water-Scrum-Fall combines Waterfall for planning and Agile for development',
        'Governance (gates) can be maintained with Agile elements within',
        'Consciously choose what works best per phase/context',
      ],
      keyTakeawaysNL: [
        'Zuivere Waterfall of Agile is zeldzaam - hybride is de norm',
        'Water-Scrum-Fall combineert Waterfall voor planning en Agile voor development',
        'Governance (gates) kan behouden blijven met Agile elementen erin',
        'Kies bewust per fase/context wat het beste werkt',
      ],
      keyTakeawaysEN: [
        'Pure Waterfall or Agile is rare - hybrid is the norm',
        'Water-Scrum-Fall combines Waterfall for planning and Agile for development',
        'Governance (gates) can be maintained with Agile elements within them',
        'Deliberately choose what works best for each phase/context',
      ],
    },
    {
      id: 'wf-l9-quiz',
      title: 'Quiz: Waterfall in Practice',
      titleNL: 'Quiz: Waterfall in de Praktijk',
      duration: '15:00',
      type: 'quiz',
      quiz: [
        {
          id: 'wf-q8',
          question: 'Welke uitkomsten zijn mogelijk bij een Gate Review?',
          options: [
            'Alleen Go of No-Go',
            'Go, No-Go of Conditional Go',
            'Goedkeuren, Uitstellen of Escaleren',
            'Doorsturen naar CCB of doorsturen naar sponsor'
          ],
          correctAnswer: 1,
          explanation: 'Een Gate Review heeft drie mogelijke uitkomsten: Go (doorgaan naar volgende fase), Conditional Go (doorgaan met voorwaarden) en No-Go (terug naar huidige fase).',
        },
        {
          id: 'wf-q9',
          question: 'Wat controleert de "Entrance Criteria Check" aan het begin van een Gate Review?',
          options: [
            'Of het budget nog toereikend is voor de volgende fase',
            'Of alle prerequisites zijn voldaan en de documentatie compleet is',
            'Of de sponsor aanwezig is bij de review',
            'Of de planning nog klopt met de originele baseline'
          ],
          correctAnswer: 1,
          explanation: 'De Entrance Criteria Check verifieert of alle prerequisites voldaan zijn en of de documentatie compleet is voordat de eigenlijke review begint.',
        },
        {
          id: 'wf-q10',
          question: 'Wat is het verschil tussen een Quality Gate en een Gate Review?',
          options: [
            'Quality Gates zijn verplicht; Gate Reviews zijn optioneel',
            'Quality Gates focussen op technische metrics (code coverage, security scans); Gate Reviews omvatten ook business alignment en stakeholder approval',
            'Quality Gates worden door het management gedaan; Gate Reviews door het team',
            'Er is geen verschil; de termen zijn uitwisselbaar'
          ],
          correctAnswer: 1,
          explanation: 'Quality Gates zijn technisch gefocust (code quality, testdekking, performance benchmarks). Gate Reviews zijn breder: business alignment, resource availability, risk acceptance en stakeholder approval.',
        },
        {
          id: 'wf-q11',
          question: 'Na de requirements sign-off wil een stakeholder een wijziging doorvoeren. Wat is de eerste stap in het Waterfall change control proces?',
          options: [
            'Direct de baseline documenten aanpassen',
            'Een Change Request indienen met beschrijving van de gewenste wijziging en de reden',
            'Het team informeren en de planning aanpassen',
            'De wijziging implementeren en achteraf goedkeuring vragen'
          ],
          correctAnswer: 1,
          explanation: 'De eerste stap is het indienen van een Change Request met de gewenste wijziging, de reden en de aanvrager. Daarna volgt pas de impact assessment en CCB review.',
        },
        {
          id: 'wf-q12',
          question: 'Welke vier impactgebieden analyseert de PM bij een Impact Assessment voor een change request?',
          options: [
            'Scope, planning, budget en risico\'s',
            'Mensen, middelen, methoden en materialen',
            'Functionaliteit, performance, security en usability',
            'Requirements, design, code en tests'
          ],
          correctAnswer: 0,
          explanation: 'De PM analyseert de impact op scope, planning, budget, risico\'s, kwaliteit en andere requirements. De kern zijn scope, planning, budget en risico\'s.',
        },
        {
          id: 'wf-q13',
          question: 'Wat beschrijft het Water-Scrum-Fall patroon?',
          options: [
            'Waterfall voor requirements en design, Agile sprints voor development, Waterfall voor testing en deployment',
            'Agile voor requirements, Waterfall voor development, Agile voor deployment',
            'Scrum ceremonies gecombineerd met Waterfall documentatie door de hele lifecycle',
            'Waterfall voor kleine projecten, Scrum voor grote projecten'
          ],
          correctAnswer: 0,
          explanation: 'Water-Scrum-Fall gebruikt Waterfall voor de initiële fasen (requirements en design), Agile sprints voor development, en keert terug naar Waterfall voor testing en deployment.',
        },
        {
          id: 'wf-q14',
          question: 'Bij welke situatie kies je bewust voor een meer Waterfall-georiënteerde aanpak boven Agile?',
          options: [
            'Co-located teams met veranderende requirements',
            'Innovatieve producten waarbij de klant nog niet weet wat hij wil',
            'Vaste scope en budget contracten met externe leveranciers en strikte compliance',
            'Projecten waarbij frequente releases gewenst zijn'
          ],
          correctAnswer: 2,
          explanation: 'Waterfall is het meest geschikt bij vaste scope en budget (vaste prijs contracten), externe leveranciers (specs als overdracht) en strikte compliance eisen die gedetailleerde documentatie en audittrails vereisen.',
        },
      ],
    },
    {
      id: 'wf-l-assignment',
      title: 'Praktijkopdracht: Waterfall Plan voor CRM-uitrol',
      titleNL: 'Praktijkopdracht: Waterfall Plan voor CRM-uitrol',
      duration: '90:00',
      type: 'assignment',
      requires_admin_approval: true,
      assignment: {
        title: 'Bouw een 6-fasen Waterfall-plan voor een CRM-implementatie',
        description: `Een middelgrote B2B-dienstverlener (300 FTE) vervangt zijn legacy CRM-systeem door Salesforce. De directie wil een klassiek Waterfall-plan zien voordat het budget van €280.000 wordt vrijgegeven. Jij bent aangesteld als projectmanager en moet het plan opleveren.

Onderwerp je plan aan de volgende structuur en lever alle onderdelen compleet in.`,
        deliverables: [
          'Fasedefinities: omschrijving, deliverables en doorlooptijd van elk van de 6 fasen (Initiation, Requirements, Design, Build, Test, Deploy)',
          'Gate exit-criteria: per fase-overgang minimaal 3 concrete go/no-go-criteria',
          'RACI-matrix voor 4 sleutelrollen: Projectmanager, Stuurgroepvoorzitter, IT-architect en Key User',
          'Gantt-chart (als tabel of visueel schema) met minimaal 3 kritiek-pad-taken gemarkeerd en hun afhankelijkheden',
        ],
        rubric: [
          { criterion: 'Fasedefinities volledig en logisch gesequenced', points: 20 },
          { criterion: 'Exit-criteria concreet en meetbaar (geen vage omschrijvingen)', points: 25 },
          { criterion: 'RACI-matrix consistent en dekkend voor alle hoofdactiviteiten', points: 25 },
          { criterion: 'Kritiek pad correct geïdentificeerd en uitgelegd', points: 20 },
          { criterion: 'Professionele opmaak en zakelijk taalgebruik', points: 10 },
        ],
        submission_format: 'markdown',
      },
    },
    {
      id: 'wf-l9',
      title: 'Final Exam',
      titleNL: 'Eindexamen',
      duration: '30:00',
      type: 'exam',
      videoUrl: '',
      transcript: `Dit is het eindexamen van de Waterfall Project Management cursus.

**Examen Informatie:**
- 25 multiple choice vragen
- 45 minuten tijd
- 70% score nodig om te slagen

**Onderwerpen:**
- Waterfall fasen en hun volgorde
- Requirements fase en documentatie
- Design principes
- Testing niveaus
- Gate Reviews en Quality Gates
- Change Control proces
- Hybride aanpakken

Succes!`,
      quiz: [
        {
          id: 'wf-exam-q1',
          question: 'Who is credited with formally describing the Waterfall model in a widely-cited 1970 paper?',
          questionNL: 'Wie wordt gecrediteerd voor het formeel beschrijven van het Waterfall-model in een veelgeciteerd artikel uit 1970?',
          options: [
            'Barry Boehm',
            'Winston Royce',
            'Ken Schwaber',
            'Frederick Brooks',
          ],
          optionsNL: [
            'Barry Boehm',
            'Winston Royce',
            'Ken Schwaber',
            'Frederick Brooks',
          ],
          correctAnswer: 1,
          explanation: 'Winston Royce\'s 1970 paper "Managing the Development of Large Software Systems" is the canonical origin of the Waterfall model, even though Royce himself noted that the purely sequential version was risky.',
          explanationNL: 'Winston Royce\'s artikel uit 1970 "Managing the Development of Large Software Systems" is de canonieke oorsprong van het Waterfall-model, hoewel Royce zelf opmerkte dat de puur sequentiële versie risicovol was.',
        },
        {
          id: 'wf-exam-q2',
          question: 'What is the correct sequence of phases in the classic Waterfall model?',
          questionNL: 'Wat is de juiste volgorde van fasen in het klassieke Waterfall-model?',
          options: [
            'Design → Requirements → Implementation → Testing → Deployment → Maintenance',
            'Requirements → Design → Implementation → Testing → Deployment → Maintenance',
            'Requirements → Implementation → Design → Testing → Deployment → Maintenance',
            'Planning → Requirements → Design → Testing → Implementation → Deployment',
          ],
          optionsNL: [
            'Ontwerp → Requirements → Implementatie → Testen → Deployment → Onderhoud',
            'Requirements → Ontwerp → Implementatie → Testen → Deployment → Onderhoud',
            'Requirements → Implementatie → Ontwerp → Testen → Deployment → Onderhoud',
            'Planning → Requirements → Ontwerp → Testen → Implementatie → Deployment',
          ],
          correctAnswer: 1,
          explanation: 'The classic Waterfall sequence is: Requirements → Design → Implementation → Testing (Verification) → Deployment → Maintenance. Each phase must be completed and signed off before the next begins.',
          explanationNL: 'De klassieke Waterfall-volgorde is: Requirements → Ontwerp → Implementatie → Testen (Verificatie) → Deployment → Onderhoud. Elke fase moet worden afgerond en goedgekeurd voordat de volgende begint.',
        },
        {
          id: 'wf-exam-q3',
          question: 'What is the primary purpose of a phase gate (stage gate) in a Waterfall project?',
          questionNL: 'Wat is het primaire doel van een fase-gate (stage gate) in een Waterfall-project?',
          options: [
            'To allow team members to request scope changes at any time',
            'To formally verify that phase deliverables meet criteria before the next phase begins',
            'To review the project budget for cost overruns',
            'To assign tasks to the development team for the upcoming phase',
          ],
          optionsNL: [
            'Om teamleden toe te staan op elk moment scopewijzigingen aan te vragen',
            'Om formeel te verifiëren dat fase-deliverables aan criteria voldoen voordat de volgende fase begint',
            'Om het projectbudget te reviewen op kostenoverschrijdingen',
            'Om taken toe te wijzen aan het ontwikkelteam voor de komende fase',
          ],
          correctAnswer: 1,
          explanation: 'A phase gate is a formal checkpoint where project deliverables are reviewed against predefined criteria (quality, completeness, compliance). Only after approval — a sign-off — does the project proceed to the next phase.',
          explanationNL: 'Een fase-gate is een formeel controlepunt waarbij projectdeliverables worden gereviewed aan de hand van vooraf bepaalde criteria (kwaliteit, volledigheid, compliance). Alleen na goedkeuring — een aftekening — gaat het project door naar de volgende fase.',
        },
        {
          id: 'wf-exam-q4',
          question: 'The "cost of change" curve in Waterfall states that the cost of fixing a defect or changing a requirement:',
          questionNL: 'De "kosten van verandering"-curve in Waterfall stelt dat de kosten voor het oplossen van een defect of wijzigen van een requirement:',
          options: [
            'Remain constant throughout all project phases',
            'Are highest during the Requirements phase',
            'Increase exponentially the later in the lifecycle the change is made',
            'Decrease after the system is deployed because users find issues quickly',
          ],
          optionsNL: [
            'Door alle projectfasen heen constant blijven',
            'Het hoogst zijn tijdens de Requirements-fase',
            'Exponentieel toenemen naarmate de wijziging later in de levenscyclus wordt gemaakt',
            'Afnemen na deployment omdat gebruikers problemen snel vinden',
          ],
          correctAnswer: 2,
          explanation: 'Barry Boehm\'s research quantified that defects found during maintenance can cost 100× more to fix than those found during requirements. This cost-of-change curve is a core justification for Waterfall\'s upfront documentation investment.',
          explanationNL: 'Barry Boehm\'s onderzoek kwantificeerde dat defecten gevonden tijdens onderhoud 100× meer kunnen kosten om te repareren dan die gevonden tijdens requirements. Deze kosten-van-verandering-curve is een kernrechtvaardiging voor Waterfall\'s upfront documentatie-investering.',
        },
        {
          id: 'wf-exam-q5',
          question: 'Which document type is the primary output of the Requirements phase in a Waterfall project?',
          questionNL: 'Welk documenttype is de primaire output van de Requirements-fase in een Waterfall-project?',
          options: [
            'Sprint Backlog',
            'Software Requirements Specification (SRS) or equivalent requirements baseline',
            'Work Breakdown Structure (WBS)',
            'Risk Register',
          ],
          optionsNL: [
            'Sprint Backlog',
            'Software Requirements Specification (SRS) of equivalent requirements baseline',
            'Work Breakdown Structure (WBS)',
            'Risicoregister',
          ],
          correctAnswer: 1,
          explanation: 'The Requirements phase produces a frozen requirements baseline — typically an SRS or Business Requirements Document (BRD). This baseline drives all downstream design and development and is subject to formal change control if amendments are needed.',
          explanationNL: 'De Requirements-fase produceert een bevroren requirements-baseline — typisch een SRS of Business Requirements Document (BRD). Deze baseline stuurt alle downstream ontwerp en ontwikkeling en is onderhevig aan formeel wijzigingsbeheer als aanpassingen nodig zijn.',
        },
        {
          id: 'wf-exam-q6',
          question: 'Requirements Traceability in Waterfall means:',
          questionNL: 'Requirements Traceability in Waterfall betekent:',
          options: [
            'Tracking which developer wrote each line of code',
            'Ensuring every requirement can be linked forward to a design element and backward to a business objective',
            'Logging all defects in a traceability matrix after testing',
            'Recording the history of who signed off each phase gate',
          ],
          optionsNL: [
            'Bijhouden welke ontwikkelaar elke coderegel heeft geschreven',
            'Ervoor zorgen dat elke requirement voorwaarts gekoppeld kan worden aan een ontwerpelement en achterwaarts aan een bedrijfsdoelstelling',
            'Alle defecten loggen in een traceabiliteitsmatrix na testen',
            'Bijhouden van de geschiedenis van wie elke fase-gate heeft afgetekend',
          ],
          correctAnswer: 1,
          explanation: 'A Requirements Traceability Matrix (RTM) maps each requirement to its source business need and forward to the design component, code module, and test case that address it — ensuring nothing is missed and scope is controlled.',
          explanationNL: 'Een Requirements Traceability Matrix (RTM) koppelt elke requirement aan zijn bron-bedrijfsbehoefte en voorwaarts aan het ontwerpelement, codemodule en testgeval die het adresseren — zodat niets wordt gemist en de scope gecontroleerd is.',
        },
        {
          id: 'wf-exam-q7',
          question: 'In Waterfall, formal Change Control is required because:',
          questionNL: 'In Waterfall is formeel wijzigingsbeheer vereist omdat:',
          options: [
            'The project manager prefers bureaucracy over speed',
            'Requirements are baselined and any change must be assessed for scope, cost, and schedule impact before approval',
            'Agile teams use change control so Waterfall must too',
            'Change control is only needed for budget changes, not scope changes',
          ],
          optionsNL: [
            'De projectmanager de voorkeur geeft aan bureaucratie boven snelheid',
            'Requirements zijn bevroren en elke wijziging moet worden beoordeeld op scope-, kosten- en planningsimpact vóór goedkeuring',
            'Agile-teams gebruiken wijzigingsbeheer dus Waterfall ook',
            'Wijzigingsbeheer is alleen nodig voor budgetwijzigingen, niet voor scopewijzigingen',
          ],
          correctAnswer: 1,
          explanation: 'Once requirements are baselined and a phase gate is signed off, any change triggers a formal Change Request process: impact analysis, approval by a Change Control Board, and update to scope, budget, and schedule baselines.',
          explanationNL: 'Zodra requirements zijn bevroren en een fase-gate is afgetekend, triggert elke wijziging een formeel Wijzigingsverzoek-proces: impactanalyse, goedkeuring door een Wijzigingsbeheerraad, en bijwerking van scope-, budget- en planningsbases.',
        },
        {
          id: 'wf-exam-q8',
          question: 'A Gantt chart in Waterfall project planning is primarily used to:',
          questionNL: 'Een Gantt-diagram in Waterfall-projectplanning wordt primair gebruikt om:',
          options: [
            'Visualise the product backlog prioritised by business value',
            'Show team velocity across multiple sprints',
            'Display tasks, durations, dependencies, and milestones on a timeline',
            'Track defect counts per module during the testing phase',
          ],
          optionsNL: [
            'De productbacklog te visualiseren geprioriteerd op bedrijfswaarde',
            'Teamsnelheid over meerdere sprints te tonen',
            'Taken, doorlooptijden, afhankelijkheden en mijlpalen op een tijdlijn weer te geven',
            'Defecttelling per module bij te houden tijdens de testfase',
          ],
          correctAnswer: 2,
          explanation: 'A Gantt chart plots each task or phase as a horizontal bar across a calendar timeline, showing start/end dates, task dependencies (finish-to-start links), and project milestones — making the overall schedule visible at a glance.',
          explanationNL: 'Een Gantt-diagram toont elke taak of fase als een horizontale balk op een kalendertijdlijn, met start-/einddatums, taakafhankelijkheden (finish-to-start-koppelingen) en projectmijlpalen — waardoor het totale schema in één oogopslag zichtbaar is.',
        },
        {
          id: 'wf-exam-q9',
          question: 'The Critical Path in a Waterfall project schedule is defined as:',
          questionNL: 'Het kritieke pad in een Waterfall-projectplanning is gedefinieerd als:',
          options: [
            'The set of tasks with the highest risk of technical failure',
            'The sequence of dependent tasks that determines the earliest possible project completion date',
            'The list of tasks assigned to the most senior team members',
            'The phase with the highest budget allocation',
          ],
          optionsNL: [
            'De set taken met het hoogste risico op technisch falen',
            'De reeks afhankelijke taken die de vroegst mogelijke projecteinddatum bepaalt',
            'De lijst van taken toegewezen aan de meest senior teamleden',
            'De fase met de hoogste budgetallocatie',
          ],
          correctAnswer: 1,
          explanation: 'The Critical Path Method (CPM) identifies the longest chain of dependent tasks (zero float). Any delay on a critical-path task delays the entire project end date — making it the primary focus of schedule management in Waterfall.',
          explanationNL: 'De Critical Path Method (CPM) identificeert de langste keten van afhankelijke taken (nul speelruimte). Elke vertraging op een kritiek-pad-taak vertraagt de volledige projecteinddatum — waardoor het de primaire focus is van planningsbeheer in Waterfall.',
        },
        {
          id: 'wf-exam-q10',
          question: 'Which project characteristics make Waterfall the most appropriate delivery approach?',
          questionNL: 'Welke projectkenmerken maken Waterfall de meest geschikte leveringsaanpak?',
          options: [
            'High uncertainty, frequent stakeholder feedback loops, evolving requirements',
            'Well-understood, stable requirements; fixed scope; regulated environment requiring formal documentation',
            'Small co-located team; two-week delivery cycles; continuous deployment pipeline',
            'Innovative product with unknown market fit; first-time technology stack',
          ],
          optionsNL: [
            'Hoge onzekerheid, frequente feedbacklussen met stakeholders, veranderende requirements',
            'Goed begrepen, stabiele requirements; vaste scope; gereguleerde omgeving die formele documentatie vereist',
            'Klein co-located team; tweewekelijkse leveringscycli; continuous deployment-pipeline',
            'Innovatief product met onbekende marktfit; eerste keer dat een technologiestapel wordt gebruikt',
          ],
          correctAnswer: 1,
          explanation: 'Waterfall excels when requirements are stable and well-understood upfront, scope is fixed (e.g. under a fixed-price contract), and the domain mandates formal documentation and traceability — such as aerospace, defence, medical devices, and construction.',
          explanationNL: 'Waterfall blinkt uit wanneer requirements stabiel en goed begrepen zijn van tevoren, de scope vast is (bijv. onder een vaste-prijs-contract), en het domein formele documentatie en traceerbaarheid vereist — zoals lucht- en ruimtevaart, defensie, medische hulpmiddelen en bouw.',
        },
        {
          id: 'wf-exam-q11',
          question: 'Why does Waterfall struggle most in projects with high requirement uncertainty?',
          questionNL: 'Waarom heeft Waterfall de meeste moeite in projecten met hoge requirementsonzekerheid?',
          options: [
            'Because it lacks a Definition of Done',
            'Because late-phase feedback from users cannot be incorporated without triggering expensive rework across all prior phases',
            'Because it requires daily stand-up meetings that slow down progress',
            'Because Waterfall does not allow any project planning before work starts',
          ],
          optionsNL: [
            'Omdat het een Definition of Done mist',
            'Omdat late feedback van gebruikers in latere fasen niet kan worden verwerkt zonder dure herwerking in alle eerdere fasen te triggeren',
            'Omdat het dagelijkse stand-up meetings vereist die de voortgang vertragen',
            'Omdat Waterfall geen projectplanning toestaat voordat het werk begint',
          ],
          correctAnswer: 1,
          explanation: 'Because phases are sequential and gated, a design flaw discovered during User Acceptance Testing forces rework in Testing, then Implementation, then possibly Design — cascading cost and delay. This is why high-uncertainty projects favour iterative/Agile approaches.',
          explanationNL: 'Omdat fasen sequentieel en geblokkeerd zijn, dwingt een ontwerpfout die tijdens User Acceptance Testing wordt ontdekt tot herwerking in Testen, dan Implementatie, dan mogelijk Ontwerp — wat kosten en vertraging veroorzaakt. Daarom geven hoog-onzekere projecten de voorkeur aan iteratieve/Agile aanpakken.',
        },
        {
          id: 'wf-exam-q12',
          question: 'What is the key difference between Waterfall and an iterative/Agile approach?',
          questionNL: 'Wat is het belangrijkste verschil tussen Waterfall en een iteratieve/Agile aanpak?',
          options: [
            'Waterfall uses user stories; Agile uses functional specifications',
            'Waterfall delivers the full product at project end after sequential phases; Agile delivers working increments in short cycles with continuous feedback',
            'Waterfall has no testing phase; Agile tests every sprint',
            'Waterfall is only used for software; Agile is used for all industries',
          ],
          optionsNL: [
            'Waterfall gebruikt user stories; Agile gebruikt functionele specificaties',
            'Waterfall levert het volledige product aan het projecteinde na sequentiële fasen; Agile levert werkende incrementen in korte cycli met continue feedback',
            'Waterfall heeft geen testfase; Agile test elke sprint',
            'Waterfall wordt alleen gebruikt voor software; Agile wordt voor alle industrieën gebruikt',
          ],
          correctAnswer: 1,
          explanation: 'The fundamental distinction is timing of feedback and delivery. Waterfall is plan-driven: value is delivered once, at the end. Agile is inspect-and-adapt: value is delivered incrementally, enabling earlier ROI and course correction.',
          explanationNL: 'Het fundamentele onderscheid is het tijdstip van feedback en levering. Waterfall is plangestuurd: waarde wordt eenmalig geleverd, aan het einde. Agile is inspect-and-adapt: waarde wordt incrementeel geleverd, wat vroegere ROI en bijsturing mogelijk maakt.',
        },
        {
          id: 'wf-exam-q13',
          question: 'In the Waterfall Design phase, what is typically the output that guides the Implementation phase?',
          questionNL: 'Wat is in de Waterfall-ontwerpfase typisch de output die de implementatiefase stuurt?',
          options: [
            'A release plan with story points per sprint',
            'High-level and detailed design documents (architecture, data models, interface specifications)',
            'A Kanban board with tasks in "To Do", "In Progress", and "Done" columns',
            'A retrospective report from the previous phase',
          ],
          optionsNL: [
            'Een releaseplan met story points per sprint',
            'High-level en gedetailleerde ontwerpdocumenten (architectuur, datamodellen, interfacespecificaties)',
            'Een Kanban-bord met taken in kolommen "Te doen", "In uitvoering" en "Klaar"',
            'Een retrospectief rapport van de vorige fase',
          ],
          correctAnswer: 1,
          explanation: 'The Design phase produces architectural and detailed design documents — system architecture diagrams, data models, database schemas, UI/UX wireframes, and interface specifications — which serve as the technical blueprint developers follow during Implementation.',
          explanationNL: 'De ontwerpfase produceert architecturele en gedetailleerde ontwerpdocumenten — systeemarchitectuurdiagrammen, datamodellen, databaseschema\'s, UI/UX-wireframes en interfacespecificaties — die dienen als technische blauwdruk die ontwikkelaars volgen tijdens de implementatie.',
        },
        {
          id: 'wf-exam-q14',
          question: 'Which testing level verifies that individual units of code function correctly in isolation?',
          questionNL: 'Welk testniveau verifieert dat individuele code-eenheden correct functioneren in isolatie?',
          options: [
            'User Acceptance Testing (UAT)',
            'System Testing',
            'Unit Testing',
            'Integration Testing',
          ],
          optionsNL: [
            'User Acceptance Testing (UAT)',
            'Systeemtesten',
            'Unit Testing',
            'Integratietesten',
          ],
          correctAnswer: 2,
          explanation: 'Unit Testing targets the smallest testable parts of a system (functions, methods, classes) in isolation. It is typically performed by developers during or immediately after Implementation, before Integration Testing assembles components.',
          explanationNL: 'Unit Testing richt zich op de kleinste testbare onderdelen van een systeem (functies, methoden, klassen) in isolatie. Het wordt typisch uitgevoerd door ontwikkelaars tijdens of direct na de implementatie, voordat integratietesten componenten samenvoegt.',
        },
        {
          id: 'wf-exam-q15',
          question: 'User Acceptance Testing (UAT) in Waterfall is primarily performed by:',
          questionNL: 'User Acceptance Testing (UAT) in Waterfall wordt primair uitgevoerd door:',
          options: [
            'The development team to check code quality',
            'The QA team to verify test coverage metrics',
            'The end users or business representatives to confirm the system meets business requirements',
            'External auditors checking regulatory compliance',
          ],
          optionsNL: [
            'Het ontwikkelteam om codekwaliteit te controleren',
            'Het QA-team om testdekkingsstatistieken te verifiëren',
            'De eindgebruikers of bedrijfsvertegenwoordigers om te bevestigen dat het systeem voldoet aan bedrijfsrequirements',
            'Externe auditors die regelgevingsnaleving controleren',
          ],
          correctAnswer: 2,
          explanation: 'UAT is the final validation gate before deployment. Business representatives or end users execute pre-defined acceptance test cases against the system to confirm it satisfies the original business requirements — a business sign-off, not a technical test.',
          explanationNL: 'UAT is de laatste validatiepoort vóór deployment. Bedrijfsvertegenwoordigers of eindgebruikers voeren vooraf gedefinieerde acceptatietestgevallen uit op het systeem om te bevestigen dat het voldoet aan de oorspronkelijke bedrijfsrequirements — een bedrijfsaftekening, geen technische test.',
        },
        {
          id: 'wf-exam-q16',
          question: 'A project baseline in Waterfall refers to:',
          questionNL: 'Een projectbaseline in Waterfall verwijst naar:',
          options: [
            'The initial team velocity estimate used for sprint planning',
            'The approved, frozen snapshot of scope, schedule, and cost against which actual performance is measured',
            'The minimum viable version of the product that can be released',
            'The risk threshold below which no mitigation action is required',
          ],
          optionsNL: [
            'De initiële teamsnelheidsschatting gebruikt voor sprintplanning',
            'De goedgekeurde, bevroren momentopname van scope, planning en kosten waaraan werkelijke prestaties worden gemeten',
            'De minimale levensvatbare versie van het product die kan worden uitgebracht',
            'De risicodrempel waaronder geen mitigatieactie vereist is',
          ],
          correctAnswer: 1,
          explanation: 'A baseline (scope baseline, schedule baseline, cost baseline) is the approved plan, locked at a phase gate. Variances from the baseline trigger change control or corrective action. It is the reference point for performance reporting (Earned Value Management).',
          explanationNL: 'Een baseline (scope-baseline, planningsbaseline, kostenbaseline) is het goedgekeurde plan, vergrendeld bij een fase-gate. Afwijkingen van de baseline triggeren wijzigingsbeheer of corrigerende actie. Het is het referentiepunt voor prestatierapportage (Earned Value Management).',
        },
        {
          id: 'wf-exam-q17',
          question: 'What does "plan-driven" mean in the context of Waterfall project management?',
          questionNL: 'Wat betekent "plan-gestuurd" in de context van Waterfall-projectmanagement?',
          options: [
            'The team creates a new plan at the start of each iteration',
            'The project is governed by a comprehensive upfront plan that defines scope, schedule, and budget; all work follows this plan',
            'The project manager updates the plan daily based on team feedback',
            'Planning is delegated entirely to individual team members',
          ],
          optionsNL: [
            'Het team maakt aan het begin van elke iteratie een nieuw plan',
            'Het project wordt beheerst door een uitgebreid vooraf plan dat scope, planning en budget definieert; al het werk volgt dit plan',
            'De projectmanager werkt het plan dagelijks bij op basis van teamfeedback',
            'Planning wordt volledig gedelegeerd aan individuele teamleden',
          ],
          correctAnswer: 1,
          explanation: 'Plan-driven (also called predictive) means the full project scope, schedule, and budget are defined and baselined upfront. The project then executes against that plan. Deviations are managed through formal change control rather than through plan adaptation.',
          explanationNL: 'Plangestuurd (ook wel voorspellend genoemd) betekent dat de volledige projectscope, -planning en -budget vooraf worden gedefinieerd en als baseline vastgelegd. Het project voert vervolgens uit op basis van dat plan. Afwijkingen worden beheerd via formeel wijzigingsbeheer in plaats van planadaptatie.',
        },
        {
          id: 'wf-exam-q18',
          question: 'In a hybrid project approach combining Waterfall and Agile, which component is most commonly kept as Waterfall?',
          questionNL: 'In een hybride projectaanpak die Waterfall en Agile combineert, welk onderdeel wordt het meest als Waterfall gehouden?',
          options: [
            'The daily development work and coding tasks',
            'Governance, budgeting, and high-level milestone planning while delivery is Agile sprints',
            'Retrospectives and continuous improvement ceremonies',
            'User story writing and backlog grooming',
          ],
          optionsNL: [
            'Het dagelijkse ontwikkelingswerk en codetaken',
            'Governance, budgettering en high-level mijlpaalplanning terwijl levering via Agile-sprints verloopt',
            'Retrospectives en ceremonies voor continue verbetering',
            'Het schrijven van user stories en backlog grooming',
          ],
          correctAnswer: 1,
          explanation: 'Hybrid models typically keep Waterfall-style governance, procurement, and funding cycles (which require fixed-scope commitments) while using Agile sprints for iterative delivery within each phase — giving both predictability to sponsors and flexibility to teams.',
          explanationNL: 'Hybride modellen handhaven doorgaans Waterfall-achtige governance, aanbestedingsen financieringscycli (die vaste scopeverplichtingen vereisen) terwijl Agile-sprints worden gebruikt voor iteratieve levering binnen elke fase — wat zowel voorspelbaarheid voor sponsors als flexibiliteit voor teams biedt.',
        },
        {
          id: 'wf-exam-q19',
          question: 'What is the primary purpose of a milestone in a Waterfall schedule?',
          questionNL: 'Wat is het primaire doel van een mijlpaal in een Waterfall-planning?',
          options: [
            'To assign a specific team member as accountable for a work package',
            'To mark a significant event or decision point — typically the completion of a phase deliverable or gate review',
            'To indicate a point where the budget should be reviewed and adjusted',
            'To signal the start of a new sprint cycle within the phase',
          ],
          optionsNL: [
            'Om een specifiek teamlid als verantwoordelijke aan te wijzen voor een werkpakket',
            'Om een significante gebeurtenis of beslissingspunt te markeren — typisch de voltooiing van een fase-deliverable of gate review',
            'Om een punt aan te geven waarop het budget moet worden gereviewed en aangepast',
            'Om het begin van een nieuwe sprintcyclus binnen de fase te signaleren',
          ],
          correctAnswer: 1,
          explanation: 'A milestone is a zero-duration scheduling event that marks a key point in the project — such as "Requirements Baseline Approved", "Design Sign-off", or "UAT Complete". Milestones are used to track schedule progress and trigger gate review activities.',
          explanationNL: 'Een mijlpaal is een planningsevenement met nul duur dat een belangrijk punt in het project markeert — zoals "Requirements Baseline Goedgekeurd", "Ontwerp Aftekening" of "UAT Voltooid". Mijlpalen worden gebruikt om planningsvoortgang bij te houden en gate review-activiteiten te triggeren.',
        },
        {
          id: 'wf-exam-q20',
          question: 'Which of the following industries MOST commonly mandates Waterfall-style sequential, documented delivery?',
          questionNL: 'Welke van de volgende industrieën verplicht het MEEST Waterfall-achtige sequentiële, gedocumenteerde levering?',
          options: [
            'Social media app development and consumer mobile gaming',
            'Aerospace, defence, medical devices, and nuclear engineering',
            'E-commerce website redesign and marketing campaign management',
            'Internal IT help-desk tooling and employee onboarding portals',
          ],
          optionsNL: [
            'Ontwikkeling van sociale media-apps en consumenten mobiele games',
            'Lucht- en ruimtevaart, defensie, medische hulpmiddelen en kernenergie-engineering',
            'E-commerce website-herontwerp en marketingcampagnebeheer',
            'Interne IT-helpdesk-tooling en medewerker-onboardingportalen',
          ],
          correctAnswer: 1,
          explanation: 'Regulated high-risk industries — aerospace (DO-178C), defence (MIL-STD), medical devices (IEC 62304, FDA 21 CFR Part 11), and nuclear — mandate formal phase-by-phase documentation, independent verification, and traceability by law or safety standard. Waterfall\'s structure directly satisfies these requirements.',
          explanationNL: 'Gereguleerde hoog-risico-industrieën — lucht- en ruimtevaart (DO-178C), defensie (MIL-STD), medische hulpmiddelen (IEC 62304, FDA 21 CFR Part 11) en kernenergie — verplichten formele fase-voor-fase documentatie, onafhankelijke verificatie en traceerbaarheid bij wet of veiligheidsnorm. De structuur van Waterfall voldoet hier direct aan.',
        },
        {
          id: 'wf-exam-q21',
          question: 'Earned Value Management (EVM) in a Waterfall project uses three key values. Which set is correct?',
          questionNL: 'Earned Value Management (EVM) in een Waterfall-project gebruikt drie sleutelwaarden. Welke set is correct?',
          options: [
            'Velocity, Burn Rate, and Throughput',
            'Planned Value (PV), Earned Value (EV), and Actual Cost (AC)',
            'Budget at Completion, Estimate to Complete, and Cost Variance',
            'Risk Exposure, Contingency Reserve, and Management Reserve',
          ],
          optionsNL: [
            'Snelheid, burn rate en doorvoer',
            'Planned Value (PV), Earned Value (EV) en Actual Cost (AC)',
            'Budget at Completion, Estimate to Complete en Cost Variance',
            'Risicoblootstelling, contingentiereserve en managementreserve',
          ],
          correctAnswer: 1,
          explanation: 'EVM uses PV (the budgeted cost of work scheduled), EV (the budgeted cost of work actually performed), and AC (the actual cost incurred). From these three, Schedule Variance (SV = EV − PV), Cost Variance (CV = EV − AC), SPI, and CPI are derived — the standard Waterfall performance reporting metrics.',
          explanationNL: 'EVM gebruikt PV (de gebudgetteerde kosten van gepland werk), EV (de gebudgetteerde kosten van daadwerkelijk uitgevoerd werk) en AC (de werkelijke gemaakte kosten). Uit deze drie worden Schedule Variance (SV = EV − PV), Cost Variance (CV = EV − AC), SPI en CPI afgeleid — de standaard Waterfall-prestatierapporten.',
        },
        {
          id: 'wf-exam-q22',
          question: 'A project team discovers a significant design flaw during System Testing. In Waterfall, what is the correct process to follow?',
          questionNL: 'Een projectteam ontdekt een significant ontwerpfout tijdens systeemtesten. Wat is in Waterfall het juiste proces om te volgen?',
          options: [
            'Immediately fix the code without documentation to avoid schedule delay',
            'Raise a formal defect report; assess impact; if a design change is required, raise a Change Request and update the Design baseline before reworking Implementation',
            'Accept the defect as technical debt and add it to the next-phase backlog',
            'Ask the end user to adjust their expectations so no design change is needed',
          ],
          optionsNL: [
            'Onmiddellijk de code repareren zonder documentatie om planningsvertraging te vermijden',
            'Een formeel defectrapport opstellen; impact beoordelen; als een ontwerpwijziging vereist is, een wijzigingsverzoek indienen en de ontwerp-baseline bijwerken voordat de implementatie wordt herwerkt',
            'Het defect accepteren als technische schuld en toevoegen aan de backlog van de volgende fase',
            'De eindgebruiker vragen zijn verwachtingen aan te passen zodat geen ontwerpwijziging nodig is',
          ],
          correctAnswer: 1,
          explanation: 'Waterfall mandates formal defect management and change control. A design flaw found in testing requires a defect log entry, root-cause analysis, a Change Request if a baseline must change, CCB approval, and then controlled rework of the affected Design and Implementation artefacts before re-testing.',
          explanationNL: 'Waterfall vereist formeel defectbeheer en wijzigingsbeheer. Een ontwerpfout gevonden tijdens testen vereist een defectlogboekvermelding, oorzaakanalyse, een wijzigingsverzoek als een baseline moet wijzigen, CCB-goedkeuring en vervolgens gecontroleerde herwerking van de betrokken ontwerp- en implementatieartefacten vóór hertesten.',
        },
      ],
    },
    {
      id: 'wf-l10',
      title: 'Certificate',
      titleNL: 'Certificaat',
      duration: '5:00',
      type: 'certificate',
      videoUrl: '',
      transcript: `Gefeliciteerd met het afronden van de Waterfall Project Management cursus!

**Je Certificaat**

Je ontvangt een certificaat dat bevestigt:
- Cursus: Waterfall Project Management
- Duur: 10 uur
- Onderwerpen: Waterfall fasen, Requirements, Design, Testing, Gate Reviews, Change Control
- Datum van afronding

**Vervolgstappen**

Nu je Waterfall beheerst:

1. **Praktijk**: Pas toe in je projecten
2. **Verdieping**: Overweeg PRINCE2 of PMP certificering
3. **Hybride**: Leer ook Agile voor flexibiliteit
4. **Specialisatie**: Focus op specifieke industrieën

Veel succes met je projecten!`,
    },
  ],
};

// ============================================
// EXPORT MODULES
// ============================================
export const waterfallModules: Module[] = [
  module1,
  module2,
];

// ============================================
// COURSE DEFINITION
// ============================================
export const waterfallCourse: Course = {
  id: 'waterfall-pm',
  title: 'Waterfall Project Management',
  titleNL: 'Waterfall Project Management',
  description: 'Classical sequential project management for predictable projects with stable requirements and strict compliance needs.',
  descriptionNL: 'Klassieke sequentiële projectmanagement voor voorspelbare projecten met stabiele requirements en strikte compliance eisen.',
  icon: Layers,
  color: BRAND.blue,
  gradient: `linear-gradient(135deg, ${BRAND.blue}, #2563EB)`,
  category: 'traditional',
  methodology: 'waterfall',
  levels: 3,
  modules: waterfallModules.reduce((total, m) => total + m.lessons.length, 0),
  duration: 10,
  rating: 4.6,
  students: 4521,
  tags: ['Waterfall', 'Sequential', 'Requirements', 'Testing', 'Gate Reviews', 'Change Control'],
  tagsNL: ['Waterfall', 'Sequentieel', 'Requirements', 'Testing', 'Gate Reviews', 'Change Control'],
  instructor: instructors.peter,
  featured: false,
  bestseller: false,
  new: false,
  freeForCustomers: true,
  certificate: true,
  whatYouLearn: [
    'The Waterfall phases and when to use each',
    'Effective requirements gathering and documentation',
    'Design principles and documentation',
    'Testing levels from unit to UAT',
    'Gate Reviews and Quality Gates',
    'Change Control in sequential projects',
    'Hybrid approaches combining Waterfall and Agile',
  ],
  whatYouLearnNL: [
    'De Waterfall fasen en wanneer elke te gebruiken',
    'Effectieve requirements gathering en documentatie',
    'Design principes en documentatie',
    'Testing niveaus van unit tot UAT',
    'Gate Reviews en Quality Gates',
    'Change Control in sequentiële projecten',
    'Hybride aanpakken die Waterfall en Agile combineren',
  ],
  requirements: [
    'No prior knowledge required',
    'Interest in structured project management',
  ],
  requirementsNL: [
    'Geen voorkennis vereist',
    'Interesse in gestructureerd projectmanagement',
  ],
  targetAudience: [
    'Project managers in traditional organizations',
    'Professionals in regulated industries',
    'Construction and infrastructure project managers',
    'IT professionals at enterprise implementations',
  ],
  targetAudienceNL: [
    'Projectmanagers in traditionele organisaties',
    'Professionals in gereguleerde industrieën',
    'Bouw- en infrastructuur projectmanagers',
    'IT-professionals bij enterprise implementaties',
  ],
  courseModules: waterfallModules,
};

export default waterfallCourse;