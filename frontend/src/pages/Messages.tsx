import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, Send, Plus, MessageSquare, MessagesSquare } from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Convo { peer_id: number; peer_name: string; last_message: string; last_at: string; unread: number }
interface DM { id: number; sender: number; recipient: number; body: string; created_at: string; sender_name?: string }
interface Member { id: number; first_name?: string; last_name?: string; email: string }

export default function Messages() {
  const { pt } = usePageTranslations();
  const { user } = useAuth();
  const myId = (user as any)?.id;
  const [convos, setConvos] = useState<Convo[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [active, setActive] = useState<{ id: number; name: string } | null>(null);
  const [thread, setThread] = useState<DM[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("access_token")}` });
  const jsonHeaders = () => ({ ...headers(), "Content-Type": "application/json" });
  const memberName = (m: Member) => [m.first_name, m.last_name].filter(Boolean).join(" ") || m.email;

  const loadConvos = useCallback(async () => {
    try {
      const r = await fetch(`/api/v1/messages/`, { headers: headers() });
      if (r.ok) { const d = await r.json(); setConvos(d.conversations || []); }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  const loadThread = useCallback(async (peerId: number) => {
    try {
      const r = await fetch(`/api/v1/messages/?with=${peerId}`, { headers: headers() });
      if (r.ok) { const d = await r.json(); setThread(d.results || []); }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadConvos(); }, [loadConvos]);
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/v1/auth/company-users/members/`, { headers: headers() });
        if (r.ok) { const d = await r.json(); setMembers((Array.isArray(d) ? d : d.results || d.members || []).filter((m: Member) => m.id !== myId)); }
      } catch { /* ignore */ }
    })();
  }, [myId]);

  useEffect(() => { if (active) loadThread(active.id); }, [active, loadThread]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [thread]);

  const openConvo = (id: number, name: string) => setActive({ id, name });

  const send = async () => {
    if (!body.trim() || !active) return;
    setSending(true);
    try {
      const r = await fetch(`/api/v1/messages/`, {
        method: "POST", headers: jsonHeaders(),
        body: JSON.stringify({ recipient: active.id, body: body.trim() }),
      });
      if (r.ok) { setBody(""); await loadThread(active.id); loadConvos(); }
      else { toast.error(pt("Could not send")); }
    } catch { toast.error(pt("Could not send")); }
    finally { setSending(false); }
  };

  const initials = (n?: string) => (n || "?").trim().charAt(0).toUpperCase();
  const rel = (iso: string) => new Date(iso).toLocaleString();

  return (
    <div className="min-h-full bg-background p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center text-white"><MessagesSquare className="h-5 w-5" /></div>
        <div>
          <h1 className="text-2xl font-bold">{pt("Messages")}</h1>
          <p className="text-sm text-muted-foreground">{pt("Direct messages with people in your organisation.")}</p>
        </div>
        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" />{pt("New message")}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-72 overflow-y-auto">
              {members.length === 0 ? <DropdownMenuItem disabled>{pt("No people")}</DropdownMenuItem>
                : members.map((m) => <DropdownMenuItem key={m.id} onClick={() => openConvo(m.id, memberName(m))}>{memberName(m)}</DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-220px)]">
        {/* Conversation list */}
        <div className="border rounded-xl overflow-y-auto bg-card">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div>
          ) : convos.length === 0 ? (
            <div className="text-sm text-muted-foreground p-4 text-center">{pt("No conversations yet — start one with “New message”.")}</div>
          ) : convos.map((c) => (
            <button key={c.peer_id} onClick={() => openConvo(c.peer_id, c.peer_name)}
              className={`w-full text-left px-3 py-3 border-b last:border-0 hover:bg-muted/60 flex gap-3 ${active?.id === c.peer_id ? "bg-purple-50/60" : ""}`}>
              <div className="h-9 w-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-semibold shrink-0">{initials(c.peer_name)}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between"><span className="text-sm font-medium truncate">{c.peer_name}</span>{c.unread > 0 && <span className="ml-2 h-5 min-w-[20px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{c.unread}</span>}</div>
                <div className="text-xs text-muted-foreground truncate">{c.last_message}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Thread */}
        <div className="md:col-span-2 border rounded-xl flex flex-col bg-card">
          {!active ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <MessageSquare className="h-10 w-10 opacity-30" />
              <span className="text-sm">{pt("Select a conversation or start a new one.")}</span>
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b font-semibold text-sm">{active.name}</div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {thread.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-6">{pt("No messages yet — say hi.")}</div>
                ) : thread.map((m) => {
                  const mine = m.sender === myId;
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${mine ? "bg-purple-600 text-white" : "bg-muted"}`}>
                        <div className="whitespace-pre-wrap">{m.body}</div>
                        <div className={`text-[10px] mt-1 ${mine ? "text-white/70" : "text-muted-foreground"}`}>{rel(m.created_at)}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>
              <div className="p-3 border-t flex items-center gap-2">
                <Input value={body} onChange={(e) => setBody(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder={pt("Type a message…")} className="flex-1" />
                <Button size="icon" disabled={sending || !body.trim()} onClick={send}>
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
