from rest_framework import viewsets, mixins
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(mixins.ListModelMixin,
                          mixins.RetrieveModelMixin,
                          viewsets.GenericViewSet):
    """Read + mark-read for the current user's own notifications.

    Strictly recipient-scoped — a user never sees another user's notifications.
    """
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        if request.query_params.get("unread") in ("1", "true", "True"):
            qs = qs.filter(read=False)
        try:
            limit = min(100, max(1, int(request.query_params.get("limit") or 30)))
        except (TypeError, ValueError):
            limit = 30
        data = NotificationSerializer(qs[:limit], many=True).data
        return Response({
            "results": data,
            "unread": self.get_queryset().filter(read=False).count(),
        })

    @action(detail=False, methods=["get"])
    def unread_count(self, request):
        return Response({"count": self.get_queryset().filter(read=False).count()})

    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):
        n = self.get_object()
        if not n.read:
            n.read = True
            n.save(update_fields=["read"])
        return Response({"ok": True, "unread": self.get_queryset().filter(read=False).count()})

    @action(detail=False, methods=["post"])
    def mark_all_read(self, request):
        updated = self.get_queryset().filter(read=False).update(read=True)
        return Response({"ok": True, "marked": updated, "unread": 0})
