import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import { Loader2, Sparkles, Send, GraduationCap, Bot } from "lucide-react";

type Msg = { role: "user" | "coach"; text: string; source?: string };

const ProjectCoach = () => {
  const { id } = useParams<{ id: string }>();
  const [ctx, setCtx] = useState<{ methodology: string; shape?: string; summary: string; focus: string; suggestions: string[] } | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const token = localStorage.getItem("access_token");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  useEffect(() => {
    fetch(`/api/v1/projects/${id}/coach/`, { headers })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => d && setCtx(d))
      .catch(() => {});
  }, [id]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const ask = async (q: string) => {
    const question = q.trim();
    if (!question || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: question }]);
    setLoading(true);
    try {
      const r = await fetch(`/api/v1/projects/${id}/coach/`, {
        method: "POST", headers, body: JSON.stringify({ question }),
      });
      const d = await r.json();
      setMessages((m) => [...m, { role: "coach", text: d.answer || "—", source: d.source }]);
    } catch {
      setMessages((m) => [...m, { role: "coach", text: "De coach is even niet bereikbaar. Probeer het zo opnieuw." }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 max-w-3xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-fuchsia-500 grid place-items-center text-white">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI Project-coach</h1>
            <p className="text-sm text-muted-foreground">{ctx?.summary || "Methodiek-bewuste begeleiding tijdens je project."}</p>
          </div>
        </div>

        {ctx && (
          <Card className="bg-primary/5 border-primary/15">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">{ctx.focus}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {ctx.suggestions.map((s) => (
                  <button key={s} onClick={() => ask(s)}
                    className="text-xs border border-border rounded-full px-3 py-1.5 hover:border-primary hover:bg-primary/10 hover:text-primary transition">
                    {s}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3 min-h-[180px]">
          {messages.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-10">
              <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-40" />
              Stel een vraag of kies een suggestie hierboven.
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                {m.text}
                {m.role === "coach" && m.source === "fallback" && (
                  <Badge variant="outline" className="ml-2 text-[10px] align-middle">basis-advies</Badge>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl px-4 py-2.5"><Loader2 className="h-4 w-4 animate-spin text-primary" /></div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="flex gap-2 sticky bottom-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") ask(input); }}
            placeholder="Stel je vraag aan de coach…"
            className="flex-1 border rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:border-primary"
          />
          <Button onClick={() => ask(input)} disabled={loading || !input.trim()} className="gap-2 px-5">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCoach;
