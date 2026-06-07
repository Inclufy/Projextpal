import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Brain, Star, Trophy, Target, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { usePageTranslations } from "@/hooks/usePageTranslations";

const LEVEL_FILL = ["#e5e7eb", "#9ca3af", "#38bdf8", "#6366f1", "#d946ef", "#f59e0b"];

const AcademySkillIntelligence = () => {
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

  // flatten
  const allSkills: any[] = [];
  const progress: Record<string, any> = {};
  cats.forEach((c) => {
    (c.skills || []).forEach((s: any) => allSkills.push({ ...s, category: c.name }));
    (c.user_progress || []).forEach((u: any) => { progress[u.skill?.id ?? u.skill] = u; });
  });
  const started = allSkills.filter((s) => progress[s.id]);
  const mastered = started.filter((s) => (progress[s.id]?.level || 0) >= 5);
  const coverage = allSkills.length ? Math.round((started.length / allSkills.length) * 100) : 0;
  const totalPoints = Object.values(progress).reduce((sum: number, u: any) => sum + (u.points || 0), 0);

  // level distribution
  const dist = [1, 2, 3, 4, 5].map((lvl) => ({ name: `${pt("Lv")} ${lvl}`, value: started.filter((s) => (progress[s.id]?.level || 0) === lvl).length, lvl }));
  // top skills by points
  const top = [...started].sort((a, b) => (progress[b.id]?.points || 0) - (progress[a.id]?.points || 0)).slice(0, 6);
  // gaps: not started
  const gaps = allSkills.filter((s) => !progress[s.id]).slice(0, 8);

  const tiles = [
    { label: pt("Skills available"), value: allSkills.length, icon: Star, color: "text-indigo-600 bg-indigo-50" },
    { label: pt("Skills started"), value: started.length, icon: TrendingUp, color: "text-blue-600 bg-blue-50" },
    { label: pt("Mastered (Lv 5)"), value: mastered.length, icon: Trophy, color: "text-amber-600 bg-amber-50" },
    { label: pt("Coverage"), value: `${coverage}%`, icon: Target, color: "text-fuchsia-600 bg-fuchsia-50" },
  ];

  return (
    <div className="min-h-full bg-background w-full px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center text-white"><Brain className="h-5 w-5" /></div>
        <div>
          <h1 className="text-2xl font-bold">{pt("Skill Intelligence")}</h1>
          <p className="text-sm text-muted-foreground">{pt("Where your skills stand — coverage, level distribution, strengths and gaps.")}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tiles.map((t) => { const Icon = t.icon; return (
          <Card key={t.label} className="p-4"><div className={`h-9 w-9 rounded-lg flex items-center justify-center mb-3 ${t.color}`}><Icon className="h-5 w-5" /></div><div className="text-2xl font-bold">{t.value}</div><div className="text-xs text-muted-foreground mt-0.5">{t.label}</div></Card>
        ); })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="font-semibold mb-1">{pt("Level distribution")}</h3>
          <p className="text-xs text-muted-foreground mb-4">{pt("How many skills you hold at each level")}</p>
          {started.length === 0 ? <div className="h-56 flex items-center justify-center text-sm text-muted-foreground">{pt("No skills started yet")}</div> : (
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={dist}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis allowDecimals={false} tick={{ fontSize: 12 }} /><Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>{dist.map((d) => <Cell key={d.lvl} fill={LEVEL_FILL[d.lvl]} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          <p className="text-[11px] text-muted-foreground mt-2">{pt("Total points earned")}: <b>{totalPoints}</b></p>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold mb-3">{pt("Top skills")}</h3>
          {top.length === 0 ? <div className="text-sm text-muted-foreground">{pt("None yet")}</div> : (
            <div className="space-y-2.5">
              {top.map((s) => { const u = progress[s.id]; const pct = Math.max(0, Math.min(100, u.progress_to_next_level ?? ((u.level || 0) >= 5 ? 100 : 0)));
                return (
                  <div key={s.id} className="text-sm">
                    <div className="flex items-center justify-between"><span className="font-medium">{s.name}</span><span className="text-xs text-muted-foreground">{pt("Lv")} {u.level} · {u.points} pts</span></div>
                    <Progress value={pct} className="h-1.5 mt-1" />
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {gaps.length > 0 && (
        <Card className="p-5">
          <h3 className="font-semibold mb-1">{pt("Skill gaps")}</h3>
          <p className="text-xs text-muted-foreground mb-3">{pt("Skills you haven't started — complete the related courses to earn them.")}</p>
          <div className="flex flex-wrap gap-2">
            {gaps.map((s) => <Badge key={s.id} variant="outline" className="text-xs">{s.name}</Badge>)}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AcademySkillIntelligence;
