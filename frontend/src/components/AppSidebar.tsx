import { LayoutDashboard, MessageSquare, FolderKanban, Users, 
  FileCheck, ClipboardList, ChevronRight, Calendar, CheckSquare, 
  GitBranch, Network, ListChecks, LayoutGrid, Euro, FileText, 
  Lightbulb, UserCheck, MessagesSquare, Shield, Rocket, File, Layers, 
  GraduationCap, Mail, Activity, CalendarDays, Table, Clock, Target, Sparkles,
  Columns, Crown, Award, Repeat, Zap, ArrowDown, GitMerge, BarChart3, 
  TrendingUp, Gauge, FileBarChart, Building, UserCircle, Flag, 
  Palette, Code, TestTube, Wrench, FileEdit, Settings, CreditCard, Lock, 
  Package, Presentation, Briefcase, AlertCircle, CheckCircle,
  BookOpen, Download, FlaskConical, Gavel, AlertOctagon, Compass, Brain, ScrollText, HelpCircle
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
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

import { useProject, useProgram } from "@/hooks/useApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useUserFeatures, hasFeature, getTierName, getTierColor } from "@/hooks/useUserFeatures";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// [All the getProgramPhases, getMethodologyPhases, getMethodologyBadge, and ProjeXtPalLogo functions stay the same]
// I'll include them for completeness...

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
            { title: "PI Planning", url: `/programs/${programId}/pi/planning`, icon: Calendar },
            { title: "Current PI", url: `/programs/${programId}/pi/current`, icon: Target },
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
            { title: "Components", url: `/programs/${programId}/components`, icon: FolderKanban },
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
            { title: "Benefit Register", url: `/programs/${programId}/benefit-register`, icon: Target },
            { title: "KPIs", url: `/programs/${programId}/kpis`, icon: Gauge },
          ],
        },
        {
          id: "management",
          title: "Program Management",
          icon: Shield,
          items: [
            { title: "Stakeholders", url: `/programs/${programId}/stakeholder-grid`, icon: Users },
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
            { title: "Blueprint", url: `/programs/${programId}/operating-model`, icon: Compass },
            { title: "Projects", url: `/programs/${programId}/programme-projects`, icon: FolderKanban },
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
            { title: "Programme Board", url: `/programs/${programId}/programme-projects`, icon: Crown },
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

    case 'hybrid_programme':
      return [
        {
          id: "overview",
          title: "Programme Overview",
          icon: Layers,
          items: [
            { title: "Dashboard", url: `/programs/${programId}/dashboard`, icon: LayoutDashboard },
            { title: "Constituents", url: `/programs/${programId}/constituents`, icon: FolderKanban },
            { title: "Roadmap", url: `/programs/${programId}/roadmap`, icon: Calendar },
          ],
        },
        {
          id: "governance",
          title: "Mixed Governance",
          icon: Shield,
          items: [
            { title: "Governance Config", url: `/programs/${programId}/governance-config`, icon: Settings },
            { title: "Authorization Board", url: `/programs/${programId}/constituents`, icon: Gavel },
            { title: "Adaptations", url: `/programs/${programId}/adaptations`, icon: Repeat },
          ],
        },
        {
          id: "management",
          title: "Management",
          icon: Users,
          items: [
            { title: "Benefits", url: `/programs/${programId}/benefits`, icon: Target },
            { title: "Stakeholders", url: `/programs/${programId}/stakeholders`, icon: Users },
            { title: "Risks", url: `/programs/${programId}/risks`, icon: BarChart3 },
          ],
        },
      ];

    case 'inclufy':
      // Inclufy Best Practice (programme) — curated best-of-breed: MSP Blueprint +
      // Benefits, PMI governance + roadmap, structured delivery. The opinionated
      // ProjeXtPal-recommended programme method (mirrors the project-level USP).
      return [
        {
          id: "overview",
          title: "Programme Overview",
          icon: Layers,
          items: [
            { title: "Dashboard", url: `/programs/${programId}/dashboard`, icon: LayoutDashboard },
            { title: "Blueprint / Vision", url: `/programs/${programId}/blueprint`, icon: FileText },
            { title: "Projects", url: `/programs/${programId}/projects`, icon: FolderKanban },
            { title: "Roadmap", url: `/programs/${programId}/roadmap`, icon: TrendingUp },
          ],
        },
        {
          id: "value",
          title: "Benefits & Value",
          icon: Target,
          items: [
            { title: "Benefits Map", url: `/programs/${programId}/benefits`, icon: Target },
            { title: "Realization Plan", url: `/programs/${programId}/benefits/realization`, icon: TrendingUp },
            { title: "Business Case", url: `/programs/${programId}/business-case`, icon: FileCheck },
          ],
        },
        {
          id: "delivery",
          title: "Delivery & Planning",
          icon: Rocket,
          items: [
            { title: "Milestones", url: `/programs/${programId}/milestones`, icon: CheckSquare },
            { title: "Dependencies", url: `/programs/${programId}/dependencies`, icon: GitBranch },
            { title: "Resources", url: `/programs/${programId}/resources`, icon: Users },
          ],
        },
        {
          id: "stakeholders",
          title: "Stakeholders & Comms",
          icon: Users,
          items: [
            { title: "Stakeholders", url: `/programs/${programId}/stakeholders`, icon: Users },
            { title: "Communications", url: `/programs/${programId}/communications`, icon: Mail },
          ],
        },
        {
          id: "governance",
          title: "Governance & Assurance",
          icon: Shield,
          items: [
            { title: "Programme Board", url: `/programs/${programId}/governance`, icon: Shield },
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
          ],
        },
      ];
  }
};

// Curated best-of-breed Foundation navigation. Shared by the generic fallback
// and the branded "Inclufy Best Practice" methodology (only the section title
// differs) so the Best Practice method is a first-class value, not the unknown
// fallback.
const buildFoundationPhases = (projectId: string, foundationTitle: string) => [
  {
    id: "foundation",
    title: foundationTitle,
    icon: FolderKanban,
    items: [
      { title: "Overview", url: `/projects/${projectId}/foundation/overview`, icon: FolderKanban },
      { title: "Workflow", url: `/projects/${projectId}/foundation/workflow`, icon: GitBranch },
      { title: "Project Charter", url: `/projects/${projectId}/foundation/charter`, icon: FileCheck },
      { title: "Team", url: `/projects/${projectId}/foundation/team`, icon: Users },
      { title: "Budget", url: `/projects/${projectId}/foundation/budget`, icon: Euro },
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
      { title: "AI Risk Forecast", url: `/projects/${projectId}/risk-forecast`, icon: Brain },
    ],
  },
  {
    id: "execution",
    title: "Execution & Governance",
    icon: Rocket,
    items: [
      { title: "Stakeholders", url: `/projects/${projectId}/execution/stakeholders`, icon: UserCheck },
      // Communication + Status Reporting are provided by the shared
      // communicationGroup + centralReportingGroup appended to every dedicated
      // methodology (hybrid included), so they're not duplicated inline here.
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

// Central, methodology-agnostic status-reporting group. The dedicated
// methodology sidebars (prince2/scrum/…) only carry their own DOCTRINE report
// (Highlight Report, Sprint Report, …); this group surfaces the shared central
// status-reporting layer so "where is the status report?" has one consistent
// answer across every methodology. The Foundation/Inclufy nav already includes
// this under Execution & Governance, so it is appended only for the dedicated
// methodologies below.
// Each dedicated methodology has exactly ONE doctrine "report" surface (Sprint
// Report, Tollgate Report, Phase Gate Report, …). We fold it INTO the central
// Status Reporting group rather than leaving it scattered in a phase group, so
// every methodology has one single Status Reporting tab (parity with PRINCE2).
const DOCTRINE_REPORT = (
  projectId: string,
  methodology: string | null,
): { title: string; url: string; icon: any } | null => {
  const m = (methodology || "").toLowerCase();
  const map: Record<string, { title: string; slug: string }> = {
    scrum: { title: "Sprint Reports", slug: "scrum/reports" },
    kanban: { title: "Service Delivery Review", slug: "kanban/reports" },
    agile: { title: "Iteration Reports", slug: "agile/reports" },
    waterfall: { title: "Phase Gate Reports", slug: "waterfall/reports" },
    hybrid: { title: "Phase Reports", slug: "hybrid/reports" },
    lean_six_sigma_green: { title: "Tollgate Reports", slug: "lss-green/reports" },
    lean_six_sigma_black: { title: "Tollgate Reports", slug: "lss-black/reports" },
  };
  const d = map[m];
  return d ? { title: d.title, url: `/projects/${projectId}/${d.slug}`, icon: FileBarChart } : null;
};

const centralReportingGroup = (projectId: string, methodology: string | null = null) => ({
  id: "central-reporting",
  title: "Status Reporting",
  icon: Activity,
  items: [
    { title: "Status Reporting", url: `/projects/${projectId}/execution/communication/status-reporting`, icon: Activity },
    { title: "AI Status Report", url: `/projects/${projectId}/execution/communication/ai-status-report`, icon: Sparkles },
    // Methodology doctrine report folded in (Sprint/Tollgate/Phase-Gate/…).
    ...(DOCTRINE_REPORT(projectId, methodology) ? [DOCTRINE_REPORT(projectId, methodology)!] : []),
    { title: "Reporting", url: `/projects/${projectId}/execution/communication/reporting`, icon: FileText },
  ],
});

// Communication-related items live in their own group (not under Status Reporting).
const communicationGroup = (projectId: string) => ({
  id: "communication",
  title: "Communication",
  icon: Mail,
  items: [
    { title: "Meetings", url: `/projects/${projectId}/execution/communication/meeting`, icon: Users },
    { title: "Newsletters", url: `/projects/${projectId}/execution/communication/newsletters`, icon: Mail },
  ],
});

// Universal RAID layer — Risk + Issue register. Methodology-agnostic generic
// routes (PlanningRisks + PlanningIssues), so every methodology shares one RAID
// register. PRINCE2 is excluded from the auto-append (it carries its own richer
// Risk/Issue registers under Governance).
const raidGroup = (projectId: string) => ({
  id: "raid",
  title: "Risk & Issues",
  icon: AlertOctagon,
  items: [
    { title: "Risk Register", url: `/projects/${projectId}/planning/risks`, icon: AlertCircle },
    { title: "Issue Register", url: `/projects/${projectId}/planning/issues`, icon: AlertOctagon },
  ],
});

// Universal cost layer — Budget + Invoices. Generic routes shared by every
// methodology (PRINCE2 excluded — it has Budget under Project Initiation).
const costGroup = (projectId: string) => ({
  id: "cost",
  title: "Cost Management",
  icon: Euro,
  items: [
    { title: "Budget & Costs", url: `/projects/${projectId}/foundation/budget`, icon: Euro },
    { title: "Invoices", url: `/projects/${projectId}/foundation/invoices`, icon: CreditCard },
  ],
});

// Universal AI layer — cross-module intelligence. Methodology-agnostic; appended
// to every dedicated methodology (no duplication risk — these surfaces don't exist
// elsewhere). Compound Signals connects schedule × risk × cost × dependency.
const aiInsightsGroup = (projectId: string) => ({
  id: "ai-insights",
  title: "AI Insights",
  icon: Brain,
  items: [
    { title: "Compound Signals", url: `/projects/${projectId}/ai/compound-signals`, icon: Brain },
  ],
});

// Slugs that get a dedicated methodology sidebar (not the Foundation fallback,
// which already carries the central reporting group).
const DEDICATED_METHODOLOGIES = new Set([
  "scrum", "kanban", "prince2", "lean_six_sigma_green", "lean_six_sigma_black",
  "agile", "waterfall", "hybrid",
]);

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
            { title: "Budget", url: `/projects/${projectId}/scrum/budget`, icon: Euro },
            { title: "Project Charter", url: `/projects/${projectId}/foundation/charter`, icon: ScrollText },
            { title: "Business Case", url: `/projects/${projectId}/foundation/business-case`, icon: Briefcase },
            { title: "Definition of Done", url: `/projects/${projectId}/scrum/definition-of-done`, icon: CheckSquare },
          ],
        },
        {
          id: "backlog",
          title: "Product Backlog",
          icon: ListChecks,
          items: [
            { title: "Product Goals", url: `/projects/${projectId}/scrum/product-goals`, icon: Target },
            { title: "Backlog", url: `/projects/${projectId}/scrum/backlog`, icon: ListChecks },
          ],
        },
        {
          id: "sprints",
          title: "Sprint Management",
          icon: Repeat,
          items: [
            { title: "Activity List", url: `/projects/${projectId}/planning/tasks`, icon: ListChecks },
            { title: "Action Tracker", url: `/projects/${projectId}/action-tracker`, icon: ClipboardList },
            { title: "Sprint Board", url: `/projects/${projectId}/scrum/sprint-board`, icon: Columns },
            { title: "Velocity", url: `/projects/${projectId}/scrum/velocity`, icon: Gauge },
            { title: "Increments", url: `/projects/${projectId}/scrum/increments`, icon: Package },
          ],
        },
        {
          id: "ceremonies",
          title: "Scrum Events",
          icon: Users,
          items: [
            { title: "Daily Standup", url: `/projects/${projectId}/scrum/daily-standup`, icon: Users },
            { title: "Sprint Planning", url: `/projects/${projectId}/scrum/sprint-planning`, icon: Calendar },
            { title: "Sprint Review", url: `/projects/${projectId}/scrum/sprint-review`, icon: Presentation },
            { title: "Retrospective", url: `/projects/${projectId}/scrum/retrospective`, icon: Lightbulb },
            { title: "Retro Actions", url: `/projects/${projectId}/scrum/retro-actions`, icon: Flag },
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
            { title: "Budget", url: `/projects/${projectId}/kanban/budget`, icon: Euro },
            { title: "Board Configuration", url: `/projects/${projectId}/kanban/board-configuration`, icon: Columns },
            { title: "WIP Limits", url: `/projects/${projectId}/kanban/wip-limits`, icon: Shield },
            { title: "Work Policies", url: `/projects/${projectId}/kanban/work-policies`, icon: FileText },
            { title: "Project Charter", url: `/projects/${projectId}/foundation/charter`, icon: ScrollText },
            { title: "Business Case", url: `/projects/${projectId}/foundation/business-case`, icon: Briefcase },
          ],
        },
        {
          id: "board",
          title: "Kanban Board",
          icon: LayoutGrid,
          items: [
            { title: "Activity List", url: `/projects/${projectId}/planning/tasks`, icon: ListChecks },
            { title: "Action Tracker", url: `/projects/${projectId}/action-tracker`, icon: ClipboardList },
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
            { title: "Budget", url: `/projects/${projectId}/foundation/budget`, icon: Euro },
            { title: "Project Charter", url: `/projects/${projectId}/foundation/charter`, icon: ScrollText },
            { title: "Business Case", url: `/projects/${projectId}/prince2/business-case`, icon: FileCheck },
            { title: "Project Brief", url: `/projects/${projectId}/prince2/project-brief`, icon: FileText },
          ],
        },
        {
          id: "stages",
          title: "Stage Management",
          icon: Layers,
          items: [
            { title: "Planning", url: `/projects/${projectId}/prince2/planning`, icon: CalendarDays },
            { title: "Activity List", url: `/projects/${projectId}/planning/tasks`, icon: ListChecks },
            { title: "Action Tracker", url: `/projects/${projectId}/action-tracker`, icon: ClipboardList },
            { title: "RACI", url: `/projects/${projectId}/planning/raci`, icon: Network },
            { title: "Stage Plan", url: `/projects/${projectId}/prince2/stage-plan`, icon: Calendar },
            { title: "Work Packages", url: `/projects/${projectId}/prince2/work-packages`, icon: ListChecks },
            { title: "Stage Gates", url: `/projects/${projectId}/prince2/stage-gates`, icon: Shield },
            { title: "Tolerances", url: `/projects/${projectId}/prince2/tolerances`, icon: Gauge },
            { title: "Quality Register", url: `/projects/${projectId}/prince2/quality-register`, icon: CheckCircle },
            { title: "Product Status", url: `/projects/${projectId}/prince2/product-status`, icon: Package },
          ],
        },
        {
          id: "governance",
          title: "Governance",
          icon: Shield,
          items: [
            { title: "Project Board", url: `/projects/${projectId}/prince2/project-board`, icon: Users },
            { title: "Risk Register", url: `/projects/${projectId}/prince2/risks`, icon: AlertCircle },
            { title: "Issue Register", url: `/projects/${projectId}/prince2/issues`, icon: ClipboardList },
            { title: "Assumptions", url: `/projects/${projectId}/assumptions`, icon: HelpCircle },
            { title: "Exception Plans", url: `/projects/${projectId}/prince2/exception-plan`, icon: FileBarChart },
            { title: "Management Approaches", url: `/projects/${projectId}/prince2/management-approaches`, icon: Gavel },
            { title: "Daily Log", url: `/projects/${projectId}/prince2/daily-log`, icon: BookOpen },
            { title: "PID / Governance", url: `/projects/${projectId}/prince2/governance`, icon: BarChart3 },
            { title: "Change Control", url: `/projects/${projectId}/execution/governance`, icon: GitBranch },
          ],
        },
        {
          // All PRINCE2 reporting consolidated here: doctrine reports
          // (Highlight / Exception / End Project) + the central status layer
          // (Status Reporting / AI Status Report / Reporting), so "where is the
          // report?" has one answer in PRINCE2.
          id: "reporting",
          title: "Status Reporting",
          icon: Activity,
          items: [
            { title: "Status Reporting", url: `/projects/${projectId}/execution/communication/status-reporting`, icon: Activity },
            { title: "AI Status Report", url: `/projects/${projectId}/execution/communication/ai-status-report`, icon: Sparkles },
            { title: "Highlight Reports", url: `/projects/${projectId}/prince2/highlight-report`, icon: Activity },
            { title: "Exception Reports", url: `/projects/${projectId}/prince2/exception-reports`, icon: AlertOctagon },
            { title: "End Project Report", url: `/projects/${projectId}/prince2/end-project-report`, icon: File },
            { title: "Reporting", url: `/projects/${projectId}/execution/communication/reporting`, icon: FileText },
          ],
        },
        {
          id: "closure",
          title: "Project Closure",
          icon: CheckSquare,
          items: [
            { title: "Closure Checklist", url: `/projects/${projectId}/prince2/closure-checklist`, icon: CheckSquare },
            { title: "Lessons Log", url: `/projects/${projectId}/prince2/lessons-log`, icon: Lightbulb },
            { title: "Benefits Review", url: `/projects/${projectId}/prince2/benefits-review`, icon: Award },
          ],
        },
      ];

    case 'lean_six_sigma_green':
    case 'lean_six_sigma_black':
      const isBlackBelt = methodology?.toLowerCase() === 'lean_six_sigma_black';
      const lssBase = isBlackBelt ? 'lss-black' : 'lss-green';
      return [
        {
          id: "lss-dashboard",
          title: isBlackBelt ? "LSS Black Belt" : "LSS Green Belt",
          icon: FlaskConical,
          items: [
            { title: "Overview", url: `/projects/${projectId}/${lssBase}/overview`, icon: LayoutDashboard },
            { title: "Phases", url: `/projects/${projectId}/${lssBase}/phases`, icon: Target },
            { title: "Tasks", url: `/projects/${projectId}/${lssBase}/tasks`, icon: ListChecks },
            { title: "Timeline", url: `/projects/${projectId}/${lssBase}/timeline`, icon: Calendar },
            ...(isBlackBelt ? [
              { title: "DOE", url: `/projects/${projectId}/lss-black/doe`, icon: FlaskConical },
              { title: "Control Plans", url: `/projects/${projectId}/lss-black/control-plans`, icon: Shield },
              { title: "SPC Charts", url: `/projects/${projectId}/lss-black/spc-charts`, icon: BarChart3 },
            ] : [
              { title: "Metrics", url: `/projects/${projectId}/lss-green/metrics`, icon: Gauge },
              { title: "Measurements", url: `/projects/${projectId}/lss-green/measurements`, icon: BarChart3 },
            ]),
          ],
        },
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
            { title: "Budget", url: `/projects/${projectId}/define/budget`, icon: Euro },
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
            { title: "Budget", url: `/projects/${projectId}/agile/budget`, icon: Euro },
            { title: "Project Charter", url: `/projects/${projectId}/foundation/charter`, icon: ScrollText },
            { title: "Business Case", url: `/projects/${projectId}/foundation/business-case`, icon: Briefcase },
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
            { title: "Epics", url: `/projects/${projectId}/agile/epics`, icon: Layers },
            { title: "Backlog", url: `/projects/${projectId}/agile/backlog`, icon: ListChecks },
            { title: "Release Planning", url: `/projects/${projectId}/agile/release-planning`, icon: Calendar },
          ],
        },
        {
          id: "execution",
          title: "Execution",
          icon: Rocket,
          items: [
            { title: "Activity List", url: `/projects/${projectId}/planning/tasks`, icon: ListChecks },
            { title: "Action Tracker", url: `/projects/${projectId}/action-tracker`, icon: ClipboardList },
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
            { title: "Stakeholder Feedback", url: `/projects/${projectId}/agile/stakeholder-feedback`, icon: MessagesSquare },
            { title: "Definition of Done", url: `/projects/${projectId}/agile/definition-of-done`, icon: CheckSquare },
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
            { title: "Budget", url: `/projects/${projectId}/waterfall/budget`, icon: Euro },
            { title: "Project Charter", url: `/projects/${projectId}/foundation/charter`, icon: ScrollText },
            { title: "Business Case", url: `/projects/${projectId}/foundation/business-case`, icon: Briefcase },
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
            { title: "Activity List", url: `/projects/${projectId}/planning/tasks`, icon: ListChecks },
            { title: "Action Tracker", url: `/projects/${projectId}/action-tracker`, icon: ClipboardList },
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
            { title: "Phase Gates", url: `/projects/${projectId}/waterfall/phase-gate`, icon: CheckCircle },
            { title: "Baselines", url: `/projects/${projectId}/waterfall/baselines`, icon: Target },
            { title: "Risks", url: `/projects/${projectId}/waterfall/risks`, icon: Shield },
            { title: "Issues", url: `/projects/${projectId}/waterfall/issues`, icon: AlertCircle },
            { title: "Deliverables", url: `/projects/${projectId}/waterfall/deliverables`, icon: Package },
          ],
        },
      ];

    case 'hybrid':
      return [
        {
          id: "hybrid-dashboard",
          title: "Hybrid",
          icon: GitMerge,
          items: [
            { title: "Overview", url: `/projects/${projectId}/hybrid/overview`, icon: LayoutDashboard },
            { title: "Phases", url: `/projects/${projectId}/hybrid/phases`, icon: Target },
            { title: "Tasks", url: `/projects/${projectId}/hybrid/tasks`, icon: ListChecks },
            { title: "Timeline", url: `/projects/${projectId}/hybrid/timeline`, icon: Calendar },
            { title: "Artifacts", url: `/projects/${projectId}/hybrid/artifacts`, icon: FileText },
            { title: "Configuration", url: `/projects/${projectId}/hybrid/configuration`, icon: Settings },
          ],
        },
        {
          id: "foundation",
          title: "Project Foundation",
          icon: FolderKanban,
          items: [
            { title: "Overview", url: `/projects/${projectId}/foundation/overview`, icon: FolderKanban },
            { title: "Workflow", url: `/projects/${projectId}/foundation/workflow`, icon: GitBranch },
            { title: "Project Charter", url: `/projects/${projectId}/foundation/charter`, icon: FileCheck },
            { title: "Team", url: `/projects/${projectId}/foundation/team`, icon: Users },
            { title: "Budget", url: `/projects/${projectId}/foundation/budget`, icon: Euro },
          ],
        },
        {
          id: "planning",
          title: "Planning & Design",
          icon: Calendar,
          items: [
            { title: "Timeline", url: `/projects/${projectId}/planning/timeline`, icon: Calendar },
            { title: "Milestones", url: `/projects/${projectId}/planning/milestones`, icon: CheckSquare },
            { title: "Tasks", url: `/projects/${projectId}/planning/tasks`, icon: ListChecks },
            { title: "RACI", url: `/projects/${projectId}/planning/raci`, icon: Network },
            { title: "Risks", url: `/projects/${projectId}/planning/risks`, icon: Shield },
          ],
        },
      ];

    case 'inclufy':
      return buildFoundationPhases(projectId, "Inclufy Best Practice");

    default:
      return buildFoundationPhases(projectId, "Project Foundation");
  }
};

const getMethodologyBadge = (methodology: string | null) => {
  const badges: Record<string, { label: string; color: string }> = {
    'inclufy': { label: 'Best Practice', color: 'bg-indigo-500' },
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
  const { t, language } = useLanguage();
  const isNL = language === 'nl';
  const { user } = useAuth();
  const { data: userFeatures, isLoading: featuresLoading } = useUserFeatures();
  const { toast } = useToast();
  const navigate = useNavigate();
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
    governance: 'Governance',
    portfolios: 'Portfolios',
    boards: 'Boards',
    stakeholders: 'Stakeholders',
    decisions: 'Decisions',
    reports: 'Reports',
    profile: 'Profile',
    settings: 'Settings',
  };

  // Methodology term translator
  const mt = (t as any).methodologyTerms || {};
  const tm = (title: string) => mt[title] || title;

  
  // Helper to check if item is locked for trial users
  const isItemLocked = (featureName: string | null) => {
    // SuperAdmin sees everything enabled
    if (user?.isSuperAdmin || user?.role === 'superadmin') {
      return false;
    }

    // No feature requirement = always accessible
    if (!featureName) {
      return false;
    }

    // Don't lock while loading
    if (featuresLoading || !userFeatures) {
      return false;
    }

    // hasFeature handles role-based bypass (e.g. program_manager → program_management)
    return !hasFeature(userFeatures, featureName);
  };

  // Get user role for menu filtering
  const userRole = user?.role || 'guest';

  // Role-based menu items
  const getMenuItemsForRole = () => {
    // Logical order: Overview → Delivery (Projects → Programs → Governance) →
    // Insights (Reports & Analytics → AI Chat) → Resources (Team → Time) →
    // Lifecycle (Post Project). Role gates unchanged.
    const isPMPlus = ['pm', 'program_manager', 'admin', 'superadmin'].includes(userRole);
    const isPgmPlus = ['program_manager', 'admin', 'superadmin'].includes(userRole);

    const baseItems = [
      // — Overview —
      { title: ts.dashboard, url: "/dashboard", icon: LayoutDashboard, feature: null },
      // — Delivery —
      { title: ts.allProjects, url: "/projects", icon: FolderKanban, feature: null },
    ];

    if (isPgmPlus) {
      baseItems.push({
        title: ts.programs, url: "/programs", icon: Layers,
        isProgramLink: true, feature: 'program_management',
      });
      baseItems.push({
        title: ts.governance, url: "/governance/dashboard", icon: Briefcase, feature: null,
        children: [
          { title: "Dashboard", url: "/governance/dashboard", icon: LayoutDashboard },
          { title: ts.portfolios, url: "/governance/portfolios", icon: Briefcase },
          { title: ts.boards, url: "/governance/boards", icon: Shield },
          { title: ts.stakeholders, url: "/governance/stakeholders", icon: Users },
          { title: ts.decisions, url: "/governance/decisions", icon: Gavel },
        ],
      });
    }

    // — Insights —
    baseItems.push({ title: "Reports & Analytics", url: "/reports", icon: FileBarChart, feature: null });
    baseItems.push({ title: ts.aiAssistant, url: "/ai-assistant", icon: MessageSquare, feature: 'ai_assistant' });

    // — Resources —
    if (isPMPlus) {
      baseItems.push({ title: ts.team, url: "/team", icon: Users, feature: 'teams' });
    }
    baseItems.push({ title: ts.timeTracking, url: "/time-tracking", icon: Clock, feature: 'time_tracking' });

    // — Lifecycle —
    if (isPMPlus) {
      baseItems.push({ title: ts.postProject, url: "/post-project", icon: FileCheck, feature: 'post_project' });
    }

    return baseItems;
  };

  // Academy gets its own sidenav (IQ-Helix-style) when you're inside it — the
  // top-level project/methodology nav is replaced by Academy features. The
  // in-course learning sub-nav (further down) still takes over while in a lesson.
  const inAcademy = location.pathname.startsWith('/academy') && !location.pathname.includes('/learn');
  const academyMenu = [
    { title: isNL ? 'Dashboard' : 'Dashboard', url: '/academy/dashboard', icon: LayoutDashboard },
    { title: isNL ? 'Catalogus' : 'Catalog', url: '/academy', icon: GraduationCap },
    { title: isNL ? 'Leertrajecten' : 'Learning Paths', url: '/academy/learning-paths', icon: Network },
    { title: isNL ? 'Skill-paspoort' : 'Skill Passport', url: '/academy/skill-passport', icon: Target },
    { title: isNL ? 'Certificaten' : 'Certifications', url: '/academy/certifications', icon: Award },
    ...(['admin', 'superadmin'].includes(userRole)
      ? [{ title: isNL ? 'Cursussen toewijzen' : 'Assign Courses', url: '/academy/assignments', icon: UserCheck }]
      : []),
    { title: isNL ? 'Prijzen' : 'Pricing', url: '/academy/pricing', icon: CreditCard },
    { title: isNL ? 'Offerte aanvragen' : 'Request a Quote', url: '/academy/quote', icon: FileText },
    { title: isNL ? 'Terug naar werkruimte' : 'Back to Workspace', url: '/dashboard', icon: LayoutDashboard },
  ];
  const menuItems = inAcademy ? academyMenu : getMenuItemsForRole();

  const pathParts = location.pathname.split('/');
  const isProjectContext = pathParts[1] === 'projects' && pathParts[2] && pathParts[2] !== 'new';
  const isProgramContext = pathParts[1] === 'programs' && pathParts[2] && pathParts[2] !== 'new';
  
  const projectId = isProjectContext ? pathParts[2] : undefined;
  const programId = isProgramContext ? pathParts[2] : undefined;
  
  const { data: project } = useProject(projectId);
  const methodology = project?.methodology || null;
  const methodologyBadge = getMethodologyBadge(methodology);

  // Read the program's REAL methodology (was hardcoded 'hybrid', so every
  // programme rendered the hybrid menu regardless of its actual framework).
  const { data: program } = useProgram(programId);
  const programMethodology = isProgramContext ? (program?.methodology || 'hybrid') : null;
  const programMethodologyBadge = isProgramContext ? getMethodologyBadge(programMethodology) : null;
  
  const projectPhases = projectId
    ? [
        ...getMethodologyPhases(projectId, methodology),
        ...(methodology && DEDICATED_METHODOLOGIES.has(methodology.toLowerCase())
          ? [
              // PRINCE2 carries its own consolidated "Status Reporting" group
              // (doctrine reports + central status layer merged) inside its case,
              // so the shared central group is skipped to avoid a duplicate tab.
              ...(methodology.toLowerCase() !== "prince2"
                ? [centralReportingGroup(projectId, methodology)]
                : []),
              communicationGroup(projectId),
              aiInsightsGroup(projectId),
              // Universal RAID + Cost layer — appended to every dedicated
              // methodology EXCEPT prince2, which carries its own richer
              // Risk/Issue registers + Budget natively.
              ...(methodology.toLowerCase() !== "prince2"
                ? [raidGroup(projectId), costGroup(projectId)]
                : []),
            ]
          : []),
      ]
    : [];
  // Universal programme layer — parity with the project methodologies. Appended
  // to every programme so Status Reporting, Communication and AI Insights (rolled
  // up over constituent projects) are consistent across all programme methods.
  // Programme doctrine reports folded into the single Status Reporting group
  // (parity with the project sidebars) so a programme has one reporting tab.
  const PROGRAMME_DOCTRINE_REPORTS = (pid: string, m: string | null) => {
    const map: Record<string, { title: string; url: string; icon: any }[]> = {
      prince2_programme: [
        { title: "Highlight Reports", url: `/programs/${pid}/highlights`, icon: Activity },
        { title: "Exception Reports", url: `/programs/${pid}/exceptions`, icon: AlertOctagon },
      ],
    };
    return map[(m || "").toLowerCase()] || [];
  };
  const programUniversalGroups = (pid: string, methodology: string | null = null) => [
    {
      id: "prog-status-reporting",
      title: "Status Reporting",
      icon: Activity,
      items: [
        { title: "Reports", url: `/programs/${pid}/reports`, icon: FileText },
        { title: "AI Status Report", url: `/programs/${pid}/ai/status`, icon: Sparkles },
        ...PROGRAMME_DOCTRINE_REPORTS(pid, methodology),
      ],
    },
    {
      id: "prog-communication",
      title: "Communication",
      icon: Mail,
      items: [
        { title: "Communications", url: `/programs/${pid}/communications`, icon: Mail },
      ],
    },
    {
      id: "prog-ai-insights",
      title: "AI Insights",
      icon: Brain,
      items: [
        { title: "Compound Signals", url: `/programs/${pid}/ai/compound-signals`, icon: Brain },
      ],
    },
  ];
  const programPhases = programId
    ? [...getProgramPhases(programId, programMethodology), ...programUniversalGroups(programId, programMethodology)]
    : [];

  // Color mapping for menu icons
  const iconColors: Record<string, string> = {
    "Dashboard": "text-violet-500",
    "AI Chat": "text-fuchsia-500",
    "Governance": "text-indigo-500",
    "Programs": "text-orange-500",
    "Reports": "text-emerald-500",
    "Reports & Analytics": "text-emerald-500",
    "Projects": "text-sky-500",
    "Team": "text-pink-500",
    "Time Tracking": "text-amber-500",
    "Post Project": "text-teal-500",
    "Profile": "text-blue-500",
    "Settings": "text-gray-500",
    "Admin Portal": "text-purple-600",
  };

  const getIconColor = (title: string) => iconColors[title] || "text-gray-500";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border/50 px-4 py-5">
        <ProjeXtPalLogo collapsed={isCollapsed} />
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5 px-1">
              {menuItems.map((item) => {
                const isLocked = isItemLocked(item.feature);
                const isActive = location.pathname === item.url || 
                                 (item.isProgramLink && isProgramContext);
                const isGovActive = item.children && location.pathname.startsWith('/governance');
                const iconColor = getIconColor(item.title, item.url);

                // Render collapsible for items with children
                if (item.children && !isCollapsed) {
                  return (
                    <Collapsible key={item.url} defaultOpen={isGovActive} className="group/governance">
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton className={cn(
                            "rounded-lg transition-colors duration-150",
                            isGovActive
                              ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-medium"
                              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/50"
                          )}>
                            <item.icon className={cn(
                              "h-[18px] w-[18px] shrink-0",
                              isGovActive ? "text-purple-600 dark:text-purple-300" : "text-gray-400 dark:text-gray-500"
                            )} />
                            <span className="text-sm">{item.title}</span>
                            <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/governance:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub className="ml-5 mt-1 space-y-0.5 border-l-2 border-purple-200 dark:border-purple-800/40 pl-3">
                            {item.children.map((child) => (
                              <SidebarMenuSubItem key={child.url}>
                                <SidebarMenuSubButton asChild>
                                  <NavLink
                                    to={child.url}
                                    end
                                    className={({ isActive }) =>
                                      cn("rounded-md transition-all duration-150 text-sm",
                                        isActive
                                          ? "bg-purple-100/80 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium"
                                          : "hover:bg-gray-100/80 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400"
                                      )
                                    }
                                  >
                                    <child.icon className="h-3.5 w-3.5" />
                                    <span>{child.title}</span>
                                  </NavLink>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      tooltip={isLocked ? "🔒 Upgrade Required" : item.title}
                      className={cn(
                        "rounded-lg transition-colors duration-150",
                        isLocked && "opacity-60 hover:opacity-80"
                      )}
                    >
                      <NavLink
                        to={item.url}
                        end={item.isProgramLink ? !isProgramContext : true}
                        onClick={(e) => {
                          if (isLocked) {
                            e.preventDefault();
                            toast({
                              title: "🔒 Upgrade Required",
                              description: `${item.title} is available with a paid subscription.`,
                              action: (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigate('/profile?tab=subscription')}
                                >
                                  View Plans
                                </Button>
                              ),
                            });
                          }
                        }}
                        className={({ isActive: navIsActive }) =>
                          cn(
                            "flex items-center gap-3 rounded-lg",
                            (navIsActive || isActive)
                              ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-medium"
                              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/50",
                            isLocked && "cursor-not-allowed"
                          )
                        }
                      >
                        {({ isActive: navIsActive }) => {
                          const on = navIsActive || isActive;
                          return (
                            <>
                              <item.icon className={cn(
                                "h-[18px] w-[18px] shrink-0",
                                isLocked
                                  ? "text-muted-foreground"
                                  : on
                                    ? "text-purple-600 dark:text-purple-300"
                                    : "text-gray-400 dark:text-gray-500"
                              )} />
                              {!isCollapsed && (
                                <span className="text-sm">{item.title}</span>
                              )}
                              {isLocked && !isCollapsed && (
                                <Lock className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
                              )}
                              {on && !isLocked && !isCollapsed && (
                                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-purple-500" />
                              )}
                            </>
                          );
                        }}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

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
                        {!isCollapsed && <span>{tm(phase.title)}</span>}
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
                                  <span>{tm(item.title)}</span>
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
                        {!isCollapsed && <span>{tm(phase.title)}</span>}
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
                                      <span>{tm(item.title)}</span>
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
                                              <span>{tm(subItem.title)}</span>
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
                                    <span>{tm(item.title)}</span>
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
      
              {/* Academy */}
<SidebarGroup>
  <SidebarMenu>
    {(() => {
      const isAcademyLearning = location.pathname.includes('/academy/course/') && location.pathname.includes('/learn');
      
      if (isAcademyLearning && !isCollapsed) {
        return (
          <Collapsible defaultOpen={true} className="group/academy">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton className={cn(
                  "rounded-lg transition-all duration-200",
                  location.pathname.startsWith('/academy')
                    ? "bg-gradient-to-r from-purple-50 to-fuchsia-50 dark:from-purple-900/20 dark:to-fuchsia-900/20 text-purple-700 dark:text-purple-300 font-semibold shadow-sm"
                    : "hover:bg-gray-100/80 dark:hover:bg-gray-800/50"
                )}>
                  <div className={cn("flex items-center justify-center w-7 h-7 rounded-lg", location.pathname.startsWith('/academy') ? "bg-white dark:bg-gray-800 shadow-sm" : "bg-gray-100/80 dark:bg-gray-800")}>
                    <GraduationCap className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-sm">Academy</span>
                  <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/academy:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub className="ml-5 mt-1 space-y-0.5 border-l-2 border-purple-200 dark:border-purple-800/40 pl-3">
                  {[
                    { tab: 'content', icon: BookOpen, label: isNL ? 'Inhoud' : 'Content', isDefault: true },
                    { tab: 'notes', icon: FileText, label: isNL ? 'Notities' : 'Notes' },
                    { tab: 'resources', icon: Download, label: 'Resources' },
                    { tab: 'questions', icon: MessageSquare, label: isNL ? 'Vragen' : 'Questions' },
                    { divider: true },
                    { tab: 'skills', icon: Target, label: 'Skills' },
                    { tab: 'simulation', icon: FlaskConical, label: isNL ? 'Simulatie' : 'Simulation' },
                    { tab: 'practice', icon: Briefcase, label: isNL ? 'Praktijk' : 'Practice' },
                    { tab: 'quiz', icon: CheckCircle, label: 'Quiz' },
                    { divider: true },
                    { tab: 'exam', icon: GraduationCap, label: isNL ? 'Examen' : 'Exam' },
                    { tab: 'certificate', icon: Award, label: isNL ? 'Certificaat' : 'Certificate' },
                  ].map((item, idx) => {
                    if ('divider' in item && item.divider) {
                      return <div key={`div-${idx}`} className="h-px bg-purple-200 dark:bg-purple-800/40 my-1" />;
                    }
                    const currentTab = new URLSearchParams(location.search).get('tab');
                    const isActive = item.tab === currentTab || (item.isDefault && !currentTab);
                    const Icon = item.icon!;
                    return (
                      <SidebarMenuSubItem key={item.tab}>
                        <SidebarMenuSubButton asChild>
                          <button
                            onClick={() => navigate(`${location.pathname}?tab=${item.tab}`)}
                            className={cn(
                              "rounded-md transition-all duration-150 text-sm w-full",
                              isActive
                                ? "bg-purple-100/80 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium"
                                : "hover:bg-gray-100/80 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400"
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            <span>{item.label}</span>
                          </button>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    );
                  })}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        );
      }
      
      // Academy moved to the top nav (IQ-Helix-style). The sidebar only shows
      // the in-course learning sub-nav (above) while inside a lesson; otherwise
      // there is no Academy entry in the sidebar.
      return null;
    })()}
  </SidebarMenu>
    </SidebarGroup>
        </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/50">
        {userFeatures && !isCollapsed && (
          <div className="px-3 pt-3 pb-1">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 dark:from-violet-500/20 dark:via-purple-500/20 dark:to-fuchsia-500/20 p-3 border border-purple-200/50 dark:border-purple-800/30">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-fuchsia-400/20 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <p className="text-[10px] uppercase tracking-wider text-purple-600/70 dark:text-purple-400/70 font-semibold mb-1">Current Plan</p>
                <Badge className={cn(getTierColor(userFeatures.tier), "text-xs font-semibold")}>
                  {getTierName(userFeatures.tier)}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-2.5 text-xs h-8 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
                  onClick={() => window.location.href = '/profile?tab=subscription'}
                >
                  <CreditCard className="w-3 h-3 mr-1.5" />
                  Manage Plan
                </Button>
              </div>
            </div>
          </div>
        )}

        <SidebarMenu className="px-1 pb-2 space-y-0.5">
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  cn("rounded-lg transition-all duration-200 flex items-center gap-3",
                    isActive
                      ? "bg-gradient-to-r from-purple-50 to-fuchsia-50 dark:from-purple-900/20 dark:to-fuchsia-900/20 text-purple-700 dark:text-purple-300 font-semibold shadow-sm"
                      : "hover:bg-gray-100/80 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300"
                  )
                }
              >
                <div className={cn("flex items-center justify-center w-7 h-7 rounded-lg", "bg-gray-100 dark:bg-gray-800")}>
                  <UserCircle className="h-4 w-4 text-blue-500" />
                </div>
                {!isCollapsed && <span className="text-sm">{ts.profile}</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  cn("rounded-lg transition-all duration-200 flex items-center gap-3",
                    isActive
                      ? "bg-gradient-to-r from-purple-50 to-fuchsia-50 dark:from-purple-900/20 dark:to-fuchsia-900/20 text-purple-700 dark:text-purple-300 font-semibold shadow-sm"
                      : "hover:bg-gray-100/80 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300"
                  )
                }
              >
                <div className={cn("flex items-center justify-center w-7 h-7 rounded-lg", "bg-gray-100 dark:bg-gray-800")}>
                  <Settings className="h-4 w-4 text-gray-500" />
                </div>
                {!isCollapsed && <span className="text-sm">{ts.settings}</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {user?.isSuperAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    cn("rounded-lg transition-all duration-200 flex items-center gap-3",
                      isActive
                        ? "bg-gradient-to-r from-purple-100 to-fuchsia-100 dark:from-purple-900/30 dark:to-fuchsia-900/30 text-purple-700 dark:text-purple-300 font-semibold shadow-sm"
                        : "hover:bg-purple-50/80 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                    )
                  }
                >
                  <div className={cn("flex items-center justify-center w-7 h-7 rounded-lg", "bg-purple-100 dark:bg-purple-900/30")}>
                    <Shield className="h-4 w-4 text-purple-600" />
                  </div>
                  {!isCollapsed && <span className="text-sm">{ts.adminPortal}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
