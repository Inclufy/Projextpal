import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Star } from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";

const LEVEL_COLORS: Record<number, string> = {
  0: "bg-gray-100 text-gray-500", 1: "bg-gray-100 text-gray-700", 2: "bg-sky-100 text-sky-700",
  3: "bg-indigo-100 text-indigo-700", 4: "bg-fuchsia-100 text-fuchsia-700", 5: "bg-amber-100 text-amber-700",
};

const AcademySkills = () => {
  const { pt } = usePageTranslations();
  const [cats, setCats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("access_token");
        const r = await fetch("/api/v1/academy/skills/categories/", { headers: { Authorization: `Bearer ${token}` } });
        if (r.ok) { const d = await r.json(); setCats(Array.isArray(d) ? d : d.results || []); }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  const progFor = (cat: any, skillId: any) => (cat.user_progress || []).find((u: any) => (u.skill?.id ?? u.skill) === skillId);

  return (
    <div className="min-h-full bg-background w-full px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center text-white"><Star className="h-5 w-5" /></div>
        <div>
          <h1 className="text-2xl font-bold">{pt("Skills")}</h1>
          <p className="text-sm text-muted-foreground">{pt("The full skill catalogue grouped by category — and your level on each.")}</p>
        </div>
      </div>

      {cats.length === 0 ? (
        <Card className="p-8 text-center"><Star className="h-12 w-12 mx-auto text-muted-foreground mb-3" /><h3 className="text-lg font-semibold">{pt("No skills defined yet")}</h3></Card>
      ) : (
        cats.map((c) => (
          <div key={c.id} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color || "#7c3aed" }} />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{c.name}</h2>
              <Badge variant="outline" className="text-[10px]">{(c.skills || []).length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {(c.skills || []).map((s: any) => {
                const up = progFor(c, s.id);
                const level = up?.level || 0;
                const pct = up ? Math.max(0, Math.min(100, up.progress_to_next_level ?? (level >= 5 ? 100 : 0))) : 0;
                return (
                  <Card key={s.id} className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium">{s.name}</div>
                      <Badge className={`text-[10px] ${LEVEL_COLORS[level]}`}>{up ? `${pt("Lv")} ${level}` : pt("Not started")}</Badge>
                    </div>
                    {s.description && <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.description}</div>}
                    {up ? (
                      <div className="mt-3 flex items-center gap-2"><Progress value={pct} className="h-1.5 flex-1" /><span className="text-xs text-muted-foreground w-9 text-right tabular-nums">{pct}%</span></div>
                    ) : (
                      <div className="mt-3 text-[11px] text-muted-foreground">{pt("Earn it by completing related lessons.")}</div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AcademySkills;
