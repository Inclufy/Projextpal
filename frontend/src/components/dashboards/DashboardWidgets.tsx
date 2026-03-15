import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import {
  Award,
  Crown,
  Zap,
  Target,
  Waves,
  GitMerge,
  Layers,
  BarChart3,
  Sparkles,
  GraduationCap,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Columns,
} from "lucide-react";

// ============================================
// METHODOLOGY BREAKDOWN WIDGET
// ============================================

const methodologyConfig: Record<string, { icon: any; label: string; color: string; bgColor: string; borderColor: string }> = {
  'prince2': { icon: Crown, label: 'PRINCE2', color: 'text-indigo-600', bgColor: 'bg-indigo-50 dark:bg-indigo-900/20', borderColor: 'ring-indigo-200 dark:ring-indigo-800' },
  'agile': { icon: Zap, label: 'Agile', color: 'text-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-900/20', borderColor: 'ring-orange-200 dark:ring-orange-800' },
  'scrum': { icon: Target, label: 'Scrum', color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20', borderColor: 'ring-blue-200 dark:ring-blue-800' },
  'kanban': { icon: Columns, label: 'Kanban', color: 'text-cyan-600', bgColor: 'bg-cyan-50 dark:bg-cyan-900/20', borderColor: 'ring-cyan-200 dark:ring-cyan-800' },
  'waterfall': { icon: Waves, label: 'Waterfall', color: 'text-teal-600', bgColor: 'bg-teal-50 dark:bg-teal-900/20', borderColor: 'ring-teal-200 dark:ring-teal-800' },
  'hybrid': { icon: GitMerge, label: 'Hybrid', color: 'text-pink-600', bgColor: 'bg-pink-50 dark:bg-pink-900/20', borderColor: 'ring-pink-200 dark:ring-pink-800' },
  'msp': { icon: Layers, label: 'MSP', color: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-900/20', borderColor: 'ring-purple-200 dark:ring-purple-800' },
  'safe': { icon: Sparkles, label: 'SAFe', color: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-900/20', borderColor: 'ring-amber-200 dark:ring-amber-800' },
  'pmi': { icon: BarChart3, label: 'PMI', color: 'text-emerald-600', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20', borderColor: 'ring-emerald-200 dark:ring-emerald-800' },
  'lean_six_sigma_green': { icon: Target, label: 'LSS Green Belt', color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-900/20', borderColor: 'ring-green-200 dark:ring-green-800' },
  'lean_six_sigma_black': { icon: Target, label: 'LSS Black Belt', color: 'text-gray-800 dark:text-gray-200', bgColor: 'bg-gray-100 dark:bg-gray-800/50', borderColor: 'ring-gray-300 dark:ring-gray-700' },
};

interface MethodologyBreakdownProps {
  projects: any[];
}

export const MethodologyBreakdown: React.FC<MethodologyBreakdownProps> = ({ projects }) => {
  const navigate = useNavigate();
  const { pt } = usePageTranslations();

  const methodologyCounts = projects.reduce((acc: Record<string, { count: number; active: number; completed: number }>, p: any) => {
    const m = (p.methodology || 'hybrid').toLowerCase();
    if (!acc[m]) acc[m] = { count: 0, active: 0, completed: 0 };
    acc[m].count++;
    if (p.status === 'in_progress' || p.status === 'active') acc[m].active++;
    if (p.status === 'completed') acc[m].completed++;
    return acc;
  }, {});

  const sortedMethodologies = Object.entries(methodologyCounts)
    .sort((a, b) => b[1].count - a[1].count);

  if (sortedMethodologies.length === 0) return null;

  return (
    <Card className="border-0 ring-1 ring-purple-100 dark:ring-purple-900/50 bg-white dark:bg-gray-900 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md">
            <Layers className="h-4 w-4 text-white" />
          </div>
          {pt("Methodologies Used")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedMethodologies.map(([key, data]) => {
          const config = methodologyConfig[key] || methodologyConfig['hybrid'];
          const Icon = config.icon;
          const percentage = projects.length > 0 ? Math.round((data.count / projects.length) * 100) : 0;

          return (
            <div
              key={key}
              className={`group relative flex items-center gap-4 p-3.5 rounded-xl ${config.bgColor} ring-1 ${config.borderColor} hover:shadow-md transition-all duration-200 cursor-pointer`}
              onClick={() => navigate(`/projects?methodology=${key}`)}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-200/50 dark:ring-gray-700/50">
                <Icon className={`h-5 w-5 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`font-bold text-sm ${config.color}`}>{config.label}</span>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {data.count} {data.count === 1 ? 'project' : 'projects'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={percentage} className="h-1.5 flex-1" />
                  <span className="text-xs font-mono font-bold text-gray-400">{percentage}%</span>
                </div>
                <div className="flex items-center gap-3 mt-1.5">
                  {data.active > 0 && (
                    <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                      {data.active} active
                    </span>
                  )}
                  {data.completed > 0 && (
                    <span className="text-[10px] font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                      {data.completed} completed
                    </span>
                  )}
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 dark:text-gray-600 dark:group-hover:text-gray-400 transition-colors" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

// ============================================
// CERTIFICATIONS WIDGET
// ============================================

const fetchCertificates = async () => {
  const token = localStorage.getItem("access_token");
  try {
    const response = await fetch("/api/v1/academy/certificates/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return [];
    return response.json();
  } catch {
    return [];
  }
};

export const CertificationsWidget: React.FC = () => {
  const navigate = useNavigate();
  const { pt } = usePageTranslations();
  const { language } = useLanguage();
  const isNL = language === 'nl';

  const { data: certificates = [] } = useQuery({
    queryKey: ["my-certificates"],
    queryFn: fetchCertificates,
    staleTime: 5 * 60 * 1000,
  });

  const certs = Array.isArray(certificates) ? certificates : (certificates as any)?.results || [];

  return (
    <Card className="border-0 ring-1 ring-purple-100 dark:ring-purple-900/50 bg-white dark:bg-gray-900 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-md">
              <Award className="h-4 w-4 text-white" />
            </div>
            {isNL ? "Behaalde Certificaten" : "Achieved Certifications"}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-purple-600 hover:text-purple-700"
            onClick={() => navigate('/academy')}
          >
            {isNL ? "Bekijk Academy" : "View Academy"}
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {certs.length > 0 ? (
          <div className="space-y-3">
            {certs.slice(0, 4).map((cert: any, idx: number) => (
              <div
                key={cert.id || idx}
                className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-50/80 to-orange-50/80 dark:from-amber-900/10 dark:to-orange-900/10 ring-1 ring-amber-200/50 dark:ring-amber-800/30 hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => navigate(`/academy/course/${cert.course_id || cert.course}/learn?tab=certificate`)}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-md">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                    {cert.course_title || cert.course_name || 'Certificate'}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                      {cert.certificate_number || `#${cert.id}`}
                    </span>
                    {cert.issued_at && (
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">
                        {new Date(cert.issued_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold shadow-sm">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {isNL ? "Behaald" : "Achieved"}
                </Badge>
              </div>
            ))}
            {certs.length > 4 && (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                onClick={() => navigate('/academy')}
              >
                {isNL ? `+${certs.length - 4} meer certificaten bekijken` : `+${certs.length - 4} more certificates`}
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 mb-3">
              <GraduationCap className="h-7 w-7 text-amber-500" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              {isNL ? "Nog geen certificaten behaald" : "No certifications yet"}
            </p>
            <Button
              size="sm"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-lg shadow-md"
              onClick={() => navigate('/academy')}
            >
              <BookOpen className="h-3.5 w-3.5 mr-1.5" />
              {isNL ? "Start een cursus" : "Start a Course"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================
// RECOMMENDED COURSES WIDGET
// ============================================

interface RecommendedCoursesProps {
  projects: any[];
}

export const RecommendedCourses: React.FC<RecommendedCoursesProps> = ({ projects }) => {
  const navigate = useNavigate();
  const { pt } = usePageTranslations();
  const { language } = useLanguage();
  const isNL = language === 'nl';

  // Determine the user's most-used methodologies from their projects
  const methodologyCounts = projects.reduce((acc: Record<string, number>, p: any) => {
    const m = (p.methodology || '').toLowerCase();
    if (m) acc[m] = (acc[m] || 0) + 1;
    return acc;
  }, {});

  const topMethodologies = Object.entries(methodologyCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([m]) => m);

  // Map methodologies to recommended course categories
  const courseRecommendations: { methodology: string; title: string; subtitle: string; icon: any; color: string; gradient: string }[] = [];

  const addRecommendation = (methodology: string) => {
    const config = methodologyConfig[methodology] || methodologyConfig['hybrid'];
    const Icon = config.icon;

    const courseMap: Record<string, { title: string; subtitle: string }> = {
      'prince2': { title: 'PRINCE2 Foundation & Practitioner', subtitle: isNL ? 'Gestructureerd projectmanagement' : 'Structured project management' },
      'scrum': { title: 'Professional Scrum Master', subtitle: isNL ? 'Agile team management' : 'Agile team management' },
      'kanban': { title: 'Kanban System Design', subtitle: isNL ? 'Flow-gebaseerd werken' : 'Flow-based work management' },
      'agile': { title: 'Agile Project Management', subtitle: isNL ? 'Iteratief projectbeheer' : 'Iterative project delivery' },
      'waterfall': { title: 'Waterfall Planning Mastery', subtitle: isNL ? 'Planmatig projectbeheer' : 'Sequential project planning' },
      'lean_six_sigma_green': { title: 'Lean Six Sigma Green Belt', subtitle: isNL ? 'Procesverbetering' : 'Process improvement' },
      'lean_six_sigma_black': { title: 'Lean Six Sigma Black Belt', subtitle: isNL ? 'Geavanceerde procesverbetering' : 'Advanced process improvement' },
      'safe': { title: 'SAFe Agilist', subtitle: isNL ? 'Enterprise agility' : 'Enterprise agility' },
      'msp': { title: 'MSP Programme Management', subtitle: isNL ? 'Programmabeheer' : 'Programme management' },
      'pmi': { title: 'PMP Certification Prep', subtitle: isNL ? 'PMI standaarden' : 'PMI standards' },
      'hybrid': { title: 'Hybrid Project Management', subtitle: isNL ? 'Beste van beide werelden' : 'Best of both worlds' },
    };

    const info = courseMap[methodology] || courseMap['hybrid'];
    courseRecommendations.push({
      methodology,
      title: info.title,
      subtitle: info.subtitle,
      icon: Icon,
      color: config.color,
      gradient: config.bgColor,
    });
  };

  // Add recommendations based on user's projects
  topMethodologies.forEach(addRecommendation);

  // Fill up to 3 with general recommendations
  if (courseRecommendations.length < 3) {
    ['agile', 'prince2', 'scrum'].forEach(m => {
      if (courseRecommendations.length < 3 && !topMethodologies.includes(m)) {
        addRecommendation(m);
      }
    });
  }

  return (
    <Card className="border-0 ring-1 ring-purple-100 dark:ring-purple-900/50 bg-white dark:bg-gray-900 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600 shadow-md">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            {isNL ? "Aanbevolen Cursussen" : "Recommended Courses"}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-purple-600 hover:text-purple-700"
            onClick={() => navigate('/academy')}
          >
            {isNL ? "Alle cursussen" : "All Courses"}
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {isNL ? "Gebaseerd op je projectmethodologieën" : "Based on your project methodologies"}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {courseRecommendations.map((course, idx) => {
          const Icon = course.icon;
          return (
            <div
              key={idx}
              className={`group flex items-center gap-3 p-3.5 rounded-xl ${course.gradient} ring-1 ring-purple-100/50 dark:ring-purple-800/30 hover:shadow-md transition-all duration-200 cursor-pointer`}
              onClick={() => navigate(`/academy?methodology=${course.methodology}`)}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                <Icon className={`h-5 w-5 ${course.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                  {course.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {course.subtitle}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-purple-500 dark:text-gray-600 dark:group-hover:text-purple-400 transition-colors" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
