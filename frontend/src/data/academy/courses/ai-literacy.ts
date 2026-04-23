// ============================================
// COURSE: AI LITERACY FOR PROJECT PROFESSIONALS
// ============================================
// What AI actually is, how it works, and how to use it responsibly
// in project management and knowledge work. EU AI Act aware.
// ============================================

import { Sparkles } from 'lucide-react';
import { Course, Module } from '../types';
import { BRAND } from '../brand';
import { instructors } from '../instructors';


// ============================================
// MODULE 1: FOUNDATIONS — WAT AI IS (EN WAT HET NIET IS)
// ============================================
const module1: Module = {
  id: 'ail-m1',
  title: 'Module 1: Foundations — What AI Is (and Is Not)',
  titleNL: 'Module 1: Fundamenten — Wat AI Is (en Niet)',
  description: 'Clear definitions: AI vs ML vs LLMs vs agents, capabilities and hard limits.',
  descriptionNL: 'Heldere definities: AI vs ML vs LLMs vs agents, mogelijkheden en harde grenzen.',
  order: 0,
  icon: 'Sparkles',
  color: '#A855F7',
  gradient: 'linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)',
  lessons: [
    {
      id: 'ail-l1',
      title: 'AI, ML, LLMs, Agents — Untangling the Vocabulary',
      titleNL: 'AI, ML, LLMs, Agents — Het vocabulaire ontward',
      duration: '14:00',
      type: 'video',
      videoUrl: '',
      free: true,
      icon: 'Brain',
      transcript: `Welkom bij AI Letterlijke Kennis voor Projectprofessionals. We
beginnen met het belangrijkste dat elke projectmanager moet kunnen: het verschil
uitleggen tussen AI, Machine Learning, Large Language Models, en agents — zonder
fouten, en zonder hype.

**Artificial Intelligence (AI)**

AI is de paraplu-term. Het verwijst naar elk systeem dat taken uitvoert waar we
traditioneel menselijke intelligentie voor nodig hadden: beelden herkennen, taal
begrijpen, beslissingen nemen, spellen spelen. AI als veld bestaat sinds 1956
(de Dartmouth Workshop). De 70 jaar daarna was vooral wachten tot de computers
krachtig genoeg waren.

**Machine Learning (ML)**

Machine Learning is een deelgebied van AI. Het idee: in plaats van expliciet
regels te programmeren ("als X dan Y"), laat je een algoritme patronen ontdekken
in data. Voorbeelden: spam filters, kredietscoring, Netflix aanbevelingen. ML
bestaat al decennia. De meeste "AI" die je sinds ~2010 hebt gezien — was ML.

**Deep Learning**

Deep Learning is een deelgebied van ML dat neurale netwerken met véél lagen
gebruikt. Doorbraken vanaf 2012 (AlexNet voor beeldherkenning) tot 2017
(Transformer architectuur). Deep learning heeft mogelijk gemaakt wat daarvoor
onmogelijk was: menselijk-niveau beeldherkenning, realtime vertaling, en...

**Large Language Models (LLMs)**

...LLMs. Dit zijn de sterren van 2022-2026. Modellen zoals GPT-4, Claude,
Gemini, Llama. Ze zijn getraind op enorme hoeveelheden tekst en kunnen taal
begrijpen en genereren op een niveau dat we 10 jaar geleden onmogelijk achtten.

Belangrijk: een LLM is een specifiek soort deep learning model, dat een specifiek
soort taak kan: de volgende tokens voorspellen. ALL andere capaciteiten die je
ziet — samenvatten, code schrijven, redeneren — zijn emergent gedrag dat volgt
uit dat ene doel.

**Agents**

Een agent is een LLM dat in een loop draait, met tools. Typisch:
1. LLM leest een taak
2. LLM kiest een tool om uit te voeren (bijv. web search, code uitvoeren,
   een API aanroepen)
3. Tool geeft resultaat terug
4. LLM besluit: klaar, of volgende stap?

Claude Code, Cursor's agent mode, ChatGPT's agent mode — dit zijn agents. Ze zijn
géén super-intelligentie; ze zijn een LLM met een run-loop en tool access.

**Wat AI NIET is**

- AI is geen bewustzijn. Een LLM "begrijpt" niets in de filosofische zin.
- AI is niet altijd deterministisch. Dezelfde prompt kan twee verschillende
  antwoorden geven.
- AI is geen database. Een LLM weet niet wat het niet weet; het vult gaten in
  met plausibel klinkende tekst ("hallucinaties").
- AI vervangt niet je oordeel. Het is een assistent, geen beslisser.

**De sleutelfrase voor deze cursus**

Gedurende deze cursus zullen we één ding blijven herhalen: **AI is een gereedschap
dat je moet aansturen, controleren, en waar je verantwoording voor draagt.**
Niet een orakel, niet een collega, niet je baas.

**Key Takeaways**

- AI > ML > Deep Learning > LLMs > Agents — een hiërarchie van algemeen naar
  specifiek
- LLMs doen token-predictie, al hun andere gedragingen zijn emergent
- Agents = LLM in een loop met tools
- AI is geen bewustzijn, geen database, geen beslisser — het is een gereedschap`,
      keyTakeaways: [
        'AI vs ML vs Deep Learning vs LLMs vs Agents: een duidelijke hiërarchie',
        'LLMs doen één ding: volgende-token predictie — de rest is emergent',
        'Agents = LLMs in een loop met tool access',
        'AI heeft geen bewustzijn, is geen database, neemt geen beslissingen voor jou',
        'Jij draagt verantwoordelijkheid voor AI-output die jij gebruikt',
      ],
    },
    {
      id: 'ail-l2',
      title: 'How LLMs Work — Tokens, Prediction, Context Windows',
      titleNL: 'Hoe LLMs Werken — Tokens, Predictie, Context Windows',
      duration: '16:00',
      type: 'video',
      videoUrl: '',
      free: false,
      icon: 'Cpu',
      transcript: `Om AI goed te gebruiken moet je globaal begrijpen wat er onder
de motorkap gebeurt. Je hoeft geen wiskunde te kunnen; je moet wel de
denkmodellen hebben.

**Tokens**

Een LLM leest geen letters of woorden — het leest tokens. Een token is ongeveer
4 karakters Engels, of ~3 karakters Nederlands. "Projectmanagement" = ongeveer
5 tokens. Elke API-call wordt per token afgerekend, en elk model heeft een
maximum aan tokens per conversatie (de "context window").

**Volgende-token predictie**

De hele LLM is getraind op één taak: gegeven een reeks tokens, voorspel de
volgende. Dat is het. Alles wat je ziet — de AI die een essay schrijft, code
debugt, een vergadering samenvat — is die ene taak in een loop uitgevoerd.

Voorbeeld: je typt "Een goede projectmanager is vooral..." en de LLM geeft
token voor token: "een", "goede", "luisteraar", ".", stop.

**Waarom het vaak accuraat klinkt**

LLMs zijn getraind op vele miljarden documenten — boeken, Wikipedia,
wetenschappelijke papers, GitHub code. Door die enorme data hebben ze
patronen geleerd die *er uitzien als* kennis. Maar het blijft statistiek: het
meest-waarschijnlijke-volgende-token gegeven de context.

**Waarom het soms hallucineert**

Als je een LLM vraagt naar een specifiek feit dat zelden in de trainingsdata
voorkomt — of helemaal niet — dan is er geen duidelijk "meest-waarschijnlijke"
token. Het model vult de leegte in met iets dat plausibel klinkt. Dat heet een
hallucinatie. Het lijkt op kennis maar is het niet.

**Concreet voorbeeld**

"Wie heeft de Nobel Prize for Chemistry 2023 gewonnen?" → een LLM dat daarvoor
getraind is antwoordt correct: Moungi Bawendi, Louis Brus, Alexei Ekimov
(quantum dots).

"Wat was de eerste zin van de scriptie die Moungi Bawendi in 1988 verdedigde?"
→ geen enkele LLM kent dat detail. Maar veel modellen zullen een antwoord
*verzinnen* omdat de prompt-vorm suggereert dat een antwoord bestaat. Dat is
een hallucinatie.

**Context window**

Elke LLM heeft een maximum aan tokens dat het in één conversatie kan
verwerken. GPT-4 Turbo: 128k tokens (~300 pagina's). Claude 3.7 Sonnet: 200k
tokens (~500 pagina's). Claude Opus 4.7 1M: 1 miljoen tokens (~2500 pagina's).
Als je context window volloopt, vergeet het model het begin van de conversatie.

**Wat dit voor jou betekent**

1. Geef het model de relevante context — het kan niet "iets erbij opzoeken"
   tenzij jij het of een tool geeft.
2. Vraag voor specifieke feiten om een bron, en verifieer die bron zelf.
3. Houd conversaties gefocust; lange zijsprongen vullen je context window met
   ruis.

**Key Takeaways**

- LLMs werken met tokens, niet met woorden
- De enige taak is volgende-token predictie
- Alles wat accuraat lijkt is aangeleerde patronen; alles wat fout is, is meestal
  het gevolg van patronen invullen waar geen data was
- Context window = werkgeheugen van de conversatie; overloop veroorzaakt
  vergeten`,
      keyTakeaways: [
        'LLMs lezen tokens (~4 karakters), niet letters of woorden',
        'De enige core-taak is volgende-token predictie',
        'Hallucinaties ontstaan waar trainingsdata ontbrak',
        'Context windows zijn eindig (128k-1M tokens)',
        'Geef altijd expliciete context; vraag om bronnen',
      ],
    },
    {
      id: 'ail-l3',
      title: 'Capabilities and Hard Limits',
      titleNL: 'Wat AI Kan, en Wat Echt Niet',
      duration: '12:00',
      type: 'video',
      videoUrl: '',
      icon: 'Scale',
      transcript: `Om AI veilig en effectief in te zetten heb je een realistisch beeld
nodig van wat het kan en wat het niet kan. Marketing praat vaak over beide kanten.

**Wat AI goed kan (2026 state of the art)**

- Tekst samenvatten, vertalen, herformuleren
- Code schrijven voor bekende problemen (90%+ accuraat op leetcode-achtige taken)
- Documenten doorzoeken en vragen beantwoorden (retrieval-augmented generation)
- Gestructureerde output maken (JSON, tabellen, e-mails in een consistente stijl)
- Creatief brainstormen (ideeën-quantity, niet per se quality)
- Beeldherkenning en beeldgeneratie (Stable Diffusion, DALL-E, Midjourney)
- Spraak-naar-tekst transcriberen (Whisper)
- Vergaderingen samenvatten uit transcript

**Wat AI nog niet betrouwbaar kan**

- Rekenen (LLMs maken rekenfouten bij niet-triviale sommen; gebruik een
  calculator-tool)
- Recente feiten kennen (trainingsdata heeft een cutoff-datum; nieuwer = niet
  geweten)
- Jouw specifieke context kennen (tenzij je het geeft — via context of RAG)
- Deterministisch zijn (dezelfde vraag = soms verschillende antwoorden)
- Oorzaak-en-gevolg redeneren bij nieuwe scenario's
- Verantwoordelijkheid dragen (dat blijft jouw taak)

**Wat AI bijna nooit goed kan**

- Unieke inzichten geven (een LLM geeft de *gemiddelde* mening van zijn
  trainingsdata; die is bijna nooit inzichtelijk)
- Werkelijke creativiteit (remixen van bestaand werk is geen creativiteit)
- Professionele oordelen maken waarvoor aansprakelijkheid geldt (medisch,
  juridisch, financieel advies — daar is een vakprofessional voor)
- Emoties begrijpen (het patroon-matcht op emotionele taal, maar voelt niets)

**De "AI kan dat ook" val**

Als je al expert bent, herken je dat AI 70-80% van een taak doet. Voor de laatste
20% heb je domeinkennis nodig — nuance, context, oordeel. Dat is de val:
non-experts zien de 70-80% output en denken dat de taak klaar is. De 20%
missende laag is wat een expert onderscheidt van een amateur.

Voorbeeld: AI kan een contract opstellen dat juridisch klopt. Het kan niet zien
dat dit specifieke contract jouw bedrijf in deze specifieke situatie blootstelt
aan een risico dat alleen een advocaat met branche-ervaring herkent.

**De golden rule voor projectmanagers**

Gebruik AI voor:
- Drafts die je nog steeds zelf bewerkt
- Brainstormen waarbij je filtert
- Samenvatten van teksten die jij kunt verifiëren
- Patroon-herkenning in data waar jij eindverantwoordelijk voor bent

Gebruik AI NIET voor:
- Definitieve beslissingen zonder menselijke review
- Unieke oordelen over klanten, medewerkers, of stakeholders
- Juridische, medische, of financiële adviezen die uitgaan naar klanten
- Taken waar aansprakelijkheid bij fout ernstig is

**Key Takeaways**

- AI is goed voor drafts, samenvatten, brainstormen, code-op-bekende-patronen
- AI is zwak voor rekenen, recente feiten, jouw specifieke context, unieke
  inzichten
- De laatste 20% van elke taak vereist domeinkennis — dat is nog steeds jouw job
- Golden rule: AI draft → jij bewerkt → jij besluit`,
      keyTakeaways: [
        'Sterke punten: samenvatten, vertalen, drafts, code, beeldherkenning',
        'Zwakke punten: rekenen, recente feiten, unieke oordelen, jouw context',
        'De "laatste 20%" vereist nog steeds domeinkennis',
        'Golden rule: AI draft, jij bewerkt, jij besluit, jij draagt verantwoording',
      ],
    },
    {
      id: 'ail-l4',
      title: 'Module 1 Quiz',
      titleNL: 'Module 1 Quiz',
      duration: '10:00',
      type: 'quiz',
      videoUrl: '',
      icon: 'HelpCircle',
      transcript: '',
      content: 'Quiz over de fundamenten: AI/ML/LLM vocabulaire, tokens, context windows, en capabilities/limits.',
    },
  ],
};


// ============================================
// MODULE 2: AI FOR PROJECT PROFESSIONALS
// ============================================
const module2: Module = {
  id: 'ail-m2',
  title: 'Module 2: AI in Your Project Work',
  titleNL: 'Module 2: AI in Jouw Projectwerk',
  description: 'Concrete use cases and workflows: status reports, risk registers, meeting notes, stakeholder comms.',
  descriptionNL: 'Concrete use cases en workflows: statusrapporten, risicoregisters, vergadernotulen, stakeholder communicatie.',
  order: 1,
  icon: 'Briefcase',
  color: '#8B5CF6',
  gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
  lessons: [
    {
      id: 'ail-l5',
      title: 'Ten AI Use Cases for Project Managers',
      titleNL: 'Tien AI Use Cases voor Projectmanagers',
      duration: '18:00',
      type: 'video',
      videoUrl: '',
      icon: 'CheckSquare',
      transcript: `Hier zijn tien concrete AI use cases die je vandaag kunt toepassen
in je project management werk. Voor elk: wat je vraagt, wat je krijgt, en waar
je op moet letten.

**1. Status rapport samenvatten**

Input: je laatste 5 stand-up notulen of Jira updates.
Vraag: "Schrijf een executive summary van 3 alinea's in Nederlandse zakelijke
stijl."
Let op: controleer dat de AI geen percentages of data verzint die niet in de
input stonden. Laat expliciet zeggen: "Gebruik alleen informatie uit de
onderstaande notities."

**2. Risico-register genereren**

Input: projectscope en context.
Vraag: "Genereer 15 risico's voor dit project, gecategoriseerd (technisch,
schedule, financieel, operationeel). Geef per risico: waarschijnlijkheid
(laag/middel/hoog), impact, mitigatie."
Let op: de AI mist waarschijnlijk 2-3 risico's die alleen iemand met jouw
domeinkennis ziet. Behandel de output als een brainstorm-startpunt, niet als
een compleet register.

**3. Vergadernotulen maken**

Input: transcript van een meeting (bijv. via Whisper of Teams/Zoom).
Vraag: "Extraheer beslissingen, actiepunten (met eigenaar + deadline), en open
vragen."
Let op: AI is goed in extractie, slecht in impliciete afspraken begrijpen. Check
dat alle actie-eigenaren klopt.

**4. Stakeholder-mail opstellen**

Input: het onderwerp, de stakeholder context, jouw standpunt.
Vraag: "Schrijf een e-mail in een formele-maar-warme toon, max 300 woorden, met
één duidelijke call-to-action."
Let op: lees hem voor je verstuurt. AI kiest soms formuleringen die in jouw
cultuur net niet passen.

**5. User stories van requirements**

Input: business requirements document.
Vraag: "Converteer naar user stories in het INVEST-format. Een per user-type."
Let op: user stories uit AI zijn vaak te generiek. Je moet acceptatiecriteria
zelf verscherpen.

**6. Test cases genereren uit user stories**

Input: user story.
Vraag: "Schrijf 8 test cases: 4 happy-path, 2 edge cases, 2 error cases."
Let op: AI mist vaak regressie-scenario's en security cases. Voeg die zelf toe.

**7. Project charter draften**

Input: projectdoel, scope, stakeholders.
Vraag: "Schrijf een project charter volgens PRINCE2 structuur."
Let op: gebruik de methodologie die jouw organisatie gebruikt, niet wat AI
default aanneemt.

**8. Retrospective inzichten**

Input: retro notities van 5 sprints.
Vraag: "Identificeer terugkerende thema's en patronen. Groepeer per categorie."
Let op: AI is goed in patroon-herkenning maar mist de context "waarom dit
thema maar niet opgelost wordt" — vaak politieke of organisationele redenen.

**9. Lessons learned uit closed projects**

Input: project closure documentatie.
Vraag: "Extraheer lessons learned in een format van situatie / actie / uitkomst
/ aanbeveling."
Let op: AI genereert generieke lessons als er weinig data is. Wees kritisch op
welke lesson jouw organisatie daadwerkelijk toepassingsgericht maakt.

**10. Presentatie-outlines**

Input: onderwerp + doelgroep + duur.
Vraag: "Maak een slide-outline met hoofdpunten en spreker-notities."
Let op: de outline is een startpunt. Voeg jouw voorbeelden, jouw cijfers, en
jouw verhaal toe.

**Gemeenschappelijke principe**

Voor elke use case: AI levert de *eerste versie*, jij levert de *definitieve
versie*. Verwacht 60-80% tijdsbesparing, niet 100%. Plan de review-tijd in.

**Key Takeaways**

- 10 concrete use cases: status, risico's, notulen, mails, user stories,
  tests, charter, retro, lessons, slides
- AI = eerste versie; jij = definitieve versie
- Verwacht 60-80% tijdsbesparing, niet volledige automatisering`,
      keyTakeaways: [
        '10 use cases die je vandaag kunt toepassen',
        'Elke case: AI draft → jouw review',
        '60-80% tijdsbesparing is realistisch',
        'Domeinkennis blijft voor de laatste 20%',
      ],
    },
    {
      id: 'ail-l6',
      title: 'Prompting Well — Structure, Context, Examples',
      titleNL: 'Goed Prompten — Structuur, Context, Voorbeelden',
      duration: '15:00',
      type: 'video',
      videoUrl: '',
      icon: 'MessageSquare',
      transcript: `Prompt engineering is niet magie. Het is duidelijke communicatie met een
junior medewerker die alles heeft gelezen maar niets van jouw organisatie weet.

**Het 4-onderdelen recept**

Elke goede prompt heeft vier delen:

1. **Rol** — wie moet AI zijn? "Je bent een senior projectmanager met 15 jaar
   ervaring in financial services."
2. **Context** — de achtergrond. "We leveren een CRM-vervanging voor 3000
   gebruikers in 4 kwartalen."
3. **Taak** — wat wil je? "Draft een stakeholder-mail over een vertraging van
   2 weken."
4. **Output-format** — hoe wil je het? "Max 200 woorden, formele toon,
   duidelijke CTA."

**Few-shot examples**

Wil je een specifieke schrijfstijl? Geef een voorbeeld:

"Schrijf in deze stijl:
[Voorbeeld van jouw eerdere e-mail]

Nu schrijf je een nieuwe e-mail over <onderwerp> in dezelfde stijl."

Few-shot examples werken beter dan alle adjectieven van de wereld.

**Chain of thought**

Voor complexe taken: vraag om stap-voor-stap denken.

"Analyseer dit risico. Denk eerst hardop: wat is de onderliggende oorzaak? Wat
is het worst-case scenario? Wat zijn 3 mitigaties? Evalueer elke mitigatie op
kosten en effectiviteit. Kies er één."

Chain-of-thought maakt fouten zichtbaar — je kunt de redenering checken.

**Anti-patronen**

- "Schrijf een goed document" → "goed" is betekenisloos voor AI. Specificeer.
- Vaag: "Maak het beter" → specificeer wat "beter" betekent (korter? formeler?
  meer voorbeelden?)
- 100-regel prompts zonder structuur → splitsen in duidelijke secties werkt
  beter.
- Geen output-format → je krijgt wat de AI denkt dat je wilt; specificeer altijd.

**Het prompten iteratief**

Verwacht niet dat je eerste prompt perfect is. Flow:

1. Probeer
2. Wat is er niet goed? (te lang, verkeerde toon, fout detail?)
3. Voeg die constraint toe aan je prompt
4. Herhaal

Na 2-3 iteraties heb je meestal een sjabloon dat je kunt hergebruiken.

**Voorbeeld — voor-na**

Slecht: "Schrijf een status update voor mijn manager"

Goed: "Schrijf een wekelijkse status update voor mijn Program Director.
**Context**: We zijn in week 12 van 24. We liggen 1 sprint achter op plan wegens
een kritieke beveiliging findings. **Format**: 3 secties — Voortgang, Risico's,
Beslispunten. Max 250 woorden totaal. Zakelijke toon. Geen bullet points in de
eerste sectie; gebruik proza. **Voorbeeld van mijn eerdere updates voor toon**:
[eerder bericht]"

Het tweede levert 80% van de tijd een bruikbaar resultaat. Het eerste bijna
nooit.

**Key Takeaways**

- 4 onderdelen per prompt: Rol, Context, Taak, Output-format
- Few-shot examples > adjectieven
- Chain-of-thought voor complexe taken
- Iteratief prompten; sla bruikbare sjablonen op`,
      keyTakeaways: [
        'Elke prompt = Rol + Context + Taak + Output-format',
        'Voorbeelden van goede output werken beter dan abstracte beschrijvingen',
        'Chain-of-thought maakt redenering reviewbaar',
        'Sla werkende prompts op als sjabloon',
      ],
    },
    {
      id: 'ail-l7',
      title: 'Practice: Draft a Risk Register with AI',
      titleNL: 'Praktijk: Stel een Risicoregister op met AI',
      duration: '20:00',
      type: 'practice',
      videoUrl: '',
      icon: 'ShieldAlert',
      transcript: '',
      content: 'Schrijf een prompt die uit een gegeven project-context een risicoregister van 10-15 items produceert. Evalueer vervolgens: welke risico\'s miste het? Welke waren niet relevant? Welke zou een domein-expert anders geformuleerd hebben?',
    },
    {
      id: 'ail-l8',
      title: 'Module 2 Quiz',
      titleNL: 'Module 2 Quiz',
      duration: '10:00',
      type: 'quiz',
      videoUrl: '',
      icon: 'HelpCircle',
      transcript: '',
      content: 'Toets op use cases, prompt-structuur, en het draften van project-artifacts met AI.',
    },
  ],
};


// ============================================
// MODULE 3: GOVERNANCE, ETHICS & THE EU AI ACT
// ============================================
const module3: Module = {
  id: 'ail-m3',
  title: 'Module 3: Governance, Ethics & the EU AI Act',
  titleNL: 'Module 3: Governance, Ethiek & de EU AI Act',
  description: 'Hallucinations, bias, privacy, IP, and regulatory frameworks you must know (especially the EU AI Act).',
  descriptionNL: 'Hallucinaties, bias, privacy, IP, en regelgeving die je moet kennen (met name de EU AI Act).',
  order: 2,
  icon: 'Scale',
  color: '#DC2626',
  gradient: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
  lessons: [
    {
      id: 'ail-l9',
      title: 'Hallucinations — Why They Happen and How to Catch Them',
      titleNL: 'Hallucinaties — Waarom Ze Gebeuren en Hoe Je Ze Pakt',
      duration: '12:00',
      type: 'video',
      videoUrl: '',
      icon: 'AlertTriangle',
      transcript: `Een hallucinatie is wanneer een AI plausibel-klinkende tekst genereert
die feitelijk onjuist is. Het is de #1 risico bij professioneel AI-gebruik.

**Waarom ze gebeuren**

LLMs doen volgende-token predictie. Als de vraag een specifiek feit vereist dat
zelden of niet in de trainingsdata zat, zoekt het model naar het
*meest-waarschijnlijke* token — en dat is vaak plausibel klinkend maar onjuist.

Voorbeeld: "Wat was de omzet van Philips in Q3 2024?" → een LLM dat daarvoor
niet getraind is kan een cijfer geven dat klopt-qua-ordegrootte maar niet-qua-feit.

**Types hallucinaties**

1. **Feit-hallucinatie**: verzint een datum, cijfer, naam
2. **Citaat-hallucinatie**: verzint een bronnaam of quote
3. **Code-hallucinatie**: verzint een functie of library die niet bestaat
4. **Relatie-hallucinatie**: verzint een verband tussen twee dingen die niet
   bestaan

**Hoe herken je een hallucinatie?**

- Het klopt *net iets te goed* bij wat je hoopt te horen
- Het bevat een specifiek cijfer, datum, of naam
- Je kunt de bron niet snel verifiëren
- Bij doorvragen ("kun je de bron geven?") geeft het model een bron die niet
  bestaat

**Mitigaties**

1. **Ground de AI met retrieval** — geef de AI expliciet de bron (bijv.
   ProjeXtPal's RAG over jouw project-documentatie).
2. **Vraag om bronverwijzing** — en verifieer.
3. **Voor feiten die er toe doen** — gebruik AI als eerste pass, dan Google,
   dan primaire bron.
4. **Zeg expliciet** "Als je het niet zeker weet, zeg 'ik weet het niet'" —
   werkt soms.
5. **Dubbele verificatie** — vraag een ander model of een andere sessie
   dezelfde vraag.

**Key Takeaways**

- Hallucinaties zijn statistisch onvermijdelijk bij LLMs
- Meest risicovol bij: specifieke feiten, cijfers, bronnen, code-libraries
- Mitigaties: ground met retrieval, vraag bronnen, verifieer primaire bron,
  gebruik meerdere runs`,
      keyTakeaways: [
        'Hallucinaties zijn inherent aan hoe LLMs werken',
        '4 types: feit, citaat, code, relatie',
        'Mitigaties: retrieval-augmented generation, bron-verificatie, dubbele runs',
        'Voor belangrijke feiten altijd terug naar primaire bron',
      ],
    },
    {
      id: 'ail-l10',
      title: 'Bias, Fairness & Representation',
      titleNL: 'Bias, Eerlijkheid & Representatie',
      duration: '12:00',
      type: 'video',
      videoUrl: '',
      icon: 'Users',
      transcript: `AI-systemen zijn getraind op data die historische en maatschappelijke bias
bevat. Als je AI-output klakkeloos overneemt, propageer je die bias verder.

**Waar bias vandaan komt**

- Trainingsdata: ondergerepresenteerde groepen zijn minder zichtbaar
- Labeling: menselijke reviewers hebben impliciete vooroordelen
- Feedback loops: als AI-output nieuwe trainingsdata wordt, versterkt bias zichzelf

**Concrete voorbeelden in project-werk**

- Persona's die alleen mannelijke managers en vrouwelijke assistenten opleveren
- Code reviews die stylistische voorkeuren uit één ecosysteem als "best practice"
  markeren
- Wervingsbeschrijvingen die woorden gebruiken die aantoonbaar meer mannen
  aantrekken dan vrouwen
- Risico-inschattingen die systematisch de impact op niet-westerse stakeholders
  onderschatten

**Mitigaties**

1. Bewust divers in prompts ("maak een lijst met 5 stakeholders, divers in
   geslacht, leeftijd en achtergrond")
2. Spot-check output — klopt de verdeling met jouw werkelijkheid?
3. Externe review — laat iemand met een ander perspectief lezen
4. Documenteer welke AI je wanneer gebruikt voor welke beslissing

**Key Takeaways**

- Bias in = bias out
- Project-werk waar bias hard aankomt: persona's, reviews, wervingsteksten,
  risicoweging
- Mitigatie = bewuste prompting + menselijke review + documentatie`,
      keyTakeaways: [
        'Bias komt uit trainingsdata, labeling, en feedback loops',
        'Risicogebieden: persona\'s, reviews, wervingstaal, risicoweging',
        'Mitigatie = bewust prompten + spot-check + diverse reviewers',
      ],
    },
    {
      id: 'ail-l11',
      title: 'Privacy, Data Leakage & Intellectual Property',
      titleNL: 'Privacy, Datalekken & Intellectueel Eigendom',
      duration: '14:00',
      type: 'video',
      videoUrl: '',
      icon: 'Lock',
      transcript: `Als projectprofessional werk je met klantgegevens, persoonsgegevens,
vertrouwelijke informatie, en intellectueel eigendom. AI-tools kunnen elk van die
lekken als je niet oppast.

**Data leakage risico's**

1. **Klantdata in een publieke AI**: als je ChatGPT prompt met klantnamen en
   contracten, kan OpenAI die data gebruiken voor training (behalve bij de
   Enterprise tier). Zelfs anders blijven ze in logs.
2. **Code-snippets met secrets**: API keys, database passwords, interne
   endpoint URLs in je prompts lekken bij de provider.
3. **Geheime strategie**: M&A plannen, salarisgegevens, juridische strategie —
   nooit in een openbaar model.

**De regel van drie**

Voor elk stuk informatie dat je aan AI geeft, vraag:
1. Als dit morgen in de krant staat, is dat een ramp?
2. Zou ik dit op een publiek forum posten?
3. Heb ik toestemming van de eigenaar?

Als één antwoord "nee" is: niet in de prompt.

**Intellectueel eigendom**

- Door AI gegenereerde output is juridisch vaak niet auteursrechtelijk
  beschermd (afhankelijk van jurisdictie)
- Door AI gegenereerde code kan per ongeluk GPL-licentie code uit training
  kopiëren
- Je klant kan jouw AI-gegenereerde deliverable betwisten als "niet origineel
  werk"

**Wat je moet doen**

1. Gebruik enterprise tiers met zero-data-retention (Claude API, Azure OpenAI,
   ChatGPT Enterprise)
2. Lees het Data Processing Agreement van je AI provider
3. Documenteer welke AI waar gebruikt is (lineage)
4. Bespreek met juristen welke content AI-gegenereerd mag zijn

**Key Takeaways**

- Publieke AI-tools = potentieel datalek
- Regel van drie: krant-test, publiek forum-test, toestemming-test
- IP: check licentie van trainingsdata + contractsafspraken met klant
- Mitigatie: enterprise tiers, DPA lezen, gebruik documenteren`,
      keyTakeaways: [
        'Nooit klantdata/secrets/strategie in publieke AI-tools',
        'Regel van drie: krant, forum, toestemming',
        'Enterprise tiers (zero-data-retention) voor zakelijk gebruik',
        'Documenteer AI-gebruik voor audit en compliance',
      ],
    },
    {
      id: 'ail-l12',
      title: 'The EU AI Act — What You Must Know',
      titleNL: 'De EU AI Act — Wat Je Moet Weten',
      duration: '16:00',
      type: 'video',
      videoUrl: '',
      icon: 'Landmark',
      transcript: `De EU AI Act is de eerste alomvattende AI-regelgeving ter wereld. In
werking sinds augustus 2024, met gefaseerde deadlines tot 2027. Voor
projectprofessionals in Europa: verplichte kennis.

**De risico-classificatie**

De EU AI Act classificeert AI-systemen in 4 niveaus:

1. **Onaanvaardbaar risico** — verboden (per februari 2025)
   - Social scoring door overheden
   - Emotieherkenning op werkplek of school
   - Subliminale manipulatie
   - Predictive policing op basis van profilering

2. **Hoog risico** — strenge verplichtingen (per augustus 2026/2027)
   - HR-systemen voor werving, promotie, evaluatie
   - Educatie en examinering
   - Kritieke infrastructuur
   - Wetshandhaving
   - Migratiebeheer en justitie

3. **Beperkt risico** — transparantie-verplichtingen
   - Chatbots (moeten zich als AI identificeren)
   - AI-gegenereerde content (moet als zodanig gemarkeerd worden)
   - Deepfakes (duidelijk als synthetisch aangeduid)

4. **Minimaal risico** — vrijwillige codes
   - Spam filters, videogames, etc.

**General-Purpose AI (GPAI)**

Voor foundation models (GPT-4, Claude, Gemini, Llama): aparte regels sinds
augustus 2025. Transparantie over trainingsdata, copyright-naleving, risico-
beheer voor systemic-risk modellen.

**Wat jij moet doen**

Als jij AI integreert in een product of dienst dat onder hoog-risico valt:

1. **Risico-management systeem** opzetten
2. **Datasets governance** — hoe is de data verzameld, gebalanceerd,
   gevalideerd?
3. **Technische documentatie** — hoe werkt het systeem, wat zijn de grenzen?
4. **Log-requirements** — automatische logging van beslissingen
5. **Menselijke oversight** — mensen moeten kunnen ingrijpen
6. **Nauwkeurigheid, robuustheid, cybersecurity** aantoonbaar
7. **Conformiteitsbeoordeling** vóór in-gebruikname
8. **CE-markering** en registratie

**Boetes**

- Tot €35 miljoen of 7% van wereldwijde omzet (onaanvaardbaar risico-systemen)
- Tot €15 miljoen of 3% (andere overtredingen)
- Tot €7.5 miljoen of 1% (onjuiste informatie aan autoriteiten)

**Praktijk voor een projectmanager**

- Als je AI-tools gebruikt in HR, onderwijs, of overheidsdienstverlening: check
  of je "deployer" of "provider" bent onder de Act
- Documenteer alle AI-gebruik in projectdeliverables
- Als je AI-output toegankelijk maakt voor eindgebruikers: markeer het
- Schaal je project voor EU-markt en gebruikt het AI? Betrek legal + compliance
  vroeg

**Key Takeaways**

- 4 risico-niveaus: onaanvaardbaar, hoog, beperkt, minimaal
- Hoog-risico AI vereist uitgebreide governance (risk mgmt, docs, oversight)
- Transparantie-plicht: chatbots, AI-content, deepfakes
- Boetes tot €35M / 7% omzet
- Check altijd: deployer of provider, en welke risicoklasse`,
      keyTakeaways: [
        '4 risico-niveaus: onaanvaardbaar → minimaal',
        'Hoog-risico systemen (HR, educatie, infrastructuur) hebben 8-punts compliance',
        'GPAI (foundation models) apart geregeld sinds aug 2025',
        'Boetes tot €35M of 7% omzet',
        'Voor EU-projecten: deployer vs provider rol bepalen, risicoklasse vaststellen',
      ],
    },
    {
      id: 'ail-l13',
      title: 'Module 3 Exam',
      titleNL: 'Module 3 Examen',
      duration: '20:00',
      type: 'exam',
      videoUrl: '',
      icon: 'GraduationCap',
      transcript: '',
      content: 'Toetsvragen op hallucinaties, bias-mitigatie, privacy-risico\'s, en de EU AI Act classificatie + verplichtingen.',
    },
  ],
};


// ============================================
// MODULE 4: AI-FIRST WORKFLOWS & TOOLING
// ============================================
const module4: Module = {
  id: 'ail-m4',
  title: 'Module 4: AI-First Workflows',
  titleNL: 'Module 4: AI-First Werkwijzen',
  description: 'Choose tools wisely, build reusable templates, and integrate AI into your daily project routine.',
  descriptionNL: 'Kies je tools verstandig, bouw herbruikbare sjablonen, en integreer AI in je dagelijkse project-routine.',
  order: 3,
  icon: 'Workflow',
  color: '#0EA5E9',
  gradient: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
  lessons: [
    {
      id: 'ail-l14',
      title: 'Tool Landscape — Which Tool for Which Job',
      titleNL: 'Tool-landschap — Welke Tool Voor Welke Taak',
      duration: '16:00',
      type: 'video',
      videoUrl: '',
      icon: 'Layers',
      transcript: `Het AI-tool landschap verandert sneller dan je het kunt bijhouden.
Hier is een frame dat helpt: denk per taak-type, niet per tool-naam.

**Taak-types en beste-in-klas per eind-2026**

1. **Conversatie / schrijven**
   - Claude 3.7 / Opus 4.7 — lange context, nuance
   - GPT-4 Turbo — breed, sterk op creatief
   - Gemini Pro — goedkoper, goed genoeg voor dagelijks

2. **Code genereren / debuggen**
   - Claude Code — agent mode, ziet hele codebase
   - Cursor — IDE-geïntegreerd
   - GitHub Copilot — inline, snelle autocomplete

3. **Beeld genereren**
   - Midjourney — hoogste esthetische kwaliteit
   - DALL-E 3 (in ChatGPT) — goed in prompt-volgen
   - Stable Diffusion — self-hosted, volle controle

4. **Samenvatten lange documenten**
   - Claude (200k context) — sterkste voor 100+ pagina's
   - Notebook LM (Google) — voor meerdere bronnen

5. **Vergaderingen transcriberen + samenvatten**
   - Otter.ai, Fireflies — real-time
   - Zoom/Teams ingebouwd — geen extra tool nodig

6. **Agents die taken uitvoeren**
   - Claude Code / Cursor — voor coding tasks
   - Custom agents via LangChain / CrewAI — voor specifieke workflows

7. **RAG over jouw eigen documenten**
   - Notebook LM — persoonlijk gebruik
   - Custom pipelines via Pinecone + GPT-4 — voor enterprise

**Kiezen per criterium**

- Data-gevoelig? → enterprise tier met zero-data-retention
- Nederlands werk? → Claude en GPT-4 zijn sterk; Llama minder
- Budget? → Gemini en lokale Llama zijn goedkoper
- Offline / on-prem? → Llama of Mistral lokaal
- Context lengte? → Claude (200k-1M)

**Wat je NIET moet doen**

- Alle tools kopen; kies er 2-3 en beheers ze
- Wachten op "de perfecte tool" — de ruwe tools van nu zijn goed genoeg
- Tools gebruiken zonder workflow — gereedschap zonder proces = chaos

**Key Takeaways**

- Denk in taak-types, niet tool-namen
- Matcheer: data-gevoeligheid, taal, budget, context lengte
- 2-3 tools + workflows > 10 tools zonder systeem`,
      keyTakeaways: [
        'Taak-type > tool-naam als mentale model',
        'Matcheer tool op data-gevoeligheid, taal, budget, context lengte',
        'Beheers 2-3 tools diepgaand; negeer de rest',
      ],
    },
    {
      id: 'ail-l15',
      title: 'Building Your Personal Prompt Library',
      titleNL: 'Je Persoonlijke Prompt-Bibliotheek Bouwen',
      duration: '12:00',
      type: 'video',
      videoUrl: '',
      icon: 'Library',
      transcript: `Elke goede AI-gebruiker heeft een eigen prompt-bibliotheek. Na een jaar
heb je 30-50 sjablonen waar je dagelijks uit put. Het verschil tussen een
productieve AI-gebruiker en een tijdverspiller is vaak alleen: wel of geen
bibliotheek.

**Wat is een prompt sjabloon?**

Een prompt sjabloon is een herbruikbare prompt met placeholders. Bijvoorbeeld:

"Je bent een senior [ROL] met [ERVARING] jaar ervaring in [INDUSTRIE].
Taak: schrijf [ARTIFACT] voor [DOELGROEP].
Context: [ACHTERGROND].
Output: [FORMAT]. Stijl: [STIJL]."

Je vult de placeholders in per-keer, en krijgt consistente kwaliteit.

**Welke sjablonen je moet bouwen**

Begin met de 10 taken die je het vaakst doet:
1. Weekly status update
2. Stakeholder e-mail
3. Meeting samenvatting
4. Risico-register
5. Requirements → user stories
6. Test cases
7. Retro-analyse
8. Lessons learned
9. Executive samenvatting
10. Project charter / one-pager

Voor elke: bouw een sjabloon, test op 3 echte gevallen, itereer.

**Waar je ze bewaart**

- Notion / Obsidian — in een AI-Prompts folder
- Google Docs — in een "Prompt Library" map
- Custom tools: PromptPerfect, FlowGPT

Geef elke prompt een naam, gebruiks-voorbeeld, en datum-laatst-gebruikt.

**Versioneren**

Prompts worden beter over tijd. Als je een prompt verbetert, bewaar beide
versies. Dan kun je teruggrijpen als de nieuwe versie slechtere output geeft.

**Key Takeaways**

- 30-50 sjablonen na één jaar = productief gebruiker
- Begin met 10 veelvoorkomende taken
- Placeholders + consistente structuur = consistente output
- Versioneer je prompts — ze worden beter over tijd`,
      keyTakeaways: [
        'Eigen prompt-bibliotheek onderscheidt productief van tijdverspilling',
        'Start met 10 vaak-terugkerende taken',
        'Placeholders voor variabele delen',
        'Versioneer en itereer — prompts worden beter',
      ],
    },
    {
      id: 'ail-l16',
      title: 'Certificate',
      titleNL: 'Certificaat',
      duration: '5:00',
      type: 'certificate',
      videoUrl: '',
      icon: 'Award',
      transcript: '',
      content: 'Gefeliciteerd! Je hebt de cursus AI Literacy for Project Professionals voltooid. Rond het eindexamen af om je certificaat te ontvangen.',
    },
  ],
};


// ============================================
// MODULES EXPORT
// ============================================
export const aiLiteracyModules: Module[] = [
  module1,
  module2,
  module3,
  module4,
];


// ============================================
// COURSE DEFINITION
// ============================================
export const aiLiteracyCourse: Course = {
  id: 'ai-literacy',
  title: 'AI Literacy for Project Professionals',
  titleNL: 'AI Letterkundige Kennis voor Projectprofessionals',
  description: 'What AI actually is, how LLMs work, where they fail, and how to use them responsibly in project work — including EU AI Act compliance.',
  descriptionNL: 'Wat AI werkelijk is, hoe LLMs werken, waar ze falen, en hoe je ze verantwoord gebruikt in projectwerk — inclusief EU AI Act compliance.',
  icon: Sparkles,
  color: '#A855F7',
  gradient: 'linear-gradient(135deg, #A855F7, #7C3AED)',
  category: 'ai',
  methodology: 'agile',
  levels: 4,
  modules: aiLiteracyModules.reduce((total, m) => total + m.lessons.length, 0),
  duration: 10,
  rating: 4.9,
  students: 0,
  tags: ['AI', 'LLM', 'Prompting', 'EU AI Act', 'Governance', 'Ethics', 'Project Management'],
  tagsNL: ['AI', 'LLM', 'Prompten', 'EU AI Act', 'Governance', 'Ethiek', 'Projectmanagement'],
  instructor: instructors.martijn,
  featured: true,
  bestseller: false,
  new: true,
  freeForCustomers: true,
  certificate: true,
  whatYouLearn: [
    'The vocabulary: AI vs ML vs Deep Learning vs LLMs vs Agents',
    'How LLMs actually work — tokens, prediction, context windows',
    '10 concrete AI use cases for project professionals',
    'How to write effective prompts (4-part recipe)',
    'Detecting and mitigating hallucinations',
    'Bias, fairness, privacy, and IP risks',
    'EU AI Act compliance — risk classification and obligations',
    'Building a personal prompt library',
  ],
  whatYouLearnNL: [
    'Het vocabulaire: AI vs ML vs Deep Learning vs LLMs vs Agents',
    'Hoe LLMs werkelijk werken — tokens, predictie, context windows',
    '10 concrete AI use cases voor projectprofessionals',
    'Hoe je effectieve prompts schrijft (4-delen recept)',
    'Hallucinaties herkennen en voorkomen',
    'Bias, eerlijkheid, privacy en IP-risico\'s',
    'EU AI Act compliance — risico-classificatie en verplichtingen',
    'Een persoonlijke prompt-bibliotheek bouwen',
  ],
  requirements: [
    'No prior AI knowledge required',
    'Basic project management experience helpful',
    'Open mindset — AI changes how we work',
  ],
  requirementsNL: [
    'Geen voorkennis van AI nodig',
    'Basis projectmanagement ervaring is handig',
    'Open mindset — AI verandert hoe we werken',
  ],
  targetAudience: [
    'Project managers and program managers',
    'PMO leads and portfolio managers',
    'Scrum Masters and Agile coaches',
    'Business analysts and product owners',
    'Anyone responsible for deliverables in a post-AI world',
  ],
  targetAudienceNL: [
    'Projectmanagers en programmamanagers',
    'PMO-leads en portfolio managers',
    'Scrum Masters en Agile coaches',
    'Business analisten en product owners',
    'Iedereen die verantwoordelijk is voor deliverables in een post-AI wereld',
  ],
  courseModules: aiLiteracyModules,
};

export default aiLiteracyCourse;
