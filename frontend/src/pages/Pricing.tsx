import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Check,
  X,
  Star,
  Zap,
  Shield,
  Users,
  Building2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Home,
  ArrowLeft,
  Crown,
  TrendingUp,
  Loader2,
  GraduationCap,
  BookOpen,
  Video,
  Award,
  Calendar,
  Play,
} from "lucide-react";

const BRAND = {
  purple: '#8B5CF6',
  pink: '#D946EF',
  green: '#22C55E',
  blue: '#3B82F6',
  amber: '#F59E0B',
  orange: '#EA580C',
};

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  tagline: string;
  price: number | null;
  period: string;
  description: string;
  features: PlanFeature[];
  icon: any;
  gradient: string;
  popular?: boolean;
  stripeMonthlyId?: string;
  stripeYearlyId?: string;
}

// CANONICAL PRICING — 4 per-user tiers, in lock-step with:
//   - backend/subscriptions/pricing_catalog_view.py (Finance offerte)
//   - backend/subscriptions/management/commands/setup_stripe_products.py (Stripe)
//   - inclufy-finance product_catalog_inclufy_ecosystem.sql seed
//   - DB SubscriptionPlan rows (api/v1/subscriptions/plans/)
// Any price change here MUST also update the four sources above —
// otherwise sales quotes / Stripe checkout / public page diverge.
//
// Tier ratios (well-tempered curve, 1.5-2× between adjacent tiers):
//   Starter      €25         Pro/Starter   = 1.96×
//   Professional €49         Biz/Pro       = 1.61×
//   Business     €79         Ent/Biz       = 1.52×
//   Enterprise   €120
//
// Features written in customer-benefit language, NOT implementation
// detail. The reader is a buyer, not a developer:
//   "Geavanceerde rollen & goedkeuringen"   not "6-role governance"
//   "AI-assistent voor notulen"             not "transcript → DOCX flow"
//   "Eigen AI-account"                      not "BYO LLM keys"
const plans: Plan[] = [
  {
    name: 'Starter',
    tagline: 'Voor zelfstandigen & kleine teams',
    price: 25,
    period: '/gebruiker/maand',
    description: 'Alles om projecten netjes te draaien',
    icon: Zap,
    gradient: 'from-purple-600 via-purple-500 to-indigo-600',
    features: [
      { text: '💻 Web + 📱 Mobiele app', included: true },
      { text: 'Onbeperkt aantal projecten', included: true },
      { text: 'Agile, Kanban en Waterfall methodes', included: true },
      { text: 'Taken, deadlines en team-toewijzing', included: true },
      { text: 'Basis dashboards & rapportage', included: true },
      { text: 'Tijdregistratie', included: true },
      { text: 'E-mail support', included: true },
    ],
  },
  {
    name: 'Professional',
    tagline: 'Meest Gekozen',
    price: 49,
    period: '/gebruiker/maand',
    description: 'Voor professionele PM-teams',
    icon: Crown,
    gradient: 'from-blue-600 via-blue-500 to-cyan-600',
    popular: true,
    features: [
      { text: 'Alles van Starter', included: true },
      { text: 'Geavanceerde rollen & goedkeuringen', included: true },
      { text: 'Documenten genereren (Word & PowerPoint)', included: true },
      { text: 'AI-assistent voor notulen en samenvattingen', included: true },
      { text: 'Gantt-charts & planning', included: true },
      { text: 'KPI dashboards', included: true },
      { text: 'Voorrang support', included: true },
    ],
  },
  {
    name: 'Business',
    tagline: 'Voor PMOs en grotere teams',
    price: 79,
    period: '/gebruiker/maand',
    description: 'Portfolio + advanced planning',
    icon: TrendingUp,
    gradient: 'from-pink-600 via-pink-500 to-rose-600',
    features: [
      { text: 'Alles van Professional', included: true },
      { text: 'Portfolio management (meerdere projecten gegroepeerd)', included: true },
      { text: 'Multi-workspace / afdelingen', included: true },
      { text: 'Advanced analytics & custom dashboards', included: true },
      { text: 'Resource planning (capaciteit per persoon)', included: true },
      { text: 'Standaard integraties (Slack, Teams, Drive)', included: true },
      { text: 'Voorrang op feature requests', included: true },
      { text: '24/5 support (uitgebreide uren)', included: true },
    ],
  },
  {
    name: 'Enterprise',
    tagline: 'Voor compliance-eisen + SLA',
    price: 120,
    period: '/gebruiker/maand',
    description: 'Volledige controle + compliance',
    icon: Building2,
    gradient: 'from-green-600 via-green-500 to-emerald-600',
    features: [
      { text: 'Alles van Business', included: true },
      { text: 'Eigen AI-account ("Bring your own AI")', included: true },
      { text: 'Geavanceerde data-encryptie', included: true },
      { text: 'Volledige audit trail & GDPR-export', included: true },
      { text: 'Digitale projectafsluiting', included: true },
      { text: 'SSO/SAML + 2FA + eigen domein', included: true },
      { text: 'SLA 99.9% + dedicated success manager', included: true },
      { text: 'Custom integraties (SAP, Jira — op aanvraag)', included: true },
    ],
  },
];

const PricingCard = ({ plan, isAnnual }: { plan: Plan; isAnnual: boolean }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const discountedPrice = plan.price && plan.price > 0 ? Math.round(plan.price * 0.9) : null;
  const displayPrice = isAnnual && discountedPrice ? discountedPrice : plan.price;

  const handleCTAClick = async () => {
    if (!plan.price && plan.price !== 0) {
      window.location.href = 'mailto:info@projextpal.com?subject=Enterprise Offerte Aanvraag';
      return;
    }

    // ALTIJD naar checkout, ook als niet ingelogd
    navigate(`/checkout?plan=${plan.name.toLowerCase()}&billing=${isAnnual ? 'yearly' : 'monthly'}`);
  };

  return (
    <div className={`relative group ${plan.popular ? 'scale-105' : ''}`}>
      {plan.popular && (
        <div 
          className="absolute -inset-1 bg-gradient-to-r opacity-75 blur-2xl group-hover:opacity-100 transition-opacity rounded-3xl"
          style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
        />
      )}

      <div 
        className={`relative bg-card/95 backdrop-blur-xl rounded-3xl p-8 border-2 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${
          plan.popular ? 'border-primary/50 shadow-2xl' : 'border-border/50 hover:border-primary/30'
        }`}
      >
        {plan.popular && (
          <div className="absolute -top-5 left-1/2 -translate-x-1/2">
            <div 
              className="px-6 py-2 rounded-full text-white text-sm font-bold shadow-lg flex items-center gap-2 animate-pulse"
              style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
            >
              <Star className="w-4 h-4 fill-white" />
              {plan.tagline}
            </div>
          </div>
        )}

        <div className="relative mb-6">
          <div 
            className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mx-auto shadow-xl transform group-hover:scale-110 transition-transform duration-300`}
          >
            <plan.icon className="w-10 h-10 text-white" />
          </div>
          <div className={`absolute inset-0 w-20 h-20 rounded-2xl bg-gradient-to-br ${plan.gradient} mx-auto blur-xl opacity-50`} />
        </div>

        <h3 className="text-2xl font-bold text-center mb-2">{plan.name}</h3>
        <p className="text-muted-foreground text-center text-sm mb-6">{plan.description}</p>

        <div className="text-center mb-8">
          {plan.price !== null ? (
            <>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold tracking-tight text-foreground">
                  {plan.price === 0 ? 'Gratis' : `€${displayPrice}`}
                </span>
                {plan.price > 0 && (
                  <span className="text-muted-foreground text-lg">{plan.period}</span>
                )}
              </div>
              {plan.price === 0 && (
                <p className="text-sm text-muted-foreground mt-2">7 dagen gratis proberen</p>
              )}
              {isAnnual && !!discountedPrice && plan.price > 0 && (
                <div className="mt-2">
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                    💰 Bespaar €{(plan.price - discountedPrice) * 12}/jaar
                  </Badge>
                </div>
              )}
            </>
          ) : (
            <div 
              className="text-5xl font-bold"
              style={{ 
                background: `linear-gradient(135deg, ${BRAND.green}, #10B981)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {plan.period}
            </div>
          )}
        </div>

        <div className="space-y-4 mb-8 min-h-[280px]">
          {plan.features.map((feature, i) => (
            <div key={i} className="flex items-start gap-3 group/item">
              <div 
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                  feature.included 
                    ? 'bg-green-500/10 text-green-600 group-hover/item:bg-green-500/20' 
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {feature.included ? (
                  <Check className="w-4 h-4" strokeWidth={3} />
                ) : (
                  <X className="w-4 h-4" />
                )}
              </div>
              <span className={`text-sm ${feature.included ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                {feature.text}
              </span>
            </div>
          ))}
        </div>

        <Button 
          className={`w-full h-14 rounded-xl font-bold text-base transition-all duration-300 transform hover:scale-105 ${
            plan.popular ? 'shadow-xl' : ''
          }`}
          style={plan.popular ? { 
            background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.pink})`,
            color: 'white',
          } : plan.price === 0 ? {
            background: `linear-gradient(135deg, ${BRAND.green}, #10B981)`,
            color: 'white',
          } : {}}
          variant={plan.popular || plan.price === 0 ? 'default' : 'outline'}
          onClick={handleCTAClick}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Bezig...
            </>
          ) : plan.price === null ? (
            <>
              Vraag Offerte Aan
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          ) : plan.price === 0 ? (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Start Gratis Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          ) : (
            user ? (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Selecteer Plan
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Start Nu
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )
          )}
        </Button>
      </div>
    </div>
  );
};

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const [isAnnual, setIsAnnual] = useState(false);
  const [mergedPlans, setMergedPlans] = useState<Plan[]>(plans);

  // Fetch plans from API and merge with hardcoded config
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/v1/subscriptions/plans/');
        if (response.ok) {
          const data = await response.json();
          
          // Merge API prices with hardcoded config
          const merged = plans.map(plan => {
            const apiPlan = data.find((p: any) => 
              p.name.toLowerCase() === plan.name.toLowerCase() && 
              p.plan_type === 'monthly'
            );
            
            if (apiPlan && apiPlan.price) {
              return {
                ...plan,
                price: parseFloat(apiPlan.price),
                stripeMonthlyId: apiPlan.stripe_price_id,
              };
            }
            return plan;
          });
          
          setMergedPlans(merged);
          console.log('Plans loaded from API:', merged.length);
        }
      } catch (error) {
        console.error('Failed to fetch plans:', error);
        // Keep hardcoded plans as fallback
      }
    };

    fetchPlans();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="gap-2 hover:bg-primary/10"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Terug</span>
            </Button>
            <div className="h-6 w-px bg-border" />
            <h2 className="font-bold text-xl">
              Proje<span style={{ color: BRAND.purple }}>X</span>tPal
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="gap-2 hover:bg-primary/10"
            >
              <Home className="w-4 h-4" />
              Home
            </Button>
            <Button
              size="sm"
              className="gap-2 shadow-lg"
              onClick={() => navigate('/login')}
              style={{ 
                background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})`,
                color: 'white',
              }}
            >
              <Sparkles className="w-4 h-4" />
              Aan de Slag
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-transparent" />
        <div className="absolute top-40 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-60 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-4xl mx-auto mb-20">
            <div 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold mb-8 border backdrop-blur-xl"
              style={{ 
                backgroundColor: `${BRAND.purple}10`,
                color: BRAND.purple,
                borderColor: `${BRAND.purple}20`,
              }}
            >
              <Sparkles className="w-4 h-4" />
              💎 Transparante Prijzen - Geen Verborgen Kosten
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Beheer Projecten{' '}
              <br className="hidden md:block" />
              <span 
                style={{ 
                  background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Met AI
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              AI-powered projectmanagement met slimme tijdregistratie. 
              <span className="text-foreground font-medium"> Kies het plan dat bij jouw team past.</span>
            </p>

            <div className="inline-flex items-center gap-1 p-1.5 bg-muted/50 backdrop-blur-xl rounded-full border border-border/50">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-8 py-3 rounded-full font-semibold transition-all ${
                  !isAnnual ? 'bg-background shadow-lg text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Maandelijks
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-8 py-3 rounded-full font-semibold transition-all relative ${
                  isAnnual ? 'bg-background shadow-lg text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Jaarlijks
                <Badge 
                  className="absolute -top-3 -right-3 text-xs font-bold shadow-lg animate-bounce"
                  style={{ backgroundColor: BRAND.green, color: 'white' }}
                >
                  -10%
                </Badge>
              </button>
            </div>
          </div>

          {/* Pricing Cards Grid - 4 tiers (Starter / Professional / Business / Enterprise) */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {mergedPlans.map((plan, index) => (
              <PricingCard key={index} plan={plan} isAnnual={isAnnual} />
            ))}
          </div>

          {/* ─── ProjeXtPal Academy ─── Separate product line ───────── */}
          {/* Academy is its own sub-brand (source_app="academy" in the
              Finance offerte catalog with SKUs ACA-LEARNER, ACA-CERT,
              ACA-BUNDLE-50). On the public pricing page we surface
              the 3 commercial offers + the Enterprise-tier bundle
              callout so a buyer who chose Enterprise sees they get
              5 learner-seats for free. */}
          <div className="max-w-7xl mx-auto mt-20">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold mb-6 border backdrop-blur-xl"
                style={{
                  backgroundColor: `${BRAND.amber}10`,
                  color: BRAND.orange,
                  borderColor: `${BRAND.amber}30`,
                }}
              >
                <GraduationCap className="w-4 h-4" />
                ProjeXtPal Academy
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-3">
                <span
                  style={{
                    background: `linear-gradient(135deg, ${BRAND.amber}, ${BRAND.orange})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Leer projectmanagement in de praktijk
                </span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Praktijkcursussen + <strong>Inclufy-erkenningscertificaat</strong> voor
                PRINCE2, Agile, Scrum, Waterfall, Lean Six Sigma en MSP. Ideale
                voorbereiding voor de officiële accreditatie-examens.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Individual Learner */}
              <Card className="relative overflow-hidden border-2 border-amber-200/60 dark:border-amber-900/40 bg-gradient-to-br from-amber-50/40 to-transparent dark:from-amber-900/10 hover:border-amber-400 transition-all hover:-translate-y-1 hover:shadow-2xl">
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-4 shadow-lg">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-1">Individual Learner</h3>
                  <p className="text-sm text-muted-foreground mb-4">Per persoon — leermateriaal alle methodieken</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-bold">€15</span>
                    <span className="text-muted-foreground">/maand</span>
                  </div>
                  <div className="space-y-2.5 mb-6 text-sm">
                    {[
                      'Praktijkmateriaal alle methodieken',
                      'PRINCE2 / Agile / Scrum / Kanban',
                      'Lean Six Sigma Green & Black Belt',
                      'Video tutorials & oefenopdrachten',
                      'Voortgangstracking & badges',
                      'Voorbereiding op officiële examens',
                      'E-mail support',
                    ].map((f, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="w-full h-11 font-bold"
                    style={{
                      background: `linear-gradient(135deg, ${BRAND.amber}, ${BRAND.orange})`,
                      color: 'white',
                    }}
                    onClick={() => navigate('/academy/checkout?plan=learner')}
                  >
                    Start leren
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* Course + Certificate */}
              <Card className="relative overflow-hidden border-2 border-orange-300 dark:border-orange-700/60 bg-gradient-to-br from-orange-50/60 to-amber-50/40 dark:from-orange-900/20 dark:to-amber-900/10 hover:-translate-y-1 hover:shadow-2xl transition-all">
                <div className="absolute top-4 right-4">
                  <Badge
                    className="font-bold"
                    style={{
                      background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.amber})`,
                      color: 'white',
                    }}
                  >
                    <Star className="w-3 h-3 mr-1 fill-white" />
                    Populair
                  </Badge>
                </div>
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4 shadow-lg">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-1">Course + Inclufy Cert</h3>
                  <p className="text-sm text-muted-foreground mb-4">Per cursus — Inclufy-erkenning, eenmalig</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-bold">€99</span>
                    <span className="text-muted-foreground">/cert</span>
                  </div>
                  <div className="space-y-2.5 mb-6 text-sm">
                    {[
                      'Volledige cursus + Inclufy-examen',
                      'Inclufy-erkenningscertificaat',
                      'Chain-anchored met /verify URL',
                      'PDF download + LinkedIn-deelbaar',
                      'Levenslange toegang tot het curriculum',
                      'Mentor-feedback bij eindopdracht',
                      'Goede basis voor officiële accreditatie',
                    ].map((f, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="w-full h-11 font-bold"
                    style={{
                      background: `linear-gradient(135deg, ${BRAND.orange}, #DC2626)`,
                      color: 'white',
                    }}
                    onClick={() => navigate('/academy')}
                  >
                    Bekijk certificeringen
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* Team Bundle */}
              <Card className="relative overflow-hidden border-2 border-amber-200/60 dark:border-amber-900/40 bg-gradient-to-br from-amber-50/40 to-transparent dark:from-amber-900/10 hover:border-amber-400 transition-all hover:-translate-y-1 hover:shadow-2xl">
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-600 to-yellow-600 flex items-center justify-center mb-4 shadow-lg">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-1">Team Bundle</h3>
                  <p className="text-sm text-muted-foreground mb-4">50 learners — €12/learner</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-bold">€600</span>
                    <span className="text-muted-foreground">/maand</span>
                  </div>
                  <div className="space-y-2.5 mb-6 text-sm">
                    {[
                      'Tot 50 learners — €12 per learner',
                      'Eigen team-dashboard met progressie',
                      'Bulk-uitnodigingen via e-mail / CSV',
                      'Team-leaderboard & badges',
                      'Manager rapportages (CSV / PDF)',
                      'Priority support + onboarding-sessie',
                    ].map((f, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="w-full h-11 font-bold"
                    variant="outline"
                    onClick={() => window.location.href = 'mailto:info@projextpal.com?subject=Academy Team Bundle aanvraag'}
                  >
                    Vraag offerte aan
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Enterprise-tier bundle callout */}
            <div
              className="mt-8 rounded-2xl p-6 border-2 border-dashed text-center backdrop-blur-xl"
              style={{
                borderColor: `${BRAND.green}40`,
                background: `linear-gradient(135deg, ${BRAND.green}08, ${BRAND.amber}08)`,
              }}
            >
              <div className="flex items-center justify-center gap-3 mb-2">
                <Sparkles className="w-5 h-5" style={{ color: BRAND.green }} />
                <p className="font-bold text-lg">
                  ProjeXtPal Enterprise klanten
                </p>
                <Sparkles className="w-5 h-5" style={{ color: BRAND.green }} />
              </div>
              <p className="text-muted-foreground">
                Krijg <span className="font-bold text-foreground">5 Academy learner-seats gratis</span> inbegrepen
                bij je Enterprise-abonnement.{' '}
                <a href="mailto:info@projextpal.com?subject=Enterprise Academy seats activeren" className="underline font-semibold" style={{ color: BRAND.green }}>
                  Activeer ze hier →
                </a>
              </p>
            </div>

            {/* Disclaimer — Inclufy-cert is NOT the official accreditation */}
            <div className="mt-6 rounded-xl p-5 bg-muted/40 border border-border/60">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mt-0.5">
                  <BookOpen className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                </div>
                <div className="text-sm text-muted-foreground leading-relaxed">
                  <p className="font-semibold text-foreground mb-1">
                    Over onze certificering
                  </p>
                  <p>
                    Onze certificaten zijn <strong className="text-foreground">Inclufy-erkenningen</strong> —
                    bewijs dat je de methodologie in de praktijk beheerst. Dit is
                    <strong className="text-foreground"> géén vervanging</strong> voor
                    officiële accreditatie. Voor de echte titel ga je naar de instantie:
                    <span className="block mt-2 text-xs">
                      <strong>PRINCE2</strong> → APMG (axelos.com) ·{' '}
                      <strong>Scrum (CSM / PSM)</strong> → Scrum Alliance of Scrum.org ·{' '}
                      <strong>Lean Six Sigma</strong> → IASSC of ASQ ·{' '}
                      <strong>SAFe</strong> → Scaled Agile, Inc. ·{' '}
                      <strong>MSP</strong> → APMG
                    </span>
                    <span className="block mt-2">
                      Onze cursussen zijn uitstekende voorbereiding op die examens,
                      maar het officiële diploma behaal je via die instantie zelf.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-12 items-center mt-20 pt-16 border-t border-border/50">
            {[
              { icon: Shield, title: '100% Veilig', desc: 'SSL versleuteld' },
              { icon: CheckCircle2, title: 'Direct Actief', desc: 'Meteen aan de slag' },
              { icon: TrendingUp, title: 'Opzegbaar', desc: 'Geen contract' },
            ].map((badge, i) => (
              <div key={i} className="text-center">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <badge.icon className="w-6 h-6" style={{ color: BRAND.green }} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-lg">{badge.title}</div>
                    <p className="text-sm text-muted-foreground">{badge.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${BRAND.purple}05, ${BRAND.pink}05)` }}
        />
        
        <div className="container mx-auto px-4 relative">
          <div 
            className="max-w-5xl mx-auto rounded-3xl p-12 md:p-16 text-center relative overflow-hidden border backdrop-blur-xl"
            style={{ 
              background: `linear-gradient(135deg, ${BRAND.purple}10, ${BRAND.pink}10)`,
              borderColor: `${BRAND.purple}20`,
            }}
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />

            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Klaar om te starten?
              </h2>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Begin vandaag nog met slimmer projectmanagement en verhoog je productiviteit met AI
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="gap-3 h-14 px-8 text-lg font-bold shadow-2xl transform hover:scale-105 transition-all"
                  style={{ 
                    background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})`,
                    color: 'white',
                  }}
                  onClick={() => navigate('/login')}
                >
                  <Sparkles className="w-5 h-5" />
                  Start Gratis Proefperiode
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="gap-3 h-14 px-8 text-lg font-bold backdrop-blur-xl"
                  onClick={() => navigate('/')}
                >
                  <Home className="w-5 h-5" />
                  Terug naar Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Demo Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button
          size="lg"
          onClick={() => navigate('/checkout?plan=demo&billing=monthly')}
          className="shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 gap-3 rounded-full px-8 py-6 text-base font-bold"
          style={{ 
            background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.amber})`,
            color: 'white',
          }}
        >
          <Calendar className="w-5 h-5" />
          {language === 'nl' ? '📅 Vraag Demo Aan' : '📅 Request Demo'}
        </Button>
      </div>
    </div>
  );
};

export default Pricing;