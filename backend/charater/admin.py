from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html, format_html_join
from .models import (
    ProgramCharter,
    ScopeCapability,
    CriticalInterdependency,
    KeyRisk,
    KeyDeliverable,
    Resource,
    Dependency,
)


class ScopeCapabilityInline(admin.TabularInline):
    model = ScopeCapability
    extra = 1


class CriticalInterdependencyInline(admin.TabularInline):
    model = CriticalInterdependency
    extra = 1


class KeyRiskInline(admin.TabularInline):
    model = KeyRisk
    extra = 1


class KeyDeliverableInline(admin.TabularInline):
    model = KeyDeliverable
    extra = 1


class ResourceInline(admin.TabularInline):
    model = Resource
    extra = 1


@admin.register(ProgramCharter)
class ProgramCharterAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "project",
        "version",
        "project_manager",
        "project_orchestrator",
        "created_at",
        "version_links",
    ]
    list_filter = ["project", "version", "created_at", "project_manager"]
    search_fields = ["name", "description", "project__name"]
    readonly_fields = ["version", "created_at", "version_info"]

    fieldsets = (
        (
            "Basic Information",
            {"fields": ("project", "name", "description", "version_info")},
        ),
        (
            "Project Details",
            {"fields": ("project_orchestrator", "project_manager", "goal_objective")},
        ),
        ("Metadata", {"fields": ("version", "created_at"), "classes": ("collapse",)}),
    )

    inlines = [
        ScopeCapabilityInline,
        CriticalInterdependencyInline,
        KeyRiskInline,
        KeyDeliverableInline,
        ResourceInline,
    ]

    actions = ["create_new_versions"]

    def version_links(self, obj):
        """Show links to all versions of this charter"""
        if obj.project:
            all_versions = ProgramCharter.objects.filter(project=obj.project).order_by(
                "-version"
            )

            parts = []
            for charter in all_versions[:5]:  # Show max 5 versions
                if charter.pk == obj.pk:
                    parts.append(format_html("<strong>v{}</strong>", charter.version))
                else:
                    url = reverse(
                        "admin:charater_programcharter_change", args=[charter.pk]
                    )
                    parts.append(
                        format_html('<a href="{}">v{}</a>', url, charter.version)
                    )

            if all_versions.count() > 5:
                parts.append(format_html("..."))

            return format_html_join(" | ", "{}", ((p,) for p in parts))
        return "-"

    version_links.short_description = "All Versions"

    def version_info(self, obj):
        """Show version information and related stats"""
        if obj.pk:
            counts = ", ".join(
                [
                    f"Scopes: {obj.scopes.count()}",
                    f"Risks: {obj.risks.count()}",
                    f"Deliverables: {obj.deliverables.count()}",
                    f"Resources: {obj.resources.count()}",
                    f"Interdependencies: {obj.interdependencies.count()}",
                ]
            )
            return format_html(
                "<strong>Version:</strong> {}<br>"
                "<strong>Created:</strong> {}<br>"
                "<strong>Related Objects:</strong> {}",
                obj.version,
                obj.created_at.strftime("%Y-%m-%d %H:%M"),
                counts,
            )
        return "Save to see version info"

    version_info.short_description = "Version Information"

    def create_new_versions(self, request, queryset):
        """Admin action to create new versions of selected charters"""
        created_count = 0
        for charter in queryset:
            try:
                charter.create_new_version()
                created_count += 1
            except Exception as e:
                self.message_user(
                    request,
                    f"Failed to create version for {charter}: {str(e)}",
                    level="ERROR",
                )

        if created_count:
            self.message_user(
                request, f"Successfully created {created_count} new version(s)."
            )

    create_new_versions.short_description = "Create new versions of selected charters"

    def save_model(self, request, obj, form, change):
        """Override save to handle versioning in admin"""
        if change:
            # If editing existing charter, you might want to create new version
            # For now, we'll save normally. Add logic here if needed.
            pass
        super().save_model(request, obj, form, change)


@admin.register(ScopeCapability)
class ScopeCapabilityAdmin(admin.ModelAdmin):
    list_display = ["charter", "capabilities", "end_game", "created_at"]
    list_filter = ["charter__project", "charter__version", "created_at"]
    search_fields = ["capabilities", "description", "end_game"]
    raw_id_fields = ["charter"]


@admin.register(CriticalInterdependency)
class CriticalInterdependencyAdmin(admin.ModelAdmin):
    list_display = ["charter", "item", "description_preview"]
    search_fields = ["item", "description"]
    raw_id_fields = ["charter"]

    def description_preview(self, obj):
        return (
            obj.description[:50] + "..."
            if len(obj.description) > 50
            else obj.description
        )

    description_preview.short_description = "Description"


@admin.register(KeyRisk)
class KeyRiskAdmin(admin.ModelAdmin):
    list_display = ["charter", "risk", "description_preview"]
    list_filter = ["charter__project", "charter__version"]
    search_fields = ["risk", "description"]
    raw_id_fields = ["charter"]

    def description_preview(self, obj):
        return (
            obj.description[:50] + "..."
            if len(obj.description) > 50
            else obj.description
        )

    description_preview.short_description = "Description"


@admin.register(KeyDeliverable)
class KeyDeliverableAdmin(admin.ModelAdmin):
    list_display = ["charter", "deliverable", "date", "description_preview"]
    list_filter = ["charter__project", "charter__version", "date"]
    search_fields = ["deliverable", "description"]
    raw_id_fields = ["charter"]
    date_hierarchy = "date"

    def description_preview(self, obj):
        return (
            obj.description[:50] + "..."
            if len(obj.description) > 50
            else obj.description
        )

    description_preview.short_description = "Description"


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ["charter", "name", "role", "required", "fte", "created_at"]
    list_filter = [
        "charter__project",
        "charter__version",
        "role",
        "required",
        "created_at",
    ]
    search_fields = ["name", "role"]
    raw_id_fields = ["charter"]


@admin.register(Dependency)
class DependencyAdmin(admin.ModelAdmin):
    list_display = ("name", "project", "type", "status")
    list_filter = ("project", "type", "status")
    search_fields = ("name", "description", "project__name")
    raw_id_fields = ["project"]
