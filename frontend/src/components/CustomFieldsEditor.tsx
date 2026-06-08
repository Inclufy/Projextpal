import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export interface CustomFieldDef {
  id: number;
  entity: string;
  key: string;
  label: string;
  field_type: "text" | "number" | "date" | "select" | "checkbox" | "url";
  options: string[];
  required: boolean;
  show_in_table: boolean;
  order_index: number;
  active: boolean;
}

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("access_token")}` });

/** Fetches the active custom-field definitions for an entity (default 'task'). */
export function useCustomFieldDefs(entity = "task") {
  const [defs, setDefs] = useState<CustomFieldDef[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch(`/api/v1/projects/custom-fields/?entity=${entity}&active=1`, { headers: authHeaders() });
        if (r.ok && alive) {
          const d = await r.json();
          const list = Array.isArray(d) ? d : d.results || [];
          setDefs(list.sort((a: CustomFieldDef, b: CustomFieldDef) => a.order_index - b.order_index));
        }
      } catch { /* ignore */ }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [entity]);
  return { defs, loading };
}

/** Renders inputs for tenant-defined custom fields, bound to a values object
 *  ({ [key]: value }). Mutates via onChange(newValues). */
export default function CustomFieldsEditor({
  entity = "task", values, onChange,
}: { entity?: string; values: Record<string, any>; onChange: (v: Record<string, any>) => void }) {
  const { defs } = useCustomFieldDefs(entity);
  if (defs.length === 0) return null;

  const set = (key: string, v: any) => onChange({ ...values, [key]: v });

  return (
    <div className="space-y-3">
      {defs.map((f) => (
        <div key={f.id} className="space-y-1">
          <Label className="text-sm">
            {f.label}{f.required && <span className="text-destructive ml-0.5">*</span>}
          </Label>
          {f.field_type === "text" && (
            <Input value={values[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} />
          )}
          {f.field_type === "url" && (
            <Input type="url" placeholder="https://…" value={values[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} />
          )}
          {f.field_type === "number" && (
            <Input type="number" value={values[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value === "" ? "" : Number(e.target.value))} />
          )}
          {f.field_type === "date" && (
            <Input type="date" value={values[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} />
          )}
          {f.field_type === "checkbox" && (
            <div className="flex items-center gap-2 pt-1">
              <Checkbox checked={!!values[f.key]} onCheckedChange={(c) => set(f.key, !!c)} />
              <span className="text-sm text-muted-foreground">{f.label}</span>
            </div>
          )}
          {f.field_type === "select" && (
            <Select value={values[f.key] ?? ""} onValueChange={(v) => set(f.key, v)}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                {(f.options || []).map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        </div>
      ))}
    </div>
  );
}
