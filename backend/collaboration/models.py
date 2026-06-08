"""In-project collaboration: comments (task + project discussion) and 1-on-1
direct messages. Mentions + new messages raise notifications (the bell).
"""
from django.conf import settings
from django.db import models


class Comment(models.Model):
    """A comment. One model powers two surfaces:
      - task=<id>      -> the discussion thread on a specific task
      - task=null      -> the project-level discussion board
    `parent` allows one level of replies.
    """
    project = models.ForeignKey(
        "projects.Project", on_delete=models.CASCADE, related_name="comments"
    )
    task = models.ForeignKey(
        "projects.Task", on_delete=models.CASCADE, null=True, blank=True,
        related_name="comments",
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="+"
    )
    parent = models.ForeignKey(
        "self", on_delete=models.CASCADE, null=True, blank=True, related_name="replies"
    )
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    edited_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["created_at"]
        indexes = [
            models.Index(fields=["project", "task", "created_at"], name="collab_comment_scope_idx"),
        ]


class DirectMessage(models.Model):
    """A 1-on-1 message between two platform users (not project-bound)."""
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sent_messages"
    )
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="received_messages"
    )
    body = models.TextField()
    read = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["created_at"]
        indexes = [
            models.Index(fields=["recipient", "read"], name="collab_dm_recipient_idx"),
        ]
