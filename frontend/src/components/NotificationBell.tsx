import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, CheckCircle2, ClipboardList, ShieldAlert, MessageSquare, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePageTranslations } from "@/hooks/usePageTranslations";

interface Notif {
  id: number; kind: string; title: string; body: string; url: string;
  read: boolean; actor_name?: string | null; created_at: string;
}

const KIND_ICON: Record<string, any> = {
  task_assigned: ClipboardList,
  action_assigned: CheckCircle2,
  approval: ShieldAlert,
  message: MessageSquare,
  mention: MessageSquare,
  status: Info,
  system: Info,
};

const relTime = (iso: string, pt: (s: string) => string): string => {
  const d = new Date(iso).getTime();
  if (!d) return "";
  const s = Math.max(0, Math.floor((Date.now() - d) / 1000));
  if (s < 60) return pt("just now");
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} ${pt("min ago")}`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ${pt("h ago")}`;
  const dd = Math.floor(h / 24);
  return `${dd} ${pt("d ago")}`;
};

export default function NotificationBell() {
  const { pt } = usePageTranslations();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<Notif[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timer = useRef<any>(null);

  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("access_token")}` });

  const fetchCount = useCallback(async () => {
    try {
      const r = await fetch("/api/v1/notifications/unread_count/", { headers: headers() });
      if (r.ok) { const d = await r.json(); setUnread(d.count || 0); }
    } catch { /* offline — ignore */ }
  }, []);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/v1/notifications/?limit=12", { headers: headers() });
      if (r.ok) { const d = await r.json(); setItems(d.results || []); setUnread(d.unread ?? 0); }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  // Poll the unread count (cheap) every 45s; refetch the list when opened.
  useEffect(() => {
    fetchCount();
    timer.current = setInterval(fetchCount, 45000);
    return () => clearInterval(timer.current);
  }, [fetchCount]);

  useEffect(() => { if (open) fetchList(); }, [open, fetchList]);

  const openItem = async (n: Notif) => {
    try {
      await fetch(`/api/v1/notifications/${n.id}/mark_read/`, { method: "POST", headers: headers() });
    } catch { /* ignore */ }
    setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    setUnread((u) => Math.max(0, u - (n.read ? 0 : 1)));
    setOpen(false);
    if (n.url) navigate(n.url);
  };

  const markAll = async () => {
    try { await fetch("/api/v1/notifications/mark_all_read/", { method: "POST", headers: headers() }); } catch { /* ignore */ }
    setItems((prev) => prev.map((x) => ({ ...x, read: true })));
    setUnread(0);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" title={pt("Notifications")} className="relative">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2.5 border-b">
          <span className="font-semibold text-sm">{pt("Notifications")}</span>
          {unread > 0 && (
            <button onClick={markAll} className="text-xs text-purple-600 hover:underline inline-flex items-center gap-1">
              <CheckCheck className="h-3.5 w-3.5" /> {pt("Mark all read")}
            </button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {loading && items.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">{pt("Loading")}…</div>
          ) : items.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
              {pt("No notifications yet")}
            </div>
          ) : (
            items.map((n) => {
              const Icon = KIND_ICON[n.kind] || Info;
              return (
                <button
                  key={n.id} onClick={() => openItem(n)}
                  className={`w-full text-left px-3 py-2.5 flex gap-3 border-b last:border-0 hover:bg-muted/60 transition ${n.read ? "" : "bg-purple-50/50 dark:bg-purple-900/10"}`}
                >
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${n.read ? "bg-muted text-muted-foreground" : "bg-purple-100 text-purple-700"}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium leading-snug">{n.title}</div>
                    {n.body && <div className="text-xs text-muted-foreground truncate">{n.body}</div>}
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {n.actor_name ? `${n.actor_name} · ` : ""}{relTime(n.created_at, pt)}
                    </div>
                  </div>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-purple-500 shrink-0 mt-1.5" />}
                </button>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
