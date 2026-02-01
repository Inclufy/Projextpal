from django.contrib import admin
from .models import WorkflowDiagram, WorkflowNode, WorkflowEdge


class WorkflowNodeInline(admin.TabularInline):
    model = WorkflowNode
    extra = 0
    fields = [
        "node_id",
        "node_type",
        "label",
        "position_x",
        "position_y",
        "color",
        "order_index",
    ]
    readonly_fields = ["created_at", "updated_at"]


class WorkflowEdgeInline(admin.TabularInline):
    model = WorkflowEdge
    extra = 0
    fields = ["edge_id", "source_node_id", "target_node_id", "label", "animated"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(WorkflowDiagram)
class WorkflowDiagramAdmin(admin.ModelAdmin):
    list_display = ["name", "project", "get_company", "created_by", "updated_at"]
    list_filter = ["project__company", "created_at", "updated_at"]
    search_fields = ["name", "project__name", "description"]
    readonly_fields = ["created_at", "updated_at"]
    inlines = [WorkflowNodeInline, WorkflowEdgeInline]

    fieldsets = (
        ("Basic Information", {"fields": ("project", "name", "description")}),
        (
            "Metadata",
            {
                "fields": ("created_by", "created_at", "updated_at"),
                "classes": ("collapse",),
            },
        ),
    )

    def get_company(self, obj):
        return obj.project.company.name if obj.project and obj.project.company else "-"

    get_company.short_description = "Company"
    get_company.admin_order_field = "project__company__name"


@admin.register(WorkflowNode)
class WorkflowNodeAdmin(admin.ModelAdmin):
    list_display = [
        "label",
        "node_type",
        "workflow",
        "position_x",
        "position_y",
        "order_index",
    ]
    list_filter = ["node_type", "workflow__project__company"]
    search_fields = ["label", "node_id", "workflow__name"]
    readonly_fields = ["created_at", "updated_at"]

    fieldsets = (
        (
            "Node Information",
            {"fields": ("workflow", "node_id", "node_type", "label", "order_index")},
        ),
        ("Position", {"fields": ("position_x", "position_y")}),
        ("Styling", {"fields": ("color", "text_color", "font_size")}),
        (
            "Metadata",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )


@admin.register(WorkflowEdge)
class WorkflowEdgeAdmin(admin.ModelAdmin):
    list_display = ["get_edge_display", "workflow", "label", "animated"]
    list_filter = ["animated", "marker_type", "workflow__project__company"]
    search_fields = ["edge_id", "source_node_id", "target_node_id", "label"]
    readonly_fields = ["created_at", "updated_at"]

    fieldsets = (
        (
            "Edge Information",
            {
                "fields": (
                    "workflow",
                    "edge_id",
                    "source_node_id",
                    "target_node_id",
                    "label",
                )
            },
        ),
        ("Handles", {"fields": ("source_handle", "target_handle")}),
        (
            "Styling",
            {
                "fields": (
                    "animated",
                    "stroke_color",
                    "stroke_width",
                    "marker_type",
                    "marker_color",
                )
            },
        ),
        (
            "Metadata",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )

    def get_edge_display(self, obj):
        return f"{obj.source_node_id} → {obj.target_node_id}"

    get_edge_display.short_description = "Connection"
