import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ArrowRight, Clock, Folder, Users, Sparkles } from "lucide-react";

type Step = { key: string; title: string; desc: string; url: string; done: boolean };
type Status = {
  is_trial: boolean; days_remaining: number | null;
  limits: { max_projects: number; max_programs: number; max_users: number };
  usage: { projects: number; programs: number; users: number };
  steps: Step[]; completed: number; total: number; percent: number; complete: boolean;
  has_sample: boolean; experience?: string; intro?: string; skippable?: boolean;
};

const LEVELS: { v: string; label: string }[] = [
  { v: "beginner", label: "Beginner" },
  { v: "gevorderd", label: "Medior" },
  { v: "pro", label: "Professional" },
];

/**
 * Proeftuin banner (trial state + limits) + onboarding checklist.
 * Self-contained: fetches /auth/onboarding/status/, renders nothing until loaded
 * and hides entirely once the checklist is complete and the user is not on trial.
 */
const OnboardingProeftuin = () => {
  const [s, setS] = useState<Status | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("access_token");
  const refresh = () =>
    fetch(`/api/v1/auth/onboarding/status/`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => d && setS(d))
      .catch(() => {});

  useEffect(() => { refresh(); }, []);

  const seed = async () => {
    setSeeding(true);
    try {
      await fetch(`/api/v1/auth/onboarding/start-proeftuin/`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` },
      });
      await refresh();
    } catch { /* ignore */ }
    finally { setSeeding(false); }
  };

  const setLevel = async (v: string) => {
    setS((prev) => prev ? { ...prev, experience: v } : prev);   // optimistic
    try {
      await fetch(`/api/v1/projects/methodology-profile/`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ pm_experience: v }),
      });
      await refresh();   // checklist length + copy adapt to the level
    } catch { /* ignore */ }
  };

  const reset = async () => {
    if (!window.confirm("De voorbeeldprojecten verwijderen? Je eigen projecten blijven staan.")) return;
    setSeeding(true);
    try {
      await fetch(`/api/v1/auth/onboarding/reset-proeftuin/`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` },
      });
      await refresh();
    } catch { /* ignore */ }
    finally { setSeeding(false); }
  };

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
              <span className="flex items-center gap-1"><Folder className="h-3.5 w-3.5" /> <b className="text-primary">{s.usage.projects}{s.limits.max_projects >= 0 ? ` / ${s.limits.max_projects}` : ""}</b> projecten{s.limits.max_projects < 0 ? " · onbeperkt" : ""}</span>
              <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> <b className="text-primary">{s.usage.users}{s.limits.max_users >= 0 ? ` / ${s.limits.max_users}` : ""}</b> teamleden</span>
            </div>
          </div>
          {s.has_sample && (
            <button onClick={reset} disabled={seeding} className="text-xs font-semibold text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-2 disabled:opacity-50">
              Reset demo
            </button>
          )}
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
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="font-bold">Aan de slag in {s.total} stappen</h3>
                {/* Experience-level selector — adapts the checklist depth */}
                <div className="flex bg-muted rounded-lg p-0.5 gap-0.5 ml-1">
                  {LEVELS.map((l) => (
                    <button key={l.v} onClick={() => setLevel(l.v)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                        (s.experience || "gevorderd") === l.v ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                      {l.label}
                    </button>
                  ))}
                </div>
                <button onClick={() => setDismissed(true)} className="ml-auto text-xs text-muted-foreground hover:text-foreground">
                  {s.skippable ? "overslaan" : "verbergen"}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{s.intro || "Leer ProjeXtPal kennen met je eerste echte project — de AI helpt je onderweg."}</p>
              {!s.has_sample && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 mb-3 flex items-center gap-3">
                  <Sparkles className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex-1 text-xs">Geen zin in een leeg scherm? Laat ons <b>2 voorbeeldprojecten</b> klaarzetten om mee te oefenen.</div>
                  <button onClick={seed} disabled={seeding}
                    className="text-xs font-semibold text-white bg-primary px-3 py-1.5 rounded-md hover:brightness-110 transition disabled:opacity-50 whitespace-nowrap">
                    {seeding ? "Bezig…" : "Vul met voorbeelden"}
                  </button>
                </div>
              )}
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
