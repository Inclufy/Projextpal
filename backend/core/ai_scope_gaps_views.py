"""Scope-aware "what's still missing" endpoint for the AI Co-pilot.

The co-pilot sidebar renders a dedicated "Nog ontbrekende tabs/velden"
section above the regular suggestions. For each gap it shows a
service-oriented one-click button like
    "Zal ik een Business Case voor je opstellen?"
that pre-fills the chat input (or auto-sends when the user confirms).

This endpoint tells the frontend WHAT is still empty on the scope the
user is currently looking at — a project / programme / board / portfolio
— and which fill-prompt + optional deep-link belongs to each gap.

Shape of the response:

    GET /api/v1/ai/scope-gaps/?project_id=133
    {
      "scope": "project",
      "scope_id": 133,
      "scope_name": "Aeres ELO",
      "gaps": [
        {
          "key": "business_case",
          "label_nl": "Business Case",
          "label_en": "Business Case",
          "label_fr": "Business Case",
          "deep_link": "/projects/133/prince2/business-case",
          "fill_prompt_nl": "Zal ik een Business Case voor Aeres ELO opstellen op basis van de documenten?",
          "fill_prompt_en": "Shall I draft a Business Case for Aeres ELO based on the uploaded documents?",
          "fill_prompt_fr": "Dois-je rédiger un Business Case pour Aeres ELO à partir des documents téléversés ?"
        },
        ...
      ]
    }

Checks are intentionally lightweight — just "is this field/relation
empty" — so a 404'ing related model never blows up the whole response.
Every lookup is wrapped in try/except; the gap is simply left out.
"""
from __future__ import annotations

from typing import Any, List, Dict

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


def _gap(key, label_nl, label_en, label_fr, deep_link, name,
         fill_nl, fill_en, fill_fr):
    """Build a single gap dict with the three-language fill prompt.

    ``name`` is the entity's user-visible name (project/program/board/
    portfolio name) — woven into the prompt so the chat message makes
    sense when auto-sent."""
    def _fmt(tpl, n):
        return tpl.replace("{name}", n or "")
    return {
        "key": key,
        "label_nl": label_nl, "label_en": label_en, "label_fr": label_fr,
        "deep_link": deep_link,
        "fill_prompt_nl": _fmt(fill_nl, name),
        "fill_prompt_en": _fmt(fill_en, name),
        "fill_prompt_fr": _fmt(fill_fr, name),
    }


def _project_gaps(project) -> List[Dict[str, Any]]:
    pid = project.id
    name = getattr(project, "name", "") or "dit project"
    gaps: List[Dict[str, Any]] = []

    # Core fields
    if not getattr(project, "methodology", "") or project.methodology in ("", None):
        gaps.append(_gap(
            "methodology",
            "Methodologie", "Methodology", "Méthodologie",
            f"/projects/{pid}/edit",
            name,
            "Zal ik voor {name} de meest passende methodologie voorstellen op basis van de context?",
            "Shall I propose the best-fit methodology for {name} based on the context?",
            "Dois-je proposer la méthodologie la plus adaptée à {name} à partir du contexte ?",
        ))
    if not getattr(project, "start_date", None):
        gaps.append(_gap(
            "start_date",
            "Startdatum", "Start date", "Date de début",
            f"/projects/{pid}/edit",
            name,
            "Zal ik een realistische startdatum voor {name} voorstellen op basis van de documenten?",
            "Shall I propose a realistic start date for {name} based on the documents?",
            "Dois-je proposer une date de début réaliste pour {name} à partir des documents ?",
        ))
    if not getattr(project, "end_date", None):
        gaps.append(_gap(
            "end_date",
            "Einddatum", "End date", "Date de fin",
            f"/projects/{pid}/edit",
            name,
            "Zal ik een realistische einddatum voor {name} voorstellen op basis van de scope?",
            "Shall I propose a realistic end date for {name} based on the scope?",
            "Dois-je proposer une date de fin réaliste pour {name} à partir du périmètre ?",
        ))
    if not getattr(project, "budget", None):
        gaps.append(_gap(
            "budget",
            "Budget", "Budget", "Budget",
            f"/projects/{pid}/edit",
            name,
            "Zal ik een budgetinschatting voor {name} opstellen op basis van de scope en het team?",
            "Shall I draft a budget estimate for {name} based on the scope and team?",
            "Dois-je rédiger une estimation budgétaire pour {name} à partir du périmètre et de l'équipe ?",
        ))
    if not (getattr(project, "description", "") or "").strip():
        gaps.append(_gap(
            "description",
            "Projectbeschrijving", "Project description", "Description du projet",
            f"/projects/{pid}/edit",
            name,
            "Zal ik een korte projectbeschrijving voor {name} opstellen uit de documenten?",
            "Shall I draft a short project description for {name} from the documents?",
            "Dois-je rédiger une courte description de projet pour {name} à partir des documents ?",
        ))

    # Related objects — "is er al minstens 1?"
    try:
        if not project.tasks.exists():  # type: ignore[attr-defined]
            gaps.append(_gap(
                "tasks",
                "Taken", "Tasks", "Tâches",
                f"/projects/{pid}/tasks",
                name,
                "Zal ik een eerste set taken voor {name} opstellen op basis van de scope?",
                "Shall I draft an initial task breakdown for {name} based on the scope?",
                "Dois-je rédiger une première décomposition de tâches pour {name} à partir du périmètre ?",
            ))
    except Exception:
        pass
    try:
        if not project.milestones.exists():  # type: ignore[attr-defined]
            gaps.append(_gap(
                "milestones",
                "Mijlpalen", "Milestones", "Jalons",
                f"/projects/{pid}/milestones",
                name,
                "Zal ik mijlpalen voor {name} voorstellen op basis van de deliverables?",
                "Shall I propose milestones for {name} based on the deliverables?",
                "Dois-je proposer des jalons pour {name} à partir des livrables ?",
            ))
    except Exception:
        pass
    try:
        if not project.team_members.exists():  # type: ignore[attr-defined]
            gaps.append(_gap(
                "team",
                "Projectteam", "Project team", "Équipe projet",
                f"/projects/{pid}/team",
                name,
                "Zal ik team-rollen (PO/PM/leads) voor {name} voorstellen op basis van de scope?",
                "Shall I propose team roles (PO/PM/leads) for {name} based on the scope?",
                "Dois-je proposer des rôles d'équipe (PO/PM/leads) pour {name} à partir du périmètre ?",
            ))
    except Exception:
        pass
    try:
        if not project.risks.exists():  # type: ignore[attr-defined]
            gaps.append(_gap(
                "risks",
                "Risico-register", "Risk register", "Registre des risques",
                f"/projects/{pid}/risks",
                name,
                "Zal ik een initieel risico-register voor {name} opstellen op basis van de documenten?",
                "Shall I draft an initial risk register for {name} based on the documents?",
                "Dois-je rédiger un registre des risques initial pour {name} à partir des documents ?",
            ))
    except Exception:
        pass

    # PRINCE2 / methodology-specific — only when methodology is set and matches.
    try:
        from projects.prince2_models import BusinessCase
        if (getattr(project, "methodology", "") or "").lower().startswith("prince2"):
            if not BusinessCase.objects.filter(project=project).exists():
                gaps.append(_gap(
                    "business_case",
                    "Business Case", "Business Case", "Business Case",
                    f"/projects/{pid}/prince2/business-case",
                    name,
                    "Zal ik een Business Case voor {name} opstellen uit de documenten?",
                    "Shall I draft a Business Case for {name} from the documents?",
                    "Dois-je rédiger un Business Case pour {name} à partir des documents ?",
                ))
    except Exception:
        pass

    return gaps


def _program_gaps(program) -> List[Dict[str, Any]]:
    prog_id = program.id
    name = getattr(program, "name", "") or "dit programma"
    gaps: List[Dict[str, Any]] = []

    if not (getattr(program, "description", "") or "").strip():
        gaps.append(_gap(
            "description",
            "Programmabeschrijving", "Programme description", "Description du programme",
            f"/programs/{prog_id}/edit",
            name,
            "Zal ik een programmabeschrijving voor {name} opstellen uit de documenten?",
            "Shall I draft a programme description for {name} from the documents?",
            "Dois-je rédiger une description de programme pour {name} à partir des documents ?",
        ))
    if not getattr(program, "start_date", None):
        gaps.append(_gap(
            "start_date", "Startdatum", "Start date", "Date de début",
            f"/programs/{prog_id}/edit", name,
            "Zal ik een realistische startdatum voor {name} voorstellen?",
            "Shall I propose a realistic start date for {name}?",
            "Dois-je proposer une date de début réaliste pour {name} ?",
        ))
    if not getattr(program, "end_date", None):
        gaps.append(_gap(
            "end_date", "Einddatum", "End date", "Date de fin",
            f"/programs/{prog_id}/edit", name,
            "Zal ik een realistische einddatum voor {name} voorstellen?",
            "Shall I propose a realistic end date for {name}?",
            "Dois-je proposer une date de fin réaliste pour {name} ?",
        ))
    try:
        if hasattr(program, "projects") and not program.projects.exists():
            gaps.append(_gap(
                "projects",
                "Onderliggende projecten", "Component projects", "Projets constitutifs",
                f"/programs/{prog_id}/projects", name,
                "Zal ik onderliggende projecten voor {name} voorstellen op basis van de scope?",
                "Shall I propose component projects for {name} based on the scope?",
                "Dois-je proposer des projets constitutifs pour {name} à partir du périmètre ?",
            ))
    except Exception:
        pass
    try:
        from programs.models import ProgramBenefit
        if not ProgramBenefit.objects.filter(program=program).exists():
            gaps.append(_gap(
                "benefits",
                "Baten", "Benefits", "Bénéfices",
                f"/programs/{prog_id}/benefits", name,
                "Zal ik meetbare baten voor {name} voorstellen op basis van de documenten?",
                "Shall I propose measurable benefits for {name} from the documents?",
                "Dois-je proposer des bénéfices mesurables pour {name} à partir des documents ?",
            ))
    except Exception:
        pass
    return gaps


def _board_gaps(board) -> List[Dict[str, Any]]:
    bid = str(board.id)
    name = getattr(board, "name", "") or "deze board"
    gaps: List[Dict[str, Any]] = []

    if not getattr(board, "chair_id", None):
        gaps.append(_gap(
            "chair",
            "Voorzitter", "Chair", "Président",
            f"/governance/boards/{bid}", name,
            "Zal ik voorstel doen voor een voorzitter voor {name} op basis van de teamsamenstelling?",
            "Shall I suggest a chair for {name} based on the team composition?",
            "Dois-je proposer un président pour {name} à partir de la composition d'équipe ?",
        ))
    if not (getattr(board, "meeting_frequency", "") or "").strip():
        gaps.append(_gap(
            "meeting_frequency",
            "Vergaderfrequentie", "Meeting frequency", "Fréquence des réunions",
            f"/governance/boards/{bid}", name,
            "Zal ik een vergaderfrequentie voor {name} voorstellen op basis van het board-type?",
            "Shall I propose a meeting frequency for {name} based on the board type?",
            "Dois-je proposer une fréquence de réunions pour {name} selon le type de comité ?",
        ))
    if not getattr(board, "quorum", 0) or int(getattr(board, "quorum", 0) or 0) == 0:
        gaps.append(_gap(
            "quorum",
            "Quorum", "Quorum", "Quorum",
            f"/governance/boards/{bid}", name,
            "Zal ik een quorum voor {name}-besluiten voorstellen op basis van het aantal leden?",
            "Shall I propose a quorum for {name} decisions based on the member count?",
            "Dois-je proposer un quorum pour les décisions de {name} selon le nombre de membres ?",
        ))
    try:
        if not board.members.exists():  # type: ignore[attr-defined]
            gaps.append(_gap(
                "members",
                "Boardleden", "Board members", "Membres du comité",
                f"/governance/boards/{bid}", name,
                "Zal ik boardleden voor {name} voorstellen uit de huidige stakeholder-lijst?",
                "Shall I propose board members for {name} from the current stakeholder list?",
                "Dois-je proposer des membres pour {name} à partir de la liste de parties prenantes ?",
            ))
    except Exception:
        pass
    return gaps


def _portfolio_gaps(portfolio) -> List[Dict[str, Any]]:
    pid = str(portfolio.id)
    name = getattr(portfolio, "name", "") or "dit portfolio"
    gaps: List[Dict[str, Any]] = []
    if not (getattr(portfolio, "description", "") or "").strip():
        gaps.append(_gap(
            "description",
            "Portfoliobeschrijving", "Portfolio description", "Description du portefeuille",
            f"/governance/portfolios/{pid}", name,
            "Zal ik een portfoliobeschrijving voor {name} opstellen op basis van de componenten?",
            "Shall I draft a portfolio description for {name} based on its components?",
            "Dois-je rédiger une description de portefeuille pour {name} à partir de ses composants ?",
        ))
    try:
        has_programs = hasattr(portfolio, "programs") and portfolio.programs.exists()
        from projects.models import Project as _P
        has_projects = _P.objects.filter(portfolio=portfolio).exists() if hasattr(_P, "portfolio") else False
        if not has_programs and not has_projects:
            gaps.append(_gap(
                "components",
                "Componenten", "Components", "Composants",
                f"/governance/portfolios/{pid}", name,
                "Zal ik passende componenten (programma's en projecten) voor {name} voorstellen?",
                "Shall I propose matching components (programmes and projects) for {name}?",
                "Dois-je proposer des composants adaptés (programmes et projets) pour {name} ?",
            ))
    except Exception:
        pass
    return gaps


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def scope_gaps(request):
    """Return a service-oriented list of missing fields / tabs for the
    scope the client is currently looking at.

    The frontend passes exactly one of ``project_id`` / ``program_id`` /
    ``board_id`` / ``portfolio_id``. Unknown or inaccessible scopes
    return an empty gap list rather than 404 — the sidebar then simply
    doesn't render the "ontbreekt nog" section.
    """
    user = request.user
    if not user or not getattr(user, "is_authenticated", False):
        return Response({"gaps": []}, status=401)

    company = getattr(user, "company", None)
    is_super = getattr(user, "is_superuser", False) or getattr(user, "role", None) == "superadmin"

    pid = request.query_params.get("project_id")
    prog_id = request.query_params.get("program_id")
    bid = request.query_params.get("board_id")
    pfid = request.query_params.get("portfolio_id")

    try:
        if pid:
            from projects.models import Project
            qs = Project.objects.filter(id=pid)
            if not is_super:
                qs = qs.filter(company=company) if company else qs.none()
            project = qs.first()
            if not project:
                return Response({"scope": "project", "scope_id": pid, "gaps": []})
            return Response({
                "scope": "project",
                "scope_id": project.id,
                "scope_name": getattr(project, "name", ""),
                "gaps": _project_gaps(project),
            })
        if prog_id:
            from programs.models import Program
            qs = Program.objects.filter(id=prog_id)
            if not is_super:
                qs = qs.filter(company=company) if company else qs.none()
            program = qs.first()
            if not program:
                return Response({"scope": "program", "scope_id": prog_id, "gaps": []})
            return Response({
                "scope": "program",
                "scope_id": program.id,
                "scope_name": getattr(program, "name", ""),
                "gaps": _program_gaps(program),
            })
        if bid:
            from governance.models import GovernanceBoard
            from django.db.models import Q
            qs = GovernanceBoard.objects.filter(id=bid)
            if not is_super:
                qs = qs.filter(
                    Q(portfolio__company=company)
                    | Q(program__company=company)
                    | Q(project__company=company)
                ) if company else qs.none()
            board = qs.first()
            if not board:
                return Response({"scope": "board", "scope_id": bid, "gaps": []})
            return Response({
                "scope": "board",
                "scope_id": str(board.id),
                "scope_name": getattr(board, "name", ""),
                "gaps": _board_gaps(board),
            })
        if pfid:
            from governance.models import Portfolio
            qs = Portfolio.objects.filter(id=pfid)
            if not is_super:
                qs = qs.filter(company=company) if company else qs.none()
            portfolio = qs.first()
            if not portfolio:
                return Response({"scope": "portfolio", "scope_id": pfid, "gaps": []})
            return Response({
                "scope": "portfolio",
                "scope_id": str(portfolio.id),
                "scope_name": getattr(portfolio, "name", ""),
                "gaps": _portfolio_gaps(portfolio),
            })
    except Exception:
        return Response({"gaps": []})

    return Response({"gaps": []})
