/**
 * Sprint 4 — "AI-draft uit documenten" knop + preview-dialog.
 *
 * Shared across every methodology surface (PRINCE2 BC, PRINCE2 Brief,
 * Scrum backlog, Kanban swimlanes, LSS Define, Waterfall phases). The
 * backend call returns a `{suggested, source, warnings}` envelope; the
 * dialog shows the suggestion as editable fields, keeps the user in
 * control, and only on explicit "Apply" calls back into the page's
 * existing create/update flow.
 *
 * The caller provides:
 *   - endpoint: POST URL for the auto-draft
 *   - fields: how to render each key (label + whether it is a textarea,
 *     string-list, or structured list — see FieldSpec)
 *   - onApply: receives the final (user-edited) draft and returns a
 *     promise; the dialog handles the loading / success / error state.
 *
 * Design rules the backend contract enforces:
 *   - `source: 'ai'|'fallback'` → shown as a badge; "fallback" means no
 *     LLM key was reachable, so the user sees a template they can keep.
 *   - `warnings: string[]` → rendered as info-tone alerts, including the
 *     "no project documents uploaded" case.
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Check, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

export type FieldKind = "text" | "textarea" | "stringList" | "backlogItems" | "swimlanes" | "sipoc" | "phases";

export interface FieldSpec {
  key: string;
  label: string;
  kind: FieldKind;
}

export interface AutoDraftFromDocsButtonProps {
  /** Fully-qualified POST endpoint, e.g. `/api/v1/projects/42/prince2/business-case/auto-draft/` */
  endpoint: string;
  /** Dialog title. Already translated. */
  title: string;
  /** Short description under the title. Already translated. */
  description: string;
  /** Ordered list of fields to render + edit. */
  fields: FieldSpec[];
  /** Called with the final (user-edited) object. Must throw on failure. */
  onApply: (suggested: Record<string, any>) => Promise<void>;
  /** Shown on the button itself. Defaults to "AI-draft from documents". */
  buttonLabel?: string;
  /** Only extra size override; defaults to "sm". */
  size?: "sm" | "default";
}

interface DraftResponse {
  suggested: Record<string, any>;
  source: "ai" | "fallback";
  warnings?: string[];
}

const AutoDraftFromDocsButton: React.FC<AutoDraftFromDocsButtonProps> = ({
  endpoint, title, description, fields, onApply, buttonLabel, size = "sm",
}) => {
  const { pt } = usePageTranslations();
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [draft, setDraft] = useState<DraftResponse | null>(null);

  const fetchDraft = async () => {
    setLoading(true);
    setDraft(null);
    try {
      const token = localStorage.getItem("access_token");
      const r = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-UI-Language": language || "nl",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ language: language || "nl" }),
      });
      if (!r.ok) {
        toast.error(pt("AI-draft failed"));
        return;
      }
      const data: DraftResponse = await r.json();
      setDraft(data);
    } catch {
      toast.error(pt("AI-draft failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    void fetchDraft();
  };

  const handleApply = async () => {
    if (!draft) return;
    setApplying(true);
    try {
      await onApply(draft.suggested);
      toast.success(pt("Draft applied"));
      setOpen(false);
      setDraft(null);
    } catch (e: any) {
      toast.error(e?.message || pt("Apply failed"));
    } finally {
      setApplying(false);
    }
  };

  const updateField = (key: string, value: any) => {
    setDraft((prev) => (prev ? { ...prev, suggested: { ...prev.suggested, [key]: value } } : prev));
  };

  const renderField = (spec: FieldSpec) => {
    const value = draft?.suggested?.[spec.key];
    switch (spec.kind) {
      case "text":
        return (
          <div key={spec.key} className="space-y-1.5">
            <Label>{spec.label}</Label>
            <Input value={String(value ?? "")} onChange={(e) => updateField(spec.key, e.target.value)} />
          </div>
        );
      case "textarea":
        return (
          <div key={spec.key} className="space-y-1.5">
            <Label>{spec.label}</Label>
            <Textarea rows={4} value={String(value ?? "")} onChange={(e) => updateField(spec.key, e.target.value)} />
          </div>
        );
      case "stringList": {
        const list: string[] = Array.isArray(value) ? value : [];
        return (
          <div key={spec.key} className="space-y-1.5">
            <Label>{spec.label}</Label>
            {list.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">{pt("(none)")}</p>
            ) : (
              list.map((item, i) => (
                <Input
                  key={i}
                  value={item}
                  onChange={(e) => {
                    const next = [...list];
                    next[i] = e.target.value;
                    updateField(spec.key, next);
                  }}
                />
              ))
            )}
          </div>
        );
      }
      case "backlogItems": {
        const items: any[] = Array.isArray(value) ? value : [];
        return (
          <div key={spec.key} className="space-y-2">
            <Label>{spec.label} ({items.length})</Label>
            <div className="space-y-2 max-h-72 overflow-y-auto border rounded-md p-2">
              {items.map((item, i) => (
                <div key={i} className="border rounded-md p-2 space-y-1">
                  <Input
                    value={item?.title ?? ""}
                    onChange={(e) => {
                      const next = [...items];
                      next[i] = { ...next[i], title: e.target.value };
                      updateField(spec.key, next);
                    }}
                    placeholder={pt("Title")}
                  />
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">{pt("Priority")}</Label>
                    <select
                      className="text-xs border rounded px-1 py-0.5 bg-background"
                      value={item?.priority || "medium"}
                      onChange={(e) => {
                        const next = [...items];
                        next[i] = { ...next[i], priority: e.target.value };
                        updateField(spec.key, next);
                      }}
                    >
                      <option value="critical">critical</option>
                      <option value="high">high</option>
                      <option value="medium">medium</option>
                      <option value="low">low</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }
      case "swimlanes": {
        const items: any[] = Array.isArray(value) ? value : [];
        return (
          <div key={spec.key} className="space-y-2">
            <Label>{spec.label} ({items.length})</Label>
            <div className="space-y-2 max-h-72 overflow-y-auto border rounded-md p-2">
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    className="flex-1"
                    value={item?.name ?? ""}
                    onChange={(e) => {
                      const next = [...items];
                      next[i] = { ...next[i], name: e.target.value };
                      updateField(spec.key, next);
                    }}
                  />
                  <Input
                    className="w-24"
                    value={item?.color_hex ?? "#6366f1"}
                    onChange={(e) => {
                      const next = [...items];
                      next[i] = { ...next[i], color_hex: e.target.value };
                      updateField(spec.key, next);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      }
      case "sipoc": {
        const obj = (value && typeof value === "object") ? value : {};
        const keys = ["suppliers", "inputs", "process", "outputs", "customers"];
        return (
          <div key={spec.key} className="space-y-2">
            <Label>{spec.label}</Label>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              {keys.map((k) => {
                const items: string[] = Array.isArray(obj[k]) ? obj[k] : [];
                return (
                  <div key={k} className="space-y-1">
                    <Label className="text-xs uppercase text-muted-foreground">{k}</Label>
                    <Textarea
                      rows={4}
                      className="text-xs"
                      value={items.join("\n")}
                      onChange={(e) => {
                        const next = { ...obj };
                        next[k] = e.target.value.split("\n").map((s) => s.trim()).filter(Boolean);
                        updateField(spec.key, next);
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      }
      case "phases": {
        const items: any[] = Array.isArray(value) ? value : [];
        return (
          <div key={spec.key} className="space-y-2">
            <Label>{spec.label} ({items.length})</Label>
            <div className="space-y-2 max-h-72 overflow-y-auto border rounded-md p-2">
              {items.map((item, i) => (
                <div key={i} className="border rounded-md p-2 space-y-1">
                  <Input
                    value={item?.name ?? ""}
                    onChange={(e) => {
                      const next = [...items];
                      next[i] = { ...next[i], name: e.target.value };
                      updateField(spec.key, next);
                    }}
                    placeholder={pt("Name")}
                  />
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      className="flex-1"
                      value={item?.start_date ?? ""}
                      onChange={(e) => {
                        const next = [...items];
                        next[i] = { ...next[i], start_date: e.target.value };
                        updateField(spec.key, next);
                      }}
                    />
                    <Input
                      type="date"
                      className="flex-1"
                      value={item?.end_date ?? ""}
                      onChange={(e) => {
                        const next = [...items];
                        next[i] = { ...next[i], end_date: e.target.value };
                        updateField(spec.key, next);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size={size}
        className="gap-1.5 border-purple-300 text-purple-700 hover:bg-purple-50"
        onClick={handleOpen}
      >
        <Sparkles className="h-4 w-4" />
        {buttonLabel || pt("AI-draft from documents")}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              {title}
              {draft && <Badge variant={draft.source === "ai" ? "default" : "secondary"} className="ml-2">{draft.source}</Badge>}
            </DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {pt("AI is reading your project context…")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {pt("This typically takes 10–30 seconds — the dialog stays open.")}
                </p>
              </div>
            </div>
          ) : !draft ? (
            <p className="text-sm text-muted-foreground py-8 text-center">{pt("No draft yet.")}</p>
          ) : (
            <div className="space-y-4">
              {(draft.warnings || []).map((w, i) => (
                <Alert key={i} className="border-amber-300 bg-amber-50 dark:bg-amber-950/40">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-xs text-amber-700 dark:text-amber-200">{w}</AlertDescription>
                </Alert>
              ))}
              {fields.map(renderField)}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={applying}>
              {pt("Cancel")}
            </Button>
            <Button onClick={handleApply} disabled={!draft || applying} className="gap-2">
              {applying && <Loader2 className="h-4 w-4 animate-spin" />}
              <Check className="h-4 w-4" />
              {pt("Apply")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AutoDraftFromDocsButton;
