import { useState, useEffect } from "react";
import { activateOnKey } from "@/lib/a11y";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, FileText, Pencil, Trash2, Eye, Download } from "lucide-react";
import { ReportExportMenu, ReportSection } from "@/components/ReportExportMenu";
import { BudgetOneView } from "@/components/BudgetOneView";
import { toast } from "sonner";

const reportSections = (r: any): ReportSection[] => [
  { heading: "Cover", rows: [
    ["Date", r.report_date || ""], ["Period", `${r.period_start || "—"} → ${r.period_end || "—"}`],
    ["Sponsor", r.sponsor || ""], ["Project Manager", r.project_manager || ""], ["Senior Supplier", r.senior_supplier || ""],
  ] },
  { heading: "RAG", rows: [
    ["Overall", r.overall_status], ["Budget", r.rag_budget], ["Planning", r.rag_planning], ["Resources", r.rag_resources],
  ] },
  ...(Array.isArray(r.phase_timeline) && r.phase_timeline.length ? [{ heading: "Phase Timeline", rows: r.phase_timeline.map((p: any) => [p.phase, `${p.start || "—"} → ${p.end || "—"} (${p.status})`]) as [string, any][] }] : []),
  ...((r.budget_spent != null || r.budget_forecast != null) ? [{ heading: "Financials", rows: [["Budget spent", r.budget_spent ?? ""], ["Budget forecast", r.budget_forecast ?? ""]] as [string, any][] }] : []),
  { heading: "Objectives", text: r.objectives || "" },
  { heading: "Status Summary", text: r.status_summary || "" },
  { heading: "Work Completed", text: r.work_completed || "" },
  { heading: "Highlights", text: r.highlights || "" },
  { heading: "Lowlights", text: r.lowlights || "" },
  { heading: "Work Planned Next Period", text: r.work_planned_next_period || "" },
  { heading: "Issues", text: r.issues_summary || "" },
  { heading: "Risks", text: r.risks_summary || "" },
].filter((s) => (s.rows && s.rows.length) || s.text);

const Prince2HighlightReport = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ status_summary: "", overall_status: "green", rag_budget: "green", rag_planning: "green", rag_resources: "green", sponsor: "", project_manager: "", senior_supplier: "", objectives: "", report_date: "", period_start: "", period_end: "", work_completed: "", highlights: "", lowlights: "", issues_summary: "", risks_summary: "", work_planned_next_period: "" });
  const defaultPhases = () => [
    { phase: "Prepare", start: "", end: "", status: "todo" },
    { phase: "Renovations", start: "", end: "", status: "todo" },
    { phase: "Run", start: "", end: "", status: "todo" },
  ];
  const [phases, setPhases] = useState<any[]>(defaultPhases());
  const [viewing, setViewing] = useState<any>(null);

  const downloadPptx = async (rId: number) => {
    try {
      const res = await fetch(`/api/v1/projects/${id}/prince2/highlight-reports/${rId}/export/pptx/`, { headers });
      if (!res.ok) { toast.error(pt("Export failed")); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `highlight-report-${rId}.pptx`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch { toast.error(pt("Export failed")); }
  };

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/v1/projects/${id}/prince2/highlight-reports/`, { headers });
      if (response.ok) {
        const data = await response.json();
        setReports(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const openCreate = () => {
    setEditing(null);
    setForm({ status_summary: "", overall_status: "green", rag_budget: "green", rag_planning: "green", rag_resources: "green", sponsor: "", project_manager: "", senior_supplier: "", objectives: "", report_date: new Date().toISOString().split("T")[0], period_start: "", period_end: "", work_completed: "", highlights: "", lowlights: "", issues_summary: "", risks_summary: "", work_planned_next_period: "" });
    setPhases(defaultPhases());
    setDialogOpen(true);
  };

  const openEdit = (r: any) => {
    setEditing(r);
    setForm({ status_summary: r.status_summary || "", overall_status: r.overall_status || "green", rag_budget: r.rag_budget || "green", rag_planning: r.rag_planning || "green", rag_resources: r.rag_resources || "green", sponsor: r.sponsor || "", project_manager: r.project_manager || "", senior_supplier: r.senior_supplier || "", objectives: r.objectives || "", report_date: r.report_date?.split("T")[0] || "", period_start: r.period_start?.split("T")[0] || "", period_end: r.period_end?.split("T")[0] || "", work_completed: r.work_completed || "", highlights: r.highlights || "", lowlights: r.lowlights || "", issues_summary: r.issues_summary || "", risks_summary: r.risks_summary || "", work_planned_next_period: r.work_planned_next_period || "" });
    setPhases(Array.isArray(r.phase_timeline) && r.phase_timeline.length ? r.phase_timeline : defaultPhases());
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const body: any = {
        overall_status: form.overall_status,
        rag_budget: form.rag_budget,
        rag_planning: form.rag_planning,
        rag_resources: form.rag_resources,
        sponsor: form.sponsor,
        project_manager: form.project_manager,
        senior_supplier: form.senior_supplier,
        objectives: form.objectives,
        phase_timeline: phases,
        status_summary: form.status_summary,
        work_completed: form.work_completed,
        highlights: form.highlights,
        lowlights: form.lowlights,
        issues_summary: form.issues_summary,
        risks_summary: form.risks_summary,
        work_planned_next_period: form.work_planned_next_period,
      };
      if (form.report_date) body.report_date = form.report_date;
      if (form.period_start) body.period_start = form.period_start;
      if (form.period_end) body.period_end = form.period_end;
      const url = editing ? `/api/v1/projects/${id}/prince2/highlight-reports/${editing.id}/` : `/api/v1/projects/${id}/prince2/highlight-reports/`;
      const method = editing ? "PATCH" : "POST";
      const response = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) });
      if (response.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); }
      else toast.error(pt("Save failed"));
    } catch { toast.error(pt("Save failed")); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (rId: number) => {
    if (!confirm(pt("Are you sure you want to delete this?"))) return;
    try {
      const response = await fetch(`/api/v1/projects/${id}/prince2/highlight-reports/${rId}/`, { method: "DELETE", headers });
      if (response.ok || response.status === 204) { toast.success(pt("Deleted")); fetchData(); }
    } catch { toast.error(pt("Delete failed")); }
  };

  const statusColor = (s: string) => ({ green: "bg-green-100 text-green-700", amber: "bg-amber-100 text-amber-700", red: "bg-red-100 text-red-700" }[s] || "bg-gray-100");

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
            <FileText className="h-6 w-6 text-purple-500" />
            <h1 className="text-2xl font-bold">{pt("Highlight Reports")}</h1>
            <Badge variant="outline">{reports.length}</Badge>
          </div>
          <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("New Report")}</Button>
        </div>

        {/* Financials one-view (QW-4): full Budget × Actuals × ETC × Variance,
            Internal/External split — the Yanmar Highlight Report financial block,
            on the same page as the RAG indicators. */}
        {id && (
          <Card>
            <CardHeader><CardTitle className="text-base">{pt("Financials")}</CardTitle></CardHeader>
            <CardContent><BudgetOneView projectId={id} /></CardContent>
          </Card>
        )}

        {reports.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{pt("No highlight reports yet")}</h3>
            <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> {pt("New Report")}</Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <Card key={r.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div role="button" tabIndex={0} onKeyDown={activateOnKey} className="flex-1 cursor-pointer" onClick={() => setViewing(r)}>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {(["overall_status", "rag_budget", "rag_planning", "rag_resources"] as const).map((k) => (
                        <Badge key={k} className={`text-xs ${statusColor(r[k])}`}>{({ overall_status: "Overall", rag_budget: "Budget", rag_planning: "Planning", rag_resources: "Resources" }[k])}</Badge>
                      ))}
                      <span className="text-sm text-muted-foreground">{r.report_date}</span>
                    </div>
                    {(r.sponsor || r.project_manager || r.senior_supplier) && (
                      <p className="text-xs text-muted-foreground mb-1">
                        {[r.sponsor && `${pt("Sponsor")}: ${r.sponsor}`, r.project_manager && `${pt("PM")}: ${r.project_manager}`, r.senior_supplier && `${pt("Senior Supplier")}: ${r.senior_supplier}`].filter(Boolean).join("  ·  ")}
                      </p>
                    )}
                    <p className="font-medium">{r.status_summary ? r.status_summary.slice(0, 80) : pt("Highlight Report")}</p>
                    {r.objectives && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{r.objectives}</p>}
                    {Array.isArray(r.phase_timeline) && r.phase_timeline.some((p: any) => p.start || p.end) && (
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {r.phase_timeline.map((p: any, i: number) => (
                          <Badge key={i} variant="outline" className={`text-xs ${p.status === "done" ? "border-green-400 text-green-700" : p.status === "active" ? "border-blue-400 text-blue-700" : ""}`}>
                            {p.phase}{p.start ? ` ${p.start.slice(5)}` : ""}{p.end ? `→${p.end.slice(5)}` : ""}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 ml-4">
                    <Button variant="ghost" size="sm" title={pt("View")} onClick={() => setViewing(r)}><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" title={pt("Download PPTX")} onClick={() => downloadPptx(r.id)}><Download className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? pt("Edit") : pt("New Report")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {/* Cover/header — Yanmar HR-01 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>{pt("Sponsor")}</Label><Input value={form.sponsor} onChange={(e) => setForm({ ...form, sponsor: e.target.value })} /></div>
              <div className="space-y-2"><Label>{pt("Project Manager")}</Label><Input value={form.project_manager} onChange={(e) => setForm({ ...form, project_manager: e.target.value })} /></div>
              <div className="space-y-2"><Label>{pt("Senior Supplier")}</Label><Input value={form.senior_supplier} onChange={(e) => setForm({ ...form, senior_supplier: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>{pt("Objectives")}</Label><textarea className="w-full min-h-[50px] px-3 py-2 border rounded-md bg-background" value={form.objectives} onChange={(e) => setForm({ ...form, objectives: e.target.value })} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>{pt("Date")}</Label><Input type="date" value={form.report_date} onChange={(e) => setForm({ ...form, report_date: e.target.value })} /></div>
              <div className="space-y-2"><Label>{pt("Period Start")}</Label><Input type="date" value={form.period_start} onChange={(e) => setForm({ ...form, period_start: e.target.value })} /></div>
              <div className="space-y-2"><Label>{pt("Period End")}</Label><Input type="date" value={form.period_end} onChange={(e) => setForm({ ...form, period_end: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {([
                ["overall_status", "Overall"],
                ["rag_budget", "Budget"],
                ["rag_planning", "Planning"],
                ["rag_resources", "Resources"],
              ] as const).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <Label>{pt(label)}</Label>
                  <Select value={(form as any)[key]} onValueChange={(v) => setForm({ ...form, [key]: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="green">🟢 Green</SelectItem>
                      <SelectItem value="amber">🟡 Amber</SelectItem>
                      <SelectItem value="red">🔴 Red</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            {/* Monthly phase timeline — Yanmar HR-02 */}
            <div className="space-y-2">
              <Label>{pt("Phase Timeline")}</Label>
              <div className="space-y-2">
                {phases.map((p, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
                    <span className="text-sm font-medium">{p.phase}</span>
                    <Input type="date" value={p.start || ""} onChange={(e) => setPhases(phases.map((x, j) => j === i ? { ...x, start: e.target.value } : x))} />
                    <Input type="date" value={p.end || ""} onChange={(e) => setPhases(phases.map((x, j) => j === i ? { ...x, end: e.target.value } : x))} />
                    <Select value={p.status || "todo"} onValueChange={(v) => setPhases(phases.map((x, j) => j === i ? { ...x, status: v } : x))}>
                      <SelectTrigger className="w-[110px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">{pt("To do")}</SelectItem>
                        <SelectItem value="active">{pt("Active")}</SelectItem>
                        <SelectItem value="done">{pt("Done")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2"><Label>{pt("Status Summary")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.status_summary} onChange={(e) => setForm({ ...form, status_summary: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Work Completed")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.work_completed} onChange={(e) => setForm({ ...form, work_completed: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Highlights")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.highlights} onChange={(e) => setForm({ ...form, highlights: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Lowlights")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.lowlights} onChange={(e) => setForm({ ...form, lowlights: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Work Planned Next Period")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.work_planned_next_period} onChange={(e) => setForm({ ...form, work_planned_next_period: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Issues")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.issues_summary} onChange={(e) => setForm({ ...form, issues_summary: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Risks")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.risks_summary} onChange={(e) => setForm({ ...form, risks_summary: e.target.value })} /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button>
              <Button onClick={handleSave} disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Read-only overview — Yanmar HR (click a row to open) */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-4xl w-[92vw] max-h-[90vh] overflow-y-auto">
          {viewing && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between pr-6">
                  <span>{pt("Highlight Report")} · {viewing.report_date || ""}</span>
                  <ReportExportMenu
                    title={`Highlight Report ${viewing.report_date || ""}`}
                    sections={reportSections(viewing)}
                    nativeExports={[{ label: "PPTX", url: `/api/v1/projects/${id}/prince2/highlight-reports/${viewing.id}/export/pptx/`, filename: `highlight-report-${viewing.id}.pptx` }]}
                  />
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                {/* Cover / header */}
                <div className="grid grid-cols-2 gap-3 border rounded-md p-3">
                  {[["Sponsor", viewing.sponsor], ["Project Manager", viewing.project_manager], ["Senior Supplier", viewing.senior_supplier], ["Period", `${viewing.period_start || "—"} → ${viewing.period_end || "—"}`]].map(([k, v]) => (
                    <div key={k as string}><span className="text-xs text-muted-foreground">{pt(k as string)}</span><p className="font-medium">{(v as string) || "—"}</p></div>
                  ))}
                </div>
                {viewing.objectives && <div><span className="text-xs text-muted-foreground">{pt("Objectives")}</span><p className="whitespace-pre-wrap">{viewing.objectives}</p></div>}

                {/* 4-axis RAG */}
                <div className="flex flex-wrap gap-2">
                  {(["overall_status", "rag_budget", "rag_planning", "rag_resources"] as const).map((k) => (
                    <Badge key={k} className={`${statusColor(viewing[k])}`}>{({ overall_status: "Overall", rag_budget: "Budget", rag_planning: "Planning", rag_resources: "Resources" }[k])}: {viewing[k]}</Badge>
                  ))}
                </div>

                {/* Phase timeline */}
                {Array.isArray(viewing.phase_timeline) && viewing.phase_timeline.some((p: any) => p.start || p.end) && (
                  <div><span className="text-xs text-muted-foreground">{pt("Phase Timeline")}</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {viewing.phase_timeline.map((p: any, i: number) => (
                        <Badge key={i} variant="outline" className={p.status === "done" ? "border-green-400 text-green-700" : p.status === "active" ? "border-blue-400 text-blue-700" : ""}>{p.phase} {p.start || "—"}→{p.end || "—"}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Financials (cost-gated by SC-05; shown to finance roles) */}
                {(viewing.budget_spent != null || viewing.budget_forecast != null) && (
                  <div className="grid grid-cols-2 gap-3 border rounded-md p-3">
                    <div><span className="text-xs text-muted-foreground">{pt("Budget spent")}</span><p className="font-medium">{viewing.budget_spent ?? "—"}</p></div>
                    <div><span className="text-xs text-muted-foreground">{pt("Budget forecast")}</span><p className="font-medium">{viewing.budget_forecast ?? "—"}</p></div>
                  </div>
                )}

                {/* Narrative sections */}
                {([["Status Summary", "status_summary"], ["Work Completed", "work_completed"], ["Highlights", "highlights"], ["Lowlights", "lowlights"], ["Work Planned Next Period", "work_planned_next_period"], ["Issues", "issues_summary"], ["Risks", "risks_summary"]] as const).map(([label, key]) => (
                  viewing[key] ? (
                    <div key={key}><span className="text-xs font-semibold">{pt(label)}</span><p className="whitespace-pre-wrap text-muted-foreground">{viewing[key]}</p></div>
                  ) : null
                ))}

                <div className="flex justify-end gap-2 border-t pt-3">
                  <Button variant="outline" onClick={() => { const r = viewing; setViewing(null); openEdit(r); }} className="gap-2"><Pencil className="h-4 w-4" />{pt("Edit")}</Button>
                  <Button onClick={() => setViewing(null)}>{pt("Close")}</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Prince2HighlightReport;
