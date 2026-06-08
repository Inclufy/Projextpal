import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, X, Rocket } from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";

const DISMISS_KEY = "pxp_onboarding_dismissed";
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("access_token")}` });

interface Step { key: string; label: string; done: boolean; cta: string; to: string }

/** First-run getting-started checklist. Self-detects progress from the user's
 *  data, shows the next concrete step, and disappears once everything is done
 *  or the user dismisses it (persisted in localStorage). */
export default function OnboardingChecklist() {
  const { pt } = usePageTranslations();
  const navigate = useNavigate();
  const [steps, setSteps] = useState<Step[] | null>(null);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === "1");

  useEffect(() => {
    if (dismissed) return;
    let alive = true;
    (async () => {
      try {
        const [pr, tk, tm] = await Promise.all([
          fetch("/api/v1/projects/", { headers: authHeaders() }),
          fetch("/api/v1/projects/tasks/", { headers: authHeaders() }),
          fetch("/api/v1/auth/company-users/members/", { headers: authHeaders() }),
        ]);
        const arr = async (r: Response) => { try { const d = await r.json(); return Array.isArray(d) ? d : d.results || []; } catch { return []; } };
        const projects = pr.ok ? await arr(pr) : [];
        const tasks = tk.ok ? await arr(tk) : [];
        const members = tm.ok ? await arr(tm) : [];
        const firstId = projects[0]?.id;
        if (!alive) return;
        setSteps([
          { key: "project", label: pt("Create your first project"), done: projects.length > 0, cta: pt("New project"), to: "/projects" },
          { key: "team", label: pt("Invite your team"), done: members.length > 1, cta: pt("Add people"), to: "/team" },
          { key: "task", label: pt("Add your first task or action"), done: tasks.length > 0, cta: pt("Add a task"), to: firstId ? `/projects/${firstId}/planning/tasks` : "/projects" },
          { key: "explore", label: pt("Explore the Academy"), done: false, cta: pt("Open Academy"), to: "/academy" },
        ]);
      } catch { /* ignore */ }
    })();
    return () => { alive = false; };
  }, [dismissed, pt]);

  if (dismissed || !steps) return null;
  const realSteps = steps.filter((s) => s.key !== "explore");
  const doneCount = realSteps.filter((s) => s.done).length;
  if (doneCount >= realSteps.length) return null; // fully onboarded → hide

  const next = steps.find((s) => !s.done);
  const dismiss = () => { localStorage.setItem(DISMISS_KEY, "1"); setDismissed(true); };

  return (
    <Card className="relative overflow-hidden border-purple-200/60 bg-gradient-to-br from-purple-50/70 to-fuchsia-50/40 dark:from-purple-900/20 dark:to-fuchsia-900/10 p-5">
      <button onClick={dismiss} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground" title={pt("Dismiss")}>
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-center gap-2 mb-1">
        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center">
          <Rocket className="h-4 w-4 text-white" />
        </div>
        <h3 className="text-base font-semibold">{pt("Getting started")}</h3>
        <span className="text-xs text-muted-foreground ml-1">{doneCount}/{realSteps.length}</span>
      </div>

      <div className="h-1.5 bg-purple-100 dark:bg-purple-900/40 rounded-full overflow-hidden my-3">
        <div className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 transition-all" style={{ width: `${(doneCount / realSteps.length) * 100}%` }} />
      </div>

      <div className="space-y-1.5">
        {steps.map((s) => (
          <div key={s.key} className="flex items-center gap-2.5">
            {s.done ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /> : <Circle className="h-4 w-4 text-muted-foreground shrink-0" />}
            <span className={`text-sm flex-1 ${s.done ? "text-muted-foreground line-through" : ""}`}>{s.label}</span>
            {!s.done && next?.key === s.key && (
              <Button size="sm" className="h-7" onClick={() => navigate(s.to)}>{s.cta}</Button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
