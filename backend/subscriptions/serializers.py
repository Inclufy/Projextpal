from rest_framework import serializers
from .models import SubscriptionPlan, CompanySubscription
from django.contrib.auth import get_user_model

User = get_user_model()


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    """
    Serializer for SubscriptionPlan model
    """

    monthly_equivalent_price = serializers.ReadOnlyField()
    savings_percentage = serializers.ReadOnlyField()

    class Meta:
        model = SubscriptionPlan
        fields = [
            "id",
            "name",
            "plan_type",
            "plan_level",
            "price",
            "stripe_price_id",
            "stripe_product_id",
            "features",
            "is_active",
            "is_popular",
            "max_projects",
            "max_users",
            "storage_limit_gb",
            "priority_support",
            "advanced_analytics",
            "custom_integrations",
            "monthly_equivalent_price",
            "savings_percentage",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class SubscriptionPlanListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for listing subscription plans (public API)
    """

    monthly_equivalent_price = serializers.ReadOnlyField()
    savings_percentage = serializers.ReadOnlyField()

    class Meta:
        model = SubscriptionPlan
        fields = [
            "id",
            "name",
            "plan_type",
            "plan_level",
            "price",
            "features",
            "is_popular",
            "max_projects",
            "max_users",
            "storage_limit_gb",
            "priority_support",
            "advanced_analytics",
            "custom_integrations",
            "monthly_equivalent_price",
            "savings_percentage",
        ]


class StripeCheckoutSerializer(serializers.Serializer):
    """
    Serializer for creating Stripe checkout session
    """

    plan_id = serializers.IntegerField()
    success_url = serializers.URLField()
    cancel_url = serializers.URLField()

    def validate_plan_id(self, value):
        try:
            plan = SubscriptionPlan.objects.get(id=value, is_active=True)
            return value
        except SubscriptionPlan.DoesNotExist:
            raise serializers.ValidationError("Invalid or inactive subscription plan")


class CompanySubscriptionSerializer(serializers.ModelSerializer):
    """
    Serializer for CompanySubscription model
    """

    plan = SubscriptionPlanListSerializer(read_only=True)
    plan_id = serializers.IntegerField(write_only=True)
    company_name = serializers.CharField(source="company.name", read_only=True)
    purchased_by_email = serializers.CharField(
        source="purchased_by.email", read_only=True
    )
    purchased_by_name = serializers.SerializerMethodField()

    class Meta:
        model = CompanySubscription
        fields = [
            "id",
            "company",
            "company_name",
            "plan",
            "plan_id",
            "purchased_by",
            "purchased_by_email",
            "purchased_by_name",
            "stripe_subscription_id",
            "stripe_customer_id",
            "status",
            "current_period_start",
            "current_period_end",
            "cancel_at_period_end",
            "canceled_at",
            "trial_start",
            "trial_end",
            "is_active",
            "is_canceled",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "company",
            "stripe_subscription_id",
            "stripe_customer_id",
            "status",
            "current_period_start",
            "current_period_end",
            "canceled_at",
            "trial_start",
            "trial_end",
            "created_at",
            "updated_at",
        ]

    def get_purchased_by_name(self, obj):
        if obj.purchased_by:
            return (
                f"{obj.purchased_by.first_name} {obj.purchased_by.last_name}".strip()
                or obj.purchased_by.username
            )
        return None


class SubscriptionUpgradeSerializer(serializers.Serializer):
    """
    Serializer for upgrading subscription plan
    """

    new_plan_id = serializers.IntegerField()

    def validate_new_plan_id(self, value):
        try:
            plan = SubscriptionPlan.objects.get(id=value, is_active=True)
            return value
        except SubscriptionPlan.DoesNotExist:
            raise serializers.ValidationError("Invalid or inactive subscription plan")


class SubscriptionCancelSerializer(serializers.Serializer):
    """
    Serializer for canceling subscription
    """

    cancel_immediately = serializers.BooleanField(default=False)


class StripeCustomerSerializer(serializers.Serializer):
    """
    Serializer for creating Stripe customer
    """

    email = serializers.EmailField()
    name = serializers.CharField(max_length=255)
    company_name = serializers.CharField(max_length=255)
