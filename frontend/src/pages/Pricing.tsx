import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Smartphone,
  Monitor,
} from "lucide-react";

// Brand colors
const BRAND = {
  purple: '#8B5CF6',
  pink: '#D946EF',
  green: '#22C55E',
  blue: '#3B82F6',
};

// Pricing Plans
const pricingPlans = [
  {
    name: 'Starter',
    price: 29,
    period: '/maand',
    tagline: 'Alleen via Mobile App',
    description: 'Ideaal voor individuen en kleine projecten',
    features: [
      { text: 'Alleen toegang via mobile app', included: true, icon: 'smartphone' },
      { text: '1 gebruiker', included: true },
      { text: '5 projecten', included: true },
      { text: 'Tijdregistratie per project', included: true },
      { text: 'Taakbeheer & planning', included: true },
      { text: 'Persoonlijk dashboard', included: true },
      { text: 'AI Helpfunctie', included: true },
      { text: 'Basis rapportages', included: true },
      { text: 'E-mail support', included: true },
      { text: 'Web toegang', included: false, icon: 'monitor' },
      { text: 'Programmamanagement', included: false },
      { text: 'Team collaboration', included: false },
      { text: 'Methodologie templates', included: false },
    ],
    color: BRAND.purple,
    gradient: 'from-purple-500 to-indigo-600',
    icon: Zap,
    popular: false,
  },
  {
    name: 'Professional',
    price: 49,
    period: '/maand',
    tagline: 'Meest Populair',
    description: 'Voor serieuze project managers',
    features: [
      { text: 'Web + Mobile app toegang', included: true, icon: 'platforms' },
      { text: '1 gebruiker', included: true },
      { text: '10 projecten', included: true },
      { text: 'Alles van Starter', included: true },
      { text: 'Programmamanagement', included: true },
      { text: 'Volledige planning & Gantt charts', included: true },
      { text: 'Scope & risicomanagement', included: true },
      { text: 'Resource management', included: true },
      { text: 'AI Project Assistant', included: true },
      { text: 'Geavanceerde rapportages', included: true },
      { text: 'Methodologie templates (Agile, PRINCE2, etc)', included: true },
      { text: 'Prioriteit support', included: true },
      { text: 'Export mogelijkheden', included: true },
      { text: 'Team collaboration', included: false },
      { text: 'SSO integratie', included: false },
    ],
    color: BRAND.blue,
    gradient: 'from-blue-500 to-cyan-600',
    icon: Star,
    popular: true,
  },
  {
    name: 'Team',
    price: 39,
    period: '/gebruiker/maand',
    tagline: 'Voor teams tot 25 personen',
    description: 'Samenwerken aan projecten',
    features: [
      { text: 'Web + Mobile app toegang', included: true, icon: 'platforms' },
      { text: 'Tot 25 gebruikers', included: true },
      { text: 'Onbeperkte projecten', included: true },
      { text: 'Alles van Professional', included: true },
      { text: 'Multi-user collaboration', included: true },
      { text: 'Team dashboards & KPI\'s', included: true },
      { text: 'Gedeelde tijdregistratie', included: true },
      { text: 'Portfolio management', included: true },
      { text: 'Voortgangsrapporten per team', included: true },
      { text: 'Admin beheer & permissies', included: true },
      { text: 'Bulk acties & templates', included: true },
      { text: 'Dedicated support', included: true },
      { text: 'Aangepaste workflows', included: false },
      { text: 'SSO integratie', included: false },
    ],
    color: BRAND.pink,
    gradient: 'from-pink-500 to-rose-600',
    icon: Users,
    popular: false,
  },
  {
    name: 'Enterprise',
    price: null,
    period: 'Op maat',
    tagline: 'Voor grote organisaties',
    description: 'Volledige controle en flexibiliteit',
    features: [
      { text: 'Web + Mobile app + White-label optie', included: true, icon: 'platforms-plus' },
      { text: 'Onbeperkte gebruikers', included: true },
      { text: 'Onbeperkte projecten & programma\'s', included: true },
      { text: 'Alles van Team', included: true },
      { text: 'SSO/SAML integratie', included: true },
      { text: 'API toegang & webhooks', included: true },
      { text: 'Aangepaste workflows & automations', included: true },
      { text: 'Advanced security & compliance', included: true },
      { text: 'Dedicated success manager', included: true },
      { text: 'On-premise deployment optie', included: true },
      { text: 'Priority support (SLA)', included: true },
      { text: 'Custom integraties', included: true },
    ],
    color: BRAND.green,
    gradient: 'from-green-500 to-emerald-600',
    icon: Building2,
    popular: false,
  },
];

// Comparison features
const comparisonFeatures = [
  { category: 'Toegang', features: [
    { name: 'Platform toegang', free: 'Alleen App', professional: 'Web + App', team: 'Web + App', enterprise: 'Web + App + White-label' },
    { name: 'iOS app', free: true, professional: true, team: true, enterprise: true },
    { name: 'Android app', free: true, professional: true, team: true, enterprise: true },
    { name: 'Web platform', free: false, professional: true, team: true, enterprise: true },
  ]},
  { category: 'Projectmanagement', features: [
    { name: 'Aantal projecten', free: '5', professional: '10', team: 'Onbeperkt', enterprise: 'Onbeperkt' },
    { name: 'Aantal gebruikers', free: '1', professional: '1', team: 'Tot 25', enterprise: 'Onbeperkt' },
    { name: 'Tijdregistratie', free: true, professional: true, team: true, enterprise: true },
    { name: 'Taakbeheer', free: true, professional: true, team: true, enterprise: true },
    { name: 'Gantt charts', free: false, professional: true, team: true, enterprise: true },
    { name: 'Programmamanagement', free: false, professional: true, team: true, enterprise: true },
  ]},
  { category: 'Features & Functionaliteit', features: [
    { name: 'AI Assistent', free: 'Basis', professional: 'Advanced', team: 'Advanced', enterprise: 'Custom' },
    { name: 'Methodologie templates', free: false, professional: true, team: true, enterprise: true },
    { name: 'Resource management', free: false, professional: true, team: true, enterprise: true },
    { name: 'Portfolio management', free: false, professional: false, team: true, enterprise: true },
    { name: 'Custom workflows', free: false, professional: false, team: false, enterprise: true },
  ]},
  { category: 'Rapportages & Analytics', features: [
    { name: 'Basis rapportages', free: true, professional: true, team: true, enterprise: true },
    { name: 'Geavanceerde rapportages', free: false, professional: true, team: true, enterprise: true },
    { name: 'KPI dashboards', free: false, professional: false, team: true, enterprise: true },
    { name: 'Export mogelijkheden', free: false, professional: true, team: true, enterprise: true },
  ]},
  { category: 'Support & Beveiliging', features: [
    { name: 'E-mail support', free: true, professional: true, team: true, enterprise: true },
    { name: 'Prioriteit support', free: false, professional: true, team: true, enterprise: true },
    { name: 'Dedicated success manager', free: false, professional: false, team: false, enterprise: true },
    { name: 'SSO/SAML integratie', free: false, professional: false, team: false, enterprise: true },
    { name: 'API toegang', free: false, professional: false, team: false, enterprise: true },
    { name: 'SLA garantie', free: false, professional: false, team: false, enterprise: true },
  ]},
];

const PricingCard = ({ plan, isAnnual }: { plan: typeof pricingPlans[0], isAnnual: boolean }) => {
  const navigate = useNavigate();
  const discountedPrice = plan.price ? Math.round(plan.price * 0.9) : null;
  const displayPrice = isAnnual && discountedPrice ? discountedPrice : plan.price;

  return (
    <div 
      className={`relative bg-card rounded-3xl p-8 border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
        plan.popular ? 'border-primary shadow-xl scale-105' : 'border-border'
      }`}
      style={plan.popular ? { borderColor: plan.color } : {}}
    >
      {/* Popular Badge */}
      {plan.popular && (
        <div 
          className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full text-white text-sm font-bold shadow-lg flex items-center gap-2"
          style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
        >
          <Star className="w-4 h-4 fill-white" />
          {plan.tagline}
        </div>
      )}

      {/* Icon */}
      <div 
        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-6 mx-auto`}
      >
        <plan.icon className="w-8 h-8 text-white" />
      </div>

      {/* Plan Name */}
      <h3 className="text-2xl font-bold text-center mb-2">{plan.name}</h3>
      
      {/* Description */}
      <p className="text-muted-foreground text-center text-sm mb-6">{plan.description}</p>

      {/* Price */}
      <div className="text-center mb-8">
        {plan.price ? (
          <>
            <div className="flex items-baseline justify-center gap-2">
              <span 
                className="text-5xl font-bold"
                style={{ 
                  background: `linear-gradient(135deg, ${plan.color}, ${BRAND.pink})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                €{displayPrice}
              </span>
              <span className="text-muted-foreground">{plan.period}</span>
            </div>
            {isAnnual && (
              <p className="text-sm text-green-600 mt-2 font-medium">
                Bespaar €{(plan.price - discountedPrice!) * 12} per jaar
              </p>
            )}
          </>
        ) : (
          <div className="text-4xl font-bold" style={{ color: plan.color }}>
            {plan.period}
          </div>
        )}
      </div>

      {/* Features */}
      <div className="space-y-3 mb-8">
        {plan.features.map((feature, i) => {
          // Helper function to render icon based on feature type
          const renderFeatureIcon = () => {
            if (feature.icon === 'smartphone') {
              return (
                <div className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" style={{ color: BRAND.purple }} />
                </div>
              );
            }
            if (feature.icon === 'monitor') {
              return (
                <div className="flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 opacity-40" />
                </div>
              );
            }
            if (feature.icon === 'platforms') {
              return (
                <div className="flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5" style={{ color: plan.color }} />
                  <span className="text-muted-foreground">+</span>
                  <Smartphone className="w-3.5 h-3.5" style={{ color: plan.color }} />
                </div>
              );
            }
            if (feature.icon === 'platforms-plus') {
              return (
                <div className="flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5" style={{ color: plan.color }} />
                  <span className="text-muted-foreground">+</span>
                  <Smartphone className="w-3.5 h-3.5" style={{ color: plan.color }} />
                  <span className="text-muted-foreground">+</span>
                  <Sparkles className="w-3.5 h-3.5" style={{ color: BRAND.green }} />
                </div>
              );
            }
            return null;
          };

          return (
            <div key={i} className="flex items-start gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                feature.included ? 'bg-green-100' : 'bg-muted'
              }`}>
                {feature.included ? (
                  <Check className="w-3 h-3 text-green-600" />
                ) : (
                  <X className="w-3 h-3 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <span className={feature.included ? 'text-foreground' : 'text-muted-foreground'}>
                  {feature.text}
                </span>
                {feature.icon && (
                  <div className="mt-1">
                    {renderFeatureIcon()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA Button */}
      <Button 
        className="w-full h-12 rounded-xl font-semibold transition-all"
        style={plan.popular ? { 
          background: `linear-gradient(135deg, ${plan.color}, ${BRAND.pink})`,
          color: 'white'
        } : {}}
        variant={plan.popular ? 'default' : 'outline'}
        onClick={() => navigate('/login')}
      >
        {plan.price ? 'Start Nu' : 'Vraag Offerte Aan'}
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
};

const Pricing = () => {
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden" style={{ 
        background: `linear-gradient(180deg, ${BRAND.purple}06 0%, transparent 40%)` 
      }}>
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            {/* Badge */}
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
              style={{ backgroundColor: `${BRAND.purple}15`, color: BRAND.purple }}
            >
              <Sparkles className="w-4 h-4" />
              💎 Transparante Prijzen
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Beheer je Projecten{' '}
              <span style={{ 
                background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Met AI
              </span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8">
              AI-powered project- en programmamanagement met tijdregistratie. Kies het plan dat bij jouw team past.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 p-2 bg-muted rounded-full inline-flex">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  !isAnnual 
                    ? 'bg-background shadow-md' 
                    : 'text-muted-foreground'
                }`}
              >
                Maandelijks
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-6 py-2 rounded-full font-medium transition-all relative ${
                  isAnnual 
                    ? 'bg-background shadow-md' 
                    : 'text-muted-foreground'
                }`}
              >
                Jaarlijks
                <Badge 
                  className="absolute -top-2 -right-2 text-[10px]"
                  style={{ backgroundColor: BRAND.green }}
                >
                  -10%
                </Badge>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {pricingPlans.map((plan, i) => (
              <PricingCard key={i} plan={plan} isAnnual={isAnnual} />
            ))}
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-8 items-center mt-16 pt-12 border-t">
            <div className="text-center">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5" style={{ color: BRAND.green }} />
                <span className="font-semibold">100% Veilig</span>
              </div>
              <p className="text-sm text-muted-foreground">SSL versleuteld</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5" style={{ color: BRAND.green }} />
                <span className="font-semibold">Direct Actief</span>
              </div>
              <p className="text-sm text-muted-foreground">Meteen aan de slag</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5" style={{ color: BRAND.green }} />
                <span className="font-semibold">Eenvoudig Opzeggen</span>
              </div>
              <p className="text-sm text-muted-foreground">Geen verborgen kosten</p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Vergelijk Plannen</h2>
            <p className="text-muted-foreground">Bekijk alle features in detail</p>
          </div>

          <div className="max-w-6xl mx-auto overflow-x-auto">
            <table className="w-full bg-card rounded-2xl overflow-hidden border">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-6 font-bold">Functie</th>
                  <th className="text-center p-6 font-bold">Starter</th>
                  <th className="text-center p-6 font-bold" style={{ color: BRAND.blue }}>Professional</th>
                  <th className="text-center p-6 font-bold">Team</th>
                  <th className="text-center p-6 font-bold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((category, idx) => (
                  <>
                    <tr key={`cat-${idx}`} className="bg-muted/30">
                      <td colSpan={5} className="p-4 font-bold text-sm uppercase tracking-wider">
                        {category.category}
                      </td>
                    </tr>
                    {category.features.map((feature, i) => (
                      <tr key={`${idx}-${i}`} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="p-4">{feature.name}</td>
                        <td className="p-4 text-center">
                          {typeof feature.free === 'boolean' ? (
                            feature.free ? (
                              <Check className="w-5 h-5 text-green-600 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-muted-foreground mx-auto" />
                            )
                          ) : (
                            feature.free
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {typeof feature.professional === 'boolean' ? (
                            feature.professional ? (
                              <Check className="w-5 h-5 text-green-600 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-muted-foreground mx-auto" />
                            )
                          ) : (
                            feature.professional
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {typeof feature.team === 'boolean' ? (
                            feature.team ? (
                              <Check className="w-5 h-5 text-green-600 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-muted-foreground mx-auto" />
                            )
                          ) : (
                            feature.team
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {typeof feature.enterprise === 'boolean' ? (
                            feature.enterprise ? (
                              <Check className="w-5 h-5 text-green-600 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-muted-foreground mx-auto" />
                            )
                          ) : (
                            feature.enterprise
                          )}
                        </td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Veelgestelde Vragen</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: 'Wat is het verschil tussen Starter en Professional?',
                a: 'Starter is alleen toegankelijk via de mobile app en beperkt tot 5 projecten. Professional geeft toegang tot zowel web als app, heeft 10 projecten, en bevat programmamanagement en geavanceerde features.'
              },
              {
                q: 'Kan ik de web versie gebruiken met Starter?',
                a: 'Nee, Starter is alleen beschikbaar via de mobile app (iOS & Android). Voor web toegang heb je minimaal het Professional plan nodig.'
              },
              {
                q: 'Kan ik van plan wisselen?',
                a: 'Ja, je kunt op elk moment upgraden of downgraden. Bij een upgrade wordt het verschil direct verrekend.'
              },
              {
                q: 'Kan ik meer projecten toevoegen?',
                a: 'Ja! Bij Starter en Professional kun je upgraden naar een hoger plan. Bij Team en Enterprise zijn projecten onbeperkt.'
              },
              {
                q: 'Hoe werkt tijdregistratie?',
                a: 'Alle plannen hebben tijdregistratie ingebouwd. Log uren per project, taak of activiteit. Exporteer timesheet rapportages wanneer je wilt.'
              },
              {
                q: 'Zijn er setup kosten?',
                a: 'Nee, er zijn geen setup of implementatie kosten. Je betaalt alleen de maandelijkse licentiekosten.'
              },
            ].map((faq, i) => (
              <details key={i} className="bg-card rounded-xl border p-6 hover:shadow-md transition-shadow">
                <summary className="font-semibold cursor-pointer">{faq.q}</summary>
                <p className="text-muted-foreground mt-3">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div 
            className="max-w-4xl mx-auto rounded-3xl p-12 text-center"
            style={{ background: `linear-gradient(135deg, ${BRAND.purple}10, ${BRAND.pink}10)` }}
          >
            <h2 className="text-3xl font-bold mb-4">
              Start vandaag met{' '}
              <span style={{ 
                background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                AI-powered Projectmanagement
              </span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Beheer je projecten efficiënter met AI-assistentie en real-time tijdregistratie
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="gap-2 rounded-xl px-8"
                style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
                onClick={() => navigate('/login')}
              >
                <Sparkles className="w-5 h-5" />
                Start Nu
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="gap-2 rounded-xl px-8"
                onClick={() => navigate('/contact')}
              >
                Neem Contact Op
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;