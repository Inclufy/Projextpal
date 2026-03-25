import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Shield, CreditCard, LogOut, Mail, Calendar } from 'lucide-react';
import SubscriptionTab from '@/components/profile/SubscriptionTab';
import { usePageTranslations } from '@/hooks/usePageTranslations';

const PersonalInfoTab = () => {
  const { pt } = usePageTranslations();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <Card className="border-0 ring-1 ring-purple-100 dark:ring-purple-900/50 shadow-xl">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 ring-4 ring-purple-100 dark:ring-purple-900/30">
            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white text-2xl">
              {user?.email ? getInitials(user.email) : 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">
              {user?.firstName || user?.email?.split('@')[0] || 'User'}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Mail className="h-4 w-4" />
              {user?.email}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-purple-50/50 dark:bg-purple-900/10 ring-1 ring-purple-100 dark:ring-purple-900/30">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{pt("Role")}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{pt("Your account role")}</p>
              </div>
            </div>
            <Badge variant="secondary" className="capitalize bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
              {user?.role || 'User'}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-green-50/50 dark:bg-green-900/10 ring-1 ring-green-100 dark:ring-green-900/30">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{pt("Account Status")}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{pt("Your account is active")}</p>
              </div>
            </div>
            <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
              {pt("Active")}
            </Badge>
          </div>
        </div>

        <div className="pt-4 border-t border-purple-100 dark:border-purple-900/30">
          <Button 
            variant="destructive" 
            onClick={handleLogout}
            className="w-full font-bold rounded-xl"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {pt("Sign Out")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const SecurityTab = () => {
  const { pt } = usePageTranslations();
  return (
    <Card className="border-0 ring-1 ring-purple-100 dark:ring-purple-900/50 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{pt("Security Settings")}</CardTitle>
        <CardDescription>{pt("Manage your password and two-factor authentication")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-purple-50/50 dark:bg-purple-900/10 ring-1 ring-purple-100 dark:ring-purple-900/30">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">{pt("Password")}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {pt("Change your password to keep your account secure")}
            </p>
            <Button variant="outline" className="font-bold">
              {pt("Change Password")}
            </Button>
          </div>

          <div className="p-4 rounded-lg bg-purple-50/50 dark:bg-purple-900/10 ring-1 ring-purple-100 dark:ring-purple-900/30">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">{pt("Two-Factor Authentication")}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {pt("Add an extra layer of security to your account")}
            </p>
            <Button variant="outline" className="font-bold">
              {pt("Enable 2FA")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Profile = () => {
  const { pt } = usePageTranslations();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'personal';
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-violet-900/20">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {pt("Profile Settings")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {pt("Manage your account settings and preferences")}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-1.5 rounded-2xl ring-1 ring-purple-100 dark:ring-purple-900/50 shadow-lg">
            <TabsTrigger 
              value="personal" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-xl font-bold transition-all"
            >
              <User className="w-4 h-4" />
              {pt("Personal")}
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-xl font-bold transition-all"
            >
              <Shield className="w-4 h-4" />
              {pt("Security")}
            </TabsTrigger>
            <TabsTrigger 
              value="subscription" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-xl font-bold transition-all"
            >
              <CreditCard className="w-4 h-4" />
              {pt("Subscription")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <PersonalInfoTab />
          </TabsContent>

          <TabsContent value="security">
            <SecurityTab />
          </TabsContent>

          <TabsContent value="subscription">
            <SubscriptionTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;