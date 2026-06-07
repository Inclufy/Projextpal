import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Star, Award, Trophy, Zap, ShieldCheck, BookOpen, Download, Link2, Check, GraduationCap } from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

const LEVEL_COLORS: Record<number, string> = {
  1: "bg-gray-100 text-gray-700",
  2: "bg-sky-100 text-sky-700",
  3: "bg-indigo-100 text-indigo-700",
  4: "bg-fuchsia-100 text-fuchsia-700",
  5: "bg-amber-100 text-amber-700",
};

// level_name arrives from the API as { en, nl } — pick the active language,
// guarding against it ever being a plain string. Avoids "[object Object]".
const levelLabel = (ln: any, lang: string): string => {
  if (!ln) return "";
  if (typeof ln === "string") return ln;
  return ln[lang] || ln.en || ln.nl || "";
};

const SkillPassport = () => {
  const { pt } = usePageTranslations();
  const { language } = useLanguage();
  const { user } = useAuth();
  const [skills, setSkills] = useState<any[]>([]);
  const [certs, setCerts] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("access_token");
      const h = { Authorization: `Bearer ${token}` };
      try {
        const [s, c, e] = await Promise.all([
          fetch("/api/v1/academy/skills/user-skills/", { headers: h }),
          fetch("/api/v1/academy/certificates/", { headers: h }),
          fetch("/api/v1/academy/enrollments/", { headers: h }),
        ]);
        if (s.ok) { const d = await s.json(); setSkills(Array.isArray(d) ? d : d.results || []); }
        if (c.ok) { const d = await c.json(); setCerts(Array.isArray(d) ? d : d.results || []); }
        if (e.ok) { const d = await e.json(); setCourses((Array.isArray(d) ? d : d.results || []).filter((x: any) => x.status === "completed")); }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email?.split("@")[0] || pt("Learner");
  const initials = ((user?.firstName?.[0] || "") + (user?.lastName?.[0] || "")).toUpperCase() || (user?.email?.[0] || "U").toUpperCase();

  const totalPoints = skills.reduce((s, x) => s + (x.points || 0), 0);
  const maxed = skills.filter((x) => (x.level || 0) >= 5).length;

  // group by category
  const groups: Record<string, any[]> = {};
  skills.forEach((x) => {
    const cat = x.skill?.category_name || pt("General");
    (groups[cat] = groups[cat] || []).push(x);
  });
  const cats = Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));

  const tiles = [
    { label: pt("Skills"), value: skills.length, icon: Star },
    { label: pt("Total points"), value: totalPoints, icon: Zap },
    { label: pt("Mastered (Lv 5)"), value: maxed, icon: Trophy },
    { label: pt("Courses completed"), value: courses.length, icon: BookOpen },
    { label: pt("Certificates"), value: certs.length, icon: Award },
  ];

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { /* noop */ }
  };

  return (
    <div className="min-h-full bg-background w-full px-6 lg:px-8 py-6 space-y-6">
      {/* Personal credential hero */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 text-white p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-2xl font-bold shrink-0">{initials}</div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-white/75">
              <GraduationCap className="h-3.5 w-3.5" /> {pt("Skill Passport")}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold truncate">{fullName}</h1>
            <p className="text-sm text-white/80 truncate">
              {user?.companyName ? `${user.companyName} · ` : ""}{pt("ProjeXtPal Academy")}
            </p>
          </div>
        </div>

        {/* KPI chips */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
          {tiles.map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.label} className="rounded-xl bg-white/10 backdrop-blur px-3 py-3">
                <div className="flex items-center gap-1.5 text-white/70 text-[11px]"><Icon className="h-3.5 w-3.5" /> {t.label}</div>
                <div className="text-2xl font-bold mt-0.5">{t.value}</div>
              </div>
            );
          })}
        </div>

        {/* Share & export */}
        <div className="mt-5 flex flex-wrap items-center gap-2 print:hidden">
          <span className="text-xs text-white/70 mr-1">{pt("Share & export")}</span>
          <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition px-3 py-1.5 text-xs font-medium">
            <Download className="h-3.5 w-3.5" /> PDF
          </button>
          <button onClick={copyLink} className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition px-3 py-1.5 text-xs font-medium">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />} {copied ? pt("Copied") : pt("Copy link")}
          </button>
        </div>
      </div>

      {skills.length === 0 ? (
        <Card className="p-8 text-center">
          <ShieldCheck className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold mb-1">{pt("No skills yet")}</h3>
          <p className="text-sm text-muted-foreground">{pt("Complete course lessons, quizzes and exams to earn skill points and level up.")}</p>
        </Card>
      ) : (
        cats.map(([cat, items]) => (
          <div key={cat} className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{cat} · {items.length}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {items.map((x) => {
                const level = x.level || 0;
                const pct = Math.max(0, Math.min(100, x.progress_to_next_level ?? (level >= 5 ? 100 : 0)));
                const ll = levelLabel(x.level_name, language);
                return (
                  <Card key={x.id} className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium">{x.skill?.name || `Skill #${x.skill?.id ?? x.id}`}</div>
                      <Badge className={`text-[10px] ${LEVEL_COLORS[level] || LEVEL_COLORS[1]}`}>{pt("Lv")} {level}{ll ? ` · ${ll}` : ""}</Badge>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Progress value={pct} className="h-1.5 flex-1" />
                      <span className="text-xs text-muted-foreground tabular-nums w-9 text-right">{pct}%</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{x.points || 0} {pt("points")}</span>
                      {level < 5 && x.points_to_next_level != null && <span>{x.points_to_next_level} {pt("to next level")}</span>}
                      {level >= 5 && <span className="text-amber-600 font-medium">{pt("Mastered")}</span>}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* Completed courses (evidence) */}
      {courses.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{pt("Completed courses")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {courses.map((c) => (
              <Card key={c.id} className="p-4 flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0"><BookOpen className="h-5 w-5" /></div>
                <div className="min-w-0">
                  <div className="font-medium truncate">{c.course_title || c.course_name || c.title || pt("Course")}</div>
                  <div className="text-xs text-muted-foreground">{pt("Completed")}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Certificates */}
      {certs.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{pt("Certificates")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {certs.map((c) => (
              <Card key={c.id} className="p-4 flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0"><Award className="h-5 w-5" /></div>
                <div className="min-w-0">
                  <div className="font-medium truncate">{c.course_title || c.title || c.course_name || pt("Certificate")}</div>
                  <div className="text-xs text-muted-foreground">
                    {(c.issued_at || c.created_at || "").toString().split("T")[0]}
                    {c.certificate_id ? ` · ${c.certificate_id}` : ""}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillPassport;
