// ============================================
// COURSE: LEAN SIX SIGMA BLACK BELT
// ============================================
// Advanced statistics, DOE, MSA, capability &
// the leadership skills to mentor Green Belts.
// Builds beyond the Green Belt DMAIC foundation.
// ============================================

import { Sigma } from 'lucide-react';
import { Course, Module } from '../types';
import { BRAND } from '../brand';
import { instructors } from '../instructors';

// ============================================
// MODULE 1: BLACK BELT ROLE & MEASUREMENT SYSTEMS
// ============================================
const module1: Module = {
  id: 'lssbb-m1',
  title: 'Module 1: The Black Belt Role & Measurement Systems',
  titleNL: 'Module 1: De Black Belt Rol & Meetsystemen',
  description: 'What separates a Black Belt from a Green Belt, plus trustworthy measurement through MSA and Gage R&R.',
  descriptionNL: 'Wat een Black Belt onderscheidt van een Green Belt, plus betrouwbaar meten via MSA en Gage R&R.',
  lessons: [
    {
      id: 'lssbb-l1',
      title: 'The Black Belt Role',
      titleNL: 'De Black Belt Rol',
      duration: '22:00',
      type: 'video',
      videoUrl: '',
      transcript: `Welkom bij de Lean Six Sigma Black Belt cursus. Je hebt je Green Belt
gehaald — je kent DMAIC, je hebt verbeterprojecten gedaan. Black Belt tilt dat
naar een hoger niveau: complexere statistiek, grotere projecten, en — cruciaal —
het leiden en coachen van anderen.

**Green Belt vs. Black Belt**

Een Green Belt:
- Werkt parttime aan verbeterprojecten (vaak naast de reguliere functie)
- Past basis DMAIC-tools toe (Pareto, Fishbone, 5 Whys, basis control charts)
- Lost afgebakende problemen op binnen één afdeling

Een Black Belt:
- Werkt fulltime aan verbetering (vaak 1–2 jaar als rol)
- Beheerst geavanceerde statistiek (hypothesetesten, ANOVA, regressie, DOE)
- Leidt cross-functionele projecten met strategische impact
- Coacht en mentort Green Belts en projectteams
- Werkt direct met de Champion en het management

**De rol als change agent**

Een Black Belt is meer dan een statisticus. Je bent een change agent: je
overtuigt stakeholders, doorbreekt weerstand, en zorgt dat verbeteringen
beklijven. Technische excellentie zonder leiderschap levert verbeteringen op
die na zes maanden weer verdampen.

**De Belt-hiërarchie**

- White Belt: basiskennis, ondersteunt projecten
- Yellow Belt: teamlid in verbeterprojecten
- Green Belt: leidt kleine projecten parttime
- Black Belt: leidt grote projecten fulltime, coacht Green Belts
- Master Black Belt: traint Black Belts, vormt de Six Sigma-strategie
- Champion: senior sponsor, verwijdert obstakels, selecteert projecten

In deze cursus richten we ons op de competenties die jou van Green naar Black
tillen: meetsysteemanalyse, geavanceerde statistiek, Design of Experiments,
geavanceerde capability & SPC, en leiderschap.`,
      keyTakeaways: [
        'A Black Belt leads full-time, cross-functional, strategically significant projects.',
        'Beyond statistics, the Black Belt is a change agent who must mentor Green Belts.',
        'The belt hierarchy runs White → Yellow → Green → Black → Master Black Belt, with the Champion as senior sponsor.',
      ],
      keyTakeawaysNL: [
        'Een Black Belt leidt fulltime, cross-functionele, strategisch belangrijke projecten.',
        'Naast statistiek is de Black Belt een change agent die Green Belts moet coachen.',
        'De belt-hiërarchie loopt White → Yellow → Green → Black → Master Black Belt, met de Champion als senior sponsor.',
      ],
    },
    {
      id: 'lssbb-l2',
      title: 'Measurement System Analysis & Gage R&R',
      titleNL: 'Meetsysteemanalyse & Gage R&R',
      duration: '26:00',
      type: 'video',
      videoUrl: '',
      transcript: `Voordat je conclusies trekt uit data, moet je je data kunnen
vertrouwen. Measurement System Analysis (MSA) beantwoordt de vraag: meet ik wat
ik denk te meten, en is mijn meting herhaalbaar en reproduceerbaar?

**Bronnen van variatie**

Totale geobserveerde variatie = werkelijke procesvariatie + meetsysteemvariatie.
Als je meetsysteem ruis toevoegt, kun je een goed proces afkeuren of een slecht
proces goedkeuren. Je moet de meetruis isoleren.

**Gage R&R: Repeatability & Reproducibility**

- **Repeatability (herhaalbaarheid):** variatie wanneer dezelfde operator
  hetzelfde onderdeel meerdere keren meet met hetzelfde instrument. Dit is de
  "equipment variation" — de ruis van het instrument zelf.
- **Reproducibility (reproduceerbaarheid):** variatie wanneer verschillende
  operators hetzelfde onderdeel meten. Dit is de "appraiser variation" —
  verschillen tussen mensen.

**De acceptatiecriteria (%GRR van totale variatie)**

- < 10%: meetsysteem is acceptabel
- 10–30%: marginaal acceptabel, afhankelijk van toepassing en kosten
- > 30%: onacceptabel — verbeter het meetsysteem voordat je verder gaat

**Number of Distinct Categories (ndc)**

ndc = 1.41 × (PartVariation / GRRVariation). Je wilt ndc ≥ 5. Een ndc van
minder dan 2 betekent dat je meetsysteem onderdelen niet eens in "goed" en
"slecht" kan onderscheiden.

**Voor attribuutdata: Attribute Agreement Analysis**

Bij goed/fout-beoordelingen (bijv. visuele inspectie) gebruik je Kappa-statistiek
om overeenstemming tussen en binnen beoordelaars te meten. Kappa > 0.75 = goede
overeenstemming.

**Praktijk in ProjeXtPal**

Voer een Gage R&R uit met 3 operators × 10 onderdelen × 2 herhalingen. Bereken
de %GRR. Als die boven 30% ligt, is je eerste verbeterprioriteit níet het proces
maar het meetsysteem — anders meet je ruis.`,
      keyTakeaways: [
        'Observed variation = process variation + measurement variation; MSA isolates the measurement noise.',
        'Gage R&R splits measurement error into Repeatability (equipment) and Reproducibility (appraiser).',
        '%GRR < 10% is acceptable, 10–30% marginal, > 30% must be fixed before trusting any data; aim for ndc ≥ 5.',
      ],
      keyTakeawaysNL: [
        'Geobserveerde variatie = procesvariatie + meetvariatie; MSA isoleert de meetruis.',
        'Gage R&R splitst meetfout in Repeatability (instrument) en Reproducibility (operator).',
        '%GRR < 10% is acceptabel, 10–30% marginaal, > 30% moet eerst opgelost worden; streef naar ndc ≥ 5.',
      ],
    },
    {
      id: 'lssbb-l3',
      title: 'Quiz: Role & Measurement Systems',
      titleNL: 'Quiz: Rol & Meetsystemen',
      duration: '10:00',
      type: 'quiz',
      quiz: [
        {
          id: 'lssbb-q1',
          question: 'What primarily distinguishes a Black Belt from a Green Belt?',
          questionNL: 'Wat onderscheidt een Black Belt primair van een Green Belt?',
          options: [
            'Black Belts only work on documentation',
            'Black Belts lead full-time, cross-functional projects and mentor Green Belts',
            'Black Belts never use statistics',
            'Black Belts only report to other Black Belts',
          ],
          optionsNL: [
            'Black Belts werken alleen aan documentatie',
            'Black Belts leiden fulltime, cross-functionele projecten en coachen Green Belts',
            'Black Belts gebruiken nooit statistiek',
            'Black Belts rapporteren alleen aan andere Black Belts',
          ],
          correctAnswer: 1,
          explanation: 'A Black Belt works full-time on larger, cross-functional projects, masters advanced statistics, and crucially mentors Green Belts as a change agent.',
          explanationNL: 'Een Black Belt werkt fulltime aan grotere, cross-functionele projecten, beheerst geavanceerde statistiek en coacht cruciaal Green Belts als change agent.',
        },
        {
          id: 'lssbb-q2',
          question: 'In Gage R&R, what does "Repeatability" measure?',
          questionNL: 'Wat meet "Repeatability" in een Gage R&R?',
          options: [
            'Variation between different operators',
            'Variation when the same operator measures the same part repeatedly with the same gage',
            'The true process variation',
            'The difference between specification limits',
          ],
          optionsNL: [
            'Variatie tussen verschillende operators',
            'Variatie wanneer dezelfde operator hetzelfde onderdeel herhaaldelijk meet met hetzelfde instrument',
            'De werkelijke procesvariatie',
            'Het verschil tussen specificatielimieten',
          ],
          correctAnswer: 1,
          explanation: 'Repeatability (equipment variation) is the variation when one operator measures the same part repeatedly with the same instrument. Reproducibility is the between-operator variation.',
          explanationNL: 'Repeatability (equipment variation) is de variatie wanneer één operator hetzelfde onderdeel herhaaldelijk meet met hetzelfde instrument. Reproducibility is de variatie tussen operators.',
        },
        {
          id: 'lssbb-q3',
          question: 'A Gage R&R study returns %GRR = 35%. What should you do?',
          questionNL: 'Een Gage R&R-studie geeft %GRR = 35%. Wat moet je doen?',
          options: [
            'Accept it and continue collecting data',
            'Improve the measurement system before trusting the data',
            'Increase the specification limits',
            'Reduce the sample size',
          ],
          optionsNL: [
            'Accepteren en doorgaan met dataverzameling',
            'Het meetsysteem verbeteren voordat je de data vertrouwt',
            'De specificatielimieten verruimen',
            'De steekproefgrootte verkleinen',
          ],
          correctAnswer: 1,
          explanation: '%GRR above 30% is unacceptable — the measurement system adds too much noise. Fix the gage or measurement method before drawing process conclusions.',
          explanationNL: '%GRR boven 30% is onacceptabel — het meetsysteem voegt te veel ruis toe. Verbeter het instrument of de meetmethode voordat je procesconclusies trekt.',
        },
        {
          id: 'lssbb-q4',
          question: 'Which statistic is used for Attribute Agreement Analysis with pass/fail judgments?',
          questionNL: 'Welke statistiek gebruik je voor Attribute Agreement Analysis bij goed/fout-beoordelingen?',
          options: [
            'Cpk',
            'Kappa statistic',
            'R-squared',
            'F-statistic',
          ],
          optionsNL: [
            'Cpk',
            'Kappa-statistiek',
            'R-kwadraat',
            'F-statistiek',
          ],
          correctAnswer: 1,
          explanation: 'For attribute (categorical) measurement systems, the Kappa statistic measures agreement; Kappa > 0.75 indicates good agreement between and within appraisers.',
          explanationNL: 'Voor attribuut- (categorische) meetsystemen meet de Kappa-statistiek de overeenstemming; Kappa > 0.75 duidt op goede overeenstemming tussen en binnen beoordelaars.',
        },
      ],
    },
  ],
};

// ============================================
// MODULE 2: ADVANCED STATISTICS
// ============================================
const module2: Module = {
  id: 'lssbb-m2',
  title: 'Module 2: Advanced Statistics',
  titleNL: 'Module 2: Geavanceerde Statistiek',
  description: 'Hypothesis testing in depth, ANOVA, chi-square, correlation and regression.',
  descriptionNL: 'Hypothesetesten in de diepte, ANOVA, chi-kwadraat, correlatie en regressie.',
  lessons: [
    {
      id: 'lssbb-l4',
      title: 'Hypothesis Testing in Depth',
      titleNL: 'Hypothesetesten in de Diepte',
      duration: '28:00',
      type: 'video',
      videoUrl: '',
      transcript: `Op Green Belt-niveau heb je kennisgemaakt met hypothesetesten.
Als Black Belt moet je weten welke test je kiest, waarom, en hoe je de
resultaten verdedigt tegenover sceptische stakeholders.

**Het raamwerk**

- **Nulhypothese (H0):** er is geen verschil / geen effect (de status quo).
- **Alternatieve hypothese (Ha):** er is een verschil / een effect.
- **p-waarde:** de kans op je data (of extremer) als H0 waar is.
- **Beslisregel:** p < α (meestal 0.05) → verwerp H0.

**Type I en Type II fouten**

- **Type I (α):** H0 verwerpen terwijl die waar is — een vals alarm. Je
  "ontdekt" een effect dat er niet is.
- **Type II (β):** H0 níet verwerpen terwijl Ha waar is — een gemiste ontdekking.
- **Power (1 − β):** de kans dat je een echt effect detecteert. Streef naar
  power ≥ 0.80. Power stijgt met grotere steekproef, groter effect, en kleinere
  variatie.

**De testkeuze-beslisboom (continue data)**

- 1 groep vs. doelwaarde → 1-sample t-test
- 2 onafhankelijke groepen → 2-sample t-test
- 2 gepaarde metingen → paired t-test
- 3+ groepen → ANOVA
- Variaties vergelijken → F-test / Levene's test
- Normaliteit checken → Anderson-Darling-test

**Discrete / attribuutdata**

- Proporties vergelijken → 1- of 2-proportion test
- Frequentietabellen / onafhankelijkheid → chi-kwadraat-test

**De val van de p-waarde**

Een lage p-waarde betekent statistische significantie, níet praktische
significantie. Met een enorme steekproef wordt een triviaal verschil
"significant". Als Black Belt rapporteer je altijd óók de effectgrootte en het
betrouwbaarheidsinterval — niet alleen p < 0.05.`,
      keyTakeaways: [
        'Type I error (α) is a false alarm; Type II (β) is a missed effect; power = 1 − β, target ≥ 0.80.',
        'Choose the test by data type and group count: t-tests for 1–2 groups, ANOVA for 3+, chi-square for categorical.',
        'Statistical significance (low p) is not practical significance — always report effect size and confidence interval.',
      ],
      keyTakeawaysNL: [
        'Type I-fout (α) is een vals alarm; Type II (β) is een gemist effect; power = 1 − β, streef ≥ 0.80.',
        'Kies de test op datatype en aantal groepen: t-tests voor 1–2 groepen, ANOVA voor 3+, chi-kwadraat voor categorisch.',
        'Statistische significantie (lage p) is geen praktische significantie — rapporteer altijd effectgrootte en betrouwbaarheidsinterval.',
      ],
    },
    {
      id: 'lssbb-l5',
      title: 'ANOVA, Correlation & Regression',
      titleNL: 'ANOVA, Correlatie & Regressie',
      duration: '30:00',
      type: 'video',
      videoUrl: '',
      transcript: `Wanneer je meer dan twee groepen vergelijkt of relaties tussen
variabelen wilt kwantificeren, heb je ANOVA en regressie nodig.

**ANOVA (Analysis of Variance)**

ANOVA test of de gemiddelden van 3+ groepen gelijk zijn. Het verraderlijke punt:
waarom niet gewoon meerdere t-tests? Omdat elke test een α van 0.05 heeft — bij
veel paren stapelt de fout zich op (multiple comparisons probleem). ANOVA toetst
alle groepen tegelijk met één α.

- H0: alle groepsgemiddelden zijn gelijk
- Ha: minstens één gemiddelde verschilt
- De F-statistiek = variatie tússen groepen / variatie bínnen groepen
- Grote F + kleine p → minstens één groep verschilt
- Post-hoc (bijv. Tukey HSD) vertelt je wélke groepen verschillen

**One-way vs. two-way ANOVA**

- One-way: één factor (bijv. machine A/B/C)
- Two-way: twee factoren + hun interactie (bijv. machine × ploeg)

**Correlatie**

De Pearson-correlatiecoëfficiënt r ligt tussen −1 en +1 en meet de sterkte van
een lineaire relatie. Cruciaal: **correlatie is geen causatie**. Twee variabelen
kunnen samenhangen door een derde, verborgen variabele.

**Lineaire regressie**

Regressie geeft je een vergelijking: Y = b0 + b1·X. Daarmee kun je voorspellen
en het effect van X op Y kwantificeren.

- **R²:** het percentage variatie in Y verklaard door het model. R² = 0.85 →
  85% verklaard.
- **p-waarde van de coëfficiënt:** is de helling significant verschillend van nul?
- **Residuen-analyse:** controleer of de residuen willekeurig en normaal zijn —
  een patroon in de residuen betekent dat je model iets mist.

**Multiple regressie**

Met meerdere X'en (Y = b0 + b1·X1 + b2·X2 + …) modelleer je complexere processen.
Let op multicollineariteit (VIF) wanneer X'en onderling correleren.

Deze tools brengen je van "ik denk dat X belangrijk is" naar "X verklaart
bewezen 72% van de variatie, p < 0.001" — precies de bewijslast die een
Black Belt-project nodig heeft.`,
      keyTakeaways: [
        'ANOVA compares 3+ group means with a single α, avoiding the multiple-comparisons inflation of repeated t-tests.',
        'The F-statistic is between-group variation over within-group variation; post-hoc tests (Tukey) reveal which groups differ.',
        'Regression yields Y = b0 + b1·X with R² as variance explained; correlation is not causation, and residuals must be checked.',
      ],
      keyTakeawaysNL: [
        'ANOVA vergelijkt 3+ groepsgemiddelden met één α en vermijdt de foutopstapeling van herhaalde t-tests.',
        'De F-statistiek is variatie tussen groepen gedeeld door variatie binnen groepen; post-hoc tests (Tukey) tonen welke groepen verschillen.',
        'Regressie geeft Y = b0 + b1·X met R² als verklaarde variatie; correlatie is geen causatie, en residuen moeten gecontroleerd worden.',
      ],
    },
    {
      id: 'lssbb-l6',
      title: 'Quiz: Advanced Statistics',
      titleNL: 'Quiz: Geavanceerde Statistiek',
      duration: '12:00',
      type: 'quiz',
      quiz: [
        {
          id: 'lssbb-q5',
          question: 'What is a Type II error?',
          questionNL: 'Wat is een Type II-fout?',
          options: [
            'Rejecting H0 when it is actually true',
            'Failing to reject H0 when Ha is actually true (a missed effect)',
            'Choosing the wrong significance level',
            'Using too large a sample',
          ],
          optionsNL: [
            'H0 verwerpen terwijl die waar is',
            'H0 niet verwerpen terwijl Ha waar is (een gemist effect)',
            'Het verkeerde significantieniveau kiezen',
            'Een te grote steekproef gebruiken',
          ],
          correctAnswer: 1,
          explanation: 'A Type II error (β) is failing to detect a real effect. Power = 1 − β is the probability of detecting a true effect; aim for ≥ 0.80.',
          explanationNL: 'Een Type II-fout (β) is het niet detecteren van een echt effect. Power = 1 − β is de kans dat je een echt effect detecteert; streef naar ≥ 0.80.',
        },
        {
          id: 'lssbb-q6',
          question: 'Why use ANOVA instead of running multiple t-tests across 3+ groups?',
          questionNL: 'Waarom ANOVA gebruiken in plaats van meerdere t-tests over 3+ groepen?',
          options: [
            'ANOVA is easier to compute by hand',
            'Multiple t-tests inflate the overall Type I error rate; ANOVA tests all groups at once with one α',
            'ANOVA does not require any data',
            't-tests cannot be used on continuous data',
          ],
          optionsNL: [
            'ANOVA is makkelijker met de hand te berekenen',
            'Meerdere t-tests blazen de totale Type I-foutkans op; ANOVA toetst alle groepen tegelijk met één α',
            'ANOVA vereist geen data',
            't-tests kunnen niet op continue data',
          ],
          correctAnswer: 1,
          explanation: 'Running many pairwise t-tests stacks the α each time (multiple-comparisons problem). ANOVA controls the family-wise error by testing all group means simultaneously.',
          explanationNL: 'Veel paarsgewijze t-tests stapelen telkens de α op (multiple-comparisons probleem). ANOVA beheerst de totale fout door alle groepsgemiddelden tegelijk te toetsen.',
        },
        {
          id: 'lssbb-q7',
          question: 'In regression, what does R² represent?',
          questionNL: 'Wat stelt R² voor in regressie?',
          options: [
            'The slope of the line',
            'The proportion of variation in Y explained by the model',
            'The probability the data is normal',
            'The number of predictors',
          ],
          optionsNL: [
            'De helling van de lijn',
            'Het aandeel van de variatie in Y dat door het model verklaard wordt',
            'De kans dat de data normaal is',
            'Het aantal voorspellers',
          ],
          correctAnswer: 1,
          explanation: 'R² is the proportion of variance in the response explained by the model (e.g. R² = 0.85 means 85% explained). It does not prove causation.',
          explanationNL: 'R² is het aandeel van de variatie in de uitkomst dat door het model verklaard wordt (bijv. R² = 0.85 betekent 85% verklaard). Het bewijst geen causatie.',
        },
        {
          id: 'lssbb-q8',
          question: 'A correlation of r = 0.9 between two variables proves that one causes the other.',
          questionNL: 'Een correlatie van r = 0.9 tussen twee variabelen bewijst dat de één de ander veroorzaakt.',
          options: [
            'True',
            'False — correlation is not causation; a hidden third variable may drive both',
            'True, but only if r > 0.95',
            'True for continuous data only',
          ],
          optionsNL: [
            'Waar',
            'Onwaar — correlatie is geen causatie; een verborgen derde variabele kan beide aandrijven',
            'Waar, maar alleen als r > 0.95',
            'Waar, maar alleen voor continue data',
          ],
          correctAnswer: 1,
          explanation: 'Correlation only measures the strength of a linear association. Causation requires controlled experimentation (e.g. DOE) to rule out confounding variables.',
          explanationNL: 'Correlatie meet alleen de sterkte van een lineair verband. Causatie vereist gecontroleerd experimenteren (bijv. DOE) om verstorende variabelen uit te sluiten.',
        },
      ],
    },
  ],
};

// ============================================
// MODULE 3: DESIGN OF EXPERIMENTS (DOE)
// ============================================
const module3: Module = {
  id: 'lssbb-m3',
  title: 'Module 3: Design of Experiments (DOE)',
  titleNL: 'Module 3: Design of Experiments (DOE)',
  description: 'Full and fractional factorial designs, interactions, and response surface methodology.',
  descriptionNL: 'Volledige en fractionele factoriële designs, interacties en response surface methodology.',
  lessons: [
    {
      id: 'lssbb-l7',
      title: 'Factorial Experiments',
      titleNL: 'Factoriële Experimenten',
      duration: '28:00',
      type: 'video',
      videoUrl: '',
      transcript: `Design of Experiments (DOE) is misschien wel de krachtigste tool in
de Black Belt-toolkit. Waar regressie kijkt naar data die al bestaat, laat DOE je
het proces actief manipuleren om causale relaties te bewijzen.

**Waarom geen OFAT?**

De intuïtieve aanpak is "One Factor At A Time" (OFAT): verander één ding, kijk wat
er gebeurt, herhaal. OFAT is inefficiënt én — fataal — het mist interacties. Als
factor A alleen effect heeft bij een bepaald niveau van factor B, ziet OFAT dat
nooit.

**Full factorial design**

In een full factorial test je alle combinaties van factorniveaus. Bij k factoren
op 2 niveaus zijn dat 2^k runs:
- 2 factoren → 2² = 4 runs
- 3 factoren → 2³ = 8 runs
- 5 factoren → 2⁵ = 32 runs

Je leert het hoofdeffect van elke factor én alle interacties.

**Main effects & interactions**

- **Hoofdeffect:** de gemiddelde verandering in de respons als je een factor van
  laag naar hoog brengt.
- **Interactie-effect:** wanneer het effect van de ene factor afhangt van het
  niveau van een andere. Interactieplots die níet parallel lopen tonen een
  interactie — exact wat OFAT mist.

**Belangrijke DOE-principes**

- **Randomisatie:** voer runs in willekeurige volgorde uit om sluipende
  tijdseffecten (lurking variables) te middelen.
- **Replicatie:** herhaal runs om de experimentele fout te schatten.
- **Blokkering:** groepeer bekende ruisbronnen (bijv. batch, dag) zodat ze de
  effecten niet vertroebelen.

Een goed ontworpen 2³-experiment met 8 runs vertelt je méér dan 30 ongestructureerde
OFAT-proeven — en met statistisch bewijs.`,
      keyTakeaways: [
        'DOE actively manipulates the process to prove causation, unlike passive regression on existing data.',
        'OFAT is inefficient and structurally blind to interactions; a full factorial tests all 2^k combinations.',
        'The three pillars of sound DOE are randomization, replication, and blocking.',
      ],
      keyTakeawaysNL: [
        'DOE manipuleert het proces actief om causatie te bewijzen, anders dan passieve regressie op bestaande data.',
        'OFAT is inefficiënt en structureel blind voor interacties; een full factorial test alle 2^k combinaties.',
        'De drie pijlers van degelijke DOE zijn randomisatie, replicatie en blokkering.',
      ],
    },
    {
      id: 'lssbb-l8',
      title: 'Fractional Factorials & Response Surface Methodology',
      titleNL: 'Fractionele Factorials & Response Surface Methodology',
      duration: '26:00',
      type: 'video',
      videoUrl: '',
      transcript: `Een full factorial wordt snel duur. Bij 7 factoren zijn dat al
2⁷ = 128 runs. Fractionele factorials en response surface methodology lossen dit op.

**Fractional factorial design**

In plaats van alle combinaties test je een zorgvuldig gekozen fractie (de helft,
een kwart, …). Notatie: 2^(k−p). Een 2^(7−3) test 7 factoren in slechts 16 runs.

De prijs die je betaalt heet **confounding (aliasing):** sommige effecten worden
met elkaar verward. Een hoofdeffect kan vermengd raken met een interactie.

**Resolution**

De "resolutie" vertelt je hoe ernstig de confounding is:
- **Resolution III:** hoofdeffecten verward met 2-factor interacties (riskant)
- **Resolution IV:** hoofdeffecten schoon, maar 2-factor interacties onderling
  verward
- **Resolution V:** hoofdeffecten én 2-factor interacties schoon (zeer wenselijk)

**Screening vs. optimalisatie**

- **Screening designs** (vaak Resolution III/IV, of Plackett-Burman): veel
  factoren snel zeven om de "vital few" te vinden.
- **Optimalisatie:** zoom in op de belangrijke factoren met een full factorial of
  RSM.

**Response Surface Methodology (RSM)**

Factorials gaan ervan uit dat effecten lineair zijn. Maar het optimum ligt vaak op
een gekromd oppervlak. RSM (bijv. Central Composite Design of Box-Behnken) voegt
center- en axiale punten toe om kromming te modelleren en het echte optimum te
vinden — denk aan een berg met een top, niet een helling.

**De DOE-strategie**

1. Screen veel factoren (fractional factorial) → vind de vital few.
2. Karakteriseer de vital few (full factorial) → kwantificeer effecten + interacties.
3. Optimaliseer (RSM) → vind de optimale instellingen.

Dit sequentiële pad bespaart enorm veel runs en levert robuuste, optimale
procesinstellingen op.`,
      keyTakeaways: [
        'Fractional factorials (2^(k−p)) test a chosen fraction of runs at the cost of confounding (aliasing) effects.',
        'Resolution describes confounding severity: III confounds main effects with 2-way interactions, V keeps both clean.',
        'Sequential DOE strategy: screen (fractional) → characterize (full factorial) → optimize (RSM for curvature).',
      ],
      keyTakeawaysNL: [
        'Fractionele factorials (2^(k−p)) testen een gekozen fractie van runs ten koste van confounding (aliasing) van effecten.',
        'Resolutie beschrijft de ernst van confounding: III verwart hoofdeffecten met 2-factor interacties, V houdt beide schoon.',
        'Sequentiële DOE-strategie: screenen (fractional) → karakteriseren (full factorial) → optimaliseren (RSM voor kromming).',
      ],
    },
    {
      id: 'lssbb-l9',
      title: 'Quiz: Design of Experiments',
      titleNL: 'Quiz: Design of Experiments',
      duration: '12:00',
      type: 'quiz',
      quiz: [
        {
          id: 'lssbb-q9',
          question: 'What is the key weakness of the One-Factor-At-A-Time (OFAT) approach?',
          questionNL: 'Wat is de belangrijkste zwakte van de One-Factor-At-A-Time (OFAT) aanpak?',
          options: [
            'It uses too few runs',
            'It cannot detect interactions between factors',
            'It requires expensive software',
            'It only works on attribute data',
          ],
          optionsNL: [
            'Het gebruikt te weinig runs',
            'Het kan interacties tussen factoren niet detecteren',
            'Het vereist dure software',
            'Het werkt alleen op attribuutdata',
          ],
          correctAnswer: 1,
          explanation: 'OFAT changes one factor at a time, so it is structurally blind to interactions — cases where one factor\'s effect depends on the level of another. Factorial DOE captures these.',
          explanationNL: 'OFAT verandert één factor tegelijk en is daardoor structureel blind voor interacties — gevallen waarin het effect van de ene factor afhangt van het niveau van een andere. Factoriële DOE vangt deze wel.',
        },
        {
          id: 'lssbb-q10',
          question: 'How many runs does a full factorial with 4 factors at 2 levels require?',
          questionNL: 'Hoeveel runs vereist een full factorial met 4 factoren op 2 niveaus?',
          options: [
            '8',
            '16',
            '4',
            '32',
          ],
          optionsNL: [
            '8',
            '16',
            '4',
            '32',
          ],
          correctAnswer: 1,
          explanation: 'A full 2-level factorial requires 2^k runs. For k = 4 factors, that is 2⁴ = 16 runs covering every combination.',
          explanationNL: 'Een full 2-niveau factorial vereist 2^k runs. Voor k = 4 factoren is dat 2⁴ = 16 runs die elke combinatie dekken.',
        },
        {
          id: 'lssbb-q11',
          question: 'What price do you pay for using a fractional factorial design?',
          questionNL: 'Welke prijs betaal je voor het gebruik van een fractioneel factorieel design?',
          options: [
            'Higher cost per run',
            'Confounding (aliasing): some effects become indistinguishable from others',
            'It can only test one factor',
            'It requires perfectly normal data',
          ],
          optionsNL: [
            'Hogere kosten per run',
            'Confounding (aliasing): sommige effecten worden ononderscheidbaar van andere',
            'Het kan maar één factor testen',
            'Het vereist perfect normale data',
          ],
          correctAnswer: 1,
          explanation: 'Testing only a fraction of combinations confounds (aliases) some effects together. The design Resolution (III, IV, V) tells you how severe the confounding is.',
          explanationNL: 'Door slechts een fractie van de combinaties te testen, raken sommige effecten geconfound (gealiased). De Resolutie van het design (III, IV, V) vertelt hoe ernstig de confounding is.',
        },
        {
          id: 'lssbb-q12',
          question: 'When would you use Response Surface Methodology (RSM)?',
          questionNL: 'Wanneer gebruik je Response Surface Methodology (RSM)?',
          options: [
            'To screen a large number of factors quickly',
            'To model curvature and find the true optimum of the vital few factors',
            'To replace all hypothesis testing',
            'To measure repeatability of a gage',
          ],
          optionsNL: [
            'Om snel veel factoren te zeven',
            'Om kromming te modelleren en het echte optimum van de vital few factoren te vinden',
            'Om alle hypothesetesten te vervangen',
            'Om de herhaalbaarheid van een meetinstrument te meten',
          ],
          correctAnswer: 1,
          explanation: 'RSM (e.g. Central Composite or Box-Behnken designs) adds center and axial points to model curvature, finding the true optimum after screening has identified the vital few factors.',
          explanationNL: 'RSM (bijv. Central Composite of Box-Behnken designs) voegt center- en axiale punten toe om kromming te modelleren en het echte optimum te vinden nadat screening de vital few factoren heeft geïdentificeerd.',
        },
      ],
    },
  ],
};

// ============================================
// MODULE 4: ADVANCED CAPABILITY & SPC
// ============================================
const module4: Module = {
  id: 'lssbb-m4',
  title: 'Module 4: Advanced Capability & Statistical Process Control',
  titleNL: 'Module 4: Geavanceerde Capability & Statistische Procesbeheersing',
  description: 'Cp/Cpk/Pp/Ppk, the 1.5σ shift, DPMO, and advanced control-chart rules.',
  descriptionNL: 'Cp/Cpk/Pp/Ppk, de 1.5σ-verschuiving, DPMO en geavanceerde control-chart regels.',
  lessons: [
    {
      id: 'lssbb-l10',
      title: 'Process Capability: Cp, Cpk, Pp, Ppk',
      titleNL: 'Procescapability: Cp, Cpk, Pp, Ppk',
      duration: '28:00',
      type: 'video',
      videoUrl: '',
      transcript: `Capability-indices vertalen procesvariatie naar één getal dat
managers begrijpen: kan dit proces leveren binnen de specificaties? ProjeXtPal's
ingebouwde capability-engine berekent deze indices live — in deze les leer je wat
ze echt betekenen.

**Cp — potentiële capability**

Cp = (USL − LSL) / (6σ). Het vergelijkt de breedte van de specificatie met de
breedte van het proces (6 standaarddeviaties). Cp negeert centrering — het zegt
alleen of het proces *zou kunnen* passen.

- Cp = 1.0 → proces vult precies de specificatie (3σ aan elke kant)
- Cp = 1.33 → 4σ-proces, industrienorm voor "capabel"
- Cp = 2.0 → 6σ-proces, wereldklasse

**Cpk — werkelijke capability**

Cpk = min[(USL − μ) / 3σ, (μ − LSL) / 3σ]. Het houdt wél rekening met centrering.
Als Cpk veel lager is dan Cp, staat je proces uit het midden.

- Cpk = Cp → perfect gecentreerd
- Cpk < Cp → off-center; verschuif het gemiddelde voordat je variatie aanpakt
- Cpk ≥ 1.33 → algemeen geaccepteerd als capabel

**Cp/Cpk vs. Pp/Ppk — "within" vs. "overall"**

- **Cp/Cpk** gebruiken de *within-subgroup* (korte-termijn) variatie — wat het
  proces kan op zijn best.
- **Pp/Ppk** gebruiken de *overall* (lange-termijn) variatie — inclusief drift
  tussen subgroepen.

Het gat tussen Cpk en Ppk onthult instabiliteit over de tijd. Een groot gat
betekent: je proces is op het moment goed maar dwaalt af.

**De 1.5σ-verschuiving**

Six Sigma gaat ervan uit dat een proces op lange termijn ~1.5σ verschuift. Daarom
levert een "6 sigma"-proces 3.4 DPMO op (niet 2 ppb): 6σ − 1.5σ = 4.5σ effectief.
Dit verklaart waarom de Six Sigma-doelstelling zo robuust is.

**DPMO**

Defects Per Million Opportunities = (defecten / (eenheden × opportunities)) ×
1.000.000. Het normaliseert kwaliteit zodat je een factuurproces met een
lasproces kunt vergelijken. De ProjeXtPal-engine berekent DPMO via de
complementaire foutfunctie en mapt het terug naar een sigma-niveau.`,
      keyTakeaways: [
        'Cp measures potential capability ignoring centering; Cpk accounts for how off-center the process mean is.',
        'Cp/Cpk use short-term within-subgroup variation; Pp/Ppk use long-term overall variation — the gap reveals drift.',
        'The 1.5σ long-term shift is why a 6σ process yields 3.4 DPMO (6σ − 1.5σ = 4.5σ effective).',
      ],
      keyTakeawaysNL: [
        'Cp meet potentiële capability zonder centrering; Cpk houdt rekening met hoever het procesgemiddelde uit het midden ligt.',
        'Cp/Cpk gebruiken korte-termijn within-subgroup variatie; Pp/Ppk gebruiken lange-termijn overall variatie — het gat onthult drift.',
        'De 1.5σ lange-termijnverschuiving verklaart waarom een 6σ-proces 3.4 DPMO oplevert (6σ − 1.5σ = 4.5σ effectief).',
      ],
    },
    {
      id: 'lssbb-l11',
      title: 'Advanced SPC: Control Chart Rules',
      titleNL: 'Geavanceerde SPC: Control-Chart Regels',
      duration: '24:00',
      type: 'video',
      videoUrl: '',
      transcript: `Op Green Belt-niveau lees je een control chart af op "punt buiten
de limieten". Als Black Belt detecteer je subtielere instabiliteit met de Nelson-
en Western Electric-regels, en kies je de juiste chart voor je datatype.

**Common cause vs. special cause**

- **Common cause:** de inherente, willekeurige ruis van een stabiel proces. Niet
  reageren op individuele punten — dat is "tampering" en vergroot juist de variatie
  (Deming's funnel experiment).
- **Special cause:** een toewijsbare, ongewone bron. Daar moet je op acteren.

De kunst is onderscheiden welke je ziet. Daarvoor dienen de regels.

**De Nelson-regels (1–4, de meest gebruikte)**

1. Eén punt > 3σ van de centerlijn (klassieke out-of-control)
2. 9 opeenvolgende punten aan dezelfde kant van de centerlijn (een shift)
3. 6 opeenvolgende punten gestaag stijgend of dalend (een trend)
4. 14 opeenvolgende punten die afwisselend op en neer gaan (over-controlling)

(Regels 5–8 dekken zones bij 1σ/2σ.) De ProjeXtPal-SPC-engine evalueert Nelson-
regels 1–4 automatisch en markeert overtredingen.

**De juiste chart kiezen**

- **Continue data, subgroepen:** X̄-R (gemiddelde + range) of X̄-S
- **Continue data, losse metingen:** I-MR (individuals + moving range)
- **Defectieven (goed/fout per eenheid):** p-chart (variabele n) of np-chart (vaste n)
- **Defecten (tellingen per eenheid):** c-chart (vaste n) of u-chart (variabele n)

**Rationale subgrouping**

De manier waarop je subgroepen vormt bepaalt wat de chart kan detecteren. Groepeer
zo dat within-subgroup variatie alleen common cause bevat, en between-subgroup
variatie de special causes vangt.

Een Black Belt gebruikt SPC niet alleen reactief om defecten te vangen, maar als
het hart van het Control-plan: de borging die voorkomt dat een dure DMAIC-winst
na zes maanden wegdrijft.`,
      keyTakeaways: [
        'Distinguish common cause (random, do not tamper) from special cause (assignable, act on it) — overreacting inflates variation.',
        'Nelson rules 1–4 detect subtle instability: a point beyond 3σ, a 9-point shift, a 6-point trend, and 14-point oscillation.',
        'Match the chart to the data: X̄-R / I-MR for continuous, p/np for defectives, c/u for defect counts.',
      ],
      keyTakeawaysNL: [
        'Onderscheid common cause (willekeurig, niet ingrijpen) van special cause (toewijsbaar, acteren) — overreageren vergroot variatie.',
        'Nelson-regels 1–4 detecteren subtiele instabiliteit: een punt buiten 3σ, een shift van 9 punten, een trend van 6 punten en oscillatie van 14 punten.',
        'Stem de chart af op de data: X̄-R / I-MR voor continu, p/np voor defectieven, c/u voor defecttellingen.',
      ],
    },
    {
      id: 'lssbb-l12',
      title: 'Quiz: Capability & SPC',
      titleNL: 'Quiz: Capability & SPC',
      duration: '12:00',
      type: 'quiz',
      quiz: [
        {
          id: 'lssbb-q13',
          question: 'What is the key difference between Cp and Cpk?',
          questionNL: 'Wat is het belangrijkste verschil tussen Cp en Cpk?',
          options: [
            'Cp uses long-term data, Cpk uses short-term data',
            'Cp ignores process centering; Cpk accounts for how off-center the mean is',
            'Cp is for attribute data, Cpk for continuous data',
            'There is no difference',
          ],
          optionsNL: [
            'Cp gebruikt lange-termijndata, Cpk korte-termijndata',
            'Cp negeert centrering; Cpk houdt rekening met hoever het gemiddelde uit het midden ligt',
            'Cp is voor attribuutdata, Cpk voor continue data',
            'Er is geen verschil',
          ],
          correctAnswer: 1,
          explanation: 'Cp measures potential capability (spec width vs. process width) ignoring location. Cpk penalizes an off-center mean. When Cpk < Cp, the process is off-center.',
          explanationNL: 'Cp meet potentiële capability (specbreedte vs. procesbreedte) zonder locatie. Cpk straft een off-center gemiddelde af. Als Cpk < Cp, staat het proces uit het midden.',
        },
        {
          id: 'lssbb-q14',
          question: 'Why does a "6 sigma" process correspond to 3.4 DPMO rather than ~2 defects per billion?',
          questionNL: 'Waarom komt een "6 sigma"-proces overeen met 3.4 DPMO in plaats van ~2 defecten per miljard?',
          options: [
            'Because of rounding errors',
            'Because of the assumed 1.5σ long-term process shift (6σ − 1.5σ = 4.5σ effective)',
            'Because DPMO is always 3.4',
            'Because the specification limits move',
          ],
          optionsNL: [
            'Door afrondingsfouten',
            'Door de aangenomen 1.5σ lange-termijnverschuiving (6σ − 1.5σ = 4.5σ effectief)',
            'Omdat DPMO altijd 3.4 is',
            'Omdat de specificatielimieten verschuiven',
          ],
          correctAnswer: 1,
          explanation: 'Six Sigma assumes the process mean drifts ~1.5σ over the long term. A 6σ design therefore operates at an effective 4.5σ, which yields 3.4 DPMO.',
          explanationNL: 'Six Sigma neemt aan dat het procesgemiddelde op lange termijn ~1.5σ afdwaalt. Een 6σ-ontwerp werkt daardoor effectief op 4.5σ, wat 3.4 DPMO oplevert.',
        },
        {
          id: 'lssbb-q15',
          question: 'Which Nelson rule signals a process shift?',
          questionNL: 'Welke Nelson-regel signaleert een procesverschuiving (shift)?',
          options: [
            'One point beyond 3σ',
            'Nine consecutive points on the same side of the centerline',
            'Six consecutive increasing points',
            'Fourteen points alternating up and down',
          ],
          optionsNL: [
            'Eén punt buiten 3σ',
            'Negen opeenvolgende punten aan dezelfde kant van de centerlijn',
            'Zes opeenvolgende stijgende punten',
            'Veertien punten die afwisselend op en neer gaan',
          ],
          correctAnswer: 1,
          explanation: 'Nelson rule 2 — nine consecutive points on one side of the centerline — indicates a sustained shift in the process mean. Rule 1 is the single out-of-control point, rule 3 a trend.',
          explanationNL: 'Nelson-regel 2 — negen opeenvolgende punten aan één kant van de centerlijn — duidt op een aanhoudende verschuiving van het procesgemiddelde. Regel 1 is het enkele out-of-control punt, regel 3 een trend.',
        },
        {
          id: 'lssbb-q16',
          question: 'You should adjust a stable process every time a single point moves away from the center. True or false?',
          questionNL: 'Je moet een stabiel proces bijstellen telkens als een enkel punt van het midden afwijkt. Waar of onwaar?',
          options: [
            'True — always react to keep it centered',
            'False — reacting to common-cause variation is tampering and increases variation',
            'True, but only on p-charts',
            'True for continuous data only',
          ],
          optionsNL: [
            'Waar — reageer altijd om het gecentreerd te houden',
            'Onwaar — reageren op common-cause variatie is tampering en vergroot de variatie',
            'Waar, maar alleen op p-charts',
            'Waar, maar alleen voor continue data',
          ],
          correctAnswer: 1,
          explanation: 'Reacting to common-cause (random) variation is "tampering" — Deming\'s funnel experiment shows it actually increases variation. Only act on special-cause signals.',
          explanationNL: 'Reageren op common-cause (willekeurige) variatie is "tampering" — Deming\'s funnel experiment toont dat het de variatie juist vergroot. Acteer alleen op special-cause signalen.',
        },
      ],
    },
  ],
};

// ============================================
// MODULE 5: LEADERSHIP, FINANCIAL VALIDATION & CAPSTONE
// ============================================
const module5: Module = {
  id: 'lssbb-m5',
  title: 'Module 5: Leadership, Financial Validation & Capstone',
  titleNL: 'Module 5: Leiderschap, Financiële Validatie & Capstone',
  description: 'Mentoring Green Belts, leading change, validating savings with Finance, and the capstone project.',
  descriptionNL: 'Green Belts coachen, verandering leiden, besparingen valideren met Finance, en het capstone-project.',
  lessons: [
    {
      id: 'lssbb-l13',
      title: 'Mentoring Green Belts & Leading Change',
      titleNL: 'Green Belts Coachen & Verandering Leiden',
      duration: '24:00',
      type: 'video',
      videoUrl: '',
      transcript: `De technische helft van Black Belt is nu compleet. De andere helft —
en wat een Black Belt écht effectief maakt — is leiderschap. Je leidt teams,
coacht Green Belts, en stuurt verandering door een organisatie die vaak weerstand
biedt.

**Coachen, geen overnemen**

Als Black Belt is de verleiding groot om het Green Belt-project gewoon zelf op te
lossen. Dat is een fout. Je rol is de Green Belt te ontwikkelen:
- Stel vragen in plaats van antwoorden te geven ("Welke data heb je om dat te
  staven?")
- Review hun DMAIC-tollgates en daag de logica uit
- Laat hen de presentatie aan de Champion zelf doen — jij staat ernaast
- Vier hun successen, niet die van jou

**Change leadership: Kotter's 8 stappen**

Verbeteringen mislukken zelden om technische redenen — ze mislukken omdat mensen
ze niet adopteren. Kotter's raamwerk:
1. Creëer urgentie
2. Vorm een leidende coalitie
3. Ontwikkel een visie
4. Communiceer de visie
5. Verwijder obstakels (empower)
6. Creëer korte-termijnwinsten
7. Bouw voort op de winst (consolideer)
8. Veranker in de cultuur

**Weerstand managen**

Weerstand is informatie, geen vijand. De vraag is níet "hoe overwin ik weerstand"
maar "wat vertelt deze weerstand mij?" Vaak wijst het op een echt risico dat je
plan mist, of op stakeholders die te laat betrokken zijn.

**RACI en stakeholdermanagement**

Maak per verbeterproject expliciet wie Responsible, Accountable, Consulted en
Informed is. De meeste verbeterprojecten ontsporen op onduidelijke accountability,
niet op gebrekkige statistiek.

Een Black Belt die de statistiek beheerst maar niet de mensen, levert briljante
analyses die in een la verdwijnen. Beide helften zijn niet-onderhandelbaar.`,
      keyTakeaways: [
        'Mentor Green Belts by asking questions and reviewing their tollgates — develop them, don\'t solve their project for them.',
        'Improvements fail on adoption, not analysis; use Kotter\'s 8 steps to lead change and treat resistance as information.',
        'Make accountability explicit with RACI — most projects derail on unclear ownership, not weak statistics.',
      ],
      keyTakeawaysNL: [
        'Coach Green Belts door vragen te stellen en hun tollgates te reviewen — ontwikkel hen, los hun project niet voor hen op.',
        'Verbeteringen mislukken op adoptie, niet op analyse; gebruik Kotter\'s 8 stappen om verandering te leiden en behandel weerstand als informatie.',
        'Maak accountability expliciet met RACI — de meeste projecten ontsporen op onduidelijke eigenaarschap, niet op zwakke statistiek.',
      ],
    },
    {
      id: 'lssbb-l14',
      title: 'Financial Validation & Champion Sign-off',
      titleNL: 'Financiële Validatie & Champion Sign-off',
      duration: '22:00',
      type: 'video',
      videoUrl: '',
      transcript: `Een Black Belt-project is pas klaar als de besparing financieel is
gevalideerd en de Champion heeft getekend. Zonder dit is je "verbetering" een
schatting, geen feit — en het management gelooft schattingen niet.

**Waarom Finance mee moet tekenen**

Black Belts hebben de neiging besparingen te overschatten (optimisme, dubbeltellingen,
het meenemen van baten die toch al zouden komen). Daarom valideert een onafhankelijke
financiële controller élke claim. Een besparing die Finance niet erkent, bestaat
voor het management niet.

**Hard vs. soft savings**

- **Hard savings:** direct terug te zien in het budget — minder materiaal, minder
  FTE, lagere afkeur, minder garantieclaims. Dit telt voor je projectresultaat.
- **Soft savings:** cost avoidance, tijdsbesparing die niet vrijgemaakt wordt,
  betere klanttevredenheid. Reëel, maar apart rapporteren — niet optellen bij hard
  savings.

**Het validatieproces**

1. Stel de baseline vast vóór de verbetering (in geld).
2. Meet de na-situatie over een representatieve periode.
3. Reken het verschil om naar jaarbasis.
4. Trek implementatiekosten af → netto besparing.
5. Laat de financiële controller de cijfers en de methode tekenen.

**Tollgate review & Champion sign-off**

Elke DMAIC-fase eindigt met een tollgate: de Champion beoordeelt of de fase
solide is afgerond voordat het project doorgaat. De finale sign-off bevestigt:
- Het probleem is opgelost (data toont het)
- De winst is financieel gevalideerd
- Het Control-plan borgt de winst (SPC, eigenaarschap, reactieplan)
- De geleerde lessen zijn vastgelegd

**Koppeling met ProjeXtPal & Finance**

In het Inclufy-ecosysteem koppelt een Black Belt-project zijn gevalideerde
besparing aan het portfolio: de Champion-sign-off is de gate, en de financiële
controller bevestigt het bedrag. Pas dan telt de winst mee in de
portfolio-benefits — exact de governance-gate die voorkomt dat niet-gevalideerde
claims het portfolio opblazen.`,
      keyTakeaways: [
        'A project is not done until savings are financially validated by an independent controller and the Champion signs off.',
        'Separate hard savings (budget-visible) from soft savings (cost avoidance) — never add soft savings to the project result.',
        'Each DMAIC phase ends in a tollgate; final sign-off confirms problem solved, savings validated, control plan in place, lessons captured.',
      ],
      keyTakeawaysNL: [
        'Een project is pas klaar als de besparing onafhankelijk financieel is gevalideerd en de Champion heeft getekend.',
        'Scheid hard savings (zichtbaar in budget) van soft savings (cost avoidance) — tel soft savings nooit bij het projectresultaat op.',
        'Elke DMAIC-fase eindigt in een tollgate; de finale sign-off bevestigt: probleem opgelost, besparing gevalideerd, control-plan aanwezig, lessen vastgelegd.',
      ],
    },
    {
      id: 'lssbb-l15',
      title: 'Black Belt Capstone Project',
      titleNL: 'Black Belt Capstone Project',
      duration: '40:00',
      type: 'reading',
      transcript: `**Black Belt Capstone Project**

Dit capstone bewijst dat je een volledig Black Belt-project kunt leiden van Define
tot Control, met geavanceerde statistiek én leiderschap. Kies een reëel proces uit
je eigen organisatie (of een gedetailleerde case) en lever het volledige DMAIC-
dossier op.

**Define**
- Project Charter met probleemstelling, scope (SIPOC), doel (SMART) en business case.
- Stakeholderanalyse + RACI. Benoem je Champion en (gesimuleerde) Green Belt-mentee.

**Measure**
- Voer een Gage R&R uit op je belangrijkste meting en rapporteer %GRR en ndc.
  Toon aan dat je meetsysteem te vertrouwen is (of beschrijf hoe je het verbeterde).
- Stel de baseline vast: baseline-capability (Cp/Cpk én Pp/Ppk) en baseline-DPMO.

**Analyze**
- Formuleer minimaal twee hypotheses over grondoorzaken.
- Test ze met de juiste statistiek (t-test, ANOVA, chi-kwadraat of regressie) en
  rapporteer p-waarden, effectgroottes én betrouwbaarheidsintervallen — niet alleen
  "p < 0.05".

**Improve**
- Ontwerp en analyseer een DOE (minimaal een 2³ full of een fractioneel factorial)
  om de optimale procesinstellingen te vinden. Bespreek hoofdeffecten en minstens
  één interactie.
- Beschrijf de pilot en het change-managementplan (Kotter / weerstandsmanagement).

**Control**
- Kies en onderbouw de juiste control chart. Definieer de Nelson-regels die je
  bewaakt en het reactieplan.
- Lever het Control-plan met eigenaarschap en monitoring-frequentie.

**Financiële validatie & sign-off**
- Bereken de netto jaarlijkse besparing (hard savings), gescheiden van soft savings.
- Beschrijf hoe de financiële controller en de Champion tekenen, en hoe de
  gevalideerde besparing in het portfolio terechtkomt.

**Reflectie (leiderschap)**
- Beschrijf hoe je je Green Belt-mentee hebt gecoacht en welke weerstand je
  tegenkwam en managede.

Lever een gestructureerd verslag (10–20 pagina's) of presentatie in. Dit dossier
plus het eindexamen vormen samen de basis voor je Black Belt-certificering.`,
      keyTakeaways: [
        'The capstone requires a full DMAIC dossier: charter, Gage R&R, hypothesis tests with effect sizes, a DOE, a control plan, and financial validation.',
        'You must demonstrate both advanced statistics (MSA, ANOVA/regression, DOE, capability, SPC) and leadership (mentoring, change management).',
        'Validated hard savings, separated from soft savings, must be signed off by Finance and the Champion before counting in the portfolio.',
      ],
      keyTakeawaysNL: [
        'Het capstone vereist een volledig DMAIC-dossier: charter, Gage R&R, hypothesetesten met effectgroottes, een DOE, een control-plan en financiële validatie.',
        'Je moet zowel geavanceerde statistiek (MSA, ANOVA/regressie, DOE, capability, SPC) als leiderschap (coaching, change management) aantonen.',
        'Gevalideerde hard savings, gescheiden van soft savings, moeten door Finance en de Champion worden getekend voordat ze meetellen in het portfolio.',
      ],
    },
    {
      id: 'lssbb-l16',
      title: 'Final Exam: Lean Six Sigma Black Belt',
      titleNL: 'Eindexamen: Lean Six Sigma Black Belt',
      duration: '45:00',
      type: 'exam',
      quiz: [
        {
          id: 'lssbb-e1',
          question: 'A Gage R&R returns %GRR = 8% and ndc = 6. What is the correct interpretation?',
          questionNL: 'Een Gage R&R geeft %GRR = 8% en ndc = 6. Wat is de juiste interpretatie?',
          options: [
            'The measurement system is unacceptable and must be fixed',
            'The measurement system is acceptable; you can trust the data',
            'The process capability is 8%',
            'The specification limits are too narrow',
          ],
          optionsNL: [
            'Het meetsysteem is onacceptabel en moet verbeterd worden',
            'Het meetsysteem is acceptabel; je kunt de data vertrouwen',
            'De procescapability is 8%',
            'De specificatielimieten zijn te smal',
          ],
          correctAnswer: 1,
          explanation: '%GRR below 10% and ndc ≥ 5 both indicate an acceptable measurement system — the gage adds little noise and can distinguish parts well.',
          explanationNL: '%GRR onder 10% en ndc ≥ 5 duiden beide op een acceptabel meetsysteem — het instrument voegt weinig ruis toe en kan onderdelen goed onderscheiden.',
        },
        {
          id: 'lssbb-e2',
          question: 'You compare the mean output of 4 machines. Which test is appropriate?',
          questionNL: 'Je vergelijkt de gemiddelde output van 4 machines. Welke test is gepast?',
          options: [
            'A series of 2-sample t-tests',
            'One-way ANOVA',
            'Chi-square test',
            'Gage R&R',
          ],
          optionsNL: [
            'Een reeks 2-sample t-tests',
            'One-way ANOVA',
            'Chi-kwadraat-test',
            'Gage R&R',
          ],
          correctAnswer: 1,
          explanation: 'With 3+ groups, one-way ANOVA tests all means at once with a single α, avoiding the Type I error inflation of multiple pairwise t-tests.',
          explanationNL: 'Bij 3+ groepen toetst one-way ANOVA alle gemiddelden tegelijk met één α en vermijdt de Type I-foutopstapeling van meerdere paarsgewijze t-tests.',
        },
        {
          id: 'lssbb-e3',
          question: 'A regression model has R² = 0.45 and a coefficient p-value of 0.002. What is true?',
          questionNL: 'Een regressiemodel heeft R² = 0.45 en een coëfficiënt-p-waarde van 0.002. Wat klopt?',
          options: [
            'The predictor is statistically significant, but the model explains only 45% of the variation',
            'The model is useless because R² < 0.5',
            'The predictor causes the response',
            'The model explains 0.2% of the variation',
          ],
          optionsNL: [
            'De voorspeller is statistisch significant, maar het model verklaart slechts 45% van de variatie',
            'Het model is waardeloos omdat R² < 0.5',
            'De voorspeller veroorzaakt de uitkomst',
            'Het model verklaart 0.2% van de variatie',
          ],
          correctAnswer: 0,
          explanation: 'p = 0.002 means the predictor is statistically significant, but R² = 0.45 means 55% of variation is unexplained — other factors matter. Significance does not prove causation.',
          explanationNL: 'p = 0.002 betekent dat de voorspeller statistisch significant is, maar R² = 0.45 betekent dat 55% van de variatie onverklaard blijft — andere factoren spelen mee. Significantie bewijst geen causatie.',
        },
        {
          id: 'lssbb-e4',
          question: 'A 2^(5−1) fractional factorial is Resolution V. What does this guarantee?',
          questionNL: 'Een 2^(5−1) fractioneel factorial is Resolution V. Wat garandeert dit?',
          options: [
            'No experiment is needed',
            'Main effects and 2-factor interactions are not confounded with each other',
            'Only one factor is tested',
            'The data must be attribute data',
          ],
          optionsNL: [
            'Er is geen experiment nodig',
            'Hoofdeffecten en 2-factor interacties zijn niet met elkaar geconfound',
            'Er wordt maar één factor getest',
            'De data moet attribuutdata zijn',
          ],
          correctAnswer: 1,
          explanation: 'Resolution V keeps both main effects and 2-factor interactions clean (unconfounded with each other), making it highly desirable for characterization.',
          explanationNL: 'Resolution V houdt zowel hoofdeffecten als 2-factor interacties schoon (niet onderling geconfound), wat het zeer wenselijk maakt voor karakterisering.',
        },
        {
          id: 'lssbb-e5',
          question: 'A process has Cp = 1.8 but Cpk = 0.9. What is the priority action?',
          questionNL: 'Een proces heeft Cp = 1.8 maar Cpk = 0.9. Wat is de prioriteitsactie?',
          options: [
            'Reduce the process variation',
            'Re-center the process mean — it is off-center',
            'Widen the specification limits',
            'Nothing — the process is capable',
          ],
          optionsNL: [
            'Verminder de procesvariatie',
            'Hercentreer het procesgemiddelde — het staat uit het midden',
            'Verruim de specificatielimieten',
            'Niets — het proces is capabel',
          ],
          correctAnswer: 1,
          explanation: 'Cp = 1.8 shows the process is narrow enough to fit easily, but Cpk = 0.9 shows it is badly off-center. Re-centering the mean will lift Cpk toward Cp before any variation work.',
          explanationNL: 'Cp = 1.8 toont dat het proces smal genoeg is om makkelijk te passen, maar Cpk = 0.9 toont dat het flink uit het midden staat. Hercentreren tilt Cpk richting Cp, nog vóór enig variatiewerk.',
        },
        {
          id: 'lssbb-e6',
          question: 'A control chart shows 9 consecutive points just above the centerline, all within the control limits. What does this indicate?',
          questionNL: 'Een control chart toont 9 opeenvolgende punten net boven de centerlijn, allemaal binnen de controlelimieten. Wat duidt dit aan?',
          options: [
            'Nothing — all points are within limits',
            'A special-cause shift in the process mean (Nelson rule 2)',
            'A measurement error',
            'The specification limits are wrong',
          ],
          optionsNL: [
            'Niets — alle punten liggen binnen de limieten',
            'Een special-cause verschuiving van het procesgemiddelde (Nelson-regel 2)',
            'Een meetfout',
            'De specificatielimieten kloppen niet',
          ],
          correctAnswer: 1,
          explanation: 'Even within control limits, 9 consecutive points on one side (Nelson rule 2) signals a sustained shift — a special cause to investigate, not random noise.',
          explanationNL: 'Zelfs binnen de controlelimieten signaleren 9 opeenvolgende punten aan één kant (Nelson-regel 2) een aanhoudende verschuiving — een special cause om te onderzoeken, geen willekeurige ruis.',
        },
        {
          id: 'lssbb-e7',
          question: 'Why must Finance independently validate a Black Belt project\'s savings?',
          questionNL: 'Waarom moet Finance de besparing van een Black Belt-project onafhankelijk valideren?',
          options: [
            'It is a legal requirement in all countries',
            'Black Belts tend to overestimate savings; an independent controller confirms the claim is real',
            'Finance owns all the data',
            'To slow down the project',
          ],
          optionsNL: [
            'Het is in alle landen een wettelijke verplichting',
            'Black Belts overschatten besparingen vaak; een onafhankelijke controller bevestigt dat de claim echt is',
            'Finance bezit alle data',
            'Om het project te vertragen',
          ],
          correctAnswer: 1,
          explanation: 'Project leaders tend to overestimate savings (optimism, double-counting). An independent Finance sign-off ensures only validated savings count toward results and the portfolio.',
          explanationNL: 'Projectleiders overschatten besparingen vaak (optimisme, dubbeltellingen). Een onafhankelijke Finance-sign-off zorgt dat alleen gevalideerde besparingen meetellen voor resultaten en het portfolio.',
        },
        {
          id: 'lssbb-e8',
          question: 'What is the best way for a Black Belt to support a Green Belt on a project?',
          questionNL: 'Wat is de beste manier voor een Black Belt om een Green Belt op een project te ondersteunen?',
          options: [
            'Take over and solve the project personally',
            'Coach by asking questions and reviewing tollgates, letting the Green Belt lead',
            'Tell the Green Belt every answer in advance',
            'Avoid involvement until the final review',
          ],
          optionsNL: [
            'Het project overnemen en zelf oplossen',
            'Coachen door vragen te stellen en tollgates te reviewen, terwijl de Green Belt leidt',
            'De Green Belt vooraf elk antwoord geven',
            'Pas bij de eindreview betrokken raken',
          ],
          correctAnswer: 1,
          explanation: 'The Black Belt develops the Green Belt by coaching — asking questions, challenging logic at tollgates, and letting them lead — rather than taking the project over.',
          explanationNL: 'De Black Belt ontwikkelt de Green Belt door te coachen — vragen stellen, de logica bij tollgates uitdagen en hen laten leiden — in plaats van het project over te nemen.',
        },
        {
          id: 'lssbb-e9',
          question: 'What does the 1.5σ shift account for in Six Sigma?',
          questionNL: 'Waar houdt de 1.5σ-verschuiving rekening mee in Six Sigma?',
          options: [
            'Short-term measurement error',
            'Long-term drift of the process mean, so a 6σ design runs at an effective 4.5σ',
            'The width of the specification',
            'Operator fatigue',
          ],
          optionsNL: [
            'Korte-termijn meetfout',
            'Lange-termijndrift van het procesgemiddelde, zodat een 6σ-ontwerp effectief op 4.5σ draait',
            'De breedte van de specificatie',
            'Vermoeidheid van de operator',
          ],
          correctAnswer: 1,
          explanation: 'The 1.5σ shift models long-term drift of the process mean. A 6σ process therefore operates at an effective 4.5σ, producing the famous 3.4 DPMO.',
          explanationNL: 'De 1.5σ-verschuiving modelleert lange-termijndrift van het procesgemiddelde. Een 6σ-proces werkt daardoor effectief op 4.5σ en levert de bekende 3.4 DPMO op.',
        },
        {
          id: 'lssbb-e10',
          question: 'Which sequence reflects the correct sequential DOE strategy?',
          questionNL: 'Welke volgorde weerspiegelt de juiste sequentiële DOE-strategie?',
          options: [
            'Optimize → characterize → screen',
            'Screen (fractional) → characterize (full factorial) → optimize (RSM)',
            'Full factorial only, always',
            'RSM first, then screening',
          ],
          optionsNL: [
            'Optimaliseren → karakteriseren → screenen',
            'Screenen (fractional) → karakteriseren (full factorial) → optimaliseren (RSM)',
            'Altijd alleen full factorial',
            'Eerst RSM, daarna screenen',
          ],
          correctAnswer: 1,
          explanation: 'Efficient DOE moves from screening many factors (fractional factorial) to characterizing the vital few (full factorial) to optimizing with RSM to model curvature.',
          explanationNL: 'Efficiënte DOE gaat van het screenen van veel factoren (fractional factorial) naar het karakteriseren van de vital few (full factorial) naar optimaliseren met RSM om kromming te modelleren.',
        },
      ],
    },
    {
      id: 'lssbb-l17',
      title: 'Certificate: Lean Six Sigma Black Belt',
      titleNL: 'Certificaat: Lean Six Sigma Black Belt',
      duration: '2:00',
      type: 'certificate',
    },
  ],
};

// ============================================
// MODULE LIST
// ============================================
export const leanSixSigmaBlackBeltModules: Module[] = [
  module1,
  module2,
  module3,
  module4,
  module5,
];

// ============================================
// COURSE DEFINITION
// ============================================
export const leanSixSigmaBlackBeltCourse: Course = {
  id: 'lean-six-sigma-black-belt',
  title: 'Lean Six Sigma Black Belt',
  titleNL: 'Lean Six Sigma Black Belt',
  description: 'Go beyond Green Belt: advanced statistics, MSA, Design of Experiments, capability & SPC, and the leadership to mentor Green Belts and validate savings.',
  descriptionNL: 'Verder dan Green Belt: geavanceerde statistiek, MSA, Design of Experiments, capability & SPC, en het leiderschap om Green Belts te coachen en besparingen te valideren.',
  icon: Sigma,
  color: BRAND.blue,
  gradient: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyan})`,
  category: 'advanced',
  methodology: 'lean_six_sigma',
  levels: 5,
  modules: leanSixSigmaBlackBeltModules.reduce((total, m) => total + m.lessons.length, 0),
  duration: 40,
  rating: 4.9,
  students: 1842,
  tags: ['Lean', 'Six Sigma', 'Black Belt', 'DOE', 'MSA', 'ANOVA', 'Regression', 'Capability', 'SPC', 'Leadership'],
  tagsNL: ['Lean', 'Six Sigma', 'Black Belt', 'DOE', 'MSA', 'ANOVA', 'Regressie', 'Capability', 'SPC', 'Leiderschap'],
  instructor: instructors.mark,
  featured: false,
  bestseller: false,
  new: true,
  freeForCustomers: true,
  certificate: true,
  whatYouLearn: [
    'The Black Belt role: leading cross-functional projects and mentoring Green Belts',
    'Measurement System Analysis: Gage R&R, %GRR, ndc, attribute agreement',
    'Hypothesis testing in depth: Type I/II errors, power, the right test for the data',
    'ANOVA, correlation and regression for multi-group and predictive analysis',
    'Design of Experiments: full & fractional factorials, interactions, RSM',
    'Advanced capability: Cp/Cpk/Pp/Ppk, the 1.5σ shift, DPMO',
    'Advanced SPC: Nelson rules and choosing the right control chart',
    'Change leadership, financial validation and Champion sign-off',
  ],
  whatYouLearnNL: [
    'De Black Belt rol: cross-functionele projecten leiden en Green Belts coachen',
    'Meetsysteemanalyse: Gage R&R, %GRR, ndc, attribute agreement',
    'Hypothesetesten in de diepte: Type I/II-fouten, power, de juiste test voor de data',
    'ANOVA, correlatie en regressie voor multi-groep en voorspellende analyse',
    'Design of Experiments: volledige & fractionele factorials, interacties, RSM',
    'Geavanceerde capability: Cp/Cpk/Pp/Ppk, de 1.5σ-verschuiving, DPMO',
    'Geavanceerde SPC: Nelson-regels en de juiste control chart kiezen',
    'Change leadership, financiële validatie en Champion sign-off',
  ],
  requirements: [
    'Lean Six Sigma Green Belt (or equivalent DMAIC experience)',
    'Comfort with basic statistics and Excel',
    'A real process to apply the capstone to',
  ],
  requirementsNL: [
    'Lean Six Sigma Green Belt (of vergelijkbare DMAIC-ervaring)',
    'Vertrouwd met basisstatistiek en Excel',
    'Een reëel proces om het capstone op toe te passen',
  ],
  targetAudience: [
    'Green Belts ready to step up to full-time improvement leadership',
    'Quality and operations managers driving strategic change',
    'Continuous improvement professionals mentoring teams',
    'Anyone pursuing Black Belt certification',
  ],
  targetAudienceNL: [
    'Green Belts die klaar zijn voor fulltime verbeterleiderschap',
    'Quality- en operations managers die strategische verandering aansturen',
    'Continuous improvement professionals die teams coachen',
    'Iedereen die Black Belt-certificering nastreeft',
  ],
  courseModules: leanSixSigmaBlackBeltModules,
};
