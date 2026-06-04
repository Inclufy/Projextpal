import { useState, useEffect } from "react";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, CheckCircle2, Circle, ArrowUpRight, ListChecks, Package } from "lucide-react";

type Activity = { label: string; done: boolean };
type ProcessProgress = { pct: number; done: number; total: number; activities: Activity[] };

interface ProcDef { code: string; label: string; purpose: string; products: { name: string; slug: string }[]; }

// PRINCE2 processes with purpose + the management products each one delivers.
const DP: ProcDef = {
  code: "DP", label: "Directing a Project",
  purpose: "The Project Board authorises initiation, each stage, exceptions and closure — directing by exception across the whole lifecycle.",
  products: [
    { name: "Project Board", slug: "project-board" },
    { name: "PID / Governance", slug: "governance" },
    { name: "Highlight Reports", slug: "highlight-report" },
    { name: "Exception Reports", slug: "exception-reports" },
  ],
};
const MP: ProcDef = {
  code: "MP", label: "Managing Product Delivery",
  purpose: "The Team Manager accepts, executes and delivers Work Packages, keeping the products' quality under control.",
  products: [
    { name: "Work Packages", slug: "work-packages" },
    { name: "Quality Register", slug: "quality-register" },
    { name: "Product Status", slug: "product-status" },
  ],
};
const FLOW: ProcDef[] = [
  { code: "SU", label: "Starting Up a Project",
    purpose: "Confirm the project is worthwhile and viable before committing resources. Produces the Project Brief and outline Business Case.",
    products: [
      { name: "Project Brief", slug: "project-brief" },
      { name: "Outline Business Case", slug: "business-case" },
      { name: "Initiation Stage Plan", slug: "stage-plan" },
      { name: "Daily Log", slug: "daily-log" },
    ] },
  { code: "IP", label: "Initiating a Project",
    purpose: "Establish solid foundations: baseline the PID, define the four Management Approaches and the Project Plan.",
    products: [
      { name: "PID", slug: "governance" },
      { name: "Management Approaches", slug: "management-approaches" },
      { name: "Business Case", slug: "business-case" },
      { name: "Planning", slug: "planning" },
    ] },
  { code: "CS", label: "Controlling a Stage",
    purpose: "Day-to-day management within stage tolerances: authorise work, monitor, capture risks & issues, report progress.",
    products: [
      { name: "Work Packages", slug: "work-packages" },
      { name: "Highlight Reports", slug: "highlight-report" },
      { name: "Risk Register", slug: "risks" },
      { name: "Issue Register", slug: "issues" },
      { name: "Tolerances", slug: "tolerances" },
    ] },
  { code: "SB", label: "Managing a Stage Boundary",
    purpose: "Give the Board the information to approve the next stage (or an Exception Plan) and confirm the Business Case still holds.",
    products: [
      { name: "Stage Plan", slug: "stage-plan" },
      { name: "Stage Gates", slug: "stage-gates" },
      { name: "Exception Plans", slug: "exception-plan" },
      { name: "Product Status", slug: "product-status" },
    ] },
  { code: "CP", label: "Closing a Project",
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

const pctColor = (pct: number) => (pct >= 100 ? "bg-green-500" : pct >= 50 ? "bg-blue-500" : pct > 0 ? "bg-amber-500" : "bg-gray-300");

const MiniBar = ({ pct }: { pct: number }) => (
  <div className="h-1 w-full rounded-full bg-black/10 overflow-hidden mt-1.5">
    <div className={`h-full rounded-full ${pctColor(pct)}`} style={{ width: `${pct}%` }} />
  </div>
);

const Prince2ProcessFlow = ({ current, progress = {}, onNavigate }: Props) => {
  const { pt } = usePageTranslations();
  const order = FLOW.map((f) => f.code);
  const curIdx = current ? order.indexOf(current) : -1;
  const [selected, setSelected] = useState<string>(current || "SU");
  useEffect(() => { if (current) setSelected(current); }, [current]);

  const isActive = (code: string) => code === current;
  const isDone = (code: string) => curIdx >= 0 && order.indexOf(code) >= 0 && order.indexOf(code) < curIdx;
  const pp = (code: string): ProcessProgress => progress[code] || { pct: 0, done: 0, total: 0, activities: [] };

  const boxCls = (code: string) => {
    const sel = selected === code;
    if (sel) return "border-purple-500 ring-2 ring-purple-300 bg-purple-50 shadow-sm";
    if (isActive(code)) return "border-purple-400 bg-purple-50/60";
    if (isDone(code)) return "border-green-300 bg-green-50/40";
    return "border-border bg-muted/30 hover:bg-muted/60";
  };

  const sel = ALL[selected] || FLOW[0];
  const selPp = pp(selected);

  const Box = ({ def, w = "min-w-[120px]" }: { def: ProcDef; w?: string }) => {
    const p = pp(def.code);
    return (
      <button type="button" onClick={() => setSelected(def.code)} className={`rounded-lg border px-3 py-2 text-center transition-colors ${w} ${boxCls(def.code)}`}>
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-sm font-bold">{def.code}</span>
          {isActive(def.code) && <span className="text-[8px] font-semibold uppercase bg-purple-600 text-white rounded px-1 py-0.5">{pt("now")}</span>}
        </div>
        <div className="text-[10px] leading-tight mt-0.5 text-muted-foreground">{pt(def.label)}</div>
        <MiniBar pct={p.pct} />
        <div className="text-[9px] text-muted-foreground mt-0.5">{p.pct}%</div>
      </button>
    );
  };

  return (
    <div className="space-y-4">
      {/* DP governance band */}
      <button type="button" onClick={() => setSelected("DP")} className={`w-full rounded-lg border px-4 py-2.5 text-center transition-colors ${selected === "DP" ? "border-purple-500 ring-2 ring-purple-300 bg-purple-50" : isActive("DP") ? "border-purple-400 bg-purple-50/60" : "border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100/60"}`}>
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs font-bold text-indigo-700">DP</span>
          <span className="text-sm text-indigo-700">{pt("Directing a Project")}</span>
          <Badge variant="outline" className="text-[10px]">{pp("DP").pct}%</Badge>
        </div>
        <div className="max-w-md mx-auto"><MiniBar pct={pp("DP").pct} /></div>
      </button>

      {/* Lifeline SU → CP */}
      <div className="flex items-stretch gap-1 overflow-x-auto pb-1">
        {FLOW.map((f, i) => (
          <div key={f.code} className="flex items-stretch gap-1 shrink-0">
            <Box def={f} />
            {i < FLOW.length - 1 && <div className="flex items-center"><ChevronRight className="h-4 w-4 text-muted-foreground" /></div>}
          </div>
        ))}
      </div>

      {/* MP under CS */}
      <div className="flex gap-1">
        <div className="min-w-[120px]" /><div className="w-4" /><div className="min-w-[120px]" /><div className="w-4" />
        <Box def={MP} w="min-w-[160px]" />
      </div>

      {/* Expandable detail panel for the selected process */}
      <div className="rounded-lg border bg-card overflow-hidden transition-all">
        <div className="p-4 border-b bg-muted/30">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-600 text-white">{sel.code}</Badge>
              <h3 className="font-semibold">{pt(sel.label)}</h3>
              {isActive(sel.code) && <Badge variant="outline" className="text-purple-700 border-purple-300">{pt("Current process")}</Badge>}
            </div>
            <div className="flex items-center gap-2 min-w-[180px]">
              <div className="flex-1 h-2 rounded-full bg-black/10 overflow-hidden"><div className={`h-full rounded-full ${pctColor(selPp.pct)}`} style={{ width: `${selPp.pct}%` }} /></div>
              <span className="text-sm font-medium w-16 text-right">{selPp.done}/{selPp.total} · {selPp.pct}%</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{pt(sel.purpose)}</p>
        </div>

        <Tabs defaultValue="activities" className="p-4">
          <TabsList className="mb-3">
            <TabsTrigger value="activities" className="gap-1.5"><ListChecks className="h-3.5 w-3.5" /> {pt("Activities")}</TabsTrigger>
            <TabsTrigger value="products" className="gap-1.5"><Package className="h-3.5 w-3.5" /> {pt("Products")}</TabsTrigger>
          </TabsList>

          <TabsContent value="activities" className="mt-0">
            {selPp.activities.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">{pt("No tracked activities for this process.")}</p>
            ) : (
              <div className="space-y-1.5">
                {selPp.activities.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {a.done ? <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" /> : <Circle className="h-4 w-4 text-muted-foreground shrink-0" />}
                    <span className={a.done ? "" : "text-muted-foreground"}>{pt(a.label)}</span>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="products" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sel.products.map((prod) => (
                <button key={prod.slug} type="button" onClick={() => onNavigate?.(prod.slug)} className="flex items-center justify-between p-2.5 border rounded-md hover:bg-muted/50 text-left transition-colors group">
                  <span className="text-sm font-medium">{pt(prod.name)}</span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
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
