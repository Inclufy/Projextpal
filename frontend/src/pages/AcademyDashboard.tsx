import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, GraduationCap, Users, CheckCircle2, Award, Target, TrendingUp, Trophy, BookOpen } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { usePageTranslations } from "@/hooks/usePageTranslations";

const COLORS = { done: "#16a34a", rest: "#c4b5fd" };

const AcademyDashboard = () => {
  const { pt } = usePageTranslations();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("access_token");
        const r = await fetch("/api/v1/academy/dashboard/", { headers: { Authorization: `Bearer ${token}` } });
        if (r.ok) setData(await r.json());
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  const o = data?.overview || {};
  const enrollments = o.total_enrollments || 0;
  const completed = o.completed_courses || 0;
  const inProgress = Math.max(0, enrollments - completed);
  const completionPct = enrollments ? Math.round((completed / enrollments) * 100) : 0;
  const scope = data?.meta?.scope === "company" ? pt("your organization") : pt("all learners");
  const leaderboard: any[] = data?.leaderboard || [];
  const courseRows: any[] = data?.courses || [];

  const tiles = [
    { label: pt("Enrollments"), value: enrollments, icon: GraduationCap, color: "text-indigo-600 bg-indigo-50" },
    { label: pt("Active learners"), value: o.active_learners || 0, icon: Users, color: "text-blue-600 bg-blue-50" },
    { label: pt("Completed courses"), value: completed, icon: CheckCircle2, color: "text-green-600 bg-green-50" },
    { label: pt("Certificates issued"), value: o.certificates_issued || 0, icon: Award, color: "text-amber-600 bg-amber-50" },
    { label: pt("Avg quiz score"), value: `${o.average_quiz_score || 0}%`, icon: Target, color: "text-fuchsia-600 bg-fuchsia-50" },
    { label: pt("Completion rate"), value: `${completionPct}%`, icon: TrendingUp, color: "text-purple-600 bg-purple-50" },
  ];

  const pie = [
    { name: pt("Completed"), value: completed },
    { name: pt("In progress"), value: inProgress },
  ];

  return (
    <div className="min-h-full bg-background w-full px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center text-white"><TrendingUp className="h-5 w-5" /></div>
        <div>
          <h1 className="text-2xl font-bold">{pt("Learning Dashboard")}</h1>
          <p className="text-sm text-muted-foreground">{pt("Training analytics across")} {scope} · {pt("last")} {data?.meta?.window_days || 30} {pt("days")}</p>
        </div>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <Card key={t.label} className="p-4">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center mb-3 ${t.color}`}><Icon className="h-5 w-5" /></div>
              <div className="text-2xl font-bold">{t.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{t.label}</div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion donut */}
        <Card className="p-5">
          <h3 className="font-semibold mb-1">{pt("Course completion")}</h3>
          <p className="text-xs text-muted-foreground mb-4">{pt("Completed vs in-progress enrollments")}</p>
          {enrollments === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">{pt("No enrollments yet")}</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pie} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
                  <Cell fill={COLORS.done} />
                  <Cell fill={COLORS.rest} />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Quick stats */}
        <Card className="p-5">
          <h3 className="font-semibold mb-4">{pt("At a glance")}</h3>
          <div className="space-y-3 text-sm">
            <Row label={pt("Total enrollments")} value={enrollments} />
            <Row label={pt("Completed")} value={`${completed} (${completionPct}%)`} />
            <Row label={pt("In progress")} value={inProgress} />
            <Row label={pt("Active learners (30d)")} value={o.active_learners || 0} />
            <Row label={pt("Certificates issued")} value={o.certificates_issued || 0} />
            <Row label={pt("Average quiz score")} value={`${o.average_quiz_score || 0}%`} />
          </div>
          <p className="text-[11px] text-muted-foreground mt-4">{pt("Scope")}: {scope}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leaderboard */}
        <Card className="p-5">
          <h3 className="font-semibold mb-1 flex items-center gap-2"><Trophy className="h-4 w-4 text-amber-500" />{pt("Leaderboard")}</h3>
          <p className="text-xs text-muted-foreground mb-4">{pt("Top learners by completed courses")}</p>
          {leaderboard.length === 0 ? (
            <div className="text-sm text-muted-foreground py-6 text-center">{pt("No learner activity yet")}</div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((l, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-gray-200 text-gray-700" : i === 2 ? "bg-orange-100 text-orange-700" : "bg-muted text-muted-foreground"}`}>{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{l.name}</div>
                    <div className="text-[11px] text-muted-foreground">{l.completed}/{l.total} {pt("completed")}</div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 text-[10px]">{l.completion_pct}%</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Per-course progress */}
        <Card className="p-5">
          <h3 className="font-semibold mb-1 flex items-center gap-2"><BookOpen className="h-4 w-4 text-indigo-500" />{pt("Course progress")}</h3>
          <p className="text-xs text-muted-foreground mb-4">{pt("Completion per course (assigned / done / in progress)")}</p>
          {courseRows.length === 0 ? (
            <div className="text-sm text-muted-foreground py-6 text-center">{pt("No enrollments yet")}</div>
          ) : (
            <div className="space-y-3">
              {courseRows.map((c, i) => {
                const a = c.assigned || 1;
                const dPct = Math.round((c.completed / a) * 100);
                const pPct = Math.round((c.in_progress / a) * 100);
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium truncate pr-2">{c.title}</span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{c.completed}/{c.assigned} · {c.completion_pct}%</span>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-muted overflow-hidden flex">
                      <div className="h-full bg-green-500" style={{ width: `${dPct}%` }} title={`${pt("Completed")} ${c.completed}`} />
                      <div className="h-full bg-blue-400" style={{ width: `${pPct}%` }} title={`${pt("In progress")} ${c.in_progress}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: any }) => (
  <div className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-semibold">{value}</span>
  </div>
);

export default AcademyDashboard;
