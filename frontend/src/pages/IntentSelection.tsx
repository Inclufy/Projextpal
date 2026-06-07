import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Video, 
  CreditCard, 
  BookOpen, 
  Users,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

type Intent = '14_day_trial' | 'demo' | 'become_customer' | 'more_info' | 'contact_sales';

interface IntentOption {
  id: Intent;
  icon: any;
  title: string;
  titleNL: string;
  description: string;
  descriptionNL: string;
  badge?: string;
  badgeNL?: string;
  color: string;
  bgColor: string;
}

const intentOptions: IntentOption[] = [
  {
    id: '14_day_trial',
    icon: Calendar,
    title: '14-Day Free Trial',
    titleNL: '14 Dagen Gratis Trial',
    description: 'Start using ProjeXtPal immediately with full access',
    descriptionNL: 'Start direct met volledige toegang tot ProjeXtPal',
    badge: 'Most Popular',
    badgeNL: 'Meest Populair',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
  },
  {
    id: 'demo',
    icon: Video,
    title: 'Request Demo',
    titleNL: 'Demo Aanvragen',
    description: 'Schedule a personalized demo with our team',
    descriptionNL: 'Plan een persoonlijke demo met ons team',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
  },
  {
    id: 'become_customer',
    icon: CreditCard,
    title: 'Become a Customer',
    titleNL: 'Klant Worden',
    description: 'Get direct access to our full subscription plans',
    descriptionNL: 'Krijg direct toegang tot onze volledige abonnementen',
    color: 'text-green-600',
    bgColor: 'bg-green-50 hover:bg-green-100 border-green-200',
  },
  {
    id: 'more_info',
    icon: BookOpen,
    title: 'More Information',
    titleNL: 'Meer Informatie',
    description: 'Receive detailed product documentation and pricing',
    descriptionNL: 'Ontvang gedetailleerde productinformatie en prijzen',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 hover:bg-amber-100 border-amber-200',
  },
  {
    id: 'contact_sales',
    icon: Users,
    title: 'Talk to Sales',
    titleNL: 'Contact met Sales',
    description: 'Discuss enterprise solutions with our sales team',
    descriptionNL: 'Bespreek enterprise oplossingen met ons sales team',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200',
  },
];

const IntentSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedIntent, setSelectedIntent] = useState<Intent | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get user data from signup (passed via navigate state)
  const userData = location.state?.userData || {};
  const isNL = location.state?.language === 'nl';

  const handleSubmit = async () => {
    if (!selectedIntent) return;
    
    setIsSubmitting(true);
    
    try {
      // Save intent to backend
      const token = localStorage.getItem('access_token');
      await fetch('/api/v1/auth/registration-intent/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          intent: selectedIntent,
          email: userData.email,
        }),
      });
    } catch (error) {
      console.error('Failed to save intent:', error);
    }
    
    // Navigate to confirmation with intent
    navigate('/registration-confirmation', {
      state: {
        intent: selectedIntent,
        userData,
        language: isNL ? 'nl' : 'en',
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-violet-900/20 flex items-center justify-center p-6">
      <Card className="max-w-4xl w-full shadow-2xl border-0 ring-1 ring-purple-100 dark:ring-purple-900/50">
        <CardHeader className="text-center pb-8 border-b border-purple-100">
          <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {isNL ? 'Welkom bij ProjeXtPal!' : 'Welcome to ProjeXtPal!'}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {isNL 
              ? 'Hoe kunnen we u het beste van dienst zijn?' 
              : 'How can we best serve you?'}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {intentOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedIntent === option.id;
              
              return (
                <button
                  key={option.id}
                  onClick={() => setSelectedIntent(option.id)}
                  className={`relative p-6 rounded-2xl border-2 text-left transition-all ${
                    isSelected 
                      ? `${option.bgColor} border-current ring-4 ring-purple-100 dark:ring-purple-900/30 scale-[1.02]` 
                      : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700'
                  }`}
                >
                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute top-4 right-4">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  )}
                  
                  {/* Badge */}
                  {option.badge && (
                    <Badge className="mb-3 bg-purple-600 text-white">
                      {isNL ? option.badgeNL : option.badge}
                    </Badge>
                  )}
                  
                  {/* Icon and Title */}
                  <div className="flex items-start gap-4 mb-3">
                    <div className={`p-3 rounded-xl ${option.bgColor.split(' ')[0]}`}>
                      <Icon className={`h-6 w-6 ${option.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg mb-1">
                        {isNL ? option.titleNL : option.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {isNL ? option.descriptionNL : option.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleSubmit}
              disabled={!selectedIntent || isSubmitting}
              size="lg"
              className="px-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isNL ? 'Even geduld...' : 'Please wait...'}
                </span>
              ) : (
                isNL ? 'Doorgaan' : 'Continue'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntentSelection;
