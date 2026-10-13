from django.contrib import admin

from .models import AIContextAccessLog


@admin.register(AIContextAccessLog)
class AIContextAccessLogAdmin(admin.ModelAdmin):
    list_display = (
        "created_at", "company", "context_type", "context_id",
        "user", "surface", "chars_used",
    )
    list_filter = ("context_type", "surface", "company")
    search_fields = ("context_id", "surface", "user__email", "company__name")
    date_hierarchy = "created_at"
    readonly_fields = (
        "company", "context_type", "context_id", "user",
        "surface", "chars_used", "created_at",
    )

    def has_add_permission(self, request):
        # Audit log is write-once from the helper; no manual adds.
        return False

    def has_change_permission(self, request, obj=None):
        return False
