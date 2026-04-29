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
      keyTakeawaysEN: [
        'AI vs ML vs Deep Learning vs LLMs vs Agents: a clear hierarchy',
        'LLMs do one thing: next-token prediction — everything else is emergent',
        'Agents = LLMs in a loop with tool access',
        'AI has no consciousness, is not a database, does not make decisions for you',
        'You bear responsibility for AI output that you use',
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
      keyTakeawaysEN: [
        'LLMs read tokens (~4 characters), not letters or words',
        'The only core task is next-token prediction',
        'Hallucinations occur where training data was absent',
        'Context windows are finite (128k–1M tokens)',
        'Always provide explicit context; ask for sources',
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
- Oorzaak-en-gevolg redeneren bij nieuwe scenario\'s
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
      keyTakeawaysEN: [
        'Strengths: summarising, translating, drafts, code, image recognition',
        'Weaknesses: arithmetic, recent facts, unique judgements, your specific context',
        'The "last 20%" still requires domain knowledge',
        'Golden rule: AI drafts, you edit, you decide, you bear accountability',
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
      quiz: [
        {
          id: 'ail-q1-1',
          question: 'Wat is de correcte hiërarchische relatie tussen AI, ML, Deep Learning en LLMs?',
          options: [
            'LLMs ⊃ Deep Learning ⊃ ML ⊃ AI (van breed naar smal)',
            'AI ⊃ ML ⊃ Deep Learning ⊃ LLMs (van breed naar smal)',
            'ML ⊃ AI ⊃ LLMs ⊃ Deep Learning',
            'Ze zijn nevengeschikte begrippen zonder hiërarchie',
          ],
          correctAnswer: 1,
          explanation: 'AI is de overkoepelende term. ML is een deelgebied van AI. Deep Learning is een deelgebied van ML dat neurale netwerken gebruikt. LLMs zijn een specifiek type Deep Learning-model gebaseerd op de Transformer-architectuur.',
        },
        {
          id: 'ail-q1-2',
          question: 'Wat is de kernfunctie van een Large Language Model (LLM)?',
          options: [
            'Het opzoeken van feiten in een kennisbank',
            'Het begrijpen van de betekenis van tekst op menselijk niveau',
            'Het voorspellen van het volgende token gegeven een reeks tokens',
            'Het uitvoeren van logische redeneringen op basis van regels',
          ],
          correctAnswer: 2,
          explanation: 'Een LLM is getraind op één taak: het meest-waarschijnlijke volgende token voorspellen. Alle andere gedragingen — samenvatten, code schrijven, redeneren — zijn emergent gedrag dat volgt uit die ene taak, uitgevoerd in een loop.',
        },
        {
          id: 'ail-q1-3',
          question: 'Wat onderscheidt een AI-agent van een gewone LLM-aanroep?',
          options: [
            'Een agent gebruikt meer parameters en is daardoor slimmer',
            'Een agent heeft bewustzijn en kan zelfstandig beslissingen nemen',
            'Een agent draait een LLM in een loop met toegang tot tools',
            'Een agent is een LLM die specifiek getraind is op acties uitvoeren',
          ],
          correctAnswer: 2,
          explanation: 'Een agent is per definitie: een LLM in een run-loop, met tool access. De loop stelt het in staat stappen te plannen en uit te voeren (bijv. web search, code uitvoeren, API aanroepen). Het is geen super-intelligentie en heeft geen bewustzijn.',
        },
        {
          id: 'ail-q1-4',
          question: 'Een projectmanager vraagt ChatGPT om een specifiek marktcijfer uit 2023. Het model geeft een precies getal met twee decimalen, maar je kunt de bron niet vinden. Wat is het meest waarschijnlijke probleem?',
          options: [
            'De PM heeft de vraag niet duidelijk genoeg gesteld',
            'Het model hallucineert: het heeft een plausibel getal gegenereerd zonder dat het in de trainingsdata stond',
            'ChatGPT heeft geen toegang tot internet en geeft daarom verouderde data',
            'Het getal is afkomstig uit een geheim trainingsbestand dat niet publiek raadpleegbaar is',
          ],
          correctAnswer: 1,
          explanation: 'Dit is een klassieke feit-hallucinatie. Als een LLM gevraagd wordt naar een specifiek detail dat zelden of niet in de trainingsdata voorkwam, genereert het een plausibel klinkend antwoord op basis van token-predictie. De precisie (twee decimalen) is juist een waarschuwingsteken, geen betrouwbaarheidsindicator.',
        },
        {
          id: 'ail-q1-5',
          question: 'Welke van de volgende taken voert een LLM van nature het minst betrouwbaar uit?',
          options: [
            'Het samenvatten van een lang document in drie alinea\'s',
            'Het omzetten van requirements naar user stories',
            'Het uitrekenen van 847 × 293 zonder hulpmiddelen',
            'Het opstellen van een formele stakeholder-e-mail',
          ],
          correctAnswer: 2,
          explanation: 'LLMs maken aantoonbaar fouten bij niet-triviale rekensommen omdat rekenen niet hun trainingspatroon is — token-predictie is dat wel. De andere drie taken (samenvatten, user stories schrijven, e-mail opstellen) zijn allemaal tekst-naar-tekst taken waarbij LLMs sterk zijn.',
        },
        {
          id: 'ail-q1-6',
          question: 'Wat bepaalt hoeveel van een conversatie een LLM "onthoudt"?',
          options: [
            'Het aantal berichten in de conversatie',
            'De grootte van het model in parameters',
            'De context window, uitgedrukt in tokens',
            'De snelheid van de server waarop het model draait',
          ],
          correctAnswer: 2,
          explanation: 'De context window is het maximale aantal tokens dat een LLM in één inferentie-aanroep kan verwerken. Als de conversatie de context window overschrijdt, raakt het model het begin kwijt. Grootte van het model of serversnelheid bepaalt dit niet.',
        },
      ],
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
Vraag: "Genereer 15 risico\'s voor dit project, gecategoriseerd (technisch,
schedule, financieel, operationeel). Geef per risico: waarschijnlijkheid
(laag/middel/hoog), impact, mitigatie."
Let op: de AI mist waarschijnlijk 2-3 risico\'s die alleen iemand met jouw
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
Let op: AI mist vaak regressie-scenario\'s en security cases. Voeg die zelf toe.

**7. Project charter draften**

Input: projectdoel, scope, stakeholders.
Vraag: "Schrijf een project charter volgens PRINCE2 structuur."
Let op: gebruik de methodologie die jouw organisatie gebruikt, niet wat AI
default aanneemt.

**8. Retrospective inzichten**

Input: retro notities van 5 sprints.
Vraag: "Identificeer terugkerende thema\'s en patronen. Groepeer per categorie."
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

- 10 concrete use cases: status, risico\'s, notulen, mails, user stories,
  tests, charter, retro, lessons, slides
- AI = eerste versie; jij = definitieve versie
- Verwacht 60-80% tijdsbesparing, niet volledige automatisering`,
      keyTakeaways: [
        '10 use cases die je vandaag kunt toepassen',
        'Elke case: AI draft → jouw review',
        '60-80% tijdsbesparing is realistisch',
        'Domeinkennis blijft voor de laatste 20%',
      ],
      keyTakeawaysEN: [
        '10 use cases you can apply today',
        'Each case: AI draft → your review',
        '60-80% time saving is realistic',
        'Domain knowledge still required for the last 20%',
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
      keyTakeawaysEN: [
        'Every prompt = Role + Context + Task + Output-format',
        'Examples of good output outperform abstract descriptions',
        'Chain-of-thought makes reasoning reviewable',
        'Save working prompts as reusable templates',
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
      quiz: [
        {
          id: 'ail-q2-1',
          question: 'Een projectmanager vraagt AI om een risicoregister te genereren op basis van de projectscope. Wat is de meest nauwkeurige verwachting van het resultaat?',
          options: [
            'Een compleet en definitief risicoregister dat direct in het project gebruikt kan worden',
            'Een brainstorm-startpunt dat 2-3 domein-specifieke risico\'s mist die alleen een expert herkent',
            'Een lijst met generieke risico\'s die inhoudelijk waardeloos zijn voor dit project',
            'Een risicoregister dat alleen klopt als de PM de projectscope volledig beschreven heeft',
          ],
          correctAnswer: 1,
          explanation: 'AI levert een goede eerste versie die 70-80% dekt, maar mist doorgaans 2-3 risico\'s die domeinkennis vereisen. Het is een brainstorm-startpunt, niet een definitief register. De PM moet nog steeds de inhoud beoordelen en aanvullen.',
        },
        {
          id: 'ail-q2-2',
          question: 'Wat zijn de vier onderdelen van een effectieve prompt per het in de cursus behandelde recept?',
          options: [
            'Vraag, Antwoord, Verificatie, Feedback',
            'Rol, Context, Taak, Output-format',
            'Systeem, Gebruiker, Assistent, Tool',
            'Doel, Doelgroep, Data, Deadline',
          ],
          correctAnswer: 1,
          explanation: 'Het 4-onderdelen recept: (1) Rol — wie is de AI? (2) Context — de achtergrond van de situatie. (3) Taak — wat wil je precies? (4) Output-format — hoe wil je het resultaat? Elke component maakt de output specifieker en bruikbaarder.',
        },
        {
          id: 'ail-q2-3',
          question: 'Wat is het voordeel van "few-shot examples" in een prompt ten opzichte van het beschrijven van de gewenste stijl met adjectieven?',
          options: [
            'Few-shot examples kosten minder tokens en zijn daardoor goedkoper',
            'Few-shot examples geven een concreet referentiepunt dat het model kan nabootsen, wat betrouwbaarder werkt dan abstracte beschrijvingen',
            'Few-shot examples zijn alleen nuttig voor code-generatie, niet voor teksttaken',
            'Few-shot examples dwingen het model om alleen informatie uit het voorbeeld te gebruiken',
          ],
          correctAnswer: 1,
          explanation: 'Een voorbeeld van goede output geeft het model een concreet patroon om na te bootsen. Adjectieven als "professioneel" of "helder" zijn voor het model te vaag — ze zijn subjectief en contextonafhankelijk. Een werkelijk voorbeeld laat zien wat je bedoelt.',
        },
        {
          id: 'ail-q2-4',
          question: 'Welk anti-patroon beschrijft de instructie "Maak het beter" in een AI-prompt?',
          options: [
            'Chain-of-thought prompting — te complex voor de taak',
            'Vage instructie zonder specificatie van wat "beter" betekent',
            'Role prompting — de AI wordt gevraagd een rol aan te nemen die niet relevant is',
            'Zero-shot prompting — er zijn geen voorbeelden gegeven',
          ],
          correctAnswer: 1,
          explanation: '"Beter" is voor een LLM een betekenisloze instructie. Het model heeft geen maatstaf. Specificeer altijd: korter, formeler, meer voorbeelden, minder jargon, actievere zinsconstructies — dan weet het model precies wat je bedoelt.',
        },
        {
          id: 'ail-q2-5',
          question: 'Welk percentage tijdsbesparing is realistisch bij AI-ondersteund projectwerk op basis van de cursus?',
          options: [
            '20-30% — AI helpt maar is nog beperkt',
            '60-80% — AI levert de eerste versie, de PM doet de review en eindversie',
            '90-100% — AI kan de meeste projecttaken volledig automatiseren',
            '100% voor routinetaken, 0% voor complexe beslissingen',
          ],
          correctAnswer: 1,
          explanation: 'De cursus stelt 60-80% tijdsbesparing als realistisch: AI levert de eerste versie, de projectmanager levert de definitieve versie. 100% automatisering is onrealistisch omdat domeinkennis, oordeel en verantwoordelijkheid bij de mens blijven.',
        },
        {
          id: 'ail-q2-6',
          question: 'Bij welke van de 10 use cases moet een projectmanager het meest alert zijn op het controleren van actie-eigenaren?',
          options: [
            'Status rapport samenvatten',
            'Risico-register genereren',
            'Vergadernotulen maken uit een transcript',
            'Presentatie-outline opstellen',
          ],
          correctAnswer: 2,
          explanation: 'AI is goed in het extraheren van expliciete informatie uit transcripten, maar slecht in het begrijpen van impliciete afspraken. Wie eigenaar is van een actie is vaak impliciet in gesprekken — de PM moet dat zelf verifiëren.',
        },
      ],
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
      keyTakeawaysEN: [
        'Hallucinations are inherent to how LLMs work',
        '4 types: fact, citation, code, relation',
        'Mitigations: retrieval-augmented generation, source verification, multiple runs',
        'For important facts always go back to the primary source',
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
      keyTakeawaysEN: [
        'Bias originates from training data, labelling, and feedback loops',
        'Risk areas: personas, reviews, recruitment language, risk weighting',
        'Mitigation = deliberate prompting + spot-check + diverse reviewers',
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

**Data leakage risico\'s**

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
      keyTakeawaysEN: [
        'Never put client data/secrets/strategy into public AI tools',
        'Rule of three: newspaper test, public forum test, owner permission',
        'Enterprise tiers (zero-data-retention) for professional use',
        'Document AI usage for audit and compliance',
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
      keyTakeawaysEN: [
        '4 risk levels: unacceptable → minimal',
        'High-risk systems (HR, education, infrastructure) require 8-point compliance',
        'GPAI (foundation models) separately regulated since Aug 2025',
        'Fines up to €35M or 7% of global turnover',
        'For EU projects: determine deployer vs provider role, establish risk class',
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
      quiz: [
        {
          id: 'ail-q3-1',
          question: 'Welke van de volgende situaties is een voorbeeld van een citaat-hallucinatie?',
          options: [
            'Een LLM noemt een bestaande wetenschapper maar schrijft hem een publicatie toe die hij nooit schreef',
            'Een LLM geeft een verkeerd antwoord op een rekensom',
            'Een LLM weigert een vraag te beantwoorden vanwege veiligheidsbeleid',
            'Een LLM genereert code met een syntaxfout',
          ],
          correctAnswer: 0,
          explanation: 'Een citaat-hallucinatie is het verzinnen van een bronnaam, publicatietitel of quote die niet bestaat. Een bestaand persoon koppelen aan een niet-bestaande publicatie is precies dit patroon. Rekenfouten en syntaxfouten zijn andere foutcategorieën.',
        },
        {
          id: 'ail-q3-2',
          question: 'Retrieval-Augmented Generation (RAG) is een mitigatie voor hallucinaties. Wat is de kern van deze aanpak?',
          options: [
            'Het model meerdere malen dezelfde vraag stellen en de antwoorden vergelijken',
            'De AI altijd vragen om een bron te noemen bij elk feitelijk antwoord',
            'Relevante brondocumenten expliciet in de prompt meegeven zodat het model op die tekst kan steunen',
            'Het model fijn-tunen op organisatie-specifieke data zodat het minder hallucineert',
          ],
          correctAnswer: 2,
          explanation: 'RAG werkt door relevante documenten op te halen (retrieval) en als context mee te geven in de prompt. Het model steunt dan op die expliciete tekst in plaats van op statistisch waarschijnlijke tokens uit de training. Dit verkleint de kans op fabricatie aanzienlijk.',
        },
        {
          id: 'ail-q3-3',
          question: 'Een PM gebruikt AI om persona\'s te genereren voor een product voor een diverse gebruikersgroep. Na review ziet hij dat alle manager-persona\'s mannelijk zijn en alle assistent-persona\'s vrouwelijk. Wat is de oorzaak?',
          options: [
            'De PM heeft niet expliciet gevraagd om diverse persona\'s',
            'AI kan geen vrouwelijke manager-persona\'s genereren door technische beperkingen',
            'Trainingsdata-bias: historische data oververtegenwoordigt bepaalde patronen, die het model reproduceert',
            'Het model past zich aan de cultuur van de gebruiker aan op basis van eerdere prompts',
          ],
          correctAnswer: 2,
          explanation: 'Trainingsdata reflecteert historische en maatschappelijke ongelijkheden. Als meer teksten in de trainingsdata managers associëren met mannelijke namen, leert het model dat patroon en reproduceert het. Dit is bias-door-trainingsdata, de meest voorkomende oorzaak.',
        },
        {
          id: 'ail-q3-4',
          question: 'Welke van de volgende handelingen vormt het grootste privacyrisico bij het gebruik van een publieke AI-tool (niet-Enterprise tier)?',
          options: [
            'Een publiek beschikbaar projectmethodologie-document uploaden voor samenvatting',
            'Klantnamen, contractbedragen en strategische plannen in een prompt plakken',
            'AI vragen om een sjabloon voor een stakeholder-e-mail te schrijven zonder projectcontext',
            'Een anonieme vraag stellen over PRINCE2 best practices',
          ],
          correctAnswer: 1,
          explanation: 'Klantnamen, contractbedragen en strategische plannen zijn vertrouwelijke en mogelijk persoonsgebonden data. In een niet-Enterprise publieke AI kunnen deze gegevens in provider-logs terechtkomen of voor training gebruikt worden. Dit is het concrete privacyrisico dat de cursus beschrijft.',
        },
        {
          id: 'ail-q3-5',
          question: 'In welke risico-categorie valt een AI-systeem dat wordt ingezet voor het automatisch beoordelen en selecteren van sollicitanten, volgens de EU AI Act?',
          options: [
            'Minimaal risico — vrijwillige codes',
            'Beperkt risico — transparantie-verplichtingen',
            'Hoog risico — strenge governance-verplichtingen',
            'Onaanvaardbaar risico — verboden per februari 2025',
          ],
          correctAnswer: 2,
          explanation: 'HR-systemen voor werving, promotie en evaluatie vallen expliciet onder de "hoog risico"-categorie van de EU AI Act. Ze vereisen een risico-managementsysteem, technische documentatie, menselijke oversight, en conformiteitsbeoordeling vóór ingebruikname.',
        },
        {
          id: 'ail-q3-6',
          question: 'Welk AI-gebruik is volgens de EU AI Act verboden per februari 2025?',
          options: [
            'Een chatbot die zich als AI identificeert aan gebruikers',
            'Een HR-tool die CV\'s rangschikt op basis van vaardigheden',
            'Social scoring door een overheid om burgergedrag te beoordelen',
            'Een aanbevelingssysteem voor e-commerce producten',
          ],
          correctAnswer: 2,
          explanation: 'Social scoring door overheden valt in de categorie "onaanvaardbaar risico" en is verboden per februari 2025. De andere voorbeelden zijn toegestaan: chatbots met identificatieplicht (beperkt risico), HR-tools met governance (hoog risico), of aanbevelingssystemen (minimaal risico).',
        },
        {
          id: 'ail-q3-7',
          question: 'Wat is de maximale boete voor het inzetten van een verboden AI-systeem (onaanvaardbaar risico) onder de EU AI Act?',
          options: [
            '€7,5 miljoen of 1% van de wereldwijde jaaromzet',
            '€15 miljoen of 3% van de wereldwijde jaaromzet',
            '€35 miljoen of 7% van de wereldwijde jaaromzet',
            '€50 miljoen of 10% van de wereldwijde jaaromzet',
          ],
          correctAnswer: 2,
          explanation: 'De zwaarste boete onder de EU AI Act — tot €35 miljoen of 7% van de wereldwijde jaaromzet — geldt voor systemen in de categorie onaanvaardbaar risico. Dit is de hoogste boetecategorie; andere overtredingen kennen lagere maxima (€15M/3% en €7,5M/1%).',
        },
        {
          id: 'ail-q3-8',
          question: 'Welke van de volgende AI-toepassingen valt onder de "beperkt risico"-categorie van de EU AI Act en vereist uitsluitend transparantie?',
          options: [
            'Een AI die medische diagnoses stelt',
            'Een chatbot op een klantenservicewebsite',
            'Een AI-systeem voor wetshandhaving',
            'Een AI die sollicitanten selecteert voor leidinggevende functies',
          ],
          correctAnswer: 1,
          explanation: 'Chatbots vallen onder "beperkt risico": ze moeten zich aan gebruikers kenbaar maken als AI, maar vereisen geen uitgebreide governance zoals hoog-risico-systemen. Medische diagnose, wetshandhaving en HR-selectie zijn hoog-risico-toepassingen.',
        },
      ],
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
      keyTakeawaysEN: [
        'Task-type > tool-name as your mental model',
        'Match tool to data sensitivity, language, budget, context length',
        'Master 2-3 tools deeply; ignore the rest',
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
      keyTakeawaysEN: [
        'Your own prompt library separates productive from time-wasting AI use',
        'Start with 10 frequently recurring tasks',
        'Placeholders for variable parts',
        'Version and iterate — prompts improve over time',
      ],
    },
    {
      id: 'ail-l-final-exam',
      title: 'Final Exam: AI Literacy for Project Professionals',
      titleNL: 'Eindexamen: AI Literacy voor Projectprofessionals',
      duration: '30:00',
      type: 'exam',
      videoUrl: '',
      icon: 'GraduationCap',
      transcript: '',
      content: 'Het eindexamen beslaat alle vier modules: M1 vocabulaire (5v), M2 use cases en prompting (6v), M3 governance en EU AI Act (5v), M4 AI-first werkwijzen (4v). Slaaggrens: 70%.',
      quiz: [
        // Module 1: Vocabulary (5 questions)
        {
          id: 'ail-final-1',
          question: 'Welke term beschrijft de overkoepelende discipline die alle vormen van computationele intelligentie omvat, inclusief ML, Deep Learning en LLMs?',
          options: [
            'Machine Learning',
            'Deep Learning',
            'Artificial Intelligence',
            'Natural Language Processing',
          ],
          correctAnswer: 2,
          explanation: 'Artificial Intelligence (AI) is de paraplu-term. ML is een deelgebied van AI; Deep Learning is een deelgebied van ML; LLMs zijn een specifiek type Deep Learning. NLP is een toepassingsgebied, geen hiërarchische laag.',
        },
        {
          id: 'ail-final-2',
          question: 'Hoe verhoudt "Deep Learning" zich tot "Machine Learning"?',
          options: [
            'Deep Learning is een synoniem voor Machine Learning',
            'Deep Learning is een deelgebied van Machine Learning dat gebruik maakt van neurale netwerken met meerdere lagen',
            'Machine Learning is een deelgebied van Deep Learning',
            'Deep Learning is de nieuwere naam voor traditionele Machine Learning',
          ],
          correctAnswer: 1,
          explanation: 'Deep Learning is een subset van ML. Het onderscheidende kenmerk zijn neurale netwerken met meerdere (diepe) lagen. De doorbraak in 2012 (AlexNet) en 2017 (Transformer) maakte LLMs mogelijk.',
        },
        {
          id: 'ail-final-3',
          question: 'Welke uitspraak over LLM-tokens is correct?',
          options: [
            'Een token is gelijk aan één woord',
            'Een token is gelijk aan één karakter',
            'Een token is gemiddeld circa 4 karakters in het Engels',
            'Het aantal tokens is gelijk aan het aantal zinnen',
          ],
          correctAnswer: 2,
          explanation: 'Een token is gemiddeld circa 4 karakters in het Engels (vergelijkbaar in het Nederlands). "Projectmanagement" beslaat meerdere tokens. Tokens zijn de eenheid waarmee LLMs rekenen en waarvoor API-gebruik wordt gefactureerd.',
        },
        {
          id: 'ail-final-4',
          question: 'Wat is een hallucinatie in de context van LLMs?',
          options: [
            'Een creatieve, maar onbedoelde uitbreiding van de prompt-instructie',
            'Het genereren van plausibel klinkende maar feitelijk onjuiste tekst als gevolg van token-predictie zonder aanwezige trainingsdata',
            'Het weigeren van een antwoord vanwege veiligheidsbeleid',
            'Het herhalen van tekst uit de context window',
          ],
          correctAnswer: 1,
          explanation: 'Hallucinaties zijn statistisch-completion artefacten: het model vult de leegte met het meest-waarschijnlijke token wanneer relevante trainingsdata ontbreekt. Het zijn geen bewuste verzinsels of creatieve keuzes, maar een onvermijdelijk bijproduct van hoe token-predictie werkt.',
        },
        {
          id: 'ail-final-5',
          question: 'Wat is de definitie van een AI-agent?',
          options: [
            'Een LLM met een groter aantal parameters dan standaard modellen',
            'Een LLM dat in een run-loop draait met toegang tot tools zoals web search en code-uitvoering',
            'Een AI-systeem dat zelfbewustzijn heeft en autonome beslissingen neemt',
            'Een speciaal getraind model voor geautomatiseerde workflows',
          ],
          correctAnswer: 1,
          explanation: 'Agent = LLM + run-loop + tool access. De loop stelt het systeem in staat stappen te plannen, tools aan te roepen (web search, code, API), resultaten te verwerken en te beslissen of het klaar is of een volgende stap neemt. Geen bewustzijn, geen autonomie in de filosofische zin.',
        },
        // Module 2: Use cases + prompting (6 questions)
        {
          id: 'ail-final-6',
          question: 'Een PM wil AI inzetten om wekelijkse statusrapporten te genereren. Welke instructie in de prompt voorkomt het meest effectief dat de AI percentages of cijfers verzint die niet in de input stonden?',
          options: [
            '"Schrijf een professioneel en nauwkeurig statusrapport"',
            '"Gebruik alleen informatie uit de onderstaande notities. Verzin geen cijfers of percentages."',
            '"Controleer alle informatie voor je antwoordt"',
            '"Wees precies en feitelijk in je taalgebruik"',
          ],
          correctAnswer: 1,
          explanation: 'Een expliciete restrictie-instructie ("gebruik alleen...") is de enige betrouwbare manier om AI te beperken tot de gegeven data. Vage kwaliteitsadjectieven ("professioneel", "nauwkeurig") geven het model geen operationele instructie om verzinnen te vermijden.',
        },
        {
          id: 'ail-final-7',
          question: 'Welk component van het 4-delige prompt-recept beschrijft "Je bent een senior projectmanager met 15 jaar ervaring in de financiële sector"?',
          options: [
            'Context',
            'Taak',
            'Rol',
            'Output-format',
          ],
          correctAnswer: 2,
          explanation: '"Je bent een..." beschrijft de rol die de AI moet aannemen. Dit stuurt het register, de expertise en de perspectieven in het antwoord. Rol staat los van Context (de achtergrond van de situatie), Taak (wat gevraagd wordt) en Output-format (hoe het resultaat eruitziet).',
        },
        {
          id: 'ail-final-8',
          question: 'Wat is "chain-of-thought" prompting en wanneer is het bijzonder nuttig?',
          options: [
            'Het geven van meerdere voorbeelden van goede output; nuttig voor stijlnabootsing',
            'Het vragen aan de AI om stap-voor-stap te redeneren; nuttig voor complexe analytische taken',
            'Het koppelen van meerdere AI-aanroepen in een pipeline; nuttig voor automatisering',
            'Het herhalen van de taakbeschrijving aan het einde van de prompt; nuttig voor lange prompts',
          ],
          correctAnswer: 1,
          explanation: 'Chain-of-thought vraagt het model hardop te redeneren ("denk stap voor stap"). Dit maakt de redenering zichtbaar en controleerbaar, en verlaagt fouten bij complexe taken. Het is niet hetzelfde als few-shot examples (stijlnabootsing) of agent-pipelines (automatisering).',
        },
        {
          id: 'ail-final-9',
          question: 'Welke AI use case vereist de meest kritische inhoudelijke check van een domeinexpert, omdat AI structureel tekortschiet bij het laatste 20%?',
          options: [
            'Het omzetten van een agenda naar een bullet-point overzicht',
            'Het genereren van een risico-register voor een nieuw IT-project in een specifieke branche',
            'Het vertalen van een Engelse e-mail naar het Nederlands',
            'Het samenvatten van een 40-pagina\'s rapport in 5 alinea\'s',
          ],
          correctAnswer: 1,
          explanation: 'Een risico-register vereist branche-specifieke en project-specifieke domeinkennis voor de "laatste 20%". AI mist waarschijnlijk 2-3 kritieke risico\'s die alleen een expert met contextuele kennis herkent. Vertalen, samenvatten en agenda-formatting zijn taken waarbij AI de volle breedte zelfstandig dekt.',
        },
        {
          id: 'ail-final-10',
          question: 'Hoe beschrijft de cursus de aanbevolen aanpak na de eerste AI-output op een taak?',
          options: [
            'Meteen publiceren als de output professioneel overkomt',
            'De output weggooien en opnieuw beginnen met een betere prompt',
            'Iteratief verfijnen: evalueer wat niet klopt, voeg die constraint toe aan de prompt, herhaal',
            'Meerdere AI-modellen de dezelfde vraag stellen en het beste antwoord kiezen',
          ],
          correctAnswer: 2,
          explanation: 'De cursus beschrijft iteratief prompten: probeer → identificeer wat niet klopt → voeg die constraint toe → herhaal. Na 2-3 iteraties heb je doorgaans een sjabloon dat herbruikbaar is. Direct publiceren zonder review of alles weggooien zijn beide antipatronen.',
        },
        {
          id: 'ail-final-11',
          question: 'Wat is de aanbevolen manier om bij vergadernotulen te controleren of de AI alle actie-eigenaren correct heeft vastgelegd?',
          options: [
            'De AI vragen om de actiepunten te nummeren zodat je ze kunt tellen',
            'Zelf het originele transcript lezen en vergelijken met de AI-output, want impliciete afspraken mist AI structureel',
            'Een tweede AI-model de notulen laten valideren op volledigheid',
            'De AI vragen om bij elk actiepunt het tijdstip in het transcript te vermelden',
          ],
          correctAnswer: 1,
          explanation: 'AI is goed in het extraheren van expliciet genoemde actie-eigenaren, maar mist impliciete afspraken ("jij pakt dat op" of non-verbale toewijzingen). Zelf teruglezen naar het origineel is de enige betrouwbare controle.',
        },
        // Module 3: Governance + EU AI Act (5 questions)
        {
          id: 'ail-final-12',
          question: 'Hoeveel risico-niveaus kent de EU AI Act en wat is de correcte volgorde van zwaarst naar lichtst?',
          options: [
            '3 niveaus: Hoog, Middel, Laag',
            '5 niveaus: Verboden, Hoog, Middel, Laag, Vrijwillig',
            '4 niveaus: Onaanvaardbaar, Hoog, Beperkt, Minimaal',
            '4 niveaus: Kritiek, Hoog, Medium, Laag',
          ],
          correctAnswer: 2,
          explanation: 'De EU AI Act kent vier risico-categorieën: Onaanvaardbaar (verboden), Hoog (strenge verplichtingen), Beperkt (transparantieplicht), en Minimaal (vrijwillige codes). De exacte terminologie is bindend voor compliance-gesprekken.',
        },
        {
          id: 'ail-final-13',
          question: 'Een deepfake-video van een CEO die een fictief statement geeft wordt online geplaatst zonder label. Welke EU AI Act verplichting is geschonden?',
          options: [
            'De verbodsbepaling op onaanvaardbaar risico',
            'De hoog-risico governance-eis voor technische documentatie',
            'De beperkt-risico transparantieplicht: synthetische content moet als zodanig worden aangeduid',
            'De GPAI-verplichting voor foundation models',
          ],
          correctAnswer: 2,
          explanation: 'Deepfakes zonder duidelijke markering vallen onder "beperkt risico" en schenden de transparantieplicht: AI-gegenereerde content die echte personen of situaties nabootst moet kenbaar worden gemaakt als synthetisch. Dit is geen verbod, maar een markeringsplicht.',
        },
        {
          id: 'ail-final-14',
          question: 'Wat beschrijft de "regel van drie" voor het beoordelen van wat je in een AI-prompt mag plaatsen?',
          options: [
            'Maximaal drie onderwerpen per prompt voor optimale kwaliteit',
            'Krant-test, publiek forum-test, en toestemming van de data-eigenaar',
            'Check op drie categorieën: persoonsgegevens, financiële data, en handelsgeheimen',
            'Drie iteraties voordat je een prompt als definitief beschouwt',
          ],
          correctAnswer: 1,
          explanation: 'De regel van drie uit de cursus: (1) Als dit morgen in de krant staat, is dat een ramp? (2) Zou ik dit op een publiek forum posten? (3) Heb ik toestemming van de eigenaar? Als één antwoord "nee" is, hoort de informatie niet in de prompt.',
        },
        {
          id: 'ail-final-15',
          question: 'Welke actie moet een projectmanager als eerste ondernemen als een nieuw project AI inzet voor een toepassing die mogelijk hoog risico is onder de EU AI Act?',
          options: [
            'Direct een CE-markering aanvragen',
            'Bepalen of het project "deployer" of "provider" is onder de Act, en de risicoklasse vaststellen',
            'Een ethische AI-commissie oprichten binnen het project',
            'Alle AI-output laten goedkeuren door een jurist voor publicatie',
          ],
          correctAnswer: 1,
          explanation: 'De eerste stap is het vaststellen van de rol (deployer of provider) en de risicoklasse, want die bepalen welke verplichtingen van toepassing zijn. CE-markering is een later stadium; een ethische commissie en juridische goedkeuring zijn mogelijke vervolgstappen maar niet de eerste.',
        },
        {
          id: 'ail-final-16',
          question: 'Welke verplichting geldt specifiek voor General-Purpose AI (GPAI) modellen, zoals GPT-4 en Claude, onder de EU AI Act?',
          options: [
            'Ze mogen niet worden ingezet in hoog-risico toepassingen',
            'Ze moeten een CE-markering dragen',
            'Transparantie over trainingsdata, copyright-naleving en risicobeheer voor modellen met systemisch risico',
            'Ze mogen alleen worden aangeboden via Enterprise tiers met zero-data-retention',
          ],
          correctAnswer: 2,
          explanation: 'De GPAI-regels (van kracht augustus 2025) vereisen: transparantie over trainingsdata, naleving van auteursrecht, en voor foundation models met systemisch risico extra verplichtingen voor risicobeheer. Het verbod op hoog-risico inzet geldt niet voor de modellen zelf maar voor deployers.',
        },
        // Module 4: AI-first workflows (4 questions)
        {
          id: 'ail-final-17',
          question: 'Welke AI-tool is volgens de cursus het sterkst voor het verwerken van documenten langer dan 100 pagina\'s?',
          options: [
            'GPT-4 Turbo — beste allround prestaties',
            'Gemini Pro — goedkoop en snel',
            'Claude — de grootste context window (200k-1M tokens)',
            'Notebook LM — specifiek gebouwd voor lange documenten',
          ],
          correctAnswer: 2,
          explanation: 'Claude wordt in de cursus aanbevolen voor het samenvatten van lange documenten vanwege de grootste context window (200k voor Sonnet, 1M voor Opus). Notebook LM is goed voor meerdere bronnen maar heeft een kleinere context dan Claude Opus.',
        },
        {
          id: 'ail-final-18',
          question: 'Wat is het aanbevolen maximale aantal AI-tools dat een projectmanager diepgaand moet beheersen?',
          options: [
            '1 — focus op één tool voor maximale diepgang',
            '2-3 — beheers een beperkte set goed in plaats van oppervlakkig veel',
            '5-7 — dekking van alle taak-types vereist meer tools',
            'Zo veel als nodig — de toolmarkt verandert te snel voor beperkingen',
          ],
          correctAnswer: 1,
          explanation: 'De cursus raadt aan: kies 2-3 tools en beheers ze diepgaand. Alle tools kopen of continu wisselen leidt tot fragmentatie zonder profijt. Gereedschap zonder workflow is chaos — diepgang in een kleine set beats breedte zonder beheersing.',
        },
        {
          id: 'ail-final-19',
          question: 'Wat is een prompt-sjabloon en waarom is het waardevol?',
          options: [
            'Een door AI gegenereerde prompt die je opslaat voor hergebruik, zodat je zelf geen prompts meer hoeft te schrijven',
            'Een herbruikbare prompt met placeholders die bij gelijke taakstructuren consistente kwaliteit levert',
            'Een officieel door de tool-provider goedgekeurd prompt-format',
            'Een prompt die chain-of-thought en few-shot examples combineert',
          ],
          correctAnswer: 1,
          explanation: 'Een prompt-sjabloon is een herbruikbare prompt met variabele placeholders (bijv. [ROL], [CONTEXT], [ARTIFACT]). Na invullen per geval levert het consistente kwaliteit voor gelijke taakstructuren. Het verschil tussen productief en tijdverspillend AI-gebruik is vaak slechts de aanwezigheid van zo\'n bibliotheek.',
        },
        {
          id: 'ail-final-20',
          question: 'Welk criterium moet een projectmanager hanteren bij de keuze voor een AI-tool als de taak gevoelige klant- of bedrijfsdata vereist?',
          options: [
            'De tool met de hoogste benchmark-score op AI-tests kiezen',
            'De tool kiezen die de goedkoopste Enterprise-tier heeft',
            'Een Enterprise-tier met contractueel vastgelegde zero-data-retention kiezen',
            'Een lokaal draaiend open-source model altijd prefereren boven cloud-tools',
          ],
          correctAnswer: 2,
          explanation: 'Voor gevoelige data is de doorslaggevende eis een contractueel vastgelegde zero-data-retention (bijv. Claude API, Azure OpenAI, ChatGPT Enterprise). Benchmark-scores en prijs zijn secundair. Lokale modellen zijn ook een optie maar zijn niet altijd praktisch en vereisen eigen infrastructuur en beveiliging.',
        },
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
