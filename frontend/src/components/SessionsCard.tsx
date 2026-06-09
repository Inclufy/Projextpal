import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MonitorSmartphone, Loader2 } from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { toast } from "sonner";

interface Session { id: number; created_at: string | null; expires_at: string | null; revoked: boolean }
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("access_token")}` });
const jsonHeaders = () => ({ ...authHeaders(), "Content-Type": "application/json" });

export default function SessionsCard() {
  const { pt } = usePageTranslations();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const r = await fetch("/api/v1/auth/sessions/", { headers: authHeaders() });
      if (r.ok) { const d = await r.json(); setSessions(d.sessions || []); }
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const revoke = async (id?: number) => {
    if (!id && !window.confirm(pt("Log out of all sessions? You'll need to sign in again everywhere."))) return;
    setBusy(true);
    try {
      const r = await fetch("/api/v1/auth/sessions/revoke/", {
        method: "POST", headers: jsonHeaders(), body: JSON.stringify(id ? { id } : {}),
      });
      if (r.ok) { toast.success(id ? pt("Session revoked") : pt("Logged out everywhere")); load(); }
      else toast.error(pt("Could not revoke"));
    } catch { toast.error(pt("Could not revoke")); }
    finally { setBusy(false); }
  };

  if (loading) return null;
  const active = sessions.filter((s) => !s.revoked);
  const fmt = (d: string | null) => d ? new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><MonitorSmartphone className="h-5 w-5 text-purple-600" /> {pt("Active sessions")}</CardTitle>
        <CardDescription>{pt("Devices/sessions currently signed in to your account. Revoke any you don't recognise.")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {active.length === 0 ? (
          <p className="text-sm text-muted-foreground">{pt("No active sessions found.")}</p>
        ) : active.map((s) => (
          <div key={s.id} className="flex items-center justify-between gap-3 border rounded-lg p-2.5">
            <div className="min-w-0">
              <p className="text-sm font-medium">{pt("Session")} #{s.id}</p>
              <p className="text-xs text-muted-foreground">{pt("Started")} {fmt(s.created_at)} · {pt("expires")} {fmt(s.expires_at)}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => revoke(s.id)} disabled={busy}>{pt("Revoke")}</Button>
          </div>
        ))}
        {active.length > 1 && (
          <Button variant="destructive" size="sm" className="mt-2" onClick={() => revoke()} disabled={busy}>
            {busy && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Log out of all sessions")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
