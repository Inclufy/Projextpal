import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ProjectHeader } from "@/components/ProjectHeader";
import { Loader2, Sparkles, Save, Wand2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

type Gov = {
  gov_authority: "owner" | "owner_pm";
  gov_board: "auto" | "light" | "formal";
  gov_portfolio: boolean;
  gov_stakeholder_matrix: boolean;
  gov_periodic_cadence: boolean;
};
type Tailoring = Gov & {
  project_type: string;
  dim_scope: number; dim_budget: number; dim_duur: number;
  dim_politiek: number; dim_risico: number; dim_regel: number;
  team_size: string; departments: number;
  shape: string; score: number; recommended_modules: string[];
  more?: string[]; methodology?: string; ai_rationale: string; source: string;
};

const DIMS: { k: keyof Tailoring; label: string }[] = [
  { k: "dim_scope", label: "Scope / omvang" },
  { k: "dim_budget", label: "Budget" },
  { k: "dim_duur", label: "Doorlooptijd" },
  { k: "dim_politiek", label: "Politieke gevoeligheid" },
  { k: "dim_risico", label: "Risico / onzekerheid" },
  { k: "dim_regel", label: "Regelgeving" },
];
const SEG = ["Laag", "Midden", "Hoog"];
const shapeColor: Record<string, string> = {
  light: "from-green-500 to-green-600",
  medium: "from-amber-500 to-amber-600",
  heavy: "from-red-500 to-red-600",
};

const ProjectTailoring = () => {
  const { id } = useParams<{ id: string }>();
  const [t, setT] = useState<Tailoring | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [desc, setDesc] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  const token = localStorage.getItem("access_token");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const load = async () => {
    try {
      const r = await fetch(`/api/v1/projects/${id}/tailoring/`, { headers });
      if (r.ok) setT(await r.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [id]);

  const set = (patch: Partial<Tailoring>) => setT((prev) => prev ? { ...prev, ...patch } : prev);

  const analyze = async () => {
    if (!desc.trim()) return;
    setAnalyzing(true);
    try {
      const res = await fetch(`/api/v1/projects/intake/analyze/`, {
        method: "POST", headers, body: JSON.stringify({ description: desc }),
      });
      const d = await res.json();
      if (res.ok && d.dimensions) {
        set({
          project_type: d.project_type,
          dim_scope: d.dimensions.scope, dim_budget: d.dimensions.budget, dim_duur: d.dimensions.duur,
          dim_politiek: d.dimensions.politiek, dim_risico: d.dimensions.risico, dim_regel: d.dimensions.regel,
          ai_rationale: d.rationale, source: "ai",
        });
        toast.success(`AI: ${d.methodology} · ${d.preview?.shape || ""}`);
      }
    } catch { toast.error("Analyse mislukt"); }
    finally { setAnalyzing(false); }
  };

  const save = async () => {
    if (!t) return;
    setSaving(true);
    try {
      const r = await fetch(`/api/v1/projects/${id}/tailoring/`, {
        method: "PUT", headers, body: JSON.stringify(t),
      });
      if (r.ok) { const d = await r.json(); setT(d); toast.success(`Opgeslagen — vorm: ${d.shape}`); }
      else toast.error("Opslaan mislukt");
    } catch { toast.error("Opslaan mislukt"); }
    finally { setSaving(false); }
  };

  if (loading || !t) return (
    <div className="min-h-full bg-background"><ProjectHeader />
      <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
    </div>
  );

  const Seg = ({ value, onChange, options }: { value: any; onChange: (v: any) => void; options: { v: any; label: string }[] }) => (
    <div className="flex bg-muted rounded-lg p-1 gap-1">
      {options.map((o) => (
        <button key={String(o.v)} onClick={() => onChange(o.v)}
          className={`flex-1 py-2 px-2 rounded-md text-xs font-semibold transition ${value === o.v ? "bg-background text-primary shadow-sm" : "text-muted-foreground"}`}>
          {o.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6 max-w-5xl">
        <div className="flex items-center gap-3">
          <Wand2 className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Project-tailoring</h1>
            <p className="text-sm text-muted-foreground">Bepaal de juiste hoeveelheid governance — niets wordt verborgen.</p>
          </div>
          <Button onClick={save} disabled={saving} className="ml-auto gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Opslaan &amp; herbereken
          </Button>
        </div>

        {/* AI intake */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Beschrijf het project (AI vult de dimensies)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <textarea className="w-full min-h-[70px] px-3 py-2 border rounded-md bg-background resize-y text-sm"
              placeholder="Bijv. Nieuw zorg-cliëntsysteem met patiëntdata, AVG en audit, directie kijkt mee."
              value={desc} onChange={(e) => setDesc(e.target.value)} />
            <Button variant="outline" onClick={analyze} disabled={analyzing} className="gap-2">
              {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Analyseer met AI
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dimensions + facts */}
          <Card>
            <CardHeader><CardTitle className="text-base">Dimensies &amp; feiten</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-xs">Teamgrootte</Label>
                  <Seg value={t.team_size} onChange={(v) => set({ team_size: v })} options={[{ v: "s", label: "1–3" }, { v: "m", label: "4–9" }, { v: "l", label: "10+" }]} /></div>
                <div className="space-y-1.5"><Label className="text-xs">Afdelingen</Label>
                  <Seg value={t.departments} onChange={(v) => set({ departments: v })} options={[{ v: 1, label: "1" }, { v: 2, label: "2–3" }, { v: 4, label: "4+" }]} /></div>
              </div>
              {DIMS.map((d) => (
                <div key={d.k} className="space-y-1.5">
                  <Label className="text-xs">{d.label}</Label>
                  <Seg value={t[d.k]} onChange={(v) => set({ [d.k]: v } as any)} options={[1, 2, 3].map((v) => ({ v, label: SEG[v - 1] }))} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Governance */}
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Governance</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5"><Label className="text-xs">Wie autoriseert beslissingen?</Label>
                <Seg value={t.gov_authority} onChange={(v) => set({ gov_authority: v })} options={[{ v: "owner", label: "Eigenaar/board" }, { v: "owner_pm", label: "Eigenaar + PM" }]} />
                <p className="text-[11px] text-muted-foreground">{t.gov_authority === "owner" ? "Strikte functiescheiding (PRINCE2)." : "Soepel: de PM mag óók goedkeuren."}</p>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Formele board / stuurgroep?</Label>
                <Seg value={t.gov_board} onChange={(v) => set({ gov_board: v })} options={[{ v: "auto", label: "AI bepaalt" }, { v: "light", label: "Licht" }, { v: "formal", label: "Formeel" }]} /></div>
              <div className="space-y-2 pt-1">
                {[
                  { k: "gov_portfolio", label: "Onderdeel van een portfolio (oversight + funding)" },
                  { k: "gov_stakeholder_matrix", label: "Stakeholder-machtskaart (power/interest)" },
                  { k: "gov_periodic_cadence", label: "Periodieke board-vergaderingen + besluitenlog" },
                ].map((g) => (
                  <label key={g.k} className="flex items-center gap-2.5 text-sm cursor-pointer">
                    <input type="checkbox" checked={(t as any)[g.k]} onChange={(e) => set({ [g.k]: e.target.checked } as any)} className="accent-primary h-4 w-4" />
                    {g.label}
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Result */}
        <Card>
          <CardHeader><CardTitle className="text-base">Voorgestelde inrichting</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`rounded-xl p-4 text-white bg-gradient-to-br ${shapeColor[t.shape] || shapeColor.medium}`}>
                <div className="text-[11px] uppercase tracking-wide opacity-85 font-bold">Projectvorm</div>
                <div className="text-2xl font-extrabold capitalize">{t.shape}</div>
                <div className="text-xs opacity-90">Score {t.score}/18 · methodiek {t.methodology}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-bold mb-2">Aanbevolen tabs</div>
                <div className="flex flex-wrap gap-1.5">
                  {(t.recommended_modules || []).map((m) => <Badge key={m} className="bg-primary/10 text-primary border-primary/20" variant="outline">{m}</Badge>)}
                </div>
                {t.more && t.more.length > 0 && (
                  <>
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-bold mt-3 mb-2">Meer (optioneel — één klik weg)</div>
                    <div className="flex flex-wrap gap-1.5">
                      {t.more.map((m) => <Badge key={m} variant="outline" className="text-muted-foreground">{m}</Badge>)}
                    </div>
                  </>
                )}
              </div>
            </div>
            {t.ai_rationale && (
              <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                <span className="font-semibold text-foreground">Onderbouwing (PID): </span>{t.ai_rationale}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectTailoring;
