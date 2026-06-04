import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, CheckSquare, Pencil, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";

const ScrumDefinitionOfDone = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ item: "", name: "General", description: "", is_active: true });
  const [sprints, setSprints] = useState<any[]>([]);
  const [selectedSprint, setSelectedSprint] = useState<string>("");
  const [entries, setEntries] = useState<any[]>([]);

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => { try { const r = await fetch(`/api/v1/projects/${id}/scrum/dod/`, { headers }); if (r.ok) { const d = await r.json(); setItems(Array.isArray(d) ? d : d.results || []); } } catch (err) { console.error(err); } finally { setLoading(false); } };
  const fetchSprints = async () => { try { const r = await fetch(`/api/v1/projects/${id}/scrum/sprints/`, { headers }); if (r.ok) { const d = await r.json(); setSprints(Array.isArray(d) ? d : d.results || []); } } catch (err) { console.error(err); } };
  useEffect(() => { fetchData(); fetchSprints(); }, [id]);

  // When a sprint is picked, sync entries (idempotent) then load them to tick.
  const loadEntries = async (sprintId: string) => {
    if (!sprintId) { setEntries([]); return; }
    try {
      const s = await fetch(`/api/v1/projects/${id}/scrum/dod-entries/sync/`, { method: "POST", headers: jsonHeaders, body: JSON.stringify({ sprint: sprintId }) });
      if (s.ok) { const d = await s.json(); setEntries(d.entries || []); }
    } catch { toast.error(pt("Load failed")); }
  };
  useEffect(() => { loadEntries(selectedSprint); }, [selectedSprint, items.length]);

  const toggleEntry = async (entryId: number) => {
    try {
      const r = await fetch(`/api/v1/projects/${id}/scrum/dod-entries/${entryId}/toggle/`, { method: "POST", headers: jsonHeaders });
      if (r.ok) { const updated = await r.json(); setEntries(prev => prev.map(e => e.id === entryId ? updated : e)); }
      else toast.error(pt("Action failed"));
    } catch { toast.error(pt("Action failed")); }
  };

  const initDefaults = async () => { try { const r = await fetch(`/api/v1/projects/${id}/scrum/dod/initialize_defaults/`, { method: "POST", headers: jsonHeaders }); if (r.ok) { toast.success(pt("Initialized")); fetchData(); } else toast.error(pt("Initialize failed")); } catch { toast.error(pt("Initialize failed")); } };

  const openCreate = () => { setEditing(null); setForm({ item: "", name: "General", description: "", is_active: true }); setDialogOpen(true); };
  const openEdit = (it: any) => { setEditing(it); setForm({ item: it.item || "", name: it.name || "General", description: it.description || "", is_active: it.is_active !== false }); setDialogOpen(true); };

  const handleSave = async () => { if (!form.item) { toast.error(pt("Criterion is required")); return; } setSubmitting(true); try { const url = editing ? `/api/v1/projects/${id}/scrum/dod/${editing.id}/` : `/api/v1/projects/${id}/scrum/dod/`; const method = editing ? "PATCH" : "POST"; const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(form) }); if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); } else toast.error(pt("Save failed")); } catch { toast.error(pt("Save failed")); } finally { setSubmitting(false); } };
  const handleDelete = async (dId: number) => { if (!confirm(pt("Are you sure you want to delete this?"))) return; try { const r = await fetch(`/api/v1/projects/${id}/scrum/dod/${dId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); } } catch { toast.error(pt("Delete failed")); } };

  const categories = [...new Set(items.map(i => i.name || "General"))];

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><CheckSquare className="h-6 w-6 text-green-500" /><h1 className="text-2xl font-bold">{pt("Definition of Done")}</h1><Badge variant="outline">{items.length}</Badge></div>
          <div className="flex gap-2">{items.length === 0 && <Button variant="outline" onClick={initDefaults} className="gap-2"><Zap className="h-4 w-4" /> Initialize</Button>}<Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("Add")}</Button></div>
        </div>

        {items.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><CheckSquare className="h-4 w-4 text-green-500" /> {pt("Sprint conformance")}</CardTitle>
              <CardDescription className="text-xs">{pt("Tick each criterion for a sprint. Work cannot be marked Done until all active criteria are met.")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <select className="w-full md:w-72 px-3 py-2 border rounded-md bg-background text-sm" value={selectedSprint} onChange={(e) => setSelectedSprint(e.target.value)}>
                <option value="">{pt("Select a sprint…")}</option>
                {sprints.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              {selectedSprint && (
                entries.length === 0
                  ? <p className="text-sm text-muted-foreground">{pt("No active criteria to track.")}</p>
                  : <div className="space-y-1">
                      {entries.sort((a, b) => (a.dod_item_order || 0) - (b.dod_item_order || 0)).map(e => (
                        <label key={e.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer text-sm">
                          <input type="checkbox" checked={!!e.completed} onChange={() => toggleEntry(e.id)} />
                          <span className={e.completed ? "line-through text-muted-foreground" : ""}>{e.dod_item_text}</span>
                          {e.completed && e.completed_by_name && <span className="text-xs text-muted-foreground ml-auto">✓ {e.completed_by_name}</span>}
                        </label>
                      ))}
                    </div>
              )}
            </CardContent>
          </Card>
        )}

        {items.length === 0 ? <Card className="p-8 text-center"><CheckSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">{pt("No DoD criteria yet")}</h3><Button onClick={initDefaults}><Zap className="h-4 w-4 mr-2" /> Initialize Defaults</Button></Card> : (
          <div className="space-y-4">{categories.map(cat => (
            <Card key={cat}><CardHeader className="pb-2"><CardTitle className="text-sm capitalize">{cat}</CardTitle></CardHeader>
              <CardContent className="space-y-1">{items.filter(i => (i.name || "General") === cat).map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                  <div className="flex items-center gap-2"><CheckSquare className="h-4 w-4 text-green-500" /><span className="text-sm">{item.item}</span>{item.is_active && <Badge variant="secondary" className="text-xs">Active</Badge>}</div>
                  <div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => openEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></div>
                </div>
              ))}</CardContent>
            </Card>
          ))}</div>
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? pt("Edit") : pt("Add")} DoD Item</DialogTitle><DialogDescription>{editing ? pt("Edit definition of done item") : pt("Add a new definition of done item")}</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>{pt("Criterion")} *</Label><Input value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} /></div>
          <div className="space-y-2"><Label>{pt("Description")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="space-y-2"><Label>{pt("Category")}</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="flex items-center gap-2"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /><Label>Active</Label></div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div>
        </div>
      </DialogContent></Dialog>
    </div>
  );
};

export default ScrumDefinitionOfDone;
