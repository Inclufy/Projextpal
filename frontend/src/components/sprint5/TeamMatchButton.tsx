/**
 * Sprint 5 S5-06 — Team-match suggestions button + modal.
 *
 * Calls POST /api/v1/projects/<pk>/team-match/ to get the top-5 matches,
 * renders them in a modal with "Add to team" per suggestion. Hands off
 * to the caller's existing ``onAddMember`` to actually create the
 * ProjectTeam row (we don't duplicate that flow here).
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, UserPlus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface Suggestion {
  user_id: number;
  name: string;
  match_score: number;
  reasoning: string;
  past_project_similarity?: Record<string, any>;
}

interface MatchResponse {
  suggested: { suggestions: Suggestion[] };
  source: "ai" | "fallback";
  warnings?: string[];
}

export interface TeamMatchButtonProps {
  projectId: string | number;
  /** Called with a user_id when the user clicks "Add to team" on a card.
   *  Return a resolved promise on success, reject on failure. */
  onAddMember: (userId: number) => Promise<void>;
  /** Hide suggestions whose user_id is already in this set. */
  excludeUserIds?: Set<number>;
}

const TeamMatchButton: React.FC<TeamMatchButtonProps> = ({ projectId, onAddMember, excludeUserIds }) => {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MatchResponse | null>(null);
  const [adding, setAdding] = useState<number | null>(null);

  const isNl = language === "nl" || !language;
  const isFr = language === "fr";

  const fetchMatches = async () => {
    setLoading(true);
    setData(null);
    try {
      const token = localStorage.getItem("access_token");
      const r = await fetch(`/api/v1/projects/${projectId}/team-match/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-UI-Language": language || "nl",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ language: language || "nl" }),
      });
      if (!r.ok) {
        toast.error(isFr ? "Appariement échoué" : isNl ? "AI-matching mislukt" : "Team match failed");
        return;
      }
      const payload: MatchResponse = await r.json();
      setData(payload);
    } catch {
      toast.error(isFr ? "Appariement échoué" : isNl ? "AI-matching mislukt" : "Team match failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    void fetchMatches();
  };

  const handleAdd = async (uid: number) => {
    setAdding(uid);
    try {
      await onAddMember(uid);
      toast.success(isFr ? "Membre ajouté" : isNl ? "Lid toegevoegd" : "Member added");
      setData((prev) =>
        prev
          ? { ...prev, suggested: { suggestions: prev.suggested.suggestions.filter((s) => s.user_id !== uid) } }
          : prev,
      );
    } catch (e: any) {
      toast.error(e?.message || (isNl ? "Toevoegen mislukt" : "Add failed"));
    } finally {
      setAdding(null);
    }
  };

  const visible = (data?.suggested.suggestions || []).filter(
    (s) => !excludeUserIds || !excludeUserIds.has(s.user_id),
  );

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 border-purple-300 text-purple-700 hover:bg-purple-50"
        onClick={handleOpen}
      >
        <Sparkles className="h-4 w-4" />
        {isFr ? "Suggestions IA" : isNl ? "AI-suggesties" : "AI suggestions"}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              {isFr ? "Top 5 des membres suggérés" : isNl ? "Top 5 team-suggesties" : "Top 5 team match"}
              {data?.source === "fallback" && (
                <Badge variant="outline" className="border-amber-400 text-amber-800 ml-2 text-[10px]">
                  {isFr
                    ? "Déterministe, sans clé IA"
                    : isNl
                      ? "Deterministisch, zonder AI-sleutel"
                      : "Deterministic, no AI key"}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {isFr
                ? "Basé sur l'expérience passée en méthodologie et type de projet."
                : isNl
                  ? "Op basis van ervaring met methodologie en projecttype."
                  : "Based on past methodology and project type experience."}
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-7 w-7 animate-spin text-purple-500" />
            </div>
          ) : visible.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              {isFr ? "Aucune suggestion" : isNl ? "Geen suggesties" : "No suggestions"}
            </p>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {visible.map((s) => (
                <div key={s.user_id} className="border rounded-md p-3 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{s.name}</p>
                      <Badge variant="secondary" className="text-[11px]">
                        {s.match_score}%
                      </Badge>
                    </div>
                    {s.reasoning && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{s.reasoning}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={adding !== null}
                    onClick={() => void handleAdd(s.user_id)}
                    className="gap-1.5"
                  >
                    {adding === s.user_id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <UserPlus className="h-3.5 w-3.5" />
                    )}
                    {isFr ? "Ajouter" : isNl ? "Toevoegen" : "Add"}
                  </Button>
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="gap-1.5">
              <X className="h-4 w-4" />
              {isFr ? "Fermer" : isNl ? "Sluiten" : "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TeamMatchButton;
