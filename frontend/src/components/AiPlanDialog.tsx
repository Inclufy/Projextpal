import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send, Sparkles, Wand2 } from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { toast } from "sonner";

// Plan met AI — een korte chat begeleidt de gebruiker naar een volledig
// conceptplan (mijlpalen + taken + risico's). Het voorstel is BEWERKBAAR:
// de gebruiker vinkt uit, hernoemt en verschuift datums, en klikt daarna
// "Toepassen". Bijsturen kan ook via de chat ("maak fase 2 korter") — het
// nieuwe voorstel vervangt dan het oude, zodat aanpassen altijd lichter is
// dan zelf bedenken.

type ChatMsg = { role: "user" | "assistant"; content: string };

type PropTask = { title: string; description?: string; priority?: string; start_date?: string | null; due_date?: string | null; _include: boolean };
type PropMilestone = { name: string; description?: string; start_date?: string | null; end_date?: string | null; tasks: PropTask[]; _include: boolean };
type PropRisk = { name: string; description?: string; category?: string; impact?: string; probability?: number; level?: string; mitigation?: string; _include: boolean };
type Proposal = { summary?: string; milestones: PropMilestone[]; risks: PropRisk[] };

const PRIORITIES: [string, string][] = [["low", "Low"], ["medium", "Medium"], ["high", "High"], ["urgent", "Urgent"]];

const SUGGESTIONS = [
  "Maak een conceptplanning op basis van de projectgegevens",
  "Plan een implementatie in vier fasen met livegang aan het eind",
  "Stel de belangrijkste risico's voor dit project voor",
];

interface Props {
  projectId: string | number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplied: () => void;
}

export default function AiPlanDialog({ projectId, open, onOpenChange, onApplied }: Props) {
  const { pt } = usePageTranslations();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [applying, setApplying] = useState(false);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const token = localStorage.getItem("access_token");
  const jsonHeaders = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, busy]);

  const reset = () => { setMessages([]); setProposal(null); setInput(""); };

  const toProposalState = (p: any): Proposal => ({
    summary: p?.summary || "",
    milestones: (p?.milestones || []).map((m: any) => ({
      name: m?.name || "", description: m?.description || "",
      start_date: m?.start_date || "", end_date: m?.end_date || "",
      _include: true,
      tasks: (m?.tasks || []).map((t: any) => ({
        title: t?.title || "", description: t?.description || "",
        priority: PRIORITIES.some(([k]) => k === t?.priority) ? t.priority : "medium",
        start_date: t?.start_date || "", due_date: t?.due_date || "",
        _include: true,
      })),
    })),
    risks: (p?.risks || []).map((r: any) => ({ ...r, name: r?.name || "", _include: true })),
  });

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    const next: ChatMsg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const r = await fetch(`/api/v1/projects/${projectId}/ai-plan/`, {
        method: "POST", headers: jsonHeaders, body: JSON.stringify({ messages: next }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { toast.error(d.detail || pt("Something went wrong")); setBusy(false); return; }
      setMessages([...next, { role: "assistant", content: d.message || "" }]);
      if (d.action === "propose" && d.proposal) setProposal(toProposalState(d.proposal));
    } catch {
      toast.error(pt("Something went wrong"));
    } finally {
      setBusy(false);
    }
  };

  const includedCounts = () => {
    if (!proposal) return { milestones: 0, tasks: 0, risks: 0 };
    const ms = proposal.milestones.filter((m) => m._include);
    return {
      milestones: ms.length,
      tasks: ms.reduce((n, m) => n + m.tasks.filter((t) => t._include && t.title.trim()).length, 0),
      risks: proposal.risks.filter((r) => r._include && r.name.trim()).length,
    };
  };

  const apply = async () => {
    if (!proposal) return;
    setApplying(true);
    try {
      const body = {
        proposal: {
          milestones: proposal.milestones.filter((m) => m._include && m.name.trim()).map((m) => ({
            name: m.name, description: m.description,
            start_date: m.start_date || null, end_date: m.end_date || null,
            tasks: m.tasks.filter((t) => t._include && t.title.trim()).map((t) => ({
              title: t.title, description: t.description, priority: t.priority,
              start_date: t.start_date || null, due_date: t.due_date || null,
            })),
          })),
          risks: proposal.risks.filter((r) => r._include && r.name.trim()).map(({ _include, ...r }) => r),
        },
      };
      const r = await fetch(`/api/v1/projects/${projectId}/ai-plan/apply/`, {
        method: "POST", headers: jsonHeaders, body: JSON.stringify(body),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { toast.error(d.detail || pt("Save failed")); return; }
      const c = d.created || {};
      toast.success(`${pt("Plan applied")}: ${c.milestones ?? 0} ${pt("milestones")}, ${c.tasks ?? 0} ${pt("tasks")}, ${c.risks ?? 0} ${pt("risks")}`);
      onApplied();
      onOpenChange(false);
      reset();
    } catch {
      toast.error(pt("Save failed"));
    } finally {
      setApplying(false);
    }
  };

  const patchMilestone = (mi: number, patch: Partial<PropMilestone>) =>
    setProposal((p) => p && ({ ...p, milestones: p.milestones.map((m, i) => (i === mi ? { ...m, ...patch } : m)) }));
  const patchTask = (mi: number, ti: number, patch: Partial<PropTask>) =>
    setProposal((p) => p && ({
      ...p,
      milestones: p.milestones.map((m, i) =>
        i === mi ? { ...m, tasks: m.tasks.map((t, j) => (j === ti ? { ...t, ...patch } : t)) } : m),
    }));
  const patchRisk = (ri: number, patch: Partial<PropRisk>) =>
    setProposal((p) => p && ({ ...p, risks: p.risks.map((r, i) => (i === ri ? { ...r, ...patch } : r)) }));

  const counts = includedCounts();

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />{pt("Plan with AI")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex flex-col gap-3 overflow-hidden">
          {/* Chat */}
          <div ref={scrollRef} className="overflow-y-auto space-y-3 pr-1" style={{ maxHeight: proposal ? "22vh" : "48vh" }}>
            {messages.length === 0 && (
              <div className="text-sm text-muted-foreground space-y-3">
                <p>{pt("Describe in a few words what you want to plan — the AI drafts the full plan, you only adjust it.")}</p>
                <div className="flex flex-col gap-2">
                  {SUGGESTIONS.map((s) => (
                    <Button key={s} variant="outline" size="sm" className="justify-start gap-2 h-auto py-2 text-left" onClick={() => send(s)}>
                      <Wand2 className="h-3.5 w-3.5 shrink-0" /><span className="whitespace-normal">{s}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`text-sm rounded-lg px-3 py-2 whitespace-pre-wrap ${m.role === "user" ? "bg-indigo-50 text-indigo-900 ml-10" : "bg-muted mr-10"}`}>
                {m.content}
              </div>
            ))}
            {busy && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />{pt("Drafting your plan…")}</div>}
          </div>

          {/* Bewerkbaar voorstel */}
          {proposal && (
            <div className="flex-1 min-h-0 overflow-y-auto border rounded-lg p-3 space-y-4 bg-background">
              {proposal.summary && <p className="text-sm font-medium">{proposal.summary}</p>}
              {proposal.milestones.map((m, mi) => (
                <div key={mi} className={`space-y-2 ${m._include ? "" : "opacity-50"}`}>
                  <div className="flex items-center gap-2">
                    <Checkbox checked={m._include} onCheckedChange={(v) => patchMilestone(mi, { _include: !!v })} />
                    <Input value={m.name} onChange={(e) => patchMilestone(mi, { name: e.target.value })} className="h-8 font-semibold" />
                    <Input type="date" value={m.start_date || ""} onChange={(e) => patchMilestone(mi, { start_date: e.target.value })} className="h-8 w-36 shrink-0" />
                    <Input type="date" value={m.end_date || ""} onChange={(e) => patchMilestone(mi, { end_date: e.target.value })} className="h-8 w-36 shrink-0" />
                  </div>
                  <div className="pl-7 space-y-1.5">
                    {m.tasks.map((t, ti) => (
                      <div key={ti} className={`flex items-center gap-2 ${t._include ? "" : "opacity-50"}`}>
                        <Checkbox checked={t._include} onCheckedChange={(v) => patchTask(mi, ti, { _include: !!v })} />
                        <Input value={t.title} onChange={(e) => patchTask(mi, ti, { title: e.target.value })} className="h-8 text-sm" />
                        <Select value={t.priority} onValueChange={(v) => patchTask(mi, ti, { priority: v })}>
                          <SelectTrigger className="h-8 w-28 shrink-0 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>{PRIORITIES.map(([k, l]) => <SelectItem key={k} value={k}>{pt(l)}</SelectItem>)}</SelectContent>
                        </Select>
                        <Input type="date" value={t.due_date || ""} onChange={(e) => patchTask(mi, ti, { due_date: e.target.value })} className="h-8 w-36 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {proposal.risks.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{pt("Risks")}</p>
                  {proposal.risks.map((r, ri) => (
                    <div key={ri} className={`flex items-center gap-2 ${r._include ? "" : "opacity-50"}`}>
                      <Checkbox checked={r._include} onCheckedChange={(v) => patchRisk(ri, { _include: !!v })} />
                      <Input value={r.name} onChange={(e) => patchRisk(ri, { name: e.target.value })} className="h-8 text-sm" />
                      <span className="text-xs text-muted-foreground shrink-0 w-28">{r.level || "Medium"} · {r.probability ?? 0}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Invoer + acties */}
          <div className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={proposal ? pt("Adjust via chat, e.g. “make phase 2 shorter”") : pt("Describe what you want to plan…")}
              disabled={busy}
            />
            <Button variant="outline" size="icon" onClick={() => send()} disabled={busy || !input.trim()}><Send className="h-4 w-4" /></Button>
            {proposal && (
              <Button onClick={apply} disabled={applying || counts.milestones === 0} className="gap-2 shrink-0">
                {applying && <Loader2 className="h-4 w-4 animate-spin" />}
                {pt("Apply")} ({counts.tasks} {pt("tasks")})
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
