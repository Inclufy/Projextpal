from rest_framework.routers import DefaultRouter

from .views import IntegrationViewSet, CrmKeyViewSet, WebhookViewSet

router = DefaultRouter()
router.register('integrations', IntegrationViewSet, basename='admin-integrations')
router.register('crm-keys', CrmKeyViewSet, basename='admin-crm-keys')
router.register('webhooks', WebhookViewSet, basename='admin-webhooks')

urlpatterns = router.urls
