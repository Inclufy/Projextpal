"""Member-skills endpoints (Sprint 9 Agent B / S9-05).

Endpoints
---------
    GET  /api/v1/auth/skills/catalog/            - list all catalog skills
    POST /api/v1/auth/skills/catalog/            - admin creates a catalog skill
    GET  /api/v1/auth/skills/me/                 - list my skills
    POST /api/v1/auth/skills/me/                 - add a skill to me (body: skill or skill_code)
    PATCH  /api/v1/auth/skills/me/<id>/          - update own skill (level/years)
    DELETE /api/v1/auth/skills/me/<id>/          - remove own skill
    GET  /api/v1/auth/skills/users/<user_id>/    - list another user's skills (same company)
    POST /api/v1/auth/skills/match/              - rank members by matching skills

Tenant isolation: ``/users/<user_id>/`` and ``match/`` only consider users
whose ``company`` matches ``request.user.company`` (unless superadmin).
"""
from __future__ import annotations

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from .models import Skill, UserSkill

User = get_user_model()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
_LEVEL_WEIGHT = {"beginner": 1, "intermediate": 2, "expert": 3}


def _is_superadmin(user) -> bool:
    return bool(
        getattr(user, "is_superuser", False)
        or getattr(user, "role", None) == "superadmin"
    )


def _is_admin_like(user) -> bool:
    """Allowed to create/edit catalog skills."""
    return bool(
        getattr(user, "is_staff", False)
        or getattr(user, "is_superuser", False)
        or getattr(user, "role", None) in ("admin", "superadmin")
    )


def _serialize_skill(s: Skill) -> dict:
    return {
        "id": s.id,
        "code": s.code,
        "name": s.name,
        "name_nl": s.name_nl,
        "category": s.category,
        "description": s.description,
        "description_nl": s.description_nl,
    }


def _serialize_user_skill(us: UserSkill) -> dict:
    return {
        "id": us.id,
        "user_id": us.user_id,
        "skill_id": us.skill_id,
        "skill": _serialize_skill(us.skill),
        "level": us.level,
        "years_experience": us.years_experience,
        "verified_by_id": us.verified_by_id,
        "verified_at": us.verified_at.isoformat() if us.verified_at else None,
        "added_at": us.added_at.isoformat() if us.added_at else None,
    }


# ---------------------------------------------------------------------------
# Catalog
# ---------------------------------------------------------------------------
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def catalog_list_create(request):
    """GET: everyone (authenticated) sees the catalog.
    POST: only admin/superadmin may add new catalog skills."""
    if request.method == "GET":
        qs = Skill.objects.all()
        category = request.query_params.get("category")
        if category:
            qs = qs.filter(category=category)
        return Response([_serialize_skill(s) for s in qs])

    # POST
    if not _is_admin_like(request.user):
        return Response(
            {"detail": "Only admins can create catalog skills."},
            status=status.HTTP_403_FORBIDDEN,
        )
    data = request.data or {}
    code = (data.get("code") or "").strip()
    name = (data.get("name") or "").strip()
    if not code or not name:
        return Response(
            {"detail": "code and name are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if Skill.objects.filter(code=code).exists():
        return Response(
            {"detail": f"Skill with code {code!r} already exists."},
            status=status.HTTP_409_CONFLICT,
        )
    skill = Skill.objects.create(
        code=code,
        name=name,
        name_nl=data.get("name_nl") or "",
        category=data.get("category") or "technical",
        description=data.get("description") or "",
        description_nl=data.get("description_nl") or "",
    )
    return Response(_serialize_skill(skill), status=status.HTTP_201_CREATED)


# ---------------------------------------------------------------------------
# Me
# ---------------------------------------------------------------------------
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def my_skills(request):
    """List or add a skill for the current user."""
    if request.method == "GET":
        qs = UserSkill.objects.filter(user=request.user).select_related("skill")
        return Response([_serialize_user_skill(us) for us in qs])

    # POST — add a skill to self.
    data = request.data or {}
    skill_obj = None
    if data.get("skill_code"):
        skill_obj = Skill.objects.filter(code=data["skill_code"]).first()
    elif data.get("skill_id") or data.get("skill"):
        skill_id = data.get("skill_id") or data.get("skill")
        try:
            skill_obj = Skill.objects.filter(pk=int(skill_id)).first()
        except (TypeError, ValueError):
            skill_obj = None
    if not skill_obj:
        return Response(
            {"detail": "skill_code or skill_id required and must reference an existing catalog skill."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    level = data.get("level") or "intermediate"
    if level not in dict(UserSkill.LEVEL_CHOICES):
        return Response(
            {"detail": f"level must be one of {list(dict(UserSkill.LEVEL_CHOICES))}"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    years = data.get("years_experience")
    try:
        years_val = int(years) if years not in (None, "") else None
    except (TypeError, ValueError):
        return Response(
            {"detail": "years_experience must be an integer"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    us, created = UserSkill.objects.get_or_create(
        user=request.user,
        skill=skill_obj,
        defaults={"level": level, "years_experience": years_val},
    )
    if not created:
        # Idempotent upsert: refresh level/years when re-adding.
        us.level = level
        if years_val is not None:
            us.years_experience = years_val
        us.save(update_fields=["level", "years_experience"])
    return Response(
        _serialize_user_skill(us),
        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
    )


@api_view(["PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def my_skill_detail(request, pk: int):
    """Update or delete one of the current user's skills."""
    us = UserSkill.objects.filter(pk=pk, user=request.user).select_related("skill").first()
    if not us:
        return Response(
            {"detail": "Skill not found on your profile."},
            status=status.HTTP_404_NOT_FOUND,
        )

    if request.method == "DELETE":
        us.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    data = request.data or {}
    if "level" in data:
        if data["level"] not in dict(UserSkill.LEVEL_CHOICES):
            return Response(
                {"detail": f"level must be one of {list(dict(UserSkill.LEVEL_CHOICES))}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        us.level = data["level"]
    if "years_experience" in data:
        v = data["years_experience"]
        try:
            us.years_experience = int(v) if v not in (None, "") else None
        except (TypeError, ValueError):
            return Response(
                {"detail": "years_experience must be an integer"},
                status=status.HTTP_400_BAD_REQUEST,
            )
    us.save()
    return Response(_serialize_user_skill(us))


# ---------------------------------------------------------------------------
# Other users (same tenant only)
# ---------------------------------------------------------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_skills(request, user_id: int):
    """List skills for another user. Enforces tenant isolation: the viewer
    and the subject must belong to the same company (superadmin bypass)."""
    try:
        target = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    if not _is_superadmin(request.user):
        viewer_company_id = getattr(request.user, "company_id", None)
        if not viewer_company_id or viewer_company_id != getattr(target, "company_id", None):
            return Response(
                {"detail": "Cannot read skills for a user in another company."},
                status=status.HTTP_403_FORBIDDEN,
            )

    qs = UserSkill.objects.filter(user=target).select_related("skill")
    return Response([_serialize_user_skill(us) for us in qs])


# ---------------------------------------------------------------------------
# Match
# ---------------------------------------------------------------------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def match_skills(request):
    """Rank company members by how well their skills cover the required set.

    Body:
        {
          "required_skill_codes": ["prince2", "agile"],
          "project_id": 10            # optional, informational — not enforced
        }

    Score = (#matched codes) + 0.5 * level_bonus_sum, with verified_at
    adding another 0.1 per match so a verified intermediate outranks an
    unverified intermediate but still loses to any expert.
    """
    data = request.data or {}
    codes = data.get("required_skill_codes") or []
    if not isinstance(codes, list) or not all(isinstance(c, str) for c in codes):
        return Response(
            {"detail": "required_skill_codes must be a list of strings."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    codes = [c.strip() for c in codes if c and c.strip()]
    if not codes:
        return Response(
            {"detail": "required_skill_codes cannot be empty."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    viewer_company_id = getattr(request.user, "company_id", None)
    users_qs = User.objects.all()
    if not _is_superadmin(request.user):
        if not viewer_company_id:
            # No company → can only match against self.
            users_qs = users_qs.filter(pk=request.user.pk)
        else:
            users_qs = users_qs.filter(company_id=viewer_company_id)

    rows = (
        UserSkill.objects
        .filter(user__in=users_qs, skill__code__in=codes)
        .select_related("skill", "user")
    )

    # Aggregate per user.
    agg: dict[int, dict] = {}
    for us in rows:
        bucket = agg.setdefault(
            us.user_id,
            {
                "user_id": us.user_id,
                "user_name": (
                    (us.user.get_full_name() if hasattr(us.user, "get_full_name") else "").strip()
                    or getattr(us.user, "email", "")
                    or f"user#{us.user_id}"
                ),
                "user_email": getattr(us.user, "email", ""),
                "matched": [],
                "score": 0.0,
            },
        )
        bucket["matched"].append(us.skill.code)
        bucket["score"] += 1.0  # one point per matched skill
        bucket["score"] += 0.5 * _LEVEL_WEIGHT.get(us.level, 1)
        if us.verified_at is not None:
            bucket["score"] += 0.1

    ranked = sorted(agg.values(), key=lambda b: (-b["score"], b["user_id"]))

    return Response(
        {
            "required_skill_codes": codes,
            "project_id": data.get("project_id"),
            "results": ranked,
        }
    )
