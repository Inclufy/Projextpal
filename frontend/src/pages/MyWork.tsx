import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Inbox, AlertTriangle, CalendarDays, CalendarRange, Clock, CircleDashed, AtSign, RefreshCw, FolderKanban } from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";

interface T { id: number; title: string; due_date: string | null; priority: string; status: string; project_id: number; project_name: string; methodology?: string; url: string }
interface Mention { id: number; body: string; author?: string; project_name?: string; where?: string; url: string; created_at: string }
interface Data { buckets: Record<string, T[]>; counts: Record<string, number>; mentions: Mention[] }

const PRIO: Record<string, string> = { urgent: "bg-red-100 text-red-700", high: "bg-amber-100 text-amber-700", medium: "bg-blue-100 text-blue-700", low: "bg-gray-100 text-gray-600" };
const BUCKETS: { key: string; label: string; icon: any; tone: string }[] = [
  { key: "overdue", label: "Overdue", icon: AlertTriangle, tone: "text-red-600" },
  { key: "today", label: "Today", icon: CalendarDays, tone: "text-amber-600" },
  { key: "this_week", label: "This week", icon: CalendarRange, tone: "text-indigo-600" },
  { key: "later", label: "Later", icon: Clock, tone: "text-sky-600" },
  { key: "no_date", label: "No date", icon: CircleDashed, tone: "text-muted-foreground" },
];

export default function MyWork() {
  const { pt } = usePageTranslations();
  const navigate = useNavigate();
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/v1/projects/my-work/", { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } });
      setData(r.ok ? await r.json() : null);
    } catch { setData(null); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-purple-600" /></div>;

  const counts = data?.counts || {};
  const tiles = [
    { label: pt("Open"), value: counts.open || 0, tone: "text-indigo-600 bg-indigo-50", icon: Inbox },
    { label: pt("Overdue"), value: counts.overdue || 0, tone: "text-red-600 bg-red-50", icon: AlertTriangle },
    { label: pt("Due today"), value: counts.today || 0, tone: "text-amber-600 bg-amber-50", icon: CalendarDays },
    { label: pt("Mentions"), value: counts.mentions || 0, tone: "text-purple-600 bg-purple-50", icon: AtSign },
  ];

  return (
    <div className="min-h-full bg-background w-full px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center text-white"><Inbox className="h-5 w-5" /></div>
          <div>
            <h1 className="text-2xl font-bold">{pt("My Work")}</h1>
            <p className="text-sm text-muted-foreground">{pt("Everything assigned to you across all projects — and where you're mentioned.")}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={load}><RefreshCw className="h-4 w-4" />{pt("Refresh")}</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tiles.map((t) => { const Icon = t.icon; return (
          <Card key={t.label} className="p-4"><div className={`h-9 w-9 rounded-lg flex items-center justify-center mb-3 ${t.tone}`}><Icon className="h-5 w-5" /></div><div className="text-2xl font-bold">{t.value}</div><div className="text-xs text-muted-foreground mt-0.5">{t.label}</div></Card>
        ); })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {BUCKETS.map((b) => {
            const items = data?.buckets?.[b.key] || [];
            if (items.length === 0) return null;
            const Icon = b.icon;
            return (
              <div key={b.key}>
                <div className={`flex items-center gap-2 mb-2 text-sm font-semibold ${b.tone}`}><Icon className="h-4 w-4" />{pt(b.label)} <span className="text-muted-foreground font-normal">· {items.length}</span></div>
                <Card className="divide-y">
                  {items.map((t) => (
                    <button key={t.id} onClick={() => navigate(t.url)} className="w-full text-left px-4 py-2.5 hover:bg-muted/50 flex items-center gap-3">
                      <Badge className={`text-[10px] ${PRIO[t.priority] || "bg-gray-100"}`}>{pt(t.priority)}</Badge>
                      <span className="flex-1 min-w-0 truncate text-sm">{t.title}</span>
                      <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1 shrink-0"><FolderKanban className="h-3 w-3" />{t.project_name}</span>
                      {t.due_date && <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">{t.due_date}</span>}
                    </button>
                  ))}
                </Card>
              </div>
            );
          })}
          {(counts.open || 0) === 0 && (
            <Card className="p-10 text-center"><Inbox className="h-12 w-12 mx-auto text-green-500 mb-3" /><h3 className="text-lg font-semibold mb-1">{pt("You're all caught up")}</h3><p className="text-sm text-muted-foreground">{pt("Nothing open is assigned to you right now.")}</p></Card>
          )}
        </div>

        {/* Mentions */}
        <div>
          <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-purple-700"><AtSign className="h-4 w-4" />{pt("You were mentioned")}</div>
          {(data?.mentions || []).length === 0 ? (
            <Card className="p-5 text-sm text-muted-foreground text-center">{pt("No recent mentions.")}</Card>
          ) : (
            <Card className="divide-y">
              {data!.mentions.map((m) => (
                <button key={m.id} onClick={() => navigate(m.url)} className="w-full text-left px-4 py-3 hover:bg-muted/50">
                  <div className="text-sm line-clamp-2">{m.body}</div>
                  <div className="text-[11px] text-muted-foreground mt-1">{m.author ? `${m.author} · ` : ""}{m.project_name} · {m.where}</div>
                </button>
              ))}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
