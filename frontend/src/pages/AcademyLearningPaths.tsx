import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rocket, Target, Award, TrendingUp, Crown, BookOpen, Clock, ArrowRight, Route } from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { useLanguage } from "@/contexts/LanguageContext";

const PATHS = [
  { id: "pm-starter", title: "PM Starter", titleNL: "PM Starter", desc: "Start your PM journey with fundamentals", descNL: "Start je PM-reis met de basis", icon: Rocket, grad: "from-blue-500 to-cyan-500", courses: 2, hours: 24 },
  { id: "agile-expert", title: "Agile Expert", titleNL: "Agile Expert", desc: "Master Agile methodologies", descNL: "Beheers Agile-methodologieën", icon: Target, grad: "from-green-500 to-emerald-500", courses: 3, hours: 30 },
  { id: "traditional-pm", title: "Traditional PM", titleNL: "Traditioneel PM", desc: "Master structured methodologies", descNL: "Beheers gestructureerde methodologieën", icon: Award, grad: "from-amber-500 to-orange-500", courses: 3, hours: 40 },
  { id: "process-excellence", title: "Process Excellence", titleNL: "Process Excellence", desc: "Optimize with Lean Six Sigma", descNL: "Optimaliseer met Lean Six Sigma", icon: TrendingUp, grad: "from-cyan-500 to-blue-500", courses: 2, hours: 32 },
  { id: "complete-pm", title: "Complete PM", titleNL: "Complete PM", desc: "Full PM certification path", descNL: "Volledig PM-certificeringstraject", icon: Crown, grad: "from-purple-600 to-fuchsia-600", courses: 4, hours: 80 },
];

const AcademyLearningPaths = () => {
  const { pt } = usePageTranslations();
  const { language } = useLanguage();
  const isNL = language === "nl";
  const navigate = useNavigate();

  return (
    <div className="min-h-full bg-background w-full px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center text-white"><Route className="h-5 w-5" /></div>
        <div>
          <h1 className="text-2xl font-bold">{pt("Learning Paths")}</h1>
          <p className="text-sm text-muted-foreground">{pt("Structured tracks that lead to a certificate — complete the courses in order.")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {PATHS.map((p) => {
          const Icon = p.icon;
          return (
            <Card key={p.id} className="overflow-hidden flex flex-col">
              <div className={`bg-gradient-to-br ${p.grad} p-5 text-white`}>
                <Icon className="h-7 w-7 mb-3 opacity-90" />
                <div className="text-lg font-bold">{isNL ? p.titleNL : p.title}</div>
                <div className="text-sm text-white/85 mt-0.5">{isNL ? p.descNL : p.desc}</div>
              </div>
              <div className="p-4 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><BookOpen className="h-4 w-4" />{p.courses} {pt("courses")}</span>
                <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" />{p.hours} {pt("hours")}</span>
              </div>
              <div className="px-4 pb-4 mt-auto">
                <Button variant="outline" className="w-full gap-2" onClick={() => navigate("/academy")}>
                  {pt("View courses")}<ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AcademyLearningPaths;
