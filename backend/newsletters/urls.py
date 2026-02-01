from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    NewsletterViewSet, 
    NewsletterTemplateViewSet,
    MailingListViewSet,
    ExternalSubscriberViewSet,
    GlobalNewsletterViewSet
)

router = DefaultRouter()
router.register(r"newsletters", NewsletterViewSet)
router.register(r"templates", NewsletterTemplateViewSet)
router.register(r"mailing-lists", MailingListViewSet)
router.register(r"subscribers", ExternalSubscriberViewSet)
router.register(r"global-newsletters", GlobalNewsletterViewSet, basename="global-newsletter")

urlpatterns = [
    path("", include(router.urls)),
]
