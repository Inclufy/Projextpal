import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Moon, Sun, LogOut, Globe, Loader2, Sparkles, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useLanguage, languages } from "./contexts/LanguageContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import FeatureGuard from '@/components/FeatureGuard';
import { CopilotProvider, useCopilot } from "@/contexts/CopilotContext";
import AICopilotSidebar from "@/components/AICopilotSidebar";

const Registrations = lazy(() => import('@/pages/admin-portal/Registrations'));

// Existing Page Imports
const Index = lazy(() => import("./pages/Index"));
const ReportsPage = lazy(() => import("./pages/reports/ReportsPage"));
const CreatePortfolio = lazy(() => import("./pages/governance/CreatePortfolio"));
const CreateBoard = lazy(() => import("./pages/governance/CreateBoard"));
const BoardDetail = lazy(() => import("./pages/governance/BoardDetail"));
const CreateStakeholder = lazy(() => import("./pages/governance/CreateStakeholder"));
const Portfolios = lazy(() => import("./pages/governance/Portfolios"));
const PortfolioDetail = lazy(() => import("./pages/governance/PortfolioDetail"));
const GovernanceBoards = lazy(() => import("./pages/governance/GovernanceBoards"));
const Stakeholders = lazy(() => import("./pages/governance/Stakeholders"));
const Decisions = lazy(() => import("./pages/governance/Decisions"));
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const DemoRequests = lazy(() => import('./pages/admin/DemoRequests'));
const Signup = lazy(() => import("./pages/Signup")); 
const TrialPending = lazy(() => import("./pages/TrialPending"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const AIAssistant = lazy(() => import("./pages/AIAssistant"));
const Team = lazy(() => import("./pages/Team"));
const PostProject = lazy(() => import("./pages/PostProject"));
const Surveys = lazy(() => import("./pages/Surveys"));
const ProjectsOverview = lazy(() => import("./pages/ProjectsOverview"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const ProjectTimeline = lazy(() => import("./pages/ProjectTimeline"));
const Checkout = lazy(() => import("./pages/Checkout"));
const CheckoutSuccess = lazy(() => import("./pages/AcademyCheckoutSuccess"));
const CheckoutCancel = lazy(() => import("./pages/CheckoutCancel"));
const ProjectMilestones = lazy(() => import("./pages/ProjectMilestones"));
const FoundationOverview = lazy(() => import("./pages/FoundationOverview"));
const FoundationWorkflow = lazy(() => import("./pages/FoundationWorkflow"));
const FoundationCharter = lazy(() => import("./pages/FoundationCharter"));
const FoundationTeam = lazy(() => import("./pages/FoundationTeam"));
const FoundationBudget = lazy(() => import("./pages/FoundationBudget"));
const FoundationCommunicationPlan = lazy(() => import("./pages/FoundationCommunicationPlan"));
const FoundationClosure = lazy(() => import("./pages/FoundationClosure"));
const FoundationInvoices = lazy(() => import("./pages/FoundationInvoices"));
const PlanningTasks = lazy(() => import("./pages/PlanningTasks"));
const PlanningRaci = lazy(() => import("./pages/PlanningRaci"));
const PlanningDependencies = lazy(() => import("./pages/PlanningDependencies"));
const PlanningCalendar = lazy(() => import("./pages/PlanningCalendar"));
const PlanningWorkflowDiagram = lazy(() => import("./pages/PlanningWorkflowDiagram"));
const PlanningSystemIntegration = lazy(() => import("./pages/PlanningSystemIntegration"));
const PlanningRisks = lazy(() => import("./pages/PlanningRisks"));
const ExecutionStakeholders = lazy(() => import("./pages/ExecutionStakeholders"));
const ExecutionNewsletters = lazy(() => import("./pages/ExecutionNewsletters"));
const ExecutionStatusReporting = lazy(() => import("./pages/ExecutionStatusReporting"));
const ExecutionMeeting = lazy(() => import("./pages/ExecutionMeeting"));
const ExecutionReporting = lazy(() => import("./pages/ExecutionReporting"));
const AIStatusReport = lazy(() => import("./pages/AIStatusReport"));
const AIRiskForecast = lazy(() => import("./pages/AIRiskForecast"));
const ExecutionGovernance = lazy(() => import("./pages/ExecutionGovernance"));
const ExecutionDeployment = lazy(() => import("./pages/ExecutionDeployment"));
const MonitoringAllDocuments = lazy(() => import("./pages/MonitoringAllDocuments"));
const MonitoringStages = lazy(() => import("./pages/MonitoringStages"));
const MonitoringMilestones = lazy(() => import("./pages/MonitoringMilestones"));
const MonitoringTraining = lazy(() => import("./pages/MonitoringTraining"));
const TrainingMarketplace = lazy(() => import("./pages/TrainingMarketplace"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const CourseCheckout = lazy(() => import("./pages/CourseCheckout"));
const CourseLearningPlayer = lazy(() => import("./pages/CourseLearningPlayer"));
const RequestQuote = lazy(() => import("./pages/RequestQuote"));
const MonitoringLessonsSurveys = lazy(() => import("./pages/MonitoringLessonsSurveys"));
const TimeTracking = lazy(() => import("./pages/TimeTracking"));
const CreateProject = lazy(() => import("./pages/CreateProject"));
const NotFound = lazy(() => import("./pages/NotFound"));
const IntentSelection = lazy(() => import("./pages/IntentSelection"));
const RegistrationConfirmation = lazy(() => import("./pages/RegistrationConfirmation"));
const Demo = lazy(() => import('./pages/Demo'));
const OnboardingWizard = lazy(() => import('./pages/OnboardingWizard'));
const DemoEnvironment = lazy(() => import('./pages/DemoEnvironment'));
const SetupOnboarding = lazy(() => import('./pages/SetupOnboarding'));

// Program Page Imports
const ProgramsOverview = lazy(() => import("./pages/ProgramsOverview"));
const CreateProgram = lazy(() => import("./pages/CreateProgram"));
const ProgramDashboard = lazy(() => import("./pages/ProgramDashboard"));
const ProgramBenefits = lazy(() => import("./pages/ProgramBenefits"));
const ProgramSafe = lazy(() => import("./pages/ProgramSafe"));
const ProgramMSP = lazy(() => import("./pages/ProgramMSP"));
const ProgramPMI = lazy(() => import("./pages/ProgramPMI"));
const ProgramP2 = lazy(() => import("./pages/ProgramP2"));
const ProgramHybridGovernance = lazy(() => import("./pages/ProgramHybridGovernance"));
const ProgramGovernance = lazy(() => import("./pages/ProgramGovernance"));
const ProgramResources = lazy(() => import("./pages/ProgramResources"));
const ProgramRoadmap = lazy(() => import("./pages/ProgramRoadmap"));
const ProgramDetail = lazy(() => import("./pages/ProgramDetail"));

// Six Sigma / Lean Six Sigma Page Imports
const SixSigmaSIPOC = lazy(() => import("./pages/sixsigma/SixSigmaSIPOC"));
const SixSigmaFishbone = lazy(() => import("./pages/sixsigma/SixSigmaFishbone"));
const SixSigmaPareto = lazy(() => import("./pages/sixsigma/SixSigmaPareto"));
const SixSigmaControlChart = lazy(() => import("./pages/sixsigma/SixSigmaControlChart"));
const SixSigmaDataCollection = lazy(() => import("./pages/sixsigma/SixSigmaDataCollection"));
const SixSigmaImprove = lazy(() => import("./pages/sixsigma/SixSigmaImprove"));
const LeanSixSigmaDMAIC = lazy(() => import("./pages/sixsigma/LeanSixSigmaDMAIC"));
const SixSigmaVOC = lazy(() => import("./pages/sixsigma/SixSigmaVOC"));
const SixSigmaHypothesis = lazy(() => import("./pages/sixsigma/SixSigmaHypothesis"));
const SixSigmaSolutions = lazy(() => import("./pages/sixsigma/SixSigmaSolutions"));
const SixSigmaFMEA = lazy(() => import("./pages/sixsigma/SixSigmaFMEA"));
const SixSigmaPilot = lazy(() => import("./pages/sixsigma/SixSigmaPilot"));
const SixSigmaImplementation = lazy(() => import("./pages/sixsigma/SixSigmaImplementation"));
const SixSigmaControlPlan = lazy(() => import("./pages/sixsigma/SixSigmaControlPlan"));
const SixSigmaTollgate = lazy(() => import("./pages/sixsigma/SixSigmaTollgate"));
const SixSigmaClosure = lazy(() => import("./pages/sixsigma/SixSigmaClosure"));
const SixSigmaBaseline = lazy(() => import("./pages/sixsigma/SixSigmaBaseline"));
const SixSigmaMSA = lazy(() => import("./pages/sixsigma/SixSigmaMSA"));
const SixSigmaRegression = lazy(() => import("./pages/sixsigma/SixSigmaRegression"));
const SixSigmaRootCause = lazy(() => import("./pages/sixsigma/SixSigmaRootCause"));
const SixSigmaSPC = lazy(() => import("./pages/sixsigma/SixSigmaSPC"));
const SixSigmaMonitoring = lazy(() => import("./pages/sixsigma/SixSigmaMonitoring"));

// PRINCE2 Methodology Page Imports
const Prince2Dashboard = lazy(() => import("./pages/prince2/Prince2Dashboard"));
const Prince2ProjectBoard = lazy(() => import("./pages/prince2/Prince2ProjectBoard"));
const Prince2StageGate = lazy(() => import("./pages/prince2/Prince2StageGate"));
const Prince2BusinessCase = lazy(() => import("./pages/prince2/Prince2BusinessCase"));
const Prince2HighlightReport = lazy(() => import("./pages/prince2/Prince2HighlightReport"));
const Prince2StagePlan = lazy(() => import("./pages/prince2/Prince2StagePlan"));
const Prince2WorkPackages = lazy(() => import("./pages/prince2/Prince2WorkPackages"));
const Prince2ProjectBrief = lazy(() => import("./pages/prince2/Prince2ProjectBrief"));
const Prince2Tolerances = lazy(() => import("./pages/prince2/Prince2Tolerances"));
const Prince2Governance = lazy(() => import("./pages/prince2/Prince2Governance"));
const Prince2ProjectClosure = lazy(() => import("./pages/prince2/Prince2ProjectClosure"));
const Prince2ClosureChecklist = lazy(() => import("./pages/prince2/Prince2ClosureChecklist"));
const Prince2LessonsLog = lazy(() => import("./pages/prince2/Prince2LessonsLog"));
const Prince2BenefitsReview = lazy(() => import("./pages/prince2/Prince2BenefitsReview"));
const Prince2Risks = lazy(() => import("./pages/prince2/Prince2Risks"));
const Prince2Issues = lazy(() => import("./pages/prince2/Prince2Issues"));
const Prince2ExceptionReports = lazy(() => import("./pages/prince2/Prince2ExceptionReports"));
const Prince2ExceptionPlan = lazy(() => import("./pages/prince2/Prince2ExceptionPlan"));
const Prince2QualityRegister = lazy(() => import("./pages/prince2/Prince2QualityRegister"));
const Prince2DailyLog = lazy(() => import("./pages/prince2/Prince2DailyLog"));
const Prince2ManagementApproaches = lazy(() => import("./pages/prince2/Prince2ManagementApproaches"));
const Prince2ProductStatus = lazy(() => import("./pages/prince2/Prince2ProductStatus"));
const Prince2Planning = lazy(() => import("./pages/prince2/Prince2Planning"));

// Scrum Pages
const ScrumOverview = lazy(() => import('./pages/scrum/ScrumOverview'));
const ScrumTeam = lazy(() => import('./pages/scrum/ScrumTeam'));
const ScrumBudget = lazy(() => import('./pages/scrum/ScrumBudget'));
const ScrumBacklog = lazy(() => import('./pages/scrum/ScrumBacklog'));
const ScrumSprintBoard = lazy(() => import('./pages/scrum/ScrumSprintBoard'));
const ScrumVelocity = lazy(() => import('./pages/scrum/ScrumVelocity'));
const ScrumDefinitionOfDone = lazy(() => import('./pages/scrum/ScrumDefinitionOfDone'));
const ScrumDailyStandup = lazy(() => import('./pages/scrum/ScrumDailyStandup'));
const ScrumRetrospective = lazy(() => import('./pages/scrum/ScrumRetrospective'));
const ScrumSprintPlanning = lazy(() => import('@/pages/scrum/ScrumSprintPlanning'));
const ScrumSprintReview = lazy(() => import('@/pages/scrum/ScrumSprintReview'));
const ScrumIncrements = lazy(() => import('@/pages/scrum/ScrumIncrements'));
const ScrumProductGoals = lazy(() => import('@/pages/scrum/ScrumProductGoals'));
const ScrumRetroActions = lazy(() => import('@/pages/scrum/ScrumRetroActions'));
const ScrumSprintReport = lazy(() => import('@/pages/scrum/ScrumSprintReport'));

// Kanban Pages
const KanbanOverview = lazy(() => import('./pages/kanban/KanbanOverview'));
const KanbanTeam = lazy(() => import('./pages/kanban/KanbanTeam'));
const KanbanBudget = lazy(() => import('./pages/kanban/KanbanBudget'));
const KanbanBoardConfiguration = lazy(() => import('./pages/kanban/KanbanBoardConfiguration'));
const KanbanWIPLimits = lazy(() => import('./pages/kanban/KanbanWIPLimits'));
const KanbanBoard = lazy(() => import('./pages/kanban/KanbanBoard'));
const KanbanFlowMetrics = lazy(() => import('./pages/kanban/KanbanFlowMetrics'));
const KanbanCFD = lazy(() => import('./pages/kanban/KanbanCFD'));
const KanbanContinuousImprovement = lazy(() => import('./pages/kanban/KanbanContinuousImprovement'));
const KanbanWorkItems = lazy(() => import('./pages/kanban/KanbanWorkItems'));
const KanbanBlockedItems = lazy(() => import('./pages/kanban/KanbanBlockedItems'));
const KanbanWorkPolicies = lazy(() => import('./pages/kanban/KanbanWorkPolicies'));
const KanbanServiceReview = lazy(() => import('./pages/kanban/KanbanServiceReview'));

// Agile imports
const AgileOverview = lazy(() => import('./pages/agile/AgileOverview'));
const AgileTeam = lazy(() => import('./pages/agile/AgileTeam'));
const AgileBudget = lazy(() => import('./pages/agile/AgileBudget'));
const AgileProductVision = lazy(() => import('./pages/agile/AgileProductVision'));
const AgileUserPersonas = lazy(() => import('./pages/agile/AgileUserPersonas'));
const AgileBacklog = lazy(() => import('./pages/agile/AgileBacklog'));
const AgileEpics = lazy(() => import('./pages/agile/AgileEpics'));
const AgileIterationBoard = lazy(() => import('./pages/agile/AgileIterationBoard'));
const AgileReleasePlanning = lazy(() => import('./pages/agile/AgileReleasePlanning'));
const AgileDailyProgress = lazy(() => import('./pages/agile/AgileDailyProgress'));
const AgileRetrospective = lazy(() => import('./pages/agile/AgileRetrospective'));
const AgileStakeholderFeedback = lazy(() => import('./pages/agile/AgileStakeholderFeedback'));
const AgileVelocity = lazy(() => import('./pages/agile/AgileVelocity'));
const AgileDefinitionOfDone = lazy(() => import('./pages/agile/AgileDefinitionOfDone'));
const AgileIterationReport = lazy(() => import('./pages/agile/AgileIterationReport'));

// LSS Green imports
const LSSGreenOverview = lazy(() => import('./pages/lss-green/LSSGreenOverview'));
const LSSGreenPhases = lazy(() => import('./pages/lss-green/LSSGreenPhases'));
const LSSGreenTasks = lazy(() => import('./pages/lss-green/LSSGreenTasks'));
const LSSGreenTimeline = lazy(() => import('./pages/lss-green/LSSGreenTimeline'));
const LSSGreenMetrics = lazy(() => import('./pages/lss-green/LSSGreenMetrics'));
const LSSGreenMeasurements = lazy(() => import('./pages/lss-green/LSSGreenMeasurements'));
const LSSGreenTollgateReport = lazy(() => import('./pages/lss-green/LSSGreenTollgateReport'));

// LSS Black imports
const LSSBlackOverview = lazy(() => import('./pages/lss-black/LSSBlackOverview'));
const LSSBlackPhases = lazy(() => import('./pages/lss-black/LSSBlackPhases'));
const LSSBlackTasks = lazy(() => import('./pages/lss-black/LSSBlackTasks'));
const LSSBlackTimeline = lazy(() => import('./pages/lss-black/LSSBlackTimeline'));
const LSSBlackHypothesisTests = lazy(() => import('./pages/lss-black/LSSBlackHypothesisTests'));
const LSSBlackDOE = lazy(() => import('./pages/lss-black/LSSBlackDOE'));
const LSSBlackControlPlans = lazy(() => import('./pages/lss-black/LSSBlackControlPlans'));
const LSSBlackSPCCharts = lazy(() => import('./pages/lss-black/LSSBlackSPCCharts'));
const LSSBlackTollgateReport = lazy(() => import('./pages/lss-black/LSSBlackTollgateReport'));

// Hybrid imports
const HybridOverview = lazy(() => import('./pages/hybrid/HybridOverview'));
const HybridPhases = lazy(() => import('./pages/hybrid/HybridPhases'));
const HybridTasks = lazy(() => import('./pages/hybrid/HybridTasks'));
const HybridTimeline = lazy(() => import('./pages/hybrid/HybridTimeline'));
const HybridArtifacts = lazy(() => import('./pages/hybrid/HybridArtifacts'));
const HybridConfiguration = lazy(() => import('./pages/hybrid/HybridConfiguration'));
const HybridPhaseReport = lazy(() => import('./pages/hybrid/HybridPhaseReport'));

// Waterfall imports
const WaterfallOverview = lazy(() => import('./pages/waterfall/WaterfallOverview'));
const WaterfallTeam = lazy(() => import('./pages/waterfall/WaterfallTeam'));
const WaterfallBudget = lazy(() => import('./pages/waterfall/WaterfallBudget'));
const WaterfallRequirements = lazy(() => import('./pages/waterfall/WaterfallRequirements'));
const WaterfallDesign = lazy(() => import('./pages/waterfall/WaterfallDesign'));
const WaterfallDevelopment = lazy(() => import('./pages/waterfall/WaterfallDevelopment'));
const WaterfallTesting = lazy(() => import('./pages/waterfall/WaterfallTesting'));
const WaterfallDeployment = lazy(() => import('./pages/waterfall/WaterfallDeployment'));
const WaterfallMaintenance = lazy(() => import('./pages/waterfall/WaterfallMaintenance'));
const WaterfallGantt = lazy(() => import('./pages/waterfall/WaterfallGantt'));
const WaterfallMilestones = lazy(() => import('./pages/waterfall/WaterfallMilestones'));
const WaterfallChangeRequests = lazy(() => import('./pages/waterfall/WaterfallChangeRequests'));
const WaterfallPhaseGate = lazy(() => import('./pages/waterfall/WaterfallPhaseGate'));
const WaterfallRisks = lazy(() => import('./pages/waterfall/WaterfallRisks'));
const WaterfallIssues = lazy(() => import('./pages/waterfall/WaterfallIssues'));
const WaterfallDeliverables = lazy(() => import('./pages/waterfall/WaterfallDeliverables'));
const WaterfallBaselines = lazy(() => import('./pages/waterfall/WaterfallBaselines'));
const WaterfallPhaseGateReport = lazy(() => import('./pages/waterfall/WaterfallPhaseGateReport'));

// ============================================
// Admin Portal Imports
// ============================================
const AdminPortalLayout = lazy(() => import('./pages/admin-portal/AdminPortalLayout'));
const AdminDashboard = lazy(() => import('./pages/admin-portal/AdminDashboard'));
const UserManagement = lazy(() => import('./pages/admin-portal/UserManagement'));
const TenantManagement = lazy(() => import('./pages/admin-portal/OrganizationManagement'));
const TenantProvisioning = lazy(() => import('./pages/admin-portal/TenantProvisioning'));
const TenantEdit = lazy(() => import('./pages/admin-portal/TenantEdit'));
const IntegrationManagement = lazy(() => import('./pages/admin-portal/IntegrationManagement'));
const AutomationRules = lazy(() => import('./pages/admin-portal/AutomationRules'));
const AuditLogs = lazy(() => import('./pages/admin-portal/AuditLogs'));
const SystemSettings = lazy(() => import('./pages/admin-portal/SystemSettings'));
const PlanManagement = lazy(() => import('@/pages/admin/PlanManagement'));
const TwoFactorAuth = lazy(() => import("./pages/settings/TwoFactorAuth"));
const BiometricAuth = lazy(() => import("./pages/settings/BiometricAuth"));
const AdminTrainingManagement = lazy(() => import('@/pages/admin-portal/AdminTrainingManagement'));
const InvoiceManagement = lazy(() => import('@/pages/admin-portal/InvoiceManagement'));
const SubscriptionManagement = lazy(() => import('@/pages/admin-portal/SubscriptionManagement'));
const MonitoringDashboard = lazy(() => import('@/pages/admin-portal/MonitoringDashboard'));

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
  const { toggle: toggleCopilot, isOpen: copilotOpen, openWithTab } = useCopilot();
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
          onClick={() => openWithTab("chat")}
          title="AI Copilot"
          className={copilotOpen ? "bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white hover:from-purple-600 hover:to-fuchsia-700" : ""}
        >
          <Sparkles className="h-5 w-5" />
        </Button>

        {/* Guide Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => openWithTab("guide")}
          title="Gids"
        >
          <HelpCircle className="h-5 w-5" />
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
      {/* h-screen + overflow-hidden locks the shell to viewport height so
          inner panels (main + AI Copilot sidebar) scroll independently and
          the page itself never scrolls. Previously min-h-screen allowed the
          AI Copilot's chat/issues content to push the body past the viewport. */}
      <div className="h-screen flex w-full overflow-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 h-screen">
          <AppHeader />
          <div className="flex-1 flex min-h-0 overflow-hidden">
            <main className="flex-1 overflow-auto min-w-0">{children}</main>
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
// SuperAdmin Route Guard
// ============================================
const SuperAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-purple-600" /></div>;
  }

  if (!isAuthenticated || !user?.isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
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
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-muted-foreground">Loading…</div>}><Routes>
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
              <Route path="/demo-environment" element={<ProtectedRoute><DemoEnvironment /></ProtectedRoute>} />
              <Route path="/setup-onboarding" element={<ProtectedRoute><SetupOnboarding /></ProtectedRoute>} />

              {/* ============================================ */}
              {/* Admin Portal Routes (SuperAdmin Only)        */}
              {/* ============================================ */}
              <Route path="/admin" element={<SuperAdminRoute><AdminPortalLayout /></SuperAdminRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="tenants" element={<TenantManagement />} />
                <Route path="tenants/new" element={<TenantProvisioning />} />
                <Route path="tenants/:id/edit" element={<TenantEdit />} />
                <Route path="integrations" element={<IntegrationManagement />} />
                <Route path="automation-rules" element={<AutomationRules />} />
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
              
              {/* SAFe-specific routes — real executable PI loop (#34) */}
              <Route path="/programs/:id/art" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramSafe /></ProtectedPage>
                </FeatureGuard>
              } />
              <Route path="/programs/:id/pi/current" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramSafe /></ProtectedPage>
                </FeatureGuard>
              } />
              <Route path="/programs/:id/pi/planning" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramSafe /></ProtectedPage>
                </FeatureGuard>
              } />
              <Route path="/programs/:id/pi/objectives" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramSafe /></ProtectedPage>
                </FeatureGuard>
              } />
              <Route path="/programs/:id/features" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramSafe /></ProtectedPage>
                </FeatureGuard>
              } />
              <Route path="/programs/:id/demos" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramSafe /></ProtectedPage>
                </FeatureGuard>
              } />
              <Route path="/programs/:id/inspect-adapt" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramSafe /></ProtectedPage>
                </FeatureGuard>
              } />
              
              {/* MSP-specific routes — Blueprint (POTI+Vision), benefits variance, tranche-close gate (#35) */}
              <Route path="/programs/:id/blueprint" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramMSP /></ProtectedPage>
                </FeatureGuard>
              } />
              <Route path="/programs/:id/benefits/profiles" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramMSP /></ProtectedPage>
                </FeatureGuard>
              } />
              <Route path="/programs/:id/benefits/realization" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramMSP /></ProtectedPage>
                </FeatureGuard>
              } />
              <Route path="/programs/:id/tranches" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramMSP /></ProtectedPage>
                </FeatureGuard>
              } />
              <Route path="/programs/:id/transitions" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramMSP /></ProtectedPage>
                </FeatureGuard>
              } />
              
              {/* PMI-specific routes */}
              <Route path="/programs/:id/charter" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramPMI /></ProtectedPage>
                </FeatureGuard>
              } />
              <Route path="/programs/:id/components" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramPMI /></ProtectedPage>
                </FeatureGuard>
              } />
              <Route path="/programs/:id/benefit-register" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramPMI /></ProtectedPage>
                </FeatureGuard>
              } />
              <Route path="/programs/:id/stakeholder-grid" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramPMI /></ProtectedPage>
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
              
              {/* PRINCE2 Programme-specific routes */}
              <Route path="/programs/:id/operating-model" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramP2 /></ProtectedPage>
                </FeatureGuard>
              } />
              <Route path="/programs/:id/programme-projects" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramP2 /></ProtectedPage>
                </FeatureGuard>
              } />

              {/* Hybrid Programme-specific routes (config-driven authorization) */}
              <Route path="/programs/:id/constituents" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramHybridGovernance /></ProtectedPage>
                </FeatureGuard>
              } />
              <Route path="/programs/:id/governance-config" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramHybridGovernance /></ProtectedPage>
                </FeatureGuard>
              } />
              <Route path="/programs/:id/adaptations" element={
                <FeatureGuard feature="program_management" requiredTier="Professional">
                  <ProtectedPage><ProgramHybridGovernance /></ProtectedPage>
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
              <Route path="/projects/:id/foundation/communication-plan" element={<ProtectedPage><FoundationCommunicationPlan /></ProtectedPage>} />
              <Route path="/projects/:id/foundation/invoices" element={<ProtectedPage><FoundationInvoices /></ProtectedPage>} />
              <Route path="/projects/:id/foundation/closure" element={<ProtectedPage><FoundationClosure /></ProtectedPage>} />
              
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
              <Route path="/projects/:id/risk-forecast" element={<ProtectedPage><AIRiskForecast /></ProtectedPage>} />
              
              {/* Execution & Governance Routes */}
              <Route path="/projects/:id/execution/stakeholders" element={<ProtectedPage><ExecutionStakeholders /></ProtectedPage>} />
              <Route path="/projects/:id/execution/communication/newsletters" element={<ProtectedPage><ExecutionNewsletters /></ProtectedPage>} />
              <Route path="/projects/:id/execution/communication/status-reporting" element={<ProtectedPage><ExecutionStatusReporting /></ProtectedPage>} />
              <Route path="/projects/:id/execution/communication/meeting" element={<ProtectedPage><ExecutionMeeting /></ProtectedPage>} />
              <Route path="/projects/:id/execution/communication/reporting" element={<ProtectedPage><ExecutionReporting /></ProtectedPage>} />
              <Route path="/projects/:id/execution/communication/ai-status-report" element={<ProtectedPage><AIStatusReport /></ProtectedPage>} />
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
              <Route path="/projects/:id/prince2/risks" element={<ProtectedPage><Prince2Risks /></ProtectedPage>} />
              <Route path="/projects/:id/prince2/issues" element={<ProtectedPage><Prince2Issues /></ProtectedPage>} />
              <Route path="/projects/:id/prince2/exception-reports" element={<ProtectedPage><Prince2ExceptionReports /></ProtectedPage>} />
              <Route path="/projects/:id/prince2/exception-plan" element={<ProtectedPage><Prince2ExceptionPlan /></ProtectedPage>} />
              <Route path="/projects/:id/prince2/quality-register" element={<ProtectedPage><Prince2QualityRegister /></ProtectedPage>} />
              <Route path="/projects/:id/prince2/daily-log" element={<ProtectedPage><Prince2DailyLog /></ProtectedPage>} />
              <Route path="/projects/:id/prince2/management-approaches" element={<ProtectedPage><Prince2ManagementApproaches /></ProtectedPage>} />
              <Route path="/projects/:id/prince2/product-status" element={<ProtectedPage><Prince2ProductStatus /></ProtectedPage>} />
              <Route path="/projects/:id/prince2/planning" element={<ProtectedPage><Prince2Planning /></ProtectedPage>} />
              <Route path="/projects/:id/prince2/tolerances" element={<ProtectedPage><Prince2Tolerances /></ProtectedPage>} />
              <Route path="/projects/:id/prince2/project-board" element={<ProtectedPage><Prince2ProjectBoard /></ProtectedPage>} />
              <Route path="/projects/:id/prince2/governance" element={<ProtectedPage><Prince2Governance /></ProtectedPage>} />
              <Route path="/projects/:id/prince2/highlight-report" element={<ProtectedPage><Prince2HighlightReport /></ProtectedPage>} />
              {/* Default closure landing keeps existing URL working — it now shows the End Project Report. */}
              <Route path="/projects/:id/prince2/closure" element={<ProtectedPage><Prince2ProjectClosure /></ProtectedPage>} />
              <Route path="/projects/:id/prince2/project-closure" element={<ProtectedPage><Prince2ProjectClosure /></ProtectedPage>} />
              {/* Each closure sub-tab now renders its own page (issue #14). */}
              <Route path="/projects/:id/prince2/closure-checklist" element={<ProtectedPage><Prince2ClosureChecklist /></ProtectedPage>} />
              <Route path="/projects/:id/prince2/end-project-report" element={<ProtectedPage><Prince2ProjectClosure /></ProtectedPage>} />
              <Route path="/projects/:id/prince2/lessons-log" element={<ProtectedPage><Prince2LessonsLog /></ProtectedPage>} />
              <Route path="/projects/:id/prince2/benefits-review" element={<ProtectedPage><Prince2BenefitsReview /></ProtectedPage>} />
              
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
              <Route path="/projects/:id/scrum/reports" element={<ProtectedPage><ScrumSprintReport /></ProtectedPage>} />
              <Route path="/projects/:id/scrum/definition-of-done" element={<ProtectedPage><ScrumDefinitionOfDone /></ProtectedPage>} />
              <Route path="/projects/:id/scrum/sprint-planning" element={<ProtectedPage><ScrumSprintPlanning /></ProtectedPage>} />
              <Route path="/projects/:id/scrum/sprint-review" element={<ProtectedPage><ScrumSprintReview /></ProtectedPage>} />
              <Route path="/projects/:id/scrum/increments" element={<ProtectedPage><ScrumIncrements /></ProtectedPage>} />
              <Route path="/projects/:id/scrum/product-goals" element={<ProtectedPage><ScrumProductGoals /></ProtectedPage>} />
              <Route path="/projects/:id/scrum/retro-actions" element={<ProtectedPage><ScrumRetroActions /></ProtectedPage>} />

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
              <Route path="/projects/:id/kanban/work-policies" element={<ProtectedPage><KanbanWorkPolicies /></ProtectedPage>} />
              <Route path="/projects/:id/kanban/reports" element={<ProtectedPage><KanbanServiceReview /></ProtectedPage>} />

              {/* ============================================ */}
              {/* Agile Routes                                 */}
              {/* ============================================ */}
              <Route path="/projects/:id/agile/overview" element={<ProtectedPage><AgileOverview /></ProtectedPage>} />
              <Route path="/projects/:id/agile/team" element={<ProtectedPage><AgileTeam /></ProtectedPage>} />
              <Route path="/projects/:id/agile/budget" element={<ProtectedPage><AgileBudget /></ProtectedPage>} />
              <Route path="/projects/:id/agile/vision" element={<ProtectedPage><AgileProductVision /></ProtectedPage>} />
              <Route path="/projects/:id/agile/personas" element={<ProtectedPage><AgileUserPersonas /></ProtectedPage>} />
              <Route path="/projects/:id/agile/backlog" element={<ProtectedPage><AgileBacklog /></ProtectedPage>} />
              <Route path="/projects/:id/agile/epics" element={<ProtectedPage><AgileEpics /></ProtectedPage>} />
              <Route path="/projects/:id/agile/iteration-board" element={<ProtectedPage><AgileIterationBoard /></ProtectedPage>} />
              <Route path="/projects/:id/agile/release-planning" element={<ProtectedPage><AgileReleasePlanning /></ProtectedPage>} />
              <Route path="/projects/:id/agile/daily-progress" element={<ProtectedPage><AgileDailyProgress /></ProtectedPage>} />
              <Route path="/projects/:id/agile/retrospective" element={<ProtectedPage><AgileRetrospective /></ProtectedPage>} />
              <Route path="/projects/:id/agile/stakeholder-feedback" element={<ProtectedPage><AgileStakeholderFeedback /></ProtectedPage>} />
              <Route path="/projects/:id/agile/velocity" element={<ProtectedPage><AgileVelocity /></ProtectedPage>} />
              <Route path="/projects/:id/agile/definition-of-done" element={<ProtectedPage><AgileDefinitionOfDone /></ProtectedPage>} />
              <Route path="/projects/:id/agile/reports" element={<ProtectedPage><AgileIterationReport /></ProtectedPage>} />

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
              <Route path="/projects/:id/waterfall/phase-gate" element={<ProtectedPage><WaterfallPhaseGate /></ProtectedPage>} />
              <Route path="/projects/:id/waterfall/risks" element={<ProtectedPage><WaterfallRisks /></ProtectedPage>} />
              <Route path="/projects/:id/waterfall/issues" element={<ProtectedPage><WaterfallIssues /></ProtectedPage>} />
              <Route path="/projects/:id/waterfall/deliverables" element={<ProtectedPage><WaterfallDeliverables /></ProtectedPage>} />
              <Route path="/projects/:id/waterfall/baselines" element={<ProtectedPage><WaterfallBaselines /></ProtectedPage>} />
              <Route path="/projects/:id/waterfall/reports" element={<ProtectedPage><WaterfallPhaseGateReport /></ProtectedPage>} />

              {/* ============================================ */}
              {/* LSS Green Routes                             */}
              {/* ============================================ */}
              <Route path="/projects/:id/lss-green/overview" element={<ProtectedPage><LSSGreenOverview /></ProtectedPage>} />
              <Route path="/projects/:id/lss-green/phases" element={<ProtectedPage><LSSGreenPhases /></ProtectedPage>} />
              <Route path="/projects/:id/lss-green/tasks" element={<ProtectedPage><LSSGreenTasks /></ProtectedPage>} />
              <Route path="/projects/:id/lss-green/timeline" element={<ProtectedPage><LSSGreenTimeline /></ProtectedPage>} />
              <Route path="/projects/:id/lss-green/metrics" element={<ProtectedPage><LSSGreenMetrics /></ProtectedPage>} />
              <Route path="/projects/:id/lss-green/measurements" element={<ProtectedPage><LSSGreenMeasurements /></ProtectedPage>} />
              <Route path="/projects/:id/lss-green/reports" element={<ProtectedPage><LSSGreenTollgateReport /></ProtectedPage>} />

              {/* ============================================ */}
              {/* LSS Black Routes                             */}
              {/* ============================================ */}
              <Route path="/projects/:id/lss-black/overview" element={<ProtectedPage><LSSBlackOverview /></ProtectedPage>} />
              <Route path="/projects/:id/lss-black/phases" element={<ProtectedPage><LSSBlackPhases /></ProtectedPage>} />
              <Route path="/projects/:id/lss-black/tasks" element={<ProtectedPage><LSSBlackTasks /></ProtectedPage>} />
              <Route path="/projects/:id/lss-black/timeline" element={<ProtectedPage><LSSBlackTimeline /></ProtectedPage>} />
              <Route path="/projects/:id/lss-black/hypothesis-tests" element={<ProtectedPage><LSSBlackHypothesisTests /></ProtectedPage>} />
              <Route path="/projects/:id/lss-black/doe" element={<ProtectedPage><LSSBlackDOE /></ProtectedPage>} />
              <Route path="/projects/:id/lss-black/control-plans" element={<ProtectedPage><LSSBlackControlPlans /></ProtectedPage>} />
              <Route path="/projects/:id/lss-black/spc-charts" element={<ProtectedPage><LSSBlackSPCCharts /></ProtectedPage>} />
              <Route path="/projects/:id/lss-black/reports" element={<ProtectedPage><LSSBlackTollgateReport /></ProtectedPage>} />

              {/* ============================================ */}
              {/* Hybrid Routes                                */}
              {/* ============================================ */}
              <Route path="/projects/:id/hybrid/overview" element={<ProtectedPage><HybridOverview /></ProtectedPage>} />
              <Route path="/projects/:id/hybrid/phases" element={<ProtectedPage><HybridPhases /></ProtectedPage>} />
              <Route path="/projects/:id/hybrid/tasks" element={<ProtectedPage><HybridTasks /></ProtectedPage>} />
              <Route path="/projects/:id/hybrid/timeline" element={<ProtectedPage><HybridTimeline /></ProtectedPage>} />
              <Route path="/projects/:id/hybrid/artifacts" element={<ProtectedPage><HybridArtifacts /></ProtectedPage>} />
              <Route path="/projects/:id/hybrid/configuration" element={<ProtectedPage><HybridConfiguration /></ProtectedPage>} />
              <Route path="/projects/:id/hybrid/reports" element={<ProtectedPage><HybridPhaseReport /></ProtectedPage>} />

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
              <Route path="/settings/2fa" element={<ProtectedPage><TwoFactorAuth /></ProtectedPage>} />
              <Route path="/settings/biometric" element={<ProtectedPage><BiometricAuth /></ProtectedPage>} />

              {/* Governance */}
              <Route path="/governance/portfolios" element={<ProtectedPage><Portfolios /></ProtectedPage>} />
              <Route path="/governance/portfolios/new" element={<ProtectedPage><CreatePortfolio /></ProtectedPage>} />
              <Route path="/governance/portfolios/:id" element={<ProtectedPage><PortfolioDetail /></ProtectedPage>} />
              <Route path="/governance/boards" element={<ProtectedPage><GovernanceBoards /></ProtectedPage>} />
              <Route path="/governance/boards/new" element={<ProtectedPage><CreateBoard /></ProtectedPage>} />
              <Route path="/governance/boards/:id" element={<ProtectedPage><BoardDetail /></ProtectedPage>} />
              <Route path="/governance/stakeholders" element={<ProtectedPage><Stakeholders /></ProtectedPage>} />
              <Route path="/governance/stakeholders/new" element={<ProtectedPage><CreateStakeholder /></ProtectedPage>} />
              <Route path="/governance/decisions" element={<ProtectedPage><Decisions /></ProtectedPage>} />

              {/* Catch-all - MUST be last */}
              <Route path="*" element={<NotFound />} />
            </Routes></Suspense>
        </TooltipProvider>
      </AuthProvider>
  </QueryClientProvider>
);

export default App;