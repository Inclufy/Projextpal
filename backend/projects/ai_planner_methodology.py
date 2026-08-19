"""
Plan met AI — methodiek-specifieke uitbreiding.

Het generieke plan (mijlpalen/taken/risico's) blijft de ruggengraat; deze
module laat de AI daarbovenop de artefacten van de gekozen methodiek
voorstellen en schrijft ze bij Toepassen naar de juiste modellen:

  scrum      → sprints + backlog-items (Product Backlog)
  kanban     → kolommen (met WIP-limieten) + kaarten op het bord
  prince2    → werkpakketten + producten
  lss groen/zwart → DMAIC-fasen (gedeeld model) + fase-taken
  waterfall  → fasen (requirements → maintenance)
  hybrid     → fasen met elk hun eigen methodiek + entry/exit-criteria

Elke methodiek heeft een deterministische fallback zodat de flow ook zonder
AI-sleutel een bruikbaar, bewerkbaar voorstel geeft.
"""
from __future__ import annotations

from datetime import date, timedelta

# Caps per apply (misbruik-/foutgrens).
MAX_ITEMS = 60

_DMAIC = ["define", "measure", "analyze", "improve", "control"]
_DMAIC_NL = {"define": "Definiëren", "measure": "Meten", "analyze": "Analyseren",
             "improve": "Verbeteren", "control": "Borgen"}
_WATERFALL_TYPES = ["requirements", "design", "development", "testing", "deployment", "maintenance"]
_BACKLOG_TYPES = {"user_story", "bug", "task", "spike", "epic"}
_PRIORITIES = {"low", "medium", "high", "urgent"}


def spec_key(methodology: str) -> str | None:
    """Projectmethodiek → spec-sleutel (None = alleen het generieke plan)."""
    m = (methodology or "").lower()
    if m in ("lean_six_sigma_green", "lss_green"):
        return "lss_green"
    if m in ("lean_six_sigma_black", "lss_black"):
        return "lss_black"
    if m in ("scrum", "kanban", "prince2", "waterfall", "hybrid"):
        return m
    return None


# --------------------------------------------------------------------------
# Prompt-uitbreiding per methodiek (JSON-contract voor "methodology_plan")
# --------------------------------------------------------------------------

_SPECS = {
    "scrum": (
        'Dit is een SCRUM-project. Voeg naast het generieke plan ook toe:\n'
        '"methodology_plan": {"type": "scrum", "sprints": [{"name": "...", "goal": "...", '
        '"start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD"}], '
        '"backlog_items": [{"title": "...", "item_type": "user_story|bug|task|spike|epic", '
        '"story_points": 1-13, "priority": "low|medium|high|urgent", '
        '"acceptance_criteria": "...", "sprint": <1-gebaseerd sprintnummer of null>}]}\n'
        'Richtlijn: 2-5 sprints van 2 weken, 6-15 backlog-items (user stories met '
        'acceptatiecriteria), de belangrijkste items aan sprint 1 gekoppeld.'
    ),
    "kanban": (
        'Dit is een KANBAN-project. Voeg naast het generieke plan ook toe:\n'
        '"methodology_plan": {"type": "kanban", "columns": [{"name": "...", '
        '"wip_limit": <getal of null>, "is_done_column": true|false}], '
        '"cards": [{"title": "...", "description": "...", "priority": "low|medium|high|urgent", '
        '"column": <1-gebaseerd kolomnummer>}]}\n'
        'Richtlijn: 4-6 kolommen (instroom → gereed) met realistische WIP-limieten op de '
        'werk-kolommen, en 6-15 startkaarten in de eerste kolom(men).'
    ),
    "prince2": (
        'Dit is een PRINCE2-project. Voeg naast het generieke plan ook toe:\n'
        '"methodology_plan": {"type": "prince2", "work_packages": [{"title": "...", '
        '"description": "..."}], "products": [{"title": "...", "description": "...", '
        '"work_package": <1-gebaseerd werkpakketnummer of null>}]}\n'
        'Richtlijn: 3-6 werkpakketten die het werk autoriseren, met per werkpakket 1-3 '
        'op te leveren producten (productgericht plannen).'
    ),
    "lss_green": (
        'Dit is een LEAN SIX SIGMA-project (Green Belt). Voeg naast het generieke plan toe:\n'
        '"methodology_plan": {"type": "lss", "phases": [{"phase": "define|measure|analyze|improve|control", '
        '"objective": "...", "target_start_date": "YYYY-MM-DD", "target_end_date": "YYYY-MM-DD"}], '
        '"lss_tasks": [{"title": "...", "description": "...", "phase": "define|measure|analyze|improve|control"}]}\n'
        'Richtlijn: alle vijf DMAIC-fasen met een concreet doel per fase, verdeeld over de '
        'projectperiode, en 2-4 taken per fase.'
    ),
    "waterfall": (
        'Dit is een WATERFALL-project. Voeg naast het generieke plan ook toe:\n'
        '"methodology_plan": {"type": "waterfall", "phases": [{"phase_type": '
        '"requirements|design|development|testing|deployment|maintenance", "name": "...", '
        '"description": "...", "start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD"}]}\n'
        'Richtlijn: opeenvolgende fasen zonder overlap, samen de hele projectperiode dekkend.'
    ),
    "hybrid": (
        'Dit is een HYBRIDE project. Voeg naast het generieke plan ook toe:\n'
        '"methodology_plan": {"type": "hybrid", "phases": [{"phase": "...", '
        '"methodology": "waterfall|scrum|kanban|prince2", "description": "...", '
        '"entry_criteria": "...", "exit_criteria": "...", '
        '"start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD"}]}\n'
        'Richtlijn: 3-5 fasen met per fase de best passende methodiek en heldere '
        'entry/exit-criteria (fasepoorten).'
    ),
}
_SPECS["lss_black"] = _SPECS["lss_green"].replace("Green Belt", "Black Belt")


def prompt_extension(methodology: str) -> str:
    key = spec_key(methodology)
    return ("\n\n" + _SPECS[key]) if key else ""


# --------------------------------------------------------------------------
# Deterministische fallback per methodiek
# --------------------------------------------------------------------------

def fallback_plan(methodology: str, start: date, end: date) -> dict | None:
    key = spec_key(methodology)
    if not key:
        return None
    span = max((end - start).days, 7)

    def d(frac):
        return (start + timedelta(days=round(span * frac))).isoformat()

    if key == "scrum":
        n = max(2, min(5, span // 14))
        sprints = [{"name": f"Sprint {i+1}", "goal": "", "start_date": d(i / n),
                    "end_date": d((i + 1) / n)} for i in range(n)]
        items = [
            {"title": "Als gebruiker wil ik de kernfunctionaliteit gebruiken", "item_type": "user_story",
             "story_points": 8, "priority": "high", "acceptance_criteria": "", "sprint": 1},
            {"title": "Basisinrichting en toegangen regelen", "item_type": "task",
             "story_points": 3, "priority": "high", "acceptance_criteria": "", "sprint": 1},
            {"title": "Als gebruiker wil ik resultaten kunnen inzien", "item_type": "user_story",
             "story_points": 5, "priority": "medium", "acceptance_criteria": "", "sprint": 2},
            {"title": "Verbeterpunten uit review verwerken", "item_type": "task",
             "story_points": 5, "priority": "medium", "acceptance_criteria": "", "sprint": None},
        ]
        return {"type": "scrum", "sprints": sprints, "backlog_items": items}

    if key == "kanban":
        return {"type": "kanban",
                "columns": [
                    {"name": "Backlog", "wip_limit": None, "is_done_column": False},
                    {"name": "Te doen", "wip_limit": 5, "is_done_column": False},
                    {"name": "In uitvoering", "wip_limit": 3, "is_done_column": False},
                    {"name": "Review", "wip_limit": 2, "is_done_column": False},
                    {"name": "Gereed", "wip_limit": None, "is_done_column": True},
                ],
                "cards": [
                    {"title": "Werkproces in kaart brengen", "description": "", "priority": "high", "column": 1},
                    {"title": "Eerste werkpakket oppakken", "description": "", "priority": "high", "column": 2},
                    {"title": "Werkafspraken (policies) expliciet maken", "description": "", "priority": "medium", "column": 1},
                ]}

    if key == "prince2":
        return {"type": "prince2",
                "work_packages": [
                    {"title": "WP1 — Voorbereiding en inrichting", "description": ""},
                    {"title": "WP2 — Realisatie kernproducten", "description": ""},
                    {"title": "WP3 — Acceptatie en overdracht", "description": ""},
                ],
                "products": [
                    {"title": "Ingerichte omgeving", "description": "", "work_package": 1},
                    {"title": "Opgeleverd kernproduct", "description": "", "work_package": 2},
                    {"title": "Acceptatieverslag", "description": "", "work_package": 3},
                ]}

    if key in ("lss_green", "lss_black"):
        phases = [{"phase": p, "objective": f"{_DMAIC_NL[p]}-fase afronden",
                   "target_start_date": d(i / 5), "target_end_date": d((i + 1) / 5)}
                  for i, p in enumerate(_DMAIC)]
        tasks = [
            {"title": "Probleemdefinitie en projectcharter opstellen", "description": "", "phase": "define"},
            {"title": "Nulmeting uitvoeren", "description": "", "phase": "measure"},
            {"title": "Grondoorzaken analyseren", "description": "", "phase": "analyze"},
            {"title": "Verbeteringen implementeren", "description": "", "phase": "improve"},
            {"title": "Borgingsplan en controlekaarten inrichten", "description": "", "phase": "control"},
        ]
        return {"type": "lss", "phases": phases, "lss_tasks": tasks}

    if key == "waterfall":
        fasen = [("requirements", "Requirements"), ("design", "Ontwerp"),
                 ("development", "Realisatie"), ("testing", "Testen"), ("deployment", "Livegang")]
        n = len(fasen)
        return {"type": "waterfall",
                "phases": [{"phase_type": t, "name": naam, "description": "",
                            "start_date": d(i / n), "end_date": d((i + 1) / n)}
                           for i, (t, naam) in enumerate(fasen)]}

    if key == "hybrid":
        return {"type": "hybrid",
                "phases": [
                    {"phase": "Voorbereiding", "methodology": "waterfall", "description": "",
                     "entry_criteria": "Opdracht bevestigd", "exit_criteria": "Plan en team gereed",
                     "start_date": d(0), "end_date": d(0.25)},
                    {"phase": "Realisatie", "methodology": "scrum", "description": "",
                     "entry_criteria": "Backlog gevuld", "exit_criteria": "Increment geaccepteerd",
                     "start_date": d(0.25), "end_date": d(0.8)},
                    {"phase": "Overdracht", "methodology": "kanban", "description": "",
                     "entry_criteria": "Acceptatietest gehaald", "exit_criteria": "In beheer genomen",
                     "start_date": d(0.8), "end_date": d(1.0)},
                ]}
    return None


# --------------------------------------------------------------------------
# Toepassen per methodiek
# --------------------------------------------------------------------------

def _pd(value):
    if not value:
        return None
    try:
        return date.fromisoformat(str(value)[:10])
    except Exception:
        return None


def apply_plan(project, user, mplan: dict) -> dict:
    """Schrijft een (bewerkt) methodology_plan naar de juiste modellen.
    Geeft tellingen per artefacttype terug; slaat lege titels over."""
    counts: dict = {}
    mtype = (mplan or {}).get("type")
    if mtype == "scrum":
        counts.update(_apply_scrum(project, user, mplan))
    elif mtype == "kanban":
        counts.update(_apply_kanban(project, user, mplan))
    elif mtype == "prince2":
        counts.update(_apply_prince2(project, mplan))
    elif mtype == "lss":
        counts.update(_apply_lss(project, user, mplan,
                                 black=(spec_key(project.methodology) == "lss_black")))
    elif mtype == "waterfall":
        counts.update(_apply_waterfall(project, mplan))
    elif mtype == "hybrid":
        counts.update(_apply_hybrid(project, mplan))
    return counts


def _titled(items, key="title"):
    out = []
    for it in (items or [])[:MAX_ITEMS]:
        if str(it.get(key) or "").strip():
            out.append(it)
    return out


def _apply_scrum(project, user, mplan) -> dict:
    from scrum.models import BacklogItem, ProductBacklog, Sprint

    backlog, _ = ProductBacklog.objects.get_or_create(project=project)
    next_no = (Sprint.objects.filter(project=project)
               .order_by("-number").values_list("number", flat=True).first() or 0) + 1
    sprints = []
    for s in _titled(mplan.get("sprints"), key="name"):
        sprints.append(Sprint.objects.create(
            project=project, name=str(s["name"])[:100], number=next_no,
            goal=s.get("goal") or "", status="planning",
            start_date=_pd(s.get("start_date")), end_date=_pd(s.get("end_date")),
        ))
        next_no += 1

    next_order = (BacklogItem.objects.filter(backlog=backlog)
                  .order_by("-order").values_list("order", flat=True).first() or 0) + 1
    n_items = 0
    for it in _titled(mplan.get("backlog_items")):
        sprint = None
        ref = it.get("sprint")
        if isinstance(ref, int) and 1 <= ref <= len(sprints):
            sprint = sprints[ref - 1]
        try:
            points = int(it.get("story_points")) if it.get("story_points") else None
        except Exception:
            points = None
        BacklogItem.objects.create(
            backlog=backlog, title=str(it["title"])[:300],
            description=it.get("description") or "",
            acceptance_criteria=it.get("acceptance_criteria") or "",
            item_type=it.get("item_type") if it.get("item_type") in _BACKLOG_TYPES else "user_story",
            story_points=points,
            priority=it.get("priority") if it.get("priority") in _PRIORITIES else "medium",
            status="new", order=next_order, sprint=sprint, reporter=user,
        )
        next_order += 1
        n_items += 1
    return {"sprints": len(sprints), "backlog_items": n_items}


def _apply_kanban(project, user, mplan) -> dict:
    from kanban.models import KanbanBoard, KanbanCard, KanbanColumn

    board, _ = KanbanBoard.objects.get_or_create(project=project)
    bestaande = {c.name.strip().lower(): c for c in board.columns.all()}
    next_order = (board.columns.order_by("-order").values_list("order", flat=True).first() or 0) + 1

    kolommen, nieuw = [], 0
    for c in _titled(mplan.get("columns"), key="name"):
        naam = str(c["name"])[:100]
        col = bestaande.get(naam.strip().lower())
        if col is None:
            try:
                wip = int(c.get("wip_limit")) if c.get("wip_limit") else None
            except Exception:
                wip = None
            col = KanbanColumn.objects.create(
                board=board, name=naam, column_type="custom", order=next_order,
                wip_limit=wip, is_done_column=bool(c.get("is_done_column")),
            )
            next_order += 1
            nieuw += 1
        kolommen.append(col)

    n_cards = 0
    for k in _titled(mplan.get("cards")):
        col = None
        ref = k.get("column")
        if isinstance(ref, int) and 1 <= ref <= len(kolommen):
            col = kolommen[ref - 1]
        elif kolommen:
            col = kolommen[0]
        if col is None:
            continue
        KanbanCard.objects.create(
            board=board, column=col, title=str(k["title"])[:300],
            description=k.get("description") or "",
            priority=k.get("priority") if k.get("priority") in _PRIORITIES else "medium",
            reporter=user,
        )
        n_cards += 1
    return {"kanban_columns": nieuw, "kanban_cards": n_cards}


def _apply_prince2(project, mplan) -> dict:
    from prince2.models import Product, WorkPackage

    next_ref = WorkPackage.objects.filter(project=project).count() + 1
    wps = []
    for wp in _titled(mplan.get("work_packages")):
        wps.append(WorkPackage.objects.create(
            project=project, reference=f"WP-{next_ref}",
            title=str(wp["title"])[:200], description=wp.get("description") or "",
        ))
        next_ref += 1

    n_products = 0
    for p in _titled(mplan.get("products")):
        wp = None
        ref = p.get("work_package")
        if isinstance(ref, int) and 1 <= ref <= len(wps):
            wp = wps[ref - 1]
        Product.objects.create(
            project=project, work_package=wp,
            title=str(p["title"])[:255], description=p.get("description") or "",
        )
        n_products += 1
    return {"work_packages": len(wps), "products": n_products}


def _apply_lss(project, user, mplan, *, black: bool) -> dict:
    from lss_green.models import DMAICPhase
    if black:
        from lss_black.models import LSSBlackTask as TaskModel
    else:
        from lss_green.models import LSSGreenTask as TaskModel

    fasen: dict = {}
    n_phases = 0
    for f in (mplan.get("phases") or [])[:10]:
        p = str(f.get("phase") or "").lower()
        if p not in _DMAIC:
            continue
        phase, created = DMAICPhase.objects.get_or_create(
            project=project, phase=p,
            defaults={"order": _DMAIC.index(p),
                      "objective": f.get("objective") or "",
                      "target_start_date": _pd(f.get("target_start_date")),
                      "target_end_date": _pd(f.get("target_end_date"))},
        )
        if not created and f.get("objective") and not phase.objective:
            phase.objective = f["objective"]
            phase.save(update_fields=["objective"])
        fasen[p] = phase
        n_phases += 1 if created else 0

    n_tasks = 0
    for t in _titled(mplan.get("lss_tasks")):
        p = str(t.get("phase") or "").lower()
        phase = fasen.get(p)
        if phase is None and p in _DMAIC:
            phase, _ = DMAICPhase.objects.get_or_create(
                project=project, phase=p, defaults={"order": _DMAIC.index(p)})
        if phase is None:
            continue
        TaskModel.objects.create(
            project=project, phase=phase, title=str(t["title"])[:255],
            description=t.get("description") or "",
        )
        n_tasks += 1
    return {"dmaic_phases": n_phases, "lss_tasks": n_tasks}


def _apply_waterfall(project, mplan) -> dict:
    from waterfall.models import WaterfallPhase

    n = 0
    for f in _titled(mplan.get("phases"), key="name"):
        ptype = str(f.get("phase_type") or "").lower()
        if ptype not in _WATERFALL_TYPES:
            continue
        WaterfallPhase.objects.create(
            project=project, phase_type=ptype, name=str(f["name"])[:100],
            description=f.get("description") or "",
            start_date=_pd(f.get("start_date")), end_date=_pd(f.get("end_date")),
        )
        n += 1
    return {"waterfall_phases": n}


def _apply_hybrid(project, mplan) -> dict:
    from hybrid.models import PhaseMethodology

    next_order = (PhaseMethodology.objects.filter(project=project)
                  .order_by("-order").values_list("order", flat=True).first() or 0) + 1
    n = 0
    for f in _titled(mplan.get("phases"), key="phase"):
        PhaseMethodology.objects.create(
            project=project, phase=str(f["phase"])[:100],
            methodology=(f.get("methodology") or "waterfall")[:50],
            description=f.get("description") or "",
            entry_criteria=f.get("entry_criteria") or "",
            exit_criteria=f.get("exit_criteria") or "",
            order=next_order,
            start_date=_pd(f.get("start_date")), end_date=_pd(f.get("end_date")),
        )
        next_order += 1
        n += 1
    return {"hybrid_phases": n}
