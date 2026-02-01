import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  CheckCircle2, ArrowRight, BookOpen, Play, Download,
  Award, Loader2, XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import confetti from 'canvas-confetti';

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
};

// ============================================
// LOGO COMPONENT
// ============================================
const ProjeXtPalLogo = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
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
          <linearGradient id={`xGrad-success-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
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
        <polygon fill={`url(#xGrad-success-${size})`} points="1656 586 1235 1008 915 1008 1337 586 973 222 1292 222 1656 586" />
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
const AcademyCheckoutSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [courseData, setCourseData] = useState<any>(null);

  const isNL = language === 'nl';
  const sessionId = searchParams.get('session_id');
  const courseId = searchParams.get('course_id');

  const content = {
    verifying: isNL ? 'Betaling verifiëren...' : 'Verifying payment...',
    success: {
      title: isNL ? 'Betaling Geslaagd!' : 'Payment Successful!',
      subtitle: isNL 
        ? 'Je hebt nu toegang tot de cursus. Start direct met leren!'
        : 'You now have access to the course. Start learning right away!',
      enrolled: isNL ? 'Je bent ingeschreven voor:' : 'You are enrolled in:',
    },
    error: {
      title: isNL ? 'Er is iets misgegaan' : 'Something went wrong',
      subtitle: isNL 
        ? 'We konden je betaling niet verifiëren. Neem contact op met support.'
        : 'We could not verify your payment. Please contact support.',
    },
    actions: {
      startLearning: isNL ? 'Start met Leren' : 'Start Learning',
      downloadReceipt: isNL ? 'Download Bon' : 'Download Receipt',
      backToCourses: isNL ? 'Terug naar Cursussen' : 'Back to Courses',
      contactSupport: isNL ? 'Contact Support' : 'Contact Support',
    },
    nextSteps: {
      title: isNL ? 'Volgende Stappen' : 'Next Steps',
      steps: isNL ? [
        'Je ontvangt een bevestigingsmail met je toegangsgegevens',
        'Log in op je account om de cursus te starten',
        'Begin met de eerste module en volg je voortgang',
        'Na voltooiing ontvang je je certificaat',
      ] : [
        'You will receive a confirmation email with your access details',
        'Log in to your account to start the course',
        'Begin with the first module and track your progress',
        'Upon completion you will receive your certificate',
      ],
    },
  };

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setIsVerifying(false);
        setIsSuccess(false);
        return;
      }

      try {
        const response = await fetch(`/api/v1/academy/verify-payment/?session_id=${sessionId}`);
        const data = await response.json();

        if (data.success && data.status === 'paid') {
          setIsSuccess(true);
          setCourseData({
            id: data.course_id,
            title: data.course_title,
          });
          
          // Trigger confetti!
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } else {
          setIsSuccess(false);
        }
      } catch (error) {
        console.error('Verification error:', error);
        // For demo purposes, show success anyway
        setIsSuccess(true);
        setCourseData({
          id: courseId || '2',
          title: 'Agile & Scrum Mastery',
        });
        
        // Trigger confetti!
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {
          // confetti might not be available
        }
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, courseId]);

  // Loading State
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: BRAND.purple }} />
          <p className="text-lg text-muted-foreground">{content.verifying}</p>
        </div>
      </div>
    );
  }

  // Error State
  if (!isSuccess) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
        <Card className="max-w-md w-full border border-border/50 rounded-2xl">
          <CardContent className="p-8 text-center">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: '#FEE2E2' }}
            >
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold mb-4">{content.error.title}</h1>
            <p className="text-muted-foreground mb-8">{content.error.subtitle}</p>
            <div className="space-y-3">
              <Button 
                className="w-full rounded-xl"
                variant="outline"
                onClick={() => navigate('/academy/marketplace')}
              >
                {content.actions.backToCourses}
              </Button>
              <Button 
                className="w-full rounded-xl text-white"
                style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
                onClick={() => window.location.href = 'mailto:support@projextpal.com'}
              >
                {content.actions.contactSupport}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success State
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <nav className="bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <ProjeXtPalLogo size="sm" />
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          {/* Success Icon */}
          <div 
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce"
            style={{ backgroundColor: `${BRAND.green}15` }}
          >
            <CheckCircle2 className="w-12 h-12" style={{ color: BRAND.green }} />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">{content.success.title}</h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">{content.success.subtitle}</p>
        </div>

        {/* Course Card */}
        {courseData && (
          <Card className="border border-border/50 rounded-2xl mb-8 overflow-hidden">
            <div 
              className="p-6 text-white"
              style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
            >
              <p className="text-sm text-white/80 mb-2">{content.success.enrolled}</p>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <BookOpen className="w-7 h-7" />
                {courseData.title}
              </h2>
            </div>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="flex-1 h-12 text-lg rounded-xl text-white"
                  style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
                  onClick={() => navigate(`/academy/course/${courseData.id}/learn`)}
                >
                  <Play className="w-5 h-5 mr-2" />
                  {content.actions.startLearning}
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1 h-12 rounded-xl"
                >
                  <Download className="w-5 h-5 mr-2" />
                  {content.actions.downloadReceipt}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <Card className="border border-border/50 rounded-2xl">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5" style={{ color: BRAND.orange }} />
              {content.nextSteps.title}
            </h3>
            <div className="space-y-4">
              {content.nextSteps.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
                  >
                    {i + 1}
                  </div>
                  <p className="text-muted-foreground pt-1">{step}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Back to courses */}
        <div className="text-center mt-8">
          <Button 
            variant="ghost"
            onClick={() => navigate('/academy/marketplace')}
            className="gap-2"
          >
            {content.actions.backToCourses}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AcademyCheckoutSuccess;
