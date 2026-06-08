from django.contrib.auth import get_user_model
from django.db.models import Q, Max, Count
from rest_framework import viewsets, mixins
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, PermissionDenied

from .models import Comment, DirectMessage
from .serializers import CommentSerializer, DirectMessageSerializer

User = get_user_model()


def _notify(*args, **kwargs):
    # Lazy import so a missing notifications app never breaks collaboration.
    try:
        from notifications.models import notify
        return notify(*args, **kwargs)
    except Exception:
        return None


def _accessible_project_ids(user):
    from projects.views import accessible_project_ids
    return accessible_project_ids(user)


class CommentViewSet(viewsets.ModelViewSet):
    """Comments on a task (?task=) or a project's discussion board (?project=).

    Read/write scoped to projects the user can access. Mentions raise bell
    notifications for the mentioned users.
    """
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        ids = list(_accessible_project_ids(self.request.user))
        qs = Comment.objects.filter(project_id__in=ids).select_related("author")
        task = self.request.query_params.get("task")
        project = self.request.query_params.get("project")
        scope = self.request.query_params.get("scope")  # 'project' -> board only
        target_type = self.request.query_params.get("target_type")
        target_id = self.request.query_params.get("target_id")
        if task:
            qs = qs.filter(task_id=task)
        elif target_type and target_id:
            qs = qs.filter(target_type=target_type, target_id=target_id)
        elif project:
            qs = qs.filter(project_id=project)
            if scope == "project":
                qs = qs.filter(task__isnull=True, target_type="")
        return qs

    def perform_create(self, serializer):
        from projects.models import Project, Task
        user = self.request.user
        mention_ids = serializer.validated_data.pop("mention_user_ids", []) or []
        task = serializer.validated_data.get("task")
        project = serializer.validated_data.get("project")
        if task is not None and project is None:
            project = task.milestone.project
        if project is None:
            raise ValidationError("A comment needs a project or a task.")
        if project.id not in set(_accessible_project_ids(user)):
            raise PermissionDenied("No access to this project.")

        comment = serializer.save(author=user, project=project)

        # Deep-link + notify mentioned users (scoped to the project's company).
        tt = serializer.validated_data.get("target_type") or ""
        if task is not None:
            url = f"/projects/{project.id}/planning/tasks"
        elif tt == "risk":
            url = f"/projects/{project.id}/planning/risks"
        elif tt == "issue":
            url = f"/projects/{project.id}/planning/issues"
        elif tt == "work_package":
            url = f"/projects/{project.id}/prince2/work-packages"
        else:
            url = f"/projects/{project.id}/discussion"
        valid = set(
            User.objects.filter(id__in=mention_ids, company=project.company)
            .values_list("id", flat=True)
        )
        if valid:
            comment.mentioned_users.set(list(valid))
        for uid in valid:
            if uid == user.id:
                continue
            _notify(
                User.objects.filter(id=uid).first(), kind="mention",
                title=f"{(getattr(user,'get_full_name',lambda:'')() or user.email)} mentioned you",
                body=(comment.body[:140]),
                url=url, actor=user, company=project.company,
            )

    @action(detail=False, methods=["get"])
    def counts(self, request):
        """Per-item comment counts + the items where the current user is
        mentioned, so list screens can badge items with discussion/mentions.
        Default keys = task ids; pass ?target_type=risk|issue|work_package to
        key by that register's object ids instead."""
        ids = list(_accessible_project_ids(request.user))
        base = Comment.objects.filter(project_id__in=ids)
        project = request.query_params.get("project")
        if project:
            base = base.filter(project_id=project)
        target_type = request.query_params.get("target_type")
        if target_type:
            base = base.filter(target_type=target_type).exclude(target_id=None)
            counts = {r["target_id"]: r["n"] for r in base.values("target_id").annotate(n=Count("id"))}
            mentioned = list(base.filter(mentioned_users=request.user).values_list("target_id", flat=True).distinct())
        else:
            base = base.filter(task__isnull=False)
            counts = {r["task_id"]: r["n"] for r in base.values("task_id").annotate(n=Count("id"))}
            mentioned = list(base.filter(mentioned_users=request.user).values_list("task_id", flat=True).distinct())
        return Response({"counts": counts, "mentioned_task_ids": mentioned})

    def perform_update(self, serializer):
        if serializer.instance.author_id != getattr(self.request.user, "id", None):
            raise PermissionDenied("Only the author can edit this comment.")
        from django.utils import timezone
        serializer.save(edited_at=timezone.now())

    def perform_destroy(self, instance):
        user = self.request.user
        is_admin = getattr(user, "role", None) in ("admin", "superadmin") or getattr(user, "is_superuser", False)
        if instance.author_id != getattr(user, "id", None) and not is_admin:
            raise PermissionDenied("Only the author or an admin can delete this comment.")
        instance.delete()


class DirectMessageViewSet(mixins.CreateModelMixin,
                           mixins.ListModelMixin,
                           viewsets.GenericViewSet):
    """1-on-1 direct messages. ?with=<user_id> returns that conversation."""
    serializer_class = DirectMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return DirectMessage.objects.filter(Q(sender=user) | Q(recipient=user)).select_related("sender", "recipient")

    def list(self, request, *args, **kwargs):
        user = request.user
        other = request.query_params.get("with")
        if other:
            qs = self.get_queryset().filter(
                Q(sender=user, recipient_id=other) | Q(sender_id=other, recipient=user)
            )
            # opening a conversation marks the other side's messages read
            qs.filter(recipient=user, read=False).update(read=True)
            return Response({"results": DirectMessageSerializer(qs, many=True).data})
        # No ?with -> conversation list (last message per peer + unread count)
        return Response({"conversations": self._conversations(user)})

    def _conversations(self, user):
        convos = {}
        for m in self.get_queryset().order_by("-created_at"):
            peer = m.recipient if m.sender_id == user.id else m.sender
            if peer.id in convos:
                continue
            convos[peer.id] = {
                "peer_id": peer.id,
                "peer_name": (getattr(peer, "get_full_name", lambda: "")() or peer.email),
                "last_message": m.body[:120],
                "last_at": m.created_at.isoformat(),
                "unread": 0,
            }
        unread = (
            self.get_queryset().filter(recipient=user, read=False)
            .values("sender_id").annotate(n=Count("id"))
        )
        for row in unread:
            if row["sender_id"] in convos:
                convos[row["sender_id"]]["unread"] = row["n"]
        return sorted(convos.values(), key=lambda c: c["last_at"], reverse=True)

    def perform_create(self, serializer):
        user = self.request.user
        recipient = serializer.validated_data.get("recipient")
        if recipient is None or recipient.id == user.id:
            raise ValidationError("Pick a valid recipient.")
        msg = serializer.save(sender=user)
        _notify(
            recipient, kind="message",
            title=f"New message from {(getattr(user,'get_full_name',lambda:'')() or user.email)}",
            body=msg.body[:140], url="/messages", actor=user,
            company=getattr(recipient, "company", None),
        )

    @action(detail=False, methods=["get"])
    def unread_count(self, request):
        return Response({"count": self.get_queryset().filter(recipient=request.user, read=False).count()})
