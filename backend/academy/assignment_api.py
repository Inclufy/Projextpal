"""
Course assignment API — 2-tier.

  Portal admin (superadmin)  -> grants courses to a TENANT  (TenantCourseEntitlement)
  Tenant admin (admin)       -> assigns entitled courses to a USER or the WHOLE ORG
                                (CourseAssignment) -> auto-creates Enrollments.

A learner only gets a course if it's entitled to their tenant AND assigned to them
(or org-wide). Company-scoped throughout.
"""
from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import serializers, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from admin_portal.permissions import IsSuperAdmin
from .models import TenantCourseEntitlement, CourseAssignment, Course, Enrollment

User = get_user_model()


def _is_tenant_admin(user):
    return getattr(user, "role", None) in ("admin", "superadmin")


def _ensure_enrollment(user, course):
    """Idempotently give a user an active enrollment for an assigned course."""
    Enrollment.objects.get_or_create(
        user=user, course=course,
        defaults=dict(
            email=getattr(user, "email", "") or "",
            first_name=getattr(user, "first_name", "") or "",
            last_name=getattr(user, "last_name", "") or "",
            company=getattr(getattr(user, "company", None), "name", "") or "",
            status="active",
        ),
    )


# --------------------------------------------------------------------------
# Tier 1 — Entitlement (Portal admin -> tenant)
# --------------------------------------------------------------------------
class TenantCourseEntitlementSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="company.name", read_only=True)
    course_title = serializers.CharField(source="course.title", read_only=True)

    class Meta:
        model = TenantCourseEntitlement
        fields = ["id", "company", "company_name", "course", "course_title",
                  "active", "seats", "created_at"]
        read_only_fields = ["created_at"]


class TenantCourseEntitlementViewSet(viewsets.ModelViewSet):
    serializer_class = TenantCourseEntitlementSerializer
    permission_classes = [IsSuperAdmin]

    def get_queryset(self):
        qs = TenantCourseEntitlement.objects.select_related("company", "course").all()
        cid = self.request.query_params.get("company")
        if cid:
            qs = qs.filter(company_id=cid)
        return qs

    def perform_create(self, serializer):
        serializer.save(granted_by=self.request.user)


# --------------------------------------------------------------------------
# Tier 2 — Assignment (Tenant admin -> users / org)
# --------------------------------------------------------------------------
class CourseAssignmentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source="course.title", read_only=True)
    target_user_email = serializers.CharField(source="target_user.email", read_only=True)
    target_user_name = serializers.SerializerMethodField()

    class Meta:
        model = CourseAssignment
        fields = ["id", "company", "course", "course_title", "target_type",
                  "target_user", "target_user_email", "target_user_name",
                  "due_date", "mandatory", "created_at"]
        read_only_fields = ["created_at", "company"]

    def get_target_user_name(self, obj):
        u = obj.target_user
        return (u.first_name or u.email) if u else None


class CourseAssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = CourseAssignmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = CourseAssignment.objects.select_related("course", "target_user", "company")
        role = getattr(user, "role", None)
        if role == "superadmin":
            pass
        elif _is_tenant_admin(user) and getattr(user, "company_id", None):
            qs = qs.filter(company_id=user.company_id)
        else:
            qs = qs.filter(
                Q(target_user=user)
                | Q(target_type="entire_org", company_id=getattr(user, "company_id", None))
            )
        cid = self.request.query_params.get("company")
        if cid:
            qs = qs.filter(company_id=cid)
        return qs

    def create(self, request, *args, **kwargs):
        if not _is_tenant_admin(request.user):
            return Response({"detail": "Only admins can assign courses."}, status=403)

        data = request.data
        role = getattr(request.user, "role", None)
        company_id = (data.get("company") if role == "superadmin" else None) \
            or getattr(request.user, "company_id", None)
        if not company_id:
            return Response({"detail": "No company context."}, status=400)

        course_id = data.get("course")
        if not course_id:
            return Response({"detail": "course is required."}, status=400)
        course = Course.objects.filter(id=course_id).first()
        if not course:
            return Response({"detail": "Course not found."}, status=404)

        # Entitlement gate (superadmin bypasses).
        if role != "superadmin" and not TenantCourseEntitlement.objects.filter(
            company_id=company_id, course=course, active=True
        ).exists():
            return Response(
                {"detail": "This course is not enabled for your organization."},
                status=403,
            )

        target_type = data.get("target_type", "user")
        due_date = data.get("due_date") or None
        mandatory = bool(data.get("mandatory"))

        if target_type == "entire_org":
            assignment, _ = CourseAssignment.objects.get_or_create(
                company_id=company_id, course=course, target_type="entire_org",
                target_user=None,
                defaults=dict(assigned_by=request.user, due_date=due_date, mandatory=mandatory),
            )
            for u in User.objects.filter(company_id=company_id, is_active=True):
                _ensure_enrollment(u, course)
        else:
            uid = data.get("target_user")
            if not uid:
                return Response({"detail": "target_user is required."}, status=400)
            u = User.objects.filter(id=uid, company_id=company_id).first()
            if not u:
                return Response({"detail": "User not found in your organization."}, status=404)
            assignment, _ = CourseAssignment.objects.get_or_create(
                company_id=company_id, course=course, target_type="user", target_user=u,
                defaults=dict(assigned_by=request.user, due_date=due_date, mandatory=mandatory),
            )
            _ensure_enrollment(u, course)

        return Response(self.get_serializer(assignment).data, status=201)

    @action(detail=False, methods=["get"])
    def mine(self, request):
        """Courses assigned to the requesting learner (direct + org-wide)."""
        qs = CourseAssignment.objects.select_related("course").filter(
            Q(target_user=request.user)
            | Q(target_type="entire_org", company_id=getattr(request.user, "company_id", None))
        )
        return Response(self.get_serializer(qs, many=True).data)
