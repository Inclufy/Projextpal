import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Users, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const AgileTeam = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ user_email: "", role: "developer", skills: "" });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => { try { const r = await fetch(`/api/v1/projects/${id}/agile/team/`, { headers }); if (r.ok) { const d = await r.json(); setMembers(Array.isArray(d) ? d : d.results || []); } } catch (err) { console.error(err); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, [id]);

  const openCreate = () => { setEditing(null); setForm({ user_email: "", role: "developer", skills: "" }); setDialogOpen(true); };
  const openEdit = (m: any) => { setEditing(m); setForm({ user_email: m.user_email || "", role: m.role || "developer", skills: Array.isArray(m.skills) ? m.skills.join(", ") : (m.skills || "") }); setDialogOpen(true); };
  const handleSave = async () => {
    if (!form.user_email) { toast.error("E-mail verplicht"); return; }
    setSubmitting(true);
    try {
      const url = editing ? `/api/v1/projects/${id}/agile/team/${editing.id}/` : `/api/v1/projects/${id}/agile/team/`;
      const method = editing ? "PATCH" : "POST";
      const skillsList = form.skills ? form.skills.split(",").map(s => s.trim()).filter(Boolean) : [];
      const body = { user_email: form.user_email, role: form.role, skills: skillsList };
      const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) { toast.success("Opgeslagen"); setDialogOpen(false); fetchData(); }
      else {
        const err = await r.json().catch(() => null);
        toast.error(err?.error || err?.user_email?.[0] || "Opslaan mislukt");
      }
    } catch { toast.error("Opslaan mislukt"); } finally { setSubmitting(false); }
  };
  const handleDelete = async (mId: number) => { if (!confirm("Verwijderen?")) return; try { const r = await fetch(`/api/v1/projects/${id}/agile/team/${mId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success("Verwijderd"); fetchData(); } } catch { toast.error("Verwijderen mislukt"); } };

  const roleColors: Record<string, string> = { product_owner: "bg-blue-100 text-blue-700", tech_lead: "bg-purple-100 text-purple-700", developer: "bg-green-100 text-green-700", designer: "bg-pink-100 text-pink-700", qa: "bg-amber-100 text-amber-700", devops: "bg-cyan-100 text-cyan-700", analyst: "bg-orange-100 text-orange-700" };

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background"><ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between"><div className="flex items-center gap-3"><Users className="h-6 w-6 text-emerald-500" /><h1 className="text-2xl font-bold">{pt("Team")}</h1><Badge variant="outline">{members.length}</Badge></div><Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("Add Member")}</Button></div>
        {members.length === 0 ? <Card className="p-8 text-center"><Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">{pt("No team members yet")}</h3></Card> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{members.map(m => (
            <Card key={m.id} className="group relative"><CardContent className="p-4">
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1"><Button variant="ghost" size="sm" onClick={() => openEdit(m)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(m.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></div>
              <div className="flex items-center gap-3 mb-2"><div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center"><span className="font-semibold text-emerald-600">{(m.user_name || m.user_email || "?").charAt(0).toUpperCase()}</span></div><div><p className="font-medium">{m.user_name || m.user_email}</p>{m.user_email && <p className="text-xs text-muted-foreground">{m.user_email}</p>}</div></div>
              <Badge className={`text-xs ${roleColors[m.role] || "bg-gray-100 text-gray-700"}`}>{m.role_display || m.role?.replace("_", " ")}</Badge>
              {m.skills && Array.isArray(m.skills) && m.skills.length > 0 && <p className="text-xs text-muted-foreground mt-2">{m.skills.join(", ")}</p>}
            </CardContent></Card>
          ))}</div>
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? pt("Edit") : pt("Add")} Member</DialogTitle><DialogDescription>{editing ? pt("Edit team member details") : pt("Add a new team member by email")}</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>{pt("Email")} *</Label><Input type="email" placeholder="user@example.com" value={form.user_email} onChange={(e) => setForm({ ...form, user_email: e.target.value })} /></div>
          <div className="space-y-2"><Label>{pt("Role")}</Label><Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="product_owner">Product Owner</SelectItem><SelectItem value="tech_lead">Tech Lead</SelectItem><SelectItem value="developer">Developer</SelectItem><SelectItem value="designer">Designer</SelectItem><SelectItem value="qa">QA Engineer</SelectItem><SelectItem value="devops">DevOps</SelectItem><SelectItem value="analyst">Business Analyst</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><Label>Skills</Label><Input placeholder="e.g. React, Python, DevOps" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} /></div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div>
        </div>
      </DialogContent></Dialog>
    </div>
  );
};

export default AgileTeam;
