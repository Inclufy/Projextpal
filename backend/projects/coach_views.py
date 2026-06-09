"""
Project AI Coach.

A methodology-aware assistant a user can consult *while running a project*. It
grounds its answers in:
  * the project's methodology + tailoring shape (Light/Medium/Heavy),
  * the project's current status,
  * the user's competence level for that methodology (from UserMethodologyProfile),
  * a curated per-methodology doctrine focus.

The LLM (via the company's configured key) writes the answer; if no key is
available, a deterministic curated fallback always returns something useful, so
the coach never dead-ends.

  GET  /api/v1/projects/<pk>/coach/   -> context summary + suggested questions
  POST /api/v1/projects/<pk>/coach/   -> {answer, source} for a free-text question
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Project


# Curated coaching focus + starter questions per methodology. Keeps the coach
# useful even with no AI key, and anchors the LLM so it stays on-doctrine.
METHOD_COACH = {
    "prince2": {
        "focus": "PRINCE2: stuur op producten en bij uitzondering. Houd de business case continu geldig, werk per management-fase en laat de Project Board autoriseren.",
        "suggestions": [
            "Wat zijn mijn volgende stappen in de huidige fase?",
            "Hoe stel ik een goede Product Description op?",
            "Wanneer escaleer ik via een Exception Report?",
            "Wat heb ik nodig om de fasepoort te halen?",
        ],
    },
    "scrum": {
        "focus": "Scrum: werk in sprints richting het Sprint Goal. Bewaak de Definition of Done en gebruik de events (planning, daily, review, retro) om te inspecteren en aan te passen.",
        "suggestions": [
            "Hoe stel ik een helder Sprint Goal op?",
            "Mijn burndown loopt achter — wat nu?",
            "Hoe verbeter ik onze Definition of Done?",
            "Waar let ik op bij de Sprint Review?",
        ],
    },
    "agile": {
        "focus": "Agile: lever continu waarde in kleine iteraties, betrek stakeholders vroeg en pas je aanpak aan op basis van feedback.",
        "suggestions": [
            "Hoe prioriteer ik mijn backlog op waarde?",
            "Hoe haal ik bruikbare stakeholder-feedback op?",
            "Hoe meet ik onze voortgang zonder vaste scope?",
        ],
    },
    "kanban": {
        "focus": "Kanban: visualiseer het werk, beperk onderhanden werk (WIP) en bewaak de flow. Maak werkbeleid expliciet en verbeter op basis van doorlooptijd.",
        "suggestions": [
            "Mijn WIP-limiet wordt overschreden — wat doe ik?",
            "Hoe verkort ik onze cycle time?",
            "Hoe lees ik het cumulatief flow-diagram?",
        ],
    },
    "waterfall": {
        "focus": "Waterfall: werk gefaseerd met duidelijke baselines en fasepoorten. Beheers wijzigingen via change control en bewaak voortgang met milestones/EVM.",
        "suggestions": [
            "Wat moet klaar zijn voor de volgende fasepoort?",
            "Hoe verwerk ik een wijziging via change control?",
            "Hoe interpreteer ik mijn CPI/SPI (EVM)?",
        ],
    },
    "lean_six_sigma_green": {
        "focus": "Lean Six Sigma (Green Belt): doorloop DMAIC. Definieer het probleem (CTQ), meet de baseline, analyseer de grondoorzaak, verbeter en borg met een control plan.",
        "suggestions": [
            "In welke DMAIC-fase zit ik en wat is de volgende stap?",
            "Hoe bepaal ik mijn CTQ's?",
            "Hoe borg ik de verbetering in de Control-fase?",
        ],
    },
    "lean_six_sigma_black": {
        "focus": "Lean Six Sigma (Black Belt): geavanceerde DMAIC met statistiek. Onderbouw met MSA, hypothesetoetsen, DOE en regressie; valideer de financiële baten.",
        "suggestions": [
            "Welke statistische toets past bij mijn vraag?",
            "Hoe zet ik een DOE op?",
            "Hoe valideer ik de financiële besparing?",
        ],
    },
    "hybrid": {
        "focus": "Hybrid: combineer voorspelbare fasen met agile iteraties. Kies per fase de juiste aanpak en houd de governance consistent.",
        "suggestions": [
            "Welke aanpak past bij mijn huidige fase?",
            "Hoe houd ik agile en voorspelbaar werk in balans?",
        ],
    },
    "inclufy": {
        "focus": "Inclufy Best Practice: een gecureerde, pragmatische aanpak — heldere doelen, lichte governance en focus op resultaat. Schaal op waar het project erom vraagt.",
        "suggestions": [
            "Wat zijn de logische volgende stappen?",
            "Welke governance heb ik echt nodig?",
            "Hoe rapporteer ik voortgang beknopt?",
        ],
    },
}

# "Aan de slag" — verified in-project screens per methodology (kunde / doen).
# Bridges knowledge -> practice: from the coach straight to where you act.
ACT_LINKS = {
    "prince2": [("Business Case", "prince2/business-case"), ("Fasepoorten", "prince2/stage-gates"), ("Work Packages", "prince2/work-packages")],
    "scrum": [("Product Backlog", "scrum/backlog"), ("Definition of Done", "scrum/definition-of-done"), ("Increments", "scrum/increments")],
    "agile": [("Backlog", "agile/backlog"), ("Iteration Board", "agile/iteration-board"), ("Retrospective", "agile/retrospective")],
    "kanban": [("Board", "kanban/board"), ("WIP-limieten", "kanban/wip-limits"), ("Flow-metrics", "kanban/metrics")],
    "waterfall": [("Projectoverzicht", "foundation/overview")],
    "lean_six_sigma_green": [("DMAIC-fasen", "lss-green/phases"), ("Metingen", "lss-green/measurements"), ("Capability", "lss-green/metrics")],
    "lean_six_sigma_black": [("DMAIC-fasen", "lss-black/phases"), ("Hypothesetoetsen", "lss-black/hypothesis-tests"), ("DOE", "lss-black/doe")],
    "hybrid": [("Fasen", "hybrid/phases"), ("Taken", "hybrid/tasks"), ("Artefacten", "hybrid/artifacts")],
    "inclufy": [("Projectoverzicht", "foundation/overview"), ("Charter", "foundation/charter")],
}


def _learn_links(methodology):
    """Knowledge -> the Academy course + first lesson for this methodology."""
    from .tailoring import METHODOLOGY_COURSE
    slug = METHODOLOGY_COURSE.get(methodology, "pm-fundamentals")
    title = slug
    try:
        from academy.models import Course
        c = Course.objects.filter(slug=slug).first()
        if c:
            title = c.title
    except Exception:
        pass
    return [
        {"title": f"Cursus: {title}", "url": f"/academy/course/{slug}"},
        {"title": "Start de eerste les", "url": f"/academy/course/{slug}/learn"},
    ]


def _act_links(methodology, project_id):
    return [{"title": label, "url": f"/projects/{project_id}/{suffix}"}
            for label, suffix in ACT_LINKS.get(methodology, ACT_LINKS["inclufy"])]


_COMP_TONE = {
    "none": "De gebruiker kent deze methodiek nog niet — leg termen kort uit en wees concreet.",
    "basis": "De gebruiker kent de basis — geef praktische, iets diepere tips.",
    "ervaren": "De gebruiker is ervaren — wees bondig en to-the-point.",
    "expert": "De gebruiker is expert — geef alleen het essentiële, geen basisuitleg.",
}


def _context(project, user):
    methodology = (project.methodology or "inclufy")
    coach = METHOD_COACH.get(methodology, METHOD_COACH["inclufy"])
    shape = None
    try:
        shape = project.tailoring.shape
    except Exception:
        shape = None
    competence = "basis"
    try:
        from accounts.models import UserMethodologyProfile
        prof = UserMethodologyProfile.objects.filter(user=user).first()
        if prof:
            competence = (prof.methodology_competence or {}).get(methodology, "basis")
    except Exception:
        pass
    return methodology, coach, shape, competence


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def project_coach(request, pk):
    from .role_views import accessible_project_ids
    project = Project.objects.filter(id=pk, id__in=accessible_project_ids(request.user)).first()
    if not project:
        return Response({"detail": "Project not found or not accessible."}, status=404)

    methodology, coach, shape, competence = _context(project, request.user)

    if request.method == "GET":
        summary = (
            f"Je werkt met {methodology.replace('_', ' ')}"
            + (f" in een {shape}-vorm" if shape else "")
            + f". Status: {project.status or 'onbekend'}."
        )
        return Response({
            "methodology": methodology,
            "shape": shape,
            "summary": summary,
            "focus": coach["focus"],
            "suggestions": coach["suggestions"],
            "learn": _learn_links(methodology),       # kennis  (Academy)
            "act": _act_links(methodology, project.id),  # kunde   (project screens)
        })

    question = (request.data or {}).get("question", "").strip()
    if not question:
        return Response({"detail": "Stel een vraag."}, status=400)

    context = (request.data or {}).get("context", "").strip()  # e.g. the screen the user is on
    answer, source = _answer(project, request.user, methodology, coach, shape, competence, question, context)
    # log the consult (reuses the existing audit helper; never fatal)
    try:
        from accounts.models import audit
        audit(request.user, "project.coach_consult",
              summary=f"AI coach consult on project {project.id} ({methodology})",
              target_type="project", target_id=project.id, request=request)
    except Exception:
        pass
    return Response({"answer": answer, "source": source, "methodology": methodology,
                     "act": _act_links(methodology, project.id)})


def _answer(project, user, methodology, coach, shape, competence, question, context=""):
    """LLM answer grounded in the methodology + project; deterministic fallback."""
    company = getattr(user, "company", None)
    system = (
        "Je bent de ProjeXtPal project-coach. Je helpt een gebruiker tijdens het "
        "uitvoeren van een project. Antwoord praktisch, in het Nederlands, kort en "
        "concreet (max ~6 zinnen of een korte lijst). Blijf strikt binnen de "
        f"gekozen methodiek.\n\nMethodiek: {methodology}. {coach['focus']}\n"
        f"Projectvorm: {shape or 'onbepaald'}. Projectstatus: {project.status or 'onbekend'}.\n"
        f"{_COMP_TONE.get(competence, '')}"
        + (f"\nDe gebruiker is nu op het scherm: {context}." if context else "")
    )
    if company:
        try:
            from core.llm_keys import get_openai_client
            client = get_openai_client(company)
            if client is not None:
                resp = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": system},
                        {"role": "user", "content": question},
                    ],
                    temperature=0.3,
                    max_tokens=400,
                )
                txt = (resp.choices[0].message.content or "").strip()
                if txt:
                    return txt, "ai"
        except Exception:
            pass
    # Deterministic fallback — still grounded + actionable.
    fallback = (
        f"{coach['focus']}\n\nToegepast op jouw vraag: begin met de eerstvolgende "
        f"stap die hoort bij je huidige fase/status ({project.status or 'onbekend'}). "
        "Wil je hier dieper op in? Bekijk de bijbehorende Academy-les voor deze "
        "methodiek, of stel een gerichtere vraag."
    )
    return fallback, "fallback"
