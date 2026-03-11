import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield, ArrowLeft, Eye, EyeOff, Mail, Lock, KeyRound, Fingerprint, ScanFace } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  isBiometricSupported,
  isPlatformAuthenticatorAvailable,
  authenticateBiometric,
  getSavedBiometricEmail,
  saveBiometricEmail,
} from '@/lib/biometric';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001/api/v1';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEmail, setBiometricEmail] = useState<string | null>(null);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();

  const isNL = language === 'nl';

  // Check biometric availability on mount
  useEffect(() => {
    const checkBiometric = async () => {
      const supported = isBiometricSupported();
      if (supported) {
        const available = await isPlatformAuthenticatorAvailable();
        setBiometricAvailable(available);
        if (available) {
          const savedEmail = getSavedBiometricEmail();
          setBiometricEmail(savedEmail);
        }
      }
    };
    checkBiometric();
  }, []);
  const txt = {
    welcomeBack: isNL ? 'Welkom Terug' : 'Welcome Back',
    twoFA: isNL ? 'Twee-Factor Authenticatie' : 'Two-Factor Authentication',
    enterCode: isNL ? 'Voer je authenticatiecode in om door te gaan' : 'Enter your authenticator code to continue',
    signInTo: isNL ? 'Log in op je ProjeXtPal account' : 'Sign in to your ProjeXtPal account',
    emailLabel: isNL ? 'E-mailadres' : 'Email Address',
    emailPlaceholder: isNL ? 'jij@bedrijf.nl' : 'you@company.com',
    passwordLabel: isNL ? 'Wachtwoord' : 'Password',
    passwordPlaceholder: isNL ? 'Voer je wachtwoord in' : 'Enter your password',
    forgotPassword: isNL ? 'Wachtwoord vergeten?' : 'Forgot password?',
    rememberMe: isNL ? 'Onthoud mij voor 30 dagen' : 'Remember me for 30 days',
    signIn: isNL ? 'Inloggen' : 'Sign In',
    signingIn: isNL ? 'Bezig met inloggen...' : 'Signing in...',
    verifying: isNL ? 'Verifiëren...' : 'Verifying...',
    verifyContinue: isNL ? 'Verifieer & Ga Door' : 'Verify & Continue',
    noAccount: isNL ? 'Nog geen account?' : "Don't have an account?",
    createAccount: isNL ? 'Account aanmaken' : 'Create account',
    backToHome: isNL ? 'Terug naar home' : 'Back to Home',
    backToLogin: isNL ? 'Terug naar inloggen' : 'Back to login',
    sixDigitCode: isNL ? '6-cijferige authenticatiecode' : '6-Digit Authentication Code',
    enterAuthCode: isNL ? 'Voer de code in van je authenticator app' : 'Enter the code from your authenticator app',
    twoFARequired: isNL ? '2FA Vereist' : '2FA Required',
    enterAuthCodeMsg: isNL ? 'Voer je authenticatiecode in' : 'Please enter your authenticator code',
    authFailed: isNL ? 'Authenticatie mislukt' : 'Authentication failed',
    invalidCreds: isNL ? 'Ongeldige inloggegevens' : 'Invalid credentials',
    welcomeBackMsg: isNL ? 'Welkom terug' : 'Welcome back',
    authSuccess: isNL ? 'Authenticatie geslaagd' : 'Authentication successful',
    redirecting: isNL ? 'Doorsturen naar checkout...' : 'Redirecting to checkout...',
    settingUpPlan: isNL ? 'Instellen van' : 'Setting up',
    plan: isNL ? 'plan' : 'plan',
    copyright: isNL ? 'Enterprise Projectmanagement Platform.' : 'Enterprise Project Management Platform.',
    biometricLogin: isNL ? 'Inloggen met Face ID / Vingerafdruk' : 'Sign in with Face ID / Fingerprint',
    biometricLoading: isNL ? 'Biometrische verificatie...' : 'Biometric verification...',
    biometricFailed: isNL ? 'Biometrische login mislukt' : 'Biometric login failed',
    orDivider: isNL ? 'of' : 'or',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login-2fa/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          totp_code: requires2FA ? totpCode : undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.requires_2fa) {
        setRequires2FA(true);
        toast({
          title: txt.twoFARequired,
          description: txt.enterAuthCodeMsg,
        });
        setIsLoading(false);
        return;
      }

      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user_data', JSON.stringify(data.user));

      toast({
        title: txt.welcomeBackMsg,
        description: txt.authSuccess,
      });

      // ✅ CHECK FOR CHECKOUT REDIRECT
      const searchParams = new URLSearchParams(window.location.search);
      const redirect = searchParams.get('redirect');
      const plan = searchParams.get('plan');
      const billing = searchParams.get('billing');

      if (redirect === 'checkout' && plan) {
        // User came from pricing page - redirect back to pricing with auto-checkout
        toast({
          title: `🚀 ${txt.redirecting}`,
          description: `${txt.settingUpPlan} ${plan.charAt(0).toUpperCase() + plan.slice(1)} ${txt.plan}`,
        });

        // Small delay to show toast
        setTimeout(() => {
          window.location.href = `/pricing?auto_checkout=${plan}&billing=${billing || 'monthly'}`;
        }, 800);
      } else {
        // Normal login - go to dashboard
        window.location.href = '/dashboard';
      }
    } catch (error: any) {
      toast({
        title: txt.authFailed,
        description: error.message || txt.invalidCreds,
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    const loginEmail = biometricEmail || email;
    if (!loginEmail) {
      toast({
        title: isNL ? 'E-mail vereist' : 'Email required',
        description: isNL ? 'Vul je e-mailadres in voor biometrische login' : 'Enter your email for biometric login',
        variant: 'destructive',
      });
      return;
    }

    setIsBiometricLoading(true);
    try {
      const result = await authenticateBiometric(loginEmail);

      if (result.success && result.data) {
        localStorage.setItem('access_token', result.data.access);
        localStorage.setItem('refresh_token', result.data.refresh);
        localStorage.setItem('user_data', JSON.stringify(result.data.user));
        saveBiometricEmail(loginEmail);

        toast({
          title: txt.welcomeBackMsg,
          description: txt.authSuccess,
        });

        window.location.href = '/dashboard';
      } else {
        toast({
          title: txt.biometricFailed,
          description: result.error || txt.biometricFailed,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: txt.biometricFailed,
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsBiometricLoading(false);
    }
  };

  const handleBack = () => {
    setRequires2FA(false);
    setTotpCode('');
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Refined gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-violet-900/20" />

      {/* Refined animated blobs */}
      <div className="absolute top-0 -left-4 w-[28rem] h-[28rem] bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-0 -right-4 w-[28rem] h-[28rem] bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-[28rem] h-[28rem] bg-violet-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

      {/* Back to Home Button */}
      <Button
        variant="ghost"
        className="absolute top-8 left-8 gap-2 z-10 backdrop-blur-md bg-white/70 dark:bg-gray-800/70 hover:bg-white/90 dark:hover:bg-gray-800/90 ring-1 ring-purple-100 dark:ring-purple-900/50 rounded-xl font-semibold"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="h-4 w-4" />
        {txt.backToHome}
      </Button>

      {/* Login Card */}
      <Card className="w-full max-w-md relative z-10 shadow-2xl bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl ring-1 ring-purple-100 dark:ring-purple-900/50 border-0">
        <CardHeader className="text-center space-y-6 pb-8 pt-10">
          <div className="flex justify-center mb-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative h-20 w-20 rounded-3xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-2xl shadow-purple-500/50 transform group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl font-bold text-white">P</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
              {requires2FA ? txt.twoFA : txt.welcomeBack}
            </CardTitle>
            <CardDescription className="text-base text-gray-600 dark:text-gray-400 font-medium">
              {requires2FA
                ? txt.enterCode
                : txt.signInTo}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="px-10 pb-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!requires2FA ? (
              <>
                {/* Email Field */}
                <div className="space-y-2.5">
                  <Label htmlFor="email" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    {txt.emailLabel}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={txt.emailPlaceholder}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pl-12 h-13 bg-white dark:bg-gray-900 ring-1 ring-inset ring-purple-100 dark:ring-purple-900/50 focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600 rounded-xl border-0 text-base"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      {txt.passwordLabel}
                    </Label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-bold transition-colors py-2 px-1 -my-2 min-h-[44px] flex items-center"
                    >
                      {txt.forgotPassword}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={txt.passwordPlaceholder}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pl-12 pr-12 h-13 bg-white dark:bg-gray-900 ring-1 ring-inset ring-purple-100 dark:ring-purple-900/50 focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600 rounded-xl border-0 text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center pt-1">
                  <input
                    type="checkbox"
                    id="remember"
                    className="w-4 h-4 rounded-md border-purple-300 dark:border-purple-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                  />
                  <label htmlFor="remember" className="ml-2.5 text-sm font-medium text-gray-600 dark:text-gray-400">
                    {txt.rememberMe}
                  </label>
                </div>
              </>
            ) : (
              /* 2FA Code Input */
              <div className="space-y-8">
                <div className="flex justify-center">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                    <div className="relative h-24 w-24 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/50">
                      <Shield className="h-12 w-12 text-white" />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="totp" className="text-sm font-bold text-gray-700 dark:text-gray-300 text-center block">
                    {txt.sixDigitCode}
                  </Label>
                  <Input
                    id="totp"
                    type="text"
                    placeholder="000000"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                    maxLength={6}
                    required
                    disabled={isLoading}
                    className="text-center text-3xl tracking-[0.5em] font-mono font-bold h-16 ring-2 ring-inset ring-purple-200 dark:ring-purple-800 bg-white dark:bg-gray-900 focus:ring-purple-400 dark:focus:ring-purple-600 rounded-xl border-0"
                    autoFocus
                  />
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400 font-medium pt-2">
                    {txt.enterAuthCode}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl font-semibold"
                  onClick={handleBack}
                  disabled={isLoading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {txt.backToLogin}
                </Button>
              </div>
            )}

            {/* Biometric Login Button */}
            {biometricAvailable && !requires2FA && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-13 rounded-xl font-bold text-base gap-3 ring-1 ring-purple-200 dark:ring-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 group"
                  onClick={handleBiometricLogin}
                  disabled={isBiometricLoading || isLoading}
                >
                  {isBiometricLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {txt.biometricLoading}
                    </>
                  ) : (
                    <>
                      <ScanFace className="h-5 w-5 text-purple-500 group-hover:scale-110 transition-transform" />
                      {txt.biometricLogin}
                    </>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-purple-100 dark:border-purple-900/50" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-gray-900 px-3 text-gray-500 font-medium">
                      {txt.orDivider}
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-13 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-base font-bold shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 rounded-xl border-0 group"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2.5 h-5 w-5 animate-spin" />
                  {requires2FA ? txt.verifying : txt.signingIn}
                </>
              ) : (
                <>
                  <KeyRound className="mr-2.5 h-5 w-5 group-hover:scale-110 transition-transform" />
                  {requires2FA ? txt.verifyContinue : txt.signIn}
                </>
              )}
            </Button>

            {/* Sign Up Link */}
            {!requires2FA && (
              <div className="text-center pt-6 border-t border-purple-100 dark:border-purple-900/50">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {txt.noAccount}{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/signup')}
                    className="text-purple-600 dark:text-purple-400 font-bold hover:underline transition-colors"
                  >
                    {txt.createAccount}
                  </button>
                </p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          © 2026 ProjeXtPal. {txt.copyright}
        </p>
      </div>
    </div>
  );
};

export default Login;
