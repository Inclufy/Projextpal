/**
 * Sprint 5 S5-04 — AI risk / dependency sniff button + preview dialog.
 *
 * Calls POST /risk-sniff/ and shows the LLM-suggested risks and
 * dependencies with per-row "Add" buttons. The caller handles the
 * actual create via ``onAddRisk`` / ``onAddDependency`` so this
 * component never touches the DB directly.
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Loader2, Plus, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface SuggestedRisk {
  name: string;
  description: string;
  category: string;
  impact: string;
  probability: number;
  mitigation_hint: string;
}

interface SuggestedDependency {
  name: string;
  description: string;
  blocking_milestone?: string;
}

interface SniffResponse {
  suggested: {
    suggested_risks: SuggestedRisk[];
    suggested_dependencies: SuggestedDependency[];
  };
  source: "ai" | "fallback";
  warnings?: string[];
}

export interface RiskSniffButtonProps {
  projectId: string | number;
  onAddRisk?: (risk: SuggestedRisk) => Promise<void>;
  onAddDependency?: (dep: SuggestedDependency) => Promise<void>;
  variant?: "risks" | "dependencies" | "both";
  buttonLabel?: string;
}

const RiskSniffButton: React.FC<RiskSniffButtonProps> = ({
  projectId, onAddRisk, onAddDependency, variant = "both", buttonLabel,
}) => {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SniffResponse | null>(null);
  const [adding, setAdding] = useState<string | null>(null);

  const isNl = language === "nl" || !language;
  const isFr = language === "fr";

  const fetchSniff = async () => {
    setLoading(true);
    setData(null);
    try {
      const token = localStorage.getItem("access_token");
      const r = await fetch(`/api/v1/projects/${projectId}/risk-sniff/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-UI-Language": language || "nl",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ language: language || "nl" }),
      });
      if (!r.ok) {
        toast.error(isFr ? "Analyse échouée" : isNl ? "AI-check mislukt" : "Risk sniff failed");
        return;
      }
      const payload: SniffResponse = await r.json();
      setData(payload);
    } catch {
      toast.error(isFr ? "Analyse échouée" : isNl ? "AI-check mislukt" : "Risk sniff failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    void fetchSniff();
  };

  const addRisk = async (r: SuggestedRisk) => {
    if (!onAddRisk) return;
    const key = `risk:${r.name}`;
    setAdding(key);
    try {
      await onAddRisk(r);
      toast.success(isNl ? "Risico toegevoegd" : "Risk added");
      setData((prev) => (prev
        ? {
          ...prev,
          suggested: {
            ...prev.suggested,
            suggested_risks: prev.suggested.suggested_risks.filter((x) => x.name !== r.name),
          },
        }
        : prev));
    } catch (e: any) {
      toast.error(e?.message || (isNl ? "Toevoegen mislukt" : "Add failed"));
    } finally {
      setAdding(null);
    }
  };

  const addDep = async (d: SuggestedDependency) => {
    if (!onAddDependency) return;
    const key = `dep:${d.name}`;
    setAdding(key);
    try {
      await onAddDependency(d);
      toast.success(isNl ? "Afhankelijkheid toegevoegd" : "Dependency added");
      setData((prev) => (prev
        ? {
          ...prev,
          suggested: {
            ...prev.suggested,
            suggested_dependencies: prev.suggested.suggested_dependencies.filter((x) => x.name !== d.name),
          },
        }
        : prev));
    } catch (e: any) {
      toast.error(e?.message || (isNl ? "Toevoegen mislukt" : "Add failed"));
    } finally {
      setAdding(null);
    }
  };

  const risks = data?.suggested?.suggested_risks || [];
  const deps = data?.suggested?.suggested_dependencies || [];
  const showRisks = variant !== "dependencies";
  const showDeps = variant !== "risks";

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 border-purple-300 text-purple-700 hover:bg-purple-50"
        onClick={handleOpen}
      >
        <Sparkles className="h-4 w-4" />
        {buttonLabel || (isFr ? "Vérification IA" : isNl ? "AI-check uit documenten" : "AI check from docs")}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              {isFr ? "Risques et dépendances détectés"
                : isNl ? "Gevonden risico's & afhankelijkheden"
                  : "Detected risks & dependencies"}
              {data?.source === "fallback" && (
                <Badge variant="outline" className="border-amber-400 text-amber-800 ml-2 text-[10px]">
                  {isFr ? "Déterministe" : isNl ? "Deterministisch, zonder AI-sleutel" : "Deterministic"}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {isFr
                ? "Non enregistrés automatiquement. Ajoutez ceux qui vous paraissent corrects."
                : isNl
                  ? "Niet automatisch opgeslagen. Voeg handmatig toe wat juist is."
                  : "Not auto-saved. Add the items that are correct."}
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-7 w-7 animate-spin text-purple-500" />
            </div>
          ) : !data ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              {isFr ? "Rien à afficher" : isNl ? "Niets om te tonen" : "Nothing to show"}
            </p>
          ) : (
            <div className="space-y-4">
              {(data.warnings || []).map((w, i) => (
                <Alert key={i} className="border-amber-300 bg-amber-50 dark:bg-amber-950/40">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-xs text-amber-700 dark:text-amber-200">{w}</AlertDescription>
                </Alert>
              ))}
              {showRisks && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">
                    {isFr ? "Risques suggérés" : isNl ? "Suggesties voor risico's" : "Suggested risks"} ({risks.length})
                  </h4>
                  <div className="space-y-2">
                    {risks.length === 0 && (
                      <p className="text-xs text-muted-foreground italic">
                        {isNl ? "Geen aanvullende risico's gevonden." : "No additional risks found."}
                      </p>
                    )}
                    {risks.map((r) => (
                      <div key={r.name} className="border rounded-md p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">{r.name}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="secondary" className="text-[10px]">{r.category}</Badge>
                              <Badge variant="secondary" className="text-[10px]">{r.impact}</Badge>
                              <Badge variant="secondary" className="text-[10px]">{r.probability}%</Badge>
                            </div>
                          </div>
                          {onAddRisk && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5"
                              disabled={adding !== null}
                              onClick={() => void addRisk(r)}
                            >
                              {adding === `risk:${r.name}` ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Plus className="h-3.5 w-3.5" />
                              )}
                              {isNl ? "Toevoegen" : "Add"}
                            </Button>
                          )}
                        </div>
                        {r.description && (
                          <p className="text-xs text-muted-foreground mt-2">{r.description}</p>
                        )}
                        {r.mitigation_hint && (
                          <p className="text-xs text-purple-700 dark:text-purple-300 mt-1 italic">
                            {isNl ? "Mitigatie: " : "Mitigation: "}{r.mitigation_hint}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {showDeps && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 mt-4">
                    {isFr ? "Dépendances suggérées" : isNl ? "Suggesties voor afhankelijkheden" : "Suggested dependencies"} ({deps.length})
                  </h4>
                  <div className="space-y-2">
                    {deps.length === 0 && (
                      <p className="text-xs text-muted-foreground italic">
                        {isNl ? "Geen aanvullende afhankelijkheden gevonden." : "No additional dependencies found."}
                      </p>
                    )}
                    {deps.map((d) => (
                      <div key={d.name} className="border rounded-md p-3 flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{d.name}</p>
                          {d.blocking_milestone && (
                            <Badge variant="outline" className="text-[10px] mt-1">
                              {d.blocking_milestone}
                            </Badge>
                          )}
                          {d.description && (
                            <p className="text-xs text-muted-foreground mt-1">{d.description}</p>
                          )}
                        </div>
                        {onAddDependency && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5"
                            disabled={adding !== null}
                            onClick={() => void addDep(d)}
                          >
                            {adding === `dep:${d.name}` ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Plus className="h-3.5 w-3.5" />
                            )}
                            {isNl ? "Toevoegen" : "Add"}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="gap-1.5">
              <X className="h-4 w-4" />
              {isNl ? "Sluiten" : "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RiskSniffButton;
