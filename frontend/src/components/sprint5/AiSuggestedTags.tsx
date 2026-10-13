/**
 * Sprint 5 S5-02 — AI-suggested project tags.
 *
 * Reads ``Project.ai_suggested_tags`` and renders them as chips. Includes
 * a "Suggest tags" button that calls POST /auto-tag/ to (re)generate.
 * Falls back to deterministic tags when no LLM key is configured; the
 * amber-outline "Deterministisch" badge makes that visible.
 */
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Sparkles, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { projectsApi } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

export interface AiSuggestedTagsProps {
  projectId: string | number;
  /** Hide the "Suggest tags" button (chip-only mode). */
  readOnly?: boolean;
}

const AiSuggestedTags: React.FC<AiSuggestedTagsProps> = ({ projectId, readOnly }) => {
  const { language } = useLanguage();
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<"ai" | "fallback" | null>(null);

  const { data: project } = useQuery({
    queryKey: ["project", String(projectId)],
    queryFn: () => projectsApi.getById(String(projectId)),
    enabled: !!projectId,
  });
  const tags: string[] = Array.isArray(project?.ai_suggested_tags) ? project!.ai_suggested_tags : [];

  const mutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("access_token");
      const r = await fetch(`/api/v1/projects/${projectId}/auto-tag/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-UI-Language": language || "nl",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ language: language || "nl" }),
      });
      if (!r.ok) throw new Error("auto-tag failed");
      return r.json();
    },
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      setSource(data.source || null);
      qc.invalidateQueries({ queryKey: ["project", String(projectId)] });
      toast.success(language === "en" ? "Tags refreshed" : "Tags bijgewerkt");
    },
    onError: () => toast.error(language === "en" ? "Could not generate tags" : "Tags genereren mislukt"),
    onSettled: () => setLoading(false),
  });

  const isNl = language === "nl" || !language;
  const isFr = language === "fr";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.length === 0 ? (
        <span className="text-xs text-muted-foreground italic">
          {isFr ? "Aucune étiquette suggérée" : isNl ? "Nog geen suggesties" : "No suggestions yet"}
        </span>
      ) : (
        tags.map((t) => (
          <Badge key={t} variant="secondary" className="text-xs">
            {t}
          </Badge>
        ))
      )}
      {source === "fallback" && (
        <Badge variant="outline" className="border-amber-400 text-amber-800 text-[10px]">
          {isFr
            ? "Déterministe, sans clé IA"
            : isNl
              ? "Deterministisch, zonder AI-sleutel"
              : "Deterministic, no AI key"}
        </Badge>
      )}
      {!readOnly && (
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-purple-300 text-purple-700 hover:bg-purple-50 h-7"
          onClick={() => mutation.mutate()}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {isFr ? "Suggérer" : isNl ? "AI-suggesties" : "Suggest tags"}
        </Button>
      )}
    </div>
  );
};

export default AiSuggestedTags;
