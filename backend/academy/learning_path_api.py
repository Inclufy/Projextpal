"""
Learning Path builder API.

A LearningPath is a structured track: ordered items (course/microlearning/
module/lesson/exam) + the skills it awards, optionally leading to a certificate.

Visibility: global paths (company=null) are visible to everyone; company paths
only to that tenant. Create/edit is admin-gated. Company paths are scoped to the
admin's own company (superadmin may target any / global).
"""
from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import serializers, viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import LearningPath, LearningPathItem, Skill, Course

User = get_user_model()


def _is_admin(user):
    return getattr(user, "role", None) in ("admin", "superadmin")


class LearningPathItemSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source="course.title", read_only=True)

    class Meta:
        model = LearningPathItem
        fields = ["id", "item_type", "course", "course_title", "ref_id", "label", "order"]


class _SkillMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name", "name_nl"]


class LearningPathSerializer(serializers.ModelSerializer):
    items = LearningPathItemSerializer(many=True, read_only=True)
    skills = _SkillMiniSerializer(many=True, read_only=True)
    skill_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Skill.objects.all(), source="skills",
        required=False, write_only=True,
    )
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = LearningPath
        fields = [
            "id", "title", "title_nl", "description", "description_nl",
            "company", "active", "leads_to_certificate", "order",
            "skills", "skill_ids", "items", "item_count",
            "created_at", "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def get_item_count(self, obj):
        return obj.items.count()


class LearningPathViewSet(viewsets.ModelViewSet):
    serializer_class = LearningPathSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = LearningPath.objects.prefetch_related("items", "skills").all()
        if getattr(user, "role", None) == "superadmin":
            return qs
        # everyone else: global paths + their own company's paths
        return qs.filter(Q(company__isnull=True) | Q(company_id=getattr(user, "company_id", None)))

    def _guard_admin(self):
        if not _is_admin(self.request.user):
            return Response({"detail": "Only admins can edit learning paths."}, status=403)
        return None

    def create(self, request, *args, **kwargs):
        g = self._guard_admin()
        if g:
            return g
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        user = self.request.user
        company_id = serializer.validated_data.get("company")
        # tenant admin -> force own company; superadmin -> honour payload (incl. global)
        if getattr(user, "role", None) != "superadmin":
            company_id = getattr(user, "company_id", None)
            serializer.save(created_by=user, company_id=company_id)
        else:
            serializer.save(created_by=user)

    def update(self, request, *args, **kwargs):
        g = self._guard_admin()
        if g:
            return g
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        g = self._guard_admin()
        if g:
            return g
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=["post"])
    def add_item(self, request, pk=None):
        if not _is_admin(request.user):
            return Response({"detail": "Only admins can edit learning paths."}, status=403)
        path = self.get_object()
        data = request.data
        order = path.items.count()
        item = LearningPathItem.objects.create(
            path=path,
            item_type=data.get("item_type", "course"),
            course_id=data.get("course") or None,
            ref_id=data.get("ref_id", "") or "",
            label=data.get("label", "") or "",
            order=data.get("order", order),
        )
        return Response(LearningPathItemSerializer(item).data, status=201)

    @action(detail=True, methods=["delete"], url_path="items/(?P<item_id>[^/.]+)")
    def remove_item(self, request, pk=None, item_id=None):
        if not _is_admin(request.user):
            return Response({"detail": "Only admins can edit learning paths."}, status=403)
        path = self.get_object()
        LearningPathItem.objects.filter(path=path, id=item_id).delete()
        return Response(status=204)
