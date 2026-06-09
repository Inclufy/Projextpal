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

    steps = [
        {"key": "project", "title": "Maak je eerste project met de wizard",
         "desc": "Kies een scenario → AI zet methodiek + vorm", "url": "/projects/new", "done": has_project},
        {"key": "tailoring", "title": "Stel de tailoring in",
         "desc": "Vorm + governance bepalen welke tabs vooraan staan", "url": "/projects", "done": has_tailoring},
        {"key": "coach", "title": "Vraag de AI-coach iets",
         "desc": "Methodiek-bewuste begeleiding tijdens je project", "url": "/projects", "done": used_coach},
        {"key": "academy", "title": "Volg één Academy-les",
         "desc": "Van kennis naar kunde — de cursus bij je methodiek", "url": "/academy", "done": started_academy},
        {"key": "team", "title": "Nodig een teamlid uit",
         "desc": "Werk samen in je proeftuin", "url": "/team", "done": invited_team},
    ]
    done = sum(1 for s in steps if s["done"])
    total = len(steps)

    return Response({
        "is_trial": is_trial,
        "days_remaining": days_remaining,
        "limits": limits,
        "usage": usage,
        "steps": steps,
        "completed": done,
        "total": total,
        "percent": round(done / total * 100) if total else 0,
        "complete": done == total,
    })
