import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ListFilter, Plus, Trash2, Check } from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { toast } from "sonner";

interface View { id: number; name: string; config: any; created_by_name?: string | null }

/** Reusable saved-views control. Save the current filter/grouping config of a
 *  list surface under a name and reload it later. */
export default function SavedViews({ surface, projectId, currentConfig, onApply }: {
  surface: string; projectId?: string | number; currentConfig: any; onApply: (config: any) => void;
}) {
  const { pt } = usePageTranslations();
  const [views, setViews] = useState<View[]>([]);
  const [active, setActive] = useState<string>("");

  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("access_token")}` });
  const jsonHeaders = () => ({ ...headers(), "Content-Type": "application/json" });

  const load = useCallback(async () => {
    try {
      const q = new URLSearchParams({ surface });
      if (projectId) q.set("project", String(projectId));
      const r = await fetch(`/api/v1/projects/saved-views/?${q}`, { headers: headers() });
      if (r.ok) { const d = await r.json(); setViews(Array.isArray(d) ? d : d.results || []); }
    } catch { /* ignore */ }
  }, [surface, projectId]);
  useEffect(() => { load(); }, [load]);

  const apply = (v: View) => { setActive(v.name); onApply(v.config || {}); };

  const saveCurrent = async () => {
    const name = (window.prompt(pt("Name this view")) || "").trim();
    if (!name) return;
    const existing = views.find((v) => v.name === name);
    try {
      const body = { surface, project_id_ref: projectId ? Number(projectId) : null, name, config: currentConfig, audience: "private" };
      const r = await fetch(
        existing ? `/api/v1/projects/saved-views/${existing.id}/` : `/api/v1/projects/saved-views/`,
        { method: existing ? "PUT" : "POST", headers: jsonHeaders(), body: JSON.stringify(body) },
      );
      if (r.ok) { setActive(name); load(); toast.success(`${pt("Saved view")}: ${name}`); }
      else { const e = await r.json().catch(() => ({})); toast.error(e.detail || pt("Could not save view")); }
    } catch { toast.error(pt("Could not save view")); }
  };

  const remove = async (v: View, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const r = await fetch(`/api/v1/projects/saved-views/${v.id}/`, { method: "DELETE", headers: headers() });
      if (r.ok || r.status === 204) { if (active === v.name) setActive(""); load(); }
      else toast.error(pt("Could not delete (only the author or an admin can)."));
    } catch { /* ignore */ }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5"><ListFilter className="h-4 w-4" />{active || pt("Views")}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{pt("Saved views")}</DropdownMenuLabel>
        {views.length === 0 ? (
          <DropdownMenuItem disabled className="text-xs">{pt("No saved views yet")}</DropdownMenuItem>
        ) : views.map((v) => (
          <DropdownMenuItem key={v.id} onClick={() => apply(v)} className="flex items-center gap-2">
            {active === v.name ? <Check className="h-3.5 w-3.5 text-purple-600" /> : <span className="w-3.5" />}
            <span className="flex-1 truncate">{v.name}</span>
            <button onClick={(e) => remove(v, e)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={saveCurrent}><Plus className="h-4 w-4 mr-2" />{pt("Save current view…")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
