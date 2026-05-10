from rest_framework import serializers

from .models import Notification, NotificationPreference


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            "id",
            "kind",
            "title",
            "body",
            "target_url",
            "payload",
            "is_read",
            "read_at",
            "created_at",
        ]
        read_only_fields = ["id", "kind", "title", "body", "target_url", "payload", "created_at", "read_at"]


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = [
            "in_app_enabled",
            "email_enabled",
            "email_task_assigned",
            "email_comment_mention",
            "email_project_member_added",
            "email_deadline_approaching",
            "updated_at",
        ]
        read_only_fields = ["updated_at"]
