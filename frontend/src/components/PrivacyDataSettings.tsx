import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShieldCheck, Download, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("access_token")}` });

/** GDPR data rights surfaced in the UI: Art. 15 (export) + Art. 17 (erasure).
 *  The endpoints already exist in the backend (accounts/gdpr.py); this makes
 *  them reachable so the rights are actually exercisable by the user. */
export default function PrivacyDataSettings() {
  const { pt } = usePageTranslations();
  const { logout } = useAuth() as any;
  const [exporting, setExporting] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const exportData = async () => {
    setExporting(true);
    try {
      const r = await fetch("/api/v1/auth/me/export/", { headers: authHeaders() });
      if (!r.ok) { toast.error(pt("Could not generate export")); return; }
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `projextpal-data-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      toast.success(pt("Your data export has downloaded"));
    } catch { toast.error(pt("Could not generate export")); }
    finally { setExporting(false); }
  };

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      const r = await fetch("/api/v1/auth/me/delete/", { method: "DELETE", headers: authHeaders() });
      if (r.ok) {
        toast.success(pt("Your account has been scheduled for deletion."));
        setDelOpen(false);
        setTimeout(() => { try { logout?.(); } catch { /* noop */ } window.location.href = "/login"; }, 1500);
      } else { toast.error(pt("Could not delete account")); }
    } catch { toast.error(pt("Could not delete account")); }
    finally { setDeleting(false); }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-purple-600" /> {pt("Privacy & your data")}</CardTitle>
        <CardDescription>{pt("Exercise your data rights under the GDPR (Art. 15 & 17).")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-4 border rounded-lg p-3">
          <div className="min-w-0">
            <p className="text-sm font-medium">{pt("Download my data")}</p>
            <p className="text-xs text-muted-foreground">{pt("A complete JSON export of your account and linked data (Art. 15).")}</p>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 shrink-0" onClick={exportData} disabled={exporting}>
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}{pt("Export")}
          </Button>
        </div>

        <div className="flex items-center justify-between gap-4 border border-destructive/30 rounded-lg p-3 bg-destructive/5">
          <div className="min-w-0">
            <p className="text-sm font-medium text-destructive">{pt("Delete my account")}</p>
            <p className="text-xs text-muted-foreground">{pt("Anonymizes your data and deactivates your account (Art. 17). 30-day grace period.")}</p>
          </div>
          <Button variant="destructive" size="sm" className="gap-1.5 shrink-0" onClick={() => { setConfirmText(""); setDelOpen(true); }}>
            <Trash2 className="h-4 w-4" />{pt("Delete")}
          </Button>
        </div>
      </CardContent>

      <Dialog open={delOpen} onOpenChange={setDelOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-5 w-5" /> {pt("Delete your account?")}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            {pt("This anonymizes your personal data and deactivates your account. You have 30 days to contact support to reactivate before it is permanently deleted.")}
          </p>
          <p className="text-sm">{pt("Type")} <strong>DELETE</strong> {pt("to confirm:")}</p>
          <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="DELETE" autoFocus />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDelOpen(false)}>{pt("Cancel")}</Button>
            <Button variant="destructive" disabled={confirmText.trim().toUpperCase() !== "DELETE" || deleting} onClick={deleteAccount}>
              {deleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Delete my account")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
