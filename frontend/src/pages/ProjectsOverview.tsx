import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  FolderKanban,
  Calendar,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Layers,
  MoreHorizontal,
  Trash2,
  Edit,
  Eye,
  Loader2,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  LayoutGrid,
  List,
  Zap,
  Crown,
  GitMerge,
  Repeat,
  Kanban,
  Droplets,
  Award,
  Check,
  User,
  Users,
  Clock,
  Target,
  FileText,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatBudget, getCurrencyFromLanguage } from '@/lib/currencies';
import { usePageTranslations } from '@/hooks/usePageTranslations';

// API functions
const fetchProjects = async () => {
  const token = localStorage.getItem("access_token");
  const response = await fetch("/api/v1/projects/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch projects");
  return response.json();
};

const deleteProject = async (id: number) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`/api/v1/projects/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to delete project");
  return true;
};

const createProject = async (projectData: any) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch("/api/v1/projects/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(projectData),
  });
  if (!response.ok) throw new Error("Failed to create project");
  return response.json();
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
    console.error("AI call failed:", error);
    throw error;
  }
};

// Methodology configurations
const METHODOLOGY_CONFIG: Record<string, { icon: any; color: string; bgColor: string; borderColor: string; label: string; description: string }> = {
  prince2: { icon: Crown, color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', label: 'PRINCE2', description: 'Structured governance for complex projects' },
  agile: { icon: Zap, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', label: 'Agile', description: 'Iterative, flexible approach' },
  scrum: { icon: Repeat, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200', label: 'Scrum', description: 'Sprint-based development' },
  kanban: { icon: Kanban, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', label: 'Kanban', description: 'Visual workflow management' },
  waterfall: { icon: Droplets, color: 'text-cyan-600', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-200', label: 'Waterfall', description: 'Sequential phases' },
  lean_six_sigma_green: { icon: Award, color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', label: 'Six Sigma Green', description: 'Process improvement (DMAIC)' },
  lean_six_sigma_black: { icon: Award, color: 'text-gray-800', bgColor: 'bg-gray-100', borderColor: 'border-gray-300', label: 'Six Sigma Black', description: 'Advanced process optimization' },
  hybrid: { icon: GitMerge, color: 'text-pink-600', bgColor: 'bg-pink-50', borderColor: 'border-pink-200', label: 'Hybrid', description: 'Combined methodologies' },
};

// AI Wizard Step type
type WizardStep = 'idea' | 'methodology' | 'details' | 'review' | 'creating';

interface ProjectFormData {
  name: string;
  description: string;
  methodology: string;
  teamSize: string;
  budget: string;
  duration: string;
  priority: string;
  objectives: string;
  startDate: string;
}

const ProjectsOverview = () => {
  const { pt } = usePageTranslations();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t, language } = useLanguage();

  // Translations using pt() for consistent Dutch support
  const tp = {
    title: pt('Projects'),
    subtitle: pt('Manage and track all your projects'),
    totalProjects: pt('Total Projects'),
    active: pt('Active'),
    atRisk: pt('At Risk'),
    completed: pt('Completed'),
    totalBudget: pt('Total Budget'),
    searchPlaceholder: pt('Search projects...'),
    allStatus: pt('All Status'),
    allMethods: pt('All Methods'),
    generateWithAI: pt('Generate with AI'),
    newProject: pt('New Project'),
    createNewProject: pt('Create New Project'),
    createDescription: pt('Start tracking a new project'),
    manual: pt('Manual'),
    tasks: pt('Tasks'),
    budget: pt('Budget'),
    health: pt('Health'),
    unassigned: pt('Unassigned'),
    noProjects: pt('No projects found'),
    view: pt('View'),
    edit: pt('Edit'),
    delete: pt('Delete'),
    planning: pt('Planning'),
    pending: pt('Pending'),
    inProgress: pt('In Progress'),
    onHold: pt('On Hold'),
    clearFilters: pt('Clear Filters'),
  };
  const ta = { progress: pt('Progress') };
  const tc = { retry: pt('Retry'), cancel: pt('Cancel') };
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodologyFilter, setMethodologyFilter] = useState("all");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<any>(null);

  // AI Wizard States
  const [aiGenerateOpen, setAiGenerateOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<WizardStep>('idea');
  const [aiLoading, setAiLoading] = useState(false);
  const [projectIdea, setProjectIdea] = useState("");
  const [aiRecommendation, setAiRecommendation] = useState<{
    methodology: string;
    reasoning: string;
    confidence: number;
  } | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    methodology: '',
    teamSize: '',
    budget: '',
    duration: '',
    priority: 'medium',
    objectives: '',
    startDate: new Date().toISOString().split('T')[0],
  });

  // Reset wizard when dialog closes
  useEffect(() => {
    if (!aiGenerateOpen) {
      setWizardStep('idea');
      setProjectIdea("");
      setAiRecommendation(null);
      setFormData({
        name: '',
        description: '',
        methodology: '',
        teamSize: '',
        budget: '',
        duration: '',
        priority: 'medium',
        objectives: '',
        startDate: new Date().toISOString().split('T')[0],
      });
    }
  }, [aiGenerateOpen]);

  // Fetch projects
  const { data: projectsData, isLoading, error } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const projects = Array.isArray(projectsData) ? projectsData : (projectsData?.results || []);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success(t.common.projectDeleted);
      setDeleteDialogOpen(false);
    },
    onError: () => {
      toast.error(t.common.deleteFailed);
    },
  });

  // Create project mutation
  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success(t.common.projectCreated);
      setAiGenerateOpen(false);
      navigate(`/projects/${data.id}/foundation/overview`);
    },
    onError: () => {
      toast.error(t.common.createFailed);
      setWizardStep('review');
    },
  });

  // Step 1: Analyze idea and recommend methodology
  const handleAnalyzeIdea = async () => {
    if (!projectIdea.trim()) {
      toast.error(t.common.describeFirst);
      return;
    }

    setAiLoading(true);
    try {
      const prompt = `You are a project management expert. Analyze this project idea and recommend the best methodology.

Project Idea: "${projectIdea}"

Respond in this EXACT JSON format only, no other text:
{
  "methodology": "agile|scrum|kanban|waterfall|prince2|lean_six_sigma_green|lean_six_sigma_black|hybrid",
  "reasoning": "2-3 sentences explaining why this methodology is the best fit for this specific project",
  "confidence": 85,
  "suggestedName": "A clear, professional project name",
  "suggestedDescription": "A 2-3 sentence project description",
  "suggestedObjectives": "Key objectives and deliverables",
  "suggestedDuration": "3",
  "suggestedBudget": 50000,
  "suggestedTeamSize": "5-8",
  "suggestedPriority": "medium"
}`;

      const response = await callAI(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setAiRecommendation({
          methodology: parsed.methodology || 'agile',
          reasoning: parsed.reasoning || 'This methodology fits your project needs.',
          confidence: parsed.confidence || 80,
        });
        
        // Pre-fill form with AI suggestions
        setFormData(prev => ({
          ...prev,
          name: parsed.suggestedName || '',
          description: parsed.suggestedDescription || projectIdea,
          methodology: parsed.methodology || 'agile',
          objectives: parsed.suggestedObjectives || '',
          duration: parsed.suggestedDuration?.toString().replace(/[^0-9]/g, '') || '3',
          budget: parsed.suggestedBudget?.toString() || '',
          teamSize: parsed.suggestedTeamSize || '',
          priority: parsed.suggestedPriority || 'medium',
        }));
        
        setWizardStep('methodology');
      }
    } catch (error) {
      toast.error(t.common.aiAnalysisFailed);
    } finally {
      setAiLoading(false);
    }
  };

  // Select methodology and go to details
  const handleSelectMethodology = (methodology: string) => {
    setFormData(prev => ({ ...prev, methodology }));
    setWizardStep('details');
  };

  // Go to review
  const handleGoToReview = () => {
    if (!formData.name.trim()) {
      toast.error(t.common.nameRequired);
      return;
    }
    setWizardStep('review');
  };

  // Create the project
  const handleCreateProject = async () => {
    setWizardStep('creating');
    
    // Calculate end date based on duration
    const startDate = new Date(formData.startDate);
    const durationMonths = parseInt(formData.duration) || 3;
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + durationMonths);

    const projectData = {
      name: formData.name,
      description: formData.description,
      methodology: formData.methodology,
      status: 'planning',
      priority: formData.priority,
      budget: parseFloat(formData.budget) || 0,
      start_date: formData.startDate,
      end_date: endDate.toISOString().split('T')[0],
      objectives: formData.objectives,
    };

    createMutation.mutate(projectData);
  };

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter((project: any) => {
      const matchesSearch = project.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || project.status === statusFilter;
      const matchesMethodology = methodologyFilter === "all" || project.methodology === methodologyFilter;
      return matchesSearch && matchesStatus && matchesMethodology;
    });
  }, [projects, searchQuery, statusFilter, methodologyFilter]);

  // Calculate metrics
  const metrics = useMemo(() => ({
    total: projects.length,
    active: projects.filter((p: any) => p.status === 'in_progress' || p.status === 'active').length,
    atRisk: projects.filter((p: any) => p.health_status === 'red' || p.health_status === 'amber').length,
    completed: projects.filter((p: any) => p.status === 'completed').length,
    totalBudget: projects.reduce((acc: number, p: any) => acc + (parseFloat(p.budget) || 0), 0),
  }), [projects]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': 
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'planning': return 'bg-purple-100 text-purple-800';
      case 'on_hold': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthIcon = (health: string) => {
    const color = health === 'red' ? 'text-red-500' : health === 'amber' ? 'text-amber-500' : 'text-green-500';
    return <CheckCircle2 className={cn("h-5 w-5", color)} />;
  };

  const formatCurrency = (amount: number) => formatBudget(amount, getCurrencyFromLanguage(language));

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleDelete = (project: any) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  // Render wizard step indicator
  const renderStepIndicator = () => {
    const steps = [
      { key: 'idea', label: pt('Idea'), icon: Lightbulb },
      { key: 'methodology', label: pt('Method'), icon: Target },
      { key: 'details', label: pt('Details'), icon: FileText },
      { key: 'review', label: pt('Review'), icon: CheckCircle2 },
    ];

    const currentIndex = steps.findIndex(s => s.key === wizardStep);

    return (
      <div className="flex items-center justify-center mb-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.key === wizardStep;
          const isCompleted = index < currentIndex;
          const isCreating = wizardStep === 'creating';

          return (
            <div key={step.key} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
                  isActive && !isCreating ? "border-primary bg-primary text-primary-foreground" :
                  isCompleted || isCreating ? "border-green-500 bg-green-500 text-white" :
                  "border-muted-foreground/30 text-muted-foreground"
                )}>
                  {isCompleted || isCreating ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <span className={cn(
                  "text-xs mt-1",
                  isActive ? "text-primary font-medium" : "text-muted-foreground"
                )}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-16 h-0.5 mx-2 mb-5",
                  index < currentIndex || isCreating ? "bg-green-500" : "bg-muted-foreground/30"
                )} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-500">{pt("Failed to load projects")}</p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["projects"] })}>
          {tc.retry}
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FolderKanban className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">{tp.title}</h1>
            <p className="text-muted-foreground">{tp.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* AI Generate Button */}
          <Dialog open={aiGenerateOpen} onOpenChange={setAiGenerateOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                {tp.generateWithAI}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  {pt("AI Project Assistant")}
                </DialogTitle>
                <DialogDescription>
                  {pt("Let AI help you create the perfect project setup")}
                </DialogDescription>
              </DialogHeader>

              {renderStepIndicator()}

              {/* Step 1: Idea Input */}
              {wizardStep === 'idea' && (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center mx-auto mb-3">
                      <Lightbulb className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold">{pt("Describe Your Project")}</h3>
                    <p className="text-sm text-muted-foreground">
                      {pt("Tell me about your project idea and I'll recommend the best approach")}
                    </p>
                  </div>

                  <Textarea
                    placeholder={pt("Example: We want to develop a training program for soft skills development in our healthcare organization. The focus should be on communication, leadership, and teamwork skills for about 50 employees...")}
                    value={projectIdea}
                    onChange={(e) => setProjectIdea(e.target.value)}
                    rows={5}
                    className="resize-none"
                  />

                  <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    <Lightbulb className="h-4 w-4 mt-0.5 text-amber-500 flex-shrink-0" />
                    <p>{pt("Tip: Include details like team size, timeline, goals, and any specific requirements for better recommendations.")}</p>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleAnalyzeIdea} disabled={aiLoading || !projectIdea.trim()} size="lg">
                      {aiLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {pt("Analyzing...")}
                        </>
                      ) : (
                        <>
                          {pt("Analyze & Recommend")}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Methodology Selection */}
              {wizardStep === 'methodology' && aiRecommendation && (
                <div className="space-y-4">
                  <div className="text-center mb-2">
                    <h3 className="text-lg font-semibold">{pt("Recommended Methodology")}</h3>
                    <p className="text-sm text-muted-foreground">
                      {pt("Based on your project, here's my recommendation")}
                    </p>
                  </div>

                  {/* AI Recommendation Card */}
                  <Card className={cn(
                    "border-2 cursor-pointer hover:shadow-md transition-all",
                    METHODOLOGY_CONFIG[aiRecommendation.methodology]?.borderColor || 'border-blue-200',
                    METHODOLOGY_CONFIG[aiRecommendation.methodology]?.bgColor || 'bg-blue-50'
                  )}
                  onClick={() => handleSelectMethodology(aiRecommendation.methodology)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "p-3 rounded-xl",
                          METHODOLOGY_CONFIG[aiRecommendation.methodology]?.bgColor || 'bg-blue-100'
                        )}>
                          {(() => {
                            const config = METHODOLOGY_CONFIG[aiRecommendation.methodology] || METHODOLOGY_CONFIG.agile;
                            const Icon = config.icon;
                            return <Icon className={cn("h-8 w-8", config.color)} />;
                          })()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-lg">
                              {METHODOLOGY_CONFIG[aiRecommendation.methodology]?.label || 'Agile'}
                            </h4>
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              <Sparkles className="h-3 w-3 mr-1" />
                              {aiRecommendation.confidence}% match
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {METHODOLOGY_CONFIG[aiRecommendation.methodology]?.description}
                          </p>
                          <p className="text-sm">
                            {aiRecommendation.reasoning}
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        {pt("Or choose another")}
                      </span>
                    </div>
                  </div>

                  {/* Other methodologies */}
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(METHODOLOGY_CONFIG)
                      .filter(([key]) => key !== aiRecommendation.methodology)
                      .map(([key, config]) => {
                        const Icon = config.icon;
                        return (
                          <button
                            key={key}
                            onClick={() => handleSelectMethodology(key)}
                            className={cn(
                              "flex items-center gap-2 p-3 rounded-lg border text-left hover:border-primary hover:bg-accent transition-colors",
                              "bg-card"
                            )}
                          >
                            <div className={cn("p-1.5 rounded", config.bgColor)}>
                              <Icon className={cn("h-4 w-4", config.color)} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{config.label}</p>
                              <p className="text-xs text-muted-foreground truncate">{config.description}</p>
                            </div>
                          </button>
                        );
                      })}
                  </div>

                  <div className="flex justify-start pt-2">
                    <Button variant="outline" onClick={() => setWizardStep('idea')}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      {pt("Back")}
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Project Details Form */}
              {wizardStep === 'details' && (
                <div className="space-y-4">
                  <div className="text-center mb-2">
                    <h3 className="text-lg font-semibold">{pt("Project Details")}</h3>
                    <p className="text-sm text-muted-foreground">
                      {pt("Review and adjust the AI-generated details")}
                    </p>
                  </div>

                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">{pt("Project Name")} *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter project name"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="description">{pt("Description")}</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Project description"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="teamSize" className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {pt("Team Size")}
                        </Label>
                        <Input
                          id="teamSize"
                          value={formData.teamSize}
                          onChange={(e) => setFormData(prev => ({ ...prev, teamSize: e.target.value }))}
                          placeholder="e.g., 5-8 people"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="budget" className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          {pt("Budget")} (€)
                        </Label>
                        <Input
                          id="budget"
                          type="number"
                          value={formData.budget}
                          onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                          placeholder="e.g., 50000"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="duration" className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {pt("Duration (months)")}
                        </Label>
                        <Input
                          id="duration"
                          type="number"
                          value={formData.duration}
                          onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                          placeholder="e.g., 3"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="priority">{pt("Priority")}</Label>
                        <Select 
                          value={formData.priority} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">{pt("Low")}</SelectItem>
                            <SelectItem value="medium">{pt("Medium")}</SelectItem>
                            <SelectItem value="high">{pt("High")}</SelectItem>
                            <SelectItem value="critical">{pt("Critical")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="startDate" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {pt("Start Date")}
                      </Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="objectives" className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        {pt("Objectives")}
                      </Label>
                      <Textarea
                        id="objectives"
                        value={formData.objectives}
                        onChange={(e) => setFormData(prev => ({ ...prev, objectives: e.target.value }))}
                        placeholder="Key objectives and deliverables"
                        rows={2}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <Button variant="outline" onClick={() => setWizardStep('methodology')}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      {pt("Back")}
                    </Button>
                    <Button onClick={handleGoToReview}>
                      {pt("Review")}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {wizardStep === 'review' && (
                <div className="space-y-4">
                  <div className="text-center mb-2">
                    <h3 className="text-lg font-semibold">{pt("Review Your Project")}</h3>
                    <p className="text-sm text-muted-foreground">
                      {pt("Everything looks good? Let's create it!")}
                    </p>
                  </div>

                  <Card>
                    <CardContent className="p-4 space-y-4">
                      {/* Project Header */}
                      <div className="flex items-start gap-3">
                        {(() => {
                          const config = METHODOLOGY_CONFIG[formData.methodology] || METHODOLOGY_CONFIG.agile;
                          const Icon = config.icon;
                          return (
                            <div className={cn("p-2 rounded-lg", config.bgColor)}>
                              <Icon className={cn("h-6 w-6", config.color)} />
                            </div>
                          );
                        })()}
                        <div>
                          <h4 className="font-bold text-lg">{formData.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">
                              {METHODOLOGY_CONFIG[formData.methodology]?.label || formData.methodology}
                            </Badge>
                            <Badge className={cn(
                              formData.priority === 'critical' ? 'bg-red-100 text-red-800' :
                              formData.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                              formData.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            )}>
                              {pt(formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1))} {pt("Priority").toLowerCase()}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {formData.description && (
                        <p className="text-sm text-muted-foreground">{formData.description}</p>
                      )}

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                        {formData.teamSize && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{formData.teamSize} {pt("people")}</span>
                          </div>
                        )}
                        {formData.budget && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{formatCurrency(parseInt(formData.budget))}</span>
                          </div>
                        )}
                        {formData.duration && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{formData.duration} {pt("months")}</span>
                          </div>
                        )}
                        {formData.startDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{formatDate(formData.startDate)}</span>
                          </div>
                        )}
                      </div>

                      {formData.objectives && (
                        <div className="pt-2 border-t">
                          <div className="flex items-center gap-2 mb-1">
                            <Target className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{pt("Objectives")}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{formData.objectives}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <div className="flex justify-between pt-2">
                    <Button variant="outline" onClick={() => setWizardStep('details')}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      {pt("Edit Details")}
                    </Button>
                    <Button onClick={handleCreateProject} size="lg" className="gap-2">
                      <Sparkles className="h-4 w-4" />
                      {pt("Create Project")}
                    </Button>
                  </div>
                </div>
              )}

              {/* Creating State */}
              {wizardStep === 'creating' && (
                <div className="py-12 text-center">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{pt("Creating Your Project")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {pt("Setting everything up...")}
                  </p>
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mt-4 text-primary" />
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* New Project Button */}
          <Button onClick={() => navigate('/projects/new')} className="gap-2">
            <Plus className="h-4 w-4" />
            {tp.newProject}
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{tp.totalProjects}</p>
                <p className="text-2xl font-bold">{metrics.total}</p>
              </div>
              <Layers className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{tp.active}</p>
                <p className="text-2xl font-bold text-green-600">{metrics.active}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{tp.atRisk}</p>
                <p className="text-2xl font-bold text-red-600">{metrics.atRisk}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{tp.completed}</p>
                <p className="text-2xl font-bold">{metrics.completed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{tp.totalBudget}</p>
                <p className="text-2xl font-bold">€ {formatCurrency(metrics.totalBudget)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={tp.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder={tp.allStatus} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tp.allStatus}</SelectItem>
            <SelectItem value="planning">{tp.planning}</SelectItem>
            <SelectItem value="pending">{tp.pending}</SelectItem>
            <SelectItem value="in_progress">{tp.inProgress}</SelectItem>
            <SelectItem value="on_hold">{tp.onHold}</SelectItem>
            <SelectItem value="completed">{tp.completed}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={methodologyFilter} onValueChange={setMethodologyFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder={tp.allMethods} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tp.allMethods}</SelectItem>
            <SelectItem value="agile">Agile</SelectItem>
            <SelectItem value="scrum">Scrum</SelectItem>
            <SelectItem value="kanban">Kanban</SelectItem>
            <SelectItem value="waterfall">Waterfall</SelectItem>
            <SelectItem value="prince2">PRINCE2</SelectItem>
            <SelectItem value="lean_six_sigma_green">Six Sigma Green</SelectItem>
            <SelectItem value="lean_six_sigma_black">Six Sigma Black</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center border rounded-lg">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="rounded-r-none"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="rounded-l-none"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className={cn(
        viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
          : "space-y-3"
      )}>
        {filteredProjects.map((project: any) => {
          const methodologyConfig = METHODOLOGY_CONFIG[project.methodology] || METHODOLOGY_CONFIG.agile;
          const Icon = methodologyConfig.icon;
          
          return (
            <Card 
              key={project.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/projects/${project.id}/foundation/overview`)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn("p-1.5 rounded", methodologyConfig.bgColor)}>
                      <Icon className={cn("h-4 w-4", methodologyConfig.color)} />
                    </div>
                    <Badge variant="outline" className="text-xs font-medium">
                      {methodologyConfig.label}
                    </Badge>
                    <Badge className={cn("text-xs", getStatusColor(project.status))}>
                      {project.status?.replace('_', ' ') || 'pending'}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/projects/${project.id}/foundation/overview`);
                      }}>
                        <Eye className="h-4 w-4 mr-2" />
                        {tp.view}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/projects/${project.id}/foundation/overview?edit=true`);
                      }}>
                        <Edit className="h-4 w-4 mr-2" />
                        {tp.edit}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(project);
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {tp.delete}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <h3 className="font-semibold text-lg mb-1">{project.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
                  {project.description || project.name}
                </p>

                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">{ta.progress}</span>
                  <span>{project.progress || 0}%</span>
                </div>
                <Progress value={project.progress || 0} className="h-2 mb-4" />

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-xl font-bold">{project.task_count || 0}</p>
                    <p className="text-xs text-muted-foreground">{tp.tasks}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold">{formatCurrency(parseFloat(project.budget) || 0)}</p>
                    <p className="text-xs text-muted-foreground">{tp.budget}</p>
                  </div>
                  <div className="text-center">
                    {getHealthIcon(project.health_status)}
                    <p className="text-xs text-muted-foreground">{tp.health}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {project.owner_name || tp.unassigned}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(project.end_date)}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {/* Create New Project Card */}
        <Card className="border-dashed hover:border-primary/50 transition-colors">
          <CardContent className="p-6 flex flex-col items-center justify-center min-h-[280px]">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">{tp.createNewProject}</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              {tp.createDescription}
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setAiGenerateOpen(true)}
              >
                <Sparkles className="h-4 w-4 mr-1" />
                {pt("AI Assistant")}
              </Button>
              <Button 
                size="sm"
                onClick={() => navigate('/projects/new')}
              >
                <Plus className="h-4 w-4 mr-1" />
                {tp.manual}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && projects.length > 0 && (
        <div className="text-center py-12">
          <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{tp.noProjects}</h3>
          <p className="text-muted-foreground mb-4">
            {pt("Try adjusting your search or filters")}
          </p>
          <Button variant="outline" onClick={() => {
            setSearchQuery("");
            setStatusFilter("all");
            setMethodologyFilter("all");
          }}>
            {tp.clearFilters}
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pt("Delete Project")}</AlertDialogTitle>
            <AlertDialogDescription>
              {pt("Are you sure?")} "{projectToDelete?.name}" - {pt("This action cannot be undone")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tc.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => projectToDelete && deleteMutation.mutate(projectToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {tp.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProjectsOverview;