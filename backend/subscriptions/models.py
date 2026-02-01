from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal
from django.contrib.auth import get_user_model

User = get_user_model()


class SubscriptionPlan(models.Model):
    """
    Model to store subscription plans with Stripe integration
    """

    PLAN_TYPES = [
        ("monthly", "Monthly"),
        ("yearly", "Yearly"),
    ]

    PLAN_LEVELS = [
        ("basic", "Basic"),
        ("starter", "Starter"),
        ("business", "Business"),
        ("premium", "Premium"),
        ("enterprise", "Enterprise"),
    ]

    name = models.CharField(max_length=100, help_text="Display name for the plan")
    plan_type = models.CharField(
        max_length=10, choices=PLAN_TYPES, help_text="Monthly or Yearly billing"
    )
    plan_level = models.CharField(
        max_length=20, choices=PLAN_LEVELS, help_text="Plan tier/level"
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
        help_text="Price in USD",
    )
    stripe_price_id = models.CharField(
        max_length=200, unique=True, help_text="Stripe Price ID for checkout"
    )
    stripe_product_id = models.CharField(
        max_length=200, blank=True, null=True, help_text="Stripe Product ID"
    )
    features = models.JSONField(
        default=list, help_text="List of features included in this plan"
    )
    is_active = models.BooleanField(
        default=True, help_text="Whether this plan is available for purchase"
    )
    is_popular = models.BooleanField(
        default=False, help_text="Mark as popular/recommended plan"
    )
    max_projects = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Maximum number of projects allowed (null = unlimited)",
    )
    max_users = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Maximum number of users allowed (null = unlimited)",
    )
    storage_limit_gb = models.PositiveIntegerField(
        null=True, blank=True, help_text="Storage limit in GB (null = unlimited)"
    )
    priority_support = models.BooleanField(
        default=False, help_text="Includes priority support"
    )
    advanced_analytics = models.BooleanField(
        default=False, help_text="Includes advanced analytics"
    )
    custom_integrations = models.BooleanField(
        default=False, help_text="Includes custom integrations"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["plan_type", "price"]
        unique_together = ["name", "plan_type"]

    def __str__(self):
        return f"{self.name} ({self.plan_type.title()}) - ${self.price}"

    @property
    def monthly_equivalent_price(self):
        """Calculate monthly equivalent price for yearly plans"""
        if self.plan_type == "yearly":
            return self.price / 12
        return self.price

    @property
    def savings_percentage(self):
        """Calculate savings percentage for yearly plans compared to monthly"""
        if self.plan_type == "yearly":
            # Find equivalent monthly plan
            monthly_plan = SubscriptionPlan.objects.filter(
                plan_level=self.plan_level, plan_type="monthly", is_active=True
            ).first()
            if monthly_plan:
                monthly_total = monthly_plan.price * 12
                savings = ((monthly_total - self.price) / monthly_total) * 100
                return round(savings, 1)
        return 0


class CompanySubscription(models.Model):
    """
    Model to track company-wide subscriptions with Stripe integration
    """

    SUBSCRIPTION_STATUS = [
        ("active", "Active"),
        ("past_due", "Past Due"),
        ("canceled", "Canceled"),
        ("unpaid", "Unpaid"),
        ("incomplete", "Incomplete"),
        ("incomplete_expired", "Incomplete Expired"),
        ("trialing", "Trialing"),
        ("paused", "Paused"),
    ]

    company = models.ForeignKey(
        "accounts.Company", on_delete=models.CASCADE, related_name="subscriptions"
    )
    plan = models.ForeignKey(
        SubscriptionPlan, on_delete=models.CASCADE, related_name="company_subscriptions"
    )
    # User who made the payment/purchased the subscription
    purchased_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="purchased_subscriptions",
    )
    stripe_subscription_id = models.CharField(
        max_length=200, unique=True, null=True, blank=True, help_text="Stripe Subscription ID (optional for invoice)"
    )
    stripe_customer_id = models.CharField(
        max_length=200, null=True, blank=True, help_text="Stripe Customer ID (optional for invoice)"
    )
    status = models.CharField(
        max_length=20, choices=SUBSCRIPTION_STATUS, default="incomplete"
    )
    billing_cycle = models.CharField(
        max_length=20,
        choices=[("monthly", "Monthly"), ("quarterly", "Quarterly"), ("yearly", "Yearly")],
        default="monthly",
        help_text="Billing cycle for this subscription"
    )
    payment_method = models.CharField(
        max_length=20,
        choices=[("stripe", "Stripe"), ("invoice", "Invoice")],
        default="stripe",
        help_text="Payment method for this subscription"
    )
    current_period_start = models.DateTimeField(null=True, blank=True)
    current_period_end = models.DateTimeField(null=True, blank=True)
    cancel_at_period_end = models.BooleanField(default=False)
    canceled_at = models.DateTimeField(null=True, blank=True)
    trial_start = models.DateTimeField(null=True, blank=True)
    trial_end = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        # One active subscription per company
        constraints = [
            models.UniqueConstraint(
                fields=["company"],
                condition=models.Q(status__in=["active", "trialing", "past_due"]),
                name="unique_active_company_subscription",
            )
        ]

    def __str__(self):
        return f"{self.company.name} - {self.plan.name} ({self.status})"

    @property
    def is_active(self):
        """Check if subscription is currently active"""
        return self.status in ["active", "trialing"]

    @property
    def is_canceled(self):
        """Check if subscription is canceled"""
        return self.status == "canceled" or self.cancel_at_period_end

    def cancel_subscription(self):
        """Mark subscription for cancellation at period end"""
        self.cancel_at_period_end = True
        self.save()

    def reactivate_subscription(self):
        """Reactivate a canceled subscription"""
        self.cancel_at_period_end = False
        self.canceled_at = None
        self.save()
