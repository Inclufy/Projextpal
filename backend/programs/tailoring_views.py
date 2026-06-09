"""
Programme tailoring + AI intake (programme scale).

  GET  /api/v1/programs/intake/scenarios/
  POST /api/v1/programs/intake/analyze/
  GET  /api/v1/programs/<pk>/tailoring/
  PUT  /api/v1/programs/<pk>/tailoring/
"""
from rest_framework import serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Program, ProgramTailoring
from projects.tailoring import (
    classify_program, recommend_program_modules, PROGRAM_SCENARIOS,
)


class ProgramTailoringSerializer(serializers.ModelSerializer):
    dimensions = serializers.SerializerMethodField()

    class Meta:
        model = ProgramTailoring
        fields = [
            "program", "project_type",
            "dim_scope", "dim_budget", "dim_duur", "dim_politiek", "dim_risico", "dim_regel",
            "team_size", "departments",
            "gov_authority", "gov_board", "gov_portfolio",
            "gov_stakeholder_matrix", "gov_periodic_cadence",
            "shape", "score", "recommended_modules", "coach_mode",
            "ai_rationale", "source", "dimensions", "updated_at",
        ]
        read_only_fields = ["program", "shape", "score", "recommended_modules", "updated_at"]

    def get_dimensions(self, obj):
        return obj.dimensions


def _accessible_program(user, pk):
    program = Program.objects.filter(id=pk).first()
    if not program:
        return None
    is_admin = getattr(user, "role", None) in ("admin", "superadmin") or getattr(user, "is_superuser", False)
    if is_admin or getattr(program, "company_id", None) == getattr(user, "company_id", None):
        return program
    return None


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def program_intake_scenarios(request):
    return Response({"scenarios": PROGRAM_SCENARIOS})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def program_intake_analyze(request):
    description = (request.data or {}).get("description", "")
    result = classify_program(description)
    result["preview"] = recommend_program_modules(result["methodology"], result["dimensions"])
    return Response(result)


@api_view(["GET", "PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def program_tailoring(request, pk):
    program = _accessible_program(request.user, pk)
    if not program:
        return Response({"detail": "Programme not found or not accessible."}, status=404)

    tailoring, _ = ProgramTailoring.objects.get_or_create(program=program)
    methodology = program.methodology or "inclufy"

    def _gov(t):
        return {
            "board": t.gov_board,
            "portfolio": "yes" if t.gov_portfolio else "no",
            "stakeholder": "matrix" if t.gov_stakeholder_matrix else "light",
            "cadence": "periodic" if t.gov_periodic_cadence else "adhoc",
        }

    if request.method == "GET":
        rec = recommend_program_modules(methodology, tailoring.dimensions, _gov(tailoring))
        return Response({**ProgramTailoringSerializer(tailoring).data,
                         "methodology": methodology, "more": rec["more"]})

    data = request.data or {}
    for f in ["project_type", "dim_scope", "dim_budget", "dim_duur", "dim_politiek",
              "dim_risico", "dim_regel", "team_size", "departments",
              "gov_authority", "gov_board", "gov_portfolio",
              "gov_stakeholder_matrix", "gov_periodic_cadence",
              "coach_mode", "ai_rationale", "source"]:
        if f in data:
            setattr(tailoring, f, data[f])

    rec = recommend_program_modules(methodology, tailoring.dimensions, _gov(tailoring))
    tailoring.shape = rec["shape"]
    tailoring.score = rec["score"]
    tailoring.recommended_modules = rec["recommended"]
    tailoring.save()

    return Response({**ProgramTailoringSerializer(tailoring).data,
                     "methodology": methodology, "more": rec["more"]})
