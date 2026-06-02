from django.core.management.base import BaseCommand
from django.conf import settings
import stripe

stripe.api_key = settings.STRIPE_SECRET_KEY


class Command(BaseCommand):
    help = 'Create Stripe products and prices for subscription plans'

    def handle(self, *args, **options):
        # CANONICAL PRICING — 4 per-user tiers, in lock-step with:
        #   - frontend/src/pages/Pricing.tsx (public projextpal.com)
        #   - backend/subscriptions/pricing_catalog_view.py (Finance offerte)
        #   - inclufy-finance product_catalog_inclufy_ecosystem.sql seed
        # Yearly price = monthly × 12 × 0.9 (10% annual discount, matches
        # the "Bespaar 10%" badge on the public pricing page).
        # Ratios: Pro/Starter = 1.96×, Biz/Pro = 1.61×, Ent/Biz = 1.52×
        plans = [
            {
                'name': 'Starter',
                'description': 'Per user / month. Web + mobile, all methodologies, time tracking.',
                'monthly_price': 2500,    # €25/user/mo
                'yearly_price': 27000,    # €25 × 12 × 0.9 = €270/yr/user
                'level': 'starter',
            },
            {
                'name': 'Professional',
                'description': 'Per user / month. + advanced governance, document generation, AI Meeting Minutes, Gantt.',
                'monthly_price': 4900,    # €49/user/mo
                'yearly_price': 52920,    # €49 × 12 × 0.9 = €529.20/yr/user
                'level': 'professional',
            },
            {
                'name': 'Business',
                'description': 'Per user / month. + portfolio management, multi-workspace, resource planning, integrations.',
                'monthly_price': 7900,    # €79/user/mo
                'yearly_price': 85320,    # €79 × 12 × 0.9 = €853.20/yr/user
                'level': 'business',
            },
            {
                'name': 'Enterprise',
                'description': 'Per user / month. + BYO AI, encryption, audit trail, SSO/SAML, SLA 99.9%, dedicated manager.',
                'monthly_price': 12000,   # €120/user/mo
                'yearly_price': 129600,   # €120 × 12 × 0.9 = €1296/yr/user
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
