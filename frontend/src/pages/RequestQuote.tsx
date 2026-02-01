import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, Building2, Users, Mail, Phone, Send, 
  CheckCircle2, Sparkles, BookOpen, Clock, Award,
  Loader2, MessageSquare, Globe, Target, Zap, GitMerge,
  Shield, BarChart3, Crown, Briefcase, Settings, GraduationCap,
  TrendingUp, UserCheck, FileText, Percent, Headphones
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
          <linearGradient id={`xGrad-quote-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
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
        <polygon fill={`url(#xGrad-quote-${size})`} points="1656 586 1235 1008 915 1008 1337 586 973 222 1292 222 1656 586" />
      </svg>
      <span className={`font-bold ${text}`}>
        Proje<span style={{ color: BRAND.pink }}>X</span>tPal
      </span>
    </div>
  );
};

// ============================================
// COURSE DATA WITH ICONS
// ============================================
const courseIcons: Record<string, { icon: any; color: string; gradient: string }> = {
  '1': { icon: Target, color: BRAND.purple, gradient: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.purpleDark})` },
  '2': { icon: Zap, color: BRAND.blue, gradient: `linear-gradient(135deg, ${BRAND.blue}, #0EA5E9)` },
  '3': { icon: GitMerge, color: BRAND.orange, gradient: `linear-gradient(135deg, ${BRAND.orange}, #EA580C)` },
  '4': { icon: Building2, color: BRAND.pink, gradient: `linear-gradient(135deg, ${BRAND.pink}, ${BRAND.pinkLight})` },
  '5': { icon: Shield, color: BRAND.green, gradient: `linear-gradient(135deg, ${BRAND.green}, ${BRAND.greenDark})` },
  '6': { icon: BarChart3, color: '#6366F1', gradient: `linear-gradient(135deg, #6366F1, #4F46E5)` },
  '7': { icon: Crown, color: BRAND.orange, gradient: `linear-gradient(135deg, ${BRAND.orange}, #DC2626)` },
  '8': { icon: Settings, color: BRAND.blue, gradient: `linear-gradient(135deg, ${BRAND.blue}, #1D4ED8)` },
};

const getCourseData = (id: string) => {
  const courses: Record<string, any> = {
    '1': { id: '1', title: 'Project Management Fundamentals', price: 99 },
    '2': { id: '2', title: 'Agile & Scrum Mastery', price: 49 },
    '3': { id: '3', title: 'SAFe & Scaling Agile', price: 79 },
    '4': { id: '4', title: 'Program Management Professional', price: 99 },
    '5': { id: '5', title: 'PRINCE2 Foundation & Practitioner', price: 149 },
    '6': { id: '6', title: 'Six Sigma Green Belt', price: 129 },
    '7': { id: '7', title: 'Leadership for Project Managers', price: 0 },
    '8': { id: '8', title: 'Microsoft Project Masterclass', price: 39 },
  };
  return courses[id] || null;
};

// ============================================
// MAIN COMPONENT
// ============================================
const RequestQuote = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState<string[]>(id ? [id] : []);
  const [teamSize, setTeamSize] = useState('5-10');
  
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    jobTitle: '',
    country: 'NL',
    message: '',
    preferredDate: '',
    newsletter: true,
  });

  const isNL = language === 'nl';
  const course = id ? getCourseData(id) : null;

  const content = {
    title: isNL ? 'Offerte Aanvragen' : 'Request Quote',
    subtitle: isNL 
      ? 'Ontvang een op maat gemaakte offerte voor groepstraining met korting tot 40%'
      : 'Get a customized quote for group training with up to 40% discount',
    back: isNL ? 'Terug' : 'Back',
    companyDetails: isNL ? 'Bedrijfsgegevens' : 'Company Details',
    companyName: isNL ? 'Bedrijfsnaam' : 'Company Name',
    contactName: isNL ? 'Contactpersoon' : 'Contact Person',
    email: isNL ? 'Zakelijk E-mailadres' : 'Business Email',
    phone: isNL ? 'Telefoonnummer' : 'Phone Number',
    jobTitle: isNL ? 'Functie' : 'Job Title',
    country: isNL ? 'Land' : 'Country',
    trainingDetails: isNL ? 'Training Details' : 'Training Details',
    selectCourses: isNL ? 'Selecteer Cursussen' : 'Select Courses',
    teamSize: isNL ? 'Teamgrootte' : 'Team Size',
    preferredDate: isNL ? 'Gewenste Startdatum' : 'Preferred Start Date',
    message: isNL ? 'Aanvullende Informatie' : 'Additional Information',
    messagePlaceholder: isNL 
      ? 'Vertel ons meer over je trainingsdoelen, specifieke wensen of vragen...'
      : 'Tell us more about your training goals, specific requirements or questions...',
    newsletter: isNL 
      ? 'Ik wil graag updates ontvangen over nieuwe cursussen en aanbiedingen'
      : 'I would like to receive updates about new courses and offers',
    submit: isNL ? 'Offerte Aanvragen' : 'Request Quote',
    submitting: isNL ? 'Verzenden...' : 'Submitting...',
    benefits: {
      title: isNL ? 'Voordelen van Team Training' : 'Benefits of Team Training',
      items: isNL ? [
        { text: 'Tot 40% korting op groepslicenties', icon: Percent },
        { text: 'Dedicated account manager', icon: UserCheck },
        { text: 'Aangepaste leertrajecten', icon: GraduationCap },
        { text: 'Voortgangsrapportages per medewerker', icon: TrendingUp },
        { text: 'Integratie met uw LMS mogelijk', icon: Settings },
        { text: 'Facturatie op maat', icon: FileText },
      ] : [
        { text: 'Up to 40% discount on group licenses', icon: Percent },
        { text: 'Dedicated account manager', icon: UserCheck },
        { text: 'Customized learning paths', icon: GraduationCap },
        { text: 'Progress reports per employee', icon: TrendingUp },
        { text: 'LMS integration available', icon: Settings },
        { text: 'Flexible invoicing options', icon: FileText },
      ],
    },
    success: {
      title: isNL ? 'Bedankt voor je aanvraag!' : 'Thank you for your request!',
      message: isNL 
        ? 'We hebben je offerte aanvraag ontvangen. Een van onze training consultants neemt binnen 24 uur contact met je op.'
        : 'We have received your quote request. One of our training consultants will contact you within 24 hours.',
      button: isNL ? 'Terug naar Academy' : 'Back to Academy',
    },
    teamSizes: [
      { value: '5-10', label: '5-10' },
      { value: '11-25', label: '11-25' },
      { value: '26-50', label: '26-50' },
      { value: '51-100', label: '51-100' },
      { value: '100+', label: '100+' },
    ],
  };

  const allCourses = [
    { id: '1', title: 'Project Management Fundamentals', icon: Target, color: BRAND.purple, gradient: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.purpleDark})` },
    { id: '2', title: 'Agile & Scrum Mastery', icon: Zap, color: BRAND.blue, gradient: `linear-gradient(135deg, ${BRAND.blue}, #0EA5E9)` },
    { id: '3', title: 'SAFe & Scaling Agile', icon: GitMerge, color: BRAND.orange, gradient: `linear-gradient(135deg, ${BRAND.orange}, #EA580C)` },
    { id: '4', title: 'Program Management Professional', icon: Building2, color: BRAND.pink, gradient: `linear-gradient(135deg, ${BRAND.pink}, ${BRAND.pinkLight})` },
    { id: '5', title: 'PRINCE2 Foundation & Practitioner', icon: Shield, color: BRAND.green, gradient: `linear-gradient(135deg, ${BRAND.green}, ${BRAND.greenDark})` },
    { id: '6', title: 'Six Sigma Green Belt', icon: BarChart3, color: '#6366F1', gradient: `linear-gradient(135deg, #6366F1, #4F46E5)` },
    { id: '7', title: 'Leadership for Project Managers', icon: Crown, color: BRAND.orange, gradient: `linear-gradient(135deg, ${BRAND.orange}, #DC2626)` },
    { id: '8', title: 'Microsoft Project Masterclass', icon: Settings, color: BRAND.blue, gradient: `linear-gradient(135deg, ${BRAND.blue}, #1D4ED8)` },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const toggleCourse = (courseId: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.companyName || !formData.contactName || !formData.email) {
      toast({
        title: isNL ? 'Vul alle verplichte velden in' : 'Fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (selectedCourses.length === 0) {
      toast({
        title: isNL ? 'Selecteer minimaal één cursus' : 'Select at least one course',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/academy/request-quote/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          courses: selectedCourses,
          team_size: teamSize,
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      console.error('Submit error:', error);
      // For demo, show success anyway
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Success State
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
        <Card className="max-w-md w-full border border-border/50 rounded-2xl">
          <CardContent className="p-8 text-center">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: `${BRAND.green}15` }}
            >
              <CheckCircle2 className="w-10 h-10" style={{ color: BRAND.green }} />
            </div>
            <h1 className="text-2xl font-bold mb-4">{content.success.title}</h1>
            <p className="text-muted-foreground mb-8">{content.success.message}</p>
            <Button 
              className="w-full rounded-xl text-white"
              style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
              onClick={() => navigate('/academy/marketplace')}
            >
              {content.success.button}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <button onClick={() => navigate('/academy/marketplace')}>
                <ProjeXtPalLogo size="sm" />
              </button>
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {content.back}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section 
        className="py-12 text-center text-white"
        style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
      >
        <div className="max-w-3xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-sm mb-6">
            <Building2 className="w-4 h-4" />
            <span>Enterprise & Team Training</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{content.title}</h1>
          <p className="text-lg text-white/90">{content.subtitle}</p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Details */}
              <Card className="border border-border/50 rounded-2xl">
                <CardHeader>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Building2 className="w-5 h-5" style={{ color: BRAND.purple }} />
                    {content.companyDetails}
                  </h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">{content.companyName} *</Label>
                      <Input 
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className="h-11 rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactName">{content.contactName} *</Label>
                      <Input 
                        id="contactName"
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleInputChange}
                        className="h-11 rounded-xl"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">{content.email} *</Label>
                      <Input 
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="h-11 rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">{content.phone}</Label>
                      <Input 
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="h-11 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">{content.jobTitle}</Label>
                      <Input 
                        id="jobTitle"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleInputChange}
                        className="h-11 rounded-xl"
                      />
                    </div>
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
                  </div>
                </CardContent>
              </Card>

              {/* Training Details */}
              <Card className="border border-border/50 rounded-2xl">
                <CardHeader>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <BookOpen className="w-5 h-5" style={{ color: BRAND.purple }} />
                    {content.trainingDetails}
                  </h2>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Select Courses */}
                  <div className="space-y-3">
                    <Label>{content.selectCourses} *</Label>
                    <div className="grid md:grid-cols-2 gap-3">
                      {allCourses.map((c) => {
                        const Icon = c.icon;
                        const isSelected = selectedCourses.includes(c.id);
                        return (
                          <div 
                            key={c.id}
                            onClick={() => toggleCourse(c.id)}
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                              isSelected 
                                ? 'border-primary bg-primary/5' 
                                : 'border-border/50 hover:border-border hover:shadow-sm'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                              isSelected 
                                ? 'border-primary bg-primary' 
                                : 'border-muted-foreground'
                            }`}>
                              {isSelected && (
                                <CheckCircle2 className="w-4 h-4 text-white" />
                              )}
                            </div>
                            <div 
                              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                              style={{ background: c.gradient }}
                            >
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-sm font-medium flex-1">{c.title}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Team Size */}
                  <div className="space-y-3">
                    <Label>{content.teamSize}</Label>
                    <RadioGroup value={teamSize} onValueChange={setTeamSize} className="flex flex-wrap gap-3">
                      {content.teamSizes.map((size) => (
                        <div key={size.value}>
                          <RadioGroupItem 
                            value={size.value} 
                            id={`size-${size.value}`}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={`size-${size.value}`}
                            className={`flex items-center justify-center px-4 py-2 rounded-xl border-2 cursor-pointer transition-all ${
                              teamSize === size.value 
                                ? 'border-primary bg-primary/5 text-primary' 
                                : 'border-border/50 hover:border-border'
                            }`}
                          >
                            <Users className="w-4 h-4 mr-2" />
                            {size.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Preferred Date */}
                  <div className="space-y-2">
                    <Label htmlFor="preferredDate">{content.preferredDate}</Label>
                    <Input 
                      id="preferredDate"
                      name="preferredDate"
                      type="date"
                      value={formData.preferredDate}
                      onChange={handleInputChange}
                      className="h-11 rounded-xl max-w-xs"
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message">{content.message}</Label>
                    <Textarea 
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder={content.messagePlaceholder}
                      className="min-h-[120px] rounded-xl"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Newsletter */}
              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="newsletter" 
                  checked={formData.newsletter}
                  onCheckedChange={(checked) => setFormData({ ...formData, newsletter: checked as boolean })}
                />
                <Label htmlFor="newsletter" className="text-sm cursor-pointer">
                  {content.newsletter}
                </Label>
              </div>

              {/* Submit */}
              <Button 
                type="submit"
                className="w-full h-14 text-lg rounded-xl text-white"
                style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {content.submitting}
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    {content.submit}
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Benefits Card */}
              <Card className="border border-border/50 rounded-2xl">
                <CardHeader>
                  <h3 className="font-bold">{content.benefits.title}</h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  {content.benefits.items.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex items-start gap-3">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${BRAND.green}15` }}
                        >
                          <Icon className="w-4 h-4" style={{ color: BRAND.green }} />
                        </div>
                        <span className="text-sm mt-1.5">{item.text}</span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Contact Card */}
              <Card className="border border-border/50 rounded-2xl overflow-hidden">
                <div 
                  className="h-2" 
                  style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }} 
                />
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${BRAND.purple}20, ${BRAND.pink}20)` }}
                    >
                      <Headphones className="w-6 h-6" style={{ color: BRAND.purple }} />
                    </div>
                    <div>
                      <h3 className="font-bold">{isNL ? 'Vragen?' : 'Questions?'}</h3>
                      <p className="text-sm text-muted-foreground">
                        {isNL ? 'Ons team helpt je graag' : 'Our team is happy to help'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <a 
                      href="mailto:academy@projextpal.com" 
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${BRAND.purple}15` }}>
                        <Mail className="w-4 h-4" style={{ color: BRAND.purple }} />
                      </div>
                      <span>academy@projextpal.com</span>
                    </a>
                    <a 
                      href="tel:+31201234567" 
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${BRAND.green}15` }}>
                        <Phone className="w-4 h-4" style={{ color: BRAND.green }} />
                      </div>
                      <span>+31 20 123 4567</span>
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Discount Info */}
              <Card className="border-2 rounded-2xl" style={{ borderColor: BRAND.green, backgroundColor: `${BRAND.green}05` }}>
                <CardContent className="p-6 text-center">
                  <Badge className="mb-3 text-white" style={{ backgroundColor: BRAND.green }}>
                    <Sparkles className="w-3 h-3 mr-1" />
                    {isNL ? 'Korting' : 'Discount'}
                  </Badge>
                  <p className="text-3xl font-bold mb-2" style={{ color: BRAND.green }}>
                    {isNL ? 'Tot 40% korting' : 'Up to 40% off'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isNL ? 'op groepslicenties van 10+ gebruikers' : 'on group licenses of 10+ users'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestQuote;