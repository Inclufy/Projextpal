import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

/**
 * Admin: invite a sandbox / proeftuin evaluator in one click.
 * Provisions an eval-mode workspace + a time-limited trial + (optionally) emails
 * a branded sandbox invitation. Generic — for any prospect.
 */
const SandboxInvite = () => {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [days, setDays] = useState(14);
  const [inviter, setInviter] = useState("");
  const [sendInvite, setSendInvite] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const submit = async () => {
    if (!email.trim()) { toast.error("E-mailadres is verplicht"); return; }
    setSubmitting(true);
    setResult(null);
    try {
      const token = localStorage.getItem("access_token");
      const r = await fetch("/api/v1/admin/sandbox-invite/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          company_name: company.trim() || `${email.split("@")[1] || "Prospect"} (Proeftuin)`,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          days,
          inviter_name: inviter.trim() || "Het ProjeXtPal-team",
          send_invite: sendInvite,
        }),
      });
      const d = await r.json();
      if (r.ok) {
        setResult(d);
        toast.success(d.invited ? "Uitnodiging verstuurd" : "Sandbox aangemaakt (geen mail)");
      } else {
        toast.error(d.detail || "Mislukt");
      }
    } catch {
      toast.error("Mislukt");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 grid place-items-center text-white">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Sandbox-uitnodiging</h1>
          <p className="text-sm text-muted-foreground">Zet voor een prospect een afgeschermde proeftuin klaar + stuur een gebrande uitnodiging.</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Evaluator</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mailadres *</Label>
            <Input id="email" type="email" placeholder="naam@bedrijf.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Voornaam</Label><Input value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Achternaam</Label><Input value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
          </div>
          <div className="space-y-1.5">
            <Label>Organisatie (werkruimte-naam)</Label>
            <Input placeholder="Acme Corp (Proeftuin)" value={company} onChange={(e) => setCompany(e.target.value)} />
            <p className="text-[11px] text-muted-foreground">Leeg = afgeleid van het e-maildomein.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Proefperiode (dagen)</Label>
              <Input type="number" min={1} value={days} onChange={(e) => setDays(parseInt(e.target.value) || 14)} />
            </div>
            <div className="space-y-1.5"><Label>Jouw naam (afzender)</Label><Input placeholder="Sami Loukile" value={inviter} onChange={(e) => setInviter(e.target.value)} /></div>
          </div>
          <label className="flex items-center gap-2.5 text-sm cursor-pointer pt-1">
            <input type="checkbox" checked={sendInvite} onChange={(e) => setSendInvite(e.target.checked)} className="accent-primary h-4 w-4" />
            Stuur direct de gebrande sandbox-uitnodigingsmail (Accept → wachtwoord instellen)
          </label>

          <Button onClick={submit} disabled={submitting} className="gap-2">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {sendInvite ? "Provisionen & uitnodigen" : "Alleen provisionen"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-4 space-y-2 text-sm">
            <div className="flex items-center gap-2 font-semibold text-green-700"><CheckCircle2 className="h-4 w-4" /> Sandbox klaar</div>
            <div>Werkruimte: <b>{result.company}</b> (eval-modus, geen caps)</div>
            <div>Evaluator: <b>{result.email}</b> {result.user_created ? <Badge variant="outline" className="ml-1 text-[10px]">nieuw account</Badge> : <Badge variant="outline" className="ml-1 text-[10px]">bestond al</Badge>}</div>
            <div>Proefperiode: <b>{result.trial_days} dagen</b> (tot {result.trial_end})</div>
            <div>Uitnodiging: {result.invited
              ? <span className="text-green-700 font-medium">verstuurd ✓</span>
              : <span className="text-amber-700">niet verstuurd — stuur een wachtwoord-reset of run opnieuw met de mail-optie aan</span>}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SandboxInvite;
