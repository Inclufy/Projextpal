import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProjectHeader } from "@/components/ProjectHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReportExportMenu } from "@/components/ReportExportMenu";
import { Loader2, ScrollText, Euro, Calendar, Users, Target, FileText, ArrowRight, Pencil, Save, X, Download } from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { toast } from "sonner";

const FoundationCharter = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };

  const PLAN_FIELDS = ["scope_in", "scope_out", "problem_impact", "proposed_solution", "roi_target_pct", "target_implementation_date"];
  const initForm = (p: any) => {
    const f: any = {};
    PLAN_FIELDS.forEach((k) => { f[k] = p?.[k] ?? ""; });
    setForm(f);
  };
  const saveDetails = async () => {
    setSaving(true);
    try {
      const body: any = {
        scope_in: form.scope_in || "", scope_out: form.scope_out || "",
        problem_impact: form.problem_impact || "", proposed_solution: form.proposed_solution || "",
        roi_target_pct: form.roi_target_pct === "" || form.roi_target_pct == null ? null : Number(form.roi_target_pct),
        target_implementation_date: form.target_implementation_date || null,
      };
      const r = await fetch(`/api/v1/projects/${id}/`, {
        method: "PATCH", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      if (r.ok) { const p = await r.json(); setProject(p); initForm(p); setEditing(false); toast.success(pt("Project details saved.")); }
      else { const e = await r.json().catch(() => ({})); toast.error(typeof e === "object" ? JSON.stringify(e) : pt("Save failed")); }
    } catch { toast.error(pt("Save failed")); }
    finally { setSaving(false); }
  };

  useEffect(() => {
    (async () => {
      try {
        const [p, s] = await Promise.all([
          fetch(`/api/v1/projects/${id}/`, { headers }),
          fetch(`/api/v1/execution/stakeholders/?project=${id}`, { headers }),
        ]);
        if (p.ok) { const pj = await p.json(); setProject(pj); initForm(pj); }
        if (s.ok) { const d = await s.json(); setSponsors((Array.isArray(d) ? d : d.results || []).filter((x: any) => x.governance_type === "Sponsor")); }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const downloadPdf = async () => {
    const p = project; if (!p) return;
    const esc = (s: any) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const logo = p.company_logo || null;
    const row = (k: string, v: any) => v ? `<tr><td style="padding:4px 10px 4px 0;color:#6b7280;white-space:nowrap">${esc(k)}</td><td style="padding:4px 0">${esc(v)}</td></tr>` : "";
    const blk = (t: string, v: any) => v ? `<h3 style="margin:16px 0 4px;font-size:14px;color:#6d28d9">${esc(t)}</h3><p style="white-space:pre-wrap;margin:0">${esc(v)}</p>` : "";
    const node = document.createElement("div");
    node.style.cssText = "position:fixed;left:-9999px;top:0;width:760px;background:#fff;color:#1f2937;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5";
    node.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;background:linear-gradient(90deg,#d97706,#7c3aed);color:#fff;padding:18px 22px">
        <div><div style="font-size:20px;font-weight:700">Project Charter</div><div style="opacity:.85;font-size:12px">${esc(p.name || "")}</div></div>
        ${logo ? `<img src="${logo}" crossorigin="anonymous" style="max-height:46px;max-width:160px;background:#fff;border-radius:6px;padding:4px"/>` : `<div style="font-weight:700">ProjeXtPal</div>`}
      </div>
      <div style="padding:18px 22px">
        <table style="border-collapse:collapse">${row("Status", p.status)}${row("Methodology", p.methodology)}${row("Start", p.start_date)}${row("Target implementation", p.target_implementation_date)}${row("End", p.end_date)}${row("ROI target", p.roi_target_pct != null ? p.roi_target_pct + "%" : "")}${row("Sponsors", sponsors.map((s: any) => s.name).join(", "))}</table>
        ${blk("Mandate / Description", p.description)}
        ${blk("In scope", p.scope_in)}
        ${blk("Out of scope", p.scope_out)}
        ${blk("Impact", p.problem_impact)}
        ${blk("Proposed solution", p.proposed_solution)}
        <p style="color:#9ca3af;font-size:10px;margin-top:18px">Generated by ProjeXtPal</p>
      </div>`;
    document.body.appendChild(node);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
      const canvas = await html2canvas(node, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const pdf = new jsPDF("p", "mm", "a4");
      const pageW = 210, pageH = 297;
      const imgH = (canvas.height * pageW) / canvas.width;
      const img = canvas.toDataURL("image/png");
      let heightLeft = imgH, position = 0;
      pdf.addImage(img, "PNG", 0, position, pageW, imgH); heightLeft -= pageH;
      while (heightLeft > 0) { position -= pageH; pdf.addPage(); pdf.addImage(img, "PNG", 0, position, pageW, imgH); heightLeft -= pageH; }
      pdf.save(`charter-${(p.name || "project").replace(/[^\w.-]+/g, "_")}.pdf`);
    } catch { toast.error(pt("PDF export failed")); }
    finally { document.body.removeChild(node); }
  };

  // PP-09 — Project Plan DOCX export (Yanmar template), auth'd blob download.
  const downloadDocx = async () => {
    if (!id) return;
    try {
      const token = localStorage.getItem("access_token");
      const r = await fetch(`/api/v1/projects/${id}/export/project-plan.docx`, { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) { toast.error(pt("Export failed")); return; }
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `project-plan-${(project?.name || "project").replace(/[^\w.-]+/g, "_")}.docx`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch { toast.error(pt("Export failed")); }
  };

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  const fmtMoney = (v: any, c?: string) => v != null ? `${c || "EUR"} ${Number(v).toLocaleString()}` : "—";
  const row = (label: string, value: any) => (
    <div className="flex justify-between py-2 border-b last:border-0"><span className="text-sm text-muted-foreground">{label}</span><span className="text-sm font-medium text-right">{value || "—"}</span></div>
  );

  const exportSections = [
    { heading: "Project Charter", rows: [
      ["Project", project?.name], ["Status", project?.status], ["Methodology", project?.methodology],
      ["Budget", fmtMoney(project?.budget, project?.currency)],
      ["Start", project?.start_date], ["End", project?.end_date],
      ["Sponsors", sponsors.map((s) => s.name).join(", ") || "—"],
    ] as [string, any][] },
    { heading: "Description / Mandate", text: project?.description || "—" },
  ];

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-4 md:p-6 space-y-6 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ScrollText className="h-6 w-6 text-amber-600" />
            <div>
              <h1 className="text-2xl font-bold">{pt("Project Charter")}</h1>
              <p className="text-sm text-muted-foreground">{pt("The project's mandate, scope and authority — composed from live project data.")}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={downloadPdf}><Download className="h-4 w-4" />{pt("Download PDF")}</Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={downloadDocx}><FileText className="h-4 w-4" />{pt("Project Plan (.docx)")}</Button>
            <ReportExportMenu title={`Charter — ${project?.name || ""}`} sections={exportSections} />
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4" />{pt("Project Definition")}</CardTitle></CardHeader>
          <CardContent>
            {row(pt("Project name"), project?.name)}
            {row(pt("Status"), project?.status && <Badge variant="outline">{project.status}</Badge>)}
            {row(pt("Methodology"), project?.methodology && <Badge variant="secondary">{project.methodology}</Badge>)}
            {project?.description && (
              <div className="pt-3"><p className="text-sm text-muted-foreground mb-1">{pt("Mandate / Description")}</p><p className="text-sm whitespace-pre-wrap">{project.description}</p></div>
            )}
          </CardContent>
        </Card>

        {/* Project Plan details — scope (in/out), impact, solution, ROI, target
            implementation date. Editable (QW-1), maps the Yanmar Project Plan. */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" />{pt("Project Plan Details")}</CardTitle>
            {editing ? (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="gap-1" onClick={() => { initForm(project); setEditing(false); }}><X className="h-3.5 w-3.5" />{pt("Cancel")}</Button>
                <Button size="sm" className="gap-1" disabled={saving} onClick={saveDetails}>{saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}{pt("Save")}</Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" className="gap-1" onClick={() => setEditing(true)}><Pencil className="h-3.5 w-3.5" />{pt("Edit")}</Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {editing ? (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1"><Label>{pt("In scope")}</Label><Textarea rows={3} value={form.scope_in} onChange={(e) => setForm({ ...form, scope_in: e.target.value })} placeholder={pt("What this project will deliver")} /></div>
                  <div className="space-y-1"><Label>{pt("Out of scope")}</Label><Textarea rows={3} value={form.scope_out} onChange={(e) => setForm({ ...form, scope_out: e.target.value })} placeholder={pt("Explicitly NOT included")} /></div>
                </div>
                <div className="space-y-1"><Label>{pt("Impact (if problem)")}</Label><Textarea rows={2} value={form.problem_impact} onChange={(e) => setForm({ ...form, problem_impact: e.target.value })} placeholder={pt("Impact of not resolving the problem")} /></div>
                <div className="space-y-1"><Label>{pt("Proposed solution")}</Label><Textarea rows={2} value={form.proposed_solution} onChange={(e) => setForm({ ...form, proposed_solution: e.target.value })} /></div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1"><Label>{pt("ROI target (%)")}</Label><Input type="number" value={form.roi_target_pct} onChange={(e) => setForm({ ...form, roi_target_pct: e.target.value })} /></div>
                  <div className="space-y-1"><Label>{pt("Target implementation date")}</Label><Input type="date" value={form.target_implementation_date || ""} onChange={(e) => setForm({ ...form, target_implementation_date: e.target.value })} /></div>
                </div>
              </>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <div><p className="text-xs text-muted-foreground mb-1">{pt("In scope")}</p><p className="text-sm whitespace-pre-wrap">{project?.scope_in || "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground mb-1">{pt("Out of scope")}</p><p className="text-sm whitespace-pre-wrap">{project?.scope_out || "—"}</p></div>
                </div>
                {project?.problem_impact && <div><p className="text-xs text-muted-foreground mb-1">{pt("Impact")}</p><p className="text-sm whitespace-pre-wrap">{project.problem_impact}</p></div>}
                {project?.proposed_solution && <div><p className="text-xs text-muted-foreground mb-1">{pt("Proposed solution")}</p><p className="text-sm whitespace-pre-wrap">{project.proposed_solution}</p></div>}
                <div className="grid md:grid-cols-2 gap-x-8 pt-1">
                  {row(pt("ROI target"), project?.roi_target_pct != null ? `${project.roi_target_pct}%` : null)}
                  {row(pt("Target implementation date"), project?.target_implementation_date)}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Calendar className="h-4 w-4" />{pt("Timeline")}</CardTitle></CardHeader>
            <CardContent>
              {row(pt("Start date"), project?.start_date)}
              {row(pt("End date"), project?.end_date)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Euro className="h-4 w-4" />{pt("Budget")}</CardTitle></CardHeader>
            <CardContent>{row(pt("Authorised budget"), fmtMoney(project?.budget, project?.currency))}</CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" />{pt("Sponsors & Authority")}</CardTitle></CardHeader>
          <CardContent>
            {sponsors.length === 0 ? (
              <p className="text-sm text-muted-foreground">{pt("No sponsor recorded yet.")} <button className="text-primary underline" onClick={() => navigate(`/projects/${id}/execution/stakeholders`)}>{pt("Add in Stakeholders")}</button></p>
            ) : (
              <div className="space-y-1">
                {sponsors.map((s) => (
                  <div key={s.id} className="flex items-center gap-2 text-sm">
                    <Badge className="bg-violet-100 text-violet-700 text-xs">{s.governance_type}</Badge>
                    <span className="font-medium">{s.name}</span>
                    {s.role && <span className="text-muted-foreground">· {s.role}</span>}
                    {s.contact && <a href={`mailto:${s.contact}`} className="text-muted-foreground hover:underline">· {s.contact}</a>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardContent className="p-4 flex items-center justify-between flex-wrap gap-2">
            <span className="text-sm text-muted-foreground flex items-center gap-2"><FileText className="h-4 w-4" />{pt("Related foundation artifacts")}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1" onClick={() => navigate(`/projects/${id}/prince2/business-case`)}>{pt("Business Case")}<ArrowRight className="h-3 w-3" /></Button>
              <Button variant="outline" size="sm" className="gap-1" onClick={() => navigate(`/projects/${id}/prince2/project-brief`)}>{pt("Project Brief")}<ArrowRight className="h-3 w-3" /></Button>
              <Button variant="outline" size="sm" className="gap-1" onClick={() => navigate(`/projects/${id}/foundation/communication-plan`)}>{pt("Communication Plan")}<ArrowRight className="h-3 w-3" /></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FoundationCharter;
