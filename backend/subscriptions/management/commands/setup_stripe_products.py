from django.core.management.base import BaseCommand
from django.conf import settings
import stripe

stripe.api_key = settings.STRIPE_SECRET_KEY


class Command(BaseCommand):
    help = 'Create Stripe products and prices for subscription plans'

    def handle(self, *args, **options):
        plans = [
            {
                'name': 'Basic',
                'description': 'Perfect for small teams getting started',
                'monthly_price': 2500,
                'yearly_price': 25000,
                'level': 'starter',
            },
            {
                'name': 'Professional',
                'description': 'For growing teams that need more power',
                'monthly_price': 7500,
                'yearly_price': 75000,
                'level': 'professional',
            },
            {
                'name': 'Enterprise',
                'description': 'For large organizations with advanced needs',
                'monthly_price': 20000,
                'yearly_price': 200000,
                'level': 'enterprise',
            },
        ]

        self.stdout.write('\n🚀 Setting up Stripe products...\n')

        for plan in plans:
            self.stdout.write(f"Creating {plan['name']}...")

            try:
                # Create product
                product = stripe.Product.create(
                    name=plan['name'],
                    description=plan['description'],
                )
                self.stdout.write(f"  ✓ Product: {product.id}")

                # Monthly price
                monthly = stripe.Price.create(
                    product=product.id,
                    unit_amount=plan['monthly_price'],
                    currency='eur',
                    recurring={'interval': 'month'},
                )
                self.stdout.write(f"  ✓ Monthly: {monthly.id} (€{plan['monthly_price']/100}/mo)")

                # Yearly price
                yearly = stripe.Price.create(
                    product=product.id,
                    unit_amount=plan['yearly_price'],
                    currency='eur',
                    recurring={'interval': 'year'},
                )
                self.stdout.write(f"  ✓ Yearly: {yearly.id} (€{plan['yearly_price']/100}/yr)\n")

            except Exception as e:
                self.stdout.write(f"  ✗ Error: {e}\n")

        self.stdout.write('\n✅ Done! Copy the Price IDs above to ProjextPal Admin.\n')
