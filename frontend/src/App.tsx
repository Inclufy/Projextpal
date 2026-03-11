// ============================================
// ADD THIS IMPORT AT THE VERY TOP OF App.tsx
// ============================================
import i18n from 'i18next';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Moon, Sun, LogOut, Globe, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LanguageProvider, useLanguage, languages } from "./contexts/LanguageContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import FeatureGuard from '@/components/FeatureGuard';
import { CopilotProvider, useCopilot } from "@/contexts/CopilotContext";
import AICopilotSidebar from "@/components/AICopilotSidebar";

import Registrations from '@/pages/admin-portal/Registrations';

// Existing Page Imports
import Index from "./pages/Index";
import ReportsPage from "./pages/reports/ReportsPage";
import CreatePortfolio from "./pages/governance/CreatePortfolio";
import CreateBoard from "./pages/governance/CreateBoard";
import BoardDetail from "./pages/governance/BoardDetail";
import CreateStakeholder from "./pages/governance/CreateStakeholder";
import Portfolios from "./pages/governance/Portfolios";
import PortfolioDetail from "./pages/governance/PortfolioDetail";
import GovernanceBoards from "./pages/governance/GovernanceBoards";
import Stakeholders from "./pages/governance/Stakeholders";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import DemoRequests from './pages/admin/DemoRequests';
import Signup from "./pages/Signup"; 
import TrialPending from "./pages/TrialPending";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Pricing from "./pages/Pricing";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import AIAssistant from "./pages/AIAssistant";
import Team from "./pages/Team";
import PostProject from "./pages/PostProject";
import Surveys from "./pages/Surveys";
import ProjectsOverview from "./pages/ProjectsOverview";
import ProjectDetail from "./pages/ProjectDetail";
import ProjectTimeline from "./pages/ProjectTimeline";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/AcademyCheckoutSuccess";
import CheckoutCancel from "./pages/CheckoutCancel";
import ProjectMilestones from "./pages/ProjectMilestones";
import FoundationOverview from "./pages/FoundationOverview";
import FoundationWorkflow from "./pages/FoundationWorkflow";
import FoundationCharter from "./pages/FoundationCharter";
import FoundationTeam from "./pages/FoundationTeam";
import FoundationBudget from "./pages/FoundationBudget";
import PlanningTasks from "./pages/PlanningTasks";
import PlanningRaci from "./pages/PlanningRaci";
import PlanningDependencies from "./pages/PlanningDependencies";
import PlanningCalendar from "./pages/PlanningCalendar";
import PlanningWorkflowDiagram from "./pages/PlanningWorkflowDiagram";
import PlanningSystemIntegration from "./pages/PlanningSystemIntegration";
import PlanningRisks from "./pages/PlanningRisks";
import ExecutionStakeholders from "./pages/ExecutionStakeholders";
import ExecutionNewsletters from "./pages/ExecutionNewsletters";
import ExecutionStatusReporting from "./pages/ExecutionStatusReporting";
import ExecutionMeeting from "./pages/ExecutionMeeting";
import ExecutionReporting from "./pages/ExecutionReporting";
import ExecutionGovernance from "./pages/ExecutionGovernance";
import ExecutionDeployment from "./pages/ExecutionDeployment";
import MonitoringAllDocuments from "./pages/MonitoringAllDocuments";
import MonitoringStages from "./pages/MonitoringStages";
import MonitoringMilestones from "./pages/MonitoringMilestones";
import MonitoringTraining from "./pages/MonitoringTraining";
import TrainingMarketplace from "./pages/TrainingMarketplace";
import CourseDetail from "./pages/CourseDetail";
import CourseCheckout from "./pages/CourseCheckout";
import CourseLearningPlayer from "./pages/CourseLearningPlayer";
import RequestQuote from "./pages/RequestQuote";
import MonitoringLessonsSurveys from "./pages/MonitoringLessonsSurveys";
import TimeTracking from "./pages/TimeTracking";
import CreateProject from "./pages/CreateProject";
import NotFound from "./pages/NotFound";
import IntentSelection from "./pages/IntentSelection";
import RegistrationConfirmation from "./pages/RegistrationConfirmation";
import Demo from './pages/Demo';
import OnboardingWizard from './pages/OnboardingWizard';

// Program Page Imports
import ProgramsOverview from "./pages/ProgramsOverview";
import CreateProgram from "./pages/CreateProgram";
import ProgramDashboard from "./pages/ProgramDashboard";
import ProgramBenefits from "./pages/ProgramBenefits";
import ProgramGovernance from "./pages/ProgramGovernance";
import ProgramResources from "./pages/ProgramResources";
import ProgramRoadmap from "./pages/ProgramRoadmap";
import ProgramDetail from "./pages/ProgramDetail";

// Six Sigma / Lean Six Sigma Page Imports
import SixSigmaSIPOC from "./pages/sixsigma/SixSigmaSIPOC";
import SixSigmaFishbone from "./pages/sixsigma/SixSigmaFishbone";
import SixSigmaPareto from "./pages/sixsigma/SixSigmaPareto";
import SixSigmaControlChart from "./pages/sixsigma/SixSigmaControlChart";
import SixSigmaDataCollection from "./pages/sixsigma/SixSigmaDataCollection";
import SixSigmaImprove from "./pages/sixsigma/SixSigmaImprove";
import LeanSixSigmaDMAIC from "./pages/sixsigma/LeanSixSigmaDMAIC";
import SixSigmaVOC from "./pages/sixsigma/SixSigmaVOC";
import SixSigmaHypothesis from "./pages/sixsigma/SixSigmaHypothesis";
import SixSigmaSolutions from "./pages/sixsigma/SixSigmaSolutions";
import SixSigmaFMEA from "./pages/sixsigma/SixSigmaFMEA";
import SixSigmaPilot from "./pages/sixsigma/SixSigmaPilot";
import SixSigmaImplementation from "./pages/sixsigma/SixSigmaImplementation";
import SixSigmaControlPlan from "./pages/sixsigma/SixSigmaControlPlan";
import SixSigmaTollgate from "./pages/sixsigma/SixSigmaTollgate";
import SixSigmaClosure from "./pages/sixsigma/SixSigmaClosure";
import SixSigmaBaseline from "./pages/sixsigma/SixSigmaBaseline";
import SixSigmaMSA from "./pages/sixsigma/SixSigmaMSA";
import SixSigmaRegression from "./pages/sixsigma/SixSigmaRegression";
import SixSigmaRootCause from "./pages/sixsigma/SixSigmaRootCause";
import SixSigmaSPC from "./pages/sixsigma/SixSigmaSPC";
import SixSigmaMonitoring from "./pages/sixsigma/SixSigmaMonitoring";

// PRINCE2 Methodology Page Imports
import Prince2Dashboard from "./pages/prince2/Prince2Dashboard";
import Prince2ProjectBoard from "./pages/prince2/Prince2ProjectBoard";
import Prince2StageGate from "./pages/prince2/Prince2StageGate";
import Prince2BusinessCase from "./pages/prince2/Prince2BusinessCase";
import Prince2HighlightReport from "./pages/prince2/Prince2HighlightReport";
import Prince2StagePlan from "./pages/prince2/Prince2StagePlan";
import Prince2WorkPackages from "./pages/prince2/Prince2WorkPackages";
import Prince2ProjectBrief from "./pages/prince2/Prince2ProjectBrief";
import Prince2Tolerances from "./pages/prince2/Prince2Tolerances";
import Prince2Governance from "./pages/prince2/Prince2Governance";
import Prince2ProjectClosure from "./pages/prince2/Prince2ProjectClosure";

// Scrum Pages
import ScrumOverview from './pages/scrum/ScrumOverview';
import ScrumTeam from './pages/scrum/ScrumTeam';
import ScrumBudget from './pages/scrum/ScrumBudget';
import ScrumBacklog from './pages/scrum/ScrumBacklog';
import ScrumSprintBoard from './pages/scrum/ScrumSprintBoard';
import ScrumVelocity from './pages/scrum/ScrumVelocity';
import ScrumDefinitionOfDone from './pages/scrum/ScrumDefinitionOfDone';
import ScrumDailyStandup from './pages/scrum/ScrumDailyStandup';
import ScrumRetrospective from './pages/scrum/ScrumRetrospective';
import ScrumSprintPlanning from '@/pages/scrum/ScrumSprintPlanning';
import ScrumSprintReview from '@/pages/scrum/ScrumSprintReview';
import ScrumIncrements from '@/pages/scrum/ScrumIncrements';

// Kanban Pages
import KanbanOverview from './pages/kanban/KanbanOverview';
import KanbanTeam from './pages/kanban/KanbanTeam';
import KanbanBudget from './pages/kanban/KanbanBudget';
import KanbanBoardConfiguration from './pages/kanban/KanbanBoardConfiguration';
import KanbanWIPLimits from './pages/kanban/KanbanWIPLimits';
import KanbanBoard from './pages/kanban/KanbanBoard';
import KanbanFlowMetrics from './pages/kanban/KanbanFlowMetrics';
import KanbanCFD from './pages/kanban/KanbanCFD';
import KanbanContinuousImprovement from './pages/kanban/KanbanContinuousImprovement';
import KanbanWorkItems from './pages/kanban/KanbanWorkItems';
import KanbanBlockedItems from './pages/kanban/KanbanBlockedItems';

// Agile imports
import AgileOverview from './pages/agile/AgileOverview';
import AgileTeam from './pages/agile/AgileTeam';
import AgileBudget from './pages/agile/AgileBudget';
import AgileProductVision from './pages/agile/AgileProductVision';
import AgileUserPersonas from './pages/agile/AgileUserPersonas';
import AgileBacklog from './pages/agile/AgileBacklog';
import AgileIterationBoard from './pages/agile/AgileIterationBoard';
import AgileReleasePlanning from './pages/agile/AgileReleasePlanning';
import AgileDailyProgress from './pages/agile/AgileDailyProgress';
import AgileRetrospective from './pages/agile/AgileRetrospective';
import AgileVelocity from './pages/agile/AgileVelocity';
import AgileDefinitionOfDone from './pages/agile/AgileDefinitionOfDone';

// Waterfall imports
import WaterfallOverview from './pages/waterfall/WaterfallOverview';
import WaterfallTeam from './pages/waterfall/WaterfallTeam';
import WaterfallBudget from './pages/waterfall/WaterfallBudget';
import WaterfallRequirements from './pages/waterfall/WaterfallRequirements';
import WaterfallDesign from './pages/waterfall/WaterfallDesign';
import WaterfallDevelopment from './pages/waterfall/WaterfallDevelopment';
import WaterfallTesting from './pages/waterfall/WaterfallTesting';
import WaterfallDeployment from './pages/waterfall/WaterfallDeployment';
import WaterfallMaintenance from './pages/waterfall/WaterfallMaintenance';
import WaterfallGantt from './pages/waterfall/WaterfallGantt';
import WaterfallMilestones from './pages/waterfall/WaterfallMilestones';
import WaterfallChangeRequests from './pages/waterfall/WaterfallChangeRequests';

// ============================================
// Admin Portal Imports
// ============================================
import AdminPortalLayout from './pages/admin-portal/AdminPortalLayout';
import AdminDashboard from './pages/admin-portal/AdminDashboard';
import UserManagement from './pages/admin-portal/UserManagement';
import TenantManagement from './pages/admin-portal/OrganizationManagement';
import IntegrationManagement from './pages/admin-portal/IntegrationManagement';
import AuditLogs from './pages/admin-portal/AuditLogs';
import SystemSettings from './pages/admin-portal/SystemSettings';
import PlanManagement from '@/pages/admin/PlanManagement';
import TwoFactorAuth from "./pages/settings/TwoFactorAuth";
import BiometricAuth from "./pages/settings/BiometricAuth";
import AdminTrainingManagement from '@/pages/admin-portal/AdminTrainingManagement';
import InvoiceManagement from '@/pages/admin-portal/InvoiceManagement';
import SubscriptionManagement from '@/pages/admin-portal/SubscriptionManagement';
import MonitoringDashboard from '@/pages/admin-portal/MonitoringDashboard';

// ============================================
// Query Client
// ============================================
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

// ============================================
// Language Selector Component - UPDATED
// ============================================
const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();
  const currentLang = languages.find(l => l.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" title="Language">
          <span className="text-lg">{currentLang?.flag}</span>
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
// App Header Component - UPDATED to use t() function
// ============================================
const AppHeader = () => {
  const { logout, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toggle: toggleCopilot, isOpen: copilotOpen } = useCopilot();
  const toggleTheme = () => document.documentElement.classList.toggle("dark");

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6">
      <SidebarTrigger />
      <div className="flex items-center gap-2">
        {user && <span className="text-sm text-muted-foreground mr-2">{user.email}</span>}

        {/* Website Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/landing')}
          className="gap-2"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{t.nav?.home || 'Home'}</span>
        </Button>

        {/* Language Selector */}
        <LanguageSelector />

        {/* Theme Toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* AI Copilot Toggle */}
        <Button
          variant={copilotOpen ? "default" : "ghost"}
          size="icon"
          onClick={toggleCopilot}
          title="AI Copilot"
          className={copilotOpen ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700" : ""}
        >
          <Sparkles className="h-5 w-5" />
        </Button>

        {/* Logout */}
        <Button variant="ghost" size="icon" onClick={logout} title={t.nav?.logout || 'Logout'}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

// ============================================
// App Layout Component
// ============================================
const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <CopilotProvider>
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AppHeader />
          <div className="flex-1 flex overflow-hidden">
            <main className="flex-1 overflow-auto">{children}</main>
            <AICopilotSidebar />
          </div>
        </div>
      </div>
    </SidebarProvider>
  </CopilotProvider>
);

// ============================================
// Protected Page Component
// ============================================
const ProtectedPage = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <AppLayout>{children}</AppLayout>
  </ProtectedRoute>
);

// ============================================
// Onboarding Check - Redirects first-time users
// ============================================
const OnboardingCheck = ({ children }: { children: React.ReactNode }) => {
  const hasCompleted = localStorage.getItem('onboarding_completed');
  if (!hasCompleted) {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
};

// ============================================
// Public Route Component
// ============================================
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Show loading state during authentication check
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Redirect authenticated users to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Show public content for unauthenticated users
  return <>{children}</>;
};

// ============================================
// Main App Component
// ============================================
const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
            <Routes>
              {/* ============================================ */}
              {/* Public Routes - Landing & Login              */}
              {/* ============================================ */}
              <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/pricing" element={<PublicRoute><Pricing /></PublicRoute>} />
              <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} /> 
              <Route path="/trial-pending" element={<PublicRoute><TrialPending /></PublicRoute>} />
              <Route path="/verify-email/:token" element={<PublicRoute><VerifyEmail /></PublicRoute>} />
              <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
              <Route path="/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />
              <Route path="/landing" element={<Landing />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/checkout/success" element={<CheckoutSuccess />} />
              <Route path="/checkout/cancel" element={<CheckoutCancel />} />
              <Route path="/intent-selection" element={<PublicRoute><IntentSelection /></PublicRoute>} />
              <Route path="/registration-confirmation" element={<PublicRoute><RegistrationConfirmation /></PublicRoute>} />
              <Route path="/demo" element={<Demo />} />

              {/* ============================================ */}
              {/* Admin Portal Routes (SuperAdmin Only)        */}
              {/* ============================================ */}
              <Route path="/admin" element={<AdminPortalLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="tenants" element={<TenantManagement />} />
                <Route path="integrations" element={<IntegrationManagement />} />
                <Route path="plans" element={<PlanManagement />} /> 
                <Route path="settings" element={<SystemSettings />} />
                <Route path="logs" element={<AuditLogs />} />
                <Route path="registrations" element={<Registrations />} />
                <Route path="training" element={<AdminTrainingManagement />} />
                <Route path="invoices" element={<InvoiceManagement />} />
                <Route path="subscriptions" element={<SubscriptionManagement />} />
                <Route path="demo-requests" element={<DemoRequests />} />
                <Route path="monitoring" element={<MonitoringDashboard />} />
              </Route>
              
              {/* ============================================ */}
              {/* Onboarding Wizard - First Time Setup         */}
              {/* ============================================ */}
              <Route path="/onboarding" element={
                <ProtectedRoute><OnboardingWizard /></ProtectedRoute>
              } />

              {/* ============================================ */}
              {/* Protected Routes - Dashboard & Main App      */}
              {/* ============================================ */}
              <Route path="/dashboard" element={<ProtectedPage><OnboardingCheck><Index /></OnboardingCheck></ProtectedPage>} />
              
              {/* Reports - Role-based AI reports */}
              <Route path="/reports" element={<ProtectedPage><ReportsPage /></ProtectedPage>} />
              
              {/* AI Assistant - Requires ai_assistant feature */}
              <Route path="/ai-assistant" element={
                <FeatureGuard feature="ai_assistant" requiredTier="Starter">
                  <ProtectedPage><AIAssistant /></ProtectedPage>
                </FeatureGuard>
              } />
              
              {/* Team - Requires teams feature */}
              <Route path="/team" element={
                <FeatureGuard feature="teams" requiredTier="Team">
                  <ProtectedPage><Team /></ProtectedPage>
                </FeatureGuard>
              } />
              
              {/* Post Project - Requires post_project feature */}
              <Route path="/post-project" element={
                <FeatureGuard feature="post_project" requiredTier="Team">
                  <ProtectedPage><PostProject /></ProtectedPage>
                </FeatureGuard>
              } />
              
              {/* Surveys - Always accessible */}
              <Route path="/surveys" element={<ProtectedPage><Surveys /></ProtectedPage>} />
              
              {/* Time Tracking - Requires time_tracking feature */}
              <Route path="/time-tracking" element={
                <FeatureGuard feature="time_tracking" requiredTier="Starter">
                  <ProtectedPage><TimeTracking /></ProtectedPage>
                </FeatureGuard>
              } />
              
              {/* Projects - Always accessible */}
              <Route path="/projects" element={<ProtectedPage><ProjectsOverview /></ProtectedPage>} />
              <Route path="/projects/new" element={<ProtectedPage><CreateProject /></ProtectedPage>} />
              <Route path="/projects/:id" element={<ProtectedPage><ProjectDetail /></ProtectedPage>} />
              
              {/* ============================================ */}
              {/* Program Routes - Require program_management  */}
              {/* ============================================ */}
              <Route path="/programs" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramsOverview /></ProtectedPage>
                </FeatureGuard>
              } />
              <Route path="/programs/new" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><CreateProgram /></ProtectedPage>
                </FeatureGuard>
              } />
              <Route path="/programs/:id" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramDetail /></ProtectedPage>
                </FeatureGuard>
              } />
              <Route path="/programs/:id/dashboard" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramDashboard /></ProtectedPage>
                </FeatureGuard>
              } />
              <Route path="/programs/:id/projects" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramDashboard /></ProtectedPage>
                </FeatureGuard>
              } />
              <Route path="/programs/:id/roadmap" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramRoadmap /></ProtectedPage>
                </FeatureGuard>
              } />
              <Route path="/programs/:id/resources" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramResources /></ProtectedPage>
                </FeatureGuard>
              } />
              <Route path="/programs/:id/benefits" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramBenefits /></ProtectedPage>
                </FeatureGuard>
              } />
              <Route path="/programs/:id/governance" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramGovernance /></ProtectedPage>
                </FeatureGuard>
              } />
              <Route path="/programs/:id/risks" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramDashboard /></ProtectedPage>
                </FeatureGuard>
              } />
              <Route path="/programs/:id/stakeholders" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramDashboard /></ProtectedPage>
                </FeatureGuard>
              } />
              <Route path="/programs/:id/communications" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramDashboard /></ProtectedPage>
                </FeatureGuard>
              } />
              <Route path="/programs/:id/edit" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><CreateProgram /></ProtectedPage>
                </FeatureGuard>
              } />
              
              {/* SAFe-specific routes */}
              <Route path="/programs/:id/art" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramDashboard /></ProtectedPage>
                </FeatureGuard>
              } />
              <Route path="/programs/:id/pi/current" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramDashboard /></ProtectedPage>
                </FeatureGuard>
              } />
              <Route path="/programs/:id/pi/planning" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramDashboard /></ProtectedPage>
                </FeatureGuard>
              } />
              <Route path="/programs/:id/pi/objectives" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramDashboard /></ProtectedPage>
                </FeatureGuard>
              } />
              <Route path="/programs/:id/features" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramDashboard /></ProtectedPage>
                </FeatureGuard>
              } />
              <Route path="/programs/:id/demos" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramDashboard /></ProtectedPage>
                </FeatureGuard>
              } />
              <Route path="/programs/:id/inspect-adapt" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramDashboard /></ProtectedPage>
                </FeatureGuard>
              } />
              
              {/* MSP-specific routes */}
              <Route path="/programs/:id/blueprint" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramDashboard /></ProtectedPage>
                </FeatureGuard>
              } />
              <Route path="/programs/:id/benefits/profiles" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramBenefits /></ProtectedPage>
                </FeatureGuard>
              } />
              <Route path="/programs/:id/benefits/realization" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramBenefits /></ProtectedPage>
                </FeatureGuard>
              } />
              <Route path="/programs/:id/tranches" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramRoadmap /></ProtectedPage>
                </FeatureGuard>
              } />
              <Route path="/programs/:id/transitions" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramRoadmap /></ProtectedPage>
                </FeatureGuard>
              } />
              
              {/* PMI-specific routes */}
              <Route path="/programs/:id/charter" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramDashboard /></ProtectedPage>
                </FeatureGuard>
              } />
              <Route path="/programs/:id/milestones" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramRoadmap /></ProtectedPage>
                </FeatureGuard>
              } />
              <Route path="/programs/:id/schedule" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramRoadmap /></ProtectedPage>
                </FeatureGuard>
              } />
              <Route path="/programs/:id/kpis" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramBenefits /></ProtectedPage>
                </FeatureGuard>
              } />
              
              {/* PRINCE2-specific routes */}
              <Route path="/programs/:id/business-case" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramDashboard /></ProtectedPage>
                </FeatureGuard>
              } />
              <Route path="/programs/:id/stage-gates" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramGovernance /></ProtectedPage>
                </FeatureGuard>
              } />
              <Route path="/programs/:id/exceptions" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramGovernance /></ProtectedPage>
                </FeatureGuard>
              } />
              <Route path="/programs/:id/highlights" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramGovernance /></ProtectedPage>
                </FeatureGuard>
              } />
              
              {/* General program routes */}
              <Route path="/programs/:id/dependencies" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramRoadmap /></ProtectedPage>
                </FeatureGuard>
              } />
              <Route path="/programs/:id/reports" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramGovernance /></ProtectedPage>
                </FeatureGuard>
              } />
              
              {/* ============================================ */}
              {/* Project Foundation Routes                    */}
              {/* ============================================ */}
              <Route path="/projects/:id/foundation/overview" element={<ProtectedPage><FoundationOverview /></ProtectedPage>} />
              <Route path="/projects/:id/foundation/workflow" element={<ProtectedPage><FoundationWorkflow /></ProtectedPage>} />
              <Route path="/projects/:id/foundation/charter" element={<ProtectedPage><FoundationCharter /></ProtectedPage>} />
              <Route path="/projects/:id/foundation/team" element={<ProtectedPage><FoundationTeam /></ProtectedPage>} />
              <Route path="/projects/:id/foundation/budget" element={<ProtectedPage><FoundationBudget /></ProtectedPage>} />
              
              {/* Planning & Design Routes */}
              <Route path="/projects/:id/planning/timeline" element={<ProtectedPage><ProjectTimeline /></ProtectedPage>} />
              <Route path="/projects/:id/planning/milestones" element={<ProtectedPage><ProjectMilestones /></ProtectedPage>} />
              <Route path="/projects/:id/planning/tasks" element={<ProtectedPage><PlanningTasks /></ProtectedPage>} />
              <Route path="/projects/:id/planning/raci" element={<ProtectedPage><PlanningRaci /></ProtectedPage>} />
              <Route path="/projects/:id/planning/dependencies" element={<ProtectedPage><PlanningDependencies /></ProtectedPage>} />
              <Route path="/projects/:id/planning/calendar" element={<ProtectedPage><PlanningCalendar /></ProtectedPage>} />
              <Route path="/projects/:id/planning/workflow-diagram" element={<ProtectedPage><PlanningWorkflowDiagram /></ProtectedPage>} />
              <Route path="/projects/:id/planning/system-integration" element={<ProtectedPage><PlanningSystemIntegration /></ProtectedPage>} />
              <Route path="/projects/:id/planning/risks" element={<ProtectedPage><PlanningRisks /></ProtectedPage>} />
              
              {/* Execution & Governance Routes */}
              <Route path="/projects/:id/execution/stakeholders" element={<ProtectedPage><ExecutionStakeholders /></ProtectedPage>} />
              <Route path="/projects/:id/execution/communication/newsletters" element={<ProtectedPage><ExecutionNewsletters /></ProtectedPage>} />
              <Route path="/projects/:id/execution/communication/status-reporting" element={<ProtectedPage><ExecutionStatusReporting /></ProtectedPage>} />
              <Route path="/projects/:id/execution/communication/meeting" element={<ProtectedPage><ExecutionMeeting /></ProtectedPage>} />
              <Route path="/projects/:id/execution/communication/reporting" element={<ProtectedPage><ExecutionReporting /></ProtectedPage>} />
              <Route path="/projects/:id/execution/governance" element={<ProtectedPage><ExecutionGovernance /></ProtectedPage>} />
              <Route path="/projects/:id/execution/deployment" element={<ProtectedPage><ExecutionDeployment /></ProtectedPage>} />
              
              {/* Monitoring & Closure Routes */}
              <Route path="/projects/:id/monitoring/documents/all" element={<ProtectedPage><MonitoringAllDocuments /></ProtectedPage>} />
              <Route path="/projects/:id/monitoring/documents/stages" element={<ProtectedPage><MonitoringStages /></ProtectedPage>} />
              <Route path="/projects/:id/monitoring/documents/milestones" element={<ProtectedPage><MonitoringMilestones /></ProtectedPage>} />
              <Route path="/projects/:id/monitoring/documents/training" element={<ProtectedPage><MonitoringTraining /></ProtectedPage>} />
              <Route path="/projects/:id/monitoring/lessons-surveys" element={<ProtectedPage><MonitoringLessonsSurveys /></ProtectedPage>} />
              
              {/* ============================================ */}
              {/* Lean Six Sigma / DMAIC Routes                */}
              {/* ============================================ */}
              <Route path="/projects/:id/sixsigma" element={<ProtectedPage><LeanSixSigmaDMAIC /></ProtectedPage>} />
              <Route path="/projects/:id/sixsigma/dashboard" element={<ProtectedPage><LeanSixSigmaDMAIC /></ProtectedPage>} />
              <Route path="/projects/:id/define/charter" element={<ProtectedPage><FoundationCharter /></ProtectedPage>} />
              <Route path="/projects/:id/define/sipoc" element={<ProtectedPage><SixSigmaSIPOC /></ProtectedPage>} />
              <Route path="/projects/:id/define/voc" element={<ProtectedPage><SixSigmaVOC /></ProtectedPage>} />
              <Route path="/projects/:id/define/overview" element={<ProtectedPage><FoundationOverview /></ProtectedPage>} />
              <Route path="/projects/:id/define/team" element={<ProtectedPage><FoundationTeam /></ProtectedPage>} />
              <Route path="/projects/:id/define/budget" element={<ProtectedPage><FoundationBudget /></ProtectedPage>} />
              <Route path="/projects/:id/measure/data-collection" element={<ProtectedPage><SixSigmaDataCollection /></ProtectedPage>} />
              <Route path="/projects/:id/measure/process-map" element={<ProtectedPage><PlanningWorkflowDiagram /></ProtectedPage>} />
              <Route path="/projects/:id/measure/baseline" element={<ProtectedPage><SixSigmaBaseline /></ProtectedPage>} />
              <Route path="/projects/:id/measure/msa" element={<ProtectedPage><SixSigmaMSA /></ProtectedPage>} />
              <Route path="/projects/:id/analyze/fishbone" element={<ProtectedPage><SixSigmaFishbone /></ProtectedPage>} />
              <Route path="/projects/:id/analyze/pareto" element={<ProtectedPage><SixSigmaPareto /></ProtectedPage>} />
              <Route path="/projects/:id/analyze/root-cause" element={<ProtectedPage><SixSigmaRootCause /></ProtectedPage>} />
              <Route path="/projects/:id/analyze/hypothesis" element={<ProtectedPage><SixSigmaHypothesis /></ProtectedPage>} />
              <Route path="/projects/:id/analyze/regression" element={<ProtectedPage><SixSigmaRegression /></ProtectedPage>} />
              <Route path="/projects/:id/improve/solutions" element={<ProtectedPage><SixSigmaSolutions /></ProtectedPage>} />
              <Route path="/projects/:id/improve/fmea" element={<ProtectedPage><SixSigmaFMEA /></ProtectedPage>} />
              <Route path="/projects/:id/improve/pilot" element={<ProtectedPage><SixSigmaPilot /></ProtectedPage>} />
              <Route path="/projects/:id/improve/implementation" element={<ProtectedPage><SixSigmaImplementation /></ProtectedPage>} />
              <Route path="/projects/:id/control/control-plan" element={<ProtectedPage><SixSigmaControlPlan /></ProtectedPage>} />
              <Route path="/projects/:id/control/spc" element={<ProtectedPage><SixSigmaSPC /></ProtectedPage>} />
              <Route path="/projects/:id/control/monitoring" element={<ProtectedPage><SixSigmaMonitoring /></ProtectedPage>} />
              <Route path="/projects/:id/control/documentation" element={<ProtectedPage><MonitoringAllDocuments /></ProtectedPage>} />
              <Route path="/projects/:id/control/tollgate" element={<ProtectedPage><SixSigmaTollgate /></ProtectedPage>} />
              <Route path="/projects/:id/control/closure" element={<ProtectedPage><SixSigmaClosure /></ProtectedPage>} />
              
              {/* ============================================ */}
              {/* PRINCE2 Methodology Routes                   */}
              {/* ============================================ */}
              <Route path="/projects/:id/prince2" element={<ProtectedPage><Prince2Dashboard /></ProtectedPage>} />
              <Route path="/projects/:id/prince2/dashboard" element={<ProtectedPage><Prince2Dashboard /></ProtectedPage>} />
              <Route path="/projects/:id/prince2/overview" element={<ProtectedPage><Prince2Dashboard /></ProtectedPage>} />
              <Route path="/projects/:id/prince2/project-brief" element={<ProtectedPage><Prince2ProjectBrief /></ProtectedPage>} />
              <Route path="/projects/:id/prince2/business-case" element={<ProtectedPage><Prince2BusinessCase /></ProtectedPage>} />
              <Route path="/projects/:id/prince2/stage-plan" element={<ProtectedPage><Prince2StagePlan /></ProtectedPage>} />
              <Route path="/projects/:id/prince2/stage-gate" element={<ProtectedPage><Prince2StageGate /></ProtectedPage>} />
              <Route path="/projects/:id/prince2/stage-gates" element={<ProtectedPage><Prince2StageGate /></ProtectedPage>} />
              <Route path="/projects/:id/prince2/work-packages" element={<ProtectedPage><Prince2WorkPackages /></ProtectedPage>} />
              <Route path="/projects/:id/prince2/tolerances" element={<ProtectedPage><Prince2Tolerances /></ProtectedPage>} />
              <Route path="/projects/:id/prince2/project-board" element={<ProtectedPage><Prince2ProjectBoard /></ProtectedPage>} />
              <Route path="/projects/:id/prince2/governance" element={<ProtectedPage><Prince2Governance /></ProtectedPage>} />
              <Route path="/projects/:id/prince2/highlight-report" element={<ProtectedPage><Prince2HighlightReport /></ProtectedPage>} />
              <Route path="/projects/:id/prince2/closure" element={<ProtectedPage><Prince2ProjectClosure /></ProtectedPage>} />
              <Route path="/projects/:id/prince2/project-closure" element={<ProtectedPage><Prince2ProjectClosure /></ProtectedPage>} />
              
              {/* ============================================ */}
              {/* Scrum Methodology Routes                     */}
              {/* ============================================ */}
              <Route path="/projects/:id/scrum/overview" element={<ProtectedPage><ScrumOverview /></ProtectedPage>} />
              <Route path="/projects/:id/scrum/team" element={<ProtectedPage><ScrumTeam /></ProtectedPage>} />
              <Route path="/projects/:id/scrum/budget" element={<ProtectedPage><ScrumBudget /></ProtectedPage>} />
              <Route path="/projects/:id/scrum/backlog" element={<ProtectedPage><ScrumBacklog /></ProtectedPage>} />
              <Route path="/projects/:id/scrum/sprint-board" element={<ProtectedPage><ScrumSprintBoard /></ProtectedPage>} />
              <Route path="/projects/:id/scrum/velocity" element={<ProtectedPage><ScrumVelocity /></ProtectedPage>} />
              <Route path="/projects/:id/scrum/daily-standup" element={<ProtectedPage><ScrumDailyStandup /></ProtectedPage>} />
              <Route path="/projects/:id/scrum/retrospective" element={<ProtectedPage><ScrumRetrospective /></ProtectedPage>} />
              <Route path="/projects/:id/scrum/definition-of-done" element={<ProtectedPage><ScrumDefinitionOfDone /></ProtectedPage>} />
              <Route path="/projects/:id/scrum/sprint-planning" element={<ProtectedPage><ScrumSprintPlanning /></ProtectedPage>} />
              <Route path="/projects/:id/scrum/sprint-review" element={<ProtectedPage><ScrumSprintReview /></ProtectedPage>} />
              <Route path="/projects/:id/scrum/increments" element={<ProtectedPage><ScrumIncrements /></ProtectedPage>} />

              {/* ============================================ */}
              {/* Kanban Methodology Routes                    */}
              {/* ============================================ */}
              <Route path="/projects/:id/kanban/overview" element={<ProtectedPage><KanbanOverview /></ProtectedPage>} />
              <Route path="/projects/:id/kanban/team" element={<ProtectedPage><KanbanTeam /></ProtectedPage>} />
              <Route path="/projects/:id/kanban/budget" element={<ProtectedPage><KanbanBudget /></ProtectedPage>} />
              <Route path="/projects/:id/kanban/board-configuration" element={<ProtectedPage><KanbanBoardConfiguration /></ProtectedPage>} />
              <Route path="/projects/:id/kanban/wip-limits" element={<ProtectedPage><KanbanWIPLimits /></ProtectedPage>} />
              <Route path="/projects/:id/kanban/board" element={<ProtectedPage><KanbanBoard /></ProtectedPage>} />
              <Route path="/projects/:id/kanban/metrics" element={<ProtectedPage><KanbanFlowMetrics /></ProtectedPage>} />
              <Route path="/projects/:id/kanban/cfd" element={<ProtectedPage><KanbanCFD /></ProtectedPage>} />
              <Route path="/projects/:id/kanban/improvement" element={<ProtectedPage><KanbanContinuousImprovement /></ProtectedPage>} />
              <Route path="/projects/:id/kanban/work-items" element={<ProtectedPage><KanbanWorkItems /></ProtectedPage>} />
              <Route path="/projects/:id/kanban/blocked" element={<ProtectedPage><KanbanBlockedItems /></ProtectedPage>} />

              {/* ============================================ */}
              {/* Agile Routes                                 */}
              {/* ============================================ */}
              <Route path="/projects/:id/agile/overview" element={<ProtectedPage><AgileOverview /></ProtectedPage>} />
              <Route path="/projects/:id/agile/team" element={<ProtectedPage><AgileTeam /></ProtectedPage>} />
              <Route path="/projects/:id/agile/budget" element={<ProtectedPage><AgileBudget /></ProtectedPage>} />
              <Route path="/projects/:id/agile/vision" element={<ProtectedPage><AgileProductVision /></ProtectedPage>} />
              <Route path="/projects/:id/agile/personas" element={<ProtectedPage><AgileUserPersonas /></ProtectedPage>} />
              <Route path="/projects/:id/agile/backlog" element={<ProtectedPage><AgileBacklog /></ProtectedPage>} />
              <Route path="/projects/:id/agile/iteration-board" element={<ProtectedPage><AgileIterationBoard /></ProtectedPage>} />
              <Route path="/projects/:id/agile/release-planning" element={<ProtectedPage><AgileReleasePlanning /></ProtectedPage>} />
              <Route path="/projects/:id/agile/daily-progress" element={<ProtectedPage><AgileDailyProgress /></ProtectedPage>} />
              <Route path="/projects/:id/agile/retrospective" element={<ProtectedPage><AgileRetrospective /></ProtectedPage>} />
              <Route path="/projects/:id/agile/velocity" element={<ProtectedPage><AgileVelocity /></ProtectedPage>} />
              <Route path="/projects/:id/agile/definition-of-done" element={<ProtectedPage><AgileDefinitionOfDone /></ProtectedPage>} />

              {/* ============================================ */}
              {/* Waterfall Routes                             */}
              {/* ============================================ */}
              <Route path="/projects/:id/waterfall/overview" element={<ProtectedPage><WaterfallOverview /></ProtectedPage>} />
              <Route path="/projects/:id/waterfall/team" element={<ProtectedPage><WaterfallTeam /></ProtectedPage>} />
              <Route path="/projects/:id/waterfall/budget" element={<ProtectedPage><WaterfallBudget /></ProtectedPage>} />
              <Route path="/projects/:id/waterfall/requirements" element={<ProtectedPage><WaterfallRequirements /></ProtectedPage>} />
              <Route path="/projects/:id/waterfall/design" element={<ProtectedPage><WaterfallDesign /></ProtectedPage>} />
              <Route path="/projects/:id/waterfall/development" element={<ProtectedPage><WaterfallDevelopment /></ProtectedPage>} />
              <Route path="/projects/:id/waterfall/testing" element={<ProtectedPage><WaterfallTesting /></ProtectedPage>} />
              <Route path="/projects/:id/waterfall/deployment" element={<ProtectedPage><WaterfallDeployment /></ProtectedPage>} />
              <Route path="/projects/:id/waterfall/maintenance" element={<ProtectedPage><WaterfallMaintenance /></ProtectedPage>} />
              <Route path="/projects/:id/waterfall/gantt" element={<ProtectedPage><WaterfallGantt /></ProtectedPage>} />
              <Route path="/projects/:id/waterfall/milestones" element={<ProtectedPage><WaterfallMilestones /></ProtectedPage>} />
              <Route path="/projects/:id/waterfall/change-requests" element={<ProtectedPage><WaterfallChangeRequests /></ProtectedPage>} />
              
                            {/* Academy Routes */}
              <Route path="/academy" element={<ProtectedPage><TrainingMarketplace /></ProtectedPage>} />
              <Route path="/academy/marketplace" element={<ProtectedPage><TrainingMarketplace /></ProtectedPage>} />
              <Route path="/academy/course/:id" element={<ProtectedPage><CourseDetail /></ProtectedPage>} />
              <Route path="/academy/checkout/:id" element={<ProtectedPage><CourseCheckout /></ProtectedPage>} />
              <Route path="/academy/checkout/success" element={<ProtectedPage><CheckoutSuccess /></ProtectedPage>} />
              <Route path="/academy/course/:slug/learn/:id" element={<ProtectedPage><CourseLearningPlayer /></ProtectedPage>} />
              <Route path="/academy/course/:slug/learn" element={<ProtectedPage><CourseLearningPlayer /></ProtectedPage>} />
              <Route path="/academy/learn/:id" element={<ProtectedPage><CourseLearningPlayer /></ProtectedPage>} />
              <Route path="/academy/quote/:id" element={<ProtectedPage><RequestQuote /></ProtectedPage>} />
              <Route path="/academy/quote" element={<ProtectedPage><RequestQuote /></ProtectedPage>} />

              <Route path="/profile" element={<ProtectedPage><Profile /></ProtectedPage>} />
              <Route path="/settings" element={<ProtectedPage><Settings /></ProtectedPage>} />
              <Route path="/settings/2fa" element={<ProtectedRoute><TwoFactorAuth /></ProtectedRoute>} />
              <Route path="/settings/biometric" element={<ProtectedRoute><BiometricAuth /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
              {/* Governance */}
              <Route path="/governance/portfolios" element={<ProtectedPage><Portfolios /></ProtectedPage>} />
              <Route path="/governance/portfolios/:id" element={<ProtectedPage><PortfolioDetail /></ProtectedPage>} />
              <Route path="/governance/boards" element={<ProtectedPage><GovernanceBoards /></ProtectedPage>} />
              <Route path="/governance/boards/:id" element={<ProtectedPage><BoardDetail /></ProtectedPage>} />
              <Route path="/governance/stakeholders" element={<ProtectedPage><Stakeholders /></ProtectedPage>} />
              <Route path="/governance/portfolios/new" element={<ProtectedPage><CreatePortfolio /></ProtectedPage>} />
              <Route path="/governance/boards/new" element={<ProtectedPage><CreateBoard /></ProtectedPage>} />
              <Route path="/governance/stakeholders/new" element={<ProtectedPage><CreateStakeholder /></ProtectedPage>} />
            </Routes>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;