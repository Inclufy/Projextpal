import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Plus, Play, Calendar, Timer, Square, BarChart3, Filter, X, Sparkles, Brain, FileText, Wand2, Loader2, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePageTranslations } from "@/hooks/usePageTranslations";

// Use relative path - proxy handles the rest
const API_BASE_URL = '/api/v1';

// API fetch functions
const fetchProjects = async () => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE_URL}/projects/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return [];
  const data = await response.json();
  const projectList = Array.isArray(data) ? data : data.results || [];
  
  // Fetch tasks for each project
  const projectsWithTasks = await Promise.all(
    projectList.map(async (project: any) => {
      try {
        const taskUrl = `${API_BASE_URL}/projects/tasks/?project=${project.id}`;
        const tasksResponse = await fetch(taskUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!tasksResponse.ok) {
          return {
            id: String(project.id),
            name: project.name || project.title,
            tasks: [],
          };
        }
        
        const tasksData = await tasksResponse.json();
        const tasks = Array.isArray(tasksData) ? tasksData : tasksData.results || [];
        return {
          id: String(project.id),
          name: project.name || project.title,
          tasks: tasks.map((t: any) => ({
            id: String(t.id),
            title: t.title || t.name,
          })),
        };
      } catch {
        return {
          id: String(project.id),
          name: project.name || project.title,
          tasks: [],
        };
      }
    })
  );
  
  return projectsWithTasks;
};

const fetchTeamMembers = async () => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE_URL}/auth/company-users/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return [];
  const data = await response.json();
  const members = Array.isArray(data) ? data : data.results || [];
  return members.map((m: any) => ({
    id: String(m.id),
    name: m.name || m.full_name || `${m.first_name || ''} ${m.last_name || ''}`.trim() || m.username,
  }));
};

const fetchTimeEntries = async () => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE_URL}/projects/time-entries/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return [];
  const data = await response.json();
  const entries = Array.isArray(data) ? data : data.results || [];
  
  return entries.map((e: any) => {
    // Backend returns 'hours', convert to minutes for internal use
    const hoursValue = e.hours || 0;
    const durationMinutes = Math.round(hoursValue * 60);
    
    return {
      id: e.id,
      projectId: String(e.project_id || e.project?.id || e.project || ''),
      projectName: e.project_name || e.project?.name || null, // Will be resolved later
      taskId: String(e.task_id || e.task?.id || e.task || ''),
      taskName: e.task_name || e.task?.title || e.task?.name || null, // Will be resolved later
      date: e.date ? new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : 'Unknown',
      duration: formatDurationFromMinutes(durationMinutes),
      durationMinutes: durationMinutes,
      description: e.description || '',
      status: e.status || 'completed',
      teamMemberId: String(e.user_id || e.user?.id || e.user || ''),
      teamMemberName: e.user_name || e.user?.name || '',
    };
  });
};

const formatDurationFromMinutes = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
};

// AI Helper function
const callAI = async (prompt: string): Promise<string> => {
  const token = localStorage.getItem("access_token");
  try {
    const response = await fetch("/api/v1/governance/ai/generate/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ prompt }),
    });
    if (!response.ok) throw new Error("AI service unavailable");
    const data = await response.json();
    return data.response || "";
  } catch (error) {
    throw error;
  }
};

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--destructive))",
  "hsl(221, 83%, 53%)",
];

interface TimeEntry {
  id: number;
  projectId: string;
  projectName: string;
  taskId: string;
  taskName: string;
  date: string;
  duration: string;
  durationMinutes: number;
  description?: string;
  status: string;
  teamMemberId?: string;
  teamMemberName?: string;
}

interface Project {
  id: string;
  name: string;
  tasks: { id: string; title: string }[];
}

interface TeamMember {
  id: string;
  name: string;
}

const TimeTracking = () => {
  const { t } = useLanguage();
  const { pt } = usePageTranslations();
  const queryClient = useQueryClient();
  
  const tt = t.timeTracking || {
    title: 'Time Tracking',
    subtitle: 'Track your time across projects and tasks',
    aiInsights: 'AI Insights',
    smartEntry: 'Smart Entry',
    aiReport: 'AI Report',
    newTimeEntry: 'New Time Entry',
    today: 'Today',
    thisWeek: 'This Week',
    activeTimer: 'Active Timer',
    project: 'Project',
    task: 'Task',
    startTimer: 'Start Timer',
    stopSave: 'Stop & Save',
    timeReports: 'Time Reports',
    weekly: 'Weekly',
    monthly: 'Monthly',
    dailyHours: 'Daily Hours',
    weeklyHours: 'Weekly Hours',
    projectDistribution: 'Project Distribution',
    totalHours: 'Total Hours',
    totalEntries: 'Total Entries',
    projects: 'Projects',
    dailyAverage: 'Daily Average',
    recentEntries: 'Recent Time Entries',
    filters: 'Filters',
    clearFilters: 'Clear Filters',
    allProjects: 'All projects',
    allMembers: 'All members',
    teamMember: 'Team Member',
    startDate: 'Start Date',
    endDate: 'End Date',
    showing: 'Showing',
    of: 'of',
    entries: 'entries',
    noEntries: 'No time entries match the current filters',
    clearAllFilters: 'Clear all filters',
    logTimeEntry: 'Log Time Entry',
    selectProject: 'Select project',
    selectTask: 'Select task',
    date: 'Date',
    hours: 'Hours',
    minutes: 'Minutes',
    description: 'Description (optional)',
    saveTimeEntry: 'Save Time Entry',
    aiProductivityInsights: 'AI Productivity Insights',
    aiInsightsDesc: 'AI-powered analysis of your time tracking patterns.',
    analyzeMyTime: 'Analyze My Time',
    analyzingPatterns: 'Analyzing your productivity patterns...',
    refreshAnalysis: 'Refresh Analysis',
    close: 'Close',
    aiSmartEntry: 'AI Smart Time Entry',
    aiSmartEntryDesc: 'Describe your work and AI will create the time entry.',
    generateEntry: 'Generate Entry',
    processing: 'Processing...',
    addEntry: 'Add Entry',
    tryAgain: 'Try Again',
    aiSuggestion: 'AI Suggestion',
    duration: 'Duration',
    aiWeeklyReport: 'AI Weekly Report',
    aiReportDesc: 'Generate a professional time report summary.',
    generateReport: 'Generate Report',
    generatingReport: 'Generating your report...',
    copyReport: 'Copy Report',
    regenerate: 'Regenerate',
  };

  // Fetch data from API
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['projects-with-tasks'],
    queryFn: fetchProjects,
  });

  const { data: teamMembers = [], isLoading: membersLoading } = useQuery({
    queryKey: ['team-members-list'],
    queryFn: fetchTeamMembers,
  });

  const { data: timeEntries = [], isLoading: entriesLoading, refetch: refetchEntries } = useQuery({
    queryKey: ['time-entries'],
    queryFn: fetchTimeEntries,
  });

  // Enrich time entries with project and task names from projects data
  const enrichedTimeEntries = useMemo(() => {
    return timeEntries.map(entry => {
      // Find project name
      const project = projects.find((p: Project) => p.id === entry.projectId);
      const projectName = entry.projectName || project?.name || 'Unknown Project';
      
      // Find task name
      const task = project?.tasks.find((t: { id: string; title: string }) => t.id === entry.taskId);
      const taskName = entry.taskName || task?.title || 'Unknown Task';
      
      return {
        ...entry,
        projectName,
        taskName,
      };
    });
  }, [timeEntries, projects]);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [reportPeriod, setReportPeriod] = useState<"weekly" | "monthly">("weekly");
  
  // Timer state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerProject, setTimerProject] = useState("");
  const [timerTask, setTimerTask] = useState("");

  // Filter state
  const [filterProject, setFilterProject] = useState("");
  const [filterTeamMember, setFilterTeamMember] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // AI States
  const [aiInsightsOpen, setAiInsightsOpen] = useState(false);
  const [aiSmartEntryOpen, setAiSmartEntryOpen] = useState(false);
  const [aiReportOpen, setAiReportOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiSuggestedEntry, setAiSuggestedEntry] = useState<{
    projectId: string;
    projectName: string;
    taskId: string;
    taskName: string;
    hours: number;
    minutes: number;
    description: string;
  } | null>(null);

  // Create time entry mutation - FIXED: backend expects 'project' and 'hours'
  const createEntryMutation = useMutation({
    mutationFn: async (entryData: {
      project_id: string;
      task_id: string;
      date: string;
      duration_minutes: number;
      description?: string;
    }) => {
      const token = localStorage.getItem("access_token");
      
      // Convert minutes to hours (decimal)
      const hours = entryData.duration_minutes / 60;
      
      // Backend expects 'project' and 'hours' fields
      const payload: Record<string, any> = {
        project: parseInt(entryData.project_id, 10),
        task: parseInt(entryData.task_id, 10),
        date: entryData.date,
        hours: hours,
        description: entryData.description || '',
      };
      
      const response = await fetch(`${API_BASE_URL}/projects/time-entries/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData?.detail || errorData?.message || 
          (errorData ? JSON.stringify(errorData) : 'Unknown error');
        throw new Error(errorMsg || 'Failed to create entry');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      toast.success(pt("Created"));
    },
    onError: (error: Error) => {
      toast.error(error.message || pt("Create failed"));
    },
  });

  // Helper to parse date string to Date object
  const parseEntryDate = (dateStr: string) => {
    return new Date(dateStr);
  };

  // Filtered entries - use enrichedTimeEntries with resolved names
  const filteredEntries = useMemo(() => {
    return enrichedTimeEntries.filter((entry) => {
      if (filterProject && filterProject !== "all" && entry.projectId !== filterProject) {
        return false;
      }
      if (filterTeamMember && filterTeamMember !== "all" && entry.teamMemberId !== filterTeamMember) {
        return false;
      }
      if (filterStartDate || filterEndDate) {
        const entryDate = parseEntryDate(entry.date);
        if (filterStartDate) {
          const startDate = new Date(filterStartDate);
          if (entryDate < startDate) return false;
        }
        if (filterEndDate) {
          const endDate = new Date(filterEndDate);
          endDate.setHours(23, 59, 59, 999);
          if (entryDate > endDate) return false;
        }
      }
      return true;
    });
  }, [enrichedTimeEntries, filterProject, filterTeamMember, filterStartDate, filterEndDate]);

  const clearFilters = () => {
    setFilterProject("");
    setFilterTeamMember("");
    setFilterStartDate("");
    setFilterEndDate("");
  };

  const hasActiveFilters = filterProject || filterTeamMember || filterStartDate || filterEndDate;

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimerDisplay = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
  };

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m.toString().padStart(2, "0")}m`;
  };

  const availableTasks = projects.find((p: Project) => p.id === selectedProject)?.tasks || [];
  const timerAvailableTasks = projects.find((p: Project) => p.id === timerProject)?.tasks || [];

  const calculateTotals = () => {
    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const todayEntries = enrichedTimeEntries.filter((e) => e.date === today);
    const todayMinutes = todayEntries.reduce((sum, e) => sum + e.durationMinutes, 0);
    const weekMinutes = enrichedTimeEntries.reduce((sum, e) => sum + e.durationMinutes, 0);

    return {
      todayTotal: formatDuration(todayMinutes),
      weeklyTotal: formatDuration(weekMinutes),
    };
  };

  const { todayTotal, weeklyTotal } = calculateTotals();

  // Chart data calculations
  const projectDistribution = useMemo(() => {
    const distribution: Record<string, number> = {};
    enrichedTimeEntries.forEach((entry) => {
      distribution[entry.projectName] = (distribution[entry.projectName] || 0) + entry.durationMinutes;
    });
    return Object.entries(distribution).map(([name, minutes]) => ({
      name,
      hours: Math.round((minutes / 60) * 10) / 10,
      minutes,
    }));
  }, [enrichedTimeEntries]);

  const dailyData = useMemo(() => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days.push(date.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
    }

    return last7Days.map((day) => {
      const dayEntries = enrichedTimeEntries.filter((e) => {
        const entryDay = e.date.replace(/, \d{4}$/, '');
        return entryDay === day;
      });
      const totalMinutes = dayEntries.reduce((sum, e) => sum + e.durationMinutes, 0);
      return {
        name: day,
        hours: Math.round((totalMinutes / 60) * 10) / 10,
      };
    });
  }, [enrichedTimeEntries]);

  const totalHours = useMemo(() => {
    return Math.round((enrichedTimeEntries.reduce((sum, e) => sum + e.durationMinutes, 0) / 60) * 10) / 10;
  }, [enrichedTimeEntries]);

  const handleAddEntry = () => {
    if (!selectedProject || !selectedTask) {
      toast.error(pt("Please select a project and task"));
      return;
    }

    const totalMinutes = (parseInt(hours) || 0) * 60 + (parseInt(minutes) || 0);
    if (totalMinutes === 0) {
      toast.error(pt("Please enter a duration"));
      return;
    }

    createEntryMutation.mutate({
      project_id: selectedProject,
      task_id: selectedTask,
      date: date,
      duration_minutes: totalMinutes,
      description: description || undefined,
    });

    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedProject("");
    setSelectedTask("");
    setHours("");
    setMinutes("");
    setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
  };

  const handleStartTimer = () => {
    if (!timerProject || !timerTask) {
      toast.error(pt("Please select a project and task"));
      return;
    }
    setIsTimerRunning(true);
  };

  const handleStopTimer = () => {
    if (timerSeconds > 0 && timerProject && timerTask) {
      const totalMinutes = Math.ceil(timerSeconds / 60);
      
      createEntryMutation.mutate({
        project_id: timerProject,
        task_id: timerTask,
        date: new Date().toISOString().split("T")[0],
        duration_minutes: totalMinutes,
      });
    }

    setIsTimerRunning(false);
    setTimerSeconds(0);
    setTimerProject("");
    setTimerTask("");
  };

  // AI Handlers
  const handleAIInsights = async () => {
    setAiLoading(true);
    setAiResponse("");
    
    try {
      const entrySummary = enrichedTimeEntries.slice(0, 20).map(e => ({
        project: e.projectName,
        task: e.taskName,
        duration: e.duration,
        date: e.date,
      }));

      const projectTotals = projectDistribution.map(p => `${p.name}: ${p.hours}h`).join(", ");

      const prompt = `Analyze this time tracking data and provide actionable insights:

Time Entries: ${JSON.stringify(entrySummary, null, 2)}
Project Distribution: ${projectTotals}
Total Hours: ${totalHours}h

Provide:
1. **Productivity Assessment** (2 sentences)
2. **Time Distribution Analysis**
3. **Recommendations** (3 bullet points)
4. **Potential Issues**
5. **Suggested Focus**`;

      const response = await callAI(prompt);
      setAiResponse(response);
    } catch (error) {
      toast.error(t.common.aiUnavailable);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAISmartEntry = async () => {
    if (!aiPrompt.trim()) {
      toast.error(t.common.describeFirst);
      return;
    }

    setAiLoading(true);
    setAiSuggestedEntry(null);
    
    try {
      const projectsList = projects.map((p: Project) => ({
        id: p.id,
        name: p.name,
        tasks: p.tasks.map(t => ({ id: t.id, title: t.title }))
      }));

      const prompt = `Based on this work description, identify the best matching project and task:

Work Description: "${aiPrompt}"

Available Projects and Tasks:
${JSON.stringify(projectsList, null, 2)}

Respond in JSON format only, no other text:
{
  "projectId": "1",
  "projectName": "Project Name",
  "taskId": "1",
  "taskName": "Task Name",
  "hours": 2,
  "minutes": 30,
  "description": "Clean description"
}`;

      const response = await callAI(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setAiSuggestedEntry({
          projectId: String(parsed.projectId),
          projectName: parsed.projectName,
          taskId: String(parsed.taskId),
          taskName: parsed.taskName,
          hours: parsed.hours || 0,
          minutes: parsed.minutes || 0,
          description: parsed.description || aiPrompt,
        });
      } else {
        toast.error(t.common.generateFailed);
      }
    } catch (error) {
      toast.error(t.common.aiUnavailable);
    } finally {
      setAiLoading(false);
    }
  };

  const applySuggestedEntry = () => {
    if (!aiSuggestedEntry) return;

    const totalMinutes = aiSuggestedEntry.hours * 60 + aiSuggestedEntry.minutes;

    createEntryMutation.mutate({
      project_id: aiSuggestedEntry.projectId,
      task_id: aiSuggestedEntry.taskId,
      date: new Date().toISOString().split("T")[0],
      duration_minutes: totalMinutes,
      description: aiSuggestedEntry.description,
    });

    setAiSmartEntryOpen(false);
    setAiPrompt("");
    setAiSuggestedEntry(null);
  };

  const handleAIReport = async () => {
    setAiLoading(true);
    setAiResponse("");
    
    try {
      const entrySummary = enrichedTimeEntries.slice(0, 30).map(e => ({
        project: e.projectName,
        task: e.taskName,
        duration: e.duration,
        date: e.date,
        teamMember: e.teamMemberName,
      }));

      const prompt = `Generate a professional weekly time report:

Time Entries: ${JSON.stringify(entrySummary, null, 2)}
Total Hours: ${totalHours}h
Projects: ${projectDistribution.map(p => `${p.name} (${p.hours}h)`).join(", ")}

Generate a report with:
## Weekly Time Report Summary
### Overview
### Time Breakdown by Project
### Key Accomplishments
### Recommendations for Next Week`;

      const response = await callAI(prompt);
      setAiResponse(response);
    } catch (error) {
      toast.error(t.common.aiUnavailable);
    } finally {
      setAiLoading(false);
    }
  };

  // Loading state
  if (projectsLoading || entriesLoading) {
    return (
      <div className="min-h-full bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Loading time tracking data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{tt.title}</h1>
          <p className="text-muted-foreground">{tt.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* AI Insights Button */}
          <Dialog open={aiInsightsOpen} onOpenChange={setAiInsightsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Brain className="h-4 w-4 text-purple-500" />
                {tt.aiInsights}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  {tt.aiProductivityInsights}
                </DialogTitle>
                <DialogDescription>{tt.aiInsightsDesc}</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                {!aiResponse && !aiLoading && (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Analyze {enrichedTimeEntries.length} time entries and get productivity insights.
                    </p>
                    <Button onClick={handleAIInsights}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      {tt.analyzeMyTime}
                    </Button>
                  </div>
                )}
                {aiLoading && (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-500 mb-4" />
                    <p className="text-muted-foreground">{tt.analyzingPatterns}</p>
                  </div>
                )}
                {aiResponse && (
                  <div className="bg-muted/50 rounded-lg p-4 max-h-80 overflow-y-auto">
                    <div className="prose prose-sm dark:prose-invert whitespace-pre-wrap">
                      {aiResponse}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                {aiResponse && (
                  <Button variant="outline" onClick={() => { setAiResponse(""); handleAIInsights(); }}>
                    {tt.refreshAnalysis}
                  </Button>
                )}
                <Button variant="outline" onClick={() => setAiInsightsOpen(false)}>
                  {tt.close}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* AI Smart Entry Button */}
          <Dialog open={aiSmartEntryOpen} onOpenChange={(open) => {
            setAiSmartEntryOpen(open);
            if (!open) {
              setAiPrompt("");
              setAiSuggestedEntry(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Wand2 className="h-4 w-4 text-purple-500" />
                {tt.smartEntry}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-purple-500" />
                  {tt.aiSmartEntry}
                </DialogTitle>
                <DialogDescription>{tt.aiSmartEntryDesc}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Textarea
                  placeholder="Example: Spent about 2 hours working on the mobile app API integration..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={4}
                />
                
                <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  <Lightbulb className="h-4 w-4 mt-0.5 text-amber-500" />
                  <p>Tip: Include the project, task type, and approximate time spent.</p>
                </div>

                {aiSuggestedEntry && (
                  <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-500" />
                        <span className="font-medium">{tt.aiSuggestion}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">{tt.project}</p>
                          <p className="font-medium">{aiSuggestedEntry.projectName}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{tt.task}</p>
                          <p className="font-medium">{aiSuggestedEntry.taskName}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{tt.duration}</p>
                          <p className="font-medium">{aiSuggestedEntry.hours}h {aiSuggestedEntry.minutes}m</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{tt.date}</p>
                          <p className="font-medium">{tt.today}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
              <DialogFooter>
                {aiSuggestedEntry ? (
                  <>
                    <Button variant="outline" onClick={() => {
                      setAiSuggestedEntry(null);
                      setAiPrompt("");
                    }}>
                      {tt.tryAgain}
                    </Button>
                    <Button onClick={applySuggestedEntry}>
                      <Plus className="h-4 w-4 mr-2" />
                      {tt.addEntry}
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleAISmartEntry} disabled={aiLoading || !aiPrompt.trim()}>
                    {aiLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {tt.processing}
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        {tt.generateEntry}
                      </>
                    )}
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* AI Report Button */}
          <Dialog open={aiReportOpen} onOpenChange={setAiReportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <FileText className="h-4 w-4 text-purple-500" />
                {tt.aiReport}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-500" />
                  {tt.aiWeeklyReport}
                </DialogTitle>
                <DialogDescription>{tt.aiReportDesc}</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                {!aiResponse && !aiLoading && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Generate a professional report from {enrichedTimeEntries.length} time entries.
                    </p>
                    <Button onClick={handleAIReport}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      {tt.generateReport}
                    </Button>
                  </div>
                )}
                {aiLoading && (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-500 mb-4" />
                    <p className="text-muted-foreground">{tt.generatingReport}</p>
                  </div>
                )}
                {aiResponse && (
                  <div className="bg-muted/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <div className="prose prose-sm dark:prose-invert whitespace-pre-wrap">
                      {aiResponse}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                {aiResponse && (
                  <>
                    <Button variant="outline" onClick={() => {
                      navigator.clipboard.writeText(aiResponse);
                      toast.success(pt("Copied to clipboard"));
                    }}>
                      {tt.copyReport}
                    </Button>
                    <Button variant="outline" onClick={() => { setAiResponse(""); handleAIReport(); }}>
                      {tt.regenerate}
                    </Button>
                  </>
                )}
                <Button variant="outline" onClick={() => setAiReportOpen(false)}>
                  {tt.close}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* New Time Entry Button */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                {tt.newTimeEntry}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{tt.logTimeEntry}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="project">{tt.project}</Label>
                  <Select value={selectedProject} onValueChange={(value) => {
                    setSelectedProject(value);
                    setSelectedTask("");
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder={tt.selectProject} />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project: Project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="task">{tt.task}</Label>
                  <Select 
                    value={selectedTask} 
                    onValueChange={setSelectedTask}
                    disabled={!selectedProject}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={tt.selectTask} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTasks.map((task: { id: string; title: string }) => (
                        <SelectItem key={task.id} value={task.id}>
                          {task.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">{tt.date}</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="hours">{tt.hours}</Label>
                    <Input
                      id="hours"
                      type="number"
                      min="0"
                      max="24"
                      placeholder="0"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="minutes">{tt.minutes}</Label>
                    <Input
                      id="minutes"
                      type="number"
                      min="0"
                      max="59"
                      placeholder="0"
                      value={minutes}
                      onChange={(e) => setMinutes(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">{tt.description}</Label>
                  <Textarea
                    id="description"
                    placeholder="What did you work on?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleAddEntry} 
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={createEntryMutation.isPending}
                >
                  {createEntryMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    tt.saveTimeEntry
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Timer className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{tt.today}</p>
              <p className="text-2xl font-bold text-foreground">{todayTotal}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{tt.thisWeek}</p>
              <p className="text-2xl font-bold text-foreground">{weeklyTotal}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{tt.activeTimer}</p>
                <p className="text-xl font-bold text-foreground">{formatTimerDisplay(timerSeconds)}</p>
              </div>
            </div>
            {!isTimerRunning ? (
              <div className="grid grid-cols-2 gap-2">
                <Select value={timerProject} onValueChange={(value) => {
                  setTimerProject(value);
                  setTimerTask("");
                }}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder={tt.project} />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project: Project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select 
                  value={timerTask} 
                  onValueChange={setTimerTask}
                  disabled={!timerProject}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder={tt.task} />
                  </SelectTrigger>
                  <SelectContent>
                    {timerAvailableTasks.map((task: { id: string; title: string }) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                {projects.find((p: Project) => p.id === timerProject)?.name} - {timerAvailableTasks.find((t: { id: string; title: string }) => t.id === timerTask)?.title}
              </p>
            )}
            <Button 
              size="sm" 
              variant={isTimerRunning ? "destructive" : "default"}
              onClick={isTimerRunning ? handleStopTimer : handleStartTimer}
              disabled={!timerProject || !timerTask}
              className={!isTimerRunning ? "bg-success hover:bg-success/90" : ""}
            >
              {isTimerRunning ? (
                <>
                  <Square className="h-4 w-4 mr-2" />
                  {tt.stopSave}
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  {tt.startTimer}
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>

      {/* Time Reports */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">{tt.timeReports}</h2>
          </div>
          <Tabs value={reportPeriod} onValueChange={(v) => setReportPeriod(v as "weekly" | "monthly")}>
            <TabsList>
              <TabsTrigger value="weekly">{tt.weekly}</TabsTrigger>
              <TabsTrigger value="monthly">{tt.monthly}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              {reportPeriod === "weekly" ? tt.dailyHours : tt.weeklyHours}
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-4">{tt.projectDistribution}</h3>
            {projectDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={projectDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="hours"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {projectDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`${value}h`, "Hours"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No time entries yet
              </div>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{totalHours}h</p>
            <p className="text-sm text-muted-foreground">{tt.totalHours}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{enrichedTimeEntries.length}</p>
            <p className="text-sm text-muted-foreground">{tt.totalEntries}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{projectDistribution.length}</p>
            <p className="text-sm text-muted-foreground">{tt.projects}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{enrichedTimeEntries.length > 0 ? Math.round(totalHours / 7) : 0}h</p>
            <p className="text-sm text-muted-foreground">{tt.dailyAverage}</p>
          </div>
        </div>
      </Card>

      {/* Time Entries */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">{tt.recentEntries}</h2>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                {tt.clearFilters}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={hasActiveFilters ? "border-primary text-primary" : ""}
            >
              <Filter className="h-4 w-4 mr-2" />
              {tt.filters}
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {[filterProject, filterTeamMember, filterStartDate, filterEndDate].filter(Boolean).length}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 mb-4 rounded-lg bg-muted/50 border border-border">
            <div className="space-y-2">
              <Label className="text-sm font-medium">{tt.project}</Label>
              <Select value={filterProject} onValueChange={setFilterProject}>
                <SelectTrigger>
                  <SelectValue placeholder={tt.allProjects} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{tt.allProjects}</SelectItem>
                  {projects.map((project: Project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">{tt.teamMember}</Label>
              <Select value={filterTeamMember} onValueChange={setFilterTeamMember}>
                <SelectTrigger>
                  <SelectValue placeholder={tt.allMembers} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{tt.allMembers}</SelectItem>
                  {teamMembers.map((member: TeamMember) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">{tt.startDate}</Label>
              <Input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">{tt.endDate}</Label>
              <Input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Results summary */}
        {hasActiveFilters && (
          <p className="text-sm text-muted-foreground mb-4">
            {tt.showing} {filteredEntries.length} {tt.of} {enrichedTimeEntries.length} {tt.entries}
          </p>
        )}

        <div className="space-y-4">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{tt.noEntries}</p>
              {hasActiveFilters && (
                <Button variant="link" onClick={clearFilters} className="mt-2">
                  {tt.clearAllFilters}
                </Button>
              )}
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{entry.taskName}</p>
                    <p className="text-sm text-muted-foreground">{entry.projectName}</p>
                    {entry.teamMemberName && (
                      <p className="text-xs text-muted-foreground">{entry.teamMemberName}</p>
                    )}
                    {entry.description && (
                      <p className="text-xs text-muted-foreground mt-1">{entry.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{entry.duration}</p>
                    <p className="text-sm text-muted-foreground">{entry.date}</p>
                  </div>
                  <Badge variant="secondary" className="bg-success/10 text-success">
                    {entry.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default TimeTracking;