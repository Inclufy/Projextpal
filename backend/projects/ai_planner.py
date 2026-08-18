"""
Plan met AI — chatgestuurde conceptplanning (IL-2).

Een korte chat begeleidt de gebruiker naar een volledig conceptplan
(mijlpalen + taken + risico's) dat als BEWERKBAAR voorstel terugkomt; de
gebruiker past aan en klikt "Toepassen" in plaats van alles zelf te bedenken.

Het echte werk zit in twee dingen:
  1. plan_chat()  — grondt het gesprek in de projectcontext en dwingt een
     strikt JSON-contract af ({action: ask|propose, message, proposal}).
     LLM-volgorde: Anthropic (bedrijfssleutel of pool) → OpenAI (idem) →
     deterministisch sjabloonplan, zodat de flow nooit doodloopt zonder key.
  2. apply_plan() — zet een (eventueel door de gebruiker bewerkt) voorstel
     om in echte Milestone/Task/Risk-rijen, met validatie en limieten.

  POST /api/v1/projects/<pk>/ai-plan/         {messages: [{role, content}]}
  POST /api/v1/projects/<pk>/ai-plan/apply/   {proposal: {...}}
"""
from __future__ import annotations

import json
from datetime import date, timedelta

ANTHROPIC_MODEL = "claude-opus-5"
OPENAI_MODEL = "gpt-4o-mini"

# Harde limieten op wat één apply mag aanmaken (misbruik-/foutgrens).
MAX_MILESTONES = 30
MAX_TASKS = 200
MAX_RISKS = 30

_PRIORITIES = {"low", "medium", "high", "urgent"}
_RISK_CATEGORIES = {"Technical", "Schedule", "Financial", "Operational", "Strategic", "Compliance"}
_HML = {"High", "Medium", "Low"}


# --------------------------------------------------------------------------
# Context + prompt
# --------------------------------------------------------------------------

def _charter_context(project) -> dict:
    """Best-effort charteruitlezing — de rijkste bron om een plan in te
    gronden (doel, scope, deliverables mét datums, bekende risico's)."""
    ctx: dict = {}
    # Charter-velden op het Project zelf (Foundation Charter-pagina).
    for field, key in (
        ("problem_impact", "charter_problem"),
        ("proposed_solution", "charter_solution"),
        ("scope_in", "charter_scope"),
        ("scope_out", "charter_out_of_scope"),
    ):
        val = getattr(project, field, None)
        if val:
            ctx[key] = str(val)[:1500]
    tid = getattr(project, "target_implementation_date", None)
    if tid:
        ctx["charter_target_date"] = tid.isoformat()
    try:
        from charater.models import ProgramCharter
        ch = (ProgramCharter.objects.filter(project=project)
              .order_by("-version").first())
        if ch:
            ctx["charter_goal"] = (ch.goal_objective or "")[:1500]
            ctx["charter_description"] = (ch.description or "")[:1500]
            ctx["charter_deliverables"] = [
                {"deliverable": (d.deliverable or d.description or "")[:200],
                 "date": d.date.isoformat() if d.date else None}
                for d in ch.deliverables.all()[:15]
            ]
            ctx["charter_known_risks"] = [
                (r.risk or r.description or "")[:200] for r in ch.risks.all()[:10]
            ]
            ctx["charter_scope"] = ctx.get("charter_scope") or [
                (s.capabilities or s.description or "")[:200] for s in ch.scopes.all()[:10]
            ]
    except Exception:
        pass
    try:
        from sixsigma.models import ProjectCharter as SixSigmaCharter
        ssc = SixSigmaCharter.objects.filter(project=project).first()
        if ssc:
            ctx["charter_problem"] = ctx.get("charter_problem") or (ssc.problem_statement or "")[:1000]
            ctx["charter_goal"] = ctx.get("charter_goal") or (ssc.goal_statement or "")[:1000]
            ctx["charter_scope"] = ctx.get("charter_scope") or (ssc.project_scope or "")[:1000]
    except Exception:
        pass
    return {k: v for k, v in ctx.items() if v}


def _project_context(project) -> dict:
    """Compacte, feitelijke projectcontext waarin het plan gegrond wordt."""
    milestones = list(
        project.milestones.values_list("name", flat=True).order_by("order_index")[:20]
    )
    task_count = 0
    try:
        from .models import Task
        task_count = Task.objects.filter(milestone__project=project).count()
    except Exception:
        pass
    ctx = {
        "project_name": project.name,
        "description": (project.description or "")[:2000],
        "methodology": project.methodology or "",
        "status": project.status or "",
        "start_date": project.start_date.isoformat() if project.start_date else None,
        "end_date": project.end_date.isoformat() if project.end_date else None,
        "existing_milestones": milestones,
        "existing_task_count": task_count,
        "today": date.today().isoformat(),
    }
    ctx.update(_charter_context(project))
    return ctx


def _system_prompt(ctx: dict) -> str:
    return (
        "Je bent de ProjeXtPal planningsassistent. Je helpt een projectmanager in een "
        "kort gesprek aan een volledige conceptplanning: mijlpalen (fasen), taken per "
        "mijlpaal en risico's. De gebruiker hoeft alleen bij te sturen — jij doet het "
        "denkwerk. Antwoord in de taal van de gebruiker (standaard Nederlands).\n\n"
        "Gespreksregels:\n"
        "- Stel hooguit ÉÉN keer een korte set verduidelijkingsvragen (max 3, in één "
        "bericht) en alleen als essentiële informatie ontbreekt (bv. opleverdatum, "
        "scope, teamgrootte). Is er genoeg bekend, of vraagt de gebruiker direct om "
        "een plan, doe dan meteen een voorstel.\n"
        "- Bestaat er al een (deel)planning, stel dan aanvullingen voor en dupliceer "
        "geen bestaande mijlpalen.\n"
        "- Plaats alle datums binnen de projectperiode als die bekend is; datums in "
        "ISO-formaat YYYY-MM-DD.\n"
        "- Realistisch en concreet: 3-8 mijlpalen, 2-6 taken per mijlpaal, 3-6 "
        "risico's. Taken krijgen een heldere, actiegerichte titel.\n\n"
        "Antwoord ALTIJD met STRIKTE JSON (geen markdown, geen tekst eromheen) met "
        "exact deze structuur:\n"
        "{\n"
        '  "action": "ask" | "propose",\n'
        '  "message": "chatbericht aan de gebruiker (bij propose: korte toelichting op het plan)",\n'
        '  "proposal": null | {\n'
        '    "summary": "één zin die het plan samenvat",\n'
        '    "milestones": [{"name": "...", "description": "...", "start_date": "YYYY-MM-DD", '
        '"end_date": "YYYY-MM-DD", "tasks": [{"title": "...", "description": "...", '
        '"priority": "low|medium|high|urgent", "start_date": "YYYY-MM-DD"|null, '
        '"due_date": "YYYY-MM-DD"|null}]}],\n'
        '    "risks": [{"name": "...", "description": "...", "category": '
        '"Technical|Schedule|Financial|Operational|Strategic|Compliance", '
        '"impact": "High|Medium|Low", "probability": 0-100, "level": "High|Medium|Low", '
        '"mitigation": "..."}]\n'
        "  }\n"
        "}\n\n"
        f"Projectcontext (feiten, niet verzinnen):\n{json.dumps(ctx, ensure_ascii=False)}"
    )


# --------------------------------------------------------------------------
# LLM-aanroepen (Anthropic → OpenAI → deterministisch)
# --------------------------------------------------------------------------

def _strip_fences(raw: str) -> str:
    cleaned = (raw or "").strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("```", 2)[1]
        if cleaned.startswith("json"):
            cleaned = cleaned[4:]
        cleaned = cleaned.strip()
    return cleaned


def _parse_reply(raw: str) -> dict | None:
    try:
        data = json.loads(_strip_fences(raw))
    except Exception:
        return None
    if not isinstance(data, dict) or data.get("action") not in ("ask", "propose"):
        return None
    if data["action"] == "propose" and not isinstance(data.get("proposal"), dict):
        return None
    return {
        "action": data["action"],
        "message": str(data.get("message") or ""),
        "proposal": data.get("proposal") if data["action"] == "propose" else None,
    }


def _chat_anthropic(company, system: str, messages: list) -> dict | None:
    try:
        from core.llm_keys import get_anthropic_client
        client = get_anthropic_client(company)
        if client is None:
            return None
        resp = client.messages.create(
            model=ANTHROPIC_MODEL, max_tokens=6000, system=system,
            messages=[{"role": m["role"], "content": m["content"]} for m in messages],
        )
        raw = "".join(
            b.text for b in resp.content if getattr(b, "type", "") == "text"
        )
        return _parse_reply(raw)
    except Exception:
        return None


def _chat_openai(company, system: str, messages: list) -> dict | None:
    try:
        from core.llm_keys import get_openai_client
        client = get_openai_client(company)
        if client is None:
            return None
        resp = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[{"role": "system", "content": system}]
            + [{"role": m["role"], "content": m["content"]} for m in messages],
            temperature=0.3,
            max_tokens=4000,
            response_format={"type": "json_object"},
        )
        return _parse_reply(resp.choices[0].message.content or "")
    except Exception:
        return None


def _fallback_plan(project) -> dict:
    """Deterministisch sjabloonplan: vier fasen tussen start- en einddatum
    (of vanaf vandaag, 8 weken). Volledig bewerkbaar door de gebruiker."""
    start = project.start_date or date.today()
    end = project.end_date if (project.end_date and project.end_date > start) else start + timedelta(days=56)
    span = (end - start).days

    def d(frac):  # datum op een fractie van de doorlooptijd
        return (start + timedelta(days=round(span * frac))).isoformat()

    phases = [
        ("Fase 1 — Voorbereiding & inrichting", 0.0, 0.25, [
            "Kick-off en rolverdeling vastleggen",
            "Benodigde informatie en toegangen verzamelen",
            "Omgeving/inrichting gereedmaken",
        ]),
        ("Fase 2 — Uitvoering & configuratie", 0.25, 0.6, [
            "Kernonderdelen opleveren volgens scope",
            "Tussentijdse review met opdrachtgever",
            "Openstaande beslispunten wegwerken",
        ]),
        ("Fase 3 — Training & acceptatie", 0.6, 0.85, [
            "Gebruikers trainen",
            "Acceptatietest uitvoeren en bevindingen oplossen",
        ]),
        ("Fase 4 — Livegang & nazorg", 0.85, 1.0, [
            "Go-live uitvoeren",
            "Nazorg en evaluatie inplannen",
        ]),
    ]
    milestones = []
    for name, f0, f1, tasks in phases:
        milestones.append({
            "name": name, "description": "",
            "start_date": d(f0), "end_date": d(f1),
            "tasks": [{
                "title": t, "description": "", "priority": "medium",
                "start_date": d(f0), "due_date": d(f1),
            } for t in tasks],
        })
    risks = [
        {"name": "Benodigde input komt te laat", "description": "Aanlevering van informatie of beslissingen door stakeholders loopt uit.",
         "category": "Schedule", "impact": "Medium", "probability": 40, "level": "Medium",
         "mitigation": "Deadlines per aanlevering afspreken en wekelijks bewaken."},
        {"name": "Beperkte beschikbaarheid van het team", "description": "Sleutelpersonen zijn niet beschikbaar op de geplande momenten.",
         "category": "Operational", "impact": "Medium", "probability": 30, "level": "Medium",
         "mitigation": "Capaciteit vooraf reserveren en een vervanger aanwijzen."},
        {"name": "Scope groeit tijdens het project", "description": "Extra wensen komen erbij zonder herplanning.",
         "category": "Strategic", "impact": "High", "probability": 35, "level": "Medium",
         "mitigation": "Wijzigingen via een kort change-proces laten lopen."},
    ]
    return {
        "summary": f"Standaard vierfasenplan voor “{project.name}” van {start.isoformat()} tot {end.isoformat()}.",
        "milestones": milestones,
        "risks": risks,
    }


def plan_chat(project, user, messages: list) -> dict:
    """Eén chatbeurt. `messages` = [{role: user|assistant, content: str}, ...].
    Geeft altijd een bruikbaar resultaat terug (nooit een dead-end)."""
    ctx = _project_context(project)
    system = _system_prompt(ctx)
    company = getattr(user, "company", None)

    clean = [
        {"role": m.get("role"), "content": str(m.get("content") or "")[:4000]}
        for m in (messages or [])
        if m.get("role") in ("user", "assistant") and str(m.get("content") or "").strip()
    ][-20:]
    if not clean:
        clean = [{"role": "user", "content": "Maak een conceptplanning voor dit project."}]

    result = _chat_anthropic(company, system, clean)
    source = "ai"
    if result is None:
        result = _chat_openai(company, system, clean)
    if result is None:
        source = "fallback"
        result = {
            "action": "propose",
            "message": (
                "Ik heb een standaardplan opgesteld op basis van de projectperiode. "
                "Pas de fasen, taken en datums gerust aan voordat je ze toepast. "
                "(Er is geen AI-sleutel geconfigureerd; dit is een sjabloonvoorstel.)"
            ),
            "proposal": _fallback_plan(project),
        }
    result["source"] = source
    return result


# --------------------------------------------------------------------------
# Toepassen
# --------------------------------------------------------------------------

def _parse_date(value):
    if not value:
        return None
    try:
        return date.fromisoformat(str(value)[:10])
    except Exception:
        return None


def apply_plan(project, user, proposal: dict) -> dict:
    """Maakt Milestones/Tasks/Risks aan uit een (bewerkt) voorstel.
    Slaat lege titels over; begrenst aantallen; geeft aanmaaktellingen terug."""
    from .models import Milestone, Risk, Task

    created = {"milestones": 0, "tasks": 0, "risks": 0, "skipped": 0}
    order = (project.milestones.order_by("-order_index").values_list("order_index", flat=True).first() or 0) + 1

    for m in (proposal.get("milestones") or [])[:MAX_MILESTONES]:
        name = str(m.get("name") or "").strip()[:255]
        if not name:
            created["skipped"] += 1
            continue
        milestone = Milestone.objects.create(
            project=project,
            name=name,
            description=str(m.get("description") or "")[:2000],
            start_date=_parse_date(m.get("start_date")),
            end_date=_parse_date(m.get("end_date")),
            status="pending",
            order_index=order,
        )
        order += 1
        created["milestones"] += 1

        for t in (m.get("tasks") or []):
            if created["tasks"] >= MAX_TASKS:
                break
            title = str(t.get("title") or "").strip()[:255]
            if not title:
                created["skipped"] += 1
                continue
            priority = t.get("priority") if t.get("priority") in _PRIORITIES else "medium"
            Task.objects.create(
                milestone=milestone,
                title=title,
                description=str(t.get("description") or "")[:2000],
                priority=priority,
                status="todo",
                start_date=_parse_date(t.get("start_date")),
                due_date=_parse_date(t.get("due_date")),
            )
            created["tasks"] += 1

    for r in (proposal.get("risks") or [])[:MAX_RISKS]:
        name = str(r.get("name") or "").strip()[:255]
        if not name:
            created["skipped"] += 1
            continue
        description = str(r.get("description") or "").strip()
        mitigation = str(r.get("mitigation") or "").strip()
        if mitigation:
            description = f"{description}\n\nMitigatie: {mitigation}".strip()
        try:
            probability = max(0, min(100, int(r.get("probability") or 0)))
        except Exception:
            probability = 0
        Risk.objects.create(
            project=project,
            name=name,
            description=description or name,
            category=r.get("category") if r.get("category") in _RISK_CATEGORIES else "Operational",
            impact=r.get("impact") if r.get("impact") in _HML else "Medium",
            probability=probability,
            level=r.get("level") if r.get("level") in _HML else "Medium",
            status="Open",
            created_by=user,
        )
        created["risks"] += 1

    return created
