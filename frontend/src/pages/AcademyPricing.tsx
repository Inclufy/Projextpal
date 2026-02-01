import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Check, X, Sparkles, GraduationCap, BookOpen, Award, Clock, 
  Users, Building2, Zap, Shield, Star, ChevronRight, PlayCircle,
  Globe, Moon, Sun, LogIn, Rocket, Menu, ArrowRight, MessageSquare,
  Download, Infinity, HeadphonesIcon, FileText, Target, Brain
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useLanguage, languages } from "@/contexts/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
          <linearGradient id={`xGrad-pricing-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
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
        <polygon fill={`url(#xGrad-pricing-${size})`} points="1656 586 1235 1008 915 1008 1337 586 973 222 1292 222 1656 586" />
      </svg>
      <span className={`font-bold ${text}`}>
        Proje<span style={{ color: BRAND.pink }}>X</span>tPal
      </span>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
const AcademyPricing = () => {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const [isYearly, setIsYearly] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isNL = language === 'nl';

  // ============================================
  // TRANSLATIONS
  // ============================================
  const content = {
    nav: {
      home: 'Home',
      courses: isNL ? 'Cursussen' : 'Courses',
      pricing: isNL ? 'Prijzen' : 'Pricing',
      login: isNL ? 'Inloggen' : 'Login',
      startFree: isNL ? 'Start Gratis' : 'Start Free',
    },
    hero: {
      badge: isNL ? '💰 Transparante Prijzen' : '💰 Transparent Pricing',
      title: isNL ? 'Investeer in je' : 'Invest in your',
      titleHighlight: isNL ? 'Professionele Groei' : 'Professional Growth',
      subtitle: isNL 
        ? 'Kies het plan dat past bij jouw leerdoelen. Van gratis introductie tot volledige certificeringsprogramma\'s.'
        : 'Choose the plan that fits your learning goals. From free introduction to full certification programs.',
    },
    billing: {
      monthly: isNL ? 'Maandelijks' : 'Monthly',
      yearly: isNL ? 'Jaarlijks' : 'Yearly',
      savePercent: isNL ? 'Bespaar 20%' : 'Save 20%',
    },
    plans: {
      free: {
        name: isNL ? 'Gratis' : 'Free',
        description: isNL ? 'Perfect om te starten' : 'Perfect to get started',
        price: '€0',
        priceYearly: '€0',
        period: isNL ? '/altijd' : '/forever',
        cta: isNL ? 'Start Gratis' : 'Start Free',
        features: [
          { text: isNL ? '3 gratis cursussen' : '3 free courses', included: true },
          { text: isNL ? 'Basis certificaten' : 'Basic certificates', included: true },
          { text: isNL ? 'Community toegang' : 'Community access', included: true },
          { text: isNL ? 'E-mail support' : 'Email support', included: true },
          { text: isNL ? 'Alle premium cursussen' : 'All premium courses', included: false },
          { text: isNL ? 'Officiële certificaten' : 'Official certificates', included: false },
          { text: isNL ? 'AI Leerassistent' : 'AI Learning Assistant', included: false },
          { text: isNL ? 'Downloadbare resources' : 'Downloadable resources', included: false },
        ],
      },
      professional: {
        name: 'Professional',
        description: isNL ? 'Voor serieuze professionals' : 'For serious professionals',
        price: '€29',
        priceYearly: '€23',
        period: isNL ? '/maand' : '/month',
        cta: isNL ? 'Start 14 Dagen Gratis' : 'Start 14-Day Free Trial',
        popular: true,
        features: [
          { text: isNL ? 'Alle cursussen onbeperkt' : 'All courses unlimited', included: true },
          { text: isNL ? 'Officiële certificaten' : 'Official certificates', included: true },
          { text: isNL ? 'AI Leerassistent' : 'AI Learning Assistant', included: true },
          { text: isNL ? 'Downloadbare resources' : 'Downloadable resources', included: true },
          { text: isNL ? 'Prioriteit support' : 'Priority support', included: true },
          { text: isNL ? 'Voortgang tracking' : 'Progress tracking', included: true },
          { text: isNL ? 'Team dashboards' : 'Team dashboards', included: false },
          { text: isNL ? 'Aangepaste leertrajecten' : 'Custom learning paths', included: false },
        ],
      },
      team: {
        name: 'Team',
        description: isNL ? 'Voor teams tot 25 personen' : 'For teams up to 25 people',
        price: '€49',
        priceYearly: '€39',
        period: isNL ? '/gebruiker/maand' : '/user/month',
        cta: isNL ? 'Probeer Team Plan' : 'Try Team Plan',
        features: [
          { text: isNL ? 'Alles van Professional' : 'Everything in Professional', included: true },
          { text: isNL ? 'Team dashboards' : 'Team dashboards', included: true },
          { text: isNL ? 'Voortgangsrapporten' : 'Progress reports', included: true },
          { text: isNL ? 'Admin beheer' : 'Admin management', included: true },
          { text: isNL ? 'Bulk uitnodigingen' : 'Bulk invitations', included: true },
          { text: isNL ? 'Dedicated support' : 'Dedicated support', included: true },
          { text: isNL ? 'SSO integratie' : 'SSO integration', included: false },
          { text: isNL ? 'Aangepaste content' : 'Custom content', included: false },
        ],
      },
      enterprise: {
        name: 'Enterprise',
        description: isNL ? 'Voor grote organisaties' : 'For large organizations',
        price: isNL ? 'Op maat' : 'Custom',
        priceYearly: isNL ? 'Op maat' : 'Custom',
        period: '',
        cta: isNL ? 'Vraag Offerte Aan' : 'Request Quote',
        features: [
          { text: isNL ? 'Alles van Team' : 'Everything in Team', included: true },
          { text: isNL ? 'Onbeperkte gebruikers' : 'Unlimited users', included: true },
          { text: isNL ? 'SSO/SAML integratie' : 'SSO/SAML integration', included: true },
          { text: isNL ? 'Aangepaste leertrajecten' : 'Custom learning paths', included: true },
          { text: isNL ? 'White-label opties' : 'White-label options', included: true },
          { text: isNL ? 'API toegang' : 'API access', included: true },
          { text: isNL ? 'Dedicated success manager' : 'Dedicated success manager', included: true },
          { text: isNL ? 'On-site training opties' : 'On-site training options', included: true },
        ],
      },
    },
    coursepricing: {
      title: isNL ? 'Of koop losse cursussen' : 'Or buy individual courses',
      subtitle: isNL ? 'Eenmalige aankoop met levenslange toegang' : 'One-time purchase with lifetime access',
    },
    courses: [
      { name: 'Project Management Fundamentals', price: 0, originalPrice: 99, badge: isNL ? 'Gratis' : 'Free' },
      { name: 'Agile & Scrum Mastery', price: 49, originalPrice: 99, badge: null },
      { name: 'SAFe & Scaling Agile', price: 79, originalPrice: 149, badge: null },
      { name: 'Program Management Professional', price: 99, originalPrice: 199, badge: null },
      { name: 'PRINCE2 Foundation & Practitioner', price: 149, originalPrice: 249, badge: 'Bestseller' },
      { name: 'Six Sigma Green Belt', price: 129, originalPrice: 199, badge: null },
      { name: 'Leadership for Project Managers', price: 0, originalPrice: 79, badge: isNL ? 'Gratis' : 'Free' },
      { name: 'Risk Management Masterclass', price: 69, originalPrice: 129, badge: isNL ? 'Nieuw' : 'New' },
    ],
    comparison: {
      title: isNL ? 'Vergelijk Plannen' : 'Compare Plans',
      features: [
        { name: isNL ? 'Aantal cursussen' : 'Number of courses', free: '3', pro: isNL ? 'Onbeperkt' : 'Unlimited', team: isNL ? 'Onbeperkt' : 'Unlimited', enterprise: isNL ? 'Onbeperkt' : 'Unlimited' },
        { name: isNL ? 'Certificaten' : 'Certificates', free: isNL ? 'Basis' : 'Basic', pro: isNL ? 'Officieel' : 'Official', team: isNL ? 'Officieel' : 'Official', enterprise: isNL ? 'Aangepast' : 'Custom' },
        { name: isNL ? 'AI Assistent' : 'AI Assistant', free: false, pro: true, team: true, enterprise: true },
        { name: isNL ? 'Downloadbare resources' : 'Downloadable resources', free: false, pro: true, team: true, enterprise: true },
        { name: isNL ? 'Team management' : 'Team management', free: false, pro: false, team: true, enterprise: true },
        { name: isNL ? 'Voortgangsrapporten' : 'Progress reports', free: false, pro: true, team: true, enterprise: true },
        { name: isNL ? 'SSO integratie' : 'SSO integration', free: false, pro: false, team: false, enterprise: true },
        { name: isNL ? 'API toegang' : 'API access', free: false, pro: false, team: false, enterprise: true },
        { name: isNL ? 'Dedicated support' : 'Dedicated support', free: false, pro: false, team: true, enterprise: true },
        { name: isNL ? 'Aangepaste content' : 'Custom content', free: false, pro: false, team: false, enterprise: true },
      ],
    },
    faq: {
      title: isNL ? 'Veelgestelde Vragen' : 'Frequently Asked Questions',
      items: [
        { 
          q: isNL ? 'Kan ik op elk moment opzeggen?' : 'Can I cancel anytime?',
          a: isNL ? 'Ja, je kunt je abonnement op elk moment opzeggen. Je behoudt toegang tot het einde van je factureringsperiode.' : 'Yes, you can cancel your subscription at any time. You\'ll retain access until the end of your billing period.'
        },
        { 
          q: isNL ? 'Wat gebeurt er met mijn certificaten als ik opzeg?' : 'What happens to my certificates if I cancel?',
          a: isNL ? 'Je behoudt alle behaalde certificaten permanent, ook na opzegging.' : 'You keep all earned certificates permanently, even after cancellation.'
        },
        { 
          q: isNL ? 'Kan ik van plan wisselen?' : 'Can I switch plans?',
          a: isNL ? 'Ja, je kunt op elk moment upgraden of downgraden. Bij een upgrade wordt het verschil pro-rata berekend.' : 'Yes, you can upgrade or downgrade at any time. When upgrading, the difference is calculated pro-rata.'
        },
        { 
          q: isNL ? 'Is er een gratis proefperiode?' : 'Is there a free trial?',
          a: isNL ? 'Ja! Professional en Team plannen hebben een 14-daagse gratis proefperiode zonder creditcard.' : 'Yes! Professional and Team plans have a 14-day free trial without credit card.'
        },
        { 
          q: isNL ? 'Bieden jullie kortingen voor non-profits?' : 'Do you offer discounts for non-profits?',
          a: isNL ? 'Ja, we bieden speciale tarieven voor non-profits en onderwijsinstellingen. Neem contact op voor meer informatie.' : 'Yes, we offer special rates for non-profits and educational institutions. Contact us for more information.'
        },
      ],
    },
    cta: {
      title: isNL ? 'Klaar om te beginnen?' : 'Ready to get started?',
      subtitle: isNL ? 'Start vandaag nog met je eerste cursus' : 'Start your first course today',
      button: isNL ? 'Bekijk Cursussen' : 'View Courses',
    },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <button onClick={() => navigate('/landing')} className="flex items-center gap-2">
                <ProjeXtPalLogo size="sm" />
              </button>
              
              <div className="hidden md:flex items-center gap-6">
                <button onClick={() => navigate('/landing')} className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                  {content.nav.home}
                </button>
                <button onClick={() => navigate('/academy/marketplace')} className="text-muted-foreground hover:text-foreground transition-colors font-medium flex items-center gap-1">
                  <GraduationCap className="w-4 h-4" />
                  {content.nav.courses}
                </button>
                <button className="text-primary font-medium">
                  {content.nav.pricing}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Globe className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {languages.map((lang) => (
                    <DropdownMenuItem key={lang.code} onClick={() => setLanguage(lang.code)}>
                      <span className="mr-2">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="rounded-full">
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
              
              <Button variant="ghost" className="hidden md:inline-flex gap-2" onClick={() => navigate('/login')}>
                <LogIn className="h-4 w-4" />{content.nav.login}
              </Button>
              
              <Button 
                className="hidden md:inline-flex gap-2 text-white"
                style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
                onClick={() => navigate('/login')}
              >
                <Rocket className="h-4 w-4" />{content.nav.startFree}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ background: `linear-gradient(180deg, ${BRAND.purple}10 0%, transparent 50%, ${BRAND.green}05 100%)` }} />
        
        <div className="relative container mx-auto px-4 text-center">
          <Badge className="mb-6 px-4 py-2" style={{ backgroundColor: `${BRAND.purple}15`, color: BRAND.purple }}>
            <Sparkles className="w-4 h-4 mr-2" />
            {content.hero.badge}
          </Badge>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            {content.hero.title}{' '}
            <span style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {content.hero.titleHighlight}
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            {content.hero.subtitle}
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`font-medium ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              {content.billing.monthly}
            </span>
            <Switch 
              checked={isYearly} 
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-purple-600"
            />
            <span className={`font-medium ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              {content.billing.yearly}
            </span>
            {isYearly && (
              <Badge style={{ backgroundColor: BRAND.green }} className="text-white">
                {content.billing.savePercent}
              </Badge>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {/* Free Plan */}
            <Card className="border border-border/50 rounded-2xl relative">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-1">{content.plans.free.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{content.plans.free.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold">{content.plans.free.price}</span>
                  <span className="text-muted-foreground">{content.plans.free.period}</span>
                </div>

                <Button 
                  className="w-full mb-6 rounded-xl"
                  variant="outline"
                  onClick={() => navigate('/login')}
                >
                  {content.plans.free.cta}
                </Button>

                <div className="space-y-3">
                  {content.plans.free.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      {feature.included ? (
                        <Check className="w-4 h-4" style={{ color: BRAND.green }} />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className={feature.included ? '' : 'text-muted-foreground'}>{feature.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Professional Plan */}
            <Card className="border-2 rounded-2xl relative shadow-xl" style={{ borderColor: BRAND.purple }}>
              <Badge 
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-white"
                style={{ backgroundColor: BRAND.purple }}
              >
                {isNL ? 'Meest Populair' : 'Most Popular'}
              </Badge>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-1">{content.plans.professional.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{content.plans.professional.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    {isYearly ? content.plans.professional.priceYearly : content.plans.professional.price}
                  </span>
                  <span className="text-muted-foreground">{content.plans.professional.period}</span>
                </div>

                <Button 
                  className="w-full mb-6 rounded-xl text-white"
                  style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
                  onClick={() => navigate('/checkout?plan=professional')}
                >
                  {content.plans.professional.cta}
                </Button>

                <div className="space-y-3">
                  {content.plans.professional.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      {feature.included ? (
                        <Check className="w-4 h-4" style={{ color: BRAND.green }} />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className={feature.included ? '' : 'text-muted-foreground'}>{feature.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Team Plan */}
            <Card className="border border-border/50 rounded-2xl relative">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-1">{content.plans.team.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{content.plans.team.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    {isYearly ? content.plans.team.priceYearly : content.plans.team.price}
                  </span>
                  <span className="text-muted-foreground">{content.plans.team.period}</span>
                </div>

                <Button 
                  className="w-full mb-6 rounded-xl"
                  variant="outline"
                  style={{ borderColor: BRAND.purple, color: BRAND.purple }}
                  onClick={() => navigate('/checkout?plan=team')}
                >
                  {content.plans.team.cta}
                </Button>

                <div className="space-y-3">
                  {content.plans.team.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      {feature.included ? (
                        <Check className="w-4 h-4" style={{ color: BRAND.green }} />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className={feature.included ? '' : 'text-muted-foreground'}>{feature.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="border border-border/50 rounded-2xl relative bg-gradient-to-br from-background to-muted/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold">{content.plans.enterprise.name}</h3>
                  <Building2 className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm mb-4">{content.plans.enterprise.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold">{content.plans.enterprise.price}</span>
                </div>

                <Button 
                  className="w-full mb-6 rounded-xl"
                  variant="outline"
                  onClick={() => navigate('/academy/quote')}
                >
                  {content.plans.enterprise.cta}
                </Button>

                <div className="space-y-3">
                  {content.plans.enterprise.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4" style={{ color: BRAND.green }} />
                      <span>{feature.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Individual Course Pricing */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">{content.coursepricing.title}</h2>
            <p className="text-muted-foreground">{content.coursepricing.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {content.courses.map((course, i) => (
              <Card 
                key={i} 
                className="border border-border/50 rounded-xl hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => navigate(`/academy/course/${i + 1}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                      {course.name}
                    </h4>
                    {course.badge && (
                      <Badge 
                        className="text-xs ml-2 shrink-0"
                        style={{ 
                          backgroundColor: course.badge === 'Bestseller' ? BRAND.orange : 
                                         course.badge === 'Nieuw' || course.badge === 'New' ? BRAND.green :
                                         BRAND.green,
                          color: 'white'
                        }}
                      >
                        {course.badge}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    {course.price === 0 ? (
                      <span className="text-lg font-bold" style={{ color: BRAND.green }}>
                        {isNL ? 'Gratis' : 'Free'}
                      </span>
                    ) : (
                      <>
                        <span className="text-lg font-bold">€{course.price}</span>
                        <span className="text-sm text-muted-foreground line-through">€{course.originalPrice}</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button 
              variant="outline" 
              className="rounded-xl"
              onClick={() => navigate('/academy/marketplace')}
            >
              {isNL ? 'Bekijk alle cursussen' : 'View all courses'}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">{content.comparison.title}</h2>
          
          <div className="max-w-5xl mx-auto overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4 font-medium">{isNL ? 'Functie' : 'Feature'}</th>
                  <th className="py-4 px-4 text-center font-medium">Free</th>
                  <th className="py-4 px-4 text-center font-medium" style={{ color: BRAND.purple }}>Professional</th>
                  <th className="py-4 px-4 text-center font-medium">Team</th>
                  <th className="py-4 px-4 text-center font-medium">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {content.comparison.features.map((feature, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-4 px-4 text-sm">{feature.name}</td>
                    <td className="py-4 px-4 text-center">
                      {typeof feature.free === 'boolean' ? (
                        feature.free ? (
                          <Check className="w-5 h-5 mx-auto" style={{ color: BRAND.green }} />
                        ) : (
                          <X className="w-5 h-5 mx-auto text-muted-foreground" />
                        )
                      ) : (
                        <span className="text-sm">{feature.free}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center" style={{ backgroundColor: `${BRAND.purple}05` }}>
                      {typeof feature.pro === 'boolean' ? (
                        feature.pro ? (
                          <Check className="w-5 h-5 mx-auto" style={{ color: BRAND.green }} />
                        ) : (
                          <X className="w-5 h-5 mx-auto text-muted-foreground" />
                        )
                      ) : (
                        <span className="text-sm font-medium">{feature.pro}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {typeof feature.team === 'boolean' ? (
                        feature.team ? (
                          <Check className="w-5 h-5 mx-auto" style={{ color: BRAND.green }} />
                        ) : (
                          <X className="w-5 h-5 mx-auto text-muted-foreground" />
                        )
                      ) : (
                        <span className="text-sm">{feature.team}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {typeof feature.enterprise === 'boolean' ? (
                        feature.enterprise ? (
                          <Check className="w-5 h-5 mx-auto" style={{ color: BRAND.green }} />
                        ) : (
                          <X className="w-5 h-5 mx-auto text-muted-foreground" />
                        )
                      ) : (
                        <span className="text-sm">{feature.enterprise}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">{content.faq.title}</h2>
          
          <div className="max-w-3xl mx-auto space-y-4">
            {content.faq.items.map((item, i) => (
              <Card key={i} className="border border-border/50 rounded-xl">
                <CardContent className="p-6">
                  <h4 className="font-bold mb-2">{item.q}</h4>
                  <p className="text-muted-foreground text-sm">{item.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center rounded-3xl p-12" style={{ background: `linear-gradient(135deg, ${BRAND.purple}10, ${BRAND.pink}10)` }}>
            <GraduationCap className="w-16 h-16 mx-auto mb-6" style={{ color: BRAND.purple }} />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">{content.cta.title}</h2>
            <p className="text-muted-foreground mb-8">{content.cta.subtitle}</p>
            <Button 
              size="lg"
              className="rounded-xl text-white"
              style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
              onClick={() => navigate('/academy/marketplace')}
            >
              {content.cta.button}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <ProjeXtPalLogo size="sm" />
            <p className="text-muted-foreground text-sm">© 2025 ProjeXtPal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AcademyPricing;