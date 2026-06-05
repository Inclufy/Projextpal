// ============================================================
// MethodologyFlow — reusable, data-driven process/phase stepper.
// A generic version of Prince2ProcessFlow: a horizontal pipeline of
// clickable phase cards, each with a per-phase progress bar coloured by
// status (done / active / todo), connectors, a "now" badge on the active
// step, and a detail panel for the selected step (purpose, progress, and
// quick-links into that phase's tabs). Used to give every methodology
// dashboard the same intuitive, interactive feel as PRINCE2.
// ============================================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { ChevronRight, CheckCircle2, Circle, ArrowUpRight, GraduationCap } from "lucide-react";

export type FlowStatus = "done" | "active" | "todo";

export interface FlowStep {
  /** Short code shown in the node badge, e.g. "D", "REQ", "S3". */
  code: string;
  label: string;
  /** One-line description of what this phase/process is for. */
  purpose?: string;
  /** 0–100. */
  progress: number;
  status: FlowStatus;
  /** Optional small caption under the node, e.g. "12 tasks" or "WIP 3/5". */
  meta?: string;
  /** Quick-links surfaced in the detail panel; slug is passed to onNavigate. */
  links?: { label: string; slug: string }[];
  /** Academy deep-link that teaches this phase/step, e.g. "/academy/course/scrum-master".
   *  When set, a "Learn this in the Academy" link is shown in the detail panel
   *  (mirrors the per-process Academy link on the PRINCE2 process flow). */
  academyHref?: string;
}

export type FlowAccent =
  | "blue" | "violet" | "emerald" | "cyan" | "pink" | "green" | "slate" | "purple";

// Full Tailwind class strings (must be literal so they are not purged).
const ACCENT: Record<FlowAccent, {
  bar: string; selBorder: string; selRing: string; codeBadge: string; chip: string;
}> = {
  blue:    { bar: "bg-blue-500",    selBorder: "border-blue-500",    selRing: "ring-blue-300/60",    codeBadge: "bg-blue-600 text-white",    chip: "border-blue-300 text-blue-700 dark:text-blue-300" },
  violet:  { bar: "bg-violet-500",  selBorder: "border-violet-500",  selRing: "ring-violet-300/60",  codeBadge: "bg-violet-600 text-white",  chip: "border-violet-300 text-violet-700 dark:text-violet-300" },
  emerald: { bar: "bg-emerald-500", selBorder: "border-emerald-500", selRing: "ring-emerald-300/60", codeBadge: "bg-emerald-600 text-white", chip: "border-emerald-300 text-emerald-700 dark:text-emerald-300" },
  cyan:    { bar: "bg-cyan-500",    selBorder: "border-cyan-500",    selRing: "ring-cyan-300/60",    codeBadge: "bg-cyan-600 text-white",    chip: "border-cyan-300 text-cyan-700 dark:text-cyan-300" },
  pink:    { bar: "bg-pink-500",    selBorder: "border-pink-500",    selRing: "ring-pink-300/60",    codeBadge: "bg-pink-600 text-white",    chip: "border-pink-300 text-pink-700 dark:text-pink-300" },
  green:   { bar: "bg-green-500",   selBorder: "border-green-500",   selRing: "ring-green-300/60",   codeBadge: "bg-green-600 text-white",   chip: "border-green-300 text-green-700 dark:text-green-300" },
  slate:   { bar: "bg-slate-600",   selBorder: "border-slate-600",   selRing: "ring-slate-300/60",   codeBadge: "bg-slate-700 text-white",   chip: "border-slate-300 text-slate-700 dark:text-slate-300" },
  purple:  { bar: "bg-purple-500",  selBorder: "border-purple-500",  selRing: "ring-purple-300/60",  codeBadge: "bg-purple-600 text-white",  chip: "border-purple-300 text-purple-700 dark:text-purple-300" },
};

interface Props {
  steps: FlowStep[];
  accent?: FlowAccent;
  /** Called with a step link slug when the user clicks a quick-link. */
  onNavigate?: (slug: string) => void;
  /** Minimum pixel width of the pipeline before it scrolls horizontally. */
  minWidth?: number;
}

const MethodologyFlow = ({ steps, accent = "blue", onNavigate, minWidth = 720 }: Props) => {
  const { pt } = usePageTranslations();
  const navigate = useNavigate();
  const a = ACCENT[accent];

  // Default the detail panel to the active step (or the first one).
  const activeCode = steps.find((s) => s.status === "active")?.code;
  const [selected, setSelected] = useState<string>(activeCode || steps[0]?.code || "");
  useEffect(() => {
    if (activeCode) setSelected(activeCode);
    else if (steps.length && !steps.some((s) => s.code === selected)) setSelected(steps[0].code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCode, steps.length]);

  if (!steps.length) return null;

  const barFor = (st: FlowStatus) =>
    st === "done" ? "bg-emerald-500" : st === "active" ? a.bar : "bg-gray-300 dark:bg-gray-600";

  const sel = steps.find((s) => s.code === selected) || steps[0];

  const Node = ({ step }: { step: FlowStep }) => {
    const isSel = step.code === selected;
    const pct = Math.max(0, Math.min(100, Math.round(step.progress || 0)));
    return (
      <button
        type="button"
        onClick={() => setSelected(step.code)}
        className={[
          "group relative flex w-full flex-col rounded-xl border bg-card px-3 py-3 text-left transition-all",
          isSel
            ? `${a.selBorder} ring-2 ${a.selRing} shadow-md`
            : step.status === "active"
              ? `${a.selBorder} shadow-sm`
              : step.status === "done"
                ? "border-emerald-200 hover:border-emerald-300"
                : "border-border hover:border-muted-foreground/40 hover:shadow-sm",
        ].join(" ")}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className={[
                "inline-flex h-6 min-w-[26px] items-center justify-center rounded-md px-1 text-xs font-bold",
                step.status === "done"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                  : step.status === "active"
                    ? a.codeBadge
                    : "bg-muted text-muted-foreground",
              ].join(" ")}
            >
              {step.code}
            </span>
            {step.status === "active" && (
              <span className="rounded bg-muted px-1 py-0.5 text-[8px] font-bold uppercase tracking-wide text-foreground/70">
                {pt("now")}
              </span>
            )}
          </div>
          {step.status === "done"
            ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            : <span className="text-[11px] font-semibold text-muted-foreground">{pct}%</span>}
        </div>
        <div className="mt-1.5 text-[11px] font-medium leading-tight text-foreground/90">{pt(step.label)}</div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
          <div className={`h-full rounded-full ${barFor(step.status)} transition-all`} style={{ width: `${pct}%` }} />
        </div>
        {step.meta && <div className="mt-1 text-[10px] text-muted-foreground">{step.meta}</div>}
      </button>
    );
  };

  const selPct = Math.max(0, Math.min(100, Math.round(sel.progress || 0)));

  return (
    <div className="space-y-4">
      {/* Pipeline */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-stretch gap-1" style={{ minWidth }}>
          {steps.map((s, i) => (
            <div key={s.code} className="flex flex-1 items-stretch gap-1">
              <div className="flex-1">
                <Node step={s} />
              </div>
              {i < steps.length - 1 && (
                <div className="flex shrink-0 items-center self-center px-0.5">
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="border-b bg-muted/30 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge className={sel.status === "done" ? "bg-emerald-600 text-white" : sel.status === "active" ? a.codeBadge : "bg-gray-500 text-white"}>{sel.code}</Badge>
              <h3 className="font-semibold">{pt(sel.label)}</h3>
              {sel.status === "active" && <Badge variant="outline" className={a.chip}>{pt("In progress")}</Badge>}
              {sel.status === "done" && <Badge variant="outline" className="border-emerald-300 text-emerald-700">{pt("Completed")}</Badge>}
              {sel.status === "todo" && <Badge variant="outline">{pt("Not started")}</Badge>}
            </div>
            <div className="flex min-w-[180px] items-center gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                <div className={`h-full rounded-full ${barFor(sel.status)}`} style={{ width: `${selPct}%` }} />
              </div>
              <span className="w-10 text-right text-sm font-medium">{selPct}%</span>
            </div>
          </div>
          {sel.purpose && <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{pt(sel.purpose)}</p>}
          {sel.meta && <p className="mt-1 text-[11px] font-medium text-foreground/70">{sel.meta}</p>}
        </div>

        <div className="p-4">
          {sel.academyHref && (
            <button
              type="button"
              onClick={() => navigate(sel.academyHref!)}
              className={`mb-3 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all hover:bg-muted/40 hover:shadow-sm ${a.chip}`}
              title={pt("Open the matching Academy training for this step")}
            >
              <GraduationCap className="h-4 w-4" />
              {pt("Learn this in the Academy")}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          )}
          {sel.links && sel.links.length > 0 ? (
            <>
              <p className="mb-2 text-[11px] text-muted-foreground">{pt("Open the tabs that drive this phase:")}</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {sel.links.map((link) => (
                  <button
                    key={link.slug}
                    type="button"
                    onClick={() => onNavigate?.(link.slug)}
                    className="group flex items-center gap-2.5 rounded-lg border bg-card p-2.5 text-left transition-all hover:border-muted-foreground/40 hover:bg-muted/40 hover:shadow-sm"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{pt(link.label)}</span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2.5 rounded-lg bg-muted/30 px-2.5 py-3 text-sm text-muted-foreground">
              <Circle className="h-4 w-4 shrink-0" />
              {pt("No linked tabs for this phase yet.")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MethodologyFlow;
