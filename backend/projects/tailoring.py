"""
Project tailoring engine.

From a short intake (a free-text description and/or structured answers) this module
decides:
  * the recommended methodology (one of Project.METHODOLOGY_CHOICES),
  * the project type (a recognisable archetype),
  * the six tailoring dimensions (scope/budget/duur/politiek/risico/regel, each 1..3),
  * the governance shape (light / medium / heavy),
  * the recommended module set (which tabs are surfaced "up front" vs under "More").

It is deterministic by default (keyword heuristics + rules), so the feature works with
no AI key and offline. An LLM can *refine* the classification, but the rules always
provide a safe fallback — the LLM never gets the last word silently.

Nothing here imports Django models, so it is unit-testable in isolation.
"""

DIMENSIONS = ["scope", "budget", "duur", "politiek", "risico", "regel"]
SHAPE_LEVEL = {"light": 1, "medium": 2, "heavy": 3}

# Cross-cutting tabs that apply to every methodology. Tijdschrijven is already in the
# per-methodology sets (it is a first-class top-level feature); Rapportages + Analytics
# are appended here so every project surfaces them.
CROSS_TABS = [("Rapportages", 1, None), ("Analytics", 2, None)]

# Per-methodology module sets: (tab_name, base_level 1..3, trigger_dimension or None).
# A tab is "recommended" when base_level <= shape_level, OR its trigger dimension is high.
PROJECT_MODULES = {
    "prince2": [
        ("Overview", 1, None), ("Business Case", 1, None), ("Project Charter", 1, None),
        ("Team", 1, None), ("Tijdschrijven", 1, None), ("Statusrapport", 1, None),
        ("Risks", 2, None), ("Stages", 2, None), ("Budget", 2, "budget"),
        ("Highlight Reports", 2, None), ("Project Board", 3, "politiek"),
        ("Stage Gates", 3, None), ("Tolerances", 3, None), ("Exception Reports", 3, None),
        ("Assurance", 3, "regel"),
    ],
    "scrum": [
        ("Overview", 1, None), ("Product Backlog", 1, None), ("Sprint Board", 1, None),
        ("Team", 1, None), ("Tijdschrijven", 1, None), ("Daily Scrum", 1, None),
        ("Sprints", 2, None), ("Burndown", 2, None), ("Velocity", 2, None),
        ("Retrospectives", 2, None), ("Definition of Done", 2, None),
        ("Release Planning", 3, None), ("Stakeholder Reviews", 3, "politiek"),
    ],
    "agile": [
        ("Overview", 1, None), ("Backlog", 1, None), ("Iteration Board", 1, None),
        ("Team", 1, None), ("Tijdschrijven", 1, None), ("Iterations", 2, None),
        ("Velocity", 2, None), ("Retrospectives", 2, None), ("Increment Review", 2, None),
        ("Release", 3, None), ("Stakeholder Feedback", 3, "politiek"),
    ],
    "kanban": [
        ("Overview", 1, None), ("Board", 1, None), ("Team", 1, None),
        ("Tijdschrijven", 1, None), ("Statusrapport", 1, None), ("WIP-limieten", 2, None),
        ("Classes of Service", 2, None), ("Cycle Time", 2, None), ("CFD", 3, None),
        ("Policies", 3, None), ("SLA / SLE", 3, "regel"),
    ],
    "waterfall": [
        ("Overview", 1, None), ("Requirements", 1, None), ("Plan / Gantt", 1, None),
        ("Team", 1, None), ("Tijdschrijven", 1, None), ("Fasen", 2, None),
        ("Milestones", 2, None), ("Risks", 2, None), ("Fasepoorten", 3, None),
        ("Baselines", 3, None), ("EVM", 3, None), ("Change Control", 3, "regel"),
    ],
    "lean_six_sigma_green": [
        ("Overview", 1, None), ("Define (SIPOC)", 1, None), ("Team", 1, None),
        ("Tijdschrijven", 1, None), ("Measure", 2, None), ("Analyse", 2, None),
        ("Improve", 2, None), ("Control", 3, None), ("Capability (Cp/Cpk)", 3, None),
        ("Control Plan", 3, "regel"),
    ],
    "lean_six_sigma_black": [
        ("Overview", 1, None), ("Define (SIPOC)", 1, None), ("Team", 1, None),
        ("Tijdschrijven", 1, None), ("Measure", 2, None), ("MSA / Gage R&R", 2, None),
        ("Analyse", 2, None), ("Hypothesis Tests", 2, None), ("DOE", 3, None),
        ("Regression", 3, None), ("Improve", 2, None), ("Control", 3, None),
        ("Control Plan", 3, "regel"), ("Financial Validation", 3, "budget"),
    ],
    "hybrid": [
        ("Overview", 1, None), ("Backlog", 1, None), ("Plan / Fasen", 1, None),
        ("Team", 1, None), ("Tijdschrijven", 1, None), ("Sprints", 2, None),
        ("Milestones", 2, None), ("Risks", 2, None), ("Fasepoorten", 3, "politiek"),
        ("Governance", 3, None),
    ],
    "inclufy": [
        ("Overview", 1, None), ("Doelen", 1, None), ("Taken", 1, None),
        ("Team", 1, None), ("Tijdschrijven", 1, None), ("Statusrapport", 1, None),
        ("Risks", 2, None), ("Milestones", 2, None), ("Budget", 2, "budget"),
        ("Stakeholders", 2, "politiek"), ("Governance", 3, None), ("Reports", 3, None),
    ],
}

# Methodology -> Academy course slug (the real catalog slugs). Drives the
# "plan een cursus / opfris" nudge when a user's competence is low.
METHODOLOGY_COURSE = {
    "prince2": "prince2-foundation",
    "scrum": "scrum-master",
    "agile": "agile-fundamentals",
    "kanban": "kanban-practitioner",
    "waterfall": "waterfall-pm",
    "lean_six_sigma_green": "lean-six-sigma",
    "lean_six_sigma_black": "lean-six-sigma",
    "hybrid": "pm-fundamentals",
    "inclufy": "pm-fundamentals",
}


# Recognisable scenario presets for the project-creation picker. One click sets
# methodology + type + the six dimensions. Single source of truth (frontend reads
# these via the intake/scenarios endpoint).
def _d(scope, budget, duur, politiek, risico, regel):
    return {"scope": scope, "budget": budget, "duur": duur,
            "politiek": politiek, "risico": risico, "regel": regel}


SCENARIOS = [
    {"key": "klant", "title": "Klantimplementatie", "desc": "Externe opdrachtgever, vaste scope & budget, oplevering in fasen.", "icon": "users", "color": "blue", "tags": ["PRINCE2", "Medium"], "methodology": "prince2", "project_type": "klant", "dimensions": _d(2, 2, 2, 2, 2, 1)},
    {"key": "compliance", "title": "Compliance / gereguleerd", "desc": "Wettelijke eisen (AVG/ISO), audit-trail, hoog afbreukrisico.", "icon": "shield", "color": "red", "tags": ["PRINCE2", "Heavy"], "methodology": "prince2", "project_type": "gereguleerd", "dimensions": _d(2, 2, 2, 2, 3, 3)},
    {"key": "product", "title": "Productontwikkeling", "desc": "Nieuw product, onzekere/veranderende eisen. Werken in sprints.", "icon": "rocket", "color": "purple", "tags": ["Scrum", "Light"], "methodology": "scrum", "project_type": "product", "dimensions": _d(1, 2, 2, 1, 3, 1)},
    {"key": "agileops", "title": "Digitale dienst doorontwikkelen", "desc": "Continue waardestroom, lichte ceremonie.", "icon": "sparkles", "color": "pink", "tags": ["Agile", "Light"], "methodology": "agile", "project_type": "product", "dimensions": _d(1, 2, 2, 1, 2, 1)},
    {"key": "intern", "title": "Intern verbeterproject", "desc": "Klein team, laag risico, korte looptijd.", "icon": "wrench", "color": "teal", "tags": ["Inclufy", "Light"], "methodology": "inclufy", "project_type": "intern", "dimensions": _d(1, 1, 1, 1, 1, 1)},
    {"key": "strategisch", "title": "Strategisch programma", "desc": "Veel stakeholders met tegengestelde belangen, hoge zichtbaarheid.", "icon": "target", "color": "pink", "tags": ["PRINCE2", "Heavy"], "methodology": "prince2", "project_type": "strategisch", "dimensions": _d(3, 3, 3, 3, 2, 1)},
    {"key": "operatie", "title": "Doorlopende operatie", "desc": "Continue werkstroom (support/beheer) via flow.", "icon": "repeat", "color": "green", "tags": ["Kanban", "Light"], "methodology": "kanban", "project_type": "operatie", "dimensions": _d(1, 1, 2, 1, 1, 1)},
    {"key": "it", "title": "IT / software-implementatie", "desc": "Deels vaste, deels evoluerende eisen.", "icon": "code", "color": "indigo", "tags": ["Hybrid", "Medium"], "methodology": "hybrid", "project_type": "it", "dimensions": _d(2, 2, 2, 2, 2, 2)},
    {"key": "migratie", "title": "Datamigratie", "desc": "Voorspelbaar traject met strikte stappen en terugval-scenario.", "icon": "database", "color": "blue", "tags": ["Waterfall", "Medium"], "methodology": "waterfall", "project_type": "migratie", "dimensions": _d(2, 2, 2, 2, 3, 2)},
    {"key": "bouw", "title": "Bouw / constructie", "desc": "Vaste scope, fysieke oplevering, strakke fasering.", "icon": "building", "color": "orange", "tags": ["Waterfall", "Heavy"], "methodology": "waterfall", "project_type": "bouw", "dimensions": _d(3, 3, 3, 2, 2, 2)},
    {"key": "marketing", "title": "Marketingcampagne", "desc": "Snel schakelen, korte cycli, veel iteraties.", "icon": "megaphone", "color": "pink", "tags": ["Kanban", "Light"], "methodology": "kanban", "project_type": "marketing", "dimensions": _d(1, 2, 1, 1, 2, 1)},
    {"key": "rnd", "title": "Onderzoek / R&D", "desc": "Hoge onzekerheid, experimenteel, leren staat centraal.", "icon": "flask", "color": "purple", "tags": ["Scrum", "Light"], "methodology": "scrum", "project_type": "rnd", "dimensions": _d(2, 2, 2, 1, 3, 1)},
    {"key": "proces", "title": "Procesoptimalisatie", "desc": "Proces sneller/beter maken op basis van data (DMAIC).", "icon": "gauge", "color": "green", "tags": ["LSS Green", "Medium"], "methodology": "lean_six_sigma_green", "project_type": "proces", "dimensions": _d(2, 1, 2, 2, 2, 2)},
    {"key": "procesbb", "title": "Complexe procesverbetering", "desc": "Statistische analyse, DOE/MSA (Black Belt).", "icon": "gauge", "color": "slate", "tags": ["LSS Black", "Medium"], "methodology": "lean_six_sigma_black", "project_type": "proces", "dimensions": _d(2, 2, 2, 2, 2, 2)},
    {"key": "mobiel", "title": "Mobiele app", "desc": "Nieuwe app voor iOS/Android, iteratief richting release.", "icon": "smartphone", "color": "purple", "tags": ["Scrum", "Light"], "methodology": "scrum", "project_type": "mobiel", "dimensions": _d(1, 2, 2, 1, 2, 1)},
    {"key": "ecommerce", "title": "Webshop / e-commerce", "desc": "Online verkoopplatform bouwen en doorontwikkelen.", "icon": "cart", "color": "blue", "tags": ["Hybrid", "Medium"], "methodology": "hybrid", "project_type": "ecommerce", "dimensions": _d(2, 2, 2, 1, 2, 2)},
    {"key": "infra", "title": "Infrastructuur / netwerk", "desc": "Technische uitrol met strikte stappen en testmomenten.", "icon": "server", "color": "indigo", "tags": ["Waterfall", "Medium"], "methodology": "waterfall", "project_type": "infra", "dimensions": _d(2, 2, 2, 1, 2, 2)},
    {"key": "change", "title": "Organisatieverandering", "desc": "Nieuwe werkwijze invoeren; mensen meekrijgen.", "icon": "shuffle", "color": "orange", "tags": ["PRINCE2", "Medium"], "methodology": "prince2", "project_type": "change", "dimensions": _d(2, 2, 2, 3, 2, 1)},
    {"key": "pilot", "title": "Pilot / proof-of-concept", "desc": "Klein experiment om iets te bewijzen vóór opschalen.", "icon": "flask", "color": "purple", "tags": ["Agile", "Light"], "methodology": "agile", "project_type": "pilot", "dimensions": _d(1, 1, 1, 1, 3, 1)},
    {"key": "event", "title": "Evenement / congres", "desc": "Vaste datum, strak draaiboek, veel coördinatie.", "icon": "calendar", "color": "pink", "tags": ["Waterfall", "Medium"], "methodology": "waterfall", "project_type": "event", "dimensions": _d(2, 2, 1, 2, 2, 1)},
    {"key": "duurzaam", "title": "Duurzaamheid / ESG", "desc": "Verduurzaming met meetbare doelen en rapportageplicht.", "icon": "leaf", "color": "green", "tags": ["Inclufy", "Medium"], "methodology": "inclufy", "project_type": "duurzaam", "dimensions": _d(2, 2, 3, 2, 1, 2)},
    {"key": "opleiding", "title": "Opleidings-/L&D-traject", "desc": "Leerprogramma ontwikkelen en uitrollen.", "icon": "graduation", "color": "teal", "tags": ["Inclufy", "Light"], "methodology": "inclufy", "project_type": "opleiding", "dimensions": _d(1, 1, 2, 1, 1, 1)},
    {"key": "zorg", "title": "Zorg / cliëntsysteem", "desc": "Patiëntdata — privacy en veiligheid voorop.", "icon": "heart", "color": "red", "tags": ["PRINCE2", "Heavy"], "methodology": "prince2", "project_type": "zorg", "dimensions": _d(2, 2, 2, 2, 3, 3)},
]


# Programme module sets (governance woven in: Programme Board, Benefits,
# Stakeholders, Portfolio, Assurance). Keys match Program.METHODOLOGY_CHOICES.
PROGRAM_MODULES = {
    "safe": [
        ("Overview", 1, None), ("Agile Release Trains", 1, None), ("PI Planning", 1, None), ("Team", 1, None),
        ("PI Objectives", 2, None), ("Dependencies", 2, None), ("Benefits", 2, None), ("System Demo", 2, None),
        ("Inspect & Adapt", 3, None), ("Lean Portfolio", 3, "budget"), ("Programme Board", 3, "politiek"),
        ("Stakeholders", 2, "politiek"),
    ],
    "msp": [
        ("Overview", 1, None), ("Vision & Blueprint", 1, None), ("Tranches", 1, None), ("Benefits Map", 1, None),
        ("Benefit Profiles", 2, None), ("Business Change", 2, None), ("Risks", 2, None), ("Stakeholders", 2, "politiek"),
        ("Programme Board", 3, "politiek"), ("Dossier", 3, None), ("Assurance", 3, "regel"),
    ],
    "pmi": [
        ("Overview", 1, None), ("Program Charter", 1, None), ("Roadmap", 1, None), ("Components", 1, None),
        ("Benefits", 2, None), ("Stakeholder Engagement", 2, "politiek"), ("Programme Risk", 2, None),
        ("Governance Board", 3, None), ("Audit / Assurance", 3, "regel"),
    ],
    "prince2_programme": [
        ("Overview", 1, None), ("Mandate & Brief", 1, None), ("Blueprint (POTI)", 1, None), ("Programme Projects", 1, None),
        ("Benefits", 2, None), ("Tranches", 2, None), ("Programme Board", 2, None), ("Risks", 2, None),
        ("Assurance", 3, "regel"), ("Dossier", 3, None),
    ],
    "hybrid_programme": [
        ("Overview", 1, None), ("Governance Config", 1, None), ("Constituent Projects", 1, None),
        ("Cadence & Gates", 2, None), ("Benefits", 2, None), ("Risks", 2, None), ("Roll-up Reports", 2, None),
        ("Programme Board", 3, "politiek"), ("Portfolio Link", 3, "budget"),
    ],
    "inclufy": [
        ("Overview", 1, None), ("Doelen", 1, None), ("Programmaprojecten", 1, None), ("Team", 1, None),
        ("Benefits", 2, None), ("Risks", 2, None), ("Stakeholders", 2, "politiek"), ("Governance", 3, None),
        ("Reports", 3, None),
    ],
}
# aliases
PROGRAM_MODULES["p2_programme"] = PROGRAM_MODULES["prince2_programme"]
PROGRAM_MODULES["hybrid"] = PROGRAM_MODULES["hybrid_programme"]

PROGRAM_COURSE = {
    "safe": "safe-scaling-agile", "msp": "program-management-pro", "pmi": "program-management-pro",
    "prince2_programme": "program-management-pro", "p2_programme": "program-management-pro",
    "hybrid_programme": "program-management-pro", "hybrid": "program-management-pro", "inclufy": "pm-fundamentals",
}


def recommend_program_modules(methodology, dims, governance=None):
    return recommend_modules(methodology, dims, governance, modules=PROGRAM_MODULES,
                             analytics_label="Analytics (organisatie)", board_name="Programme Board")


def classify_program(description):
    """Classify a programme description into a programme methodology + dims."""
    t = (description or "").lower()

    def has(*words):
        return any(w in t for w in words)

    dims = {"scope": 3, "budget": 2, "duur": 3, "politiek": 2, "risico": 2, "regel": 1}
    if has("avg", "compliance", "wet", "regelgeving", "audit", "iso"):
        dims["regel"] = 3
    if has("transformatie", "verandering", "cultuur", "directie", "bestuur", "politiek"):
        dims["politiek"] = 3
    if has("miljoen", "grootschalig"):
        dims["budget"] = 3

    if has("agile", "release", "trein", "teams", "safe", "scaled", "pi planning"):
        meth = "safe"
    elif has("blueprint", "prince2", "operating model", "poti"):
        meth = "prince2_programme"
    elif has("transformatie", "baten", "tranche", "msp", "business change"):
        meth = "msp"
    elif has("fusie", "integratie", "hybride", "gemengd"):
        meth = "hybrid_programme"
    elif has("portfolio", "componenten", "samenhangend", "pmi"):
        meth = "pmi"
    else:
        meth = "inclufy"

    ptype = ("complianceprog" if has("compliance", "wet", "avg")
             else "integratie" if has("fusie", "integratie")
             else "productlijn" if has("release", "product", "trein")
             else "portfolio" if has("portfolio") else "transformatie")
    rationale = f"Programma-methodiek {meth}: gekozen op basis van je beschrijving."
    return {"methodology": meth, "methodology_confidence": "gemiddeld",
            "project_type": ptype, "dimensions": dims, "rationale": rationale, "source": "deterministic"}


PROGRAM_SCENARIOS = [
    {"key": "transformatie", "title": "Bedrijfstransformatie", "desc": "Organisatiebrede verandering met baten over meerdere jaren en tranches.", "icon": "target", "color": "pink", "tags": ["MSP", "Heavy"], "methodology": "msp", "project_type": "transformatie", "dimensions": _d(3, 3, 3, 3, 2, 1)},
    {"key": "productlijn", "title": "Productlijn / release-trein", "desc": "Meerdere agile teams synchroon op één product via PI-planning.", "icon": "rocket", "color": "blue", "tags": ["SAFe", "Heavy"], "methodology": "safe", "project_type": "productlijn", "dimensions": _d(3, 2, 3, 2, 2, 1)},
    {"key": "portfolio", "title": "Portfolio-initiatief", "desc": "Samenhangende set projecten met gedeelde, gemanagede baten.", "icon": "columns", "color": "indigo", "tags": ["PMI", "Medium"], "methodology": "pmi", "project_type": "portfolio", "dimensions": _d(2, 3, 2, 2, 2, 1)},
    {"key": "blueprintprog", "title": "Gestuurd programma (blueprint)", "desc": "PRINCE2-programma met target operating model en programmabestuur.", "icon": "book", "color": "purple", "tags": ["PRINCE2 Programme", "Heavy"], "methodology": "prince2_programme", "project_type": "transformatie", "dimensions": _d(3, 3, 3, 3, 2, 2)},
    {"key": "complianceprog", "title": "Compliance-programma", "desc": "Meerdere projecten om aan nieuwe wet-/regelgeving te voldoen.", "icon": "shield", "color": "red", "tags": ["PMI", "Heavy"], "methodology": "pmi", "project_type": "complianceprog", "dimensions": _d(2, 2, 2, 2, 3, 3)},
    {"key": "integratie", "title": "Fusie / integratie", "desc": "Twee organisaties samenvoegen: mix van voorspelbare en agile projecten.", "icon": "building", "color": "orange", "tags": ["Hybrid Programme", "Heavy"], "methodology": "hybrid_programme", "project_type": "integratie", "dimensions": _d(3, 3, 3, 3, 3, 2)},
]


PROJECT_TYPES = [
    "klant", "intern", "gereguleerd", "strategisch", "product", "operatie", "it",
    "migratie", "bouw", "marketing", "rnd", "proces", "logistiek", "zorg", "event",
    "change", "pilot", "infra", "ecommerce", "mobiel", "duurzaam", "opleiding",
]


def compute_shape(dims):
    """Sum the six dimensions (each 1..3 -> total 6..18) and map to a shape band."""
    total = sum(_clamp(dims.get(d, 2)) for d in DIMENSIONS)
    if total <= 9:
        shape = "light"
    elif total <= 13:
        shape = "medium"
    else:
        shape = "heavy"
    return shape, total


def _clamp(v):
    try:
        v = int(v)
    except (TypeError, ValueError):
        return 2
    return max(1, min(3, v))


def governance_tabs(governance, shape, board_name="Project Board"):
    """Extra governance-layer tabs the user explicitly switched on at intake.
    Returned as forced-recommended (base_level 0 == always)."""
    g = governance or {}
    tabs = []
    board = g.get("board", "auto")
    if board == "formal" or (board == "auto" and shape == "heavy"):
        tabs.append(board_name)
    if g.get("portfolio") == "yes":
        tabs.append("Portfolio")
    if g.get("stakeholder") == "matrix":
        tabs.append("Stakeholder-machtskaart")
    if g.get("cadence") == "periodic":
        tabs.extend(["Vergaderingen", "Besluitenlog"])
    return tabs


def recommend_modules(methodology, dims, governance=None, modules=None,
                      analytics_label="Analytics (dit project)", board_name="Project Board"):
    """Return {shape, score, recommended:[...], more:[...]} for a methodology + dims.
    `modules` defaults to the project module sets; pass PROGRAM_MODULES for programmes."""
    sets = modules if modules is not None else PROJECT_MODULES
    fallback_key = "inclufy" if "inclufy" in sets else next(iter(sets))
    shape, total = compute_shape(dims)
    level = SHAPE_LEVEL[shape]
    base = list(sets.get(methodology, sets[fallback_key]))
    cross = [("Rapportages", 1, None), (analytics_label, 2, None)]
    gov_forced = set(governance_tabs(governance, shape, board_name))
    board_formal = (governance or {}).get("board") == "formal"

    recommended, more, seen = [], [], set()
    for name, base_level, trig in base + cross:
        if name in seen:
            continue
        seen.add(name)
        on = base_level <= level
        if trig and _clamp(dims.get(trig, 2)) >= 3:
            on = True
        if board_formal and any(k in name for k in ("Board", "Decision", "Governance", "Assurance")):
            on = True
        (recommended if on else more).append(name)

    # append explicitly-chosen governance tabs that are not already present
    for name in gov_forced:
        if name not in seen:
            seen.add(name)
            recommended.append(name)

    return {"shape": shape, "score": total, "recommended": recommended, "more": more}


# ---------------------------------------------------------------------------
# Deterministic classifier (keyword heuristics). Safe fallback, no AI needed.
# ---------------------------------------------------------------------------

def classify(description):
    """Classify a free-text project description into methodology/type/dims/rationale."""
    t = (description or "").lower()

    def has(*words):
        return any(w in t for w in words)

    dims = {"scope": 2, "budget": 2, "duur": 2, "politiek": 1, "risico": 2, "regel": 1}
    if has("extern", "klant", "opdrachtgever"):
        dims["politiek"] = 2
    if has("directie", "bestuur", "politiek", "stakeholders", "gevoelig"):
        dims["politiek"] = 3
    if has("avg", "gdpr", "compliance", "audit", "wettelijk", "accountant", "iso", "patiënt", "patient", "zorg"):
        dims["regel"] = 3
        dims["risico"] = 3
    if has("miljoen", "grootschalig", "programma"):
        dims["budget"] = 3
    if has("jaar", "meerjarig", "langlopend"):
        dims["duur"] = 3
    if has("intern", "klein", "paar weken", "simpel"):
        dims["scope"] = 1
        dims["budget"] = 1
        dims["duur"] = 1
        dims["risico"] = 1
    if has("onzeker", "veranderende", "wijzigende", "mvp", "experiment", "onderzoek", "pilot"):
        dims["risico"] = 3

    scores = {"prince2": 0, "scrum": 0, "agile": 0, "kanban": 0, "waterfall": 0,
              "lean_six_sigma_green": 0, "hybrid": 0, "inclufy": 0}
    if has("sprint", "scrum", "mvp", "iterat", "backlog", "veranderende", "wijzigende"):
        scores["scrum"] += 3
    if has("waardestroom", "continu verbeter", "doorontwikkel", "agile"):
        scores["agile"] += 3
    if has("support", "ticket", "continue", "stroom", "operationeel", "flow", "beheer", "campagne"):
        scores["kanban"] += 3
    if has("vaste scope", "voorspelbaar", "bouw", "constructie", "fasen", "fase",
           "waterval", "migratie", "infrastructuur", "duidelijke eisen", "evenement", "congres"):
        scores["waterfall"] += 2
    if has("governance", "stuurgroep", "business case", "extern", "klant", "formeel", "zorg"):
        scores["prince2"] += 3
    if has("proces", "verspilling", "defect", "kwaliteit", "doorlooptijd", "six sigma", "lean", "optimalis"):
        scores["lean_six_sigma_green"] += 3
    if has("software", "systeem", "platform", "webshop", "e-commerce", "applicatie"):
        scores["hybrid"] += 2

    methodology = max(scores, key=scores.get)
    confidence = "hoog" if scores[methodology] >= 3 else ("gemiddeld" if scores[methodology] >= 2 else "laag")
    if scores[methodology] < 2:
        methodology = "inclufy"  # unsure -> curated default (the USP)

    project_type = _detect_type(has)
    rationale = _rationale(methodology, project_type, dims, t)

    return {
        "methodology": methodology,
        "methodology_confidence": confidence,
        "project_type": project_type,
        "dimensions": dims,
        "rationale": rationale,
        "source": "deterministic",
    }


def _detect_type(has):
    if has("avg", "compliance", "audit", "iso", "wettelijk"):
        return "gereguleerd"
    if has("patiënt", "patient", "zorg", "cliënt", "client"):
        return "zorg"
    if has("migratie"):
        return "migratie"
    if has("bouw", "constructie"):
        return "bouw"
    if has("evenement", "congres"):
        return "event"
    if has("infrastructuur", "netwerk", "server"):
        return "infra"
    if has("webshop", "e-commerce", "ecommerce"):
        return "ecommerce"
    if has("app", "mobiel", "ios", "android"):
        return "mobiel"
    if has("pilot", "proof of concept", "poc"):
        return "pilot"
    if has("campagne", "marketing"):
        return "marketing"
    if has("onderzoek", "r&d"):
        return "rnd"
    if has("proces", "optimalis"):
        return "proces"
    if has("verandering", "transformatie", "cultuur"):
        return "change"
    if has("duurzaam", "esg"):
        return "duurzaam"
    if has("opleiding", "training", "l&d"):
        return "opleiding"
    if has("directie", "programma", "stakeholders"):
        return "strategisch"
    if has("extern", "klant"):
        return "klant"
    if has("product", "mvp", "sprint"):
        return "product"
    if has("support", "beheer", "continue"):
        return "operatie"
    return "intern"


_METH_REASON = {
    "prince2": "gecontroleerde governance met fases en een business case",
    "scrum": "iteratief werken met sprints en veranderende eisen",
    "agile": "een continue waardestroom met lichte ceremonie",
    "kanban": "een continue werkstroom met flow & WIP-limieten",
    "waterfall": "een voorspelbaar traject met vaste scope en duidelijke fasen",
    "lean_six_sigma_green": "procesverbetering en kwaliteit (DMAIC)",
    "lean_six_sigma_black": "procesverbetering met statistische analyse",
    "hybrid": "een mix van voorspelbaar en agile werken",
    "inclufy": "geen duidelijke voorkeur — de gecureerde Inclufy-standaard als veilige start",
}


def _rationale(methodology, project_type, dims, text):
    highs = [d for d in DIMENSIONS if _clamp(dims.get(d)) == 3]
    base = f"Methodiek {methodology}: {_METH_REASON.get(methodology, '')}."
    if highs:
        base += f" Verhoogde governance door: {', '.join(highs)}."
    return base


def classify_with_llm(description, company=None):
    """Try to refine the classification with the company's configured LLM; on any
    failure fall back to the deterministic classifier. Never raises."""
    fallback = classify(description)
    if not company or not description:
        return fallback
    try:
        from core.llm_keys import get_openai_client
        client = get_openai_client(company)
        if client is None:
            return fallback
        import json
        prompt = (
            "Je bent een project-management adviseur. Classificeer het project in JSON met velden "
            "methodology (een van: prince2, scrum, agile, kanban, waterfall, lean_six_sigma_green, "
            "lean_six_sigma_black, hybrid, inclufy), project_type, en dimensions "
            "(scope,budget,duur,politiek,risico,regel elk 1-3). Antwoord ALLEEN met JSON.\n\n"
            f"Beschrijving: {description}"
        )
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
            max_tokens=300,
        )
        data = json.loads(resp.choices[0].message.content)
        meth = data.get("methodology")
        if meth in PROJECT_MODULES:
            fallback["methodology"] = meth
            fallback["methodology_confidence"] = "hoog"
        if data.get("project_type") in PROJECT_TYPES:
            fallback["project_type"] = data["project_type"]
        dims = data.get("dimensions") or {}
        for d in DIMENSIONS:
            if d in dims:
                fallback["dimensions"][d] = _clamp(dims[d])
        fallback["source"] = "llm"
        fallback["rationale"] = _rationale(
            fallback["methodology"], fallback["project_type"], fallback["dimensions"], description
        )
    except Exception:
        return fallback
    return fallback
