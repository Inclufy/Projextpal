from rest_framework import serializers

from .models import Comment, DirectMessage


def _name(u):
    if not u:
        return None
    full = (getattr(u, "get_full_name", lambda: "")() or "").strip()
    return full or getattr(u, "email", None)


class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    author_email = serializers.SerializerMethodField()
    # Frontend's @mention picker passes the resolved user ids to notify.
    mention_user_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False, default=list
    )

    class Meta:
        model = Comment
        fields = [
            "id", "project", "task", "target_type", "target_id", "parent", "body",
            "author", "author_name", "author_email",
            "created_at", "edited_at", "mention_user_ids",
        ]
        read_only_fields = ["author", "created_at", "edited_at"]

    def get_author_name(self, obj):
        return _name(obj.author)

    def get_author_email(self, obj):
        return getattr(obj.author, "email", None)


class DirectMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    recipient_name = serializers.SerializerMethodField()

    class Meta:
        model = DirectMessage
        fields = [
            "id", "sender", "recipient", "body", "read", "created_at",
            "sender_name", "recipient_name",
        ]
        read_only_fields = ["sender", "read", "created_at"]

    def get_sender_name(self, obj):
        return _name(obj.sender)

    def get_recipient_name(self, obj):
        return _name(obj.recipient)
