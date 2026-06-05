import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, FileText, Pencil, Trash2, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Send } from "lucide-react";
import { toast } from "sonner";

export type ReportAccent = "blue" | "violet" | "emerald" | "cyan" | "green" | "slate" | "pink";

interface Props {
  methodology: string;          // backend slug, e.g. "scrum"
  accent: ReportAccent;
  titleLabel: string;           // e.g. "Sprint Reports"
  reportNoun: string;           // e.g. "Sprint Report" (singular)
}

const ACCENT_TEXT: Record<ReportAccent, string> = {
  blue: "text-blue-600", violet: "text-violet-600", emerald: "text-emerald-600",
  cyan: "text-cyan-600", green: "text-green-600", slate: "text-slate-600", pink: "text-pink-600",
};

const ragColor = (s: string) =>
  ({ green: "bg-green-100 text-green-700", amber: "bg-amber-100 text-amber-700", red: "bg-red-100 text-red-700" }[s] || "bg-gray-100 text-gray-700");

const toLines = (v: any): string => (Array.isArray(v) ? v.join("\n") : v || "");
const fromLines = (v: string): string[] => v.split("\n").map((l) => l.trim()).filter(Boolean);

const MethodologyReportPage = ({ methodology, accent, titleLabel, reportNoun }: Props) => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const [form, setForm] = useState({
    title: "", scope_ref: "", overall_rag: "green", executive_summary: "",
    highlights: "", blockers: "", next_steps: "", period_start: "", period_end: "",
  });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };
  const BASE = `/api/v1/communication/methodology-reports/`;

  const fetchData = async () => {
    try {
      const r = await fetch(`${BASE}?project=${id}&methodology=${methodology}`, { headers });
      if (r.ok) {
        const data = await r.json();
        setReports(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id, methodology]);

  const generate = async () => {
    setGenerating(true);
    try {
      const r = await fetch(`${BASE}generate/`, {
        method: "POST", headers: jsonHeaders,
        body: JSON.stringify({ project: id, methodology }),
      });
      if (r.ok) { toast.success(pt("Report generated")); fetchData(); }
      else toast.error(pt("Generation failed"));
    } catch { toast.error(pt("Generation failed")); }
    finally { setGenerating(false); }
  };

  const openEdit = (r: any) => {
    setEditing(r);
    setForm({
      title: r.title || "", scope_ref: r.scope_ref || "", overall_rag: r.overall_rag || "green",
      executive_summary: r.executive_summary || "", highlights: toLines(r.highlights),
      blockers: toLines(r.blockers), next_steps: toLines(r.next_steps),
      period_start: r.period_start || "", period_end: r.period_end || "",
    });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ title: reportNoun, scope_ref: "", overall_rag: "green", executive_summary: "", highlights: "", blockers: "", next_steps: "", period_start: "", period_end: "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const body: any = {
        project: id, methodology,
        report_type: editing?.report_type || defaultReportType(methodology),
        title: form.title, scope_ref: form.scope_ref, overall_rag: form.overall_rag,
        executive_summary: form.executive_summary,
        highlights: fromLines(form.highlights), blockers: fromLines(form.blockers),
        next_steps: fromLines(form.next_steps),
      };
      if (form.period_start) body.period_start = form.period_start;
      if (form.period_end) body.period_end = form.period_end;
      const url = editing ? `${BASE}${editing.id}/` : BASE;
      const method = editing ? "PATCH" : "POST";
      const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); }
      else toast.error(pt("Save failed"));
    } catch { toast.error(pt("Save failed")); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (rId: number) => {
    if (!confirm(pt("Are you sure you want to delete this?"))) return;
    try {
      const r = await fetch(`${BASE}${rId}/`, { method: "DELETE", headers });
      if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); }
    } catch { toast.error(pt("Delete failed")); }
  };

  if (loading) return (
    <div className="min-h-full bg-background"><ProjectHeader />
      <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
    </div>
  );

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className={`h-6 w-6 ${ACCENT_TEXT[accent]}`} />
            <h1 className="text-2xl font-bold">{pt(titleLabel)}</h1>
            <Badge variant="outline">{reports.length}</Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate(`/projects/${id}/execution/communication/status-reporting`)} className="gap-2" title={pt("These reports also roll up into the project's central status reporting")}>
              <Send className="h-4 w-4" /> {pt("Central status reporting")}
            </Button>
            <Button onClick={generate} disabled={generating} className="gap-2">
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {pt("Generate from live data")}
            </Button>
            <Button variant="outline" onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("New")}</Button>
          </div>
        </div>

        {reports.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{pt("No reports yet")}</h3>
            <p className="text-sm text-muted-foreground mb-4">{pt("Generate one from your live project data, or write one by hand.")}</p>
            <Button onClick={generate} disabled={generating} className="gap-2">
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {pt("Generate from live data")}
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <Card key={r.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setDetail(r)}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={`text-xs ${ragColor(r.overall_rag)}`}>{r.overall_rag}</Badge>
                      <span className="text-sm font-medium truncate">{r.scope_ref || r.title || reportNoun}</span>
                      {r.auto_generated && <Badge variant="outline" className="text-xs gap-1"><Sparkles className="h-3 w-3" /> {pt("auto")}</Badge>}
                      <span className="text-xs text-muted-foreground ml-auto">{(r.created_at || "").split("T")[0]}</span>
                    </div>
                    {r.executive_summary && <p className="text-sm text-muted-foreground line-clamp-2">{r.executive_summary}</p>}
                  </div>
                  <div className="flex gap-1 ml-4" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Detail view */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Badge className={`text-xs ${ragColor(detail.overall_rag)}`}>{detail.overall_rag}</Badge>
                  {detail.title || reportNoun}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">{detail.scope_ref}{detail.period_start ? ` · ${detail.period_start} → ${detail.period_end || "—"}` : ""}</p>
                <div className="grid grid-cols-4 gap-2">
                  {(["scope", "schedule", "cost", "risk"] as const).map((k) => (
                    <div key={k} className="rounded border p-2 text-center">
                      <p className="text-[10px] uppercase text-muted-foreground">{k}</p>
                      <Badge className={`text-xs ${ragColor(detail[`rag_${k}`])}`}>{detail[`rag_${k}`]}</Badge>
                    </div>
                  ))}
                </div>
                {detail.executive_summary && <p className="text-sm">{detail.executive_summary}</p>}
                {detail.metrics && Object.keys(detail.metrics).length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(detail.metrics).map(([k, v]) => (
                      <div key={k} className="rounded border p-2">
                        <p className="text-[10px] uppercase text-muted-foreground">{k.replace(/_/g, " ")}</p>
                        <p className="text-base font-semibold">{v === null || v === undefined ? "—" : String(v)}</p>
                      </div>
                    ))}
                  </div>
                )}
                {detail.highlights?.length > 0 && (
                  <div><p className="text-sm font-semibold mb-1 flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-green-600" /> {pt("Highlights")}</p>
                    <ul className="text-sm space-y-1">{detail.highlights.map((h: string, i: number) => <li key={i} className="flex gap-2"><span className="text-green-600">•</span>{h}</li>)}</ul></div>
                )}
                {detail.blockers?.length > 0 && (
                  <div><p className="text-sm font-semibold mb-1 flex items-center gap-1"><AlertTriangle className="h-4 w-4 text-amber-600" /> {pt("Blockers")}</p>
                    <ul className="text-sm space-y-1">{detail.blockers.map((h: string, i: number) => <li key={i} className="flex gap-2"><span className="text-amber-600">•</span>{h}</li>)}</ul></div>
                )}
                {detail.next_steps?.length > 0 && (
                  <div><p className="text-sm font-semibold mb-1 flex items-center gap-1"><ArrowRight className="h-4 w-4 text-blue-600" /> {pt("Next Steps")}</p>
                    <ul className="text-sm space-y-1">{detail.next_steps.map((h: string, i: number) => <li key={i} className="flex gap-2"><span className="text-blue-600">•</span>{h}</li>)}</ul></div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create / edit */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? pt("Edit") : pt("New")} {pt(reportNoun)}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>{pt("Title")}</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Scope")}</Label><Input value={form.scope_ref} onChange={(e) => setForm({ ...form, scope_ref: e.target.value })} placeholder={pt("e.g. Sprint 3, Design phase")} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{pt("Period Start")}</Label><Input type="date" value={form.period_start} onChange={(e) => setForm({ ...form, period_start: e.target.value })} /></div>
              <div className="space-y-2"><Label>{pt("Period End")}</Label><Input type="date" value={form.period_end} onChange={(e) => setForm({ ...form, period_end: e.target.value })} /></div>
            </div>
            <div className="space-y-2">
              <Label>{pt("Overall Status")}</Label>
              <Select value={form.overall_rag} onValueChange={(v) => setForm({ ...form, overall_rag: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="green">🟢 Green</SelectItem>
                  <SelectItem value="amber">🟡 Amber</SelectItem>
                  <SelectItem value="red">🔴 Red</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>{pt("Executive Summary")}</Label><textarea className="w-full min-h-[80px] px-3 py-2 border rounded-md bg-background" value={form.executive_summary} onChange={(e) => setForm({ ...form, executive_summary: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Highlights")} <span className="text-xs text-muted-foreground">({pt("one per line")})</span></Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.highlights} onChange={(e) => setForm({ ...form, highlights: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Blockers")} <span className="text-xs text-muted-foreground">({pt("one per line")})</span></Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.blockers} onChange={(e) => setForm({ ...form, blockers: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Next Steps")} <span className="text-xs text-muted-foreground">({pt("one per line")})</span></Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.next_steps} onChange={(e) => setForm({ ...form, next_steps: e.target.value })} /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button>
              <Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const defaultReportType = (m: string): string =>
  ({
    scrum: "sprint_report", kanban: "service_delivery_review", agile: "iteration_report",
    waterfall: "phase_gate_report", "lss-green": "tollgate_report", "lss-black": "tollgate_report",
    hybrid: "phase_report",
  }[m] || "phase_report");

export default MethodologyReportPage;
