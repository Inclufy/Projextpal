import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Route, BookOpen, Award, Layers, ChevronDown, ChevronRight, Plus, Trash2, GraduationCap, FlaskConical, Star } from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const TYPE_ICON: Record<string, any> = { course: BookOpen, microlearning: BookOpen, module: Layers, lesson: BookOpen, exam: FlaskConical };

const AcademyLearningPaths = () => {
  const { pt } = usePageTranslations();
  const { user } = useAuth();
  const isAdmin = (user as any)?.role === "admin" || (user as any)?.role === "superadmin" || (user as any)?.is_superuser;
  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const [paths, setPaths] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [newOpen, setNewOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", active: true, leads_to_certificate: false });
  const [itemForm, setItemForm] = useState<Record<string, { item_type: string; label: string; course: string }>>({});

  const arr = (d: any) => (Array.isArray(d) ? d : d.results || []);
  const load = async () => {
    try {
      const [p, c] = await Promise.all([
        fetch("/api/v1/academy/learning-paths/", { headers }),
        fetch("/api/v1/academy/courses/", { headers }),
      ]);
      if (p.ok) setPaths(arr(await p.json()));
      if (c.ok) setCourses(arr(await c.json()));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const createPath = async () => {
    if (!form.title.trim()) { toast.error(pt("Enter a title")); return; }
    const r = await fetch("/api/v1/academy/learning-paths/", { method: "POST", headers: jsonHeaders, body: JSON.stringify(form) });
    if (r.ok) { toast.success(pt("Path created")); setNewOpen(false); setForm({ title: "", description: "", active: true, leads_to_certificate: false }); load(); }
    else { const d = await r.json().catch(() => ({})); toast.error(d.detail || pt("Failed")); }
  };
  const delPath = async (id: string) => {
    if (!confirm(pt("Delete this path?"))) return;
    const r = await fetch(`/api/v1/academy/learning-paths/${id}/`, { method: "DELETE", headers });
    if (r.ok || r.status === 204) { toast.success(pt("Deleted")); load(); }
  };
  const addItem = async (pathId: string) => {
    const f = itemForm[pathId] || { item_type: "course", label: "", course: "" };
    const body: any = { item_type: f.item_type, label: f.label };
    if (f.item_type === "course" && f.course) body.course = f.course;
    if (!f.label && !f.course) { toast.error(pt("Add a course or a label")); return; }
    const r = await fetch(`/api/v1/academy/learning-paths/${pathId}/add_item/`, { method: "POST", headers: jsonHeaders, body: JSON.stringify(body) });
    if (r.ok) { setItemForm({ ...itemForm, [pathId]: { item_type: "course", label: "", course: "" } }); load(); }
    else toast.error(pt("Failed"));
  };
  const delItem = async (pathId: string, itemId: string) => {
    const r = await fetch(`/api/v1/academy/learning-paths/${pathId}/items/${itemId}/`, { method: "DELETE", headers });
    if (r.ok || r.status === 204) load();
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  const totalItems = paths.reduce((s, p) => s + (p.item_count || (p.items?.length ?? 0)), 0);
  const activeCount = paths.filter((p) => p.active).length;
  const withCert = paths.filter((p) => p.leads_to_certificate).length;
  const tiles = [
    { label: pt("Total paths"), value: paths.length, icon: Route },
    { label: pt("Active"), value: activeCount, icon: Layers },
    { label: pt("With certificate"), value: withCert, icon: Award },
    { label: pt("Total items"), value: totalItems, icon: BookOpen },
  ];

  return (
    <div className="min-h-full bg-background w-full px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center text-white"><Route className="h-5 w-5" /></div>
          <div>
            <h1 className="text-2xl font-bold">{pt("Learning Paths")}</h1>
            <p className="text-sm text-muted-foreground">{pt("Structured tracks (ordered items + awarded skills) that lead to a certificate.")}</p>
          </div>
        </div>
        {isAdmin && <Button onClick={() => setNewOpen(true)} className="gap-2"><Plus className="h-4 w-4" />{pt("New path")}</Button>}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tiles.map((t) => { const Icon = t.icon; return (
          <Card key={t.label} className="p-4"><div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3"><Icon className="h-5 w-5" /></div><div className="text-2xl font-bold">{t.value}</div><div className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wide">{t.label}</div></Card>
        ); })}
      </div>

      {paths.length === 0 ? (
        <Card className="p-8 text-center"><Route className="h-12 w-12 mx-auto text-muted-foreground mb-3" /><h3 className="text-lg font-semibold mb-1">{pt("No learning paths yet")}</h3>{isAdmin && <Button className="mt-2" onClick={() => setNewOpen(true)}><Plus className="h-4 w-4 mr-2" />{pt("New path")}</Button>}</Card>
      ) : (
        <div className="space-y-4">
          {paths.map((p) => {
            const isOpen = open[p.id] ?? false;
            const f = itemForm[p.id] || { item_type: "course", label: "", course: "" };
            return (
              <Card key={p.id} className="overflow-hidden">
                <div className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-accent/30" onClick={() => setOpen({ ...open, [p.id]: !isOpen })}>
                  {isOpen ? <ChevronDown className="h-5 w-5 mt-0.5 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 mt-0.5 text-muted-foreground" />}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">{p.title}</div>
                    {p.description && <div className="text-sm text-muted-foreground">{p.description}</div>}
                  </div>
                  <Badge variant="outline" className="text-xs">{p.item_count ?? p.items?.length ?? 0} {pt("items")}</Badge>
                  {p.active && <Badge className="bg-green-100 text-green-700 text-[10px]">{pt("Active")}</Badge>}
                  {p.leads_to_certificate && <Award className="h-4 w-4 text-amber-500" />}
                  {isAdmin && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); delPath(p.id); }}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>}
                </div>

                {isOpen && (
                  <div className="px-4 pb-4 space-y-3 border-t pt-3">
                    {/* skills awarded */}
                    {p.skills?.length > 0 && (
                      <div className="rounded-lg border border-indigo-100 bg-indigo-50/40 p-3">
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-indigo-600 mb-2 flex items-center gap-1.5"><Star className="h-3.5 w-3.5" />{pt("Skills this path awards")}</div>
                        <div className="flex flex-wrap gap-1.5">
                          {p.skills.map((s: any) => <Badge key={s.id} variant="secondary" className="text-[10px]">{s.name}</Badge>)}
                        </div>
                      </div>
                    )}
                    {/* items */}
                    <div className="space-y-1.5">
                      {(p.items || []).map((it: any) => { const Icon = TYPE_ICON[it.item_type] || BookOpen; return (
                        <div key={it.id} className="flex items-center gap-3 rounded-md border px-3 py-2">
                          <Icon className="h-4 w-4 text-purple-500 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{it.label || it.course_title || it.ref_id || it.item_type}</div>
                            <div className="text-[11px] text-muted-foreground capitalize">{it.item_type}{it.course_title && it.label ? ` · ${it.course_title}` : ""}</div>
                          </div>
                          {isAdmin && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => delItem(p.id, it.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>}
                        </div>
                      ); })}
                      {(p.items || []).length === 0 && <div className="text-sm text-muted-foreground py-2">{pt("No items yet.")}</div>}
                    </div>
                    {/* add item */}
                    {isAdmin && (
                      <div className="flex flex-wrap items-end gap-2 border-t pt-3">
                        <Select value={f.item_type} onValueChange={(v) => setItemForm({ ...itemForm, [p.id]: { ...f, item_type: v } })}>
                          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="course">{pt("Course")}</SelectItem>
                            <SelectItem value="microlearning">{pt("Microlearning")}</SelectItem>
                            <SelectItem value="module">{pt("Module")}</SelectItem>
                            <SelectItem value="exam">{pt("Exam")}</SelectItem>
                          </SelectContent>
                        </Select>
                        {f.item_type === "course" ? (
                          <Select value={f.course} onValueChange={(v) => setItemForm({ ...itemForm, [p.id]: { ...f, course: v } })}>
                            <SelectTrigger className="w-64"><SelectValue placeholder={pt("Pick a course")} /></SelectTrigger>
                            <SelectContent>{courses.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>)}</SelectContent>
                          </Select>
                        ) : (
                          <Input className="w-64" placeholder={pt("Label (e.g. Module 1 — ...)")} value={f.label} onChange={(e) => setItemForm({ ...itemForm, [p.id]: { ...f, label: e.target.value } })} />
                        )}
                        <Button size="sm" className="gap-1.5" onClick={() => addItem(p.id)}><Plus className="h-3.5 w-3.5" />{pt("Add item")}</Button>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* New path dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{pt("New learning path")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>{pt("Title")}</Label><Input autoFocus value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Description")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="flex items-center justify-between"><Label>{pt("Active")}</Label><Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} /></div>
            <div className="flex items-center justify-between"><Label className="flex items-center gap-1.5"><Award className="h-4 w-4 text-amber-500" />{pt("Leads to a certificate")}</Label><Switch checked={form.leads_to_certificate} onCheckedChange={(v) => setForm({ ...form, leads_to_certificate: v })} /></div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setNewOpen(false)}>{pt("Cancel")}</Button><Button onClick={createPath} disabled={!form.title.trim()}>{pt("Create")}</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AcademyLearningPaths;
