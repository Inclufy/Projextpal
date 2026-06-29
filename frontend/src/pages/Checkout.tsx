import { useState, useEffect } from 'react';
import { activateOnKey } from "@/lib/a11y";
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Loader2, 
  Check, 
  ArrowLeft, 
  Shield, 
  CreditCard,
  FileText,
  MessageSquare,
  Calendar,
  Building2,
  AlertCircle,
  Mail,
  Phone,
  User,
  Briefcase,
  Users,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

type PaymentMethod = 'stripe' | 'invoice' | 'quote' | 'demo';

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe');
  const [submitted, setSubmitted] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    company_name: '',
    company_vat: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    notes: '',
    num_users: '',
    requirements: '',
    preferred_date: '',
    preferred_time: '',
    num_participants: '1',
    message: '',
  });

  useEffect(() => {
    const fetchPlan = async () => {
      const planName = searchParams.get('plan');
      const billing = searchParams.get('billing') || 'monthly';
      
      if (!planName) {
        navigate('/pricing');
        return;
      }
      
      try {
        const response = await fetch('/api/v1/subscriptions/plans/');
        
        if (!response.ok) {
          throw new Error('Failed to fetch plans');
        }
        
        const plans = await response.json();
        const selectedPlan = plans.find((p: any) => 
          p.name.toLowerCase() === planName.toLowerCase() &&
          p.plan_type === billing
        );
        
        if (selectedPlan) {
          setPlan(selectedPlan);
          setBillingPeriod(billing as 'monthly' | 'yearly');
        } else {
          toast({
            title: language === 'nl' ? 'Plan niet gevonden' : 'Plan not found',
            variant: 'destructive',
          });
          navigate('/pricing');
        }
      } catch (error) {
        console.error('Failed to fetch plan:', error);
        toast({
          title: language === 'nl' ? 'Fout' : 'Error',
          variant: 'destructive',
        });
        navigate('/pricing');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlan();
  }, [searchParams, navigate, toast, language]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleStripeCheckout = async () => {
    if (!acceptTerms || !acceptPrivacy) {
      toast({
        title: language === 'nl' ? 'Voorwaarden accepteren' : 'Accept terms',
        description: language === 'nl' 
          ? 'Je moet de algemene voorwaarden en privacyverklaring accepteren.'
          : 'You must accept the terms and privacy policy.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!plan) return;
    
    const token = localStorage.getItem('access_token');
    if (!token) {
      toast({
        title: language === 'nl' ? 'Log eerst in' : 'Please log in first',
        description: language === 'nl' 
          ? 'Je moet inloggen om af te rekenen'
          : 'You need to log in to checkout',
      });
      navigate(`/login?redirect=checkout&plan=${plan.name.toLowerCase()}&billing=${billingPeriod}`);
      return;
    }
    
    setProcessing(true);
    
    try {
      const response = await fetch('/api/v1/subscriptions/checkout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan_id: plan.id,
          success_url: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/checkout/cancel`,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Checkout failed');
      }
      
      const data = await response.json();
      
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        throw new Error('No checkout URL returned');
      }
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: language === 'nl' ? 'Checkout mislukt' : 'Checkout failed',
        description: error.message,
        variant: 'destructive',
      });
      setProcessing(false);
    }
  };

  const handleInvoiceRequest = async () => {
    if (!acceptTerms || !acceptPrivacy) {
      toast({
        title: language === 'nl' ? 'Voorwaarden accepteren' : 'Accept terms',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.company_name || !formData.contact_name || !formData.contact_email) {
      toast({
        title: language === 'nl' ? 'Vul alle verplichte velden in' : 'Fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch('/api/v1/subscriptions/request-invoice/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_id: plan.id,
          billing_period: billingPeriod,
          ...formData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        toast({
          title: language === 'nl' ? 'Aanvraag verzonden!' : 'Request sent!',
          description: data.message,
        });
      } else {
        throw new Error(data.error || 'Request failed');
      }
    } catch (error) {
      toast({
        title: language === 'nl' ? 'Fout' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleQuoteRequest = async () => {
    if (!formData.company_name || !formData.contact_name || !formData.contact_email) {
      toast({
        title: language === 'nl' ? 'Vul alle verplichte velden in' : 'Fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch('/api/v1/subscriptions/request-quote/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        toast({
          title: language === 'nl' ? 'Offerte aangevraagd!' : 'Quote requested!',
          description: data.message,
        });
      } else {
        throw new Error(data.error || 'Request failed');
      }
    } catch (error) {
      toast({
        title: language === 'nl' ? 'Fout' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDemoRequest = async () => {
    if (!formData.company_name || !formData.contact_name || !formData.contact_email) {
      toast({
        title: language === 'nl' ? 'Vul alle verplichte velden in' : 'Fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch('/api/v1/subscriptions/request-demo/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        toast({
          title: language === 'nl' ? 'Demo aangevraagd!' : 'Demo requested!',
          description: data.message,
        });
      } else {
        throw new Error(data.error || 'Request failed');
      }
    } catch (error) {
      toast({
        title: language === 'nl' ? 'Fout' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = () => {
    switch (paymentMethod) {
      case 'stripe':
        handleStripeCheckout();
        break;
      case 'invoice':
        handleInvoiceRequest();
        break;
      case 'quote':
        handleQuoteRequest();
        break;
      case 'demo':
        handleDemoRequest();
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center p-8">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">
            {language === 'nl' ? 'Plan niet gevonden' : 'Plan not found'}
          </h2>
          <Button onClick={() => navigate('/pricing')}>
            {language === 'nl' ? 'Terug naar prijzen' : 'Back to pricing'}
          </Button>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {language === 'nl' ? 'Aanvraag verzonden!' : 'Request submitted!'}
          </h2>
          <p className="text-muted-foreground mb-6">
            {language === 'nl' 
              ? 'We nemen binnen 1-2 werkdagen contact met je op.'
              : 'We will contact you within 1-2 business days.'}
          </p>
          <div className="space-y-3">
            <Button onClick={() => navigate('/pricing')} variant="outline" className="w-full">
              {language === 'nl' ? 'Terug naar prijzen' : 'Back to pricing'}
            </Button>
            <Button onClick={() => navigate('/')} className="w-full">
              {language === 'nl' ? 'Naar homepage' : 'Go to homepage'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const isFreePlan = parseFloat(plan.price) === 0;
  const yearlyPrice = parseFloat(plan.price) * 10;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/pricing')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {language === 'nl' ? 'Terug naar prijzen' : 'Back to pricing'}
        </Button>
        
        <h1 className="text-3xl font-bold mb-8">
          {language === 'nl' ? 'Afrekenen' : 'Checkout'}
        </h1>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Plan Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {language === 'nl' ? 'Geselecteerd Plan' : 'Selected Plan'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-lg">{plan.name}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {plan.max_users && (
                        <Badge variant="outline">{plan.max_users} users</Badge>
                      )}
                      {plan.max_projects && (
                        <Badge variant="outline">{plan.max_projects} projects</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {isFreePlan ? (
                      <span className="text-2xl font-bold text-green-600">Gratis</span>
                    ) : (
                      <>
                        <span className="text-2xl font-bold">€{plan.price}</span>
                        <span className="text-muted-foreground">/maand</span>
                      </>
                    )}
                  </div>
                </div>

                {!isFreePlan && (
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <button
                      onClick={() => setBillingPeriod('monthly')}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        billingPeriod === 'monthly' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border'
                      }`}
                    >
                      <div className="font-medium">Maandelijks</div>
                      <div className="text-sm text-muted-foreground">€{plan.price}/maand</div>
                    </button>
                    <button
                      onClick={() => setBillingPeriod('yearly')}
                      className={`p-3 rounded-lg border-2 text-left transition-all relative ${
                        billingPeriod === 'yearly' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border'
                      }`}
                    >
                      <Badge className="absolute -top-2 -right-2 bg-green-500">-10%</Badge>
                      <div className="font-medium">Jaarlijks</div>
                      <div className="text-sm text-muted-foreground">€{yearlyPrice.toFixed(2)}/jaar</div>
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'nl' ? 'Kies betaalmethode' : 'Choose payment method'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
                  <div className="space-y-3">
                    <div role="button" tabIndex={0} onKeyDown={activateOnKey} className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      paymentMethod === 'stripe' ? 'border-primary bg-primary/5' : 'border-border'
                    }`} onClick={() => setPaymentMethod('stripe')}>
                      <RadioGroupItem value="stripe" id="stripe" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-primary" />
                          <Label htmlFor="stripe" className="font-medium cursor-pointer">
                            {language === 'nl' ? 'Direct betalen met Stripe' : 'Pay directly with Stripe'}
                          </Label>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {language === 'nl' 
                            ? 'Veilig online betalen met creditcard of iDEAL'
                            : 'Secure online payment with credit card or iDEAL'}
                        </p>
                      </div>
                    </div>

                    <div role="button" tabIndex={0} onKeyDown={activateOnKey} className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      paymentMethod === 'invoice' ? 'border-primary bg-primary/5' : 'border-border'
                    }`} onClick={() => setPaymentMethod('invoice')}>
                      <RadioGroupItem value="invoice" id="invoice" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <Label htmlFor="invoice" className="font-medium cursor-pointer">
                            {language === 'nl' ? 'Periodieke factuur' : 'Periodic invoice'}
                          </Label>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {language === 'nl' 
                            ? 'Ontvang maandelijkse of jaarlijkse facturen (admin goedkeuring vereist)'
                            : 'Receive monthly or yearly invoices (admin approval required)'}
                        </p>
                      </div>
                    </div>

                    <div role="button" tabIndex={0} onKeyDown={activateOnKey} className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      paymentMethod === 'quote' ? 'border-primary bg-primary/5' : 'border-border'
                    }`} onClick={() => setPaymentMethod('quote')}>
                      <RadioGroupItem value="quote" id="quote" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-5 w-5 text-purple-600" />
                          <Label htmlFor="quote" className="font-medium cursor-pointer">
                            {language === 'nl' ? 'Offerte aanvragen' : 'Request quote'}
                          </Label>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {language === 'nl' 
                            ? 'Vraag een offerte op maat aan voor jouw organisatie'
                            : 'Request a custom quote for your organization'}
                        </p>
                      </div>
                    </div>

                    <div role="button" tabIndex={0} onKeyDown={activateOnKey} className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      paymentMethod === 'demo' ? 'border-primary bg-primary/5' : 'border-border'
                    }`} onClick={() => setPaymentMethod('demo')}>
                      <RadioGroupItem value="demo" id="demo" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-orange-600" />
                          <Label htmlFor="demo" className="font-medium cursor-pointer">
                            {language === 'nl' ? 'Demo aanvragen' : 'Request demo'}
                          </Label>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {language === 'nl' 
                            ? 'Plan een persoonlijke demo met onze productspecialist'
                            : 'Schedule a personal demo with our product specialist'}
                        </p>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Payment Method Forms */}
            {paymentMethod === 'stripe' && (
              <Card>
                <CardHeader>
                  <CardTitle>{language === 'nl' ? 'Voorwaarden' : 'Terms'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      id="terms"
                      checked={acceptTerms}
                      onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                    />
                    <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                      {language === 'nl' ? (
                        <>Ik ga akkoord met de <a href="/terms" target="_blank" className="text-primary hover:underline">Algemene Voorwaarden</a></>
                      ) : (
                        <>I agree to the <a href="/terms" target="_blank" className="text-primary hover:underline">Terms of Service</a></>
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
                        <>Ik ga akkoord met het <a href="/privacy" target="_blank" className="text-primary hover:underline">Privacybeleid</a></>
                      ) : (
                        <>I agree to the <a href="/privacy" target="_blank" className="text-primary hover:underline">Privacy Policy</a></>
                      )}
                    </label>
                  </div>
                </CardContent>
              </Card>
            )}

            {paymentMethod === 'invoice' && (
              <Card>
                <CardHeader>
                  <CardTitle>{language === 'nl' ? 'Factuurgegevens' : 'Invoice details'}</CardTitle>
                  <CardDescription>
                    {language === 'nl' 
                      ? 'Vul je bedrijfsgegevens in voor periodieke facturering'
                      : 'Fill in your company details for periodic invoicing'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company_name">
                        {language === 'nl' ? 'Bedrijfsnaam' : 'Company name'} *
                      </Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="company_name"
                          name="company_name"
                          placeholder="ProjeXtPal B.V."
                          value={formData.company_name}
                          onChange={handleInputChange}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="company_vat">
                        {language === 'nl' ? 'BTW nummer' : 'VAT number'}
                      </Label>
                      <Input
                        id="company_vat"
                        name="company_vat"
                        placeholder="NL123456789B01"
                        value={formData.company_vat}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact_name">
                        {language === 'nl' ? 'Contactpersoon' : 'Contact person'} *
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="contact_name"
                          name="contact_name"
                          placeholder="Jan Jansen"
                          value={formData.contact_name}
                          onChange={handleInputChange}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contact_email">
                        {language === 'nl' ? 'E-mailadres' : 'Email address'} *
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="contact_email"
                          name="contact_email"
                          type="email"
                          placeholder="jan@bedrijf.nl"
                          value={formData.contact_email}
                          onChange={handleInputChange}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">
                      {language === 'nl' ? 'Telefoonnummer' : 'Phone number'}
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="contact_phone"
                        name="contact_phone"
                        type="tel"
                        placeholder="+31 6 12345678"
                        value={formData.contact_phone}
                        onChange={handleInputChange}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">
                      {language === 'nl' ? 'Opmerkingen' : 'Notes'}
                    </Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      placeholder={language === 'nl' ? 'Eventuele aanvullende opmerkingen...' : 'Any additional notes...'}
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox 
                      id="terms_invoice"
                      checked={acceptTerms}
                      onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                    />
                    <label htmlFor="terms_invoice" className="text-sm leading-relaxed cursor-pointer">
                      {language === 'nl' ? (
                        <>Ik ga akkoord met de <a href="/terms" target="_blank" className="text-primary hover:underline">Algemene Voorwaarden</a></>
                      ) : (
                        <>I agree to the <a href="/terms" target="_blank" className="text-primary hover:underline">Terms of Service</a></>
                      )}
                    </label>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      id="privacy_invoice"
                      checked={acceptPrivacy}
                      onCheckedChange={(checked) => setAcceptPrivacy(checked as boolean)}
                    />
                    <label htmlFor="privacy_invoice" className="text-sm leading-relaxed cursor-pointer">
                      {language === 'nl' ? (
                        <>Ik ga akkoord met het <a href="/privacy" target="_blank" className="text-primary hover:underline">Privacybeleid</a></>
                      ) : (
                        <>I agree to the <a href="/privacy" target="_blank" className="text-primary hover:underline">Privacy Policy</a></>
                      )}
                    </label>
                  </div>
                </CardContent>
              </Card>
            )}

            {paymentMethod === 'quote' && (
              <Card>
                <CardHeader>
                  <CardTitle>{language === 'nl' ? 'Offerte aanvraag' : 'Quote request'}</CardTitle>
                  <CardDescription>
                    {language === 'nl' 
                      ? 'Vertel ons over je organisatie en specifieke wensen'
                      : 'Tell us about your organization and specific needs'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company_name_quote">
                        {language === 'nl' ? 'Bedrijfsnaam' : 'Company name'} *
                      </Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="company_name_quote"
                          name="company_name"
                          placeholder="ProjeXtPal B.V."
                          value={formData.company_name}
                          onChange={handleInputChange}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="num_users">
                        {language === 'nl' ? 'Aantal gebruikers' : 'Number of users'}
                      </Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="num_users"
                          name="num_users"
                          type="number"
                          placeholder="50"
                          value={formData.num_users}
                          onChange={handleInputChange}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact_name_quote">
                        {language === 'nl' ? 'Contactpersoon' : 'Contact person'} *
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="contact_name_quote"
                          name="contact_name"
                          placeholder="Jan Jansen"
                          value={formData.contact_name}
                          onChange={handleInputChange}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contact_email_quote">
                        {language === 'nl' ? 'E-mailadres' : 'Email address'} *
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="contact_email_quote"
                          name="contact_email"
                          type="email"
                          placeholder="jan@bedrijf.nl"
                          value={formData.contact_email}
                          onChange={handleInputChange}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_phone_quote">
                      {language === 'nl' ? 'Telefoonnummer' : 'Phone number'}
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="contact_phone_quote"
                        name="contact_phone"
                        type="tel"
                        placeholder="+31 6 12345678"
                        value={formData.contact_phone}
                        onChange={handleInputChange}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requirements">
                      {language === 'nl' ? 'Specifieke wensen' : 'Specific requirements'}
                    </Label>
                    <Textarea
                      id="requirements"
                      name="requirements"
                      placeholder={language === 'nl' 
                        ? 'Beschrijf je specifieke wensen en behoeften...'
                        : 'Describe your specific needs and requirements...'}
                      value={formData.requirements}
                      onChange={handleInputChange}
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {paymentMethod === 'demo' && (
              <Card>
                <CardHeader>
                  <CardTitle>{language === 'nl' ? 'Demo aanvraag' : 'Demo request'}</CardTitle>
                  <CardDescription>
                    {language === 'nl' 
                      ? 'Plan een persoonlijke demo met onze productspecialist'
                      : 'Schedule a personal demo with our product specialist'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company_name_demo">
                        {language === 'nl' ? 'Bedrijfsnaam' : 'Company name'} *
                      </Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="company_name_demo"
                          name="company_name"
                          placeholder="ProjeXtPal B.V."
                          value={formData.company_name}
                          onChange={handleInputChange}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="num_participants">
                        {language === 'nl' ? 'Aantal deelnemers' : 'Number of participants'}
                      </Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="num_participants"
                          name="num_participants"
                          type="number"
                          placeholder="1"
                          value={formData.num_participants}
                          onChange={handleInputChange}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact_name_demo">
                        {language === 'nl' ? 'Contactpersoon' : 'Contact person'} *
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="contact_name_demo"
                          name="contact_name"
                          placeholder="Jan Jansen"
                          value={formData.contact_name}
                          onChange={handleInputChange}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contact_email_demo">
                        {language === 'nl' ? 'E-mailadres' : 'Email address'} *
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="contact_email_demo"
                          name="contact_email"
                          type="email"
                          placeholder="jan@bedrijf.nl"
                          value={formData.contact_email}
                          onChange={handleInputChange}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_phone_demo">
                      {language === 'nl' ? 'Telefoonnummer' : 'Phone number'}
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="contact_phone_demo"
                        name="contact_phone"
                        type="tel"
                        placeholder="+31 6 12345678"
                        value={formData.contact_phone}
                        onChange={handleInputChange}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="preferred_date">
                        {language === 'nl' ? 'Gewenste datum' : 'Preferred date'}
                      </Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="preferred_date"
                          name="preferred_date"
                          type="date"
                          value={formData.preferred_date}
                          onChange={handleInputChange}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="preferred_time">
                        {language === 'nl' ? 'Gewenste tijd' : 'Preferred time'}
                      </Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="preferred_time"
                          name="preferred_time"
                          type="time"
                          value={formData.preferred_time}
                          onChange={handleInputChange}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message_demo">
                      {language === 'nl' ? 'Bericht' : 'Message'}
                    </Label>
                    <Textarea
                      id="message_demo"
                      name="message"
                      placeholder={language === 'nl' 
                        ? 'Eventuele aanvullende opmerkingen...'
                        : 'Any additional comments...'}
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>{language === 'nl' ? 'Samenvatting' : 'Summary'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{plan.name}</span>
                    <span>€{billingPeriod === 'yearly' ? yearlyPrice.toFixed(2) : plan.price}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>{language === 'nl' ? 'Totaal' : 'Total'}</span>
                  <span>€{billingPeriod === 'yearly' ? yearlyPrice.toFixed(2) : plan.price}</span>
                </div>
                
                <p className="text-xs text-muted-foreground text-center">
                  {billingPeriod === 'yearly' 
                    ? (language === 'nl' ? 'per jaar' : 'per year')
                    : (language === 'nl' ? 'per maand' : 'per month')}
                </p>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleSubmit}
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {language === 'nl' ? 'Verwerken...' : 'Processing...'}
                    </>
                  ) : (
                    <>
                      {paymentMethod === 'stripe' && <CreditCard className="h-4 w-4 mr-2" />}
                      {paymentMethod === 'invoice' && <FileText className="h-4 w-4 mr-2" />}
                      {paymentMethod === 'quote' && <MessageSquare className="h-4 w-4 mr-2" />}
                      {paymentMethod === 'demo' && <Calendar className="h-4 w-4 mr-2" />}
                      {paymentMethod === 'stripe' && (language === 'nl' ? 'Betalen met Stripe' : 'Pay with Stripe')}
                      {paymentMethod === 'invoice' && (language === 'nl' ? 'Factuur aanvragen' : 'Request invoice')}
                      {paymentMethod === 'quote' && (language === 'nl' ? 'Offerte aanvragen' : 'Request quote')}
                      {paymentMethod === 'demo' && (language === 'nl' ? 'Demo aanvragen' : 'Request demo')}
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  {language === 'nl' ? 'Veilig en beveiligd' : 'Safe and secure'}
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