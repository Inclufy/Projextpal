from django.contrib import admin
from .models import Newsletter, NewsletterTemplate


@admin.register(Newsletter)
class NewsletterAdmin(admin.ModelAdmin):
    list_display = [
        "subject",
        "project",
        "recipient_type",
        "status",
        "created_by",
        "created_at",
        "sent_at",
    ]
    list_filter = [
        "status",
        "recipient_type",
        "created_at",
        "sent_at",
    ]
    search_fields = [
        "subject",
        "project__name",
        "created_by__email",
    ]
    readonly_fields = ["created_at", "updated_at", "sent_at"]
    raw_id_fields = ["project", "created_by"]
    filter_horizontal = ["custom_recipients"]


@admin.register(NewsletterTemplate)
class NewsletterTemplateAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "is_default",
        "created_by",
        "created_at",
    ]
    list_filter = [
        "is_default",
        "created_at",
    ]
    search_fields = [
        "name",
        "subject_template",
    ]
    readonly_fields = ["created_at", "updated_at"]
    raw_id_fields = ["created_by"]
