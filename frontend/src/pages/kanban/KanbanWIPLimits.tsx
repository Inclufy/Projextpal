import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Input } from "@/components/ui/input";
import { Loader2, Zap, Save } from "lucide-react";
import { toast } from "sonner";

const KanbanWIPLimits = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [columns, setColumns] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [wipEdits, setWipEdits] = useState<Record<number, string>>({});
  const token = localStorage.getItem("access_token"); const headers: Record<string, string> = { Authorization: `Bearer ${token}` }; const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => { try { const [cRes, crRes] = await Promise.all([fetch(`/api/v1/projects/${id}/kanban/columns/`, { headers }), fetch(`/api/v1/projects/${id}/kanban/cards/`, { headers })]); if (cRes.ok) { const d = await cRes.json(); const cols = (Array.isArray(d) ? d : d.results || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)); setColumns(cols); const edits: Record<number, string> = {}; cols.forEach((c: any) => { edits[c.id] = String(c.wip_limit || ""); }); setWipEdits(edits); } if (crRes.ok) { const d = await crRes.json(); setCards(Array.isArray(d) ? d : d.results || []); } } catch (err) { console.error(err); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, [id]);

  const saveWip = async (colId: number) => { const val = wipEdits[colId]; try { const body: any = {}; if (val && parseInt(val) > 0) body.wip_limit = parseInt(val); else body.wip_limit = null; const r = await fetch(`/api/v1/projects/${id}/kanban/columns/${colId}/`, { method: "PATCH", headers: jsonHeaders, body: JSON.stringify(body) }); if (r.ok) { toast.success(pt("Saved")); fetchData(); } else toast.error(pt("Save failed")); } catch { toast.error(pt("Save failed")); } };

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background"><ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3"><Zap className="h-6 w-6 text-amber-500" /><h1 className="text-2xl font-bold">WIP Limits</h1></div>
        <div className="space-y-3">{columns.map(col => {
          const count = cards.filter(c => c.column === col.id).length;
          const isOver = col.wip_limit && count > col.wip_limit;
          const pct = col.wip_limit ? Math.min((count / col.wip_limit) * 100, 100) : 0;
          return (
            <Card key={col.id} className={isOver ? "border-red-300" : ""}><CardContent className="p-4">
              <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-3"><span className="font-semibold">{col.name}</span><Badge variant="outline" className="text-xs">{count} cards</Badge>{isOver && <Badge variant="destructive" className="text-xs">Over limit!</Badge>}</div>
                <div className="flex items-center gap-2"><Input type="number" className="w-20 h-8 text-center" value={wipEdits[col.id] || ""} onChange={(e) => setWipEdits({ ...wipEdits, [col.id]: e.target.value })} placeholder="∞" /><Button variant="outline" size="sm" onClick={() => saveWip(col.id)} className="h-8"><Save className="h-3.5 w-3.5" /></Button></div>
              </div>
              {col.wip_limit && <Progress value={pct} className={`h-2 ${isOver ? "[&>div]:bg-red-500" : ""}`} />}
            </CardContent></Card>
          );
        })}</div>
      </div>
    </div>
  );
};

export default KanbanWIPLimits;
