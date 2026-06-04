import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp, Lightbulb, Users, Layers, SlidersHorizontal, Package, Settings2,
  Briefcase, ShieldCheck, Map, ShieldAlert, GitBranch, Gauge,
  GraduationCap, ArrowUpRight, Compass, BookOpen, ChevronDown,
} from "lucide-react";

// Academy deep-link helper — PRINCE2 Foundation course.
const ACADEMY_COURSE = "prince2-foundation";
const lessonHref = (lesson?: string) =>
  lesson ? `/academy/course/${ACADEMY_COURSE}/learn?lesson=${lesson}` : `/academy/course/${ACADEMY_COURSE}`;

type Icon = typeof TrendingUp;

interface Item {
  name: string;
  desc: string;
  icon: Icon;
  lesson: string;     // Academy lesson that teaches it
  route?: string;     // in-app PRINCE2 page (slug under /projects/:id/prince2/)
}

// ── The 7 Principles (Academy module 1, lesson p2-l2) ──────────────
const PRINCIPLES: Item[] = [
  { name: "Continued business justification", desc: "A documented, viable Business Case drives every decision.", icon: TrendingUp, lesson: "p2-l2", route: "business-case" },
  { name: "Learn from experience", desc: "Capture and apply lessons throughout the project.", icon: Lightbulb, lesson: "p2-l2", route: "lessons-log" },
  { name: "Defined roles & responsibilities", desc: "Clear who-does-what across business, user and supplier.", icon: Users, lesson: "p2-l2", route: "project-board" },
  { name: "Manage by stages", desc: "Plan, monitor and control one management stage at a time.", icon: Layers, lesson: "p2-l2", route: "stage-plan" },
  { name: "Manage by exception", desc: "Set tolerances; escalate only when they are forecast to breach.", icon: SlidersHorizontal, lesson: "p2-l2", route: "tolerances" },
  { name: "Focus on products", desc: "Define product quality before activity — product-based planning.", icon: Package, lesson: "p2-l2", route: "product-status" },
  { name: "Tailor to suit the project", desc: "Scale PRINCE2 to the project's size, risk and complexity.", icon: Settings2, lesson: "p2-l2" },
];

// ── The 7 Themes (Academy module 2) ────────────────────────────────
const THEMES: Item[] = [
  { name: "Business Case", desc: "Is the investment desirable, viable & achievable?", icon: Briefcase, lesson: "p2-l5", route: "business-case" },
  { name: "Organization", desc: "Roles & accountability — the project management team.", icon: Users, lesson: "p2-l6", route: "project-board" },
  { name: "Quality", desc: "Define & verify products are fit for purpose.", icon: ShieldCheck, lesson: "p2-l7", route: "quality-register" },
  { name: "Plans", desc: "Project, stage & team plans — product-based.", icon: Map, lesson: "p2-l8", route: "planning" },
  { name: "Risk", desc: "Identify, assess & control uncertainty.", icon: ShieldAlert, lesson: "p2-l9", route: "risks" },
  { name: "Change", desc: "Assess & control issues and change requests.", icon: GitBranch, lesson: "p2-l9", route: "issues" },
  { name: "Progress", desc: "Track viability vs plan; manage by exception.", icon: Gauge, lesson: "p2-l9", route: "highlight-report" },
];

interface Props {
  /** project id, to build in-app PRINCE2 route links */
  projectId?: string;
  defaultOpen?: boolean;
}

const Prince2MethodologyOverview = ({ projectId, defaultOpen = true }: Props) => {
  const { pt } = usePageTranslations();
  const navigate = useNavigate();
  const [open, setOpen] = useState(defaultOpen);

  const goRoute = (slug?: string) => {
    if (slug && projectId) navigate(`/projects/${projectId}/prince2/${slug}`);
  };

  const Tile = ({ it, accent }: { it: Item; accent: "purple" | "indigo" }) => {
    const ring = accent === "purple" ? "hover:border-purple-300 hover:bg-purple-50/40 dark:hover:bg-purple-950/20"
      : "hover:border-indigo-300 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20";
    const iconBg = accent === "purple" ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300"
      : "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300";
    return (
      <div className={`group relative flex flex-col rounded-xl border bg-card p-3 transition-all ${ring}`}>
        <div className="flex items-start gap-2.5">
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
            <it.icon className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold leading-tight">{pt(it.name)}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{pt(it.desc)}</p>
          </div>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 border-t pt-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={() => navigate(lessonHref(it.lesson))}
            className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-1 text-[10px] font-medium text-purple-700 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300"
            title={pt("Learn in the Academy")}
          >
            <GraduationCap className="h-3 w-3" /> {pt("Learn")}
          </button>
          {it.route && projectId && (
            <button
              type="button"
              onClick={() => goRoute(it.route)}
              className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[10px] font-medium text-foreground/70 hover:bg-muted/70"
              title={pt("Open in this project")}
            >
              <ArrowUpRight className="h-3 w-3" /> {pt("Open")}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Compass className="h-5 w-5 text-purple-600" /> {pt("PRINCE2 at a glance")}
          </CardTitle>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`/academy/course/${ACADEMY_COURSE}`)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700 transition-colors hover:bg-purple-100 dark:border-purple-900/50 dark:bg-purple-950/30 dark:text-purple-300"
            >
              <BookOpen className="h-3.5 w-3.5" /> {pt("Full course")}
            </button>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              aria-label={open ? pt("Collapse") : pt("Expand")}
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${open ? "" : "-rotate-90"}`} />
            </button>
          </div>
        </div>
      </CardHeader>

      {open && (
        <CardContent className="space-y-5">
          {/* 7 Principles */}
          <section>
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                <Compass className="h-3 w-3" /> {pt("7 Principles")}
              </span>
              <span className="text-[11px] text-muted-foreground">{pt("The non-negotiable foundations — a project is only PRINCE2 if all 7 are applied.")}</span>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {PRINCIPLES.map((p) => <Tile key={p.name} it={p} accent="purple" />)}
            </div>
          </section>

          {/* 7 Themes */}
          <section>
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                <Layers className="h-3 w-3" /> {pt("7 Themes")}
              </span>
              <span className="text-[11px] text-muted-foreground">{pt("Aspects of the project that must be addressed continually.")}</span>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {THEMES.map((t) => <Tile key={t.name} it={t} accent="indigo" />)}
            </div>
          </section>
        </CardContent>
      )}
    </Card>
  );
};

export default Prince2MethodologyOverview;
