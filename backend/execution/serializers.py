from rest_framework import serializers
from .models import Stakeholder, Governance, ChangeRequest


class StakeholderSerializer(serializers.ModelSerializer):
    project_name = serializers.ReadOnlyField(source="project.name")

    class Meta:
        model = Stakeholder
        fields = [
            "id",
            "company",
            "project",
            "project_name",
            "name",
            "role",
            "contact",
            "influence",
            "governance_type",
            "created_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["company", "created_by", "created_at", "updated_at"]

    def create(self, validated_data):
        request = self.context.get("request")
        if request and request.user:
            validated_data.setdefault("company", getattr(request.user, "company", None))
            validated_data.setdefault("created_by", request.user)
        return super().create(validated_data)


class GovernanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Governance
        fields = [
            "id",
            "project",
            "structure_data",
            "impact_data",
            "risks_data",
            "meeting_cadence",
            "change_control_process",
            "decision_rights",
            "created_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_by", "created_at", "updated_at"]


class ChangeRequestSerializer(serializers.ModelSerializer):
    requested_by_name = serializers.SerializerMethodField()
    reviewed_by_name = serializers.SerializerMethodField()
    project_name = serializers.ReadOnlyField(source="project.name")

    class Meta:
        model = ChangeRequest
        fields = [
            "id",
            "project",
            "project_name",
            "title",
            "description",
            "change_type",
            "priority",
            "status",
            "impact_description",
            "cost_impact",
            "timeline_impact_days",
            "approval_stage",
            "requested_by",
            "requested_by_name",
            "requested_date",
            "reviewed_by",
            "reviewed_by_name",
            "reviewed_date",
            "review_comments",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["requested_by", "requested_date", "created_at", "updated_at"]

    def get_requested_by_name(self, obj):
        if obj.requested_by:
            return getattr(obj.requested_by, "first_name", None) or getattr(
                obj.requested_by, "email", ""
            )
        return ""

    def get_reviewed_by_name(self, obj):
        if obj.reviewed_by:
            return getattr(obj.reviewed_by, "first_name", None) or getattr(
                obj.reviewed_by, "email", ""
            )
        return ""