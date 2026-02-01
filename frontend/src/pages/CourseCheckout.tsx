import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Clock, BookOpen, Award, Star, Users, CheckCircle2, 
  ArrowLeft, Shield, Lock, CreditCard, Building2, 
  AlertCircle, Loader2, Check, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

// ============================================
// BRAND COLORS
// ============================================
const BRAND = {
  purple: '#8B5CF6',
  purpleDark: '#7C3AED',
  pink: '#D946EF',
  pinkLight: '#F0ABFC',
  green: '#22C55E',
  greenDark: '#16A34A',
  blue: '#3B82F6',
  orange: '#F59E0B',
};

// ============================================
// LOGO COMPONENT
// ============================================
const ProjeXtPalLogo = ({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = {
    sm: { width: 48, height: 20, text: 'text-lg', gap: 'gap-2' },
    md: { width: 64, height: 26, text: 'text-xl', gap: 'gap-3' },
    lg: { width: 96, height: 38, text: 'text-2xl', gap: 'gap-3' },
  };
  
  const { width, height, text, gap } = sizes[size];

  return (
    <div className={`flex items-center ${gap}`}>
      <svg width={width} height={height} viewBox="0 0 2078 1008" fill="none" className="shrink-0">
        <defs>
          <linearGradient id={`xGrad-checkout-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={BRAND.pink} />
            <stop offset="100%" stopColor={BRAND.pinkLight} />
          </linearGradient>
        </defs>
        <rect fill={BRAND.green} y="778" width="215" height="230" rx="30" />
        <text x="107" y="920" textAnchor="middle" fill="white" fontSize="110" fontWeight="800" fontFamily="Inter, system-ui, sans-serif">AI</text>
        <path fill="currentColor" d="M487,0H0V216H487c84,0,152,68,152,152s-68,152-152,152H0V736H487c203,0,368-165,368-368S690,0,487,0Z" />
        <polygon fill="currentColor" points="1656 586 1497 746 1383 631 1337 586 1383 540 1497 426 1656 586" />
        <polygon fill="currentColor" points="2078 1008 1759 1008 1542 791 1702 631 2078 1008" />
        <polygon fill="currentColor" points="2020 222 1702 540 1542 381 1701 222 2020 222" />
        <polygon fill={`url(#xGrad-checkout-${size})`} points="1656 586 1235 1008 915 1008 1337 586 973 222 1292 222 1656 586" />
      </svg>
      <span className={`font-bold ${text}`}>
        Proje<span style={{ color: BRAND.pink }}>X</span>tPal
      </span>
    </div>
  );
};

// ============================================
// COURSE DATA (would come from API)
// ============================================
const getCourseData = (id: string, isNL: boolean) => {
  const courses: Record<string, any> = {
    '1': {
      id: '1',
      title: 'Project Management Fundamentals',
      icon: '🎯',
      gradient: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.purpleDark})`,
      modules: 24,
      duration: '12',
      price: 99,
      originalPrice: 149,
    },
    '2': {
      id: '2',
      title: 'Agile & Scrum Mastery',
      icon: '⚡',
      gradient: `linear-gradient(135deg, ${BRAND.blue}, #0EA5E9)`,
      modules: 18,
      duration: '10',
      price: 49,
      originalPrice: 99,
    },
    '3': {
      id: '3',
      title: 'SAFe & Scaling Agile',
      icon: '📚',
      gradient: `linear-gradient(135deg, ${BRAND.orange}, #F97316)`,
      modules: 20,
      duration: '11',
      price: 79,
      originalPrice: 149,
    },
    '4': {
      id: '4',
      title: 'Program Management Professional',
      icon: '🏢',
      gradient: `linear-gradient(135deg, ${BRAND.green}, ${BRAND.greenDark})`,
      modules: 20,
      duration: '10',
      price: 99,
      originalPrice: 149,
    },
    '5': {
      id: '5',
      title: 'PRINCE2 Foundation & Practitioner',
      icon: '🛡️',
      gradient: `linear-gradient(135deg, ${BRAND.pink}, ${BRAND.pinkLight})`,
      modules: 16,
      duration: '14',
      price: 149,
      originalPrice: 249,
    },
  };

  return courses[id] || courses['2'];
};

// ============================================
// MAIN COMPONENT
// ============================================
const CourseCheckout = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    company: '',
    vatNumber: '',
    country: 'NL',
  });

  const isNL = language === 'nl';
  const course = getCourseData(id || '2', isNL);

  const content = {
    title: isNL ? 'Afrekenen' : 'Checkout',
    back: isNL ? 'Terug naar cursus' : 'Back to course',
    orderSummary: isNL ? 'Bestelling' : 'Order Summary',
    yourDetails: isNL ? 'Jouw Gegevens' : 'Your Details',
    payment: isNL ? 'Betaling' : 'Payment',
    email: isNL ? 'E-mailadres' : 'Email address',
    firstName: isNL ? 'Voornaam' : 'First name',
    lastName: isNL ? 'Achternaam' : 'Last name',
    company: isNL ? 'Bedrijfsnaam (optioneel)' : 'Company name (optional)',
    vatNumber: isNL ? 'BTW-nummer (optioneel)' : 'VAT number (optional)',
    country: isNL ? 'Land' : 'Country',
    coupon: isNL ? 'Kortingscode' : 'Coupon code',
    apply: isNL ? 'Toepassen' : 'Apply',
    subtotal: isNL ? 'Subtotaal' : 'Subtotal',
    discount: isNL ? 'Korting' : 'Discount',
    vat: isNL ? 'BTW (21%)' : 'VAT (21%)',
    total: isNL ? 'Totaal' : 'Total',
    payNow: isNL ? 'Nu Betalen' : 'Pay Now',
    processing: isNL ? 'Verwerken...' : 'Processing...',
    secure: isNL ? 'Veilige betaling via Stripe' : 'Secure payment via Stripe',
    terms: isNL ? 'Ik ga akkoord met de' : 'I agree to the',
    termsLink: isNL ? 'algemene voorwaarden' : 'terms and conditions',
    includes: isNL ? 'Inbegrepen' : 'Included',
    lifetime: isNL ? 'Levenslange toegang' : 'Lifetime access',
    certificate: isNL ? 'Certificaat' : 'Certificate',
    support: isNL ? 'AI-ondersteuning' : 'AI support',
    guarantee: isNL ? '30 dagen geld-terug garantie' : '30-day money-back guarantee',
    paymentMethods: {
      card: isNL ? 'Creditcard / Debitcard' : 'Credit / Debit Card',
      ideal: 'iDEAL',
      bancontact: 'Bancontact',
      invoice: isNL ? 'Factuur (Enterprise)' : 'Invoice (Enterprise)',
    },
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const applyCoupon = () => {
    if (couponCode.toLowerCase() === 'projextpal20') {
      setCouponApplied(true);
      setCouponDiscount(20);
      toast({
        title: isNL ? 'Kortingscode toegepast!' : 'Coupon applied!',
        description: isNL ? '20% korting is toegevoegd aan je bestelling.' : '20% discount has been added to your order.',
      });
    } else {
      toast({
        title: isNL ? 'Ongeldige code' : 'Invalid code',
        description: isNL ? 'Deze kortingscode is niet geldig.' : 'This coupon code is not valid.',
        variant: 'destructive',
      });
    }
  };

  const calculateTotal = () => {
    let subtotal = course.price;
    let discount = 0;
    
    if (couponApplied) {
      discount = subtotal * (couponDiscount / 100);
      subtotal = subtotal - discount;
    }
    
    const vat = subtotal * 0.21;
    const total = subtotal + vat;
    
    return { subtotal: course.price, discount, vat, total };
  };

  const { subtotal, discount, vat, total } = calculateTotal();

  const handleCheckout = async () => {
    if (!agreedToTerms) {
      toast({
        title: isNL ? 'Accepteer de voorwaarden' : 'Accept terms',
        description: isNL ? 'Je moet akkoord gaan met de algemene voorwaarden.' : 'You must agree to the terms and conditions.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.email || !formData.firstName || !formData.lastName) {
      toast({
        title: isNL ? 'Vul alle velden in' : 'Fill in all fields',
        description: isNL ? 'E-mail, voornaam en achternaam zijn verplicht.' : 'Email, first name and last name are required.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create Stripe checkout session
      const response = await fetch('/api/v1/academy/create-checkout-session/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          course_id: course.id,
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          company: formData.company,
          vat_number: formData.vatNumber,
          country: formData.country,
          payment_method: paymentMethod,
          coupon_code: couponApplied ? couponCode : null,
        }),
      });

      const data = await response.json();

      if (data.checkout_url) {
        // Redirect to Stripe Checkout
        window.location.href = data.checkout_url;
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: isNL ? 'Fout bij afrekenen' : 'Checkout error',
        description: isNL ? 'Er is iets misgegaan. Probeer het opnieuw.' : 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <button onClick={() => navigate('/academy/marketplace')}>
                <ProjeXtPalLogo size="sm" />
              </button>
              <button 
                onClick={() => navigate(`/academy/course/${id}`)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {content.back}
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="w-4 h-4" />
              {content.secure}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold mb-8">{content.title}</h1>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left - Form */}
          <div className="lg:col-span-3 space-y-6">
            {/* Your Details */}
            <Card className="border border-border/50 rounded-2xl">
              <CardHeader>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">1</span>
                  {content.yourDetails}
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{content.firstName} *</Label>
                    <Input 
                      id="firstName" 
                      name="firstName" 
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder={content.firstName}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{content.lastName} *</Label>
                    <Input 
                      id="lastName" 
                      name="lastName" 
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder={content.lastName}
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{content.email} *</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="jouw@email.com"
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">{content.company}</Label>
                  <Input 
                    id="company" 
                    name="company" 
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder={content.company}
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">{content.country}</Label>
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full h-11 px-3 rounded-xl border border-input bg-background"
                    >
                      <option value="NL">Nederland</option>
                      <option value="BE">België</option>
                      <option value="DE">Duitsland</option>
                      <option value="FR">Frankrijk</option>
                      <option value="GB">Verenigd Koninkrijk</option>
                      <option value="US">Verenigde Staten</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vatNumber">{content.vatNumber}</Label>
                    <Input 
                      id="vatNumber" 
                      name="vatNumber" 
                      value={formData.vatNumber}
                      onChange={handleInputChange}
                      placeholder="NL123456789B01"
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="border border-border/50 rounded-2xl">
              <CardHeader>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">2</span>
                  {content.payment}
                </h2>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                  <div className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-colors ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border/50'}`}>
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
                      <CreditCard className="w-5 h-5" />
                      <span>{content.paymentMethods.card}</span>
                      <div className="ml-auto flex gap-2">
                        <img src="https://cdn.jsdelivr.net/gh/nicepay-dev/nicepay-api-docs@main/assets/images/visa.svg" alt="Visa" className="h-6" />
                        <img src="https://cdn.jsdelivr.net/gh/nicepay-dev/nicepay-api-docs@main/assets/images/mastercard.svg" alt="Mastercard" className="h-6" />
                      </div>
                    </Label>
                  </div>
                  
                  <div className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-colors ${paymentMethod === 'ideal' ? 'border-primary bg-primary/5' : 'border-border/50'}`}>
                    <RadioGroupItem value="ideal" id="ideal" />
                    <Label htmlFor="ideal" className="flex items-center gap-3 cursor-pointer flex-1">
                      <div className="w-5 h-5 bg-[#CC0066] rounded flex items-center justify-center text-white text-xs font-bold">iD</div>
                      <span>{content.paymentMethods.ideal}</span>
                    </Label>
                  </div>

                  <div className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-colors ${paymentMethod === 'bancontact' ? 'border-primary bg-primary/5' : 'border-border/50'}`}>
                    <RadioGroupItem value="bancontact" id="bancontact" />
                    <Label htmlFor="bancontact" className="flex items-center gap-3 cursor-pointer flex-1">
                      <div className="w-5 h-5 bg-[#005498] rounded flex items-center justify-center text-white text-xs font-bold">BC</div>
                      <span>{content.paymentMethods.bancontact}</span>
                    </Label>
                  </div>

                  <div className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-colors ${paymentMethod === 'invoice' ? 'border-primary bg-primary/5' : 'border-border/50'}`}>
                    <RadioGroupItem value="invoice" id="invoice" />
                    <Label htmlFor="invoice" className="flex items-center gap-3 cursor-pointer flex-1">
                      <Building2 className="w-5 h-5" />
                      <span>{content.paymentMethods.invoice}</span>
                      <Badge variant="outline" className="ml-auto">Enterprise</Badge>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Terms */}
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="terms" 
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              />
              <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                {content.terms}{' '}
                <a href="/terms" className="text-primary hover:underline">{content.termsLink}</a>
              </Label>
            </div>

            {/* Pay Button - Mobile */}
            <div className="lg:hidden">
              <Button 
                className="w-full h-14 text-lg rounded-xl text-white"
                style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
                onClick={handleCheckout}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {content.processing}
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 mr-2" />
                    {content.payNow} - €{total.toFixed(2)}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Right - Order Summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-6">
              <Card className="border border-border/50 rounded-2xl">
                <CardHeader>
                  <h2 className="text-lg font-bold">{content.orderSummary}</h2>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Course */}
                  <div className="flex gap-4">
                    <div 
                      className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl"
                      style={{ background: course.gradient }}
                    >
                      {course.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{course.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {course.modules} modules • {course.duration} uur
                      </p>
                    </div>
                  </div>

                  {/* Coupon */}
                  <div className="flex gap-2">
                    <Input 
                      placeholder={content.coupon}
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="h-10 rounded-xl"
                      disabled={couponApplied}
                    />
                    <Button 
                      variant="outline" 
                      className="rounded-xl"
                      onClick={applyCoupon}
                      disabled={couponApplied || !couponCode}
                    >
                      {couponApplied ? <Check className="w-4 h-4" /> : content.apply}
                    </Button>
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-3 pt-4 border-t border-border/50">
                    <div className="flex justify-between text-sm">
                      <span>{content.subtotal}</span>
                      <span>€{subtotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm" style={{ color: BRAND.green }}>
                        <span>{content.discount} ({couponDiscount}%)</span>
                        <span>-€{discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{content.vat}</span>
                      <span>€{vat.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-3 border-t border-border/50">
                      <span>{content.total}</span>
                      <span>€{total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Pay Button - Desktop */}
                  <div className="hidden lg:block">
                    <Button 
                      className="w-full h-14 text-lg rounded-xl text-white"
                      style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
                      onClick={handleCheckout}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          {content.processing}
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5 mr-2" />
                          {content.payNow}
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Includes */}
                  <div className="space-y-2 pt-4 border-t border-border/50">
                    <p className="text-sm font-medium">{content.includes}:</p>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" style={{ color: BRAND.green }} />
                        <span>{content.lifetime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" style={{ color: BRAND.green }} />
                        <span>{content.certificate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" style={{ color: BRAND.green }} />
                        <span>{content.support}</span>
                      </div>
                    </div>
                  </div>

                  {/* Guarantee */}
                  <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: `${BRAND.green}10` }}>
                    <Shield className="w-8 h-8" style={{ color: BRAND.green }} />
                    <div>
                      <p className="font-medium text-sm">{content.guarantee}</p>
                      <p className="text-xs text-muted-foreground">
                        {isNL ? 'Niet tevreden? Geld terug!' : 'Not satisfied? Money back!'}
                      </p>
                    </div>
                  </div>

                  {/* Secure Badge */}
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Lock className="w-4 h-4" />
                    <span>{content.secure}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCheckout;
