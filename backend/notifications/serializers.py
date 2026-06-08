from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    actor_name = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            "id", "kind", "title", "body", "url", "read",
            "actor", "actor_name", "created_at",
        ]
        read_only_fields = fields

    def get_actor_name(self, obj):
        u = obj.actor
        if not u:
            return None
        full = (getattr(u, "get_full_name", lambda: "")() or "").strip()
        return full or getattr(u, "email", None)
