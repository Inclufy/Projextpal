import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Boxes, CheckCircle2, XCircle, Clock } from "lucide-react";

const statusColors: Record<string, string> = { draft: "bg-gray-100 text-gray-700", in_progress: "bg-blue-100 text-blue-700", in_review: "bg-amber-100 text-amber-700", approved: "bg-green-100 text-green-700", completed: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-700", handed_over: "bg-purple-100 text-purple-700" };

const Prince2ProductStatus = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [stages, setStages] = useState<any[]>([]);
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("access_token"); const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const fetchData = async () => {
    setLoading(true);
    try {
      const q = stageFilter && stageFilter !== "all" ? `?stage=${stageFilter}` : "";
      const r = await fetch(`/api/v1/projects/${id}/prince2/product-status/${q}`, { headers });
      if (r.ok) setData(await r.json());
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };
  const fetchStages = async () => { try { const r = await fetch(`/api/v1/projects/${id}/prince2/stages/`, { headers }); if (r.ok) { const d = await r.json(); setStages(Array.isArray(d) ? d : d.results || []); } } catch (err) { console.error(err); } };
  useEffect(() => { fetchStages(); }, [id]);
  useEffect(() => { fetchData(); }, [id, stageFilter]);
  if (loading && !data) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);
  const rows = data?.products || [];
  const summary = data?.status_summary || {};
  return (
    <div className="min-h-full bg-background"><ProjectHeader /><div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3"><Boxes className="h-6 w-6 text-cyan-500" /><div><h1 className="text-2xl font-bold">{pt("Product Status Account")}</h1><p className="text-xs text-muted-foreground">{pt("Status of every product across the project, with its quality-check record (PRINCE2 §A.18)")}</p></div><Badge variant="outline">{data?.total_products ?? 0}</Badge>{(data?.config_items_total ?? 0) > 0 && <Badge variant="secondary" className="text-xs">{data.config_items_total} {pt("config items")}</Badge>}</div>
        <div className="w-56"><Select value={stageFilter} onValueChange={setStageFilter}><SelectTrigger><SelectValue placeholder={pt("All stages")} /></SelectTrigger><SelectContent><SelectItem value="all">{pt("All stages")}</SelectItem>{stages.map((s) => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}</SelectContent></Select></div>
      </div>

      {Object.keys(summary).length > 0 && (
        <div className="flex flex-wrap gap-2">{Object.entries(summary).map(([k, v]) => (<Badge key={k} className={`text-xs ${statusColors[k] || "bg-gray-100 text-gray-700"}`}>{k}: {v as number}</Badge>))}</div>
      )}

      {rows.length === 0 ? (
        <Card className="p-8 text-center"><Boxes className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">{pt("No products yet")}</h3><p className="text-sm text-muted-foreground mt-1">{pt("Add products in the Product register; their status and quality checks appear here.")}</p></Card>
      ) : (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">{pt("Products")}</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2 px-4 font-medium">{pt("Product")}</th><th className="py-2 px-4 font-medium">{pt("Type")}</th><th className="py-2 px-4 font-medium">{pt("Status")}</th><th className="py-2 px-4 font-medium">{pt("Work Package")}</th><th className="py-2 px-4 font-medium">{pt("Owner")}</th><th className="py-2 px-4 font-medium text-center">{pt("Quality checks")}</th><th className="py-2 px-4 font-medium">{pt("Config items")}</th></tr></thead>
                <tbody>
                  {rows.map((p: any) => (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-muted/40">
                      <td className="py-2 px-4 font-medium">{p.title}</td>
                      <td className="py-2 px-4 text-muted-foreground">{p.product_type || "—"}</td>
                      <td className="py-2 px-4"><Badge className={`text-xs ${statusColors[p.status] || "bg-gray-100 text-gray-700"}`}>{p.status}</Badge></td>
                      <td className="py-2 px-4 text-muted-foreground">{p.work_package || "—"}</td>
                      <td className="py-2 px-4 text-muted-foreground">{p.owner || "—"}</td>
                      <td className="py-2 px-4">
                        <div className="flex items-center justify-center gap-3">
                          {p.quality_checks_total === 0 ? <span className="text-xs text-muted-foreground italic">{pt("none")}</span> : (<>
                            <span className="flex items-center gap-1 text-green-600" title={pt("Passed")}><CheckCircle2 className="h-3.5 w-3.5" />{p.quality_checks_passed}</span>
                            <span className="flex items-center gap-1 text-red-600" title={pt("Failed")}><XCircle className="h-3.5 w-3.5" />{p.quality_checks_failed}</span>
                            <span className="flex items-center gap-1 text-amber-600" title={pt("Pending")}><Clock className="h-3.5 w-3.5" />{p.quality_checks_pending}</span>
                          </>)}
                        </div>
                      </td>
                      <td className="py-2 px-4">
                        {(p.config_items?.length ?? 0) === 0 ? <span className="text-xs text-muted-foreground italic">{pt("none")}</span> : (
                          <div className="flex flex-wrap gap-1">{p.config_items.map((c: any) => (<Badge key={c.id} variant="outline" className="text-[10px]" title={c.status}>{c.identifier || "CI"} v{c.version}</Badge>))}</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div></div>
  );
};
export default Prince2ProductStatus;
