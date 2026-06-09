"""
API surface for project tailoring + the AI intake.

Endpoints (mounted under /api/v1/projects/):
  POST  intake/analyze/                 -> classify a description (AI-assisted, safe fallback)
  GET   intake/recommend/?methodology=&dims=... (rarely used directly; preview)
  GET   <pk>/tailoring/                 -> read a project's tailoring
  PUT   <pk>/tailoring/                 -> upsert a project's tailoring (applies the wizard)
  GET   methodology-profile/            -> the current user's reusable profile
  PUT   methodology-profile/            -> upsert the current user's profile
"""
from rest_framework import serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Project, ProjectTailoring
from .tailoring import classify_with_llm, recommend_modules, DIMENSIONS, SCENARIOS


# --------------------------------------------------------------------------- #
# Serializers
# --------------------------------------------------------------------------- #
class ProjectTailoringSerializer(serializers.ModelSerializer):
    dimensions = serializers.SerializerMethodField()

    class Meta:
        model = ProjectTailoring
        fields = [
            "project", "project_type",
            "dim_scope", "dim_budget", "dim_duur", "dim_politiek", "dim_risico", "dim_regel",
            "team_size", "departments",
            "gov_authority", "gov_board", "gov_portfolio",
            "gov_stakeholder_matrix", "gov_periodic_cadence",
            "shape", "score", "recommended_modules", "coach_mode",
            "ai_rationale", "source", "dimensions", "updated_at",
        ]
        read_only_fields = ["project", "shape", "score", "recommended_modules", "updated_at"]

    def get_dimensions(self, obj):
        return obj.dimensions


# --------------------------------------------------------------------------- #
# Intake: analyse a description
# --------------------------------------------------------------------------- #
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def intake_scenarios(request):
    """The recognisable scenario presets for the project-creation picker."""
    return Response({"scenarios": SCENARIOS})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def intake_analyze(request):
    """Classify a free-text description into methodology / type / dimensions.

    AI never decides silently: the deterministic classifier always runs and the
    LLM (if configured) only refines it. The frontend presents the result as a
    *proposal* the user confirms.
    """
    description = (request.data or {}).get("description", "")
    company = getattr(request.user, "company", None)
    result = classify_with_llm(description, company=company)
    # attach a recommended module preview for the proposed methodology
    preview = recommend_modules(result["methodology"], result["dimensions"])
    result["preview"] = preview
    return Response(result)


# --------------------------------------------------------------------------- #
# Tailoring read / upsert for a project
# --------------------------------------------------------------------------- #
def _accessible_project(user, pk):
    from .role_views import accessible_project_ids
    return Project.objects.filter(id=pk, id__in=accessible_project_ids(user)).first()


@api_view(["GET", "PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def project_tailoring(request, pk):
    project = _accessible_project(request.user, pk)
    if not project:
        return Response({"detail": "Project not found or not accessible."}, status=404)

    tailoring, _ = ProjectTailoring.objects.get_or_create(project=project)
    methodology = project.methodology or "inclufy"

    def _governance(t):
        return {
            "board": t.gov_board,
            "portfolio": "yes" if t.gov_portfolio else "no",
            "stakeholder": "matrix" if t.gov_stakeholder_matrix else "light",
            "cadence": "periodic" if t.gov_periodic_cadence else "adhoc",
        }

    if request.method == "GET":
        rec = recommend_modules(methodology, tailoring.dimensions, _governance(tailoring))
        return Response({**ProjectTailoringSerializer(tailoring).data,
                         "methodology": methodology, "more": rec["more"]})

    data = request.data or {}
    # write the editable fields
    for f in ["project_type", "dim_scope", "dim_budget", "dim_duur", "dim_politiek",
              "dim_risico", "dim_regel", "team_size", "departments",
              "gov_authority", "gov_board", "gov_portfolio",
              "gov_stakeholder_matrix", "gov_periodic_cadence",
              "coach_mode", "ai_rationale", "source"]:
        if f in data:
            setattr(tailoring, f, data[f])

    # recompute the outcome from the dimensions + governance
    rec = recommend_modules(methodology, tailoring.dimensions, _governance(tailoring))
    tailoring.shape = rec["shape"]
    tailoring.score = rec["score"]
    tailoring.recommended_modules = rec["recommended"]
    tailoring.save()

    # keep the project's pm_can_authorize in sync with the governance choice
    new_pm = tailoring.gov_authority == "owner_pm"
    if project.pm_can_authorize != new_pm:
        project.pm_can_authorize = new_pm
        project.save(update_fields=["pm_can_authorize"])

    return Response({**ProjectTailoringSerializer(tailoring).data,
                     "methodology": methodology, "more": rec["more"]})


# --------------------------------------------------------------------------- #
# The current user's reusable methodology profile
# --------------------------------------------------------------------------- #
@api_view(["GET", "PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def methodology_profile(request):
    from accounts.models import UserMethodologyProfile
    profile, _ = UserMethodologyProfile.objects.get_or_create(user=request.user)

    if request.method == "GET":
        return Response(_profile_data(profile))

    data = request.data or {}
    if "pm_experience" in data:
        profile.pm_experience = data["pm_experience"]
    if "preferred_methodology" in data:
        profile.preferred_methodology = data["preferred_methodology"]
    if "methodology_competence" in data and isinstance(data["methodology_competence"], dict):
        merged = dict(profile.methodology_competence or {})
        merged.update(data["methodology_competence"])
        profile.methodology_competence = merged
    profile.save()
    return Response(_profile_data(profile))


def _profile_data(profile):
    return {
        "pm_experience": profile.pm_experience,
        "methodology_competence": profile.methodology_competence or {},
        "preferred_methodology": profile.preferred_methodology,
        "updated_at": profile.updated_at,
    }


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def methodology_course(request):
    """
    GET  ?methodology=prince2  -> the Academy course for a methodology + whether
                                  the user is already enrolled.
    POST {methodology}         -> enrol the current user in that course ("Plan cursus").
    """
    from .tailoring import METHODOLOGY_COURSE
    methodology = (request.query_params.get("methodology")
                   or (request.data or {}).get("methodology") or "inclufy")
    slug = METHODOLOGY_COURSE.get(methodology, "pm-fundamentals")

    try:
        from academy.models import Course, Enrollment
        course = Course.objects.filter(slug=slug).first()
    except Exception:
        course = None
    if not course:
        return Response({"methodology": methodology, "slug": slug, "course": None, "enrolled": False})

    enrolled = Enrollment.objects.filter(user=request.user, course=course).exists()

    if request.method == "POST":
        if not enrolled:
            Enrollment.objects.create(
                user=request.user, course=course, status="pending",
                email=request.user.email or "",
                first_name=getattr(request.user, "first_name", "") or "",
                last_name=getattr(request.user, "last_name", "") or "",
                company=str(getattr(request.user, "company", "") or ""),
            )
            enrolled = True
            try:
                from accounts.models import audit
                audit(request.user, "academy.enroll",
                      summary=f"Enrolled in {course.slug} via tailoring",
                      target_type="course", target_id=str(course.id), request=request)
            except Exception:
                pass

    return Response({
        "methodology": methodology, "slug": slug,
        "course": {"title": course.title, "slug": course.slug},
        "enrolled": enrolled,
    })
