import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Eye, EyeOff, Mail, Lock, User, Building2, CheckCircle2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001/api/v1';

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    password: '',
    confirmPassword: ''
  });
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
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Password mismatch',
        description: 'Please ensure both passwords match',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 8 characters',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          company_name: formData.company,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      toast({
        title: 'Account created',
        description: 'Please check your email to verify your account',
      });

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error.message || 'Unable to create account',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-12">
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
        Back to Home
      </Button>

      {/* Signup Card */}
      <Card className="w-full max-w-md relative z-10 shadow-2xl bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl ring-1 ring-purple-100 dark:ring-purple-900/50 border-0">
        <CardHeader className="text-center space-y-6 pb-6 pt-10">
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
              Create Your Account
            </CardTitle>
            <CardDescription className="text-base text-gray-600 dark:text-gray-400 font-medium">
              Start managing your projects professionally
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="px-10 pb-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  First Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="pl-10 h-11 bg-white dark:bg-gray-900 ring-1 ring-inset ring-purple-100 dark:ring-purple-900/50 focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600 rounded-xl border-0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Last Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="pl-10 h-11 bg-white dark:bg-gray-900 ring-1 ring-inset ring-purple-100 dark:ring-purple-900/50 focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600 rounded-xl border-0"
                  />
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Work Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="pl-12 h-13 bg-white dark:bg-gray-900 ring-1 ring-inset ring-purple-100 dark:ring-purple-900/50 focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600 rounded-xl border-0 text-base"
                />
              </div>
            </div>

            {/* Company Field */}
            <div className="space-y-2.5">
              <Label htmlFor="company" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Company Name <span className="text-gray-400 font-normal">(Optional)</span>
              </Label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
                <Input
                  id="company"
                  name="company"
                  type="text"
                  placeholder="Acme Inc."
                  value={formData.company}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="pl-12 h-13 bg-white dark:bg-gray-900 ring-1 ring-inset ring-purple-100 dark:ring-purple-900/50 focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600 rounded-xl border-0 text-base"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2.5">
              <Label htmlFor="password" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="pl-12 pr-12 h-13 bg-white dark:bg-gray-900 ring-1 ring-inset ring-purple-100 dark:ring-purple-900/50 focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600 rounded-xl border-0 text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2.5">
              <Label htmlFor="confirmPassword" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="pl-12 pr-12 h-13 bg-white dark:bg-gray-900 ring-1 ring-inset ring-purple-100 dark:ring-purple-900/50 focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600 rounded-xl border-0 text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start gap-3 text-sm py-2">
              <input 
                type="checkbox" 
                required
                className="w-4 h-4 mt-0.5 rounded-md border-purple-300 dark:border-purple-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
              />
              <span className="text-gray-600 dark:text-gray-400 leading-snug">
                I agree to the{' '}
                <button type="button" className="text-purple-600 dark:text-purple-400 font-bold hover:underline">
                  Terms of Service
                </button>
                {' '}and{' '}
                <button type="button" className="text-purple-600 dark:text-purple-400 font-bold hover:underline">
                  Privacy Policy
                </button>
              </span>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-13 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-base font-bold shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 rounded-xl border-0 group"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2.5 h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2.5 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Create Account
                </>
              )}
            </Button>

            {/* Login Link */}
            <div className="text-center pt-6 border-t border-purple-100 dark:border-purple-900/50">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-purple-600 dark:text-purple-400 font-bold hover:underline transition-colors"
                >
                  Sign in
                </button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          © 2026 ProjectPal. Enterprise Project Management Platform.
        </p>
      </div>
    </div>
  );
};

export default Signup;