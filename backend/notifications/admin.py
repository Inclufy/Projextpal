from django.contrib import admin

from .models import Notification, NotificationPreference


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("id", "recipient", "kind", "title", "is_read", "email_sent", "created_at")
    list_filter = ("kind", "is_read", "email_sent")
    search_fields = ("recipient__email", "title")
    readonly_fields = ("created_at", "read_at", "email_sent_at")


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = ("user", "in_app_enabled", "email_enabled", "updated_at")
    search_fields = ("user__email",)
