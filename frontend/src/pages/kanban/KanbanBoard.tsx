import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Loader2, Layout, ChevronLeft, ChevronRight, Ban, Clock, AlertTriangle, Zap, FileText } from "lucide-react";
import { toast } from "sonner";

const KanbanBoard = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [columns, setColumns] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => {
    try {
      const [cRes, crRes, pRes] = await Promise.all([
        fetch(`/api/v1/projects/${id}/kanban/columns/`, { headers }),
        fetch(`/api/v1/projects/${id}/kanban/cards/`, { headers }),
        fetch(`/api/v1/projects/${id}/kanban/work-policies/`, { headers }),
      ]);
      if (cRes.ok) { const d = await cRes.json(); setColumns((Array.isArray(d) ? d : d.results || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0))); }
      if (crRes.ok) { const d = await crRes.json(); setCards(Array.isArray(d) ? d : d.results || []); }
      if (pRes.ok) { const d = await pRes.json(); setPolicies(Array.isArray(d) ? d : d.results || []); }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [id]);

  const moveCard = async (cardId: number, targetColumnId: number) => {
    try {
      const r = await fetch(`/api/v1/projects/${id}/kanban/cards/${cardId}/move/`, { method: "POST", headers: jsonHeaders, body: JSON.stringify({ column_id: targetColumnId }) });
      if (r.ok) { fetchData(); return; }
      const err = await r.json().catch(() => ({}));
      if (err.code === "wip_limit_reached") {
        toast.error(pt(`WIP limit reached: '${err.column}' allows ${err.wip_limit}. Finish or pull work out first, or mark the card expedite.`));
      } else {
        toast.error(err.detail || err.error || pt("Move failed"));
      }
    } catch { toast.error(pt("Move failed")); }
  };
  const toggleBlocked = async (cardId: number) => { try { const r = await fetch(`/api/v1/projects/${id}/kanban/cards/${cardId}/toggle_blocked/`, { method: "POST", headers: jsonHeaders }); if (r.ok) fetchData(); } catch { toast.error(pt("Action failed")); } };

  const priorityColors: Record<string, string> = { critical: "border-l-red-500", high: "border-l-orange-400", medium: "border-l-yellow-400", low: "border-l-green-400" };
  const typeColors: Record<string, string> = { feature: "bg-blue-100 text-blue-700", bug: "bg-red-100 text-red-700", task: "bg-gray-100 text-gray-700", improvement: "bg-purple-100 text-purple-700" };
  const cosLabels: Record<string, string> = { expedite: "Expedite", fixed_date: "Fixed Date", intangible: "Intangible" };

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background"><ProjectHeader />
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3"><Layout className="h-6 w-6 text-violet-500" /><h1 className="text-2xl font-bold">Kanban Board</h1></div>
        {columns.length === 0 ? <Card className="p-8 text-center"><Layout className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">No board configured yet</h3><p className="text-muted-foreground">Initialize from dashboard or configure columns</p></Card> : (
          <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: "400px" }}>
            {columns.map((col, ci) => {
              // Expedite cards sort to the top of their column (class of service).
              const colCards = cards.filter(c => c.column === col.id).sort((a, b) => {
                const ax = (a.class_of_service === "expedite" || a.is_expedite) ? 0 : 1;
                const bx = (b.class_of_service === "expedite" || b.is_expedite) ? 0 : 1;
                if (ax !== bx) return ax - bx;
                return (a.order || 0) - (b.order || 0);
              });
              const isOverWip = col.wip_limit && colCards.length > col.wip_limit;
              const colPolicies = policies.filter(p => p.column === col.id && p.is_active !== false);
              return (
                <div key={col.id} className="flex-shrink-0 w-72">
                  <div className={`rounded-t-lg p-3 ${isOverWip ? "bg-red-100 border-red-300" : "bg-muted"}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2"><span className="font-semibold text-sm">{col.name}</span><Badge variant="outline" className="text-xs">{colCards.length}</Badge></div>
                      {col.wip_limit && <Badge variant={isOverWip ? "destructive" : "outline"} className="text-xs">WIP: {col.wip_limit}</Badge>}
                    </div>
                    {/* Make Policies Explicit — column-scoped policies render at the header */}
                    {colPolicies.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {colPolicies.map(p => (
                          <div key={p.id} className="flex items-start gap-1 text-[11px] text-muted-foreground" title={p.description}>
                            <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" /><span className="truncate">{p.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="bg-muted/30 rounded-b-lg p-2 space-y-2 min-h-[300px] border border-t-0">
                    {colCards.map(card => {
                      const prevCol = ci > 0 ? columns[ci - 1] : null;
                      const nextCol = ci < columns.length - 1 ? columns[ci + 1] : null;
                      const isExpedite = card.class_of_service === "expedite" || card.is_expedite || (card.swimlane_name || "").toLowerCase().includes("expedite");
                      const nextColCount = nextCol ? cards.filter(c => c.column === nextCol.id).length : 0;
                      const nextColFull = !!nextCol && !!nextCol.wip_limit && nextColCount >= nextCol.wip_limit && !isExpedite;
                      const cosBadge = card.class_of_service && card.class_of_service !== "standard" ? cosLabels[card.class_of_service] : null;
                      return (
                        <div key={card.id} className={`bg-background rounded-lg border-l-4 ${card.is_blocked ? "border-l-red-500 bg-red-50" : isExpedite ? "border-l-amber-500 bg-amber-50" : priorityColors[card.priority] || "border-l-gray-300"} p-3 shadow-sm`}>
                          <div className="flex items-center gap-1 mb-1 flex-wrap">
                            {card.card_type && <Badge className={`text-xs ${typeColors[card.card_type] || ""}`}>{card.card_type}</Badge>}
                            {isExpedite && <Badge className="text-xs gap-1 bg-amber-500 text-white hover:bg-amber-500"><Zap className="h-3 w-3" /> {cosBadge || "Expedite"}</Badge>}
                            {!isExpedite && cosBadge && <Badge variant="outline" className="text-xs">{cosBadge}</Badge>}
                            {card.is_sle_breached && <Badge variant="destructive" className="text-xs gap-1"><AlertTriangle className="h-3 w-3" /> SLE breach</Badge>}
                            {card.is_blocked && <Badge variant="destructive" className="text-xs gap-1"><Ban className="h-3 w-3" /> Blocked{card.blocked_hours ? ` ${Math.round(card.blocked_hours)}h` : ""}</Badge>}
                          </div>
                          <p className="text-sm font-medium mb-2">{card.title}</p>
                          {card.assigned_to_name && <p className="text-xs text-muted-foreground mb-1">👤 {card.assigned_to_name}</p>}
                          {typeof card.age_in_column_hours === "number" && card.age_in_column_hours > 72 && (
                            <p className="text-xs text-orange-600 mb-2 flex items-center gap-1"><Clock className="h-3 w-3" /> Aging: {Math.round(card.age_in_column_hours / 24)}d in column</p>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex gap-1">
                              {prevCol && <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => moveCard(card.id, prevCol.id)}><ChevronLeft className="h-3.5 w-3.5" /></Button>}
                              {nextCol && <Button variant="ghost" size="sm" disabled={nextColFull} title={nextColFull ? pt(`WIP limit reached: ${nextCol.name} allows ${nextCol.wip_limit}`) : undefined} className="h-6 w-6 p-0" onClick={() => moveCard(card.id, nextCol.id)}><ChevronRight className="h-3.5 w-3.5" /></Button>}
                            </div>
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => toggleBlocked(card.id)}>{card.is_blocked ? "Unblock" : "Block"}</Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanBoard;
