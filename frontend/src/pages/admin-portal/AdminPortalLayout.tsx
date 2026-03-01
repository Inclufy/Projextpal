// ============================================================
// ADMIN PORTAL LAYOUT
// Main layout with sidebar navigation for SuperAdmin portal
// Uses existing AuthContext and LanguageContext from the app
// ============================================================

import { useState } from 'react';
import { NavLink, Outlet, useLocation, Navigate, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  Puzzle,
  Settings,
  Shield,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Moon,
  Sun,
  Globe,
  HelpCircle,
  Activity,
  CreditCard,
  FileText,
  GraduationCap, 
  Layers,
  UserPlus,
  Calendar,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// =========================
// NAVIGATION CONFIG
// =========================

interface NavItem {
  title: string;
  titleNL: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

interface NavSection {
  title: string;
  titleNL: string;
  items: NavItem[];
}

const navigation: NavSection[] = [
  {
    title: 'Overview',
    titleNL: 'Overzicht',
    items: [
      {
        title: 'Dashboard',
        titleNL: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard,
      },
      {
        title: 'Activity',
        titleNL: 'Activiteit',
        href: '/admin/logs',
        icon: Activity,
      },
    ],
  },
  {
    title: 'Management',
    titleNL: 'Beheer',
    items: [
      {
        title: 'Users',
        titleNL: 'Gebruikers',
        href: '/admin/users',
        icon: Users,
      },
      {
        title: 'Organizations',
        titleNL: 'Organisaties',
        href: '/admin/tenants',
        icon: Building2,
      },
      {
        title: 'Integrations',
        titleNL: 'Integraties',
        href: '/admin/integrations',
        icon: Puzzle,
      },
      {
        title: 'Plans & Pricing',
        titleNL: 'Abonnementen',
        href: '/admin/subscriptions',
        icon: CreditCard,
      },
      {
        title: 'Demo Requests',
        titleNL: 'Demo Verzoeken',
        href: '/admin/demo-requests',
        icon: Calendar,
      },
      {
        title: 'Registrations',
        titleNL: 'Registraties',
        href: '/admin/registrations',
        icon: UserPlus,
      },
      {
        title: 'Trainings',
        titleNL: 'Trainingen',
        href: '/admin/training',
        icon: GraduationCap,
      },
      {
        title: 'Invoices',
        titleNL: 'Facturen',
        href: '/admin/invoices',
        icon: FileText,
      },
    ],
  },
  {
    title: 'System',
    titleNL: 'Systeem',
    items: [
      {
        title: 'Settings',
        titleNL: 'Instellingen',
        href: '/admin/settings',
        icon: Settings,
      },
    ],
  },
];

// =========================
// SIDEBAR COMPONENT
// =========================

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  language: string;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle, language }) => {
  const location = useLocation();
  const isNL = language === 'nl';

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-slate-900 text-white transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-700 px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold">ProjeXtPal</h1>
              <p className="text-[10px] text-slate-400">Admin Portal</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <nav className="p-2">
          {navigation.map((section, sectionIndex) => (
            <div key={section.title} className={cn(sectionIndex > 0 && 'mt-6')}>
              {!collapsed && (
                <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {isNL ? section.titleNL : section.title}
                </h3>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <li key={item.href}>
                      <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <NavLink
                              to={item.href}
                              className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                                isActive
                                  ? 'bg-purple-600 text-white'
                                  : 'text-slate-400 hover:bg-slate-800 hover:text-white',
                                collapsed && 'justify-center'
                              )}
                            >
                              <item.icon className="h-5 w-5 shrink-0" />
                              {!collapsed && (
                                <>
                                  <span className="flex-1">
                                    {isNL ? item.titleNL : item.title}
                                  </span>
                                  {item.badge && (
                                    <Badge
                                      variant={item.badgeVariant || 'secondary'}
                                      className="text-[10px]"
                                    >
                                      {item.badge}
                                    </Badge>
                                  )}
                                </>
                              )}
                            </NavLink>
                          </TooltipTrigger>
                          {collapsed && (
                            <TooltipContent side="right">
                              {isNL ? item.titleNL : item.title}
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
};

// =========================
// HEADER COMPONENT
// =========================

interface HeaderProps {
  sidebarCollapsed: boolean;
  language: string;
  setLanguage: (lang: string) => void;
  user: any;
  logout: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  sidebarCollapsed, 
  language, 
  setLanguage, 
  user, 
  logout 
}) => {
  const isNL = language === 'nl';
  const navigate = useNavigate();

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    if (logout) {
      logout();
    }
    navigate('/login');
  };

  return (
    <header
      className={cn(
        'fixed right-0 top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-6 transition-all duration-300 dark:bg-slate-950',
        sidebarCollapsed ? 'left-16' : 'left-64'
      )}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={isNL ? 'Zoeken...' : 'Search...'}
            className="w-64 pl-9"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </Button>

        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLanguage(language === 'nl' ? 'en' : 'nl')}
          title={isNL ? 'Switch to English' : 'Schakel naar Nederlands'}
        >
          <span className="text-sm font-medium">{language.toUpperCase()}</span>
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-purple-600 text-white text-xs">
                  {user?.email?.[0]?.toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium">
                  {user?.email || 'Admin'}
                </p>
                <p className="text-xs text-muted-foreground">SuperAdmin</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              {isNL ? 'Mijn Account' : 'My Account'}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              {isNL ? 'Instellingen' : 'Settings'}
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => window.location.href = 'mailto:support@inclufy.com?subject=ProjeXtPal Admin Portal Support'}>
              <HelpCircle className="mr-2 h-4 w-4" />
              {isNL ? 'Help' : 'Help'}
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={() => navigate('/dashboard')}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              {isNL ? 'Terug naar App' : 'Back to App'}
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              {isNL ? 'Uitloggen' : 'Logout'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

// =========================
// MAIN LAYOUT COMPONENT
// =========================

export default function AdminPortalLayout() {
  const { user, isLoading, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        language={language}
      />

      <Header 
        sidebarCollapsed={sidebarCollapsed} 
        language={language}
        setLanguage={setLanguage}
        user={user}
        logout={logout}
      />

      <main
        className={cn(
          'min-h-screen pt-16 transition-all duration-300',
          sidebarCollapsed ? 'pl-16' : 'pl-64'
        )}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
