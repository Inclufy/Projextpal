import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Loader2, Ban, Unlock } from "lucide-react";
import { toast } from "sonner";

const KanbanBlockedItems = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [cards, setCards] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("access_token"); const headers: Record<string, string> = { Authorization: `Bearer ${token}` }; const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => { try { const [crRes, cRes] = await Promise.all([fetch(`/api/v1/projects/${id}/kanban/cards/`, { headers }), fetch(`/api/v1/projects/${id}/kanban/columns/`, { headers })]); if (crRes.ok) { const d = await crRes.json(); setCards((Array.isArray(d) ? d : d.results || []).filter((c: any) => c.is_blocked)); } if (cRes.ok) { const d = await cRes.json(); setColumns(Array.isArray(d) ? d : d.results || []); } } catch (err) { console.error(err); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, [id]);

  const unblock = async (cardId: number) => { try { const r = await fetch(`/api/v1/projects/${id}/kanban/cards/${cardId}/toggle_blocked/`, { method: "POST", headers: jsonHeaders }); if (r.ok) { toast.success(pt("Unblocked")); fetchData(); } } catch { toast.error(pt("Unblock failed")); } };

  const colMap = Object.fromEntries(columns.map(c => [c.id, c.name]));

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background"><ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3"><Ban className="h-6 w-6 text-red-500" /><h1 className="text-2xl font-bold">{pt("Blocked Items")}</h1><Badge variant="destructive">{cards.length}</Badge></div>
        {cards.length === 0 ? <Card className="p-8 text-center"><Ban className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold text-green-600">No blocked items! 🎉</h3></Card> : (
          <div className="space-y-3">{cards.map(c => (
            <Card key={c.id} className="border-red-200 bg-red-50"><CardContent className="p-4 flex items-center justify-between">
              <div><div className="flex items-center gap-2 mb-1"><span className="font-medium">{c.title}</span>{colMap[c.column] && <Badge variant="outline" className="text-xs">{colMap[c.column]}</Badge>}{c.blocked_reason && <span className="text-xs text-red-600">Reason: {c.blocked_reason}</span>}</div>{c.description && <p className="text-sm text-muted-foreground">{c.description}</p>}</div>
              <Button variant="outline" size="sm" onClick={() => unblock(c.id)} className="gap-1"><Unlock className="h-3.5 w-3.5" /> Unblock</Button>
            </CardContent></Card>
          ))}</div>
        )}
      </div>
    </div>
  );
};

export default KanbanBlockedItems;
