import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  Check, 
  ArrowLeft, 
  Shield, 
  CreditCard,
  GraduationCap,
  Building2,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001/api/v1';

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  
  const planId = searchParams.get('plan');
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [includeAcademy, setIncludeAcademy] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  
  const academyPrice = 15;
  
  // Plan data based on planId (fallback if API fails)
  const planData: Record<string, any> = {
    '1': { id: 1, name: 'Basic', price: 25, description: 'Perfect voor kleine teams', max_users: 5, max_projects: 10, includes_academy: false },
    '2': { id: 2, name: 'Professional', price: 75, description: 'Voor groeiende teams', max_users: 25, max_projects: 50, includes_academy: false },
    '3': { id: 3, name: 'Enterprise', price: 200, description: 'Voor grote organisaties', max_users: null, max_projects: null, includes_academy: true },
    '4': { id: 4, name: 'Custom+', price: 0, description: 'Oplossing op maat', max_users: null, max_projects: null, includes_academy: true, is_custom: true },
  };

  useEffect(() => {
    if (!planId) {
      navigate('/landing#pricing');
      return;
    }
    
    // Try to fetch from API, fallback to local data
    fetchPlan();
  }, [planId]);
  
  const fetchPlan = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions/plans/${planId}/`);
      
      if (response.ok) {
        const data = await response.json();
        setPlan(data);
      } else {
        // Use fallback data
        setPlan(planData[planId!] || null);
      }
    } catch (error) {
      console.error('Error fetching plan:', error);
      // Use fallback data
      setPlan(planData[planId!] || null);
    } finally {
      setLoading(false);
    }
  };
  
  const calculateTotal = () => {
    if (!plan) return 0;
    let total = Number(plan.price) || 0;
    if (includeAcademy && !plan.includes_academy) {
      total += academyPrice;
    }
    if (billingPeriod === 'yearly') {
      total = total * 10; // 2 months free
    }
    return total;
  };
  
  const handleCheckout = async () => {
    if (!acceptTerms || !acceptPrivacy) {
      toast({
        title: language === 'nl' ? 'Accepteer voorwaarden' : 'Accept terms',
        description: language === 'nl' 
          ? 'Je moet akkoord gaan met de voorwaarden om door te gaan'
          : 'You must accept the terms to continue',
        variant: 'destructive',
      });
      return;
    }
    
    const token = localStorage.getItem('access_token');
    if (!token) {
      // Save checkout state and redirect to login
      sessionStorage.setItem('checkout_plan', planId || '');
      sessionStorage.setItem('checkout_academy', String(includeAcademy));
      sessionStorage.setItem('checkout_billing', billingPeriod);
      
      toast({
        title: language === 'nl' ? 'Log eerst in' : 'Please log in first',
        description: language === 'nl' 
          ? 'Je moet inloggen om af te rekenen'
          : 'You need to log in to complete checkout',
      });
      
      navigate(`/login?redirect=/checkout?plan=${planId}`);
      return;
    }
    
    setProcessing(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions/checkout/create-session/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan_id: planId,
          include_academy: includeAcademy,
          billing_period: billingPeriod,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.checkout_url) {
        // Redirect to Stripe Checkout
        window.location.href = data.checkout_url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      setProcessing(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md text-center p-8">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">Plan niet gevonden</h2>
          <Button onClick={() => navigate('/landing#pricing')}>
            Terug naar prijzen
          </Button>
        </Card>
      </div>
    );
  }
  
  const isCustomPlan = plan.is_custom || plan.price === 0;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/landing#pricing')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {language === 'nl' ? 'Terug naar prijzen' : 'Back to pricing'}
        </Button>
        
        <h1 className="text-3xl font-bold mb-8">
          {language === 'nl' ? 'Afrekenen' : 'Checkout'}
        </h1>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Order Summary */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {language === 'nl' ? 'Bestelling' : 'Order Summary'}
                </CardTitle>
                <CardDescription>
                  {language === 'nl' 
                    ? 'Controleer je bestelling voordat je afrekent'
                    : 'Review your order before checkout'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Selected Plan */}
                <div className="flex items-start justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline">
                          {plan.max_users ? `${plan.max_users} users` : 'Unlimited users'}
                        </Badge>
                        <Badge variant="outline">
                          {plan.max_projects ? `${plan.max_projects} projects` : 'Unlimited projects'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {isCustomPlan ? (
                      <span className="text-lg font-bold text-primary">
                        {language === 'nl' ? 'Op offerte' : 'Custom'}
                      </span>
                    ) : (
                      <>
                        <span className="text-2xl font-bold">€{plan.price}</span>
                        <span className="text-muted-foreground">/{language === 'nl' ? 'maand' : 'month'}</span>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Billing Period */}
                {!isCustomPlan && (
                  <div className="space-y-3">
                    <h4 className="font-medium">
                      {language === 'nl' ? 'Facturatieperiode' : 'Billing Period'}
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setBillingPeriod('monthly')}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          billingPeriod === 'monthly' 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-muted-foreground'
                        }`}
                      >
                        <div className="font-medium">
                          {language === 'nl' ? 'Maandelijks' : 'Monthly'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          €{plan.price}/{language === 'nl' ? 'maand' : 'month'}
                        </div>
                      </button>
                      <button
                        onClick={() => setBillingPeriod('yearly')}
                        className={`p-4 rounded-lg border-2 text-left transition-all relative ${
                          billingPeriod === 'yearly' 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-muted-foreground'
                        }`}
                      >
                        <Badge className="absolute -top-2 -right-2 bg-green-500">
                          {language === 'nl' ? '2 maanden gratis' : '2 months free'}
                        </Badge>
                        <div className="font-medium">
                          {language === 'nl' ? 'Jaarlijks' : 'Yearly'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          €{plan.price * 10}/{language === 'nl' ? 'jaar' : 'year'}
                        </div>
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Academy Add-on */}
                {!plan.includes_academy && !isCustomPlan && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Add-ons</h4>
                    <div 
                      onClick={() => setIncludeAcademy(!includeAcademy)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        includeAcademy 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-muted-foreground'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <Checkbox 
                          checked={includeAcademy} 
                          onCheckedChange={(checked) => setIncludeAcademy(checked as boolean)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-green-600" />
                            <span className="font-medium">Learning Academy</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {language === 'nl' 
                              ? 'Volledige toegang tot alle trainingen en certificeringen'
                              : 'Full access to all training courses and certifications'}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold">+€{academyPrice}</span>
                          <span className="text-muted-foreground">/{language === 'nl' ? 'maand' : 'month'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {plan.includes_academy && (
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                      <Check className="h-5 w-5" />
                      <span className="font-medium">
                        {language === 'nl' 
                          ? 'Learning Academy inbegrepen!'
                          : 'Learning Academy included!'}
                      </span>
                    </div>
                  </div>
                )}
                
                <Separator />
                
                {/* Terms and Conditions */}
                <div className="space-y-4">
                  <h4 className="font-medium">
                    {language === 'nl' ? 'Voorwaarden' : 'Terms & Conditions'}
                  </h4>
                  
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      id="terms"
                      checked={acceptTerms}
                      onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                    />
                    <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                      {language === 'nl' ? (
                        <>
                          Ik ga akkoord met de{' '}
                          <a href="/terms" target="_blank" className="text-primary hover:underline">
                            Algemene Voorwaarden
                          </a>{' '}
                          en de{' '}
                          <a href="/license" target="_blank" className="text-primary hover:underline">
                            Licentieovereenkomst
                          </a>
                        </>
                      ) : (
                        <>
                          I agree to the{' '}
                          <a href="/terms" target="_blank" className="text-primary hover:underline">
                            Terms of Service
                          </a>{' '}
                          and{' '}
                          <a href="/license" target="_blank" className="text-primary hover:underline">
                            License Agreement
                          </a>
                        </>
                      )}
                    </label>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      id="privacy"
                      checked={acceptPrivacy}
                      onCheckedChange={(checked) => setAcceptPrivacy(checked as boolean)}
                    />
                    <label htmlFor="privacy" className="text-sm leading-relaxed cursor-pointer">
                      {language === 'nl' ? (
                        <>
                          Ik ga akkoord met het{' '}
                          <a href="/privacy" target="_blank" className="text-primary hover:underline">
                            Privacybeleid
                          </a>{' '}
                          en het verwerken van mijn gegevens
                        </>
                      ) : (
                        <>
                          I agree to the{' '}
                          <a href="/privacy" target="_blank" className="text-primary hover:underline">
                            Privacy Policy
                          </a>{' '}
                          and processing of my data
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Payment Summary */}
          <div className="md:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>
                  {language === 'nl' ? 'Totaal' : 'Total'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isCustomPlan ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{plan.name}</span>
                        <span>€{billingPeriod === 'yearly' ? plan.price * 10 : plan.price}</span>
                      </div>
                      {includeAcademy && !plan.includes_academy && (
                        <div className="flex justify-between text-sm">
                          <span>Learning Academy</span>
                          <span>€{billingPeriod === 'yearly' ? academyPrice * 10 : academyPrice}</span>
                        </div>
                      )}
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between font-bold text-lg">
                      <span>{language === 'nl' ? 'Totaal' : 'Total'}</span>
                      <span>€{calculateTotal()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      {billingPeriod === 'yearly' 
                        ? (language === 'nl' ? 'per jaar' : 'per year')
                        : (language === 'nl' ? 'per maand' : 'per month')}
                    </p>
                    
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handleCheckout}
                      disabled={processing || !acceptTerms || !acceptPrivacy}
                    >
                      {processing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {language === 'nl' ? 'Verwerken...' : 'Processing...'}
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          {language === 'nl' ? 'Afrekenen' : 'Checkout'}
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="text-center py-4">
                      <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-sm text-muted-foreground">
                        {language === 'nl' 
                          ? 'Neem contact met ons op voor een offerte op maat'
                          : 'Contact us for a custom quote'}
                      </p>
                    </div>
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={() => navigate('/contact')}
                    >
                      {language === 'nl' ? 'Neem Contact Op' : 'Contact Us'}
                    </Button>
                  </>
                )}
                
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  {language === 'nl' ? 'Veilig betalen met Stripe' : 'Secure payment with Stripe'}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
