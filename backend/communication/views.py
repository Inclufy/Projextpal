from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.parsers import MultiPartParser, FormParser
from calendar import monthrange
from datetime import date as dt_date, timedelta
from .models import (
    StatusReport, TrainingMaterial, ReportingItem, Meeting,
    GeneratedStatusReport, MethodologyReport,
)
from .serializers import (
    StatusReportSerializer, TrainingMaterialSerializer, ReportingItemSerializer,
    MeetingSerializer, MeetingOccurrenceSerializer, GeneratedStatusReportSerializer,
    MethodologyReportSerializer,
)


def _company_scoped(qs, user):
    """P0 cross-tenant fix — was returning every project's rows globally.

    All four communication models are scoped via `project.company`. Filter
    by the requesting user's company. Superadmin/superuser sees everything.
    """
    if not user.is_authenticated:
        return qs.none()
    if getattr(user, "role", None) == "superadmin" or getattr(user, "is_superuser", False):
        return qs
    company_id = getattr(user, "company_id", None)
    if not company_id:
        return qs.none()
    return qs.filter(project__company_id=company_id)


class StatusReportViewSet(viewsets.ModelViewSet):
    queryset = StatusReport.objects.all()
    serializer_class = StatusReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return _company_scoped(StatusReport.objects.all(), self.request.user)

    def list(self, request):
        queryset = self.get_queryset()
        project_id = request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def retrieve(self, request, pk=None):
        queryset = self.get_queryset()
        report = get_object_or_404(queryset, pk=pk)
        serializer = self.get_serializer(report)
        return Response(serializer.data)
    
    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, pk=None):
        report = get_object_or_404(self.get_queryset(), pk=pk)
        serializer = self.get_serializer(report, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, pk=None):
        report = get_object_or_404(self.get_queryset(), pk=pk)
        serializer = self.get_serializer(report, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        report = get_object_or_404(self.get_queryset(), pk=pk)
        report.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class GeneratedStatusReportViewSet(viewsets.ReadOnlyModelViewSet):
    """AI-synthesised executive status reports (IL-2).

    Read-only history + a `generate` action that runs the synthesis engine for a
    project and persists a new report. Company-scoped like the other surfaces.
    """
    serializer_class = GeneratedStatusReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = _company_scoped(
            GeneratedStatusReport.objects.select_related("project", "created_by"),
            self.request.user,
        )
        project_id = self.request.query_params.get("project")
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs

    @action(detail=False, methods=["post"])
    def generate(self, request):
        """Body: {project: <id>}. Gathers live metrics, computes RAG, synthesises
        the narrative (LLM if configured, else deterministic) and stores it."""
        from projects.models import Project
        from .status_synthesis import synthesize

        project_id = request.data.get("project")
        if not project_id:
            return Response({"detail": "project is required."},
                            status=status.HTTP_400_BAD_REQUEST)
        proj_qs = Project.objects.all()
        user = request.user
        if not (getattr(user, "role", None) == "superadmin" or getattr(user, "is_superuser", False)):
            company_id = getattr(user, "company_id", None)
            proj_qs = proj_qs.filter(company_id=company_id) if company_id else proj_qs.none()
        project = get_object_or_404(proj_qs, pk=project_id)
        result = synthesize(project)
        report = GeneratedStatusReport.objects.create(
            project=project,
            metrics=result["metrics"],
            overall_rag=result["overall_rag"],
            rag_scope=result["rag_scope"],
            rag_schedule=result["rag_schedule"],
            rag_cost=result["rag_cost"],
            rag_risk=result["rag_risk"],
            executive_summary=result["executive_summary"],
            highlights=result["highlights"],
            blockers=result["blockers"],
            next_steps=result["next_steps"],
            model_used=result["model_used"],
            original_ai_response=result["original_ai_response"],
            created_by=request.user,
        )
        return Response(self.get_serializer(report).data,
                        status=status.HTTP_201_CREATED)


class MethodologyReportViewSet(viewsets.ModelViewSet):
    """Doctrine-specific reports (one shared model, all methodologies).

    Full CRUD so a user can hand-author/edit a report, plus a `generate`
    action that synthesises one from the project's live methodology state.
    Company-scoped; filterable by `project` and `methodology`.
    """
    serializer_class = MethodologyReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = _company_scoped(
            MethodologyReport.objects.select_related("project", "created_by"),
            self.request.user,
        )
        project_id = self.request.query_params.get("project")
        if project_id:
            qs = qs.filter(project_id=project_id)
        methodology = self.request.query_params.get("methodology")
        if methodology:
            qs = qs.filter(methodology=methodology)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, auto_generated=False)

    @action(detail=False, methods=["post"])
    def generate(self, request):
        """Body: {project: <id>, methodology: <slug>}. Reads live methodology
        state, synthesises the doctrine report and persists it."""
        from projects.models import Project
        from .doctrine_reports import synthesize

        project_id = request.data.get("project")
        methodology = request.data.get("methodology")
        if not project_id or not methodology:
            return Response({"detail": "project and methodology are required."},
                            status=status.HTTP_400_BAD_REQUEST)
        if methodology not in dict(MethodologyReport.METHODOLOGY_CHOICES):
            return Response({"detail": f"Unknown methodology '{methodology}'."},
                            status=status.HTTP_400_BAD_REQUEST)

        proj_qs = Project.objects.all()
        user = request.user
        if not (getattr(user, "role", None) == "superadmin" or getattr(user, "is_superuser", False)):
            company_id = getattr(user, "company_id", None)
            proj_qs = proj_qs.filter(company_id=company_id) if company_id else proj_qs.none()
        project = get_object_or_404(proj_qs, pk=project_id)

        result = synthesize(project, methodology)
        report = MethodologyReport.objects.create(
            project=project,
            methodology=methodology,
            report_type=result["report_type"],
            title=result["title"],
            period_start=result["period_start"],
            period_end=result["period_end"],
            scope_ref=result["scope_ref"],
            overall_rag=result["overall_rag"],
            rag_scope=result["rag_scope"],
            rag_schedule=result["rag_schedule"],
            rag_cost=result["rag_cost"],
            rag_risk=result["rag_risk"],
            executive_summary=result["executive_summary"],
            highlights=result["highlights"],
            blockers=result["blockers"],
            next_steps=result["next_steps"],
            metrics=result["metrics"],
            payload=result["payload"],
            auto_generated=True,
            model_used=result["model_used"],
            original_ai_response=result["original_ai_response"],
            created_by=request.user,
        )
        return Response(self.get_serializer(report).data,
                        status=status.HTTP_201_CREATED)


# Training Material ViewSet
class TrainingMaterialViewSet(viewsets.ModelViewSet):
    queryset = TrainingMaterial.objects.all()
    serializer_class = TrainingMaterialSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return _company_scoped(TrainingMaterial.objects.all(), self.request.user)

    def list(self, request):
        queryset = self.get_queryset()
        project_id = request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        queryset = self.get_queryset()
        material = get_object_or_404(queryset, pk=pk)
        serializer = self.get_serializer(material)
        return Response(serializer.data)

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        material = get_object_or_404(self.get_queryset(), pk=pk)
        serializer = self.get_serializer(material, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, pk=None):
        material = get_object_or_404(self.get_queryset(), pk=pk)
        serializer = self.get_serializer(material, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        material = get_object_or_404(self.get_queryset(), pk=pk)
        material.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
# Report ViewSet
class ReportingItemViewSet(viewsets.ModelViewSet):
    queryset = ReportingItem.objects.all()
    serializer_class = ReportingItemSerializer
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return _company_scoped(ReportingItem.objects.all(), self.request.user)

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        project_id = request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        page = self.paginate_queryset(qs)
        serializer = self.get_serializer(page or qs, many=True, context={'request': request})
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        item = get_object_or_404(self.get_queryset(), pk=pk)
        serializer = self.get_serializer(item, context={'request': request})
        return Response(serializer.data)

    def create(self, request):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, pk=None):
        item = get_object_or_404(self.get_queryset(), pk=pk)
        serializer = self.get_serializer(item, data=request.data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def destroy(self, request, pk=None):
        item = get_object_or_404(self.get_queryset(), pk=pk)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# Meeting ViewSet
class MeetingViewSet(viewsets.ModelViewSet):
    queryset = Meeting.objects.all()
    serializer_class = MeetingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = _company_scoped(Meeting.objects.all(), self.request.user)
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs

    def list(self, request, *args, **kwargs):
        """
        GET /communication/meetings/?project=<id>
        GET /communication/meetings/?project=<id>&month=YYYY-MM&expand=true
        """
        expand = request.query_params.get('expand', 'false').lower() == 'true'
        month = request.query_params.get('month')

        if not expand or not month:
            qs = self.get_queryset()
            ser = self.get_serializer(qs, many=True)
            return Response(ser.data)

        # Expand recurring meetings for requested month
        try:
            year_str, mon_str = month.split('-')
            year, mon = int(year_str), int(mon_str)
        except Exception:
            return Response({"detail": "Invalid month format. Use YYYY-MM."}, status=400)

        first = dt_date(year, mon, 1)
        last_day = monthrange(year, mon)[1]
        last = dt_date(year, mon, last_day)

        def include(d: dt_date) -> bool:
            return first <= d <= last

        occurrences = []
        base_qs = self.get_queryset()

        for m in base_qs:
            base = m.date
            payload = MeetingSerializer(m, context={'request': request}).data

            if m.type == "onetime":
                if include(base):
                    occurrences.append({**payload, "date": base})
                continue

            if m.frequency == "adhoc":
                if include(base):
                    occurrences.append({**payload, "date": base})
                continue

            if m.frequency in ("weekly", "biweekly"):
                step = 7 if m.frequency == "weekly" else 14
                d = base
                while d < first:
                    d += timedelta(days=step)
                while d <= last:
                    occurrences.append({**payload, "date": d})
                    d += timedelta(days=step)

            elif m.frequency == "monthly":
                d = base
                while d < first:
                    y = d.year + (1 if d.month == 12 else 0)
                    mo = 1 if d.month == 12 else d.month + 1
                    mdays = monthrange(y, mo)[1]
                    d = dt_date(y, mo, min(d.day, mdays))

                while d <= last:
                    occurrences.append({**payload, "date": d})
                    y = d.year + (1 if d.month == 12 else 0)
                    mo = 1 if d.month == 12 else d.month + 1
                    mdays = monthrange(y, mo)[1]
                    d = dt_date(y, mo, min(d.day, mdays))

        data = MeetingOccurrenceSerializer(occurrences, many=True).data
        return Response(data)