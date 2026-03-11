import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Moon,
  Sun,
  Menu,
  X,
  LogIn,
  Rocket,
  Bot,
  Building2,
  FolderKanban,
  Brain,
  Clock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Play,
  Target,
  Users,
  Zap,
  Shield,
  GitMerge,
  BarChart3,
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  Github,
  Linkedin,
  Twitter,
  Check,
  Globe,
  GraduationCap,
  Send,
  MessageCircle,
  Lightbulb,
  TrendingUp,
  Calendar,
  ChevronDown,
  BookOpen,
  Award,
  Layers,
  CreditCard,
} from "lucide-react";
import { useLanguage, languages } from "@/contexts/LanguageContext";
import { usePageTranslations } from '@/hooks/usePageTranslations';

// ============================================
// CSS ANIMATIONS (inject into head)
// ============================================
const AnimationStyles = () => {
  useEffect(() => {
    const styleId = 'projextpal-animations';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(2deg); }
      }
      @keyframes float-delayed {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-15px) rotate(-2deg); }
      }
      @keyframes pulse-glow {
        0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
        50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.6), 0 0 60px rgba(217, 70, 239, 0.3); }
      }
      @keyframes fade-in-up {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes fade-in-scale {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
      @keyframes slide-in-right {
        from { opacity: 0; transform: translateX(-20px); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes typing-dot {
        0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
        30% { transform: translateY(-8px); opacity: 1; }
      }
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      @keyframes border-glow {
        0%, 100% { border-color: rgba(139, 92, 246, 0.3); }
        50% { border-color: rgba(217, 70, 239, 0.6); }
      }
      @keyframes gradient-shift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes counter-up {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-float { animation: float 6s ease-in-out infinite; }
      .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
      .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
      .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
      .animate-fade-in-scale { animation: fade-in-scale 0.6s ease-out forwards; }
      .animate-slide-in-right { animation: slide-in-right 0.5s ease-out forwards; }
      .animate-border-glow { animation: border-glow 2s ease-in-out infinite; }
      .animate-gradient-shift { 
        background-size: 200% 200%;
        animation: gradient-shift 3s ease infinite; 
      }
      .animate-shimmer {
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
        background-size: 200% 100%;
        animation: shimmer 2s infinite;
      }
      .typing-dot-1 { animation: typing-dot 1.4s ease-in-out infinite; }
      .typing-dot-2 { animation: typing-dot 1.4s ease-in-out 0.2s infinite; }
      .typing-dot-3 { animation: typing-dot 1.4s ease-in-out 0.4s infinite; }
      .delay-100 { animation-delay: 0.1s; }
      .delay-200 { animation-delay: 0.2s; }
      .delay-300 { animation-delay: 0.3s; }
      .delay-400 { animation-delay: 0.4s; }
      .delay-500 { animation-delay: 0.5s; }
      .hover-lift { transition: transform 0.3s ease, box-shadow 0.3s ease; }
      .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
    `;
    document.head.appendChild(style);
  }, []);
  return null;
};

// ============================================
// PROJEXTPAL BRAND COLORS
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
// PROJEXTPAL LOGO COMPONENTS
// ============================================
interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showText?: boolean;
  theme?: 'dark' | 'light';
}

const ProjeXtPalLogo = ({ size = 'md', showText = true, theme = 'dark' }: LogoProps) => {
  const sizes = {
    xs: { width: 32, height: 13, text: 'text-sm', gap: 'gap-2' },
    sm: { width: 48, height: 20, text: 'text-lg', gap: 'gap-2' },
    md: { width: 64, height: 26, text: 'text-xl', gap: 'gap-3' },
    lg: { width: 96, height: 38, text: 'text-2xl', gap: 'gap-3' },
  };
  
  const { width, height, text, gap } = sizes[size];
  const mainColor = theme === 'light' ? '#1a1a2e' : 'currentColor';

  return (
    <div className={`flex items-center ${gap}`}>
      <svg width={width} height={height} viewBox="0 0 2078 1008" fill="none" className="shrink-0">
        <defs>
          <linearGradient id={`xGrad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={BRAND.pink} />
            <stop offset="100%" stopColor={BRAND.pinkLight} />
          </linearGradient>
        </defs>
        <rect fill={BRAND.green} y="778" width="215" height="230" rx="30" />
        <text x="107" y="920" textAnchor="middle" fill="white" fontSize="110" fontWeight="800" fontFamily="Inter, system-ui, sans-serif">AI</text>
        <path fill={mainColor} d="M487,0H0V216H487c84,0,152,68,152,152s-68,152-152,152H0V736H487c203,0,368-165,368-368S690,0,487,0Z" />
        <polygon fill={mainColor} points="1656 586 1497 746 1383 631 1337 586 1383 540 1497 426 1656 586" />
        <polygon fill={mainColor} points="2078 1008 1759 1008 1542 791 1702 631 2078 1008" />
        <polygon fill={mainColor} points="2020 222 1702 540 1542 381 1701 222 2020 222" />
        <polygon fill={`url(#xGrad-${size})`} points="1656 586 1235 1008 915 1008 1337 586 973 222 1292 222 1656 586" />
      </svg>
      {showText && (
        <span className={`font-bold ${text}`}>
          Proje<span style={{ color: BRAND.pink }}>X</span>tPal
        </span>
      )}
    </div>
  );
};

const ProjeXtPalIcon = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 512 512" fill="none" className="shrink-0">
    <defs>
      <linearGradient id="iconBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={BRAND.purple} />
        <stop offset="100%" stopColor={BRAND.purpleDark} />
      </linearGradient>
      <linearGradient id="iconXGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={BRAND.pink} />
        <stop offset="100%" stopColor={BRAND.pinkLight} />
      </linearGradient>
    </defs>
    <rect width="512" height="512" rx="96" fill="url(#iconBgGrad)" />
    <g transform="translate(60, 80) scale(0.18)">
      <path fill="white" d="M487,0H0V216H487c84,0,152,68,152,152s-68,152-152,152H0V736H487c203,0,368-165,368-368S690,0,487,0Z" />
      <polygon fill="white" points="1656 586 1497 746 1383 631 1337 586 1383 540 1497 426 1656 586" />
      <polygon fill="white" points="2078 1008 1759 1008 1542 791 1702 631 2078 1008" />
      <polygon fill="white" points="2020 222 1702 540 1542 381 1701 222 2020 222" />
      <polygon fill="url(#iconXGrad)" points="1656 586 1235 1008 915 1008 1337 586 973 222 1292 222 1656 586" />
    </g>
    <rect x="330" y="350" width="130" height="130" rx="24" fill={BRAND.green} />
    <text x="395" y="435" textAnchor="middle" fill="white" fontSize="60" fontWeight="800" fontFamily="Inter, system-ui, sans-serif">AI</text>
  </svg>
);

// ============================================
// LANGUAGE SELECTOR
// ============================================
const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();
  const currentLang = languages.find(l => l.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span>{currentLang?.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`cursor-pointer ${language === lang.code ? 'bg-primary/10' : ''}`}
          >
            <span className="mr-2">{lang.flag}</span>
            <span>{lang.name}</span>
            {language === lang.code && <span className="ml-auto text-primary">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// ============================================
// NAVIGATION WITH ACADEMY DROPDOWN
// ============================================
const Navigation = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isNL = language === 'nl';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  // Academy dropdown items
  const academyItems = [
    { 
      label: isNL ? 'Training Marketplace' : 'Training Marketplace', 
      url: '/academy/marketplace', 
      icon: BookOpen,
      desc: isNL ? '100+ cursussen & certificaten' : '100+ courses & certificates',
      color: BRAND.purple,
      gradient: 'from-purple-500 to-indigo-600'
    },
    { 
      label: isNL ? 'Management Methodieken' : 'Management Methodologies', 
      url: '/academy/methodieken', 
      icon: Layers,
      desc: isNL ? 'Scrum, Kanban, PRINCE2, SAFe & meer' : 'Scrum, Kanban, PRINCE2, SAFe & more',
      color: BRAND.blue,
      gradient: 'from-blue-500 to-cyan-600',
      isNew: true
    },
    { 
      label: isNL ? 'Academy Prijzen' : 'Academy Pricing', 
      url: '/academy/pricing', 
      icon: CreditCard,
      desc: isNL ? 'Abonnementen & certificeringen' : 'Subscriptions & certifications',
      color: BRAND.pink,
      gradient: 'from-pink-500 to-rose-600'
    },
  ];

  // Navigation items - without academy (handled separately)
  const navItems = [
    { id: 'home', label: t.nav.home, type: 'scroll' },
    { id: 'about', label: t.nav.about, type: 'scroll' },
    { id: 'features', label: t.nav.features, type: 'scroll' },
    { id: 'pricing', label: t.nav.pricing, type: 'link', url: '/pricing' },
    { id: 'contact', label: t.nav.contact, type: 'scroll' },
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.type === 'link' && item.url) {
      navigate(item.url);
    } else {
      scrollToSection(item.id);
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-background/95 backdrop-blur-md shadow-lg border-b' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <ProjeXtPalLogo size="sm" theme={theme} />
            
            <div className="hidden md:flex items-center gap-6">
              {/* Regular nav items before Academy */}
              {navItems.slice(0, 3).map((item) => (
                <button 
                  key={item.id} 
                  onClick={() => handleNavClick(item)} 
                  className="text-foreground hover:text-primary transition-colors font-medium"
                >
                  {item.label}
                </button>
              ))}

              {/* Academy Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 text-foreground hover:text-primary transition-colors font-medium">
                    <GraduationCap className="w-4 h-4" />
                    Academy
                    <Badge className="ml-1 text-[10px] px-1.5 py-0" style={{ backgroundColor: BRAND.green }}>Coming Soon</Badge>
                    <ChevronDown className="w-4 h-4 ml-0.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-80 p-2">
                  {academyItems.map((item, i) => (
                    <DropdownMenuItem 
                      key={i}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      className="flex items-start gap-3 p-3 cursor-not-allowed opacity-60 rounded-xl hover:bg-muted/50 focus:bg-muted/50"
                    >
                      <div 
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shrink-0`}
                      >
                        <item.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium flex items-center gap-2">
                          {item.label}
                        </div>
                        <div className="text-xs text-muted-foreground">{item.desc}</div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem 
  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
  className="flex items-center gap-3 p-3 cursor-not-allowed opacity-60 rounded-xl hover:bg-muted/50"
>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium">{isNL ? 'Offerte Aanvragen' : 'Request Quote'}</div>
                      <div className="text-xs text-muted-foreground">{isNL ? 'Voor teams & bedrijven' : 'For teams & companies'}</div>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Remaining nav items after Academy */}
              {navItems.slice(3).map((item) => (
                <button 
                  key={item.id} 
                  onClick={() => handleNavClick(item)} 
                  className="text-foreground hover:text-primary transition-colors font-medium"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSelector />
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="rounded-full">
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            <Button variant="ghost" className="hidden md:inline-flex gap-2" onClick={() => navigate('/login')}>
              <LogIn className="h-4 w-4" />{t.nav.login}
            </Button>
            <Button 
              className="hidden md:inline-flex gap-2" 
              style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
              onClick={() => navigate('/login')}
            >
              <Rocket className="h-4 w-4" />{t.nav.openApp}
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 flex flex-col gap-3 bg-background/95 backdrop-blur-md rounded-lg p-4">
            {navItems.slice(0, 3).map((item) => (
              <button 
                key={item.id} 
                onClick={() => handleNavClick(item)} 
                className="text-left py-2 hover:text-primary flex items-center gap-2"
              >
                {item.label}
              </button>
            ))}
            
            {/* Mobile Academy Section */}
            <div className="border-t border-b py-3 my-1">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Academy
                <Badge style={{ backgroundColor: BRAND.green }} className="text-[10px]">Nieuw</Badge>
              </div>
              {academyItems.map((item, i) => (
                <button 
                  key={i}
                  onClick={() => { navigate(item.url); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 py-2 w-full text-left hover:text-primary"
                >
                  <div 
                    className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center`}
                  >
                    <item.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium flex items-center gap-2">
                      {item.label}
                      {item.isNew && (
                        <span className="px-1.5 py-0.5 text-[9px] rounded-full" style={{ backgroundColor: `${BRAND.green}20`, color: BRAND.green }}>
                          Nieuw
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {navItems.slice(3).map((item) => (
              <button 
                key={item.id} 
                onClick={() => handleNavClick(item)} 
                className="text-left py-2 hover:text-primary"
              >
                {item.label}
              </button>
            ))}
            
            <div className="flex gap-2 mt-2 pt-2 border-t">
              <Button variant="outline" className="flex-1 gap-2" onClick={() => navigate('/login')}>
                <LogIn className="h-4 w-4" />{t.nav.login}
              </Button>
              <Button 
                className="flex-1 gap-2" 
                style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
                onClick={() => navigate('/login')}
              >
                <Rocket className="h-4 w-4" />{t.nav.openApp}
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// ============================================
// PROJEXTPAL MASCOT - AI EFFICIENCY CHARACTER
// ============================================
const ProjeXtPalMascot = ({ size = 120, animate = true }: { size?: number; animate?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" className={animate ? 'animate-float' : ''}>
    <defs>
      <linearGradient id="mascotBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={BRAND.purple} />
        <stop offset="100%" stopColor={BRAND.pink} />
      </linearGradient>
      <linearGradient id="mascotGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={BRAND.purple} stopOpacity="0.3" />
        <stop offset="100%" stopColor={BRAND.pink} stopOpacity="0.1" />
      </linearGradient>
      <filter id="mascotGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    
    {/* Outer glow ring */}
    <circle cx="100" cy="100" r="95" fill="url(#mascotGlowGrad)" className="animate-pulse" />
    
    {/* Main body - rounded robot shape */}
    <ellipse cx="100" cy="105" rx="65" ry="70" fill="url(#mascotBodyGrad)" filter="url(#mascotGlow)" />
    
    {/* Face screen */}
    <ellipse cx="100" cy="95" rx="50" ry="45" fill="#1a1a2e" />
    <ellipse cx="100" cy="95" rx="47" ry="42" fill="#0f0f1a" />
    
    {/* Friendly eyes */}
    <ellipse cx="78" cy="90" rx="12" ry="14" fill="white" />
    <ellipse cx="122" cy="90" rx="12" ry="14" fill="white" />
    <ellipse cx="80" cy="92" rx="6" ry="7" fill={BRAND.purple} className="animate-pulse" />
    <ellipse cx="124" cy="92" rx="6" ry="7" fill={BRAND.pink} className="animate-pulse" />
    <circle cx="82" cy="89" r="2" fill="white" />
    <circle cx="126" cy="89" r="2" fill="white" />
    
    {/* Happy smile */}
    <path d="M 80 110 Q 100 125 120 110" stroke={BRAND.green} strokeWidth="4" strokeLinecap="round" fill="none" />
    
    {/* AI antenna */}
    <line x1="100" y1="35" x2="100" y2="20" stroke="url(#mascotBodyGrad)" strokeWidth="4" strokeLinecap="round" />
    <circle cx="100" cy="15" r="8" fill={BRAND.green} className="animate-pulse" />
    
    {/* Efficiency lightning bolt badge */}
    <g transform="translate(140, 60)">
      <circle cx="0" cy="0" r="18" fill="white" />
      <circle cx="0" cy="0" r="15" fill={BRAND.green} />
      <path d="M -2 -8 L 4 -2 L 0 -2 L 2 8 L -4 2 L 0 2 Z" fill="white" />
    </g>
    
    {/* Small orbiting elements */}
    <g className="animate-spin" style={{ transformOrigin: '100px 100px', animationDuration: '10s' }}>
      <circle cx="100" cy="20" r="4" fill={BRAND.orange} />
    </g>
    <g className="animate-spin" style={{ transformOrigin: '100px 100px', animationDuration: '15s', animationDirection: 'reverse' }}>
      <circle cx="170" cy="100" r="3" fill={BRAND.blue} />
    </g>
  </svg>
);

// ============================================
// PROJECT SCENARIO ILLUSTRATIONS
// ============================================
const TeamCollaborationIllustration = () => (
  <div className="relative animate-float" style={{ animationDelay: '0.5s' }}>
    <svg width="160" height="120" viewBox="0 0 160 120" fill="none">
      {/* Video call frame */}
      <rect x="10" y="10" width="140" height="90" rx="8" fill="white" stroke={BRAND.purple} strokeWidth="2" opacity="0.9" />
      
      {/* Grid of team members */}
      <rect x="18" y="18" width="42" height="35" rx="4" fill={`${BRAND.purple}20`} />
      <circle cx="39" cy="30" r="8" fill={BRAND.purple} />
      <rect x="30" y="42" width="18" height="3" rx="1" fill={`${BRAND.purple}50`} />
      
      <rect x="65" y="18" width="42" height="35" rx="4" fill={`${BRAND.pink}20`} />
      <circle cx="86" cy="30" r="8" fill={BRAND.pink} />
      <rect x="77" y="42" width="18" height="3" rx="1" fill={`${BRAND.pink}50`} />
      
      <rect x="112" y="18" width="32" height="35" rx="4" fill={`${BRAND.green}20`} />
      <circle cx="128" cy="30" r="8" fill={BRAND.green} />
      <rect x="119" y="42" width="18" height="3" rx="1" fill={`${BRAND.green}50`} />
      
      <rect x="18" y="58" width="42" height="35" rx="4" fill={`${BRAND.blue}20`} />
      <circle cx="39" cy="70" r="8" fill={BRAND.blue} />
      <rect x="30" y="82" width="18" height="3" rx="1" fill={`${BRAND.blue}50`} />
      
      <rect x="65" y="58" width="42" height="35" rx="4" fill={`${BRAND.orange}20`} />
      <circle cx="86" cy="70" r="8" fill={BRAND.orange} />
      <rect x="77" y="82" width="18" height="3" rx="1" fill={`${BRAND.orange}50`} />
      
      {/* Active speaker indicator */}
      <rect x="112" y="58" width="32" height="35" rx="4" fill={`${BRAND.purple}30`} stroke={BRAND.green} strokeWidth="2" />
      <circle cx="128" cy="70" r="8" fill={BRAND.purple} />
      <path d="M120 85 L128 80 L136 85" stroke={BRAND.green} strokeWidth="2" fill="none" />
    </svg>
    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: BRAND.purple }}>
      Team Call
    </div>
  </div>
);

const PlanningIllustration = () => (
  <div className="relative animate-float-delayed" style={{ animationDelay: '1s' }}>
    <svg width="150" height="110" viewBox="0 0 150 110" fill="none">
      {/* Gantt chart background */}
      <rect x="5" y="5" width="140" height="95" rx="8" fill="white" stroke={BRAND.blue} strokeWidth="2" opacity="0.9" />
      
      {/* Header */}
      <rect x="5" y="5" width="140" height="20" rx="8" fill={`${BRAND.blue}20`} />
      <text x="75" y="18" textAnchor="middle" fill={BRAND.blue} fontSize="8" fontWeight="bold">PROJECT PLANNING</text>
      
      {/* Timeline bars */}
      <rect x="45" y="32" width="50" height="10" rx="3" fill={BRAND.purple} />
      <text x="15" y="40" fill={BRAND.purple} fontSize="7">Sprint 1</text>
      
      <rect x="60" y="47" width="40" height="10" rx="3" fill={BRAND.pink} />
      <text x="15" y="55" fill={BRAND.pink} fontSize="7">Sprint 2</text>
      
      <rect x="85" y="62" width="55" height="10" rx="3" fill={BRAND.green} />
      <text x="15" y="70" fill={BRAND.green} fontSize="7">Sprint 3</text>
      
      <rect x="70" y="77" width="35" height="10" rx="3" fill={BRAND.orange} />
      <text x="15" y="85" fill={BRAND.orange} fontSize="7">Review</text>
      
      {/* Today marker */}
      <line x1="90" y1="28" x2="90" y2="92" stroke={BRAND.green} strokeWidth="2" strokeDasharray="3,3" />
      <circle cx="90" cy="28" r="4" fill={BRAND.green} />
    </svg>
  </div>
);

const KPIDashboardIllustration = () => (
  <div className="relative animate-float" style={{ animationDelay: '0.3s' }}>
    <svg width="140" height="100" viewBox="0 0 140 100" fill="none">
      {/* Dashboard frame */}
      <rect x="5" y="5" width="130" height="90" rx="8" fill="white" stroke={BRAND.green} strokeWidth="2" opacity="0.9" />
      
      {/* KPI Cards */}
      <rect x="12" y="12" width="35" height="25" rx="4" fill={`${BRAND.green}15`} />
      <text x="30" y="26" textAnchor="middle" fill={BRAND.green} fontSize="10" fontWeight="bold">94%</text>
      <text x="30" y="33" textAnchor="middle" fill={BRAND.green} fontSize="5">On Time</text>
      
      <rect x="52" y="12" width="35" height="25" rx="4" fill={`${BRAND.purple}15`} />
      <text x="70" y="26" textAnchor="middle" fill={BRAND.purple} fontSize="10" fontWeight="bold">€45K</text>
      <text x="70" y="33" textAnchor="middle" fill={BRAND.purple} fontSize="5">Budget</text>
      
      <rect x="92" y="12" width="35" height="25" rx="4" fill={`${BRAND.blue}15`} />
      <text x="110" y="26" textAnchor="middle" fill={BRAND.blue} fontSize="10" fontWeight="bold">12</text>
      <text x="110" y="33" textAnchor="middle" fill={BRAND.blue} fontSize="5">Projects</text>
      
      {/* Mini chart */}
      <rect x="12" y="42" width="115" height="45" rx="4" fill={`${BRAND.purple}08`} />
      <polyline 
        points="20,75 35,65 50,70 65,55 80,60 95,45 110,50 120,40" 
        stroke={BRAND.purple} 
        strokeWidth="2" 
        fill="none"
      />
      <polyline 
        points="20,78 35,72 50,75 65,65 80,68 95,58 110,62 120,55" 
        stroke={BRAND.pink} 
        strokeWidth="2" 
        fill="none"
        opacity="0.5"
      />
    </svg>
    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs" style={{ backgroundColor: BRAND.green }}>
      <TrendingUp className="w-3 h-3" />
    </div>
  </div>
);

const MethodologyIllustration = () => (
  <div className="relative animate-float-delayed" style={{ animationDelay: '1.5s' }}>
    <svg width="130" height="90" viewBox="0 0 130 90" fill="none">
      {/* Central hub */}
      <circle cx="65" cy="45" r="20" fill="white" stroke={BRAND.purple} strokeWidth="2" />
      <text x="65" y="42" textAnchor="middle" fill={BRAND.purple} fontSize="6" fontWeight="bold">PROJECT</text>
      <text x="65" y="50" textAnchor="middle" fill={BRAND.purple} fontSize="6" fontWeight="bold">HUB</text>
      
      {/* Methodology badges - orbiting */}
      <g>
        <circle cx="25" cy="25" r="15" fill={BRAND.purple} />
        <text x="25" y="28" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">Agile</text>
      </g>
      
      <g>
        <circle cx="105" cy="25" r="15" fill={BRAND.blue} />
        <text x="105" y="28" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">Scrum</text>
      </g>
      
      <g>
        <circle cx="20" cy="70" r="15" fill={BRAND.orange} />
        <text x="20" y="73" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">SAFe</text>
      </g>
      
      <g>
        <circle cx="110" cy="70" r="15" fill={BRAND.green} />
        <text x="110" y="68" textAnchor="middle" fill="white" fontSize="5" fontWeight="bold">PRINCE</text>
        <text x="110" y="75" textAnchor="middle" fill="white" fontSize="5" fontWeight="bold">2</text>
      </g>
      
      {/* Connection lines */}
      <line x1="40" y1="30" x2="50" y2="35" stroke={BRAND.purple} strokeWidth="1" strokeDasharray="3,2" opacity="0.5" />
      <line x1="90" y1="30" x2="80" y2="35" stroke={BRAND.blue} strokeWidth="1" strokeDasharray="3,2" opacity="0.5" />
      <line x1="35" y1="65" x2="50" y2="55" stroke={BRAND.orange} strokeWidth="1" strokeDasharray="3,2" opacity="0.5" />
      <line x1="95" y1="65" x2="80" y2="55" stroke={BRAND.green} strokeWidth="1" strokeDasharray="3,2" opacity="0.5" />
    </svg>
  </div>
);

const ProcessStepsIllustration = () => (
  <div className="relative animate-float" style={{ animationDelay: '0.8s' }}>
    <svg width="160" height="80" viewBox="0 0 160 80" fill="none">
      {/* Process flow */}
      <g>
        {/* Step 1 - Initiate */}
        <rect x="5" y="25" width="28" height="28" rx="6" fill={BRAND.purple} />
        <text x="19" y="35" textAnchor="middle" fill="white" fontSize="10">📋</text>
        <text x="19" y="47" textAnchor="middle" fill="white" fontSize="5">Init</text>
        
        {/* Arrow 1 */}
        <path d="M 35 39 L 42 39" stroke={BRAND.purple} strokeWidth="2" markerEnd="url(#arrowhead)" />
        
        {/* Step 2 - Plan */}
        <rect x="45" y="25" width="28" height="28" rx="6" fill={BRAND.blue} />
        <text x="59" y="35" textAnchor="middle" fill="white" fontSize="10">📅</text>
        <text x="59" y="47" textAnchor="middle" fill="white" fontSize="5">Plan</text>
        
        {/* Arrow 2 */}
        <path d="M 75 39 L 82 39" stroke={BRAND.blue} strokeWidth="2" />
        
        {/* Step 3 - Execute */}
        <rect x="85" y="25" width="28" height="28" rx="6" fill={BRAND.orange} />
        <text x="99" y="35" textAnchor="middle" fill="white" fontSize="10">⚡</text>
        <text x="99" y="47" textAnchor="middle" fill="white" fontSize="5">Execute</text>
        
        {/* Arrow 3 */}
        <path d="M 115 39 L 122 39" stroke={BRAND.orange} strokeWidth="2" />
        
        {/* Step 4 - Close */}
        <rect x="125" y="25" width="28" height="28" rx="6" fill={BRAND.green} />
        <text x="139" y="35" textAnchor="middle" fill="white" fontSize="10">✅</text>
        <text x="139" y="47" textAnchor="middle" fill="white" fontSize="5">Close</text>
      </g>
      
      {/* Progress indicator */}
      <rect x="5" y="60" width="148" height="6" rx="3" fill={`${BRAND.purple}20`} />
      <rect x="5" y="60" width="90" height="6" rx="3" fill={`url(#processGrad)`} />
      <defs>
        <linearGradient id="processGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={BRAND.purple} />
          <stop offset="50%" stopColor={BRAND.blue} />
          <stop offset="100%" stopColor={BRAND.orange} />
        </linearGradient>
      </defs>
      <text x="80" y="75" textAnchor="middle" fill={BRAND.purple} fontSize="6" fontWeight="bold">60% Complete</text>
    </svg>
  </div>
);

const AIInsightBubble = ({ text, delay = '0s' }: { text: string; delay?: string }) => (
  <div 
    className="flex items-center gap-2 px-3 py-2 rounded-xl shadow-lg animate-float bg-white border"
    style={{ borderColor: `${BRAND.green}40`, animationDelay: delay }}
  >
    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}>
      <Brain className="w-3 h-3 text-white" />
    </div>
    <span className="text-xs font-medium" style={{ color: BRAND.purple }}>{text}</span>
    <Sparkles className="w-3 h-3" style={{ color: BRAND.green }} />
  </div>
);

// ============================================
// HERO
// ============================================
const Hero = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{role: string, content: string}>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isNL = language === 'nl';

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  const highlights = [
    { icon: Building2, text: t.hero.programManagement },
    { icon: FolderKanban, text: t.hero.projectTracking },
    { icon: Brain, text: t.hero.aiInsights },
    { icon: Clock, text: t.hero.timeManagement },
  ];

  // SALES focused quick prompts
  const quickPrompts = isNL ? [
    { icon: Lightbulb, text: 'Wat kan ProjeXtPal voor mij doen?', color: BRAND.purple },
    { icon: TrendingUp, text: 'Hoe verbetert AI mijn projecten?', color: BRAND.green },
    { icon: Users, text: 'Is er een gratis proefversie?', color: BRAND.blue },
    { icon: Zap, text: 'Wat kost ProjeXtPal?', color: BRAND.orange },
  ] : [
    { icon: Lightbulb, text: 'What can ProjeXtPal do for me?', color: BRAND.purple },
    { icon: TrendingUp, text: 'How does AI improve my projects?', color: BRAND.green },
    { icon: Users, text: 'Is there a free trial?', color: BRAND.blue },
    { icon: Zap, text: 'What does ProjeXtPal cost?', color: BRAND.orange },
  ];

  const sendChatMessage = async (customMessage?: string) => {
    const msgToSend = customMessage || message.trim();
    if (!msgToSend || isTyping) return;
    
    setMessage("");
    setChatStarted(true);
    setChatHistory(prev => [...prev, { role: 'user', content: msgToSend }]);
    setIsTyping(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001/api/v1'}/bot/public/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: msgToSend,
          history: chatHistory,
          context: 'sales'
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.reply) {
        setChatHistory(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setChatHistory(prev => [...prev, { role: 'assistant', content: isNL ? 'Bedankt voor je interesse! Neem contact op via info@projextpal.com voor meer informatie.' : 'Thanks for your interest! Contact info@projextpal.com for more information.' }]);
      }
    } catch (error) {
      const fallbackResponses = isNL ? [
        'ProjeXtPal is het AI-powered platform voor projectmanagement! Start vandaag nog gratis.',
        'Met ProjeXtPal beheer je projecten 40% efficiënter dankzij AI. Probeer het 14 dagen gratis!',
        'Onze AI helpt je met planning, risicobeheer en rapportages. Wil je een demo inplannen?'
      ] : [
        'ProjeXtPal is the AI-powered project management platform! Start free today.',
        'With ProjeXtPal, manage projects 40% more efficiently with AI. Try 14 days free!',
        'Our AI helps with planning, risk management and reports. Want to schedule a demo?'
      ];
      setChatHistory(prev => [...prev, { role: 'assistant', content: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)] }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  return (
    <section id="home" className="pt-32 pb-20 relative overflow-hidden min-h-screen" style={{ background: `linear-gradient(180deg, ${BRAND.purple}06 0%, transparent 40%, ${BRAND.pink}04 100%)` }}>
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full blur-3xl animate-float" style={{ backgroundColor: `${BRAND.purple}08` }} />
        <div className="absolute top-40 -left-60 w-[500px] h-[500px] rounded-full blur-3xl animate-float-delayed" style={{ backgroundColor: `${BRAND.pink}08` }} />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl animate-float" style={{ backgroundColor: `${BRAND.green}06`, animationDelay: '2s' }} />
        
        <div className="hidden xl:block absolute left-[2%] top-[18%]">
          <TeamCollaborationIllustration />
        </div>
        
        <div className="hidden xl:block absolute left-[3%] top-[55%]">
          <PlanningIllustration />
        </div>
        
        <div className="hidden lg:block absolute left-[5%] bottom-[15%]">
          <ProcessStepsIllustration />
        </div>

        <div className="hidden xl:block absolute right-[2%] top-[20%]">
          <KPIDashboardIllustration />
        </div>
        
        <div className="hidden xl:block absolute right-[3%] top-[55%]">
          <MethodologyIllustration />
        </div>

        <div className="hidden lg:block absolute left-[8%] top-[42%]">
          <AIInsightBubble text={isNL ? "2 risico's gedetecteerd" : "2 risks detected"} delay="0.5s" />
        </div>
        
        <div className="hidden lg:block absolute right-[8%] bottom-[35%]">
          <AIInsightBubble text={isNL ? "Sprint op schema!" : "Sprint on track!"} delay="1.2s" />
        </div>

        <div className="hidden lg:block absolute right-[12%] bottom-[12%]">
          <ProjeXtPalMascot size={100} />
        </div>

        <div className="absolute top-[25%] left-[22%] animate-float opacity-60" style={{ animationDelay: '0s' }}>
          <Sparkles className="w-5 h-5" style={{ color: BRAND.purple }} />
        </div>
        <div className="absolute top-[35%] right-[20%] animate-float-delayed opacity-60" style={{ animationDelay: '1s' }}>
          <Sparkles className="w-6 h-6" style={{ color: BRAND.pink }} />
        </div>
        <div className="absolute bottom-[40%] left-[18%] animate-float opacity-50" style={{ animationDelay: '2s' }}>
          <Zap className="w-4 h-4" style={{ color: BRAND.green }} />
        </div>
        <div className="absolute top-[60%] right-[22%] animate-float-delayed opacity-50" style={{ animationDelay: '0.5s' }}>
          <Target className="w-4 h-4" style={{ color: BRAND.orange }} />
        </div>

        <svg className="absolute inset-0 w-full h-full opacity-[0.07]" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={BRAND.purple} />
              <stop offset="50%" stopColor={BRAND.pink} />
              <stop offset="100%" stopColor={BRAND.green} />
            </linearGradient>
          </defs>
          <path d="M 5 25 Q 25 40 50 35 T 95 50" stroke="url(#lineGrad)" strokeWidth="0.5" fill="none" strokeDasharray="2,3" />
          <path d="M 10 70 Q 35 55 55 65 T 90 45" stroke="url(#lineGrad)" strokeWidth="0.5" fill="none" strokeDasharray="2,2" />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="text-center max-w-4xl mx-auto mb-12">
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 opacity-0 animate-fade-in-up" 
            style={{ backgroundColor: `${BRAND.purple}15`, color: BRAND.purple, animationDelay: '0.1s', animationFillMode: 'forwards' }}
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>{t.hero.badge}</span>
            <span className="text-white text-xs px-2 py-0.5 rounded-full ml-2 animate-pulse" style={{ backgroundColor: BRAND.green }}>AI-Powered</span>
          </div>

          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight opacity-0 animate-fade-in-up"
            style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}
          >
            {t.hero.title1}<br />
            <span 
              className="animate-gradient-shift"
              style={{ 
                background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink}, ${BRAND.purple}, ${BRAND.green})`, 
                backgroundSize: '300% 300%',
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent' 
              }}
            >
              {t.hero.title2}
            </span>
          </h2>
          
          <p 
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed opacity-0 animate-fade-in-up"
            style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}
          >
            {t.hero.subtitle}
          </p>

          <div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 opacity-0 animate-fade-in-up"
            style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}
          >
            <Button 
              size="lg" 
              className="gap-2 text-base px-8 h-14 rounded-2xl shadow-lg hover-lift group animate-pulse-glow"
              style={{ 
                background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})`, 
                boxShadow: `0 10px 40px ${BRAND.purple}40` 
              }}
              onClick={() => navigate('/signup')}
            >
              <Rocket className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              {t.hero.getStarted}
            </Button>
            <Button
  size="lg"
  onClick={() => navigate('/demo')}
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

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {highlights.map((item, i) => (
              <div 
                key={i} 
                className="flex items-center gap-2 bg-card border px-4 py-2.5 rounded-full text-sm hover-lift cursor-default opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${0.5 + i * 0.1}s`, animationFillMode: 'forwards' }}
              >
                <item.icon className="w-4 h-4" style={{ color: BRAND.purple }} />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SALES AI Chat */}
        <div 
          className="max-w-3xl mx-auto opacity-0 animate-fade-in-scale"
          style={{ animationDelay: '0.7s', animationFillMode: 'forwards' }}
        >
          <div 
            className="bg-card rounded-3xl shadow-2xl border-2 overflow-hidden hover-lift"
            style={{ 
              borderColor: inputFocused ? BRAND.purple : 'transparent',
              boxShadow: inputFocused 
                ? `0 25px 60px ${BRAND.purple}30, 0 0 0 1px ${BRAND.purple}20` 
                : `0 25px 50px rgba(0,0,0,0.1)`,
              transition: 'all 0.3s ease'
            }}
          >
            <div 
              className="px-6 py-5 border-b relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${BRAND.purple}15, ${BRAND.pink}10, ${BRAND.green}05)` }}
            >
              <div className="absolute inset-0 animate-shimmer opacity-30" />
              
              <div className="flex items-center gap-4 relative">
                <div className="relative">
                  <ProjeXtPalMascot size={56} animate={false} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    Proje<span style={{ color: BRAND.pink }}>X</span>tPal Assistant
                    <span className="text-xs font-normal px-2 py-0.5 rounded-full" style={{ backgroundColor: `${BRAND.green}20`, color: BRAND.green }}>
                      Sales
                    </span>
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    {isNL ? 'Stel je vragen over ProjeXtPal!' : 'Ask your questions about ProjeXtPal!'}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: `${BRAND.green}15` }}>
                  <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: BRAND.green }} />
                  <span className="text-sm font-medium" style={{ color: BRAND.green }}>Online</span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4 min-h-[280px] max-h-[400px] overflow-y-auto">
              {!chatStarted ? (
                <>
                  <div 
                    className={`flex items-start gap-3 transition-all duration-500 ${showWelcome ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  >
                    <div 
                      className="p-2.5 rounded-xl shrink-0 shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
                    >
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div 
                      className="px-5 py-4 rounded-2xl rounded-tl-none max-w-md shadow-sm"
                      style={{ backgroundColor: `${BRAND.purple}08`, border: `1px solid ${BRAND.purple}15` }}
                    >
                      <p className="text-sm font-medium mb-3">
                        {t.hero.welcome}
                      </p>
                      <ul className="space-y-2 text-sm">
                        {t.hero.capabilities.map((cap, i) => (
                          <li 
                            key={i} 
                            className={`flex items-center gap-2 transition-all duration-300 ${showWelcome ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                            style={{ transitionDelay: `${0.3 + i * 0.1}s` }}
                          >
                            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: `${BRAND.green}20` }}>
                              <CheckCircle2 className="w-3.5 h-3.5" style={{ color: BRAND.green }} />
                            </div>
                            <span>{cap}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 pt-3 border-t" style={{ borderColor: `${BRAND.purple}15` }}>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Sparkles className="w-3 h-3" style={{ color: BRAND.green }} />
                          {t.hero.poweredBy}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div 
                    className={`pt-4 transition-all duration-500 ${showWelcome ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{ transitionDelay: '0.8s' }}
                  >
                    <p className="text-xs text-muted-foreground mb-3 text-center">
                      {isNL ? '💬 Populaire vragen:' : '💬 Popular questions:'}
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {quickPrompts.map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => sendChatMessage(prompt.text)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all hover:scale-105 hover:shadow-md"
                          style={{ 
                            backgroundColor: `${prompt.color}10`, 
                            color: prompt.color,
                            border: `1px solid ${prompt.color}20`
                          }}
                        >
                          <prompt.icon className="w-3.5 h-3.5" />
                          {prompt.text}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {chatHistory.map((msg, i) => (
                    <div 
                      key={i} 
                      className={`flex items-start gap-3 animate-slide-in-right ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                      style={{ animationDelay: '0.1s' }}
                    >
                      <div 
                        className={`p-2.5 rounded-xl shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-muted' : ''}`}
                        style={msg.role === 'assistant' ? { background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` } : {}}
                      >
                        {msg.role === 'assistant' ? <Bot className="w-5 h-5 text-white" /> : <Users className="w-5 h-5" />}
                      </div>
                      <div 
                        className={`px-5 py-4 rounded-2xl max-w-md shadow-sm ${msg.role === 'user' ? 'rounded-tr-none bg-muted' : 'rounded-tl-none'}`}
                        style={msg.role === 'assistant' ? { backgroundColor: `${BRAND.purple}08`, border: `1px solid ${BRAND.purple}15` } : {}}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex items-start gap-3 animate-slide-in-right">
                      <div 
                        className="p-2.5 rounded-xl shrink-0 shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
                      >
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div 
                        className="px-5 py-4 rounded-2xl rounded-tl-none shadow-sm"
                        style={{ backgroundColor: `${BRAND.purple}08`, border: `1px solid ${BRAND.purple}15` }}
                      >
                        <div className="flex gap-1.5 items-center h-5">
                          <span className="w-2.5 h-2.5 rounded-full typing-dot-1" style={{ backgroundColor: BRAND.purple }}></span>
                          <span className="w-2.5 h-2.5 rounded-full typing-dot-2" style={{ backgroundColor: BRAND.pink }}></span>
                          <span className="w-2.5 h-2.5 rounded-full typing-dot-3" style={{ backgroundColor: BRAND.purple }}></span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </>
              )}
            </div>

            <div 
              className="px-6 pb-6 pt-2"
              style={{ background: `linear-gradient(180deg, transparent, ${BRAND.purple}05)` }}
            >
              <div 
                className="flex gap-3 p-2 rounded-2xl transition-all duration-300"
                style={{ 
                  backgroundColor: inputFocused ? `${BRAND.purple}08` : 'transparent',
                  border: inputFocused ? `2px solid ${BRAND.purple}30` : '2px solid transparent'
                }}
              >
                <div className="relative flex-1">
                  <Input 
                    placeholder={isNL ? '💬 Stel je vraag over ProjeXtPal...' : '💬 Ask your question about ProjeXtPal...'} 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    className="flex-1 h-14 rounded-xl border-2 text-base pl-4 pr-4 transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20" 
                    disabled={isTyping}
                  />
                </div>
                <Button 
                  className="h-14 px-6 rounded-xl text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100"
                  style={{ 
                    background: message.trim() 
                      ? `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` 
                      : `linear-gradient(135deg, ${BRAND.purple}60, ${BRAND.pink}60)`
                  }}
                  onClick={() => sendChatMessage()}
                  disabled={isTyping || !message.trim()}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-3 flex items-center justify-center gap-2">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3" style={{ color: BRAND.green }} />
                  {isNL ? 'Veilig & privé' : 'Safe & private'}
                </span>
                <span>•</span>
                <span>{isNL ? 'Direct antwoord' : 'Instant response'}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" style={{ color: BRAND.purple }} />
                  AI-Powered
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
          {[
            { v: '500+', l: t.hero.stats.projects, icon: FolderKanban },
            { v: '50+', l: t.hero.stats.programs, icon: Building2 },
            { v: '10K+', l: t.hero.stats.hours, icon: Clock },
            { v: '98%', l: t.hero.stats.success, icon: TrendingUp }
          ].map((s, i) => (
            <div 
              key={i} 
              className="text-center p-4 rounded-2xl hover-lift opacity-0 animate-fade-in-up"
              style={{ 
                animationDelay: `${1 + i * 0.1}s`, 
                animationFillMode: 'forwards',
                background: `linear-gradient(135deg, ${BRAND.purple}05, ${BRAND.pink}05)`
              }}
            >
              <div className="flex justify-center mb-2">
                <s.icon className="w-5 h-5" style={{ color: BRAND.purple }} />
              </div>
              <p 
                className="text-3xl md:text-4xl font-bold mb-1"
                style={{ 
                  background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})`, 
                  WebkitBackgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent' 
                }}
              >
                {s.v}
              </p>
              <p className="text-muted-foreground text-sm">{s.l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================
// ABOUT
// ============================================
const About = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const pillars = [
    { icon: FolderKanban, title: 'Projects', color: BRAND.purple, desc: 'Projectmanagement met AI' },
    { icon: Building2, title: 'Programs', color: BRAND.blue, desc: 'Portfolio & programma\'s' },
    { icon: GraduationCap, title: 'Trainings', color: BRAND.orange, desc: '118+ learning modules', link: '/academy/marketplace' },
    { icon: Brain, title: 'AI', color: BRAND.green, desc: 'Intelligente assistentie' },
  ];

  return (
    <section id="about" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4" style={{ backgroundColor: `${BRAND.purple}15`, color: BRAND.purple }}>
            <Target className="w-4 h-4" /><span>{t.about.badge}</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
            {t.about.title1}<br />
            <span style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t.about.title2}</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {pillars.map((pillar, i) => (
            <div 
              key={i} 
              className={`bg-card rounded-2xl p-6 border text-center hover-lift transition-all duration-300 ${pillar.link ? 'cursor-pointer' : ''}`}
              onClick={() => pillar.link && navigate(pillar.link)}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110" 
                style={{ backgroundColor: `${pillar.color}20` }}
              >
                <pillar.icon className="w-8 h-8" style={{ color: pillar.color }} />
              </div>
              <h3 className="font-bold text-lg mb-2">{pillar.title}</h3>
              <p className="text-muted-foreground text-sm">{pillar.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-base md:text-lg text-muted-foreground mb-6 leading-relaxed">{t.about.description}</p>
            <div className="space-y-3 mb-8">
              {t.about.capabilities.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" style={{ color: BRAND.green }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <Button 
              size="lg" 
              className="gap-2 rounded-xl"
              style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
              onClick={() => navigate('/signup')}
            >
              {t.about.getStarted}<ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-3xl blur-3xl" style={{ background: `linear-gradient(135deg, ${BRAND.purple}20, ${BRAND.pink}20)` }} />
            <div className="relative grid grid-cols-2 gap-4">
              <div className="bg-card border rounded-2xl p-6 shadow-lg">
                <div className="p-3 rounded-xl w-fit mb-4" style={{ backgroundColor: `${BRAND.purple}15` }}>
                  <Building2 className="w-8 h-8" style={{ color: BRAND.purple }} />
                </div>
                <h3 className="text-lg font-bold mb-2">{t.about.programs}</h3>
                <p className="text-muted-foreground text-sm">{t.about.programsDesc}</p>
              </div>
              <div className="bg-card border rounded-2xl p-6 shadow-lg mt-8">
                <div className="p-3 rounded-xl w-fit mb-4" style={{ backgroundColor: `${BRAND.blue}15` }}>
                  <FolderKanban className="w-8 h-8" style={{ color: BRAND.blue }} />
                </div>
                <h3 className="text-lg font-bold mb-2">{t.about.projects}</h3>
                <p className="text-muted-foreground text-sm">{t.about.projectsDesc}</p>
              </div>
              <div className="col-span-2 rounded-2xl p-6" style={{ background: `linear-gradient(135deg, ${BRAND.purple}10, ${BRAND.pink}10)`, border: `1px solid ${BRAND.purple}30` }}>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl" style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}>
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">{t.about.aiPowered}</h3>
                    <p className="text-muted-foreground text-sm">{t.about.aiPoweredDesc}</p>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: `${BRAND.purple}20`, color: BRAND.purple }}>{t.about.smartEntry}</span>
                      <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: `${BRAND.purple}20`, color: BRAND.purple }}>{t.about.aiReports}</span>
                      <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: `${BRAND.purple}20`, color: BRAND.purple }}>{t.about.methodologyAdvisor}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ============================================
// FEATURES
// ============================================
const Features = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const icons = [Building2, FolderKanban, Brain, Clock, MessageSquare, Sparkles, BarChart3, Target, Users];
  const colors = [BRAND.purple, BRAND.blue, BRAND.pink, BRAND.green, BRAND.orange, BRAND.purple, BRAND.blue, BRAND.pink, BRAND.green];

  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4" style={{ backgroundColor: `${BRAND.purple}15`, color: BRAND.purple }}>
            <Sparkles className="w-4 h-4" /><span>{t.features.badge}</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
            {t.features.title1}<br />
            <span style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t.features.title2}</span>
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {[{ n: 'SAFe', i: Zap }, { n: 'Scrum', i: GitMerge }, { n: 'PRINCE2', i: Shield }, { n: 'Agile', i: Zap }, { n: 'Kanban', i: BarChart3 }, { n: 'Six Sigma', i: Target }].map((m, i) => (
            <div key={i} className="flex items-center gap-2 bg-card border px-4 py-2 rounded-full text-sm hover:border-primary transition-colors">
              <m.i className="w-4 h-4" style={{ color: BRAND.purple }} /><span>{m.n}</span>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {t.features.items.map((f, i) => {
            const Icon = icons[i];
            const color = colors[i];
            return (
              <div key={i} className="bg-card p-8 rounded-2xl border hover:shadow-xl transition-all hover:-translate-y-1 group">
                <div className="p-4 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform" style={{ backgroundColor: `${color}15` }}>
                  <Icon className="w-8 h-8" style={{ color }} />
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-base text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Button 
            size="lg" 
            className="rounded-xl px-8"
            style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
            onClick={() => navigate('/login')}
          >
            {t.features.startUsing}
          </Button>
        </div>
      </div>
    </section>
  );
};

// ============================================
// DEMO
// ============================================
const Demo = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <section id="demo" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4" style={{ backgroundColor: `${BRAND.purple}15`, color: BRAND.purple }}>
            <Play className="w-4 h-4" /><span>{t.demo.badge}</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
            {t.demo.title1}<br />
            <span style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t.demo.title2}</span>
          </h2>
        </div>

        <div className="max-w-5xl mx-auto mb-16">
          <div className="bg-card rounded-3xl border shadow-2xl overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center gap-3" style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-white/30" />
                <div className="w-3 h-3 rounded-full bg-white/30" />
                <div className="w-3 h-3 rounded-full bg-white/30" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-white/20 px-4 py-1.5 rounded-lg text-sm text-white">🔒 app.projextpal.com</div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-background to-muted/20">
              <div className="flex items-center justify-between mb-6">
                <ProjeXtPalLogo size="sm" />
                <Badge className="gap-1" style={{ backgroundColor: `${BRAND.green}15`, color: BRAND.green }}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: BRAND.green }} />{t.demo.aiOnline}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-card rounded-xl p-4 border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{t.app.totalPrograms}</span>
                    <Building2 className="w-4 h-4" style={{ color: BRAND.purple }} />
                  </div>
                  <p className="text-2xl font-bold">5</p>
                </div>
                <div className="bg-card rounded-xl p-4 border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{t.app.totalProjects}</span>
                    <FolderKanban className="w-4 h-4" style={{ color: BRAND.blue }} />
                  </div>
                  <p className="text-2xl font-bold">24</p>
                </div>
                <div className="bg-card rounded-xl p-4 border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Time Tracking</span>
                    <Clock className="w-4 h-4" style={{ color: BRAND.green }} />
                  </div>
                  <p className="text-2xl font-bold">156h</p>
                </div>
              </div>

              <div className="rounded-xl p-4" style={{ background: `linear-gradient(135deg, ${BRAND.purple}10, ${BRAND.pink}10)`, border: `1px solid ${BRAND.purple}30` }}>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg" style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}>
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{t.demo.aiInsight}</span>
                      <Sparkles className="w-3 h-3" style={{ color: BRAND.purple }} />
                    </div>
                    <p className="text-sm text-muted-foreground">{t.demo.aiInsightText}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button 
            size="lg" 
            className="gap-2 rounded-xl"
            style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
            onClick={() => navigate('/login')}
          >
            {t.demo.tryIt}<ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

// ============================================
// CONTACT
// ============================================
const Contact = () => {
  const { t } = useLanguage();

  return (
    <section id="contact" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4" style={{ backgroundColor: `${BRAND.purple}15`, color: BRAND.purple }}>
            <Mail className="w-4 h-4" /><span>{t.contact.badge}</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">{t.contact.title}</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          <div>
            <h3 className="text-xl font-bold mb-4">{t.contact.letsTalk}</h3>
            <p className="text-base text-muted-foreground mb-6 leading-relaxed">{t.contact.description}</p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl" style={{ backgroundColor: `${BRAND.purple}15` }}>
                  <Mail className="w-5 h-5" style={{ color: BRAND.purple }} />
                </div>
                <span>info@projextpal.com</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl" style={{ backgroundColor: `${BRAND.purple}15` }}>
                  <Phone className="w-5 h-5" style={{ color: BRAND.purple }} />
                </div>
                <span>+31 20 123 4567</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl" style={{ backgroundColor: `${BRAND.purple}15` }}>
                  <MapPin className="w-5 h-5" style={{ color: BRAND.purple }} />
                </div>
                <span>Almere, Netherlands</span>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-2xl p-8 border">
            <div className="space-y-4">
              <Input placeholder={t.contact.name} className="h-12 rounded-xl" />
              <Input placeholder={t.contact.email} type="email" className="h-12 rounded-xl" />
              <textarea placeholder={t.contact.message} className="w-full h-32 px-4 py-3 rounded-xl border bg-background resize-none" />
              <Button 
                className="w-full h-12 rounded-xl"
                style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
              >
                {t.contact.send}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ============================================
// FAQ
// ============================================
const FAQ = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{t.faq.title}</h2>
        </div>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {t.faq.items.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-card rounded-xl border px-6">
                <AccordionTrigger className="text-left font-semibold">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

// ============================================
// FOOTER
// ============================================
const Footer = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 py-16">
        <div className="rounded-3xl p-8 md:p-12 text-center mb-12" style={{ background: `linear-gradient(135deg, ${BRAND.purple}10, ${BRAND.pink}10)` }}>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {t.footer.cta.title1}<br />
            <span style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t.footer.cta.title2}</span>
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button 
              size="lg" 
              className="gap-2 rounded-xl"
              style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
              onClick={() => navigate('/signup')}
            >
              <Rocket className="w-5 h-5" />{t.hero.getStarted}
            </Button>
            <Button size="lg" variant="outline" className="gap-2 rounded-xl" onClick={() => navigate('/login')}>
              <LogIn className="w-5 h-5" />{t.nav.login}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <ProjeXtPalLogo size="sm" />
            <p className="text-muted-foreground text-sm mt-4">{t.footer.description}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t.footer.product}</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="text-muted-foreground hover:text-primary text-sm">{t.nav.features}</a></li>
              <li><button onClick={() => navigate('/pricing')} className="text-muted-foreground hover:text-primary text-sm">{t.nav.pricing}</button></li>
              <li><a href="#demo" className="text-muted-foreground hover:text-primary text-sm">Demo</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4" /> Academy
            </h4>
            <ul className="space-y-2">
              <li><button onClick={() => navigate('/academy/marketplace')} className="text-muted-foreground hover:text-primary text-sm">Cursussen</button></li>
              <li><button onClick={() => navigate('/academy/methodieken')} className="text-muted-foreground hover:text-primary text-sm">Methodieken</button></li>
              <li><button onClick={() => navigate('/academy/pricing')} className="text-muted-foreground hover:text-primary text-sm">Prijzen</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t.footer.company}</h4>
            <ul className="space-y-2">
              <li><a href="#about" className="text-muted-foreground hover:text-primary text-sm">{t.nav.about}</a></li>
              <li><a href="#contact" className="text-muted-foreground hover:text-primary text-sm">{t.nav.contact}</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary text-sm">Privacy</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary text-sm">Terms</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t gap-4">
          <p className="text-muted-foreground text-sm">© 2025 ProjeXtPal. {t.footer.rights}</p>
          <div className="flex gap-4">
            {[Twitter, Linkedin, Github].map((Icon, i) => (
              <a key={i} href="#" className="p-2 rounded-lg bg-muted hover:bg-primary/10 transition-colors">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

// ============================================
// MAIN LANDING PAGE
// ============================================
const Landing = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AnimationStyles />
      <Navigation />
      <Hero />
      <About />
      <Features />
      <Demo />
      <Contact />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Landing;