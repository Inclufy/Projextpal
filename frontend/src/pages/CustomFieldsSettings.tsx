import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, GripVertical, Settings2 } from "lucide-react";
import { toast } from "sonner";
import type { CustomFieldDef } from "@/components/CustomFieldsEditor";

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("access_token")}` });
const jsonHeaders = () => ({ ...authHeaders(), "Content-Type": "application/json" });

// Only "task" is wired end-to-end (form + table columns). Risk/Issue custom
// fields are modelled but not yet rendered, so they are intentionally not
// offered here to avoid orphan definitions (tracked as backlog A-1).
const ENTITIES = [
  { value: "task", label: "Tasks / Actions" },
];
const TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "select", label: "Single select" },
  { value: "checkbox", label: "Checkbox" },
  { value: "url", label: "URL" },
];

const blank = (entity: string) => ({
  entity, key: "", label: "", field_type: "text",
  options: [] as string[], required: false, show_in_table: false, order_index: 0, active: true,
});

export default function CustomFieldsSettings() {
  const [entity, setEntity] = useState("task");
  const [defs, setDefs] = useState<CustomFieldDef[]>([]);
  const [draft, setDraft] = useState<any>(blank("task"));
  const [optionsText, setOptionsText] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/v1/projects/custom-fields/?entity=${entity}`, { headers: authHeaders() });
      if (r.ok) { const d = await r.json(); setDefs(Array.isArray(d) ? d : d.results || []); }
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); setDraft(blank(entity)); setOptionsText(""); }, [entity]);

  const create = async () => {
    if (!draft.label.trim()) { toast.error("Give the field a label"); return; }
    const body = {
      ...draft, entity,
      options: draft.field_type === "select"
        ? optionsText.split(",").map((s) => s.trim()).filter(Boolean) : [],
      order_index: defs.length,
    };
    const r = await fetch(`/api/v1/projects/custom-fields/`, { method: "POST", headers: jsonHeaders(), body: JSON.stringify(body) });
    if (r.ok) { toast.success("Field added"); setDraft(blank(entity)); setOptionsText(""); load(); }
    else { const e = await r.json().catch(() => ({})); toast.error(e.detail || e.key?.[0] || "Could not add field"); }
  };

  const patch = async (f: CustomFieldDef, changes: Partial<CustomFieldDef>) => {
    const r = await fetch(`/api/v1/projects/custom-fields/${f.id}/`, { method: "PATCH", headers: jsonHeaders(), body: JSON.stringify(changes) });
    if (r.ok) load(); else toast.error("Update failed");
  };

  const remove = async (f: CustomFieldDef) => {
    if (!window.confirm(`Delete "${f.label}"? Existing values are kept but hidden.`)) return;
    const r = await fetch(`/api/v1/projects/custom-fields/${f.id}/`, { method: "DELETE", headers: authHeaders() });
    if (r.ok || r.status === 204) load(); else toast.error("Delete failed");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Settings2 className="h-6 w-6 text-purple-600" />
        <h1 className="text-2xl font-bold">Custom fields</h1>
      </div>
      <p className="text-muted-foreground text-sm">
        Add extra fields to your items without code. They appear on the create/edit form
        and — when “show in table” is on — as a column in lists. Admins &amp; managers only.
      </p>

      <div className="flex items-center gap-2">
        <Label>Applies to</Label>
        <Select value={entity} onValueChange={setEntity}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>{ENTITIES.map((e) => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Existing fields</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {loading ? <p className="text-sm text-muted-foreground">Loading…</p>
            : defs.length === 0 ? <p className="text-sm text-muted-foreground">No custom fields yet for this item.</p>
            : defs.map((f) => (
              <div key={f.id} className="flex items-center gap-3 border rounded-lg p-2.5">
                <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{f.label} {f.required && <span className="text-destructive">*</span>}</div>
                  <div className="text-xs text-muted-foreground">{f.field_type}{f.field_type === "select" && f.options?.length ? `: ${f.options.join(", ")}` : ""} · key: {f.key}</div>
                </div>
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Checkbox checked={f.show_in_table} onCheckedChange={(c) => patch(f, { show_in_table: !!c })} /> in table
                </label>
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Checkbox checked={f.active} onCheckedChange={(c) => patch(f, { active: !!c })} /> active
                </label>
                <Button size="icon" variant="ghost" onClick={() => remove(f)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Add a field</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Label</Label>
              <Input value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} placeholder="e.g. Cost Centre" />
            </div>
            <div className="space-y-1">
              <Label>Type</Label>
              <Select value={draft.field_type} onValueChange={(v) => setDraft({ ...draft, field_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          {draft.field_type === "select" && (
            <div className="space-y-1">
              <Label>Options (comma-separated)</Label>
              <Input value={optionsText} onChange={(e) => setOptionsText(e.target.value)} placeholder="High, Medium, Low" />
            </div>
          )}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={draft.required} onCheckedChange={(c) => setDraft({ ...draft, required: !!c })} /> Required
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={draft.show_in_table} onCheckedChange={(c) => setDraft({ ...draft, show_in_table: !!c })} /> Show in table
            </label>
          </div>
          <Button onClick={create}><Plus className="h-4 w-4 mr-1" /> Add field</Button>
        </CardContent>
      </Card>
    </div>
  );
}
