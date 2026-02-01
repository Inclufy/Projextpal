from django.urls import path
from . import views, webhooks
from .checkout_views import create_checkout_session as checkout_create, checkout_success, get_plans as checkout_plans

app_name = "subscriptions"

urlpatterns = [
    # Public API endpoints
    path("plans/", views.SubscriptionPlanListView.as_view(), name="plan-list"),
    path("plans/<int:pk>/", views.SubscriptionPlanDetailView.as_view(), name="plan-detail"),
    path("plans/by-type/", views.get_plans_by_type, name="plans-by-type"),
    path("plans/public/", checkout_plans, name="plans-public"),
    path("health/", views.health_check, name="health-check"),
    
    # Checkout endpoints
    path("checkout/", views.create_checkout_session, name="create-checkout"),
    path("checkout/create-session/", checkout_create, name="create-checkout-session"),
    path("checkout/success/", checkout_success, name="checkout-success"),
    
    # Billing portal
    path("billing-portal/", views.create_billing_portal_session, name="create-billing-portal"),
    path("invoice/retry/", views.retry_latest_invoice, name="retry-invoice"),
    
    # Subscription management (authenticated)
    path("subscription/", views.CompanySubscriptionView.as_view(), name="company-subscription"),
    path("subscription/upgrade/", views.upgrade_subscription, name="upgrade-subscription"),
    path("subscription/cancel/", views.cancel_subscription, name="cancel-subscription"),
    path("subscription/reactivate/", views.reactivate_subscription, name="reactivate-subscription"),
    
    # Webhook endpoints
    path("webhooks/stripe/", webhooks.stripe_webhook, name="stripe-webhook"),
]
