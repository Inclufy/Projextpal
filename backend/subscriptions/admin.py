from django.contrib import admin
from .models import SubscriptionPlan, CompanySubscription


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "plan_type",
        "plan_level",
        "price",
        "is_active",
        "created_at",
    ]
    list_filter = ["plan_type", "plan_level", "is_active", "created_at"]
    search_fields = ["name", "stripe_price_id"]
    readonly_fields = ["created_at", "updated_at"]
    ordering = ["-created_at"]

    fieldsets = (
        (
            "Basic Information",
            {"fields": ("name", "plan_type", "plan_level")},
        ),
        ("Pricing", {"fields": ("price", "is_active")}),
        (
            "Stripe Integration",
            {
                "fields": ("stripe_price_id", "stripe_product_id"),
                "classes": ("collapse",),
            },
        ),
        (
            "Plan Features",
            {
                "fields": ("features",),
                "classes": ("collapse",),
            },
        ),
        (
            "Plan Limits",
            {
                "fields": (
                    "max_projects",
                    "max_users",
                    "storage_limit_gb",
                    "priority_support",
                    "advanced_analytics",
                    "custom_integrations",
                ),
                "classes": ("collapse",),
            },
        ),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )


@admin.register(CompanySubscription)
class CompanySubscriptionAdmin(admin.ModelAdmin):
    list_display = [
        "company",
        "plan",
        "status",
        "purchased_by",
        "current_period_end",
        "cancel_at_period_end",
        "created_at",
    ]
    list_filter = [
        "status",
        "cancel_at_period_end",
        "plan__plan_type",
        "plan__plan_level",
        "created_at",
    ]
    search_fields = [
        "company__name",
        "purchased_by__email",
        "purchased_by__first_name",
        "purchased_by__last_name",
        "stripe_subscription_id",
    ]
    readonly_fields = [
        "stripe_subscription_id",
        "stripe_customer_id",
        "created_at",
        "updated_at",
    ]
    ordering = ["-created_at"]

    fieldsets = (
        (
            "Subscription Details",
            {"fields": ("company", "plan", "purchased_by", "status")},
        ),
        ("Billing Period", {"fields": ("current_period_start", "current_period_end")}),
        ("Cancellation", {"fields": ("cancel_at_period_end", "canceled_at")}),
        (
            "Trial Information",
            {"fields": ("trial_start", "trial_end"), "classes": ("collapse",)},
        ),
        (
            "Stripe Integration",
            {
                "fields": ("stripe_subscription_id", "stripe_customer_id"),
                "classes": ("collapse",),
            },
        ),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related("company", "plan", "purchased_by")
        )
