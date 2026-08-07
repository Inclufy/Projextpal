import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, Send, AtSign, Trash2, MessageSquare } from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { toast } from "sonner";

interface CommentT {
  id: number; body: string; author_name?: string; author_email?: string;
  author?: number; created_at: string;
}
interface Member { id: number; first_name?: string; last_name?: string; email: string }

/** Reusable discussion thread. Pass taskId for a task thread, omit it for the
 *  project discussion board. */
export default function CommentThread({ projectId, taskId, targetType, targetId, currentUserId }: {
  projectId: string | number; taskId?: string | number;
  targetType?: string; targetId?: string | number; currentUserId?: number;
}) {
  const { pt } = usePageTranslations();
  const [items, setItems] = useState<CommentT[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [body, setBody] = useState("");
  const [mentions, setMentions] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("access_token")}` });
  const jsonHeaders = () => ({ ...headers(), "Content-Type": "application/json" });
  const memberName = (m: Member) => [m.first_name, m.last_name].filter(Boolean).join(" ") || m.email;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = taskId ? `task=${taskId}`
        : targetType ? `target_type=${targetType}&target_id=${targetId}`
        : `project=${projectId}&scope=project`;
      const r = await fetch(`/api/v1/comments/?${q}`, { headers: headers() });
      if (r.ok) { const d = await r.json(); setItems(Array.isArray(d) ? d : d.results || []); }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [projectId, taskId, targetType, targetId]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/v1/auth/company-users/members/`, { headers: headers() });
        if (r.ok) { const d = await r.json(); setMembers((Array.isArray(d) ? d : d.results || d.members || [])); }
      } catch { /* ignore */ }
    })();
  }, []);

  const addMention = (m: Member) => {
    setBody((b) => `${b}${b && !b.endsWith(" ") ? " " : ""}@${memberName(m)} `);
    setMentions((ids) => (ids.includes(m.id) ? ids : [...ids, m.id]));
    taRef.current?.focus();
  };

  const send = async () => {
    if (!body.trim()) return;
    setSending(true);
    try {
      const payload: any = { project: Number(projectId), body: body.trim(), mention_user_ids: mentions };
      if (taskId) payload.task = Number(taskId);
      else if (targetType) { payload.target_type = targetType; payload.target_id = Number(targetId); }
      const r = await fetch(`/api/v1/comments/`, { method: "POST", headers: jsonHeaders(), body: JSON.stringify(payload) });
      if (r.ok) { setBody(""); setMentions([]); load(); }
      else { toast.error(pt("Could not post comment")); }
    } catch { toast.error(pt("Could not post comment")); }
    finally { setSending(false); }
  };

  const remove = async (id: number) => {
    try {
      const r = await fetch(`/api/v1/comments/${id}/`, { method: "DELETE", headers: headers() });
      if (r.ok || r.status === 204) setItems((p) => p.filter((c) => c.id !== id));
    } catch { /* ignore */ }
  };

  const initials = (n?: string) => (n || "?").trim().charAt(0).toUpperCase();
  const rel = (iso: string) => {
    const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
    if (s < 60) return pt("just now");
    if (s < 3600) return `${Math.floor(s / 60)} ${pt("min ago")}`;
    if (s < 86400) return `${Math.floor(s / 3600)} ${pt("h ago")}`;
    return new Date(iso).toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <div className="text-sm text-muted-foreground flex items-center gap-2 py-4">
          <MessageSquare className="h-4 w-4" /> {pt("No comments yet — start the conversation.")}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((c) => (
            <div key={c.id} className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-semibold shrink-0">{initials(c.author_name || c.author_email)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{c.author_name || c.author_email || pt("User")}</span>
                  <span className="text-[11px] text-muted-foreground">{rel(c.created_at)}</span>
                  {!!currentUserId && c.author === currentUserId && (
                    <button onClick={() => remove(c.id)} className="ml-auto text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                  )}
                </div>
                <div className="text-sm whitespace-pre-wrap mt-0.5">{c.body}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Composer */}
      <div className="border-t pt-3 space-y-2">
        <Textarea
          ref={taRef} value={body} onChange={(e) => setBody(e.target.value)}
          placeholder={pt("Write a comment… use @ to mention a teammate")}
          className="min-h-[70px] resize-y"
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send(); }}
        />
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5"><AtSign className="h-3.5 w-3.5" />{pt("Mention")}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-64 overflow-y-auto">
              {members.length === 0 ? (
                <DropdownMenuItem disabled>{pt("No team members")}</DropdownMenuItem>
              ) : members.map((m) => (
                <DropdownMenuItem key={m.id} onClick={() => addMention(m)}>{memberName(m)}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {mentions.length > 0 && <span className="text-[11px] text-muted-foreground">{mentions.length} {pt("mentioned")}</span>}
          <Button size="sm" className="gap-1.5 ml-auto" disabled={sending || !body.trim()} onClick={send}>
            {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}{pt("Post")}
          </Button>
        </div>
      </div>
    </div>
  );
}
