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
// MODULE 1: WATERFALL FUNDAMENTEN
// ============================================
const module1: Module = {
  id: 'wf-m1',
  title: 'Module 1: Waterfall Fundamenten',
  titleNL: 'Module 1: Waterfall Fundamenten',
  description: 'The foundation of Waterfall: phases, when to use, and trade-offs.',
  descriptionNL: 'De basis van Waterfall: oorsprong, principes en wanneer te gebruiken.',
  lessons: [
    {
      id: 'wf-l1',
      title: 'Wat is Waterfall?',
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
Large Software Systems". Ironisch genoeg waarschuwde hij ook voor de risico's - maar 
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
        'Waterfall is sequentieel: elke fase moet af voor de volgende start',
        'Ideaal voor stabiele requirements en compliance-intensieve projecten',
        'Biedt voorspelbaarheid maar is inflexibel voor wijzigingen',
        'Nog steeds relevant in bouw, hardware, enterprise IT en gereguleerde sectoren',
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
      title: 'Requirements Fase',
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
        'Requirements fouten zijn de duurste om te fixen',
        'Gebruik meerdere technieken: interviews, workshops, observatie',
        'Goede requirements zijn SMART en toetsbaar',
        'Formele sign-off activeert change control',
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
      title: 'Design Fase',
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
        'Design vertaalt WAT (requirements) naar HOE (technisch)',
        'High-level design voor het big picture, low-level voor detail',
        'Design reviews voorkomen dure fouten in development',
        'Vermijd over-engineering én under-engineering',
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
        'Development volgt de design specs nauwgezet',
        'Testing gebeurt op meerdere niveaus met formele UAT sign-off',
        'Deployment vereist planning, procedures en rollback plan',
        'Maintenance omvat corrective, adaptive, perfective en preventive',
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
      title: 'Quiz: Waterfall Fundamenten',
      titleNL: 'Quiz: Waterfall Fundamenten',
      duration: '15:00',
      type: 'quiz',
      quiz: [
        {
          id: 'wf-q1',
          question: 'Wat is het belangrijkste kenmerk van Waterfall?',
          options: [
            'Iteratief werken',
            'Sequentiële fasen die elkaar opvolgen',
            'Dagelijkse standups',
            'Geen documentatie'
          ],
          correctAnswer: 1,
          explanation: 'Waterfall is sequentieel: elke fase moet volledig zijn afgerond voordat de volgende begint.',
        },
        {
          id: 'wf-q2',
          question: 'Wanneer is Waterfall de beste keuze?',
          options: [
            'Bij onzekere requirements',
            'Voor innovatieve producten',
            'Bij stabiele requirements en strikte compliance',
            'Voor startups'
          ],
          correctAnswer: 2,
          explanation: 'Waterfall werkt het beste wanneer requirements stabiel zijn en er strikte compliance eisen gelden.',
        },
        {
          id: 'wf-q3',
          question: 'In welke fase worden fouten het duurst om te fixen?',
          options: ['Requirements', 'Design', 'Development', 'Maintenance'],
          correctAnswer: 3,
          explanation: 'Fouten die in de requirements fase gemaakt worden maar pas in maintenance ontdekt worden, kosten tot 100x meer om te fixen.',
        },
        {
          id: 'wf-q4',
          question: 'Wat is een Traceability Matrix?',
          options: [
            'Een projectplanning tool',
            'Een mapping van requirements naar design, code en tests',
            'Een communicatieplan',
            'Een risico register'
          ],
          correctAnswer: 1,
          explanation: 'Een Traceability Matrix houdt bij waar elke requirement vandaan komt en waar hij naartoe gaat (design, code, tests).',
        },
        {
          id: 'wf-q5',
          question: 'Wat is User Acceptance Testing (UAT)?',
          options: [
            'Testing door developers',
            'Geautomatiseerde tests',
            'Testing door eindgebruikers tegen business requirements',
            'Performance testing'
          ],
          correctAnswer: 2,
          explanation: 'UAT is testing door eindgebruikers om te valideren dat het systeem voldoet aan de business requirements.',
        },
      ],
    },
  ],
};

// ============================================
// MODULE 2: WATERFALL IN DE PRAKTIJK
// ============================================
const module2: Module = {
  id: 'wf-m2',
  title: 'Module 2: Waterfall in de Praktijk',
  titleNL: 'Module 2: Waterfall in de Praktijk',
  description: 'Practical application of Waterfall: gate reviews, change control, and hybrid approaches.',
  descriptionNL: 'Praktische toepassing van Waterfall: gate reviews, change control en hybride aanpakken.',
  lessons: [
    {
      id: 'wf-l6',
      title: 'Gate Reviews en Quality Gates',
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
   - Nieuwe risico's geïdentificeerd?
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
        'Gate Reviews zijn formele checkpoints tussen fasen',
        'Elke gate heeft entrance en exit criteria',
        'Go/No-Go/Conditional Go zijn de mogelijke uitkomsten',
        'Quality Gates focussen op technische metrics',
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
- Introduceert risico's
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
- Impact op risico's
- Impact op kwaliteit
- Impact op andere requirements

**3. Change Control Board (CCB) Review**
De CCB beoordeelt de aanvraag:
- Is de wijziging noodzakelijk?
- Zijn de kosten acceptabel?
- Zijn de risico's aanvaardbaar?

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
        'Change Control start na requirements sign-off',
        'Elke wijziging doorloopt een formeel proces',
        'De CCB beslist over significante wijzigingen',
        'Documentatie en traceability zijn cruciaal',
      ],
    },
    {
      id: 'wf-l8',
      title: 'Waterfall en Agile Combineren',
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
        'Zuivere Waterfall of Agile is zeldzaam - hybride is de norm',
        'Water-Scrum-Fall combineert Waterfall voor planning en Agile voor development',
        'Governance (gates) kan behouden blijven met Agile elementen erin',
        'Kies bewust per fase/context wat het beste werkt',
      ],
    },
    {
      id: 'wf-l9',
      title: 'Eindexamen',
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
    },
    {
      id: 'wf-l10',
      title: 'Certificaat',
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