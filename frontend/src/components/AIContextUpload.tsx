/**
 * AIContextUpload — reusable panel to upload documents as AI context for
 * a Program or Portfolio (Sprint 3). Mirrors the CreateProject wizard's
 * doc-upload step pattern but as a standalone card instead of a wizard
 * step. The ProjectAIContext equivalent is wired inside the wizard
 * directly, see CreateProject.tsx.
 *
 * The caller passes:
 *   - endpoint: the backend URL for GET/POST ai-context, e.g.
 *       `/api/v1/programs/42/ai-context/`
 *       `/api/v1/governance/portfolios/<uuid>/ai-context/`
 *   - titleKey / descriptionKey: translation keys for the heading
 *
 * The component fetches current status on mount, then lets the user upload
 * documents through `/api/v1/projects/plan-from-documents/` (that endpoint
 * is generic — it only cares about the files, not the "project" label).
 * The extracted preview + source-file metadata is POSTed back to the
 * caller-provided endpoint, which persists it as the context row.
 */
import { useEffect, useState } from "react";
import { Loader2, Sparkles, Check, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import MultiFileDropzone from "@/components/MultiFileDropzone";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { toast } from "sonner";

export interface AIContextStatus {
  exists: boolean;
  enabled: boolean;
  chars: number;
  source_files: Array<{ name: string; size?: number; pages?: number }>;
  updated_at: string | null;
}

export interface AIContextUploadProps {
  /** Fully-qualified ai-context endpoint for this entity. */
  endpoint: string;
  /** Headline above the card. Already-translated. */
  title: string;
  /** Short description under the headline. Already-translated. */
  description: string;
}

const AIContextUpload: React.FC<AIContextUploadProps> = ({ endpoint, title, description }) => {
  const { pt } = usePageTranslations();
  const [status, setStatus] = useState<AIContextStatus | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [toggleBusy, setToggleBusy] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const authJson = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const refresh = async () => {
    try {
      const r = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) {
        setStatus(await r.json());
      }
    } catch {
      /* status is additive; never block the page */
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  const handleExtractAndSave = async () => {
    if (files.length === 0) {
      toast.error(pt("Please add at least one file"));
      return;
    }
    setBusy(true);
    try {
      // 1. Extract — plan-from-documents is a generic text extractor; it
      //    does not care about the entity type.
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));
      const extractResp = await fetch("/api/v1/projects/plan-from-documents/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!extractResp.ok) {
        toast.error(pt("Could not extract text from documents"));
        return;
      }
      const extracted = await extractResp.json();
      const text =
        (extracted?.extracted_text_preview as string | undefined) ||
        (extracted?.description as string | undefined) ||
        "";
      if (!text) {
        toast.error(pt("No text extracted from documents"));
        return;
      }

      // 2. Persist as AI context on the target entity.
      const saveResp = await fetch(endpoint, {
        method: "POST",
        headers: authJson,
        body: JSON.stringify({
          enabled: true,
          extracted_text: text,
          source_files: files.map((f) => ({ name: f.name, size: f.size, pages: 0 })),
        }),
      });
      if (!saveResp.ok) {
        toast.error(pt("Could not save AI context"));
        return;
      }
      const next = (await saveResp.json()) as AIContextStatus;
      setStatus(next);
      setFiles([]);
      toast.success(pt("AI context updated"));
    } catch {
      toast.error(pt("Something went wrong while updating AI context"));
    } finally {
      setBusy(false);
    }
  };

  const handleToggle = async (next: boolean) => {
    if (!status?.exists) return;
    setToggleBusy(true);
    try {
      const r = await fetch(endpoint, {
        method: "POST",
        headers: authJson,
        // Empty text → backend keeps the existing text and only toggles.
        body: JSON.stringify({ enabled: next }),
      });
      if (r.ok) {
        const updated = (await r.json()) as AIContextStatus;
        setStatus(updated);
        toast.success(next ? pt("AI context enabled") : pt("AI context disabled"));
      } else {
        toast.error(pt("Could not update AI context"));
      }
    } catch {
      toast.error(pt("Could not update AI context"));
    } finally {
      setToggleBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status?.exists && (
          <Alert>
            <AlertTitle className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600" />
              {pt("AI context available")}
              {status.chars > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {status.chars.toLocaleString()} {pt("chars")}
                </Badge>
              )}
            </AlertTitle>
            <AlertDescription className="pt-2 space-y-2">
              {status.source_files?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {status.source_files.map((f, i) => (
                    <Badge key={i} variant="outline" className="gap-1 font-normal">
                      <FileText className="h-3 w-3" />
                      {f.name}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-3 pt-1">
                <Switch
                  id="ai-context-enabled"
                  checked={status.enabled}
                  onCheckedChange={handleToggle}
                  disabled={toggleBusy}
                />
                <Label htmlFor="ai-context-enabled" className="text-sm">
                  {status.enabled
                    ? pt("Enabled — AI will use these documents as context")
                    : pt("Disabled — AI will ignore these documents")}
                </Label>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <MultiFileDropzone
            files={files}
            onFilesChange={setFiles}
            accept=".pdf,.txt,.md,.csv"
            description={pt("PDF, TXT, MD or CSV — up to 10 files, 15 MB each.")}
            disabled={busy}
          />
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handleExtractAndSave}
              disabled={files.length === 0 || busy}
              className="gap-2"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {status?.exists ? pt("Replace AI context") : pt("Extract and save as AI context")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIContextUpload;
