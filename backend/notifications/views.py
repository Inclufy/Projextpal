from rest_framework import viewsets, mixins
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

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


class DeviceRegisterView(APIView):
    """POST /api/v1/auth/devices/register/  body: {token, platform}.
    Upserts the caller's Expo push token so notify() can push to this device.
    Idempotent — re-registering the same token re-points it to the caller."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from .models import DeviceToken
        token = (request.data.get("token") or "").strip()
        platform = (request.data.get("platform") or "ios").strip().lower()
        if not token:
            return Response({"detail": "token required"}, status=400)
        if platform not in {"ios", "android", "web"}:
            platform = "ios"
        DeviceToken.objects.update_or_create(
            token=token,
            defaults={"user": request.user, "platform": platform, "active": True},
        )
        return Response({"ok": True})

    def delete(self, request):
        """Optional de-registration (e.g. on logout)."""
        from .models import DeviceToken
        token = (request.data.get("token") or "").strip()
        if token:
            DeviceToken.objects.filter(token=token, user=request.user).update(active=False)
        return Response({"ok": True})
