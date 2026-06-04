import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Loader2, Plus, Layers, Pencil, Trash2, ListChecks, ChevronDown, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

// Form lives at module scope to avoid the "inner Field re-mounts every render"
// anti-pattern that bit other sprint-yanmar-fit editor pages (input focus loss).
type EpicForm = {
  title: string;
  description: string;
  priority: string;
  color: string;
  product_goal: string;
};

const PRIORITY_COLORS: Record<string, string> = {
  must_have: "bg-red-100 text-red-700",
  should_have: "bg-orange-100 text-orange-700",
  could_have: "bg-yellow-100 text-yellow-700",
  wont_have: "bg-green-100 text-green-700",
};

const ITEM_TYPE_COLORS: Record<string, string> = {
  story: "bg-blue-100 text-blue-700",
  bug: "bg-red-100 text-red-700",
  task: "bg-gray-100 text-gray-700",
  spike: "bg-purple-100 text-purple-700",
};

const COLOR_DOTS: Record<string, string> = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  red: "bg-red-500",
  yellow: "bg-yellow-500",
  purple: "bg-purple-500",
  orange: "bg-orange-500",
  teal: "bg-teal-500",
  pink: "bg-pink-500",
  gray: "bg-gray-500",
};

const AgileEpics = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightEpic = searchParams.get("highlight");

  const [epics, setEpics] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [form, setForm] = useState<EpicForm>({ title: "", description: "", priority: "should_have", color: "blue", product_goal: "none" });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => {
    try {
      const [eRes, bRes, gRes] = await Promise.all([
        fetch(`/api/v1/projects/${id}/agile/epics/`, { headers }),
        fetch(`/api/v1/projects/${id}/agile/backlog/`, { headers }),
        fetch(`/api/v1/projects/${id}/agile/goals/`, { headers }),
      ]);
      if (eRes.ok) { const d = await eRes.json(); setEpics(Array.isArray(d) ? d : d.results || []); }
      if (bRes.ok) { const d = await bRes.json(); setItems(Array.isArray(d) ? d : d.results || []); }
      if (gRes.ok) { const d = await gRes.json(); setGoals(Array.isArray(d) ? d : d.results || []); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  // Auto-expand the highlighted epic so its linked items are visible after a
  // deep-link arrives. The smooth-scroll for the same row is handled by a
  // dedicated ref + effect below (audit polish — previously the ring rendered
  // but the row never scrolled into view on long lists).
  useEffect(() => {
    if (highlightEpic) {
      const eid = parseInt(highlightEpic);
      if (!Number.isNaN(eid)) setExpanded(prev => ({ ...prev, [eid]: true }));
    }
  }, [highlightEpic]);

  // Per-page highlight scroll: keep a ref keyed by epic id, attach it via a
  // tiny callback ref so we don't have to extract a child component. The
  // shared useHighlightFromQuery hook handles the same flow for pages that
  // can extract a row component cheaply; here we inline the equivalent.
  const highlightedRowRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!highlightEpic || !highlightedRowRef.current || epics.length === 0) return;
    const el = highlightedRowRef.current;
    const t = window.setTimeout(() => {
      try { el.scrollIntoView({ behavior: "smooth", block: "center" }); }
      catch { el.scrollIntoView(); }
    }, 50);
    return () => window.clearTimeout(t);
  }, [highlightEpic, epics.length]);

  const itemsByEpic = useMemo(() => {
    const grouped: Record<number, any[]> = {};
    items.forEach((it) => {
      if (it.epic != null) {
        if (!grouped[it.epic]) grouped[it.epic] = [];
        grouped[it.epic].push(it);
      }
    });
    return grouped;
  }, [items]);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", description: "", priority: "should_have", color: "blue", product_goal: "none" });
    setDialogOpen(true);
  };

  const openEdit = (epic: any) => {
    setEditing(epic);
    setForm({
      title: epic.title || "",
      description: epic.description || "",
      priority: epic.priority || "should_have",
      color: epic.color || "blue",
      product_goal: epic.product_goal ? String(epic.product_goal) : "none",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title) { toast.error(pt("Title is required")); return; }
    setSubmitting(true);
    try {
      const body: any = {
        title: form.title,
        description: form.description,
        priority: form.priority,
        color: form.color,
        product_goal: form.product_goal === "none" ? null : parseInt(form.product_goal),
      };
      const url = editing
        ? `/api/v1/projects/${id}/agile/epics/${editing.id}/`
        : `/api/v1/projects/${id}/agile/epics/`;
      const method = editing ? "PATCH" : "POST";
      const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); }
      else { toast.error(pt("Save failed")); }
    } catch { toast.error(pt("Save failed")); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (epicId: number) => {
    if (!confirm(pt("Are you sure you want to delete this?"))) return;
    try {
      const r = await fetch(`/api/v1/projects/${id}/agile/epics/${epicId}/`, { method: "DELETE", headers });
      if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); }
      else toast.error(pt("Delete failed"));
    } catch { toast.error(pt("Delete failed")); }
  };

  const goToBacklog = (epicId: number) =>
    navigate(`/projects/${id}/agile/backlog?epic=${epicId}`);

  const goToBacklogCreate = (epicId: number) =>
    // Forward-compat: AgileBacklog reads ?epic= as a filter; passing it here
    // pre-scopes the Add dialog (Backlog page can open with the epic preset).
    navigate(`/projects/${id}/agile/backlog?epic=${epicId}&add=1`);

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
            <Layers className="h-6 w-6 text-emerald-500" />
            <h1 className="text-2xl font-bold">{pt("Epics")}</h1>
            <Badge variant="outline">{epics.length}</Badge>
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" /> {pt("Add Epic")}
          </Button>
        </div>

        {epics.length === 0 ? (
          <Card className="p-8 text-center">
            <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">{pt("No epics yet")}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {pt("Group user stories into epics to track progress at a higher level.")}
            </p>
            <Button onClick={openCreate} className="gap-2 mt-4">
              <Plus className="h-4 w-4" /> {pt("Add Epic")}
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {epics.map((epic) => {
              const linked = itemsByEpic[epic.id] || [];
              const isOpen = !!expanded[epic.id];
              const isHighlighted = highlightEpic && parseInt(highlightEpic) === epic.id;
              const colorDot = COLOR_DOTS[epic.color] || "bg-blue-500";
              const preview = linked.slice(0, 5);
              return (
                <Card
                  key={epic.id}
                  ref={isHighlighted ? highlightedRowRef : undefined}
                  className={`hover:shadow-md transition-shadow ${isHighlighted ? "ring-2 ring-emerald-400" : ""}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`h-2.5 w-2.5 rounded-full ${colorDot}`} aria-hidden />
                          <CardTitle className="text-base">{epic.title}</CardTitle>
                          <Badge className={`text-xs ${PRIORITY_COLORS[epic.priority] || ""}`}>
                            {epic.priority?.replace("_", " ") || "should have"}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-xs cursor-pointer hover:bg-muted gap-1"
                            onClick={() => goToBacklog(epic.id)}
                            title={pt("View linked backlog items")}
                          >
                            <ListChecks className="h-3 w-3" />
                            {linked.length} {pt("items")}
                          </Badge>
                          {typeof epic.total_points === "number" && epic.total_points > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {epic.completed_points || 0} / {epic.total_points} pts
                            </Badge>
                          )}
                          {epic.product_goal_title && (
                            <Badge variant="outline" className="text-xs text-emerald-600">
                              🎯 {epic.product_goal_title}
                            </Badge>
                          )}
                        </div>
                        {epic.description && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{epic.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1"
                          onClick={() => goToBacklogCreate(epic.id)}
                          title={pt("Add Backlog Item in this Epic")}
                        >
                          <Plus className="h-3.5 w-3.5" /> {pt("Add Backlog Item")}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(epic)} title={pt("Edit")}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(epic.id)} title={pt("Delete")}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {linked.length > 0 && (
                    <CardContent className="pt-0">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => setExpanded(prev => ({ ...prev, [epic.id]: !isOpen }))}
                      >
                        {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        {isOpen ? pt("Hide items") : pt("Show items")} ({linked.length})
                      </button>
                      {isOpen && (
                        <div className="mt-2 space-y-1">
                          {preview.map((it) => (
                            <button
                              key={it.id}
                              type="button"
                              onClick={() => navigate(`/projects/${id}/agile/backlog?epic=${epic.id}`)}
                              className="w-full text-left p-2 border rounded-md hover:bg-muted/50 flex items-center gap-2"
                              title={pt("Open in Backlog")}
                            >
                              <Badge className={`text-xs ${ITEM_TYPE_COLORS[it.item_type] || ""}`}>{it.item_type}</Badge>
                              <span className="text-sm font-medium truncate flex-1">{it.title}</span>
                              {it.story_points != null && (
                                <Badge variant="outline" className="text-xs">{it.story_points} pts</Badge>
                              )}
                              <Badge variant="outline" className="text-xs">{it.status}</Badge>
                            </button>
                          ))}
                          {linked.length > preview.length && (
                            <button
                              type="button"
                              onClick={() => goToBacklog(epic.id)}
                              className="text-xs text-emerald-600 hover:underline px-2 py-1"
                            >
                              {pt("View all")} ({linked.length}) →
                            </button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? pt("Edit") : pt("Add")} {pt("Epic")}</DialogTitle>
            <DialogDescription>
              {editing ? pt("Edit epic details") : pt("Create a new epic to group related stories")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{pt("Title")} *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{pt("Description")}</Label>
              <textarea
                className="w-full min-h-[80px] px-3 py-2 border rounded-md bg-background"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{pt("Priority")}</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="must_have">Must Have</SelectItem>
                    <SelectItem value="should_have">Should Have</SelectItem>
                    <SelectItem value="could_have">Could Have</SelectItem>
                    <SelectItem value="wont_have">Won't Have</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{pt("Color")}</Label>
                <Select value={form.color} onValueChange={(v) => setForm({ ...form, color: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                    <SelectItem value="yellow">Yellow</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                    <SelectItem value="teal">Teal</SelectItem>
                    <SelectItem value="pink">Pink</SelectItem>
                    <SelectItem value="gray">Gray</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{pt("Product Goal")}</Label>
              <Select value={form.product_goal} onValueChange={(v) => setForm({ ...form, product_goal: v })}>
                <SelectTrigger><SelectValue placeholder={pt("Link to a Product Goal (optional)")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{pt("No goal")}</SelectItem>
                  {goals.map((g) => <SelectItem key={g.id} value={String(g.id)}>{g.title}</SelectItem>)}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{pt("Every epic advances one Product Goal — so each backlog item rolls up to an outcome.")}</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button>
              <Button onClick={handleSave} disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgileEpics;
