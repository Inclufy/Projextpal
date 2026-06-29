import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Eye, EyeOff, Mail, Lock, User, Building2, CheckCircle2, Gift } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001/api/v1';

const Signup = () => {
  const [searchParams] = useSearchParams();
  const trialDays = searchParams.get('trial') || '0';
  const hasTrial = parseInt(trialDays) > 0;
  const { language } = useLanguage();
  const isNL = language === 'nl';

  const txt = {
    backToHome: isNL ? 'Terug naar home' : 'Back to Home',
    createAccount: isNL ? 'Account aanmaken' : 'Create Account',
    fillDetails: isNL ? 'Vul je gegevens in om te beginnen' : 'Fill in your details to get started',
    freeTrial: isNL ? 'dagen gratis proefperiode!' : 'days free trial!',
    firstName: isNL ? 'Voornaam' : 'First Name',
    firstNamePlaceholder: isNL ? 'Jan' : 'John',
    lastName: isNL ? 'Achternaam' : 'Last Name',
    lastNamePlaceholder: isNL ? 'Jansen' : 'Smith',
    email: isNL ? 'E-mail' : 'Email',
    emailPlaceholder: isNL ? 'jan@bedrijf.nl' : 'john@company.com',
    company: isNL ? 'Bedrijfsnaam' : 'Company Name',
    companyPlaceholder: isNL ? 'Mijn Bedrijf BV' : 'My Company Ltd',
    password: isNL ? 'Wachtwoord' : 'Password',
    minChars: isNL ? 'Minimaal 8 tekens' : 'Minimum 8 characters',
    confirmPassword: isNL ? 'Bevestig wachtwoord' : 'Confirm Password',
    repeatPassword: isNL ? 'Herhaal wachtwoord' : 'Repeat password',
    acceptTermsText: isNL ? 'Ik accepteer de' : 'I accept the',
    termsLink: isNL ? 'algemene voorwaarden' : 'terms and conditions',
    andText: isNL ? 'en' : 'and',
    privacyLink: isNL ? 'privacybeleid' : 'privacy policy',
    newsletter: isNL ? 'Ja, houd mij op de hoogte van nieuwe functies, tips en aanbiedingen (optioneel)' : 'Yes, keep me updated on new features, tips and offers (optional)',
    freeAccess: isNL ? 'dagen gratis toegang' : 'days free access',
    fullAccess: isNL ? 'Volledige toegang tot alle functies. Geen creditcard vereist. Automatisch annuleren na proefperiode.' : 'Full access to all features. No credit card required. Automatically cancels after trial.',
    creating: isNL ? 'Account aanmaken...' : 'Creating account...',
    alreadyHaveAccount: isNL ? 'Heb je al een account?' : 'Already have an account?',
    logIn: 'Log in',
    termsRequired: isNL ? 'Algemene voorwaarden vereist' : 'Terms required',
    termsRequiredDesc: isNL ? 'Je moet de algemene voorwaarden accepteren om door te gaan' : 'You must accept the terms and conditions to continue',
    passwordsMismatch: isNL ? 'Wachtwoorden komen niet overeen' : 'Passwords do not match',
    passwordsMismatchDesc: isNL ? 'Zorg ervoor dat beide wachtwoorden hetzelfde zijn' : 'Make sure both passwords are the same',
    passwordTooShort: isNL ? 'Wachtwoord te kort' : 'Password too short',
    passwordTooShortDesc: isNL ? 'Wachtwoord moet minimaal 8 tekens zijn' : 'Password must be at least 8 characters',
    registrationFailed: isNL ? 'Registratie mislukt' : 'Registration failed',
    somethingWentWrong: isNL ? 'Er ging iets mis. Probeer het opnieuw.' : 'Something went wrong. Please try again.',
  };

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    password: '',
    confirmPassword: ''
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptTerms) {
      toast({
        title: txt.termsRequired,
        description: txt.termsRequiredDesc,
        variant: 'destructive',
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: txt.passwordsMismatch,
        description: txt.passwordsMismatchDesc,
        variant: 'destructive',
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: txt.passwordTooShort,
        description: txt.passwordTooShortDesc,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          company_name: formData.company,
          password: formData.password,
          trial_days: hasTrial ? parseInt(trialDays) : 0,
          accept_terms: acceptTerms,
          subscribe_newsletter: subscribeNewsletter,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || txt.registrationFailed);
      }

      navigate('/intent-selection', {
        state: {
          userData: {
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            company: formData.company,
          },
          language: language,
        },
      });

    } catch (error: any) {
      toast({
        title: txt.registrationFailed,
        description: error.message || txt.somethingWentWrong,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-fit -ml-2"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {txt.backToHome}
          </Button>
          <CardTitle className="text-2xl font-bold">{txt.createAccount}</CardTitle>
          <CardDescription>
            {hasTrial ? (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold">
                <Gift className="w-4 h-4" />
                {trialDays} {txt.freeTrial}
              </div>
            ) : (
              txt.fillDetails
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{txt.firstName}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder={txt.firstNamePlaceholder}
                    value={formData.firstName}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{txt.lastName}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder={txt.lastNamePlaceholder}
                    value={formData.lastName}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{txt.email}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={txt.emailPlaceholder}
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">{txt.company}</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="company"
                  name="company"
                  type="text"
                  placeholder={txt.companyPlaceholder}
                  value={formData.company}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{txt.password}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={txt.minChars}
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{txt.confirmPassword}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={txt.repeatPassword}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                  className="mt-1"
                />
                <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer select-none">
                  {txt.acceptTermsText} <a href="/terms" target="_blank" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 underline font-medium" onClick={(e) => e.stopPropagation()}>{txt.termsLink}</a> {txt.andText} <a href="/privacy" target="_blank" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 underline font-medium" onClick={(e) => e.stopPropagation()}>{txt.privacyLink}</a> *
                </label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="newsletter"
                  checked={subscribeNewsletter}
                  onCheckedChange={(checked) => setSubscribeNewsletter(checked as boolean)}
                  className="mt-1"
                />
                <label htmlFor="newsletter" className="text-sm leading-relaxed cursor-pointer select-none text-muted-foreground">
                  {txt.newsletter}
                </label>
              </div>
            </div>

            {hasTrial && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900 dark:text-green-100">
                      {trialDays} {txt.freeAccess}
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      {txt.fullAccess}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading || !acceptTerms}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {txt.creating}
                </>
              ) : (
                <>{txt.createAccount}</>
              )}
            </Button>

            <p className="text-sm text-center text-gray-600 dark:text-gray-400">
              {txt.alreadyHaveAccount}{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
              >
                {txt.logIn}
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
