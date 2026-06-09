"""Read-only audit-log viewer (admin/superadmin). Company-scoped; append-only —
no create/update/delete endpoint by design (logs are immutable). Reads the
existing admin_portal.AuditLog store, now also fed by the accounts.audit() helper
from the high-blast-radius write paths."""
from rest_framework import serializers, viewsets, mixins
from rest_framework.permissions import IsAuthenticated

from admin_portal.models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = ["id", "user_email", "action", "category", "severity",
                  "description", "resource_type", "resource_id", "ip_address",
                  "metadata", "created_at"]


class AuditLogViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        role = getattr(user, "role", None)
        is_super = role == "superadmin" or getattr(user, "is_superuser", False)
        if role != "admin" and not is_super:
            return AuditLog.objects.none()
        qs = AuditLog.objects.all() if is_super else AuditLog.objects.filter(company_id=getattr(user, "company_id", None))
        for f in ("action", "category", "severity"):
            v = self.request.query_params.get(f)
            if v:
                qs = qs.filter(**{f: v})
        return qs.order_by("-created_at")[:500]
