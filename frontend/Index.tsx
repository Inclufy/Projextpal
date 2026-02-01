import { useState } from "react";
import { MetricCard } from "@/components/MetricCard";
import { ProjectsTable } from "@/components/ProjectsTable";
import { ProjectStatusChart } from "@/components/ProjectStatusChart";
import { CashFlowChart } from "@/components/CashFlowChart";
import { TrendingUp, Briefcase, DollarSign, AlertCircle, Brain, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { AISummaryModal } from "@/components/AISummaryModal";
import { toast } from "sonner";

const fetchProjects = async () => {
  const token = localStorage.getItem("access_token");
  const response = await fetch("/api/v1/projects/", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch projects");
  return response.json();
};

const fetchPrograms = async () => {
  const token = localStorage.getItem("access_token");
  const response = await fetch("/api/v1/programs/", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch programs");
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

const Index = () => {
  const { t, language } = useLanguage();
  const [aiSummaryOpen, setAiSummaryOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState("");

  const { data: projectsData } = useQuery({ queryKey: ["projects"], queryFn: fetchProjects });
  const { data: programsData } = useQuery({ queryKey: ["programs"], queryFn: fetchPrograms });

  const projects = Array.isArray(projectsData) ? projectsData : (projectsData?.results || []);
  const programs = Array.isArray(programsData) ? programsData : (programsData?.results || []);

  const formattedPrograms = programs.map((p: any) => ({
    id: String(p.id), name: p.name, status: p.status, methodology: p.methodology,
    health_status: p.health_status, project_count: p.project_count, total_budget: p.total_budget,
  }));

  const formattedProjects = projects.map((p: any) => ({
    id: String(p.id), name: p.name, status: p.status, health_status: p.health_status,
    progress: p.progress, budget: p.budget,
  }));

  const handleAIGenerate = async (selectedPrograms: any[], selectedProjects: any[]) => {
    setAiLoading(true);
    setAiSummary("");
    try {
      const langInst = language === 'nl' ? '**BELANGRIJK: Antwoord in het Nederlands.**' : '**Respond in English.**';
      const prompt = `${langInst}\n\nAnalyze: ${selectedPrograms.length} programs, ${selectedProjects.length} projects.\n\n## Summary\nProvide analysis.`;
      const response = await callAI(prompt);
      setAiSummary(response);
    } catch (error) {
      setAiSummary("## Error\n\nUnable to generate summary.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-background via-background to-muted/20">
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground tracking-tight">Dashboard Overview</h1>
            <p className="text-muted-foreground text-lg">Monitor your projects and financial metrics</p>
          </div>
          <Button onClick={() => setAiSummaryOpen(true)} className="gap-2" style={{ background: 'linear-gradient(135deg, #8B5CF6, #D946EF)' }}>
            <Brain className="h-4 w-4" />AI Summary
          </Button>
        </div>
        <AISummaryModal isOpen={aiSummaryOpen} onClose={() => setAiSummaryOpen(false)} onGenerate={handleAIGenerate} programs={formattedPrograms} projects={formattedProjects} isLoading={aiLoading} content={aiSummary} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <MetricCard title="Total Projects" value="7" icon={Briefcase} trend="+12%" />
          <MetricCard title="Program Budget" value="49.1K" icon={DollarSign} trend="+5%" />
          <MetricCard title="Committed to Date" value="3.1K" icon={TrendingUp} trend="+18%" />
          <MetricCard title="Final Forecast Cost" value="49.1K" icon={DollarSign} />
          <MetricCard title="Variance to Budget" value="0" icon={AlertCircle} isNeutral />
          <MetricCard title="Paid to Date" value="2.5K" icon={TrendingUp} trend="+8%" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProjectStatusChart />
          <CashFlowChart />
        </div>
        <ProjectsTable />
      </div>
    </div>
  );
};

export default Index;
