import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectHeader } from "@/components/ProjectHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Clock, Plus, Pencil, Loader2, MapPin, Users, FileText, Sparkles, Trash2, Mail, Download, ListChecks } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { usePageTranslations } from '@/hooks/usePageTranslations';
import { toast } from "sonner";

// Model choices: type = recurring|onetime, frequency = weekly|biweekly|monthly.
const MEETING_TYPES: [string, string][] = [["recurring", "Recurring"], ["onetime", "One-time"]];
const FREQUENCIES: [string, string][] = [["weekly", "Weekly"], ["biweekly", "Bi-weekly"], ["monthly", "Monthly"]];
const STATUSES = ["scheduled", "completed", "cancelled"];

const emptyForm = {
  name: "", type: "recurring", frequency: "weekly", date: "", time: "09:00", location: "", status: "scheduled",
  customer_supplier: "", yanmar_meeting_room: "", previous_meeting: "",
  agenda: "", discussion_notes: "", conclusions: "",
};

const ExecutionMeeting = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [newAtt, setNewAtt] = useState({ name_text: "", presence: "invited" });
  const [newAct, setNewAct] = useState({ subject: "", pic_text: "", action_due: "" });
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importing, setImporting] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailAttachIcs, setEmailAttachIcs] = useState(false);
  const [sending, setSending] = useState(false);

  const buildMinutesText = (m: any): string => {
    const L: string[] = [];
    const when = [m.date, m.time].filter(Boolean).join(" ");
    if (when) L.push(`Date/time: ${when}`);
    const loc = m.location || m.yanmar_meeting_room || "";
    if (loc) L.push(`Location: ${loc}`);
    if (m.customer_supplier) L.push(`${m.customer_supplier} <-> Yanmar Europe`);
    const atts = m.attendees || [];
    if (atts.length) { L.push("", "Attendees:"); atts.forEach((a: any) => L.push(`  - ${a.name_text || ""} (${a.presence || ""})`)); }
    const agenda = Array.isArray(m.agenda) ? m.agenda : [];
    if (agenda.length) { L.push("", "Agenda:"); agenda.forEach((a: string, i: number) => L.push(`  ${i + 1}. ${a}`)); }
    if (m.discussion_notes) L.push("", "Discussion:", m.discussion_notes);
    if (m.conclusions) L.push("", "Conclusions:", m.conclusions);
    const acts = m.action_items || [];
    if (acts.length) { L.push("", "Action items:"); acts.forEach((it: any) => L.push(`  - ${it.subject} | PIC: ${it.pic_name || it.pic_text || "—"} | Due: ${it.action_due || "—"} | ${it.status || ""}`)); }
    return L.join("\n");
  };

  const openEmail = () => {
    const m = selected; if (!m) return;
    const emails = (m.attendees || [])
      .map((a: any) => a.contact_info || a.name_text || "")
      .filter((s: string) => /[^@\s]+@[^@\s]+\.[^@\s]+/.test(s));
    setEmailTo(Array.from(new Set(emails)).join(", "));
    setEmailSubject(`Minutes — ${m.name || "Meeting"}`);
    setEmailBody(buildMinutesText(m));
    setEmailAttachIcs(false);
    setEmailOpen(true);
  };
  const sendEmail = async () => {
    if (!selected) return;
    setSending(true);
    try {
      const r = await fetch(`/api/v1/communication/meetings/${selected.id}/send-email/`, {
        method: "POST", headers: jsonHeaders,
        body: JSON.stringify({ recipients: emailTo, subject: emailSubject, body: emailBody, attach_ics: emailAttachIcs }),
      });
      const d = await r.json().catch(() => ({}));
      if (r.ok) { toast.success(`${pt("Sent to")} ${(d.sent_to || []).length} ${pt("recipient(s)")}`); setEmailOpen(false); }
      else toast.error(d.detail || pt("Email failed"));
    } catch { toast.error(pt("Email failed")); }
    finally { setSending(false); }
  };

  const runExtract = async () => {
    if (!selected) return;
    setImporting(true);
    try {
      const url = `/api/v1/communication/meetings/${selected.id}/extract-minutes/`;
      const r = await fetch(url, { method: "POST", headers: jsonHeaders, body: JSON.stringify({ text: importText }) });
      const d = await r.json().catch(() => ({}));
      if (r.ok) {
        toast.success(`${pt("Minutes generated")} — ${d.agenda_count ?? 0} ${pt("agenda")}, ${d.actions_created ?? 0} ${pt("actions")}`);
        setImportOpen(false); setImportText(""); fetchData();
      } else toast.error(d.detail || pt("Could not extract"));
    } catch { toast.error(pt("Could not extract")); }
    finally { setImporting(false); }
  };
  const pushActions = async () => {
    if (!selected) return;
    try {
      const r = await fetch(`/api/v1/communication/meetings/${selected.id}/push-actions-to-tasks/`, { method: "POST", headers: jsonHeaders, body: "{}" });
      const d = await r.json().catch(() => ({}));
      if (r.ok) toast.success(`${d.created ?? 0} ${pt("action(s) added to the task list")}`);
      else toast.error(d.detail || pt("Failed"));
    } catch { toast.error(pt("Failed")); }
  };
  const downloadIcs = async () => {
    if (!selected) return;
    try {
      const r = await fetch(`/api/v1/communication/meetings/${selected.id}/invite-ics/`, { headers });
      if (!r.ok) { toast.error(pt("Failed")); return; }
      const blob = await r.blob(); const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `meeting-${selected.id}.ics`; a.click(); URL.revokeObjectURL(url);
    } catch { toast.error(pt("Failed")); }
  };
  const downloadMinutes = () => {
    const m = selected; if (!m) return;
    const L: string[] = [`# Minutes — ${m.name || "Meeting"}`, ""];
    const when = [m.date, m.time].filter(Boolean).join(" ");
    if (when) L.push(`**Date/time:** ${when}`);
    const loc = m.location || m.yanmar_meeting_room || "";
    if (loc) L.push(`**Location:** ${loc}`);
    if (m.customer_supplier) L.push(`**${m.customer_supplier} ↔ Yanmar Europe**`);
    const atts = m.attendees || [];
    if (atts.length) { L.push("", "## Attendees"); atts.forEach((a: any) => L.push(`- ${a.name_text || ""} (${a.presence || ""})`)); }
    const agenda = Array.isArray(m.agenda) ? m.agenda : [];
    if (agenda.length) { L.push("", "## Agenda"); agenda.forEach((a: string, i: number) => L.push(`${i + 1}. ${a}`)); }
    if (m.discussion_notes) L.push("", "## Discussion", m.discussion_notes);
    if (m.conclusions) L.push("", "## Conclusions", m.conclusions);
    const acts = m.action_items || [];
    if (acts.length) {
      L.push("", "## Action items", "", "| Subject | PIC | Due | Status |", "|---|---|---|---|");
      acts.forEach((it: any) => L.push(`| ${it.subject || ""} | ${it.pic_name || it.pic_text || "—"} | ${it.action_due || "—"} | ${it.status || ""} |`));
    }
    const blob = new Blob([L.join("\n")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `minutes-${(m.name || "meeting").replace(/[^\w.-]+/g, "_")}.md`; a.click();
    URL.revokeObjectURL(url);
  };
  const onFile = async (file?: File) => {
    if (!file || !selected) return;
    if (file.name.toLowerCase().endsWith(".txt")) {
      setImportText(await file.text());
      return;
    }
    // .docx / other → send to the server for extraction
    setImporting(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const r = await fetch(`/api/v1/communication/meetings/${selected.id}/extract-minutes/`, { method: "POST", headers, body: fd });
      const d = await r.json().catch(() => ({}));
      if (r.ok) {
        toast.success(`${pt("Minutes generated")} — ${d.agenda_count ?? 0} ${pt("agenda")}, ${d.actions_created ?? 0} ${pt("actions")}`);
        setImportOpen(false); setImportText(""); fetchData();
      } else toast.error(d.detail || pt("Could not extract"));
    } catch { toast.error(pt("Could not extract")); }
    finally { setImporting(false); }
  };

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/v1/communication/meetings/?project=${id}`, { headers });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.results || [];
        setMeetings(list);
        setSelected((cur: any) => cur ? list.find((m: any) => String(m.id) === String(cur.id)) || null : null);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const agendaToText = (a: any) => Array.isArray(a) ? a.join("\n") : (a || "");
  const textToAgenda = (t: string) => t.split("\n").map((l) => l.trim()).filter(Boolean);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, date: new Date().toISOString().split("T")[0] });
    setDialogOpen(true);
  };

  const openEdit = (m: any) => {
    setEditing(m);
    setForm({
      name: m.name || "", type: m.type || "recurring", frequency: m.frequency || "weekly", date: m.date?.split("T")[0] || "",
      time: m.time || "09:00", location: m.location || "", status: m.status || "scheduled",
      customer_supplier: m.customer_supplier || "", yanmar_meeting_room: m.yanmar_meeting_room || "", previous_meeting: m.previous_meeting ? String(m.previous_meeting) : "",
      agenda: agendaToText(m.agenda), discussion_notes: m.discussion_notes || "", conclusions: m.conclusions || "",
    });
    setDialogOpen(true);
  };

  const [drafting, setDrafting] = useState(false);
  const draftAgenda = async () => {
    setDrafting(true);
    try {
      const r = await fetch(`/api/v1/projects/${id}/ai/draft-meeting/`, { headers });
      if (r.ok) {
        const d = await r.json();
        const agendaText = Array.isArray(d.agenda) ? d.agenda.join("\n") : "";
        setForm((f) => ({
          ...f,
          agenda: f.agenda ? f.agenda + "\n" + agendaText : agendaText,
          discussion_notes: f.discussion_notes || d.discussion || "",
        }));
        toast.success(pt("Agenda drafted — review before saving"));
      } else toast.error(pt("Could not draft agenda"));
    } catch { toast.error(pt("Could not draft agenda")); }
    finally { setDrafting(false); }
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const body: any = {
        project: id,
        name: form.name, type: form.type, frequency: form.frequency, location: form.location, status: form.status,
        customer_supplier: form.customer_supplier, yanmar_meeting_room: form.yanmar_meeting_room,
        agenda: textToAgenda(form.agenda), discussion_notes: form.discussion_notes, conclusions: form.conclusions,
      };
      if (form.date) body.date = form.date;
      if (form.time) body.time = form.time;
      body.previous_meeting = form.previous_meeting ? Number(form.previous_meeting) : null;
      const url = editing
        ? `/api/v1/communication/meetings/${editing.id}/`
        : `/api/v1/communication/meetings/`;
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) });
      if (res.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); }
      else toast.error(pt("Save failed"));
    } catch { toast.error(pt("Save failed")); }
    finally { setSubmitting(false); }
  };

  const statusColor = (s: string) => ({ scheduled: "bg-blue-100 text-blue-700", completed: "bg-green-100 text-green-700", cancelled: "bg-gray-100 text-gray-600" }[s] || "bg-gray-100");

  // MM-01 attendees
  const addAttendee = async () => {
    if (!selected || !newAtt.name_text.trim()) return;
    const res = await fetch(`/api/v1/communication/meeting-attendees/`, {
      method: "POST", headers: jsonHeaders,
      body: JSON.stringify({ meeting: selected.id, name_text: newAtt.name_text, presence: newAtt.presence }),
    });
    if (res.ok) { setNewAtt({ name_text: "", presence: "invited" }); fetchData(); } else toast.error(pt("Save failed"));
  };
  const delAttendee = async (aid: number) => {
    const res = await fetch(`/api/v1/communication/meeting-attendees/${aid}/`, { method: "DELETE", headers });
    if (res.ok || res.status === 204) fetchData();
  };
  // MM-02 action items
  const addAction = async () => {
    if (!selected || !newAct.subject.trim()) return;
    const res = await fetch(`/api/v1/communication/meeting-action-items/`, {
      method: "POST", headers: jsonHeaders,
      body: JSON.stringify({ meeting: selected.id, subject: newAct.subject, pic_text: newAct.pic_text, action_due: newAct.action_due, status: "open" }),
    });
    if (res.ok) { setNewAct({ subject: "", pic_text: "", action_due: "" }); fetchData(); } else toast.error(pt("Save failed"));
  };
  const toggleAction = async (it: any) => {
    const res = await fetch(`/api/v1/communication/meeting-action-items/${it.id}/`, {
      method: "PATCH", headers: jsonHeaders, body: JSON.stringify({ status: it.status === "open" ? "closed" : "open" }),
    });
    if (res.ok) fetchData();
  };
  // MM-03 carry-forward
  const carryForward = async () => {
    if (!selected) return;
    const res = await fetch(`/api/v1/communication/meetings/${selected.id}/carry-forward/`, { method: "POST", headers });
    if (res.ok) { const d = await res.json(); toast.success(`${pt("Carried forward")}: ${d.carried_forward}`); fetchData(); }
    else { const d = await res.json().catch(() => ({})); toast.error(d.detail || pt("Set a previous meeting first")); }
  };

  if (loading) return (
    <div className="min-h-full bg-background"><ProjectHeader />
      <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
    </div>
  );

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">{pt("Meetings")}</h2>
                <p className="text-sm text-muted-foreground">{meetings.length} {pt("total")}</p>
              </div>
              <Button onClick={openCreate} size="sm" className="gap-2"><Plus className="h-4 w-4" />{pt("New")}</Button>
            </div>
            {meetings.length === 0 ? (
              <div className="text-center py-10">
                <CalendarIcon className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-3">{pt("No meetings yet")}</p>
                <Button onClick={openCreate} size="sm"><Plus className="h-4 w-4 mr-2" />{pt("Schedule New Meeting")}</Button>
              </div>
            ) : (
              <div className="space-y-2">
                {meetings.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelected(m)}
                    className={`w-full text-left p-3 rounded-md border transition-colors ${String(selected?.id) === String(m.id) ? "border-primary bg-primary/5" : "hover:bg-accent"}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{m.name || pt("Meeting")}</span>
                      <Badge className={`text-xs ${statusColor(m.status)}`}>{m.status}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><CalendarIcon className="h-3 w-3" />{m.date || "—"}</span>
                      {m.time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{m.time}</span>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Detail */}
          <Card className="p-6 lg:col-span-2">
            {!selected ? (
              <div className="text-center py-16">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">{pt("Select a meeting to view its minutes")}</p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-bold">{selected.name}</h2>
                      <Badge className={`text-xs ${statusColor(selected.status)}`}>{selected.status}</Badge>
                      <Badge variant="outline" className="text-xs">{selected.type}</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><CalendarIcon className="h-4 w-4" />{selected.date || "—"}</span>
                      {selected.time && <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{selected.time}</span>}
                      {selected.yanmar_meeting_room && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{selected.yanmar_meeting_room}</span>}
                      {selected.customer_supplier && <span className="flex items-center gap-1"><Users className="h-4 w-4" />{selected.customer_supplier} ↔ Yanmar Europe</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    <Button variant="outline" size="sm" onClick={() => setImportOpen(true)} className="gap-2"><Sparkles className="h-4 w-4 text-fuchsia-600" />{pt("Minutes from notes")}</Button>
                    <Button variant="outline" size="sm" onClick={openEmail} className="gap-2"><Mail className="h-4 w-4" />{pt("Email")}</Button>
                    <Button variant="outline" size="sm" onClick={downloadMinutes} className="gap-2"><Download className="h-4 w-4" />{pt("Download minutes")}</Button>
                    <Button variant="outline" size="sm" onClick={downloadIcs} className="gap-2"><CalendarIcon className="h-4 w-4" />{pt("Download .ics")}</Button>
                    <Button variant="outline" size="sm" onClick={() => openEdit(selected)} className="gap-2"><Pencil className="h-4 w-4" />{pt("Edit")}</Button>
                  </div>
                </div>

                <Section title={pt("Agenda")}>
                  {Array.isArray(selected.agenda) && selected.agenda.length > 0 ? (
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      {selected.agenda.map((a: string, i: number) => <li key={i}>{a}</li>)}
                    </ol>
                  ) : <Empty pt={pt} />}
                </Section>

                <Section title={pt("Discussion")}>
                  {selected.discussion_notes ? <p className="text-sm whitespace-pre-wrap">{selected.discussion_notes}</p> : <Empty pt={pt} />}
                </Section>

                <Section title={pt("Conclusions")}>
                  {selected.conclusions ? <p className="text-sm whitespace-pre-wrap">{selected.conclusions}</p> : <Empty pt={pt} />}
                </Section>

                {/* MM-01 — Attendees split Invited / Attended / Absent */}
                <Section title={pt("Attendees")}>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {(["invited", "attended", "absent"] as const).map((p) => {
                      const list = (selected.attendees || []).filter((a: any) => a.presence === p);
                      return (
                        <div key={p} className="border rounded-md p-2">
                          <div className="text-xs font-semibold uppercase text-muted-foreground mb-1">{pt(p)} ({list.length})</div>
                          {list.length === 0 ? <span className="text-xs text-muted-foreground italic">—</span> : list.map((a: any) => (
                            <div key={a.id} className="flex items-center justify-between text-sm">
                              <span>{a.user_name || a.name_text}</span>
                              <button onClick={() => delAttendee(a.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-2">
                    <Input className="h-8" placeholder={pt("Name")} value={newAtt.name_text} onChange={(e) => setNewAtt({ ...newAtt, name_text: e.target.value })} />
                    <Select value={newAtt.presence} onValueChange={(v) => setNewAtt({ ...newAtt, presence: v })}>
                      <SelectTrigger className="h-8 w-[130px]"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="invited">{pt("invited")}</SelectItem><SelectItem value="attended">{pt("attended")}</SelectItem><SelectItem value="absent">{pt("absent")}</SelectItem></SelectContent>
                    </Select>
                    <Button size="sm" onClick={addAttendee}><Plus className="h-4 w-4" /></Button>
                  </div>
                </Section>

                {/* MM-02 + MM-03 — Action items with PIC + due, carry-forward */}
                <Section title={pt("Action Items")}>
                  <div className="flex justify-end gap-2 mb-2">
                    <Button size="sm" variant="outline" onClick={pushActions} className="gap-1 text-xs"><ListChecks className="h-3 w-3" />{pt("Send actions to task list")}</Button>
                    <Button size="sm" variant="outline" onClick={carryForward} className="gap-1 text-xs"><FileText className="h-3 w-3" />{pt("Carry forward previous actions")}</Button>
                  </div>
                  {(selected.action_items || []).length === 0 ? <Empty pt={pt} /> : (
                    <table className="w-full text-sm mb-3">
                      <thead><tr className="text-left text-muted-foreground border-b"><th className="py-1">{pt("Subject")}</th><th className="py-1 px-2" title={pt("PIC = Person In Charge")}>{pt("PIC")}</th><th className="py-1 px-2">{pt("Due")}</th><th className="py-1 px-2">{pt("Status")}</th></tr></thead>
                      <tbody>
                        {(selected.action_items || []).map((it: any) => (
                          <tr key={it.id} className="border-b">
                            <td className="py-1">{it.source_meeting && <Badge variant="outline" className="mr-1 text-[10px]">↩</Badge>}{it.subject}</td>
                            <td className="py-1 px-2">{it.pic_name || it.pic_text || "—"}</td>
                            <td className="py-1 px-2">{it.action_due || "—"}</td>
                            <td className="py-1 px-2"><button onClick={() => toggleAction(it)}><Badge className={it.status === "open" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}>{it.status}</Badge></button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  <div className="flex gap-2">
                    <Input className="h-8 flex-1" placeholder={pt("Subject")} value={newAct.subject} onChange={(e) => setNewAct({ ...newAct, subject: e.target.value })} />
                    <Input className="h-8 w-[150px]" placeholder={pt("Person In Charge")} title={pt("PIC = Person In Charge")} value={newAct.pic_text} onChange={(e) => setNewAct({ ...newAct, pic_text: e.target.value })} />
                    <Input className="h-8 w-[150px]" type="date" title={pt("Due date")} value={newAct.action_due} onChange={(e) => setNewAct({ ...newAct, action_due: e.target.value })} />
                    <Button size="sm" onClick={addAction}><Plus className="h-4 w-4" /></Button>
                  </div>
                </Section>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Create / Edit */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? pt("Edit Meeting") : pt("New Meeting")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>{pt("Name")}</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{pt("Type")}</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{MEETING_TYPES.map(([v, l]) => <SelectItem key={v} value={v}>{pt(l)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{pt("Frequency")}</Label>
                <Select value={form.frequency} onValueChange={(v) => setForm({ ...form, frequency: v })} disabled={form.type === "onetime"}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{FREQUENCIES.map(([v, l]) => <SelectItem key={v} value={v}>{pt(l)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{pt("Status")}</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{pt("Date")}</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              <div className="space-y-2"><Label>{pt("Time")}</Label><Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{pt("Customer / Supplier")}</Label><Input value={form.customer_supplier} onChange={(e) => setForm({ ...form, customer_supplier: e.target.value })} /></div>
              <div className="space-y-2"><Label>{pt("Meeting Room")}</Label><Input value={form.yanmar_meeting_room} onChange={(e) => setForm({ ...form, yanmar_meeting_room: e.target.value })} /></div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{pt("Agenda")} <span className="text-xs text-muted-foreground">({pt("one per line")})</span></Label>
                <Button type="button" variant="ghost" size="sm" className="gap-1 h-7 text-fuchsia-600" onClick={draftAgenda} disabled={drafting}>{drafting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}{pt("AI agenda")}</Button>
              </div>
              <textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.agenda} onChange={(e) => setForm({ ...form, agenda: e.target.value })} />
            </div>
            <div className="space-y-2"><Label>{pt("Discussion")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.discussion_notes} onChange={(e) => setForm({ ...form, discussion_notes: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Conclusions")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.conclusions} onChange={(e) => setForm({ ...form, conclusions: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>{pt("Previous Meeting")} <span className="text-xs text-muted-foreground">({pt("for carry-forward")})</span></Label>
              <Select value={form.previous_meeting || "none"} onValueChange={(v) => setForm({ ...form, previous_meeting: v === "none" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">—</SelectItem>
                  {meetings.filter((m) => !editing || String(m.id) !== String(editing.id)).map((m) => <SelectItem key={m.id} value={String(m.id)}>{m.name} {m.date ? `(${m.date})` : ""}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button>
              <Button onClick={handleSave} disabled={submitting || !form.name}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email screen — compose: recipients + subject + message + optional .ics */}
      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Mail className="h-4 w-4" />{pt("Email meeting")}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>{pt("To")} <span className="text-xs text-muted-foreground">({pt("comma-separated emails — add anyone")})</span></Label>
              <textarea
                className="w-full min-h-[56px] px-3 py-2 border rounded-md bg-background text-sm"
                placeholder="alice@example.com, bob@example.com"
                value={emailTo} onChange={(e) => setEmailTo(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>{pt("Subject")}</Label>
              <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>{pt("Message")}</Label>
              <textarea
                className="w-full min-h-[220px] px-3 py-2 border rounded-md bg-background text-sm font-mono"
                value={emailBody} onChange={(e) => setEmailBody(e.target.value)}
              />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={emailAttachIcs} onChange={(e) => setEmailAttachIcs(e.target.checked)} />
              <CalendarIcon className="h-4 w-4 text-muted-foreground" /> {pt("Attach calendar invite (.ics)")}
            </label>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEmailOpen(false)}>{pt("Cancel")}</Button>
              <Button disabled={sending || !emailTo.trim()} onClick={sendEmail} className="gap-1">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}{pt("Send email")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Generate minutes + actions from notes / a document (AI extraction) */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-fuchsia-600" />{pt("Minutes from notes")}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{pt("Paste raw notes or upload a .docx/.txt. AI extracts the agenda, discussion, conclusions and action items (with PIC + due date) and applies them to this meeting.")}</p>
            <div>
              <input
                type="file" accept=".docx,.txt,.md,text/plain"
                onChange={(e) => onFile(e.target.files?.[0])}
                className="text-sm file:mr-3 file:rounded-md file:border file:px-3 file:py-1.5 file:text-sm file:bg-muted"
              />
            </div>
            <textarea
              className="w-full min-h-[180px] px-3 py-2 border rounded-md bg-background text-sm"
              placeholder={pt("…or paste meeting notes here")}
              value={importText} onChange={(e) => setImportText(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setImportOpen(false)}>{pt("Cancel")}</Button>
              <Button onClick={runExtract} disabled={importing || !importText.trim()} className="gap-1">
                {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}{pt("Generate minutes")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="border-t pt-4">
    <h3 className="font-semibold text-sm mb-2">{title}</h3>
    {children}
  </div>
);

const Empty = ({ pt }: { pt: (s: string) => string }) => (
  <p className="text-sm text-muted-foreground italic">{pt("Not recorded")}</p>
);

export default ExecutionMeeting;
