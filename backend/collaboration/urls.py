from rest_framework.routers import DefaultRouter

from .views import CommentViewSet, DirectMessageViewSet

router = DefaultRouter()
router.register(r"comments", CommentViewSet, basename="comment")
router.register(r"messages", DirectMessageViewSet, basename="direct-message")

urlpatterns = router.urls
