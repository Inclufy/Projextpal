import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, Loader2, Check } from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { toast } from "sonner";

interface Props {
  /** GET endpoint returning { drafts: [...] } or a bare array. */
  draftUrl: string;
  /** POST endpoint to create each accepted draft. */
  createUrl: string;
  /** Map a draft item -> the create request body. */
  buildPayload: (item: any) => Record<string, any>;
  /** Row label for a draft item. */
  renderItem: (item: any) => React.ReactNode;
  /** Called after items are created so the parent can refresh. */
  onDone: () => void;
  label?: string;
  title?: string;
}

/**
 * Reusable "AI draft" control: fetches AI-generated draft items, lets the user
 * pick which to keep, and bulk-creates the selected ones. Human-in-the-loop —
 * nothing is saved until the user clicks Add.
 */
export function AIDraftButton({ draftUrl, createUrl, buildPayload, renderItem, onDone, label, title }: Props) {
  const { pt } = usePageTranslations();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const load = async () => {
    setOpen(true); setLoading(true); setDrafts([]); setSelected(new Set());
    try {
      const r = await fetch(draftUrl, { headers });
      if (r.ok) {
        const d = await r.json();
        const arr = Array.isArray(d) ? d : d.drafts || [];
        setDrafts(arr);
        setSelected(new Set(arr.map((_: any, i: number) => i))); // pre-select all
      } else toast.error(pt("Could not generate suggestions"));
    } catch { toast.error(pt("Could not generate suggestions")); }
    finally { setLoading(false); }
  };

  const toggle = (i: number) => setSelected((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; });

  const addSelected = async () => {
    const picks = drafts.filter((_, i) => selected.has(i));
    if (picks.length === 0) { toast.error(pt("Select at least one")); return; }
    setSubmitting(true);
    let ok = 0;
    for (const item of picks) {
      try {
        const r = await fetch(createUrl, { method: "POST", headers: jsonHeaders, body: JSON.stringify(buildPayload(item)) });
        if (r.ok) ok++;
      } catch { /* keep going */ }
    }
    setSubmitting(false); setOpen(false);
    if (ok > 0) { toast.success(`${ok} ${pt("added")}`); onDone(); }
    else toast.error(pt("Nothing was added"));
  };

  return (
    <>
      <Button variant="outline" className="gap-2" onClick={load}><Sparkles className="h-4 w-4 text-fuchsia-500" />{label || pt("AI Suggest")}</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-fuchsia-500" />{title || pt("AI suggestions")}</DialogTitle></DialogHeader>
          {loading ? (
            <div className="flex items-center justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : drafts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">{pt("Nothing to suggest yet — add more project data first.")}</p>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">{pt("Pick the suggestions to add. You can edit them afterwards.")}</p>
              <div className="space-y-1 max-h-[55vh] overflow-y-auto">
                {drafts.map((item, i) => {
                  const on = selected.has(i);
                  return (
                    <button key={i} onClick={() => toggle(i)} className={`w-full flex items-start gap-2 px-3 py-2 rounded-md border text-left text-sm ${on ? "bg-fuchsia-50 border-fuchsia-300" : "hover:bg-muted"}`}>
                      <span className={`h-4 w-4 mt-0.5 rounded border flex items-center justify-center shrink-0 ${on ? "bg-fuchsia-500 border-fuchsia-500" : "border-muted-foreground"}`}>{on && <Check className="h-3 w-3 text-white" />}</span>
                      <span className="flex-1">{renderItem(item)}</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setOpen(false)}>{pt("Cancel")}</Button>
                <Button onClick={addSelected} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Add selected")} ({selected.size})</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
