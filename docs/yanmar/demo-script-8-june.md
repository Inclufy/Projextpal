# ProjeXtPal × Yanmar — Deep-dive demo script
**Datum:** week van 8 juni 2026
**Duur:** 25 min demo + 20 min Q&A
**Aanwezig (verwacht):** Shah Ally (Sponsor), Dhruv Saxena (PMO Lead), eventueel Aiden Vendor, Yanmar IT
**Demo-leider:** Sami · **Co-pilot voor vragen:** Zanjabil
**Setup:** laptop met Chrome op `localhost:8001` (backend) + Keynote/PowerPoint voor PPTX-resultaten

---

## Opening — 2 min

> "Dhruv, Shah — bedankt voor de templates. Wat je vandaag gaat zien is **jullie templates 1:1 gegenereerd uit ProjeXtPal**. Geen mock-up. Live data, live render. We gaan door 4 momenten heen die direct aansluiten op de pijnpunten die jullie noemden: tijdrovend handwerk, vertraagde kostenvisibiliteit, externe uitgaven, en governance-discipline."

**Slides voor de opening:**
- Slide met de 4 Yanmar templates naast elkaar (Action Tracker · Project Plan · Highlight Report · Meeting Minutes)
- "ProjeXtPal genereert ze alle vier uit live data"

---

## Demo-flow

### Moment 1 — Highlight Report PPTX (5 min) ⭐ openingsklap

**Setup vooraf:**
```bash
docker compose exec -T backend python manage.py shell <<'PY'
from prince2.models import HighlightReport
from prince2.exports import highlight_report_to_data, render_highlight_pptx
hr = HighlightReport.objects.filter(project__name='Renovation Phase 2').first()
open('/tmp/yanmar_demo.pptx','wb').write(render_highlight_pptx(highlight_report_to_data(hr)))
PY
docker cp projectpal-backend:/tmp/yanmar_demo.pptx ~/Desktop/yanmar_demo.pptx
```

**Wat te zeggen:**
> "Dit project — Renovation Phase 2 — bestaat in ProjeXtPal. Het heeft 3 PRINCE2 stages, 4 risks, RACI per taak, en een Project Board. Klik."

**Open `~/Desktop/yanmar_demo.pptx` in Keynote**:
- Slide 1: cover met laatste update-datum
- Slide 2: **wijs aan**
  - Header bar met "Renovation Phase 2" — uit het Project-model
  - 4 RAG-dots rechtsboven (Budget green / Planning amber / Resources green / Overall amber) — **exact jullie 4-axis layout**
  - 10-maands timeline-band met 3 phase-bars (Prepare done, Renovations active, Run planned)
  - Financials tabel: Costs / Internal / External / Contingency met Budget / Actuals / **ETC** / Variance
  - 5×5 Risk Map met gekleurde cellen + count badges
  - Highlights / Lowlights blok
  - Issues / Risks regel onderaan

**Sleutel-zin:** *"Elke ster die jullie in jullie PRJ LEGO template zien — RAG, financials, risk map, highlights/lowlights, Sponsor/Senior Supplier — komt uit één datamodel. Geen Excel-formules, geen kopieer-werk, geen month-end wachten."*

---

### Moment 2 — Push-back rule enforcement (3 min) ⭐ governance differentiator

**Wat te zeggen:**
> "Jullie Project Plan template heeft een regel die ik letterlijk in software heb gezet: *due dates mogen één keer met max 2 weken worden uitgesteld, daarna moet de Project Owner het goedkeuren*. ProjeXtPal dwingt dit af."

**Live demo (Django shell, of fancy: in admin / frontend):**

```bash
docker compose exec -T backend python manage.py shell <<'PY'
from datetime import timedelta
from projects.models import Project, Task, TaskDueDateChangeRequest
from projects.serializers import TaskSerializer
from accounts.models import CustomUser

p = Project.objects.get(name='Renovation Phase 2')
t = Task.objects.filter(milestone__project=p).first()
print(f"Task: {t.title!r}")
print(f"   due_date={t.due_date} revision_count={t.revision_count}")

# 1e push, 10 dagen — past beleid
class FakeReq:
    user = CustomUser.objects.first()
    data = {}
s = TaskSerializer(t, data={'due_date': str(t.due_date + timedelta(days=10))},
                   partial=True, context={'request': FakeReq})
s.is_valid(raise_exception=True); s.save()
t.refresh_from_db()
print(f"\nNa 1e push (+10d):")
print(f"   due_date={t.due_date} revised={t.revised_due_date} revision_count={t.revision_count}")

# 2e push, nog 5 dagen — TRIGGERT APPROVAL WORKFLOW
s = TaskSerializer(t, data={'due_date': str(t.due_date + timedelta(days=5))},
                   partial=True, context={'request': FakeReq})
s.is_valid(raise_exception=True); s.save()
t.refresh_from_db()
print(f"\nNa 2e push attempt:")
print(f"   due_date={t.due_date} (UNCHANGED — pending approval)")
print(f"   Pending requests: {TaskDueDateChangeRequest.objects.filter(task=t, status='pending').count()}")
PY
```

**Sleutel-zin:** *"De regel staat niet in een gebruikershandleiding — hij zit in de code. Een PM die het probeert te omzeilen, kan het niet."*

**Volgende stap toon (mocking):** "De Project Owner krijgt dit als notification, ziet de queue, kan approve of reject."

---

### Moment 3 — AI Meeting Minutes uit transcript (4 min) ⭐ wow-moment

**Vooraf:** verify dat `ANTHROPIC_API_KEY` (of Yanmar BYO key via UI) is gezet.

**Wat te zeggen:**
> "Niemand notuleert graag. We hebben jullie Meeting Minutes template gevoed aan Claude. Plak een ruwe transcript-tekst, en je krijgt jullie format in DOCX terug — inclusief attendees-Invited/Attendees/Absent, agenda, discussion points, actions met PIC en Action Due, conclusions, **én previous-actions automatisch overgenomen uit de vorige meeting**."

**Live demo:**
- Plak een korte fictieve transcript van een steerco (Yanmar context — Block 4 permit, HVAC, etc.)
- POST naar `/api/v1/communication/projects/2/meetings/ai-minutes/`
- Download de DOCX, open

**Sleutel-zin:** *"En Yanmar's eigen Anthropic key kan dit aansturen — geen prompt-data komt ooit langs Inclufy's centrale account. Zien jullie zo."*

---

### Moment 4 — BYO LLM key & InfoSec story (3 min) — voor Shah / Yanmar IT

**Open browser:** `localhost:8001/settings → API Keys`

**Wat te zeggen:**
> "Vooraan in jullie eisen: 'AI via Yanmar-managed keys, no external data exposure'. Hier zit het. Default = Inclufy's pool (snelste start). Toggle naar Custom, plak jullie Anthropic-key, save. Vanaf dat moment routeert élke AI-call van Yanmar via jullie eigen account."

**Demo:**
- Toggle Anthropic → Custom
- Toon dat key masked wordt opgeslagen
- Open admin → CompanyAIKey → toon dat de key niet leesbaar is (encrypted-at-rest via Fernet)

**Sleutel-zin (voor IT-publiek):** *"Database leak ≠ key leak. Fernet symmetric encryption, sleutel in environment, niet in DB. Rotatie via één management command."*

**Zwaaien naar `docs/yanmar/aws-topology-yanmar.md` §3 (BYO key plumbing diagram).**

---

### Moment 5 — Budget one-view (2 min) — voor finance/Shah

**Open** project dashboard → Budget tab (of toon via shell-output).

**Wat te zeggen:**
> "Jullie zeiden: *één view met Budget vs Internal vs External vs Paid vs Outstanding*. Vandaag wachten jullie op month-end. Hier zie je het real-time."

**Toon:**
- Gestapelde bar (Internal blauw, External paars, ETC amber, Variance groen/rood)
- Tabel met Budget / Internal / External / Paid / Outstanding / Actuals / ETC / Contingency / **Variance = Budget − (Actuals + ETC)**

**Sleutel-zin:** *"Internal = uren × tarief, External = synced invoices uit SAP straks. Geen reconciliatie. Geen Excel."*

---

### Moment 6 — Project Plan DOCX + closing (2 min)

**Setup:**
```bash
docker compose exec -T backend python manage.py shell <<'PY'
from projects.models import Project
from projects.exports_project_plan import render_project_plan_docx
p = Project.objects.get(name='Renovation Phase 2')
open('/tmp/plan.docx','wb').write(render_project_plan_docx(p))
PY
docker cp projectpal-backend:/tmp/plan.docx ~/Desktop/yanmar_plan.docx
```

**Open `yanmar_plan.docx`** — wijs aan:
- 6-role tabel (Project Owner / PM / Leader / Facilitator / Outside Eyes / Stakeholder)
- Scope in / Scope out (jullie velden, niet één tekstblok)
- Impact + Solution (problem-statement sectie)
- 3 dates (Start / Target Implementation / Target End)
- Action plan tabel uit milestones
- **De push-back regel — letterlijk in het document, omdat het in de software zit**
- Communication plan, Go-Live, Closing met "Senior Manager sign-off" requirement

**Sleutel-zin:** *"De documenten matchen jullie template. Letterlijk. Print-en-tekenbaar."*

---

## Q&A — anticipeer deze vragen

| Vraag van Dhruv/Shah | Antwoord |
|---|---|
| "Wat als we andere methodologie willen?" | Methodology-aware export selector — Company kan default zetten (Yanmar / PRINCE2 / generic). Per-export override met `?template=`. Custom templates per klant kunnen we toevoegen. |
| "Hoe lang om Yanmar prod-klaar te krijgen?" | Vandaag = lokaal werkend, ~98% coverage. Productie-deploy in AWS: 4–6 weken voor Option A, 10 weken voor Option B (Yanmar-controlled). Zie `docs/yanmar/aws-topology-yanmar.md`. |
| "SAP integratie?" | Phase 2 separate SOW. We hebben Yanmar IT-betrokkenheid nodig (endpoints, credentials, decision pull vs push). Geschat 15-25 dev-dagen + Yanmar IT side. |
| "Wat doen jullie als de Anthropic API down is?" | AI features tonen graceful 503. Niet-AI features draaien gewoon door. |
| "Data sovereignty — wat als we straks géén AI willen?" | BYO key toggle uit. Geen LLM-calls. ProjeXtPal blijft volledig functioneel — AI is een feature-layer, niet een dependency. |
| "Wat kost dit?" | (Pricing-discussie — separate. Aanbeveling: lock down scope vandaag, terugkomen op cijfers na intern review.) |
| "Wanneer kunnen we beginnen?" | Contract akkoord = 1 week setup, 4–6 weken tot productie. Yanmar krijgt een staging environment vanaf week 2. |
| "Hoe testen jullie?" | Per-feature regressie-tests; cross-tenant data-leak audit; data-guardian agent vóór elke deploy. Zie DPIA §5. |
| "Wie krijgen we als contact?" | Sami als primair contact + product owner. Engineering 24h SLA. |

---

## Wat NIET te zeggen / pitfalls

❌ **Niet** beloven dat SAP klaar is — Phase 2.
❌ **Niet** specifieke prijs noemen voordat scope dichtgespijkerd is.
❌ **Niet** in detail over andere klanten praten — Yanmar wil hun ding.
❌ **Niet** te lang stilstaan bij niet-relevante features (Academy, Surveys, etc.). Focus blijft governance + reporting + AI.

---

## After the demo — concrete close

> "Dhruv, Shah — jullie templates zitten 1:1 in het systeem. Wat we vandaag vragen:
> 1. **Confirm scope** voor productie (Option A of B uit het AWS-topology doc?)
> 2. **'Aiden' cost line** — vendor of cost-center code? Eén antwoord en de Financials zijn rond.
> 3. **BYO key** — komt die uit Yanmar's eigen Anthropic account of moeten we Inclufy-pool starten?
> 4. **Mandate voor 1 user pilot** — wie gaat hem als eerste in 't echt gebruiken? Hoe sneller die feedback, hoe sneller productie-fit.
>
> Volgende stap: contract draft binnen 1 week na vandaag, kick-off Q3 start."

---

## Cheat-sheet voor live demo — shell commands ready to paste

```bash
# Onesie before demo:
cd ~/Projects/projextpal
docker compose up -d backend postgres redis
sleep 5

# Generate fresh PPTX (Moment 1)
docker compose exec -T backend python manage.py shell <<'PY'
from prince2.models import HighlightReport
from prince2.exports import highlight_report_to_data, render_highlight_pptx
hr = HighlightReport.objects.filter(project__name='Renovation Phase 2').first()
open('/tmp/y.pptx','wb').write(render_highlight_pptx(highlight_report_to_data(hr)))
PY
docker cp projectpal-backend:/tmp/y.pptx ~/Desktop/yanmar_demo.pptx
open ~/Desktop/yanmar_demo.pptx

# Generate Project Plan DOCX (Moment 6)
docker compose exec -T backend python manage.py shell <<'PY'
from projects.models import Project
from projects.exports_project_plan import render_project_plan_docx
p = Project.objects.get(name='Renovation Phase 2')
open('/tmp/p.docx','wb').write(render_project_plan_docx(p))
PY
docker cp projectpal-backend:/tmp/p.docx ~/Desktop/yanmar_plan.docx
```

---

## Backup als iets faalt tijdens demo

Als backend down — toon de **al gegenereerde PPTX van eerder uit `~/Downloads/`**. Niet panic, leg uit "live demo dependencies — hier is de output van vorige sessie, exact dezelfde flow." Yanmar respecteert engineering-honesty meer dan een glansrijk maar gebroken demo.
