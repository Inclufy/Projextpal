/**
 * Sprint 9 Agent B (S9-05) — Find a project team member by required skills.
 *
 * Lives next to the existing Sprint-5 ``TeamMatchButton`` but calls the new
 * ``/api/v1/skills/match/`` endpoint — i.e. based on the Skill DB rather
 * than on past-project similarity.
 */
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Target, Loader2 } from "lucide-react";

interface CatalogSkill {
  id: number;
  code: string;
  name: string;
  category: string;
}

interface MatchResult {
  user_id: number;
  user_name: string;
  user_email: string;
  matched: string[];
  score: number;
}

interface MatchResponse {
  required_skill_codes: string[];
  project_id?: number | null;
  results: MatchResult[];
}

export interface FindSkilledMemberButtonProps {
  projectId: string | number;
  /** Optional: give the parent a chance to actually assign the match
   *  (e.g. hit its existing add-member API). */
  onPick?: (userId: number) => void | Promise<void>;
}

const FindSkilledMemberButton: React.FC<FindSkilledMemberButtonProps> = ({
  projectId,
  onPick,
}) => {
  const [open, setOpen] = useState(false);
  const [catalog, setCatalog] = useState<CatalogSkill[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [matching, setMatching] = useState(false);
  const [response, setResponse] = useState<MatchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const data = await api.get<CatalogSkill[]>("/skills/catalog/");
        setCatalog(data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load catalog.");
      }
    })();
  }, [open]);

  const toggle = (code: string) => {
    const next = new Set(selected);
    if (next.has(code)) next.delete(code);
    else next.add(code);
    setSelected(next);
  };

  const runMatch = async () => {
    if (selected.size === 0) return;
    setMatching(true);
    setError(null);
    try {
      const data = await api.post<MatchResponse>("/skills/match/", {
        required_skill_codes: Array.from(selected),
        project_id: typeof projectId === "number" ? projectId : Number(projectId) || undefined,
      });
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Match failed.");
    } finally {
      setMatching(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className="gap-2"
        onClick={() => setOpen(true)}
      >
        <Target className="h-4 w-4" />
        Find skilled member
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Find a skilled team member</DialogTitle>
            <DialogDescription>
              Pick the skills you need. We rank your company's members by how
              well their declared skills (level + verification) cover the set.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h4 className="mb-2 text-sm font-semibold">Required skills</h4>
              <div className="flex flex-wrap gap-2">
                {catalog.length === 0 ? (
                  <span className="text-xs text-muted-foreground">
                    No skills in catalog yet.
                  </span>
                ) : (
                  catalog.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggle(s.code)}
                      className={`rounded-full border px-3 py-1 text-xs ${
                        selected.has(s.code)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {s.name}
                    </button>
                  ))
                )}
              </div>
            </div>

            <Button
              onClick={runMatch}
              disabled={matching || selected.size === 0}
              className="gap-2"
            >
              {matching ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Rank members
            </Button>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            {response && (
              <div>
                <h4 className="mb-2 text-sm font-semibold">Results</h4>
                {response.results.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No members in your company declared any of these skills yet.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {response.results.map((r) => (
                      <li
                        key={r.user_id}
                        className="flex items-center justify-between rounded-md border p-3"
                      >
                        <div>
                          <p className="font-medium">{r.user_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {r.user_email}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {r.matched.map((c) => (
                              <Badge key={c} variant="secondary">
                                {c}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">
                            score {r.score.toFixed(1)}
                          </span>
                          {onPick && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => onPick(r.user_id)}
                            >
                              Pick
                            </Button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FindSkilledMemberButton;
