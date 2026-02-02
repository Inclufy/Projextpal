import { LayoutDashboard, MessageSquare, FolderKanban, Users, 
  FileCheck, ClipboardList, ChevronRight, Calendar, CheckSquare, 
  GitBranch, Network, ListChecks, LayoutGrid, DollarSign, FileText, 
  Lightbulb, UserCheck, MessagesSquare, Shield, Rocket, File, Layers, 
  GraduationCap, Mail, Activity, CalendarDays, Table, Clock, Target, 
  Columns, Crown, Award, Repeat, Zap, ArrowDown, GitMerge, BarChart3, 
  TrendingUp, Gauge, FileBarChart, Building, UserCircle, Flag, 
  Palette, Code, TestTube, Wrench, FileEdit, Settings, CreditCard,Package, Eye } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

import { useProject } from "@/hooks/useApi";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";


// Program sidebar configuration (for when viewing a specific program)
const getProgramPhases = (programId: string, methodology: string | null) => {
  switch (methodology?.toLowerCase()) {
    case 'safe':
      return [
        {
          id: "overview",
          title: "Program Overview",
          icon: Layers,
          items: [
            { title: "Dashboard", url: `/programs/${programId}/dashboard`, icon: LayoutDashboard },
            { title: "ART Overview", url: `/programs/${programId}/art`, icon: Zap },
            { title: "Projects", url: `/programs/${programId}/projects`, icon: FolderKanban },
          ],
        },
        {
          id: "pi",
          title: "Program Increments",
          icon: Repeat,
          items: [
            { title: "Current PI", url: `/programs/${programId}/pi/current`, icon: Target },
            { title: "PI Planning", url: `/programs/${programId}/pi/planning`, icon: Calendar },
            { title: "PI Objectives", url: `/programs/${programId}/pi/objectives`, icon: CheckSquare },
            { title: "Features", url: `/programs/${programId}/features`, icon: ListChecks },
          ],
        },
        {
          id: "execution",
          title: "Execution",
          icon: Rocket,
          items: [
            { title: "System Demo", url: `/programs/${programId}/demos`, icon: Activity },
            { title: "Inspect & Adapt", url: `/programs/${programId}/inspect-adapt`, icon: Lightbulb },
            { title: "Roadmap", url: `/programs/${programId}/roadmap`, icon: TrendingUp },
          ],
        },
        {
          id: "management",
          title: "Management",
          icon: Shield,
          items: [
            { title: "Resources", url: `/programs/${programId}/resources`, icon: Users },
            { title: "Benefits", url: `/programs/${programId}/benefits`, icon: Target },
            { title: "Governance", url: `/programs/${programId}/governance`, icon: Shield },
            { title: "Risks", url: `/programs/${programId}/risks`, icon: BarChart3 },
          ],
        },
      ];

    case 'msp':
      return [
        {
          id: "overview",
          title: "Programme Overview",
          icon: Layers,
          items: [
            { title: "Dashboard", url: `/programs/${programId}/dashboard`, icon: LayoutDashboard },
            { title: "Blueprint", url: `/programs/${programId}/blueprint`, icon: FileText },
            { title: "Projects", url: `/programs/${programId}/projects`, icon: FolderKanban },
          ],
        },
        {
          id: "benefits",
          title: "Benefits Management",
          icon: Target,
          items: [
            { title: "Benefits Map", url: `/programs/${programId}/benefits`, icon: Target },
            { title: "Benefits Profiles", url: `/programs/${programId}/benefits/profiles`, icon: FileText },
            { title: "Realization Plan", url: `/programs/${programId}/benefits/realization`, icon: TrendingUp },
          ],
        },
        {
          id: "tranches",
          title: "Tranches",
          icon: Layers,
          items: [
            { title: "Tranche Plan", url: `/programs/${programId}/tranches`, icon: Calendar },
            { title: "Transitions", url: `/programs/${programId}/transitions`, icon: GitBranch },
            { title: "Roadmap", url: `/programs/${programId}/roadmap`, icon: TrendingUp },
          ],
        },
        {
          id: "stakeholders",
          title: "Stakeholder Engagement",
          icon: Users,
          items: [
            { title: "Stakeholder Map", url: `/programs/${programId}/stakeholders`, icon: Users },
            { title: "Communications", url: `/programs/${programId}/communications`, icon: Mail },
          ],
        },
        {
          id: "governance",
          title: "Governance",
          icon: Shield,
          items: [
            { title: "Programme Board", url: `/programs/${programId}/governance`, icon: Shield },
            { title: "Resources", url: `/programs/${programId}/resources`, icon: Users },
            { title: "Risks & Issues", url: `/programs/${programId}/risks`, icon: BarChart3 },
          ],
        },
      ];

    case 'pmi':
      return [
        {
          id: "overview",
          title: "Program Overview",
          icon: Layers,
          items: [
            { title: "Dashboard", url: `/programs/${programId}/dashboard`, icon: LayoutDashboard },
            { title: "Charter", url: `/programs/${programId}/charter`, icon: FileCheck },
            { title: "Projects", url: `/programs/${programId}/projects`, icon: FolderKanban },
          ],
        },
        {
          id: "lifecycle",
          title: "Program Lifecycle",
          icon: Repeat,
          items: [
            { title: "Roadmap", url: `/programs/${programId}/roadmap`, icon: Calendar },
            { title: "Milestones", url: `/programs/${programId}/milestones`, icon: CheckSquare },
            { title: "Schedule", url: `/programs/${programId}/schedule`, icon: CalendarDays },
          ],
        },
        {
          id: "benefits",
          title: "Benefits Realization",
          icon: Target,
          items: [
            { title: "Benefits Register", url: `/programs/${programId}/benefits`, icon: Target },
            { title: "KPIs", url: `/programs/${programId}/kpis`, icon: Gauge },
          ],
        },
        {
          id: "management",
          title: "Program Management",
          icon: Shield,
          items: [
            { title: "Stakeholders", url: `/programs/${programId}/stakeholders`, icon: Users },
            { title: "Resources", url: `/programs/${programId}/resources`, icon: Users },
            { title: "Governance", url: `/programs/${programId}/governance`, icon: Shield },
            { title: "Risks", url: `/programs/${programId}/risks`, icon: BarChart3 },
            { title: "Communications", url: `/programs/${programId}/communications`, icon: Mail },
          ],
        },
      ];

    case 'prince2_programme':
      return [
        {
          id: "overview",
          title: "Programme Overview",
          icon: Crown,
          items: [
            { title: "Dashboard", url: `/programs/${programId}/dashboard`, icon: LayoutDashboard },
            { title: "Business Case", url: `/programs/${programId}/business-case`, icon: FileCheck },
            { title: "Projects", url: `/programs/${programId}/projects`, icon: FolderKanban },
          ],
        },
        {
          id: "tranches",
          title: "Tranche Management",
          icon: Layers,
          items: [
            { title: "Tranche Plan", url: `/programs/${programId}/tranches`, icon: Calendar },
            { title: "Stage Gates", url: `/programs/${programId}/stage-gates`, icon: Shield },
            { title: "Roadmap", url: `/programs/${programId}/roadmap`, icon: TrendingUp },
          ],
        },
        {
          id: "governance",
          title: "Governance",
          icon: Shield,
          items: [
            { title: "Programme Board", url: `/programs/${programId}/governance`, icon: Crown },
            { title: "Exception Reports", url: `/programs/${programId}/exceptions`, icon: BarChart3 },
            { title: "Highlight Reports", url: `/programs/${programId}/highlights`, icon: Activity },
          ],
        },
        {
          id: "management",
          title: "Management",
          icon: Users,
          items: [
            { title: "Resources", url: `/programs/${programId}/resources`, icon: Users },
            { title: "Benefits", url: `/programs/${programId}/benefits`, icon: Target },
            { title: "Risks", url: `/programs/${programId}/risks`, icon: BarChart3 },
          ],
        },
      ];

    case 'hybrid':
    default:
      return [
        {
          id: "overview",
          title: "Program Overview",
          icon: Layers,
          items: [
            { title: "Dashboard", url: `/programs/${programId}/dashboard`, icon: LayoutDashboard },
            { title: "Projects", url: `/programs/${programId}/projects`, icon: FolderKanban },
            { title: "Roadmap", url: `/programs/${programId}/roadmap`, icon: Calendar },
          ],
        },
        {
          id: "planning",
          title: "Planning",
          icon: Calendar,
          items: [
            { title: "Milestones", url: `/programs/${programId}/milestones`, icon: CheckSquare },
            { title: "Dependencies", url: `/programs/${programId}/dependencies`, icon: GitBranch },
            { title: "Resources", url: `/programs/${programId}/resources`, icon: Users },
          ],
        },
        {
          id: "execution",
          title: "Execution",
          icon: Rocket,
          items: [
            { title: "Benefits", url: `/programs/${programId}/benefits`, icon: Target },
            { title: "Stakeholders", url: `/programs/${programId}/stakeholders`, icon: Users },
            { title: "Communications", url: `/programs/${programId}/communications`, icon: Mail },
          ],
        },
        {
          id: "governance",
          title: "Governance",
          icon: Shield,
          items: [
            { title: "Governance", url: `/programs/${programId}/governance`, icon: Shield },
            { title: "Risks", url: `/programs/${programId}/risks`, icon: BarChart3 },
            { title: "Reports", url: `/programs/${programId}/reports`, icon: FileBarChart },
          ],
        },
      ];
  }
};

// Methodology-specific sidebar configurations for projects
const getMethodologyPhases = (projectId: string, methodology: string | null) => {
  switch (methodology?.toLowerCase()) {
    case 'scrum':
      return [
        {
  id: "foundation",
  title: "Scrum Setup",
  icon: Repeat,
  items: [
    { title: "Overview", url: `/projects/${projectId}/scrum/overview`, icon: LayoutDashboard },
    { title: "Team", url: `/projects/${projectId}/scrum/team`, icon: Users },
    { title: "Budget", url: `/projects/${projectId}/scrum/budget`, icon: DollarSign },
    { title: "Definition of Done", url: `/projects/${projectId}/scrum/definition-of-done`, icon: CheckSquare },
  ],
},
{
  id: "backlog",
  title: "Product Backlog",
  icon: ListChecks,
  items: [
    { title: "Backlog", url: `/projects/${projectId}/scrum/backlog`, icon: ListChecks },
  ],
},
{
  id: "sprints",
  title: "Sprint Management",
  icon: Repeat,
  items: [
    { title: "Sprint Planning", url: `/projects/${projectId}/scrum/sprint-planning`, icon: Calendar },  // ← NEW
    { title: "Sprint Goal", url: `/projects/${projectId}/scrum/sprint-goal`, icon: Target },  // ← NEW
    { title: "Sprint Board", url: `/projects/${projectId}/scrum/sprint-board`, icon: Columns },
    { title: "Increment", url: `/projects/${projectId}/scrum/increment`, icon: Package },  // ← NEW
    { title: "Velocity", url: `/projects/${projectId}/scrum/velocity`, icon: Gauge },
  ],
},
{
  id: "ceremonies",
  title: "Scrum Events",
  icon: Users,
  items: [
    { title: "Daily Standup", url: `/projects/${projectId}/scrum/daily-standup`, icon: Users },
    { title: "Sprint Review", url: `/projects/${projectId}/scrum/sprint-review`, icon: Eye },  // ← NEW
    { title: "Retrospective", url: `/projects/${projectId}/scrum/retrospective`, icon: Lightbulb },
  ],
},
      ];

    case 'kanban':
      return [
        {
          id: "foundation",
          title: "Kanban Setup",
          icon: Columns,
          items: [
            { title: "Overview", url: `/projects/${projectId}/kanban/overview`, icon: LayoutDashboard },
            { title: "Team", url: `/projects/${projectId}/kanban/team`, icon: Users },
            { title: "Budget", url: `/projects/${projectId}/kanban/budget`, icon: DollarSign },
            { title: "Board Configuration", url: `/projects/${projectId}/kanban/board-configuration`, icon: Columns },
            { title: "WIP Limits", url: `/projects/${projectId}/kanban/wip-limits`, icon: Shield },
          ],
        },
        {
          id: "board",
          title: "Kanban Board",
          icon: LayoutGrid,
          items: [
            { title: "Work Items", url: `/projects/${projectId}/kanban/work-items`, icon: ListChecks },
            { title: "Board View", url: `/projects/${projectId}/kanban/board`, icon: Columns },
            { title: "Blocked Items", url: `/projects/${projectId}/kanban/blocked`, icon: Shield },
          ],
        },
        {
          id: "flow",
          title: "Flow Metrics",
          icon: TrendingUp,
          items: [
            { title: "Metrics Dashboard", url: `/projects/${projectId}/kanban/metrics`, icon: Gauge },
            { title: "Cumulative Flow", url: `/projects/${projectId}/kanban/cfd`, icon: BarChart3 },
          ],
        },
        {
          id: "improvement",
          title: "Continuous Improvement",
          icon: Lightbulb,
          items: [
            { title: "Kaizen", url: `/projects/${projectId}/kanban/improvement`, icon: Lightbulb },
          ],
        },
      ];

    case 'prince2':
      return [
        {
          id: "foundation",
          title: "Project Initiation",
          icon: Crown,
          items: [
            { title: "Overview", url: `/projects/${projectId}/prince2/dashboard`, icon: LayoutDashboard },
            { title: "Team", url: `/projects/${projectId}/foundation/team`, icon: Users },
            { title: "Budget", url: `/projects/${projectId}/foundation/budget`, icon: DollarSign },
            { title: "Business Case", url: `/projects/${projectId}/prince2/business-case`, icon: FileCheck },
            { title: "Project Brief", url: `/projects/${projectId}/prince2/project-brief`, icon: FileText },
          ],
        },
        {
          id: "stages",
          title: "Stage Management",
          icon: Layers,
          items: [
            { title: "Stage Plan", url: `/projects/${projectId}/prince2/stage-plan`, icon: Calendar },
            { title: "Work Packages", url: `/projects/${projectId}/prince2/work-packages`, icon: ListChecks },
            { title: "Stage Gates", url: `/projects/${projectId}/prince2/stage-gates`, icon: Shield },
            { title: "Tolerances", url: `/projects/${projectId}/prince2/tolerances`, icon: Gauge },
          ],
        },
        {
          id: "governance",
          title: "Governance",
          icon: Shield,
          items: [
            { title: "Project Board", url: `/projects/${projectId}/prince2/project-board`, icon: Users },
            { title: "Highlight Reports", url: `/projects/${projectId}/prince2/highlight-report`, icon: Activity },
            { title: "Issues & Risks", url: `/projects/${projectId}/prince2/governance`, icon: BarChart3 },
            { title: "Change Control", url: `/projects/${projectId}/execution/governance`, icon: GitBranch },
          ],
        },
        {
          id: "closure",
          title: "Project Closure",
          icon: CheckSquare,
          items: [
            { title: "Closure Checklist", url: `/projects/${projectId}/prince2/closure`, icon: CheckSquare },
            { title: "End Project Report", url: `/projects/${projectId}/prince2/closure`, icon: File },
            { title: "Lessons Log", url: `/projects/${projectId}/prince2/closure`, icon: Lightbulb },
            { title: "Benefits Review", url: `/projects/${projectId}/prince2/closure`, icon: Award },
          ],
        },
      ];

    case 'lean_six_sigma_green':
    case 'lean_six_sigma_black':
      const isBlackBelt = methodology?.toLowerCase() === 'lean_six_sigma_black';
      return [
        {
          id: "define",
          title: "Define",
          icon: Target,
          items: [
            { title: "Project Charter", url: `/projects/${projectId}/define/charter`, icon: FileCheck },
            { title: "SIPOC", url: `/projects/${projectId}/define/sipoc`, icon: GitBranch },
            { title: "Voice of Customer", url: `/projects/${projectId}/define/voc`, icon: Users },
            { title: "Overview", url: `/projects/${projectId}/define/overview`, icon: LayoutDashboard },
            { title: "Team", url: `/projects/${projectId}/define/team`, icon: Users },
            { title: "Budget", url: `/projects/${projectId}/define/budget`, icon: DollarSign },
          ],
        },
        {
          id: "measure",
          title: "Measure",
          icon: Gauge,
          items: [
            { title: "Data Collection", url: `/projects/${projectId}/measure/data-collection`, icon: ListChecks },
            { title: "Process Map", url: `/projects/${projectId}/measure/process-map`, icon: GitBranch },
            { title: "Baseline Metrics", url: `/projects/${projectId}/measure/baseline`, icon: BarChart3 },
            ...(isBlackBelt ? [{ title: "MSA Report", url: `/projects/${projectId}/measure/msa`, icon: FileBarChart }] : []),
          ],
        },
        {
          id: "analyze",
          title: "Analyze",
          icon: BarChart3,
          items: [
            { title: "Root Cause Analysis", url: `/projects/${projectId}/analyze/root-cause`, icon: Target },
            { title: "Fishbone Diagram", url: `/projects/${projectId}/analyze/fishbone`, icon: Network },
            { title: "Pareto Chart", url: `/projects/${projectId}/analyze/pareto`, icon: BarChart3 },
            ...(isBlackBelt ? [
              { title: "Hypothesis Tests", url: `/projects/${projectId}/analyze/hypothesis`, icon: CheckSquare },
              { title: "Regression Analysis", url: `/projects/${projectId}/analyze/regression`, icon: TrendingUp },
            ] : []),
          ],
        },
        {
          id: "improve",
          title: "Improve",
          icon: TrendingUp,
          items: [
            { title: "Solution Design", url: `/projects/${projectId}/improve/solutions`, icon: Rocket },
            { title: "FMEA", url: `/projects/${projectId}/improve/fmea`, icon: Shield },
            { title: "Pilot Plan", url: `/projects/${projectId}/improve/pilot`, icon: Calendar },
            { title: "Implementation", url: `/projects/${projectId}/improve/implementation`, icon: ListChecks },
          ],
        },
        {
          id: "control",
          title: "Control",
          icon: Shield,
          items: [
            { title: "Control Plan", url: `/projects/${projectId}/control/control-plan`, icon: File },
            { title: "SPC Charts", url: `/projects/${projectId}/control/spc`, icon: BarChart3 },
            { title: "Monitoring", url: `/projects/${projectId}/control/monitoring`, icon: Activity },
            { title: "Tollgate Review", url: `/projects/${projectId}/control/tollgate`, icon: CheckSquare },
            { title: "Closure", url: `/projects/${projectId}/control/closure`, icon: Award },
          ],
        },
      ];

    case 'agile':
      return [
        {
          id: "foundation",
          title: "Foundation",
          icon: Zap,
          items: [
            { title: "Overview", url: `/projects/${projectId}/agile/overview`, icon: LayoutDashboard },
            { title: "Team", url: `/projects/${projectId}/agile/team`, icon: Users },
            { title: "Budget", url: `/projects/${projectId}/agile/budget`, icon: DollarSign },
          ],
        },
        {
          id: "discovery",
          title: "Discovery",
          icon: Target,
          items: [
            { title: "Product Vision", url: `/projects/${projectId}/agile/vision`, icon: Target },
            { title: "User Personas", url: `/projects/${projectId}/agile/personas`, icon: UserCircle },
          ],
        },
        {
          id: "planning",
          title: "Planning",
          icon: Calendar,
          items: [
            { title: "Backlog", url: `/projects/${projectId}/agile/backlog`, icon: ListChecks },
            { title: "Release Planning", url: `/projects/${projectId}/agile/release-planning`, icon: Calendar },
          ],
        },
        {
          id: "execution",
          title: "Execution",
          icon: Rocket,
          items: [
            { title: "Iteration Board", url: `/projects/${projectId}/agile/iteration-board`, icon: Columns },
            { title: "Daily Progress", url: `/projects/${projectId}/agile/daily-progress`, icon: MessageSquare },
          ],
        },
        {
          id: "review",
          title: "Review",
          icon: TrendingUp,
          items: [
            { title: "Velocity", url: `/projects/${projectId}/agile/velocity`, icon: TrendingUp },
            { title: "Retrospective", url: `/projects/${projectId}/agile/retrospective`, icon: Lightbulb },
          ],
        },
      ];

    case 'waterfall':
      return [
        {
          id: "foundation",
          title: "Foundation",
          icon: Layers,
          items: [
            { title: "Overview", url: `/projects/${projectId}/waterfall/overview`, icon: LayoutDashboard },
            { title: "Team", url: `/projects/${projectId}/waterfall/team`, icon: Users },
            { title: "Budget", url: `/projects/${projectId}/waterfall/budget`, icon: DollarSign },
          ],
        },
        {
          id: "planning",
          title: "Planning",
          icon: Calendar,
          items: [
            { title: "Requirements", url: `/projects/${projectId}/waterfall/requirements`, icon: FileText },
            { title: "Gantt Chart", url: `/projects/${projectId}/waterfall/gantt`, icon: Calendar },
            { title: "Milestones", url: `/projects/${projectId}/waterfall/milestones`, icon: Flag },
          ],
        },
        {
          id: "phases",
          title: "Phases",
          icon: Rocket,
          items: [
            { title: "Design", url: `/projects/${projectId}/waterfall/design`, icon: Palette },
            { title: "Development", url: `/projects/${projectId}/waterfall/development`, icon: Code },
            { title: "Testing", url: `/projects/${projectId}/waterfall/testing`, icon: TestTube },
            { title: "Deployment", url: `/projects/${projectId}/waterfall/deployment`, icon: Rocket },
            { title: "Maintenance", url: `/projects/${projectId}/waterfall/maintenance`, icon: Wrench },
          ],
        },
        {
          id: "control",
          title: "Control",
          icon: Shield,
          items: [
            { title: "Change Requests", url: `/projects/${projectId}/waterfall/change-requests`, icon: FileEdit },
          ],
        },
      ];

    case 'hybrid':
    default:
      return [
        {
          id: "foundation",
          title: "Project Foundation",
          icon: FolderKanban,
          items: [
            { title: "Overview", url: `/projects/${projectId}/foundation/overview`, icon: FolderKanban },
            { title: "Workflow", url: `/projects/${projectId}/foundation/workflow`, icon: GitBranch },
            { title: "Project Charter", url: `/projects/${projectId}/foundation/charter`, icon: FileCheck },
            { title: "Team", url: `/projects/${projectId}/foundation/team`, icon: Users },
            { title: "Budget", url: `/projects/${projectId}/foundation/budget`, icon: DollarSign },
          ],
        },
        {
          id: "planning",
          title: "Planning & Design",
          icon: Calendar,
          items: [
            {
              title: "Planning",
              icon: Calendar,
              subItems: [
                { title: "Timeline", url: `/projects/${projectId}/planning/timeline`, icon: Calendar },
                { title: "Milestones", url: `/projects/${projectId}/planning/milestones`, icon: CheckSquare },
                { title: "Tasks", url: `/projects/${projectId}/planning/tasks`, icon: ListChecks },
                { title: "RACI", url: `/projects/${projectId}/planning/raci`, icon: Network },
                { title: "Dependencies", url: `/projects/${projectId}/planning/dependencies`, icon: GitBranch },
                { title: "Calendar", url: `/projects/${projectId}/planning/calendar`, icon: CalendarDays },
              ],
            },
            { title: "Workflow Diagram", url: `/projects/${projectId}/planning/workflow-diagram`, icon: GitBranch },
            { title: "System Integration", url: `/projects/${projectId}/planning/system-integration`, icon: Layers },
            { title: "Risks", url: `/projects/${projectId}/planning/risks`, icon: Shield },
          ],
        },
        {
          id: "execution",
          title: "Execution & Governance",
          icon: Rocket,
          items: [
            { title: "Stakeholders", url: `/projects/${projectId}/execution/stakeholders`, icon: UserCheck },
            {
              title: "Communication",
              icon: MessagesSquare,
              subItems: [
                { title: "Newsletters", url: `/projects/${projectId}/execution/communication/newsletters`, icon: Mail },
                { title: "Status Reporting", url: `/projects/${projectId}/execution/communication/status-reporting`, icon: Activity },
                { title: "Meeting", url: `/projects/${projectId}/execution/communication/meeting`, icon: Users },
                { title: "Reporting", url: `/projects/${projectId}/execution/communication/reporting`, icon: FileText },
              ],
            },
            { title: "Governance", url: `/projects/${projectId}/execution/governance`, icon: Shield },
            { title: "Deployment Strategy", url: `/projects/${projectId}/execution/deployment`, icon: Rocket },
          ],
        },
        {
          id: "monitoring",
          title: "Monitoring & Closure",
          icon: Activity,
          items: [
            {
              title: "Document Library",
              icon: FileText,
              subItems: [
                { title: "All Documents", url: `/projects/${projectId}/monitoring/documents/all`, icon: File },
                { title: "Stages", url: `/projects/${projectId}/monitoring/documents/stages`, icon: Layers },
                { title: "Milestones", url: `/projects/${projectId}/monitoring/documents/milestones`, icon: CheckSquare },
                { title: "Training", url: `/projects/${projectId}/monitoring/documents/training`, icon: GraduationCap },
              ],
            },
            { title: "Lessons Learned & Surveys", url: `/projects/${projectId}/monitoring/lessons-surveys`, icon: Lightbulb },
          ],
        },
      ];
  }
};

const getMethodologyBadge = (methodology: string | null) => {
  const badges: Record<string, { label: string; color: string }> = {
    'scrum': { label: 'Scrum', color: 'bg-amber-500' },
    'kanban': { label: 'Kanban', color: 'bg-blue-500' },
    'prince2': { label: 'PRINCE2', color: 'bg-purple-500' },
    'lean_six_sigma_green': { label: 'LSS Green', color: 'bg-green-500' },
    'lean_six_sigma_black': { label: 'LSS Black', color: 'bg-gray-800' },
    'waterfall': { label: 'Waterfall', color: 'bg-slate-500' },
    'agile': { label: 'Agile', color: 'bg-emerald-500' },
    'hybrid': { label: 'Hybrid', color: 'bg-pink-500' },
    'safe': { label: 'SAFe', color: 'bg-blue-600' },
    'msp': { label: 'MSP', color: 'bg-purple-600' },
    'pmi': { label: 'PMI', color: 'bg-green-600' },
    'prince2_programme': { label: 'P2 Prog', color: 'bg-amber-600' },
  };
  return badges[methodology?.toLowerCase() || ''] || null;
};

/**
 * ProjeXtPal Logo Component
 */
const ProjeXtPalLogo = ({ collapsed }: { collapsed: boolean }) => (
  <div className="flex items-center gap-2.5">
    <div className="relative flex h-9 w-9 items-center justify-center flex-shrink-0">
      <svg viewBox="0 0 48 48" className="h-9 w-9" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M6 6h12c7.732 0 14 6.268 14 14s-6.268 14-14 14h-4v8H6V6z" 
          fill="#8B5CF6"
        />
        <path 
          d="M14 14h4c3.314 0 6 2.686 6 6s-2.686 6-6 6h-4V14z" 
          fill="white"
          className="dark:fill-[#0f0f1a]"
        />
        <path 
          d="M28 12L42 24L28 36V12z" 
          fill="#D946EF"
        />
        <rect x="2" y="36" width="16" height="10" rx="2" fill="#22C55E"/>
        <text 
          x="10" 
          y="43.5" 
          textAnchor="middle" 
          fill="white" 
          fontSize="7" 
          fontWeight="bold" 
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          AI
        </text>
      </svg>
    </div>
    
    {!collapsed && (
      <span className="font-bold text-lg tracking-tight whitespace-nowrap">
        <span className="text-foreground">Proje</span>
        <span className="text-[#D946EF]">X</span>
        <span className="text-foreground">tPal</span>
      </span>
    )}
  </div>
);

export function AppSidebar() {
  const { state } = useSidebar();
  const { t } = useLanguage();
  const { user } = useAuth();
  const isCollapsed = state === "collapsed";
  const location = useLocation();
  
  const ts = t.sidebar || {
    dashboard: 'Dashboard',
    aiAssistant: 'AI Chat',
    programs: 'Programs',
    allProjects: 'Projects',
    timeTracking: 'Time Tracking',
    team: 'Team',
    surveys: 'Surveys',
    postProject: 'Post Project',
    adminPortal: 'Admin Portal',
  };
  
  // FIXED: Removed Surveys from menu - now integrated in Post Project
  const menuItems = [
    { title: ts.dashboard, url: "/dashboard", icon: LayoutDashboard },
    { title: ts.aiAssistant, url: "/ai-assistant", icon: MessageSquare },
    { title: ts.programs, url: "/programs", icon: Layers, isProgramLink: true },
    { title: ts.allProjects, url: "/projects", icon: FolderKanban },
    { title: ts.timeTracking, url: "/time-tracking", icon: Clock },
    { title: ts.team, url: "/team", icon: Users },
    { title: ts.postProject, url: "/post-project", icon: FileCheck },
    { title: "Academy", url: "/academy/marketplace", icon: GraduationCap },
  ];
  
  const pathParts = location.pathname.split('/');
  const isProjectContext = pathParts[1] === 'projects' && pathParts[2] && pathParts[2] !== 'new';
  const isProgramContext = pathParts[1] === 'programs' && pathParts[2] && pathParts[2] !== 'new';
  
  const projectId = isProjectContext ? pathParts[2] : undefined;
  const programId = isProgramContext ? pathParts[2] : undefined;
  
  const { data: project } = useProject(projectId);
  const methodology = project?.methodology || null;
  const methodologyBadge = getMethodologyBadge(methodology);
  
  const programMethodology = isProgramContext ? 'hybrid' : null;
  const programMethodologyBadge = isProgramContext ? getMethodologyBadge(programMethodology) : null;
  
  const projectPhases = projectId ? getMethodologyPhases(projectId, methodology) : [];
  const programPhases = programId ? getProgramPhases(programId, programMethodology) : [];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <ProjeXtPalLogo collapsed={isCollapsed} />
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.isProgramLink ? !isProgramContext : true}
                      className={({ isActive }) =>
                        (isActive || (item.isProgramLink && isProgramContext))
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {isProgramContext && programMethodologyBadge && !isCollapsed && (
                <div className="px-3 py-2">
                  <Badge className={`${programMethodologyBadge.color} text-white text-xs`}>
                    {programMethodologyBadge.label}
                  </Badge>
                </div>
              )}

              {isProgramContext && programPhases.map((phase) => (
                <Collapsible key={phase.id} defaultOpen={phase.id === "overview"} className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton>
                        <phase.icon className="h-4 w-4" />
                        {!isCollapsed && <span>{phase.title}</span>}
                        {!isCollapsed && (
                          <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        )}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    {!isCollapsed && phase.items.length > 0 && (
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {phase.items.map((item) => (
                            <SidebarMenuSubItem key={item.title}>
                              <SidebarMenuSubButton asChild>
                                <NavLink
                                  to={item.url}
                                  end
                                  className={({ isActive }) =>
                                    isActive
                                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                      : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                                  }
                                >
                                  <item.icon className="h-4 w-4" />
                                  <span>{item.title}</span>
                                </NavLink>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    )}
                  </SidebarMenuItem>
                </Collapsible>
              ))}

              {isProjectContext && methodologyBadge && !isCollapsed && (
                <div className="px-3 py-2">
                  <Badge className={`${methodologyBadge.color} text-white text-xs`}>
                    {methodologyBadge.label}
                  </Badge>
                </div>
              )}

              {isProjectContext && projectPhases.map((phase) => (
                <Collapsible key={phase.id} defaultOpen={phase.id === "foundation" || phase.id === "define" || phase.id === "requirements"} className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton>
                        <phase.icon className="h-4 w-4" />
                        {!isCollapsed && <span>{phase.title}</span>}
                        {!isCollapsed && (
                          <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        )}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    {!isCollapsed && phase.items.length > 0 && (
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {phase.items.map((item) => (
                            'subItems' in item ? (
                              <Collapsible key={item.title} defaultOpen={false} className="group/nested">
                                <SidebarMenuSubItem>
                                  <CollapsibleTrigger asChild>
                                    <SidebarMenuSubButton>
                                      <item.icon className="h-4 w-4" />
                                      <span>{item.title}</span>
                                      <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/nested:rotate-90" />
                                    </SidebarMenuSubButton>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent>
                                    <SidebarMenuSub className="ml-4">
                                      {item.subItems.map((subItem) => (
                                        <SidebarMenuSubItem key={subItem.title}>
                                          <SidebarMenuSubButton asChild>
                                            <NavLink
                                              to={subItem.url}
                                              end
                                              className={({ isActive }) =>
                                                isActive
                                                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                                  : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                                              }
                                            >
                                              <subItem.icon className="h-4 w-4" />
                                              <span>{subItem.title}</span>
                                            </NavLink>
                                          </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                      ))}
                                    </SidebarMenuSub>
                                  </CollapsibleContent>
                                </SidebarMenuSubItem>
                              </Collapsible>
                            ) : (
                              <SidebarMenuSubItem key={item.title}>
                                <SidebarMenuSubButton asChild>
                                  <NavLink
                                    to={item.url}
                                    end
                                    className={({ isActive }) =>
                                      isActive
                                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                        : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                                    }
                                  >
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.title}</span>
                                  </NavLink>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    )}
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

     {/* ============================================ */}
{/* ADMIN PORTAL LINK - SuperAdmin Only         */}
{/* ============================================ */}
{user?.isSuperAdmin && (
  <SidebarFooter className="border-t border-sidebar-border">
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              isActive
                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium"
                : "hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400"
            }
          >
            <Shield className="h-4 w-4" />
            {!isCollapsed && <span>Admin Portal</span>}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarFooter>
)}

    </Sidebar>
  );
}