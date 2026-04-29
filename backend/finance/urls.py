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

router = DefaultRouter()
router.register(r"vendors", VendorViewSet, basename="finance-vendor")
router.register(r"invoices", InvoiceViewSet, basename="finance-invoice")
router.register(r"line-items", InvoiceLineItemViewSet, basename="finance-line-item")
router.register(r"payments", InvoicePaymentViewSet, basename="finance-payment")

urlpatterns = [
    path("", include(router.urls)),
    path("projects/<int:project_id>/cost-summary/", project_cost_summary, name="finance-project-cost-summary"),
    path("programs/<int:program_id>/cost-summary/", program_cost_summary, name="finance-program-cost-summary"),
]
