import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { ProjectHeader } from "@/components/ProjectHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReportExportMenu } from "@/components/ReportExportMenu";
import { Plus, Mail, Send, Trash2, Loader2, Pencil } from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { toast } from "sonner";

const RECIPIENTS: [string, string][] = [
  ["project_team", "Project Team"],
  ["stakeholders", "All Stakeholders"],
  ["steering_committee", "Steering Committee"],
  ["custom", "Custom Recipients"],
  ["mailing_list", "Mailing Lists"],
];
const emptyForm = { subject: "", recipient_type: "project_team", task_update_details: "", additional_content: "" };

const ExecutionNewsletters = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };
  const BASE = "/api/v1/newsletters/newsletters/";

  const fetchData = async () => {
    try {
      const r = await fetch(`${BASE}?project=${id}`, { headers });
      if (r.ok) { const d = await r.json(); setItems(Array.isArray(d) ? d : d.results || []); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [id]);

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm }); setDialogOpen(true); };
  const openEdit = (n: any) => {
    setEditing(n);
    setForm({ subject: n.subject || "", recipient_type: n.recipient_type || "project_team", task_update_details: n.task_update_details || "", additional_content: n.additional_content || "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const body: any = { project: id, subject: form.subject, recipient_type: form.recipient_type, task_update_details: form.task_update_details, additional_content: form.additional_content };
      const url = editing ? `${BASE}${editing.id}/` : BASE;
      const r = await fetch(url, { method: editing ? "PATCH" : "POST", headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); }
      else { const d = await r.json().catch(() => ({})); toast.error(d.detail || d.error || pt("Save failed")); }
    } catch { toast.error(pt("Save failed")); }
    finally { setSubmitting(false); }
  };

  const sendNewsletter = async (n: any) => {
    if (!confirm(pt("Send this newsletter to its recipients?"))) return;
    const r = await fetch(`${BASE}${n.id}/send/`, { method: "POST", headers: jsonHeaders, body: JSON.stringify({}) });
    if (r.ok) { toast.success(pt("Newsletter sent")); fetchData(); }
    else { const d = await r.json().catch(() => ({})); toast.error(d.detail || d.error || pt("Send failed")); }
  };
  const handleDelete = async (nid: any) => {
    if (!confirm(pt("Are you sure you want to delete this?"))) return;
    const r = await fetch(`${BASE}${nid}/`, { method: "DELETE", headers });
    if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); }
  };

  const statusColor = (s: string) => ({ draft: "bg-gray-100 text-gray-600", sent: "bg-green-100 text-green-700", failed: "bg-red-100 text-red-700" }[s] || "bg-gray-100");
  const recLabel = (v: string) => RECIPIENTS.find(([k]) => k === v)?.[1] || v;
  const exportSections = [{ heading: "Newsletters", rows: items.map((n) => [n.subject, `${recLabel(n.recipient_type)} · ${n.status}${n.sent_at ? ` · sent ${n.sent_at.split("T")[0]}` : ""}`]) as [string, any][] }];

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="h-6 w-6 text-blue-500" />
            <h1 className="text-2xl font-bold">{pt("Newsletters")}</h1>
            <Badge variant="outline">{items.length}</Badge>
          </div>
          <div className="flex gap-2">
            {items.length > 0 && <ReportExportMenu title="Newsletters" sections={exportSections} />}
            <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />{pt("New Newsletter")}</Button>
          </div>
        </div>

        {items.length === 0 ? (
          <Card className="p-8 text-center">
            <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{pt("No newsletters yet")}</h3>
            <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />{pt("New Newsletter")}</Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {items.map((n) => (
              <Card key={n.id} className="hover:shadow-md transition-shadow">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{n.subject}</span>
                      <Badge className={`text-xs ${statusColor(n.status)}`}>{n.status}</Badge>
                      <Badge variant="outline" className="text-xs">{recLabel(n.recipient_type)}</Badge>
                      {typeof n.recipient_count === "number" && <span className="text-xs text-muted-foreground">{n.recipient_count} {pt("recipients")}</span>}
                    </div>
                    {n.task_update_details && <p className="text-sm text-muted-foreground line-clamp-2">{n.task_update_details}</p>}
                    {n.sent_at && <p className="text-xs text-muted-foreground mt-1">{pt("Sent")}: {new Date(n.sent_at).toLocaleString()}</p>}
                  </div>
                  <div className="flex gap-1 ml-4">
                    {n.status !== "sent" && <Button variant="ghost" size="sm" title={pt("Send")} onClick={() => sendNewsletter(n)}><Send className="h-4 w-4 text-blue-600" /></Button>}
                    <Button variant="ghost" size="sm" onClick={() => openEdit(n)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(n.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? pt("Edit Newsletter") : pt("New Newsletter")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>{pt("Subject")}</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>{pt("Recipients")}</Label>
              <Select value={form.recipient_type} onValueChange={(v) => setForm({ ...form, recipient_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{RECIPIENTS.map(([v, l]) => <SelectItem key={v} value={v}>{pt(l)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>{pt("Task Update Details")}</Label><textarea className="w-full min-h-[80px] px-3 py-2 border rounded-md bg-background" value={form.task_update_details} onChange={(e) => setForm({ ...form, task_update_details: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Additional Content")}</Label><textarea className="w-full min-h-[80px] px-3 py-2 border rounded-md bg-background" value={form.additional_content} onChange={(e) => setForm({ ...form, additional_content: e.target.value })} /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button>
              <Button onClick={handleSave} disabled={submitting || !form.subject}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExecutionNewsletters;
