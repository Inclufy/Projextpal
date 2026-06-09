"""
Proeftuin / onboarding status.

Drives the proeftuin banner (trial state + limits + usage) and the onboarding
checklist (5 steps, completion derived from real data — no extra table).

  GET /api/v1/auth/onboarding/status/
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone


def _safe(fn, default=False):
    try:
        return fn()
    except Exception:
        return default


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def onboarding_status(request):
    user = request.user
    company = getattr(user, "company", None)

    # --- trial state -------------------------------------------------------
    from accounts.models import TrialLimits, Registration
    is_trial = _safe(lambda: TrialLimits.is_trial_user(user), False)
    days_remaining = None
    reg = _safe(lambda: Registration.objects.filter(user=user).first(), None)
    if reg and getattr(reg, "trial_end_date", None):
        delta = reg.trial_end_date - timezone.now()
        days_remaining = max(0, delta.days)

    limits = {
        "max_projects": getattr(TrialLimits, "MAX_PROJECTS", 2),
        "max_programs": getattr(TrialLimits, "MAX_PROGRAMS", 1),
        "max_users": getattr(TrialLimits, "MAX_USERS", 3),
    }

    # --- usage -------------------------------------------------------------
    def count(model_path, **flt):
        try:
            mod, cls = model_path
            from importlib import import_module
            m = getattr(import_module(mod), cls)
            return m.objects.filter(**flt).count()
        except Exception:
            return 0

    usage = {
        "projects": count(("projects.models", "Project"), company=company) if company else 0,
        "programs": count(("programs.models", "Program"), company=company) if company else 0,
        "users": count(("accounts.models", "CustomUser"), company=company, is_active=True) if company else 1,
    }

    # --- checklist (completion derived from data) --------------------------
    has_project = _safe(lambda: __import__("projects.models", fromlist=["Project"]).Project.objects.filter(company=company).exists()) if company else False
    has_tailoring = _safe(lambda: __import__("projects.models", fromlist=["ProjectTailoring"]).ProjectTailoring.objects.filter(project__company=company).exists()) if company else False
    used_coach = _safe(lambda: __import__("admin_portal.models", fromlist=["AuditLog"]).AuditLog.objects.filter(user=user, action__icontains="coach").exists())
    started_academy = _safe(lambda: __import__("academy.models", fromlist=["Enrollment"]).Enrollment.objects.filter(user=user).exists())
    invited_team = usage["users"] > 1

    # Experience level (beginner / gevorderd≈medior / pro) drives how deep the
    # first-run flow is. Read it from the reusable methodology profile.
    experience = "gevorderd"
    try:
        from accounts.models import UserMethodologyProfile
        prof = UserMethodologyProfile.objects.filter(user=user).first()
        if prof and prof.pm_experience:
            experience = prof.pm_experience
    except Exception:
        pass

    all_steps = {
        "project": {"key": "project", "title": "Maak je eerste project met de wizard",
                    "desc": "Kies een scenario → AI zet methodiek + vorm", "url": "/projects/new", "done": has_project},
        "tailoring": {"key": "tailoring", "title": "Stel de tailoring in",
                      "desc": "Vorm + governance bepalen welke tabs vooraan staan", "url": "/projects", "done": has_tailoring},
        "coach": {"key": "coach", "title": "Vraag de AI-coach iets",
                  "desc": "Methodiek-bewuste begeleiding tijdens je project", "url": "/projects", "done": used_coach},
        "academy": {"key": "academy", "title": "Volg één Academy-les",
                    "desc": "Van kennis naar kunde — de cursus bij je methodiek", "url": "/academy", "done": started_academy},
        "team": {"key": "team", "title": "Nodig een teamlid uit",
                 "desc": "Werk samen in je proeftuin", "url": "/team", "done": invited_team},
    }

    # Experience-adaptive: pros get a condensed, skippable flow; beginners the full
    # guided path with the coach + Academy; medior the standard set.
    if experience == "pro":
        order = ["project", "team"]
        intro = "Je bent ervaren — we houden het kort. Maak een project aan en nodig je team uit; de rest wijst zich vanzelf."
        skippable = True
    elif experience == "beginner":
        order = ["project", "tailoring", "coach", "academy", "team"]
        intro = "Nieuw met projectmanagement? Geen zorgen — we lopen er stap voor stap doorheen en de AI-coach + Academy helpen je onderweg."
        skippable = False
    else:  # gevorderd ≈ medior
        order = ["project", "tailoring", "coach", "academy", "team"]
        intro = "Leer ProjeXtPal kennen met je eerste echte project — de AI helpt je onderweg."
        skippable = True

    steps = [all_steps[k] for k in order]
    done = sum(1 for s in steps if s["done"])
    total = len(steps)

    return Response({
        "is_trial": is_trial,
        "days_remaining": days_remaining,
        "limits": limits,
        "usage": usage,
        "experience": experience,          # beginner | gevorderd | pro
        "intro": intro,
        "skippable": skippable,
        "steps": steps,
        "completed": done,
        "total": total,
        "percent": round(done / total * 100) if total else 0,
        "complete": done == total,
        "has_sample": has_project,
    })


# Two starter scenarios for the sandbox (a heavy PRINCE2 + a light Scrum project).
_SAMPLE_KEYS = ["klant", "product"]


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def start_proeftuin(request):
    """Seed 2 fully-shaped example projects into the user's company so the sandbox
    isn't empty. Idempotent: skips if example projects already exist."""
    user = request.user
    company = getattr(user, "company", None)
    if not company:
        return Response({"detail": "Je account is niet aan een bedrijf gekoppeld."}, status=400)

    from projects.models import Project, ProjectTailoring
    from projects.tailoring import SCENARIOS, recommend_modules
    from django.utils import timezone
    from django.db import transaction
    from datetime import timedelta

    if Project.objects.filter(company=company, name__startswith="Voorbeeld — ").exists():
        return Response({"seeded": False, "message": "Voorbeeldprojecten bestaan al."})

    by_key = {s["key"]: s for s in SCENARIOS}
    created = []
    today = timezone.now().date()

    for key in _SAMPLE_KEYS:
        sc = by_key.get(key)
        if not sc:
            continue
        # Each project (+ tailoring + tasks) in its own savepoint so a signal
        # failure on one never aborts the whole seed.
        try:
            with transaction.atomic():
                project = Project.objects.create(
                    company=company, created_by=user,
                    name=f"Voorbeeld — {sc['title']}",
                    description=f"{sc['desc']} (demo-project om mee te oefenen — veilig te verwijderen)",
                    methodology=sc["methodology"],
                    start_date=today, end_date=today + timedelta(days=90),
                    budget=50000,
                )
                dims = sc["dimensions"]
                rec = recommend_modules(sc["methodology"], dims)
                ProjectTailoring.objects.create(
                    project=project, project_type=sc["project_type"],
                    dim_scope=dims["scope"], dim_budget=dims["budget"], dim_duur=dims["duur"],
                    dim_politiek=dims["politiek"], dim_risico=dims["risico"], dim_regel=dims["regel"],
                    shape=rec["shape"], score=rec["score"], recommended_modules=rec["recommended"],
                    source="scenario", ai_rationale=f"Voorbeeldproject op basis van scenario '{sc['title']}'.",
                )
                # The methodology's own signals scaffold the project's starter
                # structure on create, so no manual tasks are needed here.
                created.append({"id": project.id, "name": project.name, "url": f"/projects/{project.id}/tailoring"})
        except Exception:
            continue

    return Response({"seeded": bool(created), "projects": created})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def reset_proeftuin(request):
    """Remove the seeded example projects so the user can start fresh. Only ever
    touches projects whose name starts with the 'Voorbeeld — ' marker, so real
    work is never deleted."""
    user = request.user
    company = getattr(user, "company", None)
    if not company:
        return Response({"detail": "Je account is niet aan een bedrijf gekoppeld."}, status=400)
    try:
        from projects.models import Project
        qs = Project.objects.filter(company=company, name__startswith="Voorbeeld — ")
        removed = qs.count()
        for p in qs:
            try:
                p.delete()
            except Exception:
                pass
        return Response({"reset": True, "removed": removed})
    except Exception:
        return Response({"reset": False, "removed": 0})
