/**
 * Sprint 5 S5-09 — Meeting agenda AI-draft button + preview dialog.
 *
 * Calls POST /meetings/auto-draft-agenda/, lets the user review the
 * generated items, and on Apply hands the final (user-edited) agenda to
 * the caller. The caller decides whether to persist via Meeting.create
 * or save as draft agenda_items on an existing meeting.
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Check, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface AgendaItem {
  title: string;
  duration_min: number;
  discussion_points: string[];
  required_decisions: string[];
}

interface AgendaResponse {
  suggested: { agenda_items: AgendaItem[] };
  source: "ai" | "fallback";
  warnings?: string[];
}

export interface MeetingAgendaAiDraftButtonProps {
  projectId: string | number;
  onApply: (items: AgendaItem[]) => Promise<void>;
}

const MeetingAgendaAiDraftButton: React.FC<MeetingAgendaAiDraftButtonProps> = ({
  projectId, onApply,
}) => {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [data, setData] = useState<AgendaResponse | null>(null);
  const [items, setItems] = useState<AgendaItem[]>([]);

  const isNl = language === "nl" || !language;
  const isFr = language === "fr";

  const fetchDraft = async () => {
    setLoading(true);
    setData(null);
    try {
      const token = localStorage.getItem("access_token");
      const r = await fetch(`/api/v1/projects/${projectId}/meetings/auto-draft-agenda/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-UI-Language": language || "nl",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ language: language || "nl" }),
      });
      if (!r.ok) {
        toast.error(isFr ? "Brouillon échoué" : isNl ? "Agenda-draft mislukt" : "Agenda draft failed");
        return;
      }
      const payload: AgendaResponse = await r.json();
      setData(payload);
      setItems(payload.suggested.agenda_items || []);
    } catch {
      toast.error(isNl ? "Agenda-draft mislukt" : "Agenda draft failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    void fetchDraft();
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      await onApply(items);
      toast.success(isNl ? "Agenda toegepast" : "Agenda applied");
      setOpen(false);
      setData(null);
    } catch (e: any) {
      toast.error(e?.message || (isNl ? "Toepassen mislukt" : "Apply failed"));
    } finally {
      setApplying(false);
    }
  };

  const updateItem = (idx: number, patch: Partial<AgendaItem>) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 border-purple-300 text-purple-700 hover:bg-purple-50"
        onClick={handleOpen}
      >
        <Sparkles className="h-4 w-4" />
        {isFr ? "Brouillon IA agenda" : isNl ? "AI-draft agenda" : "AI agenda draft"}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              {isFr ? "Brouillon IA d'agenda" : isNl ? "AI-draft agenda" : "AI meeting agenda"}
              {data?.source === "fallback" && (
                <Badge variant="outline" className="border-amber-400 text-amber-800 ml-2 text-[10px]">
                  {isFr ? "Déterministe" : isNl ? "Deterministisch, zonder AI-sleutel" : "Deterministic"}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {isFr
                ? "Modifiez avant d'appliquer à votre réunion."
                : isNl
                  ? "Bewerk de agenda-items voordat je ze toepast op de meeting."
                  : "Edit items before applying to your meeting."}
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-7 w-7 animate-spin text-purple-500" />
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              {isFr ? "Rien à afficher" : isNl ? "Niets om te tonen" : "Nothing to show"}
            </p>
          ) : (
            <div className="space-y-3">
              {(data?.warnings || []).map((w, i) => (
                <Alert key={i} className="border-amber-300 bg-amber-50 dark:bg-amber-950/40">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-xs text-amber-700 dark:text-amber-200">{w}</AlertDescription>
                </Alert>
              ))}
              {items.map((it, idx) => (
                <div key={idx} className="border rounded-md p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      value={it.title}
                      onChange={(e) => updateItem(idx, { title: e.target.value })}
                      className="flex-1"
                    />
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={it.duration_min}
                        onChange={(e) => updateItem(idx, { duration_min: Number(e.target.value) || 15 })}
                        className="w-20"
                        min={1}
                        max={240}
                      />
                      <Label className="text-xs text-muted-foreground">min</Label>
                    </div>
                  </div>
                  {it.discussion_points && it.discussion_points.length > 0 && (
                    <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5 pl-2">
                      {it.discussion_points.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  )}
                  {it.required_decisions && it.required_decisions.length > 0 && (
                    <ul className="list-disc list-inside text-xs text-amber-700 dark:text-amber-300 space-y-0.5 pl-2">
                      {it.required_decisions.map((p, i) => (
                        <li key={i}>{isNl ? "Besluit: " : "Decision: "}{p}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={applying}>
              {isNl ? "Annuleren" : "Cancel"}
            </Button>
            <Button
              onClick={() => void handleApply()}
              disabled={applying || items.length === 0}
              className="gap-2"
            >
              {applying && <Loader2 className="h-4 w-4 animate-spin" />}
              <Check className="h-4 w-4" />
              {isNl ? "Toepassen" : "Apply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MeetingAgendaAiDraftButton;
