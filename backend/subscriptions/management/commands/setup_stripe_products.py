from django.core.management.base import BaseCommand
from django.conf import settings
import stripe

stripe.api_key = settings.STRIPE_SECRET_KEY


class Command(BaseCommand):
    help = 'Create Stripe products and prices for subscription plans'

    def handle(self, *args, **options):
        # CANONICAL PRICING — 3 per-user tiers, in lock-step with:
        #   - frontend/src/pages/Pricing.tsx (public projextpal.com)
        #   - backend/subscriptions/pricing_catalog_view.py (Finance offerte)
        #   - inclufy-finance product_catalog_inclufy_ecosystem.sql seed
        # Yearly price = monthly × 12 × 0.9 (10% annual discount, matches
        # the "Bespaar 10%" badge on the public pricing page).
        plans = [
            {
                'name': 'Starter',
                'description': 'Per user / month. Web + mobile, basic methodologies.',
                'monthly_price': 1900,    # €19/user/mo
                'yearly_price': 20520,    # €19 × 12 × 0.9 = €205.20/yr/user
                'level': 'starter',
            },
            {
                'name': 'Professional',
                'description': 'Per user / month. + 6-role governance, AI Meeting Minutes, DOCX/PPTX, Gantt.',
                'monthly_price': 3900,    # €39/user/mo
                'yearly_price': 42120,    # €39 × 12 × 0.9 = €421.20/yr/user
                'level': 'professional',
            },
            {
                'name': 'Enterprise',
                'description': 'Per user / month. + BYO LLM, Fernet, audit log, e-sig, TOTP, SLA 99.9%.',
                'monthly_price': 7900,    # €79/user/mo
                'yearly_price': 85320,    # €79 × 12 × 0.9 = €853.20/yr/user
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
