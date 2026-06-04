import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  CheckCircle2,
  Circle,
  ArrowUpRight,
  ListChecks,
  Package,
  GraduationCap,
  Compass,
} from "lucide-react";

type Activity = { label: string; done: boolean };
type ProcessProgress = { pct: number; done: number; total: number; activities: Activity[] };

interface ProcDef {
  code: string;
  label: string;
  purpose: string;
  /** Academy lesson id that teaches this process (course: prince2-foundation, module 3). */
  lesson?: string;
  products: { name: string; slug: string }[];
}

// Academy deep-link: PRINCE2 Foundation course, jump straight to a lesson.
const ACADEMY_COURSE = "prince2-foundation";
const academyHref = (lesson?: string) =>
  lesson
    ? `/academy/course/${ACADEMY_COURSE}/learn?lesson=${lesson}`
    : `/academy/course/${ACADEMY_COURSE}`;

// PRINCE2 processes with purpose, the Academy lesson that teaches them,
// and the management products each one delivers.
const DP: ProcDef = {
  code: "DP", label: "Directing a Project", lesson: "p2-l12",
  purpose: "The Project Board authorises initiation, each stage, exceptions and closure — directing by exception across the whole lifecycle.",
  products: [
    { name: "Project Board", slug: "project-board" },
    { name: "PID / Governance", slug: "governance" },
    { name: "Highlight Reports", slug: "highlight-report" },
    { name: "Exception Reports", slug: "exception-reports" },
  ],
};
const MP: ProcDef = {
  code: "MP", label: "Managing Product Delivery", lesson: "p2-l14",
  purpose: "The Team Manager accepts, executes and delivers Work Packages, keeping the products' quality under control.",
  products: [
    { name: "Work Packages", slug: "work-packages" },
    { name: "Quality Register", slug: "quality-register" },
    { name: "Product Status", slug: "product-status" },
  ],
};
const FLOW: ProcDef[] = [
  { code: "SU", label: "Starting Up a Project", lesson: "p2-l10",
    purpose: "Confirm the project is worthwhile and viable before committing resources. Produces the Project Brief and outline Business Case.",
    products: [
      { name: "Project Brief", slug: "project-brief" },
      { name: "Outline Business Case", slug: "business-case" },
      { name: "Initiation Stage Plan", slug: "stage-plan" },
      { name: "Daily Log", slug: "daily-log" },
    ] },
  { code: "IP", label: "Initiating a Project", lesson: "p2-l11",
    purpose: "Establish solid foundations: baseline the PID, define the four Management Approaches and the Project Plan.",
    products: [
      { name: "PID", slug: "governance" },
      { name: "Management Approaches", slug: "management-approaches" },
      { name: "Business Case", slug: "business-case" },
      { name: "Planning", slug: "planning" },
    ] },
  { code: "CS", label: "Controlling a Stage", lesson: "p2-l13",
    purpose: "Day-to-day management within stage tolerances: authorise work, monitor, capture risks & issues, report progress.",
    products: [
      { name: "Work Packages", slug: "work-packages" },
      { name: "Highlight Reports", slug: "highlight-report" },
      { name: "Risk Register", slug: "risks" },
      { name: "Issue Register", slug: "issues" },
      { name: "Tolerances", slug: "tolerances" },
    ] },
  { code: "SB", label: "Managing a Stage Boundary", lesson: "p2-l15",
    purpose: "Give the Board the information to approve the next stage (or an Exception Plan) and confirm the Business Case still holds.",
    products: [
      { name: "Stage Plan", slug: "stage-plan" },
      { name: "Stage Gates", slug: "stage-gates" },
      { name: "Exception Plans", slug: "exception-plan" },
      { name: "Product Status", slug: "product-status" },
    ] },
  { code: "CP", label: "Closing a Project", lesson: "p2-l16",
    purpose: "Confirm acceptance of the product, capture lessons and hand over — a controlled close.",
    products: [
      { name: "End Project Report", slug: "end-project-report" },
      { name: "Lessons Log", slug: "lessons-log" },
      { name: "Benefits Review", slug: "benefits-review" },
      { name: "Closure Checklist", slug: "closure-checklist" },
    ] },
];

const ALL: Record<string, ProcDef> = { DP, MP, ...Object.fromEntries(FLOW.map((f) => [f.code, f])) };

interface Props {
  current?: string | null;
  progress?: Record<string, ProcessProgress>;
  onNavigate?: (slug: string) => void;
}

type Status = "done" | "active" | "todo";

const STATUS_BAR: Record<Status, string> = {
  done: "bg-green-500",
  active: "bg-purple-500",
  todo: "bg-gray-300 dark:bg-gray-600",
};

const Prince2ProcessFlow = ({ current, progress = {}, onNavigate }: Props) => {
  const { pt } = usePageTranslations();
  const navigate = useNavigate();
  const order = FLOW.map((f) => f.code);
  const curIdx = current ? order.indexOf(current) : -1;
  const [selected, setSelected] = useState<string>(current || "SU");
  useEffect(() => { if (current) setSelected(current); }, [current]);

  const isActive = (code: string) => code === current;
  const statusOf = (code: string): Status => {
    if (isActive(code)) return "active";
    const i = order.indexOf(code);
    if (i >= 0 && curIdx >= 0 && i < curIdx) return "done";
    return "todo";
  };
  const pp = (code: string): ProcessProgress => progress[code] || { pct: 0, done: 0, total: 0, activities: [] };
  const barFor = (code: string) => STATUS_BAR[statusOf(code)];

  const sel = ALL[selected] || FLOW[0];
  const selPp = pp(selected);
  const selStatus = statusOf(selected);

  const openAcademy = (lesson?: string) => navigate(academyHref(lesson));

  // ── Stage node in the pipeline ────────────────────────────────────
  const Node = ({ def, sub = false }: { def: ProcDef; sub?: boolean }) => {
    const p = pp(def.code);
    const st = statusOf(def.code);
    const isSel = selected === def.code;
    return (
      <button
        type="button"
        onClick={() => setSelected(def.code)}
        className={[
          "group relative flex flex-col rounded-xl border bg-card text-left transition-all",
          sub ? "w-[200px] px-3 py-2.5" : "w-[176px] px-3 py-3",
          isSel
            ? "border-purple-500 ring-2 ring-purple-300/60 shadow-md"
            : st === "active"
              ? "border-purple-300 shadow-sm hover:border-purple-400"
              : st === "done"
                ? "border-green-200 hover:border-green-300"
                : "border-border hover:border-muted-foreground/40 hover:shadow-sm",
        ].join(" ")}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className={[
                "inline-flex h-6 min-w-[26px] items-center justify-center rounded-md px-1 text-xs font-bold",
                st === "done" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                  : st === "active" ? "bg-purple-600 text-white"
                  : "bg-muted text-muted-foreground",
              ].join(" ")}
            >
              {def.code}
            </span>
            {st === "active" && (
              <span className="rounded bg-purple-100 px-1 py-0.5 text-[8px] font-bold uppercase tracking-wide text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                {pt("now")}
              </span>
            )}
          </div>
          {st === "done"
            ? <CheckCircle2 className="h-4 w-4 text-green-500" />
            : <span className="text-[11px] font-semibold text-muted-foreground">{p.pct}%</span>}
        </div>
        <div className="mt-1.5 text-[11px] font-medium leading-tight text-foreground/90">{pt(def.label)}</div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
          <div className={`h-full rounded-full ${barFor(def.code)} transition-all`} style={{ width: `${p.pct}%` }} />
        </div>
      </button>
    );
  };

  const Connector = () => (
    <div className="flex shrink-0 items-center self-center px-0.5">
      <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* DP governance umbrella */}
      <button
        type="button"
        onClick={() => setSelected("DP")}
        className={[
          "flex w-full items-center gap-3 rounded-xl border px-4 py-2.5 text-left transition-all",
          selected === "DP"
            ? "border-purple-500 ring-2 ring-purple-300/60 bg-purple-50/70 dark:bg-purple-950/30"
            : "border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 dark:border-indigo-900/60 dark:from-indigo-950/30 dark:to-purple-950/30",
        ].join(" ")}
      >
        <Compass className="h-5 w-5 shrink-0 text-indigo-600" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">DP</span>
            <span className="truncate text-sm font-medium text-indigo-800 dark:text-indigo-200">{pt("Directing a Project")}</span>
            <span className="text-[10px] text-indigo-500/80">· {pt("Project Board governance")}</span>
          </div>
          <div className="mt-1 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-indigo-200/60 dark:bg-indigo-900/40">
            <div className="h-full rounded-full bg-indigo-500" style={{ width: `${pp("DP").pct}%` }} />
          </div>
        </div>
        <Badge variant="outline" className="shrink-0 border-indigo-300 text-indigo-700 dark:text-indigo-300">{pp("DP").pct}%</Badge>
      </button>

      {/* Stage pipeline SU → CP, with MP sub-lane under CS */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-start gap-1">
          {FLOW.map((f, i) => (
            <div key={f.code} className="flex shrink-0 flex-col items-center gap-1">
              <div className="flex items-start gap-1">
                <Node def={f} />
                {i < FLOW.length - 1 && <Connector />}
              </div>
              {/* MP hangs under CS */}
              {f.code === "CS" && (
                <div className="flex w-full flex-col items-center pt-1">
                  <div className="h-3 w-px bg-purple-300" />
                  <Node def={MP} sub />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Detail panel for the selected process */}
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="border-b bg-muted/30 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge className={selStatus === "done" ? "bg-green-600 text-white" : selStatus === "active" ? "bg-purple-600 text-white" : "bg-gray-500 text-white"}>{sel.code}</Badge>
              <h3 className="font-semibold">{pt(sel.label)}</h3>
              {selStatus === "active" && <Badge variant="outline" className="border-purple-300 text-purple-700">{pt("Current process")}</Badge>}
              {selStatus === "done" && <Badge variant="outline" className="border-green-300 text-green-700">{pt("Completed")}</Badge>}
            </div>
            <div className="flex min-w-[180px] items-center gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                <div className={`h-full rounded-full ${barFor(sel.code)}`} style={{ width: `${selPp.pct}%` }} />
              </div>
              <span className="w-16 text-right text-sm font-medium">{selPp.done}/{selPp.total} · {selPp.pct}%</span>
            </div>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{pt(sel.purpose)}</p>
          {/* Academy training link — connects the process to the PRINCE2 course */}
          <button
            type="button"
            onClick={() => openAcademy(sel.lesson)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1.5 text-xs font-medium text-purple-700 transition-colors hover:bg-purple-100 dark:border-purple-900/50 dark:bg-purple-950/30 dark:text-purple-300"
          >
            <GraduationCap className="h-3.5 w-3.5" />
            {pt("Learn this process in the Academy")}
            <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />
          </button>
        </div>

        <Tabs defaultValue="activities" className="p-4">
          <TabsList className="mb-3">
            <TabsTrigger value="activities" className="gap-1.5"><ListChecks className="h-3.5 w-3.5" /> {pt("Activities")}</TabsTrigger>
            <TabsTrigger value="products" className="gap-1.5"><Package className="h-3.5 w-3.5" /> {pt("Products")}</TabsTrigger>
          </TabsList>

          <TabsContent value="activities" className="mt-0">
            {selPp.activities.length === 0 ? (
              <div className="rounded-lg border border-dashed bg-muted/20 py-8 text-center">
                <ListChecks className="mx-auto h-6 w-6 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">{pt("No tracked activities for this process yet.")}</p>
              </div>
            ) : (
              <div className="space-y-1">
                {selPp.activities.map((a, i) => (
                  <div key={i} className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm ${a.done ? "bg-green-50/50 dark:bg-green-950/10" : "bg-muted/30"}`}>
                    {a.done ? <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" /> : <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />}
                    <span className={a.done ? "text-foreground" : "text-muted-foreground"}>{pt(a.label)}</span>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="products" className="mt-0">
            <p className="mb-2 text-[11px] text-muted-foreground">{pt("Management products & milestones delivered by this process — click to open.")}</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {sel.products.map((prod) => (
                <button
                  key={prod.slug}
                  type="button"
                  onClick={() => onNavigate?.(prod.slug)}
                  className="group flex items-center gap-2.5 rounded-lg border bg-card p-2.5 text-left transition-all hover:border-purple-300 hover:bg-purple-50/40 hover:shadow-sm dark:hover:bg-purple-950/20"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300">
                    <Package className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{pt(prod.name)}</span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-purple-600" />
                </button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Prince2ProcessFlow;
