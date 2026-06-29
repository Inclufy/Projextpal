import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Loader2, 
  ArrowLeft, 
  Calendar,
  CheckCircle,
  Mail,
  Phone,
  User,
  Briefcase,
  Users,
  Clock,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

const BRAND = {
  purple: '#8B5CF6',
  pink: '#D946EF',
  green: '#22C55E',
  orange: '#EA580C',
  amber: '#F59E0B',
};

const Demo = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  
  const [processing, setProcessing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    preferred_date: '',
    preferred_time: '',
    num_participants: '1',
    message: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
        <Card className="w-full max-w-md text-center p-8">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: `linear-gradient(135deg, ${BRAND.green}, #10B981)` }}
          >
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {language === 'nl' ? 'Demo aangevraagd!' : 'Demo requested!'}
          </h2>
          <p className="text-muted-foreground mb-6">
            {language === 'nl' 
              ? 'We nemen binnen 1 werkdag contact met je op om de demo in te plannen.'
              : 'We will contact you within 1 business day to schedule the demo.'}
          </p>
          <div className="space-y-3">
            <Button onClick={() => navigate('/pricing')} variant="outline" className="w-full">
              {language === 'nl' ? 'Bekijk Prijzen' : 'View Pricing'}
            </Button>
            <Button 
              onClick={() => navigate('/')} 
              className="w-full"
              style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
            >
              {language === 'nl' ? 'Naar Homepage' : 'Go to Homepage'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {language === 'nl' ? 'Terug' : 'Back'}
        </Button>
        
        <div className="text-center mb-8">
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4"
            style={{ backgroundColor: `${BRAND.orange}15`, color: BRAND.orange }}
          >
            <Calendar className="w-4 h-4" />
            {language === 'nl' ? 'Persoonlijke Demo' : 'Personal Demo'}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {language === 'nl' ? 'Plan een Demo met ProjeXtPal' : 'Schedule a Demo with ProjeXtPal'}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {language === 'nl' 
              ? 'Ontdek hoe ProjeXtPal jouw projectmanagement transformeert met AI. Onze productspecialist laat je alles zien.'
              : 'Discover how ProjeXtPal transforms your project management with AI. Our product specialist will show you everything.'}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {language === 'nl' ? 'Demo aanvraag' : 'Demo request'}
                </CardTitle>
                <CardDescription>
                  {language === 'nl' 
                    ? 'Vul je gegevens in en we nemen zo snel mogelijk contact op'
                    : 'Fill in your details and we will contact you as soon as possible'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                          required
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
                          required
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
                          required
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
                    <Label htmlFor="message">
                      {language === 'nl' ? 'Bericht' : 'Message'}
                    </Label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Textarea
                        id="message"
                        name="message"
                        placeholder={language === 'nl' 
                          ? 'Vertel ons waar je interesse in hebt...'
                          : 'Tell us what you are interested in...'}
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={4}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit"
                    className="w-full h-12" 
                    disabled={processing}
                    style={{ background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.amber})` }}
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {language === 'nl' ? 'Versturen...' : 'Sending...'}
                      </>
                    ) : (
                      <>
                        <Calendar className="h-4 w-4 mr-2" />
                        {language === 'nl' ? 'Demo Aanvragen' : 'Request Demo'}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" style={{ color: BRAND.purple }} />
                  {language === 'nl' ? 'Wat krijg je?' : "What you'll get"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-500/10 flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {language === 'nl' ? '30 minuten demo' : '30 minute demo'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {'Live product walkthrough'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-500/10 flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {language === 'nl' ? 'Persoonlijk advies' : 'Personal advice'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {language === 'nl' ? 'Op maat voor jouw organisatie' : 'Tailored to your organization'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-500/10 flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {language === 'nl' ? 'Q&A sessie' : 'Q&A session'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {language === 'nl' ? 'Stel al je vragen' : 'Ask all your questions'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-500/10 flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {language === 'nl' ? 'Geen verplichtingen' : 'No obligations'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {language === 'nl' ? 'Vrijblijvend kennismaken' : 'No strings attached'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4" style={{ background: `linear-gradient(135deg, ${BRAND.purple}10, ${BRAND.pink}10)` }}>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  {language === 'nl' 
                    ? '⚡ We reageren binnen 1 werkdag'
                    : '⚡ We respond within 1 business day'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;
