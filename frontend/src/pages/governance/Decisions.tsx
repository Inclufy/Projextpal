import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import {
  Gavel, Plus, Pencil, Trash2, Shield, CalendarDays, Layers, X, Loader2,
  AlertTriangle, CheckCircle2, PlayCircle, Target, ThumbsUp, ThumbsDown, MinusCircle,
  MessageSquare, Send, Clock,
} from "lucide-react";

// Visual escalation audit-trail (timeline) for a decision: who escalated /
// delegated / assigned, from→to tier, when. Lazy-loads on expand.
function DecisionHistory({ decisionId, pt }: { decisionId: string; pt: (s: string) => string }) {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<any[]>([]);
  const [loaded, setLoaded] = React.useState(false);
  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const load = async () => {
    try { const r = await fetch(`/api/v1/governance/decisions/${decisionId}/events/`, { headers }); if (r.ok) setItems(await r.json()); }
    catch { /* ignore */ } finally { setLoaded(true); }
  };
  const toggle = () => { const n = !open; setOpen(n); if (n && !loaded) load(); };
  const dotColor = (t: string) => t === "escalated" ? "bg-amber-500" : t === "delegated" ? "bg-sky-500" : t === "assigned" ? "bg-violet-500" : "bg-purple-500";
  return (
    <CardContent className="pt-0">
      <button onClick={toggle} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <Clock className="h-3.5 w-3.5" /> {pt("History")}{loaded ? ` (${items.length})` : ""}
      </button>
      {open && (
        <ol className="mt-2 border-l-2 border-purple-200 dark:border-purple-800/40 ml-1.5 pl-4 space-y-2">
          {loaded && items.length === 0 && (
            <p className="text-xs text-muted-foreground -ml-3">{pt("No escalation history yet.")}</p>
          )}
          {items.map((e) => (
            <li key={e.id} className="relative text-sm">
              <span className={`absolute -left-[21px] top-1.5 h-2 w-2 rounded-full ${dotColor(e.event_type)}`} />
              <span className="font-medium">{e.event_label || e.event_type}</span>
              {e.from_tier && e.to_tier
                ? <span className="text-muted-foreground"> · {e.from_tier} → {e.to_tier}</span>
                : e.to_tier
                  ? <span className="text-muted-foreground"> → {e.to_tier}</span>
                  : e.detail
                    ? <span className="text-muted-foreground"> · {e.detail}</span>
                    : null}
              <div className="text-[10px] text-muted-foreground">
                {(e.actor_name || pt("Someone"))} · {e.created_at ? new Date(e.created_at).toLocaleString() : ""}
              </div>
            </li>
          ))}
        </ol>
      )}
    </CardContent>
  );
}

// Inline discussion thread on a decision — boards/steering deliberate on an
// escalated item alongside the binding vote. Lazy-loads on expand.
function DecisionComments({ decisionId, pt }: { decisionId: string; pt: (s: string) => string }) {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<any[]>([]);
  const [loaded, setLoaded] = React.useState(false);
  const [text, setText] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const url = `/api/v1/governance/decisions/${decisionId}/comments/`;

  const load = async () => {
    try { const r = await fetch(url, { headers }); if (r.ok) setItems(await r.json()); }
    catch { /* ignore */ } finally { setLoaded(true); }
  };
  const toggle = () => { const n = !open; setOpen(n); if (n && !loaded) load(); };
  const post = async () => {
    const body = text.trim(); if (!body) return;
    setBusy(true);
    try {
      const r = await fetch(url, { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ body }) });
      if (r.ok) { const c = await r.json(); setItems((p) => [...p, c]); setText(""); }
    } catch { /* ignore */ } finally { setBusy(false); }
  };

  return (
    <CardContent className="pt-0">
      <button onClick={toggle} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <MessageSquare className="h-3.5 w-3.5" /> {pt("Comments")}{loaded ? ` (${items.length})` : ""}
      </button>
      {open && (
        <div className="mt-2 space-y-2">
          {loaded && items.length === 0 && (
            <p className="text-xs text-muted-foreground">{pt("No comments yet — start the discussion.")}</p>
          )}
          {items.map((c) => (
            <div key={c.id} className="text-sm bg-muted/40 rounded-md p-2">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-medium">{c.author_name || pt("Unknown")}</span>
                <span className="text-[10px] text-muted-foreground">{c.created_at ? new Date(c.created_at).toLocaleString() : ""}</span>
              </div>
              <p className="whitespace-pre-wrap leading-snug">{c.body}</p>
            </div>
          ))}
          <div className="flex items-start gap-2">
            <Textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder={pt("Add a comment…")} className="text-sm" />
            <Button size="sm" disabled={busy || !text.trim()} onClick={post} className="gap-1 shrink-0">
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}{pt("Post")}
            </Button>
          </div>
        </div>
      )}
    </CardContent>
  );
}

// Module-scope form type so the dialog state has a stable identity (same
// pattern as AgileEpics — avoids the "inner Field re-mounts every render"
// anti-pattern that bit the sprint-yanmar-fit editors).
type DecisionForm = {
  title: string;
  description: string;
  decided_at: string;
  impact: string;
  status: string;
  evidence: string;
  program: string;
  board: string;
  meeting: string;
  risk: string;
  outcome: string;
  authorized_program: string;
};

interface Decision {
  id: string;
  title: string;
  description: string;
  decided_at: string | null;
  impact: string;
  status: string;
  evidence: string;
  program: number | null;
  board: string | null;
  meeting: string | null;
  risk: number | null;
  decided_by: number | null;
  decided_by_name: string | null;
  outcome: string;
  applied_at: string | null;
  target: { kind: string; id: string; name: string; status: string | null } | null;
}

interface ProgramRef { id: number; name: string }
interface BoardRef { id: string; name: string; board_type: string }
interface MeetingRef { id: string; title: string; type: string }
interface RiskRef { id: number; name: string; project: number; level?: string }

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const IMPACT_COLORS: Record<string, string> = {
  low: "bg-blue-100 text-blue-700",
  medium: "bg-orange-100 text-orange-700",
  high: "bg-red-100 text-red-700",
};

const BOARD_TYPE_LABELS: Record<string, string> = {
  steering_committee: "Steering Committee",
  program_board: "Program Board",
  project_board: "Project Board",
  advisory_board: "Advisory Board",
  executive_board: "Executive Board",
};

const NONE = "__none__";

const Decisions: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { pt } = usePageTranslations();
  const [searchParams, setSearchParams] = useSearchParams();

  const boardFilter = searchParams.get("board");
  const meetingFilter = searchParams.get("meeting");
  const programFilter = searchParams.get("program");
  const riskFilter = searchParams.get("risk");
  const highlight = searchParams.get("highlight");
  // Allow `?board=<id>&add=1` to deep-link "open the create dialog with this
  // board preset" — used by BoardDetail's "Add Decision" button.
  const autoAdd = searchParams.get("add");

  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [programs, setPrograms] = useState<ProgramRef[]>([]);
  const [boards, setBoards] = useState<BoardRef[]>([]);
  const [meetings, setMeetings] = useState<MeetingRef[]>([]);
  const [risks, setRisks] = useState<RiskRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Decision | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<DecisionForm>({
    title: "",
    description: "",
    decided_at: "",
    impact: "medium",
    status: "pending",
    evidence: "",
    program: "",
    board: "",
    meeting: "",
    risk: "",
    outcome: "",
    authorized_program: "",
  });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchAll = async () => {
    try {
      const qs = new URLSearchParams();
      if (boardFilter) qs.set("board", boardFilter);
      if (meetingFilter) qs.set("meeting", meetingFilter);
      if (programFilter) qs.set("program", programFilter);
      if (riskFilter) qs.set("risk", riskFilter);
      const dUrl = `/api/v1/governance/decisions/${qs.toString() ? `?${qs}` : ""}`;
      // Risks come from /api/v1/projects/risks/ — these aren't project-scoped
      // per call, so we paginate with a sensible limit. 100 covers all tenants
      // we have in practice; if/when this grows past that, swap for an async
      // search picker.
      const [dRes, pRes, bRes, mRes, rRes] = await Promise.all([
        fetch(dUrl, { headers }),
        fetch("/api/v1/programs/", { headers }),
        fetch("/api/v1/governance/boards/", { headers }),
        fetch("/api/v1/governance/meetings/", { headers }),
        fetch("/api/v1/projects/risks/?limit=100", { headers }),
      ]);
      if (dRes.ok) { const d = await dRes.json(); setDecisions(Array.isArray(d) ? d : d.results || []); }
      if (pRes.ok) { const d = await pRes.json(); setPrograms(Array.isArray(d) ? d : d.results || []); }
      if (bRes.ok) { const d = await bRes.json(); setBoards(Array.isArray(d) ? d : d.results || []); }
      if (mRes.ok) { const d = await mRes.json(); setMeetings(Array.isArray(d) ? d : d.results || []); }
      if (rRes.ok) { const d = await rRes.json(); setRisks(Array.isArray(d) ? d : d.results || []); }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [boardFilter, meetingFilter, programFilter, riskFilter]);

  // Auto-open the create dialog with the active filter preset when ?add=1.
  useEffect(() => {
    if (autoAdd && !loading && !dialogOpen) {
      setEditing(null);
      setForm({
        title: "",
        description: "",
        decided_at: "",
        impact: "medium",
        status: "pending",
        evidence: "",
        program: programFilter || "",
        board: boardFilter || "",
        meeting: meetingFilter || "",
        risk: riskFilter || "",
        outcome: "",
        authorized_program: programFilter || "",
      });
      setDialogOpen(true);
      const next = new URLSearchParams(searchParams);
      next.delete("add");
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoAdd, loading]);

  const programById = (pid: number | null | undefined) =>
    pid == null ? null : programs.find(p => p.id === pid) || null;
  const boardById = (bid: string | null | undefined) =>
    bid == null ? null : boards.find(b => b.id === bid) || null;
  const meetingById = (mid: string | null | undefined) =>
    mid == null ? null : meetings.find(m => m.id === mid) || null;
  const riskById = (rid: number | null | undefined) =>
    rid == null ? null : risks.find(r => r.id === rid) || null;

  const filterBoard = boardFilter ? boardById(boardFilter) : null;
  const filterMeeting = meetingFilter ? meetingById(meetingFilter) : null;
  const filterProgram = programFilter ? programById(parseInt(programFilter)) : null;
  const filterRisk = riskFilter ? riskById(parseInt(riskFilter)) : null;

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: "",
      description: "",
      decided_at: "",
      impact: "medium",
      status: "pending",
      evidence: "",
      program: programFilter || "",
      board: boardFilter || "",
      meeting: meetingFilter || "",
      risk: riskFilter || "",
      outcome: "",
      authorized_program: programFilter || "",
    });
    setDialogOpen(true);
  };

  const openEdit = (d: Decision) => {
    setEditing(d);
    setForm({
      title: d.title || "",
      description: d.description || "",
      // <input type="datetime-local"> needs YYYY-MM-DDTHH:mm (no seconds, no Z)
      decided_at: d.decided_at ? d.decided_at.slice(0, 16) : "",
      impact: d.impact || "medium",
      status: d.status || "pending",
      evidence: d.evidence || "",
      program: d.program != null ? String(d.program) : "",
      board: d.board || "",
      meeting: d.meeting || "",
      risk: d.risk != null ? String(d.risk) : "",
      outcome: d.outcome || "",
      authorized_program: d.target && d.target.kind === "program" ? d.target.id : "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title) { toast({ title: "Error", description: pt("Title is required"), variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      // FK shape: empty string = unset. On create, omit so the server doesn't
      // see a null; on edit, send explicit null to clear. Same pattern as
      // AgileBacklog.tsx epic FK (audit fix #3).
      const body: any = {
        title: form.title,
        description: form.description,
        impact: form.impact,
        status: form.status,
        evidence: form.evidence,
      };
      if (form.decided_at) body.decided_at = form.decided_at;
      else if (editing) body.decided_at = null;

      if (form.program !== "") body.program = parseInt(form.program);
      else if (editing) body.program = null;

      if (form.board !== "") body.board = form.board;
      else if (editing) body.board = null;

      if (form.meeting !== "") body.meeting = form.meeting;
      else if (editing) body.meeting = null;

      if (form.risk !== "") body.risk = parseInt(form.risk);
      else if (editing) body.risk = null;

      // Authorization fields: outcome drives what `apply` does; authorized_program
      // is the component whose status it flips. Empty = unset (cleared on edit).
      if (form.outcome !== "") body.outcome = form.outcome;
      else if (editing) body.outcome = "";

      if (form.authorized_program !== "") body.authorized_program = parseInt(form.authorized_program);
      else if (editing) body.authorized_program = null;

      const url = editing
        ? `/api/v1/governance/decisions/${editing.id}/`
        : `/api/v1/governance/decisions/`;
      const method = editing ? "PATCH" : "POST";
      const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) {
        toast({ title: pt("Saved"), description: pt("Decision saved.") });
        setDialogOpen(false);
        fetchAll();
      } else {
        const err = await r.json().catch(() => ({}));
        toast({ title: pt("Error"), description: JSON.stringify(err) || pt("Save failed"), variant: "destructive" });
      }
    } catch {
      toast({ title: pt("Error"), description: pt("Save failed"), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (decisionId: string) => {
    if (!confirm(pt("Are you sure you want to delete this?"))) return;
    try {
      const r = await fetch(`/api/v1/governance/decisions/${decisionId}/`, { method: "DELETE", headers });
      if (r.ok || r.status === 204) {
        toast({ title: pt("Deleted"), description: pt("Decision removed.") });
        fetchAll();
      } else {
        toast({ title: pt("Error"), description: pt("Delete failed"), variant: "destructive" });
      }
    } catch {
      toast({ title: pt("Error"), description: pt("Delete failed"), variant: "destructive" });
    }
  };

  // Apply the decision outcome: flips the linked component's status, writes an
  // immutable audit row, and makes the decision append-only. The backend
  // returns a machine-readable `code` on every rejection (400/403/409) — read
  // it so the toast explains exactly why, instead of a generic failure.
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const handleApply = async (d: Decision) => {
    const targetLabel = d.target ? `${d.target.kind} "${d.target.name}"` : pt("the linked component");
    if (!confirm(pt("Apply this decision? This will update {target} and cannot be undone.").replace("{target}", targetLabel))) return;
    setApplyingId(d.id);
    try {
      const r = await fetch(`/api/v1/governance/decisions/${d.id}/apply/`, { method: "POST", headers: jsonHeaders, body: "{}" });
      if (r.ok) {
        toast({ title: pt("Applied"), description: pt("Decision applied — {target} updated.").replace("{target}", targetLabel) });
        fetchAll();
      } else {
        const err = await r.json().catch(() => ({}));
        const codeMsg: Record<string, string> = {
          outcome_required: pt("Set an outcome (authorize / continue / hold / stop) before applying."),
          target_required: pt("Link a project, programme or portfolio before applying."),
          invalid_outcome_for_target: pt("This outcome can't be applied to the linked component."),
          cross_tenant_denied: pt("You can't apply a decision to another tenant's component."),
          already_applied: pt("This decision has already been applied."),
          quorum_not_met: pt("The board's quorum of approve votes hasn't been reached yet."),
        };
        // quorum_not_met carries a human-readable blocker list — show it verbatim.
        const blockerMsg = Array.isArray(err?.blockers) && err.blockers.length
          ? ` ${err.blockers.join(" ")}`
          : "";
        const msg = ((err?.code && codeMsg[err.code]) || err?.detail || pt("Apply failed")) + blockerMsg;
        toast({ title: pt("Cannot apply"), description: msg, variant: "destructive" });
        if (err?.code === "already_applied") fetchAll();
      }
    } catch {
      toast({ title: pt("Error"), description: pt("Apply failed"), variant: "destructive" });
    } finally {
      setApplyingId(null);
    }
  };

  // Cast / update the requester's vote on a board decision. The tally + quorum
  // status come back in the response so we can confirm whether the decision is
  // now applyable (P2-Governance #44 binding vote).
  const [votingId, setVotingId] = useState<string | null>(null);
  const handleVote = async (d: Decision, vote: "approve" | "reject" | "abstain") => {
    setVotingId(d.id);
    try {
      const r = await fetch(`/api/v1/governance/decisions/${d.id}/votes/`, {
        method: "POST", headers: jsonHeaders, body: JSON.stringify({ vote }),
      });
      const data = await r.json().catch(() => ({}));
      if (r.ok) {
        const t = data.tally || {};
        const met = data.quorum_met
          ? pt("Quorum met — ready to apply.")
          : pt("Quorum not yet met.");
        toast({
          title: pt("Vote recorded"),
          description: `${pt("Approve")} ${t.approve ?? 0} · ${pt("Reject")} ${t.reject ?? 0} · ${pt("Abstain")} ${t.abstain ?? 0}. ${met}`,
        });
      } else {
        const msg = data?.code === "decision_applied"
          ? pt("This decision has already been applied; voting is closed.")
          : data?.detail || pt("Vote failed");
        toast({ title: pt("Cannot vote"), description: msg, variant: "destructive" });
      }
    } catch {
      toast({ title: pt("Error"), description: pt("Vote failed"), variant: "destructive" });
    } finally {
      setVotingId(null);
    }
  };

  const clearFilter = (key: string) => {
    const next = new URLSearchParams(searchParams);
    next.delete(key);
    setSearchParams(next, { replace: true });
  };

  const clearAllFilters = () => {
    const next = new URLSearchParams();
    if (highlight) next.set("highlight", highlight);
    setSearchParams(next, { replace: true });
  };

  const hasFilters = !!(boardFilter || meetingFilter || programFilter || riskFilter);

  const orderedDecisions = useMemo(() => {
    if (!highlight) return decisions;
    // Surface the highlighted decision at the top so the deep-link from
    // BoardDetail (e.g. `?board=<id>&highlight=<dec>`) lands on the right row.
    const idx = decisions.findIndex(d => d.id === highlight);
    if (idx < 0) return decisions;
    return [decisions[idx], ...decisions.slice(0, idx), ...decisions.slice(idx + 1)];
  }, [decisions, highlight]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Gavel className="h-8 w-8" /> {pt("Decisions")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {pt("Governance decisions across boards, meetings, and programmes")}
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> {pt("Add Decision")}
        </Button>
      </div>

      {/* Filter chips — mirrors the AgileBacklog ?epic= filter pattern. */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-muted/50 border rounded-md text-sm">
          <span className="text-muted-foreground">{pt("Filtered by")}:</span>
          {filterBoard && (
            <Badge variant="outline" className="gap-1">
              <Shield className="h-3 w-3" /> {filterBoard.name}
              <button
                type="button"
                onClick={() => clearFilter("board")}
                className="ml-1 hover:text-red-500"
                aria-label={pt("Clear board filter")}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filterMeeting && (
            <Badge variant="outline" className="gap-1">
              <CalendarDays className="h-3 w-3" /> {filterMeeting.title}
              <button
                type="button"
                onClick={() => clearFilter("meeting")}
                className="ml-1 hover:text-red-500"
                aria-label={pt("Clear meeting filter")}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filterProgram && (
            <Badge variant="outline" className="gap-1">
              <Layers className="h-3 w-3" /> {filterProgram.name}
              <button
                type="button"
                onClick={() => clearFilter("program")}
                className="ml-1 hover:text-red-500"
                aria-label={pt("Clear program filter")}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filterRisk && (
            <Badge variant="outline" className="gap-1">
              <AlertTriangle className="h-3 w-3" /> {filterRisk.name}
              <button
                type="button"
                onClick={() => clearFilter("risk")}
                className="ml-1 hover:text-red-500"
                aria-label={pt("Clear risk filter")}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <Button variant="ghost" size="sm" className="ml-auto h-6 gap-1" onClick={clearAllFilters}>
            <X className="h-3 w-3" /> {pt("Clear all")}
          </Button>
        </div>
      )}

      {orderedDecisions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Gavel className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{pt("No decisions yet")}</h3>
            <p className="text-muted-foreground mb-4">
              {pt("Record governance decisions to keep an auditable trail.")}
            </p>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" /> {pt("Add Decision")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orderedDecisions.map((d) => {
            const linkedProgram = programById(d.program);
            const linkedBoard = boardById(d.board);
            const linkedMeeting = meetingById(d.meeting);
            const linkedRisk = riskById(d.risk);
            const isHighlighted = highlight && d.id === highlight;
            return (
              <Card key={d.id} className={`hover:shadow-md transition-shadow ${isHighlighted ? "ring-2 ring-purple-400" : ""}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-base">{d.title}</CardTitle>
                        <Badge className={`text-xs ${STATUS_COLORS[d.status] || ""}`}>{d.status}</Badge>
                        <Badge className={`text-xs ${IMPACT_COLORS[d.impact] || ""}`}>
                          {pt("Impact")}: {d.impact}
                        </Badge>
                        {linkedBoard && (
                          <Badge
                            variant="outline"
                            className="text-xs cursor-pointer hover:bg-muted gap-1"
                            onClick={(e) => { e.stopPropagation(); navigate(`/governance/boards/${linkedBoard.id}`); }}
                            title={pt("Open linked board")}
                          >
                            <Shield className="h-3 w-3" /> {linkedBoard.name}
                          </Badge>
                        )}
                        {linkedMeeting && (
                          <Badge
                            variant="outline"
                            className="text-xs gap-1"
                            title={pt("Linked meeting")}
                          >
                            <CalendarDays className="h-3 w-3" /> {linkedMeeting.title}
                          </Badge>
                        )}
                        {linkedProgram && (
                          <Badge
                            variant="outline"
                            className="text-xs cursor-pointer hover:bg-muted gap-1"
                            onClick={(e) => { e.stopPropagation(); navigate(`/programs/${linkedProgram.id}`); }}
                            title={pt("Open linked programme")}
                          >
                            <Layers className="h-3 w-3" /> {linkedProgram.name}
                          </Badge>
                        )}
                        {linkedRisk && (
                          <Badge
                            variant="outline"
                            className="text-xs cursor-pointer hover:bg-muted gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Deep-link to the project's risk register with highlight.
                              navigate(`/projects/${linkedRisk.project}?tab=risks&highlight=${linkedRisk.id}`);
                            }}
                            title={pt("Open linked risk")}
                          >
                            <AlertTriangle className="h-3 w-3" /> {linkedRisk.name}
                          </Badge>
                        )}
                      </div>
                      {d.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{d.description}</p>
                      )}
                      {d.target && (
                        <div className="flex items-center gap-2 mt-2 text-xs">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Target className="h-3 w-3" />
                            {pt("Authorizes")}:
                          </span>
                          <span className="font-medium capitalize">{d.target.kind} · {d.target.name}</span>
                          {d.target.status && (
                            <Badge variant="secondary" className="text-[10px] capitalize">
                              {String(d.target.status).replace(/_/g, " ")}
                            </Badge>
                          )}
                          {d.outcome && (
                            <Badge variant="outline" className="text-[10px] capitalize">
                              {pt("outcome")}: {d.outcome}
                            </Badge>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        {d.decided_at && (
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" /> {new Date(d.decided_at).toLocaleString()}
                          </span>
                        )}
                        {d.decided_by_name && (
                          <span>{pt("by")} {d.decided_by_name}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {d.applied_at ? (
                        <Badge variant="outline" className="text-xs gap-1 border-green-300 text-green-700">
                          <CheckCircle2 className="h-3 w-3" /> {pt("Applied")}
                        </Badge>
                      ) : (
                        d.outcome && d.target && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            disabled={applyingId === d.id}
                            onClick={() => handleApply(d)}
                            title={pt("Apply this decision to the linked component")}
                          >
                            {applyingId === d.id
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              : <PlayCircle className="h-3.5 w-3.5" />}
                            {pt("Apply")}
                          </Button>
                        )
                      )}
                      <Button variant="ghost" size="sm" disabled={!!d.applied_at} onClick={() => openEdit(d)} title={d.applied_at ? pt("Applied decisions are read-only") : pt("Edit")}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(d.id)} title={pt("Delete")}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {d.evidence && (
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">{pt("Evidence")}:</span> {d.evidence}
                    </p>
                  </CardContent>
                )}
                {/* Binding vote bar: a board decision must reach the board's
                    quorum of approve votes before it can be Applied (#44). */}
                {linkedBoard && !d.applied_at && (
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">{pt("Board vote")}:</span>
                      <Button
                        variant="outline" size="sm" className="h-7 gap-1"
                        disabled={votingId === d.id}
                        onClick={() => handleVote(d, "approve")}
                      >
                        <ThumbsUp className="h-3.5 w-3.5" /> {pt("Approve")}
                      </Button>
                      <Button
                        variant="outline" size="sm" className="h-7 gap-1"
                        disabled={votingId === d.id}
                        onClick={() => handleVote(d, "reject")}
                      >
                        <ThumbsDown className="h-3.5 w-3.5" /> {pt("Reject")}
                      </Button>
                      <Button
                        variant="ghost" size="sm" className="h-7 gap-1"
                        disabled={votingId === d.id}
                        onClick={() => handleVote(d, "abstain")}
                      >
                        <MinusCircle className="h-3.5 w-3.5" /> {pt("Abstain")}
                      </Button>
                    </div>
                  </CardContent>
                )}
                <DecisionHistory decisionId={d.id} pt={pt} />
                <DecisionComments decisionId={d.id} pt={pt} />
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? pt("Edit Decision") : pt("Add Decision")}</DialogTitle>
            <DialogDescription>
              {editing
                ? pt("Edit decision details and parent linkage.")
                : pt("Record a governance decision and link it to a board, meeting, or programme.")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{pt("Title")} *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{pt("Description")}</Label>
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{pt("Decided At")}</Label>
                <Input
                  type="datetime-local"
                  value={form.decided_at}
                  onChange={(e) => setForm({ ...form, decided_at: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{pt("Status")}</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{pt("Pending")}</SelectItem>
                    <SelectItem value="approved">{pt("Approved")}</SelectItem>
                    <SelectItem value="rejected">{pt("Rejected")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{pt("Impact")}</Label>
              <Select value={form.impact} onValueChange={(v) => setForm({ ...form, impact: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{pt("Low")}</SelectItem>
                  <SelectItem value="medium">{pt("Medium")}</SelectItem>
                  <SelectItem value="high">{pt("High")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{pt("Board")}</Label>
                <Select
                  value={form.board || NONE}
                  onValueChange={(v) => setForm({ ...form, board: v === NONE ? "" : v })}
                >
                  <SelectTrigger><SelectValue placeholder={pt("None")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>{pt("None")}</SelectItem>
                    {boards.map(b => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name} ({BOARD_TYPE_LABELS[b.board_type] || b.board_type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{pt("Meeting")}</Label>
                <Select
                  value={form.meeting || NONE}
                  onValueChange={(v) => setForm({ ...form, meeting: v === NONE ? "" : v })}
                >
                  <SelectTrigger><SelectValue placeholder={pt("None")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>{pt("None")}</SelectItem>
                    {meetings.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{pt("Programme")}</Label>
                <Select
                  value={form.program || NONE}
                  onValueChange={(v) => setForm({ ...form, program: v === NONE ? "" : v })}
                >
                  <SelectTrigger><SelectValue placeholder={pt("None")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>{pt("None")}</SelectItem>
                    {programs.map(p => (
                      <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{pt("Risk")}</Label>
                <Select
                  value={form.risk || NONE}
                  onValueChange={(v) => setForm({ ...form, risk: v === NONE ? "" : v })}
                >
                  <SelectTrigger><SelectValue placeholder={pt("None")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>{pt("None")}</SelectItem>
                    {risks.map(r => (
                      <SelectItem key={r.id} value={String(r.id)}>
                        {r.name}{r.level ? ` (${r.level})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Authorization: when an outcome + target are set, the decision can be
                Applied — flipping the linked component's status and writing an audit row. */}
            <div className="rounded-md border border-dashed p-3 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Target className="h-4 w-4" /> {pt("Authorization")}
                <span className="text-xs font-normal text-muted-foreground">{pt("(optional — enables Apply)")}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{pt("Outcome")}</Label>
                  <Select
                    value={form.outcome || NONE}
                    onValueChange={(v) => setForm({ ...form, outcome: v === NONE ? "" : v })}
                  >
                    <SelectTrigger><SelectValue placeholder={pt("None")} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>{pt("None")}</SelectItem>
                      <SelectItem value="authorize">{pt("Authorize (start)")}</SelectItem>
                      <SelectItem value="continue">{pt("Continue")}</SelectItem>
                      <SelectItem value="hold">{pt("Hold")}</SelectItem>
                      <SelectItem value="stop">{pt("Stop")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{pt("Authorized Programme")}</Label>
                  <Select
                    value={form.authorized_program || NONE}
                    onValueChange={(v) => setForm({ ...form, authorized_program: v === NONE ? "" : v })}
                  >
                    <SelectTrigger><SelectValue placeholder={pt("None")} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>{pt("None")}</SelectItem>
                      {programs.map(p => (
                        <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{pt("Evidence")}</Label>
              <Textarea
                rows={2}
                value={form.evidence}
                onChange={(e) => setForm({ ...form, evidence: e.target.value })}
                placeholder={pt("Links / references to supporting artefacts")}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button>
              <Button onClick={handleSave} disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Decisions;
