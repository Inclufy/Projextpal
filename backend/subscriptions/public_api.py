# ============================================================
# PUBLIC PLANS API - For Landing Page Pricing Section
# No authentication required
# ============================================================

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from subscriptions.models import SubscriptionPlan


class PublicPlansView(APIView):
    """
    Public endpoint to get active subscription plans for the pricing page.
    No authentication required.
    
    GET /api/v1/public/plans/
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        # Get all active plans, ordered by price
        plans = SubscriptionPlan.objects.filter(
            is_active=True
        ).order_by('price')
        
        # Group by plan level for better organization
        plans_data = []
        
        for plan in plans:
            # Determine features based on plan level
            features = self._get_plan_features(plan)
            
            plans_data.append({
                'id': plan.id,
                'name': plan.name,
                'plan_level': plan.plan_level,
                'plan_type': plan.plan_type,  # monthly or yearly
                'price': float(plan.price),
                'price_display': self._format_price(plan.price, plan.plan_type),
                'stripe_price_id': plan.stripe_price_id,
                'max_users': plan.max_users,  # null = unlimited
                'max_projects': plan.max_projects,  # null = unlimited
                'storage_limit_gb': plan.storage_limit_gb,  # null = unlimited
                'features': features,
                'is_popular': plan.is_popular,
                'priority_support': plan.priority_support,
                'advanced_analytics': plan.advanced_analytics,
                'custom_integrations': plan.custom_integrations,
            })
        
        # If no plans in database, return default plans
        if not plans_data:
            plans_data = self._get_default_plans()
        
        return Response({
            'plans': plans_data,
            'currency': 'EUR',
            'currency_symbol': '€',
        })
    
    def _format_price(self, price, plan_type):
        """Format price for display"""
        if price == 0:
            return 'Gratis'
        
        period = '/maand' if plan_type == 'monthly' else '/jaar'
        return f'€{int(price)}{period}'
    
    def _get_plan_features(self, plan):
        """Generate feature list based on plan attributes"""
        features = []
        
        # Projects limit
        if plan.max_projects is None or plan.max_projects == -1:
            features.append({'text': 'Onbeperkt projecten', 'included': True})
        else:
            features.append({'text': f'Tot {plan.max_projects} projecten', 'included': True})
        
        # Users limit
        if plan.max_users is None or plan.max_users == -1:
            features.append({'text': 'Onbeperkt gebruikers', 'included': True})
        else:
            features.append({'text': f'Tot {plan.max_users} gebruikers', 'included': True})
        
        # Storage
        if plan.storage_limit_gb is None or plan.storage_limit_gb == -1:
            features.append({'text': 'Onbeperkte opslag', 'included': True})
        else:
            features.append({'text': f'{plan.storage_limit_gb} GB opslag', 'included': True})
        
        # AI features based on plan level
        if plan.plan_level in ['basic', 'starter']:
            features.append({'text': 'Basis AI assistentie', 'included': True})
        else:
            features.append({'text': 'Geavanceerde AI functies', 'included': True})
        
        # Additional features based on plan attributes
        if plan.priority_support:
            features.append({'text': 'Prioriteit support', 'included': True})
        
        if plan.advanced_analytics:
            features.append({'text': 'Geavanceerde analytics', 'included': True})
        
        if plan.custom_integrations:
            features.append({'text': 'Custom integraties', 'included': True})
        
        # Plan level specific features
        if plan.plan_level == 'enterprise':
            features.append({'text': 'SSO & geavanceerde beveiliging', 'included': True})
            features.append({'text': 'Dedicated account manager', 'included': True})
            features.append({'text': 'SLA garantie', 'included': True})
            features.append({'text': 'On-premise optie', 'included': True})
        elif plan.plan_level in ['business', 'premium', 'professional']:
            features.append({'text': 'Programmamanagement', 'included': True})
            features.append({'text': 'Team analytics', 'included': True})
            features.append({'text': 'Custom rapporten', 'included': True})
        
        return features
    
    def _get_default_plans(self):
        """Return default plans if database is empty"""
        return [
            {
                'id': 'starter',
                'name': 'Starter',
                'plan_level': 'starter',
                'plan_type': 'monthly',
                'price': 0,
                'price_display': 'Gratis',
                'max_users': 3,
                'max_projects': 3,
                'storage_limit_gb': 1,
                'features': [
                    {'text': 'Tot 3 projecten', 'included': True},
                    {'text': 'Basis AI assistentie', 'included': True},
                    {'text': 'Tijdregistratie', 'included': True},
                    {'text': 'Email support', 'included': True},
                ],
                'is_popular': False,
                'priority_support': False,
                'advanced_analytics': False,
                'custom_integrations': False,
            },
            {
                'id': 'pro',
                'name': 'Pro',
                'plan_level': 'professional',
                'plan_type': 'monthly',
                'price': 29,
                'price_display': '€29/maand',
                'max_users': None,
                'max_projects': None,
                'storage_limit_gb': 50,
                'features': [
                    {'text': 'Onbeperkt projecten', 'included': True},
                    {'text': 'Geavanceerde AI functies', 'included': True},
                    {'text': 'Programmamanagement', 'included': True},
                    {'text': 'Prioriteit support', 'included': True},
                    {'text': 'Custom rapporten', 'included': True},
                    {'text': 'Team analytics', 'included': True},
                ],
                'is_popular': True,
                'priority_support': True,
                'advanced_analytics': True,
                'custom_integrations': False,
            },
            {
                'id': 'enterprise',
                'name': 'Enterprise',
                'plan_level': 'enterprise',
                'plan_type': 'monthly',
                'price': 99,
                'price_display': '€99/maand',
                'max_users': None,
                'max_projects': None,
                'storage_limit_gb': None,
                'features': [
                    {'text': 'Alles in Pro', 'included': True},
                    {'text': 'SSO & geavanceerde beveiliging', 'included': True},
                    {'text': 'Dedicated account manager', 'included': True},
                    {'text': 'Custom integraties', 'included': True},
                    {'text': 'SLA garantie', 'included': True},
                    {'text': 'On-premise optie', 'included': True},
                ],
                'is_popular': False,
                'priority_support': True,
                'advanced_analytics': True,
                'custom_integrations': True,
            },
        ]
