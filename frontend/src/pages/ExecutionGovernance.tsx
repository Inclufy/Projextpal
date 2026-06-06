import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ProjectHeader } from "@/components/ProjectHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReportExportMenu } from "@/components/ReportExportMenu";
import { Save, Loader2, Building2, Users, Plus, Trash2, Calendar } from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { toast } from "sonner";

const ExecutionGovernance = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [meetingCadence, setMeetingCadence] = useState("");
  const [changeProcess, setChangeProcess] = useState("");
  const [structure, setStructure] = useState<{ role: string; name: string }[]>([]);

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };
  const BASE = "/api/v1/execution/governance/";

  const hydrate = (g: any) => {
    setRecord(g);
    setMeetingCadence(g?.meeting_cadence || "");
    setChangeProcess(g?.change_control_process || "");
    const raw = Array.isArray(g?.structure_data) ? g.structure_data : [];
    setStructure(raw.map((x: any) => ({ role: x.role || x.title || "", name: x.name || x.person || "" })));
  };

  const fetchData = async () => {
    try {
      const r = await fetch(`${BASE}?project=${id}`, { headers });
      if (r.ok) { const d = await r.json(); const arr = Array.isArray(d) ? d : d.results || []; hydrate(arr[0] || null); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [id]);

  const addRow = () => setStructure((s) => [...s, { role: "", name: "" }]);
  const setRow = (i: number, k: "role" | "name", v: string) => setStructure((s) => s.map((r, idx) => idx === i ? { ...r, [k]: v } : r));
  const delRow = (i: number) => setStructure((s) => s.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    setSaving(true);
    try {
      // Preserve JSON fields we don't edit here (impact/risks/decision rights).
      const body: any = {
        project: Number(id),
        meeting_cadence: meetingCadence,
        change_control_process: changeProcess,
        structure_data: structure.filter((r) => r.role || r.name),
        impact_data: record?.impact_data ?? {},
        risks_data: record?.risks_data ?? [],
        decision_rights: record?.decision_rights ?? {},
      };
      const url = record ? `${BASE}${record.id}/` : BASE;
      const r = await fetch(url, { method: record ? "PATCH" : "POST", headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) { const d = await r.json(); hydrate(d); toast.success(pt("Saved")); }
      else { const d = await r.json().catch(() => ({})); toast.error(d.detail || JSON.stringify(d).slice(0, 120) || pt("Save failed")); }
    } catch { toast.error(pt("Save failed")); }
    finally { setSaving(false); }
  };

  const exportSections = [
    { heading: "Governance", rows: [["Meeting cadence", meetingCadence || "—"], ["Change control", changeProcess || "—"]] as [string, any][] },
    { heading: "Governance structure", rows: structure.map((r) => [r.role, r.name]) as [string, any][] },
  ];

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-slate-600" />
            <h1 className="text-2xl font-bold">{pt("Governance")}</h1>
          </div>
          <div className="flex gap-2">
            <ReportExportMenu title="Governance" sections={exportSections} />
            <Button onClick={handleSave} disabled={saving} className="gap-2">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{pt("Save")}</Button>
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" />{pt("Governance Structure")}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {structure.length === 0 && <p className="text-sm text-muted-foreground">{pt("No roles defined yet.")}</p>}
            {structure.map((r, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Input placeholder={pt("Role (e.g. Sponsor)")} value={r.role} onChange={(e) => setRow(i, "role", e.target.value)} />
                <Input placeholder={pt("Name")} value={r.name} onChange={(e) => setRow(i, "name", e.target.value)} />
                <Button variant="ghost" size="sm" onClick={() => delRow(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="gap-1" onClick={addRow}><Plus className="h-4 w-4" />{pt("Add Role")}</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Calendar className="h-4 w-4" />{pt("Cadence & Change Control")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>{pt("Meeting Cadence")}</Label><Input placeholder={pt("e.g. Weekly project board, monthly steering")} value={meetingCadence} onChange={(e) => setMeetingCadence(e.target.value)} /></div>
            <div className="space-y-2"><Label>{pt("Change Control Process")}</Label><textarea className="w-full min-h-[100px] px-3 py-2 border rounded-md bg-background" placeholder={pt("How changes are raised, assessed and approved")} value={changeProcess} onChange={(e) => setChangeProcess(e.target.value)} /></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExecutionGovernance;
