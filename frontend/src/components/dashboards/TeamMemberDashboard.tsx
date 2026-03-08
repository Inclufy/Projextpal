import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePageTranslations } from '@/hooks/usePageTranslations';
import { useQuery } from "@tanstack/react-query";
import { AISummaryModal } from "@/components/AISummaryModal";
import AICommander from "@/components/AICommander";
import { formatBudget, getCurrencyFromLanguage } from "@/lib/currencies";
import { MethodologyBreakdown, CertificationsWidget, RecommendedCourses } from "./DashboardWidgets";
import HomeAIVoiceCards from "./HomeAIVoiceCards";
import {
  FolderKanban,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Target,
  Activity,
  Users,
  Calendar,
  CheckCircle2,
  ListTodo
} from "lucide-react";

const fetchProjects = async () => {
  const token = localStorage.getItem("access_token");
  const response = await fetch("/api/v1/projects/", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch projects");
  return response.json();
};

const callAI = async (prompt: string): Promise<string> => {
  const token = localStorage.getItem("access_token");
  try {
    const createChatResponse = await fetch("/api/v1/bot/chats/", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: "Dashboard AI Summary" }),
    });
    if (!createChatResponse.ok) throw new Error("Failed to create chat");
    const chatData = await createChatResponse.json();
    const messageResponse = await fetch(`/api/v1/bot/chats/${chatData.id}/send_message/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ message: prompt }),
    });
    if (!messageResponse.ok) throw new Error("AI service unavailable");
    const data = await messageResponse.json();
    return data.ai_response?.content || "";
  } catch (error) {
    throw error;
  }
};

interface DonutChartProps {
  total: number;
  segments: { label: string; value: number; color: string }[];
  centerLabel: string;
}

const DonutChart = ({ total, segments, centerLabel }: DonutChartProps) => {
  const radius = 80;
  const strokeWidth = 20;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  
  let currentOffset = 0;
  
  return (
    <div className="inline-flex flex-col items-center justify-center">
      <div className="relative">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="text-purple-100 dark:text-purple-900/30"
          />
          {segments.map((segment, index) => {
            const percentage = total > 0 ? (segment.value / total) * 100 : 0;
            const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -currentOffset;
            currentOffset += (percentage / 100) * circumference;

            return (
              <circle
                key={index}
                stroke={segment.color}
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                className="transition-all duration-700 ease-out drop-shadow-sm"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent">{total}</span>
        </div>
      </div>
      <span className="text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-widest mt-2">{centerLabel}</span>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const statusStyles: Record<string, string> = {
    'planning': 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 ring-1 ring-inset ring-purple-600/20',
    'in_progress': 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 ring-1 ring-inset ring-blue-600/20',
    'active': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 ring-1 ring-inset ring-emerald-600/20',
    'completed': 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 ring-1 ring-inset ring-green-600/20',
    'on_hold': 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 ring-1 ring-inset ring-amber-600/20',
    'pending': 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300 ring-1 ring-inset ring-orange-600/20',
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${statusStyles[status?.toLowerCase()] || statusStyles['planning']}`}>
      {status || 'planning'}
    </span>
  );
};

const HealthIndicator = ({ health }: { health?: string }) => {
  const healthColors: Record<string, string> = {
    'healthy': 'bg-emerald-500 ring-emerald-100 dark:ring-emerald-900/30',
    'good': 'bg-emerald-500 ring-emerald-100 dark:ring-emerald-900/30',
    'at_risk': 'bg-amber-500 ring-amber-100 dark:ring-amber-900/30',
    'critical': 'bg-red-500 ring-red-100 dark:ring-red-900/30',
  };
  
  return (
    <div className={`h-2.5 w-2.5 rounded-full ring-4 ${healthColors[health?.toLowerCase() || 'healthy'] || 'bg-emerald-500 ring-emerald-100 dark:ring-emerald-900/30'}`} />
  );
};

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon,
  trend,
  trendValue,
  color = 'purple' 
}: any) => {
  const colorClasses: Record<string, string> = {
    purple: 'from-purple-600 to-pink-600',
    blue: 'from-blue-600 to-cyan-600',
    emerald: 'from-emerald-600 to-teal-600',
    red: 'from-red-600 to-rose-600',
    amber: 'from-amber-600 to-orange-600',
  };

  return (
    <Card className="relative overflow-hidden border-0 ring-1 ring-purple-100 dark:ring-purple-900/50 bg-white dark:bg-gray-900 shadow-sm hover:shadow-xl hover:ring-purple-200 dark:hover:ring-purple-800/50 transition-all duration-300 group">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-transparent to-pink-50/50 dark:from-purple-900/10 dark:via-transparent dark:to-pink-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardContent className="p-7 relative z-10">
        <div className="flex items-start justify-between mb-5">
          <div className={`p-3 rounded-2xl bg-gradient-to-br ${colorClasses[color]} shadow-lg`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              trend === 'up' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 ring-1 ring-inset ring-emerald-600/20' : 
              'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 ring-1 ring-inset ring-red-600/20'
            }`}>
              <TrendingUp className={`h-3.5 w-3.5 ${trend === 'down' ? 'rotate-180' : ''}`} />
              {trendValue}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-widest">
            {title}
          </p>
          <h3 className={`text-4xl font-bold bg-gradient-to-br ${colorClasses[color]} bg-clip-text text-transparent leading-none`}>
            {value}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
};

const TeamMemberDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { pt } = usePageTranslations();
  const currencyCode = getCurrencyFromLanguage(language);
  const [aiSummaryOpen, setAiSummaryOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState("");

  const { data: projectsData } = useQuery({ queryKey: ["projects"], queryFn: fetchProjects });

  const projects = Array.isArray(projectsData) ? projectsData : (projectsData?.results || []);

  const totalProjects = projects.length;
  const activeProjects = projects.filter((p: any) => p.status === 'in_progress' || p.status === 'active').length;
  const completedProjects = projects.filter((p: any) => p.status === 'completed').length;
  const myTasks = 0; // TODO: fetch from tasks API when available
  const completedTasks = 0; // TODO: fetch from tasks API
  const avgProgress = projects.length > 0 
    ? Math.round(projects.reduce((sum: number, p: any) => sum + (p.progress || 0), 0) / projects.length)
    : 0;

  const projectStatusCounts = projects.reduce((acc: Record<string, number>, p: any) => {
    const status = p.status || 'pending';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const projectSegments = [
    { label: 'Planning', value: projectStatusCounts['planning'] || 0, color: '#8B5CF6' },
    { label: 'Pending', value: projectStatusCounts['pending'] || 0, color: '#f59e0b' },
    { label: 'In Progress', value: projectStatusCounts['in_progress'] || 0, color: '#3b82f6' },
    { label: 'Completed', value: projectStatusCounts['completed'] || 0, color: '#10b981' },
  ].filter(s => s.value > 0);

  const formattedProjects = projects.map((p: any) => ({
    id: String(p.id), 
    name: p.name, 
    status: p.status, 
    health_status: p.health_status,
    progress: p.progress || 0, 
    budget: p.budget || 0, 
    end_date: p.end_date,
    team_members_count: p.team_members_count || 0,
  }));

  const handleAIGenerate = async (selectedPrograms: any[], selectedProjects: any[]) => {
    setAiLoading(true);
    setAiSummary("");
    try {
      const langInst = language === 'nl' ? '**BELANGRIJK: Antwoord in het Nederlands.**' : '**Respond in English.**';
      const prompt = `${langInst}\n\nAnalyze my work across ${selectedProjects.length} projects.\n\n## Summary\nProvide analysis.`;
      const response = await callAI(prompt);
      setAiSummary(response);
    } catch (error) {
      setAiSummary("## Error\n\nUnable to generate summary.");
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    const handleModal = (e: CustomEvent) => {
      if (e.detail.modal === 'ai-insights') setAiSummaryOpen(true);
    };

    window.addEventListener('ai-commander-modal', handleModal as EventListener);
    return () => {
      window.removeEventListener('ai-commander-modal', handleModal as EventListener);
    };
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-violet-900/20">
      <div className="absolute top-0 -left-4 w-[28rem] h-[28rem] bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-0 -right-4 w-[28rem] h-[28rem] bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute bottom-0 left-20 w-[28rem] h-[28rem] bg-violet-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

      <div className="relative z-10 p-8 md:p-10 space-y-8 max-w-[1800px] mx-auto">
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 bg-purple-100/50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
            <Sparkles className="h-4 w-4" />
            <span>👤 {pt("Team Member Dashboard")}</span>
            <Badge className="ml-1 bg-green-500 text-white text-xs">AI-Powered</Badge>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              {pt("My Work")}
            </span>
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            {pt("Track your tasks and project contributions")}
          </p>

          <AICommander 
            isNL={language === 'nl'} 
            programs={[]}
            projects={formattedProjects}
          />

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
            {language === 'nl'
              ? '⌘K om te zoeken • Navigeer en bekijk met AI'
              : '⌘K to search • Navigate and view with AI'}
          </p>
        </div>

        <HomeAIVoiceCards />

        <AISummaryModal 
          isOpen={aiSummaryOpen} 
          onClose={() => setAiSummaryOpen(false)} 
          onGenerate={handleAIGenerate} 
          programs={[]} 
          projects={formattedProjects} 
          isLoading={aiLoading} 
          content={aiSummary} 
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
          <StatCard title={pt("My Projects")} value={totalProjects} subtitle={pt("I'm assigned to")} icon={FolderKanban} color="blue" />
          <StatCard title={pt("Active")} value={activeProjects} subtitle={pt("In progress")} icon={Activity} color="emerald" />
          <StatCard title={pt("Completed")} value={completedProjects} subtitle={pt("Finished")} icon={CheckCircle2} color="purple" />
          <StatCard title={pt("My Tasks")} value={myTasks} subtitle={pt("Assigned to me")} icon={ListTodo} color="amber" />
          <StatCard title={pt("Done")} value={completedTasks} subtitle={pt("Tasks completed")} icon={Target} color="emerald" />
          <StatCard title={pt("Avg Progress")} value={`${avgProgress}%`} subtitle={pt("Across projects")} icon={TrendingUp} color="blue" />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card className="border-0 ring-1 ring-purple-100 dark:ring-purple-900/50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-xl">
            <CardHeader className="border-b border-purple-100 dark:border-purple-900/30 pb-5">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3.5 text-xl font-bold text-gray-900 dark:text-gray-100">
                  <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <FolderKanban className="h-5 w-5 text-white" />
                  </div>
                  {pt("My Project Status")}
                </CardTitle>
                <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 ring-1 ring-inset ring-blue-600/20 font-mono text-sm font-semibold px-3 py-1">
                  {totalProjects} {pt("Total")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-14">
              <DonutChart 
                total={totalProjects} 
                segments={projectSegments.length > 0 ? projectSegments : [{ label: 'Pending', value: 1, color: '#f59e0b' }]} 
                centerLabel={pt("Projects")} 
              />
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 ring-1 ring-purple-100 dark:ring-purple-900/50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-xl">
          <CardHeader className="border-b border-purple-100 dark:border-purple-900/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">{pt("Projects I'm Working On")}</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/projects')}
                className="font-bold ring-2 ring-inset ring-purple-200 hover:ring-purple-300 hover:bg-purple-50 dark:ring-purple-800 dark:hover:ring-purple-700 dark:hover:bg-purple-900/20 border-0 rounded-xl"
              >
                {pt("View All")} <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-7">
            <div className="overflow-x-auto rounded-2xl ring-1 ring-purple-100 dark:ring-purple-900/50">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-b border-purple-100 dark:border-purple-900/50">
                    <th className="text-left py-4 px-6 text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-widest">{pt("Project Name")}</th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-widest">{pt("End Date")}</th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-widest">{pt("Team Size")}</th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-widest">{pt("Progress")}</th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-widest">{pt("Status")}</th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-widest">{pt("Health")}</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-purple-50 dark:divide-purple-900/20">
                  {formattedProjects.length > 0 ? formattedProjects.map((project) => (
                    <tr 
                      key={project.id} 
                      className="hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 dark:hover:from-purple-900/10 dark:hover:to-pink-900/10 cursor-pointer transition-colors"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <td className="py-4 px-6">
                        <span className="font-bold text-gray-900 dark:text-gray-100">{project.name}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {project.end_date ? new Date(project.end_date).toLocaleDateString() : '—'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="font-mono text-sm font-bold text-gray-900 dark:text-gray-100">{project.team_members_count}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <Progress value={project.progress} className="h-2 w-24 bg-purple-100 dark:bg-purple-900/30" />
                          <span className="text-sm font-mono font-bold text-gray-600 dark:text-gray-400 min-w-[3ch] tabular-nums">{project.progress}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-6"><StatusBadge status={project.status} /></td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center">
                          <HealthIndicator health={project.health_status} />
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center ring-4 ring-purple-50 dark:ring-purple-900/20">
                            <FolderKanban className="h-8 w-8 text-purple-400" />
                          </div>
                          <p className="text-gray-500 dark:text-gray-400 font-medium">{pt("No projects assigned yet")}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Certifications & Recommended Courses */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <MethodologyBreakdown projects={projects} />
          <CertificationsWidget />
          <RecommendedCourses projects={projects} />
        </div>
      </div>
    </div>
  );
};

export default TeamMemberDashboard;
