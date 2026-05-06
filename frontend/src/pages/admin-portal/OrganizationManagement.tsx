import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Building2, Pencil, Search, Users } from "lucide-react";
import { toast } from "sonner";

const OrganizationManagement = () => {
  const navigate = useNavigate();
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", domain: "", plan: "" });
  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchOrgs = async () => {
    setLoading(true);
    try {
      const params = search ? `?search=${search}` : "";
      const r = await fetch(`/api/v1/admin/tenants/${params}`, { headers });
      if (r.ok) { const d = await r.json(); setOrgs(Array.isArray(d) ? d : d.results || []); }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };
  useEffect(() => { fetchOrgs(); }, []);

  const openEdit = (o: any) => { setEditing(o); setForm({ name: o.name || "", domain: o.domain || "", plan: o.plan?.name || o.plan || "" }); setDialogOpen(true); };
  const openCreate = () => navigate("/admin/tenants/new");
  const handleSave = async () => {
    if (!form.name) { toast.error("Naam verplicht"); return; }
    setSubmitting(true);
    try {
      const url = editing ? `/api/v1/admin/tenants/${editing.id}/` : `/api/v1/admin/tenants/`;
      const method = editing ? "PATCH" : "POST";
      const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(form) });
      if (r.ok) { toast.success("Opgeslagen"); setDialogOpen(false); fetchOrgs(); } else toast.error("Opslaan mislukt");
    } catch { toast.error("Opslaan mislukt"); } finally { setSubmitting(false); }
  };

  const filtered = search ? orgs.filter(o => o.name?.toLowerCase().includes(search.toLowerCase()) || o.domain?.toLowerCase().includes(search.toLowerCase())) : orgs;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><Building2 className="h-6 w-6 text-green-500" /><h1 className="text-2xl font-bold">Organizations</h1><Badge variant="outline">{orgs.length}</Badge></div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Organization</Button>
      </div>

      <div className="flex gap-2"><Input placeholder="Search organizations..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchOrgs()} className="max-w-sm" /><Button variant="outline" onClick={fetchOrgs}><Search className="h-4 w-4" /></Button></div>

      {loading ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div> : filtered.length === 0 ? <Card className="p-8 text-center text-muted-foreground">No organizations found</Card> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{filtered.map(o => (
          <Card key={o.id} className="hover:shadow-md transition-shadow"><CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2"><div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center"><Building2 className="h-5 w-5 text-green-600" /></div><div><p className="font-semibold">{o.name}</p>{o.domain && <p className="text-xs text-muted-foreground">{o.domain}</p>}</div></div>
              <Button variant="ghost" size="sm" onClick={() => openEdit(o)}><Pencil className="h-3.5 w-3.5" /></Button>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {o.plan && <Badge variant="outline" className="text-xs">{typeof o.plan === "object" ? o.plan.name : o.plan}</Badge>}
              {o.users_count != null && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Users className="h-3 w-3" />{o.users_count}</span>}
              {o.is_active !== undefined && <Badge variant={o.is_active ? "default" : "secondary"} className="text-xs">{o.is_active ? "Active" : "Inactive"}</Badge>}
            </div>
            {o.created_at && <p className="text-xs text-muted-foreground mt-2">Created: {o.created_at.split("T")[0]}</p>}
          </CardContent></Card>
        ))}</div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Organization</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="space-y-2"><Label>Domain</Label><Input value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} placeholder="company.com" /></div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Save</Button></div>
        </div>
      </DialogContent></Dialog>
    </div>
  );
};

export default OrganizationManagement;
