// ============================================================
//  SECTION - Connected to Admin Portal
// Fetches plans from /api/v1/public/plans/
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Sparkles, Loader2, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

// ============================================================
// TYPES
// ============================================================

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: string | number;
  name: string;
  plan_level: string;
  plan_type: 'monthly' | 'yearly';
  price: number;
  price_display: string;
  stripe_price_id?: string;
  max_users: number | null;
  max_projects: number | null;
  storage_limit_gb: number | null;
  features: PlanFeature[];
  is_popular: boolean;
  priority_support: boolean;
  advanced_analytics: boolean;
  custom_integrations: boolean;
}

interface PlansResponse {
  plans: Plan[];
  currency: string;
  currency_symbol: string;
}

// ============================================================
// DEFAULT PLANS (Fallback when API unavailable)
// ============================================================

const DEFAULT_PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    plan_level: 'starter',
    plan_type: 'monthly',
    price: 0,
    price_display: 'Gratis',
    max_users: 3,
    max_projects: 3,
    storage_limit_gb: 1,
    features: [
      { text: 'Tot 3 projecten', included: true },
      { text: 'Basis AI assistentie', included: true },
      { text: 'Tijdregistratie', included: true },
      { text: 'Email support', included: true },
    ],
    is_popular: false,
    priority_support: false,
    advanced_analytics: false,
    custom_integrations: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    plan_level: 'professional',
    plan_type: 'monthly',
    price: 29,
    price_display: '€29/maand',
    max_users: null,
    max_projects: null,
    storage_limit_gb: 50,
    features: [
      { text: 'Onbeperkt projecten', included: true },
      { text: 'Geavanceerde AI functies', included: true },
      { text: 'Programmamanagement', included: true },
      { text: 'Prioriteit support', included: true },
      { text: 'Custom rapporten', included: true },
      { text: 'Team analytics', included: true },
    ],
    is_popular: true,
    priority_support: true,
    advanced_analytics: true,
    custom_integrations: false,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    plan_level: 'enterprise',
    plan_type: 'monthly',
    price: 99,
    price_display: '€99/maand',
    max_users: null,
    max_projects: null,
    storage_limit_gb: null,
    features: [
      { text: 'Alles in Pro', included: true },
      { text: 'SSO & geavanceerde beveiliging', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'Custom integraties', included: true },
      { text: 'SLA garantie', included: true },
      { text: 'On-premise optie', included: true },
    ],
    is_popular: false,
    priority_support: true,
    advanced_analytics: true,
    custom_integrations: true,
  },
];

// ============================================================
// API CONFIG
// ============================================================

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001/api/v1';

// ============================================================
// COMPONENT
// ============================================================

export default function Section() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isNL = language === 'nl';

  const [plans, setPlans] = useState<Plan[]>(DEFAULT_PLANS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // FETCH PLANS FROM API
  // ============================================================

  useEffect(() => {
    const fetchPlans = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/public/plans/`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch plans');
        }

        const data: PlansResponse = await response.json();
        
        if (data.plans && data.plans.length > 0) {
          // Sort plans: free first, then by price, popular plans highlighted
          const sortedPlans = data.plans.sort((a, b) => {
            if (a.price === 0) return -1;
            if (b.price === 0) return 1;
            return a.price - b.price;
          });
          setPlans(sortedPlans);
        }
      } catch (err) {
        console.error('Error fetching plans:', err);
        // Keep default plans on error
        setError('Using default ');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleSelectPlan = (plan: Plan) => {
    // Navigate to signup with selected plan
    const params = new URLSearchParams({
      plan: plan.plan_level,
      price_id: plan.stripe_price_id || '',
    });
    navigate(`/signup?${params.toString()}`);
  };

  // ============================================================
  // HELPERS
  // ============================================================

  const formatPrice = (plan: Plan) => {
    if (plan.price === 0) {
      return isNL ? 'Gratis' : 'Free';
    }
    
    const period = plan.plan_type === 'monthly' 
      ? (isNL ? '/maand' : '/month')
      : (isNL ? '/jaar' : '/year');
    
    return (
      <>
        <span className="text-4xl font-bold">€{Math.round(plan.price)}</span>
        <span className="text-muted-foreground">{period}</span>
      </>
    );
  };

  // ============================================================
  // LOADING STATE
  // ============================================================

  if (isLoading) {
    return (
      <section id="" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              {isNL ? 'Eenvoudige Prijzen' : 'Simple '}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {isNL ? 'Kies Het Plan' : 'Choose The Plan'}
              <br />
              <span className="text-purple-500">
                {isNL ? 'Dat Bij Je Past' : 'That Fits You'}
              </span>
            </h2>
          </div>
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        </div>
      </section>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <section id="" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            {isNL ? 'Eenvoudige Prijzen' : 'Simple '}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {isNL ? 'Kies Het Plan' : 'Choose The Plan'}
            <br />
            <span className="text-purple-500">
              {isNL ? 'Dat Bij Je Past' : 'That Fits You'}
            </span>
          </h2>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.slice(0, 3).map((plan) => (
            <Card 
              key={plan.id}
              className={`relative flex flex-col ${
                plan.is_popular 
                  ? 'border-purple-500 border-2 shadow-lg scale-105' 
                  : 'border-border'
              }`}
            >
              {/* Popular Badge */}
              {plan.is_popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-purple-500 text-white">
                    {isNL ? 'Meest Populair' : 'Most Popular'}
                  </Badge>
                </div>
              )}

              <CardHeader className="pt-8">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>
                  {plan.plan_level === 'starter' && (isNL ? 'Perfect voor individuen en kleine teams.' : 'Perfect for individuals and small teams.')}
                  {plan.plan_level === 'professional' && (isNL ? 'Voor groeiende teams die meer power nodig hebben.' : 'For growing teams that need more power.')}
                  {plan.plan_level === 'enterprise' && (isNL ? 'Voor grote organisaties met complexe behoeften.' : 'For large organizations with complex needs.')}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                {/* Price */}
                <div className="mb-6">
                  {plan.price === 0 ? (
                    <span className="text-4xl font-bold">{isNL ? 'Gratis' : 'Free'}</span>
                  ) : (
                    formatPrice(plan)
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className={`h-4 w-4 ${
                        feature.included ? 'text-green-500' : 'text-muted-foreground'
                      }`} />
                      <span className={feature.included ? '' : 'text-muted-foreground line-through'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button 
                  className={`w-full ${
                    plan.is_popular 
                      ? 'bg-purple-500 hover:bg-purple-600' 
                      : ''
                  }`}
                  variant={plan.is_popular ? 'default' : 'outline'}
                  onClick={() => handleSelectPlan(plan)}
                >
                  {isNL ? 'Aan de Slag' : 'Get Started'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Academy Banner */}
        <div className="mt-12 max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                  <GraduationCap className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {isNL ? 'Learning Academy Inbegrepen' : 'Learning Academy Included'}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {isNL 
                      ? 'Volledige toegang tot alle trainings bij elk abonnement' 
                      : 'Full access to all trainings with every subscription'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-green-600">
                  {isNL ? 'Gratis' : 'Free'}
                </span>
                <span className="text-muted-foreground text-sm block">
                  {isNL ? 'bij Pro+' : 'with Pro+'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
