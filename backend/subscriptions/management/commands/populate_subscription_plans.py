from django.core.management.base import BaseCommand
from subscriptions.models import SubscriptionPlan


class Command(BaseCommand):
    help = "Populate subscription plans based on frontend pricing structure"

    def handle(self, *args, **options):
        # Clear existing plans
        SubscriptionPlan.objects.all().delete()
        self.stdout.write("Cleared existing subscription plans")

        # Monthly Plans
        monthly_plans_data = [
            {
                "name": "BASIC",
                "plan_type": "monthly",
                "plan_level": "basic",
                "price": 25.00,
                "stripe_price_id": "price_1QqqvsCAnRMtaBQiDErxGu9M",  # Replace with actual Stripe price ID
                "features": [
                    "All UI Components",
                    "Use with Unlimited Projects",
                    "Basic Support",
                    "Up to 5 Projects",
                    "Standard Analytics",
                    "Email Support",
                ],
                "max_projects": 5,
                "max_users": 1,
                "storage_limit_gb": 10,
                "priority_support": False,
                "advanced_analytics": False,
                "custom_integrations": False,
            },
            {
                "name": "PROFESSIONAL",
                "plan_type": "monthly",
                "plan_level": "premium",
                "price": 79.00,
                "stripe_price_id": "price_1S93bSCAnRMtaBQiAMBfI03e",  # Replace with actual Stripe price ID
                "features": [
                    "All UI Components",
                    "Use with Unlimited Projects",
                    "Priority Support",
                    "Up to 25 Projects",
                    "Advanced Analytics",
                    "Phone Support",
                ],
                "max_projects": 25,
                "max_users": 5,
                "storage_limit_gb": 50,
                "priority_support": True,
                "advanced_analytics": True,
                "custom_integrations": False,
            },
            {
                "name": "PREMIUM",
                "plan_type": "monthly",
                "plan_level": "premium",
                "price": 99.00,
                "stripe_price_id": "price_premium_monthly_placeholder",  # Replace with actual Stripe price ID
                "features": [
                    "All UI Components",
                    "Use with Unlimited Projects",
                    "24/7 Premium Support",
                    "Unlimited Projects",
                    "Advanced Analytics",
                    "Custom Integrations",
                ],
                "max_projects": None,  # Unlimited
                "max_users": 10,
                "storage_limit_gb": 100,
                "priority_support": True,
                "advanced_analytics": True,
                "custom_integrations": True,
            },
        ]

        # Yearly Plans
        yearly_plans_data = [
            {
                "name": "STARTER",
                "plan_type": "yearly",
                "plan_level": "starter",
                "price": 599.00,
                "stripe_price_id": "price_1S93cXCAnRMtaBQi17N7mb87",  # Replace with actual Stripe price ID
                "features": [
                    "All UI Components",
                    "Use with Unlimited Projects",
                    "Priority Support",
                    "Up to 10 Projects",
                    "Standard Analytics",
                    "Email Support",
                ],
                "max_projects": 10,
                "max_users": 2,
                "storage_limit_gb": 25,
                "priority_support": True,
                "advanced_analytics": False,
                "custom_integrations": False,
                "is_popular": True,  # Mark as popular
            },
            {
                "name": "BUSINESS",
                "plan_type": "yearly",
                "plan_level": "business",
                "price": 699.00,
                "stripe_price_id": "price_business_yearly_placeholder",  # Replace with actual Stripe price ID
                "features": [
                    "All UI Components",
                    "Use with Unlimited Projects",
                    "Priority Support",
                    "Advanced Analytics",
                    "Up to 50 Projects",
                    "Phone Support",
                ],
                "max_projects": 50,
                "max_users": 10,
                "storage_limit_gb": 100,
                "priority_support": True,
                "advanced_analytics": True,
                "custom_integrations": False,
            },
            {
                "name": "ENTERPRISE",
                "plan_type": "yearly",
                "plan_level": "enterprise",
                "price": 899.00,
                "stripe_price_id": "price_enterprise_yearly_placeholder",  # Replace with actual Stripe price ID
                "features": [
                    "All UI Components",
                    "Use with Unlimited Projects",
                    "24/7 Premium Support",
                    "Advanced Analytics",
                    "Custom Integrations",
                    "Dedicated Account Manager",
                ],
                "max_projects": None,  # Unlimited
                "max_users": None,  # Unlimited
                "storage_limit_gb": None,  # Unlimited
                "priority_support": True,
                "advanced_analytics": True,
                "custom_integrations": True,
            },
        ]

        # Create monthly plans
        for plan_data in monthly_plans_data:
            plan = SubscriptionPlan.objects.create(**plan_data)
            self.stdout.write(f"Created monthly plan: {plan.name} - ${plan.price}")

        # Create yearly plans
        for plan_data in yearly_plans_data:
            plan = SubscriptionPlan.objects.create(**plan_data)
            self.stdout.write(f"Created yearly plan: {plan.name} - ${plan.price}")

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully created {SubscriptionPlan.objects.count()} subscription plans"
            )
        )

        # Display savings information
        self.stdout.write("\nYearly Plan Savings:")
        for plan in SubscriptionPlan.objects.filter(plan_type="yearly"):
            savings = plan.savings_percentage
            if savings > 0:
                self.stdout.write(
                    f"{plan.name}: {savings}% savings compared to monthly equivalent"
                )
