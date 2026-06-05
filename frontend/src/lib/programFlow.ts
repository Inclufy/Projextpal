// Per-methodology programme lifecycle flow, mirroring the project-level
// MethodologyFlow on each project dashboard. Given the programme's methodology
// and live roll-up metrics, it returns the doctrine lifecycle stages (with
// honest progress derived from the real project counts), the matching Academy
// course deep-link, and quick-links into the programme tabs that drive each
// stage. Keeps the programme dashboard consistent with the project dashboards
// ("same as projects — with dashboards and progress").
import { FlowStep, FlowAccent } from "@/components/MethodologyFlow";

export interface ProgramFlowMetrics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  overallProgress: number; // avg project progress 0–100
}

export interface ProgramFlow {
  accent: FlowAccent;
  courseSlug: string;
  courseLabel: string;
  steps: FlowStep[];
}

const statusFor = (pct: number): FlowStep["status"] =>
  pct >= 100 ? "done" : pct > 0 ? "active" : "todo";

export const buildProgramFlow = (
  methodology: string | null | undefined,
  m: ProgramFlowMetrics,
): ProgramFlow => {
  // Honest progress signals from the real roll-up.
  const setupPct = m.totalProjects > 0 ? 100 : 0;
  const deliverPct = Math.max(0, Math.min(100, Math.round(m.overallProgress || 0)));
  const closedPct = m.totalProjects > 0
    ? Math.round((m.completedProjects / m.totalProjects) * 100)
    : 0;
  const proj = `${m.totalProjects} ${m.totalProjects === 1 ? "project" : "projects"}`;
  const active = `${m.activeProjects} active`;
  const done = `${m.completedProjects} completed`;

  const step = (
    code: string, label: string, purpose: string, progress: number,
    meta: string, academyHref: string, links: { label: string; slug: string }[],
  ): FlowStep => ({ code, label, purpose, progress, status: statusFor(progress), meta, academyHref, links });

  switch ((methodology || "").toLowerCase()) {
    case "safe": {
      const href = "/academy/course/safe-scaling-agile";
      return {
        accent: "violet", courseSlug: "safe-scaling-agile", courseLabel: "SAFe course",
        steps: [
          step("PLAN", "PI Planning", "Commit PI objectives across the Agile Release Train.", setupPct, proj, href, [{ label: "PI Planning", slug: "pi/planning" }, { label: "ART Overview", slug: "art" }]),
          step("EXEC", "Iteration Execution", "Teams deliver features over the PI iterations.", deliverPct, active, href, [{ label: "Features", slug: "features" }, { label: "Current PI", slug: "pi/current" }]),
          step("DEMO", "System Demo", "Integrated demo of the increment to stakeholders.", deliverPct, proj, href, [{ label: "System Demo", slug: "demos" }]),
          step("I&A", "Inspect & Adapt", "Measure predictability and improve the train.", closedPct, done, href, [{ label: "Inspect & Adapt", slug: "inspect-adapt" }]),
        ],
      };
    }
    case "msp": {
      const href = "/academy/course/program-management-pro";
      return {
        accent: "cyan", courseSlug: "program-management-pro", courseLabel: "Programme Management course",
        steps: [
          step("IDF", "Identify the Programme", "Programme mandate → Programme Brief.", setupPct, proj, href, [{ label: "Blueprint", slug: "blueprint" }, { label: "Projects", slug: "projects" }]),
          step("DEF", "Define the Programme", "Blueprint, Benefits Map and plans.", setupPct, proj, href, [{ label: "Benefits Map", slug: "benefits" }, { label: "Blueprint", slug: "blueprint" }]),
          step("DEL", "Manage the Tranches", "Deliver capability and transition into operations.", deliverPct, active, href, [{ label: "Tranche Plan", slug: "tranches" }, { label: "Transitions", slug: "transitions" }]),
          step("BEN", "Realize the Benefits", "Measure benefits and close the programme.", closedPct, done, href, [{ label: "Realization Plan", slug: "benefits/realization" }]),
        ],
      };
    }
    case "pmi": {
      const href = "/academy/course/program-management-pro";
      return {
        accent: "blue", courseSlug: "program-management-pro", courseLabel: "Programme Management course",
        steps: [
          step("FORM", "Program Formulation", "Program charter and roadmap.", setupPct, proj, href, [{ label: "Charter", slug: "charter" }, { label: "Roadmap", slug: "roadmap" }]),
          step("PLAN", "Program Planning", "Components and benefits plan.", setupPct, proj, href, [{ label: "Components", slug: "components" }, { label: "Benefit Register", slug: "benefit-register" }]),
          step("DEL", "Benefits Delivery", "Oversee components and deliver benefits.", deliverPct, active, href, [{ label: "KPIs", slug: "kpis" }, { label: "Components", slug: "components" }]),
          step("CLOSE", "Program Closure", "Transition outcomes and close.", closedPct, done, href, [{ label: "Governance", slug: "governance" }]),
        ],
      };
    }
    case "prince2_programme": {
      const href = "/academy/course/program-management-pro";
      return {
        accent: "purple", courseSlug: "program-management-pro", courseLabel: "Programme Management course",
        steps: [
          step("IDF", "Identify Programme", "Programme mandate and Brief.", setupPct, proj, href, [{ label: "Business Case", slug: "business-case" }]),
          step("DEF", "Define Programme", "Blueprint and Business Case.", setupPct, proj, href, [{ label: "Blueprint", slug: "operating-model" }, { label: "Business Case", slug: "business-case" }]),
          step("DEL", "Manage Tranches", "Stage gates per tranche.", deliverPct, active, href, [{ label: "Tranche Plan", slug: "tranches" }, { label: "Stage Gates", slug: "stage-gates" }]),
          step("CLOSE", "Close Programme", "Confirm benefits and close.", closedPct, done, href, [{ label: "Highlight Reports", slug: "highlights" }]),
        ],
      };
    }
    case "hybrid_programme": {
      const href = "/academy/course/program-management-pro";
      return {
        accent: "emerald", courseSlug: "program-management-pro", courseLabel: "Programme Management course",
        steps: [
          step("CFG", "Configure Governance", "Choose the governance model for the programme.", setupPct, proj, href, [{ label: "Governance Config", slug: "governance-config" }]),
          step("AUTH", "Authorize Constituents", "Authorize constituent projects under the config.", setupPct, proj, href, [{ label: "Constituents", slug: "constituents" }]),
          step("OVS", "Oversee Delivery", "Mixed predictive/adaptive cadence oversight.", deliverPct, active, href, [{ label: "Adaptations", slug: "adaptations" }, { label: "Constituents", slug: "constituents" }]),
          step("CLOSE", "Integrate & Close", "Roll up and realize benefits.", closedPct, done, href, [{ label: "Benefits", slug: "benefits" }]),
        ],
      };
    }
    default: {
      const href = "/academy/course/program-management-pro";
      return {
        accent: "slate", courseSlug: "program-management-pro", courseLabel: "Programme Management course",
        steps: [
          step("PLAN", "Plan", "Roadmap and milestones.", setupPct, proj, href, [{ label: "Roadmap", slug: "roadmap" }, { label: "Milestones", slug: "milestones" }]),
          step("EXEC", "Execute", "Deliver the constituent projects.", deliverPct, active, href, [{ label: "Projects", slug: "projects" }]),
          step("GOV", "Govern", "Benefits, stakeholders and risks.", deliverPct, proj, href, [{ label: "Governance", slug: "governance" }, { label: "Risks", slug: "risks" }]),
          step("CLOSE", "Close", "Realize benefits and report.", closedPct, done, href, [{ label: "Reports", slug: "reports" }]),
        ],
      };
    }
  }
};
