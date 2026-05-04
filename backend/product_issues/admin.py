from django.contrib import admin

from .models import ProductIssue, ProductIssueComment


@admin.register(ProductIssue)
class ProductIssueAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "company",
        "source",
        "category",
        "classification",
        "priority",
        "status",
        "reproduction_result",
        "created_at",
    )
    list_filter = (
        "source",
        "category",
        "classification",
        "priority",
        "severity",
        "status",
        "reproduction_result",
        "company",
    )
    search_fields = ("title", "description", "error_trace")
    readonly_fields = ("created_at", "updated_at")
    raw_id_fields = ("reporter", "assigned_to", "duplicate_of", "project")
    filter_horizontal = ("attachments", "reproduction_evidence")
    fieldsets = (
        ("Wie + waar", {
            "fields": ("reporter", "company", "project", "source", "capture_method"),
        }),
        ("Wat", {
            "fields": (
                "title",
                "description",
                "category",
                "reproduction_steps",
                "expected_behavior",
                "actual_behavior",
                "error_trace",
                "environment",
                "attachments",
            ),
        }),
        ("Triage", {
            "fields": (
                "classification",
                "severity",
                "priority",
                "agent_triage_result",
                "triaged_at",
                "triaged_by",
                "duplicate_of",
            ),
        }),
        ("Reproductie", {
            "fields": (
                "reproduction_attempted_at",
                "reproduction_result",
                "reproduction_log",
                "reproduction_evidence",
            ),
        }),
        ("Lifecycle", {
            "fields": (
                "status",
                "assigned_to",
                "linked_pr_url",
                "resolved_at",
                "resolution_summary",
            ),
        }),
        ("Meta", {"fields": ("created_at", "updated_at")}),
    )


@admin.register(ProductIssueComment)
class ProductIssueCommentAdmin(admin.ModelAdmin):
    list_display = ("id", "issue", "author", "is_triage_step", "created_at")
    list_filter = ("is_triage_step",)
    search_fields = ("body",)
    raw_id_fields = ("issue",)
