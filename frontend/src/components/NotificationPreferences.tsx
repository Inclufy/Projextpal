import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Mail, Smartphone } from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { toast } from "sonner";

type Prefs = Record<string, boolean>;
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("access_token")}` });
const jsonHeaders = () => ({ ...authHeaders(), "Content-Type": "application/json" });

const CATEGORIES: { key: string; label: string; desc: string }[] = [
  { key: "task_assigned", label: "Task & action assignments", desc: "When a task or action is assigned to you" },
  { key: "mention", label: "Mentions", desc: "When someone @mentions you in a comment" },
  { key: "message", label: "Direct messages", desc: "When you receive a direct message" },
  { key: "approval", label: "Approvals", desc: "When your approval or sign-off is requested" },
  { key: "deadline", label: "Deadline reminders", desc: "Weekly digest of work due soon" },
  { key: "status_digest", label: "Status updates", desc: "Status changes and project digests" },
  { key: "programme_update", label: "Programme updates", desc: "Programme-level news and decisions" },
];

const DEFAULT_PREFS: Prefs = {
  email_enabled: true, push_enabled: true, task_assigned: true, mention: true,
  message: true, approval: true, deadline: true, status_digest: true, programme_update: true,
};

export default function NotificationPreferences() {
  const { pt } = usePageTranslations();
  // Always render with sensible defaults so the card never disappears if the
  // preferences endpoint is briefly unavailable; real values load when ready.
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/v1/notification-preferences/", { headers: authHeaders() });
        if (r.ok) setPrefs({ ...DEFAULT_PREFS, ...(await r.json()) });
      } catch { /* keep defaults */ }
    })();
  }, []);

  const update = async (key: string, value: boolean) => {
    const next = { ...(prefs || {}), [key]: value };
    setPrefs(next);
    setSaving(true);
    try {
      const r = await fetch("/api/v1/notification-preferences/", {
        method: "PUT", headers: jsonHeaders(), body: JSON.stringify({ [key]: value }),
      });
      if (r.ok) { setPrefs(await r.json()); }
      else { toast.error(pt("Could not save")); }
    } catch { toast.error(pt("Could not save")); }
    finally { setSaving(false); }
  };

  const Row = ({ k, label, desc }: { k: string; label: string; desc: string }) => (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div className="min-w-0">
        <Label className="text-sm">{pt(label)}</Label>
        <p className="text-xs text-muted-foreground">{pt(desc)}</p>
      </div>
      <Switch checked={!!prefs[k]} onCheckedChange={(v) => update(k, v)} disabled={saving} />
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-purple-600" /> {pt("Notifications")}</CardTitle>
        <CardDescription>{pt("Choose what you get notified about, by email and push. Essential security emails are always sent.")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {/* Master channel switches */}
        <div className="flex items-center justify-between gap-4 py-2.5 border-b">
          <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /><Label className="text-sm">{pt("Email notifications")}</Label></div>
          <Switch checked={!!prefs.email_enabled} onCheckedChange={(v) => update("email_enabled", v)} disabled={saving} />
        </div>
        <div className="flex items-center justify-between gap-4 py-2.5 border-b mb-2">
          <div className="flex items-center gap-2"><Smartphone className="h-4 w-4 text-muted-foreground" /><Label className="text-sm">{pt("Push notifications (mobile)")}</Label></div>
          <Switch checked={!!prefs.push_enabled} onCheckedChange={(v) => update("push_enabled", v)} disabled={saving} />
        </div>
        {/* Per-category toggles */}
        {CATEGORIES.map((c) => <Row key={c.key} k={c.key} label={c.label} desc={c.desc} />)}
        <p className="text-xs text-muted-foreground pt-3 border-t mt-2">{pt("Saved automatically.")}</p>
      </CardContent>
    </Card>
  );
}
