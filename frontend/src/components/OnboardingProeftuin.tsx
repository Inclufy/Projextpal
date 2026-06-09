import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ArrowRight, Clock, Folder, Users, Sparkles } from "lucide-react";

type Step = { key: string; title: string; desc: string; url: string; done: boolean };
type Status = {
  is_trial: boolean; days_remaining: number | null;
  limits: { max_projects: number; max_programs: number; max_users: number };
  usage: { projects: number; programs: number; users: number };
  steps: Step[]; completed: number; total: number; percent: number; complete: boolean;
};

/**
 * Proeftuin banner (trial state + limits) + onboarding checklist.
 * Self-contained: fetches /auth/onboarding/status/, renders nothing until loaded
 * and hides entirely once the checklist is complete and the user is not on trial.
 */
const OnboardingProeftuin = () => {
  const [s, setS] = useState<Status | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    fetch(`/api/v1/auth/onboarding/status/`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => d && setS(d))
      .catch(() => {});
  }, []);

  if (!s || dismissed) return null;
  // Nothing to show: not a trial and onboarding already complete.
  if (!s.is_trial && s.complete) return null;

  const r = 26, c = 2 * Math.PI * r;

  return (
    <div className="mb-6 space-y-4">
      {/* Proeftuin banner */}
      {s.is_trial && (
        <div className="rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 to-fuchsia-50 px-5 py-4 flex flex-wrap items-center gap-4">
          <span className="text-[11px] font-extrabold uppercase tracking-wide text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 px-3 py-1.5 rounded-full">Proeftuin</span>
          <div className="flex-1 min-w-[200px]">
            <div className="text-sm font-semibold">Welkom in je proeftuin — verken ProjeXtPal vrijblijvend.</div>
            <div className="flex flex-wrap gap-4 mt-1 text-xs text-muted-foreground">
              {s.days_remaining != null && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Nog <b className="text-primary">{s.days_remaining} dagen</b></span>}
              <span className="flex items-center gap-1"><Folder className="h-3.5 w-3.5" /> <b className="text-primary">{s.usage.projects} / {s.limits.max_projects}</b> projecten</span>
              <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> <b className="text-primary">{s.usage.users} / {s.limits.max_users}</b> teamleden</span>
            </div>
          </div>
          <button onClick={() => navigate("/settings")} className="text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 px-4 py-2.5 rounded-lg shadow hover:brightness-105 transition">
            Upgrade &amp; behoud je werk →
          </button>
        </div>
      )}

      {/* Onboarding checklist */}
      {!s.complete && (
        <div className="rounded-2xl border bg-card shadow-sm p-5">
          <div className="flex items-start gap-5">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="font-bold">Aan de slag in {s.total} stappen</h3>
                <button onClick={() => setDismissed(true)} className="ml-auto text-xs text-muted-foreground hover:text-foreground">verbergen</button>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Leer ProjeXtPal kennen met je eerste echte project — de AI helpt je onderweg.</p>
              <div className="divide-y">
                {s.steps.map((step, i) => (
                  <div key={step.key} className="flex items-center gap-3 py-2.5">
                    <div className={`h-6 w-6 rounded-full grid place-items-center shrink-0 ${step.done ? "bg-green-500 text-white" : "border-2 border-muted text-muted-foreground"}`}>
                      {step.done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <span className="text-[11px] font-bold">{i + 1}</span>}
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${step.done ? "text-muted-foreground line-through" : ""}`}>{step.title}</div>
                      <div className="text-[11px] text-muted-foreground">{step.desc}</div>
                    </div>
                    {!step.done && (
                      <button onClick={() => navigate(step.url)} className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 whitespace-nowrap">
                        Open <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Progress ring */}
            <div className="hidden sm:flex flex-col items-center justify-center w-32 shrink-0">
              <div className="relative h-[72px] w-[72px]">
                <svg width="72" height="72" className="-rotate-90">
                  <circle cx="36" cy="36" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="7" />
                  <circle cx="36" cy="36" r={r} fill="none" stroke="hsl(var(--primary))" strokeWidth="7" strokeLinecap="round"
                    strokeDasharray={c} strokeDashoffset={c - (c * s.percent) / 100} className="transition-all" />
                </svg>
                <div className="absolute inset-0 grid place-items-center text-lg font-extrabold">{s.percent}%</div>
              </div>
              <div className="text-[11px] text-muted-foreground text-center mt-2"><b className="text-foreground">{s.completed} van {s.total}</b> klaar</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingProeftuin;
