from django.contrib import admin
from .models import Stakeholder, ChangeRequest, Governance


@admin.register(Stakeholder)
class StakeholderAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "role",
        "project",
        "influence",
        "governance_type",
        "company",
    )
    list_filter = ("company", "project", "influence", "governance_type")
    search_fields = ("name", "role", "contact", "project__name")


@admin.register(Governance)
class GovernanceAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "project",
        "meeting_cadence",
        "created_by",
        "created_at",
        "updated_at",
    )
    list_filter = ("project__company", "created_at", "updated_at")
    search_fields = ("project__name", "meeting_cadence", "change_control_process")
    readonly_fields = ("created_at", "updated_at")

    fieldsets = (
        ("Project Information", {
            "fields": ("project", "created_by")
        }),
        ("Governance Structure", {
            "fields": ("structure_data", "decision_rights")
        }),
        ("Process & Cadence", {
            "fields": ("meeting_cadence", "change_control_process")
        }),
        ("Impact & Risk Analysis", {
            "fields": ("impact_data", "risks_data")
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )


@admin.register(ChangeRequest)
class ChangeRequestAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "project",
        "change_type",
        "priority",
        "status",
        "requested_by",
        "requested_date",
        "reviewed_by",
    )
    list_filter = (
        "project__company",
        "change_type",
        "priority",
        "status",
        "requested_date",
        "reviewed_date",
    )
    search_fields = (
        "title",
        "description",
        "project__name",
        "requested_by__email",
        "reviewed_by__email",
    )
    readonly_fields = ("requested_date", "created_at", "updated_at")

    fieldsets = (
        ("Basic Information", {
            "fields": ("project", "title", "description", "change_type", "priority")
        }),
        ("Status & Workflow", {
            "fields": ("status", "approval_stage")
        }),
        ("Impact Assessment", {
            "fields": ("impact_description", "cost_impact", "timeline_impact_days")
        }),
        ("Request Information", {
            "fields": ("requested_by", "requested_date")
        }),
        ("Review Information", {
            "fields": ("reviewed_by", "reviewed_date", "review_comments")
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )

    def get_readonly_fields(self, request, obj=None):
        readonly = list(self.readonly_fields)
        if obj:  # Editing existing object
            # Make request fields readonly when editing
            readonly.extend(["requested_by", "project"])
        return readonly