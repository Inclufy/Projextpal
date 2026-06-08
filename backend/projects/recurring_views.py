"""Recurring task rules — tenant-defined templates that materialize a Task on a
daily/weekly/monthly cadence. Company + project scoped; managers manage them.
A 'run_now' action lets a user force-generate the due task immediately."""
from datetime import date

from rest_framework import serializers, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import RecurringTaskRule
from .analytics_views import _company_of
from .views import accessible_project_ids

MANAGER_ROLES = ("admin", "superadmin", "pm", "program_manager", "project_manager")


def _is_manager(user):
    return getattr(user, "role", None) in MANAGER_ROLES or getattr(user, "is_superuser", False)


class RecurringTaskRuleSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.SerializerMethodField()

    class Meta:
        model = RecurringTaskRule
        fields = [
            "id", "project", "milestone", "title", "description", "category",
            "priority", "assigned_to", "assigned_to_name", "custom_fields",
            "frequency", "interval", "start_date", "end_date", "next_run_date",
            "last_generated_date", "due_offset_days", "active",
            "created_at", "updated_at",
        ]
        read_only_fields = ["last_generated_date", "created_at", "updated_at"]

    def get_assigned_to_name(self, obj):
        u = obj.assigned_to
        if not u:
            return None
        return (getattr(u, "get_full_name", lambda: "")() or getattr(u, "email", "")) or None

    def validate(self, attrs):
        if attrs.get("interval", 1) < 1:
            raise ValidationError({"interval": "Interval must be at least 1."})
        # Default next_run_date to start_date when not supplied.
        if not attrs.get("next_run_date"):
            attrs["next_run_date"] = attrs.get("start_date") or date.today()
        return attrs


class RecurringTaskRuleViewSet(viewsets.ModelViewSet):
    serializer_class = RecurringTaskRuleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        company = _company_of(self.request.user)
        if not company:
            return RecurringTaskRule.objects.none()
        qs = RecurringTaskRule.objects.filter(company=company)
        project = self.request.query_params.get("project")
        if project:
            qs = qs.filter(project_id=project)
        # Restrict to projects the caller can access.
        return qs.filter(project_id__in=set(accessible_project_ids(self.request.user)))

    def _guard(self, project_id=None):
        if not _is_manager(self.request.user):
            raise PermissionDenied("Only an admin or manager can manage recurring tasks.")
        if project_id is not None and int(project_id) not in set(accessible_project_ids(self.request.user)):
            raise PermissionDenied("Project not accessible.")

    def perform_create(self, serializer):
        project = serializer.validated_data.get("project")
        self._guard(project_id=getattr(project, "id", None))
        company = _company_of(self.request.user)
        if company is None:
            raise ValidationError("Your account has no associated company.")
        serializer.save(company=company, created_by=self.request.user)

    def perform_update(self, serializer):
        self._guard(project_id=serializer.instance.project_id)
        serializer.save()

    def perform_destroy(self, instance):
        self._guard(project_id=instance.project_id)
        instance.delete()

    @action(detail=True, methods=["post"], url_path="run-now")
    def run_now(self, request, pk=None):
        """Force-generate this rule's task immediately (and advance schedule)."""
        rule = self.get_object()
        self._guard(project_id=rule.project_id)
        from .recurring_engine import materialize_rule
        created = materialize_rule(rule, force=True)
        return Response({"created": 1 if created else 0, "next_run_date": rule.next_run_date})
