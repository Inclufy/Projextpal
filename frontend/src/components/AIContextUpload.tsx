/**
 * AIContextUpload — reusable panel to upload documents as AI context for
 * a Program or Portfolio (Sprint 3). Mirrors the CreateProject wizard's
 * doc-upload step pattern but as a standalone card instead of a wizard
 * step. The ProjectAIContext equivalent is wired inside the wizard
 * directly, see CreateProject.tsx.
 *
 * Sprint 6 additions:
 *   - Per-document ``enabled`` switch (hide a single doc from AI context
 *     without removing it; backend defaults missing flag to True so this
 *     is backward-compatible with pre-S6 rows).
 *   - "Verwijder AI-context" (GDPR erasure) button — rode outline + confirm
 *     dialog. POSTs DELETE {confirm: true} to the context endpoint.
 *
 * The caller passes:
 *   - endpoint: the backend URL for GET/POST ai-context, e.g.
 *       `/api/v1/programs/42/ai-context/`
 *       `/api/v1/governance/portfolios/<uuid>/ai-context/`
 *   - titleKey / descriptionKey: translation keys for the heading
 */
import { useEffect, useState } from "react";
import { Loader2, Sparkles, Check, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import MultiFileDropzone from "@/components/MultiFileDropzone";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { toast } from "sonner";

export interface AIContextSourceFile {
  name: string;
  size?: number;
  pages?: number;
  enabled?: boolean;
}

export interface AIContextStatus {
  exists: boolean;
  enabled: boolean;
  chars: number;
  source_files: AIContextSourceFile[];
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
  const [docToggleBusy, setDocToggleBusy] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

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

      const saveResp = await fetch(endpoint, {
        method: "POST",
        headers: authJson,
        body: JSON.stringify({
          enabled: true,
          extracted_text: text,
          source_files: files.map((f) => ({
            name: f.name, size: f.size, pages: 0, enabled: true,
          })),
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

  const handleDocToggle = async (fileName: string, nextEnabled: boolean) => {
    if (!status?.exists) return;
    setDocToggleBusy(fileName);
    try {
      const nextFiles = (status.source_files || []).map((f) =>
        f.name === fileName ? { ...f, enabled: nextEnabled } : f,
      );
      const r = await fetch(endpoint, {
        method: "PATCH",
        headers: authJson,
        body: JSON.stringify({ source_files: nextFiles }),
      });
      if (r.ok) {
        const updated = (await r.json()) as AIContextStatus;
        setStatus(updated);
      } else {
        toast.error(pt("Could not update document"));
      }
    } catch {
      toast.error(pt("Could not update document"));
    } finally {
      setDocToggleBusy(null);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const r = await fetch(endpoint, {
        method: "DELETE",
        headers: authJson,
        body: JSON.stringify({ confirm: true }),
      });
      if (r.ok) {
        toast.success(pt("AI context deleted"));
        setStatus({
          exists: false, enabled: false, chars: 0,
          source_files: [], updated_at: null,
        });
        setConfirmOpen(false);
      } else {
        toast.error(pt("Could not delete AI context"));
      }
    } catch {
      toast.error(pt("Could not delete AI context"));
    } finally {
      setDeleting(false);
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
            <AlertDescription className="pt-2 space-y-3">
              {status.source_files?.length > 0 && (
                <div className="space-y-1.5">
                  {status.source_files.map((f, i) => {
                    const docEnabled = f.enabled !== false;
                    const busy = docToggleBusy === f.name;
                    return (
                      <div
                        key={`${f.name}-${i}`}
                        className="flex items-center justify-between gap-3 rounded border px-3 py-1.5"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <FileText className="h-3 w-3 shrink-0 text-muted-foreground" />
                          <span className="truncate text-xs" title={f.name}>
                            {f.name}
                          </span>
                        </div>
                        <Switch
                          checked={docEnabled}
                          onCheckedChange={(v) => handleDocToggle(f.name, v)}
                          disabled={busy}
                          aria-label={
                            docEnabled
                              ? pt("Document used by AI")
                              : pt("Document hidden from AI")
                          }
                        />
                      </div>
                    );
                  })}
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
              <div className="flex justify-end pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800"
                  onClick={() => setConfirmOpen(true)}
                  disabled={deleting}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  {pt("Delete AI context")}
                </Button>
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

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pt("Delete AI context?")}</AlertDialogTitle>
            <AlertDialogDescription>
              {pt(
                "This permanently removes the uploaded document text, source-file list, and the per-document switches from this entity. The AI will fall back to methodology knowledge only. Audit log entries are kept for compliance.",
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{pt("Cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              {pt("Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default AIContextUpload;
