"""Finance URLs."""
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    InvoiceLineItemViewSet,
    InvoicePaymentViewSet,
    InvoiceViewSet,
    VendorViewSet,
    program_cost_summary,
    project_cost_summary,
)
from .sync_views import (
    inclufy_finance_sync_trigger,
    inclufy_finance_webhook_receive,
)

router = DefaultRouter()
router.register(r"vendors", VendorViewSet, basename="finance-vendor")
router.register(r"invoices", InvoiceViewSet, basename="finance-invoice")
router.register(r"line-items", InvoiceLineItemViewSet, basename="finance-line-item")
router.register(r"payments", InvoicePaymentViewSet, basename="finance-payment")

urlpatterns = [
    path("", include(router.urls)),
    path("projects/<int:project_id>/cost-summary/", project_cost_summary, name="finance-project-cost-summary"),
    path("programs/<int:program_id>/cost-summary/", program_cost_summary, name="finance-program-cost-summary"),
    # Inclufy Finance integration
    path("sync/inclufy/", inclufy_finance_sync_trigger, name="finance-sync-inclufy"),
    path("webhooks/inclufy/", inclufy_finance_webhook_receive, name="finance-webhook-inclufy"),
]
